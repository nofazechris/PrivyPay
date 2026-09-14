import 'server-only';
import { encodeFunctionData, erc20Abi, getAddress, parseUnits, type Address } from 'viem';
import { activeNetwork, getToken, usdcFeeCurrency } from '@/lib/config';

/**
 * Transaction preparation (§16) with Celo fee abstraction (§14).
 *
 * Builds the unsigned fields for a USDC transfer, including a `feeCurrency` so gas is paid in
 * USDC rather than requiring a separate CELO balance — the experience PrivyPay wants (a user
 * holds USDC, sends USDC). This is the prepare step only; signing and broadcasting are done by
 * the wallet provider in Stage 8, behind the policy + authorization layers.
 */

export interface PreparedUsdcTransfer {
  /** The USDC contract (the `to` of the on-chain call). */
  to: Address;
  /** Encoded `transfer(recipient, amount)` calldata. */
  data: `0x${string}`;
  /** ERC-20 fee currency for gas (USDC), enabling fee abstraction. */
  feeCurrency: Address;
  value: bigint;
  chainId: number;
  /** Amount in USDC's smallest unit. */
  amount: bigint;
}

/** Prepare a USDC transfer of `amountUsdc` (decimal string, e.g. "20") to `recipient`. */
export function buildUsdcTransfer(recipient: string, amountUsdc: string): PreparedUsdcTransfer {
  const token = getToken('USDC', activeNetwork.network);
  if (!token || !token.address) {
    throw new Error('USDC is not configured for the active network.');
  }
  const usdc = getAddress(token.address);
  const to = getAddress(recipient) as Address;
  const amount = parseUnits(amountUsdc, token.decimals);
  const data = encodeFunctionData({ abi: erc20Abi, functionName: 'transfer', args: [to, amount] });
  // Gas is paid in USDC via the fee-currency adapter — never the token address (§14).
  const feeCurrency = getAddress(usdcFeeCurrency(activeNetwork.network));

  return { to: usdc, data, feeCurrency, value: BigInt(0), chainId: activeNetwork.chainId, amount };
}
