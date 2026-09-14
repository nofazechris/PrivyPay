import { NextResponse } from 'next/server';
import { withUser, errorResponse } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { listPayments } from '@/lib/payments/engine';

/**
 * The signed-in user's payments, newest first — the real data behind the activity view (§75),
 * replacing the demo transactions.
 */
export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const payments = await listPayments(user.id);
    return NextResponse.json({ payments });
  } catch (e) {
    return errorResponse(e);
  }
}
