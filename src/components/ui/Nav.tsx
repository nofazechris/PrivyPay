import type { Icon } from '@phosphor-icons/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { color, radius, font } from '@/lib/design/tokens';

/**
 * Navigation primitives (§64, §98).
 *
 * The active/inactive vocabulary from the design, as reusable pieces the real authenticated
 * shell (Stage 10) composes into a sidebar and a mobile tab bar. Items are real buttons/links
 * — keyboard-operable with visible focus (§99).
 */

export interface NavItemProps {
  label: string;
  icon?: Icon;
  active?: boolean;
  onSelect: () => void;
}

function activate(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

export function NavItem({ label, icon: IconCmp, active, onSelect }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={activate(onSelect)}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer',
        fontFamily: font.sans,
        fontSize: '14px',
        fontWeight: active ? 600 : 450,
        color: active ? color.primaryHover : color.muted,
        background: active ? color.primarySoft : 'transparent',
        borderRadius: radius.control,
        padding: '9px 12px',
        transition: 'background .16s ease, color .16s ease',
      }}
    >
      {IconCmp ? <IconCmp size={18} weight={active ? 'fill' : 'regular'} /> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? color.primary : color.borderStrong }} />}
      {label}
    </button>
  );
}

export interface NavSectionProps {
  label?: string;
  children: ReactNode;
}

export function NavSection({ label, children }: NavSectionProps) {
  return (
    <div style={{ display: 'grid', gap: '2px' }}>
      {label ? (
        <div style={{ fontFamily: font.mono, fontSize: '10.5px', letterSpacing: '.12em', color: color.faint, padding: '12px 12px 4px' }}>
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
