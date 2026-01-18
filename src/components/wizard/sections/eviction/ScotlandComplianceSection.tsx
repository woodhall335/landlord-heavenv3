/**
 * Scotland Compliance Section - Eviction Wizard
 *
 * Collects compliance requirements for Scotland Notice to Leave.
 *
 * IMPORTANT: Unlike England's Section 21, Scotland grounds are ALL DISCRETIONARY.
 * Non-compliance may weaken the landlord's case but doesn't automatically invalidate
 * the notice. The tribunal considers reasonableness in all cases.
 *
 * Fields:
 * - deposit_taken: Was a deposit collected?
 * - deposit_amount: How much (if deposit taken)
 * - deposit_protected: Is deposit in approved scheme?
 * - deposit_scheme_name: Which scheme (SafeDeposits Scotland, etc.)
 * - deposit_protection_date: When was it protected?
 * - deposit_reference: Scheme reference number
 * - prescribed_info_served: Was prescribed info given within 30 working days?
 * - gas_safety_cert_served: Was gas safety cert provided? (if gas appliances)
 * - has_gas_appliances: Does property have gas?
 * - epc_served: Was EPC provided?
 * - eicr_served: Was EICR provided? (Scotland-specific requirement)
 * - landlord_registered: Is landlord registered with local council?
 * - landlord_registration_number: Registration number
 * - repairing_standard_met: Does property meet repairing standard?
 * - is_hmo: Is property an HMO?
 * - hmo_licensed: Does it have HMO licence? (if HMO)
 */

'use client';

import React, { useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface ScotlandComplianceSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  onSetCurrentQuestionId?: (fieldId: string | undefined) => void;
}

// Scotland-specific deposit schemes
const SCOTLAND_DEPOSIT_SCHEMES = [
  { value: 'SafeDeposits', label: 'SafeDeposits Scotland' },
  { value: 'LPS', label: 'Letting Protection Service Scotland' },
  { value: 'MyDeposits', label: 'MyDeposits Scotland' },
];

// Helper component for yes/no toggle
const YesNoToggle: React.FC<{
  id: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  label: string;
  required?: boolean;
  helperText?: string;
  warningMessage?: string;
}> = ({ id, value, onChange, label, required, helperText, warningMessage }) => (
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
        ${value === false ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}
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
    {value === false && warningMessage && (
      <p className="text-sm text-amber-600 font-medium">{warningMessage}</p>
    )}
  </div>
);

export const ScotlandComplianceSection: React.FC<ScotlandComplianceSectionProps> = ({
  facts,
  onUpdate,
  onSetCurrentQuestionId,
}) => {
  const depositTaken = facts.deposit_taken === true;
  const hasGasAppliances = facts.has_gas_appliances === true;
  const isHmo = facts.is_hmo === true;

  // Set current question ID for Ask Heaven context
  useEffect(() => {
    if (onSetCurrentQuestionId) {
      onSetCurrentQuestionId('scotland_compliance');
    }
    return () => {
      if (onSetCurrentQuestionId) {
        onSetCurrentQuestionId(undefined);
      }
    };
  }, [onSetCurrentQuestionId]);

  return (
    <div className="space-y-8">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Scotland Compliance Information
        </h4>
        <p className="text-sm text-blue-800">
          All eviction grounds in Scotland are <strong>discretionary</strong>. The tribunal considers
          reasonableness in every case. Non-compliance with these requirements may weaken your case
          but won&apos;t automatically invalidate your notice.
        </p>
      </div>

      {/* Landlord Registration - Scotland-specific */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Landlord Registration
        </h3>

        <YesNoToggle
          id="landlord_registered"
          value={facts.landlord_registered}
          onChange={(v) => onUpdate({ landlord_registered: v })}
          label="Are you registered with your local council as a landlord?"
          required
          helperText="All private landlords in Scotland must be registered with their local council."
          warningMessage="Unregistered landlords face fines up to £5,000. The tribunal may view this unfavourably."
        />

        {facts.landlord_registered === true && (
          <div className="pl-4 border-l-2 border-purple-200">
            <div className="space-y-2">
              <label htmlFor="landlord_registration_number" className="block text-sm font-medium text-gray-700">
                Landlord registration number
              </label>
              <input
                id="landlord_registration_number"
                type="text"
                className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                value={facts.landlord_registration_number || ''}
                onChange={(e) => onUpdate({ landlord_registration_number: e.target.value })}
                placeholder="Optional - for your records"
              />
            </div>
          </div>
        )}
      </div>

      {/* Deposit Protection */}
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
              label="Is the deposit protected in an approved Scottish scheme?"
              required
              helperText="Must be protected within 30 working days of receipt."
              warningMessage="Unprotected deposits can result in penalties of up to 3x the deposit amount."
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
                    {SCOTLAND_DEPOSIT_SCHEMES.map((scheme) => (
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
              label="Was prescribed information served within 30 working days?"
              required
              helperText="You must provide the tenant with prescribed information about the deposit protection."
              warningMessage="Failure to serve prescribed information may result in penalties."
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
              label="Was the Gas Safety Certificate (CP12) provided to the tenant?"
              required
              helperText="A copy must be provided within 28 days of the annual inspection."
              warningMessage="Missing gas safety certificate is a serious compliance issue (up to £5,000 fine)."
            />
          </div>
        )}
      </div>

      {/* EPC */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Energy Performance Certificate (EPC)
        </h3>

        <YesNoToggle
          id="epc_served"
          value={facts.epc_served}
          onChange={(v) => onUpdate({ epc_served: v })}
          label="Was an EPC provided to the tenant?"
          required
          helperText="The property must have a valid EPC with a rating of E or above."
          warningMessage="Missing EPC can result in fines up to £1,000."
        />
      </div>

      {/* EICR - Scotland-specific */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Electrical Safety (EICR)
        </h3>

        <YesNoToggle
          id="eicr_served"
          value={facts.eicr_served}
          onChange={(v) => onUpdate({ eicr_served: v })}
          label="Was an Electrical Installation Condition Report (EICR) provided?"
          required
          helperText="Required for all private tenancies in Scotland. Must be renewed every 5 years."
          warningMessage="Missing EICR can result in fines up to £5,000."
        />
      </div>

      {/* Repairing Standard - Scotland-specific */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          Repairing Standard
        </h3>

        <YesNoToggle
          id="repairing_standard_met"
          value={facts.repairing_standard_met}
          onChange={(v) => onUpdate({ repairing_standard_met: v })}
          label="Does the property meet the repairing standard?"
          required
          helperText="Housing (Scotland) Act 2006 requires properties to meet minimum standards for structure, heating, water, and safety."
          warningMessage="Properties not meeting repairing standard may face enforcement by the Private Rented Housing Panel."
        />

        {facts.repairing_standard_met === false && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Key repairing standard requirements:</strong>
            </p>
            <ul className="mt-2 text-sm text-amber-800 list-disc list-inside space-y-1">
              <li>Structure and exterior in reasonable repair</li>
              <li>Water, gas, and electricity installations in reasonable repair</li>
              <li>Heating and hot water in reasonable repair</li>
              <li>Property secure and safe from forced entry</li>
              <li>Smoke alarms and carbon monoxide detectors fitted</li>
            </ul>
          </div>
        )}
      </div>

      {/* HMO Licensing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
          HMO Licensing
        </h3>

        <YesNoToggle
          id="is_hmo"
          value={facts.is_hmo}
          onChange={(v) => onUpdate({ is_hmo: v })}
          label="Is this property an HMO (House in Multiple Occupation)?"
          required
          helperText="An HMO typically has 3 or more unrelated tenants sharing facilities."
        />

        {isHmo && (
          <div className="pl-4 border-l-2 border-purple-200">
            <YesNoToggle
              id="hmo_licensed"
              value={facts.hmo_licensed}
              onChange={(v) => onUpdate({ hmo_licensed: v })}
              label="Does the property have a valid HMO licence?"
              required
              warningMessage="Operating an unlicensed HMO can result in fines up to £5,000."
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Important Note
        </h4>
        <p className="text-sm text-gray-700">
          The First-tier Tribunal will consider your compliance with these requirements when deciding
          whether it is reasonable to grant an eviction order. Even with full compliance, eviction
          is not guaranteed as all grounds are discretionary.
        </p>
      </div>
    </div>
  );
};

export default ScotlandComplianceSection;
