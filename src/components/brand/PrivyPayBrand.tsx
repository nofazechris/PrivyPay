import type { CSSProperties } from 'react';
import { PrivyPayLogo, type LogoSize, type LogoVariant } from './PrivyPayLogo';

/**
 * The full brand lockup: the P mark plus the "PrivyPay" wordmark. The symbol is the identity, so
 * the wordmark is deliberately quieter. `showWordmark={false}` renders just the mark (compact /
 * mobile). No container around either element — whitespace is part of the brand (§ brand).
 */

const WORDMARK_SIZE: Record<LogoSize, number> = { sm: 15, md: 17, lg: 22 };

export interface PrivyPayBrandProps {
  size?: LogoSize;
  variant?: LogoVariant;
  showWordmark?: boolean;
  /** Wordmark colour; defaults to the app ink (or white on dark/white variants). */
  wordmarkColor?: string;
  animated?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function PrivyPayBrand({
  size = 'sm',
  variant = 'light',
  showWordmark = true,
  wordmarkColor,
  animated = false,
  title,
  className,
  style,
}: PrivyPayBrandProps) {
  const inkDefault = variant === 'dark' || variant === 'white' ? '#FFFFFF' : '#0E1420';
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      <PrivyPayLogo size={size} variant={variant} animated={animated} />
      {showWordmark ? (
        <span
          aria-hidden={title ? true : undefined}
          style={{ fontSize: `${WORDMARK_SIZE[size]}px`, fontWeight: 600, letterSpacing: '-.02em', color: wordmarkColor ?? inkDefault, lineHeight: 1 }}
        >
          Pexa
        </span>
      ) : null}
    </span>
  );
}
