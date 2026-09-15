import { NextResponse } from 'next/server';
import { withUser, errorResponse, jsonError } from '@/lib/http';
import { getOrCreateUser } from '@/lib/users/service';
import { features } from '@/lib/config';
import { listMcpTokens, mintMcpToken, revokeMcpToken } from '@/lib/mcp/tokens';

/**
 * MCP token management (§ integrations). The signed-in user mints, lists and revokes their own
 * MCP tokens here. The plaintext is returned exactly once, on mint; only its hash is stored.
 */

export async function GET(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  try {
    const user = await getOrCreateUser(auth.user.userId);
    const tokens = await listMcpTokens(user.id);
    return NextResponse.json({ enabled: features.mcp, tokens });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  if (!features.mcp) return jsonError(409, 'mcp_disabled', { message: 'MCP is not enabled for this deployment.' });

  let body: { label?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // label is optional; ignore a missing/invalid body
  }
  const label = typeof body.label === 'string' ? body.label : undefined;

  try {
    const user = await getOrCreateUser(auth.user.userId);
    const minted = await mintMcpToken(user.id, label);
    return NextResponse.json({ token: minted });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  const auth = await withUser(req);
  if ('response' in auth) return auth.response;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return jsonError(400, 'missing_id');
  try {
    const user = await getOrCreateUser(auth.user.userId);
    await revokeMcpToken(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
