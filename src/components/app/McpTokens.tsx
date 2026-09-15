'use client';

import { useState } from 'react';
import { useMcpTokens } from '@/components/auth/useMcpTokens';
import { color } from '@/lib/design/tokens';

/**
 * MCP token management on the Connected screen. Lets the user mint a PrivyPay token to paste into
 * ChatGPT/Claude, copy the endpoint, and revoke tokens. The plaintext token is shown exactly once
 * right after minting — never retrievable again — so it's surfaced prominently with a copy action.
 */

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          },
          () => {},
        );
      }}
      style={{
        border: `1px solid ${color.borderStrong}`,
        background: color.surface,
        color: color.ink,
        fontSize: '12.5px',
        fontWeight: 500,
        padding: '7px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {done ? 'Copied' : label}
    </button>
  );
}

export function McpTokens() {
  const { tokens, enabled, mint, revoke } = useMcpTokens();
  const [label, setLabel] = useState('');
  const [minting, setMinting] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endpoint = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/mcp';

  const onMint = async () => {
    setMinting(true);
    setError(null);
    const res = await mint(label.trim() || undefined);
    setMinting(false);
    if (res.ok && res.token) {
      setFresh(res.token);
      setLabel('');
    } else {
      setError(res.error ?? 'Could not create token.');
    }
  };

  return (
    <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: '16px', padding: '22px', marginTop: '16px' }}>
      <div style={{ fontSize: '15px', fontWeight: 600 }}>Connect an agent</div>
      <p style={{ fontSize: '13.5px', color: color.muted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: '620px' }}>
        Generate a token and paste it into ChatGPT or Claude to reach these tools. The token acts as
        you — reads run on request, and anything that moves money is prepared for you to approve here.
      </p>

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '12px', color: color.mutedStrong, marginBottom: '6px' }}>MCP endpoint</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <code
            style={{
              fontFamily: 'var(--font-geist-mono),monospace',
              fontSize: '12.5px',
              color: color.ink,
              background: color.surfaceMuted,
              border: `1px solid ${color.borderFaint}`,
              borderRadius: '8px',
              padding: '9px 12px',
              flex: 1,
              minWidth: '220px',
              overflowX: 'auto',
            }}
          >
            {endpoint}
          </code>
          <CopyButton value={endpoint} label="Copy URL" />
        </div>
      </div>

      {!enabled ? (
        <div style={{ marginTop: '16px', fontSize: '13px', color: color.warning, background: '#FBF6EA', border: '1px solid #F0E4C8', borderRadius: '10px', padding: '11px 13px' }}>
          MCP is not enabled for this deployment yet. Set <code>MCP_SECRET</code> to turn it on.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '9px', marginTop: '16px', flexWrap: 'wrap' }}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 40))}
              placeholder="Name this token, e.g. ChatGPT"
              style={{
                flex: 1,
                minWidth: '200px',
                maxWidth: '320px',
                border: `1px solid ${color.borderStrong}`,
                background: color.surface,
                borderRadius: '10px',
                padding: '10px 13px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={onMint}
              disabled={minting}
              style={{
                border: 'none',
                background: color.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '10px',
                padding: '10px 18px',
                cursor: minting ? 'default' : 'pointer',
                opacity: minting ? 0.6 : 1,
              }}
            >
              {minting ? 'Generating…' : 'Generate token'}
            </button>
          </div>
          {error ? <div style={{ marginTop: '10px', fontSize: '13px', color: color.danger }}>{error}</div> : null}

          {fresh ? (
            <div style={{ marginTop: '14px', background: color.primarySoft, border: `1px solid ${color.primarySoftBorder}`, borderRadius: '11px', padding: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: color.primaryHover }}>
                Copy this token now — it won&apos;t be shown again
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '9px', flexWrap: 'wrap' }}>
                <code
                  style={{
                    fontFamily: 'var(--font-geist-mono),monospace',
                    fontSize: '12.5px',
                    color: color.ink,
                    background: color.surface,
                    border: `1px solid ${color.primarySoftBorder}`,
                    borderRadius: '8px',
                    padding: '9px 12px',
                    flex: 1,
                    minWidth: '220px',
                    overflowX: 'auto',
                    wordBreak: 'break-all',
                  }}
                >
                  {fresh}
                </code>
                <CopyButton value={fresh} label="Copy token" />
              </div>
              <button
                onClick={() => setFresh(null)}
                style={{ marginTop: '10px', border: 'none', background: 'transparent', color: color.muted, fontSize: '12.5px', cursor: 'pointer', padding: 0 }}
              >
                Done
              </button>
            </div>
          ) : null}

          <div style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '12px', color: color.mutedStrong, marginBottom: '8px' }}>Active tokens</div>
            {tokens.length === 0 ? (
              <div style={{ fontSize: '13px', color: color.muted }}>No tokens yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {tokens.map((t) => (
                  <div
                    key={t.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color.borderFaint}`, borderRadius: '10px', padding: '11px 13px', flexWrap: 'wrap' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{t.label || 'Token'}</div>
                      <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: '12px', color: color.faint, marginTop: '2px' }}>
                        {t.tokenPrefix}…
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '12px', color: color.muted }}>
                      {t.lastUsedAt ? 'Last used ' + new Date(t.lastUsedAt).toLocaleDateString() : 'Never used'}
                    </div>
                    <button
                      onClick={() => revoke(t.id)}
                      style={{ border: `1px solid ${color.borderStrong}`, background: color.surface, color: color.danger, fontSize: '12.5px', fontWeight: 500, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
