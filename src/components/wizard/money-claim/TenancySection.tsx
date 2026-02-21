// src/components/wizard/money-claim/TenancySection.tsx

'use client';

import React from 'react';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const TenancySection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const tenancy = facts.tenancy || {};
  const property = facts.property || {};

  /**
   * Updates tenancy data in both nested (tenancy.*) and top-level keys.
   * The validator expects top-level keys like tenancy_start_date, rent_amount, rent_frequency.
   * We maintain both for backward compatibility and to ensure validation works correctly.
   */
  const updateTenancy = (field: string, value: any) => {
    // Map nested fields to top-level validator keys
    const topLevelKeyMap: Record<string, string> = {
      start_date: 'tenancy_start_date',
      end_date: 'tenancy_end_date',
      rent_amount: 'rent_amount',
      rent_frequency: 'rent_frequency',
      rent_due_day: 'rent_due_day',
    };

    const topLevelKey = topLevelKeyMap[field];

    const updates: Record<string, any> = {
      tenancy: {
        ...tenancy,
        [field]: value,
      },
    };

    // Also write to top-level key for validator compatibility
    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  /**
   * Updates property address data in both nested (property.*) and top-level keys.
   * The validator expects top-level keys like property_address_line1, property_address_postcode.
   * We maintain both for backward compatibility and to ensure validation works correctly.
   */
  const updateProperty = (field: string, value: any) => {
    // Map nested fields to top-level validator keys
    const topLevelKeyMap: Record<string, string> = {
      address_line1: 'property_address_line1',
      address_line2: 'property_address_line2',
      city: 'property_address_town',
      postcode: 'property_address_postcode',
    };

    const topLevelKey = topLevelKeyMap[field];

    const updates: Record<string, any> = {
      property: {
        ...property,
        [field]: value,
      },
    };

    // Also write to top-level key for validator compatibility
    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We use these details to map your claim to the correct court forms and rules for{' '}
        {(jurisdiction === 'england' || jurisdiction === 'wales') ? 'England & Wales' : 'Scotland'}.
      </p>

      {/* Full property address */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Property address line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={property.address_line1 || facts.property_address_line1 || ''}
            onChange={(e) => updateProperty('address_line1', e.target.value)}
            placeholder="e.g. 16 Waterloo Road"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Property address line 2{' '}
            <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={property.address_line2 || facts.property_address_line2 || ''}
            onChange={(e) => updateProperty('address_line2', e.target.value)}
            placeholder="Building, estate or area"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">Town / city</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={property.city || facts.property_address_town || ''}
              onChange={(e) => updateProperty('city', e.target.value)}
              placeholder="e.g. Pudsey"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">
              Postcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={property.postcode || facts.property_address_postcode || ''}
              onChange={(e) => updateProperty('postcode', e.target.value)}
              placeholder="e.g. LS28 7PW"
            />
          </div>
        </div>
      </div>

      {/* Tenancy dates */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Tenancy start date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.start_date || facts.tenancy_start_date || ''}
            onChange={(e) => updateTenancy('start_date', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Tenancy end date{' '}
            <span className="text-xs text-gray-500">(if fixed term)</span>
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.end_date || facts.tenancy_end_date || ''}
            onChange={(e) => updateTenancy('end_date', e.target.value)}
          />
        </div>
      </div>

      {/* Rent basics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Rent amount (£) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.rent_amount ?? facts.rent_amount ?? ''}
            onChange={(e) =>
              updateTenancy(
                'rent_amount',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
            placeholder="e.g. 750"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Rent frequency <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.rent_frequency || facts.rent_frequency || ''}
            onChange={(e) => updateTenancy('rent_frequency', e.target.value)}
          >
            <option value="">Select frequency</option>
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      {/* Rent due day */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          On which day is rent due each period?
        </label>
        <input
          type="number"
          min={1}
          max={31}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={tenancy.rent_due_day ?? facts.rent_due_day ?? ''}
          onChange={(e) =>
            updateTenancy(
              'rent_due_day',
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          placeholder="e.g. 1 (for the 1st of the month)"
        />
        <p className="text-xs text-gray-500">
          This helps calculate the arrears schedule correctly.
        </p>
      </div>
    </div>
  );
};