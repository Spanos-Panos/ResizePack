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
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { getSubscriptionDisplay } from '../utils/subscriptionStatus';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
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
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // The sign-in provider is reliable; whether a password is *already* set is
  // NOT exposed on the client (setting a password on an OAuth account doesn't
  // add an 'email' identity), so we offer a neutral "set or change" rather
  // than claiming to know the current state.
  const oauthProvider = user?.app_metadata?.provider;
  const providerLabel =
    oauthProvider && oauthProvider !== 'email'
      ? oauthProvider.charAt(0).toUpperCase() + oauthProvider.slice(1)
      : null;
  const isOauthUser = providerLabel != null;
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

  async function handleSavePassword(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
        return;
      }
      setPasswordSaved(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not update password.');
    } finally {
      setIsSavingPassword(false);
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
        <div className={styles.themeCorner}>
          <ThemeToggle />
        </div>
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

        <div className={styles.section}>
          <h2>Password</h2>
          <p className={styles.muted}>
            {isOauthUser
              ? `You sign in with ${providerLabel}. You can also set a password to sign in with your email — ${providerLabel} keeps working too.`
              : 'Change the password you use to sign in with email.'}
          </p>
          {!showPassword ? (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.signOut}
                onClick={() => setShowPassword(true)}
              >
                {isOauthUser ? 'Set or change password' : 'Change password'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSavePassword}>
              <label className={styles.fieldLabel}>
                New password
                <input
                  className={styles.passwordInput}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  disabled={isSavingPassword}
                />
              </label>
              <label className={styles.fieldLabel}>
                Confirm new password
                <input
                  className={styles.passwordInput}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  disabled={isSavingPassword}
                />
              </label>
              <div className={styles.actions}>
                <button type="submit" className={styles.primaryButton} disabled={isSavingPassword}>
                  {isSavingPassword ? 'Saving…' : 'Save password'}
                </button>
                <button
                  type="button"
                  className={styles.actionLink}
                  disabled={isSavingPassword}
                  onClick={() => {
                    setShowPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              {passwordError ? <p className={styles.notice}>{passwordError}</p> : null}
            </form>
          )}
          {passwordSaved ? (
            <p className={styles.noticeSuccess}>
              Password updated. You can now sign in with your email and this password.
            </p>
          ) : null}
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

