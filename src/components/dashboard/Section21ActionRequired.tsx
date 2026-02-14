/**
 * Section 21 Action Required Component
 *
 * Displays when Section 21 fulfillment is blocked due to missing confirmations.
 * Provides UI for users to confirm the missing statutory requirements and
 * retry document generation.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RiErrorWarningLine, RiRefreshLine, RiCheckboxCircleLine } from 'react-icons/ri';

interface RequiredAction {
  fieldKey: string;
  label: string;
  errorCode: string;
  helpText: string;
}

interface Section21ActionRequiredProps {
  caseId: string;
  requiredActions: RequiredAction[];
  onResumeFulfillment: () => void;
  onSuccess?: () => void;
}

export const Section21ActionRequired: React.FC<Section21ActionRequiredProps> = ({
  caseId,
  requiredActions,
  onResumeFulfillment,
  onSuccess,
}) => {
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Map error codes to human-readable labels and field keys
  const getFieldMapping = (errorCode: string): { fieldKey: string; label: string; helpText: string } => {
    switch (errorCode) {
      case 'S21_PRESCRIBED_INFO_UNKNOWN':
        return {
          fieldKey: 'prescribed_info_served',
          label: 'Prescribed information served within 30 days',
          helpText:
            'The tenant must have been given the prescribed information about the deposit protection within 30 days of the deposit being protected.',
        };
      case 'S21_EPC_UNKNOWN':
        return {
          fieldKey: 'epc_served',
          label: 'Energy Performance Certificate (EPC) provided',
          helpText:
            'A valid EPC must have been given to the tenant free of charge before the tenancy began.',
        };
      case 'S21_HOW_TO_RENT_UNKNOWN':
        return {
          fieldKey: 'how_to_rent_served',
          label: "'How to Rent' guide provided",
          helpText:
            "The government 'How to Rent' guide must have been provided to the tenant (required for tenancies starting on or after 1 October 2015).",
        };
      case 'S21_GAS_CERT_UNKNOWN':
        return {
          fieldKey: 'gas_safety_cert_served',
          label: 'Gas Safety Certificate provided',
          helpText:
            'A valid Gas Safety Certificate (CP12) must be provided to the tenant before they move in and annually thereafter (if gas appliances are present).',
        };
      case 'S21_DEPOSIT_PROTECTION_UNKNOWN':
        return {
          fieldKey: 'deposit_protected',
          label: 'Deposit protected in approved scheme',
          helpText:
            'The deposit must be protected in an approved tenancy deposit scheme (DPS, MyDeposits, or TDS) within 30 days of receipt.',
        };
      case 'S21_LICENCE_STATUS_UNKNOWN':
        return {
          fieldKey: 'has_valid_licence',
          label: 'Valid property licence held',
          helpText:
            'The property requires licensing (HMO or selective licence). You must confirm you hold a valid licence.',
        };
      default:
        return {
          fieldKey: errorCode.toLowerCase().replace('s21_', '').replace('_unknown', '_served'),
          label: errorCode.replace('S21_', '').replace(/_/g, ' '),
          helpText: 'Please confirm this requirement has been met.',
        };
    }
  };

  // Check if all required confirmations are provided
  const allConfirmed = requiredActions.every((action) => {
    const mapping = getFieldMapping(action.errorCode);
    return confirmations[mapping.fieldKey] === true;
  });

  // Handle checkbox change
  const handleConfirmationChange = (fieldKey: string, value: boolean) => {
    setConfirmations((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
    setError(null);
  };

  // Submit confirmations and resume fulfillment
  const handleSubmit = async () => {
    if (!allConfirmed) {
      setError('Please confirm all requirements before continuing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/resume-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          confirmations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if there are still missing confirmations
        if (data.code === 'SECTION21_PRECONDITIONS_STILL_MISSING' && data.details?.missingConfirmations) {
          setError(
            `Some requirements are still missing: ${data.details.missingConfirmations
              .map((c: RequiredAction) => c.label)
              .join(', ')}`
          );
        } else {
          setError(data.error || 'Failed to resume document generation. Please try again.');
        }
        return;
      }

      // Success!
      setSuccess(true);

      // Call parent callbacks
      onResumeFulfillment();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Resume fulfillment error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already successful, show success message
  if (success) {
    return (
      <Card padding="large" className="border-2 border-success/30 bg-success/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
            <RiCheckboxCircleLine className="w-7 h-7 text-success" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-success mb-1">Requirements Confirmed</h2>
            <p className="text-gray-700">
              Your Section 21 documents are now being generated. Please wait a moment while we
              complete the process.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="large" className="border-2 border-amber-300 bg-amber-50">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <RiErrorWarningLine className="w-7 h-7 text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-amber-900 mb-1">
            Action Required to Generate Section 21 Notice
          </h2>
          <p className="text-amber-800">
            Your Section 21 notice cannot be generated until you confirm the following statutory
            requirements have been met. This is a legal requirement under the Housing Act 1988.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          {error}
        </div>
      )}

      {/* Required confirmations */}
      <div className="space-y-4 mb-6">
        {requiredActions.map((action) => {
          const mapping = getFieldMapping(action.errorCode);
          const isConfirmed = confirmations[mapping.fieldKey] === true;

          return (
            <div
              key={action.errorCode}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isConfirmed
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-amber-300'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => handleConfirmationChange(mapping.fieldKey, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{mapping.label}</div>
                  <p className="text-sm text-gray-600 mt-1">{mapping.helpText}</p>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Warning notice */}
      <div className="mb-6 p-4 rounded-lg bg-amber-100 border border-amber-200">
        <p className="text-sm text-amber-900">
          <strong>Important:</strong> By confirming these requirements, you are declaring that each
          statutory requirement was properly satisfied. If any requirement was not met, your Section
          21 notice may be invalid and unenforceable in court.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!allConfirmed || isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Documents...
            </>
          ) : (
            <>
              <RiRefreshLine className="w-4 h-4 mr-2" />
              Confirm & Generate Case Bundle
            </>
          )}
        </Button>

        {!allConfirmed && (
          <p className="text-sm text-gray-500 self-center">
            Please confirm all {requiredActions.length} requirement(s) above to continue.
          </p>
        )}
      </div>
    </Card>
  );
};

export default Section21ActionRequired;
