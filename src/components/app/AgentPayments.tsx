'use client';

import { useState } from 'react';
import { usePrivy, useDelegatedActions } from '@privy-io/react-auth';
import { color } from '@/lib/design/tokens';

/**
 * "Agent payments" consent on the Connected screen. Delegating the embedded wallet lets an agent
 * (via MCP) settle a payment server-side after confirm_payment — without switching to the app.
 * Keys stay in Privy's TEE; every delegated payment still passes policy (per-payment + daily
 * caps), single-use authorization and idempotency. Off by default; one tap to enable/disable.
 */
export function AgentPayments() {
  const { user } = usePrivy();
  const { delegateWallet, revokeWallets } = useDelegatedActions();
  const [busy, setBusy] = useState(false);

  const wallet = user?.linkedAccounts?.find(
    (a) => a.type === 'wallet' && a.walletClientType === 'privy' && a.chainType === 'ethereum',
  ) as { address?: string; delegated?: boolean } | undefined;
  const address = wallet?.address;
  const delegated = wallet?.delegated === true;

  if (!address) return null; // no embedded wallet yet — nothing to delegate

  const enable = async () => {
    setBusy(true);
    try {
      await delegateWallet({ address, chainType: 'ethereum' });
    } catch {
      // user dismissed the consent, or it failed — leave state unchanged
    } finally {
      setBusy(false);
    }
  };
  const disable = async () => {
    setBusy(true);
    try {
      await revokeWallets();
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '22px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>Agent payments</div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            color: delegated ? color.success : color.mutedStrong,
            background: delegated ? color.successSoft : color.surfaceMuted,
            border: `1px solid ${delegated ? '#CDE7DA' : color.borderFaint}`,
            padding: '4px 9px',
            borderRadius: '999px',
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: delegated ? color.success : color.warningDot, display: 'inline-block' }} />
          {delegated ? 'Enabled' : 'Off'}
        </span>
      </div>
      <p style={{ fontSize: '13.5px', color: color.muted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '620px' }}>
        {delegated
          ? 'A connected agent can settle a payment right after you confirm it, without opening the app. Every payment still passes your limits ($500 per payment, $1,000 per day), a one-time authorization, and on-chain confirmation. Your keys never leave Privy.'
          : 'Off by default: payments an agent starts are prepared and wait for you to approve here. Turn this on to let the agent settle a confirmed payment on its own, within your limits — keys stay in Privy, and every payment still passes policy and a one-time authorization.'}
      </p>
      <div style={{ marginTop: '16px' }}>
        {delegated ? (
          <button
            onClick={disable}
            disabled={busy}
            style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.ink, fontSize: '14px', fontWeight: 500, borderRadius: '10px', padding: '10px 18px', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Working…' : 'Disable agent payments'}
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={busy}
            style={{ border: 'none', background: color.primary, color: '#fff', fontSize: '14px', fontWeight: 500, borderRadius: '10px', padding: '10px 18px', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Working…' : 'Enable agent payments'}
          </button>
        )}
      </div>
    </div>
  );
}
