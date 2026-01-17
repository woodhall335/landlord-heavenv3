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
 * - signature_date: Date of signature (defaults to today, editable)
 *
 * Legal Context:
 * - N5, N5B, N119 all require a Statement of Truth
 * - False statements are contempt of court
 * - Signatory must have authority to sign (landlord, solicitor, or agent)
 */

'use client';

import React, { useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { RiExternalLinkLine } from 'react-icons/ri';

interface CourtSigningSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
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
  onUpdate,
}) => {
  // Default signature date to today if not set
  const today = new Date().toISOString().split('T')[0];
  const signatureDate = facts.signature_date || today;

  // Initialize default values for signatory_name and signature_date
  // This ensures displayed defaults are saved to facts for isComplete checks
  useEffect(() => {
    const updates: Record<string, any> = {};

    // If signatory_name not set but we have landlord name, use that as default
    if (!facts.signatory_name && facts.landlord_full_name) {
      updates.signatory_name = facts.landlord_full_name;
    }

    // If signature_date not set, default to today
    if (!facts.signature_date) {
      updates.signature_date = today;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally empty deps

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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={signatureDate}
              onChange={(e) => onUpdate({ signature_date: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Usually the date you submit the claim. Defaults to today.
            </p>
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
