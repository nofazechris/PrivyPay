'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ToastProvider, Spinner, Text, Button } from '@/components/ui';
import { color } from '@/lib/design/tokens';
import { PexaAuth } from '@/components/pexa/PexaAuth';

/**
 * Sign-in route. Sends already-authenticated visitors to the app, and — when auth isn't
 * configured (no Privy key) — shows a plain notice instead of crashing the headless hooks.
 */
export default function LoginEntry() {
  const { configured, ready, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.replace('/app');
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: color.background }}>
        <Spinner size={22} />
      </div>
    );
  }

  if (!configured) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: color.background, padding: 24 }}>
        <div style={{ display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center', maxWidth: 360 }}>
          <Text variant="card" as="h1">
            Sign-in isn’t configured
          </Text>
          <Text variant="caption" tone="muted">
            Set NEXT_PUBLIC_PRIVY_APP_ID (and the server secret) to enable authentication.
          </Text>
          <Button variant="secondary" size="sm" onClick={() => router.push('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <PexaAuth />
    </ToastProvider>
  );
}
