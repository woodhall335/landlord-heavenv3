/**
 * Notice Section - Eviction Wizard
 *
 * Step 5: Collects notice service details.
 *
 * CRITICAL: This section REUSES the same schema keys as notice-only flows,
 * so data from a previous notice-only flow can be pre-populated.
 *
 * Fields:
 * - notice_served_date: Date the notice was served on tenant(s)
 * - notice_service_method: How the notice was delivered (required for N5B)
 * - notice_expiry_date: Optional - auto-calculated if not provided
 * - section8_grounds: For Section 8, which grounds are being relied upon
 * - section8_details: Particulars for each ground
 *
 * Notice periods (England):
 * - Section 21: 2 months minimum
 * - Section 8 Ground 8: 14 days minimum
 * - Section 8 Grounds 10/11: 2 months minimum
 * - Section 8 Ground 14 (serious): 14 days minimum
 */

'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface NoticeSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const SERVICE_METHODS = [
  { value: 'first_class_post', label: 'First class post' },
  { value: 'recorded_delivery', label: 'Recorded delivery / signed for' },
  { value: 'hand_delivered', label: 'Hand delivered to tenant' },
  { value: 'left_at_property', label: 'Left at the property' },
  { value: 'email', label: 'Email (if permitted by tenancy)' },
  { value: 'other', label: 'Other method' },
];

// Section 8 grounds with notice periods
const SECTION_8_GROUNDS = [
  { value: 'Ground 1', label: 'Ground 1 - Landlord occupation', period: 60, mandatory: true },
  { value: 'Ground 2', label: 'Ground 2 - Mortgage lender', period: 60, mandatory: true },
  { value: 'Ground 7', label: 'Ground 7 - Tenant death', period: 60, mandatory: false },
  { value: 'Ground 7A', label: 'Ground 7A - Serious offence', period: 14, mandatory: true },
  { value: 'Ground 8', label: 'Ground 8 - 2+ months rent arrears', period: 14, mandatory: true },
  { value: 'Ground 10', label: 'Ground 10 - Rent arrears', period: 60, mandatory: false },
  { value: 'Ground 11', label: 'Ground 11 - Persistent delay', period: 60, mandatory: false },
  { value: 'Ground 12', label: 'Ground 12 - Breach of tenancy', period: 60, mandatory: false },
  { value: 'Ground 13', label: 'Ground 13 - Waste or neglect', period: 60, mandatory: false },
  { value: 'Ground 14', label: 'Ground 14 - Nuisance or annoyance', period: 14, mandatory: false },
  { value: 'Ground 14A', label: 'Ground 14A - Domestic violence', period: 14, mandatory: true },
  { value: 'Ground 15', label: 'Ground 15 - Damaged furniture', period: 60, mandatory: false },
  { value: 'Ground 17', label: 'Ground 17 - False statement', period: 60, mandatory: false },
];

export const NoticeSection: React.FC<NoticeSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const isSection8 = facts.eviction_route === 'section_8';
  const selectedGrounds = (facts.section8_grounds as string[]) || [];

  // Calculate minimum notice period based on selected grounds
  const minNoticePeriod = useMemo(() => {
    if (!isSection8) return 60; // Section 21 = 2 months

    if (selectedGrounds.length === 0) return 14; // Default minimum

    // Find the maximum notice period among selected grounds
    // (when multiple grounds, the longest period applies)
    let maxPeriod = 14;
    selectedGrounds.forEach((ground) => {
      const groundInfo = SECTION_8_GROUNDS.find((g) => g.value === ground);
      if (groundInfo && groundInfo.period > maxPeriod) {
        maxPeriod = groundInfo.period;
      }
    });
    return maxPeriod;
  }, [isSection8, selectedGrounds]);

  // Calculate suggested expiry date
  const suggestedExpiryDate = useMemo(() => {
    if (!facts.notice_served_date) return null;
    const servedDate = new Date(facts.notice_served_date);
    const expiryDate = new Date(servedDate);
    expiryDate.setDate(expiryDate.getDate() + minNoticePeriod);
    return expiryDate.toISOString().split('T')[0];
  }, [facts.notice_served_date, minNoticePeriod]);

  // Handle ground selection
  const handleGroundToggle = (ground: string) => {
    const newGrounds = selectedGrounds.includes(ground)
      ? selectedGrounds.filter((g) => g !== ground)
      : [...selectedGrounds, ground];
    onUpdate({ section8_grounds: newGrounds });
  };

  return (
    <div className="space-y-6">
      {/* Notice service date */}
      <div className="space-y-2">
        <label htmlFor="notice_served_date" className="block text-sm font-medium text-gray-700">
          Date notice was served
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="notice_served_date"
          type="date"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={facts.notice_served_date || ''}
          onChange={(e) => onUpdate({ notice_served_date: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          The date you served (or will serve) the eviction notice on the tenant(s).
        </p>
      </div>

      {/* Service method */}
      <div className="space-y-2">
        <label htmlFor="notice_service_method" className="block text-sm font-medium text-gray-700">
          How was the notice served?
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="notice_service_method"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          Required for court forms. The method of service affects when the notice is deemed served.
        </p>
      </div>

      {/* Notice expiry date */}
      <div className="space-y-2">
        <label htmlFor="notice_expiry_date" className="block text-sm font-medium text-gray-700">
          Notice expiry date
        </label>
        <div className="flex items-center gap-3">
          <input
            id="notice_expiry_date"
            type="date"
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={facts.notice_expiry_date || ''}
            onChange={(e) => onUpdate({ notice_expiry_date: e.target.value })}
          />
          {suggestedExpiryDate && !facts.notice_expiry_date && (
            <button
              type="button"
              onClick={() => onUpdate({ notice_expiry_date: suggestedExpiryDate })}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Use suggested: {suggestedExpiryDate}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Leave blank to auto-calculate. Minimum {minNoticePeriod} days for your selected route/grounds.
        </p>
      </div>

      {/* Section 8 Grounds Selection */}
      {isSection8 && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Section 8 Grounds
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500">
              Select all grounds that apply. Grounds are divided into mandatory (court must grant
              if proven) and discretionary (court decides if reasonable).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SECTION_8_GROUNDS.map((ground) => (
              <label
                key={ground.value}
                className={`
                  flex items-start p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedGrounds.includes(ground.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedGrounds.includes(ground.value)}
                  onChange={() => handleGroundToggle(ground.value)}
                  className="mt-0.5 mr-2"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {ground.label}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      ground.mandatory
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ground.mandatory ? 'Mandatory' : 'Discretionary'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ground.period} days notice
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedGrounds.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected grounds:</strong> {selectedGrounds.join(', ')}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Minimum notice period: {minNoticePeriod} days
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 8 particulars */}
      {isSection8 && selectedGrounds.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="section8_details" className="block text-sm font-medium text-gray-700">
            Particulars for selected grounds
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="section8_details"
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={facts.section8_details || ''}
            onChange={(e) => onUpdate({ section8_details: e.target.value })}
            placeholder="For each ground, provide specific details: dates, amounts (if arrears), incidents, evidence available..."
          />
          <p className="text-xs text-gray-500">
            Be specific and factual. Include dates, amounts, and reference any evidence.
            This will appear in the particulars of claim.
          </p>
        </div>
      )}

      {/* Section 21 info */}
      {!isSection8 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Section 21 Notice Period
          </h4>
          <p className="text-sm text-blue-800">
            Section 21 notices require a minimum of 2 months (60 days) notice.
            The notice cannot expire before the end of any fixed term.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoticeSection;
