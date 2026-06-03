import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../auth/useAuth';
import {
  createCheckoutSession,
  createPortalSession,
  deleteAccount,
  getEntitlements,
  type EntitlementsResponse,
} from '../utils/api';
import { useCallback, useEffect, useState } from 'react';
import { getSubscriptionDisplay } from '../utils/subscriptionStatus';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutResult = searchParams.get('checkout');
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const display = getSubscriptionDisplay(entitlements);
  const badgeClass =
    display.uiState === 'pro_active'
      ? styles.badgePro
      : display.uiState === 'pro_until'
        ? styles.badgeWarning
        : styles.badgeMuted;

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

  async function handleDeleteAccount() {
    if (!session?.access_token) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(session.access_token);
      // Account is gone server-side; clear the local session and return to the
      // tool, which still works fully without an account.
      if (supabase) {
        await supabase.auth.signOut();
      }
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete account.';
      setDeleteError(message);
      setIsDeleting(false);
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
          <div className={styles.statusCard}>
            <span className={`${styles.badge} ${badgeClass}`}>{display.badge}</span>
            <p className={styles.statusDetail}>{display.detail}</p>
          </div>

          <div className={styles.actions}>
            {display.primaryAction === 'upgrade' ? (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('checkout')}
              >
                Upgrade with Stripe — €9/mo
              </button>
            ) : display.primaryAction === 'resume' ? (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('portal')}
              >
                Resume subscription
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('portal')}
              >
                Manage billing
              </button>
            )}
            {display.secondaryAction === 'cancel' ? (
              <button
                type="button"
                className={styles.actionLink}
                disabled={isBillingLoading}
                onClick={() => redirectToBilling('portal')}
              >
                Cancel subscription
              </button>
            ) : null}
          </div>
          {display.uiState === 'pro_until' ? (
            <p className={styles.muted}>
              Your cancellation is scheduled. Resume any time before {display.date} to keep Pro
              without interruption.
            </p>
          ) : null}
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

        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Delete account</h2>
          <p className={styles.muted}>
            Permanently delete your account and data. This cancels any active Pro subscription
            immediately — you won’t be refunded for the remaining days — and removes your profile and
            billing records. This cannot be undone.
          </p>
          {!showDelete ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => setShowDelete(true)}
              >
                Delete my account
              </button>
            </div>
          ) : (
            <div className={styles.dangerConfirm}>
              <label className={styles.dangerLabel}>
                Type <strong>DELETE</strong> to confirm
                <input
                  className={styles.input}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  aria-label="Type DELETE to confirm account deletion"
                  disabled={isDeleting}
                />
              </label>
              <div className={styles.dangerActions}>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? 'Deleting…' : 'Permanently delete'}
                </button>
                <button
                  type="button"
                  className={styles.actionLink}
                  disabled={isDeleting}
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteConfirm('');
                    setDeleteError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              {deleteError ? <p className={styles.notice}>{deleteError}</p> : null}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

