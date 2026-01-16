/**
 * Case Basics Section - Eviction Wizard
 *
 * Step 1: Collects jurisdiction and eviction route.
 * Routes determine which subsequent sections are shown.
 *
 * IMPORTANT: Wales uses different eviction routes under the Renting Homes (Wales) Act 2016:
 * - Section 173 (no-fault) instead of Section 21
 * - Section 8 grounds are not available; use fault_based route
 *
 * Fields:
 * - jurisdiction: England or Wales
 * - eviction_route: Jurisdiction-specific route options
 */

'use client';

import React from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface CaseBasicsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

// Valid routes by jurisdiction
const ENGLAND_ROUTES = ['section_8', 'section_21'];
const WALES_ROUTES = ['section_173', 'fault_based'];

export const CaseBasicsSection: React.FC<CaseBasicsSectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const evictionRoute = facts.eviction_route || '';

  // Determine which routes are available based on jurisdiction
  const isWales = jurisdiction === 'wales';

  // Check for invalid saved route (e.g., Wales case with section_8 from old data)
  const validRoutes = isWales ? WALES_ROUTES : ENGLAND_ROUTES;
  const hasInvalidRoute = evictionRoute && !validRoutes.includes(evictionRoute);

  // Reset invalid route
  const handleResetRoute = () => {
    onUpdate({ eviction_route: '' });
  };

  return (
    <div className="space-y-6">
      {/* Jurisdiction display (read-only) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Jurisdiction
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-gray-900 font-medium">
            {jurisdiction === 'england' ? 'England' : 'Wales'}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {isWales
              ? 'This wizard is configured for Welsh law under the Renting Homes (Wales) Act 2016.'
              : 'This wizard is configured for English law under the Housing Act 1988.'}
          </p>
        </div>
      </div>

      {/* Invalid route guardrail - show when saved route doesn't match jurisdiction */}
      {hasInvalidRoute && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                Invalid eviction route for {isWales ? 'Wales' : 'England'}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                The previously selected route &quot;{evictionRoute}&quot; is not valid for {isWales ? 'Welsh' : 'English'} law.
                {isWales
                  ? ' Wales uses the Renting Homes (Wales) Act 2016, not Housing Act 1988 notices.'
                  : ' England uses Housing Act 1988 notices (Section 8/21).'}
              </p>
              <button
                onClick={handleResetRoute}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              >
                Reset and choose a valid route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eviction route selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Which eviction route are you using?
          <span className="text-red-500 ml-1">*</span>
        </label>

        {/* Jurisdiction-specific helper text */}
        <p className="text-sm text-gray-500">
          {isWales ? (
            <>
              <strong>Why these options?</strong> Since December 2022, Wales uses the{' '}
              <em>Renting Homes (Wales) Act 2016</em> instead of the Housing Act 1988.
              Section 8 and Section 21 notices do not apply in Wales.
            </>
          ) : (
            <>
              <strong>Why these options?</strong> England uses the{' '}
              <em>Housing Act 1988</em> for private tenancy evictions.
              Choose Section 21 for no-fault possession or Section 8 for grounds-based eviction.
            </>
          )}
        </p>

        <div className="space-y-3">
          {/* ================================================================== */}
          {/* ENGLAND ROUTES: Section 21 and Section 8 */}
          {/* ================================================================== */}
          {!isWales && (
            <>
              {/* Section 21 Option - England only */}
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

              {/* Section 8 Option - England only */}
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
            </>
          )}

          {/* ================================================================== */}
          {/* WALES ROUTES: Section 173 and Fault-based */}
          {/* Under Renting Homes (Wales) Act 2016, Section 21/8 do not apply */}
          {/* ================================================================== */}
          {isWales && (
            <>
              {/* Section 173 Option - Wales only (no-fault) */}
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
                    6 months minimum notice under the Renting Homes (Wales) Act 2016.
                    Cannot be used within the first 6 months of an occupation contract.
                    Landlord must comply with all statutory obligations.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      RHW Form
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Renting Homes (Wales) Act 2016
                    </span>
                  </div>
                </div>
              </label>

              {/* Fault-based Option - Wales only */}
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
                    Fault-based eviction — Breach grounds
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    For serious breach of contract, rent arrears (8+ weeks), antisocial behaviour,
                    or other grounds under the Renting Homes (Wales) Act 2016.
                    Notice period depends on the ground used.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      RHW Form
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Breach Notice
                    </span>
                  </div>
                </div>
              </label>

              {/* Wales info banner */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Wales Notice:</strong> Section 21 and Section 8 notices (Housing Act 1988)
                  do not apply in Wales since December 2022. All private tenancies in Wales are now
                  &quot;occupation contracts&quot; under the Renting Homes (Wales) Act 2016.
                </p>
              </div>
            </>
          )}
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

      {/* Wales: Section 173 info */}
      {evictionRoute === 'section_173' && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            Section 173 Requirements (Renting Homes Wales Act 2016)
          </h4>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li>Minimum 6 months notice period</li>
            <li>Cannot be served in first 6 months of occupation contract</li>
            <li>Written statement of contract must have been provided</li>
            <li>Landlord must be registered with Rent Smart Wales</li>
            <li>Property must meet fitness for human habitation standards</li>
            <li>Deposit (if taken) must be protected</li>
            <li>Not retaliatory (restrictions similar to England)</li>
          </ul>
        </div>
      )}

      {/* Wales: Fault-based info */}
      {evictionRoute === 'fault_based' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-900 mb-2">
            Fault-based Grounds (Renting Homes Wales Act 2016)
          </h4>
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              <strong>Serious breach grounds</strong> (absolute grounds):
            </p>
            <ul className="list-disc list-inside mb-3">
              <li>8+ weeks rent arrears (mandatory if proven)</li>
              <li>Serious antisocial behaviour</li>
              <li>False statement to obtain tenancy</li>
            </ul>
            <p className="mb-2">
              <strong>Other breach grounds</strong> (court discretion):
            </p>
            <ul className="list-disc list-inside">
              <li>Breach of contract terms</li>
              <li>Estate management grounds</li>
              <li>Contract holder&apos;s behaviour</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseBasicsSection;
