/**
 * Property Section - Eviction Wizard
 *
 * Step 3: Collects the rental property address.
 *
 * This is the property being repossessed, which must match the tenancy agreement.
 * The postcode is particularly important for court fee calculation and court selection.
 *
 * Fields:
 * - property_address_line1: Street address
 * - property_address_line2: Optional additional line
 * - property_address_town: Town/City
 * - property_address_postcode: Postcode (required for court selection)
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { ValidatedInput } from '@/components/wizard/ValidatedField';

interface PropertySectionProps {
  facts: WizardFacts;
  // Scotland uses the same property address fields as England/Wales - no jurisdiction-specific logic
  jurisdiction: 'england' | 'wales' | 'scotland';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SECTION_ID = 'property';

export const PropertySection: React.FC<PropertySectionProps> = ({
  facts,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800">
          Enter the address of the rental property exactly as it appears on the tenancy agreement.
          This address will appear on all notices and court forms.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ValidatedInput
          id="property_address_line1"
          label="Building and street"
          value={facts.property_address_line1 as string}
          onChange={(v) => onUpdate({ property_address_line1: v })}
          validation={{ required: true }}
          required
          placeholder="e.g., 123 High Street, Flat 4A"
          sectionId={SECTION_ID}
        />

        <ValidatedInput
          id="property_address_line2"
          label="Address line 2 (optional)"
          value={facts.property_address_line2 as string}
          onChange={(v) => onUpdate({ property_address_line2: v })}
          placeholder="e.g., Building name, district"
          sectionId={SECTION_ID}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            id="property_address_town"
            label="Town/City"
            value={facts.property_address_town as string}
            onChange={(v) => onUpdate({ property_address_town: v })}
            validation={{ required: true }}
            required
            placeholder="e.g., Manchester"
            sectionId={SECTION_ID}
          />

          <ValidatedInput
            id="property_address_postcode"
            label="Postcode"
            value={facts.property_address_postcode as string}
            onChange={(v) => onUpdate({ property_address_postcode: String(v).toUpperCase() })}
            validation={{ required: true, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}$' }}
            required
            placeholder="e.g., M1 1AA"
            helperText="The postcode determines which County Court will handle your claim."
            sectionId={SECTION_ID}
          />
        </div>
      </div>

      {/* Preview */}
      {(facts.property_address_line1 || facts.property_address_postcode) && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Address Preview</h4>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <address className="not-italic text-sm text-gray-900">
              {facts.property_address_line1 && <div>{facts.property_address_line1}</div>}
              {facts.property_address_line2 && <div>{facts.property_address_line2}</div>}
              {facts.property_address_town && <div>{facts.property_address_town}</div>}
              {facts.property_address_postcode && <div>{facts.property_address_postcode}</div>}
            </address>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySection;
