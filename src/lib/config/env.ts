import { z } from 'zod';

/**
 * Typed access to environment configuration.
 *
 * Every variable is optional here so the app builds and runs with no `.env` at all — this is
 * the Stage 0 foundation, and secrets arrive stage by stage. A feature that genuinely needs a
 * value calls {@link requireEnv} at the point of use, which fails loudly and specifically
 * rather than letting an `undefined` slip into a signing call or a database URL.
 *
 * Server-only secrets (anything that can move money or read the database) must never be read
 * from client code. Keep those reads inside route handlers and server modules; `NEXT_PUBLIC_`
 * is reserved for values that are safe to ship to the browser.
 */
const schema = z.object({
  // Runtime
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  /** Public origin for metadata and integration hand-off links (e.g. https://privypay.app). */
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Database (Stage: Foundation / §33)
  DATABASE_URL: z.string().url().optional(),

  // Auth session (Stage 3 / §8)
  AUTH_SECRET: z.string().min(1).optional(),

  // AI agent (Stage 9 / §24) — OpenAI, behind the agent module's provider abstraction.
  AI_PROVIDER: z.enum(['openai']).default('openai'),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).optional(),

  // Wallet provider (Stage 5 / §11–12) — Privy embedded wallets.
  WALLET_PROVIDER: z.enum(['privy']).default('privy'),
  PRIVY_APP_ID: z.string().min(1).optional(),
  PRIVY_APP_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1).optional(),

  // Celo settlement (Stage 6 / §13–15). Chain id and RPC per network; addresses stay in
  // config so nothing chain-specific is hard-coded across the app.
  CELO_NETWORK: z.enum(['mainnet', 'sepolia']).default('sepolia'),
  CELO_RPC_URL: z.string().url().optional(),
  CELO_SEPOLIA_RPC_URL: z.string().url().optional(),
  CELO_USDC_ADDRESS: z.string().optional(),

  // Integrations (Stages 14–17)
  MCP_SECRET: z.string().min(1).optional(),
  WHATSAPP_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof schema>;

/**
 * Validate an environment source into typed config. Exported for testing; the app calls it
 * once with `process.env`.
 *
 * A key present but empty (e.g. `DATABASE_URL=` in a .env copied from .env.example) means "not
 * set", not "malformed" — empty strings are coerced to undefined so optionals and defaults
 * apply. Only a present, non-empty, actually-invalid value fails validation.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const cleaned: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    cleaned[key] = value === '' ? undefined : value;
  }
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}

export const env: Env = parseEnv(process.env);

/**
 * Read a variable that a feature cannot run without. Throws a specific error naming the
 * missing key and the stage that introduces it, so a missing secret is never silently
 * coerced into `undefined` inside a payment or signing path.
 */
export function requireEnv<K extends keyof Env>(key: K, hint?: string): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable ${key}.${hint ? ` ${hint}` : ''}`);
  }
  return value as NonNullable<Env[K]>;
}

export const isProd = env.APP_ENV === 'production';
export const isServer = typeof window === 'undefined';
