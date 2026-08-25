import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Plan } from '../config';
import { UpgradeModal } from './UpgradeModal';

export type Feature =
  | 'unlimited-transactions'
  | 'unlimited-categories'
  | 'multiple-accounts'
  | 'budgets'
  | 'recurring'
  | 'advanced-reports'
  | 'advanced-charts'
  | 'full-export-import';

const FEATURE_LABELS: Record<Feature, string> = {
  'unlimited-transactions': 'Unlimited transactions',
  'unlimited-categories': 'Unlimited categories',
  'multiple-accounts': 'Multiple accounts',
  budgets: 'Budgets',
  recurring: 'Recurring transactions',
  'advanced-reports': 'Advanced reports',
  'advanced-charts': 'Advanced charts',
  'full-export-import': 'Full export/import',
};

const ENTITLEMENT_KEY = 'pocketledger-entitlement';

interface StoredEntitlement {
  plan?: Plan;
}

function readPlan(): Plan {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    if (!raw) return 'free';
    const parsed = JSON.parse(raw) as StoredEntitlement;
    return parsed.plan === 'premium' ? 'premium' : 'free';
  } catch {
    return 'free';
  }
}

export interface Entitlement {
  plan: Plan;
  isPremium: boolean;
  canUse(feature: Feature): boolean;
  /**
   * Gate a premium action. Returns true when execution may continue,
   * and shows the upgrade modal otherwise.
   */
  gate(feature: Feature): boolean;
  /** Open the upgrade modal without gating a specific feature. */
  openUpgrade(feature?: Feature): void;
  setPlan(plan: Plan): void;
}

const Ctx = createContext<Entitlement | undefined>(undefined);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>(readPlan);
  const [pendingFeature, setPendingFeature] = useState<Feature | null>(null);

  useEffect(() => {
    localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify({ plan }));
  }, [plan]);

  const isPremium = plan === 'premium';
  const canUse = useCallback((_feature: Feature) => isPremium, [isPremium]);
  const gate = useCallback(
    (f: Feature) => {
      if (isPremium) return true;
      setPendingFeature(f);
      return false;
    },
    [isPremium],
  );
  const openUpgrade = useCallback((f?: Feature) => {
    setPendingFeature(f ?? 'advanced-reports');
  }, []);
  const setPlan = useCallback((p: Plan) => setPlanState(p), []);

  const value = useMemo<Entitlement>(
    () => ({ plan, isPremium, canUse, gate, openUpgrade, setPlan }),
    [plan, isPremium, canUse, gate, openUpgrade, setPlan],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <UpgradeModal
        feature={pendingFeature}
        onClose={() => setPendingFeature(null)}
      />
    </Ctx.Provider>
  );
}

export function useEntitlement(): Entitlement {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEntitlement outside EntitlementProvider');
  return ctx;
}

export { FEATURE_LABELS };
