import type { CSSProperties } from 'react';

/**
 * PrivyPay logo — a custom cursive "P" built from three deliberate strokes: one flowing stem and
 * a bowl broken into two separated arcs, with intentional gaps between them and the stem. You read
 * "P" first, then notice it's assembled from independent pieces — the brand's character. It is a
 * custom vector mark (never a font glyph) and a single colour via `currentColor`. No box, badge,
 * circle or container — the P itself is the identity (§ brand).
 */

// The canonical Pexa mark — three strokes on the design's viewBox (8 3.4 20.4 25.8).
// Order = draw order (stem → upper bowl → lower bowl).
const VIEWBOX = '8 3.4 20.4 25.8';
const ASPECT = 20.4 / 25.8; // width / height — the P is taller than wide
const STROKE_WIDTH = 3.4;
const STROKES = [
  'M12.4 5C12.2 12 11.4 19.6 9.6 27.6', // stem
  'M16.8 5.5C22.2 4.7 26.8 6.9 26.5 10.2', // upper bowl arc
  'M25.9 14.6C25.3 17.6 21.2 19 16 18.3', // lower bowl arc
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
  const height = typeof size === 'number' ? size : SIZE_PX[size];
  const width = Math.round(height * ASPECT * 100) / 100;
  const color = VARIANT_COLOR[variant];
  const decorative = !title;

  return (
    <svg
      width={width}
      height={height}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, display: 'block', flex: 'none', overflow: 'visible', ...style }}
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
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animated ? { animation: 'pp-logo-in 620ms cubic-bezier(.2,.8,.3,1) both', animationDelay: `${i * 140}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
