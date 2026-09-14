'use client';

import { useCallback, useState } from 'react';
import { useSendTransaction } from '@privy-io/react-auth';
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

async function authedFetch(getToken: () => Promise<string | null>, url: string, init?: RequestInit) {
  const token = await getToken();
  return fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) },
  });
}

export function usePayment() {
  const { getAccessToken } = useAuth();
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
        const { authorizationId, prepared } = authData as {
          authorizationId: string;
          prepared: { to: string; data: string; value: string; chainId: number };
        };

        setStage('awaiting_signature');
        const sent = await sendTransaction({
          to: prepared.to,
          data: prepared.data,
          value: BigInt(prepared.value || '0'),
          chainId: prepared.chainId,
        });
        const txHash = (sent as { hash?: string; transactionHash?: string }).hash ?? (sent as { transactionHash?: string }).transactionHash;
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
        setStage('failed');
        return { status: 'failed', error: e instanceof Error ? e.message : 'Payment failed.' };
      }
    },
    [getAccessToken, sendTransaction],
  );

  return { pay, stage };
}
