/**
 * Login Page
 *
 * User authentication with email/password
 * Redirects to appropriate dashboard based on user role
 * Supports redirect param for returning to checkout flow
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect and case_id from URL params
  const redirectUrl = searchParams.get('redirect');
  const caseId = searchParams.get('case_id');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Store redirect info in localStorage (in case user was sent here from signup)
  useEffect(() => {
    if (redirectUrl || caseId) {
      localStorage.setItem('auth_redirect', JSON.stringify({
        url: redirectUrl || null,
        caseId: caseId || null,
        timestamp: Date.now(),
      }));
    }
  }, [redirectUrl, caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the browser Supabase client for login
      // This ensures the session is properly stored in cookies
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid email or password');
        return;
      }

      if (data.session) {
        // Session is now stored - refresh to update server-side layout (header)
        router.refresh();

        // Claim any orphan cases (async, best-effort)
        claimOrphanCases();

        // Check for redirect info from URL params or localStorage
        let targetUrl = redirectUrl;
        let targetCaseId = caseId;

        if (!targetUrl && !targetCaseId) {
          // Check localStorage for redirect info from signup flow
          try {
            const stored = localStorage.getItem('auth_redirect');
            if (stored) {
              const parsed = JSON.parse(stored);
              // Only use if less than 1 hour old
              if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
                targetUrl = parsed.url;
                targetCaseId = parsed.caseId;
              }
              localStorage.removeItem('auth_redirect');
            }
          } catch {
            // Ignore localStorage errors
          }
        }

        // Link case to user if case_id is provided
        if (targetCaseId) {
          await linkCaseToUser(targetCaseId);
        }

        // Redirect to target URL or dashboard
        if (targetUrl) {
          router.push(targetUrl);
        } else {
          const dashboardUrl = await getDashboardUrl();
          router.push(dashboardUrl);
        }
      } else {
        setError('Login failed - no session returned');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div
              className="relative overflow-hidden p-8 md:p-12 pt-12 flex flex-col justify-start bg-cover bg-center min-h-[360px] md:min-h-full"
              style={{ backgroundImage: "url('/images/mascots/landlord-heaven-signup-bg.webp')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary-dark/80" />

              <div className="relative z-10 flex flex-col h-full">
                <Link
                  href="/"
                  className="w-fit text-sm text-white/95 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-colors"
                >
                  ← Back to home
                </Link>

                <div className="mt-6">
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 w-fit">
                    <span className="text-sm font-semibold" style={{ color: 'white' }}>Account</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'white' }}>
                    Welcome Back
                  </h1>
                  <p className="text-lg" style={{ color: 'white' }}>
                    Log in to access your documents and cases
                  </p>
                </div>

                <div className="relative z-10 mt-6 md:mt-auto flex justify-center md:justify-center">
                  <Image
                    src="/images/mascots/landlord-heaven-login.webp"
                    alt="Landlord Heaven login mascot"
                    width={360}
                    height={300}
                    className="w-[260px] max-w-[80%] md:w-[360px] h-auto"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="heroPrimary"
                  size="large"
                  loading={isLoading}
                  fullWidth
                >
                  Log in
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href={`/auth/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}${caseId ? `${redirectUrl ? '&' : '?'}case_id=${caseId}` : ''}`}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
