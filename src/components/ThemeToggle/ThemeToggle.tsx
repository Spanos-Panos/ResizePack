import { useState } from 'react';
import { getTheme, toggleTheme, type Theme } from '../../theme/theme';
import styles from './ThemeToggle.module.css';

/**
 * Accessible light/dark toggle. Reads the theme already applied to <html> by the
 * no-flash inline script, and flips it (persisting the choice) on click. Works
 * app-wide because it only sets the data-theme attribute the CSS keys off.
 */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setThemeState(toggleTheme())}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  );
}
