import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/config';
import * as schema from './schema';

/**
 * Database client (§33, §89).
 *
 * A single lazily-created Drizzle client over Supabase Postgres. Lazy so the app builds and
 * runs with no `DATABASE_URL` (Stage-0 invariant) — only code that actually touches the
 * database triggers the connection, and it fails with a clear message if the URL is missing.
 * `server-only` keeps the connection string off the client.
 */

export type Db = PostgresJsDatabase<typeof schema>;

let client: postgres.Sql | null = null;
let db: Db | null = null;

export function isDbConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

/** Get the database client, or throw a clear error if the database isn't configured. */
export function getDb(): Db {
  if (db) return db;
  const url = env.DATABASE_URL;
  if (!url) {
    throw new DbNotConfiguredError();
  }
  // One connection for the process; postgres.js pools internally. `prepare: false` is friendly
  // to Supabase's transaction pooler. Remote hosts (Supabase) require TLS; local dev Postgres
  // does not, so only enable it off-localhost unless the URL already asks for it.
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])/.test(url);
  const urlAsksSsl = /[?&]sslmode=/.test(url);
  client = postgres(url, { prepare: false, ssl: isLocal || urlAsksSsl ? undefined : 'require' });
  db = drizzle(client, { schema });
  return db;
}

export class DbNotConfiguredError extends Error {
  readonly status = 503;
  constructor() {
    super('Database is not configured (set DATABASE_URL).');
    this.name = 'DbNotConfiguredError';
  }
}

export { schema };
