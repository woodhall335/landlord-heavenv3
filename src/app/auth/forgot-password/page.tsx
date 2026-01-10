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
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Account Recovery</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Reset Your Password</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              We'll send you a link to reset your password
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
                Check your email
              </h2>
              <p className="text-gray-600 mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link href="/auth/login">
                <Button variant="primary" fullWidth>
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
                variant="primary"
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
