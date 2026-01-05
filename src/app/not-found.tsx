/**
 * 404 Not Found Page
 *
 * Displays a friendly 404 page when a route is not found.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex,nofollow',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <span className="text-8xl font-bold text-primary opacity-20">404</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>

        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It may have been moved or no longer exists.
        </p>

        {/* Navigation options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Go to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <Link href="/help" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
