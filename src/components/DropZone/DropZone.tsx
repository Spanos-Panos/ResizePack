import { useRef, useState, type DragEvent } from 'react';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles: number;
  maxFileMb: number;
}

export function DropZone({ onFilesSelected, disabled = false, maxFiles, maxFileMb }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }
    onFilesSelected(Array.from(fileList));
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.zoneActive : ''} ${disabled ? styles.zoneDisabled : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label="Drop images here"
    >
      <p className={styles.title}>Drop images here</p>
      <p className={styles.subtitle}>
        JPEG, PNG, WebP | Max {maxFiles} files | Max {maxFileMb} MB each
      </p>
      <button
        type="button"
        className={styles.browseButton}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </button>
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = '';
        }}
      />
    </div>
  );
}
