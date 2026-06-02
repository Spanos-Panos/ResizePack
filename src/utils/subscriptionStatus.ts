import type { EntitlementsResponse } from './api';

export type SubscriptionUiState = 'free' | 'pro_active' | 'pro_until' | 'free_ended';

export type SubscriptionAction = 'upgrade' | 'manage' | 'resume';

export interface SubscriptionDisplay {
  uiState: SubscriptionUiState;
  /** Short label for a status badge, e.g. "Pro" or "Pro until". */
  badge: string;
  /** One-line description of the current plan and any date. */
  detail: string;
  /** Formatted period-end / ended date, when relevant. */
  date: string | null;
  /** The primary call to action for this state. */
  primaryAction: SubscriptionAction;
  /** Optional secondary action (e.g. cancel while active). */
  secondaryAction: 'cancel' | null;
}

export function formatPlanDate(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleDateString();
}

/**
 * Maps the API entitlements into a small UI model so the Account page and the
 * tool banner show the same status everywhere. While entitlements are still
 * loading (null), we fall back to the Free state, which is the safe default.
 */
export function getSubscriptionDisplay(
  entitlements: EntitlementsResponse | null,
): SubscriptionDisplay {
  const date = formatPlanDate(entitlements?.currentPeriodEnd);

  if (entitlements?.plan === 'pro') {
    if (entitlements.cancelAtPeriodEnd) {
      return {
        uiState: 'pro_until',
        badge: 'Pro until',
        detail: date
          ? `Pro until ${date} — you keep every feature until then.`
          : 'Pro until the end of your current billing period.',
        date,
        primaryAction: 'resume',
        secondaryAction: null,
      };
    }

    return {
      uiState: 'pro_active',
      badge: 'Pro',
      detail: date
        ? `ResizePack Pro — renews on ${date}.`
        : 'ResizePack Pro — all presets, WebP & custom sizes.',
      date,
      primaryAction: 'manage',
      secondaryAction: 'cancel',
    };
  }

  if (entitlements?.status === 'canceled' && date) {
    return {
      uiState: 'free_ended',
      badge: 'Free',
      detail: `Free — your Pro plan ended on ${date}.`,
      date,
      primaryAction: 'upgrade',
      secondaryAction: null,
    };
  }

  return {
    uiState: 'free',
    badge: 'Free',
    detail: 'Free — 5 files per ZIP, JPEG, Etsy & Web presets.',
    date: null,
    primaryAction: 'upgrade',
    secondaryAction: null,
  };
}
