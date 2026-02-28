// src/components/wizard/shared/CourtFinderLink.tsx

'use client';

import React from 'react';

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
type Context = 'money_claim' | 'eviction_pack';

interface CourtFinderLinkProps {
  jurisdiction: Jurisdiction;
  context: Context;
  className?: string;
}

/**
 * Court Finder URLs by jurisdiction and context
 *
 * IMPORTANT: England and Wales are SEPARATE jurisdictions but share
 * the same HMCTS Money Claims Online service for money claims.
 * Scotland uses the Scotcourts locator for ALL court matters.
 */
const COURT_FINDER_URLS: Record<Jurisdiction, Record<Context, string | null>> = {
  england: {
    money_claim: 'https://www.find-court-tribunal.service.gov.uk/services/money/money-claims/nearest/search-by-postcode',
    eviction_pack: 'https://www.find-court-tribunal.service.gov.uk/services/money/housing/nearest/search-by-postcode',
  },
  wales: {
    // Wales uses the same HMCTS service but remains a separate jurisdiction
    money_claim: 'https://www.find-court-tribunal.service.gov.uk/services/money/money-claims/nearest/search-by-postcode',
    eviction_pack: 'https://www.find-court-tribunal.service.gov.uk/services/money/housing/nearest/search-by-postcode',
  },
  scotland: {
    // Scotland uses Scotcourts locator for both money claims and eviction
    money_claim: 'https://www.scotcourts.gov.uk/courts-and-tribunals/courts-tribunals-and-office-locations/find-us/#/court-locator',
    eviction_pack: 'https://www.scotcourts.gov.uk/courts-and-tribunals/courts-tribunals-and-office-locations/find-us/#/court-locator',
  },
  'northern-ireland': {
    // Northern Ireland not supported for money claims or eviction packs
    money_claim: null,
    eviction_pack: null,
  },
};

/**
 * Labels by jurisdiction and context
 */
const LABELS: Record<Jurisdiction, Record<Context, string>> = {
  england: {
    money_claim: 'Find your County Court (HMCTS)',
    eviction_pack: 'Find your County Court (HMCTS)',
  },
  wales: {
    money_claim: 'Find your County Court (HMCTS)',
    eviction_pack: 'Find your County Court (HMCTS)',
  },
  scotland: {
    money_claim: 'Find your Sheriff Court (Scotcourts)',
    eviction_pack: 'Find your Sheriff Court (Scotcourts)',
  },
  'northern-ireland': {
    money_claim: 'Court finder not available',
    eviction_pack: 'Court finder not available',
  },
};

/**
 * Descriptions by jurisdiction and context
 */
const DESCRIPTIONS: Record<Jurisdiction, Record<Context, string>> = {
  england: {
    money_claim: 'Use the HMCTS Court Finder to locate the County Court that will handle your money claim.',
    eviction_pack: 'Use the HMCTS Court Finder to locate the County Court that will handle your possession claim.',
  },
  wales: {
    money_claim: 'Use the HMCTS Court Finder to locate the County Court that will handle your money claim in Wales.',
    eviction_pack: 'Use the HMCTS Court Finder to locate the County Court that will handle your possession claim in Wales.',
  },
  scotland: {
    money_claim: 'Use the Scotcourts locator to find the Sheriff Court for your Simple Procedure claim.',
    eviction_pack: 'Use the Scotcourts locator to find the Sheriff Court for your eviction proceedings.',
  },
  'northern-ireland': {
    money_claim: 'Money claims are not currently supported for Northern Ireland.',
    eviction_pack: 'Eviction packs are not currently supported for Northern Ireland.',
  },
};

/**
 * CourtFinderLink - A reusable component that displays the correct court finder link
 * based on jurisdiction and context (money claim or eviction pack).
 *
 * Links open in a new tab with proper security attributes.
 */
export const CourtFinderLink: React.FC<CourtFinderLinkProps> = ({
  jurisdiction,
  context,
  className = '',
}) => {
  const url = COURT_FINDER_URLS[jurisdiction]?.[context];
  const label = LABELS[jurisdiction]?.[context] || 'Find your court';
  const description = DESCRIPTIONS[jurisdiction]?.[context] || '';

  // Don't render anything for unsupported jurisdictions
  if (!url) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-purple-200 bg-purple-50 p-4 ${className}`}>
      <h3 className="text-sm font-medium text-purple-900 mb-2">
        Court Information Required
      </h3>
      <p className="text-sm text-purple-800 mb-3">
        {description}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-md hover:bg-[#6D28D9] transition-colors"
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
        {label}
      </a>
      <p className="text-xs text-purple-700 mt-2">
        Opens in a new tab
      </p>
    </div>
  );
};

/**
 * Utility function to get court finder URL for a given jurisdiction and context
 * Can be used in non-React contexts (e.g., server-side rendering, API responses)
 */
export function getCourtFinderUrl(
  jurisdiction: Jurisdiction,
  context: Context
): string | null {
  return COURT_FINDER_URLS[jurisdiction]?.[context] ?? null;
}

export default CourtFinderLink;
