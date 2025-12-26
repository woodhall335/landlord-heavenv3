/**
 * Tenancy Section - Eviction Wizard
 *
 * Step 4: Collects tenancy details required for notices and court forms.
 *
 * Fields:
 * - tenancy_start_date: When the tenancy began
 * - tenancy_type: Fixed term AST, periodic AST, etc.
 * - fixed_term_end_date: If fixed term (affects notice timing)
 * - rent_amount: Monthly/weekly rent amount
 * - rent_frequency: weekly/fortnightly/monthly
 * - rent_due_day: Day rent is due (critical for Section 8 wording)
 *
 * Legal context:
 * - rent_due_day is REQUIRED for Section 8 notices to describe the rental period
 * - fixed_term_end_date affects when notices can expire
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface TenancySectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const TENANCY_TYPES = [
  { value: 'ast_fixed', label: 'Assured Shorthold Tenancy (Fixed term)' },
  { value: 'ast_periodic', label: 'Assured Shorthold Tenancy (Periodic/Rolling)' },
  { value: 'assured', label: 'Assured Tenancy (pre-1997)' },
  { value: 'regulated', label: 'Regulated Tenancy (pre-1989)' },
];

const RENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export const TenancySection: React.FC<TenancySectionProps> = ({
  facts,
  onUpdate,
}) => {
  const tenancyType = facts.tenancy_type || '';
  const rentFrequency = facts.rent_frequency || 'monthly';
  const isFixedTerm = tenancyType === 'ast_fixed';

  // Helper text for rent due day based on frequency
  const getRentDueDayHelper = () => {
    switch (rentFrequency) {
      case 'weekly':
        return 'Enter the day of the week (1=Monday, 7=Sunday)';
      case 'fortnightly':
        return 'Enter the day of the week (1=Monday, 7=Sunday) when the two-week period starts';
      case 'monthly':
        return 'Enter the day of the month (1-31) when rent is due';
      case 'quarterly':
        return 'Enter the day of the month (1-31) when quarterly rent is due';
      default:
        return 'Enter the day (1-31) when rent is due';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tenancy start date */}
      <div className="space-y-2">
        <label htmlFor="tenancy_start_date" className="block text-sm font-medium text-gray-700">
          Tenancy start date
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="tenancy_start_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={facts.tenancy_start_date || ''}
          onChange={(e) => onUpdate({ tenancy_start_date: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          The date the current tenancy began. This affects notice period calculations
          and the &apos;How to Rent&apos; requirement.
        </p>
      </div>

      {/* Tenancy type */}
      <div className="space-y-2">
        <label htmlFor="tenancy_type" className="block text-sm font-medium text-gray-700">
          Tenancy type
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="tenancy_type"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={tenancyType}
          onChange={(e) => onUpdate({ tenancy_type: e.target.value })}
        >
          <option value="">Select tenancy type...</option>
          {TENANCY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          The tenancy type affects which notices can be used and notice periods.
        </p>
      </div>

      {/* Fixed term end date (conditional) */}
      {isFixedTerm && (
        <div className="space-y-2 pl-4 border-l-2 border-blue-200">
          <label htmlFor="fixed_term_end_date" className="block text-sm font-medium text-gray-700">
            Fixed term end date
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="fixed_term_end_date"
            type="date"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={facts.fixed_term_end_date || ''}
            onChange={(e) => onUpdate({ fixed_term_end_date: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Section 21 notices cannot expire before the fixed term ends.
          </p>
        </div>
      )}

      {/* Rent details */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Rent Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rent amount */}
          <div className="space-y-2">
            <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700">
              Rent amount (£)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <input
                id="rent_amount"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={facts.rent_amount || ''}
                onChange={(e) => onUpdate({ rent_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Rent frequency */}
          <div className="space-y-2">
            <label htmlFor="rent_frequency" className="block text-sm font-medium text-gray-700">
              Frequency
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="rent_frequency"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={rentFrequency}
              onChange={(e) => onUpdate({ rent_frequency: e.target.value })}
            >
              {RENT_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rent due day */}
          <div className="space-y-2">
            <label htmlFor="rent_due_day" className="block text-sm font-medium text-gray-700">
              Day rent is due
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="rent_due_day"
              type="number"
              min="1"
              max={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? 7 : 31}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={facts.rent_due_day || ''}
              onChange={(e) => onUpdate({ rent_due_day: parseInt(e.target.value) || 1 })}
              placeholder={rentFrequency === 'weekly' || rentFrequency === 'fortnightly' ? '1-7' : '1-31'}
            />
            <p className="text-xs text-gray-500">
              {getRentDueDayHelper()}
            </p>
          </div>
        </div>

        {/* Rent calculation preview */}
        {facts.rent_amount && facts.rent_frequency && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Rent summary:</strong>{' '}
              £{Number(facts.rent_amount).toFixed(2)} {facts.rent_frequency}
              {facts.rent_due_day && (
                <span className="text-gray-500">
                  {' '}
                  (due on day {facts.rent_due_day})
                </span>
              )}
            </p>
            {facts.rent_frequency === 'monthly' && facts.rent_amount && (
              <p className="text-xs text-gray-500 mt-1">
                Annual rent: £{(Number(facts.rent_amount) * 12).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legal info for Section 8 */}
      {facts.eviction_route === 'section_8' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-1">
            Section 8 Rent Details
          </h4>
          <p className="text-sm text-amber-800">
            The rent amount and due day are critical for Section 8 notices, especially Ground 8
            (rent arrears). The notice must accurately describe the rental period and calculate
            whether arrears meet the 2-month threshold.
          </p>
        </div>
      )}
    </div>
  );
};

export default TenancySection;
