'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

/**
 * The signed-in user's on-chain USDC balance for their wallet, as a display string (e.g.
 * "0.00"). Real value from Celo — a new wallet reads 0, which is correct. Refreshes on mount
 * and exposes `refresh()` for after a payment settles.
 */
export function useBalance(address: string | null): { balance: string | null; loading: boolean; refresh: () => void } {
  const { getAccessToken } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const seen = useRef<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let active = true;
    const run = async () => {
      // Only show the spinner the first time for a given address, not on background refreshes.
      if (seen.current !== address) setLoading(true);
      seen.current = address;
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/balance?address=${address}`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { balance: { formatted: string } | null };
          setBalance(data.balance ? data.balance.formatted : null);
        }
      } catch {
        // Leave the last known value; a transient RPC blip shouldn't blank the balance.
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [address, getAccessToken, tick]);

  return { balance, loading, refresh };
}
