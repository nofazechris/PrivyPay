import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { normalizeUsername, validateUsername, type UsernameError } from '@/lib/users/username';
import { resolveUsername } from '@/lib/users/service';

/**
 * Contacts service (§11 — the people a user pays by username).
 *
 * A contact is an explicit entry a user adds to their own list — distinct from payment history.
 * Every contact must be a real PrivyPay user (resolved at add time), so a saved @username always
 * points at someone who can receive a payment. Uniqueness per owner is guarded by the
 * `contacts_owner_username_uq` index; re-adding the same person is caught as `already_added`.
 */

export interface Contact {
  username: string;
  displayName: string | null;
}

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = '23505';

/** The caller's contacts, newest first. */
export async function listContacts(ownerUserId: string): Promise<Contact[]> {
  const db = getDb();
  const rows = await db
    .select({ username: schema.contacts.username, displayName: schema.contacts.displayName })
    .from(schema.contacts)
    .where(eq(schema.contacts.ownerUserId, ownerUserId))
    .orderBy(desc(schema.contacts.createdAt));
  return rows.map((r) => ({ username: r.username, displayName: r.displayName }));
}

export type AddContactResult =
  | { ok: true; contact: Contact }
  | { ok: false; error: UsernameError | 'no_such_user' | 'cannot_add_self' | 'already_added' };

/**
 * Add a PrivyPay user to the caller's contacts by @username. Validates the format, requires the
 * user to exist, and forbids adding yourself. Idempotent on (owner, username).
 */
export async function addContact(ownerUserId: string, rawUsername: string): Promise<AddContactResult> {
  const formatError = validateUsername(rawUsername);
  if (formatError) return { ok: false, error: formatError };
  const username = normalizeUsername(rawUsername);

  const resolved = await resolveUsername(username);
  if (!resolved) return { ok: false, error: 'no_such_user' };
  if (resolved.user.id === ownerUserId) return { ok: false, error: 'cannot_add_self' };

  const db = getDb();
  try {
    const inserted = await db
      .insert(schema.contacts)
      .values({
        ownerUserId,
        contactUserId: resolved.user.id,
        username: resolved.profile.username,
        displayName: resolved.profile.displayName,
      })
      .returning();
    const c = inserted[0];
    return { ok: true, contact: { username: c.username, displayName: c.displayName } };
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === UNIQUE_VIOLATION) {
      return { ok: false, error: 'already_added' };
    }
    throw e;
  }
}

/** Remove a contact by username. No error if it wasn't there. */
export async function removeContact(ownerUserId: string, rawUsername: string): Promise<void> {
  const db = getDb();
  const username = normalizeUsername(rawUsername);
  await db
    .delete(schema.contacts)
    .where(and(eq(schema.contacts.ownerUserId, ownerUserId), eq(schema.contacts.username, username)));
}
