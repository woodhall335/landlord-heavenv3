/**
 * Session Token Utility
 *
 * Manages anonymous session tokens for the "try before you buy" wizard flow.
 * Session tokens are used to validate ownership of anonymous cases/documents.
 *
 * Security:
 * - Tokens are UUIDs stored in localStorage
 * - Tokens must match the session_token stored in the case record
 * - Used for RLS policy validation via x-session-token header
 */

const SESSION_TOKEN_KEY = 'lh_session_token';

/**
 * Get the current session token from localStorage
 * Returns null if running on server or no token exists
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    // localStorage might be blocked in some contexts
    return null;
  }
}

/**
 * Generate a new session token and store it in localStorage
 * Returns the generated token
 */
export function generateSessionToken(): string {
  const token = crypto.randomUUID();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } catch {
      // localStorage might be blocked in some contexts
      console.warn('Unable to store session token in localStorage');
    }
  }

  return token;
}

/**
 * Get or create a session token
 * Returns existing token if present, otherwise generates a new one
 */
export function getOrCreateSessionToken(): string {
  const existing = getSessionToken();
  if (existing) {
    return existing;
  }
  return generateSessionToken();
}

/**
 * Clear the session token from localStorage
 * Called when user signs up or explicitly clears session
 */
export function clearSessionToken(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      // localStorage might be blocked in some contexts
    }
  }
}

/**
 * Get headers object with session token for API requests
 * Used when making requests for anonymous cases/documents
 */
export function getSessionTokenHeaders(): Record<string, string> {
  const token = getSessionToken();
  if (token) {
    return { 'x-session-token': token };
  }
  return {};
}

/**
 * Extract session token from request headers (server-side)
 */
export function getSessionTokenFromRequest(request: Request): string | null {
  return request.headers.get('x-session-token');
}
