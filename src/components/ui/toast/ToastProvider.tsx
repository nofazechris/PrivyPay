'use client';

import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { color, radius } from '@/lib/design/tokens';
import { toastReducer, initialToastState, type Toast, type ToastTone } from './reducer';

interface ToastApi {
  /** Show a toast; returns its id so it can be dismissed early. */
  show: (message: string, opts?: { tone?: ToastTone; duration?: number }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Access the toast API. Must be used under a {@link ToastProvider}. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

const toneColors: Record<ToastTone, { bg: string; fg: string }> = {
  neutral: { bg: color.ink, fg: '#fff' },
  success: { bg: color.success, fg: '#fff' },
  danger: { bg: color.danger, fg: '#fff' },
};

let counter = 0;

/**
 * Toast host (§102). Renders an `aria-live` region so screen readers announce messages, and
 * auto-dismisses after each toast's duration. Reuses the design's `pp-toast` keyframe.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialToastState);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    dispatch({ type: 'dismiss', id });
  }, []);

  const show = useCallback(
    (message: string, opts?: { tone?: ToastTone; duration?: number }) => {
      const id = `toast_${++counter}`;
      const toast: Toast = { id, message, tone: opts?.tone ?? 'neutral', duration: opts?.duration ?? 1900 };
      dispatch({ type: 'add', toast });
      if (toast.duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), toast.duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '88px',
          transform: 'translateX(-50%)',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {state.toasts.map((t) => {
          const c = toneColors[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              style={{
                background: c.bg,
                color: c.fg,
                fontSize: '13.5px',
                fontWeight: 500,
                padding: '11px 18px',
                borderRadius: radius.control,
                whiteSpace: 'nowrap',
                animation: 'pp-toast-in .18s ease both',
                pointerEvents: 'auto',
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
