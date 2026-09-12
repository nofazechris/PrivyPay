'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivyPay from '@/components/PrivyPay';
import { useAuth } from '@/components/auth/AuthProvider';
import { Spinner, Button, Text } from '@/components/ui';
import { color } from '@/lib/design/tokens';

/**
 * Protected application route (§134 Stage 3).
 *
 * Unauthenticated visitors are sent back to the marketing landing; the authenticated
 * dashboard renders only once Privy confirms a session. Server-side data endpoints are
 * additionally protected by `getSessionUser` — this gate keeps the UI itself behind sign-in.
 * (Data shown here is still the in-memory demo until Stages 6–13 wire real balances.)
 */
export default function AppGate() {
  const { configured, ready, authenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Once Privy is ready, bounce anyone who isn't signed in (or if auth isn't configured).
    if (ready && (!configured || !authenticated)) {
      router.replace('/');
    }
  }, [ready, configured, authenticated, router]);

  if (!ready || !configured || !authenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: color.background }}>
        <div style={{ display: 'grid', gap: '12px', justifyItems: 'center' }}>
          <Spinner size={22} />
          <Text variant="caption" tone="muted">
            {ready && !authenticated ? 'Redirecting…' : 'Loading your account…'}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PrivyPay startView="app" />
      {/* Minimal session control for Stage 3; folds into the real account menu at Stage 10. */}
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 50 }}>
        <Button size="sm" variant="secondary" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
