import { env } from './env';

/**
 * Celo network registry (§13).
 *
 * Celo is the settlement layer. Nothing in the app hard-codes a chain id, RPC URL or explorer
 * base — they resolve through this registry so the active network is a single config switch
 * (`CELO_NETWORK`) and RPC endpoints can be swapped or given failover without touching feature
 * code. The concrete viem client that consumes this lands in the `celo` module at Stage 6.
 */
export type CeloNetwork = 'mainnet' | 'sepolia';

export interface NetworkConfig {
  readonly network: CeloNetwork;
  /** EVM chain id. Mainnet 42220; Celo Sepolia testnet 11142220. */
  readonly chainId: number;
  readonly name: string;
  readonly nativeSymbol: 'CELO';
  /** Ordered RPC endpoints; the first that is healthy is used (failover added at Stage 6). */
  readonly rpcUrls: readonly string[];
  readonly explorerBase: string;
  readonly isTestnet: boolean;
}

// Public best-effort defaults from Celo docs. Production should point CELO_RPC_URL /
// CELO_SEPOLIA_RPC_URL at an RPC provider with an SLA (§13); these are the fallback.
const MAINNET_RPC_FALLBACK = 'https://forno.celo.org';
const SEPOLIA_RPC_FALLBACK = 'https://forno.celo-sepolia.celo-testnet.org';

export const NETWORKS: Record<CeloNetwork, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    chainId: 42220,
    name: 'Celo',
    nativeSymbol: 'CELO',
    rpcUrls: [env.CELO_RPC_URL, MAINNET_RPC_FALLBACK].filter(Boolean) as string[],
    explorerBase: 'https://celoscan.io',
    isTestnet: false,
  },
  sepolia: {
    network: 'sepolia',
    chainId: 11142220,
    name: 'Celo Sepolia',
    nativeSymbol: 'CELO',
    rpcUrls: [env.CELO_SEPOLIA_RPC_URL, SEPOLIA_RPC_FALLBACK].filter(Boolean) as string[],
    explorerBase: 'https://celo-sepolia.blockscout.com',
    isTestnet: true,
  },
};

/** The network the app is currently configured to settle on. */
export const activeNetwork: NetworkConfig = NETWORKS[env.CELO_NETWORK];

/** Explorer link for a transaction hash, from config rather than hard-coded in components (§104). */
export function txExplorerUrl(hash: string, network: NetworkConfig = activeNetwork): string {
  return `${network.explorerBase}/tx/${hash}`;
}

/** Explorer link for an address. */
export function addressExplorerUrl(address: string, network: NetworkConfig = activeNetwork): string {
  return `${network.explorerBase}/address/${address}`;
}
