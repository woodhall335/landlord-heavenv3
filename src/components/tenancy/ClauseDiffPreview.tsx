/**
 * Clause Diff Preview Component
 *
 * Shows visual side-by-side comparison of Standard vs Premium tenancy agreement clauses.
 * - Highlights HMO clauses present only in Premium (green/purple)
 * - Greys out missing clauses in Standard
 * - Adds "Why this matters" hover explanations
 * - Jurisdiction-specific terminology and legislation
 *
 * IMPORTANT: Clause IDs here must match the canonical ClauseId type in clause-verifier.ts.
 * The clause-verifier ensures UI claims match actual HBS template content.
 * Run `npm run audit:tenancy-clauses` to verify UI/template alignment.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  RiInformationLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiLockLine,
} from 'react-icons/ri';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import {
  trackClauseDiffViewed,
  trackClauseDiffUpgradeClicked,
  trackClauseHoverExplanation,
} from '@/lib/analytics';
import {
  type ClauseId,
  CLAUSE_DEFINITIONS as CANONICAL_CLAUSE_DEFINITIONS,
  JURISDICTION_TERMINOLOGY,
  getClauseDefinition,
  isClauseInTier,
} from '@/lib/tenancy/clause-verifier';

/**
 * UI Clause Definition - extends canonical clause with display content
 * The `canonicalId` links to the verified HBS template markers.
 */
interface ClauseDefinition {
  /** Canonical clause ID from clause-verifier.ts - MUST match HBS markers */
  canonicalId: ClauseId;
  /** Legacy ID for analytics compatibility */
  id: string;
  /** Clause title */
  title: string;
  /** Short preview text (shown in grey for Standard) */
  standardPreview: string;
  /** Full clause text (shown for Premium) */
  premiumClause: string;
  /** "Why this matters" explanation */
  whyItMatters: string;
  /** Legal basis/reference */
  legalBasis?: string;
  /** Is this an HMO-specific clause? */
  isHMO: boolean;
  /** Category for grouping */
  category: 'liability' | 'hmo' | 'financial' | 'control' | 'compliance';
}

interface ClauseDiffPreviewProps {
  /** Jurisdiction for terminology */
  jurisdiction?: CanonicalJurisdiction;
  /** Show upgrade CTA */
  showUpgradeCTA?: boolean;
  /** Callback when upgrade is clicked */
  onUpgradeClick?: () => void;
  /** Variant: 'full' for product page, 'compact' for wizard */
  variant?: 'full' | 'compact';
  /** Maximum clauses to show (for compact mode) */
  maxClauses?: number;
}

/**
 * Jurisdiction-specific terminology
 */
const JURISDICTION_TERMS: Record<CanonicalJurisdiction, {
  tenant: string;
  tenancy: string;
  agreement: string;
  hmoAct: string;
}> = {
  england: {
    tenant: 'Tenant',
    tenancy: 'tenancy',
    agreement: 'Assured Shorthold Tenancy',
    hmoAct: 'Housing Act 2004',
  },
  wales: {
    tenant: 'Contract Holder',
    tenancy: 'occupation',
    agreement: 'Occupation Contract',
    hmoAct: 'Housing (Wales) Act 2014',
  },
  scotland: {
    tenant: 'Tenant',
    tenancy: 'tenancy',
    agreement: 'Private Residential Tenancy',
    hmoAct: 'Civic Government (Scotland) Act 1982',
  },
  'northern-ireland': {
    tenant: 'Tenant',
    tenancy: 'tenancy',
    agreement: 'Private Tenancy',
    hmoAct: 'Housing (NI) Order 1992',
  },
};

/**
 * Get clauses with jurisdiction-specific terminology
 */
const getClauses = (jurisdiction: CanonicalJurisdiction): ClauseDefinition[] => {
  const terms = JURISDICTION_TERMS[jurisdiction];

  return [
    // JOINT AND SEVERAL LIABILITY
    // Maps to: <!-- CLAUSE:JOINT_LIABILITY --> in HBS templates
    {
      canonicalId: 'JOINT_LIABILITY',
      id: 'joint_liability',
      title: 'Joint and Several Liability',
      standardPreview: `The ${terms.tenant} shall pay the Rent...`,
      premiumClause: `The ${terms.tenant}s are jointly and severally liable for all obligations under this ${terms.agreement}. Each ${terms.tenant} is individually responsible for the full amount of Rent and any other sums due, regardless of any agreement between ${terms.tenant}s as to how such sums should be divided. The Landlord may pursue any one or all ${terms.tenant}s for the full amount owed without first pursuing any other ${terms.tenant}.`,
      whyItMatters: `If one ${terms.tenant.toLowerCase()} stops paying or leaves, you can pursue any other ${terms.tenant.toLowerCase()} for the full rent amount. Without this clause, you may only be able to claim each ${terms.tenant.toLowerCase()}'s individual share.`,
      legalBasis: 'Common law principle of joint and several liability',
      isHMO: true,
      category: 'liability',
    },

    // HMO SHARED FACILITIES
    // Maps to: <!-- CLAUSE:SHARED_FACILITIES --> in HBS templates
    {
      canonicalId: 'SHARED_FACILITIES',
      id: 'shared_facilities',
      title: 'Shared Facilities and Communal Areas',
      standardPreview: `The ${terms.tenant} shall keep the Property clean...`,
      premiumClause: `The ${terms.tenant}s shall keep all shared facilities (including kitchen, bathroom, and communal areas) in a clean and hygienic condition. ${terms.tenant}s shall:\n• Not leave personal belongings in communal areas overnight\n• Clean shared cooking areas after each use\n• Report any damage to shared facilities within 24 hours\n• Comply with any cleaning rota established by the Landlord\n• Not obstruct fire exits, hallways, or stairwells\nFailure to maintain shared areas to a reasonable standard shall be a breach of this ${terms.agreement}.`,
      whyItMatters: `Clearly defines responsibilities for shared spaces. Without this, disputes between ${terms.tenant.toLowerCase()}s about cleaning and maintenance become your problem. Essential for HMO licensing compliance.`,
      legalBasis: `${terms.hmoAct} - HMO management regulations`,
      isHMO: true,
      category: 'hmo',
    },

    // TENANT REPLACEMENT
    // Maps to: <!-- CLAUSE:TENANT_REPLACEMENT --> in HBS templates
    {
      canonicalId: 'TENANT_REPLACEMENT',
      id: 'tenant_replacement',
      title: '${terms.tenant} Replacement Procedure',
      standardPreview: `Assignment of this ${terms.tenancy} is not permitted...`,
      premiumClause: `If any ${terms.tenant} wishes to leave before the end of the fixed term:\n1. The departing ${terms.tenant} must give at least one month's written notice to the Landlord\n2. The Landlord's written consent is required before any replacement ${terms.tenant} can take occupation\n3. The Landlord may require the proposed replacement to pass referencing checks at the ${terms.tenant}'s expense\n4. A Deed of Assignment must be executed, releasing the departing ${terms.tenant} from future liability\n5. The deposit shall transfer to the replacement ${terms.tenant} subject to agreement of all parties\n6. Until a suitable replacement is found and approved, all remaining ${terms.tenant}s remain jointly liable for the full Rent`,
      whyItMatters: `Gives you control over who lives in your property and ensures ${terms.tenant.toLowerCase()}s can't simply walk away. The remaining ${terms.tenant.toLowerCase()}s stay liable until you approve a replacement.`,
      legalBasis: 'Contractual assignment provisions',
      isHMO: true,
      category: 'hmo',
    },

    // GUARANTOR
    // Maps to: <!-- CLAUSE:GUARANTOR --> in HBS templates
    {
      canonicalId: 'GUARANTOR',
      id: 'guarantor',
      title: 'Guarantor Agreement',
      standardPreview: '[Not included in Standard agreement]',
      premiumClause: `The Guarantor unconditionally guarantees to the Landlord the performance by the ${terms.tenant} of all obligations under this ${terms.agreement}. The Guarantor agrees:\n• To pay on demand any Rent or other sums the ${terms.tenant} fails to pay\n• To pay the cost of remedying any breach by the ${terms.tenant}\n• That liability continues until the ${terms.tenancy} ends and all sums are paid\n• This guarantee is not affected if the Landlord grants time or indulgence to the ${terms.tenant}\n• The Guarantor's liability is limited to [specified amount or 12 months' rent]`,
      whyItMatters: `Provides a financial safety net when ${terms.tenant.toLowerCase()}s have limited credit history (students, young professionals). The guarantor becomes liable if the ${terms.tenant.toLowerCase()} defaults.`,
      legalBasis: 'Contract law - guarantee agreements',
      isHMO: false,
      category: 'financial',
    },

    // RENT INCREASE
    // Maps to: <!-- CLAUSE:RENT_REVIEW --> in HBS templates
    {
      canonicalId: 'RENT_REVIEW',
      id: 'rent_review',
      title: 'Rent Review Provisions',
      standardPreview: '[Rent increase requires Section 13 notice]',
      premiumClause: `The Rent shall be reviewed annually on the anniversary of the ${terms.tenancy} start date. The new Rent shall be calculated as:\nOption A: Current Rent increased by the annual change in the Consumer Price Index (CPI) published by the ONS, plus [X]%\nOption B: Current Rent increased by [X]% per annum\nThe Landlord shall give the ${terms.tenant} at least one month's written notice of the new Rent. If the ${terms.tenant} does not agree to the increase, either party may serve notice to end the ${terms.tenancy} in accordance with the break clause.`,
      whyItMatters: `Allows predictable rent increases without serving formal Section 13 notices. Protects your rental income against inflation over longer ${terms.tenancy.toLowerCase()} terms.`,
      legalBasis: jurisdiction === 'scotland'
        ? 'Note: Subject to PRT rent increase controls'
        : 'Housing Act 1988 - contractual rent review',
      isHMO: false,
      category: 'financial',
    },

    // ANTI-SUBLETTING
    // Maps to: <!-- CLAUSE:ANTI_SUBLET --> in HBS templates
    {
      canonicalId: 'ANTI_SUBLET',
      id: 'anti_sublet',
      title: 'Anti-Subletting and Short-Let Prohibition',
      standardPreview: `The ${terms.tenant} shall not sublet the Property...`,
      premiumClause: `The ${terms.tenant} shall NOT:\n• Sublet, assign, or part with possession of the Property or any part of it\n• Allow any person not named on this ${terms.agreement} to reside at the Property for more than 14 consecutive days without the Landlord's written consent\n• Advertise or list the Property (or any room) on Airbnb, Booking.com, or any other short-let platform\n• Accept any payment from any person for occupation of the Property\n• Allow the Property to be used for any commercial purpose\nBreach of this clause shall be grounds for possession proceedings and the ${terms.tenant} shall be liable for any additional costs, fees, or losses incurred by the Landlord.`,
      whyItMatters: `Explicitly prevents ${terms.tenant.toLowerCase()}s from running unlicensed Airbnb operations from your property. Gives clear grounds for possession if breached.`,
      legalBasis: 'Contractual prohibition - supported by Housing Act grounds for possession',
      isHMO: false,
      category: 'control',
    },

    // PROFESSIONAL CLEANING
    // Maps to: <!-- CLAUSE:PROFESSIONAL_CLEANING --> in HBS templates
    {
      canonicalId: 'PROFESSIONAL_CLEANING',
      id: 'professional_cleaning',
      title: 'Professional Cleaning Requirement',
      standardPreview: `The ${terms.tenant} shall return the Property in good condition...`,
      premiumClause: `At the end of the ${terms.tenancy}, the ${terms.tenant} shall arrange for the Property to be professionally cleaned to the same standard as at the commencement (as evidenced by the inventory and schedule of condition). This includes:\n• All carpets and soft furnishings to be professionally cleaned\n• Oven and kitchen appliances to be professionally cleaned\n• All windows to be cleaned (internal and external where safely accessible)\n• All sanitary ware to be descaled and cleaned\nThe ${terms.tenant} shall provide receipts for professional cleaning. If the Property is not cleaned to the required standard, the Landlord may arrange cleaning and deduct reasonable costs from the deposit.`,
      whyItMatters: `Creates a clear, enforceable standard for end-of-${terms.tenancy.toLowerCase()} cleaning. Reduces disputes and makes deposit deductions more defensible.`,
      legalBasis: 'Deposit protection scheme guidance - deductions must be proportionate',
      isHMO: false,
      category: 'compliance',
    },

    // HMO LICENSING ALIGNMENT
    // Maps to: <!-- CLAUSE:HMO_LICENSING --> in HBS templates
    {
      canonicalId: 'HMO_LICENSING',
      id: 'licensing_alignment',
      title: 'HMO Licensing Compliance',
      standardPreview: '[Not included in Standard agreement]',
      premiumClause: `The ${terms.tenant}s acknowledge that the Property [is/may be] licensed as a House in Multiple Occupation under the ${terms.hmoAct}. The ${terms.tenant}s agree:\n• Not to allow more than [X] persons to occupy the Property at any time\n• To comply with all fire safety requirements including not obstructing fire doors or exits\n• To test smoke and CO alarms weekly and report any faults immediately\n• Not to tamper with or disable any fire safety equipment\n• To allow the Landlord access for HMO compliance inspections with 24 hours' notice\n• That breach of HMO licence conditions may result in possession proceedings\nThe Landlord confirms that all required safety certificates are in place.`,
      whyItMatters: `Ensures your ${terms.tenancy.toLowerCase()} terms don't conflict with your HMO licence conditions. Non-compliance can result in fines up to £30,000 and rent repayment orders.`,
      legalBasis: `${terms.hmoAct} - mandatory licensing conditions`,
      isHMO: true,
      category: 'compliance',
    },
  ].map(clause => ({
    ...clause,
    // Apply jurisdiction-specific terminology
    title: clause.title.replace(/\$\{terms\.tenant\}/g, terms.tenant),
    standardPreview: clause.standardPreview.replace(/\$\{terms\.tenant\}/g, terms.tenant),
    premiumClause: clause.premiumClause.replace(/\$\{terms\.tenant\}/g, terms.tenant),
    whyItMatters: clause.whyItMatters.replace(/\$\{terms\.tenant\}/g, terms.tenant),
  }));
};

/**
 * Hover tooltip component
 */
const WhyItMattersTooltip: React.FC<{
  clauseId: string;
  content: string;
  legalBasis?: string;
  jurisdiction: CanonicalJurisdiction;
  children: React.ReactNode;
}> = ({ clauseId, content, legalBasis, jurisdiction, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        trackClauseHoverExplanation({
          clauseId,
          jurisdiction,
        });
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-full ml-2 transform">
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-4" />
          <p className="font-medium text-amber-400 mb-1">Why this matters:</p>
          <p className="text-gray-200 text-xs leading-relaxed">{content}</p>
          {legalBasis && (
            <p className="mt-2 text-gray-400 text-xs italic">{legalBasis}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Individual clause preview card
 */
const ClausePreviewCard: React.FC<{
  clause: ClauseDefinition;
  tier: 'standard' | 'premium';
  jurisdiction: CanonicalJurisdiction;
  showFullClause?: boolean;
}> = ({ clause, tier, jurisdiction, showFullClause = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPremiumOnly = clause.standardPreview.includes('[Not included');
  const isStandard = tier === 'standard';

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        isStandard
          ? isPremiumOnly
            ? 'bg-gray-100 border-gray-200 opacity-60'
            : 'bg-white border-gray-200'
          : clause.isHMO
          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
          : 'bg-white border-purple-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isStandard && isPremiumOnly ? (
            <RiLockLine className="w-5 h-5 text-gray-400" />
          ) : isStandard ? (
            <RiCheckboxCircleLine className="w-5 h-5 text-gray-500" />
          ) : (
            <RiCheckboxCircleLine className="w-5 h-5 text-primary" />
          )}
          <h4 className={`font-medium ${isStandard && isPremiumOnly ? 'text-gray-500' : 'text-gray-900'}`}>
            {clause.title}
          </h4>
          {clause.isHMO && !isStandard && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
              HMO
            </span>
          )}
        </div>
        <WhyItMattersTooltip
          clauseId={clause.id}
          content={clause.whyItMatters}
          legalBasis={clause.legalBasis}
          jurisdiction={jurisdiction}
        >
          <button className="p-1 text-gray-400 hover:text-primary transition-colors">
            <RiInformationLine className="w-4 h-4" />
          </button>
        </WhyItMattersTooltip>
      </div>

      <div className="mt-3">
        {isStandard ? (
          <p className={`text-sm ${isPremiumOnly ? 'text-gray-400 italic' : 'text-gray-600'}`}>
            {clause.standardPreview}
          </p>
        ) : (
          <>
            <p className={`text-sm text-gray-700 ${!isExpanded && 'line-clamp-3'}`}>
              {clause.premiumClause.split('\n')[0]}
              {!isExpanded && clause.premiumClause.includes('\n') && '...'}
            </p>
            {clause.premiumClause.includes('\n') && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs text-primary hover:text-primary-dark font-medium"
              >
                {isExpanded ? 'Show less' : 'Show full clause'}
              </button>
            )}
            {isExpanded && (
              <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {clause.premiumClause}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Side-by-side diff view
 */
const ClauseDiffView: React.FC<{
  clause: ClauseDefinition;
  jurisdiction: CanonicalJurisdiction;
}> = ({ clause, jurisdiction }) => {
  const isPremiumOnly = clause.standardPreview.includes('[Not included');

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Standard column */}
      <ClausePreviewCard
        clause={clause}
        tier="standard"
        jurisdiction={jurisdiction}
      />
      {/* Premium column */}
      <ClausePreviewCard
        clause={clause}
        tier="premium"
        jurisdiction={jurisdiction}
      />
    </div>
  );
};

/**
 * Main ClauseDiffPreview component
 */
export const ClauseDiffPreview: React.FC<ClauseDiffPreviewProps> = ({
  jurisdiction = 'england',
  showUpgradeCTA = true,
  onUpgradeClick,
  variant = 'full',
  maxClauses = 4,
}) => {
  const clauses = getClauses(jurisdiction);
  const terms = JURISDICTION_TERMS[jurisdiction];
  const hasTrackedViewRef = useRef(false);

  // Track diff view on mount
  useEffect(() => {
    if (!hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      trackClauseDiffViewed({
        jurisdiction,
        variant,
        clauseCount: variant === 'compact' ? maxClauses : clauses.length,
      });
    }
  }, [jurisdiction, variant, maxClauses, clauses.length]);

  const handleUpgradeClick = () => {
    trackClauseDiffUpgradeClicked({
      jurisdiction,
      source: variant === 'compact' ? 'wizard' : 'product_page',
    });
    onUpgradeClick?.();
  };

  const displayClauses = variant === 'compact' ? clauses.slice(0, maxClauses) : clauses;

  // Compact variant (for wizard sidebar)
  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <RiShieldCheckLine className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-gray-900">Premium Clause Preview</h4>
        </div>

        <div className="space-y-3">
          {displayClauses.filter(c => c.isHMO || c.id === 'guarantor').slice(0, 3).map((clause) => (
            <div
              key={clause.id}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">{clause.title}</span>
                {clause.isHMO && (
                  <span className="px-1 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                    HMO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {clause.premiumClause.split('\n')[0]}
              </p>
              <WhyItMattersTooltip
                clauseId={clause.id}
                content={clause.whyItMatters}
                legalBasis={clause.legalBasis}
                jurisdiction={jurisdiction}
              >
                <button className="mt-1 text-xs text-primary hover:text-primary-dark flex items-center gap-1">
                  <RiInformationLine className="w-3 h-3" />
                  Why this matters
                </button>
              </WhyItMattersTooltip>
            </div>
          ))}
        </div>

        {showUpgradeCTA && (
          <button
            onClick={handleUpgradeClick}
            className="w-full mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            Upgrade to Premium
            <RiArrowRightLine className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Full variant (for product page)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          See the Difference: Standard vs Premium Clauses
        </h3>
        <p className="text-gray-600">
          Compare actual clause wording. Hover over <RiInformationLine className="inline w-4 h-4" /> for legal explanations.
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-4 sticky top-0 bg-white py-3 border-b border-gray-200 z-10">
        <div className="text-center">
          <h4 className="font-semibold text-gray-700">Standard {terms.agreement}</h4>
          <p className="text-sm text-gray-500">Basic coverage</p>
        </div>
        <div className="text-center">
          <h4 className="font-semibold text-primary">Premium {terms.agreement}</h4>
          <p className="text-sm text-primary">Full protection</p>
        </div>
      </div>

      {/* Clause diffs */}
      <div className="space-y-4">
        {displayClauses.map((clause) => (
          <ClauseDiffView
            key={clause.id}
            clause={clause}
            jurisdiction={jurisdiction}
          />
        ))}
      </div>

      {/* Upgrade CTA */}
      {showUpgradeCTA && (
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Premium includes <strong>{clauses.filter(c => c.isHMO).length} HMO-specific clauses</strong> commonly required under the {terms.hmoAct}.
          </p>
          <button
            onClick={handleUpgradeClick}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
          >
            Choose Premium
            <RiArrowRightLine className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Legal disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        Clause wording shown is representative. Actual agreements may vary based on your specific answers.
        For complex situations, consider taking legal advice.
      </p>
    </div>
  );
};

export default ClauseDiffPreview;
