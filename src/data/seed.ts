import { db } from './db';
import type { Account, Category } from '../domain/types';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Salary', kind: 'income', color: '#10b981', archived: false },
  { name: 'Freelance', kind: 'income', color: '#22c55e', archived: false },
  { name: 'Investments', kind: 'income', color: '#84cc16', archived: false },
  { name: 'Groceries', kind: 'expense', color: '#f43f5e', archived: false },
  { name: 'Housing', kind: 'expense', color: '#f59e0b', archived: false },
  { name: 'Transport', kind: 'expense', color: '#3b82f6', archived: false },
  { name: 'Utilities', kind: 'expense', color: '#8b5cf6', archived: false },
  { name: 'Entertainment', kind: 'expense', color: '#ec4899', archived: false },
  { name: 'Dining', kind: 'expense', color: '#ef4444', archived: false },
  { name: 'Healthcare', kind: 'expense', color: '#06b6d4', archived: false },
];

const DEFAULT_ACCOUNT: Omit<Account, 'id' | 'createdAt'> = { name: 'Cash' };

const PRESET_COLORS = [
  '#10b981', '#84cc16', '#f43f5e', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#22c55e',
];

export { PRESET_COLORS };

/**
 * Idempotent first-run setup: seeds the default account and categories.
 * Safe to call on every load.
 */
export async function ensureSeedData(): Promise<Account> {
  // Read + write inside one Dexie transaction so two concurrent callers
  // (e.g. StrictMode double-mount) cannot both observe "empty" and insert.
  return db.transaction('rw', [db.accounts, db.categories, db.settings], async () => {
    const existingAccounts = await db.accounts.toArray();
    if (existingAccounts.length > 0) return existingAccounts[0];

    const account: Account = {
      ...DEFAULT_ACCOUNT,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    await db.accounts.add(account);
    if ((await db.categories.count()) === 0) {
      const now = Date.now();
      const categories = DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        id: crypto.randomUUID(),
        createdAt: now,
      }));
      await db.categories.bulkAdd(categories);
    }
    if (!(await db.settings.get('settings'))) {
      await db.settings.add({ id: 'settings', currency: 'USD', createdAt: Date.now() });
    }
    return account;
  });
}
