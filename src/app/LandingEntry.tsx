'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PexaLanding } from '@/components/pexa/PexaLanding';

/**
 * Public marketing landing (Pexa). The single CTA sends already-signed-in visitors straight to the
 * app and everyone else to sign-in; when Privy isn't configured, /login shows a clear notice.
 */
export default function LandingEntry() {
  const { authenticated } = useAuth();
  const router = useRouter();
  const onEnter = useCallback(() => router.push(authenticated ? '/app' : '/login'), [authenticated, router]);
  return <PexaLanding onEnter={onEnter} />;
}
