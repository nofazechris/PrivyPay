import 'server-only';
import { createPublicClient, http, fallback, type PublicClient } from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import { activeNetwork, type NetworkConfig } from '@/lib/config';

/**
 * Celo read client (§13).
 *
 * A viem public client for the active network, built from the RPC registry with automatic
 * failover across the configured endpoints. Server-only — RPC access and any future signing
 * stay off the client. Read-only here; the transaction/signing side lands in Stage 8.
 */

const VIEM_CHAIN = { mainnet: celo, sepolia: celoSepolia } as const;

let cached: PublicClient | null = null;
let cachedFor: string | null = null;

export function celoClient(network: NetworkConfig = activeNetwork): PublicClient {
  if (cached && cachedFor === network.network) return cached;
  const transports = network.rpcUrls.map((url) => http(url));
  cached = createPublicClient({
    chain: VIEM_CHAIN[network.network],
    transport: transports.length > 1 ? fallback(transports) : transports[0],
  }) as PublicClient;
  cachedFor = network.network;
  return cached;
}
