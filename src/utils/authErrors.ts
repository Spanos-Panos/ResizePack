/**
 * Maps raw Supabase auth error messages to short, human-friendly copy. Falls
 * back to the original message (or a generic line) when we don't recognize it.
 */
export function friendlyAuthError(raw: string | null | undefined): string {
  if (!raw) {
    return 'Something went wrong. Please try again.';
  }

  const message = raw.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'That email or password is incorrect.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email first — check your inbox for the verification link.';
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (message.includes('password should be at least')) {
    return 'Password is too short — use at least 8 characters.';
  }
  if (message.includes('unable to validate email address') || message.includes('invalid email')) {
    return 'That email address looks invalid.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  return raw;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
