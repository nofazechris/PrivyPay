import 'server-only';
import { z } from 'zod';
import { TOOLS, TOOLS_BY_NAME, ToolError, type ToolContext } from './tools';

/**
 * Minimal MCP server (JSON-RPC 2.0 over HTTP) for PrivyPay's tool surface.
 *
 * Implements just the methods a tools-only server needs — initialize, tools/list, tools/call,
 * ping — rather than pulling in a full transport SDK for a stateless HTTP endpoint. Each request
 * is dispatched as the already-authenticated user (the caller resolves the MCP token to a
 * {@link ToolContext} before handing the message here); tool arguments never carry identity.
 */

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'privypay', version: '0.1.0' } as const;

type Id = string | number | null;

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: Id;
  result?: unknown;
  error?: { code: number; message: string };
}

function ok(id: Id, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result };
}
function err(id: Id, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

/** JSON Schema for a tool's arguments, for tools/list. Falls back to an open object on failure. */
function inputSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  try {
    return z.toJSONSchema(schema) as Record<string, unknown>;
  } catch {
    return { type: 'object' };
  }
}

function toolList() {
  return {
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: inputSchema(t.schema),
      annotations: { readOnlyHint: !t.mutating },
    })),
  };
}

/** Wrap a value as MCP tool-result content. */
function toolResult(value: unknown, isError = false) {
  return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }], isError };
}

/**
 * Handle one JSON-RPC message. Returns a response object, or null for notifications (which take
 * no reply). Never throws — protocol and tool errors are returned in-band.
 */
export async function handleMcpMessage(message: unknown, ctx: ToolContext): Promise<JsonRpcResponse | null> {
  if (!message || typeof message !== 'object') return err(null, -32600, 'Invalid Request');
  const msg = message as { jsonrpc?: unknown; id?: Id; method?: unknown; params?: unknown };
  const id: Id = msg.id ?? null;
  const method = typeof msg.method === 'string' ? msg.method : '';

  // Notifications (no id) get no response.
  const isNotification = msg.id === undefined || msg.id === null;

  switch (method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });

    case 'notifications/initialized':
    case 'notifications/cancelled':
      return null; // acknowledged, no reply

    case 'ping':
      return ok(id, {});

    case 'tools/list':
      return ok(id, toolList());

    case 'tools/call': {
      const params = (msg.params ?? {}) as { name?: unknown; arguments?: unknown };
      const name = typeof params.name === 'string' ? params.name : '';
      const def = TOOLS_BY_NAME.get(name);
      if (!def) return err(id, -32602, `Unknown tool: ${name}`);
      try {
        const result = await def.handler(ctx, params.arguments);
        return ok(id, toolResult(result));
      } catch (e) {
        // Tool-level failures are returned as an error *result* (isError), so the model can see
        // and react to them, rather than as a transport error that aborts the call.
        if (e instanceof ToolError) return ok(id, toolResult({ error: e.code, message: e.message }, true));
        return ok(id, toolResult({ error: 'internal_error', message: 'The tool failed to complete.' }, true));
      }
    }

    default:
      if (isNotification) return null;
      return err(id, -32601, `Method not found: ${method}`);
  }
}
