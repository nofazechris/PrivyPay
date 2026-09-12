import { describe, it, expect } from 'vitest';
import { NETWORKS, activeNetwork, txExplorerUrl } from './networks';
import { TOKENS, getToken } from './tokens';
import { features } from './features';

describe('network registry', () => {
  it('uses the documented Celo chain ids', () => {
    expect(NETWORKS.mainnet.chainId).toBe(42220);
    expect(NETWORKS.sepolia.chainId).toBe(11142220);
  });

  it('defaults to the testnet at Stage 0', () => {
    expect(activeNetwork.network).toBe('sepolia');
    expect(activeNetwork.isTestnet).toBe(true);
  });

  it('always has at least one RPC endpoint per network', () => {
    expect(NETWORKS.mainnet.rpcUrls.length).toBeGreaterThan(0);
    expect(NETWORKS.sepolia.rpcUrls.length).toBeGreaterThan(0);
  });

  it('builds explorer links from config', () => {
    expect(txExplorerUrl('0xabc', NETWORKS.mainnet)).toBe('https://celoscan.io/tx/0xabc');
  });
});

describe('token registry', () => {
  it('registers USDC with 6 decimals on both networks', () => {
    for (const net of ['mainnet', 'sepolia'] as const) {
      const usdc = getToken('USDC', net);
      expect(usdc?.decimals).toBe(6);
      expect(usdc?.feeCurrencySupported).toBe(true);
    }
  });

  it('leaves USDC disabled until an address is configured (no unverified address assumed)', () => {
    // No CELO_USDC_ADDRESS in the test env → must not be enabled.
    expect(TOKENS.sepolia[0].enabled).toBe(false);
    expect(TOKENS.sepolia[0].address).toBeNull();
  });
});

describe('feature flags', () => {
  it('ship every later-stage integration dark by default', () => {
    expect(features.chatgpt).toBe(false);
    expect(features.codex).toBe(false);
    expect(features.recurring).toBe(false);
    expect(features.x402).toBe(false);
  });
});
