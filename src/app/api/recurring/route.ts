import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { createRecurring, listRecurring } from '@/lib/recurring/service';

/**
 * Recurring payments (§). GET lists the caller's schedules; POST creates one to a PrivyPay user.
 * This persists the schedule only — automated execution is a later worker.
 */

function createErrorMessage(error: string): string {
  switch (error) {
    case 'invalid_amount':
      return 'Enter a valid amount.';
    case 'no_such_user':
      return 'No PrivyPay user with that username.';
    case 'cannot_pay_self':
      return "You can't schedule a payment to yourself.";
    default:
      return 'Could not create recurring payment.';
  }
}

export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const recurring = await listRecurring(user.id);
    return NextResponse.json({ recurring });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let body: { payee?: unknown; amount?: unknown; cadence?: unknown; memo?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const payee = typeof body.payee === 'string' ? body.payee : '';
  const amount = typeof body.amount === 'string' ? body.amount : '';
  const cadence = typeof body.cadence === 'string' ? body.cadence : '';
  const memo = typeof body.memo === 'string' ? body.memo : undefined;
  if (!payee || !amount) return jsonError(400, 'missing_fields', { message: 'Enter a username and amount.' });

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await createRecurring(user.id, { payeeUsername: payee, amount, cadence, memo });
    if (!res.ok) return jsonError(422, res.error, { message: createErrorMessage(res.error) });
    return NextResponse.json({ recurring: res.item });
  } catch (e) {
    return errorResponse(e);
  }
}
