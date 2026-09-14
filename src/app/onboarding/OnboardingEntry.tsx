'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/useProfile';
import { useWallet } from '@/components/auth/useWallet';
import { ToastProvider, useToast, Spinner } from '@/components/ui';
import { color } from '@/lib/design/tokens';
import { useViewModel } from '@/lib/viewModel';
import { shortAddress } from '@/lib/format';
import OnboardingScreen from '@/components/screens/OnboardingScreen';

/**
 * Username onboarding (§9) with the design's real wallet-provisioning flow (§5). Picking a
 * username claims it via /api/username, then the design's "Creating your account → Preparing
 * your wallet → …" animation plays and the "ready" screen shows the user's real Celo address
 * (provisioned by Privy). "Start using PrivyPay" enters the app. Users who already have a
 * username skip all of this.
 */
function OnboardingForm() {
  const v = useViewModel('landing');
  const router = useRouter();
  const toast = useToast();
  const { getAccessToken } = useAuth();
  const { address } = useWallet();
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
        // Play the design's provisioning animation → the "wallet is ready" screen, which shows
        // the real address. `v.createWallet` is the original startSetup (this override lives on
        // onboardingVals, not on `v`), so this advances the design steps.
        v.createWallet();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      toast.show(data.message ?? 'Couldn’t claim that username. Try another.', { tone: 'danger', duration: 4000 });
    } catch {
      toast.show('Something went wrong. Please try again.', { tone: 'danger' });
    } finally {
      submitting.current = false;
    }
  }, [v, getAccessToken, toast]);

  const onboardingVals = useMemo(
    () => ({
      ...v,
      createWallet: claimUsername,
      onHandleKey: (e: { key: string }) => {
        if (e.key === 'Enter') claimUsername();
      },
      // Show the real provisioned address (truncated) on the "wallet is ready" screen.
      walletAddress: address ? shortAddress(address) : v.walletAddress,
      finishOnboarding: () => router.replace('/app'),
    }),
    [v, claimUsername, address, router],
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
