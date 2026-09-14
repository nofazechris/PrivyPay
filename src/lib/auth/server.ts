import 'server-only';
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { env } from '@/lib/config';

/**
 * Server-side authentication (§46, §79).
 *
 * The authoritative check that a request belongs to a signed-in user. API routes call
 * {@link getSessionUser} (or {@link requireSessionUser}) rather than trusting anything from the
 * client. The access token is verified cryptographically by Privy — a forged or expired token
 * is rejected. `server-only` guarantees this module (and the app secret it uses) can never be
 * imported into client code.
 */

export interface SessionUser {
  /** Privy DID — the stable id the database keys users on. */
  userId: string;
}

let client: PrivyClient | null = null;

/** Lazily build the Privy client; returns null when auth is not configured. */
function getClient(): PrivyClient | null {
  if (client) return client;
  const appId = env.PRIVY_APP_ID;
  const appSecret = env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) return null;
  client = new PrivyClient(appId, appSecret);
  return client;
}

/** The user's Privy embedded EVM wallet address, or null if none is provisioned yet. */
export async function getPrivyEmbeddedWallet(
  privyDid: string,
): Promise<{ address: string; walletId: string | null } | null> {
  const privy = getClient();
  if (!privy) return null;
  const user = await privy.getUser(privyDid);
  const wallet = user.linkedAccounts.find(
    (a) => a.type === 'wallet' && a.walletClientType === 'privy' && a.chainType === 'ethereum',
  );
  if (!wallet || !('address' in wallet) || typeof wallet.address !== 'string') return null;
  const walletId = 'id' in wallet && typeof wallet.id === 'string' ? wallet.id : null;
  return { address: wallet.address, walletId };
}

/**
 * Extract the access token from a request: `Authorization: Bearer …` first (how the client
 * attaches it to API calls), falling back to the `privy-token` cookie for same-origin
 * requests.
 */
async function readToken(req?: Request): Promise<string | null> {
  const header = req?.headers.get('authorization') ?? req?.headers.get('Authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim() || null;
  }
  try {
    const store = await cookies();
    return store.get('privy-token')?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the signed-in user for a request, or null if unauthenticated / unconfigured.
 * Never throws — callers decide how to handle the null case.
 */
export async function getSessionUser(req?: Request): Promise<SessionUser | null> {
  const privy = getClient();
  if (!privy) return null;
  const token = await readToken(req);
  if (!token) return null;
  try {
    const claims = await privy.verifyAuthToken(token);
    return { userId: claims.userId };
  } catch {
    // Invalid, expired or tampered token — treat as unauthenticated.
    return null;
  }
}

/** Like {@link getSessionUser} but throws a 401-shaped error when unauthenticated. */
export async function requireSessionUser(req?: Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}
