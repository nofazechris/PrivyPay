'use client';

/**
 * Animated hero backdrop, ported from the `HERO_BG` / `mountHeroBg` block of
 * "PrivyPay v3.dc.html".
 *
 * Three stacked canvases draw a network of drifting curves. Payment pulses travel along
 * them, leaving an expanding ring where they land, and each layer parallaxes against the
 * pointer and the scroll position at its own depth.
 *
 * The design file drives frames from a rAF loop backed by a 50ms interval watchdog, because
 * requestAnimationFrame stalls whenever the page is composited but not painting (an inactive
 * preview pane, an occluded window). That watchdog is kept here — it is load-bearing, not a
 * quirk of the design host — though it is scoped to the engine rather than hung off `window`
 * globals, and it stands down for a genuinely hidden tab so nothing burns CPU in the
 * background.
 */

import { useEffect, useState } from 'react';

type LayerKey = 'Far' | 'Mid' | 'Near';

interface LayerCfg {
  key: LayerKey;
  count: number;
  alpha: number;
  width: number;
  blur: number;
  parallax: number;
  drift: number;
  scroll: number;
}

const HERO_BG = {
  layers: [
    { key: 'Far', count: 6, alpha: 0.07, width: 1, blur: 2.4, parallax: 7, drift: 0.5, scroll: 0.05 },
    { key: 'Mid', count: 4, alpha: 0.125, width: 1.15, blur: 1, parallax: 4, drift: 0.85, scroll: 0.08 },
    { key: 'Near', count: 3, alpha: 0.19, width: 1.5, blur: 0, parallax: 2, drift: 1.2, scroll: 0.12 },
  ] as LayerCfg[],
  ink: '27,69,215',
  pulseMin: 3200,
  pulseMax: 7200,
  pulseSpeed: 0.0004,
  labels: ['$20 USDC', '$120 USDC', '$48 USDC', '$250 USDC'],
};

type Point = [number, number];

interface NetPath {
  pts: Point[];
  phase: number;
  amp: number;
  glow: number;
  nodeAt: boolean[];
  /** Pixel-space points from the last draw; pulses ride these. */
  drawn?: Point[];
}

interface Group {
  L: LayerCfg;
  paths: NetPath[];
}

interface Pulse {
  li: number;
  pi: number;
  t: number;
  speed: number;
  label: string;
  labelled: boolean;
}

interface Ring {
  li: number;
  x: number;
  y: number;
  r: number;
  alpha: number;
}

/** The live DOM nodes, written by the callback refs at commit time. */
interface HeroNodes {
  layerFar: HTMLDivElement | null;
  layerMid: HTMLDivElement | null;
  layerNear: HTMLDivElement | null;
  canvasFar: HTMLCanvasElement | null;
  canvasMid: HTMLCanvasElement | null;
  canvasNear: HTMLCanvasElement | null;
}

/**
 * Callback refs rather than ref objects. They end up spread across the whole view model, and
 * a ref object there makes every downstream `v.something` read look like a ref access during
 * render; a plain function does not.
 */
export interface HeroRefs {
  layerFarRef: (el: HTMLDivElement | null) => void;
  layerMidRef: (el: HTMLDivElement | null) => void;
  layerNearRef: (el: HTMLDivElement | null) => void;
  canvasFarRef: (el: HTMLCanvasElement | null) => void;
  canvasMidRef: (el: HTMLCanvasElement | null) => void;
  canvasNearRef: (el: HTMLCanvasElement | null) => void;
}

/** Deterministic LCG, so the network is identical on every load. */
function rand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

/** Point a fraction `t` along a polyline, by arc length. */
function pointAt(pts: Point[], t: number): Point {
  if (!pts || pts.length < 2) return [0, 0];
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(d);
    total += d;
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
}

class HeroEngine {
  private nodes: HeroNodes;
  private net: Group[] = [];
  private pulses: Pulse[] = [];
  private rings: Ring[] = [];
  private bw = 0;
  private bh = 0;
  private mx = 0;
  private my = 0;
  private tmx = 0;
  private tmy = 0;
  private scrollY = 0;
  private nextPulse = 1400;
  private lastTs = 0;
  private raf = 0;
  private watch: ReturnType<typeof setInterval> | null = null;
  private frameAt = 0;
  private alive = false;
  private reduce = false;

  private onResize = () => {
    try {
      this.size();
    } catch {
      /* a detached canvas during teardown is not worth reporting */
    }
  };

  private onMove = (e: PointerEvent) => {
    const c = this.nodes.canvasNear;
    if (!c) return;
    const r = c.getBoundingClientRect();
    this.tmx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    this.tmy = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };

  private onScroll = () => {
    this.scrollY = window.scrollY || 0;
  };

  private tick = (ts: number) => {
    if (!this.alive) return;
    try {
      this.frame(ts);
    } catch {
      /* keep the loop running even if one frame fails */
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  constructor(nodes: HeroNodes) {
    this.nodes = nodes;
  }

  private canvas(key: LayerKey) {
    return key === 'Far' ? this.nodes.canvasFar : key === 'Mid' ? this.nodes.canvasMid : this.nodes.canvasNear;
  }

  private wrap(key: LayerKey) {
    return key === 'Far' ? this.nodes.layerFar : key === 'Mid' ? this.nodes.layerMid : this.nodes.layerNear;
  }

  private build() {
    this.net = HERO_BG.layers.map((L, li) => {
      const rnd = rand(9173 + li * 733);
      const paths: NetPath[] = [];
      for (let i = 0; i < L.count; i++) {
        const pts: Point[] = [];
        let x = -0.24;
        let y = rnd() * 1.26 - 0.13;
        const segs = 3 + Math.floor(rnd() * 3);
        for (let k = 0; k <= segs; k++) {
          pts.push([x, Math.max(-0.18, Math.min(1.18, y))]);
          x += (1.56 / segs) * (0.72 + rnd() * 0.56);
          y += (rnd() - 0.46) * 0.42;
        }
        // Property order matters: each rnd() call advances the shared sequence.
        paths.push({ pts, phase: rnd() * 6.283, amp: 3 + rnd() * 9, glow: rnd() * 6.283, nodeAt: pts.map(() => rnd() > 0.44) });
      }
      return { L, paths };
    });
  }

  private size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const L of HERO_BG.layers) {
      const c = this.canvas(L.key);
      if (!c) continue;
      const r = c.getBoundingClientRect();
      this.bw = Math.max(320, r.width);
      this.bh = Math.max(240, r.height);
      c.width = Math.round(this.bw * dpr);
      c.height = Math.round(this.bh * dpr);
      c.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Blur once, on the compositor, rather than re-running a full-canvas convolution
      // inside every drawLayer via ctx.filter. Each layer is its own canvas, so this blurs
      // exactly that layer's content.
      c.style.filter = L.blur ? 'blur(' + L.blur + 'px)' : '';
    }
    this.build();
  }

  spawnPulse(fast: boolean) {
    if (!this.net.length) return;
    const li = fast ? 2 : Math.random() < 0.55 ? 2 : 1;
    const group = this.net[li];
    if (!group) return;
    this.pulses.push({
      li,
      pi: Math.floor(Math.random() * group.paths.length),
      t: 0,
      speed: HERO_BG.pulseSpeed * (fast ? 1.8 : 0.8 + Math.random() * 0.6),
      label: HERO_BG.labels[Math.floor(Math.random() * HERO_BG.labels.length)],
      labelled: fast || Math.random() > 0.45,
    });
  }

  /** The hero reel's own moments push extra traffic through the network. */
  onHeroStage(stage: string) {
    if (!this.alive || this.reduce) return;
    if (stage === 'sending') this.spawnPulse(true);
    if (stage === 'done' && this.net.length) {
      this.rings.push({ li: 2, x: this.bw * 0.7, y: this.bh * 0.44, r: 4, alpha: 0.9 });
      this.nextPulse = Math.min(this.nextPulse, 900);
    }
  }

  private drawLayer(li: number, t: number) {
    const group = this.net[li];
    if (!group) return;
    const L = group.L;
    const c = this.canvas(L.key);
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = this.bw;
    const hh = this.bh;

    ctx.clearRect(0, 0, w, hh);
    ctx.lineCap = 'round';

    for (const p of group.paths) {
      const pts: Point[] = p.pts.map((q, qi) => [q[0] * w, q[1] * hh + Math.sin(t * 0.00016 * L.drift + p.phase + qi * 0.55) * p.amp]);
      p.drawn = pts;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const cur = pts[i];
        ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + cur[0]) / 2, (prev[1] + cur[1]) / 2);
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.strokeStyle = 'rgba(' + HERO_BG.ink + ',' + L.alpha + ')';
      ctx.lineWidth = L.width;
      ctx.stroke();

      pts.forEach((q, qi) => {
        if (!p.nodeAt[qi]) return;
        const beat = 0.5 + 0.5 * Math.sin(t * 0.0008 + p.glow + qi);
        ctx.beginPath();
        ctx.arc(q[0], q[1], 1.5 + beat * 1.1, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + HERO_BG.ink + ',' + (L.alpha * 2.5 * (0.45 + beat * 0.6)).toFixed(3) + ')';
        ctx.fill();
      });
    }

    for (const pl of this.pulses) {
      if (pl.li !== li) continue;
      const p = group.paths[pl.pi];
      if (!p || !p.drawn) continue;
      const pos = pointAt(p.drawn, pl.t);
      const tail = pointAt(p.drawn, Math.max(0, pl.t - 0.07));
      const fade = pl.t < 0.1 ? pl.t / 0.1 : pl.t > 0.88 ? (1 - pl.t) / 0.12 : 1;

      const g = ctx.createLinearGradient(tail[0], tail[1], pos[0], pos[1]);
      g.addColorStop(0, 'rgba(' + HERO_BG.ink + ',0)');
      g.addColorStop(1, 'rgba(' + HERO_BG.ink + ',' + (0.5 * fade).toFixed(3) + ')');
      ctx.beginPath();
      ctx.moveTo(tail[0], tail[1]);
      ctx.lineTo(pos[0], pos[1]);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const halo = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 11);
      halo.addColorStop(0, 'rgba(' + HERO_BG.ink + ',' + (0.32 * fade).toFixed(3) + ')');
      halo.addColorStop(1, 'rgba(' + HERO_BG.ink + ',0)');
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 11, 0, 6.2832);
      ctx.fillStyle = halo;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 2.5, 0, 6.2832);
      ctx.fillStyle = 'rgba(' + HERO_BG.ink + ',' + (0.85 * fade).toFixed(3) + ')';
      ctx.fill();

      if (pl.labelled && pl.t > 0.3 && pl.t < 0.74) {
        const lf = Math.sin(((pl.t - 0.3) / 0.44) * Math.PI);
        ctx.font = '500 11px ui-sans-serif, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(21,58,180,' + (0.62 * lf).toFixed(3) + ')';
        ctx.fillText(pl.label, pos[0] + 11, pos[1] - 9);
      }
    }

    for (const r of this.rings) {
      if (r.li !== li) continue;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, 6.2832);
      ctx.strokeStyle = 'rgba(' + HERO_BG.ink + ',' + (r.alpha * 0.55).toFixed(3) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  private frame(ts: number) {
    this.frameAt = ts;
    const dt = Math.min(48, ts - (this.lastTs || ts));
    this.lastTs = ts;

    this.mx += (this.tmx - this.mx) * 0.055;
    this.my += (this.tmy - this.my) * 0.055;
    for (const L of HERO_BG.layers) {
      const wrap = this.wrap(L.key);
      if (wrap) {
        wrap.style.transform =
          'translate3d(' + (this.mx * L.parallax).toFixed(2) + 'px,' + (this.my * L.parallax - this.scrollY * L.scroll).toFixed(2) + 'px,0)';
      }
    }

    this.nextPulse -= dt;
    if (this.nextPulse <= 0) {
      this.spawnPulse(false);
      this.nextPulse = HERO_BG.pulseMin + Math.random() * (HERO_BG.pulseMax - HERO_BG.pulseMin);
    }

    for (const pl of this.pulses) pl.t += pl.speed * dt;
    for (const pl of this.pulses) {
      if (pl.t < 1) continue;
      const p = this.net[pl.li]?.paths[pl.pi];
      if (p?.drawn) {
        const end = p.drawn[p.drawn.length - 1];
        this.rings.push({ li: pl.li, x: end[0], y: end[1], r: 2, alpha: 0.85 });
      }
    }
    this.pulses = this.pulses.filter((pl) => pl.t < 1);

    for (const r of this.rings) {
      r.r += dt * 0.055;
      r.alpha -= dt * 0.0011;
    }
    this.rings = this.rings.filter((r) => r.alpha > 0.02);

    for (let li = 0; li < this.net.length; li++) this.drawLayer(li, ts);
  }

  mount(): boolean {
    if (this.alive) return true;
    if (HERO_BG.layers.some((L) => !this.canvas(L.key))) return false;

    this.mx = 0;
    this.my = 0;
    this.tmx = 0;
    this.tmy = 0;
    this.scrollY = 0;
    this.pulses = [];
    this.rings = [];
    this.nextPulse = 1400;
    this.lastTs = 0;
    this.reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    try {
      this.size();
      this.drawLayer(0, 0);
    } catch {
      return false;
    }

    this.alive = true;
    window.addEventListener('resize', this.onResize);

    if (this.reduce) {
      for (let li = 0; li < this.net.length; li++) this.drawLayer(li, 0);
      return true;
    }

    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.lastTs = performance.now();
    this.frameAt = this.lastTs;
    this.raf = requestAnimationFrame(this.tick);

    // rAF goes quiet while the page is not painting; step the animation by hand if a frame
    // has not landed recently, unless the tab is actually hidden.
    this.watch = setInterval(() => {
      if (!this.alive || this.reduce || document.visibilityState === 'hidden') return;
      const now = performance.now();
      if (now - this.frameAt <= 120) return;
      try {
        this.frame(now);
      } catch {
        /* same tolerance as the rAF path */
      }
    }, 50);
    return true;
  }

  unmount() {
    this.alive = false;
    if (this.watch) clearInterval(this.watch);
    this.watch = null;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('scroll', this.onScroll);
  }
}

/**
 * Owns the node store, the engine and the callback refs as one long-lived object, so the
 * setters handed to `ref={...}` are plain bound methods rather than closures over a React
 * ref or over state.
 */
class HeroController {
  private nodes: HeroNodes = { layerFar: null, layerMid: null, layerNear: null, canvasFar: null, canvasMid: null, canvasNear: null };
  private engine: HeroEngine | null = null;
  private pendingRetry = 0;

  readonly refs: HeroRefs = {
    layerFarRef: (el) => { this.nodes.layerFar = el; },
    layerMidRef: (el) => { this.nodes.layerMid = el; },
    layerNearRef: (el) => { this.nodes.layerNear = el; },
    canvasFarRef: (el) => { this.nodes.canvasFar = el; },
    canvasMidRef: (el) => { this.nodes.canvasMid = el; },
    canvasNearRef: (el) => { this.nodes.canvasNear = el; },
  };

  start() {
    const e = new HeroEngine(this.nodes);
    this.engine = e;
    // Canvases are attached by the time effects run, but a layout that has not been measured
    // yet reports a zero-size rect; retry once on the next frame if the first mount bails.
    if (!e.mount()) this.pendingRetry = requestAnimationFrame(() => e.mount());
  }

  stop() {
    if (this.pendingRetry) cancelAnimationFrame(this.pendingRetry);
    this.pendingRetry = 0;
    this.engine?.unmount();
    this.engine = null;
  }

  heroStage(stage: string) {
    this.engine?.onHeroStage(stage);
  }
}

/**
 * Runs the backdrop while the landing screen is on, and hands back the callback refs the
 * generated markup attaches to the three layer wrappers and their canvases.
 */
export function useHeroBackground(active: boolean, heroStage: string): HeroRefs {
  const [ctl] = useState(() => new HeroController());

  useEffect(() => {
    if (!active) return;
    ctl.start();
    return () => ctl.stop();
  }, [active, ctl]);

  useEffect(() => {
    ctl.heroStage(heroStage);
  }, [ctl, heroStage]);

  return ctl.refs;
}
