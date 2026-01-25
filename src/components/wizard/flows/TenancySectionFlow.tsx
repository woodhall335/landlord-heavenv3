/**
 * Tenancy Section Flow
 *
 * Redesigned wizard for Tenancy Agreement packs following a logical,
 * section-based flow with tab navigation (matching MoneyClaimSectionFlow design).
 *
 * Jurisdiction-aware terminology:
 * - England: Assured Shorthold Tenancy (AST) - Housing Act 1988
 * - Wales: Occupation Contract - Renting Homes (Wales) Act 2016
 * - Scotland: Private Residential Tenancy (PRT) - Private Housing (Tenancies) Act 2016
 * - Northern Ireland: Private Tenancy - Private Tenancies (NI) Order 2006
 *
 * Flow Structure:
 * 1. Product - Standard/Premium tier selection (jurisdiction-specific naming)
 * 2. Property - Address and property details
 * 3. Landlord - Landlord contact and service address
 * 4. Tenants - Tenant details (contract holder in Wales)
 * 5. Tenancy - Start date, term, type
 * 6. Rent - Rent amount, payment details
 * 7. Deposit - Deposit and protection details
 * 8. Bills - Utilities and bills responsibility
 * 9. Compliance - Safety certificates and legal requirements
 * 10. Terms - Property rules, access, maintenance
 * 11. Premium - Premium features (if applicable)
 * 12. Review - Final review and generate
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';

// Analytics and attribution
import {
  trackWizardStepCompleteWithAttribution,
  trackTenancyPremiumSelectedAfterRecommendation,
  trackTenancyStandardSelectedDespiteRecommendation,
  TenancyPremiumRecommendationReason,
} from '@/lib/analytics';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';

// Premium recommendation
import { detectPremiumRecommendation, type PremiumRecommendationResult } from '@/lib/utils/premium-recommendation';
import { PremiumRecommendationBanner } from '@/components/tenancy/PremiumRecommendationBanner';

// Section components - we'll create these inline for now
import { Button, Input } from '@/components/ui';

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

interface TenancySectionFlowProps {
  caseId: string;
  jurisdiction: Jurisdiction;
  product?: 'tenancy_agreement' | 'ast_standard' | 'ast_premium';
}

/**
 * Jurisdiction-specific terminology for tenancy agreements
 *
 * - England: Assured Shorthold Tenancy (AST) - Housing Act 1988
 * - Wales: Occupation Contract - Renting Homes (Wales) Act 2016
 * - Scotland: Private Residential Tenancy (PRT) - Private Housing (Tenancies) Act 2016
 * - Northern Ireland: Private Tenancy - Private Tenancies (NI) Order 2006
 */
/**
 * Check if a product tier is a premium tier (jurisdiction-agnostic check)
 * This handles all jurisdiction-specific premium tier names
 */
const isPremiumTier = (productTier: string | undefined): boolean => {
  if (!productTier) return false;
  const premiumTiers = [
    'Premium AST',
    'Premium Occupation Contract',
    'Premium PRT',
    'Premium NI Private Tenancy',
  ];
  return premiumTiers.includes(productTier);
};

const getJurisdictionTerminology = (jurisdiction: Jurisdiction) => {
  switch (jurisdiction) {
    case 'wales':
      return {
        agreementType: 'Occupation Contract',
        standardTier: 'Standard Occupation Contract',
        premiumTier: 'Premium Occupation Contract',
        suitabilityTitle: 'Occupation Contract Suitability Check',
        suitabilityDescription: 'Basic checks to ensure this is a valid occupation contract under the Renting Homes (Wales) Act 2016.',
        standardDescription: 'Simple, straightforward occupation contract for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, rent reviews, detailed schedules.',
        landlordWarning: 'If the landlord lives at the property, this may be a lodger arrangement rather than a standard occupation contract.',
        holidayWarning: 'Holiday lets and licence arrangements are not standard occupation contracts. Different rules apply.',
        landlordHelperText: 'If yes, this may not be a standard occupation contract',
        holidayHelperText: 'If yes, an occupation contract may not be appropriate',
        tenantLabel: 'contract holder', // Wales terminology
      };
    case 'scotland':
      return {
        agreementType: 'Private Residential Tenancy',
        standardTier: 'Standard PRT',
        premiumTier: 'Premium PRT',
        suitabilityTitle: 'PRT Suitability Check',
        suitabilityDescription: 'Basic checks to ensure this is a valid Private Residential Tenancy under the Private Housing (Tenancies) (Scotland) Act 2016.',
        standardDescription: 'Simple, straightforward PRT for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, detailed maintenance schedules.',
        landlordWarning: 'If the landlord lives at the property, this may be a lodger arrangement rather than a PRT.',
        holidayWarning: 'Holiday lets and licence arrangements are not PRTs. Different rules apply.',
        landlordHelperText: 'If yes, this may not be a PRT',
        holidayHelperText: 'If yes, a PRT may not be appropriate',
        tenantLabel: 'tenant',
      };
    case 'northern-ireland':
      return {
        agreementType: 'Private Tenancy',
        standardTier: 'Standard NI Private Tenancy',
        premiumTier: 'Premium NI Private Tenancy',
        suitabilityTitle: 'NI Private Tenancy Suitability Check',
        suitabilityDescription: 'Basic checks to ensure this is a valid private tenancy under the Private Tenancies (Northern Ireland) Order 2006.',
        standardDescription: 'Simple, straightforward private tenancy for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, detailed maintenance schedules.',
        landlordWarning: 'If the landlord lives at the property, this may be a lodger arrangement rather than a private tenancy.',
        holidayWarning: 'Holiday lets and licence arrangements are not private tenancies. Different rules apply.',
        landlordHelperText: 'If yes, this may not be a private tenancy',
        holidayHelperText: 'If yes, a private tenancy may not be appropriate',
        tenantLabel: 'tenant',
      };
    case 'england':
    default:
      return {
        agreementType: 'Assured Shorthold Tenancy',
        standardTier: 'Standard AST',
        premiumTier: 'Premium AST',
        suitabilityTitle: 'AST Suitability Check',
        suitabilityDescription: 'Basic checks to ensure this is a valid AST.',
        standardDescription: 'Simple, straightforward tenancy agreement for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, rent reviews, detailed schedules.',
        landlordWarning: 'If the landlord lives at the property, this may be a lodger arrangement rather than an AST.',
        holidayWarning: 'Holiday lets and licence arrangements are not ASTs. Different rules apply.',
        landlordHelperText: 'If yes, this may not be an AST',
        holidayHelperText: 'If yes, an AST may not be appropriate',
        tenantLabel: 'tenant',
      };
  }
};

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Validation function to check if section is complete
  isComplete: (facts: any) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: any) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: any) => string[];
  // Only show for premium AST
  premiumOnly?: boolean;
}

// Define all sections with their validation rules
const SECTIONS: WizardSection[] = [
  {
    id: 'product',
    label: 'Product',
    description: 'Choose your tenancy agreement type',
    isComplete: (facts) => Boolean(facts.product_tier),
  },
  {
    id: 'property',
    label: 'Property',
    description: 'Rental property address and details',
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) &&
      Boolean(facts.property_address_town) &&
      Boolean(facts.property_address_postcode) &&
      Boolean(facts.property_type),
  },
  {
    id: 'landlord',
    label: 'Landlord',
    description: 'Landlord contact and service address',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name) &&
      Boolean(facts.landlord_email) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_postcode),
  },
  {
    id: 'tenants',
    label: 'Tenants',
    description: 'Tenant details',
    isComplete: (facts) => {
      const tenants = facts.tenants || [];
      if (!facts.number_of_tenants) return false;
      const numTenants = parseInt(facts.number_of_tenants, 10);
      if (numTenants === 0) return false;
      // Check if at least the first tenant has details
      return tenants.length > 0 && Boolean(tenants[0]?.full_name);
    },
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy start date and term',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) && facts.is_fixed_term !== undefined,
  },
  {
    id: 'rent',
    label: 'Rent',
    description: 'Rent amount and payment details',
    isComplete: (facts) =>
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_period) &&
      Boolean(facts.rent_due_day),
  },
  {
    id: 'deposit',
    label: 'Deposit',
    description: 'Deposit and protection scheme',
    isComplete: (facts) =>
      facts.deposit_amount !== undefined && Boolean(facts.deposit_scheme_name),
  },
  {
    id: 'bills',
    label: 'Bills',
    description: 'Utilities and bills responsibility',
    isComplete: (facts) =>
      Boolean(facts.council_tax_responsibility) &&
      Boolean(facts.utilities_responsibility),
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Safety certificates and legal requirements',
    isComplete: (facts) =>
      Boolean(facts.epc_rating) &&
      facts.gas_safety_certificate !== undefined &&
      facts.electrical_safety_certificate !== undefined,
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      if (facts.how_to_rent_guide_provided === false && facts.__meta?.jurisdiction === 'england') {
        blockers.push("'How to Rent' guide must be provided for valid Section 21 notices");
      }
      return blockers;
    },
  },
  {
    id: 'terms',
    label: 'Terms',
    description: 'Property rules and access',
    isComplete: (facts) =>
      facts.pets_allowed !== undefined &&
      facts.smoking_allowed !== undefined &&
      Boolean(facts.landlord_access_notice),
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Premium features',
    premiumOnly: true,
    isComplete: (facts) => {
      // Only applicable for premium tier (jurisdiction-agnostic check)
      if (!isPremiumTier(facts.product_tier)) return true;
      // Check some premium fields
      return facts.guarantor_required !== undefined;
    },
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate documents',
    isComplete: () => false, // Always navigable for final review
  },
];

export const TenancySectionFlow: React.FC<TenancySectionFlowProps> = ({
  caseId,
  jurisdiction,
  product = 'tenancy_agreement',
}) => {
  const router = useRouter();

  // State
  const [facts, setFacts] = useState<any>({
    __meta: { product: product, jurisdiction },
  });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing facts on mount
  useEffect(() => {
    const loadFacts = async () => {
      try {
        setLoading(true);
        const loadedFacts = await getCaseFacts(caseId);
        if (loadedFacts && Object.keys(loadedFacts).length > 0) {
          setFacts((prev: any) => ({
            ...prev,
            ...loadedFacts,
            __meta: {
              ...prev.__meta,
              ...loadedFacts.__meta,
              product: product,
              jurisdiction,
            },
          }));
        }
      } catch (err) {
        console.error('Failed to load facts:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadFacts();
  }, [caseId, jurisdiction, product]);

  // Filter sections based on premium status (jurisdiction-agnostic check)
  const visibleSections = useMemo(() => {
    return SECTIONS.filter((section) => {
      if (section.premiumOnly && !isPremiumTier(facts.product_tier)) {
        return false;
      }
      return true;
    });
  }, [facts.product_tier]);

  const currentSection = visibleSections[currentSectionIndex];

  // Save facts to backend
  const saveFactsToServer = useCallback(
    async (updatedFacts: any) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'tenancy_agreement',
          product: product,
        });
      } catch (err) {
        console.error('Failed to save facts:', err);
        setError('Failed to save. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [caseId, jurisdiction, product]
  );

  // Update facts and save
  const handleUpdate = useCallback(
    async (updates: Record<string, any>) => {
      // Deep merge to preserve existing nested fields
      const next = { ...facts };

      for (const [key, value] of Object.entries(updates)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          next[key] = {
            ...(next[key] || {}),
            ...value,
          };
        } else {
          next[key] = value;
        }
      }

      setFacts(next);
      await saveFactsToServer(next);
    },
    [facts, saveFactsToServer]
  );

  // Navigate to next section with step completion tracking
  const handleNext = useCallback(() => {
    if (currentSectionIndex < visibleSections.length - 1) {
      // Track step completion if the current section is complete
      const current = visibleSections[currentSectionIndex];
      if (current && current.isComplete(facts)) {
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id);
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: product || 'tenancy_agreement',
            jurisdiction: jurisdiction,
            step: current.id,
            stepIndex: currentSectionIndex,
            totalSteps: visibleSections.length,
            src: attribution.src,
            topic: attribution.topic,
            utm_source: attribution.utm_source,
            utm_medium: attribution.utm_medium,
            utm_campaign: attribution.utm_campaign,
            landing_url: attribution.landing_url,
            first_seen_at: attribution.first_seen_at,
          });
        }
      }

      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, visibleSections, facts, jurisdiction, product]);

  // Navigate to previous section
  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  // Handle wizard completion - redirect to review page for validation
  const handleComplete = useCallback(async () => {
    router.push(`/wizard/review?case_id=${caseId}&product=${product}`);
  }, [caseId, product, router]);

  // Calculate progress
  const completedCount = visibleSections.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = currentSection?.hasBlockers?.(facts) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts) || [];

  // Jurisdiction label
  const jurisdictionLabel = useMemo(() => {
    switch (jurisdiction) {
      case 'scotland':
        return 'Scotland Private Residential Tenancy';
      case 'wales':
        return 'Wales Occupation Contract';
      case 'northern-ireland':
        return 'Northern Ireland Private Tenancy';
      default:
        return 'England Assured Shorthold Tenancy';
    }
  }, [jurisdiction]);

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'product':
        return <ProductSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'property':
        return <PropertySection facts={facts} onUpdate={handleUpdate} />;
      case 'landlord':
        return <LandlordSection facts={facts} onUpdate={handleUpdate} />;
      case 'tenants':
        return <TenantsSection facts={facts} onUpdate={handleUpdate} />;
      case 'tenancy':
        return <TenancySection facts={facts} onUpdate={handleUpdate} />;
      case 'rent':
        return <RentSection facts={facts} onUpdate={handleUpdate} />;
      case 'deposit':
        return <DepositSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'bills':
        return <BillsSection facts={facts} onUpdate={handleUpdate} />;
      case 'compliance':
        return <ComplianceSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'terms':
        return <TermsSection facts={facts} onUpdate={handleUpdate} caseId={caseId} jurisdiction={jurisdiction} />;
      case 'premium':
        return <PremiumSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'review':
        return <ReviewSection facts={facts} onUpdate={handleUpdate} caseId={caseId} jurisdiction={jurisdiction} />;
      default:
        return <div>Unknown section: {currentSection.id}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header with progress */}
      <header className="bg-white border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {jurisdictionLabel} Pack
            </h1>
            <span className="text-sm text-gray-500">
              {completedCount} of {visibleSections.length} sections complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Section tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {visibleSections.map((section, index) => {
              const isComplete = section.isComplete(facts);
              const isCurrent = index === currentSectionIndex;
              const hasBlocker = (section.hasBlockers?.(facts) || []).length > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                    ${isCurrent ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${hasBlocker && !isCurrent ? 'ring-2 ring-red-300' : ''}
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    {isComplete && !hasBlocker && (
                      <RiCheckLine className="w-4 h-4 text-green-500" />
                    )}
                    {hasBlocker && (
                      <RiErrorWarningLine className="w-4 h-4 text-red-500" />
                    )}
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
        {/* Main wizard column */}
        <main className="flex-1 lg:max-w-3xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Current section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentSection?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentSection?.description}
              </p>
            </div>

            {/* Blockers */}
            {currentBlockers.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Cannot Proceed - Blockers:
                </h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {currentBlockers.map((blocker, i) => (
                    <li key={i}>{blocker}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {currentWarnings.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-2">
                  Warnings:
                </h3>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  {currentWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section content */}
            {renderSection()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={currentSectionIndex === 0}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${currentSectionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              ← Back
            </button>

            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}

              {currentSection?.id === 'review' ? (
                <button
                  onClick={handleComplete}
                  disabled={currentBlockers.length > 0}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentBlockers.length > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'}
                  `}
                >
                  Generate Documents
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentSectionIndex === visibleSections.length - 1}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentSectionIndex === visibleSections.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'}
                  `}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Ask Heaven sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="sticky top-44">
            <AskHeavenPanel
              caseId={caseId}
              caseType="tenancy_agreement"
              jurisdiction={jurisdiction}
              product={product}
              currentQuestionId={undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

// =============================================================================
// Section Components
// =============================================================================

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => Promise<void>;
  jurisdiction?: Jurisdiction;
  caseId?: string;
}

// Product Section - jurisdiction-aware terminology with Premium recommendation
const ProductSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction = 'england' }) => {
  const terms = getJurisdictionTerminology(jurisdiction);

  // Detect if Premium should be recommended based on collected facts
  const recommendation = useMemo(() => {
    return detectPremiumRecommendation(facts, jurisdiction);
  }, [facts, jurisdiction]);

  // Track tier selection with recommendation context
  const handleTierSelect = useCallback(async (tier: string) => {
    const isPremium = tier === terms.premiumTier;

    // Track if user selected tier after seeing a recommendation
    if (recommendation.isRecommended) {
      if (isPremium) {
        trackTenancyPremiumSelectedAfterRecommendation({
          reasons: recommendation.reasons as TenancyPremiumRecommendationReason[],
          strength: recommendation.strength as 'strong' | 'moderate',
          jurisdiction,
        });
      } else {
        trackTenancyStandardSelectedDespiteRecommendation({
          reasons: recommendation.reasons as TenancyPremiumRecommendationReason[],
          strength: recommendation.strength as 'strong' | 'moderate',
          jurisdiction,
        });
      }
    }

    await onUpdate({ product_tier: tier });
  }, [onUpdate, terms.premiumTier, recommendation, jurisdiction]);

  return (
    <div className="space-y-6">
      {/* Premium Recommendation Banner - Non-blocking */}
      {recommendation.isRecommended && (
        <PremiumRecommendationBanner
          recommendation={recommendation}
          jurisdiction={jurisdiction}
          variant="compact"
          dismissible={true}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Which {jurisdiction === 'wales' ? 'occupation contract' : 'tenancy agreement'} do you need? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Standard covers simple lets. Premium adds guarantor, HMO, rent review and tighter controls.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleTierSelect(terms.standardTier)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              facts.product_tier === terms.standardTier
                ? 'border-[#7C3AED] bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900">{terms.standardTier}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {terms.standardDescription}
            </p>
          </button>
          <button
            onClick={() => handleTierSelect(terms.premiumTier)}
            className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
              facts.product_tier === terms.premiumTier
                ? 'border-[#7C3AED] bg-purple-50'
                : recommendation.isRecommended
                ? 'border-purple-300 hover:border-purple-400 bg-purple-50/30'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {recommendation.isRecommended && facts.product_tier !== terms.premiumTier && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded-full">
                Recommended
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{terms.premiumTier}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {terms.premiumDescription}
            </p>
          </button>
        </div>
      </div>

      {/* Suitability Check - jurisdiction-aware */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{terms.suitabilityTitle}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {terms.suitabilityDescription}
        </p>
        <div className="space-y-4">
          <YesNoField
            label={`Is the ${terms.tenantLabel} an individual (not a company)?`}
            value={facts.tenant_is_individual}
            onChange={(v) => onUpdate({ tenant_is_individual: v })}
            required
          />
          <YesNoField
            label={`Will this be the ${terms.tenantLabel}'s main home?`}
            value={facts.main_home}
            onChange={(v) => onUpdate({ main_home: v })}
            required
          />
          <YesNoField
            label="Does the landlord live at the property?"
            value={facts.landlord_lives_at_property}
            onChange={(v) => onUpdate({ landlord_lives_at_property: v })}
            helperText={terms.landlordHelperText}
            required
          />
          <YesNoField
            label="Is this a holiday let or licence arrangement?"
            value={facts.holiday_or_licence}
            onChange={(v) => onUpdate({ holiday_or_licence: v })}
            helperText={terms.holidayHelperText}
            required
          />
        </div>

        {/* Warnings - jurisdiction-aware */}
        {facts.landlord_lives_at_property === true && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> {terms.landlordWarning}
            </p>
          </div>
        )}
        {facts.holiday_or_licence === true && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> {terms.holidayWarning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Property Section
const PropertySection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Address</h3>
        <p className="text-sm text-gray-500 mb-4">
          Exactly as it should appear in the tenancy agreement.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextField
              label="Building and street"
              value={facts.property_address_line1}
              onChange={(v) => onUpdate({ property_address_line1: v })}
              placeholder="123 High Street"
              required
            />
          </div>
          <TextField
            label="Town / City"
            value={facts.property_address_town}
            onChange={(v) => onUpdate({ property_address_town: v })}
            placeholder="London"
            required
          />
          <TextField
            label="Postcode"
            value={facts.property_address_postcode}
            onChange={(v) => onUpdate({ property_address_postcode: v })}
            placeholder="SW1A 1AA"
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Property Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Property type"
            value={facts.property_type}
            onChange={(v) => onUpdate({ property_type: v })}
            options={['house', 'flat', 'maisonette', 'bungalow', 'studio']}
            required
          />
          <NumberField
            label="Number of bedrooms"
            value={facts.number_of_bedrooms}
            onChange={(v) => onUpdate({ number_of_bedrooms: v })}
            min={0}
            max={20}
            required
          />
          <SelectField
            label="Furnishing"
            value={facts.furnished_status}
            onChange={(v) => onUpdate({ furnished_status: v })}
            options={['furnished', 'part-furnished', 'unfurnished']}
            required
          />
          <YesNoField
            label="Is parking included?"
            value={facts.parking_available}
            onChange={(v) => onUpdate({ parking_available: v })}
            required
          />
          {facts.parking_available && (
            <div className="md:col-span-2">
              <TextField
                label="Parking details"
                value={facts.parking_details}
                onChange={(v) => onUpdate({ parking_details: v })}
                placeholder="Allocated bay, permit required, on-street, etc."
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Outdoor Space</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNoField
            label="Is there a garden or outdoor space?"
            value={facts.has_garden}
            onChange={(v) => onUpdate({ has_garden: v })}
            required
          />
          {facts.has_garden && (
            <SelectField
              label="Who maintains the garden?"
              value={facts.garden_maintenance}
              onChange={(v) => onUpdate({ garden_maintenance: v })}
              options={['Tenant', 'Landlord', 'Shared responsibility']}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Landlord Section
const LandlordSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Landlord Contact Details</h3>
        <p className="text-sm text-gray-500 mb-4">
          Used on the AST, certificates and notices.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextField
              label="Full name"
              value={facts.landlord_full_name}
              onChange={(v) => onUpdate({ landlord_full_name: v })}
              placeholder="Jane Landlord"
              required
            />
          </div>
          <TextField
            label="Email"
            value={facts.landlord_email}
            onChange={(v) => onUpdate({ landlord_email: v })}
            placeholder="you@example.com"
            type="email"
            required
          />
          <TextField
            label="Phone"
            value={facts.landlord_phone}
            onChange={(v) => onUpdate({ landlord_phone: v })}
            placeholder="07700 900000"
            type="tel"
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Landlord Service Address</h3>
        <p className="text-sm text-gray-500 mb-4">
          Where formal notices can be served (not the rental property).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <TextField
              label="Building and street"
              value={facts.landlord_address_line1}
              onChange={(v) => onUpdate({ landlord_address_line1: v })}
              placeholder="456 Park Avenue"
              required
            />
          </div>
          <TextField
            label="Town / City"
            value={facts.landlord_address_town}
            onChange={(v) => onUpdate({ landlord_address_town: v })}
            placeholder="London"
            required
          />
          <TextField
            label="Postcode"
            value={facts.landlord_address_postcode}
            onChange={(v) => onUpdate({ landlord_address_postcode: v })}
            placeholder="W1A 2BB"
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Letting Agent</h3>
        <YesNoField
          label="Are you using a letting agent?"
          value={facts.agent_usage}
          onChange={(v) => onUpdate({ agent_usage: v })}
          helperText="If yes, their details can appear on the AST for rent collection and management."
          required
        />

        {facts.agent_usage && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextField
                label="Agent name"
                value={facts.agent_name}
                onChange={(v) => onUpdate({ agent_name: v })}
                placeholder="Acme Lettings"
                required
              />
            </div>
            <div className="md:col-span-2">
              <TextareaField
                label="Agent address"
                value={facts.agent_address}
                onChange={(v) => onUpdate({ agent_address: v })}
                placeholder="Building and street&#10;Town/City&#10;Postcode"
                required
              />
            </div>
            <TextField
              label="Agent email"
              value={facts.agent_email}
              onChange={(v) => onUpdate({ agent_email: v })}
              placeholder="agent@example.com"
              type="email"
              required
            />
            <TextField
              label="Agent phone"
              value={facts.agent_phone}
              onChange={(v) => onUpdate({ agent_phone: v })}
              placeholder="0207 123 4567"
              type="tel"
              required
            />
            <YesNoField
              label="Should the agent sign on your behalf?"
              value={facts.agent_signs}
              onChange={(v) => onUpdate({ agent_signs: v })}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Tenants Section - with HMO signal detection
const TenantsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const numTenants = parseInt(facts.number_of_tenants || '1', 10);
  const tenants = facts.tenants || [];

  const updateTenant = (index: number, field: string, value: any) => {
    const newTenants = [...tenants];
    if (!newTenants[index]) {
      newTenants[index] = {};
    }
    newTenants[index][field] = value;
    onUpdate({ tenants: newTenants });
  };

  // Show HMO signal questions when 2+ tenants
  const showHMOSignalQuestions = numTenants >= 2;

  return (
    <div className="space-y-6">
      <div>
        <SelectField
          label="How many tenants are on the agreement?"
          value={facts.number_of_tenants}
          onChange={(v) => onUpdate({ number_of_tenants: v })}
          options={['1', '2', '3', '4', '5', '6+']}
          required
        />
      </div>

      {/* HMO Signal Detection Questions - shown when 2+ tenants */}
      {showHMOSignalQuestions && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <p className="text-sm text-blue-800 font-medium">
            A few questions to help us recommend the right agreement:
          </p>

          <YesNoField
            label="Are the tenants related to each other (e.g., family, partners)?"
            value={facts.tenants_related}
            onChange={(v) => {
              // If not related, set unrelated_tenants flag
              onUpdate({
                tenants_related: v,
                unrelated_tenants: v === false,
              });
            }}
            helperText="Unrelated tenants may indicate an HMO arrangement"
            required
          />

          {numTenants >= 3 && (
            <YesNoField
              label="Will tenants share kitchen, bathroom or living space?"
              value={facts.shared_facilities}
              onChange={(v) => onUpdate({ shared_facilities: v })}
              helperText="Shared facilities with 3+ unrelated tenants commonly requires HMO licensing"
              required
            />
          )}

          <YesNoField
            label="Will each tenant pay rent separately (rather than one joint payment)?"
            value={facts.separate_rent_payments}
            onChange={(v) => onUpdate({ separate_rent_payments: v })}
            helperText="Separate payments may indicate room-by-room letting"
            required
          />

          <YesNoField
            label="Is this a room-by-room let (each tenant has exclusive use of specific room)?"
            value={facts.room_by_room_let}
            onChange={(v) => onUpdate({ room_by_room_let: v })}
            helperText="Room-by-room lets may require different clauses"
            required
          />

          <SelectField
            label="What type of tenants?"
            value={facts.tenant_type}
            onChange={(v) => onUpdate({ tenant_type: v })}
            options={['Working professionals', 'Students', 'Mixed', 'Family', 'Other']}
          />
        </div>
      )}

      {Array.from({ length: Math.min(numTenants, 6) }, (_, i) => (
        <div key={i} className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {i === 0 ? 'Lead Tenant' : `Tenant ${i + 1}`}
          </h3>
          {i === 0 && (
            <p className="text-sm text-gray-500 mb-4">Primary tenant who will receive notices</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextField
                label="Full name"
                value={tenants[i]?.full_name}
                onChange={(v) => updateTenant(i, 'full_name', v)}
                required
              />
            </div>
            <TextField
              label="Date of birth"
              value={tenants[i]?.dob}
              onChange={(v) => updateTenant(i, 'dob', v)}
              type="date"
              required
            />
            <TextField
              label="Email"
              value={tenants[i]?.email}
              onChange={(v) => updateTenant(i, 'email', v)}
              type="email"
              required
            />
            <TextField
              label="Phone"
              value={tenants[i]?.phone}
              onChange={(v) => updateTenant(i, 'phone', v)}
              type="tel"
              required
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Tenancy Section
const TenancySection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tenancy Start and Term</h3>
        <p className="text-sm text-gray-500 mb-4">
          We tailor the AST for fixed term vs periodic.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Start date"
            value={facts.tenancy_start_date}
            onChange={(v) => onUpdate({ tenancy_start_date: v })}
            type="date"
            required
          />
          <YesNoField
            label="Is this a fixed term tenancy?"
            value={facts.is_fixed_term}
            onChange={(v) => onUpdate({ is_fixed_term: v })}
            required
          />
          {facts.is_fixed_term && (
            <>
              <SelectField
                label="Fixed term length"
                value={facts.term_length}
                onChange={(v) => onUpdate({ term_length: v })}
                options={['6 months', '12 months', '18 months', '24 months']}
              />
              <TextField
                label="End date (if fixed term)"
                value={facts.tenancy_end_date}
                onChange={(v) => onUpdate({ tenancy_end_date: v })}
                type="date"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Rent Section
const RentSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const dueOptions = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    const suffix = day === 1 || day === 21 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix}`;
  }).concat(['29th', '30th', 'Last day of month']);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rent Schedule</h3>
        <p className="text-sm text-gray-500 mb-4">
          We include this in the rent clause and summary schedule.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyField
            label="Rent amount"
            value={facts.rent_amount}
            onChange={(v) => onUpdate({ rent_amount: v })}
            placeholder="1200"
            required
          />
          <SelectField
            label="Rent period"
            value={facts.rent_period}
            onChange={(v) => onUpdate({ rent_period: v })}
            options={['month', 'week', 'quarter', 'year']}
            required
          />
          <SelectField
            label="Payment due day"
            value={facts.rent_due_day}
            onChange={(v) => onUpdate({ rent_due_day: v })}
            options={dueOptions}
            required
          />
          <SelectField
            label="Preferred payment method"
            value={facts.payment_method}
            onChange={(v) => onUpdate({ payment_method: v })}
            options={['Standing Order', 'Bank Transfer', 'Cash']}
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Account name"
            value={facts.bank_account_name}
            onChange={(v) => onUpdate({ bank_account_name: v })}
          />
          <TextField
            label="Sort code"
            value={facts.bank_sort_code}
            onChange={(v) => onUpdate({ bank_sort_code: v })}
            placeholder="12-34-56"
          />
          <TextField
            label="Account number"
            value={facts.bank_account_number}
            onChange={(v) => onUpdate({ bank_account_number: v })}
            placeholder="12345678"
          />
          <div className="md:col-span-2">
            <TextareaField
              label="Payment details / reference"
              value={facts.payment_details}
              onChange={(v) => onUpdate({ payment_details: v })}
              placeholder="Payment reference or additional instructions"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Deposit Section
const DepositSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit and Protection</h3>
        <p className="text-sm text-gray-500 mb-4">
          We include the deposit limit warning and scheme certificate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyField
            label="Deposit amount"
            value={facts.deposit_amount}
            onChange={(v) => onUpdate({ deposit_amount: v })}
            placeholder="1400"
            required
          />
          <SelectField
            label="Deposit protection scheme"
            value={facts.deposit_scheme_name}
            onChange={(v) => onUpdate({ deposit_scheme_name: v })}
            options={['DPS', 'MyDeposits', 'TDS', 'Other']}
            required
          />
          <TextField
            label="Date deposit will be paid"
            value={facts.deposit_paid_date}
            onChange={(v) => onUpdate({ deposit_paid_date: v })}
            type="date"
          />
          <TextField
            label="Date you will protect the deposit"
            value={facts.deposit_protection_date}
            onChange={(v) => onUpdate({ deposit_protection_date: v })}
            type="date"
          />
          <YesNoField
            label="Is the deposit already protected?"
            value={facts.deposit_already_protected}
            onChange={(v) => onUpdate({ deposit_already_protected: v })}
          />
          {facts.deposit_already_protected && (
            <TextField
              label="Deposit protection reference number"
              value={facts.deposit_reference_number}
              onChange={(v) => onUpdate({ deposit_reference_number: v })}
              placeholder="Reference from scheme"
            />
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prescribed Information</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>STATUTORY REQUIREMENT:</strong> You MUST serve prescribed information to the tenant
            within 30 days of receiving the deposit. Failure to comply can result in compensation
            of 1-3x the deposit amount and inability to serve valid Section 21 notices.
          </p>
        </div>
        <YesNoField
          label="Have you served or will you serve prescribed information?"
          value={facts.prescribed_information_served}
          onChange={(v) => onUpdate({ prescribed_information_served: v })}
          required
        />
      </div>
    </div>
  );
};

// Bills Section
const BillsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const options = ['Tenant', 'Landlord', 'Included in rent'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Who Pays Which Bills?</h3>
        <p className="text-sm text-gray-500 mb-4">
          We include this in the tenant responsibilities section.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Council tax"
            value={facts.council_tax_responsibility}
            onChange={(v) => onUpdate({ council_tax_responsibility: v })}
            options={options}
            required
          />
          <SelectField
            label="Gas/Electric/Water"
            value={facts.utilities_responsibility}
            onChange={(v) => onUpdate({ utilities_responsibility: v })}
            options={options}
            required
          />
          <SelectField
            label="Internet/Broadband"
            value={facts.internet_responsibility}
            onChange={(v) => onUpdate({ internet_responsibility: v })}
            options={options}
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Meter Readings</h3>
        <p className="text-sm text-gray-500 mb-4">
          Record start readings and transfer arrangements.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Gas meter reading (start)"
            value={facts.meter_reading_gas}
            onChange={(v) => onUpdate({ meter_reading_gas: v })}
            placeholder="e.g., 12345"
          />
          <TextField
            label="Electric meter reading (start)"
            value={facts.meter_reading_electric}
            onChange={(v) => onUpdate({ meter_reading_electric: v })}
            placeholder="e.g., 67890"
          />
          <TextField
            label="Water meter reading (start)"
            value={facts.meter_reading_water}
            onChange={(v) => onUpdate({ meter_reading_water: v })}
            placeholder="e.g., 11223"
          />
          <SelectField
            label="Who arranges utility account transfers?"
            value={facts.utility_transfer_responsibility}
            onChange={(v) => onUpdate({ utility_transfer_responsibility: v })}
            options={['Tenant', 'Landlord', 'Agent']}
            required
          />
        </div>
      </div>
    </div>
  );
};

// Compliance Section
const ComplianceSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Certificates and Legal Pack Items</h3>
        <p className="text-sm text-gray-500 mb-4">
          These drive the legal validity summary.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="EPC rating"
            value={facts.epc_rating}
            onChange={(v) => onUpdate({ epc_rating: v })}
            options={['A', 'B', 'C', 'D', 'E', 'F', 'G']}
            required
          />
          {jurisdiction === 'england' && (
            <TextField
              label="Date right-to-rent checks completed"
              value={facts.right_to_rent_check_date}
              onChange={(v) => onUpdate({ right_to_rent_check_date: v })}
              type="date"
            />
          )}
          <YesNoField
            label="Current gas safety certificate provided?"
            value={facts.gas_safety_certificate}
            onChange={(v) => onUpdate({ gas_safety_certificate: v })}
            required
          />
          <YesNoField
            label="Electrical safety (EICR) provided?"
            value={facts.electrical_safety_certificate}
            onChange={(v) => onUpdate({ electrical_safety_certificate: v })}
            required
          />
          <YesNoField
            label="Smoke alarms fitted and tested?"
            value={facts.smoke_alarms_fitted}
            onChange={(v) => onUpdate({ smoke_alarms_fitted: v })}
            required
          />
          <YesNoField
            label="CO alarms where required?"
            value={facts.carbon_monoxide_alarms}
            onChange={(v) => onUpdate({ carbon_monoxide_alarms: v })}
            required
          />
          {jurisdiction === 'england' && (
            <div className="md:col-span-2">
              <YesNoField
                label="Latest 'How to Rent' guide given?"
                value={facts.how_to_rent_guide_provided}
                onChange={(v) => onUpdate({ how_to_rent_guide_provided: v })}
                helperText="Required for valid Section 21 notices in England"
                required
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Terms Section - with Ask Heaven inline enhancement for narrative text fields
const TermsSection: React.FC<SectionProps> = ({ facts, onUpdate, caseId, jurisdiction = 'england' }) => {
  return (
    <div className="space-y-6">
      {/* Property Rules */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">House Rules</h3>
        <p className="text-sm text-gray-500 mb-4">
          Pets, smoking and subletting policies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <YesNoField
            label="Are pets allowed?"
            value={facts.pets_allowed}
            onChange={(v) => onUpdate({ pets_allowed: v })}
            required
          />
          {facts.pets_allowed && (
            <div className="md:col-span-2">
              <TextField
                label="Approved pets (if any)"
                value={facts.approved_pets}
                onChange={(v) => onUpdate({ approved_pets: v })}
                placeholder="e.g. 1 cat named Luna"
              />
            </div>
          )}
          <SelectField
            label="Smoking allowed inside?"
            value={facts.smoking_allowed}
            onChange={(v) => onUpdate({ smoking_allowed: v })}
            options={['No', 'Yes', 'Vaping only']}
            required
          />
          <SelectField
            label="Subletting / Airbnb policy"
            value={facts.subletting_allowed}
            onChange={(v) => onUpdate({ subletting_allowed: v })}
            options={['Not allowed', 'Only with written consent', 'Allowed']}
            required
          />
        </div>
      </div>

      {/* Access & Inspections */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Access Rules</h3>
        <p className="text-sm text-gray-500 mb-4">
          Notice periods for entry and inspections.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Notice before access"
            value={facts.landlord_access_notice}
            onChange={(v) => onUpdate({ landlord_access_notice: v })}
            options={['24 hours', '48 hours', '72 hours']}
            required
          />
          <SelectField
            label="Inspection frequency"
            value={facts.inspection_frequency}
            onChange={(v) => onUpdate({ inspection_frequency: v })}
            options={['Quarterly', 'Every 6 months', 'Annually', 'As needed']}
            required
          />
          <YesNoField
            label="Allow end-of-tenancy viewings?"
            value={facts.end_of_tenancy_viewings}
            onChange={(v) => onUpdate({ end_of_tenancy_viewings: v })}
            required
          />
        </div>
      </div>

      {/* Maintenance & Repairs */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Repairs and Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <TextareaField
              label="What the landlord handles"
              value={facts.landlord_maintenance_responsibilities}
              onChange={(v) => onUpdate({ landlord_maintenance_responsibilities: v })}
              placeholder="Structural issues, boilers, white goods, etc."
            />
            <AskHeavenInlineEnhancer
              caseId={caseId}
              questionId="landlord_maintenance_responsibilities"
              questionText="What maintenance responsibilities the landlord handles"
              answer={facts.landlord_maintenance_responsibilities || ''}
              onApply={(newText) => onUpdate({ landlord_maintenance_responsibilities: newText })}
              context={{ jurisdiction, product: 'tenancy_agreement' }}
              apiMode="generic"
              helperText="AI will help clarify landlord maintenance responsibilities"
            />
          </div>
          <SelectField
            label="How should tenants report repairs?"
            value={facts.repairs_reporting_method}
            onChange={(v) => onUpdate({ repairs_reporting_method: v })}
            options={['Email', 'Phone', 'Online portal']}
            required
          />
          <TextField
            label="Out-of-hours emergency contact"
            value={facts.emergency_contact}
            onChange={(v) => onUpdate({ emergency_contact: v })}
            placeholder="Name / number"
          />
        </div>
      </div>

      {/* Inventory & Condition */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory and Cleaning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNoField
            label="Will you attach an inventory schedule?"
            value={facts.inventory_attached}
            onChange={(v) => onUpdate({ inventory_attached: v })}
            required
          />
          <YesNoField
            label="Require professional cleaning at end?"
            value={facts.professional_cleaning_required}
            onChange={(v) => onUpdate({ professional_cleaning_required: v })}
            required
          />
          <SelectField
            label="Decoration/alterations policy"
            value={facts.decoration_condition}
            onChange={(v) => onUpdate({ decoration_condition: v })}
            options={['No alterations allowed', 'With written permission only', 'Minor alterations allowed']}
            required
          />
        </div>
      </div>

      {/* Break Clause */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Break Clause</h3>
        <YesNoField
          label="Include a break clause?"
          value={facts.break_clause}
          onChange={(v) => onUpdate({ break_clause: v })}
          required
        />
        {facts.break_clause && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Can be exercised after"
              value={facts.break_clause_months}
              onChange={(v) => onUpdate({ break_clause_months: v })}
              options={['6 months', '9 months', '12 months']}
            />
            <SelectField
              label="Notice required"
              value={facts.break_clause_notice_period}
              onChange={(v) => onUpdate({ break_clause_notice_period: v })}
              options={['1 month', '2 months', '3 months']}
            />
          </div>
        )}
      </div>

      {/* Additional Terms */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Terms</h3>
        <div className="space-y-2">
          <TextareaField
            label="Any additional bespoke terms?"
            value={facts.additional_terms}
            onChange={(v) => onUpdate({ additional_terms: v })}
            helperText="Optional bespoke clauses to insert into the agreement."
          />
          <AskHeavenInlineEnhancer
            caseId={caseId}
            questionId="additional_terms"
            questionText="Additional bespoke terms for the tenancy agreement"
            answer={facts.additional_terms || ''}
            onApply={(newText) => onUpdate({ additional_terms: newText })}
            context={{ jurisdiction, product: 'tenancy_agreement' }}
            apiMode="generic"
            helperText="AI will help make your terms clearer and more professional"
          />
        </div>
      </div>
    </div>
  );
};

// Premium Section - jurisdiction-aware
const PremiumSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction = 'england' }) => {
  const terms = getJurisdictionTerminology(jurisdiction);
  return (
    <div className="space-y-6">
      {/* Guarantor */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guarantor</h3>
        <YesNoField
          label="Is a guarantor required?"
          value={facts.guarantor_required}
          onChange={(v) => onUpdate({ guarantor_required: v })}
          required
        />
        {facts.guarantor_required && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextField
                label="Guarantor name"
                value={facts.guarantor_name}
                onChange={(v) => onUpdate({ guarantor_name: v })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <TextareaField
                label="Guarantor address"
                value={facts.guarantor_address}
                onChange={(v) => onUpdate({ guarantor_address: v })}
                required
              />
            </div>
            <TextField
              label="Guarantor email"
              value={facts.guarantor_email}
              onChange={(v) => onUpdate({ guarantor_email: v })}
              type="email"
              required
            />
            <TextField
              label="Guarantor phone"
              value={facts.guarantor_phone}
              onChange={(v) => onUpdate({ guarantor_phone: v })}
              type="tel"
              required
            />
            <TextField
              label="Guarantor date of birth"
              value={facts.guarantor_dob}
              onChange={(v) => onUpdate({ guarantor_dob: v })}
              type="date"
              required
            />
            <TextField
              label="Relationship to tenant"
              value={facts.guarantor_relationship}
              onChange={(v) => onUpdate({ guarantor_relationship: v })}
              required
            />
          </div>
        )}
      </div>

      {/* Joint Liability */}
      <div className="border-t border-gray-200 pt-6">
        <YesNoField
          label="Include joint & several liability wording?"
          value={facts.joint_and_several_liability}
          onChange={(v) => onUpdate({ joint_and_several_liability: v })}
          helperText="Recommended when there is more than one tenant."
        />
      </div>

      {/* HMO Details */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">HMO / Shared Facilities</h3>
        <p className="text-sm text-gray-500 mb-4">
          {terms.premiumTier} adds HMO-ready clauses.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNoField
            label="Is the property an HMO or room-by-room let?"
            value={facts.is_hmo}
            onChange={(v) => onUpdate({ is_hmo: v })}
            required
          />
          {facts.is_hmo && (
            <>
              <NumberField
                label="Number of sharers/rooms"
                value={facts.number_of_sharers}
                onChange={(v) => onUpdate({ number_of_sharers: v })}
              />
              <div className="md:col-span-2">
                <TextField
                  label="Shared/communal areas"
                  value={facts.communal_areas}
                  onChange={(v) => onUpdate({ communal_areas: v })}
                  placeholder="Kitchen, living room, bathrooms, garden"
                />
              </div>
              <SelectField
                label="HMO licence status"
                value={facts.hmo_licence_status}
                onChange={(v) => onUpdate({ hmo_licence_status: v })}
                options={['Not required', 'Currently licensed', 'Applied/awaiting']}
              />
              <SelectField
                label="Who cleans communal areas?"
                value={facts.communal_cleaning}
                onChange={(v) => onUpdate({ communal_cleaning: v })}
                options={['Professional cleaner', 'Tenants share', 'Landlord', 'Not applicable']}
              />
            </>
          )}
        </div>
      </div>

      {/* Rent Reviews */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rent Increase Provisions</h3>
        <YesNoField
          label="Include a rent increase clause?"
          value={facts.rent_increase_clause}
          onChange={(v) => onUpdate({ rent_increase_clause: v })}
          required
        />
        {facts.rent_increase_clause && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Method"
              value={facts.rent_increase_method}
              onChange={(v) => onUpdate({ rent_increase_method: v })}
              options={['RPI', 'CPI', 'Section 13', 'Fixed review']}
            />
            <SelectField
              label="Frequency"
              value={facts.rent_increase_frequency}
              onChange={(v) => onUpdate({ rent_increase_frequency: v })}
              options={['Annually', 'Every 2 years', 'On anniversary with 1 month notice']}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Review Section
const ReviewSection: React.FC<SectionProps> = ({ facts }) => {
  // Calculate completion status (jurisdiction-agnostic check)
  const completedSections = SECTIONS.filter((s) => {
    if (s.premiumOnly && !isPremiumTier(facts.product_tier)) return true;
    return s.isComplete(facts);
  });
  const allComplete = completedSections.length === SECTIONS.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
        <p className="text-sm text-gray-500 mb-4">
          Check that all sections are complete before generating your tenancy agreement.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Product</span>
          <span className="text-sm font-medium">{facts.product_tier || 'Not selected'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Property</span>
          <span className="text-sm font-medium">
            {facts.property_address_line1
              ? `${facts.property_address_line1}, ${facts.property_address_postcode}`
              : 'Not entered'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Landlord</span>
          <span className="text-sm font-medium">{facts.landlord_full_name || 'Not entered'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tenants</span>
          <span className="text-sm font-medium">
            {facts.tenants?.[0]?.full_name || 'Not entered'}
            {facts.number_of_tenants > 1 && ` + ${parseInt(facts.number_of_tenants) - 1} more`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Rent</span>
          <span className="text-sm font-medium">
            {facts.rent_amount ? `£${facts.rent_amount} per ${facts.rent_period}` : 'Not entered'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Deposit</span>
          <span className="text-sm font-medium">
            {facts.deposit_amount ? `£${facts.deposit_amount}` : 'Not entered'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Start Date</span>
          <span className="text-sm font-medium">
            {facts.tenancy_start_date
              ? new Date(facts.tenancy_start_date).toLocaleDateString('en-GB')
              : 'Not entered'}
          </span>
        </div>
      </div>

      {!allComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2">Incomplete Sections</h4>
          <p className="text-sm text-amber-700">
            Please complete all sections before generating your documents. Use the tabs above to navigate.
          </p>
        </div>
      )}

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Ready to Generate</h4>
          <p className="text-sm text-green-700">
            All sections are complete. Click "Generate Documents" to create your tenancy agreement.
          </p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Field Components
// =============================================================================

interface FieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  type?: string;
  min?: number;
  max?: number;
  options?: string[];
}

const TextField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
  type = 'text',
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  </div>
);

const TextareaField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-20"
      rows={3}
    />
  </div>
);

const NumberField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
  min,
  max,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full"
    />
  </div>
);

const CurrencyField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <div className="relative">
      <span className="absolute left-3 top-3 text-gray-500">£</span>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 w-full"
      />
    </div>
  </div>
);

const SelectField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  required,
  helperText,
  options = [],
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const YesNoField: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  required,
  helperText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helperText && <p className="text-sm text-gray-500 mb-2">{helperText}</p>}
    <div className="flex gap-4">
      <Button
        onClick={() => onChange(true)}
        variant={value === true ? 'primary' : 'secondary'}
        type="button"
      >
        Yes
      </Button>
      <Button
        onClick={() => onChange(false)}
        variant={value === false ? 'primary' : 'secondary'}
        type="button"
      >
        No
      </Button>
    </div>
  </div>
);

export default TenancySectionFlow;
