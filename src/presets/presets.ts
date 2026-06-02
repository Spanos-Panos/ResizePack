import type { PresetConfig, PresetId } from '../types/image';

export const PRESET_STORAGE_KEY = 'resizepack.preset';

export const PRESETS: Record<Exclude<PresetId, 'custom'>, PresetConfig> = {
  'etsy-listing': {
    id: 'etsy-listing',
    label: 'Etsy listing',
    maxLongestSidePx: 2000,
    defaultFormat: 'jpeg',
    defaultQuality: 82,
    targetMaxBytes: 2 * 1024 * 1024,
    description:
      'Optimized for common Etsy listing photo guidelines. Not affiliated with Etsy, Inc.',
  },
  web: {
    id: 'web',
    label: 'Web',
    maxLongestSidePx: 1920,
    defaultFormat: 'jpeg',
    defaultQuality: 80,
    description: 'Balanced dimensions and quality for websites and blogs.',
  },
};

export const PRESET_ORDER: PresetId[] = ['etsy-listing', 'web', 'custom'];
