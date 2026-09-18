'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWallet } from '@/components/auth/useWallet';
import { useToast } from '@/components/ui';
import { color } from '@/lib/design/tokens';
import { shortAddress } from '@/lib/format';

/**
 * Pexa username onboarding (rebuilt from design/Pexa.dc.html). Choose a username (checked live for
 * availability), claim it via /api/username, play the wallet-provisioning animation, then show the
 * real provisioned Celo address. "Start using Pexa" enters the app.
 */

type Step = 'username' | 'creating' | 'ready';
const SETUP_STEPS = ['Creating your account', 'Provisioning your Celo wallet', 'Securing your keys', 'Finishing up'];

export function PexaOnboarding() {
  const router = useRouter();
  const toast = useToast();
  const { getAccessToken } = useAuth();
  const { address } = useWallet();

  const [step, setStep] = useState<Step>('username');
  const [handle, setHandle] = useState('');
  const [avail, setAvail] = useState<{ ok: boolean; message: string } | null>(null);
  const [setupIdx, setSetupIdx] = useState(0);
  const submitting = useRef(false);

  // Live availability check (debounced). `avail` is cleared in the input's onChange, so the
  // effect only writes the fetched result (asynchronously) — never synchronously in its body.
  useEffect(() => {
    const u = handle.trim().toLowerCase();
    if (u.length < 3) return;
    let active = true;
    const t = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(u)}`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        const data = (await res.json()) as { available: boolean; message: string };
        if (active) setAvail({ ok: data.available, message: data.message });
      } catch {
        /* leave unchecked */
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [handle, getAccessToken]);

  const claim = useCallback(async () => {
    const username = handle.trim().toLowerCase();
    if (submitting.current || username.length < 3 || (avail && !avail.ok)) return;
    submitting.current = true;
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ username }),
      });
      if (res.status === 201) {
        setSetupIdx(0);
        setStep('creating');
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      toast.show(data.message ?? 'Couldn’t claim that username. Try another.', { tone: 'danger', duration: 4000 });
    } catch {
      toast.show('Something went wrong. Please try again.', { tone: 'danger' });
    } finally {
      submitting.current = false;
    }
  }, [handle, avail, getAccessToken, toast]);

  // Provisioning animation → ready.
  useEffect(() => {
    if (step !== 'creating') return;
    const timers = SETUP_STEPS.map((_, i) => setTimeout(() => setSetupIdx(i + 1), (i + 1) * 700));
    const done = setTimeout(() => setStep('ready'), SETUP_STEPS.length * 700 + 500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [step]);

  const handleDisplay = handle.trim() ? '@' + handle.trim().toLowerCase() : '@you';
  const validLen = handle.trim().length >= 3;
  const canContinue = validLen && (!avail || avail.ok);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: color.background, color: color.ink }}>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'pp-up .4s cubic-bezier(.2,.8,.3,1) both' }}>
        {step === 'username' ? (
          <div>
            <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: color.faint }}>STEP 2 OF 3</div>
            <h1 style={{ fontSize: '27px', letterSpacing: '-.03em', fontWeight: 600, margin: '14px 0 0' }}>Choose your username.</h1>
            <p style={{ fontSize: '15px', color: color.muted, lineHeight: 1.6, margin: '10px 0 22px' }}>This is how people send you money.</p>
            <div style={{ background: color.surface, border: `1px solid ${avail && !avail.ok ? '#E7C9C4' : color.borderStrong}`, borderRadius: '11px', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '16px', color: color.faint }}>@</span>
              <input
                value={handle}
                onChange={(e) => { setAvail(null); setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)); }}
                onKeyDown={(e) => e.key === 'Enter' && canContinue && claim()}
                placeholder="chris"
                autoFocus
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '17px', fontWeight: 500, letterSpacing: '-.01em', color: color.ink }}
              />
              {validLen && avail ? (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: avail.ok ? color.success : color.danger, whiteSpace: 'nowrap', animation: 'pp-pop .28s cubic-bezier(.2,.8,.3,1) both' }}>
                  {avail.ok ? '✓ Available' : avail.message}
                </span>
              ) : null}
            </div>
            <button onClick={claim} disabled={!canContinue} style={{ width: '100%', marginTop: '14px', border: 'none', background: color.primary, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px', borderRadius: '11px', cursor: canContinue ? 'pointer' : 'default', opacity: canContinue ? 1 : 0.5 }}>Continue</button>
            <div style={{ fontSize: '12.5px', color: color.faint, marginTop: '16px', lineHeight: 1.6 }}>Your Celo payment wallet is created automatically — nothing to install or connect.</div>
          </div>
        ) : null}

        {step === 'creating' ? (
          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-.02em' }}>Setting up your payment wallet…</div>
            <div style={{ display: 'grid', gap: '14px', marginTop: '20px' }}>
              {SETUP_STEPS.map((label, i) => {
                const done = i < setupIdx;
                const activeS = i === setupIdx;
                const bg = done ? color.successSoft : activeS ? color.primarySoft : '#F2F3F6';
                const fg = done ? color.success : activeS ? color.primary : '#8A93A6';
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '11px', fontSize: '14.5px' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: bg, color: fg, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', animation: activeS ? 'pp-pulse 1.6s ease-in-out infinite' : undefined }}>{done ? '✓' : i + 1}</span>
                    <span style={{ color: done || activeS ? color.ink : color.muted }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '22px', height: 3, borderRadius: '999px', background: color.borderFaint, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: color.primary, borderRadius: '999px', width: `${(setupIdx / SETUP_STEPS.length) * 100}%`, transition: 'width .4s cubic-bezier(.3,.8,.3,1)' }} />
            </div>
          </div>
        ) : null}

        {step === 'ready' ? (
          <div>
            <h1 style={{ fontSize: '27px', letterSpacing: '-.03em', fontWeight: 600, margin: 0 }}>Your wallet is ready.</h1>
            <p style={{ fontSize: '15px', color: color.muted, lineHeight: 1.6, margin: '10px 0 22px' }}>You can send, receive and request money right away.</p>
            <div style={{ background: color.ink, borderRadius: '16px', padding: '26px', color: '#fff' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-.025em' }}>{handleDisplay}</div>
              <div style={{ height: 1, background: '#212938', margin: '20px 0' }} />
              <div style={{ fontSize: '12.5px', color: '#A3ACBC' }}>Celo payment wallet</div>
              <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '16px', marginTop: '6px' }}>{address ? shortAddress(address) : 'Provisioning…'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FBF85', display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: '#A3ACBC' }}>Wallet ready</span>
              </div>
            </div>
            <button onClick={() => router.replace('/app')} style={{ width: '100%', marginTop: '16px', border: 'none', background: color.primary, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px', borderRadius: '11px', cursor: 'pointer' }}>Start using Pexa</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
