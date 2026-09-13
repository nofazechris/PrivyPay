import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Database schema (§34–35).
 *
 * Privy owns authentication and key custody; these tables own PrivyPay's own identity. A
 * `users` row maps a Privy DID to an internal id (never expose the DID as the app-facing id),
 * and a `profiles` row holds the username the product pays by. Usernames are unique at the
 * database level — the ultimate guard behind the application check (§9).
 */

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** Privy DID (did:privy:…). The link to the auth/custody provider. */
    privyDid: text('privy_did').notNull(),
    email: text('email'),
    authProvider: text('auth_provider').notNull().default('privy'),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_privy_did_uq').on(t.privyDid)],
);

export const profiles = pgTable(
  'profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Stored normalized (lowercase). Unique across all users. */
    username: text('username').notNull(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('profiles_username_uq').on(t.username)],
);

export type UserRow = typeof users.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
