import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { cancelRecurring, setRecurringPaused } from '@/lib/recurring/service';

/**
 * Manage one recurring payment (§). PATCH pauses/resumes it ({paused: boolean}); DELETE cancels
 * it. Only the owner can change their own schedule.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  let body: { paused?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  if (typeof body.paused !== 'boolean') return jsonError(400, 'missing_fields');

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await setRecurringPaused(id, user.id, body.paused);
    if (!res.ok) return jsonError(404, res.error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const { id } = await ctx.params;

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const res = await cancelRecurring(id, user.id);
    if (!res.ok) return jsonError(404, res.error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
