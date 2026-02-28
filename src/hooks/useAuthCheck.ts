/**
 * useAuthCheck Hook
 *
 * Client-side hook to check if user is authenticated.
 * Uses browser Supabase client directly for reliable auth state.
 *
 * Use this to gate API calls in dashboard pages that require authentication.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier?: string;
  subscription_status?: string;
  is_admin?: boolean;
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

      // Use browser Supabase client directly for reliable auth check
      const supabase = getSupabaseBrowserClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setIsAuthenticated(false);
        if (redirectToLogin) {
          router.push(loginPath);
        }
        return;
      }

      // User is authenticated - fetch profile data from API
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // API failed but we know user is authenticated from Supabase
          // Use basic user info from auth
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name,
          });
        }
      } catch {
        // API failed but user is still authenticated
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name,
        });
      }

      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError('Error checking authentication');
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, loginPath, router]);

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          if (redirectToLogin) {
            router.push(loginPath);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth, redirectToLogin, loginPath, router]);

  return {
    isLoading,
    isAuthenticated,
    user,
    error,
    refetch: checkAuth,
  };
}
