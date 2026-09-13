// AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand.
// Regenerate with: npm run design:build
import type { Vals } from '@/lib/viewModel';

export default function AuthScreen({ v }: { v: Vals }) {
  return (
    <>
      <div data-screen-label="Sign up" style={{ "minHeight": "100vh", "display": "flex", "alignItems": "center", "justifyContent": "center", "padding": "32px 20px" }}>
        <div style={{ "width": "100%", "maxWidth": "400px", "animation": "pp-up .4s cubic-bezier(.2,.8,.3,1) both" }}>
          <div onClick={v.goLanding} style={{ "display": "flex", "alignItems": "center", "gap": "9px", "cursor": "pointer" }}>
            <div style={{ "width": "20px", "height": "20px", "borderRadius": "6px", "background": "#1B45D7" }}></div>
            <span style={{ "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
              {"PrivyPay"}
            </span>
          </div>
          <h1 style={{ "fontSize": "27px", "letterSpacing": "-.03em", "fontWeight": "600", "margin": "26px 0 0" }}>
            {"Create your account"}
          </h1>
          <p style={{ "fontSize": "15px", "color": "#5B6472", "lineHeight": "1.6", "margin": "10px 0 24px" }}>
            {v.authSub}
          </p>
          {v.authWelcome ? (
            <>
              <div>
                <button className="scpb" onClick={v.usePasskey} style={{ "width": "100%", "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease" }}>
                  {v.passkeyLabel}
                </button>
                <button className="scp5" onClick={v.goEmail} style={{ "width": "100%", "marginTop": "10px", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "13px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                  {"Continue with email"}
                </button>
              </div>
            </>
          ) : null}
          {v.authEmail ? (
            <>
              <div>
                <input className="scp6" value={v.email} onChange={v.onEmail} onKeyDown={v.onEmailKey} placeholder="you@email.com" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "11px", "padding": "13px 15px", "fontSize": "15px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                <button className="scpb" onClick={v.sendCode} style={{ "width": "100%", "marginTop": "12px", "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "opacity": v.emailOpacity, "transition": "background .16s ease,opacity .16s ease" }}>
                  {"Send code"}
                </button>
                <button onClick={v.backToWelcome} style={{ "width": "100%", "marginTop": "10px", "border": "none", "background": "transparent", "color": "#5F6878", "fontSize": "13.5px", "padding": "8px", "cursor": "pointer" }}>
                  {"Back"}
                </button>
              </div>
            </>
          ) : null}
          {v.authCode ? (
            <>
              <div>
                <input className="scp6" value={v.code} onChange={v.onCode} onKeyDown={v.onCodeKey} placeholder="6-digit code" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "11px", "padding": "13px 15px", "fontSize": "17px", "fontFamily": "var(--font-geist-mono),monospace", "letterSpacing": ".28em", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "marginTop": "10px" }}>
                  <span style={{ "fontSize": "12.5px", "color": "#5F6878" }}>
                    {"Sent to "}{v.codeTarget}
                  </span>
                  <button className="scpc" onClick={v.resendCode} style={{ "border": "none", "background": "transparent", "color": "#1B45D7", "fontSize": "12.5px", "fontWeight": "500", "padding": "0", "cursor": "pointer", "transition": "color .16s ease" }}>
                    {v.resendLabel}
                  </button>
                </div>
                <button className="scpb" onClick={v.verifyCode} style={{ "width": "100%", "marginTop": "12px", "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease" }}>
                  {"Verify"}
                </button>
                <button onClick={v.backToWelcome} style={{ "width": "100%", "marginTop": "10px", "border": "none", "background": "transparent", "color": "#5F6878", "fontSize": "13.5px", "padding": "8px", "cursor": "pointer" }}>
                  {"Start over"}
                </button>
              </div>
            </>
          ) : null}
          <div style={{ "fontSize": "12.5px", "color": "#6C7484", "textAlign": "center", "marginTop": "20px", "lineHeight": "1.6" }}>
            {"Your Celo payment wallet is provisioned with your account."}
          </div>
        </div>
      </div>
    </>
  );
}
