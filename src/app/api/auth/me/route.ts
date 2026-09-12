import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/server';

/**
 * Returns the authenticated user for the current request, or 401.
 *
 * The first real protected endpoint and the pattern every later API route follows: verify the
 * session server-side with `getSessionUser`, never trust the client. Payment and wallet routes
 * (Stages 5–8) gate on the same check.
 */
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ userId: user.userId });
}
