import type { BatchResult, FileProgress } from '../../types/image';
import styles from './ProgressSummary.module.css';

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ProgressSummaryProps {
  progress: FileProgress[];
  result: BatchResult | null;
  isProcessing: boolean;
}

export function ProgressSummary({ progress, result, isProcessing }: ProgressSummaryProps) {
  if (!isProcessing && progress.length === 0 && !result) {
    return null;
  }

  const totalFiles = progress.length;
  const successCount = progress.filter((item) => item.status === 'success').length;
  const failedCount = progress.filter((item) => item.status === 'failed').length;
  const processingCount = progress.filter((item) => item.status === 'processing').length;
  const queuedCount = progress.filter((item) => item.status === 'queued').length;
  const completedCount = successCount + failedCount;
  const completionPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;
  const totalSavedBytes = result ? result.originalTotalBytes - result.outputTotalBytes : 0;
  const savedPercent =
    result && result.originalTotalBytes > 0
      ? Math.round((totalSavedBytes / result.originalTotalBytes) * 100)
      : 0;

  return (
    <section className={styles.wrapper} aria-live="polite">
      <h2 className={styles.title}>Progress</h2>
      {progress.length > 0 ? (
        <div className={styles.overview}>
          <div className={styles.metrics}>
            <span>{completionPercent}% complete</span>
            <span>
              {completedCount}/{totalFiles} files
            </span>
          </div>
          <div className={styles.progressBarTrack} aria-hidden="true">
            <div className={styles.progressBarFill} style={{ width: `${completionPercent}%` }} />
          </div>
          <p className={styles.breakdown}>
            Processing: {processingCount} | Queued: {queuedCount} | Success: {successCount} | Failed:{' '}
            {failedCount}
          </p>
        </div>
      ) : null}

      {progress.length > 0 ? (
        <ul className={styles.list}>
          {progress.map((item, index) => (
            <li key={`${item.fileName}-${index}`} className={styles.row}>
              <span className={styles.name}>{item.fileName}</span>
              <span
                className={`${styles.status} ${
                  item.status === 'success'
                    ? styles.statusSuccess
                    : item.status === 'failed'
                      ? styles.statusFailed
                      : styles.statusNeutral
                }`}
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {result ? (
        <div className={styles.summary}>
          <p>
            Successful outputs: <strong>{result.outputs.length}</strong>
          </p>
          <p>
            Failed files: <strong>{result.failures.length}</strong>
          </p>
          <p>
            Total size before: <strong>{formatBytes(result.originalTotalBytes)}</strong> | after:{' '}
            <strong>{formatBytes(result.outputTotalBytes)}</strong>
          </p>
          <p>
            Estimated saved space: <strong>{formatBytes(Math.max(totalSavedBytes, 0))}</strong> (
            <strong>{Math.max(savedPercent, 0)}%</strong>)
          </p>
          {result.failures.length > 0 ? (
            <ul className={styles.failures}>
              {result.failures.map((failure) => (
                <li key={`${failure.fileName}-${failure.reason}`}>
                  {failure.fileName}: {failure.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
