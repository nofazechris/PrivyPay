import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { recordBroadcast } from '@/lib/payments/engine';

/**
 * Record that the client broadcast the signed transaction (§17). Consumes the single-use
 * authorization (bound to this payment) and moves the payment to PENDING with its tx hash. The
 * payment is not "successful" here — confirmation is only granted by an on-chain receipt (§86),
 * polled via GET /api/payments/[id].
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  let body: { authorizationId?: unknown; txHash?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const authorizationId = typeof body.authorizationId === 'string' ? body.authorizationId : '';
  const txHash = typeof body.txHash === 'string' ? body.txHash : '';
  if (!authorizationId || !txHash) return jsonError(400, 'missing_fields');

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await recordBroadcast({ paymentId: id, userId: user.id, authorizationId, txHash });
    if (!res.ok) return jsonError(422, 'broadcast_failed', { message: res.error });
    return NextResponse.json({ payment: { id: res.payment.id, status: res.payment.status, txHash: res.payment.txHash } });
  } catch (e) {
    return errorResponse(e);
  }
}
