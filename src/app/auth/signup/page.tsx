/**
 * Signup Page
 *
 * User registration with email/password
 * Creates auth account + user profile
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

export default function SignupPage() {
  const router = useRouter();
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
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Container size="small">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-charcoal mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Start creating court-ready legal documents
          </p>
        </div>

        <Card padding="large">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            <Input
              label="Full name"
              type="text"
              value={formData.fullName}
              onChange={(val) => handleChange('fullName', val)}
              placeholder="John Smith"
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(val) => handleChange('email', val)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Phone number (optional)"
              type="tel"
              value={formData.phone}
              onChange={(val) => handleChange('phone', val)}
              placeholder="+44 7700 900000"
              autoComplete="tel"
              helperText="We'll only use this for important account notifications"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(val) => handleChange('password', val)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="Minimum 8 characters"
            />

            <Input
              label="Confirm password"
              type="password"
              value={formData.confirmPassword}
              onChange={(val) => handleChange('confirmPassword', val)}
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
              variant="primary"
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
                href="/auth/login"
                className="text-primary hover:text-primary-dark font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-primary"
          >
            ← Back to home
          </Link>
        </div>
      </Container>
    </div>
  );
}
