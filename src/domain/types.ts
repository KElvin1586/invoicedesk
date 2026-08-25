export type TxType = 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  createdAt: number;
}

export type CategoryKind = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  color: string;
  archived: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TxType;
  /** Integer cents to avoid floating point errors. */
  amount: number;
  categoryId: string;
  accountId: string;
  /** ISO date 'YYYY-MM-DD'. */
  date: string;
  note: string;
  recurringRuleId?: string;
  createdAt: number;
  updatedAt: number;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  accountId: string;
  note: string;
  frequency: Frequency;
  startDate: string;
  nextDate: string;
  active: boolean;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  /** YYYY-MM key. */
  month: string;
  limit: number;
  createdAt: number;
}

export interface AppSettings {
  id: string;
  currency: string;
  createdAt: number;
}
