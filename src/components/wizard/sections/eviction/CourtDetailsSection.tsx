'use client';

import React from 'react';

/**
 * Court Details Section for Complete Pack Flows
 *
 * This section collects court name and address for England complete-pack generation.
 * It is shared between Section 8 (N5 + N119) and Section 21 accelerated (N5B) flows.
 *
 * The user manually searches the HMCTS Court Finder and copy/pastes the court details.
 * There is NO automatic lookup or API integration.
 */

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

interface SectionProps {
  facts: any;
  jurisdiction?: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const HMCTS_COURT_FINDER_URL =
  'https://www.find-court-tribunal.service.gov.uk/services/money/housing/nearest/search-by-postcode';

export const CourtDetailsSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const courtName = facts.court_name || '';
  const courtAddress = facts.court_address || '';

  const isEnglandWales = jurisdiction === 'england' || jurisdiction === 'wales';

  // Only show for England/Wales complete packs
  if (!isEnglandWales) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Court Details Required for Complete Pack
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          To generate court forms (N5, N5B, or N119), you need to provide the name
          and address of the County Court that will handle your possession claim.
        </p>
        <p className="text-sm text-blue-800">
          Use the official HMCTS Court Finder to search by postcode and find your
          local court:
        </p>
        <a
          href={HMCTS_COURT_FINDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Find your court (opens in new tab)
        </a>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="court_name"
            className="block text-sm font-medium text-gray-700"
          >
            Court name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="court_name"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={courtName}
            onChange={(e) => onUpdate({ court_name: e.target.value })}
            placeholder="e.g., Manchester County Court"
          />
          <p className="text-xs text-gray-500">
            Copy the court name exactly as shown in the Court Finder results.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="court_address"
            className="block text-sm font-medium text-gray-700"
          >
            Court address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="court_address"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={courtAddress}
            onChange={(e) => onUpdate({ court_address: e.target.value })}
            placeholder="e.g., 1 Bridge Street West, Manchester, M60 9DJ"
          />
          <p className="text-xs text-gray-500">
            Copy the full court address from the Court Finder, including the
            postcode.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> Ensure the court details are correct. Court
          forms with incorrect court information may be rejected or cause delays
          in your possession claim.
        </p>
      </div>
    </div>
  );
};

export default CourtDetailsSection;
