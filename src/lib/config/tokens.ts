import { env } from './env';
import type { CeloNetwork } from './networks';

/**
 * Token registry (§15).
 *
 * Token contract addresses are never hard-coded across the app; they live here, keyed by
 * network. USDC is the initial production asset. Its address is read from `CELO_USDC_ADDRESS`
 * rather than committed as a constant, because §15 requires verifying token addresses against
 * an official source before production — an unverified address baked into source is exactly
 * the mistake that rule prevents. A registry entry with no configured address is reported as
 * disabled instead of silently pointing at the wrong contract.
 */
export interface SupportedToken {
  readonly symbol: string;
  readonly name: string;
  readonly network: CeloNetwork;
  readonly address: string | null;
  readonly decimals: number;
  readonly enabled: boolean;
  /** Whether this token may be used as a Celo gas fee currency (§14). */
  readonly feeCurrencySupported: boolean;
}

function usdc(network: CeloNetwork): SupportedToken {
  const address = env.CELO_USDC_ADDRESS ?? null;
  return {
    symbol: 'USDC',
    name: 'USD Coin',
    network,
    address,
    decimals: 6,
    // Enabled only once a (verified) address is configured — never assumed.
    enabled: address !== null,
    feeCurrencySupported: true,
  };
}

export const TOKENS: Record<CeloNetwork, SupportedToken[]> = {
  mainnet: [usdc('mainnet')],
  sepolia: [usdc('sepolia')],
};

export function getToken(symbol: string, network: CeloNetwork): SupportedToken | undefined {
  return TOKENS[network].find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
}

export function enabledTokens(network: CeloNetwork): SupportedToken[] {
  return TOKENS[network].filter((t) => t.enabled);
}
