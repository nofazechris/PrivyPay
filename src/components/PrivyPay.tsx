'use client';

import { useMemo } from 'react';
import { useViewModel } from '@/lib/viewModel';
import { useHeroBackground } from '@/lib/heroBackground';
import { shortAddress } from '@/lib/format';
import { addressQr } from '@/lib/qr';
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
  /** On-chain USDC balance as a decimal string (e.g. "0.00"); replaces the demo balance. */
  balance?: string;
}

/** Format a decimal balance string to 2 places for display, e.g. "0" → "0.00". */
function formatBalance(v: string): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v;
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

  // Real scannable QR of the wallet address (§72), computed only when the address changes —
  // not on every render, since QR generation isn't free.
  const address = appIdentity?.walletAddress;
  const qr = useMemo(
    () => (address ? { large: addressQr(address, 6), small: addressQr(address, 4) } : null),
    [address],
  );

  // In the app: keep the logo inside the dashboard, and replace the demo identity (username,
  // wallet address, balance, QR) with the signed-in user's real values when available.
  const appVals = useMemo(() => {
    const merged = { ...v, goLanding: v.goHome };
    if (appIdentity?.username) {
      merged.handleInput = appIdentity.username;
      merged.handleDisplay = '@' + appIdentity.username;
    }
    if (address) {
      merged.walletAddress = shortAddress(address);
      const flash = v.copyAddress; // preserves the "Address copied" feedback
      merged.copyAddress = () => {
        navigator.clipboard?.writeText(address).catch(() => {});
        flash();
      };
      if (qr) {
        merged.qrLarge = qr.large;
        merged.qrSmall = qr.small;
      }
      const flashShare = v.shareReceive;
      merged.shareReceive = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title: 'My PrivyPay address', text: address }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(address).catch(() => {});
        }
        flashShare();
      };
    }
    if (appIdentity?.balance !== undefined) {
      merged.balanceStr = formatBalance(appIdentity.balance);
      // Drop the demo month-over-month delta until real activity stats exist (Stage 13).
      merged.balanceChange = '';
    }
    return merged;
  }, [v, appIdentity, address, qr]);

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9' }}>
      {v.isLanding ? <LandingScreen v={landingVals} refs={heroRefs} /> : null}
      {v.isAuth ? <AuthScreen v={v} /> : null}
      {v.isOnboarding ? <OnboardingScreen v={v} /> : null}
      {v.isApp ? <AppScreen v={appVals} /> : null}
    </div>
  );
}
