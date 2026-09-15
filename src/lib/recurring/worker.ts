import 'server-only';
import { formatUnits } from 'viem';
import { activeNetwork, getToken } from '@/lib/config';
import { getWalletByUserId } from '@/lib/wallets/service';
import { previewPayment, authorizePayment, executeAuthorizedPayment } from '@/lib/payments/engine';
import { advanceRecurring, listDueRecurring } from './service';

/**
 * Recurring execution worker (§ recurring). Runs due schedules — a scheduled trigger (cron) hits
 * the protected /api/cron/recurring endpoint, which calls this. Each due schedule goes through the
 * SAME path as any payment: preview → policy + single-use authorization → delegated server signing
 * (Privy TEE) → on-chain confirmation. Nothing here holds a key.
 *
 * Safe by design:
 * - A deterministic per-period idempotency key (`recurring_<id>_<dueEpoch>`) means a re-run or
 *   crash can never double-pay: previewPayment returns the same payment for the same key.
 * - Owners who haven't delegated (or when server signing isn't configured) are SKIPPED, not
 *   failed — the schedule waits until they enable agent payments.
 * - nextRun advances only after a successful settlement, computed from now so missed periods don't
 *   stack into a catch-up storm.
 */

const TOKEN = 'USDC';

function decimals(): number {
  return getToken(TOKEN, activeNetwork.network)?.decimals ?? 6;
}

export interface RecurringRunResult {
  due: number;
  executed: number;
  skipped: number;
  failed: number;
  details: Array<{ id: string; result: string; reason?: string; status?: string; txHash?: string | null }>;
}

/** Process all due recurring schedules (bounded by `limit`). */
export async function runDueRecurring(limit = 50): Promise<RecurringRunResult> {
  const due = await listDueRecurring(limit);
  const out: RecurringRunResult = { due: due.length, executed: 0, skipped: 0, failed: 0, details: [] };

  for (const s of due) {
    const skip = (reason: string) => {
      out.skipped++;
      out.details.push({ id: s.id, result: 'skipped', reason });
    };
    const fail = (reason: string) => {
      out.failed++;
      out.details.push({ id: s.id, result: 'failed', reason });
    };

    const wallet = await getWalletByUserId(s.ownerUserId);
    if (!wallet) {
      skip('no_wallet');
      continue;
    }

    const amount = formatUnits(BigInt(s.amountRaw), decimals());
    // Deterministic per-period key — the guard against double-paying the same occurrence.
    const idempotencyKey = `recurring_${s.id}_${s.nextRun.getTime()}`;

    const preview = await previewPayment({
      senderUserId: s.ownerUserId,
      senderWalletAddress: wallet.address,
      recipient: '@' + s.payeeUsername,
      amount,
      memo: 'Recurring payment',
      idempotencyKey,
    });
    if (!preview.ok) {
      fail(preview.error);
      continue;
    }

    const p = preview.result.payment;
    // This occurrence already settled (idempotent replay) — just advance.
    if (p.status === 'CONFIRMED' || p.status === 'PENDING' || p.status === 'BROADCASTING') {
      await advanceRecurring(s.id);
      out.executed++;
      out.details.push({ id: s.id, result: 'already_settled', status: p.status });
      continue;
    }
    // A prior attempt left it AUTHORIZED/FAILED — leave it for attention rather than blind retry.
    if (p.status !== 'PREVIEW') {
      skip(`stuck_${p.status}`);
      continue;
    }

    const auth = await authorizePayment({ paymentId: p.id, userId: s.ownerUserId, senderWalletAddress: wallet.address });
    if (!auth.ok) {
      fail(auth.error); // policy denial (e.g. daily cap / insufficient balance) — retried next run
      continue;
    }

    const exec = await executeAuthorizedPayment({ paymentId: p.id, userId: s.ownerUserId, authorizationId: auth.authorizationId });
    if (exec.ok) {
      await advanceRecurring(s.id);
      out.executed++;
      out.details.push({ id: s.id, result: 'executed', status: exec.status, txHash: exec.txHash });
    } else if (exec.code === 'not_delegated' || exec.code === 'not_configured') {
      skip(exec.code); // owner hasn't enabled agent payments — wait, don't advance
    } else {
      fail(exec.error);
    }
  }

  return out;
}
