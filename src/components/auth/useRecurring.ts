'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export interface RecurringItem {
  id: string;
  counterparty: string;
  amount: string;
  cadence: string;
  next: string;
  paused: boolean;
  status: string;
}

export interface MutateResult {
  ok: boolean;
  error?: string;
}

/**
 * The signed-in user's recurring payments (the schedule). `create` sets one up; `setPaused`
 * pauses/resumes; `cancel` removes it. Actual automated execution is a later worker — this hook
 * manages the schedule only.
 */
export function useRecurring(): {
  items: RecurringItem[];
  loading: boolean;
  refresh: () => void;
  create: (args: { payee: string; amount: string; cadence?: string; memo?: string }) => Promise<MutateResult>;
  setPaused: (id: string, paused: boolean) => Promise<MutateResult>;
  cancel: (id: string) => Promise<MutateResult>;
} {
  const { ready, authenticated, getAccessToken } = useAuth();
  const [items, setItems] = useState<RecurringItem[]>([]);
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
        const res = await fetch('/api/recurring', {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { recurring: RecurringItem[] };
          setItems(data.recurring ?? []);
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
    async (args: { payee: string; amount: string; cadence?: string; memo?: string }): Promise<MutateResult> => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/recurring', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(args),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data.message ?? 'Could not create recurring payment.' };
        refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not create recurring payment.' };
      }
    },
    [getAccessToken, refresh],
  );

  const mutate = useCallback(
    async (id: string, method: 'PATCH' | 'DELETE', body?: object): Promise<MutateResult> => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/recurring/${id}`, {
          method,
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) return { ok: false, error: 'Could not update recurring payment.' };
        refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not update recurring payment.' };
      }
    },
    [getAccessToken, refresh],
  );

  const setPaused = useCallback((id: string, paused: boolean) => mutate(id, 'PATCH', { paused }), [mutate]);
  const cancel = useCallback((id: string) => mutate(id, 'DELETE'), [mutate]);

  return { items, loading, refresh, create, setPaused, cancel };
}
