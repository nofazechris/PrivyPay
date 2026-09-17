import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { getWalletByUserId } from '@/lib/wallets/service';
import { authorizePayment } from '@/lib/payments/engine';
import { features } from '@/lib/config';
import { buildTransferAuthorization } from '@/lib/relayer/service';

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

    // When the gasless relayer is enabled, also return EIP-3009 typed data. The client signs it
    // (no gas) and posts the signature to /relay; the relayer submits and pays gas. When it's
    // absent, the client falls back to signing + broadcasting the prepared tx itself (native gas).
    const relay = features.gaslessRelayer
      ? await buildTransferAuthorization({ from: res.from, to: res.recipient, valueRaw: res.amountRaw })
      : null;

    return NextResponse.json({
      authorizationId: res.authorizationId,
      // The exact wallet the client must sign with — the one policy checked and authorized.
      from: res.from,
      prepared: {
        to: res.prepared.to,
        data: res.prepared.data,
        feeCurrency: res.prepared.feeCurrency,
        value: '0',
        chainId: res.prepared.chainId,
      },
      relay,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
