/**
 * Court & Signing Section - Eviction Wizard
 *
 * Step 9: Collects court details and statement of truth signatory information.
 *
 * Fields:
 * - court_name: County Court that will handle the claim (required)
 * - court_address: Optional - address for reference
 * - signatory_name: Person signing the Statement of Truth (required)
 * - signatory_capacity: claimant / solicitor / agent (required)
 * - signature_date: Date of signature (defaults based on route)
 *
 * Legal Context:
 * - N5, N5B, N119 all require a Statement of Truth
 * - False statements are contempt of court
 * - Signatory must have authority to sign (landlord, solicitor, or agent)
 *
 * Section 8 Complete Pack: signature_date MUST be >= notice_expiry_date
 * - Auto-defaults to notice_expiry_date (earliest permissible date)
 * - User can choose a later date but not an earlier one
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiExternalLinkLine, RiErrorWarningLine } from 'react-icons/ri';

interface CourtSigningSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  product?: string;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const HMCTS_COURT_FINDER_URL =
  'https://www.find-court-tribunal.service.gov.uk/services/money/housing/nearest/search-by-postcode';

const SIGNATORY_CAPACITIES = [
  { value: 'claimant', label: 'Claimant (Landlord)' },
  { value: 'joint_claimant', label: 'Joint Claimant (Joint Landlord)' },
  { value: 'solicitor', label: "Claimant's Solicitor" },
  { value: 'agent', label: "Claimant's Agent (Litigation Friend)" },
];

export const CourtSigningSection: React.FC<CourtSigningSectionProps> = ({
  facts,
  product = 'complete_pack',
  onUpdate,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Determine route from facts (Section 8 vs Section 21)
  const route = facts.eviction_route || facts.selected_notice_route || '';
  const isSection8 = route === 'section_8' || route === 'section8_notice';
  const isCompletePack = product === 'complete_pack';

  // Get notice expiry date (for Section 8 signature date validation)
  const noticeExpiryDate = facts.notice_expiry_date ||
                           facts.expiry_date ||
                           (facts.notice as any)?.expiry_date;

  // Calculate the minimum allowed signature date for Section 8 complete pack
  const minSignatureDate = useMemo(() => {
    if (isSection8 && isCompletePack && noticeExpiryDate) {
      return noticeExpiryDate;
    }
    return today;
  }, [isSection8, isCompletePack, noticeExpiryDate, today]);

  // Compute the effective signature date (respecting the minimum)
  const signatureDate = useMemo(() => {
    const currentValue = facts.signature_date;
    if (!currentValue) {
      // No value set - use the minimum allowed date
      return minSignatureDate;
    }
    // For Section 8 complete pack, ensure signature date is not before notice expiry
    if (isSection8 && isCompletePack && noticeExpiryDate && currentValue < noticeExpiryDate) {
      return noticeExpiryDate;
    }
    return currentValue;
  }, [facts.signature_date, minSignatureDate, isSection8, isCompletePack, noticeExpiryDate]);

  // Validate signature date - show error if before notice expiry
  const [signatureDateError, setSignatureDateError] = useState<string | null>(null);

  // Initialize default values for signatory_name and signature_date
  // This ensures displayed defaults are saved to facts for isComplete checks
  useEffect(() => {
    const updates: Record<string, any> = {};

    // If signatory_name not set but we have landlord name, use that as default
    if (!facts.signatory_name && facts.landlord_full_name) {
      updates.signatory_name = facts.landlord_full_name;
    }

    // For Section 8 complete pack: default signature_date to notice_expiry_date
    // Otherwise default to today
    if (!facts.signature_date) {
      if (isSection8 && isCompletePack && noticeExpiryDate) {
        updates.signature_date = noticeExpiryDate;
      } else {
        updates.signature_date = today;
      }
    } else if (isSection8 && isCompletePack && noticeExpiryDate) {
      // If signature_date is set but is before notice_expiry_date, correct it
      if (facts.signature_date < noticeExpiryDate) {
        updates.signature_date = noticeExpiryDate;
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeExpiryDate]); // Re-run when notice_expiry_date changes

  // Handle signature date change with validation
  const handleSignatureDateChange = (newDate: string) => {
    // For Section 8 complete pack, validate against notice expiry
    if (isSection8 && isCompletePack && noticeExpiryDate && newDate < noticeExpiryDate) {
      setSignatureDateError(
        `Signature date cannot be before notice expiry (${noticeExpiryDate}). ` +
        `Court forms can only be signed after the notice period expires.`
      );
      // Still update but show the error
      onUpdate({ signature_date: newDate });
    } else {
      setSignatureDateError(null);
      onUpdate({ signature_date: newDate });
    }
  };

  return (
    <div className="space-y-8">
      {/* Court Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Court Details
        </h3>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Find Your Local County Court
          </h4>
          <p className="text-sm text-purple-800 mb-3">
            Use the official HMCTS Court Finder to find the County Court that will
            handle your possession claim. Search using the property postcode.
          </p>
          <a
            href={HMCTS_COURT_FINDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-md hover:bg-[#6D28D9] transition-colors"
          >
            <RiExternalLinkLine className="w-4 h-4 text-white" />
            Find your court (opens in new tab)
          </a>
        </div>

        <div className="space-y-2">
          <label htmlFor="court_name" className="block text-sm font-medium text-gray-700">
            Court name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="court_name"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.court_name || ''}
            onChange={(e) => onUpdate({ court_name: e.target.value })}
            placeholder="e.g., Manchester County Court"
          />
          <p className="text-xs text-gray-500">
            Copy the court name exactly as shown in the Court Finder results.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="court_address" className="block text-sm font-medium text-gray-700">
            Court address (optional)
          </label>
          <textarea
            id="court_address"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.court_address || ''}
            onChange={(e) => onUpdate({ court_address: e.target.value })}
            placeholder="e.g., 1 Bridge Street West, Manchester, M60 9DJ"
          />
          <p className="text-xs text-gray-500">
            For your reference. Include the full address and postcode.
          </p>
        </div>
      </div>

      {/* Statement of Truth */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Statement of Truth
        </h3>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Important: Legal Declaration
          </h4>
          <p className="text-sm text-amber-800">
            Court forms include a Statement of Truth declaring that the facts stated are true.
            <strong> Making a false statement is contempt of court</strong> and may result in
            proceedings against the signatory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="signatory_name" className="block text-sm font-medium text-gray-700">
              Full name of person signing
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="signatory_name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.signatory_name || facts.landlord_full_name || ''}
              onChange={(e) => onUpdate({ signatory_name: e.target.value })}
              placeholder="Full legal name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signatory_capacity" className="block text-sm font-medium text-gray-700">
              Capacity
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="signatory_capacity"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.signatory_capacity || ''}
              onChange={(e) => onUpdate({ signatory_capacity: e.target.value })}
            >
              <option value="">Select capacity...</option>
              {SIGNATORY_CAPACITIES.map((cap) => (
                <option key={cap.value} value={cap.value}>
                  {cap.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              The signatory must have authority to sign on behalf of the claimant(s).
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="signature_date" className="block text-sm font-medium text-gray-700">
              Date of signature
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="signature_date"
              type="date"
              className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-1 ${
                signatureDateError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#7C3AED] focus:ring-[#7C3AED]'
              }`}
              value={signatureDate}
              min={isSection8 && isCompletePack && noticeExpiryDate ? noticeExpiryDate : undefined}
              onChange={(e) => handleSignatureDateChange(e.target.value)}
            />
            {signatureDateError ? (
              <div className="flex items-start gap-2 text-xs text-red-600 mt-1">
                <RiErrorWarningLine className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{signatureDateError}</span>
              </div>
            ) : isSection8 && isCompletePack && noticeExpiryDate ? (
              <p className="text-xs text-gray-500">
                For Section 8 claims, signature date must be on or after notice expiry ({noticeExpiryDate}).
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Usually the date you submit the claim. Defaults to today.
              </p>
            )}
          </div>
        </div>

        {/* Preview Statement of Truth */}
        {facts.signatory_name && facts.signatory_capacity && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Statement of Truth Preview
            </h4>
            <p className="text-sm text-gray-700 italic">
              &ldquo;I believe that the facts stated in this claim form are true. I understand
              that proceedings for contempt of court may be brought against anyone who makes,
              or causes to be made, a false statement in a document verified by a statement
              of truth without an honest belief in its truth.&rdquo;
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm">
                <strong>Signed:</strong> {facts.signatory_name}
              </p>
              <p className="text-sm">
                <strong>Capacity:</strong>{' '}
                {SIGNATORY_CAPACITIES.find((c) => c.value === facts.signatory_capacity)?.label}
              </p>
              <p className="text-sm">
                <strong>Date:</strong> {signatureDate}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourtSigningSection;
