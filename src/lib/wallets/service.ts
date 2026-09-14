import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';
import { activeNetwork } from '@/lib/config';
import { getPrivyEmbeddedWallet } from '@/lib/auth/server';

/**
 * Wallet persistence (§5, §36).
 *
 * Privy provisions and custodies the embedded Celo wallet — its keys never reach us (§11).
 * This module records the wallet's public address against our user so the app and payment
 * engine can reference it without calling Privy on every request. Sync is idempotent on
 * (user, chain): calling it repeatedly keeps the stored address current and never duplicates.
 */

export interface StoredWallet {
  address: string;
  chainId: number;
  providerWalletId: string | null;
}

export async function getWalletByUserId(userId: string): Promise<StoredWallet | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.wallets)
    .where(and(eq(schema.wallets.userId, userId), eq(schema.wallets.chainId, activeNetwork.chainId)))
    .limit(1);
  if (rows.length === 0) return null;
  const w = rows[0];
  return { address: w.address, chainId: w.chainId, providerWalletId: w.providerWalletId };
}

/**
 * Ensure the user's Privy embedded wallet is recorded for the active network, returning it.
 * Returns null if Privy hasn't provisioned one yet (the client creates it on login; there can
 * be a brief lag before the server sees it).
 */
export async function syncWallet(userId: string, privyDid: string): Promise<StoredWallet | null> {
  const existing = await getWalletByUserId(userId);
  const fromPrivy = await getPrivyEmbeddedWallet(privyDid);

  if (!fromPrivy) return existing; // nothing to sync yet
  if (existing && existing.address.toLowerCase() === fromPrivy.address.toLowerCase()) {
    return existing;
  }

  const db = getDb();
  const chainId = activeNetwork.chainId;
  await db
    .insert(schema.wallets)
    .values({ userId, chainId, address: fromPrivy.address, providerWalletId: fromPrivy.walletId, provider: 'privy' })
    .onConflictDoUpdate({
      target: [schema.wallets.userId, schema.wallets.chainId],
      set: { address: fromPrivy.address, providerWalletId: fromPrivy.walletId, updatedAt: new Date() },
    });

  return { address: fromPrivy.address, chainId, providerWalletId: fromPrivy.walletId };
}
