import { env } from './env';

/**
 * Feature flags (§119).
 *
 * Integrations and later capabilities ship dark and are enabled independently, so an
 * incomplete channel is never reachable in production. Everything defaults off; a flag turns
 * on only when its stage is built and its config is present.
 */
export interface FeatureFlags {
  readonly mcp: boolean;
  readonly chatgpt: boolean;
  readonly codex: boolean;
  readonly whatsapp: boolean;
  readonly recurring: boolean;
  readonly x402: boolean;
  readonly advancedPrivacy: boolean;
}

export const features: FeatureFlags = {
  mcp: Boolean(env.MCP_SECRET),
  chatgpt: false,
  codex: false,
  whatsapp: Boolean(env.WHATSAPP_WEBHOOK_SECRET),
  recurring: false,
  x402: false,
  advancedPrivacy: false,
};
