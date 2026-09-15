'use client';

import { useCallback, useState } from 'react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useAuth } from './AuthProvider';

/**
 * Client orchestration of a real USDC payment (§16). The engine (server) validates, applies
 * policy, issues a single-use authorization, records state and monitors confirmation; the
 * user's Privy embedded wallet signs and broadcasts here. The flow is:
 *
 *   preview → authorize → sign+broadcast (Privy) → record → poll until confirmed.
 *
 * No step reports success early — the final state comes from an on-chain receipt (§86). This
 * hook is what the AI agent (Stage 9) and the send UI drive.
 */

export type PayStage = 'idle' | 'preparing' | 'awaiting_signature' | 'pending' | 'confirmed' | 'failed';

export interface PayResult {
  status: 'confirmed' | 'failed' | 'pending';
  txHash?: string | null;
  explorerUrl?: string | null;
  error?: string;
}

/** True when an error means the wallet can't afford the transfer + gas (retrying won't help). */
function isInsufficientFunds(e: unknown): boolean {
  const s = (e instanceof Error ? `${e.message} ${e.name}` : String(e)).toLowerCase();
  return (
    s.includes('gas required exceeds allowance') ||
    s.includes('insufficient') ||
    s.includes('exceeds balance') ||
    s.includes('transfer amount exceeds')
  );
}

async function authedFetch(getToken: () => Promise<string | null>, url: string, init?: RequestInit) {
  const token = await getToken();
  return fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) },
  });
}

export function usePayment() {
  const { getAccessToken } = useAuth();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [stage, setStage] = useState<PayStage>('idle');

  const pay = useCallback(
    async (args: { recipient: string; amount: string; memo?: string }): Promise<PayResult> => {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}_${Math.random()}`;
      try {
        setStage('preparing');
        const previewRes = await authedFetch(getAccessToken, '/api/payments/preview', {
          method: 'POST',
          body: JSON.stringify({ recipient: args.recipient, amount: args.amount, memo: args.memo, idempotencyKey }),
        });
        const preview = await previewRes.json();
        if (!previewRes.ok) return { status: 'failed', error: preview.message ?? 'Could not prepare payment.' };
        const paymentId: string = preview.paymentId;

        const authRes = await authedFetch(getAccessToken, `/api/payments/${paymentId}/authorize`, { method: 'POST' });
        const authData = await authRes.json();
        if (!authRes.ok) return { status: 'failed', error: authData.message ?? 'Payment not authorized.' };
        const { authorizationId, prepared, from } = authData as {
          authorizationId: string;
          from: string;
          prepared: { to: string; data: string; value: string; feeCurrency: string; chainId: number };
        };

        // Sign with EXACTLY the wallet the server authorized (§80). A user can hold more than
        // one embedded wallet; signing with "the first one" can pick a different (empty) wallet
        // than the one policy validated, which reverts on-chain. Match by address.
        setStage('awaiting_signature');
        const want = from?.toLowerCase();
        const embedded =
          wallets.find((w) => w.address?.toLowerCase() === want) ??
          wallets.find((w) => w.walletClientType === 'privy');
        if (!embedded) return { status: 'failed', error: 'No wallet available to sign.' };
        if (want && embedded.address?.toLowerCase() !== want) {
          return {
            status: 'failed',
            error: 'Your account wallet isn’t available to sign in this browser. Sign out and back in, then retry.',
          };
        }
        // Sign + broadcast through Privy's own embedded-wallet API (§16). Privy populates gas,
        // nonce and fees, signs in its TEE, and broadcasts server-side — so this avoids both the
        // browser's forno 403 and viem's serialization mismatch with Privy's API, which rejects
        // a raw {to,data,value} tx (it wants its own `calls` format). Gas is paid in native CELO;
        // gas-in-USDC needs Celo's CIP-64 type, which Privy can't produce — that's the gasless-
        // relayer follow-up (§14). `showWalletUIs: false` keeps it headless (our "Confirm payment"
        // step is the sole authorization surface), and `address` pins the send to exactly the
        // wallet policy authorized (§80), never a stray second embedded wallet.
        const { hash: txHash } = await sendTransaction(
          {
            to: prepared.to,
            data: prepared.data,
            value: BigInt(prepared.value || '0'),
            chainId: prepared.chainId,
          },
          { address: embedded.address, uiOptions: { showWalletUIs: false } },
        );
        if (!txHash) return { status: 'failed', error: 'No transaction hash returned.' };

        await authedFetch(getAccessToken, `/api/payments/${paymentId}/broadcast`, {
          method: 'POST',
          body: JSON.stringify({ authorizationId, txHash }),
        });

        // Poll for confirmation.
        setStage('pending');
        for (let i = 0; i < 30; i++) {
          const statusRes = await authedFetch(getAccessToken, `/api/payments/${paymentId}`);
          const data = await statusRes.json();
          const status: string = data.payment?.status;
          if (status === 'CONFIRMED') {
            setStage('confirmed');
            return { status: 'confirmed', txHash, explorerUrl: data.payment.explorerUrl };
          }
          if (status === 'FAILED') {
            setStage('failed');
            return { status: 'failed', txHash, explorerUrl: data.payment.explorerUrl, error: 'Transaction failed on-chain.' };
          }
          await new Promise((r) => setTimeout(r, 2500));
        }
        // Still pending after polling — it will settle; the activity view reflects it later.
        return { status: 'pending', txHash };
      } catch (e) {
        console.error('[payment] failed:', e);
        setStage('failed');
        // Turn the common failures into plain language; the full error is in the console above.
        if (isInsufficientFunds(e)) {
          return { status: 'failed', error: 'Not enough USDC in your wallet to cover this payment.' };
        }
        const msg = e instanceof Error ? e.message : 'Payment failed.';
        return { status: 'failed', error: msg.length > 120 ? msg.slice(0, 117) + '…' : msg };
      }
    },
    [getAccessToken, wallets, sendTransaction],
  );

  return { pay, stage };
}
