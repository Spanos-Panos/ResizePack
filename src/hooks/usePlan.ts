import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getEntitlements } from '../utils/api';
import { PLAN_LIMITS, type Plan, type PlanLimits } from '../config/plans';

export interface PlanState {
  plan: Plan;
  limits: PlanLimits;
  /** True while we are resolving entitlements for a signed-in user. */
  isLoading: boolean;
}

/**
 * Resolves the current user's plan. Anonymous visitors and signed-in users
 * whose entitlements fail to load are treated as Free (safe default), so the
 * tool always works without an account.
 */
export function usePlan(): PlanState {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [plan, setPlan] = useState<Plan>('free');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setPlan('free');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getEntitlements(accessToken)
      .then((entitlements) => {
        if (!cancelled) {
          setPlan(entitlements.plan === 'pro' ? 'pro' : 'free');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlan('free');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return { plan, limits: PLAN_LIMITS[plan], isLoading };
}
