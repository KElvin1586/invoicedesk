import { useMemo } from 'react';
import { useData } from '../hooks/DataProvider';
import {
  balance,
  categoryTotals,
  lastMonthKeys,
  monthlySeries,
  savingsRate,
  totals,
} from '../domain/calculations';
import { resolveRange, currentMonthKey, type DateRange, monthKeyOf } from '../domain/dates';
import { formatMoney } from '../domain/money';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart';
import { CategoryPie } from '../components/charts/CategoryPie';
import { BalanceTrend } from '../components/charts/BalanceTrend';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { FREE_TRANSACTION_LIMIT } from '../config';
import { PremiumBadge } from '../components/premium/PremiumBadge';

export function DashboardPage() {
  const { transactions, categories, loading } = useData();
  const entitlement = useEntitlement();

  const range: DateRange = { preset: 'this-month' };
  const { from, to } = resolveRange(range);
  const currency = 'USD';

  const monthKey = currentMonthKey();

  const buckets = useMemo(() => {
    const monthTx = transactions.filter((t) => monthKeyOf(t.date) === monthKey);
    return {
      month: totals(monthTx),
      balance: balance(transactions),
      monthTotals: monthlySeries(transactions),
      last6: lastMonthKeys(6),
      monthTransactions: monthTx,
    };
  }, [transactions, monthKey]);

  const series = useMemo(() => {
    const filled = buckets.last6.map((k) => (
      buckets.monthTotals.find((m) => m.key === k) ?? { key: k, income: 0, expense: 0, net: 0 }
    ));
    return filled;
  }, [buckets]);

  const expensesByCategory = useMemo(
    () => categoryTotals(
      transactions.filter((t) => monthKeyOf(t.date) === monthKey),
      categories,
      'expense',
    ),
    [transactions, categories, monthKey],
  );

  const recent = buckets.monthTransactions.concat(
    transactions.filter((t) => monthKeyOf(t.date) !== monthKey).slice(0, 8),
  ).slice(0, 8);

  if (loading) {
    return <p className="text-slate-500">Loading…</p>;
  }

  const rate = savingsRate(buckets.month);
  const monthLabel = new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            From {from} to {to} · {monthLabel}
          </p>
        </div>
        {!entitlement.isPremium && (
          <p className="text-xs text-slate-400">
            Free plan · {transactions.length}/{FREE_TRANSACTION_LIMIT} transactions
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Balance" value={formatMoney(buckets.balance, currency)} intent={buckets.balance >= 0 ? 'good' : 'bad'} />
        <StatCard label="Income (month)" value={formatMoney(buckets.month.income, currency)} intent="good" />
        <StatCard label="Expenses (month)" value={formatMoney(buckets.month.expense, currency)} intent="bad" />
        <StatCard
          label="Net (month)"
          value={formatMoney(buckets.month.net, currency)}
          intent={buckets.month.net >= 0 ? 'good' : 'bad'}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-800">Income vs expenses — last 6 months</h2>
          <MonthlyBarChart data={series} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-800">Expenses by category — {monthLabel}</h2>
          <CategoryPie data={expensesByCategory} />
        </section>
      </div>

      {entitlement.isPremium ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 flex items-center font-semibold text-slate-800">Balance trend{savingsText(rate)}</h2>
          <BalanceTrend data={buckets.monthTotals} />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center font-semibold text-slate-800">
                Balance trend <PremiumBadge feature="advanced-charts" />
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Unlock the balance trend chart, extra reports, and more with Premium.
              </p>
            </div>
            <button
              type="button"
              onClick={() => entitlement.gate('advanced-charts')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Upgrade to unlock
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-800">Recent transactions</h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No transactions yet — add one from the Transactions page.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: cat?.color ?? '#94a3b8' }} />
                      <span className="font-medium text-slate-800">{cat?.name ?? 'Uncategorized'}</span>
                    </div>
                    {t.note && <p className="mt-0.5 truncate text-xs text-slate-400">{t.note}</p>}
                  </div>
                  <span className={t.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                    {(t.type === 'income' ? '+' : '-') + formatMoney(t.amount, currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function savingsText(rate: number | null): string {
  if (rate == null) return '';
  const pct = Math.round(rate * 100);
  return ` · ${pct}% savings this month`;
}

function StatCard({
  label,
  value,
  intent,
}: {
  label: string;
  value: string;
  intent: 'good' | 'bad' | 'neutral';
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={[
          'mt-1 text-2xl font-bold',
          intent === 'good' ? 'text-emerald-600' : intent === 'bad' ? 'text-rose-500' : 'text-slate-900',
        ].join(' ')}
      >
        {value}
      </p>
    </section>
  );
}
