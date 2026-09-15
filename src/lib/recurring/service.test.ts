import { describe, expect, it } from 'vitest';
import { computeNextRun } from './service';

// Local Monday, 5 Jan 2026 (month is 0-indexed) — TZ-safe since we compare local date parts.
const MON = new Date(2026, 0, 5, 12, 0, 0);
const parts = (d: Date) => ({ y: d.getFullYear(), m: d.getMonth(), day: d.getDate() });

describe('computeNextRun', () => {
  it('finds the next occurrence of a named weekday', () => {
    expect(parts(computeNextRun('Every Friday', MON))).toEqual({ y: 2026, m: 0, day: 9 });
  });

  it('rolls a same-day weekday to next week (never today)', () => {
    expect(parts(computeNextRun('Every Monday', MON))).toEqual({ y: 2026, m: 0, day: 12 });
  });

  it('adds a month for monthly', () => {
    expect(parts(computeNextRun('Monthly', MON))).toEqual({ y: 2026, m: 1, day: 5 });
  });

  it('adds a week for weekly', () => {
    expect(parts(computeNextRun('Weekly', MON))).toEqual({ y: 2026, m: 0, day: 12 });
  });

  it('adds a day for daily', () => {
    expect(parts(computeNextRun('Every day', MON))).toEqual({ y: 2026, m: 0, day: 6 });
  });

  it('defaults to weekly for an unrecognised cadence', () => {
    expect(parts(computeNextRun('whenever', MON))).toEqual({ y: 2026, m: 0, day: 12 });
  });
});
