import { useMemo, useState } from 'react';
import { useData } from '../hooks/DataProvider';
import { currentMonthKey } from '../domain/dates';
import { formatMoney, parseAmount, amountToEditable } from '../domain/money';
import { addBudget, updateBudget, deleteBudget } from '../data/repo';
import { totals } from '../domain/calculations';
import { PremiumGate } from '../components/premium/PremiumGate';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { Modal } from '../components/Modal';
import { PencilIcon, TrashIcon } from '../components/Icons';

export function BudgetsPage() {
  const { budgets, categories, transactions, refresh } = useData();
  const entitlement = useEntitlement();
  const month = currentMonthKey();

  const expenseCategories = categories.filter(
    (c) => !c.archived && (c.kind === 'expense' || c.kind === 'both'),
  );

  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === month),
    [budgets, month],
  );

  if (!entitlement.isPremium) {
    return (
      <PremiumGate
        feature="budgets"
        title="Budgets"
        description="Set monthly spending limits per category and watch progress in real time. Upgrade once to unlock budgets forever."
      />
    );
  }

  async function handleAdd() {
    const parsed = parseAmount(limit);
    const target = categoryId || expenseCategories[0]?.id;
    if (!target) {
      setError('Choose a category.');
      return;
    }
    if (!parsed.ok || parsed.cents === undefined) {
      setError(parsed.error ?? 'Invalid limit.');
      return;
    }
    if (monthBudgets.some((b) => b.categoryId === target)) {
      setError('That category already has a budget this month. Edit it instead.');
      return;
    }
    await addBudget({ categoryId: target, month, limit: parsed.cents });
    setLimit('');
    setError(null);
    await refresh();
  }

  async function handleUpdate() {
    if (!editing) return;
    const parsed = parseAmount(editLimit);
    if (!parsed.ok || parsed.cents === undefined) {
      setError(parsed.error ?? 'Invalid limit.');
      return;
    }
    const b = budgets.find((x) => x.id === editing);
    if (!b) return;
    await updateBudget({ ...b, limit: parsed.cents });
    setEditing(null);
    setError(null);
    await refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteBudget(confirmDelete);
    setConfirmDelete(null);
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        <p className="text-sm text-slate-500">Plan a spending limit per category for {month}.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 text-sm">
            <span className="font-medium text-slate-700">Category</span>
            <select
              value={categoryId || expenseCategories[0]?.id || ''}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Monthly limit</span>
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm sm:w-40"
            />
          </label>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Add budget
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {monthBudgets.map((b) => {
          const category = categories.find((c) => c.id === b.categoryId);
          const spent = totals(
            transactions.filter((t) => t.type === 'expense' && (t.date.startsWith(month) && t.categoryId === b.categoryId)),
          );
          const pct = Math.min((spent.expense / b.limit) * 100, 100);
          const over = spent.expense > b.limit;
          return (
            <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: category?.color ?? '#94a3b8' }} />
                  <span className="font-medium text-slate-800">{category?.name ?? 'Unknown'}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit budget"
                    onClick={() => {
                      setEditing(b.id);
                      setEditLimit(amountToEditable(b.limit));
                    }}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete budget"
                    onClick={() => setConfirmDelete(b.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {formatMoney(spent.expense, 'USD')} of {formatMoney(b.limit, 'USD')} {over && <span className="font-semibold text-red-600">over limit</span>}
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className={['h-full rounded-full', over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'].join(' ')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{over ? 'Exceeded by ' + formatMoney(spent.expense - b.limit, 'USD') : `Remaining ${formatMoney(b.limit - spent.expense, 'USD')}`}</p>
            </div>
          );
        })}
      </div>

      {editing && (
        <Modal title="Edit budget" onClose={() => setEditing(null)}>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Monthly limit</span>
            <input
              value={editLimit}
              onChange={(e) => setEditLimit(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleUpdate} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete budget" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600">Delete this budget? Transactions are not affected.</p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
            <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
