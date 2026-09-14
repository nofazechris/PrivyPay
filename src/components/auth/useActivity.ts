'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export interface ActivityItem {
  id: string;
  direction: 'out' | 'in';
  counterparty: string;
  amount: string;
  token: string;
  status: string;
  txHash: string | null;
  explorerUrl: string | null;
  createdAt: string;
}

/**
 * The signed-in user's real payment history for the activity view, replacing the demo
 * transactions. Refreshes on demand (e.g. after a payment settles).
 */
export function useActivity(): { items: ActivityItem[]; loading: boolean; refresh: () => void } {
  const { ready, authenticated, getAccessToken } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!ready || !authenticated) return;
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/payments', {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { payments: ActivityItem[] };
          setItems(data.payments ?? []);
        }
      } catch {
        // Keep the last list; a transient error shouldn't blank it.
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [ready, authenticated, getAccessToken, tick]);

  return { items, loading, refresh };
}
