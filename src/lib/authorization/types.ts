/**
 * Payment authorization contract (§31, §46).
 *
 * Execution requires an authorization artifact, never just a recipient + amount on an
 * unprotected endpoint (§45). An authorization is single-use, short-lived, and bound to every
 * parameter of the payment it approves — user, payment, amount, recipient, token and chain —
 * so it cannot be replayed and a $10 approval can never execute a $100 transfer or redirect to
 * a different recipient (§46, §110).
 *
 * Contract only; issuance, verification and single-use consumption land with the payment
 * engine (Stage 8) and are hardened at Stage 19.
 */

export interface AuthorizationBinding {
  readonly userId: string;
  readonly paymentId: string;
  readonly amount: string;
  readonly recipientAddress: string;
  readonly token: string;
  readonly chainId: number;
}

export interface Authorization extends AuthorizationBinding {
  readonly id: string; // authorization_id
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly consumedAt?: Date;
}

export type AuthorizationResult =
  | { ok: true; authorization: Authorization }
  | { ok: false; reason: 'not_found' | 'expired' | 'already_used' | 'mismatch' };

export interface AuthorizationService {
  /** Issue a single-use authorization bound to this exact payment. */
  issue(binding: AuthorizationBinding): Promise<Authorization>;
  /**
   * Verify an authorization against the payment being executed and consume it atomically.
   * Every field in `binding` must match what was issued, or the result is `mismatch`.
   */
  consume(authorizationId: string, binding: AuthorizationBinding): Promise<AuthorizationResult>;
}
