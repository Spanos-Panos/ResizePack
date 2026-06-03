import { LegalLayout } from './LegalLayout';
import { SUPPORT_EMAIL } from '../../config/site';

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="2 June 2026"
      note={
        <>
          <strong>Draft for review.</strong> Not legal advice. Confirm wording and your obligations
          (GDPR / Greece) with a professional before paid launch.
        </>
      }
    >
      <h2>Your images stay on your device</h2>
      <p>
        ResizePack processes your images <strong>entirely in your browser</strong>. Your images are{' '}
        <strong>not uploaded</strong> to our servers, and processed files are downloaded directly to
        your device as a ZIP. We never see, store, or transmit your image content.
      </p>

      <h2>Accounts</h2>
      <p>
        Creating an account is optional and only needed for the Pro plan. If you sign up, our
        authentication provider (<strong>Supabase</strong>) stores your email address and an account
        identifier. If you use Google, GitHub, or Facebook sign-in, we receive your email and basic
        profile from that provider — not your password.
      </p>

      <h2>Payments</h2>
      <p>
        Pro subscriptions are handled by <strong>Stripe</strong>. Stripe processes your payment and
        card details — <strong>we never receive or store your full card information</strong>. We keep
        only your subscription status, billing period, and a Stripe customer/subscription identifier
        so we can show your plan and let you manage billing.
      </p>

      <h2>Analytics</h2>
      <p>
        If analytics are enabled, they are limited to basic, privacy-conscious traffic metrics (for
        example page views and referrers) via Google Analytics. No image data is ever collected. If
        analytics are not configured, no analytics scripts load.
      </p>

      <h2>Service providers (data processors)</h2>
      <ul>
        <li>
          <strong>Vercel</strong> — hosts the website.
        </li>
        <li>
          <strong>Render</strong> — hosts the billing API.
        </li>
        <li>
          <strong>Supabase</strong> — authentication and account/subscription database.
        </li>
        <li>
          <strong>Stripe</strong> — payment processing.
        </li>
        <li>
          <strong>Google</strong> — optional analytics and (if used) Google sign-in.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can request access to or deletion of your account data by contacting{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Deleting your account removes your
        profile and subscription records from our database.
      </p>

      <h2>Disclaimer</h2>
      <p>
        ResizePack is not affiliated with Etsy, Inc., Shopify Inc., Amazon.com, Inc., or
        Instagram/Meta.
      </p>
    </LegalLayout>
  );
}
