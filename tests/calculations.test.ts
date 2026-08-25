import { describe, it, expect } from 'vitest';
import {
  totals,
  balance,
  monthlySeries,
  categoryTotals,
  filterRange,
  lastMonthKeys,
  savingsRate,
} from '../src/domain/calculations';
import type { Category, Transaction } from '../src/domain/types';

function tx(partial: Partial<Transaction> & Pick<Transaction, 'amount' | 'type' | 'date'>): Transaction {
  return {
    id: partial.id ?? crypto.randomUUID(),
    categoryId: partial.categoryId ?? 'c1',
    accountId: partial.accountId ?? 'a1',
    note: partial.note ?? '',
    createdAt: partial.createdAt ?? 0,
    updatedAt: partial.updatedAt ?? 0,
    ...partial,
  } as Transaction;
}

describe('totals', () => {
  it('sums income and expenses from integer cents', () => {
    const txs = [
      tx({ amount: 10050, type: 'income', date: '2025-01-01' }),
      tx({ amount: 425, type: 'expense', date: '2025-01-02' }),
      tx({ amount: 2000, type: 'income', date: '2025-01-03' }),
      tx({ amount: 350, type: 'expense', date: '2025-01-04' }),
    ];
    const t = totals(txs);
    expect(t).toEqual({ income: 12050, expense: 775, net: 11275 });
  });

  it('handles empty lists', () => {
    expect(totals([])).toEqual({ income: 0, expense: 0, net: 0 });
  });
});

describe('balance', () => {
  it('is the all-time net of income minus expenses', () => {
    const txs = [
      tx({ amount: 10000, type: 'income', date: '2025-01-01' }),
      tx({ amount: 250, type: 'expense', date: '2025-01-02' }),
    ];
    expect(balance(txs)).toBe(9750);
  });
});

describe('filterRange', () => {
  const txs = [
    tx({ amount: 1, type: 'income', date: '2025-01-01' }),
    tx({ amount: 2, type: 'income', date: '2025-01-05' }),
    tx({ amount: 3, type: 'income', date: '2025-01-30' }),
  ];

  it('filters inclusive date bounds', () => {
    const out = filterRange(txs, '2025-01-05', '2025-01-29');
    expect(out).toHaveLength(1);
  });

  it('open ranges return everything unbounded', () => {
    expect(filterRange(txs, undefined, undefined)).toHaveLength(3);
  });
});

describe('monthlySeries', () => {
  it('groups totals into months sorted ascending', () => {
    const txs = [
      tx({ amount: 100, type: 'income', date: '2025-02-10' }),
      tx({ amount: 30, type: 'expense', date: '2025-01-05' }),
      tx({ amount: 200, type: 'income', date: '2025-01-20' }),
      tx({ amount: 60, type: 'expense', date: '2025-02-15' }),
    ];
    const series = monthlySeries(txs);
    expect(series.map((s) => s.key)).toEqual(['2025-01', '2025-02']);
    expect(series[0]).toEqual({ key: '2025-01', income: 200, expense: 30, net: 170 });
    expect(series[1]).toEqual({ key: '2025-02', income: 100, expense: 60, net: 40 });
  });
});

describe('lastMonthKeys', () => {
  it('yields N month keys ending at now', () => {
    const keys = lastMonthKeys(3, new Date(2025, 3, 15)); // April 2025
    expect(keys).toEqual(['2025-02', '2025-03', '2025-04']);
  });

  it('wraps around year boundaries', () => {
    const keys = lastMonthKeys(3, new Date(2025, 0, 15)); // Jan 2025
    expect(keys).toEqual(['2024-11', '2024-12', '2025-01']);
  });
});

describe('categoryTotals', () => {
  const categories: Category[] = [
    { id: 'food', name: 'Food', kind: 'expense', color: '#f00', archived: false, createdAt: 0 },
    { id: 'rent', name: 'Rent', kind: 'expense', color: '#0f0', archived: false, createdAt: 0 },
  ];

  it('aggregates expenses by category, highest first', () => {
    const txs = [
      tx({ amount: 300, type: 'expense', date: '2025-01-01', categoryId: 'food' }),
      tx({ amount: 700, type: 'expense', date: '2025-01-02', categoryId: 'rent' }),
      tx({ amount: 100, type: 'expense', date: '2025-01-03', categoryId: 'food' }),
      tx({ amount: 5000, type: 'income', date: '2025-01-04', categoryId: 'food' }),
    ];
    const out = categoryTotals(txs, categories, 'expense');
    expect(out.map((o) => o.categoryId)).toEqual(['rent', 'food']);
    expect(out[1]).toMatchObject({ total: 400, count: 2 });
  });

  it('falls back to "Uncategorized" for unknown ids', () => {
    const txs = [tx({ amount: 10, type: 'expense', date: '2025-01-01', categoryId: 'xyz' })];
    const out = categoryTotals(txs, categories, 'expense');
    expect(out[0].name).toBe('Uncategorized');
  });
});

describe('savingsRate', () => {
  it('is null when income is zero', () => {
    expect(savingsRate({ income: 0, expense: 500, net: -500 })).toBeNull();
  });

  it('computes the fraction of income saved', () => {
    expect(savingsRate({ income: 10000, expense: 2500, net: 7500 })).toBe(0.75);
  });
});
