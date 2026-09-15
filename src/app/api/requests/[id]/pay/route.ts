import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { markRequestPaid } from '@/lib/requests/service';

/**
 * Mark a received request as paid (§). The USDC has already moved through the payment engine
 * client-side; this records the fulfilling payment and flips the request to PAID. Only the payer
 * (the caller) can settle their own pending request.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  let body: { paymentId?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const paymentId = typeof body.paymentId === 'string' ? body.paymentId : null;

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await markRequestPaid(id, user.id, paymentId);
    if (!res.ok) return jsonError(res.error === 'not_found' ? 404 : 409, res.error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
