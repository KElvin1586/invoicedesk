import { useEntitlement, type Feature } from '../../entitlement/EntitlementContext';

/** A little 🔒 PREMIUM pill shown next to premium-gated items. */
export function PremiumBadge({
  feature,
  compact = false,
  tiny = false,
}: {
  feature: Feature;
  compact?: boolean;
  tiny?: boolean;
}) {
  const { isPremium } = useEntitlement();
  if (isPremium) return null;
  if (compact) {
    return (
      <span
        data-feature={feature}
        className={['inline-flex items-center gap-1 rounded-full bg-amber-100 font-semibold text-amber-800', tiny ? 'px-1 py-px text-[8px]' : 'ml-auto px-1.5 py-0.5 text-[10px]'].join(' ')}
      >
        🔒 PREMIUM
      </span>
    );
  }
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      🔒 PREMIUM
    </span>
  );
}
