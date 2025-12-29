/**
 * useAuthCheck Hook
 *
 * Client-side hook to check if user is authenticated.
 * Calls /api/users/me and returns auth state.
 *
 * Use this to gate API calls in dashboard pages that require authentication.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier?: string;
  subscription_status?: string;
}

interface AuthCheckResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAuthCheckOptions {
  /** If true, redirects to login page when not authenticated */
  redirectToLogin?: boolean;
  /** Custom login path (default: /auth/login) */
  loginPath?: string;
}

export function useAuthCheck(options: UseAuthCheckOptions = {}): AuthCheckResult {
  const { redirectToLogin = false, loginPath = '/auth/login' } = options;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        if (redirectToLogin) {
          router.push(loginPath);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setError('Failed to check authentication status');
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError('Network error checking authentication');
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, loginPath, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isLoading,
    isAuthenticated,
    user,
    error,
    refetch: checkAuth,
  };
}
