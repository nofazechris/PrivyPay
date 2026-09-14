import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

/**
 * Payment authorization (§31, §46).
 *
 * An authorization is single-use, short-lived, and bound to every parameter of the payment it
 * approves. `consume` re-checks each field and marks the row used in the same conditional
 * UPDATE, so a $10 approval can never execute a $100 transfer, an approval can't be redirected
 * to another recipient, and it can't be replayed — a second consume finds nothing to update.
 */

const TTL_MS = 3 * 60 * 1000; // 3 minutes

export interface Binding {
  paymentId: string;
  userId: string;
  amount: string;
  recipientAddress: string;
  token: string;
  chainId: number;
}

export async function issueAuthorization(binding: Binding): Promise<{ id: string; expiresAt: Date }> {
  const db = getDb();
  const expiresAt = new Date(Date.now() + TTL_MS);
  const [row] = await db
    .insert(schema.authorizations)
    .values({
      paymentId: binding.paymentId,
      userId: binding.userId,
      amount: binding.amount,
      recipientAddress: binding.recipientAddress,
      token: binding.token,
      chainId: binding.chainId,
      expiresAt,
    })
    .returning({ id: schema.authorizations.id });
  return { id: row.id, expiresAt };
}

export type ConsumeResult = { ok: true } | { ok: false; reason: 'not_found' | 'expired' | 'already_used' | 'mismatch' };

/**
 * Verify an authorization against the exact payment being executed and consume it atomically.
 * Every bound field must match; the row must be unconsumed and unexpired.
 */
export async function consumeAuthorization(authorizationId: string, binding: Binding): Promise<ConsumeResult> {
  const db = getDb();
  const rows = await db.select().from(schema.authorizations).where(eq(schema.authorizations.id, authorizationId)).limit(1);
  const auth = rows[0];
  if (!auth) return { ok: false, reason: 'not_found' };
  if (auth.consumedAt) return { ok: false, reason: 'already_used' };
  if (auth.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };
  if (
    auth.paymentId !== binding.paymentId ||
    auth.userId !== binding.userId ||
    auth.amount !== binding.amount ||
    auth.recipientAddress.toLowerCase() !== binding.recipientAddress.toLowerCase() ||
    auth.token !== binding.token ||
    auth.chainId !== binding.chainId
  ) {
    return { ok: false, reason: 'mismatch' };
  }

  // Atomic single-use: only succeeds if still unconsumed. A concurrent consumer that got here
  // first leaves consumedAt set, so this UPDATE matches no rows.
  const updated = await db
    .update(schema.authorizations)
    .set({ consumedAt: new Date() })
    .where(and(eq(schema.authorizations.id, authorizationId), isNull(schema.authorizations.consumedAt)))
    .returning({ id: schema.authorizations.id });

  return updated.length === 1 ? { ok: true } : { ok: false, reason: 'already_used' };
}
