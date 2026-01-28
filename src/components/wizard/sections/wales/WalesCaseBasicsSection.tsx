/**
 * Wales Case Basics Section - Notice Only Wizard
 *
 * Step 1: Collects jurisdiction (fixed to Wales) and eviction route.
 * Routes determine which subsequent sections are shown.
 *
 * Wales Routes under Renting Homes (Wales) Act 2016:
 * - Section 173: No-fault eviction (6 months notice)
 * - Fault-based: Various sections based on grounds (Section 157, 159, 161, 162)
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface WalesCaseBasicsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const WalesCaseBasicsSection: React.FC<WalesCaseBasicsSectionProps> = ({
  facts,
  onUpdate,
}) => {
  // Normalize legacy prefixed values to canonical keys
  // This handles existing saved sessions that may have 'wales_' prefix
  const normalizeRoute = (route: string | undefined): string => {
    if (!route) return '';
    if (route === 'wales_section_173') return 'section_173';
    if (route === 'wales_fault_based') return 'fault_based';
    return route;
  };

  const evictionRoute = normalizeRoute(facts.eviction_route as string);

  return (
    <div className="space-y-6">
      {/* Jurisdiction display (read-only) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Jurisdiction
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-gray-900 font-medium">
            Wales
          </span>
          <p className="text-xs text-gray-500 mt-1">
            This wizard is configured for Welsh law under the Renting Homes (Wales) Act 2016.
          </p>
        </div>
      </div>

      {/* Eviction route selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Which notice type are you issuing?
          <span className="text-red-500 ml-1">*</span>
        </label>

        <div className="space-y-3">
          {/* Section 173 (No-fault) Option */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'section_173'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="section_173"
              checked={evictionRoute === 'section_173'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Section 173 — No-fault notice
              </span>
              <p className="text-sm text-gray-600 mt-1">
                6 months notice required. No specific grounds needed, but cannot be served
                in the first 6 months of a standard occupation contract.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  180 days notice
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Renting Homes Act s.173
                </span>
              </div>
            </div>
          </label>

          {/* Fault-based Option */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'fault_based'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="fault_based"
              checked={evictionRoute === 'fault_based'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Fault-based notice
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Notice period varies by ground (14-30 days). Requires specific grounds
                such as rent arrears, breach of contract, or anti-social behaviour.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  14-30 days notice
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Sections 157, 159, 161, 162
                </span>
              </div>
            </div>
          </label>
        </div>

        {!evictionRoute && (
          <p className="text-sm text-gray-500 italic">
            Please select a notice type to continue.
          </p>
        )}
      </div>

      {/* Route-specific info boxes */}
      {evictionRoute === 'section_173' && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Section 173 Requirements
          </h4>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>6 months (180 days) minimum notice period</li>
            <li>Cannot be served in first 6 months of the contract</li>
            <li>Written statement of the occupation contract must be provided</li>
            <li>Notice must be in prescribed form</li>
            <li>Cannot be served if certain retaliatory conditions apply</li>
          </ul>
        </div>
      )}

      {evictionRoute === 'fault_based' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Fault-Based Grounds (Renting Homes Act 2016)
          </h4>
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              <strong>Section 157 - Serious rent arrears</strong> (14 days):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>At least 2 months (8 weeks) of rent unpaid</li>
            </ul>
            <p className="mb-2">
              <strong>Section 159 - Some rent arrears</strong> (30 days):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>Less than 2 months of rent unpaid</li>
            </ul>
            <p className="mb-2">
              <strong>Section 161 - Anti-social behaviour</strong> (14 days):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>Serious anti-social behaviour or nuisance</li>
            </ul>
            <p className="mb-2">
              <strong>Section 162 - Breach of contract</strong> (30 days):
            </p>
            <ul className="list-disc list-inside">
              <li>Breach of terms in the occupation contract</li>
              <li>False statement to obtain the contract</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalesCaseBasicsSection;
