import { z } from 'zod';

/**
 * Agent intent schema (§26–28).
 *
 * The AI never executes anything directly. It turns a natural-language message into one of a
 * fixed set of structured intents, which is then validated here and handed to the policy and
 * authorization layers (§25). Free-form model output is never trusted for financial execution
 * — it must parse into this schema, and low-confidence money-moving intents require
 * confirmation or clarification (§28).
 *
 * Defining the schema with zod gives us both the TypeScript type and a runtime validator the
 * agent route (Stage 9) uses to reject malformed model output.
 */

export const INTENT_TYPES = [
  'GET_BALANCE',
  'SEND_PAYMENT',
  'REQUEST_PAYMENT',
  'GET_TRANSACTIONS',
  'GET_PROFILE',
  'FIND_CONTACT',
  'GET_PAYMENT_STATUS',
] as const;

export type IntentType = (typeof INTENT_TYPES)[number];

/** Intents that move or request money always require explicit human confirmation (§31). */
export const CONFIRMATION_REQUIRED: readonly IntentType[] = ['SEND_PAYMENT', 'REQUEST_PAYMENT'];

export const agentIntentSchema = z.object({
  type: z.enum(INTENT_TYPES),
  parameters: z.record(z.string(), z.unknown()).default({}),
  confidence: z.number().min(0).max(1),
  requiresConfirmation: z.boolean(),
});

export type AgentIntent = z.infer<typeof agentIntentSchema>;

/**
 * Below this confidence a money-moving intent must not be prepared; the agent asks for
 * clarification instead of guessing (§28). Tuned with real usage later.
 */
export const MIN_EXECUTION_CONFIDENCE = 0.7;

/**
 * Parse untrusted model output into a validated intent, enforcing that money-moving intents
 * always carry `requiresConfirmation`. Returns a typed result rather than throwing so the
 * caller can ask for clarification on a parse failure.
 */
export function parseAgentIntent(raw: unknown):
  | { ok: true; intent: AgentIntent }
  | { ok: false; error: string } {
  const parsed = agentIntentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  const intent = parsed.data;
  if (CONFIRMATION_REQUIRED.includes(intent.type) && !intent.requiresConfirmation) {
    // Never let a send/request come back as fire-and-forget, whatever the model claimed.
    return { ok: true, intent: { ...intent, requiresConfirmation: true } };
  }
  return { ok: true, intent };
}
