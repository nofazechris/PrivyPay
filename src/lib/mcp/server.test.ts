import { describe, expect, it } from 'vitest';
import { handleMcpMessage } from './server';

const ctx = { userId: 'test-user' };

describe('MCP server dispatch', () => {
  it('handles initialize with protocol version and server info', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, ctx);
    expect(res).toMatchObject({
      id: 1,
      result: { protocolVersion: expect.any(String), serverInfo: { name: 'privypay' }, capabilities: { tools: {} } },
    });
  });

  it('answers ping', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', id: 2, method: 'ping' }, ctx);
    expect(res).toEqual({ jsonrpc: '2.0', id: 2, result: {} });
  });

  it('treats notifications/initialized as a no-reply notification', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }, ctx);
    expect(res).toBeNull();
  });

  it('lists tools with the two-step payment tools and no raw send_payment', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', id: 3, method: 'tools/list' }, ctx);
    const tools = (res?.result as { tools: Array<{ name: string; inputSchema: unknown; annotations?: { readOnlyHint?: boolean } }> }).tools;
    const names = tools.map((t) => t.name);
    expect(names).toContain('create_payment_preview');
    expect(names).toContain('confirm_payment');
    expect(names).toContain('get_balance');
    expect(names).not.toContain('send_payment');
    // Read tools are flagged read-only; money tools are not.
    expect(tools.find((t) => t.name === 'get_balance')?.annotations?.readOnlyHint).toBe(true);
    expect(tools.find((t) => t.name === 'create_payment_preview')?.annotations?.readOnlyHint).toBe(false);
    // Every tool exposes a JSON schema object.
    for (const t of tools) expect(t.inputSchema).toBeTypeOf('object');
  });

  it('rejects an unknown tool call with an invalid-params error', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'nope' } }, ctx);
    expect(res?.error?.code).toBe(-32602);
  });

  it('returns method-not-found for an unknown method with an id', async () => {
    const res = await handleMcpMessage({ jsonrpc: '2.0', id: 5, method: 'does/not-exist' }, ctx);
    expect(res?.error?.code).toBe(-32601);
  });
});
