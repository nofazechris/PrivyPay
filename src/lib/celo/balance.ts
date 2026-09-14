import 'server-only';
import { erc20Abi, formatUnits, getAddress, type Address } from 'viem';
import { activeNetwork, getToken } from '@/lib/config';
import { celoClient } from './client';

/**
 * On-chain balance reads (§13). Real values from Celo — never faked (§5, PRD build rules). A
 * freshly provisioned wallet genuinely reads 0, which is correct, not a placeholder.
 */

export interface TokenBalance {
  symbol: string;
  /** Smallest-unit amount as a decimal string. */
  raw: string;
  decimals: number;
  /** Human-readable amount, e.g. "0.00". */
  formatted: string;
}

/** Read a wallet's USDC balance on the active network. Returns null if USDC isn't configured. */
export async function getUsdcBalance(walletAddress: string): Promise<TokenBalance | null> {
  const token = getToken('USDC', activeNetwork.network);
  if (!token || !token.address) return null;

  const client = celoClient();
  const raw = (await client.readContract({
    address: getAddress(token.address),
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [getAddress(walletAddress) as Address],
  })) as bigint;

  return {
    symbol: 'USDC',
    raw: raw.toString(),
    decimals: token.decimals,
    formatted: formatUnits(raw, token.decimals),
  };
}

/** Read the native CELO balance (used for gas visibility). */
export async function getNativeBalance(walletAddress: string): Promise<TokenBalance> {
  const client = celoClient();
  const raw = await client.getBalance({ address: getAddress(walletAddress) as Address });
  return { symbol: activeNetwork.nativeSymbol, raw: raw.toString(), decimals: 18, formatted: formatUnits(raw, 18) };
}
