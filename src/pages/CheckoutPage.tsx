import {
  PREMIUM_PRICE,
  PREMIUM_CURRENCY,
  TEST_MODE_ENABLED,
  UPGRADE_URL,
} from '../config';
import { useEntitlement } from '../entitlement/EntitlementContext';
import { useNavigate } from 'react-router-dom';

/**
 * Internal development test checkout. This page exists so developers
 * can exercise the Free ↔ Premium entitlement flows end-to-end without
 * a payment provider. It is deliberately unavailable in production
 * builds (TEST_MODE_ENABLED === false), and it never requests, stores,
 * or claims any payment details.
 */
export function CheckoutPage() {
  const { plan, setPlan } = useEntitlement();
  const navigate = useNavigate();

  if (!TEST_MODE_ENABLED) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Checkout unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">
          The internal test checkout is disabled in production builds.
          {UPGRADE_URL
            ? ' Use the configured checkout URL.'
            : ' No checkout URL has been configured for this build.'}
        </p>
      </div>
    );
  }

  function choose(next: 'free' | 'premium') {
    setPlan(next);
    navigate(-1);
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          ⚠️ Development test checkout
        </p>
        <p className="mt-1 text-sm text-amber-800">
          This page never processes real money, requests card details, or
          stores credentials. It only toggles the local entitlement for
          testing. In production you point <code>VITE_UPGRADE_URL</code> at
          your real checkout provider instead.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">
          PocketLedger Premium — {PREMIUM_PRICE} {PREMIUM_CURRENCY} (one-time)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Current entitlement: <strong className="capitalize">{plan}</strong>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choose('premium')}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Simulate upgrade to Premium
          </button>
          <button
            type="button"
            onClick={() => choose('free')}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Stay on Free
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Test mode is disabled in production builds (import.meta.env.PROD).
        </p>
      </section>
    </div>
  );
}
