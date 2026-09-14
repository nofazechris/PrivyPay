'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PrivyPay from '@/components/PrivyPay';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/useProfile';
import { useWallet } from '@/components/auth/useWallet';
import { useBalance } from '@/components/auth/useBalance';
import { usePayment } from '@/components/auth/usePayment';
import { useActivity } from '@/components/auth/useActivity';
import { Spinner, Button, Text } from '@/components/ui';
import { color } from '@/lib/design/tokens';

/**
 * Protected application route (§134 Stage 3–4).
 *
 * Unauthenticated visitors go to the marketing landing; signed-in users without a username go
 * to onboarding; the dashboard renders only for a signed-in user who has a profile. Server-side
 * data endpoints are additionally protected by `getSessionUser`. When the database isn't
 * configured (`unavailable`), the app still renders so local work isn't blocked — onboarding
 * simply can't gate.
 * (Data shown here is still the in-memory demo until Stages 6–13 wire real balances.)
 */
export default function AppGate() {
  const { configured, ready, authenticated, logout } = useAuth();
  const { loading: profileLoading, profile, wallet, unavailable } = useProfile();
  const { address: walletAddress } = useWallet();
  const { balance, refresh: refreshBalance } = useBalance(walletAddress ?? wallet?.address ?? null);
  const { pay } = usePayment();
  const { items: activity, refresh: refreshActivity } = useActivity();
  const router = useRouter();

  // Real payment executor the agent card and send sheet drive through the engine.
  const hooks = useMemo(
    () => ({
      executeSend: async (args: { recipient: string; amount: string; memo?: string }) => {
        const res = await pay(args);
        if (res.status === 'confirmed' || res.status === 'pending') {
          refreshBalance();
          refreshActivity();
          return { ok: true as const };
        }
        return { ok: false as const, error: res.error ?? 'Payment failed.' };
      },
    }),
    [pay, refreshBalance, refreshActivity],
  );

  useEffect(() => {
    if (ready && (!configured || !authenticated)) {
      router.replace('/');
    }
  }, [ready, configured, authenticated, router]);

  // Signed-in but no username yet → onboarding (unless the DB is unavailable, where we can't
  // tell and fall through to the app).
  useEffect(() => {
    if (ready && authenticated && !profileLoading && !profile && !unavailable) {
      router.replace('/onboarding');
    }
  }, [ready, authenticated, profileLoading, profile, unavailable, router]);

  const gating = !ready || !configured || !authenticated || profileLoading || (!profile && !unavailable);
  if (gating) {
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
      <PrivyPay
        startView="app"
        appIdentity={{
          username: profile?.username,
          walletAddress: walletAddress ?? wallet?.address,
          balance: balance ?? undefined,
          activity,
        }}
        hooks={hooks}
      />
      {/* Minimal session control for Stage 3; folds into the real account menu at Stage 10. */}
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 50 }}>
        <Button size="sm" variant="secondary" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
