import { useEntitlement, type Feature } from '../../entitlement/EntitlementContext';

/** Full-page placeholder shown to free users behind premium-gated screens. */
export function PremiumGate({
  feature,
  title,
  description,
}: {
  feature: Feature;
  title: string;
  description: string;
}) {
  const { gate } = useEntitlement();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-8 text-center">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        🔒 PREMIUM
      </span>
      <h1 className="mt-3 text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <button
        type="button"
        onClick={() => gate(feature)}
        className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Upgrade to unlock
      </button>
    </div>
  );
}
