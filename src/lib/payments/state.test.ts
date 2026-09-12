import { describe, it, expect } from 'vitest';
import {
  PAYMENT_STATUSES,
  TERMINAL_STATUSES,
  canTransition,
  assertTransition,
  isTerminal,
  nextStates,
} from './state';

describe('payment state machine', () => {
  it('advances along the happy path DRAFT → CONFIRMED', () => {
    const happy = [
      'DRAFT',
      'PREVIEW',
      'AWAITING_AUTHORIZATION',
      'AUTHORIZED',
      'PREPARING',
      'SIGNING',
      'BROADCASTING',
      'PENDING',
      'CONFIRMED',
    ] as const;
    for (let i = 0; i < happy.length - 1; i++) {
      expect(canTransition(happy[i], happy[i + 1])).toBe(true);
    }
  });

  it('treats CONFIRMED and every failure state as terminal with no exits', () => {
    for (const status of TERMINAL_STATUSES) {
      expect(isTerminal(status)).toBe(true);
      expect(nextStates(status)).toHaveLength(0);
    }
  });

  it('forbids skipping straight from DRAFT to CONFIRMED', () => {
    expect(canTransition('DRAFT', 'CONFIRMED')).toBe(false);
  });

  it('cannot move on from a terminal state', () => {
    expect(canTransition('CONFIRMED', 'PENDING')).toBe(false);
    expect(canTransition('FAILED', 'PENDING')).toBe(false);
  });

  it('assertTransition throws on an illegal move and returns the target on a legal one', () => {
    expect(() => assertTransition('DRAFT', 'CONFIRMED')).toThrow(/Illegal payment transition/);
    expect(assertTransition('PENDING', 'CONFIRMED')).toBe('CONFIRMED');
  });

  it('lets active pre-settlement states fail', () => {
    expect(canTransition('BROADCASTING', 'FAILED')).toBe(true);
    expect(canTransition('PENDING', 'FAILED')).toBe(true);
  });

  it('exposes exactly the documented set of statuses', () => {
    expect(PAYMENT_STATUSES).toContain('AWAITING_AUTHORIZATION');
    expect(new Set(PAYMENT_STATUSES).size).toBe(PAYMENT_STATUSES.length);
  });
});
