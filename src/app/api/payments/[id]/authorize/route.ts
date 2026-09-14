import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { getWalletByUserId } from '@/lib/wallets/service';
import { authorizePayment } from '@/lib/payments/engine';

/**
 * Authorize a previewed payment (§31, §46). Runs the policy engine and, on ALLOW, issues a
 * single-use authorization bound to this exact payment. The client signs and broadcasts the
 * returned prepared transaction, then reports the hash to /broadcast with this authorization.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const wallet = await getWalletByUserId(user.id);
    if (!wallet) return jsonError(409, 'wallet_pending');

    const res = await authorizePayment({ paymentId: id, userId: user.id, senderWalletAddress: wallet.address });
    if (!res.ok) return jsonError(422, 'authorize_failed', { message: res.error });

    return NextResponse.json({
      authorizationId: res.authorizationId,
      prepared: {
        to: res.prepared.to,
        data: res.prepared.data,
        feeCurrency: res.prepared.feeCurrency,
        value: '0',
        chainId: res.prepared.chainId,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
