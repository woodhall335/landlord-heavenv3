/**
 * Tenancy Section Flow
 *
 * Redesigned wizard for Tenancy Agreement packs following a logical,
 * section-based flow with tab navigation (matching MoneyClaimSectionFlow design).
 *
 * Jurisdiction-aware terminology:
 * - England: Assured Periodic Tenancy Agreement - upgraded assured periodic England flow
 * - Wales: Occupation Contract - Renting Homes (Wales) Act 2016
 * - Scotland: Private Residential Tenancy (PRT) - Private Housing (Tenancies) Act 2016
 * - Northern Ireland: Private Tenancy - Private Tenancies Act (Northern Ireland) 2022
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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { WizardFlowShell } from '@/components/wizard/shared/WizardFlowShell';
import { WizardShellV3 } from '@/components/wizard/shared/WizardShellV3';
import { isWizardUiV3Enabled } from '@/components/wizard/shared/flags';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import { InlineSectionHeaderV3 } from '@/components/wizard/shared/InlineSectionHeaderV3';

// Analytics and attribution
import {
  trackWizardStepCompleteWithAttribution,
  trackTenancyPremiumSelectedAfterRecommendation,
  trackTenancyStandardSelectedDespiteRecommendation,
  TenancyPremiumRecommendationReason,
} from '@/lib/analytics';
import { normalizeWizardStep } from '@/lib/analytics/wizard-step-taxonomy';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';
import {
  getTenancyTierLabelFromFacts,
  isPremiumTierLabel,
} from '@/lib/tenancy/product-tier';

// Premium recommendation
import { detectPremiumRecommendation } from '@/lib/utils/premium-recommendation';
import { PremiumRecommendationBanner } from '@/components/tenancy/PremiumRecommendationBanner';
import { ClauseDiffPreview } from '@/components/tenancy/ClauseDiffPreview';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';
import { calculateDepositCap } from '@/lib/validation/mqs-field-validator';
import {
  getEnglandTenancyPurpose,
  isEnglandPostReformTenancy,
} from '@/lib/tenancy/england-reform';
import {
  isResidentialLettingProductSku,
  RESIDENTIAL_LETTING_PRODUCTS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import {
  hasPositiveDepositAmount,
  isTenancyDepositSectionComplete,
} from '@/lib/wizard/flow-completion';

// Section components - we'll create these inline for now
import { Button, Input } from '@/components/ui';

type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

interface TenancySectionFlowProps {
  caseId: string;
  jurisdiction: Jurisdiction;
  product?:
    | 'tenancy_agreement'
    | 'ast_standard'
    | 'ast_premium'
    | ResidentialLettingProductSku;
  highlightedSections?: string[];
}

/**
 * Jurisdiction-specific terminology for tenancy agreements
 *
 * - England: Assured Periodic Tenancy Agreement - upgraded assured periodic England flow
 * - Wales: Occupation Contract - Renting Homes (Wales) Act 2016
 * - Scotland: Private Residential Tenancy (PRT) - Private Housing (Tenancies) Act 2016
 * - Northern Ireland: Private Tenancy - Private Tenancies Act (Northern Ireland) 2022
 */
/**
 * Check if a product tier is a premium tier (jurisdiction-agnostic check)
 * This handles all jurisdiction-specific premium tier names
 */
const isPremiumTier = (productTier: string | undefined): boolean => {
  return isPremiumTierLabel(productTier);
};

const GBP_SYMBOL = '\u00A3';

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getEnglandDepositCapResult(facts: Record<string, any>) {
  if (facts.__meta?.jurisdiction !== 'england') return null;

  const rentAmount = toFiniteNumber(facts.rent_amount);
  const depositAmount = toFiniteNumber(facts.deposit_amount);
  const rentFrequency =
    (typeof facts.rent_period === 'string' && facts.rent_period) ||
    (typeof facts.rent_frequency === 'string' && facts.rent_frequency) ||
    'monthly';

  if (rentAmount === undefined || depositAmount === undefined) {
    return null;
  }

  return calculateDepositCap(rentAmount, rentFrequency, depositAmount);
}

function isEnglandPostReformNewAgreementCase(
  facts: Record<string, any>,
  jurisdictionOverride?: Jurisdiction
) {
  const jurisdiction = jurisdictionOverride ?? facts.__meta?.jurisdiction;

  return isEnglandPostReformTenancy({
    jurisdiction,
    tenancyStartDate: facts.tenancy_start_date,
    purpose: getEnglandTenancyPurpose(facts.england_tenancy_purpose),
  });
}

function getResidentialStandaloneProduct(facts: Record<string, any>): ResidentialLettingProductSku | null {
  const candidate = facts?.__meta?.original_product || facts?.__meta?.document_kind;
  return isResidentialLettingProductSku(candidate) ? candidate : null;
}

const getJurisdictionTerminology = (jurisdiction: Jurisdiction) => {
  switch (jurisdiction) {
    case 'wales':
      return {
        agreementType: 'Occupation Contract',
        standardTier: 'Standard Occupation Contract',
        premiumTier: 'Premium Occupation Contract',
        standardDescription: 'Simple, straightforward occupation contract for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, rent reviews, detailed schedules.',
      };
    case 'scotland':
      return {
        agreementType: 'Private Residential Tenancy',
        standardTier: 'Standard PRT',
        premiumTier: 'Premium PRT',
        standardDescription: 'Simple, straightforward PRT for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, detailed maintenance schedules.',
      };
    case 'northern-ireland':
      return {
        agreementType: 'Private Tenancy',
        standardTier: 'Standard NI Private Tenancy',
        premiumTier: 'Premium NI Private Tenancy',
        standardDescription: 'Simple, straightforward private tenancy for most lets.',
        premiumDescription: 'Advanced features: guarantor clauses, HMO support, detailed maintenance schedules.',
      };
    case 'england':
    default:
      return {
        agreementType: 'Assured Periodic Tenancy Agreement',
        standardTier: 'Standard Assured Periodic Tenancy Agreement',
        premiumTier: 'Premium Assured Periodic Tenancy Agreement',
        standardDescription: 'England assured periodic tenancy agreement updated for the current framework on standard lets.',
        premiumDescription: 'Premium England assured periodic tenancy agreement with fuller ordinary-residential drafting, guarantor support, and enhanced operational terms for the current framework.',
      };
  }
};


function getTenancyValidationBlockers(facts: Record<string, unknown>, jurisdiction: Jurisdiction): string[] {
  const validation = validateTenancyRequiredFacts(facts, { jurisdiction });
  const blockers: string[] = [];

  if (validation.missing_fields.length > 0) {
    blockers.push(`Missing required tenancy facts: ${validation.missing_fields.join(', ')}`);
  }

  const invalidFields = [...validation.invalid_fields];
  if (jurisdiction === 'england' && invalidFields.includes('is_fixed_term')) {
    blockers.push(
      'New England self-serve agreements should be created as assured periodic tenancies, not fixed-term tenancy agreements.'
    );
  }

  if (jurisdiction === 'england' && invalidFields.includes('deposit_amount')) {
    const depositCap = getEnglandDepositCapResult(facts as Record<string, any>);
    if (depositCap?.exceeds) {
      blockers.push(
        `Deposit exceeds the England legal cap. Maximum allowed: ${GBP_SYMBOL}${depositCap.maxDeposit.toFixed(2)} (${depositCap.maxWeeks} weeks' rent).`
      );
    }
  }

  if (jurisdiction === 'england' && invalidFields.includes('england_rent_in_advance_compliant')) {
    blockers.push(
      "For a new England tenancy from 1 May 2026, do not ask for more than one month's rent in advance."
    );
  }

  if (jurisdiction === 'england' && invalidFields.includes('england_no_bidding_confirmed')) {
    blockers.push(
      'For a new England tenancy from 1 May 2026, do not invite or accept rental bids above the advertised rent.'
    );
  }

  if (jurisdiction === 'england' && invalidFields.includes('england_no_discrimination_confirmed')) {
    blockers.push(
      'For a new England tenancy from 1 May 2026, do not refuse applicants because they have children or receive benefits.'
    );
  }

  const genericInvalidFields = invalidFields.filter(
    (field) =>
      field !== 'is_fixed_term' &&
      field !== 'deposit_amount' &&
      field !== 'england_rent_in_advance_compliant' &&
      field !== 'england_no_bidding_confirmed' &&
      field !== 'england_no_discrimination_confirmed'
  );
  if (genericInvalidFields.length > 0) {
    blockers.push(`Invalid tenancy facts: ${genericInvalidFields.join(', ')}`);
  }

  return blockers;
}

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
      // Only show for premium England residential product
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
    isComplete: (facts) => {
      const baseComplete =
        Boolean(facts.landlord_full_name) &&
        Boolean(facts.landlord_email) &&
        Boolean(facts.landlord_address_line1) &&
        Boolean(facts.landlord_address_postcode);

      // Scotland requires landlord registration number
      if (facts.__meta?.jurisdiction === 'scotland') {
        return baseComplete && Boolean(facts.landlord_registration_number);
      }

      return baseComplete;
    },
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
    description: 'Tenancy start date',
    isComplete: (facts) => {
      // Start date is always required
      if (!facts.tenancy_start_date) return false;
      // Scotland PRTs and England assured periodic tenancies do not require a fixed-term selection
      const jurisdiction = facts.__meta?.jurisdiction;
      if (jurisdiction === 'scotland' || jurisdiction === 'england') {
        return true; // Only start date required for Scotland and England
      }
      // Other jurisdictions require fixed term selection
      return facts.is_fixed_term !== undefined;
    },
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
    isComplete: (facts) => isTenancyDepositSectionComplete(facts),
    hasBlockers: (facts) => {
      const depositCap = getEnglandDepositCapResult(facts);
      if (depositCap?.exceeds) {
        return [
          `Deposit exceeds the England legal cap of ${GBP_SYMBOL}${depositCap.maxDeposit.toFixed(2)} (${depositCap.maxWeeks} weeks' rent). Reduce the deposit before continuing.`,
        ];
      }
      return [];
    },
  },
  {
    id: 'document_details',
    label: 'Document details',
    description: 'Details specific to this residential letting document',
    isComplete: (facts) => {
      const residentialProduct = getResidentialStandaloneProduct(facts);
      if (!residentialProduct) return true;

      switch (residentialProduct) {
        case 'guarantor_agreement':
          return Boolean(facts.guarantor_name) && Boolean(facts.guarantor_address);
        case 'residential_tenancy_application':
          return (
            Boolean(facts.applicant_employment_status) &&
            Boolean(facts.applicant_annual_income) &&
            Boolean(facts.current_landlord_name || facts.applicant_reference_name) &&
            Boolean(facts.current_landlord_contact || facts.applicant_reference_contact)
          );
        case 'rental_inspection_report':
          return (
            Boolean(facts.inspection_date) &&
            Boolean(facts.inspection_type) &&
            Boolean(
              facts.property_layout_notes ||
              facts.room_condition_summary ||
              facts.entrance_hall_condition ||
              facts.reception_room_condition ||
              facts.kitchen_condition ||
              facts.bedroom_one_condition ||
              facts.bathroom_condition ||
              facts.entrance_hall_inventory_items ||
              facts.reception_room_inventory_items ||
              facts.kitchen_inventory_items
            )
          );
        case 'inventory_schedule_condition':
          return (
            Boolean(facts.inspection_date) &&
            Boolean(
              facts.property_layout_notes ||
              facts.room_condition_summary ||
              facts.utility_meter_readings ||
              facts.keys_provided_summary ||
              facts.entrance_hall_inventory_items ||
              facts.reception_room_inventory_items ||
              facts.kitchen_inventory_items ||
              facts.bedroom_one_inventory_items ||
              facts.bathroom_inventory_items ||
              facts.document_notes
            )
          );
        case 'lease_amendment':
          return (
            Boolean(facts.original_agreement_date) &&
            Boolean(facts.amendment_effective_date) &&
            Boolean(facts.amended_clauses_reference || facts.amendment_summary || facts.replacement_clause_text)
          );
        case 'residential_sublet_agreement':
          return (
            Boolean(facts.subtenant_name) &&
            Boolean(facts.sublet_start_date) &&
            Boolean(facts.landlord_consent_obtained !== undefined)
          );
        case 'lease_assignment_agreement':
          return (
            Boolean(facts.outgoing_tenant_name) &&
            Boolean(facts.incoming_tenant_name) &&
            Boolean(facts.assignment_effective_date)
          );
        case 'flatmate_agreement':
          return (
            Boolean(facts.house_rules_summary) &&
            Boolean(facts.bill_split_summary) &&
            Boolean(facts.notice_period_between_flatmates || facts.exit_arrangements)
          );
        case 'renewal_tenancy_agreement':
          return (
            Boolean(facts.original_agreement_date) &&
            Boolean(facts.renewal_start_date) &&
            Boolean(facts.renewal_rent_amount || facts.amendment_summary || facts.renewal_compliance_notes)
          );
        case 'rent_arrears_letter':
          return (
            Boolean(facts.arrears_amount) &&
            Boolean(facts.final_deadline) &&
            Boolean(facts.arrears_periods_missed || facts.arrears_schedule_attached_reference)
          );
        case 'repayment_plan_agreement':
          return (
            Boolean(facts.arrears_amount) &&
            Boolean(facts.repayment_amount) &&
            Boolean(facts.repayment_frequency) &&
            Boolean(facts.repayment_start_date)
          );
        default:
          return true;
      }
    },
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
    isComplete: (facts) => {
      const baseComplete =
        Boolean(facts.epc_rating) &&
        facts.gas_safety_certificate !== undefined &&
        facts.electrical_safety_certificate !== undefined;

      if (!baseComplete) return false;
      if (!isEnglandPostReformNewAgreementCase(facts)) return true;

      return (
        facts.how_to_rent_guide_provided !== undefined &&
        facts.england_rent_in_advance_compliant !== undefined &&
        facts.england_no_bidding_confirmed !== undefined &&
        facts.england_no_discrimination_confirmed !== undefined
      );
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      if (!isEnglandPostReformNewAgreementCase(facts)) {
        return blockers;
      }

      if (facts.how_to_rent_guide_provided === false) {
        blockers.push(
          'England written information or any government guidance you provide should be recorded for the tenancy file',
        );
      }
      if (facts.england_rent_in_advance_compliant === false) {
        blockers.push(
          "For a new England tenancy from 1 May 2026, do not ask for more than one month's rent in advance."
        );
      }
      if (facts.england_no_bidding_confirmed === false) {
        blockers.push(
          'For a new England tenancy from 1 May 2026, do not invite or accept rental bids above the advertised rent.'
        );
      }
      if (facts.england_no_discrimination_confirmed === false) {
        blockers.push(
          'For a new England tenancy from 1 May 2026, do not refuse applicants because they have children or receive benefits.'
        );
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
    description: 'Review and generate your case bundle',
    isComplete: () => false, // Always navigable for final review
  },
];

export function getVisibleSectionsForFacts(
  facts: any,
  isProductLocked: boolean,
): WizardSection[] {
  const tenancyTierLabel = getTenancyTierLabelFromFacts(facts);
  const residentialProduct = getResidentialStandaloneProduct(facts);

  return SECTIONS.filter((section) => {
    if (section.id === 'product' && (isProductLocked || Boolean(residentialProduct))) {
      return false;
    }
    if (section.id === 'premium' && residentialProduct) {
      return false;
    }
    if (section.premiumOnly && !isPremiumTier(tenancyTierLabel || undefined)) {
      return false;
    }
    if (section.id === 'document_details' && !residentialProduct) {
      return false;
    }
    return true;
  });
}

function normalizeLegacyEnglandPaymentMethod(value: unknown): string {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (text === 'standing order' || text === 'standing_order') {
    return 'Bank Transfer';
  }
  if (text === 'bank transfer' || text === 'bank_transfer') {
    return 'Bank Transfer';
  }
  if (text === 'cash') {
    return 'Cash';
  }
  return typeof value === 'string' ? value : '';
}

function normalizeLegacyEnglandFacts(
  facts: Record<string, any>,
  jurisdiction: Jurisdiction
): Record<string, any> {
  if (jurisdiction !== 'england') {
    return facts;
  }

  const nextFacts: Record<string, any> = {
    ...facts,
    payment_method: normalizeLegacyEnglandPaymentMethod(facts.payment_method),
  };

  if (nextFacts.payment_method !== 'Bank Transfer') {
    nextFacts.bank_account_name = '';
    nextFacts.bank_sort_code = '';
    nextFacts.bank_account_number = '';
  }

  return nextFacts;
}

export const TenancySectionFlow: React.FC<TenancySectionFlowProps> = ({
  caseId,
  jurisdiction,
  product = 'tenancy_agreement',
  highlightedSections = [],
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

  // Debounce ref for save operations to prevent excessive API calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFactsRef = useRef<any>(null);

  // Load existing facts on mount
  useEffect(() => {
    const loadFacts = async () => {
      try {
        setLoading(true);
        const loadedFacts = await getCaseFacts(caseId);
        if (loadedFacts && Object.keys(loadedFacts).length > 0) {
          setFacts((prev: any) => ({
            ...prev,
            ...normalizeLegacyEnglandFacts(loadedFacts, jurisdiction),
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
  const isProductLocked = Boolean(
    facts.__meta?.purchased_product || (facts.__meta?.entitlements || []).length > 0
  );

  const visibleSections = useMemo(() => {
    return getVisibleSectionsForFacts(facts, isProductLocked);
  }, [facts, isProductLocked]);

  const currentSection = visibleSections[currentSectionIndex];
  const saveProduct = isResidentialLettingProductSku(product) ? 'tenancy_agreement' : product;

  const highlightedSectionSet = useMemo(
    () => new Set(highlightedSections.filter(Boolean)),
    [highlightedSections]
  );

  // If checkout sends highlighted sections, jump user to the first highlighted section
  useEffect(() => {
    if (highlightedSectionSet.size === 0 || visibleSections.length === 0) return;

    const highlightedIndex = visibleSections.findIndex((section) => highlightedSectionSet.has(section.id));
    if (highlightedIndex >= 0 && highlightedIndex !== currentSectionIndex) {
      setCurrentSectionIndex(highlightedIndex);
    }
  }, [highlightedSectionSet, visibleSections, currentSectionIndex]);

  // Save facts to backend
  const saveFactsToServer = useCallback(
    async (updatedFacts: any) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'tenancy_agreement',
          product: saveProduct,
        });
      } catch (err) {
        console.error('Failed to save facts:', err);
        setError('Failed to save. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [caseId, jurisdiction, saveProduct]
  );

  // P0-2 FIX: Retry save handler - allows users to retry failed saves
  const handleRetrySave = useCallback(() => {
    // Retry with current facts state
    saveFactsToServer(facts);
  }, [facts, saveFactsToServer]);

  // Update facts and save with debouncing to prevent excessive API calls
  const handleUpdate = useCallback(
    (updates: Record<string, any>) => {
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

      const normalizedFacts = normalizeLegacyEnglandFacts(next, jurisdiction);

      setFacts(normalizedFacts);

      // Store the latest facts to save
      pendingFactsRef.current = normalizedFacts;

      // Clear any existing debounce timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save by 500ms
      saveTimeoutRef.current = setTimeout(() => {
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
          pendingFactsRef.current = null;
        }
      }, 500);
    },
    [facts, jurisdiction, saveFactsToServer]
  );

  // Cleanup debounce timeout on unmount and flush pending saves
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Flush any pending changes before unmount to prevent data loss
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
        }
      }
    };
  }, [saveFactsToServer]);

  // Flush pending saves when tab is hidden (reduces debounce loss window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clear any pending debounce timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        // Flush any pending changes when tab is hidden
        if (pendingFactsRef.current) {
          saveFactsToServer(pendingFactsRef.current);
          pendingFactsRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveFactsToServer]);

  // Navigate to next section with step completion tracking
  const handleNext = useCallback(() => {
    if (currentSectionIndex < visibleSections.length - 1) {
      // Track step completion if the current section is complete
      const current = visibleSections[currentSectionIndex];
      if (current && current.isComplete(facts)) {
        const normalizedStep = normalizeWizardStep(current.id);
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id, {
          caseId,
          product: product || 'tenancy_agreement',
          jurisdiction,
          stepGroup: normalizedStep.stepGroup,
        });
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: product || 'tenancy_agreement',
            jurisdiction: jurisdiction,
            step: current.id,
            stepIndex: currentSectionIndex,
            totalSteps: visibleSections.length,
            caseId,
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
    // Flush any pending debounced saves BEFORE navigating to review
    // This ensures all user edits are persisted to the database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // If there are pending facts to save, save them now and wait for completion
    if (pendingFactsRef.current) {
      try {
        await saveCaseFacts(caseId, pendingFactsRef.current, {
          jurisdiction,
          caseType: 'tenancy_agreement',
          product: saveProduct,
        });
        pendingFactsRef.current = null;
      } catch (err) {
        console.error('[Wizard] Failed to flush pending facts before navigation:', err);
        // Continue with navigation even if save fails - user can retry from review page
      }
    }

    router.push(`/wizard/review?case_id=${caseId}&product=${product}`);
  }, [caseId, jurisdiction, product, router, saveProduct]);

  // Calculate progress
  const completedCount = visibleSections.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = [
    ...(currentSection?.hasBlockers?.(facts) || []),
    ...(currentSection?.id === 'review' ? getTenancyValidationBlockers(facts, jurisdiction) : []),
  ];
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
        return 'England Assured Periodic Tenancy Agreement';
    }
  }, [jurisdiction]);

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'product':
        return <ProductSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'property':
        return <PropertySection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'landlord':
        return <LandlordSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'tenants':
        return <TenantsSection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'tenancy':
        return <TenancySection facts={facts} onUpdate={handleUpdate} jurisdiction={jurisdiction} />;
      case 'rent':
        return <RentSection facts={facts} onUpdate={handleUpdate} />;
      case 'document_details':
        return <ResidentialDocumentDetailsSection facts={facts} onUpdate={handleUpdate} />;
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

  const ShellComponent: React.ComponentType<any> = isWizardUiV3Enabled ? WizardShellV3 : WizardFlowShell;

  return (
    <ShellComponent
      title={`${jurisdictionLabel} Pack`}
      completedCount={completedCount}
      totalCount={visibleSections.length}
      progress={progress}
      tabs={visibleSections.map((section, index) => ({
        id: section.id,
        label: section.label,
        isCurrent: index === currentSectionIndex,
        isComplete: section.isComplete(facts),
        hasIssue:
          (section.hasBlockers?.(facts) || []).length > 0 ||
          (highlightedSectionSet.has(section.id) && !section.isComplete(facts)),
        onClick: () => setCurrentSectionIndex(index),
      }))}
      sectionTitle={currentSection?.label ?? ''}
      sectionDescription={currentSection?.description}
      product={product}
      jurisdiction={jurisdiction}
      currentStepId={currentSection?.id}
      banner={
        <>
          {highlightedSections.length > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Please complete the highlighted sections before checkout.
            </div>
          )}
          {error ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-red-700">{error}</span>
                <button
                  type="button"
                  onClick={handleRetrySave}
                  disabled={saving}
                  className="ml-4 px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          ) : undefined}
        </>
      }
      sidebar={(
        <AskHeavenPanel
          caseId={caseId}
          caseType="tenancy_agreement"
          jurisdiction={jurisdiction}
          product={saveProduct}
          currentQuestionId={undefined}
        />
      )}
            navigation={(
        <>
          <button
            onClick={handleBack}
            disabled={currentSectionIndex === 0}
            className={`
              px-4 py-2 text-sm font-medium rounded-xl border transition-colors
              ${currentSectionIndex === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-violet-900 border-violet-200 hover:bg-violet-50'}
            `}
          >
            Back
          </button>

          <div className="flex items-center justify-end gap-2">
            {saving && <span className="text-sm text-gray-500 whitespace-nowrap">Auto-saving...</span>}

            {currentSection?.id === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={currentBlockers.length > 0}
                className={`
                  px-7 py-2.5 text-sm font-semibold rounded-xl transition-all
                  ${currentBlockers.length > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-[0_6px_16px_rgba(109,40,217,0.28)]'}
                `}
              >
                Generate Case Bundle
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentSectionIndex === visibleSections.length - 1}
                className={`
                  px-7 py-2.5 text-sm font-semibold rounded-xl transition-all
                  ${currentSectionIndex === visibleSections.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-[0_6px_16px_rgba(109,40,217,0.28)]'}
                `}
              >
                Continue
              </button>
            )}
          </div>
        </>
      )}
    >
      {currentBlockers.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">Cannot Proceed - Blockers:</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {currentBlockers.map((blocker, i) => (
              <li key={i}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {currentWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Warnings:</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {currentWarnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {renderSection()}
    </ShellComponent>
  );
};

// =============================================================================
// Section Components
// =============================================================================

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
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
        <label className={LEGACY_TENANCY_LABEL_CLASS}>
          Which {jurisdiction === 'wales' ? 'occupation contract' : 'tenancy agreement'} do you need? <RequiredPill required />
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {jurisdiction === 'england'
            ? 'Standard covers straightforward ordinary residential lets. Premium adds fuller drafting, guarantor support, rent review, and tighter controls. Student, HMO / Shared House, and Lodger now have dedicated England products.'
            : 'Standard covers simple lets. Premium adds guarantor, HMO, rent review and tighter controls.'}
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

      {/* Clause Diff Preview - Compact version for wizard */}
      {facts.product_tier !== terms.premiumTier && (
        <div className="border-t border-gray-200 pt-6">
          <ClauseDiffPreview
            jurisdiction={jurisdiction}
            variant="compact"
            showUpgradeCTA={true}
            onUpgradeClick={() => handleTierSelect(terms.premiumTier)}
            maxClauses={3}
          />
        </div>
      )}

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
const LandlordSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction }) => {
  const terms = getJurisdictionTerminology(jurisdiction || 'england');
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Landlord Contact Details</h3>
        <p className="text-sm text-gray-500 mb-4">
          Used on the {terms.agreementType}, certificates and notices.
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

      {/* Scotland-specific: Landlord Registration (required by law) */}
      {jurisdiction === 'scotland' && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scottish Landlord Registration</h3>
          <p className="text-sm text-gray-500 mb-4">
            All landlords in Scotland must be registered with their local authority. This is a legal requirement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Registration number"
              value={facts.landlord_registration_number}
              onChange={(v) => onUpdate({ landlord_registration_number: v })}
              placeholder="e.g., 123456/123/12345"
              required
            />
            <TextField
              label="Registering local authority"
              value={facts.landlord_registration_authority}
              onChange={(v) => onUpdate({ landlord_registration_authority: v })}
              placeholder="e.g., City of Edinburgh Council"
              required
            />
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Letting Agent</h3>
        <YesNoField
          label="Are you using a letting agent?"
          value={facts.agent_usage}
          onChange={(v) => onUpdate({ agent_usage: v })}
          helperText={`If yes, their details can appear on the ${terms.agreementType} for rent collection and management.`}
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
const TenancySection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction }) => {
  const terms = getJurisdictionTerminology(jurisdiction || 'england');
  const isScotland = jurisdiction === 'scotland';
  const isEngland = jurisdiction === 'england';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isEngland ? 'Tenancy Start Date' : 'Tenancy Start and Term'}
        </h3>

        {/* Scotland PRT Informational Banner */}
        {isScotland && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Scottish PRTs are open-ended</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Under the Private Housing (Tenancies) (Scotland) Act 2016, all Private Residential Tenancies
                  are open-ended by law – there is no fixed term or end date. The tenancy continues until
                  properly terminated by the tenant (28 days notice) or landlord (using one of 18 eviction grounds).
                </p>
              </div>
            </div>
          </div>
        )}

        {isEngland && (
          <p className="text-sm text-gray-500 mb-4">
            For new England tenancies from 1 May 2026, the agreement is created as an assured periodic tenancy. Enter the tenancy start date below.
          </p>
        )}

        {!isScotland && !isEngland && (
          <p className="text-sm text-gray-500 mb-4">
            We tailor the {terms.agreementType} for fixed term vs periodic.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Start date"
            value={facts.tenancy_start_date}
            onChange={(v) => onUpdate({ tenancy_start_date: v })}
            type="date"
            required
          />

          {/* Fixed term question - NOT shown for Scotland or England */}
          {!isScotland && !isEngland && (
            <YesNoField
              label="Is this a fixed term tenancy?"
              value={facts.is_fixed_term}
              onChange={(v) => onUpdate({ is_fixed_term: v })}
              required
            />
          )}

          {/* Fixed term details - only for jurisdictions that still allow fixed term selection */}
          {!isScotland && !isEngland && facts.is_fixed_term && (
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
  const isWeeklyRent = facts.rent_period === 'week';
  const dueOptions = isWeeklyRent
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const suffix =
          day === 1 || day === 21 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
        return `${day}${suffix}`;
      });
  const usesBankTransfer = facts.payment_method === 'Bank Transfer';

  return (
    <div className="space-y-6">
      <div>
        <InlineSectionHeaderV3 title="Rent Schedule" iconSlug="rent" />
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
            label={isWeeklyRent ? 'Payment due weekday' : 'Payment due day'}
            value={facts.rent_due_day}
            onChange={(v) => onUpdate({ rent_due_day: v })}
            options={dueOptions}
            required
          />
          <SelectField
            label="Preferred payment method"
            value={facts.payment_method}
            onChange={(v) => onUpdate({ payment_method: v })}
            options={['Bank Transfer', 'Cash']}
            required
          />
        </div>
      </div>

      {usesBankTransfer ? (
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
      ) : null}
    </div>
  );
};

// Deposit Section
const DepositSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction }) => {
  const isScotland = jurisdiction === 'scotland';
  const isEngland = jurisdiction === 'england';
  const englandDepositCap = getEnglandDepositCapResult({ ...facts, __meta: { ...(facts.__meta || {}), jurisdiction } });
  const hasDeposit = hasPositiveDepositAmount({ ...facts, __meta: { ...(facts.__meta || {}), jurisdiction } });
  const depositAmount = toFiniteNumber(facts.deposit_amount);

  // Jurisdiction-specific deposit schemes
  const depositSchemeOptions = isScotland
    ? ['SafeDeposits Scotland', 'MyDeposits Scotland', 'Letting Protection Service Scotland']
    : ['DPS', 'MyDeposits', 'TDS', 'Other'];

  return (
    <div className="space-y-6">
      <div>
        <InlineSectionHeaderV3 title="Deposit and Protection" iconSlug="deposit" />
        <p className="text-sm text-gray-500 mb-4">
          {isScotland
            ? 'Scottish deposits must be protected within 30 WORKING days. Maximum deposit is 2 months rent.'
            : isEngland
              ? "For England, the deposit must not exceed 5 weeks' rent, or 6 weeks if the annual rent is £50,000 or more."
              : 'We include the deposit limit warning and scheme certificate.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyField
            label="Deposit amount"
            value={facts.deposit_amount}
            onChange={(v) => {
              const nextAmount = toFiniteNumber(v);
              if (nextAmount === 0) {
                onUpdate({
                  deposit_amount: 0,
                  deposit_scheme_name: '',
                  deposit_paid_date: '',
                  deposit_protection_date: '',
                  deposit_already_protected: undefined,
                  deposit_reference_number: '',
                  prescribed_information_served: undefined,
                });
                return;
              }

              onUpdate({ deposit_amount: v });
            }}
            placeholder="1400"
            required
          />
          {hasDeposit ? (
            <>
              <SelectField
                label="Deposit protection scheme"
                value={facts.deposit_scheme_name}
                onChange={(v) => onUpdate({ deposit_scheme_name: v })}
                options={depositSchemeOptions}
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
            </>
          ) : null}
        </div>
        {depositAmount === 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              No deposit will be taken for this tenancy, so the scheme fields and prescribed information
              steps are not needed for this pack.
            </p>
          </div>
        ) : null}
        {isEngland && englandDepositCap && (
          <div className={`mt-4 rounded-lg border p-4 ${englandDepositCap.exceeds ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className={`text-sm ${englandDepositCap.exceeds ? 'text-red-800' : 'text-emerald-800'}`}>
              <strong>England deposit cap:</strong> Maximum {GBP_SYMBOL}{englandDepositCap.maxDeposit.toFixed(2)} ({englandDepositCap.maxWeeks} weeks&apos; rent).
              {englandDepositCap.exceeds
                ? ` The amount entered exceeds the legal cap by ${GBP_SYMBOL}${(englandDepositCap.excessAmount ?? 0).toFixed(2)}.`
                : ' The amount entered is within the legal cap.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <InlineSectionHeaderV3
          title="Prescribed Information"
          iconSlug="deposit"
          subtitle="Record the deposit information you give the tenant and keep evidence on file."
        />
        {hasDeposit ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                {isScotland ? (
                  <>
                    <strong>SCOTTISH LEGAL REQUIREMENT:</strong> You MUST protect the deposit in an approved
                    Scottish scheme within 30 WORKING days of receiving it. You must also provide the tenant with
                    prescribed information within 30 working days. Failure to comply can result in compensation
                    up to 3x the deposit amount.
                  </>
                ) : (
                  <>
                    <strong>Statutory requirement:</strong> You must give the tenant the prescribed deposit
                    information within 30 days of receiving the deposit. If you do not, a court can order you
                    to repay or protect the deposit and pay compensation of up to 3 times the deposit. Keep
                    evidence that this was done.
                  </>
                )}
              </p>
            </div>
            <YesNoField
              label="Have you served or will you serve prescribed information?"
              value={facts.prescribed_information_served}
              onChange={(v) => onUpdate({ prescribed_information_served: v })}
              required
            />
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Prescribed information is only needed when a deposit is actually taken. If this tenancy will not
              take a deposit, we leave that part of the pack out.
            </p>
          </div>
        )}
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
  const isEnglandOperationalStep = isEnglandPostReformNewAgreementCase(facts, jurisdiction);

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
          {isEnglandOperationalStep && (
            <div className="md:col-span-2">
              <YesNoField
                label="England written information or government guidance recorded?"
                value={facts.how_to_rent_guide_provided}
                onChange={(v) => onUpdate({ how_to_rent_guide_provided: v })}
                helperText="Record any England written information or government guidance you give for this new tenancy, and keep proof of delivery"
                required
              />
            </div>
          )}
          {isEnglandOperationalStep && (
            <>
              <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="text-sm font-semibold text-amber-900">
                  England checks for new tenancies from 1 May 2026
                </h4>
                <p className="mt-1 text-sm text-amber-800">
                  Use these confirmations to keep the tenancy file aligned with the current England
                  rules before you issue the agreement.
                </p>
              </div>
              <div className="md:col-span-2">
                <YesNoField
                  label="Will you avoid asking for more than one month's rent in advance?"
                  value={facts.england_rent_in_advance_compliant}
                  onChange={(v) => onUpdate({ england_rent_in_advance_compliant: v })}
                  helperText="For a new England tenancy from 1 May 2026, do not require more than one month's rent in advance."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <YesNoField
                  label="Will you avoid inviting or accepting rental bids above the advertised rent?"
                  value={facts.england_no_bidding_confirmed}
                  onChange={(v) => onUpdate({ england_no_bidding_confirmed: v })}
                  helperText="For a new England tenancy from 1 May 2026, keep the advertised rent fixed and do not ask tenants to outbid each other."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <YesNoField
                  label="Will you avoid refusing applicants because they have children or receive benefits?"
                  value={facts.england_no_discrimination_confirmed}
                  onChange={(v) => onUpdate({ england_no_discrimination_confirmed: v })}
                  helperText="For a new England tenancy from 1 May 2026, do not reject applicants on this basis."
                  required
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Terms Section - with Ask Heaven inline enhancement for narrative text fields
const TermsSection: React.FC<SectionProps> = ({ facts, onUpdate, caseId, jurisdiction = 'england' }) => {
  const isEngland = jurisdiction === 'england';

  useEffect(() => {
    if (!isEngland) return;

    if (facts.break_clause || facts.break_clause_months || facts.break_clause_notice_period) {
      onUpdate({
        break_clause: false,
        break_clause_months: undefined,
        break_clause_notice_period: undefined,
      });
    }
  }, [
    facts.break_clause,
    facts.break_clause_months,
    facts.break_clause_notice_period,
    isEngland,
    onUpdate,
  ]);

  return (
    <div className="space-y-6">
      {/* Property Rules */}
      <div>
        <InlineSectionHeaderV3
          title="House Rules"
          iconSlug="terms"
          subtitle={
            isEngland
              ? 'Set agreed pet, smoking, and subletting rules. For England, pet requests should be considered reasonably and recorded in writing.'
              : 'Pets, smoking and subletting policies.'
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <YesNoField
            label={isEngland ? 'Will any pets be authorised at the start?' : 'Are pets allowed?'}
            value={facts.pets_allowed}
            onChange={(v) => onUpdate({ pets_allowed: v })}
            helperText={
              isEngland
                ? 'A tenant can still ask for written pet consent later, and requests should be considered reasonably.'
                : undefined
            }
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
        <InlineSectionHeaderV3
          title="Access Rules"
          iconSlug="calendar-timeline"
          subtitle={
            isEngland
              ? "For England, non-emergency entry should usually be on at least 24 hours' notice and at a reasonable time."
              : 'Notice periods for entry and inspections.'
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label={isEngland ? 'Notice before non-emergency access' : 'Notice before access'}
            value={facts.landlord_access_notice}
            onChange={(v) => onUpdate({ landlord_access_notice: v })}
            options={['24 hours', '48 hours', '72 hours']}
            helperText={isEngland ? '24 hours is the usual minimum for routine access unless there is an emergency.' : undefined}
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
            label={isEngland ? 'Allow viewings once the tenancy is ending?' : 'Allow end-of-tenancy viewings?'}
            value={facts.end_of_tenancy_viewings}
            onChange={(v) => onUpdate({ end_of_tenancy_viewings: v })}
            required
          />
        </div>
      </div>

      {/* Maintenance & Repairs */}
      <div className="border-t border-gray-200 pt-6">
        <InlineSectionHeaderV3
          title="Repairs and Maintenance"
          iconSlug="property"
          subtitle="What the landlord handles, how tenants report repairs, and who to contact out of hours."
        />
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
        <InlineSectionHeaderV3
          title="Inventory and Cleaning"
          iconSlug="inventory"
          subtitle={
            isEngland
              ? 'Set the expected return standard and any inventory schedule. Do not require a paid professional clean in every case.'
              : undefined
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <YesNoField
            label="Will you attach an inventory schedule?"
            value={facts.inventory_attached}
            onChange={(v) => onUpdate({ inventory_attached: v })}
            required
          />
          <YesNoField
            label={
              isEngland
                ? 'Require return to the same standard of cleanliness at the end?'
                : 'Require professional cleaning at end?'
            }
            value={facts.professional_cleaning_required}
            onChange={(v) => onUpdate({ professional_cleaning_required: v })}
            helperText={
              isEngland
                ? 'Use this to record the expected cleaning standard, not to require a paid cleaning service in every case.'
                : undefined
            }
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
      {!isEngland && (
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
      )}

      {/* Additional Terms */}
      <div className="border-t border-gray-200 pt-6">
        <InlineSectionHeaderV3
          title="Additional Terms"
          iconSlug="summary-cards"
          subtitle="Optional bespoke clauses to insert into the agreement."
        />
        <div className="space-y-2">
          <TextareaField
            label="Any additional bespoke terms?"
            value={facts.additional_terms}
            onChange={(v) => onUpdate({ additional_terms: v })}
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
          {jurisdiction === 'england'
            ? 'For new England HMO or shared-house cases, use the dedicated HMO / Shared House tenancy agreement. Legacy Premium cases keep their historical HMO-ready wording here.'
            : `${terms.premiumTier} adds HMO-ready clauses.`}
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
              label="Process"
              value={facts.rent_increase_method}
              onChange={(v) => onUpdate({ rent_increase_method: v })}
              options={['Section 13 rent increase process (Housing Act 1988)']}
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

const ResidentialDocumentDetailsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const residentialProduct = getResidentialStandaloneProduct(facts);

  if (!residentialProduct) {
    return null;
  }

  const productMeta = RESIDENTIAL_LETTING_PRODUCTS[residentialProduct];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-lg font-medium text-gray-900">{productMeta.label}</h3>
        <p className="mt-1 text-sm text-gray-600">
          Add the extra details needed for this standalone residential document.
        </p>
      </div>

      {(residentialProduct === 'guarantor_agreement' || residentialProduct === 'residential_tenancy_application') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label={residentialProduct === 'guarantor_agreement' ? 'Guarantor employment status' : 'Applicant employment status'}
            value={facts.applicant_employment_status}
            onChange={(v) => onUpdate({ applicant_employment_status: v })}
            options={['Employed', 'Self-employed', 'Student', 'Retired', 'Unemployed']}
            required={residentialProduct === 'residential_tenancy_application'}
          />
          <TextField
            label={residentialProduct === 'guarantor_agreement' ? 'Guarantor employer / organisation' : 'Employer / organisation'}
            value={facts.applicant_employer_name}
            onChange={(v) => onUpdate({ applicant_employer_name: v })}
          />
          <TextField
            label={residentialProduct === 'guarantor_agreement' ? 'Guarantor role / occupation' : 'Job title / course'}
            value={facts.applicant_job_title}
            onChange={(v) => onUpdate({ applicant_job_title: v })}
          />
          <CurrencyField
            label={`Annual income (${GBP_SYMBOL})`}
            value={facts.applicant_annual_income}
            onChange={(v) => onUpdate({ applicant_annual_income: v })}
            required={residentialProduct === 'residential_tenancy_application'}
          />
          <TextField
            label="Reference contact"
            value={facts.applicant_reference_name}
            onChange={(v) => onUpdate({ applicant_reference_name: v })}
          />
          <TextField
            label="Reference email / phone"
            value={facts.applicant_reference_contact}
            onChange={(v) => onUpdate({ applicant_reference_contact: v })}
          />
        </div>
      )}

      {residentialProduct === 'guarantor_agreement' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Guarantor name"
            value={facts.guarantor_name}
            onChange={(v) => onUpdate({ guarantor_name: v })}
            required
          />
          <TextField
            label="Relationship to tenant"
            value={facts.guarantor_relationship}
            onChange={(v) => onUpdate({ guarantor_relationship: v })}
          />
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
          />
          <TextField
            label="Guarantor phone"
            value={facts.guarantor_phone}
            onChange={(v) => onUpdate({ guarantor_phone: v })}
            type="tel"
          />
          <CurrencyField
            label={`Optional liability cap (${GBP_SYMBOL})`}
            value={facts.guarantee_cap_amount}
            onChange={(v) => onUpdate({ guarantee_cap_amount: v })}
            helperText="Leave blank if the guarantee is intended to be unlimited."
          />
          <TextField
            label="Guarantee commencement date"
            value={facts.guarantee_commencement_date}
            onChange={(v) => onUpdate({ guarantee_commencement_date: v })}
            type="date"
          />
          <YesNoField
            label="Should liability continue after renewal or variation?"
            value={facts.guarantee_continues_after_renewal}
            onChange={(v) => onUpdate({ guarantee_continues_after_renewal: v })}
          />
        </div>
      )}

      {residentialProduct === 'residential_tenancy_application' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Applicant date of birth"
              value={facts.applicant_date_of_birth}
              onChange={(v) => onUpdate({ applicant_date_of_birth: v })}
              type="date"
            />
            <TextField
              label="Desired move-in date"
              value={facts.desired_move_in_date}
              onChange={(v) => onUpdate({ desired_move_in_date: v })}
              type="date"
            />
            <NumberField
              label="How many adults will occupy?"
              value={facts.applicant_occupants}
              onChange={(v) => onUpdate({ applicant_occupants: v })}
            />
            <NumberField
              label="How many children?"
              value={facts.children_count}
              onChange={(v) => onUpdate({ children_count: v })}
            />
            <YesNoField
              label="Any pets?"
              value={facts.applicant_has_pets}
              onChange={(v) => onUpdate({ applicant_has_pets: v })}
            />
            <YesNoField
              label="Smoking household?"
              value={facts.applicant_smoker}
              onChange={(v) => onUpdate({ applicant_smoker: v })}
            />
            <TextField
              label="Current landlord / agent"
              value={facts.current_landlord_name}
              onChange={(v) => onUpdate({ current_landlord_name: v })}
              required
            />
            <TextField
              label="Current landlord contact details"
              value={facts.current_landlord_contact}
              onChange={(v) => onUpdate({ current_landlord_contact: v })}
              required
            />
            <CurrencyField
              label={`Current rent (${GBP_SYMBOL})`}
              value={facts.current_rent_amount}
              onChange={(v) => onUpdate({ current_rent_amount: v })}
            />
            <TextField
              label="Length of occupation"
              value={facts.length_of_occupation}
              onChange={(v) => onUpdate({ length_of_occupation: v })}
              placeholder="18 months"
            />
          </div>
          <TextareaField
            label="Reason for moving"
            value={facts.reason_for_moving}
            onChange={(v) => onUpdate({ reason_for_moving: v })}
          />
          <TextareaField
            label="Additional income, maintenance, guarantor support, or benefits"
            value={facts.additional_income_details}
            onChange={(v) => onUpdate({ additional_income_details: v })}
          />
          <TextareaField
            label="Adverse credit, CCJ, IVA, or insolvency details"
            value={facts.adverse_credit_details}
            onChange={(v) => onUpdate({ adverse_credit_details: v })}
          />
        </div>
      )}

      {(residentialProduct === 'rental_inspection_report' || residentialProduct === 'inventory_schedule_condition') && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Capture the inspection like an evidence bundle: identify the layout, note each room, record keys and
              meter readings, list defects, and reference any supporting photos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Inspection date"
              value={facts.inspection_date}
              onChange={(v) => onUpdate({ inspection_date: v })}
              type="date"
              required={residentialProduct === 'rental_inspection_report'}
            />
            <SelectField
              label="Inspection type"
              value={facts.inspection_type}
              onChange={(v) => onUpdate({ inspection_type: v })}
              options={['Move-in', 'Move-out', 'Mid-tenancy', 'Check-out comparison', 'Periodic landlord inspection']}
              required={residentialProduct === 'rental_inspection_report'}
            />
            <TextField
              label="Inspector / clerk of inspection"
              value={facts.inspector_name}
              onChange={(v) => onUpdate({ inspector_name: v })}
            />
            <TextField
              label="Inspection time"
              value={facts.inspection_time}
              onChange={(v) => onUpdate({ inspection_time: v })}
              placeholder="10:30 am"
            />
            <TextField
              label="Occupier or representative present"
              value={facts.inspection_attended_by}
              onChange={(v) => onUpdate({ inspection_attended_by: v })}
            />
            <SelectField
              label="Furnished status"
              value={facts.furnished_status}
              onChange={(v) => onUpdate({ furnished_status: v })}
              options={['Unfurnished', 'Part-furnished', 'Fully furnished']}
            />
            <TextField
              label="Photo schedule / evidence reference"
              value={facts.photo_schedule_reference}
              onChange={(v) => onUpdate({ photo_schedule_reference: v })}
              placeholder="Inspection photographs set A, video walkthrough, etc."
            />
          </div>
          <TextareaField
            label="Property layout and areas inspected"
            value={facts.property_layout_notes}
            onChange={(v) => onUpdate({ property_layout_notes: v })}
            required={residentialProduct === 'rental_inspection_report'}
            helperText="Summarise the accommodation inspected, for example entrance hall, reception room, kitchen, two bedrooms, bathroom, loft access, garden, and any outbuildings."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Keys provided"
              value={facts.keys_provided_count}
              onChange={(v) => onUpdate({ keys_provided_count: v })}
            />
            <TextField
              label="Keys / fobs / access devices issued"
              value={facts.keys_provided_summary}
              onChange={(v) => onUpdate({ keys_provided_summary: v })}
              placeholder="Front door key x2, communal fob x1, meter cupboard key x1"
            />
            <TextField
              label="Meter readings"
              value={facts.utility_meter_readings}
              onChange={(v) => onUpdate({ utility_meter_readings: v })}
              placeholder="Gas 12345, Electric 54321, Water 678"
            />
            <TextField
              label="Smoke / CO alarm checks"
              value={facts.alarm_test_summary}
              onChange={(v) => onUpdate({ alarm_test_summary: v })}
            />
            <TextField
              label="Gas meter"
              value={facts.meter_reading_gas}
              onChange={(v) => onUpdate({ meter_reading_gas: v })}
            />
            <TextField
              label="Electric meter"
              value={facts.meter_reading_electric}
              onChange={(v) => onUpdate({ meter_reading_electric: v })}
            />
            <TextField
              label="Water meter"
              value={facts.meter_reading_water}
              onChange={(v) => onUpdate({ meter_reading_water: v })}
            />
            <TextField
              label="Meter serial numbers"
              value={facts.meter_serial_numbers}
              onChange={(v) => onUpdate({ meter_serial_numbers: v })}
              placeholder="Gas G12345, Electric E98765, Water W456"
            />
          </div>
          <TextareaField
            label="Safety checks and compliance observations"
            value={facts.safety_checks_summary}
            onChange={(v) => onUpdate({ safety_checks_summary: v })}
            helperText="Record visible safety checks, detector status, appliance observations, and anything requiring follow-up."
          />
          <TextareaField
            label="Overall cleanliness and presentation"
            value={facts.cleanliness_overview}
            onChange={(v) => onUpdate({ cleanliness_overview: v })}
          />
          <TextareaField
            label="General room-by-room summary"
            value={facts.room_condition_summary}
            onChange={(v) => onUpdate({ room_condition_summary: v })}
            required={residentialProduct === 'rental_inspection_report'}
            helperText="Summarise the overall condition, decorative state, wear, marks, flooring, and any missing items."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextareaField
              label="Entrance hall / landing"
              value={facts.entrance_hall_condition}
              onChange={(v) => onUpdate({ entrance_hall_condition: v })}
            />
            <TextareaField
              label="Reception / living areas"
              value={facts.reception_room_condition}
              onChange={(v) => onUpdate({ reception_room_condition: v })}
            />
            <TextareaField
              label="Kitchen and appliances"
              value={facts.kitchen_condition}
              onChange={(v) => onUpdate({ kitchen_condition: v })}
            />
            <TextareaField
              label="Bedroom 1"
              value={facts.bedroom_one_condition}
              onChange={(v) => onUpdate({ bedroom_one_condition: v })}
            />
            <TextareaField
              label="Bedroom 2 / additional bedrooms"
              value={facts.bedroom_two_condition}
              onChange={(v) => onUpdate({ bedroom_two_condition: v })}
            />
            <TextareaField
              label="Bathroom / WC"
              value={facts.bathroom_condition}
              onChange={(v) => onUpdate({ bathroom_condition: v })}
            />
            <TextareaField
              label="External areas / garden / bins"
              value={facts.external_areas_condition}
              onChange={(v) => onUpdate({ external_areas_condition: v })}
            />
            <TextareaField
              label="Fixtures, fittings, windows, and flooring"
              value={facts.fixtures_fittings_condition}
              onChange={(v) => onUpdate({ fixtures_fittings_condition: v })}
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-700 mb-3">
              Itemised inventory entries make the report more useful in deposit and condition disputes.
              Use one line per item. Optional format: <code>Item | Condition | Notes</code>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextareaField
                label="Entrance hall itemised inventory"
                value={facts.entrance_hall_inventory_items}
                onChange={(v) => onUpdate({ entrance_hall_inventory_items: v })}
                helperText="Example: Console table | Good | Minor scuff to leg"
              />
              <TextareaField
                label="Reception / living areas itemised inventory"
                value={facts.reception_room_inventory_items}
                onChange={(v) => onUpdate({ reception_room_inventory_items: v })}
              />
              <TextareaField
                label="Kitchen itemised inventory"
                value={facts.kitchen_inventory_items}
                onChange={(v) => onUpdate({ kitchen_inventory_items: v })}
              />
              <TextareaField
                label="Bedroom 1 itemised inventory"
                value={facts.bedroom_one_inventory_items}
                onChange={(v) => onUpdate({ bedroom_one_inventory_items: v })}
              />
              <TextareaField
                label="Bedroom 2 / additional bedrooms itemised inventory"
                value={facts.bedroom_two_inventory_items}
                onChange={(v) => onUpdate({ bedroom_two_inventory_items: v })}
              />
              <TextareaField
                label="Bathroom / WC itemised inventory"
                value={facts.bathroom_inventory_items}
                onChange={(v) => onUpdate({ bathroom_inventory_items: v })}
              />
              <TextareaField
                label="External areas itemised inventory"
                value={facts.external_areas_inventory_items}
                onChange={(v) => onUpdate({ external_areas_inventory_items: v })}
              />
              <TextareaField
                label="Fixtures and fittings itemised inventory"
                value={facts.fixtures_fittings_inventory_items}
                onChange={(v) => onUpdate({ fixtures_fittings_inventory_items: v })}
              />
            </div>
          </div>
          <TextareaField
            label="Defects, damage, missing items, and action points"
            value={facts.defects_action_items}
            onChange={(v) => onUpdate({ defects_action_items: v })}
            helperText="List defects, repairs, missing items, cleaning issues, or matters to monitor."
          />
          <TextareaField
            label="Documents, manuals, and handover notes"
            value={facts.document_handover_notes}
            onChange={(v) => onUpdate({ document_handover_notes: v })}
            helperText="Record certificates, manuals, remote controls, appliance guides, bin collection notes, or similar handover items."
          />
          <TextareaField
            label="Occupier comments / signature notes"
            value={facts.tenant_comments}
            onChange={(v) => onUpdate({ tenant_comments: v })}
          />
        </div>
      )}

      {(residentialProduct === 'lease_amendment' || residentialProduct === 'renewal_tenancy_agreement') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Original agreement date"
            value={facts.original_agreement_date}
            onChange={(v) => onUpdate({ original_agreement_date: v })}
            type="date"
            required
          />
          <TextField
            label={residentialProduct === 'lease_amendment' ? 'Amendment effective date' : 'Renewal start date'}
            value={residentialProduct === 'lease_amendment' ? facts.amendment_effective_date : facts.renewal_start_date}
            onChange={(v) =>
              onUpdate(
                residentialProduct === 'lease_amendment'
                  ? { amendment_effective_date: v }
                  : { renewal_start_date: v }
              )
            }
            type="date"
            required
          />
          {residentialProduct === 'renewal_tenancy_agreement' && (
            <>
              <TextField
                label="Renewal end date"
                value={facts.renewal_end_date}
                onChange={(v) => onUpdate({ renewal_end_date: v })}
                type="date"
              />
              <NumberField
                label="Renewed rent (£)"
                value={facts.renewal_rent_amount}
                onChange={(v) => onUpdate({ renewal_rent_amount: v })}
              />
            </>
          )}
          <div className="md:col-span-2">
            <TextareaField
              label={residentialProduct === 'lease_amendment' ? 'What is changing?' : 'Terms continuing / changing'}
              value={facts.amendment_summary}
              onChange={(v) => onUpdate({ amendment_summary: v })}
              helperText="Describe the dates, rent, parties, or clauses changing."
            />
          </div>
        </div>
        {residentialProduct === 'lease_amendment' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Clause / schedule reference being amended"
                value={facts.amended_clauses_reference}
                onChange={(v) => onUpdate({ amended_clauses_reference: v })}
                required
              />
              <TextField
                label="Amendment title"
                value={facts.amendment_title}
                onChange={(v) => onUpdate({ amendment_title: v })}
              />
            </div>
            <TextareaField
              label="Replacement clause wording"
              value={facts.replacement_clause_text}
              onChange={(v) => onUpdate({ replacement_clause_text: v })}
              helperText="Set out the precise wording that should replace the existing clause if needed."
            />
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Current tenancy end date"
              value={facts.current_tenancy_end_date}
              onChange={(v) => onUpdate({ current_tenancy_end_date: v })}
              type="date"
            />
            <TextareaField
              label="Renewal compliance notes"
              value={facts.renewal_compliance_notes}
              onChange={(v) => onUpdate({ renewal_compliance_notes: v })}
              helperText="Record any deposit, prescribed information, licensing, or right to rent checks to revisit on renewal."
            />
          </div>
        )}
        </div>
      )}

      {(residentialProduct === 'residential_sublet_agreement' || residentialProduct === 'lease_assignment_agreement') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {residentialProduct === 'residential_sublet_agreement' ? (
            <>
              <TextField
                label="Head tenant name"
                value={facts.head_tenant_name}
                onChange={(v) => onUpdate({ head_tenant_name: v })}
              />
              <TextField
                label="Subtenant name"
                value={facts.subtenant_name}
                onChange={(v) => onUpdate({ subtenant_name: v })}
                required
              />
              <TextField
                label="Sublet start date"
                value={facts.sublet_start_date}
                onChange={(v) => onUpdate({ sublet_start_date: v })}
                type="date"
                required
              />
              <TextField
                label="Sublet end date"
                value={facts.sublet_end_date}
                onChange={(v) => onUpdate({ sublet_end_date: v })}
                type="date"
              />
              <YesNoField
                label="Landlord consent obtained?"
                value={facts.landlord_consent_obtained}
                onChange={(v) => onUpdate({ landlord_consent_obtained: v })}
              />
              <TextField
                label="Landlord consent reference"
                value={facts.landlord_consent_reference}
                onChange={(v) => onUpdate({ landlord_consent_reference: v })}
              />
              <TextField
                label="Landlord consent date"
                value={facts.landlord_consent_date}
                onChange={(v) => onUpdate({ landlord_consent_date: v })}
                type="date"
              />
              <CurrencyField
                label={`Sublet rent (${GBP_SYMBOL})`}
                value={facts.sublet_rent}
                onChange={(v) => onUpdate({ sublet_rent: v })}
              />
              <CurrencyField
                label={`Sublet deposit (${GBP_SYMBOL})`}
                value={facts.sublet_deposit}
                onChange={(v) => onUpdate({ sublet_deposit: v })}
              />
            </>
          ) : (
            <>
              <TextField
                label="Outgoing tenant"
                value={facts.outgoing_tenant_name}
                onChange={(v) => onUpdate({ outgoing_tenant_name: v })}
                required
              />
              <TextField
                label="Incoming tenant"
                value={facts.incoming_tenant_name}
                onChange={(v) => onUpdate({ incoming_tenant_name: v })}
                required
              />
              <TextField
                label="Assignment date"
                value={facts.assignment_effective_date}
                onChange={(v) => onUpdate({ assignment_effective_date: v })}
                type="date"
                required
              />
              <YesNoField
                label="Landlord consent obtained?"
                value={facts.landlord_consent_obtained}
                onChange={(v) => onUpdate({ landlord_consent_obtained: v })}
              />
              <TextField
                label="Landlord consent reference"
                value={facts.landlord_consent_reference}
                onChange={(v) => onUpdate({ landlord_consent_reference: v })}
              />
              <TextField
                label="Landlord consent date"
                value={facts.landlord_consent_date}
                onChange={(v) => onUpdate({ landlord_consent_date: v })}
                type="date"
              />
              <YesNoField
                label="Release outgoing tenant after assignment?"
                value={facts.release_outgoing_tenant}
                onChange={(v) => onUpdate({ release_outgoing_tenant: v })}
              />
            </>
          )}
          </div>
          {residentialProduct === 'residential_sublet_agreement' ? (
            <TextareaField
              label="Head tenancy, permitted use, bills, and house rules"
              value={facts.transfer_terms_summary}
              onChange={(v) => onUpdate({ transfer_terms_summary: v })}
              helperText="Record any head tenancy restrictions, permitted use, bills arrangements, and house rules that should bind the subtenant."
            />
          ) : (
            <>
              <TextareaField
                label="Deposit treatment"
                value={facts.deposit_treatment}
                onChange={(v) => onUpdate({ deposit_treatment: v })}
                helperText="Explain whether the deposit is transferred, repaid and replaced, or dealt with outside this agreement."
              />
              <TextareaField
                label="Apportionments, handover, and additional terms"
                value={facts.transfer_terms_summary}
                onChange={(v) => onUpdate({ transfer_terms_summary: v })}
                helperText="Record any rent or utility apportionment, key handover, and other practical assignment terms."
              />
            </>
          )}
        </div>
      )}

      {residentialProduct === 'flatmate_agreement' && (
        <div className="space-y-4">
          <TextField
            label="Occupier names"
            value={facts.flatmate_names}
            onChange={(v) => onUpdate({ flatmate_names: v })}
            placeholder="Alex Brown, Jordan Smith"
          />
          <TextField
            label="Room allocation"
            value={facts.room_allocation}
            onChange={(v) => onUpdate({ room_allocation: v })}
          />
          <TextareaField
            label="How is rent split?"
            value={facts.flatmate_rent_split}
            onChange={(v) => onUpdate({ flatmate_rent_split: v })}
          />
          <TextareaField
            label="How are bills split?"
            value={facts.bill_split_summary}
            onChange={(v) => onUpdate({ bill_split_summary: v })}
            required
          />
          <TextareaField
            label="House rules"
            value={facts.house_rules_summary}
            onChange={(v) => onUpdate({ house_rules_summary: v })}
            required
          />
          <TextareaField
            label="Cleaning schedule"
            value={facts.cleaning_schedule}
            onChange={(v) => onUpdate({ cleaning_schedule: v })}
          />
          <TextareaField
            label="Guest rules"
            value={facts.guest_rules}
            onChange={(v) => onUpdate({ guest_rules: v })}
          />
          <TextField
            label="Quiet hours"
            value={facts.quiet_hours}
            onChange={(v) => onUpdate({ quiet_hours: v })}
            placeholder="10:00pm to 7:00am"
          />
          <TextareaField
            label="Dispute resolution process"
            value={facts.dispute_resolution}
            onChange={(v) => onUpdate({ dispute_resolution: v })}
          />
          <TextField
            label="Notice period between flatmates"
            value={facts.notice_period_between_flatmates}
            onChange={(v) => onUpdate({ notice_period_between_flatmates: v })}
            placeholder="28 days"
          />
          <TextareaField
            label="Exit and replacement occupier arrangements"
            value={facts.exit_arrangements}
            onChange={(v) => onUpdate({ exit_arrangements: v })}
          />
          <TextareaField
            label="Replacement occupier process"
            value={facts.replacement_occupier_process}
            onChange={(v) => onUpdate({ replacement_occupier_process: v })}
          />
        </div>
      )}

      {(residentialProduct === 'rent_arrears_letter' || residentialProduct === 'repayment_plan_agreement') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            label="Current arrears (£)"
            value={facts.arrears_amount}
            onChange={(v) => onUpdate({ arrears_amount: v })}
            required
          />
          <TextField
            label="Arrears as at"
            value={facts.arrears_date}
            onChange={(v) => onUpdate({ arrears_date: v })}
            type="date"
          />
          <TextareaField
            label="Missed rent periods"
            value={facts.arrears_periods_missed}
            onChange={(v) => onUpdate({ arrears_periods_missed: v })}
            placeholder="January 2026, February 2026"
            required={residentialProduct === 'rent_arrears_letter'}
          />
          <TextField
            label="Arrears schedule reference"
            value={facts.arrears_schedule_attached_reference}
            onChange={(v) => onUpdate({ arrears_schedule_attached_reference: v })}
            placeholder="Ledger attached at Schedule 1"
          />
          <TextField
            label="Payment method"
            value={facts.payment_method}
            onChange={(v) => onUpdate({ payment_method: v })}
            placeholder="Bank transfer"
          />
          <TextField
            label="Payment reference to quote"
            value={facts.payment_reference_override}
            onChange={(v) => onUpdate({ payment_reference_override: v })}
          />
          {residentialProduct === 'rent_arrears_letter' ? (
            <>
              <SelectField
                label="Letter type"
                value={facts.arrears_letter_type}
                onChange={(v) => onUpdate({ arrears_letter_type: v })}
                options={['Arrears reminder', 'Final warning']}
              />
              <TextField
                label="Final deadline"
                value={facts.final_deadline}
                onChange={(v) => onUpdate({ final_deadline: v })}
                type="date"
                required
              />
              <TextField
                label="Response deadline"
                value={facts.response_deadline}
                onChange={(v) => onUpdate({ response_deadline: v })}
                type="date"
              />
            </>
          ) : (
            <>
              <NumberField
                label="Repayment amount (£)"
                value={facts.repayment_amount}
                onChange={(v) => onUpdate({ repayment_amount: v })}
                required
              />
              <SelectField
                label="Repayment frequency"
                value={facts.repayment_frequency}
                onChange={(v) => onUpdate({ repayment_frequency: v })}
                options={['Weekly', 'Fortnightly', 'Monthly']}
                required
              />
              <TextField
                label="First repayment date"
                value={facts.repayment_start_date}
                onChange={(v) => onUpdate({ repayment_start_date: v })}
                type="date"
                required
              />
              <TextField
                label="Plan end date / final deadline"
                value={facts.repayment_end_date}
                onChange={(v) => onUpdate({ repayment_end_date: v })}
                type="date"
              />
              <NumberField
                label="Default grace period (days)"
                value={facts.default_grace_days}
                onChange={(v) => onUpdate({ default_grace_days: v })}
              />
            </>
          )}
        </div>
        <TextareaField
          label="Payment instructions"
          value={facts.payment_details}
          onChange={(v) => onUpdate({ payment_details: v })}
          helperText="Record bank details, portal instructions, or where payment should be sent."
        />
        {residentialProduct === 'repayment_plan_agreement' && (
          <TextareaField
            label="Default consequences"
            value={facts.default_consequences}
            onChange={(v) => onUpdate({ default_consequences: v })}
            helperText="Explain what should happen if an instalment or ongoing rent payment is missed."
          />
        )}
        </div>
      )}

      <TextareaField
        label="Additional notes"
        value={facts.document_notes}
        onChange={(v) => onUpdate({ document_notes: v })}
        helperText="Optional notes to include in the final document."
      />
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
        <div className={isWizardUiV3Enabled ? "bg-violet-50 border border-violet-200 rounded-lg p-4" : "bg-green-50 border border-green-200 rounded-lg p-4"}>
          <h4 className={isWizardUiV3Enabled ? "font-medium text-violet-900 mb-2" : "font-medium text-green-800 mb-2"}>Ready to Generate</h4>
          <p className={isWizardUiV3Enabled ? "text-sm text-violet-700" : "text-sm text-green-700"}>
            All sections are complete. Click "Generate Case Bundle" to create your tenancy agreement.
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

const LEGACY_TENANCY_LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-2';
const LEGACY_TENANCY_HELPER_CLASS = 'text-sm text-gray-500 mb-2';
const LEGACY_TENANCY_REQUIRED_PILL_CLASS =
  'ml-2 inline-flex rounded-full border border-[#ddd6fe] bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6d28d9]';
const LEGACY_TENANCY_TEXTAREA_CLASS =
  'england-tenancy-input w-full rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] p-3 text-base text-charcoal transition-all duration-200 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#ede9fe] focus:ring-offset-0 min-h-20';
const LEGACY_TENANCY_SELECT_CLASS =
  'england-tenancy-input w-full rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] p-3 text-base text-charcoal transition-all duration-200 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#ede9fe] focus:ring-offset-0';

function RequiredPill({ required }: { required?: boolean }) {
  if (!required) return null;
  return <span className={LEGACY_TENANCY_REQUIRED_PILL_CLASS}>Required</span>;
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="england-tenancy-input w-full rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] focus:ring-offset-0"
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={LEGACY_TENANCY_TEXTAREA_CLASS}
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
    <Input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className="england-tenancy-input w-full rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] focus:ring-offset-0"
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
    <div className="relative">
      <span className="absolute left-3 top-3 text-gray-500">£</span>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="england-tenancy-input pl-8 w-full rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] focus:ring-offset-0"
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={LEGACY_TENANCY_SELECT_CLASS}
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
    <label className={LEGACY_TENANCY_LABEL_CLASS}>
      {label} <RequiredPill required={required} />
    </label>
    {helperText && <p className={LEGACY_TENANCY_HELPER_CLASS}>{helperText}</p>}
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
