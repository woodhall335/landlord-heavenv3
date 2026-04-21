/**
 * Case Basics Section - Eviction Wizard
 *
 * England public flows now use the post-1 May 2026 Form 3A route only.
 * Wales still requires route selection between Section 173 and fault-based paths.
 */

'use client';

import React, { useEffect } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface CaseBasicsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  flowProduct?: 'notice_only' | 'complete_pack';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ENGLAND_ROUTES = ['section_8'];
const WALES_ROUTES = ['section_173', 'fault_based'];

export const CaseBasicsSection: React.FC<CaseBasicsSectionProps> = ({
  facts,
  jurisdiction,
  flowProduct = 'complete_pack',
  onUpdate,
}) => {
  const evictionRoute = facts.eviction_route || '';
  const isWales = jurisdiction === 'wales';
  const isNoticeOnly = flowProduct === 'notice_only';

  const validRoutes = isWales ? WALES_ROUTES : ENGLAND_ROUTES;
  const hasInvalidRoute = evictionRoute && !validRoutes.includes(evictionRoute);

  const handleResetRoute = () => {
    void onUpdate({ eviction_route: '' });
  };

  useEffect(() => {
    if (!isWales && evictionRoute !== 'section_8') {
      void onUpdate({ eviction_route: 'section_8' });
    }
  }, [isWales, evictionRoute, onUpdate]);

  return (
    <div className="space-y-6">
      {isWales && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="font-medium text-gray-900">
              {jurisdiction === 'england' ? 'England' : 'Wales'}
            </span>
            <p className="mt-1 text-xs text-gray-500">
              {isWales
                ? 'This wizard is configured for Welsh law under the Renting Homes (Wales) Act 2016.'
                : 'This wizard is configured for English law under the Housing Act 1988.'}
            </p>
          </div>
        </div>
      )}

      {hasInvalidRoute && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                Invalid eviction route for {isWales ? 'Wales' : 'England'}
              </h4>
              <p className="mt-1 text-sm text-red-700">
                The previously selected route &quot;{evictionRoute}&quot; is not valid for{' '}
                {isWales ? 'Welsh' : 'English'} law.
                {isWales
                  ? ' Wales uses the Renting Homes (Wales) Act 2016, not Housing Act 1988 notices.'
                  : ' England private rented possession now uses the single Form 3A route.'}
              </p>
              <button
                onClick={handleResetRoute}
                className="mt-3 inline-flex items-center rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
              >
                Reset and choose a valid route
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!isWales ? (
          <>
            <label className="block text-sm font-medium text-gray-700">
              {isNoticeOnly ? 'Section 8 notice basics' : 'Possession case basics'}
            </label>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-amber-900">
                {isNoticeOnly ? 'Form 3A notice-stage pack' : 'Form 3A route with court-stage pack'}
              </h4>
              <div className="space-y-3 text-sm text-amber-800">
                <p>
                  {isNoticeOnly
                    ? 'This pack prepares the current England Form 3A notice and the notice-stage documents you need before serving anything.'
                    : 'This pack prepares the current England Form 3A notice and the court-stage possession paperwork used to move the case forward properly.'}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Ground 8 serious arrears now requires 3 months or 13 weeks of arrears,
                    depending on rent frequency.
                  </li>
                  <li>
                    Notice periods vary by ground, including 4 months, 4 weeks, 2 weeks, or
                    immediate-application routes.
                  </li>
                  <li>
                    Section 21 and N5B accelerated possession are no longer part of the England
                    private rented flow.
                  </li>
                </ul>
                {isNoticeOnly ? (
                  <div>
                    <p className="font-medium text-amber-900">Included in this notice pack:</p>
                    <p>
                      Form 3A notice, service instructions, service and validity checklist,
                      pre-service compliance declaration, and the rent schedule / arrears statement.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-amber-900">Included in this court-ready pack:</p>
                    <p>
                      Form 3A notice, Form N5, Form N119, the schedule of arrears, evidence
                      collection checklist, proof of service certificate, witness statement, court
                      bundle index, hearing checklist, arrears engagement letter, and the eviction
                      case summary.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Which eviction route are you using?
              <span className="ml-1 text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500">
              <strong>Why these options?</strong> Since December 2022, Wales uses the{' '}
              <em>Renting Homes (Wales) Act 2016</em> instead of the Housing Act 1988. Section 8
              and Section 21 notices do not apply in Wales.
            </p>

            <div className="space-y-3">
              <label
                className={`
                  flex cursor-pointer items-start rounded-lg border p-4 transition-all
                  ${
                    evictionRoute === 'section_173'
                      ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
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
                  <span className="font-medium text-gray-900">Section 173 — No-fault notice</span>
                  <p className="mt-1 text-sm text-gray-600">
                    6 months minimum notice under the Renting Homes (Wales) Act 2016. Cannot be
                    used within the first 6 months of an occupation contract. Landlord must comply
                    with all statutory obligations.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      RHW Form
                    </span>
                    <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      Renting Homes (Wales) Act 2016
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`
                  flex cursor-pointer items-start rounded-lg border p-4 transition-all
                  ${
                    evictionRoute === 'fault_based'
                      ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
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
                  <p className="mt-1 text-sm text-gray-600">
                    For serious breach of contract, rent arrears (8+ weeks), antisocial behaviour,
                    or other grounds under the Renting Homes (Wales) Act 2016. Notice period
                    depends on the ground used.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      RHW Form
                    </span>
                    <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Breach Notice
                    </span>
                  </div>
                </div>
              </label>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Wales Notice:</strong> Section 21 and Section 8 notices (Housing Act
                  1988) do not apply in Wales since December 2022. All private tenancies in Wales
                  are now occupation contracts under the Renting Homes (Wales) Act 2016.
                </p>
              </div>
            </div>

            {!evictionRoute && (
              <p className="text-sm italic text-gray-500">
                Please select an eviction route to continue.
              </p>
            )}
          </>
        )}
      </div>

      {evictionRoute === 'section_173' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-purple-900">
            Section 173 Requirements (Renting Homes Wales Act 2016)
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
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

      {evictionRoute === 'fault_based' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-amber-900">
            Fault-based Grounds (Renting Homes Wales Act 2016)
          </h4>
          <div className="text-sm text-amber-800">
            <p className="mb-2">
              <strong>Serious breach grounds</strong> (absolute grounds):
            </p>
            <ul className="mb-3 list-disc list-inside">
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
