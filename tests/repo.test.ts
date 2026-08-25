import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/data/db';
import {
  addTransaction,
  deleteTransaction,
  updateTransaction,
  addCategory,
  runRecurring,
  dueOccurrences,
} from '../src/data/repo';
import type { RecurringRule } from '../src/domain/types';

beforeEach(async () => {
  await Promise.all([
    db.transactions.clear(),
    db.categories.clear(),
    db.accounts.clear(),
    db.recurring.clear(),
    db.budgets.clear(),
    db.settings.clear(),
  ]);
});

describe('repository', () => {
  it('creates, reads, updates, deletes transactions', async () => {
    const created = await addTransaction({
      type: 'income',
      amount: 12500,
      categoryId: 'salary',
      accountId: 'main',
      date: '2025-01-15',
      note: 'Test',
    });
    expect(created.id).toBeTruthy();
    expect(await db.transactions.get(created.id)).toBeDefined();

    await updateTransaction({ ...created, note: 'Updated', updatedAt: created.updatedAt });
    const updated = await db.transactions.get(created.id);
    expect(updated?.note).toBe('Updated');

    await deleteTransaction(created.id);
    expect(await db.transactions.get(created.id)).toBeUndefined();
  });

  it('counts storage usage', async () => {
    await addTransaction({ type: 'expense', amount: 500, categoryId: 'cat', accountId: 'a', date: '2025-01-01', note: '' });
    expect(await db.transactions.count()).toBe(1);
  });

  it('creates categories', async () => {
    await addCategory({ name: 'Food', kind: 'expense', color: '#f00', archived: false });
    expect(await db.categories.count()).toBe(1);
  });
});

describe('recurring engine', () => {
  const rule: Omit<RecurringRule, 'id' | 'createdAt'> = {
    type: 'expense',
    amount: 1500,
    categoryId: 'rent',
    accountId: 'cash',
    note: 'rent',
    frequency: 'monthly',
    startDate: '2025-01-31',
    nextDate: '2025-01-31',
    active: true,
  };

  it('computes due occurrences', () => {
    const due = dueOccurrences({ id: 'x', createdAt: 0, ...rule }, '2025-02-28');
    expect(due).toEqual(['2025-01-31', '2025-02-28']);
  });

  it('materializes due transactions and advances nextDate', async () => {
    const r = { id: 'r1', createdAt: 0, ...rule } satisfies RecurringRule;
    await db.recurring.add(r);
    const created = await runRecurring('2025-02-28');
    expect(created).toBe(2);
    const stored = await db.recurring.get('r1');
    expect(stored?.nextDate).toBe('2025-03-28');
    expect(await db.transactions.count()).toBe(2);
  });

  it('ignores paused rules', async () => {
    const r = { id: 'r2', createdAt: 0, ...rule, active: false };
    await db.recurring.add(r);
    expect(await runRecurring('2025-02-28')).toBe(0);
  });
});
