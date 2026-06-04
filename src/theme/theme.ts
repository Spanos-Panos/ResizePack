// Light/dark theme control. The initial theme is set before first paint by the
// inline script in index.html (which writes data-theme on <html>); this module
// is the runtime API the ThemeToggle uses to read and flip it.

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function getTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore storage failures (e.g. private mode) */
  }
  // Keep the mobile browser UI (address bar) colour in sync.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#18140f' : '#f1e9da');
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
