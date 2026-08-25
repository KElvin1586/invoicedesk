import Dexie, { type Table } from 'dexie';
import type {
  Account,
  AppSettings,
  Budget,
  Category,
  RecurringRule,
  Transaction,
} from '../domain/types';

export class PocketLedgerDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  accounts!: Table<Account, string>;
  budgets!: Table<Budget, string>;
  recurring!: Table<RecurringRule, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('pocketledger');
    this.version(1).stores({
      transactions: 'id, date, type, categoryId, accountId',
      categories: 'id, name',
      accounts: 'id, name',
      budgets: 'id, month, categoryId',
      recurring: 'id, nextDate',
      settings: 'id',
    });
  }
}

export const db = new PocketLedgerDB();
