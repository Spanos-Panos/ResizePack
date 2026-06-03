import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../auth/useAuth';
import { friendlyAuthError, isValidEmail } from '../utils/authErrors';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { isConfigured, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    const from = state?.from;
    // Only allow internal absolute paths. Reject protocol-relative (`//host`)
    // and absolute URLs so a crafted `from` can never become an open redirect.
    if (from && from.startsWith('/') && !from.startsWith('//')) {
      return from;
    }
    return '/account';
  }, [location.state]);

  function validate(): boolean {
    let ok = true;
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address.');
      ok = false;
    } else {
      setEmailError(null);
    }
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      ok = false;
    } else {
      setPasswordError(null);
    }
    return ok;
  }

  async function signInWithProvider(provider: 'google' | 'github') {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setError(null);
    // OAuth returns the user to the app; AuthProvider picks up the session from
    // the URL. /account is SPA-routed (vercel.json rewrite) so the deep link loads.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (oauthError) {
      setError(friendlyAuthError(oauthError.message));
    }
  }

  if (user) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1>You’re already signed in</h1>
          <p className={styles.muted}>
            Go to your <Link to="/account">account</Link>.
          </p>
        </div>
      </main>
    );
  }

  if (confirmationSent) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1>Confirm your email</h1>
          <p className={styles.muted}>
            We sent a verification link to <strong>{email}</strong>. Open it to activate your
            account, then come back and sign in.
          </p>
          <p className={styles.notice}>
            The link works on any device — if you opened it on your phone, just return here on this
            device to sign in.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setConfirmationSent(false);
              setMode('sign_in');
            }}
          >
            Back to sign in
          </button>
          <p className={styles.backLink}>
            <Link to="/">← Back to tool</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{mode === 'sign_in' ? 'Sign in' : 'Create account'}</h1>
        {!isConfigured ? (
          <p className={styles.notice}>
            Supabase isn’t configured yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env.local</code>, then restart{' '}
            <code>pnpm dev</code>.
          </p>
        ) : (
          <>
            <div className={styles.oauthGroup}>
              <button
                type="button"
                className={styles.oauthButton}
                onClick={() => signInWithProvider('google')}
                disabled={isSubmitting}
              >
                Continue with Google
              </button>
              <button
                type="button"
                className={styles.oauthButton}
                onClick={() => signInWithProvider('github')}
                disabled={isSubmitting}
              >
                Continue with GitHub
              </button>
            </div>
            <div className={styles.divider}>
              <span>or use email</span>
            </div>
            <form
            className={styles.form}
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              if (!validate()) {
                return;
              }
              setIsSubmitting(true);
              try {
                if (!supabase) {
                  setError('Supabase is not configured.');
                  return;
                }

                if (mode === 'sign_in') {
                  const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });
                  if (authError) {
                    setError(friendlyAuthError(authError.message));
                    return;
                  }
                  navigate(redirectTo, { replace: true });
                  return;
                }

                const { data, error: authError } = await supabase.auth.signUp({
                  email,
                  password,
                  options: { emailRedirectTo: `${window.location.origin}/account` },
                });
                if (authError) {
                  setError(friendlyAuthError(authError.message));
                  return;
                }
                // When email confirmation is required, Supabase returns a user
                // with no active session. Show the "check your email" state.
                if (!data.session) {
                  setConfirmationSent(true);
                  return;
                }
                navigate(redirectTo, { replace: true });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  setEmailError(
                    email && !isValidEmail(email) ? 'Enter a valid email address.' : null,
                  )
                }
                aria-invalid={emailError ? true : undefined}
                required
              />
              {emailError ? <span className={styles.fieldError}>{emailError}</span> : null}
            </label>
            <label className={styles.label}>
              Password
              <span className={styles.passwordRow}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setPasswordError(
                      password && password.length < 8 ? 'Use at least 8 characters.' : null,
                    )
                  }
                  aria-invalid={passwordError ? true : undefined}
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
              {passwordError ? (
                <span className={styles.fieldError}>{passwordError}</span>
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
              {isSubmitting
                ? 'Working…'
                : mode === 'sign_in'
                  ? 'Sign in'
                  : 'Create account'}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setMode((m) => (m === 'sign_in' ? 'sign_up' : 'sign_in'))}
              disabled={isSubmitting}
            >
              {mode === 'sign_in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </form>
          </>
        )}

        <p className={styles.backLink}>
          <Link to="/">← Back to tool</Link>
        </p>
      </div>
    </main>
  );
}

