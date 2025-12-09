'use client';

import React from 'react';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ArrearsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const issues = facts.issues || {};
  const arrears = issues.rent_arrears || {};
  const moneyClaim = facts.money_claim || {};

  const updateArrears = (field: string, value: any) => {
    onUpdate({
      issues: {
        ...issues,
        rent_arrears: {
          ...arrears,
          [field]: value,
        },
      },
    });
  };

  const updateMoneyClaim = (field: string, value: any) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Set out the amounts you’re claiming for. This will be used for the Particulars of Claim
        and Schedule of Loss.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">Total rent arrears</label>
        <input
          type="number"
          min={0}
          step="0.01"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={arrears.total_arrears ?? ''}
          onChange={(e) =>
            updateArrears(
              'total_arrears',
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Briefly explain what this claim is about
        </label>
        <textarea
          className="min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={moneyClaim.basis_of_claim || ''}
          onChange={(e) => updateMoneyClaim('basis_of_claim', e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Any damage, costs or other amounts you are also claiming
        </label>
        <textarea
          className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={moneyClaim.other_charges_notes || ''}
          onChange={(e) => updateMoneyClaim('other_charges_notes', e.target.value)}
        />
      </div>
    </div>
  );
};
