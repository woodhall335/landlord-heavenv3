/**
 * Occupation Contract Section - Wales Notice Only Wizard
 *
 * Wales-specific replacement for TenancySection.
 * Uses Wales terminology under Renting Homes (Wales) Act 2016.
 *
 * Key differences from England:
 * - "Occupation contract" instead of "AST/Tenancy"
 * - "Contract holder" instead of "Tenant"
 * - No "How to Rent" requirement (England only)
 * - No "Section 21" references
 *
 * Fields reuse existing schema keys for compatibility:
 * - tenancy_start_date (contract start date)
 * - tenancy_type (contract type - mapped to Wales types)
 * - fixed_term_end_date (if fixed term)
 * - rent_amount, rent_frequency, rent_due_day
 */

'use client';

import React, { useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface OccupationContractSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

// Wales occupation contract types under RH(W)A 2016
const OCCUPATION_CONTRACT_TYPES = [
  { value: 'secure', label: 'Secure Contract (social landlord)' },
  { value: 'standard_periodic', label: 'Standard Contract (Periodic)' },
  { value: 'standard_fixed', label: 'Standard Contract (Fixed term)' },
];

const RENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export const OccupationContractSection: React.FC<OccupationContractSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const contractType = facts.tenancy_type || '';
  const rentFrequency = facts.rent_frequency || 'monthly';
  const isFixedTerm = contractType === 'standard_fixed';

  // Initialize default values for rent_frequency and rent_due_day
  useEffect(() => {
    const updates: Record<string, any> = {};
    if (!facts.rent_frequency) {
      updates.rent_frequency = 'monthly';
    }
    if (!facts.rent_due_day) {
      updates.rent_due_day = 1;
    }
    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
      {/* Wales info banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Renting Homes (Wales) Act 2016
        </h4>
        <p className="text-sm text-blue-800">
          In Wales, all private tenancies are now &quot;occupation contracts&quot;.
          The contract holder (formerly &quot;tenant&quot;) has rights under the
          Renting Homes (Wales) Act 2016.
        </p>
      </div>

      {/* Contract start date */}
      <div className="space-y-2">
        <label htmlFor="tenancy_start_date" className="block text-sm font-medium text-gray-700">
          Occupation contract start date
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="tenancy_start_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.tenancy_start_date || ''}
          onChange={(e) => onUpdate({ tenancy_start_date: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          The date the occupation contract began. This affects notice period calculations.
        </p>
      </div>

      {/* Contract type */}
      <div className="space-y-2">
        <label htmlFor="tenancy_type" className="block text-sm font-medium text-gray-700">
          Contract type
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="tenancy_type"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={contractType}
          onChange={(e) => onUpdate({ tenancy_type: e.target.value })}
        >
          <option value="">Select contract type...</option>
          {OCCUPATION_CONTRACT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          The type of occupation contract affects which notices can be used.
        </p>
      </div>

      {/* Fixed term end date (conditional) */}
      {isFixedTerm && (
        <div className="space-y-4 pl-4 border-l-2 border-purple-200">
          <div className="space-y-2">
            <label htmlFor="fixed_term_end_date" className="block text-sm font-medium text-gray-700">
              Fixed term end date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="fixed_term_end_date"
              type="date"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.fixed_term_end_date || ''}
              onChange={(e) => onUpdate({ fixed_term_end_date: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Section 173 notices cannot expire before the fixed term ends (except for serious breach).
            </p>
          </div>

          {/* Break clause question */}
          <div className="space-y-2">
            <label htmlFor="has_break_clause" className="block text-sm font-medium text-gray-700">
              Does the contract contain a break clause?
            </label>
            <select
              id="has_break_clause"
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
              value={facts.has_break_clause === true ? 'yes' : facts.has_break_clause === false ? 'no' : ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate({
                  has_break_clause: val === 'yes' ? true : val === 'no' ? false : null,
                  ...(val !== 'yes' ? { break_clause_date: null } : {}),
                });
              }}
            >
              <option value="">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <p className="text-xs text-gray-500">
              A break clause allows either party to end the contract early. Check your written statement.
            </p>
          </div>

          {/* Break clause date (if has break clause) */}
          {facts.has_break_clause === true && (
            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
              <label htmlFor="break_clause_date" className="block text-sm font-medium text-gray-700">
                Earliest break clause date
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="break_clause_date"
                type="date"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.break_clause_date || ''}
                onChange={(e) => onUpdate({ break_clause_date: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                The earliest date the break clause can be exercised.
              </p>
            </div>
          )}

          {/* Info box for fixed term */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-1">Fixed Term & Section 173</h5>
            <p className="text-xs text-blue-800">
              {facts.has_break_clause === true ? (
                <>If you have a break clause, you can serve a Section 173 notice that expires on or after the break clause date (subject to minimum 6-month notice).</>
              ) : facts.has_break_clause === false ? (
                <>Without a break clause, a Section 173 notice cannot expire before the fixed term end date.</>
              ) : (
                <>If the contract has a break clause, you may be able to serve a Section 173 notice that expires before the fixed term end date.</>
              )}
            </p>
          </div>
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
                className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
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

      {/* Legal info for fault-based route */}
      {facts.eviction_route === 'fault_based' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-1">
            Fault-based Eviction - Rent Details
          </h4>
          <p className="text-sm text-amber-800">
            For fault-based eviction due to rent arrears, the rent amount and due day are critical.
            Under Welsh law, serious rent arrears (8+ weeks) can be an absolute ground for possession.
          </p>
        </div>
      )}
    </div>
  );
};

export default OccupationContractSection;
