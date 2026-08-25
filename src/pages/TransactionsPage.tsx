import { useMemo, useState } from 'react';
import { useData } from '../hooks/DataProvider';
import { resolveRange, type DatePreset } from '../domain/dates';
import { formatMoney } from '../domain/money';
import { addTransaction, updateTransaction, deleteTransaction } from '../data/repo';
import type { Transaction } from '../domain/types';
import { TransactionForm, type TransactionDraft } from '../components/TransactionForm';
import { Modal } from '../components/Modal';
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/Icons';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { FREE_TRANSACTION_LIMIT } from '../config';

export function TransactionsPage() {
  const { transactions, categories, accounts, settings, refresh } = useData();
  const entitlement = useEntitlement();
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);

  const { from, to } = resolveRange({
    preset,
    from: customFrom || undefined,
    to: customTo || undefined,
  });

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (!lower) return true;
      const cat = categories.find((c) => c.id === t.categoryId);
      return (
        t.note.toLowerCase().includes(lower) ||
        (cat?.name.toLowerCase().includes(lower) ?? false)
      );
    });
  }, [transactions, categories, query, from, to]);

  function openAdd() {
    if (!entitlement.isPremium && transactions.length >= FREE_TRANSACTION_LIMIT) {
      entitlement.gate('unlimited-transactions');
      return;
    }
    setShowAdd(true);
  }

  async function handleAdd(draft: TransactionDraft) {
    await addTransaction(draft);
    setShowAdd(false);
    await refresh();
  }

  function handleEdit(tx: Transaction) {
    setEditing(tx);
  }

  async function handleUpdate(draft: TransactionDraft) {
    if (!editing) return;
    await updateTransaction({ ...editing, ...draft });
    setEditing(null);
    await refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteTransaction(confirmDelete.id);
    setConfirmDelete(null);
    await refresh();
  }

  const currency = settings?.currency ?? 'USD';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
        <label className="flex-1 text-sm">
          <span className="font-medium text-slate-700">Search</span>
          <div className="relative mt-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes or categories"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm shadow-sm"
            />
          </div>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Period</span>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as DatePreset)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm md:w-48"
          >
            <option value="all">All time</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-year">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </label>
        {preset === 'custom' && (
          <div className="flex gap-3">
            <label className="text-sm">
              <span className="font-medium text-slate-700">From</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm shadow-sm"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">To</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm shadow-sm"
              />
            </label>
          </div>
        )}
        <p className="text-xs text-slate-400 md:ml-auto">
          {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            No transactions found. {preset !== 'all' ? 'Try widening the period above.' : 'Add your first one to get started.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const acc = accounts.find((a) => a.id === t.accountId);
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: cat?.color ?? '#94a3b8' }}
                      />
                      <span className="font-medium text-slate-800">{cat?.name ?? 'Uncategorized'}</span>
                      {acc && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{acc.name}</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                      <span>{t.date}</span>
                      {t.note && <span className="truncate">{t.note}</span>}
                    </div>
                  </div>
                  <span
                    className={
                      t.type === 'income'
                        ? 'w-28 text-right font-semibold text-emerald-600'
                        : 'w-28 text-right font-semibold text-rose-500'
                    }
                  >
                    {(t.type === 'income' ? '+' : '−') + formatMoney(t.amount, currency)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${t.note || 'transaction'}`}
                      onClick={() => handleEdit(t)}
                      className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${t.note || 'transaction'}`}
                      onClick={() => setConfirmDelete(t)}
                      className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showAdd && (
        <Modal title="Add transaction" onClose={() => setShowAdd(false)}>
          <TransactionForm
            categories={categories}
            accounts={accounts}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit transaction" onClose={() => setEditing(null)}>
          <TransactionForm
            initial={editing}
            categories={categories}
            accounts={accounts}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Save changes"
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete transaction" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600">
            Delete this {confirmDelete.type} of {formatMoney(confirmDelete.amount, currency)}
            {confirmDelete.note ? ` (${confirmDelete.note})` : ''}? This cannot be undone.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
