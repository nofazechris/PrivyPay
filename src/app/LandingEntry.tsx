'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PrivyPay from '@/components/PrivyPay';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Public marketing landing (§57). When Privy is configured, the primary CTA runs real
 * email/passkey sign-in and lands the user in the authenticated app; when it isn't, the
 * imported demo flow runs unchanged.
 */
export default function LandingEntry() {
  const { configured, ready, authenticated, login } = useAuth();
  const router = useRouter();
  // Only navigate to /app as the result of an explicit sign-in, not on every visit by an
  // already-authenticated user.
  const awaitingLogin = useRef(false);

  useEffect(() => {
    if (awaitingLogin.current && ready && authenticated) {
      awaitingLogin.current = false;
      router.push('/app');
    }
  }, [ready, authenticated, router]);

  const handleGetStarted = useCallback(() => {
    if (authenticated) {
      router.push('/app');
      return;
    }
    awaitingLogin.current = true;
    login();
  }, [authenticated, login, router]);

  return <PrivyPay onGetStarted={configured ? handleGetStarted : undefined} />;
}
