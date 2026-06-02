import type { PresetId } from '../../types/image';
import styles from './PresetSelector.module.css';

interface PresetSelectorProps {
  selectedPreset: PresetId;
  onChange: (presetId: PresetId) => void;
}

const PRESET_ITEMS: Array<{ id: PresetId; label: string }> = [
  { id: 'etsy-listing', label: 'Etsy listing' },
  { id: 'web', label: 'Web' },
  { id: 'custom', label: 'Custom' },
];

export function PresetSelector({ selectedPreset, onChange }: PresetSelectorProps) {
  return (
    <div className={styles.container} role="tablist" aria-label="Resize presets">
      {PRESET_ITEMS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          role="tab"
          aria-selected={selectedPreset === preset.id}
          className={`${styles.item} ${selectedPreset === preset.id ? styles.itemActive : ''}`}
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
