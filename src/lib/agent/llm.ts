import 'server-only';
import OpenAI from 'openai';
import { env } from '@/lib/config';
import { INTENT_TYPES, parseAgentIntent, type AgentIntent } from './intent';
import { parseIntentRuleBased } from './parse';

/**
 * Agent intent extraction (§24–28).
 *
 * Turns a natural-language message into a validated {@link AgentIntent}. Uses OpenAI when
 * `AI_API_KEY` is set (behind this provider boundary, so the model is swappable), and falls
 * back to the deterministic rule-based parser otherwise — so the agent works today and gets
 * smarter once a key is configured. The model's free-form output is never trusted: it must
 * parse into the schema, or we fall back (§29). Money-moving intents always require
 * confirmation, enforced by `parseAgentIntent`.
 */

const SYSTEM_PROMPT = `You are PrivyPay's payment intent parser. Convert the user's message into a single JSON intent.
Return ONLY JSON with this shape:
{"type": one of ${INTENT_TYPES.join(', ')}, "parameters": object, "confidence": 0..1, "requiresConfirmation": boolean}
Rules:
- SEND_PAYMENT / REQUEST_PAYMENT parameters: {recipient: "@username", amount: "20", token: "USDC", memo?: string, recurring?: string}
- requiresConfirmation must be true for SEND_PAYMENT and REQUEST_PAYMENT.
- Amounts are strings without a currency symbol. Default token is USDC.
- If the recipient or amount is unclear for a payment, lower the confidence.
- Never invent a recipient. Do not include commentary.`;

let client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (client) return client;
  if (!env.AI_API_KEY) return null;
  client = new OpenAI({ apiKey: env.AI_API_KEY });
  return client;
}

export async function extractIntent(message: string): Promise<AgentIntent> {
  const openai = getClient();
  if (!openai) return parseIntentRuleBased(message);

  try {
    const completion = await openai.chat.completions.create({
      model: env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 200,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return parseIntentRuleBased(message);
    const parsed = parseAgentIntent(JSON.parse(raw));
    // If the model's output doesn't fit the schema, fall back rather than trust it (§29).
    return parsed.ok ? parsed.intent : parseIntentRuleBased(message);
  } catch {
    return parseIntentRuleBased(message);
  }
}
