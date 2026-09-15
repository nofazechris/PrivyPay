import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { normalizeUsername, validateUsername, type UsernameError } from './username';

/**
 * User + profile service (§9, §23, §35).
 *
 * The database-backed half of the username system: map a Privy identity to an internal user,
 * create the username (format-validated here, uniqueness enforced by the DB), and resolve a
 * username back to a user for payment recipient resolution. Uniqueness is guarded by the
 * `profiles_username_uq` index — the create path catches the unique violation rather than
 * racing a pre-check, so two simultaneous claims can never both win.
 */

export interface AppUser {
  id: string;
  privyDid: string;
  email: string | null;
}

export interface Profile {
  userId: string;
  username: string;
  displayName: string | null;
}

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = '23505';

/** Get the internal user for a Privy DID, creating it on first sight (§35). */
export async function getOrCreateUser(privyDid: string, email?: string | null): Promise<AppUser> {
  const db = getDb();
  const existing = await db.select().from(schema.users).where(eq(schema.users.privyDid, privyDid)).limit(1);
  if (existing.length > 0) {
    const u = existing[0];
    return { id: u.id, privyDid: u.privyDid, email: u.email };
  }
  const inserted = await db
    .insert(schema.users)
    .values({ privyDid, email: email ?? null })
    // If another request created it concurrently, fall back to the existing row.
    .onConflictDoNothing({ target: schema.users.privyDid })
    .returning();
  if (inserted.length > 0) {
    const u = inserted[0];
    return { id: u.id, privyDid: u.privyDid, email: u.email };
  }
  const again = await db.select().from(schema.users).where(eq(schema.users.privyDid, privyDid)).limit(1);
  const u = again[0];
  return { id: u.id, privyDid: u.privyDid, email: u.email };
}

/** Look up an internal user by id (e.g. to reach their Privy DID for server-side wallet ops). */
export async function getUserById(userId: string): Promise<AppUser | null> {
  const db = getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (rows.length === 0) return null;
  const u = rows[0];
  return { id: u.id, privyDid: u.privyDid, email: u.email };
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const db = getDb();
  const rows = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)).limit(1);
  if (rows.length === 0) return null;
  const p = rows[0];
  return { userId: p.userId, username: p.username, displayName: p.displayName };
}

/** True if a username is already claimed (case-insensitive, via normalization). */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const db = getDb();
  const name = normalizeUsername(username);
  const rows = await db.select({ userId: schema.profiles.userId }).from(schema.profiles).where(eq(schema.profiles.username, name)).limit(1);
  return rows.length > 0;
}

export type CreateProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; error: UsernameError | 'taken' | 'already_has_profile' };

/** Create the caller's profile with a username. Format-validated; uniqueness enforced by the DB. */
export async function createProfile(userId: string, rawUsername: string): Promise<CreateProfileResult> {
  const formatError = validateUsername(rawUsername);
  if (formatError) return { ok: false, error: formatError };
  const username = normalizeUsername(rawUsername);
  const db = getDb();

  const existingProfile = await getProfileByUserId(userId);
  if (existingProfile) return { ok: false, error: 'already_has_profile' };

  try {
    const inserted = await db.insert(schema.profiles).values({ userId, username }).returning();
    const p = inserted[0];
    return { ok: true, profile: { userId: p.userId, username: p.username, displayName: p.displayName } };
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === UNIQUE_VIOLATION) {
      return { ok: false, error: 'taken' };
    }
    throw e;
  }
}

/** Resolve @username → user + profile, for payment recipient resolution (§23). */
export async function resolveUsername(rawUsername: string): Promise<{ user: AppUser; profile: Profile } | null> {
  const db = getDb();
  const username = normalizeUsername(rawUsername);
  const rows = await db
    .select({
      id: schema.users.id,
      privyDid: schema.users.privyDid,
      email: schema.users.email,
      username: schema.profiles.username,
      displayName: schema.profiles.displayName,
    })
    .from(schema.profiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.profiles.userId))
    .where(eq(schema.profiles.username, username))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    user: { id: r.id, privyDid: r.privyDid, email: r.email },
    profile: { userId: r.id, username: r.username, displayName: r.displayName },
  };
}
