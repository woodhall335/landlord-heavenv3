'use client';

/**
 * Global Error Boundary
 *
 * Catches runtime errors in the app and displays a user-friendly message.
 * In development, shows error details; in production, hides them.
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (will be captured by error monitoring in prod)
    console.error('Application error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Something went wrong
          </h1>

          <p className="text-gray-600 text-center mb-6">
            We apologise for the inconvenience. Please try again, or return to the homepage.
          </p>

          {/* Error digest for support reference */}
          {error.digest && (
            <p className="text-xs text-gray-400 text-center mb-4">
              Error ID: {error.digest}
            </p>
          )}

          {/* Dev-only error details */}
          {isDev && (
            <div className="mb-6">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-700 font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-48">
                  <p className="text-red-600 font-mono text-xs mb-2">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="text-gray-700 font-mono text-xs whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
