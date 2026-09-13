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
export default function PrivyPay({
  startView = 'landing',
  onGetStarted,
}: {
  startView?: 'landing' | 'app';
  onGetStarted?: () => void;
}) {
  const v = useViewModel(startView);
  // The animated backdrop lives here rather than in the view model: it hands out DOM refs,
  // which are not view data.
  const heroRefs = useHeroBackground(v.isLanding, v.heroStage);

  // Override the demo's enterApp with the real sign-in trigger when one is provided.
  const landingVals = useMemo(() => (onGetStarted ? { ...v, enterApp: onGetStarted } : v), [v, onGetStarted]);

  // In the app, the sidebar logo must stay within the dashboard (go to its home), not jump to
  // the marketing landing — the app is a distinct surface from the landing page.
  const appVals = useMemo(() => ({ ...v, goLanding: v.goHome }), [v]);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9' }}>
      {v.isLanding ? <LandingScreen v={landingVals} refs={heroRefs} /> : null}
      {v.isAuth ? <AuthScreen v={v} /> : null}
      {v.isOnboarding ? <OnboardingScreen v={v} /> : null}
      {v.isApp ? <AppScreen v={appVals} /> : null}
    </div>
  );
}
