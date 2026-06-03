import { LegalLayout } from './LegalLayout';
import { SUPPORT_EMAIL } from '../../config/site';

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="2 June 2026"
      note={
        <>
          <strong>Draft for review.</strong> This is a starting template, not legal advice. Have it
          reviewed by a qualified professional (and confirm the Greece/EU specifics with your
          accountant or lawyer) before relying on it for paid customers.
        </>
      }
    >
      <h2>1. Acceptance</h2>
      <p>
        By using ResizePack (the “Service”) you agree to these Terms. If you do not agree, do not use
        the Service.
      </p>

      <h2>2. What the Service does</h2>
      <p>
        ResizePack is a bulk image resize and compression tool. Images are processed{' '}
        <strong>in your browser</strong> and downloaded as a ZIP; we do not upload or store your
        images on our servers.
      </p>

      <h2>3. Accounts</h2>
      <p>
        Some features require an account (email/password or Google/GitHub/Facebook sign-in via our
        auth provider). You are responsible for keeping your credentials secure and for activity
        under your account. You must provide accurate information and be old enough to form a binding
        contract in your country.
      </p>

      <h2>4. Free and Pro plans</h2>
      <p>
        The Service offers a free tier and a paid <strong>Pro</strong> subscription. Plan limits and
        features may change over time. Pro is billed as described in the Refund &amp; Cancellation
        Policy.
      </p>

      <h2>5. Billing</h2>
      <p>
        Payments are processed by <strong>Stripe</strong>. By subscribing you authorize recurring
        charges to your payment method until you cancel. We do not see or store your full card
        details. Prices are shown at checkout and may change with notice for future billing periods.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service to process content you do not have the rights to.</li>
        <li>
          Attempt to disrupt, overload, reverse-engineer, or gain unauthorized access to the Service
          or its infrastructure.
        </li>
        <li>Use the Service for anything unlawful.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        You keep all rights to the images you process. The ResizePack name, code, and design remain
        ours.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available”, without warranties of any kind to the
        extent permitted by law. We do not guarantee uninterrupted or error-free operation, or any
        specific output quality or file size.
      </p>
      <p>
        ResizePack is <strong>not affiliated with</strong> Etsy, Inc., Shopify Inc., Amazon.com,
        Inc., or Instagram/Meta. Platform names are used only to describe preset use cases.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ResizePack and its operator are not liable for
        indirect, incidental, or consequential damages, or for any loss of data or images. Where
        liability cannot be excluded, it is limited to the amount you paid for the Service in the
        prior 12 months.
      </p>

      <h2>10. Changes and termination</h2>
      <p>
        We may modify or discontinue the Service or these Terms. Material changes will be reflected
        by the “Last updated” date. We may suspend accounts that violate these Terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of Greece, without regard to conflict-of-law rules.{' '}
        <em>(Confirm jurisdiction and consumer-law obligations with a professional.)</em>
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}
