'use client';

import { useViewModel } from '@/lib/viewModel';
import { useHeroBackground } from '@/lib/heroBackground';
import LandingScreen from './screens/LandingScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AppScreen from './screens/AppScreen';

/**
 * Root of the PrivyPay prototype. Mirrors the outer wrapper of "PrivyPay v3.dc.html",
 * where a single view flag picks one of four screens.
 */
export default function PrivyPay({ startView = 'landing' }: { startView?: 'landing' | 'app' }) {
  const v = useViewModel(startView);
  // The animated backdrop lives here rather than in the view model: it hands out DOM refs,
  // which are not view data.
  const heroRefs = useHeroBackground(v.isLanding, v.heroStage);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9' }}>
      {v.isLanding ? <LandingScreen v={v} refs={heroRefs} /> : null}
      {v.isAuth ? <AuthScreen v={v} /> : null}
      {v.isOnboarding ? <OnboardingScreen v={v} /> : null}
      {v.isApp ? <AppScreen v={v} /> : null}
    </div>
  );
}
