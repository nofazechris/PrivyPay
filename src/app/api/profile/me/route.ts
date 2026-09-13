import { NextResponse } from 'next/server';
import { withUser, errorResponse } from '@/lib/http';
import { getOrCreateUser, getProfileByUserId } from '@/lib/users/service';

/**
 * The authenticated user's profile. Ensures the internal user row exists (first sight after
 * Privy sign-in), then returns the profile or null. The client uses `profile === null` to send
 * a new user to onboarding.
 */
export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const profile = await getProfileByUserId(user.id);
    return NextResponse.json({
      userId: user.id,
      profile: profile ? { username: profile.username, displayName: profile.displayName } : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
