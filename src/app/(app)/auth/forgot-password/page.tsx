/**
 * Forgot Password Page
 *
 * Password reset request via email
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { StandardHero } from '@/components/marketing/StandardHero';
import { RiCheckLine } from 'react-icons/ri';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <StandardHero
        badge="Account Recovery"
        title="Reset Your Password"
        subtitle="We'll send you a link to reset your password"
        variant="pastel"
      />

      <div className="flex items-center justify-center py-12 px-4">
      <Container size="small">
        <Card padding="large">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckLine className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link href="/auth/login">
                <Button variant="heroPrimary" fullWidth>
                  Back to login
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
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="heroPrimary"
                size="large"
                loading={isLoading}
                fullWidth
              >
                Send reset link
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-primary"
                >
                  ← Back to login
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
