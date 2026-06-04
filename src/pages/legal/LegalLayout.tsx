import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';
import styles from './LegalLayout.module.css';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  note?: ReactNode;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, note, children }: LegalLayoutProps) {
  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <div className={styles.themeCorner}>
          <ThemeToggle />
        </div>
        <p className={styles.eyebrow}>ResizePack</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.meta}>
          <strong>Last updated:</strong> {lastUpdated}
        </p>

        {note ? <div className={styles.note}>{note}</div> : null}

        <div className={styles.prose}>{children}</div>

        <footer className={styles.footer}>
          <Link to="/privacy">Privacy Policy</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms">Terms of Service</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/refund">Refund &amp; Cancellation</Link>
        </footer>

        <Link className={styles.back} to="/">
          ← Back to ResizePack
        </Link>
      </article>
    </main>
  );
}
