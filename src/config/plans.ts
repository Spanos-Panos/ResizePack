import type { OutputFormat, PresetId } from '../types/image';

export type Plan = 'free' | 'pro';

export interface PlanLimits {
  /** Max number of files allowed in a single ZIP batch. */
  maxFiles: number;
  /** Max size of any single input file, in bytes. */
  maxFileBytes: number;
  /** Max combined size of all input files in a batch, in bytes. */
  maxTotalBytes: number;
  /** Preset ids the plan may select (includes 'custom' when allowed). */
  presets: PresetId[];
  /** Output formats the plan may produce. */
  formats: OutputFormat[];
}

const MB = 1024 * 1024;

/**
 * Tiering locked 2026-06-02. Free is a genuine taster that walls fast for
 * volume users; Pro unlocks the full tool. Processing stays in-browser, so
 * "Pro limits" cost nothing to deliver — they exist to define the upgrade.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxFiles: 5,
    maxFileBytes: 10 * MB,
    maxTotalBytes: 50 * MB,
    presets: ['etsy-listing', 'web'],
    formats: ['jpeg'],
  },
  pro: {
    maxFiles: 500,
    maxFileBytes: 50 * MB,
    maxTotalBytes: 1024 * MB,
    presets: ['etsy-listing', 'web', 'shopify', 'amazon', 'instagram', 'custom'],
    formats: ['jpeg', 'webp'],
  },
};

export function planAllowsPreset(plan: Plan, presetId: PresetId): boolean {
  return PLAN_LIMITS[plan].presets.includes(presetId);
}

export function planAllowsFormat(plan: Plan, format: OutputFormat): boolean {
  return PLAN_LIMITS[plan].formats.includes(format);
}
