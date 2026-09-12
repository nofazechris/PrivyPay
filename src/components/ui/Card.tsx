import type { HTMLAttributes, ReactNode } from 'react';
import { color, radius, shadow } from '@/lib/design/tokens';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift the card with the restrained card shadow. */
  raised?: boolean;
  padding?: string;
  children?: ReactNode;
}

/** Surface primitive: white, subtle border, restrained shadow (§94, §96). */
export function Card({ raised, padding = '20px', style, children, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: color.surface,
        border: `1px solid ${color.border}`,
        borderRadius: radius.card,
        padding,
        boxShadow: raised ? shadow.card : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
