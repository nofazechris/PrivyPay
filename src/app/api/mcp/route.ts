import { features } from '@/lib/config';
import { verifyMcpToken } from '@/lib/mcp/tokens';
import { handleMcpMessage } from '@/lib/mcp/server';
import type { ToolContext } from '@/lib/mcp/tools';

/**
 * MCP endpoint (§ integrations) — JSON-RPC 2.0 over HTTP (Streamable-HTTP compatible for a
 * stateless, tools-only server). External agents (ChatGPT, Claude) POST here with a PrivyPay MCP
 * token as `Authorization: Bearer …`; the token resolves to the acting user server-side, so tool
 * arguments never carry identity. Disabled unless the operator has enabled MCP (`MCP_SECRET`).
 */

function bearer(req: Request): string | null {
  const h = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!h) return null;
  const [scheme, value] = h.split(' ');
  return scheme?.toLowerCase() === 'bearer' && value ? value.trim() : null;
}

function jsonRpcError(code: number, message: string, status: number): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code, message } }), {
    status,
    headers: { 'content-type': 'application/json', 'WWW-Authenticate': 'Bearer' },
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!features.mcp) return jsonRpcError(-32000, 'MCP is not enabled for this deployment.', 404);

  const token = bearer(req);
  if (!token) return jsonRpcError(-32001, 'Missing MCP token.', 401);
  const auth = await verifyMcpToken(token);
  if (!auth) return jsonRpcError(-32001, 'Invalid or revoked MCP token.', 401);
  const ctx: ToolContext = { userId: auth.userId };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonRpcError(-32700, 'Parse error.', 400);
  }

  // Support a single message or a JSON-RPC batch.
  if (Array.isArray(body)) {
    const responses = (await Promise.all(body.map((m) => handleMcpMessage(m, ctx)))).filter((r) => r !== null);
    if (responses.length === 0) return new Response(null, { status: 202 });
    return Response.json(responses);
  }

  const response = await handleMcpMessage(body, ctx);
  if (response === null) return new Response(null, { status: 202 });
  return Response.json(response);
}

// A tools-only server has no server-initiated stream; be explicit rather than 404.
export function GET(): Response {
  return new Response('Method Not Allowed. POST JSON-RPC to this endpoint.', { status: 405, headers: { allow: 'POST' } });
}
