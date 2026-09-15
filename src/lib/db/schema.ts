import { pgTable, uuid, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Custody provider (currently Privy). */
    provider: text('provider').notNull().default('privy'),
    /** Provider's wallet identifier, when available. Never a private key. */
    providerWalletId: text('provider_wallet_id'),
    chainId: integer('chain_id').notNull(),
    address: text('address').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // One wallet per user per chain; syncing is idempotent on this key.
  (t) => [uniqueIndex('wallets_user_chain_uq').on(t.userId, t.chainId)],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    senderUserId: uuid('sender_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientUserId: uuid('recipient_user_id').references(() => users.id, { onDelete: 'set null' }),
    recipientAddress: text('recipient_address').notNull(),
    /** Amount in the token's smallest unit, as a decimal string — never a float (§18). */
    amount: text('amount').notNull(),
    token: text('token').notNull(),
    chainId: integer('chain_id').notNull(),
    /** PaymentStatus enum value; the state machine is the authority on transitions (§17). */
    status: text('status').notNull().default('DRAFT'),
    memo: text('memo'),
    txHash: text('tx_hash'),
    feeAmount: text('fee_amount'),
    /** Makes execution idempotent (§20): the same key resolves to the same payment. */
    idempotencyKey: text('idempotency_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    authorizedAt: timestamp('authorized_at', { withTimezone: true }),
    broadcastAt: timestamp('broadcast_at', { withTimezone: true }),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('payments_sender_idem_uq').on(t.senderUserId, t.idempotencyKey)],
);

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** The user who owns this contact list entry. */
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** The saved person's PrivyPay user id (set when they are a PrivyPay user). */
    contactUserId: uuid('contact_user_id').references(() => users.id, { onDelete: 'set null' }),
    /** Saved username, normalized (lowercase, no leading '@'). */
    username: text('username').notNull(),
    /** Optional display name shown in the UI; falls back to the username. */
    displayName: text('display_name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // One entry per person in a user's contact list; re-adding is idempotent on this key.
  (t) => [uniqueIndex('contacts_owner_username_uq').on(t.ownerUserId, t.username)],
);

export const requests = pgTable('requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Who asked for the money (and receives it when paid). */
  requesterUserId: uuid('requester_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** Who is asked to pay. Must be a real PrivyPay user, resolved at create time. */
  payerUserId: uuid('payer_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** Amount in the token's smallest unit, as a decimal string — never a float (§18). */
  amount: text('amount').notNull(),
  token: text('token').notNull(),
  chainId: integer('chain_id').notNull(),
  memo: text('memo'),
  /** PENDING | PAID | CANCELLED. */
  status: text('status').notNull().default('PENDING'),
  /** The payment that fulfilled this request, once paid. */
  paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
});

export const recurringPayments = pgTable('recurring_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Who set up (and pays) the recurring payment. */
  ownerUserId: uuid('owner_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** Who receives it. A real PrivyPay user, resolved at create time. */
  payeeUserId: uuid('payee_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: text('amount').notNull(),
  token: text('token').notNull(),
  chainId: integer('chain_id').notNull(),
  /** Human cadence label, e.g. "Every Friday" / "Monthly". */
  cadence: text('cadence').notNull(),
  /** active | paused | cancelled. Automated execution is a later worker; this is the schedule. */
  status: text('status').notNull().default('active'),
  /** When the next run is due (computed from the cadence). */
  nextRun: timestamp('next_run', { withTimezone: true }),
  memo: text('memo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const authorizations = pgTable('authorizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id')
    .notNull()
    .references(() => payments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Bound to every payment parameter so an approval can't be replayed against a different one (§46).
  amount: text('amount').notNull(),
  recipientAddress: text('recipient_address').notNull(),
  token: text('token').notNull(),
  chainId: integer('chain_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  /** Set when consumed; single-use — a second consume is rejected. */
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
});

export type UserRow = typeof users.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type WalletRow = typeof wallets.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type AuthorizationRow = typeof authorizations.$inferSelect;
export type ContactRow = typeof contacts.$inferSelect;
export type RequestRecord = typeof requests.$inferSelect;
export type RecurringRecord = typeof recurringPayments.$inferSelect;
