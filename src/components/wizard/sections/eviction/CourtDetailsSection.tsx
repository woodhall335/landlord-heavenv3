'use client';

import React from 'react';
import { CourtFinderLink } from '@/components/wizard/shared/CourtFinderLink';
import {
  EVICTION_HINT_CLASS,
  EVICTION_INPUT_CLASS,
  EVICTION_LABEL_CLASS,
  EVICTION_TEXTAREA_CLASS,
  EVICTION_TINTED_CARD_CLASS,
} from '@/components/wizard/sections/eviction/ui';

/**
 * Court Details Section for Complete Pack Flows
 *
 * This section collects court name and address for eviction pack generation.
 * Supports England, Wales, and Scotland with jurisdiction-specific court finders.
 *
 * - England/Wales: Uses HMCTS Court Finder for housing claims
 * - Scotland: Uses Scotcourts locator for Sheriff Court
 *
 * The user manually searches the Court Finder and copy/pastes the court details.
 * There is NO automatic lookup or API integration.
 */

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

interface SectionProps {
  facts: any;
  jurisdiction?: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const CourtDetailsSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const courtName = facts.court_name || '';
  const courtAddress = facts.court_address || '';

  const isSupported = jurisdiction === 'england' || jurisdiction === 'wales' || jurisdiction === 'scotland';
  const isScotland = jurisdiction === 'scotland';

  // Only show for supported jurisdictions
  if (!isSupported || !jurisdiction) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Jurisdiction-specific Court Finder Link */}
      <CourtFinderLink jurisdiction={jurisdiction} context="eviction_pack" />

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="court_name"
            className={EVICTION_LABEL_CLASS}
          >
            {isScotland ? 'Sheriff Court name' : 'Court name'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="court_name"
            type="text"
            className={EVICTION_INPUT_CLASS}
            value={courtName}
            onChange={(e) => onUpdate({ court_name: e.target.value })}
            placeholder={isScotland ? 'e.g., Edinburgh Sheriff Court' : 'e.g., Manchester County Court'}
          />
          <p className={EVICTION_HINT_CLASS}>
            Copy the court name exactly as shown in the {isScotland ? 'Scotcourts locator' : 'Court Finder'} results.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="court_address"
            className={EVICTION_LABEL_CLASS}
          >
            Court address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="court_address"
            className={`${EVICTION_TEXTAREA_CLASS} min-h-[120px]`}
            value={courtAddress}
            onChange={(e) => onUpdate({ court_address: e.target.value })}
            placeholder={isScotland ? 'e.g., 27 Chambers Street, Edinburgh, EH1 1LB' : 'e.g., 1 Bridge Street West, Manchester, M60 9DJ'}
          />
          <p className={EVICTION_HINT_CLASS}>
            Copy the full court address from the {isScotland ? 'Scotcourts locator' : 'Court Finder'}, including the
            postcode.
          </p>
        </div>
      </div>

      <div className={`${EVICTION_TINTED_CARD_CLASS} border-amber-200 bg-amber-50`}>
        <p className="text-sm leading-6 text-amber-900">
          <strong>Important:</strong> Ensure the court details are correct. Court
          forms with incorrect court information may be rejected or cause delays
          in your {isScotland ? 'eviction proceedings' : 'possession claim'}.
        </p>
      </div>
    </div>
  );
};

export default CourtDetailsSection;
