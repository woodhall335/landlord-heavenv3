/**
 * Wales Case Basics Section - Notice Only Wizard
 *
 * Wales-specific route selection for eviction notices under the
 * Renting Homes (Wales) Act 2016.
 *
 * Routes:
 * - Section 173 (No-fault): 6 months notice, no grounds required
 * - Fault-based: Various grounds, 14-56 days notice
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface WalesCaseBasicsSectionProps {
  facts: WizardFacts;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const WalesCaseBasicsSection: React.FC<WalesCaseBasicsSectionProps> = ({
  facts,
  onUpdate,
}) => {
  const evictionRoute = facts.eviction_route || '';

  return (
    <div className="space-y-6">
      {/* Jurisdiction display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-gray-900 font-medium">Wales</span>
          <p className="text-xs text-gray-500 mt-1">
            This wizard is configured for Welsh law under the Renting Homes (Wales) Act 2016.
          </p>
        </div>
      </div>

      {/* Eviction route selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Which eviction route are you using?
          <span className="text-red-500 ml-1">*</span>
        </label>

        <div className="space-y-3">
          {/* Section 173 Option - No-fault */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'wales_section_173'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="wales_section_173"
              checked={evictionRoute === 'wales_section_173'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Section 173 — No-fault notice
              </span>
              <p className="text-sm text-gray-600 mt-1">
                6 months notice required. No grounds needed, but cannot be served within first
                6 months of the occupation contract. Landlord must be Rent Smart Wales registered.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  RHW16 / RHW17
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  6 months notice
                </span>
              </div>
            </div>
          </label>

          {/* Fault-based Option */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'wales_fault_based'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="wales_fault_based"
              checked={evictionRoute === 'wales_fault_based'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Fault-based — Grounds for possession
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Notice period varies by ground (14-56 days). Requires specific grounds such as
                serious rent arrears, anti-social behaviour, or breach of occupation contract.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  RHW23
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  14-56 days notice
                </span>
              </div>
            </div>
          </label>
        </div>

        {!evictionRoute && (
          <p className="text-sm text-gray-500 italic">
            Please select an eviction route to continue.
          </p>
        )}
      </div>

      {/* Route-specific info boxes */}
      {evictionRoute === 'wales_section_173' && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Section 173 Requirements (Renting Homes Act)
          </h4>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Cannot serve within first 6 months of occupation</li>
            <li>Minimum 6 months' notice period</li>
            <li>Landlord must be Rent Smart Wales registered</li>
            <li>If deposit taken, must be protected in approved scheme</li>
            <li>Contract must be a "standard occupation contract"</li>
          </ul>
        </div>
      )}

      {evictionRoute === 'wales_fault_based' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Wales Fault-Based Grounds (Renting Homes Act 2016)
          </h4>
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              <strong>Mandatory grounds</strong> (court must grant possession if proven):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>Serious rent arrears (2+ months) - 14 days notice</li>
              <li>Persistent rent arrears (3x in 3 years) - 14 days notice</li>
            </ul>
            <p className="mb-2">
              <strong>Discretionary grounds</strong> (court decides if reasonable):
            </p>
            <ul className="list-disc list-inside">
              <li>Some rent arrears - 56 days notice</li>
              <li>Anti-social behaviour - 56 days notice</li>
              <li>Breach of occupation contract - 56 days notice</li>
              <li>Property deterioration - 56 days notice</li>
              <li>False statement - 56 days notice</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalesCaseBasicsSection;
