/**
 * Tenancy Agreement Comparison Table
 *
 * Jurisdiction-aware comparison of Standard vs Premium tiers
 * with specific, defensible legal claims and expandable rationale.
 *
 * IMPORTANT: This component uses legally accurate language:
 * - "included" / "not included" (factual)
 * - "commonly required" (for HMO clauses)
 * - "recommended" (for best practices)
 * - NEVER "required" unless genuinely mandatory by law
 */

'use client';

import React, { useState } from 'react';
import { RiCheckboxCircleLine, RiCloseLine, RiInformationLine, RiArrowDownSLine } from 'react-icons/ri';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { PRODUCTS } from '@/lib/pricing/products';

interface TenancyComparisonTableProps {
  jurisdiction?: CanonicalJurisdiction;
  /** Highlight Premium column */
  highlightPremium?: boolean;
  /** Show expandable legal rationale */
  showRationale?: boolean;
  /** Compact mode for wizard sidebar */
  compact?: boolean;
}

interface ComparisonFeature {
  /** Feature name */
  name: string;
  /** Standard tier: true = included, false = not included, 'partial' = limited */
  standard: boolean | 'partial';
  /** Premium tier: always true for Premium features */
  premium: boolean;
  /** Short description */
  description: string;
  /** Detailed legal rationale (expandable) */
  rationale?: string;
  /** Legal reference (e.g., "Housing Act 2004") */
  legalReference?: string;
  /** Is this an HMO-related feature? */
  hmoRelated?: boolean;
  /** Jurisdiction-specific variations */
  jurisdictionNotes?: Partial<Record<CanonicalJurisdiction, string>>;
}

/**
 * Jurisdiction-specific terminology and legal frameworks
 */
const JURISDICTION_CONFIG: Record<CanonicalJurisdiction, {
  agreementName: string;
  hmoAct: string;
  tenantLabel: string;
}> = {
  england: {
    agreementName: 'Assured Shorthold Tenancy (AST)',
    hmoAct: 'Housing Act 2004',
    tenantLabel: 'tenant',
  },
  wales: {
    agreementName: 'Occupation Contract',
    hmoAct: 'Housing (Wales) Act 2014',
    tenantLabel: 'contract holder',
  },
  scotland: {
    agreementName: 'Private Residential Tenancy (PRT)',
    hmoAct: 'Civic Government (Scotland) Act 1982',
    tenantLabel: 'tenant',
  },
  'northern-ireland': {
    agreementName: 'Private Tenancy',
    hmoAct: 'Housing (NI) Order 1992',
    tenantLabel: 'tenant',
  },
};

/**
 * Feature comparison data
 */
const getFeatures = (jurisdiction: CanonicalJurisdiction): ComparisonFeature[] => {
  const config = JURISDICTION_CONFIG[jurisdiction];

  return [
    // Core clauses (both tiers)
    {
      name: 'Core tenancy clauses',
      standard: true,
      premium: true,
      description: 'Rent, deposit, duration, and basic obligations',
      rationale: `Essential clauses required for a valid ${config.agreementName}. Covers rent amount, payment terms, deposit protection requirements, tenancy duration, and landlord/tenant obligations.`,
    },
    {
      name: `${config.tenantLabel.charAt(0).toUpperCase() + config.tenantLabel.slice(1)} responsibilities`,
      standard: true,
      premium: true,
      description: 'Property care, access, and conduct rules',
      rationale: 'Defines tenant obligations including property maintenance, allowing access for inspections, and behaviour expectations.',
    },
    {
      name: 'Pets clause',
      standard: true,
      premium: true,
      description: 'Pets permission with conditions',
      rationale: 'Clearly states whether pets are permitted and any conditions (e.g., type of pet, additional deposit, professional cleaning).',
    },
    {
      name: 'Break clause (optional)',
      standard: true,
      premium: true,
      description: 'Early termination provision',
      rationale: 'Allows either party to end a fixed-term tenancy early with appropriate notice, typically after an initial period.',
    },

    // Premium-only features - HMO related
    {
      name: 'HMO clauses',
      standard: false,
      premium: true,
      description: `Clauses commonly required under ${config.hmoAct}`,
      rationale: `Houses in Multiple Occupation (HMO) require specific clauses addressing shared facilities, communal area responsibilities, and licensing compliance. Under the ${config.hmoAct}, properties meeting HMO criteria must include these provisions.`,
      legalReference: config.hmoAct,
      hmoRelated: true,
      jurisdictionNotes: {
        england: 'Mandatory licensing for 5+ people from 2+ households. Additional licensing schemes may apply locally.',
        wales: 'HMO licensing follows Housing (Wales) Act 2014. Rent Smart Wales registration required.',
        scotland: 'Mandatory licensing for 3+ tenants from 2+ families under Civic Government (Scotland) Act 1982.',
        'northern-ireland': 'HMO registration required with local council. Stricter fire safety requirements.',
      },
    },
    {
      name: 'Joint and several liability',
      standard: false,
      premium: true,
      description: 'Each tenant fully liable for entire rent',
      rationale: 'Makes each tenant individually responsible for the full rent amount. If one tenant defaults, the landlord can pursue any other tenant for the full amount owed. Essential for multi-tenant properties.',
      hmoRelated: true,
    },
    {
      name: 'Multi-occupancy permissions',
      standard: false,
      premium: true,
      description: 'Shared facility and communal area rules',
      rationale: 'Defines responsibilities for shared kitchens, bathrooms, and communal areas. Includes cleaning rotas, guest policies, and noise restrictions specific to shared accommodation.',
      hmoRelated: true,
    },
    {
      name: 'Tenant replacement procedure',
      standard: false,
      premium: true,
      description: 'Process when a sharer leaves mid-tenancy',
      rationale: 'Sets out the process for when one tenant in a shared house leaves, including landlord approval for replacements, deed of assignment requirements, and deposit handling.',
      hmoRelated: true,
    },

    // Premium-only features - Financial protection
    {
      name: 'Guarantor clauses',
      standard: false,
      premium: true,
      description: 'Third-party guarantee provisions',
      rationale: 'Provides a legally binding guarantee from a third party (typically a parent or relative) who agrees to cover rent and damages if the tenant defaults. Includes guarantor identification and liability limits.',
    },
    {
      name: 'Rent increase provisions (CPI/RPI)',
      standard: false,
      premium: true,
      description: 'Contractual rent review mechanism',
      rationale: 'Allows rent increases linked to inflation indices (CPI or RPI) or fixed percentages without requiring Section 13 notices. Provides predictability for both parties during longer tenancies.',
      jurisdictionNotes: {
        scotland: 'Note: PRT rent increases are subject to additional statutory controls regardless of contractual provisions.',
      },
    },

    // Premium-only features - Control and protection
    {
      name: 'Anti-subletting clause',
      standard: false,
      premium: true,
      description: 'Explicit prohibition on Airbnb/subletting',
      rationale: 'Expressly prohibits the tenant from subletting the property or using it for short-term lets (Airbnb, etc.). Provides clear grounds for possession if breached.',
    },
    {
      name: 'Professional cleaning requirement',
      standard: false,
      premium: true,
      description: 'Enforceable end-of-tenancy cleaning',
      rationale: 'Requires the tenant to have the property professionally cleaned at the end of the tenancy to the same standard as the start. Must be proportionate and clearly defined to be enforceable.',
    },
    {
      name: 'Additional tenant obligations',
      standard: false,
      premium: true,
      description: 'Enhanced maintenance and reporting duties',
      rationale: 'Additional obligations including prompt reporting of disrepair, not making alterations without consent, maintaining gardens, and notifying landlord of extended absences.',
    },
    {
      name: 'Licensing alignment',
      standard: false,
      premium: true,
      description: 'Terms aligned with HMO licence conditions',
      rationale: `Ensures tenancy terms don't conflict with HMO licence conditions. Includes occupancy limits, fire safety requirements, and management standards as required by ${config.hmoAct}.`,
      legalReference: config.hmoAct,
      hmoRelated: true,
    },
    {
      name: 'Enforcement defensibility',
      standard: 'partial',
      premium: true,
      description: 'Clauses tested and enforceable in court',
      rationale: 'Premium clauses are drafted to be enforceable in court or tribunal proceedings. Includes clear definitions, proportionate requirements, and compliance with unfair terms regulations.',
    },
  ];
};

/**
 * Expandable rationale component
 */
const ExpandableRationale: React.FC<{
  rationale: string;
  legalReference?: string;
  jurisdictionNote?: string;
}> = ({ rationale, legalReference, jurisdictionNote }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
      >
        <RiInformationLine className="w-3.5 h-3.5" />
        <span>Why does this matter?</span>
        <RiArrowDownSLine
          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-2">
          <p>{rationale}</p>
          {legalReference && (
            <p className="text-gray-500">
              <strong>Legal basis:</strong> {legalReference}
            </p>
          )}
          {jurisdictionNote && (
            <p className="text-amber-700 bg-amber-50 p-2 rounded">
              <strong>Note for your jurisdiction:</strong> {jurisdictionNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main comparison table component
 */
export const TenancyComparisonTable: React.FC<TenancyComparisonTableProps> = ({
  jurisdiction = 'england',
  highlightPremium = true,
  showRationale = true,
  compact = false,
}) => {
  const features = getFeatures(jurisdiction);
  const config = JURISDICTION_CONFIG[jurisdiction];
  const standardPrice = PRODUCTS.ast_standard.displayPrice;
  const premiumPrice = PRODUCTS.ast_premium.displayPrice;

  if (compact) {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Key Premium Features</h4>
        <ul className="space-y-2">
          {features
            .filter((f) => f.standard === false && f.premium === true)
            .slice(0, 5)
            .map((feature) => (
              <li key={feature.name} className="flex items-start gap-2 text-sm">
                <RiCheckboxCircleLine className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900">{feature.name}</span>
                  {feature.hmoRelated && (
                    <span className="ml-1 text-xs text-amber-600">(HMO)</span>
                  )}
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 w-1/2">
              Feature
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 w-1/4">
              Standard
              <br />
              <span className="text-xs font-normal text-gray-500">{standardPrice}</span>
            </th>
            <th
              className={`px-4 py-3 text-center text-sm font-semibold border-b border-gray-200 w-1/4 ${
                highlightPremium ? 'text-primary bg-purple-50' : 'text-gray-900'
              }`}
            >
              Premium
              <br />
              <span className={`text-xs font-normal ${highlightPremium ? 'text-primary' : 'text-gray-500'}`}>
                {premiumPrice}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => {
            const jurisdictionNote = feature.jurisdictionNotes?.[jurisdiction];

            return (
              <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-start gap-2">
                    <div>
                      <span className="text-sm text-gray-900 font-medium">{feature.name}</span>
                      {feature.hmoRelated && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                          HMO
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                      {showRationale && feature.rationale && (
                        <ExpandableRationale
                          rationale={feature.rationale}
                          legalReference={feature.legalReference}
                          jurisdictionNote={jurisdictionNote}
                        />
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100">
                  {feature.standard === true ? (
                    <RiCheckboxCircleLine className="w-5 h-5 text-green-500 mx-auto" />
                  ) : feature.standard === 'partial' ? (
                    <span className="text-xs text-gray-500">Partial</span>
                  ) : (
                    <RiCloseLine className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td
                  className={`px-4 py-3 text-center border-b border-gray-100 ${
                    highlightPremium ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <RiCheckboxCircleLine
                    className={`w-5 h-5 mx-auto ${highlightPremium ? 'text-primary' : 'text-green-500'}`}
                  />
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-4 py-3 text-sm text-gray-900">Best for</td>
            <td className="px-4 py-3 text-center text-sm text-gray-900">Single households</td>
            <td
              className={`px-4 py-3 text-center text-sm ${
                highlightPremium ? 'text-primary bg-purple-50' : 'text-gray-900'
              }`}
            >
              HMOs &amp; multi-tenant
            </td>
          </tr>
        </tbody>
      </table>

      {/* Legal disclaimer */}
      <p className="mt-3 text-xs text-gray-500">
        Both Standard and Premium agreements are legally valid for residential lettings in {config.agreementName.includes('(') ? jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1) : jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1).replace('-', ' ')}.
        Premium includes additional clauses commonly required for HMOs and multi-tenant properties under the {config.hmoAct}.
        For complex situations, consider taking legal advice.
      </p>
    </div>
  );
};

/**
 * Summary card version for upsell contexts
 */
export const TenancyComparisonSummary: React.FC<{
  jurisdiction?: CanonicalJurisdiction;
}> = ({ jurisdiction = 'england' }) => {
  const config = JURISDICTION_CONFIG[jurisdiction];

  const hmoFeatures = [
    'Joint and several liability',
    'HMO-ready clauses',
    'Multi-occupancy permissions',
    'Licensing alignment',
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-2">Why Choose Premium?</h4>
      <p className="text-sm text-gray-600 mb-3">
        Includes clauses commonly required under the <strong>{config.hmoAct}</strong> for HMO and multi-tenant properties:
      </p>
      <ul className="space-y-1.5 mb-3">
        {hmoFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
            <RiCheckboxCircleLine className="w-4 h-4 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">
        Plus: Guarantor clauses, rent review provisions, anti-subletting, and professional cleaning requirements.
      </p>
    </div>
  );
};

export default TenancyComparisonTable;
