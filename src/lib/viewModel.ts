'use client';

/**
 * Logic layer ported from the `<script data-dc-script>` block of "PrivyPay v3.dc.html".
 *
 * The original is a `DCLogic` class whose `renderVals()` returns a flat bag of values the
 * template binds to. That shape is preserved exactly here so the generated screen components
 * stay a mechanical translation of the design markup — only the state plumbing changed from
 * class `setState` to React hooks.
 */

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent, KeyboardEvent, ReactElement } from 'react';
import { statusColor } from '@/lib/format';

// ---------------------------------------------------------------- static data

/** [handle, name, initial, address] */
export type Contact = [string, string, string, string];

const CONTACTS: Contact[] = [
  ['@sarah', 'Sarah Okafor', 'S', '0x8F…21A'],
  ['@mike', 'Mike Johnson', 'M', '0x41…7C2'],
  ['@designer', 'Ada Nwosu', 'A', '0x9C…04B'],
  ['@john', 'John Mensah', 'J', '0x2D…8E1'],
];

interface Tx {
  id: number;
  dir: 'out' | 'in';
  handle: string;
  name: string;
  initial: string;
  amount: number;
  when: string;
  group: string;
  kind: string;
  status: string;
  date: string;
  hash: string;
}

const TXS: Tx[] = [
  { id: 1, dir: 'out', handle: '@sarah', name: 'Sarah Okafor', initial: 'S', amount: 120, when: 'Today · 10:42 AM', group: 'Today', kind: 'Payment', status: 'Completed', date: 'September 12, 2026', hash: '0x8f…91a' },
  { id: 2, dir: 'in', handle: '@mike', name: 'Mike Johnson', initial: 'M', amount: 250, when: 'Yesterday · 4:18 PM', group: 'Yesterday', kind: 'Request', status: 'Completed', date: 'September 11, 2026', hash: '0x3b…77c' },
  { id: 3, dir: 'out', handle: '@john', name: 'John Mensah', initial: 'J', amount: 10, when: 'Yesterday · 9:02 AM', group: 'Yesterday', kind: 'Payment', status: 'Completed', date: 'September 11, 2026', hash: '0xa1…2f8' },
  { id: 4, dir: 'out', handle: '@designer', name: 'Ada Nwosu', initial: 'A', amount: 200, when: 'Sep 5 · 8:00 AM', group: 'Earlier', kind: 'Recurring', status: 'Completed', date: 'September 5, 2026', hash: '0x77…d10' },
  { id: 5, dir: 'in', handle: '@sarah', name: 'Sarah Okafor', initial: 'S', amount: 64.5, when: 'Sep 2 · 1:26 PM', group: 'Earlier', kind: 'Payment', status: 'Completed', date: 'September 2, 2026', hash: '0x5e…b93' },
];

/** [key, name, description, mark background, mark border, availability] */
type Service = [ServiceKey, string, string, string, string, string];
type ServiceKey = 'chatgpt' | 'claude' | 'whatsapp';

const SERVICES: Service[] = [
  ['chatgpt', 'ChatGPT', 'Send and request payments directly from your conversations.', '#F3F4F6', '#E3E5E9', 'AVAILABLE VIA MCP'],
  ['claude', 'Claude', 'Kick off payments and requests from your Claude workflow.', '#FBF0EA', '#F3DED1', 'AVAILABLE VIA MCP'],
  ['whatsapp', 'WhatsApp', 'Pay and get paid in the chat app you already use every day.', '#EAF3EE', '#D9EBE1', 'LIVE'],
];

const MCP_TOOLS: Array<[string, string]> = [
  ['get_profile', 'Read'], ['get_balance', 'Read'], ['find_contact', 'Read'], ['get_recent_transactions', 'Read'],
  ['get_payment_status', 'Read'], ['create_payment_preview', 'Prepares'], ['confirm_payment', 'Needs approval'], ['create_request', 'Creates request'],
];

const PRIVACY_ROWS: Array<[string, string, string]> = [
  ['Payment activity', 'Who can see the payments on your PrivyPay profile.', 'Private'],
  ['Address display', 'Whether your Celo address is shown alongside your username.', 'On request'],
  ['Transaction notes', 'Notes you attach to payments stay in your account only.', 'Account only'],
  ['Connected services', 'What a connected service may read about your activity.', 'Minimal'],
];

// ---------------------------------------------------------------- state shape

type View = 'landing' | 'auth' | 'onboarding' | 'app';
type HeroStage = 'boot' | 'typing' | 'thinking' | 'resolving' | 'preview' | 'sending' | 'done';
type CmdStage = 'idle' | 'thinking' | 'resolving' | 'preview' | 'processing' | 'done' | 'answer';
type AuthStep = 'welcome' | 'email' | 'code';
type ObStep = 'username' | 'creating' | 'ready';
type Page = 'overview' | 'payments' | 'requests' | 'contacts' | 'recurring' | 'wallet' | 'connected' | 'privacy' | 'settings';
type Sheet = 'send' | 'receive' | 'tx' | null;
type Filter = 'All' | 'Sent' | 'Received' | 'Requests' | 'Recurring';

type IntentKind = 'send' | 'request' | 'recurring' | 'balance' | 'activity' | 'unknown';
interface Intent {
  kind: IntentKind;
  amount?: number;
  handle?: string;
  note?: string;
  cadence?: string;
}

interface RequestRow {
  id: number;
  handle: string;
  initial: string;
  amount: string;
  note: string;
  status: string;
  payable: boolean;
}

interface RecurringRow {
  id: number;
  handle: string;
  amount: string;
  cadence: string;
  next: string;
  paused: boolean;
}

interface State {
  view: View;
  heroStage: HeroStage;
  heroTyped: string;
  cmdInput: string;
  cmdStage: CmdStage;
  cmdIntent: Intent | null;
  /** When an answer is really a prompt back to the user (e.g. no recipient given). */
  cmdPrompt: 'recipient' | null;
  /** The real result of a confirmed send, used to render a truthful receipt. */
  cmdResult: { status: string; txHash?: string | null; explorerUrl?: string | null } | null;
  /** True when the last confirmed action failed — the receipt renders as a failure. */
  cmdFailed: boolean;
  cmdError: string | null;
  authStep: AuthStep;
  authBusy: boolean;
  email: string;
  code: string;
  handleInput: string;
  obStep: ObStep;
  setupTick: number;
  page: Page;
  filter: Filter;
  sheet: Sheet;
  sendStep: number;
  sendTo: string;
  sendPick: Contact | null;
  sendAmount: string;
  reqTo: string;
  reqAmount: string;
  reqNote: string;
  reqSent: RequestRow | null;
  contactQuery: string;
  contactAdd: string;
  contactAdding: boolean;
  privacyOn: boolean;
  connections: Record<ServiceKey, boolean>;
  requests: RequestRow[];
  recurring: RecurringRow[];
  txDetail: number | null;
  copied: boolean;
  copiedHandle: boolean;
  shared: boolean;
  toast: string | null;
  balance: number;
  isMobile: boolean;
}

function initialState(startView: 'landing' | 'app'): State {
  return {
    view: startView === 'app' ? 'app' : 'landing',
    heroStage: 'boot',
    heroTyped: '',
    cmdInput: '',
    cmdStage: 'idle',
    cmdIntent: null,
    cmdPrompt: null,
    cmdResult: null,
    cmdFailed: false,
    cmdError: null,
    authStep: 'welcome',
    authBusy: false,
    email: '',
    code: '',
    handleInput: 'chris',
    obStep: 'username',
    setupTick: 0,
    page: 'overview',
    filter: 'All',
    sheet: null,
    sendStep: 1,
    sendTo: '',
    sendPick: null,
    sendAmount: '',
    reqTo: '',
    reqAmount: '',
    reqNote: '',
    reqSent: null,
    contactQuery: '',
    contactAdd: '',
    contactAdding: false,
    privacyOn: true,
    connections: { chatgpt: true, claude: false, whatsapp: true },
    requests: [
      { id: 1, handle: '@mike', initial: 'M', amount: '250.00', note: 'Logo design', status: 'Pending', payable: false },
      { id: 2, handle: '@sarah', initial: 'S', amount: '48.00', note: 'Dinner split', status: 'Awaiting you', payable: true },
    ],
    recurring: [
      { id: 1, handle: '@designer', amount: '200.00', cadence: 'Every Friday', next: 'Sep 18', paused: false },
      { id: 2, handle: '@john', amount: '25.00', cadence: 'Monthly', next: 'Oct 1', paused: true },
    ],
    txDetail: null,
    copied: false,
    copiedHandle: false,
    shared: false,
    toast: null,
    balance: 842.32,
    isMobile: false,
  };
}

// ---------------------------------------------------------------- pure helpers

function money(n: number): string {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Sparkline used by the hero and the balance card. */
function chart(w: number, h: number, stroke: string, fill: string): ReactElement {
  const pts = [18, 26, 22, 34, 30, 42, 38, 52, 47, 44, 58, 66, 62, 74];
  const max = Math.max.apply(null, pts);
  const min = Math.min.apply(null, pts);
  const step = w / (pts.length - 1);
  const coords = pts.map((p, i) => [i * step, h - ((p - min) / (max - min)) * (h - 6) - 3]);
  const line = coords.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1)).join(' ');
  const area = line + ' L' + w + ' ' + h + ' L0 ' + h + ' Z';
  return createElement(
    'svg',
    { width: '100%', height: h, viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'none', style: { display: 'block' }, 'aria-hidden': 'true' },
    createElement('path', { key: 'a', d: area, fill }),
    createElement('path', { key: 'l', d: line, fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
  );
}

/** Decorative QR stand-in — a deterministic pattern, not a real encoding. */
function qr(cell: number): ReactElement {
  const N = 21;
  const cells: ReactElement[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const ring =
        finder &&
        (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5) || (x > 15 && x < 19 && y > 1 && y < 5) || (x > 1 && x < 5 && y > 15 && y < 19));
      const on = finder ? ring : ((x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0) || (x + y) % 7 === 0;
      cells.push(createElement('div', { key: x + '-' + y, style: { background: on ? '#0E1420' : 'transparent' } }));
    }
  }
  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(21,' + cell + 'px)',
    gridTemplateRows: 'repeat(21,' + cell + 'px)',
    gap: '1px',
    padding: '12px',
    background: '#fff',
    border: '1px solid #EDEFF3',
    borderRadius: '12px',
    width: 'fit-content',
  };
  return createElement('div', { style }, cells);
}

/**
 * `chart()` and `qr()` take fixed arguments and never change, but the QR grids alone are
 * 441 elements each. Building them once at module load keeps them out of the per-render
 * `renderVals` rebuild, which fires on every keystroke and ~18 times during the hero
 * typing boot.
 */
const HERO_CHART = chart(320, 56, '#1B45D7', 'rgba(27,69,215,.08)');
const BALANCE_CHART = chart(320, 52, '#7E9BF5', 'rgba(126,155,245,.14)');
const QR_SMALL = qr(4);
const QR_LARGE = qr(6);

/** Enter/Space activation for the design's clickable, non-button rows. */
function keyFor(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

function stepChrome(done: boolean) {
  return {
    mark: done ? '✓' : '·',
    bg: done ? '#E8F3ED' : '#F2F3F6',
    color: done ? '#167A54' : '#6C7484',
    textColor: done ? '#0E1420' : '#5F6878',
  };
}

function parseCmd(raw: string): Intent | null {
  const low = (raw || '').trim().toLowerCase();
  if (!low) return null;
  const amtM = low.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  const amount = amtM ? parseFloat(amtM[1]) : null;
  const hM = low.match(/@([a-z0-9_]+)/);
  const handle = hM ? '@' + hM[1] : null;
  const every = low.match(/every\s+([a-z]+)/);
  if (/balance|how much/.test(low)) return { kind: 'balance' };
  if (/recent|activity|history|transactions/.test(low)) return { kind: 'activity' };
  // Never invent a recipient. When the message has no @username, the handle stays undefined and
  // the agent asks who to pay rather than silently defaulting to a demo contact.
  if (every && amount) return { kind: 'recurring', amount, handle: handle ?? undefined, cadence: 'Every ' + every[1].charAt(0).toUpperCase() + every[1].slice(1) };
  if (/request|invoice|ask/.test(low) && amount) {
    return { kind: 'request', amount, handle: handle ?? undefined, note: ((low.match(/for\s+(.+)$/) || [])[1] || 'Payment request').replace(/[.]$/, '') };
  }
  if (amount) return { kind: 'send', amount, handle: handle ?? undefined };
  return { kind: 'unknown' };
}

// ---------------------------------------------------------------- the hook

/** Real-execution hooks injected by the app; absent on the landing demo (§25, §31). */
export interface ViewModelHooks {
  /**
   * Execute a real USDC payment. Resolves `ok` with the on-chain outcome (status + tx hash) so
   * the agent card can render a truthful receipt, or `ok:false` with a readable error.
   */
  executeSend?: (args: { recipient: string; amount: string; memo?: string }) => Promise<{
    ok: boolean;
    error?: string;
    status?: 'confirmed' | 'pending' | 'failed';
    txHash?: string | null;
    explorerUrl?: string | null;
  }>;
  /** Add a person to the user's contacts by @username; resolves ok/false with a message. */
  addContact?: (username: string) => Promise<{ ok: boolean; error?: string }>;
  /** Create a payment request asking a @username to pay the user. */
  createRequest?: (args: { payer: string; amount: string; memo?: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Pay a received request: real payment to the requester, then mark it settled. */
  payRequest?: (args: { requestId: string; recipient: string; amount: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Schedule a recurring payment to a @username. */
  createRecurring?: (args: { payee: string; amount: string; cadence?: string; memo?: string }) => Promise<{ ok: boolean; error?: string }>;
  /** Pause or resume a recurring payment. */
  setRecurringPaused?: (id: string, paused: boolean) => Promise<{ ok: boolean; error?: string }>;
  /** Cancel a recurring payment. */
  cancelRecurring?: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

/** A real payment request injected into the app view, replacing the demo request fixtures. */
export interface AppRequest {
  id: string;
  direction: 'incoming' | 'outgoing';
  counterparty: string;
  amount: string;
  memo: string | null;
  status: string;
  payable: boolean;
}

/** A real recurring payment injected into the app view, replacing the demo fixtures. */
export interface AppRecurring {
  id: string;
  counterparty: string;
  amount: string;
  cadence: string;
  next: string;
  paused: boolean;
  status: string;
}

export function useViewModel(
  startView: 'landing' | 'app' = 'landing',
  hooks: ViewModelHooks = {},
  contacts?: Contact[],
  appRequests?: AppRequest[],
  appRecurring?: AppRecurring[],
) {
  const [s, setS] = useState<State>(() => initialState(startView));

  // Real contacts (derived from the signed-in user's activity) replace the demo fixtures in the
  // app; the marketing landing passes none and keeps the demo reel. `null` contacts means "no
  // real data yet" (empty), which is different from `undefined` ("use the demo list").
  const contactsList = contacts ?? CONTACTS;
  // Adding contacts is a real-app capability; the marketing demo has no such hook.
  const canAddContact = !!hooks.addContact;
  const contactsRef = useRef<Contact[]>(contactsList);
  useEffect(() => {
    contactsRef.current = contacts ?? CONTACTS;
  }, [contacts]);

  // Hooks read through a ref so the action callbacks stay referentially stable.
  const hooksRef = useRef(hooks);
  useEffect(() => {
    hooksRef.current = hooks;
  }, [hooks]);

  // Mirrors `this.state` for reads inside timer callbacks, which outlive the render that
  // scheduled them. Written from an effect so nothing mutates a ref during render.
  const stateRef = useRef(s);
  useEffect(() => {
    stateRef.current = s;
  }, [s]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const heroTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cmdTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setState = useCallback((patch: Partial<State> | ((prev: State) => Partial<State>)) => {
    setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const flash = useCallback(
    (text: string) => {
      setState({ toast: text });
      later(() => setState({ toast: null }), 1850);
    },
    [setState, later],
  );

  const heroConfirm = useCallback(() => {
    setState({ heroStage: 'sending' });
    heroTimers.current.push(setTimeout(() => setState({ heroStage: 'done' }), 1450));
  }, [setState]);

  const startHero = useCallback(() => {
    const text = 'Send $20 to @sarah';
    heroTimers.current.forEach(clearTimeout);
    heroTimers.current = [];
    const at = (fn: () => void, ms: number) => heroTimers.current.push(setTimeout(fn, ms));
    setState({ heroStage: 'typing', heroTyped: '' });
    for (let i = 1; i <= text.length; i++) at(() => setState({ heroTyped: text.slice(0, i) }), 200 + i * 46);
    const t0 = 200 + text.length * 46;
    at(() => setState({ heroStage: 'thinking' }), t0 + 240);
    at(() => setState({ heroStage: 'resolving' }), t0 + 950);
    at(() => setState({ heroStage: 'preview' }), t0 + 1750);
    // If nobody confirmed the demo payment, the reel confirms itself and plays on.
    at(() => {
      if (stateRef.current.heroStage === 'preview') heroConfirm();
    }, t0 + 5600);
  }, [setState, heroConfirm]);

  // componentDidMount / componentWillUnmount
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 860;
      setS((prev) => (prev.isMobile === mobile ? prev : { ...prev, isMobile: mobile }));
    };
    onResize();
    window.addEventListener('resize', onResize);
    later(startHero, 420);

    const all = [timers, heroTimers, cmdTimers];
    return () => {
      window.removeEventListener('resize', onResize);
      all.forEach((ref) => {
        ref.current.forEach(clearTimeout);
        ref.current = [];
      });
    };
    // Mount-only, matching the class lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCmdWith = useCallback(
    (raw: string) => {
      const intent = parseCmd(raw);
      if (!intent) return;
      cmdTimers.current.forEach(clearTimeout);
      cmdTimers.current = [];
      const at = (fn: () => void, ms: number) => cmdTimers.current.push(setTimeout(fn, ms));
      // A payment intent with no @username can't proceed — ask who to pay instead of guessing.
      const needsRecipient = (intent.kind === 'send' || intent.kind === 'request' || intent.kind === 'recurring') && !intent.handle;
      setState({ cmdInput: raw, cmdIntent: intent, cmdStage: 'thinking', cmdPrompt: needsRecipient ? 'recipient' : null });
      if (needsRecipient || intent.kind === 'balance' || intent.kind === 'activity' || intent.kind === 'unknown') {
        at(() => setState({ cmdStage: 'answer' }), 850);
        return;
      }
      at(() => setState({ cmdStage: 'resolving' }), 700);
      at(() => setState({ cmdStage: 'preview' }), 1650);
    },
    [setState],
  );

  const cmdConfirmWith = useCallback((it: Intent | null) => {
    if (!it) return;
    setState({ cmdStage: 'processing' });
    const done = () => setState({ cmdStage: 'done', cmdFailed: false, cmdError: null });
    const failed = (msg: string) => setState({ cmdStage: 'done', cmdFailed: true, cmdResult: { status: 'failed' }, cmdError: msg });
    const handle = (it.handle ?? '').replace(/^@+/, '');

    // Real payment path: a send goes through the engine (preview → authorize → sign →
    // broadcast → confirm). The receipt shows the real outcome (Completed/Pending/Failed).
    if (it.kind === 'send' && hooksRef.current.executeSend) {
      hooksRef.current
        .executeSend({ recipient: it.handle ?? '', amount: String(it.amount ?? '') })
        .then((r) => {
          if (r.ok) {
            setState({
              cmdStage: 'done',
              cmdFailed: false,
              cmdError: null,
              cmdResult: { status: r.status ?? 'confirmed', txHash: r.txHash, explorerUrl: r.explorerUrl },
            });
          } else {
            // Show the failure on the receipt (a real status the user asked for), not just a toast.
            setState({ cmdStage: 'done', cmdFailed: true, cmdResult: { status: 'failed' }, cmdError: r.error ?? 'Payment could not be completed.' });
          }
        });
      return;
    }

    // Real request: create it server-side (the list refreshes from the server).
    if (it.kind === 'request' && hooksRef.current.createRequest) {
      hooksRef.current
        .createRequest({ payer: handle, amount: String(it.amount ?? ''), memo: it.note || undefined })
        .then((r) => (r.ok ? done() : failed(r.error ?? 'Could not create request.')));
      return;
    }

    // Real recurring: schedule it server-side.
    if (it.kind === 'recurring' && hooksRef.current.createRecurring) {
      hooksRef.current
        .createRecurring({ payee: handle, amount: String(it.amount ?? ''), cadence: it.cadence })
        .then((r) => (r.ok ? done() : failed(r.error ?? 'Could not schedule payment.')));
      return;
    }

    cmdTimers.current.push(
      setTimeout(() => {
        if (it.kind === 'send') setState((st) => ({ balance: Math.max(0, st.balance - (it.amount ?? 0)) }));
        if (it.kind === 'request') {
          setState((st) => ({
            requests: [
              {
                id: Date.now(),
                handle: it.handle ?? '',
                initial: (it.handle ?? ' ').charAt(1).toUpperCase(),
                amount: money(it.amount ?? 0),
                note: it.note ?? '',
                status: 'Pending',
                payable: false,
              },
            ].concat(st.requests),
          }));
        }
        if (it.kind === 'recurring') {
          setState((st) => ({
            recurring: st.recurring.concat([
              { id: Date.now(), handle: it.handle ?? '', amount: money(it.amount ?? 0), cadence: it.cadence ?? '', next: 'Sep 18', paused: false },
            ]),
          }));
        }
        setState({ cmdStage: 'done' });
      }, 1500),
    );
  }, [setState, flash]);

  const cmdReset = useCallback(
    () => setState({ cmdStage: 'idle', cmdIntent: null, cmdInput: '', cmdPrompt: null, cmdResult: null, cmdFailed: false, cmdError: null }),
    [setState],
  );

  const addContactWith = useCallback(
    (raw: string) => {
      const name = raw.replace(/^@+/, '').trim().toLowerCase();
      if (name.length < 3 || !hooksRef.current.addContact) return;
      setState({ contactAdding: true });
      hooksRef.current.addContact(name).then((r) => {
        if (r.ok) {
          setState({ contactAdd: '', contactAdding: false });
          flash('Added @' + name);
        } else {
          setState({ contactAdding: false });
          flash(r.error ?? 'Could not add contact.');
        }
      });
    },
    [setState, flash],
  );

  const createRequestWith = useCallback(
    (st: State) => {
      if (!st.reqTo || !(parseFloat(st.reqAmount) > 0)) return;
      const to = st.reqTo.startsWith('@') ? st.reqTo : '@' + st.reqTo;
      const receipt: RequestRow = {
        id: Date.now(),
        handle: to,
        initial: (to[1] ?? '?').toUpperCase(),
        amount: money(parseFloat(st.reqAmount)),
        note: st.reqNote || 'Payment request',
        status: 'Pending',
        payable: false,
      };
      // Real path: create server-side; the list refreshes from the server (appRequests).
      if (hooksRef.current.createRequest) {
        hooksRef.current
          .createRequest({ payer: to.replace(/^@+/, ''), amount: st.reqAmount, memo: st.reqNote || undefined })
          .then((r) => {
            if (r.ok) setState({ reqSent: receipt, reqTo: '', reqAmount: '', reqNote: '' });
            else flash(r.error ?? 'Could not create request.');
          });
        return;
      }
      // Demo path: keep it local.
      setState((prev) => ({ reqSent: receipt, requests: [receipt].concat(prev.requests), reqTo: '', reqAmount: '', reqNote: '' }));
    },
    [setState, flash],
  );

  const payRequestWith = useCallback(
    (row: { id: string | number; handle: string; payAmount: string; payable: boolean }) => {
      if (!row.payable) return;
      // Real path: pay the requester through the engine, then mark the request settled.
      if (hooksRef.current.payRequest) {
        flash('Sending payment to ' + row.handle + '…');
        hooksRef.current
          .payRequest({ requestId: String(row.id), recipient: row.handle, amount: row.payAmount })
          .then((r) => flash(r.ok ? 'Payment sent to ' + row.handle : r.error ?? 'Payment failed.'));
        return;
      }
      // Demo path: local mark-paid + balance deduction.
      setState((st) => ({
        requests: st.requests.map((x) => (x.id === row.id ? { ...x, status: 'Paid', payable: false } : x)),
        balance: Math.max(0, st.balance - (parseFloat(row.payAmount) || 0)),
      }));
      flash('Payment sent to ' + row.handle);
    },
    [setState, flash],
  );

  const toggleRecurringWith = useCallback(
    (row: { id: string | number; handle: string; paused: boolean }) => {
      const label = row.paused ? 'Resumed ' + row.handle : 'Paused ' + row.handle;
      if (hooksRef.current.setRecurringPaused) {
        hooksRef.current.setRecurringPaused(String(row.id), !row.paused).then((r) => flash(r.ok ? label : r.error ?? 'Could not update.'));
        return;
      }
      setState((st) => ({ recurring: st.recurring.map((x) => (x.id === row.id ? { ...x, paused: !x.paused } : x)) }));
      flash(label);
    },
    [setState, flash],
  );

  const cancelRecurringWith = useCallback(
    (row: { id: string | number; handle: string }) => {
      if (hooksRef.current.cancelRecurring) {
        hooksRef.current.cancelRecurring(String(row.id)).then((r) => flash(r.ok ? 'Cancelled ' + row.handle : r.error ?? 'Could not cancel.'));
        return;
      }
      setState((st) => ({ recurring: st.recurring.filter((x) => x.id !== row.id) }));
      flash('Cancelled ' + row.handle);
    },
    [setState, flash],
  );

  const startSetupWith = useCallback((handleInput: string) => {
    if (handleInput.length < 3) return;
    setState({ obStep: 'creating', setupTick: 0 });
    [1, 2, 3, 4].forEach((n) => later(() => setState({ setupTick: n }), n * 380));
    later(() => setState({ obStep: 'ready' }), 1760);
  }, [setState, later]);

  const sendNextWith = useCallback((st: State) => {
    if (st.sendStep === 1) {
      const q = (st.sendTo || '').replace('@', '').trim().toLowerCase();
      if (q.length < 2) return;
      const found = contactsRef.current.find((c) => c[0].slice(1) === q);
      // Not a known contact — carry the handle forward with a clear label (no fake address). The
      // engine resolves the real @username server-side and rejects it if no such user exists.
      setState({ sendPick: found || (['@' + q, 'Not in your contacts', q[0].toUpperCase(), ''] as Contact), sendStep: 2 });
      return;
    }
    if (st.sendStep === 2) {
      if (!(parseFloat(st.sendAmount) > 0)) return;
      setState({ sendStep: 3 });
      return;
    }
    if (st.sendStep === 3) {
      setState({ sendStep: 4 });
      // Real payment through the engine when wired; otherwise the demo transition.
      if (hooksRef.current.executeSend) {
        const recipient = st.sendPick ? st.sendPick[0] : st.sendTo;
        hooksRef.current.executeSend({ recipient, amount: st.sendAmount }).then((r) => {
          if (r.ok) setState({ sendStep: 5 });
          else {
            flash(r.error ?? 'Payment could not be completed.');
            setState({ sendStep: 3 });
          }
        });
        return;
      }
      const amt = parseFloat(st.sendAmount) || 0;
      later(() => setState((prev) => ({ sendStep: 5, balance: Math.max(0, prev.balance - amt) })), 1450);
      return;
    }
    if (st.sendStep === 5) setState({ sheet: null });
  }, [setState, later, flash]);

  const nav = useCallback(
    (page: Page) => () => {
      setState({ page, sheet: null });
      window.scrollTo(0, 0);
    },
    [setState],
  );

  // -------------------------------------------------------------- renderVals

  return useMemo(() => {
    const mobile = s.isMobile;
    const handle = '@' + (s.handleInput || 'chris');
    const pick = s.sendPick;

    const headings: Record<Page, [string, string]> = {
      overview: ['Good morning, Chris', handle + ' · wallet ready'],
      payments: ['Payments', 'Everything you have sent and received'],
      requests: ['Requests', 'Money you asked for, and money asked of you'],
      contacts: ['Contacts', 'People you pay by username'],
      recurring: ['Recurring', 'Payments that repeat on a schedule'],
      wallet: ['Payment wallet', 'Your provisioned Celo account'],
      connected: ['Connected services', 'PrivyPay works with the tools you already use'],
      privacy: ['Privacy', 'Control how payment information is presented and shared'],
      settings: ['Settings', 'Your account, limits and payment wallet'],
    };

    const navGroups = (
      [
        { label: '', hasLabel: false, keys: [['overview', 'Overview'], ['payments', 'Payments'], ['requests', 'Requests'], ['contacts', 'Contacts'], ['recurring', 'Recurring']] },
        { label: 'WALLET', hasLabel: true, keys: [['wallet', 'Wallet details'], ['receive', 'Receive']] },
        { label: 'CONNECTED', hasLabel: true, keys: [['connected', 'Connected services']] },
        { label: 'SECURITY', hasLabel: true, keys: [['privacy', 'Privacy'], ['settings', 'Settings']] },
      ] as Array<{ label: string; hasLabel: boolean; keys: Array<[string, string]> }>
    ).map((g) => ({
      label: g.label,
      hasLabel: g.hasLabel,
      items: g.keys.map(([k, label]) => {
        const active = s.page === k;
        const onClick = k === 'receive' ? () => setState({ sheet: 'receive' }) : nav(k as Page);
        return {
          key: k,
          label,
          onClick,
          onKey: keyFor(onClick),
          bg: active ? '#EDF1FE' : 'transparent',
          dot: active ? '#1B45D7' : '#D2D7DF',
          color: active ? '#153AB4' : '#5B6472',
          weight: active ? '600' : '450',
        };
      }),
    }));

    const txRow = (t: Tx) => {
      const open = () => setState({ sheet: 'tx', txDetail: t.id });
      return {
        ...t,
        sub: t.when + (t.kind === 'Recurring' ? ' · recurring' : ''),
        amountStr: (t.dir === 'out' ? '-$' : '+$') + money(t.amount),
        amountColor: t.dir === 'out' ? '#0E1420' : '#167A54',
        avatarBg: t.dir === 'out' ? '#F1F2F5' : '#E8F3ED',
        avatarColor: t.dir === 'out' ? '#5B6472' : '#167A54',
        statusColor: statusColor(t.status),
        onClick: open,
        onKey: keyFor(open),
      };
    };

    const filtered = TXS.filter((t) =>
      s.filter === 'All' ? true : s.filter === 'Sent' ? t.dir === 'out' : s.filter === 'Received' ? t.dir === 'in' : s.filter === 'Requests' ? t.kind === 'Request' : t.kind === 'Recurring',
    ).map(txRow);

    const groupOrder = ['Today', 'Yesterday', 'Earlier'];
    const activityGroups = groupOrder
      .map((label) => ({ label: label.toUpperCase(), rows: TXS.filter((t) => t.group === label).map(txRow) }))
      .filter((g) => g.rows.length);

    const cq = s.contactQuery.replace('@', '').toLowerCase();
    const contactRows = contactsList.filter((c) => !cq || c[0].slice(1).includes(cq) || c[1].toLowerCase().includes(cq)).map(([h, name, initial, address]) => ({
      handle: h,
      name,
      initial,
      address,
      onSend: () => setState({ sheet: 'send', sendStep: 2, sendPick: [h, name, initial, address] as Contact, sendAmount: '' }),
      onRequest: () => {
        setState({ page: 'requests', reqTo: h, reqSent: null });
        window.scrollTo(0, 0);
      },
    }));

    const tx = s.txDetail !== null ? TXS.find((t) => t.id === s.txDetail) : null;
    const sentAmt = parseFloat(s.sendAmount) || 0;
    const setupLabels = ['Creating your account', 'Preparing your wallet', 'Connecting to Celo infrastructure', 'Finalising your payment identity'];

    const heroOrder: HeroStage[] = ['boot', 'typing', 'thinking', 'resolving', 'preview', 'sending', 'done'];
    const heroAt = heroOrder.indexOf(s.heroStage);

    const it = s.cmdIntent;
    const itContact = it && it.handle ? contactsList.find((c) => c[0].toLowerCase() === it.handle!.toLowerCase()) : null;
    const cmdKnownContact = !!itContact;
    const cmdWorkingStage = s.cmdStage === 'thinking' || s.cmdStage === 'resolving';
    const cmdKindLabel: IntentKind | '' = it ? it.kind : '';

    // Real receipt values from the confirmed send (no fabricated hash/status).
    const receiptStatus = s.cmdFailed ? 'Failed' : s.cmdResult?.status === 'pending' ? 'Pending' : 'Completed';
    const receiptHash = s.cmdResult?.txHash ? s.cmdResult.txHash.slice(0, 6) + '…' + s.cmdResult.txHash.slice(-4) : '';

    type Row = { label: string; value: string; color?: string };
    const cmdMeta: Row[] =
      cmdKindLabel === 'send'
        ? [
            { label: 'To', value: it?.handle ?? '' },
            { label: 'Recipient', value: cmdKnownContact ? 'In your contacts' : 'Not in your contacts' },
            { label: 'Network', value: 'Celo' },
            { label: 'Estimated fee', value: '$0.001' },
          ]
        : cmdKindLabel === 'request'
          ? [
              { label: 'For', value: it?.note ?? '' },
              { label: 'Network', value: 'Celo' },
              { label: 'Status after sending', value: 'Pending' },
            ]
          : cmdKindLabel === 'recurring'
            ? [
                { label: 'Schedule', value: it?.cadence ?? '' },
                { label: 'Next payment', value: 'Sep 18' },
                { label: 'Network', value: 'Celo' },
              ]
            : [];

    const cmdReceipt: Row[] =
      cmdKindLabel === 'send'
        ? [
            { label: 'To', value: it?.handle ?? '' },
            { label: 'Network', value: 'Celo' },
            { label: 'Status', value: receiptStatus, color: statusColor(receiptStatus) },
            ...(receiptHash ? [{ label: 'Transaction', value: receiptHash }] : []),
            ...(s.cmdFailed && s.cmdError ? [{ label: 'Reason', value: s.cmdError }] : []),
          ]
        : cmdKindLabel === 'request'
          ? [
              { label: 'From', value: it?.handle ?? '' },
              { label: 'For', value: it?.note ?? '' },
              { label: 'Status', value: 'Pending' },
            ]
          : cmdKindLabel === 'recurring'
            ? [
                { label: 'To', value: it?.handle ?? '' },
                { label: 'Schedule', value: it?.cadence ?? '' },
                { label: 'Next payment', value: 'Sep 18' },
                { label: 'Status', value: 'Active' },
              ]
            : [];

    const needsRecipient = s.cmdPrompt === 'recipient';
    type AnswerRow = { handle: string; sub: string; amount: string; color: string };
    const cmdAnswerRows: AnswerRow[] = needsRecipient
      ? []
      : cmdKindLabel === 'activity'
        ? TXS.slice(0, 3).map((t) => ({ handle: t.handle, sub: t.when, amount: (t.dir === 'out' ? '-$' : '+$') + money(t.amount), color: t.dir === 'out' ? '#0E1420' : '#167A54' }))
        : cmdKindLabel === 'balance'
          ? [
              { handle: 'Celo', sub: 'Settlement network', amount: 'Wallet ready', color: '#167A54' },
              { handle: 'This month', sub: 'Sent · received', amount: '-$330.00 · +$314.50', color: '#5B6472' },
            ]
          : [
              { handle: 'Payments', sub: 'Send, request, schedule', amount: '', color: '#5B6472' },
              { handle: 'Answers', sub: 'Balance, activity, status', amount: '', color: '#5B6472' },
            ];

    const emailValid = /.+@.+\..+/.test(s.email);

    // Agent suggestions from the people you actually pay (your contacts), not demo names. With no
    // contacts yet, only the info prompts show — never an invented @username.
    const cmdPicks = contactsList.slice(0, 2);
    const cmdSuggestionLabels = [
      ...cmdPicks.map((c) => `Send $10 to ${c[0]}`),
      ...(cmdPicks.length ? [`Request $20 from ${cmdPicks[0][0]}`] : []),
      "What's my balance?",
      'Show recent payments',
    ];

    // Request list: real requests (both directions) when signed in, else the demo fixtures. Each
    // row carries a decimal `payAmount` for the pay-through-engine action and a display `amount`.
    const statusLabelFor = (r: AppRequest) =>
      r.status === 'PAID' ? 'Paid' : r.status === 'CANCELLED' ? 'Cancelled' : r.payable ? 'Awaiting you' : 'Pending';
    const requestSource: Array<RequestRow & { payAmount: string }> = appRequests
      ? appRequests.map((r) => ({
          id: r.id as unknown as number,
          handle: r.counterparty,
          initial: (r.counterparty.replace(/^@/, '')[0] ?? '?').toUpperCase(),
          amount: money(parseFloat(r.amount)),
          note: r.memo ?? (r.direction === 'incoming' ? 'Requested from you' : 'You requested'),
          status: statusLabelFor(r),
          payable: r.payable,
          payAmount: r.amount,
        }))
      : s.requests.map((r) => ({ ...r, payAmount: r.amount.replace(/,/g, '') }));
    const requestStatusColor = (label: string) =>
      label === 'Paid' ? '#167A54' : label === 'Cancelled' ? '#B42318' : '#B7791F';

    // Recurring list: real schedules when signed in, else the demo fixtures.
    const recurringSource: Array<{ id: string | number; handle: string; amount: string; cadence: string; next: string; paused: boolean }> =
      appRecurring
        ? appRecurring.map((r) => ({ id: r.id, handle: r.counterparty, amount: money(parseFloat(r.amount)), cadence: r.cadence, next: r.next, paused: r.paused }))
        : s.recurring;
    // The dashboard "Next recurring payment" card shows the soonest active schedule (or none).
    const nextRecurring = recurringSource.find((r) => !r.paused) ?? recurringSource[0] ?? null;

    return {
      isLanding: s.view === 'landing',
      isAuth: s.view === 'auth',
      isOnboarding: s.view === 'onboarding',
      isApp: s.view === 'app',
      isMobile: mobile,
      isDesktop: !mobile,
      mainPadBottom: mobile ? '86px' : '0px',
      enterApp: () => {
        setState({ view: 'auth', authStep: 'welcome' });
        window.scrollTo(0, 0);
      },
      goLanding: () => {
        setState({ view: 'landing' });
        window.scrollTo(0, 0);
      },
      stop: (e: { stopPropagation: () => void }) => e.stopPropagation(),

      heroChart: HERO_CHART,
      balanceChart: BALANCE_CHART,

      heroStage: s.heroStage,
      heroTyped: s.heroTyped,
      heroStateLabel:
        ({ boot: 'Ready', typing: 'Listening', thinking: 'Understanding request', resolving: 'Finding @sarah', preview: 'Awaiting confirmation', sending: 'Sending payment', done: 'Payment sent' } as Record<HeroStage, string>)[
          s.heroStage
        ] || 'Ready',
      heroWorking: s.heroStage === 'thinking' || s.heroStage === 'resolving',
      heroSteps: ([['Understanding request', 2], ['Resolving recipient', 3], ['Preparing payment', 4]] as Array<[string, number]>).map(([label, idx]) => ({
        label,
        ...stepChrome(heroAt > idx),
      })),
      heroHasRecipient: heroAt >= 3,
      heroPreview: s.heroStage === 'preview',
      heroSending: s.heroStage === 'sending',
      heroDone: s.heroStage === 'done',
      heroConfirm,
      heroReplay: startHero,

      cmdInput: s.cmdInput,
      onCmdInput: (e: ChangeEvent<HTMLInputElement>) => setState({ cmdInput: e.target.value }),
      onCmdKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter') runCmdWith(s.cmdInput);
      },
      runCmd: () => runCmdWith(s.cmdInput),
      cmdReset,
      cmdConfirm: () => cmdConfirmWith(s.cmdIntent),
      cmdStateLabel:
        ({ idle: 'Ready', thinking: 'Understanding request', resolving: 'Resolving recipient', preview: 'Awaiting confirmation', processing: 'Sending payment', done: 'Completed', answer: 'Answered' } as Record<CmdStage, string>)[
          s.cmdStage
        ] || 'Ready',
      cmdIdle: s.cmdStage === 'idle',
      cmdWorking: cmdWorkingStage,
      cmdStatusLabel: s.cmdStage === 'resolving' ? 'Finding ' + ((it && it.handle) || 'recipient') + '…' : 'Understanding request…',
      cmdSteps: ([['Understanding request', 1], ['Resolving recipient', 2], ['Preparing payment', 3]] as Array<[string, number]>).map(([label, idx]) => {
        const order: CmdStage[] = ['idle', 'thinking', 'resolving', 'preview', 'processing', 'done'];
        return { label, ...stepChrome(order.indexOf(s.cmdStage) > idx) };
      }),
      cmdSuggestions: cmdSuggestionLabels.map((label) => {
        // `runCmdWith` touches the cmd-timer ref, and the lint rule cannot see that
        // `keyFor` only stores the callback rather than invoking it during render.
        // eslint-disable-next-line react-hooks/refs
        const onClick = () => runCmdWith(label);
        return { label, onClick, onKey: keyFor(onClick) };
      }),
      cmdPreview: s.cmdStage === 'preview',
      cmdProcessing: s.cmdStage === 'processing',
      cmdDone: s.cmdStage === 'done',
      cmdAnswer: s.cmdStage === 'answer',
      cmdPreviewTitle: cmdKindLabel === 'request' ? 'Payment request ready' : cmdKindLabel === 'recurring' ? 'Recurring payment ready' : 'Payment ready for confirmation',
      cmdConfirmLabel: cmdKindLabel === 'request' ? 'Send request' : cmdKindLabel === 'recurring' ? 'Confirm recurring payment' : 'Confirm payment',
      cmdDoneTitle: s.cmdFailed
        ? 'Payment failed'
        : cmdKindLabel === 'request'
          ? 'Request sent'
          : cmdKindLabel === 'recurring'
            ? 'Recurring payment created'
            : 'Payment sent',
      // The receipt icon reflects the real outcome: a red ✕ on failure, the accent ✓ on success.
      cmdDoneMark: s.cmdFailed ? '✕' : '✓',
      cmdDoneMarkBg: s.cmdFailed ? '#B42318' : '#1B45D7',
      cmdHandle: it && it.handle ? it.handle : '',
      cmdName: itContact ? itContact[1] : it && it.handle ? 'Not in your contacts' : '',
      cmdInitial: it && it.handle ? it.handle.charAt(1).toUpperCase() : '',
      cmdAmountStr: it && it.amount ? money(it.amount) : '0.00',
      cmdMetaRows: cmdMeta,
      cmdReceiptRows: cmdReceipt,
      cmdAnswerLabel: needsRecipient
        ? 'Who should I pay?'
        : cmdKindLabel === 'balance'
          ? 'Total balance'
          : cmdKindLabel === 'activity'
            ? 'Recent payments'
            : 'I can help with payments',
      cmdAnswerValue: needsRecipient
        ? 'Add a @username — e.g. Send $10 to @chris'
        : cmdKindLabel === 'balance'
          ? '$' + money(s.balance) + ' USDC'
          : cmdKindLabel === 'activity'
            ? 'Last three payments'
            : 'Try: Send $10 to a @username',
      cmdAnswerRows,

      qrSmall: QR_SMALL,
      qrLarge: QR_LARGE,

      serviceCards: SERVICES.map(([k, name, desc, markBg, markBorder, availability], i) => {
        const open = () => {
          setState({ view: 'auth', authStep: 'welcome' });
          window.scrollTo(0, 0);
        };
        return {
          index: '0' + (i + 1),
          name,
          desc,
          markBg,
          markBorder,
          availability,
          isChatgpt: k === 'chatgpt',
          isClaude: k === 'claude',
          isWhatsapp: k === 'whatsapp',
          reveal: i === 0 ? 'left' : i === 1 ? 'up' : 'right',
          delay: String(i * 100),
          onOpen: open,
          onKey: keyFor(open),
        };
      }),

      authSub: s.authStep === 'email' ? 'We will email you a one-time code.' : s.authStep === 'code' ? 'Enter the code to continue.' : 'Sign in with a passkey, or use your email.',
      authWelcome: s.authStep === 'welcome',
      authEmail: s.authStep === 'email',
      authCode: s.authStep === 'code',
      email: s.email,
      code: s.code,
      codeTarget: s.email || 'your inbox',
      onEmail: (e: ChangeEvent<HTMLInputElement>) => setState({ email: e.target.value }),
      onCode: (e: ChangeEvent<HTMLInputElement>) => setState({ code: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }),
      onEmailKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter' && emailValid) setState({ authStep: 'code' });
      },
      onCodeKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter') setState({ view: 'onboarding' });
      },
      emailOpacity: emailValid ? '1' : '.45',
      goEmail: () => setState({ authStep: 'email' }),
      backToWelcome: () => setState({ authStep: 'welcome' }),
      sendCode: () => {
        if (emailValid) setState({ authStep: 'code' });
      },
      verifyCode: () => setState({ view: 'onboarding' }),
      // Resend a one-time code (real behavior wired in the login route). Demo default no-op.
      resendCode: () => {},
      resendLabel: 'Resend code',
      passkeyLabel: s.authBusy ? 'Waiting for your device…' : 'Continue with a passkey',
      usePasskey: () => {
        if (s.authBusy) return;
        setState({ authBusy: true });
        later(() => setState({ authBusy: false, view: 'onboarding' }), 1100);
      },

      obUsername: s.obStep === 'username',
      obCreating: s.obStep === 'creating',
      obReady: s.obStep === 'ready',
      handleInput: s.handleInput,
      handleDisplay: handle,
      // Demo placeholder; AppGate overrides this with the real provisioned Celo address.
      walletAddress: '0x8A…29F',
      handleOk: s.handleInput.length > 2,
      handleOpacity: s.handleInput.length > 2 ? '1' : '.45',
      onHandle: (e: ChangeEvent<HTMLInputElement>) => setState({ handleInput: e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase().slice(0, 18) }),
      onHandleKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter') startSetupWith(s.handleInput);
      },
      createWallet: () => startSetupWith(s.handleInput),
      setupSteps: setupLabels.map((label, i) => {
        const done = s.setupTick > i;
        return { label, mark: done ? '✓' : '·', bg: done ? '#E8F3ED' : '#F2F3F6', color: done ? '#167A54' : '#6C7484', textColor: done ? '#0E1420' : '#5F6878' };
      }),
      setupProgress: Math.round((s.setupTick / setupLabels.length) * 100) + '%',
      finishOnboarding: () => {
        setState({ view: 'app', page: 'overview' });
        window.scrollTo(0, 0);
      },

      navGroups,
      mobileNav: ([['overview', 'Home'], ['payments', 'Payments'], ['requests', 'Requests'], ['contacts', 'Contacts']] as Array<[Page, string]>).map(([k, label]) => {
        const active = s.page === k;
        return { key: k, label, onClick: nav(k), dot: active ? '#1B45D7' : 'transparent', color: active ? '#153AB4' : '#5F6878', weight: active ? '600' : '450' };
      }),

      pageHeading: (headings[s.page] || ['PrivyPay', ''])[0],
      pageSub: (headings[s.page] || ['', ''])[1],
      isOverview: s.page === 'overview',
      isPayments: s.page === 'payments',
      isRequests: s.page === 'requests',
      isContacts: s.page === 'contacts',
      isRecurring: s.page === 'recurring',
      isWallet: s.page === 'wallet',
      isConnected: s.page === 'connected',
      isPrivacy: s.page === 'privacy',
      isSettings: s.page === 'settings',
      goActivity: nav('payments'),
      goActivityKey: keyFor(nav('payments')),
      goWallet: nav('wallet'),
      // Dashboard "home" — used for the app logo, which must stay inside the app rather than
      // navigate to the marketing landing.
      goHome: nav('overview'),

      balanceStr: money(s.balance),
      balanceChange: '+$314.50 this month',
      sentMonth: money(330),
      receivedMonth: money(314.5),

      quickActions: (
        [
          ['Send money', '↗', () => setState({ sheet: 'send', sendStep: 1, sendTo: '', sendPick: null, sendAmount: '' })],
          ['Receive money', '↙', () => setState({ sheet: 'receive' })],
          ['Request payment', '⇄', nav('requests')],
          ['Recurring payments', '↻', nav('recurring')],
        ] as Array<[string, string, () => void]>
      ).map(([label, icon, onClick]) => ({ label, icon, onClick, onKey: keyFor(onClick) })),

      recentTxs: TXS.slice(0, 4).map(txRow),
      activityGroups,
      filters: (['All', 'Sent', 'Received', 'Requests', 'Recurring'] as Filter[]).map((label) => {
        const active = s.filter === label;
        const onClick = () => setState({ filter: label });
        return { label, onClick, onKey: keyFor(onClick), bg: active ? '#0E1420' : '#fff', color: active ? '#fff' : '#5B6472', border: active ? '#0E1420' : '#DCE0E7' };
      }),
      filteredTxs: filtered,
      noTxs: filtered.length === 0,

      contactQuery: s.contactQuery,
      onContactQuery: (e: ChangeEvent<HTMLInputElement>) => setState({ contactQuery: e.target.value }),
      contactRows,
      noContacts: contactRows.length === 0,
      contactsEmptyTitle: contactRows.length === 0 && !s.contactQuery ? 'No contacts yet' : 'No matches',
      contactsEmptySub:
        contactRows.length === 0 && !s.contactQuery
          ? canAddContact
            ? 'Add someone by their @username to pay them fast.'
            : 'People you pay will appear here.'
          : 'Try another username.',
      // Add-a-contact affordance (real app only).
      canAddContact,
      contactAdd: s.contactAdd,
      onContactAdd: (e: ChangeEvent<HTMLInputElement>) => setState({ contactAdd: e.target.value.replace(/[^a-z0-9_@]/gi, '').toLowerCase().slice(0, 21) }),
      onContactAddKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter') addContactWith(s.contactAdd);
      },
      addContact: () => addContactWith(s.contactAdd),
      contactAddLabel: s.contactAdding ? 'Adding…' : 'Add contact',
      contactAddDisabled: s.contactAdding || s.contactAdd.replace(/^@+/, '').trim().length < 3,
      contactAddOpacity: s.contactAdding || s.contactAdd.replace(/^@+/, '').trim().length < 3 ? '.5' : '1',

      reqTo: s.reqTo,
      reqAmount: s.reqAmount,
      reqNote: s.reqNote,
      onReqTo: (e: ChangeEvent<HTMLInputElement>) => setState({ reqTo: e.target.value }),
      onReqAmount: (e: ChangeEvent<HTMLInputElement>) => setState({ reqAmount: e.target.value.replace(/[^0-9.]/g, '') }),
      onReqNote: (e: ChangeEvent<HTMLInputElement>) => setState({ reqNote: e.target.value }),
      reqFormOpen: !s.reqSent,
      reqDone: !!s.reqSent,
      reqOpacity: s.reqTo && parseFloat(s.reqAmount) > 0 ? '1' : '.45',
      createRequest: () => createRequestWith(s),
      newRequest: () => setState({ reqSent: null }),
      sentReqTo: s.reqSent ? s.reqSent.handle : '',
      sentReqAmount: s.reqSent ? s.reqSent.amount : '',
      sentReqNote: s.reqSent ? s.reqSent.note : '',
      requestRows: requestSource.map((r) => ({
        ...r,
        statusColor: requestStatusColor(r.status),
        onPay: () => payRequestWith(r),
      })),
      noRequests: requestSource.length === 0,

      recurringRows: recurringSource.map((r) => ({
        ...r,
        statusLabel: r.paused ? 'Paused' : 'Active',
        statusColor: r.paused ? '#8A6A1E' : '#167A54',
        statusDot: r.paused ? '#D8A93A' : '#167A54',
        action: r.paused ? 'Resume' : 'Pause',
        onToggle: () => toggleRecurringWith(r),
        onCancel: () => cancelRecurringWith(r),
      })),
      noRecurring: recurringSource.length === 0,
      hasRecurring: !!nextRecurring,
      nextRecurringAmount: nextRecurring ? nextRecurring.amount : '0.00',
      nextRecurringHandle: nextRecurring ? nextRecurring.handle : '',
      nextRecurringWhen: nextRecurring ? nextRecurring.next + ' · ' + nextRecurring.cadence : '',

      mcpTools: MCP_TOOLS.map(([name, mode]) => ({ name, mode, color: mode === 'Read' ? '#5F6878' : '#153AB4' })),
      connectedLimits: [
        { label: 'Per payment cap', value: '$500.00' },
        { label: 'Daily cap', value: '$1,000.00' },
        { label: 'Confirmation', value: 'Always required' },
      ],

      privacyOn: s.privacyOn,
      privacyLabel: s.privacyOn ? 'On' : 'Off',
      privacyColor: s.privacyOn ? '#167A54' : '#5F6878',
      privacyToggleBg: s.privacyOn ? '#1B45D7' : '#D2D7DF',
      privacyKnobLeft: s.privacyOn ? '23px' : '3px',
      togglePrivacy: () => setState({ privacyOn: !s.privacyOn }),
      privacyKey: keyFor(() => setState({ privacyOn: !s.privacyOn })),
      privacyRows: PRIVACY_ROWS.map(([name, description, value]) => ({
        name,
        description,
        value: s.privacyOn ? value : 'Default',
        color: s.privacyOn ? '#153AB4' : '#5B6472',
        bg: s.privacyOn ? '#EDF1FE' : '#F2F3F6',
      })),

      limitRows: [
        { name: 'Per payment', note: 'Maximum for a single payment', value: '$500.00' },
        { name: 'Daily', note: 'Total you can send in a day', value: '$1,000.00' },
        { name: 'Recurring', note: 'Maximum for a scheduled payment', value: '$400.00' },
      ],

      sheetOpen: !!s.sheet,
      closeSheet: () => setState({ sheet: null }),
      openSend: () => setState({ sheet: 'send', sendStep: 1, sendTo: '', sendPick: null, sendAmount: '' }),
      openReceive: () => setState({ sheet: 'receive' }),
      isSendSheet: s.sheet === 'send',
      isReceiveSheet: s.sheet === 'receive',
      isTxSheet: s.sheet === 'tx',

      sendTitle: s.sendStep === 1 ? 'Send money' : s.sendStep === 2 ? 'Amount' : s.sendStep === 3 ? 'Review payment' : s.sendStep === 4 ? 'Sending' : 'Receipt',
      sendStep1: s.sendStep === 1,
      sendStep2: s.sendStep === 2,
      sendStep3: s.sendStep === 3,
      sendSending: s.sendStep === 4,
      sendDone: s.sendStep === 5,
      sendTo: s.sendTo,
      onSendTo: (e: ChangeEvent<HTMLInputElement>) => setState({ sendTo: e.target.value }),
      onSendAmount: (e: ChangeEvent<HTMLInputElement>) => setState({ sendAmount: e.target.value.replace(/[^0-9.]/g, '') }),
      onSendKey: (e: KeyboardEvent) => {
        if (e.key === 'Enter') sendNextWith(s);
      },
      sendSuggestions: contactsList.map(([h, name, initial, address]) => ({
        handle: h,
        name,
        initial,
        onPick: () => setState({ sendPick: [h, name, initial, address] as Contact, sendTo: h, sendStep: 2 }),
      })),
      sendHandle: pick ? pick[0] : '',
      sendName: pick ? pick[1] : '',
      sendInitial: pick ? pick[2] : '',
      sendAddress: pick ? pick[3] : '',
      sendAmount: s.sendAmount,
      sendAmountStr: money(sentAmt),
      sendPrimaryShown: s.sendStep !== 4,
      sendPrimaryLabel: s.sendStep === 1 ? 'Continue' : s.sendStep === 2 ? 'Review payment' : s.sendStep === 3 ? 'Confirm payment' : 'Done',
      sendPrimaryOpacity: (s.sendStep === 1 && (s.sendTo || '').replace('@', '').length < 2) || (s.sendStep === 2 && !(parseFloat(s.sendAmount) > 0)) ? '.45' : '1',
      sendPrimary: () => sendNextWith(s),
      sendBackShown: s.sendStep === 2 || s.sendStep === 3 || s.sendStep === 5,
      sendBackLabel: s.sendStep === 5 ? 'View receipt' : 'Back',
      sendBack: () => {
        if (s.sendStep === 5) {
          setState({ sheet: 'tx', txDetail: 1 });
          return;
        }
        setState({ sendStep: s.sendStep - 1 });
      },

      copyLabel: s.copied ? 'Address copied' : 'Copy address',
      copyAddress: () => {
        setState({ copied: true });
        flash('Celo address copied');
        later(() => setState({ copied: false }), 1600);
      },
      copyHandleLabel: s.copiedHandle ? 'Username copied' : 'Copy username',
      copyHandle: () => {
        setState({ copiedHandle: true });
        flash(handle + ' copied');
        later(() => setState({ copiedHandle: false }), 1600);
      },
      shareLabel: s.shared ? 'Link ready' : 'Share',
      shareReceive: () => {
        setState({ shared: true });
        flash('Payment link ready');
        later(() => setState({ shared: false }), 1600);
      },

      txTitle: tx ? (tx.dir === 'out' ? 'Payment sent' : 'Payment received') : 'Payment',
      txAmountStr: tx ? (tx.dir === 'out' ? '-$' : '+$') + money(tx.amount) : '',
      txAmountColor: tx && tx.dir === 'in' ? '#167A54' : '#0E1420',
      txDirLabel: tx && tx.dir === 'out' ? 'To' : 'From',
      txHandle: tx ? tx.handle : '',
      txStatus: tx ? tx.status : '',
      txStatusColor: tx ? statusColor(tx.status) : '#5F6878',
      txDate: tx ? tx.date : '',
      txHash: tx ? tx.hash : '',

      toastShown: !!s.toast,
      toastText: s.toast || '',
    };
  }, [s, contactsList, canAddContact, appRequests, appRecurring, setState, later, flash, nav, runCmdWith, cmdReset, cmdConfirmWith, addContactWith, createRequestWith, payRequestWith, toggleRecurringWith, cancelRecurringWith, startSetupWith, sendNextWith, startHero, heroConfirm]);
}

export type Vals = ReturnType<typeof useViewModel>;
