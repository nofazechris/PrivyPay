'use client';

import { useEffect, useRef, useState } from 'react';
import { color, radius, shadow, font } from '@/lib/design/tokens';
import { shortAddress } from '@/lib/format';
import { Button } from '@/components/ui';

/**
 * Account control for the dashboard (§64, §10 shell). A chip showing the user's @username that
 * opens a small menu with their wallet address and sign-out — the real replacement for Stage
 * 3's floating button.
 */
export function AccountMenu({
  username,
  address,
  onSignOut,
}: {
  username?: string;
  address?: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handle = username ? '@' + username : 'Account';
  const initial = (username?.[0] ?? '?').toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'fixed', top: 14, right: 16, zIndex: 50 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: color.surface,
          border: `1px solid ${color.borderStrong}`,
          borderRadius: radius.pill,
          padding: '5px 12px 5px 5px',
          cursor: 'pointer',
          fontFamily: font.sans,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: color.primarySoft,
            color: color.primary,
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {initial}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: color.ink }}>{handle}</span>
      </button>

      {open ? (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 240,
            background: color.surface,
            border: `1px solid ${color.border}`,
            borderRadius: radius.card,
            boxShadow: shadow.card,
            padding: 14,
            display: 'grid',
            gap: 12,
            animation: 'pp-sheet .16s ease both',
          }}
        >
          <div style={{ display: 'grid', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>{handle}</span>
            {address ? (
              <span style={{ fontFamily: font.mono, fontSize: 12, color: color.muted }}>{shortAddress(address)}</span>
            ) : null}
          </div>
          <Button variant="secondary" size="sm" block onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      ) : null}
    </div>
  );
}
