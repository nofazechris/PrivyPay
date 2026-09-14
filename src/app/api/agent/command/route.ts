import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { resolveUsername } from '@/lib/users/service';
import { extractIntent } from '@/lib/agent/llm';
import { normalizeUsername } from '@/lib/users/username';

/**
 * The AI agent's command endpoint (§24–28, §44). Turns a natural-language message into a
 * validated structured intent and, for a payment, resolves the recipient — but executes
 * nothing. Money still flows only through preview → authorization → the payment engine, driven
 * by the client after the user confirms (§25, §31). This is also the surface MCP and the
 * external channels (Stages 14–17) call.
 */
export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let message = '';
  try {
    const body = (await req.json()) as { message?: unknown };
    if (typeof body.message === 'string') message = body.message;
  } catch {
    return jsonError(400, 'invalid_body');
  }
  if (!message.trim()) return jsonError(400, 'empty_message');

  try {
    await getOrCreateUser(auth.user.userId);
    const intent = await extractIntent(message);

    let recipient: { handle: string; name: string; exists: boolean } | null = null;
    if (intent.type === 'SEND_PAYMENT' || intent.type === 'REQUEST_PAYMENT') {
      const raw = typeof intent.parameters.recipient === 'string' ? intent.parameters.recipient : '';
      if (raw) {
        const username = normalizeUsername(raw);
        const resolved = await resolveUsername(username);
        recipient = {
          handle: '@' + username,
          name: resolved?.profile.username ? '@' + resolved.profile.username : '@' + username,
          exists: Boolean(resolved),
        };
      }
    }

    return NextResponse.json({ intent, recipient });
  } catch (e) {
    return errorResponse(e);
  }
}
