import 'server-only';
import { and, desc, eq, or } from 'drizzle-orm';
import { formatUnits, parseUnits } from 'viem';
import { getDb, schema } from '@/lib/db';
import { activeNetwork, getToken } from '@/lib/config';
import { normalizeUsername } from '@/lib/users/username';
import { resolveUsername } from '@/lib/users/service';

/**
 * Payment requests (§ money you ask for / money asked of you).
 *
 * A request is one user asking another PrivyPay user to pay them. The payer must be a real user
 * (resolved at create time), so a pending request can always be fulfilled through the payment
 * engine. Paying a request is a normal on-chain payment to the requester; `markPaid` then links
 * that payment and flips the status. Amounts are stored in the token's smallest unit as a string.
 */

const TOKEN = 'USDC';

function decimals(): number {
  return getToken(TOKEN, activeNetwork.network)?.decimals ?? 6;
}

export interface RequestItem {
  id: string;
  /** 'incoming' = someone asked YOU to pay; 'outgoing' = YOU asked someone. */
  direction: 'incoming' | 'outgoing';
  /** The other party's @username. */
  counterparty: string;
  /** Decimal amount string, e.g. "20". */
  amount: string;
  memo: string | null;
  status: string;
  /** True when this is an incoming request you can still pay. */
  payable: boolean;
  createdAt: string;
}

export type CreateRequestResult =
  | { ok: true; request: RequestItem }
  | { ok: false; error: 'invalid_amount' | 'no_such_user' | 'cannot_request_self' };

/** Create a request asking `payerUsername` to pay the caller `amount` (decimal string). */
export async function createRequest(
  requesterUserId: string,
  input: { payerUsername: string; amount: string; memo?: string },
): Promise<CreateRequestResult> {
  let amountRaw: bigint;
  try {
    amountRaw = parseUnits(input.amount, decimals());
  } catch {
    return { ok: false, error: 'invalid_amount' };
  }
  if (amountRaw <= BigInt(0)) return { ok: false, error: 'invalid_amount' };

  const resolved = await resolveUsername(normalizeUsername(input.payerUsername));
  if (!resolved) return { ok: false, error: 'no_such_user' };
  if (resolved.user.id === requesterUserId) return { ok: false, error: 'cannot_request_self' };

  const db = getDb();
  const [row] = await db
    .insert(schema.requests)
    .values({
      requesterUserId,
      payerUserId: resolved.user.id,
      amount: amountRaw.toString(),
      token: TOKEN,
      chainId: activeNetwork.chainId,
      memo: input.memo ?? null,
      status: 'PENDING',
    })
    .returning();

  return {
    ok: true,
    request: {
      id: row.id,
      direction: 'outgoing',
      counterparty: '@' + resolved.profile.username,
      amount: formatUnits(BigInt(row.amount), decimals()),
      memo: row.memo,
      status: row.status,
      payable: false,
      createdAt: row.createdAt.toISOString(),
    },
  };
}

/** All requests involving the caller (either side), newest first. */
export async function listRequests(userId: string): Promise<RequestItem[]> {
  const db = getDb();
  const requester = schema.users;
  // Join both parties' usernames so we can show the counterparty handle regardless of direction.
  const rows = await db
    .select({
      id: schema.requests.id,
      requesterUserId: schema.requests.requesterUserId,
      payerUserId: schema.requests.payerUserId,
      amount: schema.requests.amount,
      memo: schema.requests.memo,
      status: schema.requests.status,
      createdAt: schema.requests.createdAt,
      requesterName: schema.profiles.username,
    })
    .from(schema.requests)
    .innerJoin(requester, eq(requester.id, schema.requests.requesterUserId))
    .innerJoin(schema.profiles, eq(schema.profiles.userId, schema.requests.requesterUserId))
    .where(or(eq(schema.requests.requesterUserId, userId), eq(schema.requests.payerUserId, userId)))
    .orderBy(desc(schema.requests.createdAt));

  // For counterparty display we need the other party's username. We joined the requester's
  // profile above; look up payer usernames in a second pass to keep the query simple.
  const payerIds = [...new Set(rows.filter((r) => r.requesterUserId === userId).map((r) => r.payerUserId))];
  const payerNames = new Map<string, string>();
  if (payerIds.length) {
    const pn = await db
      .select({ userId: schema.profiles.userId, username: schema.profiles.username })
      .from(schema.profiles)
      .where(or(...payerIds.map((id) => eq(schema.profiles.userId, id))));
    for (const p of pn) payerNames.set(p.userId, p.username);
  }

  return rows.map((r) => {
    const outgoing = r.requesterUserId === userId;
    const counterparty = outgoing ? (payerNames.get(r.payerUserId) ?? '') : r.requesterName;
    return {
      id: r.id,
      direction: outgoing ? ('outgoing' as const) : ('incoming' as const),
      counterparty: '@' + counterparty,
      amount: formatUnits(BigInt(r.amount), decimals()),
      memo: r.memo,
      status: r.status,
      payable: !outgoing && r.status === 'PENDING',
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export type PayRequestResult = { ok: true } | { ok: false; error: 'not_found' | 'not_payable' };

/**
 * Mark a request paid, linking the payment that fulfilled it. Only the payer can do this, and
 * only while the request is still PENDING (idempotent-safe: a second call finds it not payable).
 */
export async function markRequestPaid(
  requestId: string,
  payerUserId: string,
  paymentId: string | null,
): Promise<PayRequestResult> {
  const db = getDb();
  const rows = await db.select().from(schema.requests).where(eq(schema.requests.id, requestId)).limit(1);
  const req = rows[0];
  if (!req || req.payerUserId !== payerUserId) return { ok: false, error: 'not_found' };
  if (req.status !== 'PENDING') return { ok: false, error: 'not_payable' };

  await db
    .update(schema.requests)
    .set({ status: 'PAID', paidAt: new Date(), paymentId: paymentId ?? null })
    .where(and(eq(schema.requests.id, requestId), eq(schema.requests.status, 'PENDING')));
  return { ok: true };
}

/** Cancel an outgoing request the caller created (while still pending). */
export async function cancelRequest(requestId: string, requesterUserId: string): Promise<PayRequestResult> {
  const db = getDb();
  const rows = await db.select().from(schema.requests).where(eq(schema.requests.id, requestId)).limit(1);
  const req = rows[0];
  if (!req || req.requesterUserId !== requesterUserId) return { ok: false, error: 'not_found' };
  if (req.status !== 'PENDING') return { ok: false, error: 'not_payable' };
  await db.update(schema.requests).set({ status: 'CANCELLED', cancelledAt: new Date() }).where(eq(schema.requests.id, requestId));
  return { ok: true };
}
