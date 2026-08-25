import { db } from './db';
import type {
  Account,
  AppSettings,
  Budget,
  Category,
  RecurringRule,
  Transaction,
} from '../domain/types';

export const EXPORT_VERSION = 1;
export const MAX_IMPORT_CHARS = 20_000_000; // ~20MB of JSON text

export interface ExportPayload {
  app: string;
  version: number;
  exportedAt: number;
  data: {
    transactions: Transaction[];
    categories: Category[];
    accounts: Account[];
    budgets: Budget[];
    recurring: RecurringRule[];
    settings: AppSettings[];
  };
}

export async function buildExportPayload(): Promise<ExportPayload> {
  const [transactions, categories, accounts, budgets, recurring, settings] =
    await Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.accounts.toArray(),
      db.budgets.toArray(),
      db.recurring.toArray(),
      db.settings.toArray(),
    ]);
  return {
    app: 'pocketledger',
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    data: { transactions, categories, accounts, budgets, recurring, settings },
  };
}

export interface ImportSummary {
  transactions: number;
  categories: number;
  accounts: number;
  budgets: number;
  recurring: number;
  duplicates: number;
}

export interface ImportResult {
  ok: boolean;
  errors: string[];
  summary?: ImportSummary;
}

type EntityKind = keyof ExportPayload['data'];

const TABLES: Record<EntityKind, { name: string; validate: (v: unknown) => string | null }> = {
  transactions: { name: 'transactions', validate: validateTransaction },
  categories: { name: 'categories', validate: validateCategory },
  accounts: { name: 'accounts', validate: validateAccount },
  budgets: { name: 'budgets', validate: validateBudget },
  recurring: { name: 'recurring', validate: validateRecurringRule },
  settings: { name: 'settings', validate: validateSettings },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown): v is string {
  return typeof v === 'string';
}

function validateAccount(v: unknown): string | null {
  if (!isObject(v)) return 'account not an object';
  if (!asString(v.id)) return 'account.id missing';
  if (!asString(v.name)) return 'account.name missing';
  if (!Number.isFinite(v.createdAt)) return 'account.createdAt missing';
  return null;
}

function validateCategory(v: unknown): string | null {
  if (!isObject(v)) return 'category not an object';
  if (!asString(v.id)) return 'category.id missing';
  if (!asString(v.name)) return 'category.name missing';
  if (v.kind !== 'income' && v.kind !== 'expense' && v.kind !== 'both') return 'category.kind invalid';
  if (!asString(v.color)) return 'category.color missing';
  if (typeof v.archived !== 'boolean') return 'category.archived invalid';
  if (!Number.isFinite(v.createdAt)) return 'category.createdAt missing';
  return null;
}

function validateTransaction(v: unknown): string | null {
  if (!isObject(v)) return 'transaction not an object';
  if (!asString(v.id)) return 'transaction.id missing';
  if (v.type !== 'income' && v.type !== 'expense') return 'transaction.type invalid';
  if (!Number.isInteger(v.amount) || (v.amount as number) <= 0) return 'transaction.amount invalid';
  if (!asString(v.categoryId)) return 'transaction.categoryId missing';
  if (!asString(v.accountId)) return 'transaction.accountId missing';
  if (!asString(v.date) || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return 'transaction.date invalid';
  if (!asString(v.note)) return 'transaction.note missing';
  if (v.recurringRuleId !== undefined && !asString(v.recurringRuleId)) return 'transaction.recurringRuleId invalid';
  if (!Number.isFinite(v.createdAt)) return 'transaction.createdAt missing';
  if (!Number.isFinite(v.updatedAt)) return 'transaction.updatedAt missing';
  return null;
}

function validateRecurringRule(v: unknown): string | null {
  if (!isObject(v)) return 'recurring not an object';
  if (!asString(v.id)) return 'recurring.id missing';
  if (v.type !== 'income' && v.type !== 'expense') return 'recurring.type invalid';
  if (!Number.isInteger(v.amount) || (v.amount as number) <= 0) return 'recurring.amount invalid';
  if (!asString(v.categoryId)) return 'recurring.categoryId missing';
  if (!asString(v.accountId)) return 'recurring.accountId missing';
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(v.frequency as string)) return 'recurring.frequency invalid';
  if (!asString(v.startDate)) return 'recurring.startDate missing';
  if (!asString(v.nextDate)) return 'recurring.nextDate missing';
  if (typeof v.active !== 'boolean') return 'recurring.active invalid';
  if (!Number.isFinite(v.createdAt)) return 'recurring.createdAt missing';
  return null;
}

function validateBudget(v: unknown): string | null {
  if (!isObject(v)) return 'budget not an object';
  if (!asString(v.id)) return 'budget.id missing';
  if (!asString(v.categoryId)) return 'budget.categoryId missing';
  if (!asString(v.month) || !/^\d{4}-\d{2}$/.test(v.month)) return 'budget.month invalid';
  if (!Number.isInteger(v.limit) || (v.limit as number) <= 0) return 'budget.limit invalid';
  return null;
}

function validateSettings(v: unknown): string | null {
  if (!isObject(v)) return 'settings not an object';
  if (!asString(v.id)) return 'settings.id missing';
  if (!asString(v.currency)) return 'settings.currency missing';
  return null;
}

/**
 * Validate and import a PocketLedger JSON backup. Replaces all local data
 * atomically, or aborts with human-readable errors.
 */
export async function importJSON(text: string, replace = true): Promise<ImportResult> {
  if (text.length > MAX_IMPORT_CHARS) {
    return { ok: false, errors: ['File is too large to import.'] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['File is not valid JSON.'] };
  }
  if (!isObject(parsed) || !isObject(parsed.data)) {
    return { ok: false, errors: ['Not a PocketLedger export: missing data.'] };
  }
  const payload = parsed as { app?: unknown; data: Record<string, unknown> };

  // Validate entities first — write nothing until everything checks out.
  const problems: string[] = [];
  for (const kind of Object.keys(TABLES) as EntityKind[]) {
    const list = payload.data[kind];
    if (list === undefined) continue;
    if (!Array.isArray(list)) {
      problems.push(`${TABLES[kind].name}: expected an array`);
      continue;
    }
    for (const item of list) {
      const message = TABLES[kind].validate(item);
      if (message) problems.push(`${TABLES[kind].name}: ${message}`);
    }
    if (problems.length > 10) {
      return { ok: false, errors: [`Import aborted — too many invalid entries (showing first): ${problems.slice(0, 5).join('; ')}`] };
    }
  }
  if (problems.length > 0) return { ok: false, errors: problems };

  // Referential integrity on transactions/recurring/budgets. For merge mode,
  // referenced ids may already exist in the local database.
  const data = payload.data as Partial<ExportPayload['data']>;
  const [dbCategories, dbAccounts] = await Promise.all([
    db.categories.toArray(),
    db.accounts.toArray(),
  ]);
  const knownCategoryIds = new Set<string>(dbCategories.map((c) => c.id));
  const knownAccountIds = new Set<string>(dbAccounts.map((a) => a.id));
  const importedCategoryIds = (data.categories ?? []).map((c: Category) => c.id);
  const importedAccountIds = (data.accounts ?? []).map((a: Account) => a.id);
  const categoryIds = new Set([...knownCategoryIds, ...importedCategoryIds]);
  const accountIds = new Set([...knownAccountIds, ...importedAccountIds]);
  for (const source of ['transactions', 'recurring', 'budgets'] as const) {
    for (const row of (data[source] ?? []) as Array<Transaction & RecurringRule & Budget>) {
      if (source !== 'budgets' && !accountIds.has(row.accountId)) {
        problems.push(`${source}: unknown account ${row.accountId}`);
      }
      if (!categoryIds.has(row.categoryId)) {
        problems.push(`${source}: unknown category ${row.categoryId}`);
      }
    }
  }
  if (problems.length > 0) return { ok: false, errors: problems };

  const counts: ImportSummary = {
    transactions: 0,
    categories: 0,
    accounts: 0,
    budgets: 0,
    recurring: 0,
    duplicates: 0,
  };

  await db.transaction(
    'rw',
    [db.transactions, db.categories, db.accounts, db.budgets, db.recurring, db.settings],
    async () => {
      function choose(kind: EntityKind): object[] {
        return (data[kind] ?? []) as object[];
      }
      if (replace) {
        await Promise.all([
          db.transactions.clear(),
          db.categories.clear(),
          db.accounts.clear(),
          db.budgets.clear(),
          db.recurring.clear(),
          db.settings.clear(),
        ]);
        counts.transactions = (data.transactions ?? []).length;
        counts.categories = (data.categories ?? []).length;
        counts.accounts = (data.accounts ?? []).length;
        counts.budgets = (data.budgets ?? []).length;
        counts.recurring = (data.recurring ?? []).length;
        await db.transactions.bulkAdd(choose('transactions') as Transaction[]);
        await db.categories.bulkAdd(choose('categories') as Category[]);
        await db.accounts.bulkAdd(choose('accounts') as Account[]);
        await db.budgets.bulkAdd(choose('budgets') as Budget[]);
        await db.recurring.bulkAdd(choose('recurring') as RecurringRule[]);
        await db.settings.bulkPut(choose('settings') as AppSettings[]);
      } else {
        interface TableLike {
          add(item: unknown): Promise<unknown>;
          get(id: string): Promise<unknown>;
        }
        const tableMap: Record<EntityKind, TableLike> = {
          transactions: db.transactions,
          categories: db.categories,
          accounts: db.accounts,
          budgets: db.budgets,
          recurring: db.recurring,
          settings: db.settings,
        };
        const counters: Record<EntityKind, number> = {
          transactions: 0,
          categories: 0,
          accounts: 0,
          budgets: 0,
          recurring: 0,
          settings: 0,
        };
        for (const kind of Object.keys(TABLES) as EntityKind[]) {
          for (const item of choose(kind)) {
            const existing = await tableMap[kind].get((item as { id: string }).id);
            if (existing) {
              counts.duplicates += 1;
            } else {
              await tableMap[kind].add(item);
              counters[kind] += 1;
            }
          }
        }
        counts.transactions = counters.transactions;
        counts.categories = counters.categories;
        counts.accounts = counters.accounts;
        counts.budgets = counters.budgets;
        counts.recurring = counters.recurring;
      }
    },
  );

  return { ok: true, errors: [], summary: counts };
}
