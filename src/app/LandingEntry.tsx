'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PrivyPay from '@/components/PrivyPay';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Public marketing landing (§57). When Privy is configured, the primary CTA navigates to the
 * dedicated /login page (already-signed-in users go straight to the app); when it isn't, the
 * imported demo flow runs unchanged.
 */
export default function LandingEntry() {
  const { configured, authenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    router.push(authenticated ? '/app' : '/login');
  }, [authenticated, router]);

  return <PrivyPay onGetStarted={configured ? handleGetStarted : undefined} />;
}
