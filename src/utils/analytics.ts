declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __resizepackGaInitialized?: boolean;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CONSENT_KEY = 'analytics-consent';

export type Consent = 'granted' | 'denied';

/** True only when a GA measurement id is configured (so the banner/tracking are relevant). */
export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

/** The stored consent decision, or null if the user hasn't chosen yet. */
export function getConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Record the consent choice; load GA immediately if granted. */
export function setConsent(consent: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    /* ignore storage failures (e.g. private mode) */
  }
  if (consent === 'granted') {
    loadGa();
  }
}

// Injects the GA4 script + config. Only ever called after consent is granted,
// so no cookies are set before the user agrees (GDPR/ePrivacy).
function loadGa(): void {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || window.__resizepackGaInitialized) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: true });
  window.__resizepackGaInitialized = true;
}

/** Called at startup: loads GA only if the user previously granted consent. */
export function initAnalytics(): void {
  if (getConsent() === 'granted') {
    loadGa();
  }
}

/** Fire a custom event. No-op unless GA is loaded (i.e. consent was granted). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }
  window.gtag('event', name, params ?? {});
}
