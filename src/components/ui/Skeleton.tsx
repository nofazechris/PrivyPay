import type { CSSProperties } from 'react';
import { color, radius } from '@/lib/design/tokens';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'control' | 'card' | 'pill' | 'full';
  style?: CSSProperties;
}

const radii = { control: radius.control, card: radius.card, pill: radius.pill, full: '50%' } as const;

/**
 * Loading placeholder (§101 — no blank pages). A shimmering block sized to the content it
 * stands in for. Marked aria-hidden; the surrounding region carries the loading status.
 */
export function Skeleton({ width = '100%', height = 16, rounded = 'control', style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radii[rounded],
        background: `linear-gradient(90deg, ${color.borderFaint} 25%, ${color.background} 37%, ${color.borderFaint} 63%)`,
        backgroundSize: '200% 100%',
        animation: 'pp-shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
