/**
 * Case Basics Section - Eviction Wizard
 *
 * Step 1: Collects jurisdiction (fixed to England for now) and eviction route.
 * Routes determine which subsequent sections are shown.
 *
 * Fields:
 * - jurisdiction: Fixed to England (for now, extensible to Wales/Scotland later)
 * - eviction_route: Section 8 (fault-based) or Section 21 (no-fault)
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface CaseBasicsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const CaseBasicsSection: React.FC<CaseBasicsSectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const evictionRoute = facts.eviction_route || '';

  return (
    <div className="space-y-6">
      {/* Jurisdiction display (read-only for now) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Jurisdiction
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-gray-900 font-medium">
            {jurisdiction === 'england' ? 'England' : 'Wales'}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            This wizard is configured for {jurisdiction === 'england' ? 'English' : 'Welsh'} law
            under the Housing Act 1988.
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
          {/* Section 21 Option */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'section_21'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="section_21"
              checked={evictionRoute === 'section_21'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Section 21 — No-fault eviction
              </span>
              <p className="text-sm text-gray-600 mt-1">
                2 months notice. No reason required, but strict compliance checks apply.
                Deposit must be protected, EPC, Gas Safety, and How to Rent guide must be provided.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Form 6A
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Accelerated Possession (N5B)
                </span>
              </div>
            </div>
          </label>

          {/* Section 8 Option */}
          <label
            className={`
              flex items-start p-4 border rounded-lg cursor-pointer transition-all
              ${evictionRoute === 'section_8'
                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <input
              type="radio"
              name="eviction_route"
              value="section_8"
              checked={evictionRoute === 'section_8'}
              onChange={(e) => onUpdate({ eviction_route: e.target.value })}
              className="mt-1 mr-3"
            />
            <div>
              <span className="font-medium text-gray-900">
                Section 8 — Grounds-based eviction
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Notice period varies by ground (14 days to 2 months). Requires specific grounds
                such as rent arrears, breach of tenancy, or antisocial behaviour.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Form 3
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Standard Possession (N5 + N119)
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
      {evictionRoute === 'section_21' && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Section 21 Requirements
          </h4>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Deposit protected within 30 days of receipt</li>
            <li>Prescribed information served within 30 days</li>
            <li>Valid Gas Safety Certificate provided annually</li>
            <li>Energy Performance Certificate (EPC) provided</li>
            <li>&apos;How to Rent&apos; guide provided</li>
            <li>Not served within first 4 months of tenancy</li>
            <li>Not retaliatory (within 6 months of repair complaint)</li>
          </ul>
        </div>
      )}

      {evictionRoute === 'section_8' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Section 8 Grounds (Housing Act 1988, Schedule 2)
          </h4>
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              <strong>Mandatory grounds</strong> (court must grant possession if proven):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>Ground 8: 2+ months rent arrears at notice and hearing</li>
              <li>Grounds 1-7: Owner occupation, mortgage, etc.</li>
            </ul>
            <p className="mb-2">
              <strong>Discretionary grounds</strong> (court decides if reasonable):
            </p>
            <ul className="list-disc list-inside">
              <li>Ground 10/11: Rent arrears / persistent delay</li>
              <li>Ground 12: Breach of tenancy</li>
              <li>Ground 14: Antisocial behaviour</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseBasicsSection;
