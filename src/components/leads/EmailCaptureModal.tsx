/**
 * Email Capture Modal
 *
 * Reusable modal for capturing email leads across the funnel.
 * Used by free tools, Ask Heaven email gate, validators, etc.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { captureLeadWithReport } from './useLeadCapture';

export interface EmailCaptureModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed (cancel or success) */
  onClose: () => void;
  /** Source identifier for tracking (e.g., "ask_heaven_gate", "tool:rent-arrears") */
  source: string;
  /** Jurisdiction for the lead (optional) */
  jurisdiction?: string;
  /** Case ID to associate with the lead (optional) */
  caseId?: string;
  /** Additional tags for the lead (optional) */
  tags?: string[];
  /** Modal title (default: "Enter your email to continue") */
  title?: string;
  /** Modal description text */
  description?: string;
  /** Primary button label (default: "Continue") */
  primaryLabel?: string;
  /** Whether to also send an email report after capture */
  includeEmailReport?: boolean;
  /** Case ID for the email report (required if includeEmailReport is true) */
  reportCaseId?: string;
  /** Callback when email is successfully captured */
  onSuccess?: (email: string) => void;
}

/**
 * Validate email format.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  open,
  onClose,
  source,
  jurisdiction,
  caseId,
  tags,
  title = 'Enter your email to continue',
  description,
  primaryLabel = 'Continue',
  includeEmailReport = false,
  reportCaseId,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await captureLeadWithReport(
        {
          email: trimmedEmail,
          source,
          jurisdiction,
          caseId,
          tags,
        },
        includeEmailReport ? reportCaseId : undefined
      );

      if (!result.success) {
        setError(result.error || 'Failed to save email. Please try again.');
        return;
      }

      // Success - call callback and close
      onSuccess?.(trimmedEmail);
      onClose();
    } catch (err) {
      console.error('Email capture error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="small">
      <form onSubmit={handleSubmit} className="space-y-4">
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}

        <div>
          <label
            htmlFor="email-capture-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email-capture-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loading}
            autoFocus
            autoComplete="email"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : primaryLabel}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 pt-2">
          We'll send you helpful resources and updates. You can unsubscribe anytime.
        </p>
      </form>
    </Modal>
  );
};

export default EmailCaptureModal;
