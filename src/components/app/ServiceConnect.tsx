'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useMcpTokens } from '@/components/auth/useMcpTokens';
import { color } from '@/lib/design/tokens';

/**
 * Connect ChatGPT / Claude to PrivyPay in a few taps — built for non-technical users. Clicking a
 * service opens a guided modal that generates a connection key, opens the service so they can
 * paste it, and then *auto-detects* the connection the moment the agent first uses the key
 * (the token's lastUsedAt appears). WhatsApp is a placeholder until it's built.
 */

interface Svc {
  key: string;
  name: string;
  desc: string;
  logo: string;
  markBg: string;
  markBorder: string;
  url?: string;
  hint?: string;
  comingSoon?: boolean;
}

const SERVICES: Svc[] = [
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    desc: 'Send and request payments directly from your conversations.',
    logo: '/assets/logo-chatgpt.png',
    markBg: '#F3F4F6',
    markBorder: '#E3E5E9',
    url: 'https://chatgpt.com',
    hint: 'In ChatGPT: Settings → Connectors → Add, then paste the endpoint and key.',
  },
  {
    key: 'claude',
    name: 'Claude',
    desc: 'Kick off payments and requests from your Claude workflow.',
    logo: '/assets/logo-claude.png',
    markBg: '#FBF0EA',
    markBorder: '#F3DED1',
    url: 'https://claude.ai',
    hint: 'In Claude: Settings → Connectors → Add custom connector, then paste the endpoint and key.',
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    desc: 'Pay and get paid in the chat app you already use every day.',
    logo: '/assets/logo-whatsapp.png',
    markBg: '#EAF3EE',
    markBorder: '#D9EBE1',
    comingSoon: true,
  },
];

function Copyable({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '11.5px', color: color.mutedStrong, marginBottom: '5px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <code
          style={{
            fontFamily: 'var(--font-geist-mono),monospace',
            fontSize: '12.5px',
            color: color.ink,
            background: color.surfaceMuted,
            border: `1px solid ${color.borderFaint}`,
            borderRadius: '8px',
            padding: '9px 12px',
            flex: 1,
            minWidth: '180px',
            overflowX: 'auto',
            wordBreak: 'break-all',
          }}
        >
          {value}
        </code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value).then(
              () => {
                setDone(true);
                setTimeout(() => setDone(false), 1500);
              },
              () => {},
            );
          }}
          style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '12.5px', fontWeight: 500, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {done ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function Step({ n, label, state }: { n: number; label: string; state: 'done' | 'active' | 'todo' }) {
  const bg = state === 'done' ? color.successSoft : state === 'active' ? color.primarySoft : '#F2F3F6';
  const fg = state === 'done' ? color.success : state === 'active' ? color.primary : '#8A93A6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '11px', animation: 'pp-step .3s cubic-bezier(.2,.8,.3,1) both' }}>
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: bg,
          color: fg,
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          ...(state === 'active' ? { animation: 'pp-pulse 1.6s ease-in-out infinite' } : {}),
        }}
      >
        {state === 'done' ? '✓' : n}
      </span>
      <span style={{ fontSize: '13.5px', color: state === 'todo' ? color.muted : color.ink, fontWeight: state === 'active' ? 600 : 450 }}>{label}</span>
    </div>
  );
}

function ConnectModal({
  svc,
  onClose,
  connected,
  mint,
  poll,
}: {
  svc: Svc;
  onClose: () => void;
  connected: boolean;
  mint: (label: string) => Promise<{ ok: boolean; token?: string; error?: string }>;
  poll: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endpoint = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/mcp';

  // Once a key exists and we're not connected yet, poll so we can auto-detect the connection.
  useEffect(() => {
    if (!token || connected) return;
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [token, connected, poll]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    const res = await mint(svc.name);
    setBusy(false);
    if (res.ok && res.token) setToken(res.token);
    else setError(res.error ?? 'Could not create a connection key.');
  };

  const s1: 'done' | 'active' | 'todo' = token ? 'done' : 'active';
  const s2: 'done' | 'active' | 'todo' = connected ? 'done' : token ? 'active' : 'todo';
  const s3: 'done' | 'active' | 'todo' = connected ? 'done' : 'todo';

  return (
    <Modal open onClose={onClose} title={`Connect ${svc.name}`} maxWidth={480}>
      <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: color.muted, lineHeight: 1.6 }}>
        Three quick steps — PrivyPay detects the connection automatically once {svc.name} uses your key.
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        <Step n={1} label="Generate your connection key" state={s1} />
        <Step n={2} label={`Open ${svc.name} and paste it in Settings → Connectors`} state={s2} />
        <Step n={3} label="You're connected" state={s3} />
      </div>

      <div style={{ marginTop: '18px', borderTop: `1px solid ${color.borderFaint}`, paddingTop: '16px' }}>
        {connected ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                margin: '0 auto',
                borderRadius: '50%',
                background: color.primary,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '19px',
                animation: 'pp-pop .34s cubic-bezier(.2,.8,.3,1) both',
              }}
            >
              ✓
            </div>
            <div style={{ marginTop: '12px', fontSize: '15.5px', fontWeight: 600 }}>{svc.name} is connected</div>
            <div style={{ marginTop: '5px', fontSize: '13px', color: color.muted }}>
              You can now ask {svc.name} to check balances, request, and pay — you confirm every payment.
            </div>
            <button
              onClick={onClose}
              style={{ marginTop: '16px', border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, padding: '11px 20px', borderRadius: '10px', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        ) : !token ? (
          <>
            <button
              onClick={generate}
              disabled={busy}
              style={{ width: '100%', border: 'none', background: color.primary, color: '#fff', fontSize: '14.5px', fontWeight: 500, padding: '12px', borderRadius: '10px', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy ? 'Generating…' : 'Generate connection key'}
            </button>
            {error ? <div style={{ marginTop: '10px', fontSize: '13px', color: color.danger }}>{error}</div> : null}
          </>
        ) : (
          <>
            <Copyable value={endpoint} label="MCP endpoint" />
            <Copyable value={token} label="Connection key (shown once)" />
            {svc.hint ? <div style={{ marginTop: '12px', fontSize: '12.5px', color: color.muted, lineHeight: 1.5 }}>{svc.hint}</div> : null}
            <div style={{ display: 'flex', gap: '9px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {svc.url ? (
                <button
                  onClick={() => window.open(svc.url, '_blank', 'noopener')}
                  style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, padding: '11px 18px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Open {svc.name}
                </button>
              ) : null}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: color.muted }}>
                <span style={{ position: 'relative', width: '14px', height: '14px', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color.primarySoftBorder}`, borderTopColor: color.primary, animation: 'pp-spin .8s linear infinite' }} />
                </span>
                Waiting for {svc.name}…
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export function ServiceConnect() {
  const { tokens, mint, refresh } = useMcpTokens();
  const [open, setOpen] = useState<Svc | null>(null);

  // A service is "connected" once a token labeled with its name has actually been used.
  const connectedByName = useMemo(() => {
    const m = new Set<string>();
    for (const t of tokens) if (t.label && t.lastUsedAt) m.add(t.label.toLowerCase());
    return m;
  }, [tokens]);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(272px,1fr))', gap: '12px' }}>
        {SERVICES.map((sv) => {
          const connected = connectedByName.has(sv.name.toLowerCase());
          const stateLabel = sv.comingSoon ? 'Coming soon' : connected ? 'Connected' : 'Available via MCP';
          const stateColor = sv.comingSoon ? color.warning : connected ? color.success : color.mutedStrong;
          const dot = sv.comingSoon ? color.warningDot : connected ? color.success : '#D2D7DF';
          return (
            <div key={sv.key} className="scpm" style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', transition: 'transform .18s ease,box-shadow .18s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: sv.markBg, border: `1px solid ${sv.markBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sv.logo} alt={sv.name} style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: sv.key === 'claude' ? '6px' : undefined }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15.5px', fontWeight: 600, letterSpacing: '-.015em' }}>{sv.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
                    <span style={{ fontSize: '12.5px', color: stateColor }}>{stateLabel}</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13.5px', color: color.muted, lineHeight: 1.6, margin: '14px 0 18px' }}>{sv.desc}</p>
              <button
                onClick={() => !sv.comingSoon && setOpen(sv)}
                disabled={sv.comingSoon}
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  border: sv.comingSoon ? `1px solid ${color.border}` : connected ? `1px solid ${color.borderStrong}` : `1px solid ${color.primary}`,
                  background: sv.comingSoon ? '#F2F3F6' : connected ? color.surface : color.primary,
                  color: sv.comingSoon ? '#8A93A6' : connected ? color.ink : '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '11px',
                  borderRadius: '10px',
                  cursor: sv.comingSoon ? 'default' : 'pointer',
                  transition: 'background .16s ease,border-color .16s ease',
                }}
              >
                {sv.comingSoon ? 'Coming soon' : connected ? 'Manage connection' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
      {open ? <ConnectModal svc={open} onClose={() => setOpen(null)} connected={connectedByName.has(open.name.toLowerCase())} mint={mint} poll={refresh} /> : null}
    </>
  );
}
