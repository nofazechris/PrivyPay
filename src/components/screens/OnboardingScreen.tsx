// AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand.
// Regenerate with: npm run design:build
import { Fragment } from 'react';
import type { Vals } from '@/lib/viewModel';

export default function OnboardingScreen({ v }: { v: Vals }) {
  return (
    <>
      <div data-screen-label="Onboarding" style={{ "minHeight": "100vh", "display": "flex", "alignItems": "center", "justifyContent": "center", "padding": "32px 20px" }}>
        <div style={{ "width": "100%", "maxWidth": "420px", "animation": "pp-up .4s cubic-bezier(.2,.8,.3,1) both" }}>
          {v.obUsername ? (
            <>
              <div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".14em", "color": "#6C7484" }}>
                  {"STEP 2 OF 3"}
                </div>
                <h1 style={{ "fontSize": "27px", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "14px 0 0" }}>
                  {"Choose your username."}
                </h1>
                <p style={{ "fontSize": "15px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 22px" }}>
                  {"This is how people send you money."}
                </p>
                <div style={{ "background": "#fff", "border": "1px solid #DCE0E7", "borderRadius": "11px", "padding": "13px 15px", "display": "flex", "alignItems": "center", "gap": "8px" }}>
                  <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "16px", "color": "#6C7484" }}>
                    {"@"}
                  </span>
                  <input value={v.handleInput} onChange={v.onHandle} onKeyDown={v.onHandleKey} placeholder="chris" style={{ "flex": "1", "minWidth": "0", "border": "none", "outline": "none", "background": "transparent", "fontSize": "17px", "fontWeight": "500", "letterSpacing": "-.01em" }} />
                  {v.handleOk ? (
                    <>
                      <span style={{ "fontSize": "12.5px", "fontWeight": "500", "color": "#167A54", "whiteSpace": "nowrap", "animation": "pp-pop .28s cubic-bezier(.2,.8,.3,1) both" }}>
                        {"✓ Available"}
                      </span>
                    </>
                  ) : null}
                </div>
                <button className="scpd scpe" onClick={v.createWallet} style={{ "width": "100%", "marginTop": "14px", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "opacity": v.handleOpacity, "transition": "background .16s ease,opacity .16s ease" }}>
                  {"Continue"}
                </button>
                <div style={{ "fontSize": "12.5px", "color": "#6C7484", "marginTop": "16px", "lineHeight": "1.6" }}>
                  {"Your Celo payment wallet is created automatically — nothing to install or connect."}
                </div>
              </div>
            </>
          ) : null}
          {v.obCreating ? (
            <>
              <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "28px" }}>
                <div style={{ "fontSize": "18px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                  {"Setting up your payment wallet…"}
                </div>
                <div style={{ "display": "grid", "gap": "14px", "marginTop": "20px" }}>
                  {v.setupSteps.map((st, i) => (
                    <Fragment key={i}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "11px", "fontSize": "14.5px" }}>
                        <span style={{ "width": "20px", "height": "20px", "borderRadius": "50%", "background": st.bg, "color": st.color, "fontSize": "11px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                          {st.mark}
                        </span>
                        <span style={{ "color": st.textColor }}>
                          {st.label}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ "marginTop": "22px", "height": "3px", "borderRadius": "999px", "background": "#EDEFF3", "overflow": "hidden" }}>
                  <div style={{ "height": "100%", "background": "#1B45D7", "borderRadius": "999px", "width": v.setupProgress, "transition": "width .4s cubic-bezier(.3,.8,.3,1)" }}></div>
                </div>
              </div>
            </>
          ) : null}
          {v.obReady ? (
            <>
              <div>
                <h1 style={{ "fontSize": "27px", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "0" }}>
                  {"Your wallet is ready."}
                </h1>
                <p style={{ "fontSize": "15px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 22px" }}>
                  {"You can send, receive and request money right away."}
                </p>
                <div style={{ "background": "#0E1420", "borderRadius": "16px", "padding": "26px", "color": "#fff" }}>
                  <div style={{ "fontSize": "24px", "fontWeight": "600", "letterSpacing": "-.025em" }}>
                    {v.handleDisplay}
                  </div>
                  <div style={{ "height": "1px", "background": "#212938", "margin": "20px 0" }}></div>
                  <div style={{ "fontSize": "12.5px", "color": "#A3ACBC" }}>
                    {"Celo payment wallet"}
                  </div>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "16px", "marginTop": "6px" }}>
                    {"0x8A…29F"}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "marginTop": "14px" }}>
                    <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#3FBF85", "display": "inline-block" }}></span>
                    <span style={{ "fontSize": "13px", "color": "#A3ACBC" }}>
                      {"Wallet ready"}
                    </span>
                  </div>
                </div>
                <button className="scpd scpe" onClick={v.finishOnboarding} style={{ "width": "100%", "marginTop": "16px", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease" }}>
                  {"Start using PrivyPay"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
