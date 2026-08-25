import { db } from './db';
import { nextOccurrence } from '../domain/dates';
import type {
  Account,
  Budget,
  Category,
  RecurringRule,
  Transaction,
  TxType,
} from '../domain/types';

export function newId(): string {
  return crypto.randomUUID();
}

// Transactions
export async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
  const now = Date.now();
  const full: Transaction = { ...tx, id: newId(), createdAt: now, updatedAt: now };
  await db.transactions.add(full);
  return full;
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  await db.transactions.put({ ...tx, updatedAt: Date.now() });
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

// Categories
export async function addCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const full: Category = { ...cat, id: newId(), createdAt: Date.now() };
  await db.categories.add(full);
  return full;
}

export async function updateCategory(cat: Category): Promise<void> {
  await db.categories.put(cat);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}

// Accounts
export async function addAccount(name: string): Promise<Account> {
  const account: Account = { id: newId(), name, createdAt: Date.now() };
  await db.accounts.add(account);
  return account;
}

export async function deleteAccount(id: string): Promise<void> {
  await db.accounts.delete(id);
}

// Budgets
export async function addBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget> {
  const full: Budget = { ...budget, id: newId(), createdAt: Date.now() };
  await db.budgets.add(full);
  return full;
}

export async function updateBudget(budget: Budget): Promise<void> {
  await db.budgets.put(budget);
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}

// Recurring rules
export async function addRecurringRule(rule: Omit<RecurringRule, 'id' | 'createdAt'>): Promise<RecurringRule> {
  const full: RecurringRule = { ...rule, id: newId(), createdAt: Date.now() };
  await db.recurring.add(full);
  return full;
}

export async function updateRecurringRule(rule: RecurringRule): Promise<void> {
  await db.recurring.put(rule);
}

export async function deleteRecurringRule(id: string): Promise<void> {
  await db.recurring.delete(id);
}

/** Number of occurrences missed before today's date. */
export function dueOccurrences(rule: RecurringRule, today: string): string[] {
  const due: string[] = [];
  let cursor = rule.nextDate;
  let guard = 0;
  while (cursor <= today && guard < 370) {
    due.push(cursor);
    cursor = nextOccurrence(cursor, rule.frequency);
    guard += 1;
  }
  return due;
}

/**
 * Materialize all due recurring transactions up to `today`.
 * Returns how many transactions were created.
 */
export async function runRecurring(today: string, txTypeFilter?: TxType): Promise<number> {
  void txTypeFilter;
  const rules = await db.recurring.toArray();
  let created = 0;
  for (const rule of rules.filter((r) => r.active)) {
    const due = dueOccurrences(rule, today);
    if (due.length === 0) continue;
    const txs = due.map((date) => ({
      id: newId(),
      type: rule.type,
      amount: rule.amount,
      categoryId: rule.categoryId,
      accountId: rule.accountId,
      date,
      note: rule.note,
      recurringRuleId: rule.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } satisfies Transaction));
    await db.transaction('rw', [db.transactions, db.recurring], async () => {
      await db.transactions.bulkAdd(txs);
      // Set nextDate to the first future occurrence.
      rule.nextDate = nextOccurrence(due[due.length - 1], rule.frequency);
      await db.recurring.put(rule);
    });
    created += due.length;
  }
  return created;
}
