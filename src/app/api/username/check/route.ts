import { NextResponse } from 'next/server';
import { withUser, errorResponse } from '@/lib/http';
import { validateUsername, usernameErrorMessage } from '@/lib/users/username';
import { isUsernameTaken } from '@/lib/users/service';

/**
 * Username availability check for onboarding. Requires a session (only signed-in users pick a
 * username, and it avoids anonymous enumeration). Returns validity + availability with a
 * message the UI can show inline.
 */
export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  const u = new URL(req.url).searchParams.get('u') ?? '';
  const formatError = validateUsername(u);
  if (formatError) {
    return NextResponse.json({ available: false, reason: formatError, message: usernameErrorMessage(formatError) });
  }
  try {
    const taken = await isUsernameTaken(u);
    return NextResponse.json({
      available: !taken,
      reason: taken ? 'taken' : null,
      message: taken ? 'That username is taken.' : 'Available',
    });
  } catch (e) {
    return errorResponse(e);
  }
}
