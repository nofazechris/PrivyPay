/**
 * Pure toast state (§102). Kept separate from React so it can be unit-tested in a node
 * environment with no DOM — the provider is a thin shell over this reducer.
 */

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly tone: ToastTone;
  /** Auto-dismiss after this many ms; 0 means it stays until dismissed. */
  readonly duration: number;
}

export interface ToastState {
  readonly toasts: readonly Toast[];
}

export type ToastAction =
  | { type: 'add'; toast: Toast }
  | { type: 'dismiss'; id: string }
  | { type: 'clear' };

export const initialToastState: ToastState = { toasts: [] };

/** Most-recent toasts kept; older ones drop off so the stack never grows unbounded. */
const MAX_VISIBLE = 3;

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'add': {
      const withoutDupeId = state.toasts.filter((t) => t.id !== action.toast.id);
      return { toasts: [...withoutDupeId, action.toast].slice(-MAX_VISIBLE) };
    }
    case 'dismiss':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'clear':
      return initialToastState;
    default:
      return state;
  }
}
