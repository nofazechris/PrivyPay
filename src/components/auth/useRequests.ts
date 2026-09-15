'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export interface RequestItem {
  id: string;
  direction: 'incoming' | 'outgoing';
  counterparty: string;
  amount: string;
  memo: string | null;
  status: string;
  payable: boolean;
  createdAt: string;
}

export interface MutateResult {
  ok: boolean;
  error?: string;
}

/**
 * The signed-in user's payment requests (both directions). `create` asks a PrivyPay user to pay
 * you; `markPaid` records that a received request has been settled by a payment. The actual
 * on-chain payment is done by the payment engine (see AppGate), which calls `markPaid` after.
 */
export function useRequests(): {
  items: RequestItem[];
  loading: boolean;
  refresh: () => void;
  create: (args: { payer: string; amount: string; memo?: string }) => Promise<MutateResult>;
  markPaid: (id: string, paymentId?: string | null) => Promise<MutateResult>;
} {
  const { ready, authenticated, getAccessToken } = useAuth();
  const [items, setItems] = useState<RequestItem[]>([]);
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
        const res = await fetch('/api/requests', {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { requests: RequestItem[] };
          setItems(data.requests ?? []);
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

  const create = useCallback(
    async (args: { payer: string; amount: string; memo?: string }): Promise<MutateResult> => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(args),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data.message ?? 'Could not create request.' };
        refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not create request.' };
      }
    },
    [getAccessToken, refresh],
  );

  const markPaid = useCallback(
    async (id: string, paymentId?: string | null): Promise<MutateResult> => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/requests/${id}/pay`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ paymentId: paymentId ?? null }),
        });
        if (!res.ok) return { ok: false, error: 'Could not update request.' };
        refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not update request.' };
      }
    },
    [getAccessToken, refresh],
  );

  return { items, loading, refresh, create, markPaid };
}
