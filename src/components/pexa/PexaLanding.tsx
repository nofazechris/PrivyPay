'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PrivyPayLogo } from '@/components/brand/PrivyPayLogo';
import { color } from '@/lib/design/tokens';

/**
 * Pexa marketing landing (rebuilt from design/Pexa.dc.html). Agent-first: a sticky nav, a hero
 * with a self-playing agent demo (type → resolve → preview → send → receipt), the six things you
 * can ask for, and a how-it-works strip. `onEnter` is the single CTA — it routes to sign-in (or
 * straight to the app if already authenticated), decided by the caller.
 */

type Stage = 'typing' | 'working' | 'resolved' | 'preview' | 'sending' | 'done';
const DEMO_TEXT = 'Send $20 to @sarah';

function useHeroDemo() {
  const [stage, setStage] = useState<Stage>('typing');
  const [typed, setTyped] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useRef(false);
  // Holds the latest `start` so the loop can restart itself without referencing `start` before
  // it's declared (kept in sync via an effect, never mutated during render).
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

const STATE_LABEL: Record<Stage, string> = {
  typing: 'Listening',
  working: 'Understanding',
  resolved: 'Resolving',
  preview: 'Awaiting confirmation',
  sending: 'Sending',
  done: 'Completed',
};

export function PexaLanding({ onEnter }: { onEnter: () => void }) {
  const hero = useHeroDemo();

  return (
    <div style={{ minHeight: '100dvh', background: color.background, color: color.ink }}>
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(246,247,249,.82)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${color.border}` }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '13px clamp(16px,3vw,24px)', display: 'flex', alignItems: 'center', gap: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <PrivyPayLogo size={21} />
            <span style={{ fontSize: '16.5px', fontWeight: 600, letterSpacing: '-.025em' }}>Pexa</span>
          </div>
          <nav style={{ display: 'none', gap: '22px', marginLeft: 'auto' }} className="pexa-navlinks">
            <a href="#product" style={{ fontSize: '14px', color: color.muted, textDecoration: 'none' }}>Product</a>
            <a href="#how" style={{ fontSize: '14px', color: color.muted, textDecoration: 'none' }}>How it works</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }} className="pexa-navcta">
            <button onClick={onEnter} style={{ border: 'none', background: 'transparent', color: color.ink, fontSize: '14px', fontWeight: 500, padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}>Log in</button>
            <button onClick={onEnter} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, padding: '10px 18px', borderRadius: '11px', cursor: 'pointer' }}>Open Pexa</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div style={{ position: 'absolute', inset: '-12%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(46% 42% at 68% 22%,rgba(27,69,215,.10),rgba(27,69,215,0) 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(90deg,rgba(27,69,215,.045) 1px,transparent 1px),linear-gradient(rgba(27,69,215,.045) 1px,transparent 1px)', backgroundSize: '72px 72px', WebkitMaskImage: 'radial-gradient(72% 62% at 52% 38%,#000,transparent)', maskImage: 'radial-gradient(72% 62% at 52% 38%,#000,transparent)' }} />
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
                {/* user message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', background: color.ink, color: '#fff', borderRadius: '14px 14px 4px 14px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '15.5px', lineHeight: 1.35 }}>
                    <span>{hero.typed}</span>
                    {hero.stage === 'typing' ? <span style={{ width: 2, height: 17, background: '#7E9BF5', display: 'inline-block', animation: 'pp-caret 1s step-end infinite' }} /> : null}
                  </div>
                </div>

                {hero.stage === 'working' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', animation: 'pp-fade .22s ease both' }}>
                    <div style={{ display: 'flex', gap: '4px', border: `1px solid ${color.borderFaint}`, background: color.surfaceMuted, borderRadius: '14px 14px 14px 4px', padding: '13px 14px' }}>
                      <Dot d="0s" /><Dot d=".16s" /><Dot d=".32s" />
                    </div>
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
                      <Meta label="To" value="@sarah" />
                      <Meta label="Network" value="Celo" />
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

      {/* Six things */}
      <section id="product" style={{ maxWidth: '1160px', margin: '0 auto', padding: 'clamp(34px,4.4vw,64px) clamp(16px,3vw,24px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: color.mutedStrong }}>WHAT PEXA CAN DO</div>
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
          <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '11px', letterSpacing: '.14em', color: color.mutedStrong }}>HOW IT WORKS</div>
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
      </section>

      {/* Footer CTA */}
      <section style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 clamp(16px,3vw,24px) clamp(48px,6vw,84px)' }}>
        <div style={{ background: color.ink, borderRadius: '22px', padding: 'clamp(28px,4vw,52px)', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 'clamp(26px,3.6vw,40px)', letterSpacing: '-.04em', fontWeight: 600, margin: 0 }}>Meet your payment agent.</h2>
          <p style={{ fontSize: '16px', color: '#A3ACBC', lineHeight: 1.6, margin: '14px auto 0', maxWidth: '440px' }}>Create an account, pick a username, and start paying by conversation.</p>
          <button onClick={onEnter} style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '15px', fontWeight: 500, padding: '14px 26px', borderRadius: '11px', cursor: 'pointer', marginTop: '24px' }}>Start using Pexa</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', justifyContent: 'center', marginTop: '26px', color: color.mutedStrong }}>
          <PrivyPayLogo size={16} />
          <span style={{ fontSize: '13px' }}>Pexa · Stablecoin payments on Celo</span>
        </div>
      </section>

      <style>{`@media(min-width:720px){.pexa-navlinks{display:flex!important}.pexa-navcta{margin-left:0!important}}`}</style>
    </div>
  );
}

function Dot({ d }: { d: string }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.primary, display: 'inline-block', animation: `pp-pulse 1.1s ease-in-out ${d} infinite` }} />;
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
      <span style={{ color: color.mutedStrong }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
