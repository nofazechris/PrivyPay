import type { CSSProperties } from 'react';

/**
 * PrivyPay logo — a custom cursive "P" built from three deliberate strokes: one flowing stem and
 * a bowl broken into two separated arcs, with intentional gaps between them and the stem. You read
 * "P" first, then notice it's assembled from independent pieces — the brand's character. It is a
 * custom vector mark (never a font glyph) and a single colour via `currentColor`. No box, badge,
 * circle or container — the P itself is the identity (§ brand).
 */

// The three strokes, drawn on a 48×48 canvas. Order = draw order (stem → upper bowl → lower bowl).
const STROKES = [
  'M18.5 8 C 17.2 20, 16.7 32, 16.5 44', // stem — one confident, near-upright motion
  'M19.5 8.5 C 30 6.6, 38.5 11, 38.5 18.5', // upper bowl arc
  'M38 27 C 37.5 34.5, 29.5 37, 20.5 34.5', // lower bowl arc — clear gap above it, open counter to the stem
] as const;

export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoVariant = 'light' | 'dark' | 'white' | 'mono';

const SIZE_PX: Record<LogoSize, number> = { sm: 22, md: 30, lg: 48 };
// `mono` inherits the surrounding text colour (currentColor); the rest pin an explicit colour.
const VARIANT_COLOR: Record<LogoVariant, string | undefined> = {
  light: '#1B45D7', // cobalt on light backgrounds
  dark: '#FFFFFF', // on deep navy
  white: '#FFFFFF',
  mono: undefined,
};

export interface PrivyPayLogoProps {
  /** Preset size (sm 22 / md 30 / lg 48) or an explicit pixel size. */
  size?: LogoSize | number;
  variant?: LogoVariant;
  /** Subtle staggered entrance (strokes fade/rise in order). Respects reduced motion. */
  animated?: boolean;
  /** Provide for a meaningful instance (adds role="img" + <title>); omit for decorative use. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function PrivyPayLogo({ size = 'md', variant = 'light', animated = false, title, className, style }: PrivyPayLogoProps) {
  const px = typeof size === 'number' ? size : SIZE_PX[size];
  const color = VARIANT_COLOR[variant];
  const decorative = !title;
  // Stroke weight tuned so the deliberate gaps stay legible at every size.
  const strokeWidth = 5.5;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, display: 'block', flex: 'none', ...style }}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {STROKES.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animated ? { animation: 'pp-logo-in 620ms cubic-bezier(.2,.8,.3,1) both', animationDelay: `${i * 140}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
