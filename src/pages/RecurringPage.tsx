import { useState } from 'react';
import { useData } from '../hooks/DataProvider';
import { todayISO } from '../domain/dates';
import { formatMoney, parseAmount } from '../domain/money';
import {
  addRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
  runRecurring,
} from '../data/repo';
import { PremiumGate } from '../components/premium/PremiumGate';
import { useEntitlement } from '../entitlement/EntitlementContext';
import type { Frequency, RecurringRule, TxType } from '../domain/types';
import { Modal } from '../components/Modal';
import { TrashIcon } from '../components/Icons';

export function RecurringPage() {
  const { recurring, categories, accounts, refresh } = useData();
  const entitlement = useEntitlement();

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RecurringRule | null>(null);

  if (!entitlement.isPremium) {
    return (
      <PremiumGate
        feature="recurring"
        title="Recurring transactions"
        description="Automatically book repeated income and expenses — rent, salary, subscriptions — on a daily, weekly, monthly or yearly rhythm."
      />
    );
  }

  async function handleAdd() {
    const parsed = parseAmount(amount);
    const targetCategory = categoryId || categories[0]?.id;
    const targetAccount = accountId || accounts[0]?.id;
    if (!parsed.ok || parsed.cents === undefined) {
      setError(parsed.error ?? 'Invalid amount.');
      return;
    }
    if (!targetCategory || !targetAccount) {
      setError('Pick a category and account.');
      return;
    }
    await addRecurringRule({
      type,
      amount: parsed.cents,
      categoryId: targetCategory,
      accountId: targetAccount,
      note: note.trim(),
      frequency,
      startDate,
      nextDate: startDate,
      active: true,
    });
    setAmount('');
    setNote('');
    setError(null);
    await refresh();
  }

  async function toggle(rule: RecurringRule) {
    await updateRecurringRule({ ...rule, active: !rule.active });
    await refresh();
  }

  async function handleRun() {
    const created = await runRecurring(todayISO());
    setStatus(created === 0 ? 'Nothing due yet today.' : `Created ${created} transaction${created === 1 ? '' : 's'}.`);
    await refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await deleteRecurringRule(confirmDelete.id);
    setConfirmDelete(null);
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring</h1>
          <p className="text-sm text-slate-500">Automatic repeated income and expenses.</p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Run due now
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-6">
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as TxType)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Amount</span>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" />
          </label>
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Category</span>
            <select value={categoryId || categories[0]?.id} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Frequency</span>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Next date</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm" />
          </label>
          <label className="text-sm md:col-span-1">
            <span className="font-medium text-slate-700">Account</span>
            <select value={accountId || accounts[0]?.id} onChange={(e) => setAccountId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm">
          <span className="font-medium text-slate-700">Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Rent" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
        {status && <p className="mt-2 text-sm text-emerald-700">{status}</p>}
        <button type="button" onClick={handleAdd} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Add rule
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {recurring.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">No recurring rules yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recurring.map((r) => {
              const category = categories.find((c) => c.id === r.categoryId);
              const account = accounts.find((a) => a.id === r.accountId);
              return (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: category?.color ?? '#94a3b8' }} />
                      <span className="font-medium text-slate-800">{category?.name ?? 'Unknown'}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">{r.frequency}</span>
                      {!r.active && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">paused</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Next {r.nextDate}
                      {account ? ` · ${account.name}` : ''}
                      {r.note ? ` · ${r.note}` : ''}
                    </p>
                  </div>
                  <span className={r.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                    {(r.type === 'income' ? '+' : '−') + formatMoney(r.amount, 'USD')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {r.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(r)}
                    aria-label="Delete rule"
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirmDelete && (
        <Modal title="Delete recurring rule" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600">
            Delete “{confirmDelete.note || 'rule'}”? Previously booked transactions remain.
          </p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Delete</button>
            <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
