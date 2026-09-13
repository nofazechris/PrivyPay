'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginWithEmail, useLoginWithPasskey, useSignupWithPasskey } from '@privy-io/react-auth';
import { useViewModel } from '@/lib/viewModel';
import { useToast } from '@/components/ui';
import AuthScreen from '@/components/screens/AuthScreen';

const EMAIL_RE = /.+@.+\..+/;
/** Seconds to wait before another code can be requested. */
const RESEND_COOLDOWN = 30;

/**
 * Full-page sign-in (§8, §57). Reuses the design's `AuthScreen` (welcome → email → 6-digit
 * code, plus passkey) and wires its action handlers to Privy's headless hooks — so auth is a
 * real route, not a modal, and looks exactly like the imported design. Only rendered when
 * Privy is configured, so the hooks always have their provider.
 */
export default function PrivyLoginForm() {
  const v = useViewModel('landing');
  const router = useRouter();
  const toast = useToast();
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { loginWithPasskey } = useLoginWithPasskey();
  const { signupWithPasskey } = useSignupWithPasskey();

  const goApp = useCallback(() => router.replace('/app'), [router]);

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const startCooldown = useCallback(() => setCooldown(RESEND_COOLDOWN), []);

  // Send the real OTP, then let the view model advance the UI to the code step.
  const doSendCode = useCallback(() => {
    if (!EMAIL_RE.test(v.email)) return;
    sendCode({ email: v.email }).catch(() => toast.show('Couldn’t send the code — check the address and try again.', { tone: 'danger' }));
    startCooldown();
    v.sendCode();
  }, [v, sendCode, toast, startCooldown]);

  // Resend the code to the same address, rate-limited by the cooldown.
  const doResendCode = useCallback(async () => {
    if (cooldown > 0 || !EMAIL_RE.test(v.email)) return;
    startCooldown();
    try {
      await sendCode({ email: v.email });
      toast.show('New code sent.', { tone: 'success' });
    } catch {
      toast.show('Couldn’t resend the code. Try again in a moment.', { tone: 'danger' });
    }
  }, [cooldown, v.email, startCooldown, sendCode, toast]);

  const doVerifyCode = useCallback(async () => {
    if (!v.code || v.code.length < 6) return;
    try {
      await loginWithCode({ code: v.code });
      goApp();
    } catch {
      toast.show('That code didn’t work. Request a new one and try again.', { tone: 'danger' });
    }
  }, [v.code, loginWithCode, goApp, toast]);

  // Passkey. This is a "Create your account" surface, so the primary action creates a passkey
  // (single WebAuthn call, bound to the click's user activation — chaining a second call would
  // lose that activation and the browser would block it). If the user already has a passkey,
  // signup fails and we fall back to logging in. Real errors are logged so a misconfiguration
  // (e.g. passkey signup not enabled in the Privy dashboard) is diagnosable.
  const doPasskey = useCallback(async () => {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    try {
      await signupWithPasskey();
      goApp();
    } catch (signupErr) {
      console.error('[passkey] signup failed:', signupErr);
      try {
        await loginWithPasskey();
        goApp();
      } catch (loginErr) {
        console.error('[passkey] login failed:', loginErr);
        const detail = signupErr instanceof Error ? signupErr.message : '';
        toast.show(detail ? `Passkey failed: ${detail}` : 'Passkey wasn’t completed. Try again, or use your email.', {
          tone: 'danger',
          duration: 4500,
        });
      }
    } finally {
      setPasskeyBusy(false);
    }
  }, [passkeyBusy, signupWithPasskey, loginWithPasskey, goApp, toast]);

  // Keep the design's UI/step values; replace the five money-path handlers with real auth.
  const authVals = useMemo(
    () => ({
      ...v,
      usePasskey: doPasskey,
      passkeyLabel: passkeyBusy ? 'Waiting for your device…' : 'Continue with a passkey',
      sendCode: doSendCode,
      onEmailKey: (e: { key: string }) => {
        if (e.key === 'Enter') doSendCode();
      },
      verifyCode: doVerifyCode,
      onCodeKey: (e: { key: string }) => {
        if (e.key === 'Enter') doVerifyCode();
      },
      resendCode: doResendCode,
      resendLabel: cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code',
      goLanding: () => router.push('/'),
    }),
    [v, doPasskey, passkeyBusy, doSendCode, doVerifyCode, doResendCode, cooldown, router],
  );

  return <AuthScreen v={authVals} />;
}
