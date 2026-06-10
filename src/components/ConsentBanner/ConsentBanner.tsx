import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, isAnalyticsConfigured, setConsent, type Consent } from '../../utils/analytics';
import styles from './ConsentBanner.module.css';

/**
 * GDPR cookie-consent banner. Shows only when analytics is configured and the
 * user hasn't decided yet. GA4 loads (sets cookies) only after "Accept" — see
 * analytics.ts. The choice is remembered, so the banner doesn't reappear.
 */
export function ConsentBanner() {
  const [decided, setDecided] = useState(() => getConsent() !== null);

  if (!isAnalyticsConfigured() || decided) {
    return null;
  }

  function choose(consent: Consent) {
    setConsent(consent);
    setDecided(true);
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent" aria-live="polite">
      <p className={styles.text}>
        We use Google Analytics cookies to see how the tool is used. Your images are always
        processed in your browser and never uploaded. <Link to="/privacy">Privacy Policy</Link>.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={() => choose('denied')}>
          Decline
        </button>
        <button type="button" className={styles.accept} onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
