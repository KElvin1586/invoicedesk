import { describe, it, expect } from 'vitest';
import {
  resolveRange,
  addMonths,
  nextOccurrence,
  isValidISODate,
  todayISO,
} from '../src/domain/dates';

describe('resolveRange', () => {
  it('returns unbounded for all time', () => {
    expect(resolveRange({ preset: 'all' }).from).toBeUndefined();
  });

  it('this month covers full month', () => {
    const r = resolveRange({ preset: 'this-month' }, new Date(2025, 5, 9));
    expect(r.from).toBe('2025-06-01');
    expect(r.to).toBe('2025-06-31');
  });

  it('last month', () => {
    const r = resolveRange({ preset: 'last-month' }, new Date(2025, 5, 9));
    expect(r.from).toBe('2025-05-01');
    expect(r.to).toBe('2025-05-31');
  });

  it('this year', () => {
    const r = resolveRange({ preset: 'this-year' }, new Date(2025, 5, 9));
    expect(r.from).toBe('2025-01-01');
  });

  it('custom passes through', () => {
    const r = resolveRange({ preset: 'custom', from: '2025-03-01', to: '2025-03-31' });
    expect(r.from).toBe('2025-03-01');
  });
});

describe('addMonths', () => {
  it('adds months normally', () => {
    expect(addMonths('2025-01-15', 3)).toBe('2025-04-15');
  });

  it('wraps year boundaries', () => {
    expect(addMonths('2025-11-10', 2)).toBe('2026-01-10');
    expect(addMonths('2025-01-10', -2)).toBe('2024-11-10');
  });

  it('clamps to month end (Mar 31 - 1 month)', () => {
    expect(addMonths('2025-03-31', -1)).toBe('2025-02-28');
  });
});

describe('nextOccurrence', () => {
  it('daily adds one day', () => {
    expect(nextOccurrence('2025-02-28', 'daily')).toBe('2025-03-01');
  });

  it('weekly adds 7 days', () => {
    expect(nextOccurrence('2025-01-30', 'weekly')).toBe('2025-02-06');
  });

  it('monthly respects end-of-month', () => {
    expect(nextOccurrence('2025-01-31', 'monthly')).toBe('2025-02-28');
  });

  it('yearly adds 12 months', () => {
    expect(nextOccurrence('2025-03-15', 'yearly')).toBe('2026-03-15');
  });
});

describe('isValidISODate', () => {
  it('validates calendar dates', () => {
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-13-01')).toBe(false);
    expect(isValidISODate('')).toBe(false);
  });
});

describe('todayISO', () => {
  it('returns yYYY-MM-DD', () => {
    expect(todayISO(new Date(2025, 0, 3))).toBe('2025-01-03');
  });
});
