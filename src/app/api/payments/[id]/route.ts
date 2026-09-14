import { NextResponse } from 'next/server';
import { formatUnits } from 'viem';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { confirmPayment } from '@/lib/payments/engine';
import { activeNetwork, getToken, txExplorerUrl } from '@/lib/config';

/**
 * Payment status (§86). Checks the on-chain receipt (settling PENDING → CONFIRMED/FAILED when
 * mined) and returns the current payment. The client polls this until a terminal state.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await confirmPayment({ paymentId: id, userId: user.id });
    if (!res.ok) return jsonError(404, 'not_found', { message: res.error });

    const p = res.payment;
    const decimals = getToken(p.token, activeNetwork.network)?.decimals ?? 6;
    return NextResponse.json({
      payment: {
        id: p.id,
        status: p.status,
        recipientAddress: p.recipientAddress,
        amount: formatUnits(BigInt(p.amount), decimals),
        token: p.token,
        network: activeNetwork.name,
        txHash: p.txHash,
        explorerUrl: p.txHash ? txExplorerUrl(p.txHash) : null,
        confirmedAt: p.confirmedAt,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
