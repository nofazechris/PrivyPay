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

// ---------------------------------------------------------------- static data

/** [handle, name, initial, address] */
type Contact = [string, string, string, string];

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
  ['get_payment_status', 'Read'], ['send_payment', 'Needs confirmation'], ['request_payment', 'Needs confirmation'], ['create_recurring_payment', 'Needs confirmation'],
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
  if (every && amount) return { kind: 'recurring', amount, handle: handle || '@designer', cadence: 'Every ' + every[1].charAt(0).toUpperCase() + every[1].slice(1) };
  if (/request|invoice|ask/.test(low) && amount) {
    return { kind: 'request', amount, handle: handle || '@mike', note: ((low.match(/for\s+(.+)$/) || [])[1] || 'Payment request').replace(/[.]$/, '') };
  }
  if (amount) return { kind: 'send', amount, handle: handle || '@sarah' };
  return { kind: 'unknown' };
}

// ---------------------------------------------------------------- the hook

export function useViewModel(startView: 'landing' | 'app' = 'landing') {
  const [s, setS] = useState<State>(() => initialState(startView));

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
      setState({ cmdInput: raw, cmdIntent: intent, cmdStage: 'thinking' });
      if (intent.kind === 'balance' || intent.kind === 'activity' || intent.kind === 'unknown') {
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
  }, [setState]);

  const cmdReset = useCallback(() => setState({ cmdStage: 'idle', cmdIntent: null, cmdInput: '' }), [setState]);

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
      const found = CONTACTS.find((c) => c[0].slice(1) === q);
      setState({ sendPick: found || (['@' + q, 'PrivyPay user', q[0].toUpperCase(), '0x00…000'] as Contact), sendStep: 2 });
      return;
    }
    if (st.sendStep === 2) {
      if (!(parseFloat(st.sendAmount) > 0)) return;
      setState({ sendStep: 3 });
      return;
    }
    if (st.sendStep === 3) {
      setState({ sendStep: 4 });
      const amt = parseFloat(st.sendAmount) || 0;
      later(() => setState((prev) => ({ sendStep: 5, balance: Math.max(0, prev.balance - amt) })), 1450);
      return;
    }
    if (st.sendStep === 5) setState({ sheet: null });
  }, [setState, later]);

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
    const contactRows = CONTACTS.filter((c) => !cq || c[0].slice(1).includes(cq) || c[1].toLowerCase().includes(cq)).map(([h, name, initial, address]) => ({
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
    const itContact = it && it.handle ? CONTACTS.find((c) => c[0] === it.handle) : null;
    const cmdWorkingStage = s.cmdStage === 'thinking' || s.cmdStage === 'resolving';
    const cmdKindLabel: IntentKind | '' = it ? it.kind : '';

    type Row = { label: string; value: string };
    const cmdMeta: Row[] =
      cmdKindLabel === 'send'
        ? [
            { label: 'To', value: itContact ? itContact[3] : '0x00…000' },
            { label: 'Network', value: 'Celo' },
            { label: 'Privacy', value: s.privacyOn ? 'Enabled' : 'Off' },
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
            { label: 'Status', value: 'Completed' },
            { label: 'Transaction', value: '0x8f…91a' },
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

    type AnswerRow = { handle: string; sub: string; amount: string; color: string };
    const cmdAnswerRows: AnswerRow[] =
      cmdKindLabel === 'activity'
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
      cmdSuggestions: ['Send $20 to @sarah', 'Request $50 from @mike for the logo', 'Pay @designer $200 every Friday', "What's my balance?", 'Show recent payments'].map((label) => {
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
      cmdDoneTitle: cmdKindLabel === 'request' ? 'Request sent' : cmdKindLabel === 'recurring' ? 'Recurring payment created' : 'Payment sent',
      cmdHandle: it && it.handle ? it.handle : '',
      cmdName: itContact ? itContact[1] : it && it.handle ? 'PrivyPay user' : '',
      cmdInitial: it && it.handle ? it.handle.charAt(1).toUpperCase() : '',
      cmdAmountStr: it && it.amount ? money(it.amount) : '0.00',
      cmdMetaRows: cmdMeta,
      cmdReceiptRows: cmdReceipt,
      cmdAnswerLabel: cmdKindLabel === 'balance' ? 'Total balance' : cmdKindLabel === 'activity' ? 'Recent payments' : 'I can help with payments',
      cmdAnswerValue: cmdKindLabel === 'balance' ? '$' + money(s.balance) + ' USDC' : cmdKindLabel === 'activity' ? 'Last three payments' : 'Try: Send $20 to @sarah',
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
      mobileNav: ([['overview', 'Home'], ['payments', 'Payments'], ['requests', 'Requests'], ['contacts', 'Contacts'], ['settings', 'Settings']] as Array<[Page, string]>).map(([k, label]) => {
        const active = s.page === k;
        return { label, onClick: nav(k), dot: active ? '#1B45D7' : 'transparent', color: active ? '#153AB4' : '#5F6878', weight: active ? '600' : '450' };
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

      reqTo: s.reqTo,
      reqAmount: s.reqAmount,
      reqNote: s.reqNote,
      onReqTo: (e: ChangeEvent<HTMLInputElement>) => setState({ reqTo: e.target.value }),
      onReqAmount: (e: ChangeEvent<HTMLInputElement>) => setState({ reqAmount: e.target.value.replace(/[^0-9.]/g, '') }),
      onReqNote: (e: ChangeEvent<HTMLInputElement>) => setState({ reqNote: e.target.value }),
      reqFormOpen: !s.reqSent,
      reqDone: !!s.reqSent,
      reqOpacity: s.reqTo && parseFloat(s.reqAmount) > 0 ? '1' : '.45',
      createRequest: () => {
        if (!s.reqTo || !(parseFloat(s.reqAmount) > 0)) return;
        const to = s.reqTo.startsWith('@') ? s.reqTo : '@' + s.reqTo;
        const row: RequestRow = { id: Date.now(), handle: to, initial: to[1].toUpperCase(), amount: money(parseFloat(s.reqAmount)), note: s.reqNote || 'Payment request', status: 'Pending', payable: false };
        setState((st) => ({ reqSent: row, requests: [row].concat(st.requests), reqTo: '', reqAmount: '', reqNote: '' }));
      },
      newRequest: () => setState({ reqSent: null }),
      sentReqTo: s.reqSent ? s.reqSent.handle : '',
      sentReqAmount: s.reqSent ? s.reqSent.amount : '',
      sentReqNote: s.reqSent ? s.reqSent.note : '',
      requestRows: s.requests.map((r) => ({
        ...r,
        statusColor: r.status === 'Pending' ? '#8A6A1E' : '#153AB4',
        onPay: () => {
          setState((st) => ({
            requests: st.requests.map((x) => (x.id === r.id ? { ...x, status: 'Paid', payable: false } : x)),
            balance: Math.max(0, st.balance - parseFloat(r.amount.replace(/,/g, ''))),
          }));
          flash('Payment sent to ' + r.handle);
        },
      })),

      recurringRows: s.recurring.map((r) => ({
        ...r,
        statusLabel: r.paused ? 'Paused' : 'Active',
        statusColor: r.paused ? '#8A6A1E' : '#167A54',
        statusDot: r.paused ? '#D8A93A' : '#167A54',
        action: r.paused ? 'Resume' : 'Pause',
        onToggle: () => {
          setState((st) => ({ recurring: st.recurring.map((x) => (x.id === r.id ? { ...x, paused: !x.paused } : x)) }));
          flash(r.paused ? 'Resumed ' + r.handle : 'Paused ' + r.handle);
        },
      })),

      serviceRows: SERVICES.map(([k, name, desc, markBg, markBorder]) => {
        const on = !!s.connections[k];
        return {
          name,
          desc,
          markBg,
          markBorder,
          isChatgpt: k === 'chatgpt',
          isClaude: k === 'claude',
          isWhatsapp: k === 'whatsapp',
          stateLabel: on ? 'Connected' : 'Not connected',
          stateColor: on ? '#167A54' : '#8A6A1E',
          dot: on ? '#167A54' : '#D8A93A',
          ctaLabel: on ? 'Manage' : 'Connect',
          ctaBg: on ? '#fff' : '#1B45D7',
          ctaColor: on ? '#0E1420' : '#fff',
          ctaBorder: on ? '#DCE0E7' : '#1B45D7',
          onToggle: () => {
            setState((st) => ({ connections: { ...st.connections, [k]: !st.connections[k] } }));
            flash(on ? name + ' disconnected' : name + ' connected');
          },
        };
      }),
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
      sendSuggestions: CONTACTS.map(([h, name, initial, address]) => ({
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
      txDate: tx ? tx.date : '',
      txHash: tx ? tx.hash : '',

      toastShown: !!s.toast,
      toastText: s.toast || '',
    };
  }, [s, setState, later, flash, nav, runCmdWith, cmdReset, cmdConfirmWith, startSetupWith, sendNextWith, startHero, heroConfirm]);
}

export type Vals = ReturnType<typeof useViewModel>;
