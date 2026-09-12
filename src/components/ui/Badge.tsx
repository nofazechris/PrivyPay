import type { ReactNode } from 'react';
import { color, radius } from '@/lib/design/tokens';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const tones: Record<BadgeTone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: color.background, fg: color.muted, dot: color.borderStrong },
  primary: { bg: color.primarySoft, fg: color.primaryHover, dot: color.primary },
  success: { bg: color.successSoft, fg: color.success, dot: color.success },
  warning: { bg: '#FBF3E2', fg: color.warning, dot: color.warningDot },
  danger: { bg: color.dangerSoft, fg: color.danger, dot: color.danger },
};

export interface BadgeProps {
  tone?: BadgeTone;
  /** Show a leading status dot — status is not conveyed by color alone (§99). */
  dot?: boolean;
  children: ReactNode;
}

/** Small status pill for payment/request/connection states. */
export function Badge({ tone = 'neutral', dot, children }: BadgeProps) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: t.bg,
        color: t.fg,
        fontSize: '11.5px',
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: radius.pill,
        whiteSpace: 'nowrap',
      }}
    >
      {dot ? <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.dot }} /> : null}
      {children}
    </span>
  );
}
