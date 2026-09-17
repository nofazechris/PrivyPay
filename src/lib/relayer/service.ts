import 'server-only';
import { randomBytes } from 'node:crypto';
import { createWalletClient, http, parseSignature, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celo, celoSepolia } from 'viem/chains';
import { activeNetwork, env, getToken } from '@/lib/config';
import { celoClient } from '@/lib/celo/client';

/**
 * Gasless relayer (EIP-3009 `transferWithAuthorization`).
 *
 * The user signs typed data authorising a USDC transfer (Privy signs `eth_signTypedData_v4`
 * headlessly). A funded server wallet — the relayer, a plain key that never touches the client or
 * the AI — submits that authorization on-chain and pays the gas. So the user holds USDC, sends
 * USDC, and never needs CELO. The authorization is single-use on-chain (its random nonce), and it
 * still passes PrivyPay's policy + single-use authorization before we relay (see the route).
 *
 * The EIP-712 domain is read from the token contract at runtime (name/version) so it is always
 * correct per network — verified to reproduce the on-chain DOMAIN_SEPARATOR.
 */

const VIEM_CHAIN = { mainnet: celo, sepolia: celoSepolia } as const;

const ERC20_META_ABI = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'version', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const;

const TRANSFER_WITH_AUTHORIZATION_ABI = [
  {
    name: 'transferWithAuthorization',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const;

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];
const TRANSFER_WITH_AUTHORIZATION_TYPE = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'validAfter', type: 'uint256' },
  { name: 'validBefore', type: 'uint256' },
  { name: 'nonce', type: 'bytes32' },
];

function usdcAddress(): Hex {
  const token = getToken('USDC', activeNetwork.network);
  if (!token?.address) throw new Error('USDC is not configured for the active network.');
  return token.address as Hex;
}

// Domain cache — name/version don't change; read once per process per network.
let domainCache: { key: string; name: string; version: string } | null = null;

async function readDomainMeta(): Promise<{ name: string; version: string }> {
  const address = usdcAddress();
  const key = `${activeNetwork.network}:${address}`;
  if (domainCache?.key === key) return domainCache;
  const client = celoClient();
  const [name, version] = await Promise.all([
    client.readContract({ address, abi: ERC20_META_ABI, functionName: 'name' }) as Promise<string>,
    client.readContract({ address, abi: ERC20_META_ABI, functionName: 'version' }) as Promise<string>,
  ]);
  domainCache = { key, name, version };
  return { name, version };
}

/** The typed-data payload a client signs to authorise a gasless USDC transfer. */
export interface TransferAuthorizationMessage {
  from: string;
  to: string;
  value: string; // smallest unit, decimal string
  validAfter: string;
  validBefore: string;
  nonce: Hex; // 32-byte hex
}

export interface TransferAuthorizationTypedData {
  domain: { name: string; version: string; chainId: number; verifyingContract: string };
  types: Record<string, { name: string; type: string }[]>;
  primaryType: 'TransferWithAuthorization';
  message: TransferAuthorizationMessage;
}

/** Build the EIP-3009 typed data for a transfer of `valueRaw` (smallest unit) from → to. */
export async function buildTransferAuthorization(input: { from: string; to: string; valueRaw: string }): Promise<TransferAuthorizationTypedData> {
  const { name, version } = await readDomainMeta();
  const now = Math.floor(Date.now() / 1000);
  const message: TransferAuthorizationMessage = {
    from: input.from,
    to: input.to,
    value: input.valueRaw,
    validAfter: '0',
    validBefore: String(now + 15 * 60), // 15-minute window
    nonce: ('0x' + randomBytes(32).toString('hex')) as Hex,
  };
  return {
    domain: { name, version, chainId: activeNetwork.chainId, verifyingContract: usdcAddress() },
    types: { EIP712Domain: EIP712_DOMAIN_TYPE, TransferWithAuthorization: TRANSFER_WITH_AUTHORIZATION_TYPE },
    primaryType: 'TransferWithAuthorization',
    message,
  };
}

/**
 * Submit a signed transfer authorization on-chain from the relayer wallet (which pays gas).
 * Returns the transaction hash. Throws if the relayer isn't configured or the tx reverts (e.g.
 * the authorization was already used, or the relayer is out of CELO).
 */
export async function relayTransfer(input: { message: TransferAuthorizationMessage; signature: Hex }): Promise<{ hash: string }> {
  const key = env.RELAYER_PRIVATE_KEY;
  if (!key) throw new Error('Gasless relayer is not configured.');
  const account = privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hex);
  const wallet = createWalletClient({ account, chain: VIEM_CHAIN[activeNetwork.network], transport: http(activeNetwork.rpcUrls[0]) });

  const sig = parseSignature(input.signature);
  const v = sig.v !== undefined ? Number(sig.v) : 27 + Number(sig.yParity ?? 0);
  const m = input.message;

  const hash = await wallet.writeContract({
    address: usdcAddress(),
    abi: TRANSFER_WITH_AUTHORIZATION_ABI,
    functionName: 'transferWithAuthorization',
    args: [m.from as Hex, m.to as Hex, BigInt(m.value), BigInt(m.validAfter), BigInt(m.validBefore), m.nonce, v, sig.r, sig.s],
  });
  return { hash };
}
