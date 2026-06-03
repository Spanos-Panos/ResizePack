import { LegalLayout } from './LegalLayout';
import { SUPPORT_EMAIL } from '../../config/site';

export function RefundPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      lastUpdated="2 June 2026"
      note={
        <>
          <strong>Draft for review.</strong> Not legal advice. EU consumer law (including the 14-day
          right of withdrawal for digital services) may apply to your customers — confirm the exact
          wording and your obligations with a professional before charging real money.
        </>
      }
    >
      <h2>Subscription billing</h2>
      <p>
        ResizePack Pro is billed <strong>monthly in advance</strong> through Stripe. Your
        subscription renews automatically each period until you cancel.
      </p>

      <h2>Cancelling</h2>
      <p>
        You can cancel any time from <strong>Account → Manage billing</strong> (the Stripe customer
        portal). Cancellation takes effect at the <strong>end of the current billing period</strong>{' '}
        — you keep Pro access until then, and you are not charged again.
      </p>

      <h2>Deleting your account</h2>
      <p>
        Deleting your account (<strong>Account → Delete account</strong>) is different from
        cancelling: it cancels your subscription <strong>immediately</strong> and{' '}
        <strong>forfeits any remaining paid time</strong>, with no refund for the unused part of the
        period. If you want to use the time you have already paid for, cancel instead of deleting,
        and delete after the period ends.
      </p>

      <h2>Refunds</h2>
      <p>
        Because cancellation lets you keep access for the period you already paid for, we generally
        do <strong>not</strong> provide partial refunds for unused time.
      </p>
      <p>
        If you were charged in error, experienced a genuine problem, or have a statutory right to a
        refund (for example under EU consumer rules), contact us and we will review your case
        promptly and in good faith.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the address on your
        account, with the date of the charge.
      </p>
    </LegalLayout>
  );
}
