'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginWithEmail, useLoginWithPasskey, useSignupWithPasskey } from '@privy-io/react-auth';
import { useViewModel } from '@/lib/viewModel';
import { useToast } from '@/components/ui';
import AuthScreen from '@/components/screens/AuthScreen';

const EMAIL_RE = /.+@.+\..+/;

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

  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { loginWithPasskey } = useLoginWithPasskey();
  const { signupWithPasskey } = useSignupWithPasskey();

  const goApp = useCallback(() => router.replace('/app'), [router]);

  // Send the real OTP, then let the view model advance the UI to the code step.
  const doSendCode = useCallback(() => {
    if (!EMAIL_RE.test(v.email)) return;
    sendCode({ email: v.email }).catch(() => toast.show('Couldn’t send the code — check the address and try again.', { tone: 'danger' }));
    v.sendCode();
  }, [v, sendCode, toast]);

  const doVerifyCode = useCallback(async () => {
    if (!v.code || v.code.length < 6) return;
    try {
      await loginWithCode({ code: v.code });
      goApp();
    } catch {
      toast.show('That code didn’t work. Request a new one and try again.', { tone: 'danger' });
    }
  }, [v.code, loginWithCode, goApp, toast]);

  // Passkey: log in with an existing passkey, and if the user has none yet, create one
  // (register a new passkey + account). This is what lets a first-time user sign up with a
  // passkey rather than hitting a login that always fails for lack of a credential.
  const doPasskey = useCallback(async () => {
    if (passkeyBusy) return;
    setPasskeyBusy(true);
    try {
      await loginWithPasskey();
      goApp();
      return;
    } catch {
      // No usable passkey for this device/account — fall through to creating one.
    }
    try {
      await signupWithPasskey();
      goApp();
    } catch {
      toast.show('Passkey wasn’t completed. Try again, or use your email.', { tone: 'danger' });
    } finally {
      setPasskeyBusy(false);
    }
  }, [passkeyBusy, loginWithPasskey, signupWithPasskey, goApp, toast]);

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
      goLanding: () => router.push('/'),
    }),
    [v, doPasskey, passkeyBusy, doSendCode, doVerifyCode, router],
  );

  return <AuthScreen v={authVals} />;
}
