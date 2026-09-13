'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/useProfile';
import { ToastProvider, useToast, Spinner } from '@/components/ui';
import { color } from '@/lib/design/tokens';
import { useViewModel } from '@/lib/viewModel';
import OnboardingScreen from '@/components/screens/OnboardingScreen';

/**
 * Username onboarding (§9). Reuses the design's onboarding screen, wiring its "create" action
 * to the real /api/username endpoint. On success the user goes straight to the app — the
 * wallet-provisioning steps of the design come alive in Stage 5, so we don't show a fake
 * wallet here. Users who already have a username skip this entirely.
 */
function OnboardingForm() {
  const v = useViewModel('landing');
  const router = useRouter();
  const toast = useToast();
  const { getAccessToken } = useAuth();
  const submitting = useRef(false);

  const claimUsername = useCallback(async () => {
    if (submitting.current) return;
    const username = v.handleInput;
    if (!username || username.length < 3) return;
    submitting.current = true;
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ username }),
      });
      if (res.status === 201) {
        router.replace('/app');
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      toast.show(data.message ?? 'Couldn’t claim that username. Try another.', { tone: 'danger', duration: 4000 });
    } catch {
      toast.show('Something went wrong. Please try again.', { tone: 'danger' });
    } finally {
      submitting.current = false;
    }
  }, [v.handleInput, getAccessToken, router, toast]);

  const onboardingVals = useMemo(
    () => ({
      ...v,
      // The username-step "Continue" claims the username for real; the design's subsequent
      // wallet animation is bypassed (Stage 5).
      createWallet: claimUsername,
      onHandleKey: (e: { key: string }) => {
        if (e.key === 'Enter') claimUsername();
      },
      finishOnboarding: () => router.replace('/app'),
    }),
    [v, claimUsername, router],
  );

  return <OnboardingScreen v={onboardingVals} />;
}

export default function OnboardingEntry() {
  const { ready, authenticated } = useAuth();
  const { loading, profile, unavailable } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace('/');
  }, [ready, authenticated, router]);

  // Already has a username → straight to the app.
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

  // `unavailable` (no database) still lets the user reach the form; the claim will surface a
  // clear error if the backend can't persist it.
  void unavailable;

  return (
    <ToastProvider>
      <OnboardingForm />
    </ToastProvider>
  );
}
