'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginWithEmail, useLoginWithPasskey, useSignupWithPasskey } from '@privy-io/react-auth';
import { useToast } from '@/components/ui';
import { PrivyPayLogo } from '@/components/brand/PrivyPayLogo';
import { color } from '@/lib/design/tokens';

/**
 * Pexa sign-in / sign-up (rebuilt from design/Pexa.dc.html). Welcome → email → 6-digit code, plus
 * a one-tap passkey path. Wired to Privy's headless hooks, so this is a real route, not a modal.
 * Only rendered when Privy is configured (the caller gates), so the hooks always have a provider.
 */

const EMAIL_RE = /.+@.+\..+/;
const RESEND_COOLDOWN = 30;
type Step = 'welcome' | 'email' | 'code';

export function PexaAuth() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { loginWithPasskey } = useLoginWithPasskey();
  const { signupWithPasskey } = useSignupWithPasskey();

  const goApp = useCallback(() => router.replace('/app'), [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const doSendCode = useCallback(async () => {
    if (!EMAIL_RE.test(email)) return;
    try {
      await sendCode({ email });
      setCooldown(RESEND_COOLDOWN);
      setStep('code');
    } catch {
      toast.show('Couldn’t send the code — check the address and try again.', { tone: 'danger' });
    }
  }, [email, sendCode, toast]);

  const doResend = useCallback(async () => {
    if (cooldown > 0 || !EMAIL_RE.test(email)) return;
    setCooldown(RESEND_COOLDOWN);
    try {
      await sendCode({ email });
      toast.show('New code sent.', { tone: 'success' });
    } catch {
      toast.show('Couldn’t resend the code. Try again in a moment.', { tone: 'danger' });
    }
  }, [cooldown, email, sendCode, toast]);

  const doVerify = useCallback(async () => {
    if (code.length < 6) return;
    try {
      await loginWithCode({ code });
      goApp();
    } catch {
      toast.show('That code didn’t work. Request a new one and try again.', { tone: 'danger' });
    }
  }, [code, loginWithCode, goApp, toast]);

  const doPasskey = useCallback(async () => {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    try {
      if (createMode) {
        await signupWithPasskey();
        goApp();
        return;
      }
      await loginWithPasskey();
      goApp();
    } catch {
      try {
        await signupWithPasskey();
        goApp();
      } catch {
        setCreateMode(true);
        toast.show('No passkey found on this device — tap “Create a passkey” to set one up.', { tone: 'neutral', duration: 4500 });
      }
    } finally {
      setPasskeyBusy(false);
    }
  }, [passkeyBusy, createMode, loginWithPasskey, signupWithPasskey, goApp, toast]);

  const passkeyLabel = passkeyBusy ? 'Waiting for your device…' : createMode ? 'Create a passkey' : 'Continue with a passkey';
  const sub = step === 'welcome' ? 'Email or a passkey. No seed phrase to write down.' : step === 'email' ? 'We’ll email you a 6-digit code.' : `Enter the code we sent to ${email}.`;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: color.background, color: color.ink }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'pp-up .4s cubic-bezier(.2,.8,.3,1) both' }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: '9px', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
          <PrivyPayLogo size={21} animated />
          <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-.02em' }}>Pexa</span>
        </button>
        <h1 style={{ fontSize: '27px', letterSpacing: '-.03em', fontWeight: 600, margin: '26px 0 0' }}>Create your account</h1>
        <p style={{ fontSize: '15px', color: color.muted, lineHeight: 1.6, margin: '10px 0 24px' }}>{sub}</p>

        {step === 'welcome' ? (
          <div>
            <button onClick={doPasskey} style={{ width: '100%', border: 'none', background: color.ink, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px', borderRadius: '11px', cursor: 'pointer' }}>{passkeyLabel}</button>
            <button onClick={() => setStep('email')} style={{ width: '100%', marginTop: '10px', border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '15px', fontWeight: 500, padding: '13px', borderRadius: '11px', cursor: 'pointer' }}>Continue with email</button>
          </div>
        ) : null}

        {step === 'email' ? (
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSendCode()}
              placeholder="you@email.com"
              type="email"
              autoFocus
              style={{ width: '100%', border: `1px solid ${color.borderStrong}`, background: color.surface, borderRadius: '11px', padding: '13px 15px', fontSize: '15px', outline: 'none', color: color.ink }}
            />
            <button onClick={doSendCode} disabled={!EMAIL_RE.test(email)} style={{ width: '100%', marginTop: '12px', border: 'none', background: color.ink, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px', borderRadius: '11px', cursor: EMAIL_RE.test(email) ? 'pointer' : 'default', opacity: EMAIL_RE.test(email) ? 1 : 0.5 }}>Send code</button>
            <button onClick={() => setStep('welcome')} style={{ width: '100%', marginTop: '10px', border: 'none', background: 'transparent', color: color.mutedStrong, fontSize: '13.5px', padding: '8px', cursor: 'pointer' }}>Back</button>
          </div>
        ) : null}

        {step === 'code' ? (
          <div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && doVerify()}
              placeholder="6-digit code"
              inputMode="numeric"
              autoFocus
              style={{ width: '100%', border: `1px solid ${color.borderStrong}`, background: color.surface, borderRadius: '11px', padding: '13px 15px', fontSize: '17px', fontFamily: 'var(--font-geist-mono),monospace', letterSpacing: '.28em', outline: 'none', color: color.ink }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
              <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Sent to {email}</div>
              <button onClick={doResend} disabled={cooldown > 0} style={{ border: 'none', background: 'transparent', color: cooldown > 0 ? color.faint : color.primary, fontSize: '12.5px', fontWeight: 500, padding: 0, cursor: cooldown > 0 ? 'default' : 'pointer' }}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button>
            </div>
            <button onClick={doVerify} disabled={code.length < 6} style={{ width: '100%', marginTop: '12px', border: 'none', background: color.ink, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px', borderRadius: '11px', cursor: code.length < 6 ? 'default' : 'pointer', opacity: code.length < 6 ? 0.5 : 1 }}>Verify</button>
            <button onClick={() => { setStep('welcome'); setCode(''); }} style={{ width: '100%', marginTop: '10px', border: 'none', background: 'transparent', color: color.mutedStrong, fontSize: '13.5px', padding: '8px', cursor: 'pointer' }}>Start over</button>
          </div>
        ) : null}

        <div style={{ fontSize: '12.5px', color: color.faint, textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>Your Celo payment wallet is provisioned with your account.</div>
      </div>
    </div>
  );
}
