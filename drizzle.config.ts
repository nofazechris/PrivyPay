import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for migrations (§124 — versioned, reproducible schema changes).
 * `npm run db:generate` writes SQL migrations from the schema; `npm run db:migrate` applies
 * them to the database at DATABASE_URL.
 */
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
    // Supabase (and most hosted Postgres) require TLS; skip only for local Postgres.
    ssl: /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL ?? '') ? false : 'require',
  },
  strict: true,
  verbose: true,
});
