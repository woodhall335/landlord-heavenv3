/**
 * Email Confirmation Page
 *
 * Handles email confirmation from Supabase magic link.
 * Works with both token hash and authorization code flows.
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type ConfirmState = 'loading' | 'success' | 'error';

interface UserProfile {
  is_admin?: boolean;
  subscription_tier?: string | null;
  subscription_status?: string | null;
}

/**
 * Determines the appropriate dashboard URL based on user role/subscription
 */
async function getDashboardUrl(): Promise<string> {
  try {
    const response = await fetch('/api/users/me');
    if (!response.ok) {
      return '/dashboard';
    }
    const data = await response.json();
    const user: UserProfile = data.user;

    // Admin users go to admin dashboard
    if (user.is_admin) {
      return '/dashboard/admin';
    }

    // HMO Pro subscribers go to HMO dashboard
    const hasActiveSub =
      user.subscription_tier &&
      (user.subscription_status === 'active' || user.subscription_status === 'trialing');
    if (hasActiveSub) {
      return '/dashboard/hmo';
    }

    // Default user dashboard
    return '/dashboard';
  } catch {
    return '/dashboard';
  }
}

/**
 * Links a case to the current user
 */
async function linkCaseToUser(caseId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/cases/${caseId}/link`, { method: 'POST' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Claims any orphan cases that might belong to this user
 * (anonymous cases with matching email in collected_facts)
 */
async function claimOrphanCases(): Promise<void> {
  try {
    await fetch('/api/cases/claim-orphans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  } catch {
    // Silently ignore errors - this is a best-effort recovery
  }
}

/**
 * Gets redirect URL and case_id from localStorage (set during signup)
 * Also handles linking the case to the user and claiming orphan cases
 */
async function getRedirectUrl(): Promise<string> {
  // Claim any orphan cases (async, best-effort)
  claimOrphanCases();

  try {
    const stored = localStorage.getItem('auth_redirect');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only use if less than 1 hour old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        // Link case to user if case_id is provided
        if (parsed.caseId) {
          await linkCaseToUser(parsed.caseId);
        }
        // Clear the stored redirect
        localStorage.removeItem('auth_redirect');
        // Return the redirect URL or fall back to dashboard
        if (parsed.url) {
          return parsed.url;
        }
      }
      localStorage.removeItem('auth_redirect');
    }
  } catch {
    // Ignore localStorage errors
  }

  // Fall back to role-based dashboard URL
  return getDashboardUrl();
}

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const supabase = getSupabaseBrowserClient();

      try {
        // Check if we got redirected here with an error from the API callback
        const errorParam = searchParams.get('error');
        if (errorParam === 'pkce') {
          // PKCE error from server-side callback - show helpful message
          setErrorMessage(
            'Email confirmation failed. This can happen if you confirmed from a different browser ' +
            'than the one you signed up with. Please try logging in - if your email was confirmed, ' +
            'you should be able to access your account. Otherwise, please sign up again.'
          );
          setState('error');
          return;
        } else if (errorParam && errorParam !== 'pkce') {
          setErrorMessage(decodeURIComponent(errorParam));
          setState('error');
          return;
        }

        // First, check if we already have a valid session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Session already exists - user is confirmed
          setState('success');
          const redirectUrl = await getRedirectUrl();
          setTimeout(() => router.push(redirectUrl), 2000);
          return;
        }

        // Try to get tokens from URL hash (Supabase puts them here for some flows)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          // Set session from tokens in hash
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setState('success');
            const redirectUrl = await getRedirectUrl();
            setTimeout(() => router.push(redirectUrl), 2000);
            return;
          }
        }

        // Try to exchange code from query params
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error) {
            setState('success');
            const redirectUrl = await getRedirectUrl();
            setTimeout(() => router.push(redirectUrl), 2000);
            return;
          }

          // If PKCE fails, it might be because the code was already used
          // or the verifier is missing - show helpful error
          if (error.message.includes('PKCE') || error.message.includes('code verifier')) {
            setErrorMessage(
              'This confirmation link has already been used or has expired. ' +
              'If your email is confirmed, please try logging in. ' +
              'Otherwise, please sign up again.'
            );
            setState('error');
            return;
          }

          setErrorMessage(error.message);
          setState('error');
          return;
        }

        // Check for token_hash (used in email OTP confirmation)
        const tokenHash = searchParams.get('token_hash');
        const typeParam = searchParams.get('type');

        if (tokenHash && typeParam) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeParam as 'signup' | 'email',
          });

          if (!error) {
            setState('success');
            const redirectUrl = await getRedirectUrl();
            setTimeout(() => router.push(redirectUrl), 2000);
            return;
          }

          setErrorMessage(error.message);
          setState('error');
          return;
        }

        // No auth data found in URL - check session one more time
        // (middleware may have set it up)
        const { data: { session: finalCheck } } = await supabase.auth.getSession();
        if (finalCheck) {
          setState('success');
          const redirectUrl = await getRedirectUrl();
          setTimeout(() => router.push(redirectUrl), 2000);
          return;
        }

        // No valid confirmation data found
        setErrorMessage(
          'No confirmation data found. The link may be invalid or expired. ' +
          'Please try signing up again or logging in if you\'ve already confirmed.'
        );
        setState('error');
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        setErrorMessage(err?.message || 'An unexpected error occurred');
        setState('error');
      }
    };

    confirmEmail();
  }, [router, searchParams]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="small">
          <Card padding="large">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Confirming your email...</p>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="small">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-charcoal mb-2">
              Email Confirmation
            </h1>
          </div>

          <Card padding="large">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiErrorWarningLine className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Confirmation Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Link href="/auth/login">
                  <Button variant="primary" fullWidth>
                    Go to Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary" fullWidth>
                    Sign Up Again
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Container size="small">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiCheckLine className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              Email Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been verified. Redirecting to dashboard...
            </p>
            <Link href="/dashboard">
              <Button variant="primary" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="small">
          <Card padding="large">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </Card>
        </Container>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
