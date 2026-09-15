import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { createRequest, listRequests } from '@/lib/requests/service';

/**
 * Payment requests (§). GET lists every request involving the caller (either side); POST creates
 * a new request asking a PrivyPay user to pay the caller.
 */

function createErrorMessage(error: string): string {
  switch (error) {
    case 'invalid_amount':
      return 'Enter a valid amount.';
    case 'no_such_user':
      return 'No PrivyPay user with that username.';
    case 'cannot_request_self':
      return "You can't request from yourself.";
    default:
      return 'Could not create request.';
  }
}

export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const requests = await listRequests(user.id);
    return NextResponse.json({ requests });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let body: { payer?: unknown; amount?: unknown; memo?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const payer = typeof body.payer === 'string' ? body.payer : '';
  const amount = typeof body.amount === 'string' ? body.amount : '';
  const memo = typeof body.memo === 'string' ? body.memo : undefined;
  if (!payer || !amount) return jsonError(400, 'missing_fields', { message: 'Enter a username and amount.' });

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await createRequest(user.id, { payerUsername: payer, amount, memo });
    if (!res.ok) return jsonError(422, res.error, { message: createErrorMessage(res.error) });
    return NextResponse.json({ request: res.request });
  } catch (e) {
    return errorResponse(e);
  }
}
