import type { PresetId } from '../../types/image';
import styles from './OptionsPanel.module.css';

interface OptionsPanelProps {
  selectedPreset: PresetId;
  customMaxWidth: number;
  customQuality: number;
  includeJpeg: boolean;
  includeWebp: boolean;
  stripExif: boolean;
  onCustomMaxWidthChange: (value: number) => void;
  onCustomQualityChange: (value: number) => void;
  onIncludeJpegChange: (value: boolean) => void;
  onIncludeWebpChange: (value: boolean) => void;
  onStripExifChange: (value: boolean) => void;
}

export function OptionsPanel({
  selectedPreset,
  customMaxWidth,
  customQuality,
  includeJpeg,
  includeWebp,
  stripExif,
  onCustomMaxWidthChange,
  onCustomQualityChange,
  onIncludeJpegChange,
  onIncludeWebpChange,
  onStripExifChange,
}: OptionsPanelProps) {
  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>Processing options</h3>

      {selectedPreset === 'custom' ? (
        <div className={styles.group}>
          <label className={styles.label} htmlFor="custom-max-width">
            Max width (400 - 4000 px)
          </label>
          <input
            id="custom-max-width"
            className={styles.input}
            type="number"
            min={400}
            max={4000}
            value={customMaxWidth}
            onChange={(event) => onCustomMaxWidthChange(Number(event.target.value))}
          />

          <label className={styles.label} htmlFor="custom-quality">
            Quality (50 - 95)
          </label>
          <input
            id="custom-quality"
            type="range"
            min={50}
            max={95}
            value={customQuality}
            onChange={(event) => onCustomQualityChange(Number(event.target.value))}
          />
          <span className={styles.value}>{customQuality}</span>
        </div>
      ) : null}

      <div className={styles.group}>
        <p className={styles.label}>Output formats (select at least one)</p>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={includeJpeg}
            onChange={(event) => onIncludeJpegChange(event.target.checked)}
          />
          JPEG
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={includeWebp}
            onChange={(event) => onIncludeWebpChange(event.target.checked)}
          />
          WebP
        </label>
      </div>

      <div className={styles.group}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={stripExif}
            onChange={(event) => onStripExifChange(event.target.checked)}
          />
          Strip EXIF metadata
        </label>
      </div>
    </section>
  );
}
