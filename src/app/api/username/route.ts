import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser, createProfile } from '@/lib/users/service';
import { usernameErrorMessage } from '@/lib/users/username';

/**
 * Claim a username for the authenticated user (§9). Format is validated and uniqueness is
 * enforced by the database, so concurrent claims can't both succeed.
 */
export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, 'invalid_body');
  }
  const username = typeof (body as { username?: unknown })?.username === 'string' ? (body as { username: string }).username : '';
  if (!username) return jsonError(400, 'username_required');

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const result = await createProfile(user.id, username);
    if (!result.ok) {
      const message =
        result.error === 'taken'
          ? 'That username is taken.'
          : result.error === 'already_has_profile'
            ? 'You already have a username.'
            : usernameErrorMessage(result.error);
      return jsonError(409, result.error, { message });
    }
    return NextResponse.json({ profile: { username: result.profile.username } }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
