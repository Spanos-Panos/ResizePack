import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { getEntitlements, type EntitlementsResponse } from '../utils/api';
import { PLAN_LIMITS, type Plan, type PlanLimits } from '../config/plans';
import { getSubscriptionDisplay, type SubscriptionDisplay } from '../utils/subscriptionStatus';

export interface PlanState {
  plan: Plan;
  limits: PlanLimits;
  /** True while we are resolving entitlements for a signed-in user. */
  isLoading: boolean;
  /** Raw entitlements from the API, or null for anonymous/unresolved users. */
  entitlements: EntitlementsResponse | null;
  /** Shared status model used by the Account page and tool banner. */
  display: SubscriptionDisplay;
}

/**
 * Resolves the current user's plan. Anonymous visitors and signed-in users
 * whose entitlements fail to load are treated as Free (safe default), so the
 * tool always works without an account.
 */
export function usePlan(): PlanState {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setEntitlements(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getEntitlements(accessToken)
      .then((data) => {
        if (!cancelled) {
          setEntitlements(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntitlements(null);
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

  const plan: Plan = entitlements?.plan === 'pro' ? 'pro' : 'free';

  return {
    plan,
    limits: PLAN_LIMITS[plan],
    isLoading,
    entitlements,
    display: getSubscriptionDisplay(entitlements),
  };
}
