// AUTO-GENERATED from "PrivyPay v3.dc.html" — do not edit by hand.
// Regenerate with: npm run design:build
import { Fragment } from 'react';
import type { Vals } from '@/lib/viewModel';
import {
  OverviewIcon,
  PaymentsIcon,
  RequestsNavIcon,
  ContactIcon,
  RecurringIcon,
  WalletIcon,
  ReceiveNavIcon,
  LinkIcon,
  PrivacyIcon,
  SettingsNavIcon,
  type Icon,
} from '@/components/ui/icons';

/** One icon per navigation destination, keyed by the nav item's page key. */
const NAV_ICONS: Record<string, Icon> = {
  overview: OverviewIcon,
  payments: PaymentsIcon,
  requests: RequestsNavIcon,
  contacts: ContactIcon,
  recurring: RecurringIcon,
  wallet: WalletIcon,
  receive: ReceiveNavIcon,
  connected: LinkIcon,
  privacy: PrivacyIcon,
  settings: SettingsNavIcon,
};

export default function AppScreen({ v }: { v: Vals }) {
  return (
    <>
      <div style={{ "display": "flex", "minHeight": "100vh" }}>
        {v.isDesktop ? (
          <>
            <div style={{ "width": "238px", "flex": "none", "borderRight": "1px solid #E8EAEF", "background": "#FBFBFC", "padding": "20px 14px", "display": "flex", "flexDirection": "column", "position": "sticky", "top": "0", "height": "100vh", "overflow": "auto" }}>
              <div onClick={v.goLanding} style={{ "display": "flex", "alignItems": "center", "gap": "9px", "padding": "0 8px 16px", "cursor": "pointer" }}>
                <div style={{ "width": "20px", "height": "20px", "borderRadius": "6px", "background": "#1B45D7" }}></div>
                <span style={{ "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                  {"PrivyPay"}
                </span>
              </div>
              {v.navGroups.map((g, i) => (
                <Fragment key={i}>
                  <div style={{ "marginBottom": "14px" }}>
                    {g.hasLabel ? (
                      <>
                        <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".14em", "color": "#6C7484", "padding": "0 10px 7px" }}>
                          {g.label}
                        </div>
                      </>
                    ) : null}
                    <div style={{ "display": "grid", "gap": "2px" }}>
                      {g.items.map((n, i) => (
                        <Fragment key={i}>
                          <div className="scpf" onClick={n.onClick} tabIndex={0} onKeyDown={n.onKey} style={{ "display": "flex", "alignItems": "center", "gap": "10px", "padding": "9px 10px", "borderRadius": "9px", "cursor": "pointer", "fontSize": "14px", "background": n.bg, "outline": "none", "transition": "background .16s ease" }}>
                            {(() => {
                              const Ico = NAV_ICONS[n.key];
                              return Ico ? (
                                <Ico size={18} color={n.color} weight={n.weight === '600' ? 'bold' : 'regular'} style={{ flex: 'none' }} />
                              ) : (
                                <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": n.dot, "flex": "none" }}></span>
                              );
                            })()}
                            <span style={{ "color": n.color, "fontWeight": n.weight }}>
                              {n.label}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))}
              <div style={{ "marginTop": "auto", "border": "1px solid #E4E7EC", "borderRadius": "12px", "padding": "13px", "background": "#fff" }}>
                <div style={{ "fontSize": "13.5px", "fontWeight": "600" }}>
                  {v.handleDisplay}
                </div>
                <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "marginTop": "7px" }}>
                  <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#167A54", "display": "inline-block" }}></span>
                  <span style={{ "fontSize": "12px", "color": "#5B6472" }}>
                    {"Wallet ready"}
                  </span>
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5F6878", "marginTop": "6px" }}>
                  {v.walletAddress}
                </div>
              </div>
            </div>
          </>
        ) : null}
        <div style={{ "flex": "1", "minWidth": "0", "paddingBottom": v.mainPadBottom }}>
          <div style={{ "borderBottom": "1px solid #E8EAEF", "background": "rgba(246,247,249,.92)", "backdropFilter": "blur(8px)", "position": "sticky", "top": "0", "zIndex": "20" }}>
            <div style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "15px 24px", "display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap" }}>
              <div style={{ "flex": "1", "minWidth": "160px" }}>
                <div style={{ "fontSize": "19px", "fontWeight": "600", "letterSpacing": "-.025em" }}>
                  {v.pageHeading}
                </div>
                <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "2px" }}>
                  {v.pageSub}
                </div>
              </div>
              <button className="scpd scpg" onClick={v.openSend} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "10px 16px", "borderRadius": "10px", "cursor": "pointer", "transition": "background .16s ease" }}>
                {"Send"}
              </button>
              <button className="scp5" onClick={v.openReceive} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "10px 16px", "borderRadius": "10px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                {"Receive"}
              </button>
            </div>
          </div>
          {v.isOverview ? (
            <>
              <div data-screen-label="Overview" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
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
                    <input className="scp6" value={v.cmdInput} onChange={v.onCmdInput} onKeyDown={v.onCmdKey} placeholder="Send $10 to @username" style={{ "flex": "1", "minWidth": "190px", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "11px", "padding": "13px 15px", "fontSize": "15px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
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
                          <span style={{ "width": "30px", "height": "30px", "borderRadius": "50%", "background": v.cmdDoneMarkBg, "color": "#fff", "fontSize": "14px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none", "animation": "pp-pop .34s cubic-bezier(.2,.8,.3,1) both" }}>
                            {v.cmdDoneMark}
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
                                <span style={{ "fontWeight": "500", "textAlign": "right", "color": m.color ?? "#0E1420" }}>
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
                <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(290px,1fr))", "gap": "16px", "alignItems": "start", "marginTop": "16px" }}>
                  <div style={{ "background": "#0E1420", "borderRadius": "16px", "padding": "26px", "color": "#fff" }}>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                      <div style={{ "fontSize": "13px", "color": "#A3ACBC" }}>
                        {"Total balance"}
                      </div>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12px", "color": "#8FE0BA" }}>
                        <span style={{ "width": "5px", "height": "5px", "borderRadius": "50%", "background": "#3FBF85", "display": "inline-block" }}></span>
                        {"Wallet ready"}
                      </div>
                    </div>
                    <div style={{ "fontSize": "clamp(36px,4.6vw,50px)", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "8px", "fontVariantNumeric": "tabular-nums" }}>
                      {"$"}{v.balanceStr}
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "marginTop": "8px" }}>
                      <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#A3ACBC" }}>
                        {"USDC"}
                      </span>
                      <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#A3ACBC" }}>
                        {"CELO"}
                      </span>
                      <span style={{ "fontSize": "12.5px", "color": "#8FE0BA" }}>
                        {v.balanceChange}
                      </span>
                    </div>
                    <div style={{ "marginTop": "20px" }}>
                      {v.balanceChart}
                    </div>
                    <div style={{ "display": "flex", "gap": "10px", "marginTop": "22px", "flexWrap": "wrap" }}>
                      <button className="scph" onClick={v.openSend} style={{ "flex": "1", "minWidth": "118px", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "12px", "borderRadius": "10px", "cursor": "pointer", "transition": "background .16s ease" }}>
                        {"Send"}
                      </button>
                      <button className="scpi" onClick={v.openReceive} style={{ "flex": "1", "minWidth": "118px", "border": "1px solid #2A3140", "background": "transparent", "color": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "12px", "borderRadius": "10px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                        {"Receive"}
                      </button>
                    </div>
                  </div>
                  <div style={{ "display": "grid", "gap": "16px" }}>
                    <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "8px" }}>
                      {v.quickActions.map((q, i) => (
                        <Fragment key={i}>
                          <div className="scpj" onClick={q.onClick} tabIndex={0} onKeyDown={q.onKey} style={{ "display": "flex", "alignItems": "center", "gap": "12px", "padding": "12px 14px", "borderRadius": "10px", "cursor": "pointer", "outline": "none", "transition": "background .16s ease" }}>
                            <span style={{ "width": "30px", "height": "30px", "borderRadius": "9px", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "14px", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                              {q.icon}
                            </span>
                            <span style={{ "fontSize": "14.5px", "fontWeight": "500" }}>
                              {q.label}
                            </span>
                            <span style={{ "marginLeft": "auto", "color": "#C3C9D2", "fontSize": "13px" }}>
                              {"→"}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "20px" }}>
                      <div style={{ "fontSize": "13px", "color": "#5F6878" }}>
                        {"Next recurring payment"}
                      </div>
                      <div style={{ "display": "flex", "alignItems": "baseline", "gap": "10px", "marginTop": "8px" }}>
                        <div style={{ "fontSize": "22px", "fontWeight": "600", "letterSpacing": "-.025em", "fontVariantNumeric": "tabular-nums" }}>
                          {"$200.00"}
                        </div>
                        <div style={{ "fontSize": "14px", "color": "#5B6472" }}>
                          {"to @designer"}
                        </div>
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "6px" }}>
                        {"Friday, Sep 18 · every Friday"}
                      </div>
                      <div style={{ "display": "flex", "gap": "16px", "marginTop": "16px", "paddingTop": "16px", "borderTop": "1px solid #F0F1F4" }}>
                        <div style={{ "flex": "1" }}>
                          <div style={{ "fontSize": "12px", "color": "#5F6878" }}>
                            {"Sent this month"}
                          </div>
                          <div style={{ "fontSize": "16px", "fontWeight": "600", "marginTop": "4px", "fontVariantNumeric": "tabular-nums" }}>
                            {"$"}{v.sentMonth}
                          </div>
                        </div>
                        <div style={{ "flex": "1" }}>
                          <div style={{ "fontSize": "12px", "color": "#5F6878" }}>
                            {"Received"}
                          </div>
                          <div style={{ "fontSize": "16px", "fontWeight": "600", "marginTop": "4px", "fontVariantNumeric": "tabular-nums" }}>
                            {"$"}{v.receivedMonth}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ "marginTop": "24px", "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                  <div style={{ "fontSize": "15px", "fontWeight": "600" }}>
                    {"Recent activity"}
                  </div>
                  <div onClick={v.goActivity} tabIndex={0} onKeyDown={v.goActivityKey} style={{ "fontSize": "13.5px", "color": "#1B45D7", "cursor": "pointer" }}>
                    {"View all"}
                  </div>
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "marginTop": "12px", "overflow": "hidden" }}>
                  {v.recentTxs.map((t, i) => (
                    <Fragment key={i}>
                      <div className="scpk" onClick={t.onClick} tabIndex={0} onKeyDown={t.onKey} style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "15px 20px", "borderBottom": "1px solid #F0F1F4", "cursor": "pointer", "outline": "none", "transition": "background .16s ease" }}>
                        <div style={{ "width": "34px", "height": "34px", "borderRadius": "50%", "background": t.avatarBg, "color": t.avatarColor, "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                          {t.initial}
                        </div>
                        <div style={{ "flex": "1", "minWidth": "0" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                            {t.handle}
                          </div>
                          <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                            {t.sub}
                          </div>
                        </div>
                        <div style={{ "textAlign": "right" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600", "color": t.amountColor, "fontVariantNumeric": "tabular-nums" }}>
                            {t.amountStr}
                          </div>
                          <div style={{ "fontSize": "12px", "color": t.statusColor, "fontWeight": "500", "marginTop": "2px" }}>
                            {t.status}
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {v.isPayments ? (
            <>
              <div data-screen-label="Payments" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "display": "flex", "gap": "8px", "flexWrap": "wrap" }}>
                  {v.filters.map((fl, i) => (
                    <Fragment key={i}>
                      <div onClick={fl.onClick} tabIndex={0} onKeyDown={fl.onKey} style={{ "fontSize": "13.5px", "fontWeight": "500", "padding": "8px 14px", "borderRadius": "9px", "cursor": "pointer", "outline": "none", "border": `1px solid ${fl.border}`, "background": fl.bg, "color": fl.color, "transition": "border-color .16s ease,background .16s ease" }}>
                        {fl.label}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "marginTop": "16px", "overflow": "hidden" }}>
                  {v.filteredTxs.map((t, i) => (
                    <Fragment key={i}>
                      <div className="scpk" onClick={t.onClick} tabIndex={0} onKeyDown={t.onKey} style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "15px 20px", "borderBottom": "1px solid #F0F1F4", "cursor": "pointer", "outline": "none", "transition": "background .16s ease" }}>
                        <div style={{ "width": "34px", "height": "34px", "borderRadius": "50%", "background": t.avatarBg, "color": t.avatarColor, "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                          {t.initial}
                        </div>
                        <div style={{ "flex": "1", "minWidth": "0" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                            {t.handle}
                          </div>
                          <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                            {t.sub}
                          </div>
                        </div>
                        <div style={{ "textAlign": "right" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600", "color": t.amountColor, "fontVariantNumeric": "tabular-nums" }}>
                            {t.amountStr}
                          </div>
                          <div style={{ "fontSize": "12px", "color": t.statusColor, "fontWeight": "500", "marginTop": "2px" }}>
                            {t.status}
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                  {v.noTxs ? (
                    <>
                      <div style={{ "padding": "38px 20px", "textAlign": "center" }}>
                        <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                          {"Nothing here yet"}
                        </div>
                        <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "6px" }}>
                          {"Payments matching this filter will show up here."}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {v.isRequests ? (
            <>
              <div data-screen-label="Requests" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px" }}>
                  {v.reqFormOpen ? (
                    <>
                      <div>
                        <div style={{ "fontSize": "15px", "fontWeight": "600" }}>
                          {"Request payment"}
                        </div>
                        <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(148px,1fr))", "gap": "10px", "marginTop": "14px" }}>
                          <div>
                            <div style={{ "fontSize": "12px", "color": "#5F6878", "marginBottom": "6px" }}>
                              {"From"}
                            </div>
                            <input className="scp6" value={v.reqTo} onChange={v.onReqTo} placeholder="@mike" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "11px 13px", "fontSize": "14.5px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                          </div>
                          <div>
                            <div style={{ "fontSize": "12px", "color": "#5F6878", "marginBottom": "6px" }}>
                              {"Amount"}
                            </div>
                            <input className="scp6" value={v.reqAmount} onChange={v.onReqAmount} placeholder="250" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "11px 13px", "fontSize": "14.5px", "outline": "none", "fontVariantNumeric": "tabular-nums", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                          </div>
                          <div>
                            <div style={{ "fontSize": "12px", "color": "#5F6878", "marginBottom": "6px" }}>
                              {"For"}
                            </div>
                            <input className="scp6" value={v.reqNote} onChange={v.onReqNote} placeholder="Logo design" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "11px 13px", "fontSize": "14.5px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                          </div>
                        </div>
                        <button className="scpd scpe" onClick={v.createRequest} style={{ "marginTop": "14px", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "12px 20px", "borderRadius": "10px", "cursor": "pointer", "opacity": v.reqOpacity, "transition": "background .16s ease,opacity .16s ease" }}>
                          {"Create request"}
                        </button>
                      </div>
                    </>
                  ) : null}
                  {v.reqDone ? (
                    <>
                      <div style={{ "animation": "pp-sheet .28s cubic-bezier(.2,.8,.3,1) both" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "10px" }}>
                          <span style={{ "width": "28px", "height": "28px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "13px", "display": "flex", "alignItems": "center", "justifyContent": "center", "animation": "pp-pop .3s cubic-bezier(.2,.8,.3,1) both" }}>
                            {"✓"}
                          </span>
                          <div style={{ "fontSize": "15px", "fontWeight": "600" }}>
                            {"Request sent"}
                          </div>
                        </div>
                        <div style={{ "display": "grid", "gap": "10px", "marginTop": "18px", "maxWidth": "360px" }}>
                          <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                            <span style={{ "color": "#5F6878" }}>
                              {"From"}
                            </span>
                            <span style={{ "fontWeight": "600" }}>
                              {v.sentReqTo}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                            <span style={{ "color": "#5F6878" }}>
                              {"Amount"}
                            </span>
                            <span style={{ "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                              {"$"}{v.sentReqAmount}{" USDC"}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                            <span style={{ "color": "#5F6878" }}>
                              {"For"}
                            </span>
                            <span style={{ "fontWeight": "500" }}>
                              {v.sentReqNote}
                            </span>
                          </div>
                          <div style={{ "display": "flex", "justifyContent": "space-between", "fontSize": "13.5px" }}>
                            <span style={{ "color": "#5F6878" }}>
                              {"Status"}
                            </span>
                            <span style={{ "fontWeight": "500", "color": "#8A6A1E" }}>
                              {"Pending"}
                            </span>
                          </div>
                        </div>
                        <button className="scp5" onClick={v.newRequest} style={{ "marginTop": "16px", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "11px 18px", "borderRadius": "10px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                          {"New request"}
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
                <div style={{ "fontSize": "15px", "fontWeight": "600", "margin": "24px 0 12px" }}>
                  {"Open requests"}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "overflow": "hidden" }}>
                  {v.requestRows.map((r, i) => (
                    <Fragment key={i}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "14px", "padding": "15px 20px", "borderBottom": "1px solid #F0F1F4", "flexWrap": "wrap" }}>
                        <div style={{ "width": "34px", "height": "34px", "borderRadius": "50%", "background": "#F1F2F5", "color": "#5B6472", "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center", "flex": "none" }}>
                          {r.initial}
                        </div>
                        <div style={{ "flex": "1", "minWidth": "120px" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                            {r.handle}
                          </div>
                          <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "2px" }}>
                            {r.note}
                          </div>
                        </div>
                        <div style={{ "textAlign": "right" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                            {"$"}{r.amount}
                          </div>
                          <div style={{ "fontSize": "12px", "color": r.statusColor, "marginTop": "2px" }}>
                            {r.status}
                          </div>
                        </div>
                        {r.payable ? (
                          <>
                            <button className="scpd" onClick={r.onPay} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "9px 14px", "borderRadius": "9px", "cursor": "pointer", "flex": "none", "transition": "background .16s ease" }}>
                              {"Pay"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </Fragment>
                  ))}
                  {v.noRequests ? (
                    <div style={{ "padding": "34px 20px", "textAlign": "center" }}>
                      <div style={{ "fontSize": "14px", "fontWeight": "600" }}>
                        {"No requests yet"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "5px" }}>
                        {"Ask someone to pay you with the form above."}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {v.isContacts ? (
            <>
              <div data-screen-label="Contacts" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                {v.canAddContact ? (
                  <div style={{ "display": "flex", "gap": "9px", "marginBottom": "14px", "flexWrap": "wrap" }}>
                    <input className="scp6" value={v.contactAdd} onChange={v.onContactAdd} onKeyDown={v.onContactAddKey} placeholder="Add a contact by @username" style={{ "flex": "1", "minWidth": "220px", "maxWidth": "340px", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "11px 14px", "fontSize": "14.5px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                    <button className="scp0 scp3" onClick={v.addContact} disabled={v.contactAddDisabled} style={{ "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14.5px", "fontWeight": "500", "borderRadius": "10px", "cursor": "pointer", "opacity": v.contactAddOpacity, "transition": "background .16s ease,transform .16s ease,opacity .16s ease", "padding": "11px 18px" }}>
                      {v.contactAddLabel}
                    </button>
                  </div>
                ) : null}
                <input className="scp6" value={v.contactQuery} onChange={v.onContactQuery} placeholder="Search by username or name" style={{ "width": "100%", "maxWidth": "340px", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "11px 14px", "fontSize": "14.5px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(256px,1fr))", "gap": "12px", "marginTop": "16px" }}>
                  {v.contactRows.map((c, i) => (
                    <Fragment key={i}>
                      <div className="scpl" style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "14px", "padding": "18px", "transition": "transform .18s ease,box-shadow .18s ease" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "11px" }}>
                          <div style={{ "width": "36px", "height": "36px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "14px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                            {c.initial}
                          </div>
                          <div style={{ "minWidth": "0" }}>
                            <div style={{ "fontSize": "15px", "fontWeight": "600", "letterSpacing": "-.01em" }}>
                              {c.handle}
                            </div>
                            <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "1px" }}>
                              {c.name}
                            </div>
                          </div>
                        </div>
                        <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#6C7484", "marginTop": "14px" }}>
                          {c.address}
                        </div>
                        <div style={{ "display": "flex", "gap": "8px", "marginTop": "14px" }}>
                          <button className="scpb" onClick={c.onSend} style={{ "flex": "1", "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "10px", "borderRadius": "9px", "cursor": "pointer", "transition": "background .16s ease" }}>
                            {"Send"}
                          </button>
                          <button className="scp5" onClick={c.onRequest} style={{ "flex": "1", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "10px", "borderRadius": "9px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                            {"Request"}
                          </button>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                {v.noContacts ? (
                  <>
                    <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "14px", "padding": "38px", "textAlign": "center", "marginTop": "16px" }}>
                      <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                        {v.contactsEmptyTitle}
                      </div>
                      <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "6px" }}>
                        {v.contactsEmptySub}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
          {v.isRecurring ? (
            <>
              <div data-screen-label="Recurring" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "overflow": "hidden" }}>
                  {v.recurringRows.map((r, i) => (
                    <Fragment key={i}>
                      <div style={{ "padding": "20px", "borderBottom": "1px solid #F0F1F4", "display": "flex", "alignItems": "center", "gap": "16px", "flexWrap": "wrap" }}>
                        <div style={{ "flex": "1", "minWidth": "170px" }}>
                          <div style={{ "fontSize": "16px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                            {r.handle}
                          </div>
                          <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                            {r.cadence}{" · next "}{r.next}
                          </div>
                        </div>
                        <div style={{ "fontSize": "18px", "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                          {"$"}{r.amount}
                        </div>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "minWidth": "92px" }}>
                          <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": r.statusDot, "display": "inline-block" }}></span>
                          <span style={{ "fontSize": "13px", "color": r.statusColor }}>
                            {r.statusLabel}
                          </span>
                        </div>
                        <button className="scp5" onClick={r.onToggle} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "9px 15px", "borderRadius": "9px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                          {r.action}
                        </button>
                        <button className="scp5" onClick={r.onCancel} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "color": "#B42318", "fontSize": "13.5px", "fontWeight": "500", "padding": "9px 15px", "borderRadius": "9px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                          {"Cancel"}
                        </button>
                      </div>
                    </Fragment>
                  ))}
                  {v.noRecurring ? (
                    <div style={{ "padding": "34px 20px", "textAlign": "center" }}>
                      <div style={{ "fontSize": "14px", "fontWeight": "600" }}>
                        {"No recurring payments"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "5px" }}>
                        {"Ask the agent, e.g. “Pay @chris $50 every Friday”."}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {v.isWallet ? (
            <>
              <div data-screen-label="Wallet" style={{ "maxWidth": "720px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "background": "#0E1420", "borderRadius": "16px", "padding": "28px", "color": "#fff" }}>
                  <div style={{ "fontSize": "12.5px", "color": "#A3ACBC" }}>
                    {"Payment wallet"}
                  </div>
                  <div style={{ "fontSize": "26px", "fontWeight": "600", "letterSpacing": "-.03em", "marginTop": "6px" }}>
                    {v.handleDisplay}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "7px", "marginTop": "12px" }}>
                    <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": "#3FBF85", "display": "inline-block" }}></span>
                    <span style={{ "fontSize": "13px", "color": "#A3ACBC" }}>
                      {"Active · Celo"}
                    </span>
                  </div>
                  <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "15px", "marginTop": "8px", "color": "#D3D8E0" }}>
                    {v.walletAddress}
                  </div>
                  <div style={{ "height": "1px", "background": "#212938", "margin": "22px 0" }}></div>
                  <div style={{ "fontSize": "13px", "color": "#A3ACBC" }}>
                    {"Balance"}
                  </div>
                  <div style={{ "display": "flex", "alignItems": "baseline", "gap": "10px", "marginTop": "6px" }}>
                    <div style={{ "fontSize": "34px", "fontWeight": "600", "letterSpacing": "-.035em", "fontVariantNumeric": "tabular-nums" }}>
                      {"$"}{v.balanceStr}
                    </div>
                    <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#A3ACBC" }}>
                      {"USDC"}
                    </div>
                  </div>
                </div>
                <div style={{ "display": "flex", "gap": "10px", "marginTop": "16px", "flexWrap": "wrap" }}>
                  <button className="scp5" onClick={v.copyAddress} style={{ "flex": "1", "minWidth": "140px", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                    {v.copyLabel}
                  </button>
                  <button className="scpd" onClick={v.openReceive} style={{ "flex": "1", "minWidth": "140px", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease" }}>
                    {"Receive"}
                  </button>
                  <button className="scp5" onClick={v.goActivity} style={{ "flex": "1", "minWidth": "140px", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                    {"View activity"}
                  </button>
                </div>
                <div style={{ "border": "1px solid #E4E7EC", "background": "#fff", "borderRadius": "16px", "padding": "20px", "marginTop": "16px" }}>
                  <div style={{ "fontSize": "13.5px", "fontWeight": "600" }}>
                    {"Provisioned with your account"}
                  </div>
                  <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0" }}>
                    {"Your Celo payment wallet was created when you chose "}{v.handleDisplay}{". There is nothing to install or connect. Your username is your identity; this address is where stablecoins settle."}
                  </p>
                </div>
              </div>
            </>
          ) : null}
          {v.isConnected ? (
            <>
              <div data-screen-label="Connected services" style={{ "maxWidth": "1020px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(272px,1fr))", "gap": "12px" }}>
                  {v.serviceRows.map((sv, i) => (
                    <Fragment key={i}>
                      <div className="scpm" style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "display": "flex", "flexDirection": "column", "transition": "transform .18s ease,box-shadow .18s ease" }}>
                        <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                          <div style={{ "width": "38px", "height": "38px", "borderRadius": "11px", "background": sv.markBg, "border": `1px solid ${sv.markBorder}`, "display": "flex", "alignItems": "center", "justifyContent": "center", "overflow": "hidden", "flex": "none" }}>
                            {sv.isChatgpt ? (
                              <>
                                <img src="/assets/logo-chatgpt.png" alt="ChatGPT" style={{ "width": "24px", "height": "24px", "objectFit": "contain" }} />
                              </>
                            ) : null}
                            {sv.isClaude ? (
                              <>
                                <img src="/assets/logo-claude.png" alt="Claude" style={{ "width": "24px", "height": "24px", "borderRadius": "6px", "objectFit": "contain" }} />
                              </>
                            ) : null}
                            {sv.isWhatsapp ? (
                              <>
                                <img src="/assets/logo-whatsapp.png" alt="WhatsApp" style={{ "width": "24px", "height": "24px", "objectFit": "contain" }} />
                              </>
                            ) : null}
                          </div>
                          <div style={{ "minWidth": "0" }}>
                            <div style={{ "fontSize": "15.5px", "fontWeight": "600", "letterSpacing": "-.015em" }}>
                              {sv.name}
                            </div>
                            <div style={{ "display": "flex", "alignItems": "center", "gap": "6px", "marginTop": "3px" }}>
                              <span style={{ "width": "5px", "height": "5px", "borderRadius": "50%", "background": sv.dot, "display": "inline-block" }}></span>
                              <span style={{ "fontSize": "12.5px", "color": sv.stateColor }}>
                                {sv.stateLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "14px 0 18px" }}>
                          {sv.desc}
                        </p>
                        <button className="scp5" onClick={sv.onToggle} style={{ "marginTop": "auto", "width": "100%", "border": `1px solid ${sv.ctaBorder}`, "background": sv.ctaBg, "color": sv.ctaColor, "fontSize": "14px", "fontWeight": "500", "padding": "11px", "borderRadius": "10px", "cursor": "pointer", "transition": "background .16s ease,border-color .16s ease" }}>
                          {sv.ctaLabel}
                        </button>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "marginTop": "16px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "10px", "flexWrap": "wrap" }}>
                    <div style={{ "fontSize": "15px", "fontWeight": "600" }}>
                      {"Agent tools"}
                    </div>
                    <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "10.5px", "letterSpacing": ".1em", "color": "#153AB4", "background": "#F4F6FE", "border": "1px solid #DDE3F6", "padding": "4px 8px", "borderRadius": "7px" }}>
                      {"MCP"}
                    </span>
                  </div>
                  <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "620px" }}>
                    {"Connected services reach your account through these tools. Reads happen on request; anything that moves money is prepared and handed back to you to confirm."}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(232px,1fr))", "gap": "8px", "marginTop": "16px" }}>
                    {v.mcpTools.map((t, i) => (
                      <Fragment key={i}>
                        <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "10px", "padding": "11px 13px", "display": "flex", "alignItems": "center", "gap": "10px" }}>
                          <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12.5px", "color": "#153AB4" }}>
                            {t.name}
                          </span>
                          <span style={{ "marginLeft": "auto", "fontSize": "11.5px", "color": t.color, "whiteSpace": "nowrap" }}>
                            {t.mode}
                          </span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "22px", "marginTop": "16px" }}>
                  <div style={{ "fontSize": "15px", "fontWeight": "600" }}>
                    {"How connected services work"}
                  </div>
                  <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0", "maxWidth": "620px" }}>
                    {"A connected service can start a payment or a request on your behalf. PrivyPay always shows you the recipient, amount, network and fee, and the payment is only submitted to Celo after you confirm it here."}
                  </p>
                  <div style={{ "display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(180px,1fr))", "gap": "10px", "marginTop": "16px" }}>
                    {v.connectedLimits.map((cl, i) => (
                      <Fragment key={i}>
                        <div style={{ "border": "1px solid #EDEFF3", "borderRadius": "11px", "padding": "14px" }}>
                          <div style={{ "fontSize": "12px", "color": "#5F6878" }}>
                            {cl.label}
                          </div>
                          <div style={{ "fontSize": "15px", "fontWeight": "600", "marginTop": "5px" }}>
                            {cl.value}
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {v.isPrivacy ? (
            <>
              <div data-screen-label="Privacy" style={{ "maxWidth": "860px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "24px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "flexWrap": "wrap" }}>
                    <div style={{ "minWidth": "220px" }}>
                      <div style={{ "fontSize": "17px", "fontWeight": "600" }}>
                        {"Privacy mode"}
                      </div>
                      <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "4px" }}>
                        {"Applies your privacy defaults to every new payment."}
                      </div>
                    </div>
                    <div style={{ "display": "flex", "alignItems": "center", "gap": "12px" }}>
                      <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "fontWeight": "500", "color": v.privacyColor }}>
                        {v.privacyLabel}
                      </span>
                      <div onClick={v.togglePrivacy} tabIndex={0} onKeyDown={v.privacyKey} style={{ "width": "48px", "height": "28px", "borderRadius": "999px", "background": v.privacyToggleBg, "position": "relative", "cursor": "pointer", "outline": "none", "transition": "background .2s ease" }}>
                        <div style={{ "width": "22px", "height": "22px", "borderRadius": "50%", "background": "#fff", "position": "absolute", "top": "3px", "left": v.privacyKnobLeft, "transition": "left .2s cubic-bezier(.3,.8,.3,1)" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "6px 24px", "marginTop": "16px" }}>
                  {v.privacyRows.map((p, i) => (
                    <Fragment key={i}>
                      <div style={{ "padding": "18px 0", "borderBottom": "1px solid #F0F1F4", "display": "flex", "gap": "18px", "alignItems": "flex-start", "flexWrap": "wrap" }}>
                        <div style={{ "flex": "1", "minWidth": "200px" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                            {p.name}
                          </div>
                          <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "6px 0 0" }}>
                            {p.description}
                          </p>
                        </div>
                        <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "fontWeight": "500", "color": p.color, "background": p.bg, "padding": "5px 10px", "borderRadius": "8px", "flex": "none" }}>
                          {p.value}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ "border": "1px solid #E4E7EC", "background": "#fff", "borderRadius": "16px", "padding": "20px", "marginTop": "16px" }}>
                  <div style={{ "fontSize": "13.5px", "fontWeight": "600" }}>
                    {"What this does not do"}
                  </div>
                  <p style={{ "fontSize": "13.5px", "color": "#5B6472", "lineHeight": "1.6", "margin": "8px 0 0" }}>
                    {"Payments settle on Celo, a public network. Amounts and addresses remain visible on-chain. These controls change how payment information is presented and shared inside PrivyPay — they do not make transactions anonymous or untraceable."}
                  </p>
                </div>
              </div>
            </>
          ) : null}
          {v.isSettings ? (
            <>
              <div data-screen-label="Settings" style={{ "maxWidth": "860px", "margin": "0 auto", "padding": "22px 24px 40px", "animation": "pp-fade .22s ease both" }}>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#6C7484", "marginBottom": "10px" }}>
                  {"ACCOUNT"}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "6px 20px" }}>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid #F0F1F4", "flexWrap": "wrap" }}>
                    <div style={{ "flex": "1", "minWidth": "180px" }}>
                      <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                        {"Username"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                        {"How people pay you"}
                      </div>
                    </div>
                    <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                      {v.handleDisplay}
                    </div>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid #F0F1F4", "flexWrap": "wrap" }}>
                    <div style={{ "flex": "1", "minWidth": "180px" }}>
                      <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                        {"Sign-in"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                        {"Passkey on this device"}
                      </div>
                    </div>
                    <div style={{ "fontSize": "13.5px", "color": "#167A54" }}>
                      {"Active"}
                    </div>
                  </div>
                  <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "16px 0", "flexWrap": "wrap" }}>
                    <div style={{ "flex": "1", "minWidth": "180px" }}>
                      <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                        {"Payment confirmation"}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                        {"Always review before sending"}
                      </div>
                    </div>
                    <div style={{ "fontSize": "13.5px", "color": "#5B6472" }}>
                      {"Required"}
                    </div>
                  </div>
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#6C7484", "margin": "22px 0 10px" }}>
                  {"LIMITS"}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "6px 20px" }}>
                  {v.limitRows.map((l, i) => (
                    <Fragment key={i}>
                      <div style={{ "display": "flex", "alignItems": "center", "gap": "16px", "padding": "16px 0", "borderBottom": "1px solid #F0F1F4", "flexWrap": "wrap" }}>
                        <div style={{ "flex": "1", "minWidth": "180px" }}>
                          <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                            {l.name}
                          </div>
                          <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                            {l.note}
                          </div>
                        </div>
                        <div style={{ "fontSize": "14.5px", "fontWeight": "600", "fontVariantNumeric": "tabular-nums" }}>
                          {l.value}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "11px", "letterSpacing": ".12em", "color": "#6C7484", "margin": "22px 0 10px" }}>
                  {"PAYMENT WALLET"}
                </div>
                <div style={{ "background": "#fff", "border": "1px solid #E4E7EC", "borderRadius": "16px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "16px", "flexWrap": "wrap" }}>
                  <div style={{ "flex": "1", "minWidth": "180px" }}>
                    <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                      {"Wallet active"}
                    </div>
                    <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#5B6472", "marginTop": "4px" }}>
                      {v.handleDisplay}{" · "}{v.walletAddress}
                    </div>
                  </div>
                  <button className="scp5" onClick={v.goWallet} style={{ "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "10px 16px", "borderRadius": "10px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                    {"Wallet details"}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
        {v.isMobile ? (
          <>
            <div style={{ "position": "fixed", "bottom": "0", "left": "0", "right": "0", "background": "rgba(255,255,255,.95)", "backdropFilter": "blur(10px)", "borderTop": "1px solid #E8EAEF", "display": "flex", "padding": "8px 6px 10px", "zIndex": "30" }}>
              {v.mobileNav.map((m, i) => (
                <Fragment key={i}>
                  <div onClick={m.onClick} style={{ "flex": "1", "textAlign": "center", "padding": "8px 2px", "cursor": "pointer", "minHeight": "48px", "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "gap": "5px" }}>
                    {(() => {
                      const Ico = NAV_ICONS[m.key];
                      return Ico ? (
                        <Ico size={20} color={m.color} weight={m.weight === '600' ? 'bold' : 'regular'} />
                      ) : (
                        <span style={{ "width": "6px", "height": "6px", "borderRadius": "50%", "background": m.dot }}></span>
                      );
                    })()}
                    <span style={{ "fontSize": "11.5px", "color": m.color, "fontWeight": m.weight }}>
                      {m.label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {v.sheetOpen ? (
        <>
          <div onClick={v.closeSheet} style={{ "position": "fixed", "inset": "0", "background": "rgba(14,20,32,.36)", "zIndex": "60", "display": "flex", "alignItems": "flex-end", "justifyContent": "center", "paddingBottom": "clamp(24px,9vh,84px)", "animation": "pp-fade .18s ease both" }}>
            <div onClick={v.stop} style={{ "background": "#fff", "width": "100%", "maxWidth": "440px", "borderRadius": "18px", "padding": "24px", "maxHeight": "86vh", "overflow": "auto", "animation": "pp-sheet .3s cubic-bezier(.2,.8,.3,1) both" }}>
              {v.isSendSheet ? (
                <>
                  <div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                      <div style={{ "fontSize": "17px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                        {v.sendTitle}
                      </div>
                      <div onClick={v.closeSheet} style={{ "width": "30px", "height": "30px", "borderRadius": "9px", "background": "#F2F3F6", "display": "flex", "alignItems": "center", "justifyContent": "center", "cursor": "pointer", "fontSize": "13px", "color": "#5B6472" }}>
                        {"✕"}
                      </div>
                    </div>
                    {v.sendStep1 ? (
                      <>
                        <div>
                          <div style={{ "fontSize": "12px", "color": "#5F6878", "margin": "20px 0 6px" }}>
                            {"To"}
                          </div>
                          <input className="scp6" value={v.sendTo} onChange={v.onSendTo} onKeyDown={v.onSendKey} placeholder="@username" style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "borderRadius": "10px", "padding": "12px 14px", "fontSize": "15px", "outline": "none", "transition": "border-color .16s ease,box-shadow .16s ease" }} />
                          <div style={{ "display": "grid", "gap": "2px", "marginTop": "12px" }}>
                            {v.sendSuggestions.map((c, i) => (
                              <Fragment key={i}>
                                <div className="scpj" onClick={c.onPick} style={{ "display": "flex", "alignItems": "center", "gap": "11px", "padding": "11px 12px", "borderRadius": "10px", "cursor": "pointer", "transition": "background .16s ease" }}>
                                  <div style={{ "width": "32px", "height": "32px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "13.5px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                                    {c.initial}
                                  </div>
                                  <div style={{ "minWidth": "0" }}>
                                    <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                                      {c.handle}
                                    </div>
                                    <div style={{ "fontSize": "12.5px", "color": "#5F6878" }}>
                                      {c.name}
                                    </div>
                                  </div>
                                </div>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.sendStep2 ? (
                      <>
                        <div>
                          <div style={{ "marginTop": "20px", "display": "flex", "alignItems": "center", "gap": "11px", "border": "1px solid #EDEFF3", "borderRadius": "10px", "padding": "12px 14px" }}>
                            <div style={{ "width": "32px", "height": "32px", "borderRadius": "50%", "background": "#EDF1FE", "color": "#1B45D7", "fontSize": "13.5px", "fontWeight": "600", "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                              {v.sendInitial}
                            </div>
                            <div style={{ "minWidth": "0" }}>
                              <div style={{ "fontSize": "14.5px", "fontWeight": "600" }}>
                                {v.sendHandle}
                              </div>
                              <div style={{ "fontSize": "12.5px", "color": "#5F6878" }}>
                                {v.sendName}
                              </div>
                            </div>
                          </div>
                          <div style={{ "fontSize": "12px", "color": "#5F6878", "margin": "18px 0 6px" }}>
                            {"Amount"}
                          </div>
                          <div style={{ "display": "flex", "alignItems": "center", "gap": "8px", "border": "1px solid #DCE0E7", "borderRadius": "10px", "padding": "12px 14px" }}>
                            <span style={{ "fontSize": "26px", "fontWeight": "600", "color": "#6C7484" }}>
                              {"$"}
                            </span>
                            <input value={v.sendAmount} onChange={v.onSendAmount} onKeyDown={v.onSendKey} placeholder="0.00" style={{ "flex": "1", "minWidth": "0", "border": "none", "outline": "none", "background": "transparent", "fontSize": "28px", "fontWeight": "600", "letterSpacing": "-.03em", "fontVariantNumeric": "tabular-nums" }} />
                            <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5F6878" }}>
                              {"USDC"}
                            </span>
                          </div>
                          <div style={{ "fontSize": "12.5px", "color": "#5F6878", "marginTop": "8px" }}>
                            {"Balance $"}{v.balanceStr}{" USDC · Celo"}
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.sendStep3 ? (
                      <>
                        <div>
                          <div style={{ "marginTop": "20px", "textAlign": "center" }}>
                            <div style={{ "fontSize": "13px", "color": "#5F6878" }}>
                              {"You're sending"}
                            </div>
                            <div style={{ "fontSize": "40px", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "6px", "fontVariantNumeric": "tabular-nums" }}>
                              {"$"}{v.sendAmountStr}
                            </div>
                            <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5F6878", "marginTop": "4px" }}>
                              {"USDC"}
                            </div>
                          </div>
                          <div style={{ "display": "grid", "gap": "12px", "marginTop": "20px", "borderTop": "1px solid #F0F1F4", "paddingTop": "18px" }}>
                            <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                              <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                                {"To"}
                              </span>
                              <span style={{ "textAlign": "right" }}>
                                <span style={{ "fontSize": "14px", "fontWeight": "600", "display": "block" }}>
                                  {v.sendHandle}
                                </span>
                                <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#6C7484" }}>
                                  {v.sendAddress}
                                </span>
                              </span>
                            </div>
                            <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                              <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                                {"Network"}
                              </span>
                              <span style={{ "fontSize": "14px", "fontWeight": "500" }}>
                                {"Celo"}
                              </span>
                            </div>
                            <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                              <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                                {"Fee"}
                              </span>
                              <span style={{ "fontSize": "14px", "fontWeight": "500", "fontVariantNumeric": "tabular-nums" }}>
                                {"$0.001"}
                              </span>
                            </div>
                            <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                              <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                                {"Privacy"}
                              </span>
                              <span style={{ "fontSize": "14px", "fontWeight": "500", "color": v.privacyColor }}>
                                {v.privacyLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.sendSending ? (
                      <>
                        <div style={{ "textAlign": "center", "padding": "34px 0 26px" }}>
                          <div style={{ "position": "relative", "width": "46px", "height": "46px", "margin": "0 auto" }}>
                            <div style={{ "position": "absolute", "inset": "0", "borderRadius": "50%", "border": "2px solid #EDEFF3", "borderTopColor": "#1B45D7", "animation": "pp-spin .9s linear infinite" }}></div>
                          </div>
                          <div style={{ "fontSize": "16px", "fontWeight": "600", "marginTop": "20px", "letterSpacing": "-.015em" }}>
                            {"Processing"}
                          </div>
                          <div style={{ "fontSize": "13.5px", "color": "#5F6878", "marginTop": "6px" }}>
                            {"Submitting to Celo"}
                          </div>
                        </div>
                      </>
                    ) : null}
                    {v.sendDone ? (
                      <>
                        <div style={{ "textAlign": "center", "padding": "14px 0 4px" }}>
                          <div style={{ "width": "48px", "height": "48px", "borderRadius": "50%", "background": "#1B45D7", "color": "#fff", "fontSize": "21px", "display": "flex", "alignItems": "center", "justifyContent": "center", "margin": "0 auto", "animation": "pp-pop .34s cubic-bezier(.2,.8,.3,1) both" }}>
                            {"✓"}
                          </div>
                          <div style={{ "fontSize": "17px", "fontWeight": "600", "marginTop": "18px", "letterSpacing": "-.02em" }}>
                            {"Payment sent"}
                          </div>
                          <div style={{ "fontSize": "38px", "fontWeight": "600", "letterSpacing": "-.04em", "marginTop": "12px", "fontVariantNumeric": "tabular-nums" }}>
                            {"$"}{v.sendAmountStr}
                          </div>
                          <div style={{ "fontSize": "14px", "color": "#5B6472", "marginTop": "4px" }}>
                            {v.sendHandle}{" · Celo"}
                          </div>
                          <div style={{ "fontSize": "13px", "color": "#167A54", "marginTop": "10px" }}>
                            {"Completed"}
                          </div>
                        </div>
                      </>
                    ) : null}
                    <div style={{ "marginTop": "20px", "display": "grid", "gap": "9px" }}>
                      {v.sendPrimaryShown ? (
                        <>
                          <button className="scpd scpe" onClick={v.sendPrimary} style={{ "width": "100%", "border": "none", "background": "#1B45D7", "color": "#fff", "fontSize": "15px", "fontWeight": "500", "padding": "14px", "borderRadius": "11px", "cursor": "pointer", "opacity": v.sendPrimaryOpacity, "transition": "background .16s ease,opacity .16s ease" }}>
                            {v.sendPrimaryLabel}
                          </button>
                        </>
                      ) : null}
                      {v.sendBackShown ? (
                        <>
                          <button className="scp5" onClick={v.sendBack} style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                            {v.sendBackLabel}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
              {v.isReceiveSheet ? (
                <>
                  <div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                      <div style={{ "fontSize": "17px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                        {"Receive money"}
                      </div>
                      <div onClick={v.closeSheet} style={{ "width": "30px", "height": "30px", "borderRadius": "9px", "background": "#F2F3F6", "display": "flex", "alignItems": "center", "justifyContent": "center", "cursor": "pointer", "fontSize": "13px", "color": "#5B6472" }}>
                        {"✕"}
                      </div>
                    </div>
                    <div style={{ "textAlign": "center", "marginTop": "20px" }}>
                      <div style={{ "fontSize": "28px", "fontWeight": "600", "letterSpacing": "-.03em" }}>
                        {v.handleDisplay}
                      </div>
                      <div style={{ "fontSize": "13px", "color": "#5F6878", "marginTop": "3px" }}>
                        {"Celo"}
                      </div>
                    </div>
                    <div style={{ "display": "flex", "justifyContent": "center", "marginTop": "20px", "animation": "pp-fade .34s ease both" }}>
                      {v.qrLarge}
                    </div>
                    <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "13px", "color": "#5B6472", "textAlign": "center", "marginTop": "16px" }}>
                      {v.walletAddress}
                    </div>
                    <p style={{ "fontSize": "12.5px", "color": "#6C7484", "textAlign": "center", "lineHeight": "1.6", "margin": "12px auto 0", "maxWidth": "300px" }}>
                      {"Share your username or address to receive supported stablecoins on Celo."}
                    </p>
                    <div style={{ "display": "grid", "gap": "9px", "marginTop": "18px" }}>
                      <button className="scpb" onClick={v.copyHandle} style={{ "width": "100%", "border": "none", "background": "#0E1420", "color": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "13px", "borderRadius": "11px", "cursor": "pointer", "transition": "background .16s ease" }}>
                        {v.copyHandleLabel}
                      </button>
                      <button className="scp5" onClick={v.copyAddress} style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                        {v.copyLabel}
                      </button>
                      <button className="scp5" onClick={v.shareReceive} style={{ "width": "100%", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14.5px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                        {v.shareLabel}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
              {v.isTxSheet ? (
                <>
                  <div>
                    <div style={{ "display": "flex", "alignItems": "center", "justifyContent": "space-between" }}>
                      <div style={{ "fontSize": "17px", "fontWeight": "600", "letterSpacing": "-.02em" }}>
                        {v.txTitle}
                      </div>
                      <div onClick={v.closeSheet} style={{ "width": "30px", "height": "30px", "borderRadius": "9px", "background": "#F2F3F6", "display": "flex", "alignItems": "center", "justifyContent": "center", "cursor": "pointer", "fontSize": "13px", "color": "#5B6472" }}>
                        {"✕"}
                      </div>
                    </div>
                    <div style={{ "textAlign": "center", "padding": "22px 0 6px" }}>
                      <div style={{ "fontSize": "40px", "fontWeight": "600", "letterSpacing": "-.04em", "color": v.txAmountColor, "fontVariantNumeric": "tabular-nums" }}>
                        {v.txAmountStr}
                      </div>
                      <div style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12px", "color": "#5F6878", "marginTop": "4px" }}>
                        {"USDC"}
                      </div>
                    </div>
                    <div style={{ "display": "grid", "gap": "12px", "marginTop": "16px", "borderTop": "1px solid #F0F1F4", "paddingTop": "18px" }}>
                      <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                        <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                          {v.txDirLabel}
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "600" }}>
                          {v.txHandle}
                        </span>
                      </div>
                      <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                        <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                          {"Network"}
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "500" }}>
                          {"Celo"}
                        </span>
                      </div>
                      <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                        <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                          {"Status"}
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "500", "color": v.txStatusColor }}>
                          {v.txStatus}
                        </span>
                      </div>
                      <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                        <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                          {"Date"}
                        </span>
                        <span style={{ "fontSize": "14px", "fontWeight": "500" }}>
                          {v.txDate}
                        </span>
                      </div>
                      <div style={{ "display": "flex", "justifyContent": "space-between" }}>
                        <span style={{ "fontSize": "13.5px", "color": "#5F6878" }}>
                          {"Transaction"}
                        </span>
                        <span style={{ "fontFamily": "var(--font-geist-mono),monospace", "fontSize": "12.5px", "color": "#6C7484" }}>
                          {v.txHash}
                        </span>
                      </div>
                    </div>
                    <button className="scp5" style={{ "width": "100%", "marginTop": "18px", "border": "1px solid #DCE0E7", "background": "#fff", "fontSize": "14px", "fontWeight": "500", "padding": "12px", "borderRadius": "11px", "cursor": "pointer", "transition": "border-color .16s ease" }}>
                      {"View on Celo"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
      {v.toastShown ? (
        <>
          <div style={{ "position": "fixed", "left": "50%", "bottom": "88px", "zIndex": "80", "background": "#0E1420", "color": "#fff", "fontSize": "13.5px", "fontWeight": "500", "padding": "11px 18px", "borderRadius": "11px", "animation": "pp-toast 1.9s ease both", "whiteSpace": "nowrap" }}>
            {v.toastText}
          </div>
        </>
      ) : null}
    </>
  );
}
