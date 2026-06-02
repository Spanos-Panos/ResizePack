import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../auth/useAuth';
import {
  createCheckoutSession,
  createPortalSession,
  getEntitlements,
  type EntitlementsResponse,
} from '../utils/api';
import { useCallback, useEffect, useState } from 'react';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const { session, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const isPro = entitlements?.plan === 'pro';

  const loadEntitlements = useCallback(async (accessToken: string) => {
    const data = await getEntitlements(accessToken);
    setEntitlements(data);
    return data;
  }, []);

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) return;

    let cancelled = false;

    async function load(token: string) {
      try {
        const data = await loadEntitlements(token);
        if (cancelled) return;

        if (checkoutResult === 'success' && data.plan !== 'pro') {
          setSuccessMessage(
            'Payment received. Waiting for Stripe to confirm your subscription — this usually takes a few seconds.',
          );

          for (let attempt = 0; attempt < 8 && !cancelled; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const retry = await loadEntitlements(token);
            if (retry.plan === 'pro') {
              setSuccessMessage('You are now on ResizePack Pro. Thanks for upgrading!');
              break;
            }
          }

          if (!cancelled) {
            setSuccessMessage((current) =>
              current?.includes('Thanks')
                ? current
                : 'Still on Free? Make sure the API is running and Stripe CLI is forwarding webhooks (see README), then refresh this page.',
            );
          }
        }
      } catch (error: unknown) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unable to load plan status.';
        setStatusMessage(message);
      } finally {
        if (!cancelled && checkoutResult) {
          searchParams.delete('checkout');
          setSearchParams(searchParams, { replace: true });
        }
      }
    }

    void load(accessToken);

    return () => {
      cancelled = true;
    };
  }, [checkoutResult, loadEntitlements, session?.access_token, searchParams, setSearchParams]);

  async function redirectToBilling(kind: 'checkout' | 'portal') {
    if (!session?.access_token) return;

    setIsBillingLoading(true);
    setStatusMessage(null);
    try {
      const response =
        kind === 'checkout'
          ? await createCheckoutSession(session.access_token)
          : await createPortalSession(session.access_token);

      if (!response.url) {
        throw new Error('Billing session did not return a redirect URL.');
      }

      window.location.href = response.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Billing action failed.';
      setStatusMessage(message);
    } finally {
      setIsBillingLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>Account</h1>
        <p className={styles.muted}>
          Signed in as <strong>{user?.email ?? 'unknown email'}</strong>
        </p>

        <div className={styles.section}>
          <h2>Plan</h2>
          {isPro ? (
            <>
              <p className={styles.muted}>
                You&apos;re on <strong>ResizePack Pro</strong> ✓ — up to 500 files per ZIP, all
                presets, WebP &amp; custom sizes.
              </p>
              {entitlements?.currentPeriodEnd ? (
                <p className={styles.muted}>
                  {entitlements.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(entitlements.currentPeriodEnd).toLocaleDateString()} — you keep Pro until then.`
                    : `Renews on ${new Date(entitlements.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              ) : null}
              {entitlements?.cancelAtPeriodEnd ? (
                <p className={styles.muted}>
                  Changed your mind? Use <strong>Manage billing</strong> to resume your
                  subscription.
                </p>
              ) : (
                <p className={styles.muted}>
                  Need to cancel? Use <strong>Manage billing</strong> — you keep Pro until the end
                  of the paid period.
                </p>
              )}
            </>
          ) : (
            <p className={styles.muted}>
              Current plan: <strong>Free</strong> — 5 files per ZIP, JPEG, Etsy &amp; Web presets.
              Upgrade for 500 files, all presets, WebP &amp; custom sizes.
            </p>
          )}
          <div className={styles.actions}>
            {isPro ? (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('portal')}
              >
                Manage billing
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('checkout')}
              >
                Upgrade with Stripe — €9/mo
              </button>
            )}
          </div>
          {successMessage ? <p className={styles.noticeSuccess}>{successMessage}</p> : null}
          {statusMessage ? <p className={styles.notice}>{statusMessage}</p> : null}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.signOut}
            onClick={async () => {
              if (!supabase) return;
              await supabase.auth.signOut();
            }}
          >
            Sign out
          </button>
          <Link className={styles.link} to="/">
            Back to tool
          </Link>
        </div>
      </div>
    </main>
  );
}

