import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { getWalletByUserId } from '@/lib/wallets/service';
import { getUsdcBalance } from '@/lib/celo/balance';

/**
 * The signed-in user's on-chain USDC balance on the active Celo network. Reads the address the
 * client provides (its own Privy wallet) when given, else the stored wallet — an on-chain
 * balance is public data, so this is safe, and it avoids waiting on wallet persistence. Returns
 * `balance: null` when no wallet is known yet.
 */
export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;

  const param = new URL(req.url).searchParams.get('address');
  const requested = param && /^0x[0-9a-fA-F]{40}$/.test(param) ? param : null;

  try {
    let address = requested;
    if (!address) {
      const user = await getOrCreateUser(auth.user.userId);
      const wallet = await getWalletByUserId(user.id);
      address = wallet?.address ?? null;
    }
    if (!address) return NextResponse.json({ balance: null });

    const usdc = await getUsdcBalance(address);
    return NextResponse.json({
      address,
      balance: usdc ? { symbol: usdc.symbol, formatted: usdc.formatted, raw: usdc.raw, decimals: usdc.decimals } : null,
    });
  } catch (e) {
    // A transient RPC failure shouldn't 500 the dashboard.
    if (e instanceof Error && /fetch|network|timeout|rpc/i.test(e.message)) {
      return jsonError(503, 'rpc_unavailable');
    }
    return errorResponse(e);
  }
}
