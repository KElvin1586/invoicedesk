import { useState } from 'react';
import type { Account, Category, Transaction, TxType } from '../domain/types';
import { parseAmount, amountToEditable, MAX_AMOUNT_CENTS } from '../domain/money';
import { validateTxInput } from '../domain/validators';
import { todayISO } from '../domain/dates';

export interface TransactionDraft {
  type: TxType;
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  note: string;
}

export function TransactionForm({
  initial,
  categories,
  accounts,
  onSubmit,
  onCancel,
  submitLabel = 'Save transaction',
}: {
  initial?: Transaction | null;
  categories: Category[];
  accounts: Account[];
  onSubmit: (draft: TransactionDraft) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const usable = categories.filter((c) => !c.archived);
  const initialType: TxType = initial?.type ?? 'expense';
  const initialRelevant = usable.filter((c) => c.kind === 'both' || c.kind === initialType);
  const [type, setType] = useState<TxType>(initialType);
  const [amount, setAmount] = useState(initial ? amountToEditable(initial.amount) : '');
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? initialRelevant[0]?.id ?? '',
  );
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? '');
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? '');
  const [error, setError] = useState<string | null>(null);

  const relevant = usable.filter((c) => c.kind === 'both' || c.kind === type);

  function handleSubmit() {
    const parsed = parseAmount(amount);
    if (!parsed.ok || parsed.cents === undefined) {
      setError(parsed.error ?? 'Invalid amount.');
      return;
    }
    const draft: TransactionDraft = {
      type,
      amount: parsed.cents,
      categoryId,
      accountId,
      date,
      note: note.trim(),
    };
    const result = validateTxInput(draft);
    if (!result.ok) {
      setError(result.errors[0]);
      return;
    }
    if (draft.amount > MAX_AMOUNT_CENTS) {
      setError('Amount is too large.');
      return;
    }
    onSubmit(draft);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={[
            'rounded-lg border py-2 text-sm font-medium',
            type === 'expense'
              ? 'border-rose-600 bg-rose-50 text-rose-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          ].join(' ')}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={[
            'rounded-lg border py-2 text-sm font-medium',
            type === 'income'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          ].join(' ')}
        >
          Income
        </button>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Amount</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-lg shadow-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Category</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none"
        >
          {relevant.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Account</span>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Note (optional)</span>
        <input
          type="text"
          maxLength={200}
          placeholder="e.g. Weekly groceries"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
