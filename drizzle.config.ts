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
  },
  strict: true,
  verbose: true,
});
