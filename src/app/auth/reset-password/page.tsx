/**
 * Reset Password Page
 *
 * Handles password reset from Supabase email link
 * Accepts code parameter from URL and updates user password
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      // Supabase sets up a session when user clicks the reset link
      if (session) {
        setIsValidLink(true);
      } else {
        // Try to exchange code for session if present in hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            setIsValidLink(true);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        setIsValidLink(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || 'Failed to update password. Please try again.');
        return;
      }

      setSuccess(true);

      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking link validity
  if (isValidLink === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="small">
          <Card padding="large">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // Invalid or expired link
  if (isValidLink === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="small">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-charcoal mb-2">
              Reset Your Password
            </h1>
          </div>

          <Card padding="large">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiErrorWarningLine className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Invalid or Expired Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/auth/forgot-password">
                <Button variant="primary" fullWidth>
                  Request New Reset Link
                </Button>
              </Link>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Account Recovery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Set New Password</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Enter your new password below
            </p>
          </div>
        </Container>
      </section>

      <div className="flex items-center justify-center py-12 px-4">
      <Container size="small">
        <Card padding="large">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckLine className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Password Updated!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You will be redirected to the login page.
              </p>
              <Link href="/auth/login">
                <Button variant="primary" fullWidth>
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                helperText="Must be at least 8 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={isLoading}
                fullWidth
              >
                Update Password
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </Container>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
