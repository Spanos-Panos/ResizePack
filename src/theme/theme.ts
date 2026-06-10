// Light/dark theme control. The initial theme is set before first paint by the
// inline script in index.html (which writes data-theme on <html>); this module
// is the runtime API the ThemeToggle uses to read and flip it.

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEME_COLOR = { light: '#dfe5f2', dark: '#1d1f27' } as const;

export function getTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'dark' ? 'dark' : 'light';
}

/** Keep the mobile browser UI (address bar) colour in sync with the theme. */
function applyThemeColor(theme: Theme): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLOR[theme]);
  }
}

/**
 * Sync the address-bar colour to the theme the inline <head> script already
 * applied. Called once at startup so light-mode users don't get a stale dark
 * bar before any toggle.
 */
export function syncThemeColor(): void {
  applyThemeColor(getTheme());
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore storage failures (e.g. private mode) */
  }
  applyThemeColor(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
