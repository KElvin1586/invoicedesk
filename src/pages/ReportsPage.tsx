import { useMemo } from 'react';
import { useData } from '../hooks/DataProvider';
import {
  categoryTotals,
  monthlySeries,
  savingsRate,
  totals,
} from '../domain/calculations';
import { formatMoney } from '../domain/money';
import { PremiumGate } from '../components/premium/PremiumGate';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { BalanceTrend } from '../components/charts/BalanceTrend';

export function ReportsPage() {
  const { transactions, categories } = useData();
  const entitlement = useEntitlement();

  const series = useMemo(() => monthlySeries(transactions), [transactions]);

  const topExpenses = useMemo(
    () => categoryTotals(transactions, categories, 'expense').slice(0, 6),
    [transactions, categories],
  );

  if (!entitlement.isPremium) {
    return (
      <PremiumGate
        feature="advanced-reports"
        title="Advanced reports"
        description="Monthly summaries, savings-rate tracking, and your top spending categories — plus a running balance trend — across all time."
      />
    );
  }

  const allTotals = totals(transactions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">All-time and monthly analysis.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-800">Balance trend</h2>
        <BalanceTrend data={series} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Monthly summaries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-3 text-left font-medium">Month</th>
                  <th className="pb-2 pr-3 font-medium">Income</th>
                  <th className="pb-2 pr-3 font-medium">Expenses</th>
                  <th className="pb-2 pr-3 font-medium">Net</th>
                  <th className="pb-2 font-medium">Savings</th>
                </tr>
              </thead>
              <tbody>
                {series.map((m) => {
                  const rate = savingsRate(m);
                  return (
                    <tr key={m.key} className="border-t border-slate-100 text-right">
                      <td className="py-2 pr-3 text-left text-slate-600">{m.key}</td>
                      <td className="py-2 pr-3 text-emerald-600">{formatMoney(m.income, 'USD')}</td>
                      <td className="py-2 pr-3 text-rose-500">{formatMoney(m.expense, 'USD')}</td>
                      <td className={`py-2 pr-3 ${m.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {formatMoney(m.net, 'USD')}
                      </td>
                      <td className="py-2 text-slate-500">{rate == null ? '—' : `${Math.round(rate * 100)}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 text-right font-semibold">
                  <td className="py-2 pr-3 text-left">All time</td>
                  <td className="py-2 pr-3 text-emerald-600">{formatMoney(allTotals.income, 'USD')}</td>
                  <td className="py-2 pr-3 text-rose-500">{formatMoney(allTotals.expense, 'USD')}</td>
                  <td className={`py-2 pr-3 ${allTotals.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {formatMoney(allTotals.net, 'USD')}
                  </td>
                  <td className="py-2 text-slate-500">{savingsRate(allTotals) == null ? '—' : `${Math.round(savingsRate(allTotals)! * 100)}%`}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Top expense categories</h2>
          {topExpenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Nothing spent yet.</p>
          ) : (
            <ul className="space-y-3">
              {topExpenses.map((t) => (
                <li key={t.categoryId}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{t.name}</span>
                    <span className="font-medium">{formatMoney(t.total, 'USD')}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(t.total / topExpenses[0].total) * 100}%`, background: t.color }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{t.count} transactions</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
