'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Pexa's agent chat — the primary surface (§ Pexa). The user talks to the agent; it turns the
 * message into a structured intent (real server LLM), shows an inline preview, and only on the
 * user's explicit Confirm does it execute through the real payment engine and show a receipt.
 * Nothing moves before confirmation; the LLM never signs. This composes the same hooks the rest of
 * the app uses — no payment logic is duplicated here.
 */

export type AgentState = 'idle' | 'thinking' | 'resolving' | 'awaiting' | 'processing' | 'success' | 'error';

export interface AgentIntentShape {
  kind: 'send' | 'request' | 'recurring' | 'balance' | 'activity' | 'external' | 'unknown';
  amount?: number;
  handle?: string;
  note?: string;
  cadence?: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'agent';
  type?: 'text' | 'preview' | 'receipt' | 'answer' | 'error';
  text?: string;
  kind?: AgentIntentShape['kind'];
  intent?: AgentIntentShape;
  status?: 'awaiting' | 'confirmed' | 'cancelled' | 'failed';
  answerKind?: 'balance' | 'activity';
  /** Real settlement result on a receipt. */
  result?: { status: string; txHash?: string | null; explorerUrl?: string | null };
  /** Error card. */
  title?: string;
  hint?: string;
  fixLabel?: string;
  fixText?: string;
}

export interface AgentChatDeps {
  /** Real LLM intent extraction (server). */
  parseCommand: (message: string) => Promise<AgentIntentShape | null>;
  /** Execute a confirmed send through the engine; returns the real on-chain outcome. */
  executeSend: (args: { recipient: string; amount: string }) => Promise<{
    ok: boolean;
    error?: string;
    status?: 'confirmed' | 'pending' | 'failed';
    txHash?: string | null;
    explorerUrl?: string | null;
  }>;
  createRequest?: (args: { payer: string; amount: string; memo?: string }) => Promise<{ ok: boolean; error?: string }>;
  createRecurring?: (args: { payee: string; amount: string; cadence?: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Current balance (number) for the balance answer + a friendly pre-check. */
  balance: number;
}

export function useAgentChat(deps: AgentChatDeps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [draft, setDraft] = useState('');
  const idRef = useRef(1);
  const depsRef = useRef(deps);
  // Keep the latest deps for the async callbacks below without re-creating them; syncing in an
  // effect (not during render) satisfies the refs rule — callbacks read `.current` at call time.
  useEffect(() => {
    depsRef.current = deps;
  });

  const push = useCallback((m: Omit<ChatMessage, 'id'>) => {
    const id = idRef.current++;
    setMessages((prev) => [...prev, { ...m, id }]);
    return id;
  }, []);

  const send = useCallback(
    async (text?: string) => {
      const raw = (typeof text === 'string' ? text : draft).trim();
      if (!raw || agentState === 'processing') return;
      const d = depsRef.current;
      push({ role: 'user', text: raw });
      setDraft('');
      setAgentState('thinking');

      let intent: AgentIntentShape | null = null;
      try {
        intent = await d.parseCommand(raw);
      } catch {
        intent = null;
      }
      const kind = intent?.kind ?? 'unknown';

      const fail = (title: string, hint: string, fixLabel?: string, fixText?: string) => {
        push({ role: 'agent', type: 'error', title, hint, fixLabel, fixText });
        setAgentState('error');
        setTimeout(() => setAgentState('idle'), 400);
      };

      if (kind === 'unknown') {
        return fail('I didn’t catch that.', 'Try “Send $20 to @sarah”, or ask “What’s my balance?”', 'Send $20 to @sarah', 'Send $20 to @sarah');
      }
      if ((kind === 'send' || kind === 'request' || kind === 'recurring') && !intent?.handle) {
        return fail('Who should I pay?', 'Add a @username — e.g. “Send $10 to @chris”.');
      }
      if (kind === 'send' && intent?.amount != null && intent.amount > d.balance) {
        return fail('Your balance isn’t enough for that.', `You have $${d.balance.toFixed(2)} USDC available. Try a smaller amount or add funds.`);
      }
      if (kind === 'balance') {
        push({ role: 'agent', type: 'answer', answerKind: 'balance', text: `You have $${d.balance.toFixed(2)} USDC available.` });
        return setAgentState('idle');
      }
      if (kind === 'activity') {
        push({ role: 'agent', type: 'answer', answerKind: 'activity', text: 'Here are your most recent payments.' });
        return setAgentState('idle');
      }

      // A money-moving intent — show a preview and wait for explicit confirmation.
      setAgentState('resolving');
      const lead =
        kind === 'send'
          ? `I found ${intent!.handle}. Here’s the payment.`
          : kind === 'request'
            ? `I’ll create a $${(intent!.amount ?? 0).toFixed(2)} USDC request for ${intent!.handle}.`
            : 'Here’s the recurring payment.';
      push({ role: 'agent', type: 'preview', kind, intent: intent!, text: lead, status: 'awaiting' });
      setAgentState('awaiting');
    },
    [draft, agentState, push],
  );

  const setStatus = useCallback((id: number, status: ChatMessage['status']) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }, []);

  const confirm = useCallback(
    async (id: number) => {
      const d = depsRef.current;
      const m = messages.find((x) => x.id === id);
      if (!m || m.type !== 'preview' || m.status !== 'awaiting' || !m.intent) return;
      setStatus(id, 'confirmed');
      setAgentState('processing');
      const it = m.intent;
      const handle = it.handle ?? '';

      if (m.kind === 'send') {
        const r = await d.executeSend({ recipient: handle, amount: String(it.amount ?? '') });
        if (r.ok) {
          push({ role: 'agent', type: 'receipt', kind: 'send', intent: it, result: { status: r.status ?? 'confirmed', txHash: r.txHash, explorerUrl: r.explorerUrl } });
          setAgentState('success');
        } else {
          setStatus(id, 'failed');
          push({ role: 'agent', type: 'error', title: 'Payment failed.', hint: r.error ?? 'Something went wrong settling this payment.' });
          setAgentState('error');
        }
      } else if (m.kind === 'request' && d.createRequest) {
        const r = await d.createRequest({ payer: handle.replace(/^@+/, ''), amount: String(it.amount ?? ''), memo: it.note });
        if (r.ok) push({ role: 'agent', type: 'receipt', kind: 'request', intent: it });
        else push({ role: 'agent', type: 'error', title: 'Couldn’t create the request.', hint: r.error ?? '' });
        setAgentState(r.ok ? 'success' : 'error');
      } else if (m.kind === 'recurring' && d.createRecurring) {
        const r = await d.createRecurring({ payee: handle.replace(/^@+/, ''), amount: String(it.amount ?? ''), cadence: it.cadence });
        if (r.ok) push({ role: 'agent', type: 'receipt', kind: 'recurring', intent: it });
        else push({ role: 'agent', type: 'error', title: 'Couldn’t schedule that.', hint: r.error ?? '' });
        setAgentState(r.ok ? 'success' : 'error');
      } else {
        setAgentState('idle');
        return;
      }
      setTimeout(() => setAgentState('idle'), 1400);
    },
    [messages, push, setStatus],
  );

  const cancel = useCallback(
    (id: number) => {
      setStatus(id, 'cancelled');
      push({ role: 'agent', type: 'text', text: 'Cancelled. Nothing was sent.' });
      setAgentState('idle');
    },
    [push, setStatus],
  );

  return { messages, agentState, draft, setDraft, send, confirm, cancel };
}
