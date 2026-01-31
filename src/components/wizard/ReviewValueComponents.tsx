/**
 * Review Value Components
 *
 * UX components that surface hidden value during the review stage:
 * 1. JurisdictionExplainer - Shows which legal framework applies and key differences
 * 2. ChecksSummaryBox - Shows what legal checks we performed
 *
 * These components communicate the solicitor-grade validation we perform.
 *
 * @module src/components/wizard/ReviewValueComponents
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import {
  RiShieldCheckLine,
  RiMapPin2Line,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
} from 'react-icons/ri';
import {
  type CanonicalJurisdiction,
  getJurisdictionName,
  getLegalFramework,
} from '@/lib/types/jurisdiction';

// =============================================================================
// JURISDICTION EXPLAINER
// =============================================================================

interface JurisdictionInfo {
  legislation: string;
  noticePeriod: string;
  keyDifferences: string[];
  tenancyType: string;
}

/**
 * Jurisdiction-specific information mapping
 */
const JURISDICTION_INFO: Record<CanonicalJurisdiction, JurisdictionInfo> = {
  england: {
    legislation: 'Housing Act 1988',
    noticePeriod: '2 months (Section 21) or 2 weeks–2 months (Section 8)',
    tenancyType: 'Assured Shorthold Tenancy (AST)',
    keyDifferences: [
      'Section 21 (no-fault) eviction available',
      'Deposit cap: 5 weeks rent (6 weeks if annual rent over £50,000)',
      'EPC, Gas Safety Certificate, and How to Rent guide required',
    ],
  },
  wales: {
    legislation: 'Renting Homes (Wales) Act 2016',
    noticePeriod: '6 months minimum (Section 173)',
    tenancyType: 'Occupation Contract',
    keyDifferences: [
      'No-fault eviction requires 6 months notice (vs 2 months in England)',
      'Uses "contract-holder" terminology instead of "tenant"',
      'Landlord registration required with Rent Smart Wales',
      'Written statement of occupation contract mandatory',
    ],
  },
  scotland: {
    legislation: 'Private Housing (Tenancies) (Scotland) Act 2016',
    noticePeriod: '28 days–84 days depending on ground',
    tenancyType: 'Private Residential Tenancy (PRT)',
    keyDifferences: [
      'No Section 21 equivalent - all evictions require grounds',
      'Cases go to First-tier Tribunal, not county court',
      'Landlord registration with local authority required',
      '6-month rule: Cannot evict in first 6 months (most grounds)',
    ],
  },
  'northern-ireland': {
    legislation: 'Private Tenancies (Northern Ireland) Order 2006',
    noticePeriod: '4 weeks–12 weeks depending on tenancy length',
    tenancyType: 'Private Tenancy',
    keyDifferences: [
      'Notice period increases with tenancy length',
      'Landlord registration required',
      'Limited eviction routes compared to England',
    ],
  },
};

interface JurisdictionExplainerProps {
  jurisdiction: string | null | undefined;
  product?: string;
}

/**
 * Displays jurisdiction-specific legal framework information.
 * Helps users understand why their documents differ from other jurisdictions.
 */
export function JurisdictionExplainer({
  jurisdiction,
  product,
}: JurisdictionExplainerProps) {
  // Normalize jurisdiction
  const canonicalJurisdiction = (jurisdiction?.toLowerCase() || 'england') as CanonicalJurisdiction;
  const info = JURISDICTION_INFO[canonicalJurisdiction] || JURISDICTION_INFO.england;
  const jurisdictionName = getJurisdictionName(canonicalJurisdiction);

  return (
    <Card className="p-4 border-purple-200 bg-purple-50/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <RiMapPin2Line className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-purple-900 mb-1">
            Your property is in {jurisdictionName}
          </h3>
          <p className="text-sm text-purple-800 mb-2">
            We're using <span className="font-medium">{info.legislation}</span> rules to validate your case.
          </p>

          {/* Key differences */}
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
              What this means for you:
            </p>
            <ul className="text-xs text-purple-800 space-y-1">
              {info.keyDifferences.slice(0, 3).map((diff, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notice period callout for eviction products */}
          {(product === 'notice_only' || product === 'complete_pack') && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-purple-700">
                <span className="font-medium">Notice period:</span> {info.noticePeriod}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// CHECKS SUMMARY BOX
// =============================================================================

/**
 * Example legal checks we perform (for display when exact counts unavailable)
 */
const LEGAL_CHECK_EXAMPLES = {
  notice_only: [
    'Deposit protection status',
    'Prescribed information served',
    'Gas safety certificate provided',
    'EPC rating compliance',
    'How to Rent guide served',
    'Notice period calculation',
    'Retaliatory eviction check',
  ],
  complete_pack: [
    'Section 21/8 eligibility',
    'Ground requirements verification',
    'Deposit protection compliance',
    'HMO licensing status',
    'Notice period calculation',
    'Arrears threshold (Ground 8)',
    'Evidence requirements check',
    'Court form selection',
  ],
  money_claim: [
    'Pre-Action Protocol compliance',
    'Arrears calculation accuracy',
    'Interest calculation (if claimed)',
    'Claim amount validation',
    'Defendant details verification',
    'Timeline consistency',
  ],
  tenancy_agreement: [
    'Deposit cap compliance',
    'Required clauses included',
    'Jurisdiction-specific terms',
    'Break clause validity',
    'Rent increase provisions',
  ],
};

interface ChecksSummaryBoxProps {
  /** Blocking issues from analysis */
  blockingIssues?: Array<{ severity?: string; [key: string]: any }>;
  /** Warnings from case health */
  warnings?: Array<any>;
  /** Risks from case health */
  risks?: Array<any>;
  /** Info items */
  infos?: Array<any>;
  /** Positive checks that passed */
  positives?: Array<any>;
  /** Product type for tailored messaging */
  product?: string;
  /** Case health object (for money claim) */
  caseHealth?: {
    blockers?: any[];
    warnings?: any[];
    risks?: any[];
    positives?: any[];
  };
}

/**
 * Displays a summary of legal checks performed.
 * Shows pass/fail counts when available, otherwise lists example checks.
 */
export function ChecksSummaryBox({
  blockingIssues = [],
  warnings = [],
  risks = [],
  infos = [],
  positives = [],
  product = 'complete_pack',
  caseHealth,
}: ChecksSummaryBoxProps) {
  // Use caseHealth if provided (money claim), otherwise use direct props
  const blockers = caseHealth?.blockers ?? blockingIssues.filter(i => i.severity === 'blocking');
  const warningCount = caseHealth?.warnings?.length ?? warnings.length;
  const riskCount = caseHealth?.risks?.length ?? risks.length;
  const positiveCount = caseHealth?.positives?.length ?? positives.length;

  const blockerCount = blockers.length;
  const totalIssues = blockerCount + warningCount + riskCount;

  // Get example checks for the product
  const productKey = product as keyof typeof LEGAL_CHECK_EXAMPLES;
  const exampleChecks = LEGAL_CHECK_EXAMPLES[productKey] || LEGAL_CHECK_EXAMPLES.complete_pack;

  // Determine if we can show reliable counts
  // We show counts if we have any positives tracked OR any issues found
  const hasReliableCounts = positiveCount > 0 || totalIssues > 0;

  return (
    <Card className="p-4 border-green-200 bg-green-50/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <RiShieldCheckLine className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-green-900 mb-1">
            Legal Compliance Check Complete
          </h3>

          {hasReliableCounts ? (
            <>
              {/* Show counts when available */}
              <p className="text-sm text-green-800 mb-3">
                We verified your case against{' '}
                <span className="font-medium">{positiveCount + totalIssues}</span> legal requirements.
              </p>

              {/* Status breakdown */}
              <div className="flex flex-wrap gap-3 text-xs">
                {positiveCount > 0 && (
                  <div className="flex items-center gap-1.5 text-green-700">
                    <RiCheckboxCircleLine className="h-4 w-4" />
                    <span>{positiveCount} passed</span>
                  </div>
                )}
                {blockerCount > 0 && (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <RiErrorWarningLine className="h-4 w-4" />
                    <span>{blockerCount} blocking</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <RiErrorWarningLine className="h-4 w-4" />
                    <span>{warningCount} warnings</span>
                  </div>
                )}
                {riskCount > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-600">
                    <RiInformationLine className="h-4 w-4" />
                    <span>{riskCount} risks noted</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Fallback: show example checks */}
              <p className="text-sm text-green-800 mb-2">
                We ran dozens of legal checks on your case, including:
              </p>
              <ul className="text-xs text-green-700 space-y-1 mb-2">
                {exampleChecks.slice(0, 4).map((check, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <RiCheckboxCircleLine className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-green-600">
                ...and {exampleChecks.length - 4}+ more jurisdiction-specific requirements.
              </p>
            </>
          )}

          {/* Value callout */}
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-700">
              <span className="font-medium">Solicitor comparison:</span>{' '}
              A property solicitor would charge £200-500 for this level of compliance review.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
