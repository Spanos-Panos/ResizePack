import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { friendlyAuthError } from '../utils/authErrors';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import styles from './LoginPage.module.css';

/**
 * Landing page for the password-reset email link. Supabase's recovery link
 * establishes a short-lived session (detectSessionInUrl + the PASSWORD_RECOVERY
 * event); with that session we let the user set a new password via
 * supabase.auth.updateUser, then sign them out so they re-authenticate with it.
 */
export function ResetPasswordPage() {
  // Start "checking" only when Supabase is configured; otherwise there's
  // nothing to verify and we fall straight through to the expired-link state.
  const [checking, setChecking] = useState(() => supabase != null);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;
    let active = true;
    // The recovery link carries the session in the URL; detectSessionInUrl
    // picks it up and fires PASSWORD_RECOVERY. Listen for it, and also read the
    // session directly in case it was already established before we subscribed.
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
        setChecking(false);
      }
    });
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      setChecking(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.themeCorner}>
            <ThemeToggle />
          </div>
          <h1>Reset password</h1>
          <p className={styles.muted}>Verifying your reset link…</p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.themeCorner}>
            <ThemeToggle />
          </div>
          <h1>Password updated</h1>
          <p className={styles.noticeSuccess}>✓ Your password has been changed.</p>
          <p className={styles.muted}>Sign in with your new password to continue.</p>
          <p className={styles.backLink}>
            <Link to="/login">Go to sign in →</Link>
          </p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.themeCorner}>
            <ThemeToggle />
          </div>
          <h1>Link expired</h1>
          <p className={styles.muted}>
            This password reset link is invalid or has expired. Request a new one from the sign-in
            page.
          </p>
          <p className={styles.backLink}>
            <Link to="/login">Back to sign in →</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.themeCorner}>
          <ThemeToggle />
        </div>
        <h1>Set a new password</h1>
        <p className={styles.muted}>Choose a new password for your account.</p>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            if (password.length < 8) {
              setFieldError('Use at least 8 characters.');
              return;
            }
            if (password !== confirm) {
              setFieldError('Passwords do not match.');
              return;
            }
            setFieldError(null);
            if (!supabase) {
              setError('Supabase is not configured.');
              return;
            }
            setIsSubmitting(true);
            try {
              const { error: updateError } = await supabase.auth.updateUser({ password });
              if (updateError) {
                setError(friendlyAuthError(updateError.message));
                return;
              }
              // Force a fresh sign-in with the new password.
              try {
                await supabase.auth.signOut();
              } catch {
                /* ignore */
              }
              setDone(true);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <label className={styles.label}>
            New password
            <span className={styles.passwordRow}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldError ? true : undefined}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>
          <label className={styles.label}>
            Confirm new password
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={fieldError ? true : undefined}
              required
              minLength={8}
            />
            {fieldError ? (
              <span className={styles.fieldError}>{fieldError}</span>
            ) : (
              <span className={styles.hint}>Minimum 8 characters.</span>
            )}
          </label>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Update password'}
          </button>
        </form>
        <p className={styles.backLink}>
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
