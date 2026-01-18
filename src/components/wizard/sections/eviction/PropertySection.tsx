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

interface PropertySectionProps {
  facts: WizardFacts;
  // Scotland uses the same property address fields as England/Wales - no jurisdiction-specific logic
  jurisdiction: 'england' | 'wales' | 'scotland';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

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
        <div className="space-y-2">
          <label htmlFor="property_address_line1" className="block text-sm font-medium text-gray-700">
            Building and street
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="property_address_line1"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.property_address_line1 || ''}
            onChange={(e) => onUpdate({ property_address_line1: e.target.value })}
            placeholder="e.g., 123 High Street, Flat 4A"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property_address_line2" className="block text-sm font-medium text-gray-700">
            Address line 2 (optional)
          </label>
          <input
            id="property_address_line2"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.property_address_line2 || ''}
            onChange={(e) => onUpdate({ property_address_line2: e.target.value })}
            placeholder="e.g., Building name, district"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="property_address_town" className="block text-sm font-medium text-gray-700">
              Town/City
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="property_address_town"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.property_address_town || ''}
              onChange={(e) => onUpdate({ property_address_town: e.target.value })}
              placeholder="e.g., Manchester"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="property_address_postcode" className="block text-sm font-medium text-gray-700">
              Postcode
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="property_address_postcode"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.property_address_postcode || ''}
              onChange={(e) => onUpdate({ property_address_postcode: e.target.value.toUpperCase() })}
              placeholder="e.g., M1 1AA"
            />
            <p className="text-xs text-gray-500">
              The postcode determines which County Court will handle your claim.
            </p>
          </div>
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
