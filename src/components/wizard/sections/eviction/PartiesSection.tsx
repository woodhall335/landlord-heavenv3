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

interface PartiesSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

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
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="landlord_full_name" className="block text-sm font-medium text-gray-700">
              Full name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="landlord_full_name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_full_name || ''}
              onChange={(e) => onUpdate({ landlord_full_name: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label htmlFor="landlord_address_line1" className="block text-sm font-medium text-gray-700">
              Address line 1
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="landlord_address_line1"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_address_line1 || ''}
              onChange={(e) => onUpdate({ landlord_address_line1: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="landlord_address_town" className="block text-sm font-medium text-gray-700">
              Town/City
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="landlord_address_town"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_address_town || ''}
              onChange={(e) => onUpdate({ landlord_address_town: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="landlord_address_postcode" className="block text-sm font-medium text-gray-700">
              Postcode
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="landlord_address_postcode"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_address_postcode || ''}
              onChange={(e) => onUpdate({ landlord_address_postcode: e.target.value })}
              placeholder="e.g., SW1A 1AA"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="landlord_email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="landlord_email"
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_email || ''}
              onChange={(e) => onUpdate({ landlord_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="landlord_phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              id="landlord_phone"
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.landlord_phone || ''}
              onChange={(e) => onUpdate({ landlord_phone: e.target.value })}
            />
          </div>
        </div>

        {/* Joint landlords toggle */}
        <div className="pt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasJointLandlords}
              onChange={(e) => onUpdate({ has_joint_landlords: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          <div className="pt-4 pl-4 border-l-2 border-blue-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Second Landlord</h4>
            <div className="space-y-2">
              <label htmlFor="landlord2_name" className="block text-sm font-medium text-gray-700">
                Full name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="landlord2_name"
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={facts.landlord2_name || ''}
                onChange={(e) => onUpdate({ landlord2_name: e.target.value })}
                placeholder="e.g., Jane Smith"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tenant Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Tenant Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="tenant_full_name" className="block text-sm font-medium text-gray-700">
              Full name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="tenant_full_name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.tenant_full_name || ''}
              onChange={(e) => onUpdate({ tenant_full_name: e.target.value })}
              placeholder="e.g., Alice Johnson"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tenant_email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="tenant_email"
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.tenant_email || ''}
              onChange={(e) => onUpdate({ tenant_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tenant_phone" className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <input
              id="tenant_phone"
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.tenant_phone || ''}
              onChange={(e) => onUpdate({ tenant_phone: e.target.value })}
            />
          </div>
        </div>

        {/* Joint tenants toggle */}
        <div className="pt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={hasJointTenants}
              onChange={(e) => onUpdate({ has_joint_tenants: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          <div className="pt-4 pl-4 border-l-2 border-blue-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Additional Tenants</h4>

            <div className="space-y-2">
              <label htmlFor="tenant2_name" className="block text-sm font-medium text-gray-700">
                Second tenant full name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="tenant2_name"
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={facts.tenant2_name || ''}
                onChange={(e) => onUpdate({ tenant2_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tenant3_name" className="block text-sm font-medium text-gray-700">
                Third tenant full name (if applicable)
              </label>
              <input
                id="tenant3_name"
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={facts.tenant3_name || ''}
                onChange={(e) => onUpdate({ tenant3_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tenant4_name" className="block text-sm font-medium text-gray-700">
                Fourth tenant full name (if applicable)
              </label>
              <input
                id="tenant4_name"
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={facts.tenant4_name || ''}
                onChange={(e) => onUpdate({ tenant4_name: e.target.value })}
              />
            </div>

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
