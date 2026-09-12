import { describe, it, expect } from 'vitest';
import { parseAgentIntent, agentIntentSchema, CONFIRMATION_REQUIRED } from './intent';

describe('agent intent validation', () => {
  it('accepts a well-formed send intent', () => {
    const res = parseAgentIntent({
      type: 'SEND_PAYMENT',
      parameters: { recipient: '@sarah', amount: '20', token: 'USDC' },
      confidence: 0.94,
      requiresConfirmation: true,
    });
    expect(res.ok).toBe(true);
  });

  it('forces requiresConfirmation on money-moving intents even if the model omits it', () => {
    for (const type of CONFIRMATION_REQUIRED) {
      const res = parseAgentIntent({ type, parameters: {}, confidence: 0.9, requiresConfirmation: false });
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.intent.requiresConfirmation).toBe(true);
    }
  });

  it('rejects an unknown intent type', () => {
    const res = parseAgentIntent({ type: 'DRAIN_WALLET', confidence: 1, requiresConfirmation: true });
    expect(res.ok).toBe(false);
  });

  it('rejects out-of-range confidence', () => {
    expect(agentIntentSchema.safeParse({ type: 'GET_BALANCE', confidence: 1.5, requiresConfirmation: false }).success).toBe(
      false,
    );
  });

  it('defaults parameters to an empty object', () => {
    const res = parseAgentIntent({ type: 'GET_BALANCE', confidence: 0.99, requiresConfirmation: false });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.intent.parameters).toEqual({});
  });
});
