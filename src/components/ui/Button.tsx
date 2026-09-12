import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Icon } from '@phosphor-icons/react';
import { color, radius, font } from '@/lib/design/tokens';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Optional Phosphor icon rendered before the label (§68). */
  icon?: Icon;
  block?: boolean;
  children?: ReactNode;
}

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: font.sans,
  fontWeight: 500,
  borderRadius: radius.control,
  cursor: 'pointer',
  border: '1px solid transparent',
} as const;

const sizes: Record<Size, { padding: string; fontSize: string; icon: number }> = {
  sm: { padding: '10px 16px', fontSize: '14px', icon: 16 },
  md: { padding: '13px 20px', fontSize: '15px', icon: 18 },
};

const variants: Record<Variant, { background: string; color: string; borderColor: string }> = {
  primary: { background: color.primary, color: '#fff', borderColor: color.primary },
  secondary: { background: color.surface, color: color.ink, borderColor: color.borderStrong },
  ghost: { background: 'transparent', color: color.ink, borderColor: 'transparent' },
};

/**
 * Primary action button in the PrivyPay language. Token-driven so it matches the imported
 * design exactly; hover/active/disabled states come from the `.pp-btn*` classes in globals.css.
 */
export function Button({ variant = 'primary', size = 'md', icon: IconCmp, block, className, style, children, ...rest }: ButtonProps) {
  const s = sizes[size];
  const v = variants[variant];
  return (
    <button
      className={cn('pp-btn', `pp-btn--${variant}`, className)}
      style={{
        ...base,
        ...v,
        padding: s.padding,
        fontSize: s.fontSize,
        width: block ? '100%' : undefined,
        ...style,
      }}
      {...rest}
    >
      {IconCmp ? <IconCmp size={s.icon} weight="bold" /> : null}
      {children}
    </button>
  );
}
