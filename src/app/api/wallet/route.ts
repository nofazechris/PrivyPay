import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { persistWallet } from '@/lib/wallets/service';

/**
 * Record the caller's embedded wallet for the active network. The client sends the address it
 * received from Privy on login; the server prefers Privy's own record and only falls back to
 * the supplied address if Privy hasn't caught up. Idempotent.
 */
export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  let clientAddress: string | undefined;
  try {
    const body = (await req.json()) as { address?: unknown };
    if (typeof body.address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(body.address)) {
      clientAddress = body.address;
    }
  } catch {
    // No/invalid body is fine — we can still sync from Privy.
  }

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const wallet = await persistWallet(user.id, auth.user.userId, clientAddress);
    if (!wallet) return jsonError(202, 'wallet_pending', { message: 'Wallet not provisioned yet.' });
    return NextResponse.json({ wallet: { address: wallet.address, chainId: wallet.chainId } });
  } catch (e) {
    return errorResponse(e);
  }
}
