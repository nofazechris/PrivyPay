'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PexaApp } from '@/components/pexa/PexaApp';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/useProfile';
import { useWallet } from '@/components/auth/useWallet';
import { useBalance } from '@/components/auth/useBalance';
import { usePayment } from '@/components/auth/usePayment';
import { useActivity } from '@/components/auth/useActivity';
import { useContacts } from '@/components/auth/useContacts';
import { useRequests } from '@/components/auth/useRequests';
import { useRecurring } from '@/components/auth/useRecurring';
import { Spinner, Text } from '@/components/ui';
import { color } from '@/lib/design/tokens';

/**
 * Protected application route (§134 Stage 3–4).
 *
 * Unauthenticated visitors go to the marketing landing; signed-in users without a username go
 * to onboarding; the dashboard renders only for a signed-in user who has a profile. Server-side
 * data endpoints are additionally protected by `getSessionUser`. When the database isn't
 * configured (`unavailable`), the app still renders so local work isn't blocked — onboarding
 * simply can't gate.
 * (Data shown here is still the in-memory demo until Stages 6–13 wire real balances.)
 */
export default function AppGate() {
  const { configured, ready, authenticated, logout, getAccessToken } = useAuth();
  const { loading: profileLoading, profile, wallet, unavailable } = useProfile();
  const { address: walletAddress } = useWallet();
  const { balance, refresh: refreshBalance } = useBalance(walletAddress ?? wallet?.address ?? null);
  const { pay } = usePayment();
  const { items: activity, refresh: refreshActivity } = useActivity();
  const { add: addContact } = useContacts();
  const { items: requests, create: createRequest, markPaid: markRequestPaid } = useRequests();
  const { items: recurring, create: createRecurring, setPaused: setRecurringPaused, cancel: cancelRecurring } = useRecurring();
  const router = useRouter();

  // Real payment executor + contact/request management the agent card and screens drive.
  const hooks = useMemo(
    () => ({
      executeSend: async (args: { recipient: string; amount: string; memo?: string }) => {
        const res = await pay(args);
        if (res.status === 'confirmed' || res.status === 'pending') {
          refreshBalance();
          refreshActivity();
          // Pass the real outcome through so the agent card shows a truthful receipt.
          return { ok: true as const, status: res.status, txHash: res.txHash, explorerUrl: res.explorerUrl };
        }
        return { ok: false as const, error: res.error ?? 'Payment failed.' };
      },
      addContact: (username: string) => addContact(username),
      createRequest: (args: { payer: string; amount: string; memo?: string }) => createRequest(args),
      // Pay a received request: a real payment to the requester, then mark the request settled.
      payRequest: async (args: { requestId: string; recipient: string; amount: string }) => {
        const res = await pay({ recipient: args.recipient, amount: args.amount });
        if (res.status === 'confirmed' || res.status === 'pending') {
          await markRequestPaid(args.requestId, res.paymentId ?? null);
          refreshBalance();
          refreshActivity();
          return { ok: true as const };
        }
        return { ok: false as const, error: res.error ?? 'Payment failed.' };
      },
      createRecurring: (args: { payee: string; amount: string; cadence?: string; memo?: string }) => createRecurring(args),
      setRecurringPaused: (id: string, paused: boolean) => setRecurringPaused(id, paused),
      cancelRecurring: (id: string) => cancelRecurring(id),
      // Real AI: the server LLM turns the message into a validated intent; we map it to the
      // agent card's command shape. Returns null on failure so the card degrades gracefully.
      parseCommand: async (message: string) => {
        try {
          const token = await getAccessToken();
          const res = await fetch('/api/agent/command', {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ message }),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as {
            intent?: { type?: string; parameters?: Record<string, unknown> };
            recipient?: { handle?: string } | null;
          };
          const it = data.intent;
          if (!it?.type) return null;
          const p = it.parameters ?? {};
          const amountStr = typeof p.amount === 'string' ? p.amount : undefined;
          const amount = amountStr ? parseFloat(amountStr) : undefined;
          const rawRecipient = typeof p.recipient === 'string' ? p.recipient : undefined;
          const handle = rawRecipient
            ? rawRecipient.startsWith('@')
              ? rawRecipient
              : '@' + rawRecipient
            : (data.recipient?.handle ?? undefined);
          const recurring = typeof p.recurring === 'string' ? p.recurring : undefined;
          const memo = typeof p.memo === 'string' ? p.memo : undefined;
          switch (it.type) {
            case 'SEND_PAYMENT':
              return recurring ? { kind: 'recurring' as const, amount, handle, cadence: recurring } : { kind: 'send' as const, amount, handle };
            case 'REQUEST_PAYMENT':
              return { kind: 'request' as const, amount, handle, note: memo };
            case 'GET_BALANCE':
              return { kind: 'balance' as const };
            case 'GET_TRANSACTIONS':
              return { kind: 'activity' as const };
            default:
              return { kind: 'unknown' as const };
          }
        } catch {
          return null;
        }
      },
    }),
    [pay, refreshBalance, refreshActivity, addContact, createRequest, markRequestPaid, createRecurring, setRecurringPaused, cancelRecurring, getAccessToken],
  );

  useEffect(() => {
    if (ready && (!configured || !authenticated)) {
      router.replace('/');
    }
  }, [ready, configured, authenticated, router]);

  // Signed-in but no username yet → onboarding (unless the DB is unavailable, where we can't
  // tell and fall through to the app).
  useEffect(() => {
    if (ready && authenticated && !profileLoading && !profile && !unavailable) {
      router.replace('/onboarding');
    }
  }, [ready, authenticated, profileLoading, profile, unavailable, router]);

  const gating = !ready || !configured || !authenticated || profileLoading || (!profile && !unavailable);
  if (gating) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: color.background }}>
        <div style={{ display: 'grid', gap: '12px', justifyItems: 'center' }}>
          <Spinner size={22} />
          <Text variant="caption" tone="muted">
            {ready && !authenticated ? 'Redirecting…' : 'Loading your account…'}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <PexaApp
      username={profile?.username}
      address={walletAddress ?? wallet?.address}
      balance={balance ?? '0'}
      activity={activity}
      requests={requests}
      recurring={recurring}
      onSignOut={() => logout()}
      parseCommand={hooks.parseCommand}
      executeSend={hooks.executeSend}
      createRequest={hooks.createRequest}
      createRecurring={hooks.createRecurring}
      payRequest={hooks.payRequest}
      setRecurringPaused={hooks.setRecurringPaused}
      cancelRecurring={hooks.cancelRecurring}
    />
  );
}
