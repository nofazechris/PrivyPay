/**
 * Username rules (§9).
 *
 * Usernames are the human identity PrivyPay pays by (@sarah), so the rules are strict and
 * enforced in one place: 3–20 chars, lowercase, alphanumeric plus underscore, uniqueness
 * (enforced by the database), and a reserved-word block so system and impersonation-prone
 * names can't be claimed. Pure and side-effect-free — the format checks are fully unit-tested;
 * uniqueness is checked against the database in the service layer.
 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const USERNAME_RE = /^[a-z0-9_]+$/;

/**
 * Reserved: system routes/roles, payment terms, and support/impersonation-prone handles.
 * Kept lowercase; matching is case-insensitive via normalization.
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  'admin', 'administrator', 'root', 'system', 'support', 'help', 'security', 'privypay', 'privy',
  'official', 'team', 'staff', 'moderator', 'mod', 'billing', 'payments', 'payment', 'pay', 'wallet',
  'api', 'app', 'www', 'mail', 'email', 'login', 'signup', 'signin', 'logout', 'auth', 'account',
  'settings', 'profile', 'me', 'you', 'user', 'users', 'null', 'undefined', 'anonymous', 'guest',
  'celo', 'usdc', 'crypto', 'bank', 'money', 'cash', 'send', 'receive', 'request', 'contact', 'contacts',
]);

export type UsernameError = 'too_short' | 'too_long' | 'invalid_chars' | 'reserved';

/**
 * Normalize user input toward a candidate username: strip a leading '@', trim, lowercase.
 * Does not enforce length/charset — that is {@link validateUsername}.
 */
export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@+/, '').toLowerCase();
}

/** Validate a normalized username. Returns the first failing rule, or null if valid. */
export function validateUsername(input: string): UsernameError | null {
  const name = normalizeUsername(input);
  if (name.length < USERNAME_MIN) return 'too_short';
  if (name.length > USERNAME_MAX) return 'too_long';
  if (!USERNAME_RE.test(name)) return 'invalid_chars';
  if (RESERVED_USERNAMES.has(name)) return 'reserved';
  return null;
}

export function isValidUsername(input: string): boolean {
  return validateUsername(input) === null;
}

/** Human-readable message for a validation error, for API responses and the UI. */
export function usernameErrorMessage(error: UsernameError): string {
  switch (error) {
    case 'too_short':
      return `Username must be at least ${USERNAME_MIN} characters.`;
    case 'too_long':
      return `Username must be at most ${USERNAME_MAX} characters.`;
    case 'invalid_chars':
      return 'Use only lowercase letters, numbers and underscores.';
    case 'reserved':
      return 'That username isn’t available.';
  }
}
