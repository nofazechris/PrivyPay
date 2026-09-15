'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export interface Contact {
  username: string;
  displayName: string | null;
}

export interface AddContactResult {
  ok: boolean;
  error?: string;
}

/**
 * The signed-in user's contacts — the people they've explicitly added and pay by username.
 * Backs the contacts page and the send/agent suggestions. `add` resolves the username on the
 * server (it must be a real PrivyPay user) and refreshes the list on success.
 */
export function useContacts(): {
  items: Contact[];
  loading: boolean;
  refresh: () => void;
  add: (username: string) => Promise<AddContactResult>;
} {
  const { ready, authenticated, getAccessToken } = useAuth();
  const [items, setItems] = useState<Contact[]>([]);
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
        const res = await fetch('/api/contacts', {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { contacts: Contact[] };
          setItems(data.contacts ?? []);
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

  const add = useCallback(
    async (username: string): Promise<AddContactResult> => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ username }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data.message ?? 'Could not add contact.' };
        refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not add contact.' };
      }
    },
    [getAccessToken, refresh],
  );

  return { items, loading, refresh, add };
}
