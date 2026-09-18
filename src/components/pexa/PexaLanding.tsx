'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { PrivyPayLogo } from '@/components/brand/PrivyPayLogo';
import { color } from '@/lib/design/tokens';

/**
 * Pexa marketing landing (rebuilt faithfully from design/Pexa.dc.html). Agent-first: sticky nav,
 * hero with a self-playing agent demo, an interactive "one conversation" command demo, the six
 * things you can ask for, how-it-works + settlement flow, integrations (MCP), the agent-network
 * roadmap, the Celo infrastructure panel, a closing CTA and footer. `onEnter` is the single CTA —
 * the caller routes it to sign-in (or straight to the app when already authenticated).
 */

/* ------------------------------------------------------------------ hero demo */

type Stage = 'typing' | 'working' | 'resolved' | 'preview' | 'sending' | 'done';
const DEMO_TEXT = 'Send $20 to @sarah';
const STATE_LABEL: Record<Stage, string> = {
  typing: 'Listening',
  working: 'Understanding',
  resolved: 'Resolving',
  preview: 'Awaiting confirmation',
  sending: 'Sending',
  done: 'Completed',
};

function useHeroDemo() {
  const [stage, setStage] = useState<Stage>('typing');
  const [typed, setTyped] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useRef(false);
  const startRef = useRef<() => void>(() => {});

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const start = useCallback(() => {
    clear();
    if (reduce.current) {
      setTyped(DEMO_TEXT);
      setStage('done');
      return;
    }
    setTyped('');
    setStage('typing');
    let i = 0;
    const typeNext = () => {
      i += 1;
      setTyped(DEMO_TEXT.slice(0, i));
      if (i < DEMO_TEXT.length) {
        timers.current.push(setTimeout(typeNext, 52));
      } else {
        timers.current.push(setTimeout(() => setStage('working'), 520));
        timers.current.push(setTimeout(() => setStage('resolved'), 1500));
        timers.current.push(setTimeout(() => setStage('preview'), 2450));
        timers.current.push(setTimeout(() => setStage('sending'), 5200));
        timers.current.push(setTimeout(() => setStage('done'), 6700));
        timers.current.push(setTimeout(() => startRef.current(), 10600));
      }
    };
    timers.current.push(setTimeout(typeNext, 650));
  }, [clear]);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const confirm = useCallback(() => {
    clear();
    setStage('sending');
    timers.current.push(setTimeout(() => setStage('done'), 1500));
    timers.current.push(setTimeout(() => startRef.current(), 5400));
  }, [clear]);

  useEffect(() => {
    reduce.current = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    start();
    return clear;
  }, [start, clear]);

  return { stage, typed, replay: start, confirm };
}

/* --------------------------------------------------------- hero particle field */

/**
 * The hero's three parallax "payment network" canvas layers, ported faithfully from the design's
 * driver. Curved links drift, nodes pulse, and payment pulses travel the paths (occasionally
 * labelled, leaving a ring when they arrive). Layers parallax to the pointer and scroll. Honors
 * prefers-reduced-motion (draws one static frame, no loop or listeners). Purely decorative.
 */
interface HeroLayer { key: 'Far' | 'Mid' | 'Near'; count: number; alpha: number; width: number; blur: number; parallax: number; drift: number; scroll: number }
interface HeroPath { pts: number[][]; phase: number; amp: number; glow: number; nodeAt: boolean[]; _pts?: number[][] }
interface HeroGroup { L: HeroLayer; paths: HeroPath[] }
interface HeroPulse { li: number; pi: number; t: number; speed: number; label: string; labelled: boolean }
interface HeroRing { li: number; x: number; y: number; r: number; alpha: number }

const HERO_BG = {
  layers: [
    { key: 'Far', count: 6, alpha: 0.07, width: 1, blur: 2.4, parallax: 7, drift: 0.5, scroll: 0.05 },
    { key: 'Mid', count: 4, alpha: 0.125, width: 1.15, blur: 1, parallax: 4, drift: 0.85, scroll: 0.08 },
    { key: 'Near', count: 3, alpha: 0.19, width: 1.5, blur: 0, parallax: 2, drift: 1.2, scroll: 0.12 },
  ] as HeroLayer[],
  ink: '27,69,215',
  pulseMin: 3200,
  pulseMax: 7200,
  pulseSpeed: 0.0004,
  labels: ['$20 USDC', '$120 USDC', '$48 USDC', '$250 USDC'],
};

function useHeroParticles() {
  const layerFar = useRef<HTMLDivElement>(null);
  const layerMid = useRef<HTMLDivElement>(null);
  const layerNear = useRef<HTMLDivElement>(null);
  const canvasFar = useRef<HTMLCanvasElement>(null);
  const canvasMid = useRef<HTMLCanvasElement>(null);
  const canvasNear = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layerEls: Record<string, HTMLDivElement | null> = { Far: layerFar.current, Mid: layerMid.current, Near: layerNear.current };
    const canvasEls: Record<string, HTMLCanvasElement | null> = { Far: canvasFar.current, Mid: canvasMid.current, Near: canvasNear.current };
    if (!canvasEls.Far || !canvasEls.Mid || !canvasEls.Near) return;

    let net: HeroGroup[] = [];
    let pulses: HeroPulse[] = [];
    let rings: HeroRing[] = [];
    let mx = 0, my = 0, tmx = 0, tmy = 0, scrollY = 0;
    let nextPulse = 1400, lastTs = 0, frameAt = 0;
    let bw = 320, bh = 240;
    let raf = 0;
    let alive = true;

    const rand = (seed: number) => {
      let a = seed >>> 0;
      return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    };

    const buildNet = () => {
      net = HERO_BG.layers.map((L, li) => {
        const rnd = rand(9173 + li * 733);
        const paths: HeroPath[] = [];
        for (let i = 0; i < L.count; i++) {
          const pts: number[][] = [];
          let x = -0.24, y = rnd() * 1.26 - 0.13;
          const segs = 3 + Math.floor(rnd() * 3);
          for (let k = 0; k <= segs; k++) {
            pts.push([x, Math.max(-0.18, Math.min(1.18, y))]);
            x += (1.56 / segs) * (0.72 + rnd() * 0.56);
            y += (rnd() - 0.46) * 0.42;
          }
          paths.push({ pts, phase: rnd() * 6.283, amp: 3 + rnd() * 9, glow: rnd() * 6.283, nodeAt: pts.map(() => rnd() > 0.44) });
        }
        return { L, paths };
      });
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      HERO_BG.layers.forEach((L) => {
        const c = canvasEls[L.key];
        if (!c) return;
        const r = c.getBoundingClientRect();
        bw = Math.max(320, r.width);
        bh = Math.max(240, r.height);
        c.width = Math.round(bw * dpr);
        c.height = Math.round(bh * dpr);
        c.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      buildNet();
    };

    const pointAt = (pts: number[][], t: number): number[] => {
      if (!pts || pts.length < 2) return [0, 0];
      const segs: number[] = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        segs.push(d); total += d;
      }
      let want = Math.max(0, Math.min(1, t)) * total;
      for (let i = 0; i < segs.length; i++) {
        if (want <= segs[i] || i === segs.length - 1) {
          const f = segs[i] ? want / segs[i] : 0;
          return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
        }
        want -= segs[i];
      }
      return pts[pts.length - 1];
    };

    const spawnPulse = (fast: boolean) => {
      const li = fast ? 2 : Math.random() < 0.55 ? 2 : 1;
      const group = net[li];
      if (!group) return;
      const pi = Math.floor(Math.random() * group.paths.length);
      pulses.push({
        li, pi, t: 0,
        speed: HERO_BG.pulseSpeed * (fast ? 1.8 : 0.8 + Math.random() * 0.6),
        label: HERO_BG.labels[Math.floor(Math.random() * HERO_BG.labels.length)],
        labelled: fast || Math.random() > 0.45,
      });
    };

    const drawLayer = (li: number, t: number) => {
      const group = net[li], L = group.L;
      const c = canvasEls[L.key];
      const ctx = c?.getContext('2d');
      if (!ctx) return;
      const w = bw, hh = bh;
      ctx.clearRect(0, 0, w, hh);
      ctx.lineCap = 'round';
      ctx.filter = L.blur ? `blur(${L.blur}px)` : 'none';
      group.paths.forEach((p) => {
        const pts = p.pts.map((q, qi) => [q[0] * w, q[1] * hh + Math.sin(t * 0.00016 * L.drift + p.phase + qi * 0.55) * p.amp]);
        p._pts = pts;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1], cur = pts[i];
          ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + cur[0]) / 2, (prev[1] + cur[1]) / 2);
        }
        ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
        ctx.strokeStyle = `rgba(${HERO_BG.ink},${L.alpha})`;
        ctx.lineWidth = L.width;
        ctx.stroke();
        pts.forEach((q, qi) => {
          if (!p.nodeAt[qi]) return;
          const beat = 0.5 + 0.5 * Math.sin(t * 0.0008 + p.glow + qi);
          ctx.beginPath();
          ctx.arc(q[0], q[1], 1.5 + beat * 1.1, 0, 6.2832);
          ctx.fillStyle = `rgba(${HERO_BG.ink},${(L.alpha * 2.5 * (0.45 + beat * 0.6)).toFixed(3)})`;
          ctx.fill();
        });
      });
      ctx.filter = 'none';

      pulses.filter((pl) => pl.li === li).forEach((pl) => {
        const p = group.paths[pl.pi];
        if (!p || !p._pts) return;
        const pos = pointAt(p._pts, pl.t);
        const tail = pointAt(p._pts, Math.max(0, pl.t - 0.07));
        const fade = pl.t < 0.1 ? pl.t / 0.1 : pl.t > 0.88 ? (1 - pl.t) / 0.12 : 1;
        const g = ctx.createLinearGradient(tail[0], tail[1], pos[0], pos[1]);
        g.addColorStop(0, `rgba(${HERO_BG.ink},0)`);
        g.addColorStop(1, `rgba(${HERO_BG.ink},${(0.5 * fade).toFixed(3)})`);
        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.lineTo(pos[0], pos[1]);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        const halo = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 11);
        halo.addColorStop(0, `rgba(${HERO_BG.ink},${(0.32 * fade).toFixed(3)})`);
        halo.addColorStop(1, `rgba(${HERO_BG.ink},0)`);
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 11, 0, 6.2832); ctx.fillStyle = halo; ctx.fill();
        ctx.beginPath(); ctx.arc(pos[0], pos[1], 2.5, 0, 6.2832);
        ctx.fillStyle = `rgba(${HERO_BG.ink},${(0.85 * fade).toFixed(3)})`; ctx.fill();
        if (pl.labelled && pl.t > 0.3 && pl.t < 0.74) {
          const lf = Math.sin(((pl.t - 0.3) / 0.44) * Math.PI);
          ctx.font = '500 11px ui-sans-serif, system-ui, sans-serif';
          ctx.fillStyle = `rgba(21,58,180,${(0.62 * lf).toFixed(3)})`;
          ctx.fillText(pl.label, pos[0] + 11, pos[1] - 9);
        }
      });

      rings.filter((r) => r.li === li).forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, 6.2832);
        ctx.strokeStyle = `rgba(${HERO_BG.ink},${(r.alpha * 0.55).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    };

    const frame = (ts: number) => {
      const dt = Math.min(48, ts - (lastTs || ts));
      lastTs = ts;
      mx += (tmx - mx) * 0.055;
      my += (tmy - my) * 0.055;
      HERO_BG.layers.forEach((L) => {
        const wrap = layerEls[L.key];
        if (wrap) wrap.style.transform = `translate3d(${(mx * L.parallax).toFixed(2)}px,${(my * L.parallax - scrollY * L.scroll).toFixed(2)}px,0)`;
      });
      nextPulse -= dt;
      if (nextPulse <= 0) {
        spawnPulse(false);
        nextPulse = HERO_BG.pulseMin + Math.random() * (HERO_BG.pulseMax - HERO_BG.pulseMin);
      }
      pulses.forEach((pl) => { pl.t += pl.speed * dt; });
      pulses.filter((pl) => pl.t >= 1).forEach((pl) => {
        const p = net[pl.li]?.paths[pl.pi];
        if (p?._pts) {
          const end = p._pts[p._pts.length - 1];
          rings.push({ li: pl.li, x: end[0], y: end[1], r: 2, alpha: 0.85 });
        }
      });
      pulses = pulses.filter((pl) => pl.t < 1);
      rings.forEach((r) => { r.r += dt * 0.055; r.alpha -= dt * 0.0011; });
      rings = rings.filter((r) => r.alpha > 0.02);
      for (let li = 0; li < net.length; li++) drawLayer(li, ts);
    };

    const tick = (ts: number) => {
      if (!alive) return;
      if (!frameAt || ts - frameAt >= 8) { frameAt = ts; frame(ts); }
      raf = requestAnimationFrame(tick);
    };

    const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    size();
    if (reduce) {
      for (let li = 0; li < net.length; li++) drawLayer(li, 0);
      const onResize = () => { size(); for (let li = 0; li < net.length; li++) drawLayer(li, 0); };
      window.addEventListener('resize', onResize);
      return () => { alive = false; window.removeEventListener('resize', onResize); };
    }

    const onMove = (e: PointerEvent) => {
      const c = canvasEls.Near;
      if (!c) return;
      const r = c.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onScroll = () => { scrollY = window.scrollY || 0; };
    const onResize = () => size();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    lastTs = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { layerFar, layerMid, layerNear, canvasFar, canvasMid, canvasNear };
}

/* -------------------------------------------------------------- command demo */

type CmdState = 'idle' | 'working' | 'preview' | 'processing' | 'done' | 'answer';
interface MetaRow { label: string; value: string }
interface AnswerRow { handle: string; sub: string; amount: string; color: string }
interface CmdScript {
  kind: 'send' | 'request' | 'recurring' | 'balance' | 'activity';
  steps: string[];
  initial?: string;
  handle?: string;
  name?: string;
  amountStr?: string;
  previewTitle?: string;
  confirmLabel?: string;
  metaRows?: MetaRow[];
  doneTitle?: string;
  receiptRows?: MetaRow[];
  answerLabel?: string;
  answerValue?: string;
  answerRows?: AnswerRow[];
}

const RECENT: AnswerRow[] = [
  { handle: '@sarah', sub: 'Yesterday', amount: '-$20.00', color: color.ink },
  { handle: '@mike', sub: '2 days ago', amount: '+$50.00', color: color.success },
  { handle: '@design.studio', sub: 'Sep 12', amount: '-$120.00', color: color.ink },
];

function parseDemo(raw: string): CmdScript {
  const t = raw.toLowerCase();
  const amount = raw.match(/\$?\s*(\d+(?:\.\d+)?)/)?.[1];
  const handle = raw.match(/@([a-z0-9_.]+)/i)?.[0] ?? '@sarah';
  const initial = handle.replace(/^@/, '')[0]?.toUpperCase() ?? 'S';
  const amt = amount ? Number(amount).toFixed(2) : '20.00';

  if (t.includes('balance')) {
    return { kind: 'balance', steps: ['Reading your request', 'Checking your wallet'], answerLabel: 'Available balance', answerValue: '$248.50 USDC' };
  }
  if (t.includes('recent') || t.includes('activity') || t.includes('transaction')) {
    return { kind: 'activity', steps: ['Reading your request', 'Fetching activity'], answerLabel: 'Recent payments', answerValue: 'Last 3', answerRows: RECENT };
  }
  if (t.includes('every') || t.includes('recurring') || t.includes('weekly') || t.includes('monthly')) {
    return {
      kind: 'recurring',
      steps: ['Understanding your request', `Resolving ${handle}`, 'Scheduling'],
      initial, handle, name: 'Pexa user', amountStr: amt, previewTitle: 'Recurring payment',
      confirmLabel: 'Create recurring payment',
      metaRows: [{ label: 'To', value: handle }, { label: 'Schedule', value: 'Every Friday' }, { label: 'Asset', value: 'USDC' }],
      doneTitle: 'Recurring payment created', receiptRows: [{ label: 'To', value: handle }, { label: 'Schedule', value: 'Every Friday' }, { label: 'Status', value: 'Active' }],
    };
  }
  if (t.includes('request')) {
    return {
      kind: 'request',
      steps: ['Understanding your request', `Resolving ${handle}`, 'Preparing request'],
      initial, handle, name: 'Pexa user', amountStr: amt, previewTitle: 'Payment request',
      confirmLabel: 'Send request',
      metaRows: [{ label: 'From', value: handle }, { label: 'Asset', value: 'USDC' }, { label: 'Network', value: 'Celo' }],
      doneTitle: 'Request sent', receiptRows: [{ label: 'From', value: handle }, { label: 'Status', value: 'Pending' }],
    };
  }
  return {
    kind: 'send',
    steps: ['Understanding your request', `Resolving ${handle}`, 'Preparing payment'],
    initial, handle, name: 'Pexa user', amountStr: amt, previewTitle: 'Confirm to send',
    confirmLabel: 'Confirm payment',
    metaRows: [{ label: 'To', value: handle }, { label: 'Asset', value: 'USDC' }, { label: 'Network', value: 'Celo' }, { label: 'Estimated fee', value: '$0.001' }],
    doneTitle: 'Payment sent', receiptRows: [{ label: 'To', value: handle }, { label: 'Network', value: 'Celo' }, { label: 'Status', value: 'Completed' }],
  };
}

function useCmdDemo() {
  const [state, setState] = useState<CmdState>('idle');
  const [script, setScript] = useState<CmdScript | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [input, setInput] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback((text: string) => {
    const raw = text.trim();
    if (!raw) return;
    clear();
    const s = parseDemo(raw);
    setScript(s);
    setStepIdx(0);
    setState('working');
    setInput('');
    s.steps.forEach((_, i) => timers.current.push(setTimeout(() => setStepIdx(i + 1), (i + 1) * 620)));
    const after = s.steps.length * 620 + 500;
    timers.current.push(setTimeout(() => setState(s.kind === 'balance' || s.kind === 'activity' ? 'answer' : 'preview'), after));
  }, [clear]);

  const confirm = useCallback(() => {
    clear();
    setState('processing');
    timers.current.push(setTimeout(() => setState('done'), 1400));
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setState('idle');
    setScript(null);
    setInput('');
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { state, script, stepIdx, input, setInput, run, confirm, reset };
}

const CMD_LABEL: Record<CmdState, string> = {
  idle: 'READY', working: 'WORKING', preview: 'PREVIEW', processing: 'PROCESSING', done: 'DONE', answer: 'ANSWER',
};
const SUGGESTIONS = ['Send $20 to @sarah', 'Request $50 from @mike for the design', 'Pay @sarah $20 every Friday', 'What’s my balance?', 'Show recent payments'];
const MCP_TOOLS = ['get_profile', 'get_balance', 'find_contact', 'get_recent_transactions', 'get_payment_status', 'create_payment_preview', 'confirm_payment', 'create_request'];

/* ------------------------------------------------------------------ shared bits */

function Dot({ d }: { d: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.primary, display: 'inline-block', animation: `pp-pulse 1.1s ease-in-out ${d} infinite` }} />;
}
function TypingBubble() {
  return (
    <div style={{ display: 'flex', gap: '4px', border: `1px solid ${color.borderFaint}`, background: color.surfaceMuted, borderRadius: '14px 14px 14px 4px', padding: '13px 14px', width: 'fit-content' }}>
      <Dot d="0s" /><Dot d=".16s" /><Dot d=".32s" />
    </div>
  );
}
function Meta({ label, value }: MetaRow) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13.5px' }}>
      <span style={{ color: color.mutedStrong }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function FlowArrow({ delay }: { delay: string }) {
  return (
    <svg viewBox="0 0 34 8" aria-hidden="true" style={{ width: 34, height: 8, flex: 'none', overflow: 'visible' }}>
      <path d="M0 4h26" stroke={color.borderStrong} strokeWidth="1.2" />
      <path d="M26 4 22 1.4M26 4 22 6.6" stroke={color.borderStrong} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle r="2.4" fill={color.primary}><animateMotion dur="2.6s" repeatCount="indefinite" path="M0 4h26" begin={delay} /></circle>
    </svg>
  );
}
function Eyebrow({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: color.mutedStrong }}>{children}</div>;
}

/* ------------------------------------------------------------------ component */

export function PexaLanding({ onEnter }: { onEnter: () => void }) {
  const hero = useHeroDemo();
  const cmd = useCmdDemo();
  const { layerFar, layerMid, layerNear, canvasFar, canvasMid, canvasNear } = useHeroParticles();

  return (
    <div style={{ minHeight: '100dvh', background: color.background, color: color.ink }}>
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(246,247,249,.82)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${color.border}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '13px clamp(16px,3vw,24px)', display: 'flex', alignItems: 'center', gap: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <PrivyPayLogo size={21} />
            <span style={{ fontSize: '16.5px', fontWeight: 600, letterSpacing: '-.025em' }}>Pexa</span>
          </div>
          <nav className="pexa-navlinks" style={{ display: 'none', gap: '22px', marginLeft: 'auto' }}>
            <a href="#product" style={{ fontSize: '14px', color: color.muted, textDecoration: 'none' }}>Product</a>
            <a href="#how" style={{ fontSize: '14px', color: color.muted, textDecoration: 'none' }}>How it works</a>
            <a href="#integrations" style={{ fontSize: '14px', color: color.muted, textDecoration: 'none' }}>Integrations</a>
          </nav>
          <div className="pexa-navcta" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <button onClick={onEnter} style={{ border: 'none', background: 'transparent', color: color.ink, fontSize: '14px', fontWeight: 500, padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}>Log in</button>
            <button onClick={onEnter} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, padding: '10px 18px', borderRadius: '11px', cursor: 'pointer' }}>Open Pexa</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div style={{ position: 'absolute', inset: '-12%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(46% 42% at 68% 22%,rgba(27,69,215,.10),rgba(27,69,215,0) 70%)', animation: 'pp-atmos 34s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', inset: '-12%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(40% 44% at 18% 74%,rgba(27,69,215,.06),rgba(27,69,215,0) 72%)', animation: 'pp-atmos-2 44s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(90deg,rgba(27,69,215,.045) 1px,transparent 1px),linear-gradient(rgba(27,69,215,.045) 1px,transparent 1px)', backgroundSize: '72px 72px', WebkitMaskImage: 'radial-gradient(72% 62% at 52% 38%,#000,transparent)', maskImage: 'radial-gradient(72% 62% at 52% 38%,#000,transparent)' }} />
        {/* Parallax payment-network canvas layers (decorative). */}
        <div ref={layerFar} style={{ position: 'absolute', inset: '-7%', zIndex: 0, pointerEvents: 'none', willChange: 'transform' }}><canvas ref={canvasFar} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} /></div>
        <div ref={layerMid} style={{ position: 'absolute', inset: '-7%', zIndex: 0, pointerEvents: 'none', willChange: 'transform' }}><canvas ref={canvasMid} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} /></div>
        <div ref={layerNear} style={{ position: 'absolute', inset: '-7%', zIndex: 0, pointerEvents: 'none', willChange: 'transform' }}><canvas ref={canvasNear} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} /></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1160px', margin: '0 auto', padding: 'clamp(40px,6vw,88px) clamp(16px,3vw,24px) clamp(32px,4.6vw,56px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(28px,4.6vw,60px)', alignItems: 'center' }}>
          <div>
            <div style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) both', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: color.muted }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color.primary, display: 'inline-block', animation: 'pp-pulse 2.4s ease-in-out infinite' }} />AI PAYMENT AGENT · STABLECOINS ON CELO
            </div>
            <h1 style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) 70ms both', fontSize: 'clamp(38px,6.4vw,66px)', lineHeight: 1, letterSpacing: '-.045em', fontWeight: 600, margin: '20px 0 0' }}>
              Your money,<br />handled by an<br /><span style={{ color: color.primary }}>AI agent.</span>
            </h1>
            <p style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) 150ms both', fontSize: 'clamp(16.5px,1.5vw,18.5px)', lineHeight: 1.62, color: color.muted, maxWidth: '452px', margin: '24px 0 0' }}>Send, request, schedule and manage payments simply by talking to Pexa.</p>
            <div style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) 220ms both', display: 'flex', gap: '10px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button onClick={onEnter} style={{ border: 'none', background: color.ink, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px 22px', borderRadius: '11px', cursor: 'pointer' }}>Start using Pexa</button>
              <a href="#how" style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '15px', fontWeight: 500, padding: '14px 22px', borderRadius: '11px', textDecoration: 'none' }}>See how it works</a>
            </div>
            <div style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) 300ms both', display: 'flex', gap: '20px', marginTop: '32px', fontSize: '13px', color: color.mutedStrong, flexWrap: 'wrap' }}>
              <span>Talk, don’t navigate</span><span>You confirm every payment</span><span>Settles on Celo</span>
            </div>
          </div>

          {/* Self-playing agent demo */}
          <div style={{ animation: 'pp-up .62s cubic-bezier(.2,.8,.3,1) 250ms both', position: 'relative' }}>
            <div style={{ position: 'relative', background: color.surface, border: `1px solid ${color.border}`, borderRadius: '20px', padding: '18px', boxShadow: '0 34px 68px -40px rgba(14,20,32,.36)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingBottom: '14px', borderBottom: `1px solid #F0F1F4` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <PrivyPayLogo size={18} />
                  <span style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '-.02em' }}>Pexa</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.14em', color: color.faint }}>AGENT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${color.primarySoftBorder}`, background: '#F4F6FE', borderRadius: '999px', padding: '5px 11px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: color.primary, display: 'inline-block', animation: 'pp-pulse 1.6s ease-in-out infinite' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 500, color: color.primaryHover, whiteSpace: 'nowrap' }}>{STATE_LABEL[hero.stage]}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', minHeight: '236px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', background: color.ink, color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '15.5px', lineHeight: 1.35 }}>
                    <span>{hero.typed}</span>
                    {hero.stage === 'typing' ? <span style={{ width: 2, height: 17, background: '#7E9BF5', display: 'inline-block', animation: 'pp-caret 1s step-end infinite' }} /> : null}
                  </div>
                </div>

                {hero.stage === 'working' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', animation: 'pp-fade .22s ease both' }}>
                    <TypingBubble />
                    <span style={{ fontSize: '13px', color: color.mutedStrong }}>Reading your request…</span>
                  </div>
                ) : null}

                {hero.stage === 'resolved' ? (
                  <div style={{ animation: 'pp-step .32s cubic-bezier(.2,.8,.3,1) both' }}>
                    <div style={{ display: 'inline-block', border: `1px solid ${color.borderFaint}`, background: color.surfaceMuted, borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: '14.5px' }}>I found <span style={{ fontWeight: 600 }}>@sarah</span> in your contacts.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color.borderFaint}`, borderRadius: '13px', padding: '12px 13px', marginTop: '9px', flexWrap: 'wrap' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.primarySoft, color: color.primary, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>S</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '-.015em' }}>@sarah</div>
                        <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', color: color.mutedStrong, marginTop: '2px' }}>Sarah Okafor · 0x8F…21A</div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '11.5px', fontWeight: 500, color: color.success }}>Resolved</span>
                    </div>
                  </div>
                ) : null}

                {hero.stage === 'preview' ? (
                  <div style={{ border: `1px solid ${color.primarySoftBorder}`, background: '#FCFCFE', borderRadius: '14px', padding: '16px', animation: 'pp-step .32s cubic-bezier(.2,.8,.3,1) both' }}>
                    <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>Confirm to send</div>
                    <div style={{ fontSize: '33px', fontWeight: 600, letterSpacing: '-.042em', marginTop: '8px', fontVariantNumeric: 'tabular-nums' }}>$20.00 <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '13px', fontWeight: 400, color: color.mutedStrong }}>USDC</span></div>
                    <div style={{ display: 'grid', gap: '10px', marginTop: '15px', paddingTop: '14px', borderTop: `1px solid ${color.borderFaint}` }}>
                      <Meta label="To" value="@sarah" /><Meta label="Network" value="Celo" />
                    </div>
                    <div style={{ display: 'flex', gap: '9px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button onClick={hero.confirm} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '13px', borderRadius: '11px', cursor: 'pointer', flex: 1, minWidth: '150px' }}>Confirm payment</button>
                      <button onClick={hero.replay} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '13px 18px', borderRadius: '11px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : null}

                {hero.stage === 'sending' ? (
                  <div style={{ border: `1px solid ${color.borderFaint}`, borderRadius: '14px', padding: '30px 16px', textAlign: 'center', animation: 'pp-fade .2s ease both' }}>
                    <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto' }}><div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color.borderFaint}`, borderTopColor: color.primary, animation: 'pp-spin .9s linear infinite' }} /></div>
                    <div style={{ fontSize: '15.5px', fontWeight: 600, marginTop: '16px', letterSpacing: '-.018em' }}>Sending payment</div>
                    <div style={{ fontSize: '13px', color: color.mutedStrong, marginTop: '5px' }}>Submitting to Celo</div>
                  </div>
                ) : null}

                {hero.stage === 'done' ? (
                  <div style={{ animation: 'pp-step .32s cubic-bezier(.2,.8,.3,1) both' }}>
                    <div style={{ display: 'inline-block', border: `1px solid ${color.borderFaint}`, background: color.surfaceMuted, borderRadius: '14px 14px 14px 4px', padding: '10px 14px', fontSize: '14.5px' }}>Payment sent.</div>
                    <div style={{ border: `1px solid ${color.borderFaint}`, borderRadius: '14px', padding: '18px', textAlign: 'center', marginTop: '9px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: color.primary, color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pp-pop .34s cubic-bezier(.2,.8,.3,1) both' }}>✓</div>
                      <div style={{ fontSize: '31px', fontWeight: 600, letterSpacing: '-.042em', marginTop: '14px', fontVariantNumeric: 'tabular-nums' }}>$20.00 <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '12.5px', fontWeight: 400, color: color.mutedStrong }}>USDC</span></div>
                      <div style={{ fontSize: '14px', color: color.muted, marginTop: '5px' }}>→ @sarah · Celo</div>
                      <div style={{ fontSize: '13px', color: color.success, marginTop: '8px' }}>Completed</div>
                      <button onClick={hero.replay} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '11px', borderRadius: '11px', cursor: 'pointer', width: '100%', marginTop: '16px' }}>Replay</button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product — interactive command demo */}
      <section id="product" style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(44px,5.6vw,84px) clamp(16px,3vw,24px)' }}>
        <div style={{ maxWidth: '640px' }}>
          <Eyebrow>ONE INTERFACE</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', letterSpacing: '-.04em', fontWeight: 600, margin: '12px 0 0', lineHeight: 1.06 }}>One conversation.<br />Every financial action.</h2>
          <p style={{ fontSize: '16.5px', color: color.muted, lineHeight: 1.62, margin: '16px 0 0', maxWidth: '470px' }}>Try it. Type an instruction or pick one — Pexa interprets it, shows you exactly what will happen, and waits for your confirmation.</p>
        </div>

        <div style={{ marginTop: 'clamp(26px,3.4vw,44px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(22px,3vw,40px)', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {SUGGESTIONS.map((sg) => (
                <button key={sg} onClick={() => cmd.run(sg)} style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '12px', padding: '13px 15px', fontSize: '14.5px', color: color.ink, cursor: 'pointer', textAlign: 'left' }}>“{sg}”</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <input
                value={cmd.input}
                onChange={(e) => cmd.setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && cmd.run(cmd.input)}
                placeholder="Ask Pexa something…"
                style={{ flex: 1, minWidth: 0, border: `1px solid ${color.borderStrong}`, background: color.surface, borderRadius: '11px', padding: '12px 14px', fontSize: '14.5px', color: color.ink, outline: 'none' }}
              />
              <button onClick={() => cmd.run(cmd.input)} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, padding: '12px 18px', borderRadius: '11px', cursor: 'pointer' }}>Send</button>
            </div>
          </div>

          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '18px', padding: '18px', boxShadow: '0 28px 60px -46px rgba(14,20,32,.36)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', paddingBottom: '14px', borderBottom: `1px solid #F0F1F4` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <PrivyPayLogo size={17} />
                <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-.02em' }}>Pexa</span>
              </div>
              <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.12em', color: color.faint }}>{CMD_LABEL[cmd.state]}</div>
            </div>

            <div style={{ minHeight: '210px', marginTop: '14px' }}>
              {cmd.state === 'idle' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', textAlign: 'center', padding: '0 10px' }}>
                  <div style={{ fontSize: '14.5px', color: color.muted, lineHeight: 1.55, maxWidth: '250px' }}>Pick an instruction, or write your own. Nothing moves until you confirm.</div>
                </div>
              ) : null}

              {cmd.state === 'working' && cmd.script ? (
                <div style={{ animation: 'pp-fade .2s ease both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <TypingBubble />
                    <span style={{ fontSize: '13px', color: color.mutedStrong }}>{cmd.script.steps[Math.min(cmd.stepIdx, cmd.script.steps.length - 1)]}…</span>
                  </div>
                  <div style={{ display: 'grid', gap: '9px', marginTop: '14px' }}>
                    {cmd.script.steps.map((label, i) => {
                      const done = i < cmd.stepIdx;
                      const activeS = i === cmd.stepIdx;
                      const bg = done ? color.successSoft : activeS ? color.primarySoft : '#F2F3F6';
                      const fg = done ? color.success : activeS ? color.primary : '#8A93A6';
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: bg, color: fg, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{done ? '✓' : i + 1}</span>
                          <span style={{ color: done || activeS ? color.ink : color.muted }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {cmd.state === 'preview' && cmd.script ? (
                <div style={{ animation: 'pp-step .3s cubic-bezier(.2,.8,.3,1) both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.primarySoft, color: color.primary, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{cmd.script.initial}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 600 }}>{cmd.script.handle}</div>
                      <div style={{ fontSize: '12px', color: color.mutedStrong }}>{cmd.script.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12.5px', color: color.mutedStrong, marginTop: '15px' }}>{cmd.script.previewTitle}</div>
                  <div style={{ fontSize: '30px', fontWeight: 600, letterSpacing: '-.04em', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>${cmd.script.amountStr} <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '12.5px', fontWeight: 400, color: color.mutedStrong }}>USDC</span></div>
                  <div style={{ display: 'grid', gap: '9px', marginTop: '14px', paddingTop: '13px', borderTop: `1px solid ${color.borderFaint}` }}>
                    {cmd.script.metaRows?.map((m) => <Meta key={m.label} {...m} />)}
                  </div>
                  <div style={{ display: 'flex', gap: '9px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button onClick={cmd.confirm} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14.5px', fontWeight: 500, padding: '12px', borderRadius: '11px', cursor: 'pointer', flex: 1, minWidth: '150px' }}>{cmd.script.confirmLabel}</button>
                    <button onClick={cmd.reset} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '11px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : null}

              {cmd.state === 'processing' ? (
                <div style={{ padding: '52px 16px', textAlign: 'center', animation: 'pp-fade .2s ease both' }}>
                  <div style={{ position: 'relative', width: 38, height: 38, margin: '0 auto' }}><div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${color.borderFaint}`, borderTopColor: color.primary, animation: 'pp-spin .9s linear infinite' }} /></div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '16px' }}>Working on it</div>
                </div>
              ) : null}

              {cmd.state === 'done' && cmd.script ? (
                <div style={{ animation: 'pp-step .3s cubic-bezier(.2,.8,.3,1) both', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: color.primary, color: '#fff', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pp-pop .34s cubic-bezier(.2,.8,.3,1) both' }}>✓</div>
                  <div style={{ fontSize: '15.5px', fontWeight: 600, marginTop: '14px', letterSpacing: '-.02em' }}>{cmd.script.doneTitle}</div>
                  <div style={{ fontSize: '29px', fontWeight: 600, letterSpacing: '-.04em', marginTop: '8px', fontVariantNumeric: 'tabular-nums' }}>${cmd.script.amountStr}</div>
                  <div style={{ display: 'grid', gap: '9px', marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${color.borderFaint}`, textAlign: 'left' }}>
                    {cmd.script.receiptRows?.map((r) => <Meta key={r.label} {...r} />)}
                  </div>
                  <button onClick={cmd.reset} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '11px', borderRadius: '11px', cursor: 'pointer', width: '100%', marginTop: '16px' }}>Ask something else</button>
                </div>
              ) : null}

              {cmd.state === 'answer' && cmd.script ? (
                <div style={{ animation: 'pp-step .3s cubic-bezier(.2,.8,.3,1) both' }}>
                  <div style={{ fontSize: '12.5px', color: color.mutedStrong }}>{cmd.script.answerLabel}</div>
                  <div style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-.038em', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>{cmd.script.answerValue}</div>
                  {cmd.script.answerRows ? (
                    <div style={{ display: 'grid', gap: '11px', marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${color.borderFaint}` }}>
                      {cmd.script.answerRows.map((a) => (
                        <div key={a.handle} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                          <div><div style={{ fontSize: '14px', fontWeight: 500 }}>{a.handle}</div><div style={{ fontSize: '12px', color: color.mutedStrong, marginTop: '2px' }}>{a.sub}</div></div>
                          <div style={{ fontSize: '13.5px', fontWeight: 500, color: a.color, textAlign: 'right' }}>{a.amount}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button onClick={cmd.reset} style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, padding: '11px', borderRadius: '11px', cursor: 'pointer', width: '100%', marginTop: '16px' }}>Ask something else</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Six things */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(34px,4.4vw,64px) clamp(16px,3vw,24px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>WHAT PEXA CAN DO</Eyebrow>
            <h2 style={{ fontSize: 'clamp(27px,3.6vw,38px)', letterSpacing: '-.038em', fontWeight: 600, margin: '12px 0 0', maxWidth: '460px' }}>Six things to ask for.</h2>
          </div>
          <p style={{ fontSize: '14.5px', color: color.muted, lineHeight: 1.6, maxWidth: '290px', margin: 0 }}>Everything below is one sentence away. No menus, no forms, no addresses to paste.</p>
        </div>
        <div style={{ marginTop: 'clamp(22px,2.8vw,36px)', borderBottom: `1px solid ${color.border}` }}>
          {[
            ['01', 'Send', 'Send money with a single instruction.', '“Send $20 to @sarah.”'],
            ['02', 'Request', 'Create payment requests without a form.', '“Request $50 from @mike for the design.”'],
            ['03', 'Recurring', 'Schedule repeating payments in conversation.', '“Pay @sarah $20 every Friday.”'],
            ['04', 'Manage', 'Ask about balance, transactions and activity.', '“What’s my balance?”'],
            ['05', 'Transfer', 'Move supported assets to an external wallet.', '“Send 100 USDC to my external wallet.”'],
            ['06', 'Receive', 'Get paid through your username and wallet.', '“Share my Pexa username.”'],
          ].map(([n, title, desc, ex]) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0,150px) minmax(0,1fr)', gap: 'clamp(12px,2.4vw,28px)', alignItems: 'baseline', padding: '22px 4px', borderTop: `1px solid ${color.border}` }}>
              <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', letterSpacing: '.12em', color: color.primary }}>{n}</div>
              <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-.024em' }}>{title}</div>
              <div>
                <div style={{ fontSize: '15px', color: color.ink, lineHeight: 1.5 }}>{desc}</div>
                <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '12.5px', color: color.primaryHover, marginTop: '7px' }}>{ex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(40px,5.2vw,76px) clamp(16px,3vw,24px)' }}>
        <div style={{ maxWidth: '560px' }}>
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,3.8vw,40px)', letterSpacing: '-.04em', fontWeight: 600, margin: '12px 0 0', lineHeight: 1.07 }}>From sign-up to<br />completed payment.</h2>
        </div>
        <div style={{ marginTop: 'clamp(24px,3.2vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '0 26px' }}>
          {[
            ['01', 'Create your account', 'Email or a passkey. No seed phrase to write down.'],
            ['02', 'Get your payment wallet', 'Pick a username and Pexa provisions your wallet on Celo.'],
            ['03', 'Talk to your agent', 'Say what you want to happen, in plain language.'],
            ['04', 'Approve and complete', 'You confirm. Pexa executes and hands back a receipt.'],
          ].map(([n, title, desc]) => (
            <div key={n} style={{ padding: '26px 24px 30px 0', borderTop: `1px solid ${color.border}` }}>
              <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', letterSpacing: '.12em', color: color.primary }}>{n}</div>
              <div style={{ fontSize: '17.5px', fontWeight: 600, letterSpacing: '-.022em', marginTop: '12px' }}>{title}</div>
              <p style={{ fontSize: '14.5px', color: color.muted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '270px' }}>{desc}</p>
            </div>
          ))}
        </div>
        {/* Settlement flow strip */}
        <div style={{ marginTop: 'clamp(26px,3.4vw,42px)', border: `1px solid ${color.border}`, background: color.surface, borderRadius: '18px', padding: 'clamp(20px,3vw,30px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.6vw,18px)', flexWrap: 'wrap' }}>
            {[['Your account', '0s', true], ['Pexa agent', '0.35s', false], ['Celo', '0.7s', false]].map(([label, delay, primary], idx, arr) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.6vw,18px)' }}>
                <div style={{ border: `1px solid ${primary ? color.primary : color.borderStrong}`, borderRadius: '11px', padding: '11px 15px', fontSize: '13.5px', fontWeight: 500, color: color.ink, whiteSpace: 'nowrap' }}>{label}</div>
                {idx < arr.length ? <FlowArrow delay={delay as string} /> : null}
              </div>
            ))}
            <div style={{ border: `1px solid ${color.borderStrong}`, borderRadius: '11px', padding: '11px 15px', fontSize: '13.5px', fontWeight: 500, color: color.ink, whiteSpace: 'nowrap' }}>Completed payment</div>
          </div>
          <div style={{ fontSize: '13.5px', color: color.mutedStrong, marginTop: '18px', maxWidth: '520px' }}>Pexa prepares the transaction and shows it to you. You approve it. It settles onchain and comes back as a receipt.</div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(40px,5.2vw,76px) clamp(16px,3vw,24px)' }}>
        <div style={{ maxWidth: '560px' }}>
          <Eyebrow>INTEGRATIONS</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,3.8vw,40px)', letterSpacing: '-.04em', fontWeight: 600, margin: '12px 0 0', lineHeight: 1.07 }}>Reach your agent from the assistant you already use.</h2>
          <p style={{ fontSize: '16px', color: color.muted, lineHeight: 1.62, margin: '16px 0 0', maxWidth: '450px' }}>Connect Pexa over MCP. Payments still require your confirmation, wherever the instruction came from.</p>
        </div>
        <div style={{ marginTop: 'clamp(24px,3.2vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(288px,1fr))', gap: '16px' }}>
          {[
            ['ChatGPT', 'Use Pexa payment capabilities directly from your AI conversations.', '#F3F4F6', '#E3E5E9', '/assets/logo-chatgpt.png'],
            ['Claude', 'Use Pexa to manage payments directly from your Claude workflow.', '#FBF0EA', '#F3DED1', '/assets/logo-claude.png'],
          ].map(([name, desc, bg, bd, logo]) => (
            <div key={name} style={{ border: `1px solid ${color.border}`, background: color.surface, borderRadius: '18px', padding: 'clamp(20px,2.6vw,26px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, border: `1px solid ${bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt={name} style={{ width: 24, height: 24, objectFit: 'contain', display: 'block', borderRadius: name === 'Claude' ? 6 : undefined }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${color.primarySoftBorder}`, background: '#F4F6FE', borderRadius: '999px', padding: '5px 11px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: color.primary, display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.1em', color: color.primaryHover }}>AVAILABLE VIA MCP</span>
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '-.024em', marginTop: '18px' }}>{name}</div>
              <p style={{ fontSize: '14.5px', color: color.muted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '300px' }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', border: `1px solid ${color.border}`, background: color.surfaceMuted, borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.12em', color: color.faint }}>MCP TOOLS</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {MCP_TOOLS.map((t) => (
              <span key={t} style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', color: color.primaryHover, border: `1px solid ${color.border}`, background: color.surface, borderRadius: '8px', padding: '6px 9px' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Agent network (roadmap) */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(40px,5.2vw,74px) clamp(16px,3vw,24px)' }}>
        <div style={{ border: `1px dashed ${color.primarySoftBorder}`, background: '#FAFBFE', borderRadius: '20px', padding: 'clamp(24px,3.4vw,44px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Eyebrow>AGENT NETWORK</Eyebrow>
            <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '10.5px', letterSpacing: '.1em', color: '#8A6A1E', border: '1px solid #EBD9A8', background: '#FCF7E8', borderRadius: '999px', padding: '5px 10px' }}>ON THE ROADMAP · NOT YET AVAILABLE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(27px,3.6vw,38px)', letterSpacing: '-.038em', fontWeight: 600, margin: '14px 0 0', maxWidth: '520px', lineHeight: 1.08 }}>Your agent won’t always work alone.</h2>
          <p style={{ fontSize: '16px', color: color.muted, lineHeight: 1.62, margin: '16px 0 0', maxWidth: '480px' }}>We’re working toward a network where Pexa can discover and interact with other AI agents, request services, and let agents transact with each other.</p>
          <div style={{ marginTop: 'clamp(22px,3vw,34px)', display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.6vw,18px)', flexWrap: 'wrap', opacity: 0.9 }}>
            {['Pexa', 'Discover', 'Verified agent', 'Service'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px,1.6vw,18px)' }}>
                <div style={{ border: `1px solid ${i === 0 ? '#7E9BF5' : '#CFD6E8'}`, borderRadius: '11px', padding: '11px 15px', fontSize: '13.5px', fontWeight: 500, color: '#3D4757', whiteSpace: 'nowrap' }}>{label}</div>
                <svg viewBox="0 0 34 8" aria-hidden="true" style={{ width: 34, height: 8, flex: 'none', overflow: 'visible' }}>
                  <path d="M0 4h26" stroke="#CFD6E8" strokeWidth="1.2" />
                  <path d="M26 4 22 1.4M26 4 22 6.6" stroke="#CFD6E8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  <circle r="2.4" fill="#7E9BF5"><animateMotion dur="2.6s" repeatCount="indefinite" path="M0 4h26" begin={`${i * 0.35}s`} /></circle>
                </svg>
              </div>
            ))}
            <div style={{ border: '1px solid #CFD6E8', borderRadius: '11px', padding: '11px 15px', fontSize: '13.5px', fontWeight: 500, color: '#3D4757', whiteSpace: 'nowrap' }}>Payment</div>
          </div>
        </div>
      </section>

      {/* Infrastructure (dark) */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(16px,3vw,24px) clamp(40px,5.2vw,74px)' }}>
        <div style={{ background: color.ink, borderRadius: '20px', padding: 'clamp(28px,4vw,52px)', color: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(24px,3.4vw,48px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: '#8A93A5' }}>INFRASTRUCTURE</div>
              <h2 style={{ fontSize: 'clamp(27px,3.6vw,38px)', letterSpacing: '-.038em', fontWeight: 600, margin: '14px 0 0', lineHeight: 1.08, maxWidth: '400px' }}>Built for programmable payments on Celo.</h2>
              <p style={{ fontSize: '15.5px', color: '#A3ACBC', lineHeight: 1.65, margin: '16px 0 0', maxWidth: '400px' }}>Celo is the settlement network underneath Pexa. Payments settle onchain in supported stablecoins, and every transaction has a hash you can look up.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginTop: '22px' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#F5D96B', border: '1px solid #E2C453', flex: 'none' }} />
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Settles on Celo</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[['Pexa agent', 'prepares', false], ['Your confirmation', 'required', false], ['Celo', 'onchain settlement', true]].map(([a, b, hi], i, arr) => (
                <div key={a as string}>
                  <div style={{ border: `1px solid ${hi ? '#2E3C63' : '#232B3A'}`, background: hi ? '#161F36' : '#141B29', borderRadius: '13px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{a}</span>
                    <span style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', color: hi ? '#9FB4F0' : '#8A93A5' }}>{b}</span>
                  </div>
                  {i < arr.length - 1 ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <svg viewBox="0 0 8 26" aria-hidden="true" style={{ width: 8, height: 26, overflow: 'visible' }}>
                        <path d="M4 0v20" stroke="#2C3547" strokeWidth="1.2" />
                        <path d="M4 20 1.6 16M4 20 6.4 16" stroke="#2C3547" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        <circle r="2.2" fill="#7E9BF5"><animateMotion dur="2.2s" repeatCount="indefinite" path="M4 0v20" begin={`${i * 0.5}s`} /></circle>
                      </svg>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(16px,3vw,24px) clamp(48px,6vw,92px)' }}>
        <div style={{ textAlign: 'center', padding: 'clamp(24px,4vw,40px) 0' }}>
          <h2 style={{ fontSize: 'clamp(30px,5vw,54px)', letterSpacing: '-.045em', fontWeight: 600, margin: 0, lineHeight: 1.02 }}>Your wallet doesn’t need<br />another dashboard.</h2>
          <p style={{ fontSize: 'clamp(17px,2vw,22px)', color: color.primary, fontWeight: 500, letterSpacing: '-.025em', margin: '18px 0 0' }}>Just talk to Pexa.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
            <button onClick={onEnter} style={{ border: 'none', background: color.ink, color: '#fff', fontSize: '15.5px', fontWeight: 500, padding: '15px 26px', borderRadius: '12px', cursor: 'pointer' }}>Start using Pexa</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${color.borderFaint}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '30px clamp(16px,3vw,24px) 46px', display: 'flex', gap: '26px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <PrivyPayLogo size={17} />
              <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-.025em' }}>Pexa</span>
            </div>
            <div style={{ fontSize: '13.5px', color: color.mutedStrong, marginTop: '8px' }}>Your money, handled by an AI agent.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <a href="#product" style={{ fontSize: '13.5px', color: color.muted, textDecoration: 'none' }}>Product</a>
            <a href="#how" style={{ fontSize: '13.5px', color: color.muted, textDecoration: 'none' }}>How it works</a>
            <a href="#integrations" style={{ fontSize: '13.5px', color: color.muted, textDecoration: 'none' }}>Integrations</a>
          </div>
          <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11.5px', color: color.faint, letterSpacing: '.1em', width: '100%' }}>STABLECOIN PAYMENTS ON CELO</div>
        </div>
      </footer>

      <style>{`@media(min-width:720px){.pexa-navlinks{display:flex!important}.pexa-navcta{margin-left:0!important}}`}</style>
    </div>
  );
}
