import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionUser, type SessionUser } from '@/lib/auth/server';
import { DbNotConfiguredError } from '@/lib/db';

/**
 * Small helpers shared by API routes: consistent JSON errors, the auth gate, and translating
 * infrastructure errors (missing database) into clean responses instead of 500s.
 */

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** Resolve the session or return a 401 response to send back. */
export async function withUser(
  req: Request,
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getSessionUser(req);
  if (!user) return { response: jsonError(401, 'unauthorized') };
  return { user };
}

/** Map a thrown error to a response; re-throw anything unexpected. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof DbNotConfiguredError) {
    return jsonError(503, 'database_not_configured');
  }
  throw e;
}
