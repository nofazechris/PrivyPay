import { describe, it, expect } from 'vitest';
import { toastReducer, initialToastState, type Toast } from './reducer';

const make = (id: string, message = 'hi'): Toast => ({ id, message, tone: 'neutral', duration: 1900 });

describe('toast reducer', () => {
  it('adds a toast', () => {
    const s = toastReducer(initialToastState, { type: 'add', toast: make('a') });
    expect(s.toasts).toHaveLength(1);
    expect(s.toasts[0].id).toBe('a');
  });

  it('dismisses by id', () => {
    let s = toastReducer(initialToastState, { type: 'add', toast: make('a') });
    s = toastReducer(s, { type: 'add', toast: make('b') });
    s = toastReducer(s, { type: 'dismiss', id: 'a' });
    expect(s.toasts.map((t) => t.id)).toEqual(['b']);
  });

  it('replaces a toast re-added with the same id rather than duplicating', () => {
    let s = toastReducer(initialToastState, { type: 'add', toast: make('a', 'first') });
    s = toastReducer(s, { type: 'add', toast: make('a', 'second') });
    expect(s.toasts).toHaveLength(1);
    expect(s.toasts[0].message).toBe('second');
  });

  it('caps the visible stack at three, keeping the most recent', () => {
    let s = initialToastState;
    for (const id of ['a', 'b', 'c', 'd']) s = toastReducer(s, { type: 'add', toast: make(id) });
    expect(s.toasts.map((t) => t.id)).toEqual(['b', 'c', 'd']);
  });

  it('clears all toasts', () => {
    let s = toastReducer(initialToastState, { type: 'add', toast: make('a') });
    s = toastReducer(s, { type: 'clear' });
    expect(s.toasts).toHaveLength(0);
  });
});
