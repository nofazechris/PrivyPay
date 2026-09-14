import 'server-only';
import { parseUnits } from 'viem';
import { activeNetwork, getToken } from '@/lib/config';
import { getUsdcBalance } from '@/lib/celo/balance';
import type { PolicyCheck, PolicyResult } from '@/lib/policy';

/**
 * Payment policy engine (§30). Runs an ordered set of checks; the first failure denies. No
 * payment executes unless every check passes. Amounts are compared in the token's smallest
 * unit as BigInts — never floats.
 */

// Per-payment cap (§32/§69). Conservative default; configurable per user later.
const PER_PAYMENT_CAP_USDC = '500';

export interface PaymentPolicyContext {
  senderWalletAddress: string;
  recipientAddress: string;
  token: string;
  /** Amount in the token's smallest unit (decimal string), matching the stored payment. */
  amountRaw: string;
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

  if (!/^0x[0-9a-fA-F]{40}$/.test(ctx.recipientAddress)) return deny('valid_recipient', 'Invalid recipient address.');

  // Sufficient balance — read on-chain, never a cached/faked figure (§21–22).
  const balance = await getUsdcBalance(ctx.senderWalletAddress);
  if (!balance) return deny('supported_token', 'Unable to read balance.');
  if (BigInt(balance.raw) < amount) return deny('sufficient_balance', 'Insufficient balance.');

  return { effect: 'ALLOW' };
}
