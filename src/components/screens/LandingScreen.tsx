// AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand.
// Regenerate with: npm run design:build
/* eslint-disable react-hooks/refs -- `refs` holds callback refs (plain functions) from
   useHeroBackground, not ref objects; the rule reads `refs.xRef` as a `.current` access.
   See src/lib/heroBackground.ts. */
import { Fragment } from 'react';
import type { Vals } from '@/lib/viewModel';
import type { HeroRefs } from '@/lib/heroBackground';

export default function LandingScreen({ v, refs }: { v: Vals; refs: HeroRefs }) {
  return (
    <>
      <div data-screen-label="Landing">
        <div style={{ "position": "sticky", "top": "0", "zIndex": "40", "background": "rgba(246,247,249,.88)", "backdropFilter": "blur(10px)", "borderBottom": "1px solid #E8EAEF" }}>
          <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "14px 24px", "display": "flex", "alignItems": "center", "gap": "26px" }}>
            <div style={{ "display": "flex", "alignItems": "center", "gap": "9px" }}>
              <div style={{ "width": "20px", "height": "20px", "borderRadius": "6px", "background": "#1B45D7" }}></div>
              <span style={{ "fontSize": "16px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                {"PrivyPay"}
              </span>
            </div>
            <div style={{ "display": "flex", "gap": "20px", "marginLeft": "auto", "flexWrap": "wrap" }}>
              <a href="#agent" style={{ "fontSize": "14px", "color": "#5B6472" }}>
                {"Agent"}
              </a>
              <a href="#product" style={{ "fontSize": "14px", "color": "#5B6472" }}>
                {"Usernames"}
              </a>
              <a href="#how" style={{ "fontSize": "14px", "color": "#5B6472" }}>
                {"How it works"}
              </a>
              <a href="#connected" style={{ "fontSize": "14px", "color": "#5B6472" }}>
                {"Connected"}
              </a>
              <a href="#security" style={{ "fontSize": "14px", "color": "#5B6472" }}>
                {"Security"}
              </a>
            </div>
            <button className="scp0 scp1" onClick={v.enterApp} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "10px 18px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease" }}>
              {"Get started"}
            </button>
          </div>
        </div>
        <div style={{ "position": "relative", "overflow": "hidden", "isolation": "isolate" }}>
          <div style={{ "position": "absolute", "inset": "-12%", "zIndex": "0", "pointerEvents": "none", "background": "radial-gradient(46% 42% at 68% 22%,rgba(27,69,215,.10),rgba(27,69,215,0) 70%)", "animation": "pp-atmos 34s ease-in-out infinite alternate" }}></div>
          <div style={{ "position": "absolute", "inset": "-12%", "zIndex": "0", "pointerEvents": "none", "background": "radial-gradient(40% 44% at 18% 74%,rgba(27,69,215,.06),rgba(27,69,215,0) 72%)", "animation": "pp-atmos-2 44s ease-in-out infinite alternate" }}></div>
          <div style={{ "position": "absolute", "inset": "0", "zIndex": "0", "pointerEvents": "none", "backgroundImage": "linear-gradient(90deg,rgba(27,69,215,.045) 1px,transparent 1px),linear-gradient(rgba(27,69,215,.045) 1px,transparent 1px)", "backgroundSize": "72px 72px", "WebkitMaskImage": "radial-gradient(72% 62% at 52% 38%,#000,transparent)", "maskImage": "radial-gradient(72% 62% at 52% 38%,#000,transparent)" }}></div>
          <div ref={refs.layerFarRef} style={{ "position": "absolute", "inset": "-7%", "zIndex": "0", "pointerEvents": "none", "willChange": "transform" }}>
            <canvas ref={refs.canvasFarRef} aria-hidden="true" style={{ "display": "block", "width": "100%", "height": "100%" }}></canvas>
          </div>
          <div ref={refs.layerMidRef} style={{ "position": "absolute", "inset": "-7%", "zIndex": "0", "pointerEvents": "none", "willChange": "transform" }}>
            <canvas ref={refs.canvasMidRef} aria-hidden="true" style={{ "display": "block", "width": "100%", "height": "100%" }}></canvas>
          </div>
          <div ref={refs.layerNearRef} style={{ "position": "absolute", "inset": "-7%", "zIndex": "0", "pointerEvents": "none", "willChange": "transform" }}>
            <canvas ref={refs.canvasNearRef} aria-hidden="true" style={{ "display": "block", "width": "100%", "height": "100%" }}></canvas>
          </div>
          <div style={{ "position": "relative", "zIndex": "1", "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(42px,6vw,84px) 24px clamp(28px,4vw,44px)", "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(330px,1fr))", "gap": "clamp(30px,4.6vw,58px)", "alignItems": "center" }}>
            <div>
              <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "display": "flex", "alignItems": "center", "gap": "8px", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".14em", "color": "#5B6472" }}>
                <span style={{ "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#1B45D7", "display": "inline-block", "animation": "pp-pulse 2.4s ease-in-out infinite" }}></span>
                {"AI PAYMENT AGENT · BUILT ON CELO "}
              </div>
              <h1 style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 70ms both", "fontSize": "clamp(40px,6.2vw,62px)", "lineHeight": "1.01", "letterSpacing": "-.042em", "fontWeight": "600", "margin": "20px 0 0" }}>
                {"Your payment agent,"}
                <br />
                <span style={{ "color": "#5B6472" }}>
                  {"wherever you work."}
                </span>
              </h1>
              <p style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 150ms both", "fontSize": "clamp(16.5px,1.5vw,18px)", "lineHeight": "1.65", "color": "#5B6472", "maxWidth": "458px", "margin": "22px 0 0", "textWrap": "pretty" }}>
                {"Send, request and manage stablecoin payments through a single intelligent payment layer connected to the tools you already use."}
              </p>
              <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 220ms both", "display": "flex", "gap": "10px", "marginTop": "28px", "flexWrap": "wrap" }}>
                <button className="scp2 scp3" onClick={v.enterApp} style={{ "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "13px 22px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease" }}>
                  {"Get started"}
                </button>
                <a className="scp4" href="#how" style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "15px", "fontWeight": "500", "padding": "13px 22px", "borderRadius": "11px", "transition": "border-color .16s ease,transform .16s ease" }}>
                  {"See how it works"}
                </a>
              </div>
              <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 300ms both", "display": "flex", "gap": "20px", "marginTop": "30px", "fontSize": "13px", "color": "#5F6878", "flexWrap": "wrap" }}>
                <span>
                  {"Instruction-driven"}
                </span>
                <span>
                  {"You confirm every payment"}
                </span>
                <span>
                  {"Settles on Celo"}
                </span>
              </div>
            </div>
            <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 250ms both", "position": "relative" }}>
              <div style={{ "position": "absolute", "inset": "-46px -26px", "background": "radial-gradient(54% 46% at 64% 24%,rgba(27,69,215,.08),rgba(27,69,215,0) 72%)", "pointerEvents": "none" }}></div>
              <div style={{ "position": "relative", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "18px", "padding": "20px", "boxShadow": "0 30px 60px -38px rgba(14,20,32,.34)" }}>
                <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "flexWrap": "wrap" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "9px" }}>
                    <div style={{ "width": "22px", "height": "22px", "borderRadius": "7px", "background": "#1B45D7" }}></div>
                    <span style={{ "fontSize": "14.5px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                      {"PrivyPay"}
                    </span>
                    <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".14em", "color": "#6C7484" }}>
                      {"AGENT"}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "border": "1px solid #DDE3F6", "background": "#F4F6FE", "borderRadius": "999px", "padding": "5px 11px" }}>
                    <span style={{ "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#1B45D7", "display": "inline-block", "animation": "pp-pulse 1.6s ease-in-out infinite" }}></span>
                    <span style={{ "fontSize": "11.5px", "fontWeight": "500", "color": "#153AB4", "whiteSpace": "nowrap" }}>
                      {v.heroStateLabel}
                    </span>
                  </div>
                </div>
                <div style={{ "marginTop": "18px", "border": "1px solid #EDEFF3", "background": "#FBFBFD", "borderRadius": "13px", "padding": "14px 15px" }}>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".14em", "color": "#6C7484" }}>
                    {"WHAT WOULD YOU LIKE TO DO?"}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "3px", "marginTop": "10px", "minHeight": "24px" }}>
                    <span style={{ "fontSize": "17.5px", "fontWeight": "500", "letterSpacing": "-.018em" }}>
                      {v.heroTyped}
                    </span>
                    <span style={{ "width": "2px", "height": "20px", "background": "#1B45D7", "display": "inline-block", "animation": "pp-caret 1s step-end infinite" }}></span>
                  </div>
                </div>
                {v.heroWorking ? (
                  <>
                    <div style={{ "marginTop": "15px", "display": "grid", "gap": "9px", "animation": "pp-fade .22s ease both" }}>
                      {v.heroSteps.map((st, i) => (
                        <Fragment key={i}>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13.5px" }}>
                            <span style={{ "width": "18px", "height": "18px", "borderRadius": "50%", "background": st.bg, "color": st.color, "fontSize": "10px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                              {st.mark}
                            </span>
                            <span style={{ "color": st.textColor }}>
                              {st.label}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                {v.heroHasRecipient ? (
                  <>
                    <div style={{ "marginTop": "15px", "display": "flex", "alignItems": "center", "gap": "12px", "border": "1px solid #EDEFF3", "borderRadius": "13px", "padding": "13px 14px", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both", "flexWrap": "wrap" }}>
                      <div style={{ "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "13.5px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                        {"S"}
                      </div>
                      <div style={{ "minWidth": "0" }}>
                        <div style={{ "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                          {"@sarah"}
                        </div>
                        <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5F6878", "marginTop": "2px" }}>
                          {"Sarah Okafor · 0x8F…21A"}
                        </div>
                      </div>
                      <span style={{ "marginLeft": "auto", "fontSize": "11.5px", "fontWeight": "500", "color": "#167A54" }}>
                        {"Resolved"}
                      </span>
                    </div>
                  </>
                ) : null}
                {v.heroPreview ? (
                  <>
                    <div style={{ "marginTop": "15px", "border": "1px solid #DDE3F6", "background": "#FCFCFE", "borderRadius": "13px", "padding": "16px", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both" }}>
                      <div style={{ "fontSize": "12.5px", "color": "#5F6878" }}>
                        {"Payment ready for confirmation"}
                      </div>
                      <div style={{ "fontSize": "32px", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "8px", "fontVariantNumeric": "tabular-nums" }}>
                        {"$20.00 "}
                        <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "fontWeight": "400", "color": "#5F6878" }}>
                          {"USDC"}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gap": "10px", "marginTop": "15px", "paddingTop": "14px", "borderTop": "1px solid #EDEFF3" }}>
                        <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                          <span style={{ "color": "#5F6878" }}>
                            {"Network"}
                          </span>
                          <span style={{ "fontWeight": "500" }}>
                            {"Celo"}
                          </span>
                        </div>
                        <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                          <span style={{ "color": "#5F6878" }}>
                            {"Privacy"}
                          </span>
                          <span style={{ "fontWeight": "500", "color": "#167A54" }}>
                            {"Enabled"}
                          </span>
                        </div>
                        <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                          <span style={{ "color": "#5F6878" }}>
                            {"Estimated fee"}
                          </span>
                          <span style={{ "fontWeight": "500", "fontVariantNumeric": "tabular-nums" }}>
                            {"$0.001"}
                          </span>
                        </div>
                      </div>
                      <div style={{ "display": "flex", "gap": "9px", "marginTop": "16px", "flexWrap": "wrap" }}>
                        <button className="scp0 scp3" onClick={v.heroConfirm} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "13px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease", "flex": "1", "minWidth": "160px" }}>
                          {"Confirm payment"}
                        </button>
                        <button className="scp5" onClick={v.heroReplay} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "14px", "fontWeight": "500", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease", "padding": "13px 18px" }}>
                          {"Cancel"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.heroSending ? (
                  <>
                    <div style={{ "marginTop": "15px", "border": "1px solid #EDEFF3", "borderRadius": "13px", "padding": "34px 16px", "textAlign": "center", "animation": "pp-fade .2s ease both" }}>
                      <div style={{ "position": "relative", "width": "44px", "height": "44px", "margin": "0 auto" }}>
                        <div style={{ "position": "absolute", "inset": "0", "borderRadius": "50%", "border": "2px solid #EDEFF3", "borderTopColor": "#1B45D7", "animation": "pp-spin .9s linear infinite" }}></div>
                      </div>
                      <div style={{ "fontSize": "16px", "fontWeight": "600", "marginTop": "18px", "letterSpacing": "-.018em" }}>
                        {"Sending payment"}
                      </div>
                      <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "6px" }}>
                        {"Submitting to Celo"}
                      </div>
                    </div>
                  </>
                ) : null}
                {v.heroDone ? (
                  <>
                    <div style={{ "marginTop": "15px", "border": "1px solid #EDEFF3", "borderRadius": "13px", "padding": "20px", "textAlign": "center", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both" }}>
                      <div style={{ "width": "44px", "height": "44px", "borderRadius": "50%", "background": "#1B45D7", "color": "#fff", "fontSize": "19px", "display": "flex", "alignItems": "center", "justifyContent": "center", "margin": "0 auto", "animation": "pp-pop .34s cubic-bezier(.2,.8,.3,1) both" }}>
                        {"✓"}
                      </div>
                      <div style={{ "fontSize": "16.5px", "fontWeight": "600", "marginTop": "16px", "letterSpacing": "-.02em" }}>
                        {"Payment sent"}
                      </div>
                      <div style={{ "fontSize": "34px", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "10px", "fontVariantNumeric": "tabular-nums" }}>
                        {"$20.00"}
                      </div>
                      <div style={{ "fontSize": "14px", "color": "#5B6472", "marginTop": "4px" }}>
                        {"@sarah · Celo"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#167A54", "marginTop": "9px" }}>
                        {"Completed"}
                      </div>
                      <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#6C7484", "marginTop": "12px" }}>
                        {"0x8f…91a"}
                      </div>
                      <button className="scp5" onClick={v.heroReplay} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease", "width": "100%", "marginTop": "16px" }}>
                        {"Replay"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div id="agent" style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(38px,5vw,72px) 24px" }}>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(300px,1fr))", "gap": "clamp(28px,4.2vw,54px)", "alignItems": "center" }}>
            <div data-reveal="left">
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"THE AGENT"}
              </div>
              <h2 style={{ "fontSize": "clamp(28px,3.8vw,40px)", "letterSpacing": "-.038em", "fontWeight": "600", "margin": "12px 0 0", "maxWidth": "420px" }}>
                {"Payments, simply instructed."}
              </h2>
              <p style={{ "fontSize": "16px", "color": "#5B6472", "lineHeight": "1.65", "margin": "16px 0 0", "maxWidth": "420px", "textWrap": "pretty" }}>
                {"Tell PrivyPay what you want to happen. It resolves the username, prepares the payment and hands it back to you for confirmation — nothing moves until you say so."}
              </p>
              <div style={{ "marginTop": "24px", "display": "grid", "gap": "11px", "maxWidth": "400px" }}>
                <div style={{ "display": "flex", "gap": "12px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#1B45D7", "width": "26px", "flex": "none" }}>
                    {"01"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Send, request and schedule payments"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "12px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#1B45D7", "width": "26px", "flex": "none" }}>
                    {"02"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Resolve usernames and find contacts"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "12px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#1B45D7", "width": "26px", "flex": "none" }}>
                    {"03"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Check balances, status and receipts"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "12px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#1B45D7", "width": "26px", "flex": "none" }}>
                    {"04"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Work from PrivyPay or a connected service"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ "animation": "pp-in-r .62s cubic-bezier(.2,.8,.3,1) both" }}>
              <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "18px", "padding": "clamp(18px,2.4vw,24px)", "boxShadow": "0 28px 56px -42px rgba(14,20,32,.32)" }}>
                <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "flexWrap": "wrap" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "9px" }}>
                    <div style={{ "width": "22px", "height": "22px", "borderRadius": "7px", "background": "#1B45D7" }}></div>
                    <span style={{ "fontSize": "14.5px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                      {"PrivyPay agent"}
                    </span>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "border": "1px solid #DDE3F6", "background": "#F4F6FE", "borderRadius": "999px", "padding": "5px 11px" }}>
                    <span style={{ "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#1B45D7", "display": "inline-block", "animation": "pp-pulse 1.6s ease-in-out infinite" }}></span>
                    <span style={{ "fontSize": "11.5px", "fontWeight": "500", "color": "#153AB4" }}>
                      {v.cmdStateLabel}
                    </span>
                  </div>
                </div>
                <div style={{ "fontSize": "clamp(19px,2.2vw,23px)", "fontWeight": "600", "letterSpacing": "-.028em", "marginTop": "16px" }}>
                  {"What would you like to do?"}
                </div>
                <div style={{ "display": "flex", "gap": "9px", "marginTop": "12px", "flexWrap": "wrap" }}>
                  <input className="scp6" value={v.cmdInput} onChange={v.onCmdInput} onKeyDown={v.onCmdKey} placeholder="Send $20 to @sarah" style={{ "flex": "1", "minWidth": "190px", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "11px", "padding": "13px 15px", "fontSize": "15px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                  <button className="scp0 scp3" onClick={v.runCmd} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease", "padding": "13px 20px" }}>
                    {"Run"}
                  </button>
                </div>
                {v.cmdIdle ? (
                  <>
                    <div style={{ "display": "flex", "gap": "8px", "marginTop": "13px", "flexWrap": "wrap" }}>
                      {v.cmdSuggestions.map((sg, i) => (
                        <Fragment key={i}>
                          <div className="scp7" onClick={sg.onClick} tabIndex={0} onKeyDown={sg.onKey} style={{ "fontSize": "13px", "color": "#153AB4", "border": "1px solid #DDE3F6", "background": "#F4F6FE", "borderRadius": "9px", "padding": "8px 12px", "cursor": "pointer", "outline": "none", "transition": "background .16s ease,transform .16s ease" }}>
                            {sg.label}
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                ) : null}
                {v.cmdWorking ? (
                  <>
                    <div style={{ "marginTop": "16px", "border": "1px solid #EDEFF3", "background": "#FBFBFD", "borderRadius": "14px", "padding": "16px", "animation": "pp-fade .2s ease both" }}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                        <span style={{ "position": "relative", "width": "16px", "height": "16px", "display": "inline-block", "flex": "none" }}>
                          <span style={{ "position": "absolute", "inset": "0", "borderRadius": "50%", "border": "2px solid #E4E8F6", "borderTopColor": "#1B45D7", "animation": "pp-spin .8s linear infinite" }}></span>
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "500" }}>
                          {v.cmdStatusLabel}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gap": "9px", "marginTop": "13px" }}>
                        {v.cmdSteps.map((st, i) => (
                          <Fragment key={i}>
                            <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "13.5px", "animation": "pp-step .3s cubic-bezier(.2,.8,.3,1) both" }}>
                              <span style={{ "width": "18px", "height": "18px", "borderRadius": "50%", "background": st.bg, "color": st.color, "fontSize": "10px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                                {st.mark}
                              </span>
                              <span style={{ "color": st.textColor }}>
                                {st.label}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
                {v.cmdAnswer ? (
                  <>
                    <div style={{ "marginTop": "16px", "border": "1px solid #EDEFF3", "borderRadius": "14px", "padding": "17px", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both" }}>
                      <div style={{ "fontSize": "13px", "color": "#5F6878" }}>
                        {v.cmdAnswerLabel}
                      </div>
                      <div style={{ "fontSize": "clamp(21px,2.5vw,27px)", "fontWeight": "600", "letterSpacing": "-.032em", "marginTop": "5px", "fontVariantNumeric": "tabular-nums", "textWrap": "pretty" }}>
                        {v.cmdAnswerValue}
                      </div>
                      <div style={{ "display": "grid", "gap": "11px", "marginTop": "15px" }}>
                        {v.cmdAnswerRows.map((a, i) => (
                          <Fragment key={i}>
                            <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "fontSize": "13.5px", "flexWrap": "wrap" }}>
                              <span style={{ "fontWeight": "600" }}>
                                {a.handle}
                              </span>
                              <span style={{ "color": "#5F6878" }}>
                                {a.sub}
                              </span>
                              <span style={{ "marginLeft": "auto", "fontWeight": "600", "color": a.color, "fontVariantNumeric": "tabular-nums" }}>
                                {a.amount}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <button onClick={v.cmdReset} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "14px", "fontWeight": "500", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease", "marginTop": "15px", "padding": "10px 16px" }}>
                        {"New instruction"}
                      </button>
                    </div>
                  </>
                ) : null}
                {v.cmdPreview ? (
                  <>
                    <div style={{ "marginTop": "16px", "border": "1px solid #DDE3F6", "background": "#FCFCFE", "borderRadius": "14px", "padding": "17px", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both" }}>
                      <div style={{ "fontSize": "13px", "color": "#5F6878" }}>
                        {v.cmdPreviewTitle}
                      </div>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "marginTop": "13px", "flexWrap": "wrap" }}>
                        <div style={{ "width": "36px", "height": "36px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                          {v.cmdInitial}
                        </div>
                        <div style={{ "minWidth": "0" }}>
                          <div style={{ "fontSize": "16px", "fontWeight": "600", "letterSpacing": "-.018em" }}>
                            {v.cmdHandle}
                          </div>
                          <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "1px" }}>
                            {v.cmdName}
                          </div>
                        </div>
                        <div style={{ "marginLeft": "auto", "fontSize": "24px", "fontWeight": "600", "letterSpacing": "-.035em", "fontVariantNumeric": "tabular-nums" }}>
                          {"$"}{v.cmdAmountStr}
                        </div>
                      </div>
                      <div style={{ "display": "grid", "gap": "10px", "marginTop": "15px", "paddingTop": "14px", "borderTop": "1px solid #EDEFF3" }}>
                        {v.cmdMetaRows.map((m, i) => (
                          <Fragment key={i}>
                            <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "14px", "fontSize": "13.5px" }}>
                              <span style={{ "color": "#5F6878" }}>
                                {m.label}
                              </span>
                              <span style={{ "fontWeight": "500", "textAlign": "right" }}>
                                {m.value}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{ "display": "flex", "gap": "9px", "marginTop": "17px", "flexWrap": "wrap" }}>
                        <button className="scp0 scp3" onClick={v.cmdConfirm} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "13px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease", "flex": "1", "minWidth": "170px" }}>
                          {v.cmdConfirmLabel}
                        </button>
                        <button className="scp5" onClick={v.cmdReset} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "14px", "fontWeight": "500", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease", "padding": "13px 20px" }}>
                          {"Cancel"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                {v.cmdProcessing ? (
                  <>
                    <div style={{ "marginTop": "16px", "border": "1px solid #EDEFF3", "borderRadius": "14px", "padding": "34px 17px", "textAlign": "center", "animation": "pp-fade .2s ease both" }}>
                      <div style={{ "position": "relative", "width": "44px", "height": "44px", "margin": "0 auto" }}>
                        <div style={{ "position": "absolute", "inset": "0", "borderRadius": "50%", "border": "2px solid #EDEFF3", "borderTopColor": "#1B45D7", "animation": "pp-spin .9s linear infinite" }}></div>
                      </div>
                      <div style={{ "fontSize": "16px", "fontWeight": "600", "marginTop": "18px", "letterSpacing": "-.018em" }}>
                        {"Sending payment"}
                      </div>
                      <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "6px" }}>
                        {"Submitting to Celo"}
                      </div>
                    </div>
                  </>
                ) : null}
                {v.cmdDone ? (
                  <>
                    <div style={{ "marginTop": "16px", "border": "1px solid #EDEFF3", "borderRadius": "14px", "padding": "18px", "animation": "pp-step .32s cubic-bezier(.2,.8,.3,1) both" }}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                        <span style={{ "width": "30px", "height": "30px", "borderRadius": "50%", "background": "#1B45D7", "color": "#fff", "fontSize": "14px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none", "animation": "pp-pop .34s cubic-bezier(.2,.8,.3,1) both" }}>
                          {"✓"}
                        </span>
                        <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                          {v.cmdDoneTitle}
                        </div>
                      </div>
                      <div style={{ "fontSize": "clamp(26px,3vw,33px)", "fontWeight": "600", "letterSpacing": "-.038em", "marginTop": "15px", "fontVariantNumeric": "tabular-nums" }}>
                        {"$"}{v.cmdAmountStr}{" "}
                        <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "fontWeight": "400", "color": "#5F6878" }}>
                          {"USDC"}
                        </span>
                      </div>
                      <div style={{ "display": "grid", "gap": "10px", "marginTop": "15px", "paddingTop": "14px", "borderTop": "1px solid #F0F1F4" }}>
                        {v.cmdReceiptRows.map((m, i) => (
                          <Fragment key={i}>
                            <div style={{ "display": "flex", "justifyContent": "space-between", "gap": "14px", "fontSize": "13.5px" }}>
                              <span style={{ "color": "#5F6878" }}>
                                {m.label}
                              </span>
                              <span style={{ "fontWeight": "500", "textAlign": "right" }}>
                                {m.value}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <button onClick={v.cmdReset} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#0E1420", "fontSize": "14px", "fontWeight": "500", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease", "marginTop": "16px", "padding": "11px 18px" }}>
                        {"New instruction"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(30px,4vw,58px) 24px" }}>
          <div style={{ "display": "flex", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "24px", "flexWrap": "wrap" }}>
            <div data-reveal="up">
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"WHEREVER YOU WORK"}
              </div>
              <h2 style={{ "fontSize": "clamp(26px,3.4vw,36px)", "letterSpacing": "-.036em", "fontWeight": "600", "margin": "12px 0 0", "maxWidth": "480px" }}>
                {"The same agent, inside the tools you already have open."}
              </h2>
            </div>
            <p style={{ "fontSize": "15px", "color": "#5B6472", "lineHeight": "1.65", "margin": "0", "maxWidth": "360px", "textWrap": "pretty" }}>
              {"A payment can start anywhere. It is always prepared by PrivyPay, always confirmed by you, and always settles on Celo."}
            </p>
          </div>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(288px,1fr))", "gap": "16px", "marginTop": "clamp(22px,3vw,36px)" }}>
            <div className="scp8" style={{ "animation": "pp-up .6s cubic-bezier(.2,.8,.3,1) 0ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "transition": "transform .2s cubic-bezier(.2,.8,.3,1),box-shadow .2s ease" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                <div style={{ "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#F3F4F6", "border": "1px solid #E3E5E9", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                  <img src="/assets/logo-chatgpt.png" alt="ChatGPT" style={{ "width": "20px", "height": "20px", "objectFit": "contain" }} />
                </div>
                <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.018em" }}>
                  {"ChatGPT"}
                </div>
                <span style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "padding": "4px 8px", "borderRadius": "7px" }}>
                  {"MCP"}
                </span>
              </div>
              <div style={{ "display": "grid", "gap": "8px", "marginTop": "18px" }}>
                <div style={{ "fontSize": "13.5px", "background": "#F6F7F9", "borderRadius": "11px 11px 11px 3px", "padding": "10px 12px", "justifySelf": "start", "maxWidth": "88%" }}>
                  {"Send $20 to @sarah"}
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#F4F6FE", "border": "1px solid #E4EAFB", "borderRadius": "11px 11px 3px 11px", "padding": "10px 12px", "justifySelf": "end", "maxWidth": "92%", "textAlign": "right" }}>
                  {"I found @sarah — Sarah Okafor."}
                  <br />
                  <span style={{ "fontWeight": "600" }}>
                    {"$20.00 USDC · Celo"}
                  </span>
                  <br />
                  <span style={{ "color": "#5F6878" }}>
                    {"Confirm to send."}
                  </span>
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#F6F7F9", "borderRadius": "11px 11px 11px 3px", "padding": "10px 12px", "justifySelf": "start" }}>
                  {"Confirm"}
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#F4F6FE", "border": "1px solid #E4EAFB", "borderRadius": "11px 11px 3px 11px", "padding": "10px 12px", "justifySelf": "end", "maxWidth": "92%", "textAlign": "right" }}>
                  <span style={{ "fontWeight": "600" }}>
                    {"Payment sent."}
                  </span>
                  {" $20.00 USDC to @sarah."}
                  <br />
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#6C7484" }}>
                    {"0x8f…91a"}
                  </span>
                </div>
              </div>
            </div>
            <div className="scp8" style={{ "animation": "pp-up .6s cubic-bezier(.2,.8,.3,1) 120ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "transition": "transform .2s cubic-bezier(.2,.8,.3,1),box-shadow .2s ease" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                <div style={{ "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#FBF0EA", "border": "1px solid #F3DED1", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                  <img src="/assets/logo-claude.png" alt="Claude" style={{ "width": "20px", "height": "20px", "borderRadius": "5px", "objectFit": "contain" }} />
                </div>
                <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.018em" }}>
                  {"Claude"}
                </div>
                <span style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "padding": "4px 8px", "borderRadius": "7px" }}>
                  {"MCP"}
                </span>
              </div>
              <div style={{ "marginTop": "18px", "border": "1px solid #EDEFF3", "borderRadius": "12px", "padding": "14px", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12.5px", "color": "#5B6472", "display": "grid", "gap": "9px" }}>
                <div style={{ "color": "#0E1420" }}>
                  {"Pay @contractor 500 USDC"}
                </div>
                <div style={{ "display": "flex", "gap": "9px" }}>
                  <span style={{ "color": "#167A54" }}>
                    {"✓"}
                  </span>
                  <span>
                    {"find_contact → @contractor"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "9px" }}>
                  <span style={{ "color": "#167A54" }}>
                    {"✓"}
                  </span>
                  <span>
                    {"send_payment → prepared"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "9px" }}>
                  <span style={{ "color": "#1B45D7" }}>
                    {"→"}
                  </span>
                  <span style={{ "color": "#0E1420" }}>
                    {"awaiting confirmation"}
                  </span>
                </div>
                <div style={{ "display": "flex", "gap": "9px" }}>
                  <span style={{ "color": "#167A54" }}>
                    {"✓"}
                  </span>
                  <span>
                    {"receipt 0x4c…8d2"}
                  </span>
                </div>
              </div>
              <div style={{ "fontSize": "13px", "color": "#5F6878", "lineHeight": "1.6", "marginTop": "14px" }}>
                {"Payment tools available in your Claude workflow, with confirmation still required."}
              </div>
            </div>
            <div className="scp8" style={{ "animation": "pp-up .6s cubic-bezier(.2,.8,.3,1) 240ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "transition": "transform .2s cubic-bezier(.2,.8,.3,1),box-shadow .2s ease" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                <div style={{ "width": "34px", "height": "34px", "borderRadius": "10px", "background": "#EAF3EE", "border": "1px solid #D9EBE1", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                  <img src="/assets/logo-whatsapp.png" alt="WhatsApp" style={{ "width": "20px", "height": "20px", "objectFit": "contain" }} />
                </div>
                <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.018em" }}>
                  {"WhatsApp"}
                </div>
                <span style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#167A54", "background": "#EAF3EE", "border": "1px solid #D9EBE1", "padding": "4px 8px", "borderRadius": "7px" }}>
                  {"LIVE"}
                </span>
              </div>
              <div style={{ "display": "grid", "gap": "8px", "marginTop": "18px" }}>
                <div style={{ "fontSize": "13.5px", "background": "#F6F7F9", "borderRadius": "11px 11px 11px 3px", "padding": "10px 12px", "justifySelf": "start" }}>
                  {"Send $20 to @sarah"}
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#EAF3EE", "border": "1px solid #D9EBE1", "borderRadius": "11px 11px 3px 11px", "padding": "10px 12px", "justifySelf": "end", "maxWidth": "92%", "textAlign": "right" }}>
                  {"I found @sarah."}
                  <br />
                  <span style={{ "fontWeight": "600" }}>
                    {"$20 USDC · Celo"}
                  </span>
                  <br />
                  <span style={{ "color": "#5F6878" }}>
                    {"Reply CONFIRM to send."}
                  </span>
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#F6F7F9", "borderRadius": "11px 11px 11px 3px", "padding": "10px 12px", "justifySelf": "start", "fontWeight": "600" }}>
                  {"CONFIRM"}
                </div>
                <div style={{ "fontSize": "13.5px", "background": "#EAF3EE", "border": "1px solid #D9EBE1", "borderRadius": "11px 11px 3px 11px", "padding": "10px 12px", "justifySelf": "end", "maxWidth": "92%", "textAlign": "right" }}>
                  <span style={{ "fontWeight": "600" }}>
                    {"Payment sent."}
                  </span>
                  {" $20 USDC to @sarah."}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="how" style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(44px,5.6vw,78px) 24px" }}>
          <div style={{ "display": "flex", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "24px", "flexWrap": "wrap" }}>
            <h2 style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "fontSize": "clamp(28px,3.8vw,40px)", "letterSpacing": "-.038em", "fontWeight": "600", "margin": "0", "maxWidth": "480px" }}>
              {"From instruction to receipt."}
            </h2>
            <p style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 90ms both", "fontSize": "15px", "color": "#5B6472", "lineHeight": "1.65", "margin": "0", "maxWidth": "340px" }}>
              {"No wallet to install, no address to copy. Six steps, and only one of them is yours to approve."}
            </p>
          </div>
          <div style={{ "marginTop": "clamp(26px,3.2vw,40px)", "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(252px,1fr))", "gap": "0 26px", "borderTop": "1px solid #E4E7EC" }}>
            <div data-reveal="up" data-reveal-delay="0" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"01"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Create your account"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"Passkey or email, then choose the username people will pay."}
              </p>
              <div style={{ "display": "inline-flex", "alignItems": "center", "gap": "7px", "border": "1px solid #E4E7EC", "background": "#fff", "borderRadius": "10px", "padding": "9px 13px" }}>
                <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#6C7484" }}>
                  {"@"}
                </span>
                <span style={{ "fontSize": "15px", "fontWeight": "600" }}>
                  {"chris"}
                </span>
              </div>
            </div>
            <div data-reveal="up" data-reveal-delay="80" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"02"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Your wallet is ready"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"PrivyPay provisions your Celo payment wallet automatically."}
              </p>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "8px", "fontSize": "13.5px", "color": "#167A54" }}>
                <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#167A54", "display": "inline-block" }}></span>
                {"Wallet ready"}
              </div>
            </div>
            <div data-reveal="up" data-reveal-delay="160" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"03"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Connect your tools"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"Reach your agent from ChatGPT, Claude or WhatsApp — or stay in PrivyPay."}
              </p>
            </div>
            <div data-reveal="up" data-reveal-delay="240" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"04"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Give an instruction"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"Plain language is the whole interface."}
              </p>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "borderRadius": "10px", "padding": "9px 12px", "display": "inline-block" }}>
                {"“Send $20 to @sarah”"}
              </div>
            </div>
            <div data-reveal="up" data-reveal-delay="320" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"05"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Confirm"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"PrivyPay shows recipient, amount, network and fee before anything is submitted."}
              </p>
              <div style={{ "fontSize": "13.5px", "fontWeight": "500", "color": "#153AB4" }}>
                {"Awaiting your confirmation"}
              </div>
            </div>
            <div data-reveal="up" data-reveal-delay="400" style={{ "padding": "24px 26px 28px 0" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "letterSpacing": ".12em", "color": "#1B45D7" }}>
                  {"06"}
                </div>
                <div style={{ "flex": "1", "height": "1px", "background": "linear-gradient(90deg,rgba(27,69,215,.35),rgba(27,69,215,.04))" }}></div>
              </div>
              <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.022em", "marginTop": "14px" }}>
                {"Done"}
              </div>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "290px", "textWrap": "pretty" }}>
                {"The payment executes on Celo and returns a receipt you can check."}
              </p>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#5B6472" }}>
                {"0x8f…91a · Completed"}
              </div>
            </div>
          </div>
        </div>
        <div id="product" style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(34px,4.4vw,62px) 24px" }}>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(300px,1fr))", "gap": "clamp(28px,4.2vw,56px)", "alignItems": "center" }}>
            <div data-reveal="left">
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"USERNAMES"}
              </div>
              <h2 style={{ "fontSize": "clamp(28px,3.8vw,40px)", "letterSpacing": "-.038em", "fontWeight": "600", "margin": "12px 0 0", "maxWidth": "420px" }}>
                {"People, not addresses."}
              </h2>
              <p style={{ "fontSize": "16px", "color": "#5B6472", "lineHeight": "1.65", "margin": "16px 0 0", "maxWidth": "410px", "textWrap": "pretty" }}>
                {"Name a person, not a string of characters. The agent resolves the username to a Celo account and shows you the address it found before you confirm."}
              </p>
              <div style={{ "marginTop": "24px", "display": "grid", "gap": "10px", "maxWidth": "360px" }}>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#1B45D7", "width": "74px" }}>
                    {"@sarah"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Sarah Okafor"}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#1B45D7", "width": "74px" }}>
                    {"@mike"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Mike Johnson"}
                  </span>
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "fontSize": "14.5px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#1B45D7", "width": "74px" }}>
                    {"@designer"}
                  </span>
                  <span style={{ "color": "#5B6472" }}>
                    {"Ada Nwosu"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ "animation": "pp-in-r .62s cubic-bezier(.2,.8,.3,1) both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "18px", "padding": "clamp(22px,3vw,30px)" }}>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13.5px", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "borderRadius": "11px", "padding": "12px 14px" }}>
                {"“Send $120 to @sarah”"}
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "0", "padding": "6px 0" }}>
                <div style={{ "width": "1px", "height": "22px", "background": "linear-gradient(180deg,rgba(27,69,215,.35),rgba(27,69,215,.08))" }}></div>
              </div>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "12px", "border": "1px solid #EDEFF3", "borderRadius": "13px", "padding": "14px", "flexWrap": "wrap" }}>
                <div style={{ "width": "36px", "height": "36px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                  {"S"}
                </div>
                <div style={{ "minWidth": "0" }}>
                  <div style={{ "fontSize": "16px", "fontWeight": "600", "letterSpacing": "-.018em" }}>
                    {"@sarah"}
                  </div>
                  <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "1px" }}>
                    {"Sarah Okafor"}
                  </div>
                </div>
                <span style={{ "marginLeft": "auto", "fontSize": "11.5px", "fontWeight": "500", "color": "#167A54" }}>
                  {"Resolved by agent"}
                </span>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "0", "padding": "6px 0" }}>
                <div style={{ "width": "1px", "height": "22px", "background": "linear-gradient(180deg,rgba(27,69,215,.35),rgba(27,69,215,.08))" }}></div>
              </div>
              <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "13px", "padding": "14px", "display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "13px", "color": "#5F6878" }}>
                  {"Celo payment wallet"}
                </div>
                <div style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#0E1420" }}>
                  {"0x8F…21A"}
                </div>
              </div>
              <div style={{ "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "0", "padding": "6px 0" }}>
                <div style={{ "width": "1px", "height": "22px", "background": "linear-gradient(180deg,rgba(27,69,215,.35),rgba(27,69,215,.08))" }}></div>
              </div>
              <div style={{ "border": "1px solid #DDE3F6", "background": "#FCFCFE", "borderRadius": "13px", "padding": "16px" }}>
                <div style={{ "fontSize": "12.5px", "color": "#5F6878" }}>
                  {"Ready to confirm"}
                </div>
                <div style={{ "fontSize": "30px", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "6px", "fontVariantNumeric": "tabular-nums" }}>
                  {"$120.00 "}
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "fontWeight": "400", "color": "#5F6878" }}>
                    {"USDC"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(26px,3.4vw,44px) 24px" }}>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(272px,1fr))", "gap": "16px" }}>
            <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "clamp(22px,3vw,30px)" }}>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"RECEIVE"}
              </div>
              <h3 style={{ "fontSize": "clamp(21px,2.5vw,26px)", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "12px 0 0" }}>
                {"Get paid by username."}
              </h3>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 20px" }}>
                {"Share your PrivyPay username or Celo address to receive supported stablecoins."}
              </p>
              <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "12px", "padding": "16px", "display": "flex", "gap": "16px", "alignItems": "center", "flexWrap": "wrap" }}>
                {" "}{v.qrSmall}{" "}
                <div style={{ "minWidth": "118px" }}>
                  <div style={{ "fontSize": "19px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                    {"@chris"}
                  </div>
                  <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                    {"Celo"}
                  </div>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12.5px", "color": "#5B6472", "marginTop": "10px" }}>
                    {v.walletAddress}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 110ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "clamp(22px,3vw,30px)" }}>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"REQUESTS"}
              </div>
              <h3 style={{ "fontSize": "clamp(21px,2.5vw,26px)", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "12px 0 0" }}>
                {"Ask, and keep track."}
              </h3>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 20px" }}>
                {"“Request $250 from @mike for the logo.” The agent drafts it; you send it and follow its status."}
              </p>
              <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "12px", "padding": "15px 16px", "display": "flex", "alignItems": "center", "gap": "14px" }}>
                <div style={{ "flex": "1", "minWidth": "0" }}>
                  <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                    {"@mike"}
                  </div>
                  <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                    {"Logo design"}
                  </div>
                </div>
                <div style={{ "textAlign": "right" }}>
                  <div style={{ "fontSize": "15px", "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                    {"$250.00"}
                  </div>
                  <div style={{ "fontSize": "12px", "color": "#8A6A1E", "marginTop": "2px" }}>
                    {"Pending"}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 220ms both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "clamp(22px,3vw,30px)" }}>
              <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
                {"RECURRING"}
              </div>
              <h3 style={{ "fontSize": "clamp(21px,2.5vw,26px)", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "12px 0 0" }}>
                {"Set it once."}
              </h3>
              <p style={{ "fontSize": "14.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 20px" }}>
                {"“Pay @designer $200 every Friday.” Confirm once, then pause or cancel whenever you want."}
              </p>
              <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "12px", "padding": "15px 16px" }}>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "14px" }}>
                  <div style={{ "flex": "1", "minWidth": "0" }}>
                    <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                      {"@designer"}
                    </div>
                    <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                      {"Every Friday · next Sep 18"}
                    </div>
                  </div>
                  <div style={{ "fontSize": "15px", "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                    {"$200.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="connected" style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(40px,5.2vw,74px) 24px" }}>
          <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#5F6878" }}>
            {"CONNECTED SERVICES"}
          </div>
          <h2 style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 70ms both", "fontSize": "clamp(28px,3.8vw,40px)", "letterSpacing": "-.035em", "fontWeight": "600", "margin": "12px 0 0", "maxWidth": "520px" }}>
            {"PrivyPay works with the tools you already use."}
          </h2>
          <p style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 140ms both", "fontSize": "16px", "color": "#5B6472", "lineHeight": "1.65", "margin": "14px 0 0", "maxWidth": "480px" }}>
            {"Connect a service and start a payment from it. Every payment is still reviewed and confirmed in PrivyPay before it settles."}
          </p>
          <div data-reveal="up" style={{ "marginTop": "clamp(28px,3.4vw,42px)", "border": "1px solid #E4E7EC", "background": "#FBFBFD", "borderRadius": "18px", "padding": "clamp(20px,3vw,30px)", "marginBottom": "18px" }}>
            <div style={{ "display": "grid", "gridTemplateColumns": "repeat(3,minmax(0,1fr))", "gap": "10px" }}>
              <div style={{ "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px 14px", "textAlign": "center", "background": "#fff" }}>
                <div style={{ "fontSize": "14px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                  {"ChatGPT"}
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#6C7484", "marginTop": "5px" }}>
                  {"MCP"}
                </div>
              </div>
              <div style={{ "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px 14px", "textAlign": "center", "background": "#fff" }}>
                <div style={{ "fontSize": "14px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                  {"Claude"}
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#6C7484", "marginTop": "5px" }}>
                  {"MCP"}
                </div>
              </div>
              <div style={{ "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px 14px", "textAlign": "center", "background": "#fff" }}>
                <div style={{ "fontSize": "14px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                  {"WhatsApp"}
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#6C7484", "marginTop": "5px" }}>
                  {"MESSAGING"}
                </div>
              </div>
            </div>
            <svg viewBox="0 0 600 64" preserveAspectRatio="none" style={{ "display": "block", "width": "100%", "height": "58px" }} aria-hidden="true">
              <path d="M100 2 C100 40 300 24 300 62" fill="none" stroke="#C9D3F2" strokeWidth="1.4" strokeDasharray="5 7" style={{ "animation": "pp-dash 7s linear infinite" }}></path>
              <path d="M300 2 L300 62" fill="none" stroke="#C9D3F2" strokeWidth="1.4" strokeDasharray="5 7" style={{ "animation": "pp-dash 6s linear infinite" }}></path>
              <path d="M500 2 C500 40 300 24 300 62" fill="none" stroke="#C9D3F2" strokeWidth="1.4" strokeDasharray="5 7" style={{ "animation": "pp-dash 8s linear infinite" }}></path>
            </svg>
            <div style={{ "border": "1px solid #DDE3F6", "background": "#F4F6FE", "borderRadius": "14px", "padding": "16px", "textAlign": "center" }}>
              <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "8px" }}>
                <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#1B45D7", "display": "inline-block", "animation": "pp-pulse 2s ease-in-out infinite" }}></span>
                <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.018em", "color": "#153AB4" }}>
                  {"PrivyPay agent · cloud"}
                </div>
              </div>
              <div style={{ "fontSize": "13px", "color": "#5B6472", "marginTop": "7px", "maxWidth": "430px", "marginLeft": "auto", "marginRight": "auto", "lineHeight": "1.6" }}>
                {"Resolves recipients, prepares payments, holds them for your confirmation, and keeps the receipt."}
              </div>
            </div>
            <svg viewBox="0 0 600 46" preserveAspectRatio="none" style={{ "display": "block", "width": "100%", "height": "42px" }} aria-hidden="true">
              <path d="M300 0 L300 44" fill="none" stroke="#C9D3F2" strokeWidth="1.4" strokeDasharray="5 7" style={{ "animation": "pp-dash 5s linear infinite" }}></path>
            </svg>
            <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(180px,1fr))", "gap": "10px" }}>
              <div style={{ "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px 15px", "background": "#fff", "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "width": "16px", "height": "16px", "borderRadius": "50%", "background": "#F5D96B", "border": "1px solid #E2C453", "flex": "none" }}></div>
                <div style={{ "fontSize": "14px", "fontWeight": "600" }}>
                  {"Celo"}
                </div>
                <div style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#6C7484" }}>
                  {"SETTLEMENT"}
                </div>
              </div>
              <div style={{ "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px 15px", "background": "#fff", "display": "flex", "alignItems": "center", "gap": "10px" }}>
                <div style={{ "fontSize": "14px", "fontWeight": "600" }}>
                  {"Receipt"}
                </div>
                <div style={{ "marginLeft": "auto", "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5B6472" }}>
                  {"0x8f…91a"}
                </div>
              </div>
            </div>
          </div>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(248px,1fr))", "gap": "16px" }}>
            {v.serviceCards.map((sv, i) => (
              <Fragment key={i}>
                <div className="scp9" onClick={sv.onOpen} tabIndex={0} onKeyDown={sv.onKey} style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) both", "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "clamp(26px,3vw,34px) 26px 26px", "display": "flex", "flexDirection": "column", "alignItems": "center", "textAlign": "center", "cursor": "pointer", "outline": "none", "transition": "transform .2s cubic-bezier(.2,.8,.3,1),box-shadow .2s ease,border-color .2s ease" }}>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".14em", "color": "#6C7484", "alignSelf": "flex-start" }}>
                    {sv.index}
                  </div>
                  <div style={{ "width": "72px", "height": "72px", "borderRadius": "20px", "background": sv.markBg, "border": `1px solid ${sv.markBorder}`, "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "16px" }}>
                    {sv.isChatgpt ? (
                      <>
                        <img src="/assets/logo-chatgpt.png" alt="ChatGPT" style={{ "width": "48px", "height": "48px", "objectFit": "contain" }} />
                      </>
                    ) : null}
                    {sv.isClaude ? (
                      <>
                        <img src="/assets/logo-claude.png" alt="Claude" style={{ "width": "48px", "height": "48px", "borderRadius": "11px", "objectFit": "contain" }} />
                      </>
                    ) : null}
                    {sv.isWhatsapp ? (
                      <>
                        <img src="/assets/logo-whatsapp.png" alt="WhatsApp" style={{ "width": "48px", "height": "48px", "objectFit": "contain" }} />
                      </>
                    ) : null}
                  </div>
                  <div style={{ "fontSize": "19px", "fontWeight": "600", "letterSpacing": "-.02em", "marginTop": "18px" }}>
                    {sv.name}
                  </div>
                  <p style={{ "fontSize": "14px", "lineHeight": "1.6", "color": "#5B6472", "margin": "9px 0 0", "maxWidth": "230px", "textWrap": "pretty" }}>
                    {sv.desc}
                  </p>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "padding": "5px 10px", "borderRadius": "8px", "marginTop": "16px" }}>
                    {sv.availability}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "18px", "maxWidth": "560px", "lineHeight": "1.6" }}>
            {"Connections are managed in your dashboard. A payment started in a connected service is always confirmed in PrivyPay."}
          </div>
        </div>
        <div id="security" style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "clamp(40px,5.2vw,72px) 24px" }}>
          <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(280px,1fr))", "gap": "clamp(26px,4vw,54px)" }}>
            <div data-reveal="up">
              <h2 style={{ "fontSize": "clamp(28px,3.8vw,40px)", "letterSpacing": "-.038em", "fontWeight": "600", "margin": "0", "maxWidth": "360px" }}>
                {"Your money deserves a careful interface."}
              </h2>
              <p style={{ "fontSize": "15.5px", "color": "#5B6472", "lineHeight": "1.65", "margin": "16px 0 0", "maxWidth": "380px" }}>
                {"The agent can prepare anything. It can never move money on its own."}
              </p>
            </div>
            <div data-reveal="up" data-reveal-delay="110">
              <div style={{ "padding": "18px 0", "borderTop": "1px solid #E4E7EC", "display": "flex", "gap": "20px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "minWidth": "190px" }}>
                  {"Account security"}
                </div>
                <p style={{ "flex": "1", "minWidth": "200px", "fontSize": "14px", "color": "#5B6472", "lineHeight": "1.6", "margin": "0" }}>
                  {"Passkey or email sign-in. Your payment wallet is provisioned with the account."}
                </p>
              </div>
              <div style={{ "padding": "18px 0", "borderTop": "1px solid #E4E7EC", "display": "flex", "gap": "20px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "minWidth": "190px" }}>
                  {"Every payment confirmed"}
                </div>
                <p style={{ "flex": "1", "minWidth": "200px", "fontSize": "14px", "color": "#5B6472", "lineHeight": "1.6", "margin": "0" }}>
                  {"Recipient, amount, network and fee are shown before anything is submitted."}
                </p>
              </div>
              <div style={{ "padding": "18px 0", "borderTop": "1px solid #E4E7EC", "display": "flex", "gap": "20px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "minWidth": "190px" }}>
                  {"Username resolution"}
                </div>
                <p style={{ "flex": "1", "minWidth": "200px", "fontSize": "14px", "color": "#5B6472", "lineHeight": "1.6", "margin": "0" }}>
                  {"Handles resolve to a Celo address you can verify at review time."}
                </p>
              </div>
              <div style={{ "padding": "18px 0", "borderTop": "1px solid #E4E7EC", "borderBottom": "1px solid #E4E7EC", "display": "flex", "gap": "20px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "minWidth": "190px" }}>
                  {"Controlled permissions"}
                </div>
                <p style={{ "flex": "1", "minWidth": "200px", "fontSize": "14px", "color": "#5B6472", "lineHeight": "1.6", "margin": "0" }}>
                  {"Each connected service has its own caps, and every payment it starts comes back to you to confirm."}
                </p>
              </div>
              <div style={{ "padding": "18px 0", "borderTop": "1px solid #E4E7EC", "display": "flex", "gap": "20px", "flexWrap": "wrap" }}>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "minWidth": "190px" }}>
                  {"Receipts you can check"}
                </div>
                <p style={{ "flex": "1", "minWidth": "200px", "fontSize": "14px", "color": "#5B6472", "lineHeight": "1.6", "margin": "0" }}>
                  {"Each payment keeps a receipt with its Celo transaction reference. Transactions on Celo are public."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "0 24px clamp(34px,4.4vw,58px)" }}>
          <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "borderTop": "1px solid #E4E7EC", "paddingTop": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "flexWrap": "wrap" }}>
            <div style={{ "width": "18px", "height": "18px", "borderRadius": "50%", "background": "#F5D96B", "border": "1px solid #E2C453" }}></div>
            <div style={{ "fontSize": "14px", "fontWeight": "500" }}>
              {"Built on Celo"}
            </div>
            <div style={{ "fontSize": "14px", "color": "#5F6878", "flex": "1", "minWidth": "220px" }}>
              {"Celo is the settlement network underneath PrivyPay. Payments settle in supported stablecoins."}
            </div>
          </div>
        </div>
        <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "0 24px clamp(48px,6vw,86px)" }}>
          <div style={{ "animation": "pp-up .62s cubic-bezier(.2,.8,.3,1) 0ms both", "background": "#0E1420", "borderRadius": "20px", "padding": "clamp(38px,5.6vw,70px) clamp(26px,4vw,54px)", "color": "#fff" }}>
            <h2 style={{ "fontSize": "clamp(30px,4.6vw,48px)", "letterSpacing": "-.042em", "fontWeight": "600", "margin": "0", "lineHeight": "1.05", "maxWidth": "600px" }}>
              {"Your payment agent, wherever you work."}
            </h2>
            <p style={{ "fontSize": "16px", "color": "#A3ACBC", "lineHeight": "1.65", "margin": "18px 0 28px", "maxWidth": "440px" }}>
              {"Create your account, pick a username, and start moving stablecoins on Celo with an instruction."}
            </p>
            <button className="scpa scp3" onClick={v.enterApp} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px 24px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease,transform .16s ease" }}>
              {"Get started"}
            </button>
          </div>
        </div>
        <div style={{ "borderTop": "1px solid #EDEFF3" }}>
          <div style={{ "maxWidth": "1160px", "margin": "0 auto", "padding": "30px 24px 46px", "display": "flex", "gap": "26px", "flexWrap": "wrap", "alignItems": "flex-start" }}>
            <div style={{ "minWidth": "220px" }}>
              <div style={{ "display": "flex", "alignItems": "center", "gap": "9px" }}>
                <div style={{ "width": "18px", "height": "18px", "borderRadius": "6px", "background": "#1B45D7" }}></div>
                <span style={{ "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                  {"PrivyPay"}
                </span>
              </div>
              <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "8px" }}>
                {"Your payment agent, wherever you work."}
              </div>
            </div>
            <div style={{ "display": "flex", "gap": "20px", "flexWrap": "wrap", "marginLeft": "auto" }}>
              <a href="#agent" style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                {"Agent"}
              </a>
              <a href="#product" style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                {"Usernames"}
              </a>
              <a href="#how" style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                {"How it works"}
              </a>
              <a href="#connected" style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                {"Connected"}
              </a>
              <a href="#security" style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                {"Security"}
              </a>
            </div>
            <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11.5px", "color": "#6C7484", "letterSpacing": ".1em", "width": "100%" }}>
              {"BUILT ON CELO"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
