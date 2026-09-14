'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

/**
 * The signed-in user's Celo wallet address, sourced from Privy on the client (immediate and
 * reliable — no server round-trip lag). Provisions one if the user somehow has none yet, and
 * persists the address to our database once, so server-side payment flows can reference it.
 */
export function useWallet(): { address: string | null; loading: boolean } {
  const { ready, authenticated, walletAddress, ensureWallet, getAccessToken } = useAuth();
  const [address, setAddress] = useState<string | null>(walletAddress);
  const persisted = useRef<string | null>(null);

  // Resolve the address: use what Privy already has, else create a wallet.
  useEffect(() => {
    if (!ready || !authenticated) return;
    let active = true;
    const run = async () => {
      const addr = walletAddress ?? (await ensureWallet());
      if (active) setAddress(addr);
    };
    void run();
    return () => {
      active = false;
    };
  }, [ready, authenticated, walletAddress, ensureWallet]);

  // Persist to the DB once per distinct address.
  useEffect(() => {
    if (!address || persisted.current === address) return;
    persisted.current = address;
    const run = async () => {
      try {
        const token = await getAccessToken();
        await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ address }),
        });
      } catch {
        // Non-fatal: display already works from the client; the next load will retry.
      }
    };
    void run();
  }, [address, getAccessToken]);

  return { address, loading: authenticated && !address };
}
