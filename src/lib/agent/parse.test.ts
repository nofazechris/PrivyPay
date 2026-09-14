import { describe, it, expect } from 'vitest';
import { parseIntentRuleBased } from './parse';

describe('rule-based intent parser', () => {
  it('parses a send', () => {
    const i = parseIntentRuleBased('Send $20 to @sarah');
    expect(i.type).toBe('SEND_PAYMENT');
    expect(i.parameters.recipient).toBe('@sarah');
    expect(i.parameters.amount).toBe('20');
    expect(i.requiresConfirmation).toBe(true);
  });

  it('parses a request with a memo', () => {
    const i = parseIntentRuleBased('Request $50 from @mike for the logo');
    expect(i.type).toBe('REQUEST_PAYMENT');
    expect(i.parameters.amount).toBe('50');
    expect(i.parameters.memo).toBe('the logo');
    expect(i.requiresConfirmation).toBe(true);
  });

  it('parses a recurring send', () => {
    const i = parseIntentRuleBased('Pay @designer $200 every Friday');
    expect(i.type).toBe('SEND_PAYMENT');
    expect(i.parameters.recurring).toContain('friday');
  });

  it('parses balance and activity questions', () => {
    expect(parseIntentRuleBased("What's my balance?").type).toBe('GET_BALANCE');
    expect(parseIntentRuleBased('Show recent payments').type).toBe('GET_TRANSACTIONS');
  });

  it('lowers confidence when a payment has no recipient', () => {
    const i = parseIntentRuleBased('send 20');
    expect(i.type).toBe('SEND_PAYMENT');
    expect(i.confidence).toBeLessThan(0.7);
  });
});
