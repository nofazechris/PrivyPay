import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { formatUnits, parseUnits } from 'viem';
import { getDb, schema } from '@/lib/db';
import { activeNetwork, getToken } from '@/lib/config';
import { normalizeUsername } from '@/lib/users/username';
import { resolveUsername } from '@/lib/users/service';

/**
 * Recurring payments (§) — the schedule store. This persists a repeating payment (who, how much,
 * how often, and when it's next due) and lets the owner pause/resume/cancel it. Actual automated
 * execution is a later worker; nothing here moves funds. Amounts are the token's smallest unit.
 */

const TOKEN = 'USDC';
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function decimals(): number {
  return getToken(TOKEN, activeNetwork.network)?.decimals ?? 6;
}

/** Next due date from a human cadence label ("Every Friday", "Monthly", "Weekly", "Daily"). */
export function computeNextRun(cadence: string, from: Date = new Date()): Date {
  const c = cadence.toLowerCase();
  const d = new Date(from);
  const weekday = WEEKDAYS.findIndex((w) => c.includes(w));
  if (weekday >= 0) {
    let delta = (weekday - d.getDay() + 7) % 7;
    if (delta === 0) delta = 7; // the same weekday means next week, not today
    d.setDate(d.getDate() + delta);
  } else if (c.includes('month')) {
    d.setMonth(d.getMonth() + 1);
  } else if (c.includes('week')) {
    d.setDate(d.getDate() + 7);
  } else if (c.includes('day')) {
    d.setDate(d.getDate() + 1);
  } else {
    d.setDate(d.getDate() + 7); // sensible default: weekly
  }
  return d;
}

function formatNext(d: Date | null): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
}

export interface RecurringItem {
  id: string;
  counterparty: string;
  amount: string;
  cadence: string;
  next: string;
  paused: boolean;
  status: string;
}

export type CreateRecurringResult =
  | { ok: true; item: RecurringItem }
  | { ok: false; error: 'invalid_amount' | 'no_such_user' | 'cannot_pay_self' };

/** Create a recurring payment to `payeeUsername` for `amount` (decimal) on `cadence`. */
export async function createRecurring(
  ownerUserId: string,
  input: { payeeUsername: string; amount: string; cadence: string; memo?: string },
): Promise<CreateRecurringResult> {
  let amountRaw: bigint;
  try {
    amountRaw = parseUnits(input.amount, decimals());
  } catch {
    return { ok: false, error: 'invalid_amount' };
  }
  if (amountRaw <= BigInt(0)) return { ok: false, error: 'invalid_amount' };

  const resolved = await resolveUsername(normalizeUsername(input.payeeUsername));
  if (!resolved) return { ok: false, error: 'no_such_user' };
  if (resolved.user.id === ownerUserId) return { ok: false, error: 'cannot_pay_self' };

  const cadence = input.cadence?.trim() || 'Weekly';
  const nextRun = computeNextRun(cadence);
  const db = getDb();
  const [row] = await db
    .insert(schema.recurringPayments)
    .values({
      ownerUserId,
      payeeUserId: resolved.user.id,
      amount: amountRaw.toString(),
      token: TOKEN,
      chainId: activeNetwork.chainId,
      cadence,
      status: 'active',
      nextRun,
      memo: input.memo ?? null,
    })
    .returning();

  return {
    ok: true,
    item: {
      id: row.id,
      counterparty: '@' + resolved.profile.username,
      amount: formatUnits(BigInt(row.amount), decimals()),
      cadence: row.cadence,
      next: formatNext(row.nextRun),
      paused: row.status === 'paused',
      status: row.status,
    },
  };
}

/** The caller's recurring payments (active + paused), newest first. Cancelled ones are hidden. */
export async function listRecurring(ownerUserId: string): Promise<RecurringItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: schema.recurringPayments.id,
      amount: schema.recurringPayments.amount,
      cadence: schema.recurringPayments.cadence,
      status: schema.recurringPayments.status,
      nextRun: schema.recurringPayments.nextRun,
      payee: schema.profiles.username,
    })
    .from(schema.recurringPayments)
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.recurringPayments.payeeUserId))
    .where(eq(schema.recurringPayments.ownerUserId, ownerUserId))
    .orderBy(desc(schema.recurringPayments.createdAt));

  return rows
    .filter((r) => r.status !== 'cancelled')
    .map((r) => ({
      id: r.id,
      counterparty: '@' + r.payee,
      amount: formatUnits(BigInt(r.amount), decimals()),
      cadence: r.cadence,
      next: formatNext(r.nextRun),
      paused: r.status === 'paused',
      status: r.status,
    }));
}

export type RecurringMutateResult = { ok: true } | { ok: false; error: 'not_found' };

/** Pause or resume a recurring payment the caller owns. Resuming recomputes the next run. */
export async function setRecurringPaused(id: string, ownerUserId: string, paused: boolean): Promise<RecurringMutateResult> {
  const db = getDb();
  const rows = await db.select().from(schema.recurringPayments).where(eq(schema.recurringPayments.id, id)).limit(1);
  const row = rows[0];
  if (!row || row.ownerUserId !== ownerUserId || row.status === 'cancelled') return { ok: false, error: 'not_found' };
  await db
    .update(schema.recurringPayments)
    .set({ status: paused ? 'paused' : 'active', nextRun: paused ? row.nextRun : computeNextRun(row.cadence), updatedAt: new Date() })
    .where(eq(schema.recurringPayments.id, id));
  return { ok: true };
}

/** Cancel a recurring payment the caller owns. */
export async function cancelRecurring(id: string, ownerUserId: string): Promise<RecurringMutateResult> {
  const db = getDb();
  const rows = await db.select().from(schema.recurringPayments).where(eq(schema.recurringPayments.id, id)).limit(1);
  const row = rows[0];
  if (!row || row.ownerUserId !== ownerUserId) return { ok: false, error: 'not_found' };
  await db
    .update(schema.recurringPayments)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(schema.recurringPayments.id, id), eq(schema.recurringPayments.ownerUserId, ownerUserId)));
  return { ok: true };
}
