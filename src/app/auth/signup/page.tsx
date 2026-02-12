/**
 * Signup Page
 *
 * User registration with email/password
 * Creates auth account + user profile
 * Supports redirect param for returning to checkout flow
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect and case_id from URL params (passed from preview page)
  const redirectUrl = searchParams.get('redirect');
  const caseId = searchParams.get('case_id');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Store redirect info in localStorage for after email confirmation
  useEffect(() => {
    if (redirectUrl || caseId) {
      localStorage.setItem('auth_redirect', JSON.stringify({
        url: redirectUrl || null,
        caseId: caseId || null,
        timestamp: Date.now(),
      }));
    }
  }, [redirectUrl, caseId]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName || undefined,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message
        router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
      } else {
        setError(data.error || 'Failed to create account');
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
              className="relative overflow-hidden flex flex-col p-8 md:p-12 pt-12 bg-cover bg-center min-h-[380px] sm:min-h-[420px] md:min-h-[520px]"
              style={{ backgroundImage: "url('/images/mascots/landlord-heaven-signup-bg.webp')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary-dark/80" />

              <div className="relative z-10">
                <Link
                  href="/"
                  className="relative z-20 inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium text-white focus:text-white focus-visible:text-white transition"
                >
                  ← Back to home
                </Link>

                <div className="mt-6">
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 w-fit">
                    <span className="text-sm font-semibold" style={{ color: 'white' }}>Get Started</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'white' }}>
                    Create Your Account
                  </h1>
                  <p className="text-lg" style={{ color: 'white' }}>
                    Start creating court-ready legal documents
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none translate-x-6 md:translate-x-10 translate-y-6 md:translate-y-10">
                <Image
                  src="/images/mascots/landlord-heaven-signup.webp"
                  alt="Landlord Heaven signup mascot"
                  width={900}
                  height={900}
                  className="h-auto w-[320px] sm:w-[380px] md:w-[520px] lg:w-[620px] max-w-none object-contain"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                <Input
                  label="Full name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                />

                <Input
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />

                <Input
                  label="Phone number (optional)"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+44 7700 900000"
                  autoComplete="tel"
                  helperText="We'll only use this for important account notifications"
                />

                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                />

                <Input
                  label="Confirm password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="heroPrimary"
                  size="large"
                  loading={isLoading}
                  fullWidth
                >
                  Create account
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href={`/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}${caseId ? `${redirectUrl ? '&' : '?'}case_id=${caseId}` : ''}`}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Log in
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
