/**
 * Parties Section - Eviction Wizard
 *
 * Step 2: Collects landlord and tenant details with joint party support.
 *
 * Critical legal requirement: ALL parties named on the tenancy agreement
 * must be named on eviction notices and court forms.
 *
 * Fields:
 * - Landlord: name, address, email, phone
 * - Joint landlords: second landlord name (if applicable)
 * - Tenant: name, email, phone
 * - Joint tenants: additional tenant names (if applicable)
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { ValidatedInput } from '@/components/wizard/ValidatedField';

interface PartiesSectionProps {
  facts: WizardFacts;
  // Scotland uses the same party fields as England/Wales - no jurisdiction-specific logic
  jurisdiction: 'england' | 'wales' | 'scotland';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SECTION_ID = 'parties';

export const PartiesSection: React.FC<PartiesSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const hasJointLandlords = facts.has_joint_landlords === true;
  const hasJointTenants = facts.has_joint_tenants === true;

  return (
    <div className="space-y-8">
      {/* Landlord Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Landlord Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ValidatedInput
              id="landlord_full_name"
              label="Full name"
              value={facts.landlord_full_name as string}
              onChange={(v) => onUpdate({ landlord_full_name: v })}
              validation={{ required: true }}
              required
              placeholder="e.g., John Smith"
              sectionId={SECTION_ID}
            />
          </div>

          <div className="md:col-span-2">
            <ValidatedInput
              id="landlord_address_line1"
              label="Address line 1"
              value={facts.landlord_address_line1 as string}
              onChange={(v) => onUpdate({ landlord_address_line1: v })}
              validation={{ required: true }}
              required
              placeholder="Street address"
              sectionId={SECTION_ID}
            />
          </div>

          <ValidatedInput
            id="landlord_address_town"
            label="Town/City"
            value={facts.landlord_address_town as string}
            onChange={(v) => onUpdate({ landlord_address_town: v })}
            validation={{ required: true }}
            required
            sectionId={SECTION_ID}
          />

          <ValidatedInput
            id="landlord_address_postcode"
            label="Postcode"
            value={facts.landlord_address_postcode as string}
            onChange={(v) => onUpdate({ landlord_address_postcode: v })}
            validation={{ required: true, pattern: '^[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}$' }}
            required
            placeholder="e.g., SW1A 1AA"
            sectionId={SECTION_ID}
          />

          <ValidatedInput
            id="landlord_email"
            label="Email (optional)"
            type="email"
            value={facts.landlord_email as string}
            onChange={(v) => onUpdate({ landlord_email: v })}
            validation={{ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }}
            sectionId={SECTION_ID}
          />

          <ValidatedInput
            id="landlord_phone"
            label="Phone (optional)"
            type="tel"
            value={facts.landlord_phone as string}
            onChange={(v) => onUpdate({ landlord_phone: v })}
            sectionId={SECTION_ID}
          />
        </div>

        {/* Joint landlords toggle */}
        <div className="pt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasJointLandlords}
              onChange={(e) => onUpdate({ has_joint_landlords: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span className="text-sm text-gray-700">
              There are joint landlords on the tenancy agreement
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            All landlords named on the tenancy must be named on court forms.
          </p>
        </div>

        {/* Second landlord details */}
        {hasJointLandlords && (
          <div className="pt-4 pl-4 border-l-2 border-purple-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Second Landlord</h4>
            <ValidatedInput
              id="landlord2_name"
              label="Full name"
              value={facts.landlord2_name as string}
              onChange={(v) => onUpdate({ landlord2_name: v })}
              validation={{ required: true }}
              required
              placeholder="e.g., Jane Smith"
              sectionId={SECTION_ID}
            />
          </div>
        )}
      </div>

      {/* Tenant Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Tenant Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ValidatedInput
              id="tenant_full_name"
              label="Full name"
              value={facts.tenant_full_name as string}
              onChange={(v) => onUpdate({ tenant_full_name: v })}
              validation={{ required: true }}
              required
              placeholder="e.g., Alice Johnson"
              sectionId={SECTION_ID}
            />
          </div>

          <ValidatedInput
            id="tenant_email"
            label="Email (optional)"
            type="email"
            value={facts.tenant_email as string}
            onChange={(v) => onUpdate({ tenant_email: v })}
            validation={{ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }}
            sectionId={SECTION_ID}
          />

          <ValidatedInput
            id="tenant_phone"
            label="Phone (optional)"
            type="tel"
            value={facts.tenant_phone as string}
            onChange={(v) => onUpdate({ tenant_phone: v })}
            sectionId={SECTION_ID}
          />
        </div>

        {/* Joint tenants toggle */}
        <div className="pt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasJointTenants}
              onChange={(e) => onUpdate({ has_joint_tenants: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span className="text-sm text-gray-700">
              There are joint tenants on the tenancy agreement
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            CRITICAL: A notice is INVALID if it omits any tenant named on the tenancy agreement.
          </p>
        </div>

        {/* Additional tenant details */}
        {hasJointTenants && (
          <div className="pt-4 pl-4 border-l-2 border-purple-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Additional Tenants</h4>

            <ValidatedInput
              id="tenant2_name"
              label="Second tenant full name"
              value={facts.tenant2_name as string}
              onChange={(v) => onUpdate({ tenant2_name: v })}
              validation={{ required: true }}
              required
              sectionId={SECTION_ID}
            />

            <ValidatedInput
              id="tenant3_name"
              label="Third tenant full name (if applicable)"
              value={facts.tenant3_name as string}
              onChange={(v) => onUpdate({ tenant3_name: v })}
              sectionId={SECTION_ID}
            />

            <ValidatedInput
              id="tenant4_name"
              label="Fourth tenant full name (if applicable)"
              value={facts.tenant4_name as string}
              onChange={(v) => onUpdate({ tenant4_name: v })}
              sectionId={SECTION_ID}
            />

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Court forms (N5, N5B) have limited space for defendant names.
                If you have more than 4 tenants, the form will list the first 4 with
                &quot;and others&quot; noted. All tenants will be named in the particulars of claim.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartiesSection;
