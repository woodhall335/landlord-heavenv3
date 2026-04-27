/**
 * Case Basics Section - Eviction Wizard
 *
 * England public flows now use the post-1 May 2026 Form 3A route only.
 * Wales still requires route selection between Section 173 and fault-based paths.
 */

'use client';

import Image from 'next/image';
import React, { useEffect, useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';

interface CaseBasicsSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  flowProduct?: 'notice_only' | 'complete_pack';
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

const ENGLAND_ROUTES = ['section_8'];
const WALES_ROUTES = ['section_173', 'fault_based'];

type EnglandPrimaryIssueId =
  | 'rent_not_paid'
  | 'rent_paid_late'
  | 'breach_or_damage'
  | 'antisocial_or_criminal'
  | 'need_property_back'
  | 'right_to_rent'
  | 'specialist_case'
  | 'not_sure';

interface SelectorCard {
  id: EnglandPrimaryIssueId;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

interface SelectorSubtype {
  id: string;
  title: string;
  description: string;
  grounds: string[];
}

const ENGLAND_PRIMARY_ISSUES: SelectorCard[] = [
  {
    id: 'rent_not_paid',
    title: 'Tenant is not paying rent',
    description: 'Use this when the main issue is unpaid rent and you need an arrears-led notice.',
    imageSrc: '/images/tenant-is-not-paying-rent.webp',
    imageAlt: 'Tenant is not paying rent',
  },
  {
    id: 'rent_paid_late',
    title: 'Tenant keeps paying late',
    description: 'Use this when rent is persistently late even if some payments do arrive.',
    imageSrc: '/images/tenant-keeps-paying-late.webp',
    imageAlt: 'Tenant keeps paying late',
  },
  {
    id: 'breach_or_damage',
    title: 'Tenant has broken the tenancy or caused damage',
    description: 'Use this for breach of terms, damage to the property, or damage to furniture.',
    imageSrc: '/images/tenant-has-broken-the-tenancy-or-caused-damage.webp',
    imageAlt: 'Tenant has broken the tenancy or caused damage',
  },
  {
    id: 'antisocial_or_criminal',
    title: 'Serious antisocial or criminal behaviour',
    description: 'Use this for nuisance, serious criminal conduct, or riot-related behaviour.',
    imageSrc: '/images/serious-antisocial-or-criminal-behaviour.webp',
    imageAlt: 'Serious antisocial or criminal behaviour',
  },
  {
    id: 'need_property_back',
    title: 'I need the property back',
    description: 'Use this if you need possession because of sale, occupation, works, or rehousing.',
    imageSrc: '/images/i-need-the-property-back.webp',
    imageAlt: 'I need the property back',
  },
  {
    id: 'right_to_rent',
    title: 'Immigration or right to rent issue',
    description: 'Use this where the tenancy is affected by right to rent restrictions.',
    imageSrc: '/images/immigration-or-right-to-rent-issue.webp',
    imageAlt: 'Immigration or right to rent issue',
  },
  {
    id: 'specialist_case',
    title: 'Specialist housing or employment case',
    description: 'Use this for mortgagee, student, supported housing, or employment-linked possession routes.',
    imageSrc: '/images/specialist-housing-or-employment-case.webp',
    imageAlt: 'Specialist housing or employment case',
  },
  {
    id: 'not_sure',
    title: "I'm not sure yet",
    description: 'Start with the broad route now and choose the legal ground on the next step.',
    imageSrc: '/images/i-am-not-sure-yet.webp',
    imageAlt: "I'm not sure yet",
  },
];

const ENGLAND_SUBTYPES: Record<string, SelectorSubtype[]> = {
  breach_or_damage: [
    {
      id: 'breach_terms',
      title: 'Breach of tenancy terms',
      description: 'For general breach of tenancy obligations.',
      grounds: ['Ground 12'],
    },
    {
      id: 'damage_property',
      title: 'Damage to the property',
      description: 'For deterioration or damage to the dwelling.',
      grounds: ['Ground 13'],
    },
    {
      id: 'damage_furniture',
      title: 'Damage to furniture',
      description: 'For deterioration or damage to furniture provided with the tenancy.',
      grounds: ['Ground 15'],
    },
  ],
  antisocial_or_criminal: [
    {
      id: 'antisocial',
      title: 'Antisocial behaviour or nuisance',
      description: 'For nuisance, annoyance, or antisocial conduct.',
      grounds: ['Ground 14'],
    },
    {
      id: 'serious_criminal',
      title: 'Serious criminal behaviour',
      description: 'For the severe antisocial or criminal behaviour route.',
      grounds: ['Ground 7A'],
    },
    {
      id: 'rioting',
      title: 'Rioting conviction',
      description: 'For cases linked to a riot-related conviction.',
      grounds: ['Ground 14ZA'],
    },
  ],
  need_property_back: [
    {
      id: 'sell_property',
      title: 'I want to sell it',
      description: 'For sale of the dwelling-house by the landlord.',
      grounds: ['Ground 1A'],
    },
    {
      id: 'live_there',
      title: 'I or my family need to live there',
      description: 'For occupation by the landlord or a family member.',
      grounds: ['Ground 1'],
    },
    {
      id: 'redevelopment',
      title: 'It needs redevelopment or major works',
      description: 'For works that require possession.',
      grounds: ['Ground 6'],
    },
    {
      id: 'alternative_accommodation',
      title: 'Suitable alternative accommodation is available',
      description: 'For cases where other accommodation can be offered.',
      grounds: ['Ground 9'],
    },
  ],
  specialist_case: [
    {
      id: 'mortgagee_sale',
      title: 'Mortgage lender repossession',
      description: 'For possession by a mortgagee.',
      grounds: ['Ground 2'],
    },
    {
      id: 'student_accommodation',
      title: 'Student accommodation',
      description: 'For student accommodation cases.',
      grounds: ['Ground 4A'],
    },
    {
      id: 'religious_housing',
      title: 'Religious or minister housing',
      description: 'For occupation by a minister of religion.',
      grounds: ['Ground 5'],
    },
    {
      id: 'employment_linked',
      title: 'Employment-linked housing',
      description: 'For agricultural or employment-related occupation cases.',
      grounds: ['Ground 5C'],
    },
    {
      id: 'supported_or_homelessness',
      title: 'Supported housing or homelessness placement',
      description: 'For supported accommodation, homelessness, or stepping-stone arrangements.',
      grounds: ['Ground 5G'],
    },
    {
      id: 'superior_lease',
      title: 'Superior lease or superior landlord issue',
      description: 'For superior lease end or superior landlord possession cases.',
      grounds: ['Ground 2ZA'],
    },
  ],
};

function getRecommendedGrounds(primaryIssue?: string, subtype?: string): string[] {
  switch (primaryIssue) {
    case 'rent_not_paid':
      return ['Ground 8', 'Ground 10'];
    case 'rent_paid_late':
      return ['Ground 11'];
    case 'right_to_rent':
      return ['Ground 7B'];
    case 'not_sure':
    case undefined:
    case '':
      return [];
    default: {
      const match = ENGLAND_SUBTYPES[primaryIssue || '']?.find((option) => option.id === subtype);
      return match?.grounds || [];
    }
  }
}

export const CaseBasicsSection: React.FC<CaseBasicsSectionProps> = ({
  facts,
  jurisdiction,
  flowProduct: _flowProduct = 'complete_pack',
  onUpdate,
}) => {
  const evictionRoute = facts.eviction_route || '';
  const isWales = jurisdiction === 'wales';
  const isEngland = jurisdiction === 'england';

  const validRoutes = isWales ? WALES_ROUTES : ENGLAND_ROUTES;
  const hasInvalidRoute = evictionRoute && !validRoutes.includes(evictionRoute);
  const selectedPrimaryIssue = String(facts.england_primary_issue || '');
  const selectedSubtype = String(facts.england_issue_subtype || '');
  const subtypeOptions = useMemo(
    () => ENGLAND_SUBTYPES[selectedPrimaryIssue] || [],
    [selectedPrimaryIssue]
  );
  const recommendedGrounds = useMemo(
    () => getRecommendedGrounds(selectedPrimaryIssue, selectedSubtype),
    [selectedPrimaryIssue, selectedSubtype]
  );
  const hasTouchedGrounds = Boolean(facts.section8_grounds_touched);

  const handleSelectPrimaryIssue = (issueId: EnglandPrimaryIssueId) => {
    const nextSubtypeOptions = ENGLAND_SUBTYPES[issueId] || [];
    const updates: Record<string, any> = {
      eviction_route: 'section_8',
      england_primary_issue: issueId,
      england_issue_subtype: nextSubtypeOptions.length > 0 ? '' : null,
    };

    if (!hasTouchedGrounds) {
      const nextGrounds = nextSubtypeOptions.length > 0 ? [] : getRecommendedGrounds(issueId, '');
      updates.section8_grounds = nextGrounds;
      updates.section8_grounds_seeded_from_selector = nextGrounds.length > 0;
    }

    void onUpdate(updates);
  };

  const handleSelectSubtype = (subtypeId: string) => {
    const updates: Record<string, any> = {
      england_issue_subtype: subtypeId,
    };

    if (!hasTouchedGrounds) {
      const nextGrounds = getRecommendedGrounds(selectedPrimaryIssue, subtypeId);
      updates.section8_grounds = nextGrounds;
      updates.section8_grounds_seeded_from_selector = nextGrounds.length > 0;
    }

    void onUpdate(updates);
  };

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
            <span className="font-medium text-gray-900">Wales</span>
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

      <div className="space-y-4">
        {isEngland ? (
          <>
            <div className="rounded-[1.4rem] border border-[#e8deff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,255,0.95))] p-5 shadow-[0_12px_30px_rgba(76,29,149,0.05)]">
              <h3 className="text-base font-semibold text-[#20103f]">Choose the main reason you need possession</h3>
              <p className="mt-2 text-sm leading-6 text-[#5f5878]">
                Start in plain English here. We will confirm or change the legal grounds on the next step.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {ENGLAND_PRIMARY_ISSUES.map((issue) => {
                const selected = selectedPrimaryIssue === issue.id;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => handleSelectPrimaryIssue(issue.id)}
                    className={`overflow-hidden rounded-[1.35rem] border text-left transition ${
                      selected
                        ? 'border-[#7C3AED] bg-[#f5efff] shadow-[0_10px_24px_rgba(124,58,237,0.12)]'
                        : 'border-[#ebe4ff] bg-white hover:border-[#d8cbff] hover:bg-[#fcfaff]'
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="w-full overflow-hidden">
                      <Image
                        src={issue.imageSrc}
                        alt={issue.imageAlt}
                        width={720}
                        height={360}
                        className="h-[188px] w-full object-cover"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#20103f]">{issue.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#60597a]">{issue.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {subtypeOptions.length > 0 && (
              <div className="rounded-[1.4rem] border border-[#ece3ff] bg-[#fbf9ff] p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">
                  Refine that issue
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#5f5878]">
                  Pick the version that best matches the case. We will use that to suggest the right ground on the next step.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {subtypeOptions.map((option) => {
                    const selected = selectedSubtype === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectSubtype(option.id)}
                        className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                          selected
                            ? 'border-[#7C3AED] bg-white shadow-[0_8px_20px_rgba(124,58,237,0.10)]'
                            : 'border-[#e9e2ff] bg-white hover:border-[#d8cbff] hover:bg-[#fcfaff]'
                        }`}
                        aria-pressed={selected}
                      >
                        <p className="text-sm font-semibold text-[#20103f]">{option.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[#60597a]">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(recommendedGrounds.length > 0 || selectedPrimaryIssue === 'not_sure') && (
              <div className="rounded-[1.35rem] border border-[#e5dcff] bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f54c8]">
                  What happens next
                </p>
                {recommendedGrounds.length > 0 ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-[#20103f]">
                      Likely grounds: {recommendedGrounds.join(', ')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#60597a]">
                      We will preselect these on the notice step so you can confirm the legal ground, service details, and timing without starting from scratch.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[#60597a]">
                    You can choose the legal ground directly on the next step once you have more context.
                  </p>
                )}
                {hasTouchedGrounds && (
                  <p className="mt-3 text-xs leading-5 text-[#7b6e98]">
                    You have already edited the legal grounds later in the flow, so this selector will not overwrite them automatically.
                  </p>
                )}
              </div>
            )}
          </>
        ) : isWales ? (
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
        ) : null}
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
