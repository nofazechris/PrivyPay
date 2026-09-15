'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export interface McpTokenSummary {
  id: string;
  tokenPrefix: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

/**
 * The signed-in user's MCP tokens (for connecting ChatGPT/Claude). `mint` returns the full
 * plaintext token once — the caller must show/copy it immediately; it can never be retrieved
 * again. `enabled` reflects whether the operator has turned MCP on for this deployment.
 */
export function useMcpTokens(): {
  tokens: McpTokenSummary[];
  enabled: boolean;
  loading: boolean;
  refresh: () => void;
  mint: (label?: string) => Promise<{ ok: boolean; token?: string; error?: string }>;
  revoke: (id: string) => Promise<{ ok: boolean }>;
} {
  const { ready, authenticated, getAccessToken } = useAuth();
  const [tokens, setTokens] = useState<McpTokenSummary[]>([]);
  const [enabled, setEnabled] = useState(false);
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
        const res = await fetch('/api/mcp/token', {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!active) return;
        if (res.ok) {
          const data = (await res.json()) as { enabled: boolean; tokens: McpTokenSummary[] };
          setTokens(data.tokens ?? []);
          setEnabled(!!data.enabled);
        }
      } catch {
        // keep last state
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [ready, authenticated, getAccessToken, tick]);

  const mint = useCallback(
    async (label?: string) => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/mcp/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ label }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data.message ?? 'Could not create token.' };
        refresh();
        return { ok: true, token: data.token?.token as string };
      } catch {
        return { ok: false, error: 'Could not create token.' };
      }
    },
    [getAccessToken, refresh],
  );

  const revoke = useCallback(
    async (id: string) => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/mcp/token?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });
        refresh();
        return { ok: res.ok };
      } catch {
        return { ok: false };
      }
    },
    [getAccessToken, refresh],
  );

  return { tokens, enabled, loading, refresh, mint, revoke };
}
