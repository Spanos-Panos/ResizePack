import styles from './FileList.module.css';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileList({ files, onRemove, onClearAll }: FileListProps) {
  if (files.length === 0) {
    return <p className={styles.empty}>No files added yet.</p>;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Files ({files.length})</h3>
        <button type="button" className={styles.clearButton} onClick={onClearAll}>
          Clear all
        </button>
      </div>
      <p className={styles.total}>Total input size: {formatBytes(totalBytes)}</p>
      <ul className={styles.list}>
        {files.map((file, index) => (
          <li key={`${file.name}-${file.lastModified}-${index}`} className={styles.row}>
            <span className={styles.name}>{file.name}</span>
            <span className={styles.meta}>{formatBytes(file.size)}</span>
            <button type="button" className={styles.removeButton} onClick={() => onRemove(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
