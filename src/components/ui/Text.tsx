import type { CSSProperties, ElementType, ReactNode } from 'react';
import { color, font } from '@/lib/design/tokens';

/**
 * Typographic scale (§95). One component, one hierarchy — hero → section → card → body →
 * caption → metadata — so hand-built screens share the design's type system instead of
 * re-deriving sizes inline. Hierarchy is carried by type, not decoration (§95).
 */
export type TextVariant = 'hero' | 'section' | 'card' | 'body' | 'caption' | 'metadata';
export type TextTone = 'ink' | 'muted' | 'faint' | 'primary' | 'success' | 'danger';

const variants: Record<TextVariant, CSSProperties & { as: ElementType }> = {
  hero: { as: 'h1', fontSize: 'clamp(40px,6.2vw,62px)', lineHeight: 1.01, letterSpacing: '-.042em', fontWeight: 600 },
  section: { as: 'h2', fontSize: 'clamp(28px,3.8vw,40px)', lineHeight: 1.05, letterSpacing: '-.038em', fontWeight: 600 },
  card: { as: 'h3', fontSize: '19px', lineHeight: 1.25, letterSpacing: '-.02em', fontWeight: 600 },
  body: { as: 'p', fontSize: '15.5px', lineHeight: 1.6, fontWeight: 400 },
  caption: { as: 'p', fontSize: '13.5px', lineHeight: 1.5, fontWeight: 400 },
  metadata: {
    as: 'span',
    fontFamily: font.mono,
    fontSize: '11px',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
};

const tones: Record<TextTone, string> = {
  ink: color.ink,
  muted: color.muted,
  faint: color.faint,
  primary: color.primary,
  success: color.success,
  danger: color.danger,
};

export interface TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Text({ variant = 'body', tone, as, className, style, children }: TextProps) {
  const { as: defaultAs, ...typeStyle } = variants[variant];
  const Component = as ?? defaultAs;
  // Metadata is faint by default; everything else inherits ink unless a tone is given.
  const resolvedTone = tone ?? (variant === 'metadata' ? 'faint' : variant === 'body' || variant === 'caption' ? 'muted' : 'ink');
  return (
    <Component
      className={className}
      style={{ margin: 0, fontFamily: font.sans, color: tones[resolvedTone], ...typeStyle, ...style }}
    >
      {children}
    </Component>
  );
}
