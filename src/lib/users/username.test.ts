import { describe, it, expect } from 'vitest';
import { normalizeUsername, validateUsername, isValidUsername, USERNAME_MAX } from './username';

describe('username normalization', () => {
  it('strips a leading @, trims and lowercases', () => {
    expect(normalizeUsername('  @Sarah ')).toBe('sarah');
    expect(normalizeUsername('@@MiKe')).toBe('mike');
  });
});

describe('username validation', () => {
  it('accepts a well-formed username', () => {
    expect(isValidUsername('sarah_01')).toBe(true);
    expect(validateUsername('chris')).toBeNull();
  });

  it('rejects too short and too long', () => {
    expect(validateUsername('ab')).toBe('too_short');
    expect(validateUsername('a'.repeat(USERNAME_MAX + 1))).toBe('too_long');
  });

  it('rejects invalid characters (uppercase survives only via normalize, spaces, symbols)', () => {
    expect(validateUsername('sarah-okafor')).toBe('invalid_chars');
    expect(validateUsername('sarah okafor')).toBe('invalid_chars');
    expect(validateUsername('sarah!')).toBe('invalid_chars');
  });

  it('normalizes case before validating, so @Sarah is valid', () => {
    expect(validateUsername('@Sarah')).toBeNull();
  });

  it('blocks reserved words (case/@-insensitively)', () => {
    expect(validateUsername('admin')).toBe('reserved');
    expect(validateUsername('@PrivyPay')).toBe('reserved');
    expect(validateUsername('SUPPORT')).toBe('reserved');
  });

  it('allows underscores and digits, and reserved only matches the exact word', () => {
    expect(isValidUsername('a_b_2')).toBe(true);
    // "user" is reserved, but "user_2026" is a distinct, allowed name.
    expect(isValidUsername('user_2026')).toBe(true);
    expect(validateUsername('user')).toBe('reserved');
  });
});
