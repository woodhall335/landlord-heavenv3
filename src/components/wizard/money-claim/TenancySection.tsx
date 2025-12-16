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

  const updateTenancy = (field: string, value: any) => {
    onUpdate({
      tenancy: {
        ...tenancy,
        [field]: value,
      },
    });
  };

  const updateProperty = (field: string, value: any) => {
    onUpdate({
      property: {
        ...property,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        We use these details to map your claim to the correct court forms and rules for{' '}
        {jurisdiction === 'england-wales' ? 'England & Wales' : 'Scotland'}.
      </p>

      {/* Full property address */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Property address line 1
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={property.address_line1 || ''}
            onChange={(e) => updateProperty('address_line1', e.target.value)}
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
            value={property.address_line2 || ''}
            onChange={(e) => updateProperty('address_line2', e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">Town / city</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={property.city || ''}
              onChange={(e) => updateProperty('city', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-charcoal">Postcode</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={property.postcode || ''}
              onChange={(e) => updateProperty('postcode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tenancy dates */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">Tenancy start date</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.start_date || ''}
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
            value={tenancy.end_date || ''}
            onChange={(e) => updateTenancy('end_date', e.target.value)}
          />
        </div>
      </div>

      {/* Rent basics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">Rent amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.rent_amount ?? ''}
            onChange={(e) =>
              updateTenancy(
                'rent_amount',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">Rent frequency</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.rent_frequency || ''}
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

      {/* Rent due day / weekday */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            On which day is rent due each period?
          </label>
          <input
            type="number"
            min={1}
            max={31}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.rent_due_day ?? ''}
            onChange={(e) =>
              updateTenancy(
                'rent_due_day',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-charcoal">
            Usual rent payment day of the week
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={tenancy.usual_payment_weekday || ''}
            onChange={(e) => updateTenancy('usual_payment_weekday', e.target.value)}
          >
            <option value="">Select day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
      </div>
    </div>
  );
};