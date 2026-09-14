'use client';

import { useMemo } from 'react';
import { useViewModel } from '@/lib/viewModel';
import { useHeroBackground } from '@/lib/heroBackground';
import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AppScreen from './screens/AppScreen';

/**
 * Root of the PrivyPay screen switcher, mirroring the outer wrapper of "PrivyPay v3.dc.html"
 * where one view flag picks a screen.
 *
 * `onGetStarted` lets the real auth layer take over the landing's primary CTA: when Privy is
 * configured, clicking "Get started" opens the real sign-in flow instead of the demo's
 * in-page fake auth screen. When it's omitted (auth not configured), the original demo flow
 * runs unchanged, so nothing regresses before credentials are set.
 */
/** Real identity injected into the app view, replacing the demo fixtures. */
export interface AppIdentity {
  username?: string;
  /** Full Celo wallet address; truncated for display, copied in full. */
  walletAddress?: string;
}

/** `0x1234abcd…ef0` → `0x12…ef0`, matching the design's address style. */
function truncateAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 4)}…${a.slice(-3)}` : a;
}

export default function PrivyPay({
  startView = 'landing',
  onGetStarted,
  appIdentity,
}: {
  startView?: 'landing' | 'app';
  onGetStarted?: () => void;
  appIdentity?: AppIdentity;
}) {
  const v = useViewModel(startView);
  // The animated backdrop lives here rather than in the view model: it hands out DOM refs,
  // which are not view data.
  const heroRefs = useHeroBackground(v.isLanding, v.heroStage);

  // Override the demo's enterApp with the real sign-in trigger when one is provided.
  const landingVals = useMemo(() => (onGetStarted ? { ...v, enterApp: onGetStarted } : v), [v, onGetStarted]);

  // In the app: keep the logo inside the dashboard, and replace the demo identity (username,
  // wallet address) with the signed-in user's real values when available.
  const appVals = useMemo(() => {
    const merged = { ...v, goLanding: v.goHome };
    if (appIdentity?.username) {
      merged.handleInput = appIdentity.username;
      merged.handleDisplay = '@' + appIdentity.username;
    }
    if (appIdentity?.walletAddress) {
      const full = appIdentity.walletAddress;
      merged.walletAddress = truncateAddress(full);
      const flash = v.copyAddress; // preserves the "Address copied" feedback
      merged.copyAddress = () => {
        navigator.clipboard?.writeText(full).catch(() => {});
        flash();
      };
    }
    return merged;
  }, [v, appIdentity]);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9' }}>
      {v.isLanding ? <LandingScreen v={landingVals} refs={heroRefs} /> : null}
      {v.isAuth ? <AuthScreen v={v} /> : null}
      {v.isOnboarding ? <OnboardingScreen v={v} /> : null}
      {v.isApp ? <AppScreen v={appVals} /> : null}
    </div>
  );
}
