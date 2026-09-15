import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

/**
 * MCP access tokens (§ integrations).
 *
 * External agents (ChatGPT, Claude) can't hold a short-lived Privy session token, so a user
 * mints a long-lived PrivyPay MCP token in-app and pastes it into the agent. The plaintext is
 * shown exactly once at mint time; only its SHA-256 hash is stored, so a database leak never
 * yields a working token. Every MCP call resolves the bearer token to a user through
 * {@link verifyMcpToken}. Tokens are per-user and independently revocable.
 */

const PREFIX = 'ppmcp_';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface MintedToken {
  /** The full plaintext token — returned only here, never stored or logged. */
  token: string;
  id: string;
  tokenPrefix: string;
  label: string | null;
  createdAt: string;
}

export interface TokenSummary {
  id: string;
  tokenPrefix: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

/** Mint a new MCP token for a user. Returns the plaintext once; stores only the hash. */
export async function mintMcpToken(userId: string, label?: string): Promise<MintedToken> {
  const secret = randomBytes(24).toString('base64url');
  const token = PREFIX + secret;
  const tokenPrefix = token.slice(0, PREFIX.length + 4);
  const db = getDb();
  const [row] = await db
    .insert(schema.mcpTokens)
    .values({ userId, tokenHash: hashToken(token), tokenPrefix, label: label?.trim() || null })
    .returning();
  return { token, id: row.id, tokenPrefix: row.tokenPrefix, label: row.label, createdAt: row.createdAt.toISOString() };
}

/** Resolve a presented bearer token to a user id, or null if unknown/revoked. Touches lastUsedAt. */
export async function verifyMcpToken(token: string): Promise<{ userId: string } | null> {
  if (!token || !token.startsWith(PREFIX)) return null;
  const db = getDb();
  const rows = await db
    .select({ id: schema.mcpTokens.id, userId: schema.mcpTokens.userId, revokedAt: schema.mcpTokens.revokedAt })
    .from(schema.mcpTokens)
    .where(eq(schema.mcpTokens.tokenHash, hashToken(token)))
    .limit(1);
  const row = rows[0];
  if (!row || row.revokedAt) return null;
  // Best-effort usage timestamp; never block the request on it.
  void db.update(schema.mcpTokens).set({ lastUsedAt: new Date() }).where(eq(schema.mcpTokens.id, row.id));
  return { userId: row.userId };
}

/** A user's active (non-revoked) tokens, newest first. Never returns hashes. */
export async function listMcpTokens(userId: string): Promise<TokenSummary[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: schema.mcpTokens.id,
      tokenPrefix: schema.mcpTokens.tokenPrefix,
      label: schema.mcpTokens.label,
      createdAt: schema.mcpTokens.createdAt,
      lastUsedAt: schema.mcpTokens.lastUsedAt,
    })
    .from(schema.mcpTokens)
    .where(and(eq(schema.mcpTokens.userId, userId), isNull(schema.mcpTokens.revokedAt)))
    .orderBy(desc(schema.mcpTokens.createdAt));
  return rows.map((r) => ({
    id: r.id,
    tokenPrefix: r.tokenPrefix,
    label: r.label,
    createdAt: r.createdAt.toISOString(),
    lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
  }));
}

/** Revoke one of the caller's tokens. No-op if it isn't theirs. */
export async function revokeMcpToken(userId: string, id: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.mcpTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.mcpTokens.id, id), eq(schema.mcpTokens.userId, userId)));
}
