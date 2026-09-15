'use client';

import { useMemo } from 'react';
import { useViewModel, type ViewModelHooks, type Contact, type AppRequest, type AppRecurring } from '@/lib/viewModel';
import { useHeroBackground } from '@/lib/heroBackground';
import { shortAddress, statusColor } from '@/lib/format';
import { addressQr } from '@/lib/qr';
import type { ActivityItem } from '@/components/auth/useActivity';
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
  /** The user's real payment history; replaces the demo transactions. */
  activity?: ActivityItem[];
  /** The user's saved contacts; replaces the demo contact fixtures. */
  contacts?: { username: string; displayName: string | null }[];
  /** The user's real payment requests (both directions); replaces the demo request fixtures. */
  requests?: AppRequest[];
  /** The user's real recurring payments; replaces the demo fixtures. */
  recurring?: AppRecurring[];
}

/** Format a decimal balance string to 2 places for display, e.g. "0" → "0.00". */
function formatBalance(v: string): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v;
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Completed',
  PENDING: 'Pending',
  BROADCASTING: 'Pending',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

function relativeWhen(iso: string): { when: string; group: string } {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  if (sameDay) return { when: `Today · ${time}`, group: 'Today' };
  if (yesterday) return { when: `Yesterday · ${time}`, group: 'Yesterday' };
  return { when: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` · ${time}`, group: 'Earlier' };
}

/** Map a real payment to the design's transaction-row shape. */
function activityToRow(item: ActivityItem) {
  const out = item.direction === 'out';
  const { when, group } = relativeWhen(item.createdAt);
  const handle = item.counterparty;
  const open = () => {
    if (item.explorerUrl && typeof window !== 'undefined') window.open(item.explorerUrl, '_blank', 'noopener');
  };
  return {
    id: item.id,
    dir: item.direction,
    handle,
    name: handle,
    initial: (handle.replace(/^@/, '')[0] ?? '?').toUpperCase(),
    amount: Number(item.amount),
    when,
    group,
    kind: 'Payment',
    status: STATUS_LABEL[item.status] ?? item.status,
    statusColor: statusColor(STATUS_LABEL[item.status] ?? item.status),
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    hash: item.txHash ? shortAddress(item.txHash) : '',
    sub: when,
    amountStr: (out ? '-$' : '+$') + formatBalance(item.amount),
    amountColor: out ? '#0E1420' : '#167A54',
    avatarBg: out ? '#F1F2F5' : '#E8F3ED',
    avatarColor: out ? '#5B6472' : '#167A54',
    onClick: open,
    onKey: (e: { key: string; preventDefault: () => void }) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    },
  };
}

/**
 * Real contacts = the people the user has explicitly saved. Replaces the demo contact fixtures
 * so suggestions and the contacts list reflect real, added people — never invented names.
 * Returns an empty list (not the demo list) when the user hasn't added anyone yet.
 */
function toContactTuples(contacts?: { username: string; displayName: string | null }[]): Contact[] {
  return (contacts ?? []).map((c) => {
    const handle = '@' + c.username;
    const name = c.displayName ?? handle;
    return [handle, name, (c.username[0] ?? '?').toUpperCase(), ''] as Contact;
  });
}

export default function PrivyPay({
  startView = 'landing',
  onGetStarted,
  appIdentity,
  hooks,
}: {
  startView?: 'landing' | 'app';
  onGetStarted?: () => void;
  appIdentity?: AppIdentity;
  hooks?: ViewModelHooks;
}) {
  // Real contacts in the app; `undefined` on the marketing landing keeps the demo reel intact.
  const appContacts = useMemo(
    () => (appIdentity ? toContactTuples(appIdentity.contacts) : undefined),
    [appIdentity],
  );
  const appRequests = useMemo(() => (appIdentity ? appIdentity.requests ?? [] : undefined), [appIdentity]);
  const appRecurring = useMemo(() => (appIdentity ? appIdentity.recurring ?? [] : undefined), [appIdentity]);
  const v = useViewModel(startView, hooks, appContacts, appRequests, appRecurring);
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

    // Real app: strip every demo fixture. Real payment history replaces the demo transactions;
    // contacts + send/agent suggestions are derived from that history in the view model (via
    // `appContacts`); requests/recurring have no real data yet (Stages 11–12), so they show as
    // empty rather than fake. No fake numbers are shown anywhere in the signed-in app.
    if (appIdentity) {
      // Real rows carry string ids and a plain-object key event; the view model's row type is
      // inferred from the demo fixtures, so cast at this merge boundary.
      const rows = (appIdentity.activity ?? []).map(activityToRow) as unknown as typeof v.recentTxs;
      merged.recentTxs = rows.slice(0, 4);
      merged.filteredTxs = rows;
      merged.noTxs = rows.length === 0;
      merged.activityGroups = ['Today', 'Yesterday', 'Earlier']
        .map((label) => ({ label: label.toUpperCase(), rows: rows.filter((r) => r.group === label) }))
        .filter((g) => g.rows.length);

      const sent = rows.filter((r) => r.dir === 'out').reduce((sum, r) => sum + r.amount, 0);
      const received = rows.filter((r) => r.dir === 'in').reduce((sum, r) => sum + r.amount, 0);
      merged.sentMonth = formatBalance(String(sent));
      merged.receivedMonth = formatBalance(String(received));

      // Agent "what's my balance?" answer: use the real balance + real sent/received, not the
      // demo figures. Only the balance answer is overridden (detected by its label), so the
      // activity/help answers are untouched.
      if (merged.cmdAnswerLabel === 'Total balance') {
        merged.cmdAnswerValue = '$' + formatBalance(appIdentity.balance ?? '0') + ' USDC';
        merged.cmdAnswerRows = [
          { handle: 'Celo', sub: 'Settlement network', amount: 'Wallet ready', color: '#167A54' },
          { handle: 'This month', sub: 'Sent · received', amount: `-$${merged.sentMonth} · +$${merged.receivedMonth}`, color: '#5B6472' },
        ];
      }
      // Agent "show recent payments" answer: use real history, not demo transactions.
      if (merged.cmdAnswerLabel === 'Recent payments') {
        merged.cmdAnswerValue = rows.length ? `Last ${Math.min(3, rows.length)} payment${Math.min(3, rows.length) === 1 ? '' : 's'}` : 'No payments yet';
        merged.cmdAnswerRows = rows.slice(0, 3).map((r) => ({ handle: r.handle, sub: r.sub, amount: r.amountStr, color: r.amountColor }));
      }

      // contactRows / sendSuggestions / requestRows / recurringRows come from the view model's
      // real lists now; keep them.
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
