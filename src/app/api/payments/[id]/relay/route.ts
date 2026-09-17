import { NextResponse } from 'next/server';
import type { Hex } from 'viem';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { getWalletByUserId } from '@/lib/wallets/service';
import { getPayment, recordBroadcast, confirmPayment } from '@/lib/payments/engine';
import { relayTransfer, type TransferAuthorizationMessage } from '@/lib/relayer/service';
import { activeNetwork, features, txExplorerUrl } from '@/lib/config';

/**
 * Gasless settlement (§ EIP-3009). The client signed a transfer authorization; here the relayer
 * submits it on-chain and pays the gas. We re-validate the signed message against the
 * policy-authorized payment (from/to/value must match — never trust the client's copy), relay,
 * then record the broadcast (consuming the single-use authorization) and report the on-chain
 * status. Success is never claimed before confirmation.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  if (!features.gaslessRelayer) return jsonError(404, 'relayer_disabled');
  const { id } = await ctx.params;

  let body: { authorizationId?: unknown; message?: unknown; signature?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const authorizationId = typeof body.authorizationId === 'string' ? body.authorizationId : '';
  const signature = typeof body.signature === 'string' ? (body.signature as Hex) : null;
  const message = (body.message ?? null) as TransferAuthorizationMessage | null;
  if (!authorizationId || !signature || !message) return jsonError(400, 'missing_fields');

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const wallet = await getWalletByUserId(user.id);
    if (!wallet) return jsonError(409, 'wallet_pending');

    const payment = await getPayment(id, user.id);
    if (!payment) return jsonError(404, 'not_found');
    if (payment.status !== 'AUTHORIZED') return jsonError(409, 'not_authorized');

    // Authoritative re-check: the signed message must move exactly the authorized funds, from the
    // user's own wallet. The signature covers these fields, so a mismatch would revert on-chain
    // anyway — we reject before spending relayer gas.
    const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
    if (!same(message.from, wallet.address) || !same(message.to, payment.recipientAddress) || BigInt(message.value) !== BigInt(payment.amount)) {
      return jsonError(422, 'message_mismatch');
    }

    const { hash } = await relayTransfer({ message, signature });

    const rec = await recordBroadcast({ paymentId: id, userId: user.id, authorizationId, txHash: hash });
    if (!rec.ok) return jsonError(409, 'record_failed', { message: rec.error, txHash: hash });

    // Poll briefly for a fast confirmation; otherwise leave PENDING (client polls status).
    let status = 'PENDING';
    for (let i = 0; i < 5; i++) {
      const c = await confirmPayment({ paymentId: id, userId: user.id });
      if (c.ok) {
        status = c.payment.status;
        if (status === 'CONFIRMED' || status === 'FAILED') break;
      }
      await new Promise((r) => setTimeout(r, 2500));
    }

    return NextResponse.json({ ok: true, status, txHash: hash, explorerUrl: txExplorerUrl(hash), network: activeNetwork.name });
  } catch (e) {
    return errorResponse(e);
  }
}
