import type { PresetId } from '../../types/image';
import styles from './OptionsPanel.module.css';

interface OptionsPanelProps {
  selectedPreset: PresetId;
  customMaxWidth: number;
  customQuality: number;
  includeJpeg: boolean;
  includeWebp: boolean;
  stripExif: boolean;
  allowWebp: boolean;
  allowRename: boolean;
  customBaseName: string;
  customStartNumber: number;
  onCustomMaxWidthChange: (value: number) => void;
  onCustomQualityChange: (value: number) => void;
  onIncludeJpegChange: (value: boolean) => void;
  onIncludeWebpChange: (value: boolean) => void;
  onStripExifChange: (value: boolean) => void;
  onCustomBaseNameChange: (value: string) => void;
  onCustomStartNumberChange: (value: number) => void;
  onLockedFormatClick: () => void;
  onLockedRenameClick: () => void;
}

/** Mirror of the worker-side sanitizer so the preview matches the real output. */
function sanitizeBaseName(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function OptionsPanel({
  selectedPreset,
  customMaxWidth,
  customQuality,
  includeJpeg,
  includeWebp,
  stripExif,
  allowWebp,
  allowRename,
  customBaseName,
  customStartNumber,
  onCustomMaxWidthChange,
  onCustomQualityChange,
  onIncludeJpegChange,
  onIncludeWebpChange,
  onStripExifChange,
  onCustomBaseNameChange,
  onCustomStartNumberChange,
  onLockedFormatClick,
  onLockedRenameClick,
}: OptionsPanelProps) {
  const renameActive = allowRename && customBaseName.trim().length > 0;
  const renamePreviewBase = sanitizeBaseName(customBaseName.trim()) || 'image';
  const renamePreview = `${renamePreviewBase}-${String(customStartNumber).padStart(2, '0')}.jpg`;

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Processing options</h2>

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
        {allowWebp ? (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={includeWebp}
              onChange={(event) => onIncludeWebpChange(event.target.checked)}
            />
            WebP
          </label>
        ) : (
          <button type="button" className={styles.lockedOption} onClick={onLockedFormatClick}>
            WebP <span className={styles.lockTag}>🔒 Pro</span>
          </button>
        )}
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

      <div className={styles.group}>
        <p className={styles.label}>
          Rename files {allowRename ? '(optional)' : null}
        </p>
        {allowRename ? (
          <>
            <p className={styles.hint}>
              Give every image a clean, numbered name — great for tidy Etsy/Shopify listings. Leave
              blank to keep the default naming.
            </p>
            <input
              id="rename-base"
              className={styles.input}
              type="text"
              placeholder="e.g. summer-collection"
              value={customBaseName}
              maxLength={60}
              onChange={(event) => onCustomBaseNameChange(event.target.value)}
            />
            <label className={styles.label} htmlFor="rename-start">
              Start numbering at
            </label>
            <input
              id="rename-start"
              className={styles.input}
              type="number"
              min={0}
              max={99999}
              value={customStartNumber}
              onChange={(event) => onCustomStartNumberChange(Number(event.target.value))}
            />
            <span className={styles.value}>
              {renameActive ? `Output: ${renamePreview}, …` : 'Using default file names'}
            </span>
          </>
        ) : (
          <button type="button" className={styles.lockedOption} onClick={onLockedRenameClick}>
            Custom sequential names <span className={styles.lockTag}>🔒 Pro</span>
          </button>
        )}
      </div>
    </section>
  );
}
