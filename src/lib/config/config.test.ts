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

  it('uses Circle’s verified USDC addresses and enables USDC', () => {
    expect(TOKENS.mainnet[0].address).toBe('0xcebA9300f2b948710d2653dD7B07f33A8B32118C');
    expect(TOKENS.sepolia[0].address).toBe('0x01C5C0122039549AD1493B8220cABEdD739BC44E');
    expect(TOKENS.sepolia[0].enabled).toBe(true);
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
