import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { getWalletByUserId } from '@/lib/wallets/service';
import { previewPayment } from '@/lib/payments/engine';
import { activeNetwork } from '@/lib/config';

/**
 * Create a payment preview (§16, §45). Resolves the recipient, validates, and records a payment
 * in PREVIEW — but authorizes nothing. The response carries the prepared transaction the
 * client will sign only after the user confirms and the payment is authorized.
 */
export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let body: { recipient?: unknown; amount?: unknown; memo?: unknown; idempotencyKey?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const recipient = typeof body.recipient === 'string' ? body.recipient : '';
  const amount = typeof body.amount === 'string' ? body.amount : '';
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
  const memo = typeof body.memo === 'string' ? body.memo : undefined;
  if (!recipient || !amount || !idempotencyKey) return jsonError(400, 'missing_fields');

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const wallet = await getWalletByUserId(user.id);
    if (!wallet) return jsonError(409, 'wallet_pending', { message: 'Your wallet is still being set up.' });

    const res = await previewPayment({
      senderUserId: user.id,
      senderWalletAddress: wallet.address,
      recipient,
      amount,
      memo,
      idempotencyKey,
    });
    if (!res.ok) return jsonError(422, 'preview_failed', { message: res.error });

    const { payment, prepared, recipientDisplay } = res.result;
    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      preview: { recipient: recipientDisplay, amount, token: payment.token, network: activeNetwork.name },
      prepared: {
        to: prepared.to,
        data: prepared.data,
        feeCurrency: prepared.feeCurrency,
        value: '0',
        chainId: prepared.chainId,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
