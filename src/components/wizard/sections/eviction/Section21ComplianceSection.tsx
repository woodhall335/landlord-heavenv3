/**
 * Section 21 Compliance Section - Eviction Wizard
 *
 * Step 6 (Section 21 only): Collects compliance requirements for no-fault eviction.
 *
 * CRITICAL: All of these are BLOCKERS for Section 21. If any are not met,
 * Section 21 cannot be used.
 *
 * IMPORTANT SEPARATION:
 * - "Compliance truth" = Was the requirement met? (e.g., "Was deposit protected?")
 * - "Evidence uploaded" = Is the document attached? (handled in Evidence section)
 *
 * Fields:
 * - deposit_taken: Was a deposit collected?
 * - deposit_amount: How much (if deposit taken)
 * - deposit_protected: Is deposit in approved scheme?
 * - deposit_scheme_name: Which scheme (DPS, MyDeposits, TDS)
 * - deposit_protection_date: When was it protected?
 * - deposit_reference: Scheme reference number
 * - prescribed_info_served: Was prescribed info given within 30 days?
 * - gas_safety_cert_served: Was gas safety cert provided? (if gas appliances)
 * - has_gas_appliances: Does property have gas?
 * - epc_served: Was EPC provided?
 * - how_to_rent_served: Was How to Rent guide provided?
 * - licensing_required: Does property need licensing?
 * - has_valid_licence: Is it licensed (if required)?
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface Section21ComplianceSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const DEPOSIT_SCHEMES = [
  { value: 'DPS', label: 'Deposit Protection Service (DPS)' },
  { value: 'MyDeposits', label: 'MyDeposits' },
  { value: 'TDS', label: 'Tenancy Deposit Scheme (TDS)' },
];

const LICENSING_OPTIONS = [
  { value: 'not_required', label: 'No licensing required' },
  { value: 'hmo_mandatory', label: 'Mandatory HMO licence required' },
  { value: 'hmo_additional', label: 'Additional HMO licence required' },
  { value: 'selective', label: 'Selective licence required' },
];

// Helper component for yes/no toggle
const YesNoToggle: React.FC<{
  id: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  label: string;
  required?: boolean;
  helperText?: string;
  blockingMessage?: string;
}> = ({ id, value, onChange, label, required, helperText, blockingMessage }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="flex items-center gap-4">
      <label className={`
        flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
        ${value === true ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}
      `}>
        <input
          type="radio"
          name={id}
          checked={value === true}
          onChange={() => onChange(true)}
          className="mr-2"
        />
        <span className="text-sm">Yes</span>
      </label>
      <label className={`
        flex items-center px-4 py-2 border rounded-md cursor-pointer transition-all
        ${value === false ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
      `}>
        <input
          type="radio"
          name={id}
          checked={value === false}
          onChange={() => onChange(false)}
          className="mr-2"
        />
        <span className="text-sm">No</span>
      </label>
    </div>
    {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    {value === false && blockingMessage && (
      <p className="text-sm text-red-600 font-medium">{blockingMessage}</p>
    )}
  </div>
);

export const Section21ComplianceSection: React.FC<Section21ComplianceSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const depositTaken = facts.deposit_taken === true;
  const hasGasAppliances = facts.has_gas_appliances === true;
  const licensingRequired = facts.licensing_required && facts.licensing_required !== 'not_required';

  return (
    <div className="space-y-8">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-1">
          Section 21 Validity Requirements
        </h4>
        <p className="text-sm text-amber-800">
          Section 21 notices can only be served if ALL compliance requirements are met.
          Failure to comply with any requirement makes the notice INVALID.
        </p>
      </div>

      {/* Deposit Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Deposit Protection
        </h3>

        <YesNoToggle
          id="deposit_taken"
          value={facts.deposit_taken}
          onChange={(v) => onUpdate({ deposit_taken: v })}
          label="Did you take a deposit from the tenant?"
          required
        />

        {depositTaken && (
          <div className="pl-4 border-l-2 border-purple-200 space-y-4">
            {/* Deposit amount */}
            <div className="space-y-2">
              <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700">
                Deposit amount (£)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  id="deposit_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  value={facts.deposit_amount || ''}
                  onChange={(e) => onUpdate({ deposit_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <YesNoToggle
              id="deposit_protected"
              value={facts.deposit_protected}
              onChange={(v) => onUpdate({ deposit_protected: v })}
              label="Is the deposit protected in an approved scheme?"
              required
              helperText="Must be protected within 30 days of receipt."
              blockingMessage="Section 21 cannot be used if deposit is not protected."
            />

            {facts.deposit_protected === true && (
              <>
                <div className="space-y-2">
                  <label htmlFor="deposit_scheme_name" className="block text-sm font-medium text-gray-700">
                    Deposit protection scheme
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="deposit_scheme_name"
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    value={facts.deposit_scheme_name || ''}
                    onChange={(e) => onUpdate({ deposit_scheme_name: e.target.value })}
                  >
                    <option value="">Select scheme...</option>
                    {DEPOSIT_SCHEMES.map((scheme) => (
                      <option key={scheme.value} value={scheme.value}>
                        {scheme.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="deposit_protection_date" className="block text-sm font-medium text-gray-700">
                      Date deposit was protected
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="deposit_protection_date"
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                      value={facts.deposit_protection_date || ''}
                      onChange={(e) => onUpdate({ deposit_protection_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="deposit_reference" className="block text-sm font-medium text-gray-700">
                      Deposit reference number
                    </label>
                    <input
                      id="deposit_reference"
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                      value={facts.deposit_reference || ''}
                      onChange={(e) => onUpdate({ deposit_reference: e.target.value })}
                      placeholder="Optional - scheme reference"
                    />
                  </div>
                </div>
              </>
            )}

            <YesNoToggle
              id="prescribed_info_served"
              value={facts.prescribed_info_served}
              onChange={(v) => onUpdate({ prescribed_info_served: v })}
              label="Was prescribed information served within 30 days?"
              required
              helperText="You must provide the tenant with prescribed information about the deposit protection."
              blockingMessage="Section 21 cannot be used if prescribed information was not served."
            />
          </div>
        )}
      </div>

      {/* Gas Safety */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Gas Safety
        </h3>

        <YesNoToggle
          id="has_gas_appliances"
          value={facts.has_gas_appliances}
          onChange={(v) => onUpdate({ has_gas_appliances: v })}
          label="Does the property have gas appliances?"
          required
          helperText="Gas boiler, gas hob, gas fire, etc."
        />

        {hasGasAppliances && (
          <div className="pl-4 border-l-2 border-purple-200">
            <YesNoToggle
              id="gas_safety_cert_served"
              value={facts.gas_safety_cert_served}
              onChange={(v) => onUpdate({ gas_safety_cert_served: v })}
              label="Was the Gas Safety Certificate provided to the tenant?"
              required
              helperText="A copy of the current CP12 must be provided annually."
              blockingMessage="Section 21 cannot be used if gas safety certificate was not provided."
            />
          </div>
        )}
      </div>

      {/* EPC */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Energy Performance Certificate
        </h3>

        <YesNoToggle
          id="epc_served"
          value={facts.epc_served}
          onChange={(v) => onUpdate({ epc_served: v })}
          label="Was an EPC provided to the tenant before the tenancy started?"
          required
          helperText="The property must have a valid EPC with a rating of E or above."
          blockingMessage="Section 21 cannot be used if EPC was not provided."
        />
      </div>

      {/* How to Rent */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          How to Rent Guide
        </h3>

        <YesNoToggle
          id="how_to_rent_served"
          value={facts.how_to_rent_served}
          onChange={(v) => onUpdate({ how_to_rent_served: v })}
          label="Was the 'How to Rent' guide provided?"
          required
          helperText="Required for tenancies starting on or after 1 October 2015."
          blockingMessage="Section 21 cannot be used if 'How to Rent' guide was not provided."
        />
      </div>

      {/* Licensing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Property Licensing
        </h3>

        <div className="space-y-2">
          <label htmlFor="licensing_required" className="block text-sm font-medium text-gray-700">
            Is the property required to be licensed?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            id="licensing_required"
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.licensing_required || ''}
            onChange={(e) => onUpdate({ licensing_required: e.target.value })}
          >
            <option value="">Select...</option>
            {LICENSING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Check with your local council if unsure. HMOs and some areas require licensing.
          </p>
        </div>

        {licensingRequired && (
          <div className="pl-4 border-l-2 border-purple-200">
            <YesNoToggle
              id="has_valid_licence"
              value={facts.has_valid_licence}
              onChange={(v) => onUpdate({ has_valid_licence: v })}
              label="Do you have a valid licence for this property?"
              required
              blockingMessage="Section 21 cannot be used if the property requires a licence but does not have one."
            />
          </div>
        )}
      </div>

      {/* Retaliatory eviction */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Retaliatory Eviction
        </h3>

        <YesNoToggle
          id="no_retaliatory_notice"
          value={facts.no_retaliatory_notice}
          onChange={(v) => onUpdate({ no_retaliatory_notice: v })}
          label="Is this notice being served more than 6 months after any repair complaint?"
          required
          helperText="Section 21 notices served within 6 months of a repair complaint may be deemed retaliatory and invalid."
          blockingMessage="This may be considered a retaliatory eviction. Consider waiting or using Section 8."
        />
      </div>
    </div>
  );
};

export default Section21ComplianceSection;
