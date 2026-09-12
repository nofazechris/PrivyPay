/**
 * Payment state machine (§17).
 *
 * Payment status is an explicit enum with a fixed set of legal transitions, never a boolean
 * (§17). This module is the single source of truth for what state a payment may move to next;
 * the payment engine (Stage 8) drives it and refuses any transition not listed here, so a
 * payment can never, for example, jump from DRAFT straight to CONFIRMED or move on after a
 * terminal failure.
 *
 * Pure data and a pure guard — no side effects, no blockchain, safe to unit test in isolation.
 */

export const PAYMENT_STATUSES = [
  'DRAFT',
  'PREVIEW',
  'AWAITING_AUTHORIZATION',
  'AUTHORIZED',
  'PREPARING',
  'SIGNING',
  'BROADCASTING',
  'PENDING',
  'CONFIRMED',
  // Failure / terminal states
  'CANCELLED',
  'FAILED',
  'EXPIRED',
  'REJECTED',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** States from which no further transition is allowed. */
export const TERMINAL_STATUSES: readonly PaymentStatus[] = ['CONFIRMED', 'CANCELLED', 'FAILED', 'EXPIRED', 'REJECTED'];

/**
 * Legal transitions. The happy path advances DRAFT → … → CONFIRMED; most active states may
 * also fail, expire, or be cancelled/rejected before settlement. Terminal states have no
 * outgoing transitions.
 */
const TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  DRAFT: ['PREVIEW', 'CANCELLED', 'EXPIRED'],
  PREVIEW: ['AWAITING_AUTHORIZATION', 'CANCELLED', 'EXPIRED'],
  AWAITING_AUTHORIZATION: ['AUTHORIZED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
  AUTHORIZED: ['PREPARING', 'CANCELLED', 'EXPIRED'],
  PREPARING: ['SIGNING', 'FAILED'],
  SIGNING: ['BROADCASTING', 'FAILED'],
  BROADCASTING: ['PENDING', 'FAILED'],
  PENDING: ['CONFIRMED', 'FAILED'],
  CONFIRMED: [],
  CANCELLED: [],
  FAILED: [],
  EXPIRED: [],
  REJECTED: [],
};

export function isTerminal(status: PaymentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStates(from: PaymentStatus): readonly PaymentStatus[] {
  return TRANSITIONS[from];
}

/**
 * Assert a transition is legal, returning the target state. Throws otherwise — the engine uses
 * this so an illegal state change fails loudly instead of corrupting a payment record.
 */
export function assertTransition(from: PaymentStatus, to: PaymentStatus): PaymentStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal payment transition: ${from} → ${to}`);
  }
  return to;
}
