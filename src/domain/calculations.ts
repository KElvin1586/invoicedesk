import type { Category, Transaction, TxType } from './types';
import { monthKeyOf } from './dates';

export interface Totals {
  income: number;
  expense: number;
  net: number;
}

/** Sum income/expense over a set of transactions. */
export function totals(txs: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export function filterRange(txs: Transaction[], from?: string, to?: string): Transaction[] {
  return txs.filter((t) => (from === undefined || t.date >= from) && (to === undefined || t.date <= to));
}

/** True account of all money: all-time income minus expense. */
export function balance(allTxs: Transaction[]): number {
  const { income, expense } = totals(allTxs);
  return income - expense;
}

export interface MonthTotal extends Totals {
  key: string;
}

/** Aggregate transactions into per-month totals, sorted ascending. */
export function monthlySeries(txs: Transaction[]): MonthTotal[] {
  const map = new Map<string, MonthTotal>();
  for (const t of txs) {
    const key = monthKeyOf(t.date);
    let entry = map.get(key);
    if (!entry) {
      entry = { key, income: 0, expense: 0, net: 0 };
      map.set(key, entry);
    }
    if (t.type === 'income') entry.income += t.amount;
    else entry.expense += t.amount;
    entry.net = entry.income - entry.expense;
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Derive keys for the last N months including current. */
export function lastMonthKeys(count: number, now: Date = new Date()): string[] {
  const keys: string[] = [];
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-based
  for (let i = 0; i < count; i++) {
    keys.unshift(`${year}-${String(month + 1).padStart(2, '0')}`);
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }
  return keys;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

/** Expense (or income) totals grouped by category, sorted desc. */
export function categoryTotals(
  txs: Transaction[],
  categories: Category[],
  type: TxType,
): CategoryTotal[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const map = new Map<string, CategoryTotal>();
  for (const t of txs) {
    if (t.type !== type) continue;
    const cat = byId.get(t.categoryId);
    let entry = map.get(t.categoryId);
    if (!entry) {
      entry = {
        categoryId: t.categoryId,
        name: cat?.name ?? 'Uncategorized',
        color: cat?.color ?? '#94a3b8',
        total: 0,
        count: 0,
      };
      map.set(t.categoryId, entry);
    }
    entry.total += t.amount;
    entry.count += 1;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Percent savings rate: (income - expense) / income. */
export function savingsRate(t: Totals): number | null {
  if (t.income <= 0) return null;
  return (t.income - t.expense) / t.income;
}
