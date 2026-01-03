/**
 * Verify Email Page
 *
 * Shows after signup - prompts user to check email
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RiMailLine } from 'react-icons/ri';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Container size="small">
        <Card padding="large">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <RiMailLine className="w-10 h-10 text-[#7C3AED]" />
            </div>

            <h1 className="text-2xl font-extrabold text-charcoal mb-3">
              Check Your Email
            </h1>

            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            {email && (
              <p className="text-lg font-semibold text-charcoal mb-6">
                {email}
              </p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected to the dashboard</li>
              </ol>
            </div>

            <Link href="/auth/login">
              <Button variant="primary" fullWidth>
                Go to login
              </Button>
            </Link>

            <p className="text-xs text-gray-500 mt-4">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
