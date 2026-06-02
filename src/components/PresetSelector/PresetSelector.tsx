import type { PresetId } from '../../types/image';
import { PRESET_ORDER } from '../../presets/presets';
import styles from './PresetSelector.module.css';

interface PresetSelectorProps {
  selectedPreset: PresetId;
  allowedPresets: PresetId[];
  onChange: (presetId: PresetId) => void;
  onLockedClick: () => void;
}

const PRESET_LABELS: Record<PresetId, string> = {
  'etsy-listing': 'Etsy listing',
  web: 'Web',
  shopify: 'Shopify',
  amazon: 'Amazon',
  instagram: 'Instagram',
  custom: 'Custom',
};

export function PresetSelector({
  selectedPreset,
  allowedPresets,
  onChange,
  onLockedClick,
}: PresetSelectorProps) {
  return (
    <div className={styles.container} role="tablist" aria-label="Resize presets">
      {PRESET_ORDER.map((presetId) => {
        const isLocked = !allowedPresets.includes(presetId);
        const isActive = selectedPreset === presetId;
        return (
          <button
            key={presetId}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.item} ${isActive ? styles.itemActive : ''} ${
              isLocked ? styles.itemLocked : ''
            }`}
            onClick={() => (isLocked ? onLockedClick() : onChange(presetId))}
          >
            {PRESET_LABELS[presetId]}
            {isLocked ? <span className={styles.lock} aria-label="Pro feature"> 🔒 Pro</span> : null}
          </button>
        );
      })}
    </div>
  );
}
