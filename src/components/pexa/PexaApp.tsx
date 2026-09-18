'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PrivyPayLogo } from '@/components/brand/PrivyPayLogo';
import { ChatIcon, WalletIcon, ActivityIcon, PaymentsIcon, SettingsNavIcon, type Icon } from '@/components/ui/icons';
import { color } from '@/lib/design/tokens';
import { statusColor } from '@/lib/format';
import { ServiceConnect } from '@/components/app/ServiceConnect';
import { AgentPayments } from '@/components/app/AgentPayments';
import type { ActivityItem } from '@/components/auth/useActivity';
import { useAgentChat, type AgentChatDeps, type AgentIntentShape, type ChatMessage } from '@/components/auth/useAgentChat';

/**
 * Pexa app shell — chat-first, agent-native. A slim sidebar (Chat / Wallet / Activity / Payments /
 * Settings) on desktop, a bottom bar on mobile, and the agent Chat as the primary surface. The
 * Chat drives the real payment loop; Wallet/Activity show real data; Payments/Settings are the
 * next slices. Rebuilt from design/Pexa.dc.html.
 */

type Page = 'chat' | 'wallet' | 'activity' | 'payments' | 'settings';
const NAV: Array<{ key: Page; label: string; icon: Icon }> = [
  { key: 'chat', label: 'Chat', icon: ChatIcon },
  { key: 'wallet', label: 'Wallet', icon: WalletIcon },
  { key: 'activity', label: 'Activity', icon: ActivityIcon },
  { key: 'payments', label: 'Payments', icon: PaymentsIcon },
  { key: 'settings', label: 'Settings', icon: SettingsNavIcon },
];
const PAGE_TITLE: Record<Page, string> = { chat: 'Chat', wallet: 'Wallet', activity: 'Activity', payments: 'Payments', settings: 'Settings' };

function money(n: number): string {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface PexaAppProps {
  username?: string;
  address?: string;
  /** Decimal USDC balance string, e.g. "20.00". */
  balance: string;
  activity: ActivityItem[];
  onSignOut: () => void;
  /** Real agent + payment hooks (from AppGate). */
  parseCommand: AgentChatDeps['parseCommand'];
  executeSend: AgentChatDeps['executeSend'];
  createRequest?: AgentChatDeps['createRequest'];
  createRecurring?: AgentChatDeps['createRecurring'];
}

export function PexaApp(props: PexaAppProps) {
  const { username, address, balance, activity } = props;
  const handleDisplay = username ? '@' + username : 'Account';
  const initial = (username?.[0] ?? '?').toUpperCase();
  const balanceNum = Number(balance) || 0;

  const [page, setPage] = useState<Page>('chat');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 820);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const deps = useMemo<AgentChatDeps>(
    () => ({
      parseCommand: props.parseCommand,
      executeSend: props.executeSend,
      createRequest: props.createRequest,
      createRecurring: props.createRecurring,
      balance: balanceNum,
    }),
    [props.parseCommand, props.executeSend, props.createRequest, props.createRecurring, balanceNum],
  );
  const chat = useAgentChat(deps);

  // Agent status pill in the header.
  const pill = ((): { label: string; color: string; bg: string; border: string; dot: string; anim: string } => {
    switch (chat.agentState) {
      case 'thinking':
      case 'resolving':
        return { label: 'Thinking…', color: '#153AB4', bg: '#F4F6FE', border: '#DDE3F6', dot: '#1B45D7', anim: 'pp-pulse 1.2s ease-in-out infinite' };
      case 'processing':
        return { label: 'Sending…', color: '#153AB4', bg: '#F4F6FE', border: '#DDE3F6', dot: '#1B45D7', anim: 'pp-pulse 1.2s ease-in-out infinite' };
      case 'success':
        return { label: 'Done', color: '#167A54', bg: '#E8F3ED', border: '#CDE7DA', dot: '#167A54', anim: 'none' };
      case 'error':
        return { label: 'Needs attention', color: '#8A6A1E', bg: '#FBF6EA', border: '#F0E4C8', dot: '#D8A93A', anim: 'none' };
      default:
        return { label: 'Agent active', color: '#167A54', bg: '#E8F3ED', border: '#CDE7DA', dot: '#167A54', anim: 'none' };
    }
  })();

  return (
    <div style={{ display: 'flex', height: '100dvh', minHeight: '100dvh', maxHeight: '100dvh', background: color.background, overflow: 'hidden' }}>
      {!isMobile ? (
        <aside style={{ width: '214px', flex: 'none', borderRight: `1px solid #E8EAEF`, background: color.surfaceMuted, display: 'flex', flexDirection: 'column', padding: '16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '4px 8px 18px' }}>
            <PrivyPayLogo size={22} />
            <span style={{ fontSize: '15.5px', fontWeight: 600, letterSpacing: '-.025em' }}>Pexa</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {NAV.map((n) => {
              const active = page === n.key;
              const Ico = n.icon;
              return (
                <button
                  key={n.key}
                  onClick={() => setPage(n.key)}
                  aria-label={n.label}
                  aria-current={active ? 'page' : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: active ? color.primarySoft : 'transparent', borderRadius: '10px', padding: '10px 11px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <Ico size={20} color={active ? color.primary : '#5B6472'} weight={active ? 'bold' : 'regular'} />
                  <span style={{ fontSize: '14px', fontWeight: active ? 600 : 450, color: active ? '#153AB4' : '#5B6472' }}>{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1px solid #E8EAEF`, padding: '14px 10px 4px', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.primarySoft, color: color.primary, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{handleDisplay}</div>
              <button onClick={props.onSignOut} style={{ border: 'none', background: 'transparent', padding: 0, marginTop: '2px', fontSize: '11.5px', color: color.muted, cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>
        </aside>
      ) : null}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ flex: 'none', borderBottom: `1px solid #E8EAEF`, background: 'rgba(246,247,249,.92)', backdropFilter: 'blur(10px)', padding: '11px clamp(14px,2.6vw,26px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PrivyPayLogo size={21} />
              <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-.025em' }}>Pexa</span>
            </div>
          ) : (
            <div style={{ fontSize: '15.5px', fontWeight: 600, letterSpacing: '-.022em' }}>{PAGE_TITLE[page]}</div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${pill.border}`, background: pill.bg, borderRadius: '999px', padding: '5px 11px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: pill.dot, display: 'inline-block', animation: pill.anim }} />
              <span style={{ fontSize: '11.5px', fontWeight: 500, color: pill.color, whiteSpace: 'nowrap' }}>{pill.label}</span>
            </div>
            {!isMobile ? <span style={{ fontSize: '13.5px', fontWeight: 500, color: color.muted }}>{handleDisplay}</span> : null}
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {page === 'chat' ? <ChatScreen chat={chat} activity={activity} /> : null}
            {page === 'wallet' ? <WalletPage balance={balance} username={username} address={address} onSend={() => setPage('chat')} /> : null}
            {page === 'activity' ? <ActivityPage activity={activity} /> : null}
            {page === 'payments' ? <Placeholder title="Payments" body="Requests and recurring payments live here — coming in the next slice. For now, ask the agent in Chat." /> : null}
            {page === 'settings' ? <SettingsPage username={username} address={address} onSignOut={props.onSignOut} /> : null}
          </div>
        </div>

        {isMobile ? (
          <nav style={{ flex: 'none', borderTop: `1px solid #E8EAEF`, background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(10px)', display: 'flex', padding: '8px 6px 10px' }}>
            {NAV.map((n) => {
              const active = page === n.key;
              const Ico = n.icon;
              return (
                <button key={n.key} onClick={() => setPage(n.key)} aria-label={n.label} style={{ flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '6px 2px', minHeight: 48, cursor: 'pointer' }}>
                  <Ico size={20} color={active ? color.primary : '#5F6878'} weight={active ? 'bold' : 'regular'} />
                  <span style={{ fontSize: '11px', color: active ? '#153AB4' : '#5F6878', fontWeight: active ? 600 : 450 }}>{n.label}</span>
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Chat screen */

function ChatScreen({ chat, activity }: { chat: ReturnType<typeof useAgentChat>; activity: ActivityItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages.length, chat.agentState]);

  const suggestions = ['Send $10 to @chris', "What's my balance?", 'Show recent payments', 'Request $20 from @chris'];
  const empty = chat.messages.length === 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(16px,2.6vw,30px) clamp(14px,2.6vw,26px)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {empty ? (
            <div style={{ padding: 'clamp(18px,5vh,60px) 0 6px', animation: 'pp-up .5s cubic-bezier(.2,.8,.3,1) both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PrivyPayLogo size={26} />
                <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.14em', color: color.faint }}>PEXA AGENT</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px,4.4vw,38px)', letterSpacing: '-.04em', fontWeight: 600, margin: '18px 0 0' }}>How can I help?</h1>
              <p style={{ fontSize: '16px', color: color.muted, lineHeight: 1.6, margin: '12px 0 0', maxWidth: '430px' }}>Send money, request payments, schedule recurring payments, or ask about your wallet.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '26px', maxWidth: '430px' }}>
                {suggestions.map((sg) => (
                  <button key={sg} onClick={() => chat.send(sg)} style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '11px', padding: '12px 14px', fontSize: '14.5px', color: color.ink, cursor: 'pointer', textAlign: 'left' }}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {chat.messages.map((m) => (
            <ChatRow key={m.id} m={m} activity={activity} onConfirm={() => chat.confirm(m.id)} onCancel={() => chat.cancel(m.id)} onFix={(t) => chat.send(t)} />
          ))}

          {chat.agentState === 'thinking' || chat.agentState === 'resolving' || chat.agentState === 'processing' ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', animation: 'pp-fade .2s ease both' }}>
              <AgentAvatar />
              <div style={{ display: 'flex', gap: '4px', border: `1px solid ${color.borderFaint}`, background: color.surface, borderRadius: '14px 14px 14px 4px', padding: '11px 13px' }}>
                <Dot delay="0s" /><Dot delay=".16s" /><Dot delay=".32s" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ flex: 'none', borderTop: `1px solid #E8EAEF`, background: 'rgba(246,247,249,.94)', backdropFilter: 'blur(8px)', padding: '12px clamp(14px,2.6vw,26px) 14px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <input
              value={chat.draft}
              onChange={(e) => chat.setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  chat.send();
                }
              }}
              aria-label="Ask Pexa to do something"
              placeholder="Ask Pexa to do something..."
              style={{ flex: 1, minWidth: 0, border: `1px solid ${color.borderStrong}`, background: color.surface, borderRadius: '13px', padding: '14px 15px', fontSize: '15px', color: color.ink, outline: 'none' }}
            />
            <button onClick={() => chat.send()} aria-label="Send instruction" style={{ border: 'none', background: color.primary, color: '#fff', borderRadius: '13px', padding: '14px 17px', cursor: 'pointer', fontSize: '14.5px', fontWeight: 500, opacity: chat.draft.trim() ? 1 : 0.55 }}>Send</button>
          </div>
          <div style={{ fontSize: '11.5px', color: color.faint, marginTop: '9px' }}>Pexa always shows a preview. Nothing moves until you confirm.</div>
        </div>
      </div>
    </div>
  );
}

function AgentAvatar() {
  return (
    <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid ${color.primarySoftBorder}`, background: color.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <PrivyPayLogo size={13} />
    </div>
  );
}
function Dot({ delay }: { delay: string }) {
  return <span style={{ width: 5, height: 5, borderRadius: '50%', background: color.primary, display: 'inline-block', animation: `pp-pulse 1.1s ease-in-out ${delay} infinite` }} />;
}

function ChatRow({ m, activity, onConfirm, onCancel, onFix }: { m: ChatMessage; activity: ActivityItem[]; onConfirm: () => void; onCancel: () => void; onFix: (t: string) => void }) {
  if (m.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'pp-step .34s cubic-bezier(.2,.8,.3,1) both' }}>
        <div style={{ maxWidth: '80%', background: color.ink, color: '#fff', borderRadius: '15px 15px 4px 15px', padding: '11px 15px', fontSize: '15px', lineHeight: 1.45 }}>{m.text}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', animation: 'pp-step .34s cubic-bezier(.2,.8,.3,1) both' }}>
      <AgentAvatar />
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {m.text && (m.type === 'text' || m.type === 'preview') ? <div style={{ fontSize: '15px', lineHeight: 1.5, color: color.ink, paddingTop: '3px' }}>{m.text}</div> : null}
        {m.type === 'preview' ? <PreviewCard m={m} onConfirm={onConfirm} onCancel={onCancel} /> : null}
        {m.type === 'receipt' ? <ReceiptCard m={m} /> : null}
        {m.type === 'answer' ? <AnswerCard m={m} activity={activity} /> : null}
        {m.type === 'error' ? <ErrorCard m={m} onFix={onFix} /> : null}
      </div>
    </div>
  );
}

function metaFor(m: ChatMessage): Array<{ label: string; value: string }> {
  const it: Partial<AgentIntentShape> = m.intent ?? {};
  if (m.kind === 'send') return [{ label: 'To', value: it.handle ?? '' }, { label: 'Asset', value: 'USDC' }, { label: 'Network', value: 'Celo' }, { label: 'Estimated fee', value: '$0.001' }];
  if (m.kind === 'request') return [{ label: 'From', value: it.handle ?? '' }, { label: 'Reason', value: it.note ?? '—' }, { label: 'Asset', value: 'USDC' }];
  if (m.kind === 'recurring') return [{ label: 'To', value: it.handle ?? '' }, { label: 'Schedule', value: it.cadence ?? '' }, { label: 'Asset', value: 'USDC' }];
  return [{ label: 'Asset', value: 'USDC' }, { label: 'Network', value: 'Celo' }];
}

function PreviewCard({ m, onConfirm, onCancel }: { m: ChatMessage; onConfirm: () => void; onCancel: () => void }) {
  const it: Partial<AgentIntentShape> = m.intent ?? {};
  const confirmLabel = m.kind === 'send' ? 'Confirm payment' : m.kind === 'request' ? 'Send request' : 'Create recurring payment';
  const title = m.kind === 'send' ? 'PAYMENT PREVIEW' : m.kind === 'request' ? 'PAYMENT REQUEST' : 'RECURRING PAYMENT';
  const settled = m.status && m.status !== 'awaiting';
  return (
    <div style={{ border: `1px solid ${color.primarySoftBorder}`, background: color.surface, borderRadius: '16px', padding: '16px', maxWidth: '400px', boxShadow: '0 20px 44px -40px rgba(14,20,32,.5)' }}>
      <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.12em', color: color.faint }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '13px', flexWrap: 'wrap' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: color.primarySoft, color: color.primary, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{(it.handle?.[1] ?? '?').toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-.016em' }}>{it.handle}</div>
          <div style={{ fontSize: '12px', color: color.mutedStrong, marginTop: '1px' }}>Pexa user</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '23px', fontWeight: 600, letterSpacing: '-.036em', fontVariantNumeric: 'tabular-nums' }}>${money(it.amount ?? 0)}</div>
      </div>
      <div style={{ display: 'grid', gap: '9px', marginTop: '14px', paddingTop: '13px', borderTop: `1px solid ${color.borderFaint}` }}>
        {metaFor(m).map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '13.5px' }}>
            <span style={{ color: color.mutedStrong }}>{r.label}</span>
            <span style={{ fontWeight: 500, textAlign: 'right' }}>{r.value}</span>
          </div>
        ))}
      </div>
      {!settled ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button onClick={onConfirm} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14.5px', fontWeight: 500, padding: '12px 16px', borderRadius: '11px', cursor: 'pointer', flex: 1, minWidth: '150px' }}>{confirmLabel}</button>
          <button onClick={onCancel} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '12px 15px', borderRadius: '11px', cursor: 'pointer' }}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', paddingTop: '13px', borderTop: `1px solid ${color.borderFaint}`, fontSize: '13px', color: m.status === 'cancelled' ? color.warning : color.success }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.status === 'cancelled' ? color.warning : color.success, display: 'inline-block' }} />
          {m.status === 'cancelled' ? 'Cancelled' : m.status === 'failed' ? 'Failed' : 'Confirmed'}
        </div>
      )}
    </div>
  );
}

function ReceiptCard({ m }: { m: ChatMessage }) {
  const it: Partial<AgentIntentShape> = m.intent ?? {};
  const rows: Array<{ label: string; value: string; color?: string }> =
    m.kind === 'send'
      ? [
          { label: 'To', value: it.handle ?? '' },
          { label: 'Status', value: m.result?.status === 'pending' ? 'Pending' : 'Completed', color: statusColor(m.result?.status === 'pending' ? 'Pending' : 'Completed') },
          ...(m.result?.txHash ? [{ label: 'Transaction', value: m.result.txHash.slice(0, 6) + '…' + m.result.txHash.slice(-4) }] : []),
        ]
      : m.kind === 'request'
        ? [{ label: 'From', value: it.handle ?? '' }, { label: 'Status', value: 'Pending', color: statusColor('Pending') }]
        : [{ label: 'To', value: it.handle ?? '' }, { label: 'Schedule', value: it.cadence ?? '' }, { label: 'Status', value: 'Active', color: color.success }];
  const title = m.kind === 'send' ? 'Payment sent' : m.kind === 'request' ? 'Request sent' : 'Recurring payment created';
  return (
    <div style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '16px', padding: '18px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.primary, color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', animation: 'pp-pop .34s cubic-bezier(.2,.8,.3,1) both' }}>✓</div>
        <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-.018em' }}>{title}</div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-.04em', marginTop: '14px', fontVariantNumeric: 'tabular-nums' }}>
        ${money(it.amount ?? 0)} <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '12px', fontWeight: 400, color: color.mutedStrong }}>USDC</span>
      </div>
      <div style={{ display: 'grid', gap: '9px', marginTop: '14px', paddingTop: '13px', borderTop: `1px solid ${color.borderFaint}` }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', fontSize: '13.5px' }}>
            <span style={{ color: color.mutedStrong }}>{r.label}</span>
            <span style={{ fontWeight: 500, textAlign: 'right', color: r.color ?? color.ink }}>{r.value}</span>
          </div>
        ))}
      </div>
      {m.result?.explorerUrl ? (
        <button onClick={() => window.open(m.result!.explorerUrl!, '_blank', 'noopener')} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '11px 16px', borderRadius: '11px', cursor: 'pointer', marginTop: '15px' }}>View on explorer</button>
      ) : null}
    </div>
  );
}

function AnswerCard({ m, activity }: { m: ChatMessage; activity: ActivityItem[] }) {
  if (m.answerKind === 'activity') {
    const rows = activity.slice(0, 4);
    return (
      <div style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '16px', padding: '17px', maxWidth: '400px' }}>
        <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Recent payments</div>
        <div style={{ display: 'grid', gap: '11px', marginTop: '13px' }}>
          {rows.length === 0 ? <div style={{ fontSize: '13.5px', color: color.muted }}>No payments yet.</div> : null}
          {rows.map((t) => {
            const out = t.direction === 'out';
            return (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{t.counterparty}</div>
                  <div style={{ fontSize: '12px', color: color.mutedStrong, marginTop: '2px' }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: out ? color.ink : color.success, fontVariantNumeric: 'tabular-nums' }}>{(out ? '-$' : '+$') + money(Number(t.amount))}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // balance
  return (
    <div style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '16px', padding: '17px', maxWidth: '400px' }}>
      <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Available balance</div>
      <div style={{ fontSize: '27px', fontWeight: 600, letterSpacing: '-.038em', marginTop: '5px', fontVariantNumeric: 'tabular-nums' }}>{m.text}</div>
    </div>
  );
}

function ErrorCard({ m, onFix }: { m: ChatMessage; onFix: (t: string) => void }) {
  return (
    <div style={{ border: '1px solid #F0DCD8', background: '#FDF8F7', borderRadius: '16px', padding: '15px 16px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#F4E2DE', color: '#A8352A', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>!</span>
        <span style={{ fontSize: '14.5px', fontWeight: 500, color: '#A8352A' }}>{m.title}</span>
      </div>
      {m.hint ? <div style={{ fontSize: '13.5px', color: color.muted, lineHeight: 1.55, marginTop: '9px' }}>{m.hint}</div> : null}
      {m.fixLabel && m.fixText ? (
        <button onClick={() => onFix(m.fixText!)} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '13.5px', fontWeight: 500, padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', marginTop: '13px' }}>{m.fixLabel}</button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- other pages */

function WalletPage({ balance, username, address, onSend }: { balance: string; username?: string; address?: string; onSend: () => void }) {
  const [copied, setCopied] = useState(false);
  const short = address ? address.slice(0, 6) + '…' + address.slice(-4) : '—';
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'clamp(16px,2.6vw,28px) clamp(14px,2.6vw,26px) 40px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', animation: 'pp-fade .22s ease both' }}>
        <div style={{ background: color.ink, borderRadius: '18px', padding: 'clamp(20px,3vw,28px)', color: '#fff' }}>
          <div style={{ fontSize: '12.5px', color: '#A3ACBC' }}>Available balance</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', marginTop: '8px' }}>
            <div style={{ fontSize: 'clamp(34px,5vw,44px)', fontWeight: 600, letterSpacing: '-.045em', fontVariantNumeric: 'tabular-nums' }}>${money(Number(balance) || 0)}</div>
            <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '13px', color: '#A3ACBC' }}>USDC</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button onClick={onSend} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14.5px', fontWeight: 500, padding: '12px 18px', borderRadius: '11px', cursor: 'pointer' }}>Send</button>
            <button
              onClick={() => {
                if (address) navigator.clipboard?.writeText(address).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => {});
              }}
              style={{ border: '1px solid #2C3547', background: 'transparent', color: '#fff', fontSize: '14.5px', fontWeight: 500, padding: '12px 18px', borderRadius: '11px', cursor: 'pointer' }}
            >
              {copied ? 'Address copied' : 'Receive'}
            </button>
          </div>
        </div>
        <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '18px', marginTop: '14px' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.12em', color: color.faint }}>YOUR IDENTITY</div>
          <div style={{ fontSize: '21px', fontWeight: 600, letterSpacing: '-.03em', marginTop: '13px' }}>{username ? '@' + username : '—'}</div>
          <div style={{ fontSize: '13px', color: color.mutedStrong, marginTop: '4px' }}>People pay you by username.</div>
          <div style={{ marginTop: '15px', paddingTop: '14px', borderTop: `1px solid ${color.borderFaint}` }}>
            <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Celo wallet</div>
            <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '13px', marginTop: '5px', wordBreak: 'break-all' }}>{short}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityPage({ activity }: { activity: ActivityItem[] }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'clamp(16px,2.6vw,28px) clamp(14px,2.6vw,26px) 40px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', animation: 'pp-fade .22s ease both' }}>
        <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', overflow: 'hidden' }}>
          {activity.length === 0 ? <div style={{ padding: '34px 18px', textAlign: 'center', fontSize: '14px', color: color.mutedStrong }}>Nothing here yet.</div> : null}
          {activity.map((t) => {
            const out = t.direction === 'out';
            const label = { CONFIRMED: 'Completed', PENDING: 'Pending', FAILED: 'Failed' }[t.status] ?? t.status;
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 17px', borderBottom: `1px solid #F2F3F6` }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: out ? '#F1F2F5' : color.successSoft, color: out ? '#5B6472' : color.success, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{(t.counterparty.replace(/^@/, '')[0] ?? '?').toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, letterSpacing: '-.012em' }}>{t.counterparty}</div>
                  <div style={{ fontSize: '12.5px', color: color.mutedStrong, marginTop: '2px' }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: out ? color.ink : color.success, fontVariantNumeric: 'tabular-nums' }}>{(out ? '-$' : '+$') + money(Number(t.amount))}</div>
                  <div style={{ fontSize: '12px', color: statusColor(label), marginTop: '2px' }}>{label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ username, address, onSignOut }: { username?: string; address?: string; onSignOut: () => void }) {
  const [copied, setCopied] = useState(false);
  const short = address ? address.slice(0, 10) + '…' + address.slice(-6) : '—';
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'clamp(16px,2.6vw,28px) clamp(14px,2.6vw,26px) 48px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px', animation: 'pp-fade .22s ease both' }}>
        {/* Account */}
        <section>
          <SectionHead title="Account" subtitle="Your Pexa identity and wallet." />
          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: color.primarySoft, color: color.primary, fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{(username?.[0] ?? '?').toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-.02em' }}>{username ? '@' + username : '—'}</div>
                <div style={{ fontSize: '13px', color: color.mutedStrong, marginTop: '2px' }}>People pay you by username.</div>
              </div>
              <button onClick={onSignOut} style={{ marginLeft: 'auto', border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.danger, fontSize: '13.5px', fontWeight: 500, padding: '9px 15px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign out</button>
            </div>
            <div style={{ marginTop: '17px', paddingTop: '15px', borderTop: `1px solid ${color.borderFaint}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Celo wallet</div>
                <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '13px', marginTop: '4px', wordBreak: 'break-all' }}>{short}</div>
              </div>
              {address ? (
                <button
                  onClick={() => navigator.clipboard?.writeText(address).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }, () => {})}
                  style={{ marginLeft: 'auto', border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '13px', fontWeight: 500, padding: '8px 13px', borderRadius: '9px', cursor: 'pointer' }}
                >
                  {copied ? 'Copied' : 'Copy address'}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {/* Connected agents (MCP) */}
        <section>
          <SectionHead title="Connected agents" subtitle="Connect ChatGPT or Claude so your agent can act on your behalf. You confirm every payment." />
          <ServiceConnect />
        </section>

        {/* Delegated (agent) payments */}
        <section>
          <SectionHead title="Automation" subtitle="Let a connected agent settle a payment right after you confirm it — within your limits." />
          <AgentPayments />
        </section>

        {/* Privacy */}
        <section>
          <SectionHead title="Privacy & limits" subtitle="How Pexa protects you." />
          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '20px', display: 'grid', gap: '13px' }}>
            {[
              ['Preview-first', 'Pexa always shows a preview. Nothing moves until you confirm.'],
              ['Spending limits', 'Every payment passes a $500 per-payment and $1,000 per-day cap — including agent-initiated ones.'],
              ['Keys stay in Privy', 'Your wallet keys never leave Privy’s secure enclave. Pexa and connected agents never see them.'],
            ].map(([t, b]) => (
              <div key={t} style={{ display: 'flex', gap: '11px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.success, marginTop: '7px', flex: 'none' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-.01em' }}>{t}</div>
                  <div style={{ fontSize: '13px', color: color.muted, lineHeight: 1.55, marginTop: '2px' }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ margin: '0 0 13px 2px' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-.02em' }}>{title}</div>
      <div style={{ fontSize: '13px', color: color.muted, lineHeight: 1.5, marginTop: '3px', maxWidth: '560px' }}>{subtitle}</div>
    </div>
  );
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'clamp(16px,2.6vw,28px) clamp(14px,2.6vw,26px) 40px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', animation: 'pp-fade .22s ease both' }}>
        <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '28px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{title}</div>
          <p style={{ fontSize: '14px', color: color.muted, lineHeight: 1.6, margin: '8px 0 0' }}>{body}</p>
        </div>
      </div>
    </div>
  );
}
