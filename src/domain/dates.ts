import type { Frequency } from './types';

/** Predicate date filtering used by the transactions page. */
export type DatePreset = 'all' | 'this-month' | 'last-month' | 'this-year' | 'custom';

export interface DateRange {
  preset: DatePreset;
  /** Inclusive ISO bounds for custom ranges. */
  from?: string;
  to?: string;
}

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function currentMonthKey(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

export function monthKeyOf(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/** Resolve a preset into inclusive [from, to] ISO bounds. */
export function resolveRange(range: DateRange, now: Date = new Date()): { from?: string; to?: string } {
  switch (range.preset) {
    case 'all':
      return {};
    case 'this-month': {
      const key = currentMonthKey(now);
      return { from: `${key}-01`, to: `${key}-31` };
    }
    case 'last-month': {
      const key = currentMonthKey(now);
      const prev = addMonths(`${key}-01`, -1).slice(0, 7);
      return { from: `${prev}-01`, to: `${prev}-31` };
    }
    case 'this-year': {
      const y = todayISO(now).slice(0, 4);
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    case 'custom':
      return { from: range.from || undefined, to: range.to || undefined };
  }
}

export function isValidISODate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const check = new Date(Date.UTC(year, month - 1, day));
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}

/** Add months to an ISO date, clamping to month end. */
export function addMonths(dateISO: string, delta: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const total = m - 1 + delta;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(d, daysInMonth);
  return iso(year, month + 1, day);
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Compute the next occurrence of a recurring rule. */
export function nextOccurrence(dateISO: string, frequency: Frequency): string {
  switch (frequency) {
    case 'daily': {
      const [y, m, d] = dateISO.split('-').map(Number);
      const next = new Date(Date.UTC(y, m - 1, d + 1));
      return iso(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
    }
    case 'weekly': {
      const [y, m, d] = dateISO.split('-').map(Number);
      const next = new Date(Date.UTC(y, m - 1, d + 7));
      return iso(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
    }
    case 'monthly':
      return addMonths(dateISO, 1);
    case 'yearly':
      return addMonths(dateISO, 12);
  }
}
