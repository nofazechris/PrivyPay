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
  // After a failed passkey login on a device with no credential, switch the button to an
  // explicit "create" so the next click starts a fresh WebAuthn gesture (create needs its own
  // user activation).
  const [createMode, setCreateMode] = useState(false);
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

  // Passkey — one button that works for everyone:
  //  • Returning users log in instantly (loginWithPasskey), so "log back in" is a single tap.
  //  • New users have no credential, so login fails and we create one (signupWithPasskey) in
  //    the same gesture when the browser still allows it.
  //  • If the create is blocked (a WebAuthn create needs its own user activation, which the
  //    failed login may have consumed), we flip the button to an explicit "Create a passkey"
  //    so the next tap starts a clean gesture. Login-first also means an existing user never
  //    accidentally creates a second account.
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
    } catch (loginErr) {
      console.error('[passkey] login failed:', loginErr);
      try {
        await signupWithPasskey();
        goApp();
      } catch (signupErr) {
        console.error('[passkey] signup failed:', signupErr);
        setCreateMode(true);
        toast.show('No passkey found on this device — tap “Create a passkey” to set one up.', {
          tone: 'neutral',
          duration: 4500,
        });
      }
    } finally {
      setPasskeyBusy(false);
    }
  }, [passkeyBusy, createMode, loginWithPasskey, signupWithPasskey, goApp, toast]);

  const passkeyLabel = passkeyBusy
    ? 'Waiting for your device…'
    : createMode
      ? 'Create a passkey'
      : 'Continue with a passkey';

  // Keep the design's UI/step values; replace the five money-path handlers with real auth.
  const authVals = useMemo(
    () => ({
      ...v,
      usePasskey: doPasskey,
      passkeyLabel,
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
    [v, doPasskey, passkeyLabel, doSendCode, doVerifyCode, doResendCode, cooldown, router],
  );

  return <AuthScreen v={authVals} />;
}
