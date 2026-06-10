import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initAnalytics } from './utils/analytics';
import { syncThemeColor } from './theme/theme';
import { AppRouter } from './routes/AppRouter';

// When the page is restored from the browser back/forward cache (bfcache), the
// snapshot can predate a fresh deploy (old hashed assets / fonts), which shows
// up as the pre-redesign styling until a manual refresh. Forcing a reload on a
// persisted restore guarantees the current assets are used.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

initAnalytics();
syncThemeColor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
