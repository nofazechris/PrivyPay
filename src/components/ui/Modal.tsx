'use client';

import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { color, radius, shadow } from '@/lib/design/tokens';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Centered dialog, or a bottom sheet (the design's send/receive/detail pattern). */
  placement?: 'center' | 'bottom';
  title?: string;
  /** Accessible label when there is no visible title. */
  ariaLabel?: string;
  children: ReactNode;
  maxWidth?: number;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog (§99). Traps focus, closes on Esc and backdrop click, restores focus to
 * the trigger on close, and locks body scroll while open. Entrance uses the design's existing
 * `pp-fade` / `pp-sheet` keyframes, which the global reduced-motion guard already disables.
 */
export function Modal({ open, onClose, placement = 'center', title, ariaLabel, children, maxWidth = 460 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    // Focus the first focusable element, or the panel itself.
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      restoreTo.current?.focus?.();
    };
  }, [open]);

  // Modals open on user interaction, so `open` is false on the first (server) render — no portal
  // and no hydration mismatch. Guard on document for the SSR pass just in case.
  if (!open || typeof document === 'undefined') return null;

  const centered = placement === 'center';

  // Rendered in a portal on document.body so the backdrop covers the whole viewport — including
  // the sidebar/nav — and intercepts clicks, regardless of where the trigger lives in the layout
  // (a transformed/positioned ancestor would otherwise clip a plain fixed element).
  const overlay = (
    <div
      onClick={onClose}
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(14,20,32,.36)',
        display: 'flex',
        alignItems: centered ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: centered ? 'clamp(16px,4vw,24px)' : '0 0 clamp(16px,9vh,84px)',
        overflowY: 'auto',
        animation: 'pp-fade .18s ease both',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: centered ? 'calc(100dvh - 32px)' : '92dvh',
          overflowY: 'auto',
          background: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: radius.card,
          boxShadow: shadow.card,
          padding: 'clamp(18px,4vw,22px)',
          outline: 'none',
          animation: 'pp-sheet .22s cubic-bezier(.2,.8,.3,1) both',
        }}
      >
        {title ? (
          <h2 id={titleId} style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 600, letterSpacing: '-.02em', color: color.ink }}>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
