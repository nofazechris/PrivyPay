import { NextResponse } from 'next/server';
import { withUser, errorResponse } from '@/lib/http';
import { getOrCreateUser, getProfileByUserId } from '@/lib/users/service';
import { getWalletByUserId, syncWallet } from '@/lib/wallets/service';

/**
 * The authenticated user's profile + wallet. Ensures the internal user row exists (first sight
 * after Privy sign-in), returns the profile (or null → onboarding), and the provisioned Celo
 * wallet address. To avoid a Privy API call on every load, the wallet is synced from Privy only
 * when we don't already have it stored.
 */
export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const [profile, stored] = await Promise.all([getProfileByUserId(user.id), getWalletByUserId(user.id)]);
    const wallet = stored ?? (await syncWallet(user.id, auth.user.userId));
    return NextResponse.json({
      userId: user.id,
      profile: profile ? { username: profile.username, displayName: profile.displayName } : null,
      wallet: wallet ? { address: wallet.address, chainId: wallet.chainId } : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
