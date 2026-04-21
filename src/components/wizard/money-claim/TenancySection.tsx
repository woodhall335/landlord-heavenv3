// src/components/wizard/money-claim/TenancySection.tsx

'use client';

import React from 'react';
import { InlineSectionHeaderV3 } from '@/components/wizard/shared/InlineSectionHeaderV3';
import {
  MONEY_CLAIM_CARD_CLASS,
  MONEY_CLAIM_HINT_CLASS,
  MONEY_CLAIM_INPUT_CLASS,
  MONEY_CLAIM_LABEL_CLASS,
} from '@/components/wizard/money-claim/ui';

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

    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  const updateProperty = (field: string, value: any) => {
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

    if (topLevelKey) {
      updates[topLevelKey] = value;
    }

    onUpdate(updates);
  };

  const courtFamilyLabel =
    jurisdiction === 'england' || jurisdiction === 'wales'
      ? 'England & Wales'
      : 'Scotland';

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-[#5a546e]">
        We use these details to map your claim to the correct court forms and filing rules for{' '}
        {courtFamilyLabel}.
      </p>

      <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-4`}>
        <InlineSectionHeaderV3 title="Property address" iconSlug="property" />

        <div className="space-y-1.5">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Property address line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={property.address_line1 || facts.property_address_line1 || ''}
            onChange={(e) => updateProperty('address_line1', e.target.value)}
            placeholder="e.g. 16 Waterloo Road"
          />
        </div>

        <div className="space-y-1.5">
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Property address line 2 <span className={MONEY_CLAIM_HINT_CLASS}>(optional)</span>
          </label>
          <input
            type="text"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={property.address_line2 || facts.property_address_line2 || ''}
            onChange={(e) => updateProperty('address_line2', e.target.value)}
            placeholder="Building, estate or area"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className={MONEY_CLAIM_LABEL_CLASS}>Town / city</label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={property.city || facts.property_address_town || ''}
              onChange={(e) => updateProperty('city', e.target.value)}
              placeholder="e.g. Pudsey"
            />
          </div>

          <div className="space-y-1.5">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Postcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={MONEY_CLAIM_INPUT_CLASS}
              value={property.postcode || facts.property_address_postcode || ''}
              onChange={(e) => updateProperty('postcode', e.target.value)}
              placeholder="e.g. LS28 7PW"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-1.5`}>
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Tenancy start date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={tenancy.start_date || facts.tenancy_start_date || ''}
            onChange={(e) => updateTenancy('start_date', e.target.value)}
          />
        </div>

        <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-1.5`}>
          <label className={MONEY_CLAIM_LABEL_CLASS}>
            Tenancy end date <span className={MONEY_CLAIM_HINT_CLASS}>(if fixed term)</span>
          </label>
          <input
            type="date"
            className={MONEY_CLAIM_INPUT_CLASS}
            value={tenancy.end_date || facts.tenancy_end_date || ''}
            onChange={(e) => updateTenancy('end_date', e.target.value)}
          />
        </div>
      </div>

      <div className={`${MONEY_CLAIM_CARD_CLASS} space-y-4`}>
        <InlineSectionHeaderV3 title="Rent details" iconSlug="rent" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Rent amount (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={MONEY_CLAIM_INPUT_CLASS}
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

          <div className="space-y-1.5">
            <label className={MONEY_CLAIM_LABEL_CLASS}>
              Rent frequency <span className="text-red-500">*</span>
            </label>
            <select
              className={MONEY_CLAIM_INPUT_CLASS}
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

        <div className="space-y-1.5">
          <label className={MONEY_CLAIM_LABEL_CLASS}>On which day is rent due each period?</label>
          <input
            type="number"
            min={1}
            max={31}
            className={MONEY_CLAIM_INPUT_CLASS}
            value={tenancy.rent_due_day ?? facts.rent_due_day ?? ''}
            onChange={(e) =>
              updateTenancy(
                'rent_due_day',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
            placeholder="e.g. 1 (for the 1st of the month)"
          />
          <p className={MONEY_CLAIM_HINT_CLASS}>
            This helps calculate the arrears schedule correctly.
          </p>
        </div>
      </div>
    </div>
  );
};
