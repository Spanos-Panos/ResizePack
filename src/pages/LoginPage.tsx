import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../auth/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { isConfigured, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? '/account';
  }, [location.state]);

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
          <form
            className={styles.form}
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setIsSubmitting(true);
              try {
                if (!supabase) {
                  setError('Supabase is not configured.');
                  return;
                }

                const { error: authError } =
                  mode === 'sign_in'
                    ? await supabase.auth.signInWithPassword({ email, password })
                    : await supabase.auth.signUp({ email, password });
                if (authError) {
                  setError(authError.message);
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
                required
              />
            </label>
            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <span className={styles.hint}>Minimum 8 characters.</span>
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

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
        )}

        <p className={styles.backLink}>
          <Link to="/">← Back to tool</Link>
        </p>
      </div>
    </main>
  );
}

