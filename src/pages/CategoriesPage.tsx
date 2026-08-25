import { useState } from 'react';
import { useData } from '../hooks/DataProvider';
import { PRESET_COLORS } from '../data/seed';
import { addCategory, updateCategory, deleteCategory } from '../data/repo';
import type { Category, CategoryKind } from '../domain/types';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { FREE_CATEGORY_LIMIT } from '../config';
import { validateText } from '../domain/validators';
import { Modal } from '../components/Modal';
import { PencilIcon, TrashIcon } from '../components/Icons';

export function CategoriesPage() {
  const { categories, transactions, refresh } = useData();
  const entitlement = useEntitlement();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  async function handleAdd() {
    if (!entitlement.isPremium && categories.length >= FREE_CATEGORY_LIMIT) {
      entitlement.gate('unlimited-categories');
      return;
    }
    const problem = validateText(name, 'Category name');
    if (problem) {
      setError(problem);
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }
    await addCategory({ name: name.trim(), kind, color, archived: false });
    setName('');
    setError(null);
    await refresh();
  }

  async function handleUpdate() {
    if (!editing) return;
    const problem = validateText(editing.name, 'Category name');
    if (problem) {
      setError(problem);
      return;
    }
    await updateCategory(editing);
    setEditing(null);
    setError(null);
    await refresh();
  }

  function requestRemove(cat: Category) {
    const usage = transactions.filter((t) => t.categoryId === cat.id);
    if (usage.length > 0) {
      setConfirmDelete({ ...cat, name: `${cat.name} (${usage.length} transactions)` });
    } else {
      setConfirmDelete(cat);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    const usage = transactions.filter((t) => t.categoryId === confirmDelete.id);
    if (usage.length > 0) {
      // In-use categories are archived so history stays intact.
      const kept = categories.find((c) => c.id === confirmDelete.id);
      if (kept) {
        await updateCategory({ ...kept, archived: true });
      }
    } else {
      await deleteCategory(confirmDelete.id);
    }
    setConfirmDelete(null);
    await refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">
          {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} · active and archived
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Add category</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as CategoryKind)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </label>
          <div className="flex gap-1.5 pt-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className={[
                  'h-7 w-7 rounded-full border-2',
                  color === c ? 'border-slate-900' : 'border-transparent',
                ].join(' ')}
                style={{ background: c }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
              <span className="font-medium text-slate-800">{c.name}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                {c.kind}
              </span>
              {c.archived && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">archived</span>
              )}
              <div className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(c);
                    setColor(c.color);
                    setKind(c.kind);
                    setName(c.name);
                  }}
                  aria-label={`Edit ${c.name}`}
                  className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => requestRemove(c)}
                  aria-label={`Delete ${c.name}`}
                  className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="font-medium text-slate-700">Type</span>
            <select
              value={editing.kind}
              onChange={(e) => setEditing({ ...editing, kind: e.target.value as CategoryKind })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </label>
          <div className="mt-3 flex gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditing({ ...editing, color: c })}
                aria-label={`Color ${c}`}
                className={[
                  'h-6 w-6 rounded-full border-2',
                  editing.color === c ? 'border-slate-900' : 'border-transparent',
                ].join(' ')}
                style={{ background: c }}
              />
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleUpdate}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Remove category" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600">
            “{confirmDelete.name}”{confirmDelete.name.includes('(') ? ' is archived instead of deleted, so existing transactions keep their category.' : ' will be permanently deleted.'}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              {confirmDelete.name.includes('(') ? 'Archive' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
