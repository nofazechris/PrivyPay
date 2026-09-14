import { activeNetwork } from '@/lib/config';

/**
 * Same-origin JSON-RPC proxy for the active Celo network.
 *
 * The browser can't call the public forno RPC directly (it 403s cross-origin), so the client's
 * viem calls — gas estimation, nonce, and broadcasting the signed transaction — go through
 * here, where the request is server-to-server and succeeds. Forwards the JSON-RPC body to the
 * first healthy configured endpoint. Read-only RPC + broadcasting already-signed transactions;
 * no keys are involved.
 */
export async function POST(req: Request) {
  const body = await req.text();

  for (const url of activeNetwork.rpcUrls) {
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      if (!upstream.ok) continue; // try the next endpoint
      const text = await upstream.text();
      return new Response(text, { status: 200, headers: { 'content-type': 'application/json' } });
    } catch {
      // try the next endpoint
    }
  }
  return Response.json({ jsonrpc: '2.0', error: { code: -32603, message: 'RPC unavailable' }, id: null }, { status: 502 });
}
