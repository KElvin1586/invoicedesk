import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Account,
  AppSettings,
  Budget,
  Category,
  RecurringRule,
  Transaction,
} from '../domain/types';
import { db } from '../data/db';
import { ensureSeedData } from '../data/seed';
import { runRecurring } from '../data/repo';
import { todayISO } from '../domain/dates';
import { useEntitlement } from '../entitlement/EntitlementContext';

export interface DataState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  recurring: RecurringRule[];
  settings: AppSettings | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<DataState | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const premium = useEntitlement();
  const [state, setState] = useState<Omit<DataState, 'refresh'>>({
    transactions: [],
    categories: [],
    accounts: [],
    budgets: [],
    recurring: [],
    settings: undefined,
    loading: true,
  });

  const refresh = useCallback(async () => {
    await ensureSeedData();
    // Materialize any due recurring transactions (premium only).
    if (premium.isPremium) {
      await runRecurring(todayISO());
    }
    const [transactions, categories, accounts, budgets, recurring, settings] =
      await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
        db.accounts.toArray(),
        db.budgets.toArray(),
        db.recurring.toArray(),
        db.settings.get('settings'),
      ]);
    setState({
      transactions: transactions.sort((a, b) => b.date.localeCompare(a.date)),
      categories: categories.sort((a, b) => a.createdAt - b.createdAt),
      accounts: accounts.sort((a, b) => a.createdAt - b.createdAt),
      budgets: budgets.sort((a, b) => b.month.localeCompare(a.month)),
      recurring: recurring.sort((a, b) => a.nextDate.localeCompare(b.nextDate)),
      settings,
      loading: false,
    });
  }, [premium.isPremium]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<DataState>(
    () => ({ ...state, refresh }),
    [state, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData outside DataProvider');
  return ctx;
}
