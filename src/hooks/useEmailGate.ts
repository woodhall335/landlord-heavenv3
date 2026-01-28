/**
 * Email Gate Hook for Free Tools
 *
 * Provides email gate functionality for free tools that generate PDFs or results.
 * Uses localStorage to remember if user has already provided email.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { isLeadCaptured, setLeadEmail } from '@/lib/leads/local';

export interface UseEmailGateOptions {
  /** Source identifier for tracking (e.g., "tool:rent-arrears") */
  source: string;
  /** Callback when email is captured and action should proceed */
  onProceed: () => void;
}

export interface UseEmailGateReturn {
  /** Whether the email capture modal should be shown */
  showGate: boolean;
  /** Set whether to show the gate modal */
  setShowGate: (show: boolean) => void;
  /** Whether the user has captured email (either now or previously) */
  isCaptured: boolean;
  /** Check if gate should be shown, and either show it or proceed */
  checkGateAndProceed: () => void;
  /** Handle successful email capture */
  handleSuccess: (email: string) => void;
  /** Handle modal close (cancel) */
  handleClose: () => void;
  /** The source identifier */
  source: string;
}

/**
 * Hook for managing email gate state on free tools.
 *
 * @example
 * ```tsx
 * const gate = useEmailGate({
 *   source: 'tool:rent-arrears',
 *   onProceed: () => generatePDF(),
 * });
 *
 * // In button click:
 * <button onClick={gate.checkGateAndProceed}>Download PDF</button>
 *
 * // Modal:
 * <EmailCaptureModal
 *   open={gate.showGate}
 *   onClose={gate.handleClose}
 *   source={gate.source}
 *   onSuccess={gate.handleSuccess}
 * />
 * ```
 */
export function useEmailGate({ source, onProceed }: UseEmailGateOptions): UseEmailGateReturn {
  const [showGate, setShowGate] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setIsCaptured(isLeadCaptured());
  }, []);

  const checkGateAndProceed = useCallback(() => {
    if (isLeadCaptured()) {
      // Already captured, proceed directly
      onProceed();
    } else {
      // Show the gate modal
      setShowGate(true);
    }
  }, [onProceed]);

  const handleSuccess = useCallback(
    (email: string) => {
      setLeadEmail(email);
      setIsCaptured(true);
      setShowGate(false);
      // After capture, proceed with the action
      onProceed();
    },
    [onProceed]
  );

  const handleClose = useCallback(() => {
    setShowGate(false);
  }, []);

  return {
    showGate,
    setShowGate,
    isCaptured,
    checkGateAndProceed,
    handleSuccess,
    handleClose,
    source,
  };
}
