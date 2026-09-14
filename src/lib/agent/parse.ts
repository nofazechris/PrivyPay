import type { AgentIntent, IntentType } from './intent';

/**
 * Deterministic fallback intent parser (§26–27). Used when no LLM key is configured, and as a
 * safety net. Pure and side-effect-free — the LLM path produces the same {@link AgentIntent}
 * shape, which is then validated by `parseAgentIntent`.
 */
export function parseIntentRuleBased(message: string): AgentIntent {
  const low = message.trim().toLowerCase();
  const amountMatch = low.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  const amount = amountMatch ? amountMatch[1] : undefined;
  const handleMatch = low.match(/@([a-z0-9_]+)/);
  const handle = handleMatch ? '@' + handleMatch[1] : undefined;
  const every = low.match(/every\s+([a-z]+)/);

  const build = (type: IntentType, parameters: Record<string, unknown>, confidence: number): AgentIntent => ({
    type,
    parameters,
    confidence,
    requiresConfirmation: type === 'SEND_PAYMENT' || type === 'REQUEST_PAYMENT',
  });

  if (/balance|how much/.test(low)) return build('GET_BALANCE', {}, 0.9);
  if (/recent|activity|history|transactions|payments/.test(low) && !amount) return build('GET_TRANSACTIONS', {}, 0.85);
  if (every && amount) {
    return build('SEND_PAYMENT', { recipient: handle, amount, token: 'USDC', recurring: `Every ${every[1]}` }, handle ? 0.8 : 0.4);
  }
  if (/request|invoice|ask/.test(low) && amount) {
    const note = (low.match(/for\s+(.+)$/) ?? [])[1]?.replace(/[.]$/, '');
    return build('REQUEST_PAYMENT', { recipient: handle, amount, token: 'USDC', memo: note }, handle ? 0.8 : 0.4);
  }
  if (amount) return build('SEND_PAYMENT', { recipient: handle, amount, token: 'USDC' }, handle ? 0.85 : 0.4);
  return build('GET_PROFILE', {}, 0.3);
}
