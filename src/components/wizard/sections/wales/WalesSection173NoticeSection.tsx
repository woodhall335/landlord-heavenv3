/**
 * Wales Section 173 Notice Section - Notice Only Wizard (No-Fault)
 *
 * Wales-specific section for no-fault evictions under Section 173
 * of the Renting Homes (Wales) Act 2016.
 *
 * No grounds required - just service details.
 * 6 months notice period (as of Dec 2022).
 */

'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface WalesSection173NoticeSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to contract holder' },
  { value: 'left_at_property', label: 'Left at the property' },
  { value: 'email', label: 'Email (if permitted by contract)' },
  { value: 'other', label: 'Other method' },
];

export const WalesSection173NoticeSection: React.FC<WalesSection173NoticeSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Section 173 requires 6 months (180 days) notice as of Dec 2022
  const minNoticePeriod = 180;

  // Calculate suggested expiry date (6 months from service date)
  const suggestedExpiryDate = useMemo(() => {
    const serviceDate = facts.notice_service_date || today;
    const date = new Date(serviceDate);
    date.setDate(date.getDate() + minNoticePeriod);
    return date.toISOString().split('T')[0];
  }, [facts.notice_service_date, today]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900">
          Section 173 No-Fault Notice (Renting Homes Act 2016)
        </h4>
        <p className="text-sm text-purple-700 mt-1">
          No grounds are required for Section 173 notices. You just need to provide the
          required notice period (6 months) and serve properly.
        </p>
      </div>

      {/* Important requirements */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h5 className="text-sm font-semibold text-amber-900 mb-2">
          Section 173 Requirements
        </h5>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>Cannot be served within first 6 months of the occupation contract</li>
          <li>Minimum 6 months' notice period</li>
          <li>Landlord must be registered with Rent Smart Wales</li>
          <li>If deposit taken, must be protected in approved scheme</li>
          <li>Only applies to "standard occupation contracts"</li>
        </ul>
      </div>

      {/* Service Date */}
      <div className="space-y-2">
        <label htmlFor="notice_service_date" className="block text-sm font-medium text-gray-700">
          Date you will serve the notice
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="notice_service_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.notice_service_date || today}
          onChange={(e) => onUpdate({ notice_service_date: e.target.value })}
        />
      </div>

      {/* Service Method */}
      <div className="space-y-2">
        <label htmlFor="notice_service_method" className="block text-sm font-medium text-gray-700">
          How will you serve the notice?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="notice_service_method"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={facts.notice_service_method || ''}
          onChange={(e) => onUpdate({ notice_service_method: e.target.value })}
        >
          <option value="">Select service method...</option>
          {SERVICE_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          The method of service affects when the notice is deemed served.
        </p>
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <label htmlFor="notice_expiry_date" className="block text-sm font-medium text-gray-700">
          Notice expiry date
        </label>
        <div className="flex items-center gap-3">
          <input
            id="notice_expiry_date"
            type="date"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            value={facts.notice_expiry_date || ''}
            onChange={(e) => onUpdate({ notice_expiry_date: e.target.value })}
          />
          {!facts.notice_expiry_date && (
            <button
              type="button"
              onClick={() => onUpdate({ notice_expiry_date: suggestedExpiryDate })}
              className="text-sm text-[#7C3AED] hover:text-purple-700 underline"
            >
              Use suggested: {suggestedExpiryDate}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Minimum 6 months (180 days) from service date.
        </p>
      </div>

      {/* Rent Smart Wales */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Are you registered with Rent Smart Wales?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="rent_smart_wales_registered"
              checked={facts.rent_smart_wales_registered === true}
              onChange={() => onUpdate({ rent_smart_wales_registered: true })}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="rent_smart_wales_registered"
              checked={facts.rent_smart_wales_registered === false}
              onChange={() => onUpdate({ rent_smart_wales_registered: false })}
              className="mr-2"
            />
            No
          </label>
        </div>
        {facts.rent_smart_wales_registered === false && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ You must be registered with Rent Smart Wales to serve a valid Section 173 notice.
          </p>
        )}
      </div>

      {/* Contract type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Is this a standard occupation contract?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="wales_contract_category"
              checked={facts.wales_contract_category === 'standard'}
              onChange={() => onUpdate({ wales_contract_category: 'standard' })}
              className="mr-2"
            />
            Yes, standard contract
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="wales_contract_category"
              checked={facts.wales_contract_category === 'other'}
              onChange={() => onUpdate({ wales_contract_category: 'other' })}
              className="mr-2"
            />
            No / Not sure
          </label>
        </div>
        {facts.wales_contract_category === 'other' && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ Section 173 can only be used with standard occupation contracts.
            If you have a supported or secure contract, different rules apply.
          </p>
        )}
      </div>

      {/* Summary */}
      {facts.notice_service_date && facts.notice_service_method && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="text-sm font-medium text-green-800 mb-2">Notice Summary</h5>
          <dl className="text-sm text-green-700 space-y-1">
            <div>
              <dt className="inline font-medium">Type:</dt>
              <dd className="inline ml-2">Section 173 (No-fault)</dd>
            </div>
            <div>
              <dt className="inline font-medium">Service date:</dt>
              <dd className="inline ml-2">{facts.notice_service_date}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Expiry date:</dt>
              <dd className="inline ml-2">{facts.notice_expiry_date || suggestedExpiryDate} (6 months)</dd>
            </div>
            <div>
              <dt className="inline font-medium">Service method:</dt>
              <dd className="inline ml-2">
                {SERVICE_METHODS.find((m) => m.value === facts.notice_service_method)?.label}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default WalesSection173NoticeSection;
