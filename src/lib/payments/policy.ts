import 'server-only';
import { and, eq, gte, inArray } from 'drizzle-orm';
import { parseUnits } from 'viem';
import { activeNetwork, getToken } from '@/lib/config';
import { getUsdcBalance } from '@/lib/celo/balance';
import { getDb, schema } from '@/lib/db';
import type { PolicyCheck, PolicyResult } from '@/lib/policy';

/**
 * Payment policy engine (§30). Runs an ordered set of checks; the first failure denies. No
 * payment executes unless every check passes. Amounts are compared in the token's smallest
 * unit as BigInts — never floats.
 */

// Per-payment and rolling daily caps (§32/§69). Conservative defaults; per-user config later.
// The daily cap matters most for the delegated/agent path, where a payment can settle without
// the user tapping each one.
const PER_PAYMENT_CAP_USDC = '500';
const DAILY_CAP_USDC = '1000';

// Statuses that represent a committed same-day outflow counting toward the daily cap.
const COMMITTED_STATUSES = ['AUTHORIZED', 'PREPARING', 'SIGNING', 'BROADCASTING', 'PENDING', 'CONFIRMED'];

export interface PaymentPolicyContext {
  /** Internal sender user id, for the rolling daily-cap check. Omit to skip that check. */
  senderUserId?: string;
  senderWalletAddress: string;
  recipientAddress: string;
  token: string;
  /** Amount in the token's smallest unit (decimal string), matching the stored payment. */
  amountRaw: string;
}

/** Sum of the sender's committed payments since the start of the current UTC day, smallest unit. */
async function spentTodayRaw(senderUserId: string): Promise<bigint> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const db = getDb();
  const rows = await db
    .select({ amount: schema.payments.amount })
    .from(schema.payments)
    .where(
      and(
        eq(schema.payments.senderUserId, senderUserId),
        gte(schema.payments.createdAt, start),
        inArray(schema.payments.status, COMMITTED_STATUSES),
      ),
    );
  return rows.reduce((sum, r) => sum + BigInt(r.amount), BigInt(0));
}

function deny(check: PolicyCheck, reason: string): PolicyResult {
  return { effect: 'DENY', failedCheck: check, reason };
}

export async function evaluatePaymentPolicy(ctx: PaymentPolicyContext): Promise<PolicyResult> {
  const token = getToken(ctx.token, activeNetwork.network);
  if (!token || !token.enabled) return deny('supported_token', 'Unsupported token.');

  let amount: bigint;
  try {
    amount = BigInt(ctx.amountRaw);
  } catch {
    return deny('valid_amount', 'Invalid amount.');
  }
  if (amount <= BigInt(0)) return deny('valid_amount', 'Amount must be greater than zero.');

  const cap = parseUnits(PER_PAYMENT_CAP_USDC, token.decimals);
  if (amount > cap) return deny('transaction_limits', `Amount exceeds the per-payment limit of $${PER_PAYMENT_CAP_USDC}.`);

  // Rolling daily cap — total committed today plus this payment must stay within the limit.
  if (ctx.senderUserId) {
    const dailyCap = parseUnits(DAILY_CAP_USDC, token.decimals);
    const spent = await spentTodayRaw(ctx.senderUserId);
    if (spent + amount > dailyCap) {
      return deny('transaction_limits', `This would exceed your daily limit of $${DAILY_CAP_USDC}.`);
    }
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(ctx.recipientAddress)) return deny('valid_recipient', 'Invalid recipient address.');

  // Sufficient balance — read on-chain, never a cached/faked figure (§21–22).
  const balance = await getUsdcBalance(ctx.senderWalletAddress);
  if (!balance) return deny('supported_token', 'Unable to read balance.');
  if (BigInt(balance.raw) < amount) return deny('sufficient_balance', 'Insufficient balance.');

  return { effect: 'ALLOW' };
}
