'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/useProfile';
import { ToastProvider, Spinner } from '@/components/ui';
import { color } from '@/lib/design/tokens';
import { PexaOnboarding } from '@/components/pexa/PexaOnboarding';

/**
 * Username onboarding route (Pexa). Signed-in users without a username pick one here, which claims
 * it via /api/username and provisions the real Celo wallet; users who already have one skip
 * straight to the app, and signed-out visitors are sent home.
 */
export default function OnboardingEntry() {
  const { ready, authenticated } = useAuth();
  const { loading, profile, unavailable } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace('/');
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (!loading && profile) router.replace('/app');
  }, [loading, profile, router]);

  if (!ready || !authenticated || loading || profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: color.background }}>
        <Spinner size={22} />
      </div>
    );
  }

  // `unavailable` (no database) still lets the user reach the form; the claim surfaces a clear
  // error if the backend can't persist it.
  void unavailable;

  return (
    <ToastProvider>
      <PexaOnboarding />
    </ToastProvider>
  );
}
