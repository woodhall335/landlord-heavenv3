/**
 * Tool Email Gate Component
 *
 * A styled email capture modal specifically for free tools.
 * Shows when user attempts to download/view results without having provided email.
 */

'use client';

import { useState } from 'react';
import { RiCloseLine, RiMailLine, RiLoader4Line } from 'react-icons/ri';
import { captureLead } from '@/components/leads/useLeadCapture';
import { trackLead } from '@/lib/analytics';

interface ToolEmailGateProps {
  /** Display name of the tool (e.g., "Section 21 Notice Generator") */
  toolName: string;
  /** Source identifier for tracking (e.g., "tool:section-21") */
  source: string;
  /** Callback when email is successfully captured */
  onEmailCaptured: (email: string) => void;
  /** Callback when modal is closed without capturing */
  onClose: () => void;
}

export function ToolEmailGate({
  toolName,
  source,
  onEmailCaptured,
  onClose,
}: ToolEmailGateProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await captureLead({
        email: trimmedEmail,
        source,
        tags: ['free_tool', source.replace('tool:', '')],
      });

      if (!result.success) {
        setError(result.error || 'Failed to save email. Please try again.');
        setIsLoading(false);
        return;
      }

      // Track lead conversion in analytics (GA4 + FB Pixel)
      trackLead(source, trimmedEmail);

      onEmailCaptured(trimmedEmail);
    } catch (err) {
      console.error('Email capture error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-gate-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <RiMailLine className="w-8 h-8 text-primary-600" />
          </div>

          {/* Title */}
          <h2 id="email-gate-title" className="text-xl font-bold text-gray-900 mb-2">
            Get Your Free Results
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Enter your email to download your {toolName} results
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
              autoComplete="email"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RiLoader4Line className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Get My Results'
              )}
            </button>
          </form>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 mt-4">
            We&apos;ll send you helpful landlord tips. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
