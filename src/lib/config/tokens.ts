import { env } from './env';
import type { CeloNetwork } from './networks';

/**
 * Token registry (§15).
 *
 * Token contract addresses live here, keyed by network — never hard-coded across the app. USDC
 * is the initial production asset. The addresses below are Circle's official USDC contracts,
 * verified against Circle's docs (developers.circle.com/stablecoins/usdc-contract-addresses)
 * as §15 requires; `CELO_USDC_ADDRESS` can override the active-network value if needed. A
 * registry entry with no address is reported disabled rather than pointing at the wrong
 * contract.
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

// Circle-issued USDC, verified from Circle's official contract-address list.
const USDC_ADDRESS: Record<CeloNetwork, string> = {
  mainnet: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  sepolia: '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
};

function usdc(network: CeloNetwork): SupportedToken {
  // Env override applies to the active network only; otherwise use the verified constant.
  const override = network === env.CELO_NETWORK ? (env.CELO_USDC_ADDRESS ?? null) : null;
  const address = override ?? USDC_ADDRESS[network];
  return {
    symbol: 'USDC',
    name: 'USD Coin',
    network,
    address,
    decimals: 6,
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
