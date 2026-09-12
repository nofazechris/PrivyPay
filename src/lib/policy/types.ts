import type { PaymentIntent } from '@/lib/payments';

/**
 * Payment policy engine contract (§30).
 *
 * Every payment passes through the policy engine before execution. The engine runs an ordered
 * set of checks and returns ALLOW only if all pass, otherwise DENY with a reason. The agent
 * cannot bypass it — structured intent → policy → authorization → execution is the only path
 * to moving funds (§25, §31).
 *
 * Contract only; the concrete checks are implemented alongside the payment engine (Stage 8)
 * and hardened at Stage 19.
 */

export type PolicyEffect = 'ALLOW' | 'DENY';

/** The checks the engine runs, in order (§30). */
export const POLICY_CHECKS = [
  'authenticated',
  'user_ownership',
  'valid_recipient',
  'valid_amount',
  'supported_token',
  'supported_chain',
  'sufficient_balance',
  'fee_available',
  'authorized',
  'rate_limit',
  'risk_rules',
  'duplicate_payment',
  'transaction_limits',
] as const;

export type PolicyCheck = (typeof POLICY_CHECKS)[number];

export interface PolicyContext {
  readonly userId: string;
  readonly intent: PaymentIntent;
  /** Present once the user has confirmed; policy requires it for execution (§31, §46). */
  readonly authorizationId?: string;
}

export interface PolicyResult {
  readonly effect: PolicyEffect;
  /** The check that produced a DENY, when applicable. */
  readonly failedCheck?: PolicyCheck;
  readonly reason?: string;
}

export interface PolicyEngine {
  evaluate(context: PolicyContext): Promise<PolicyResult>;
}
