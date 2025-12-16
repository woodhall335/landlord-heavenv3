'use client';

import React from 'react';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const EnforcementSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const moneyClaim = facts.money_claim || {};

  const toggleOption = (option: string) => {
    const current: string[] = moneyClaim.enforcement_preferences || [];
    const exists = current.includes(option);
    const next = exists ? current.filter((o) => o !== option) : [...current, option];

    onUpdate({
      money_claim: {
        ...moneyClaim,
        enforcement_preferences: next,
      },
    });
  };

  const isChecked = (opt: string) =>
    Array.isArray(moneyClaim.enforcement_preferences) &&
    moneyClaim.enforcement_preferences.includes(opt);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        If the tenant doesn’t pay even after judgment, how would you prefer to enforce it? This
        doesn’t commit you, but it helps us tailor your guidance.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">Possible enforcement options</label>

        <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked('attachment_of_earnings')}
              onChange={() => toggleOption('attachment_of_earnings')}
            />
            <span>Attachment of earnings (deduction from wages)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked('warrant_of_control')}
              onChange={() => toggleOption('warrant_of_control')}
            />
            <span>
              {jurisdiction === 'scotland' ? 'Charge for payment / diligence' : 'Warrant of control (bailiff)'}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked('charging_order')}
              onChange={() => toggleOption('charging_order')}
            />
            <span>Charging order over property</span>
          </label>
        </div>
      </div>
    </div>
  );
};
