import { PREMIUM_PRICE, UPGRADE_URL } from '../config';
import type { Feature } from './EntitlementContext';

const BENEFITS = [
  'Unlimited transactions and categories',
  'Budget tracking with alerts',
  'Recurring transactions',
  'Multiple accounts and wallets',
  'Advanced reports and charts',
  'Full export/import and backups',
];

export function UpgradeModal({
  feature,
  onClose,
}: {
  feature: Feature | null;
  onClose: () => void;
}) {
  if (feature === null) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="PocketLedger Premium"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            🔒 PREMIUM
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">Upgrade to Premium</h2>
        <p className="mt-1 text-sm text-slate-500">
          A one-time payment unlocks everything — no subscription, no account.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-emerald-600">✔</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <a
            href={UPGRADE_URL}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring"
          >
            Upgrade for ${PREMIUM_PRICE}
          </a>
          <p className="mt-2 text-center text-xs text-slate-400">
            Opens the configured checkout page in a new tab.
          </p>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
          onClick={onClose}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
