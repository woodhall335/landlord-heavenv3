/**
 * Notice Only Section Flow - England/Wales/Scotland
 *
 * Section-based wizard for generating eviction notices, matching the
 * EvictionSectionFlow design language for consistency.
 *
 * Flow Structure (England/Wales):
 * 1. Case Basics - Jurisdiction and eviction route selection
 * 2. Parties - Landlord(s) and Tenant(s) with joint support
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency, due day
 * 5. Section 21 Compliance - S21 only (deposit, prescribed info, gas, EPC, HtR)
 * 6. Notice Details - Grounds and service details (S8 grounds selected here BEFORE arrears)
 * 7. Section 8 Arrears - S8 only using ArrearsScheduleStep (needs grounds to be selected first)
 * 8. Review - Generate and download notice
 *
 * Flow Structure (Scotland):
 * 1. Case Basics - Jurisdiction (Scotland, PRT)
 * 2. Parties - Landlord and Tenant details
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency (6-month rule validation)
 * 5. Grounds - Select eviction ground (ALL discretionary in Scotland)
 * 6. Notice - Notice to Leave details (6-month rule enforced)
 * 7. Review - Generate and download notice
 *
 * Scotland-specific rules:
 * - NO MANDATORY GROUNDS - All 18 grounds are discretionary
 * - 6-MONTH RULE - Notice cannot be served within first 6 months
 * - NOTICE PERIODS - 28 or 84 days from config (not hardcoded)
 *
 * Design: Matches EvictionSectionFlow UI exactly (gray-50 background, purple-600
 * primary #7C3AED, section tabs, progress bar, white card content area)
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RiCheckLine, RiErrorWarningLine, RiArrowRightSLine } from 'react-icons/ri';

import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';

// Reuse section components from eviction flow
import { CaseBasicsSection } from '../sections/eviction/CaseBasicsSection';
import { PartiesSection } from '../sections/eviction/PartiesSection';
import { PropertySection } from '../sections/eviction/PropertySection';
import { TenancySection } from '../sections/eviction/TenancySection';
import { Section21ComplianceSection } from '../sections/eviction/Section21ComplianceSection';
import { Section8ArrearsSection } from '../sections/eviction/Section8ArrearsSection';
import { NoticeSection } from '../sections/eviction/NoticeSection';

// Wales-specific section components
import { OccupationContractSection } from '../sections/wales/OccupationContractSection';
import { WalesNoticeSection } from '../sections/wales/WalesNoticeSection';
import { WalesCaseBasicsSection } from '../sections/wales/WalesCaseBasicsSection';
import { WalesComplianceSection } from '../sections/wales/WalesComplianceSection';

// Scotland-specific section components
import { ScotlandGroundsSection } from '../sections/eviction/ScotlandGroundsSection';
import { ScotlandNoticeSection } from '../sections/eviction/ScotlandNoticeSection';
import { ScotlandComplianceSection } from '../sections/eviction/ScotlandComplianceSection';

// Scotland utilities
import { validateSixMonthRule } from '@/lib/scotland/grounds';
import { calculateConsecutiveArrearsStreak } from '@/lib/scotland/notice-utils';

// Wales compliance schema for blocking violations and legacy migration
import {
  getBlockingViolations as getWalesBlockingViolations,
  migrateWalesLegacyFacts,
} from '@/lib/wales/compliance-schema';

// Types and validation
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';

// Analytics and attribution
import { trackWizardStepCompleteWithAttribution } from '@/lib/analytics';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';

// Route types for England, Wales, and Scotland
type EnglandRoute = 'section_8' | 'section_21';
type WalesRoute = 'section_173' | 'fault_based';
type ScotlandRoute = 'notice_to_leave';
type EvictionRoute = EnglandRoute | WalesRoute | ScotlandRoute;

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Route-specific visibility (England only - Wales filters these out)
  routes?: EvictionRoute[];
  // Jurisdiction-specific visibility (for jurisdiction-only sections)
  jurisdiction?: 'england' | 'wales' | 'scotland';
  // Which jurisdictions this section applies to (for multi-jurisdiction sections)
  jurisdictions?: ('england' | 'wales' | 'scotland')[];
  // Validation function to check if section is complete
  isComplete: (facts: WizardFacts, jurisdiction?: 'england' | 'wales' | 'scotland') => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: WizardFacts, jurisdiction?: 'england' | 'wales' | 'scotland') => string[];
  // Check if section has warnings
  hasWarnings?: (facts: WizardFacts, jurisdiction?: 'england' | 'wales' | 'scotland') => string[];
}

// Valid routes by jurisdiction
const ENGLAND_ROUTES = ['section_8', 'section_21'] as const;
const WALES_ROUTES = ['section_173', 'fault_based'] as const;
const SCOTLAND_ROUTES = ['notice_to_leave'] as const;

/**
 * Normalize legacy Wales route values to canonical keys.
 * Handles backward compatibility for sessions saved with 'wales_' prefix.
 * Only applies to Wales routes - England routes pass through unchanged.
 */
const normalizeWalesRoute = (route: string | undefined): string | undefined => {
  if (!route) return route;
  if (route === 'wales_section_173') return 'section_173';
  if (route === 'wales_fault_based') return 'fault_based';
  return route;
};

// Define all sections with their visibility rules
const SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: 'Case Basics',
    description: 'Jurisdiction and eviction route',
    isComplete: (facts, jurisdiction) => {
      const route = facts.eviction_route as string;
      if (!route) return false;
      // England routes
      if (jurisdiction === 'england') {
        return ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]);
      }
      // Wales routes
      if (jurisdiction === 'wales') {
        return WALES_ROUTES.includes(route as typeof WALES_ROUTES[number]);
      }
      // Scotland routes - note: Scotland uses separate SCOTLAND_SECTIONS, but this fallback
      // handles edge cases where case_basics from SECTIONS array could be hit for Scotland
      if (jurisdiction === 'scotland') {
        return SCOTLAND_ROUTES.includes(route as typeof SCOTLAND_ROUTES[number]);
      }
      // Fallback: accept any valid route from any jurisdiction
      return [...ENGLAND_ROUTES, ...WALES_ROUTES, ...SCOTLAND_ROUTES].includes(route as any);
    },
  },
  {
    id: 'parties',
    label: 'Parties',
    description: 'Landlord and tenant details',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_town) &&
      Boolean(facts.landlord_address_postcode) &&
      Boolean(facts.tenant_full_name),
  },
  {
    id: 'property',
    label: 'Property',
    description: 'Property address',
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) &&
      Boolean(facts.property_address_town) &&
      Boolean(facts.property_address_postcode),
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy details and rent',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency) &&
      Boolean(facts.rent_due_day),
  },
  {
    id: 'wales_compliance',
    label: 'Compliance',
    description: 'Wales pre-service compliance requirements',
    // Wales-only section - uses jurisdiction instead of routes to avoid route filtering
    jurisdiction: 'wales',
    isComplete: (facts, jurisdiction) => {
      if (jurisdiction !== 'wales') return true; // Not applicable to England

      const route = facts.eviction_route as string;
      const isFaultBased = route === 'fault_based';

      // Core compliance checks that apply to all Wales routes
      const coreCompliance =
        facts.rent_smart_wales_registered === true &&
        facts.written_statement_provided === true;

      // Deposit compliance (if deposit was taken)
      const depositCompliance =
        facts.deposit_taken !== true ||
        (facts.deposit_protected === true && facts.prescribed_info_served === true);

      // Safeguard checks (must be 'No' to proceed)
      const safeguardCompliance =
        facts.retaliatory_eviction_complaint === false &&
        facts.local_authority_investigation === false;

      // Declaration required
      const declarationComplete = facts.user_declaration === true;

      // For fault-based: check evidence_exists OR derive from actual data
      // This allows completion even before visiting Notice Details tab
      let evidenceCompliance = true;
      if (isFaultBased) {
        // Accept explicit evidence_exists = true
        if (facts.evidence_exists === true) {
          evidenceCompliance = true;
        } else {
          // Auto-derive from actual data: arrears schedule or breach description
          const selectedGrounds = (facts.wales_fault_grounds as string[]) || [];
          const hasArrearsGround = selectedGrounds.includes('rent_arrears_serious') ||
                                   selectedGrounds.includes('rent_arrears_other');
          const arrearsItems = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
          const hasArrearsEvidence = !hasArrearsGround || (Array.isArray(arrearsItems) && arrearsItems.length > 0);
          const hasBreachDescription = Boolean(facts.breach_description);

          // Evidence is sufficient if arrears grounds have schedule AND we have breach description
          evidenceCompliance = hasArrearsEvidence && hasBreachDescription;
        }
      }

      return (
        coreCompliance &&
        depositCompliance &&
        safeguardCompliance &&
        declarationComplete &&
        evidenceCompliance
      );
    },
    hasBlockers: (facts, jurisdiction) => {
      if (jurisdiction !== 'wales') return [];

      // Get all blocking violations from the schema
      const allViolations = getWalesBlockingViolations(facts);

      // Always filter out categories handled by Notice Details tab (WalesNoticeSection)
      // This applies to BOTH section_173 and fault_based routes
      // - fault_based_grounds: Ground selection and arrears validation
      // - breach_evidence: evidence_exists, arrears_amount, arrears_weeks_unpaid (auto-derived)
      const categoriesHandledByNoticeDetails = ['fault_based_grounds', 'breach_evidence'];
      const relevantViolations = allViolations.filter(
        (v) => !categoriesHandledByNoticeDetails.includes(v.field.category)
      );

      return relevantViolations.map((v) => v.message);
    },
  },
  {
    id: 'section21_compliance',
    label: 'Compliance',
    description: 'Compliance requirements for Section 21',
    // Only for England Section 21 - Wales has different requirements
    routes: ['section_21'] as EvictionRoute[],
    isComplete: (facts) => {
      const hasDeposit = facts.deposit_taken === true;
      if (hasDeposit) {
        if (!facts.deposit_protected) return false;
        if (!facts.prescribed_info_served) return false;
      }
      if (!facts.epc_served) return false;
      if (!facts.how_to_rent_served) return false;
      if (facts.has_gas_appliances === true && !facts.gas_safety_cert_served) return false;
      return true;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      if (facts.deposit_taken === true) {
        if (facts.deposit_protected === false) {
          blockers.push('Deposit not protected - Section 21 cannot be used');
        }
        if (facts.prescribed_info_served === false) {
          blockers.push('Prescribed information not served - Section 21 cannot be used');
        }
      }
      if (facts.epc_served === false) {
        blockers.push('EPC not provided - Section 21 cannot be used');
      }
      if (facts.how_to_rent_served === false) {
        blockers.push("'How to Rent' guide not provided - Section 21 cannot be used");
      }
      if (facts.has_gas_appliances === true && facts.gas_safety_cert_served === false) {
        blockers.push('Gas Safety Certificate not provided - Section 21 cannot be used');
      }
      if (facts.licensing_required !== 'not_required' && facts.has_valid_licence === false) {
        blockers.push('Property requires licence but is unlicensed - Section 21 cannot be used');
      }
      return blockers;
    },
  },
  {
    id: 'notice',
    label: 'Notice Details',
    description: 'Grounds and service details',
    isComplete: (facts) => {
      const route = facts.eviction_route as string;

      // Wales: Section 173 (no-fault) - requires service method and date
      if (route === 'section_173') {
        const hasServiceMethod = Boolean(facts.notice_service_method);
        const hasServiceDate = Boolean(facts.notice_date || facts.notice_service_date);
        return hasServiceMethod && hasServiceDate;
      }

      // Wales: Fault-based - requires grounds, breach description, service method, and date
      if (route === 'fault_based') {
        const walesGrounds = (facts.wales_fault_grounds as string[]) || [];
        const hasGrounds = walesGrounds.length > 0;
        const hasBreachDescription = Boolean(facts.breach_description);
        const hasServiceMethod = Boolean(facts.notice_service_method);
        const hasServiceDate = Boolean(facts.notice_date || facts.notice_service_date);
        return hasGrounds && hasBreachDescription && hasServiceMethod && hasServiceDate;
      }

      // England: Section 21 - just need to confirm service method
      if (route === 'section_21') {
        return Boolean(facts.notice_service_method);
      }

      // England: Section 8 - need grounds selected + service method
      if (route === 'section_8') {
        const selectedGrounds = (facts.section8_grounds as string[]) || [];
        return selectedGrounds.length > 0 && Boolean(facts.notice_service_method);
      }

      return false;
    },
  },
  {
    id: 'section8_arrears',
    label: 'Arrears',
    description: 'Rent arrears breakdown for Section 8',
    // Only for England Section 8 - Wales arrears is handled inline in WalesNoticeSection
    routes: ['section_8'] as EvictionRoute[],
    isComplete: (facts) => {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasArrearsGround = selectedGrounds.some((g) =>
        ['Ground 8', 'Ground 10', 'Ground 11'].some((ag) => g.includes(ag))
      );

      if (!hasArrearsGround) return true;

      const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
      const hasArrearsItems = Array.isArray(arrearsItems) && arrearsItems.length > 0;
      const hasParticulars = Boolean(facts.section8_details);

      return hasArrearsItems && hasParticulars;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasGround8 = selectedGrounds.some((g) => g.includes('Ground 8'));

      if (hasGround8) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
        const rentAmount = facts.rent_amount || 0;
        const rentFrequency = facts.rent_frequency || 'monthly';

        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          blockers.push('Ground 8 requires a detailed arrears schedule');
        } else {
          const validation = validateGround8Eligibility({
            arrears_items: arrearsItems,
            rent_amount: rentAmount,
            rent_frequency: rentFrequency,
            jurisdiction: 'england',
          });

          if (!validation.is_eligible) {
            blockers.push(
              `Ground 8 threshold not met: ${validation.arrears_in_months?.toFixed(2) || 0} months arrears (minimum 2 months required)`
            );
          }
        }
      }
      return blockers;
    },
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate notice',
    isComplete: () => false, // Always navigable
  },
];

// Scotland-specific sections for notice_only
// ALL GROUNDS IN SCOTLAND ARE DISCRETIONARY - no mandatory/discretionary split
const SCOTLAND_SECTIONS: WizardSection[] = [
  {
    id: 'scotland_basics',
    label: 'Case Basics',
    description: 'Private Residential Tenancy (Scotland)',
    jurisdiction: 'scotland',
    isComplete: () => true, // Auto-complete as Scotland is pre-selected
  },
  {
    id: 'parties',
    label: 'Parties',
    description: 'Landlord and tenant details',
    jurisdiction: 'scotland',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_town) &&
      Boolean(facts.landlord_address_postcode) &&
      Boolean(facts.tenant_full_name),
  },
  {
    id: 'property',
    label: 'Property',
    description: 'Property address',
    jurisdiction: 'scotland',
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) &&
      Boolean(facts.property_address_town) &&
      Boolean(facts.property_address_postcode),
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy details and rent',
    jurisdiction: 'scotland',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency),
    hasWarnings: (facts) => {
      const warnings: string[] = [];
      // Check 6-month rule
      if (facts.tenancy_start_date) {
        const validation = validateSixMonthRule(facts.tenancy_start_date as string);
        if (!validation.valid && validation.message) {
          warnings.push(validation.message);
        }
      }
      return warnings;
    },
  },
  {
    id: 'scotland_compliance',
    label: 'Compliance',
    description: 'Landlord registration and compliance checks',
    jurisdiction: 'scotland',
    isComplete: (facts) => {
      // Core requirements: landlord registration must be answered
      if (facts.landlord_registered === undefined) return false;

      // Deposit compliance (if deposit was taken)
      const depositTaken = facts.deposit_taken === true;
      if (depositTaken) {
        if (facts.deposit_protected === undefined) return false;
        if (facts.deposit_protected === true && !facts.deposit_scheme_name) return false;
      }

      // Gas safety (if gas appliances)
      const hasGas = facts.has_gas_appliances === true;
      if (hasGas && facts.gas_safety_cert_served === undefined) return false;

      // EPC and EICR
      if (facts.epc_served === undefined) return false;
      if (facts.eicr_served === undefined) return false;

      // Repairing standard
      if (facts.repairing_standard_met === undefined) return false;

      // HMO (if applicable)
      if (facts.is_hmo === true && facts.hmo_licensed === undefined) return false;

      return true;
    },
    hasWarnings: (facts) => {
      const warnings: string[] = [];

      // Landlord not registered
      if (facts.landlord_registered === false) {
        warnings.push('Unregistered landlords may face penalties and tribunal may view case unfavourably.');
      }

      // Deposit not protected
      if (facts.deposit_taken === true && facts.deposit_protected === false) {
        warnings.push('Unprotected deposit may result in penalties up to 3x deposit amount.');
      }

      // Gas safety missing
      if (facts.has_gas_appliances === true && facts.gas_safety_cert_served === false) {
        warnings.push('Missing gas safety certificate is a serious compliance issue.');
      }

      // EPC missing
      if (facts.epc_served === false) {
        warnings.push('Missing EPC can result in fines.');
      }

      // EICR missing
      if (facts.eicr_served === false) {
        warnings.push('Missing EICR can result in fines up to £5,000.');
      }

      // Repairing standard not met
      if (facts.repairing_standard_met === false) {
        warnings.push('Property not meeting repairing standard may face enforcement action.');
      }

      // HMO not licensed
      if (facts.is_hmo === true && facts.hmo_licensed === false) {
        warnings.push('Operating an unlicensed HMO can result in fines.');
      }

      return warnings;
    },
  },
  {
    id: 'scotland_grounds',
    label: 'Grounds',
    description: 'Select eviction ground (all discretionary)',
    jurisdiction: 'scotland',
    isComplete: (facts) => Boolean(facts.scotland_eviction_ground),
    hasWarnings: () => [
      'All grounds in Scotland are discretionary. The First-tier Tribunal may refuse eviction even if grounds are proven.',
    ],
  },
  {
    id: 'scotland_notice',
    label: 'Notice',
    description: 'Notice to Leave details',
    jurisdiction: 'scotland',
    isComplete: (facts) => {
      // Scotland notice_only is GENERATE ONLY - no notice_already_served question
      // Only require notice_service_method for generation
      if (!Boolean(facts.notice_service_method)) return false;

      // For Ground 18 (rent arrears), require arrears schedule
      const SCOTLAND_RENT_ARREARS_GROUND = 18;
      if (facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          return false;
        }
      }

      return true;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      // 6-month rule blocker
      if (facts.tenancy_start_date) {
        const validation = validateSixMonthRule(facts.tenancy_start_date as string);
        if (!validation.valid && validation.message) {
          blockers.push(validation.message);
        }
      }
      return blockers;
    },
    hasWarnings: (facts) => {
      const warnings: string[] = [];
      // Warn if Ground 18 is selected but arrears schedule is missing or consecutive threshold not met
      const SCOTLAND_RENT_ARREARS_GROUND = 18;
      if (facts.scotland_eviction_ground === SCOTLAND_RENT_ARREARS_GROUND) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          warnings.push('Ground 18 requires a rent arrears schedule. Please complete the arrears schedule above.');
        } else {
          // Check if consecutive threshold is met (3 consecutive rent periods with arrears)
          const streakResult = calculateConsecutiveArrearsStreak(arrearsItems);
          const { maxConsecutiveStreak, periodsWithArrears } = streakResult;
          if (maxConsecutiveStreak < 3) {
            if (periodsWithArrears >= 3 && maxConsecutiveStreak < 3) {
              // User has enough periods but they're not consecutive
              warnings.push(
                `Ground 18 requires 3+ consecutive rent periods of arrears. Currently showing ${maxConsecutiveStreak} consecutive rent period(s) with arrears (${periodsWithArrears} total periods with arrears).`
              );
            } else {
              warnings.push(
                `Ground 18 requires 3+ consecutive rent periods of arrears. Currently showing ${maxConsecutiveStreak} consecutive rent period(s) with arrears.`
              );
            }
          }
        }
      }
      return warnings;
    },
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate notice',
    jurisdiction: 'scotland',
    isComplete: () => false, // Always navigable for final review
  },
];

// Helper to get sections based on jurisdiction
function getSectionsForJurisdiction(jurisdiction: 'england' | 'wales' | 'scotland'): WizardSection[] {
  if (jurisdiction === 'scotland') {
    return SCOTLAND_SECTIONS;
  }
  return SECTIONS;
}

interface NoticeOnlySectionFlowProps {
  caseId: string;
  jurisdiction: 'england' | 'wales' | 'scotland';
  initialFacts?: WizardFacts;
}

export const NoticeOnlySectionFlow: React.FC<NoticeOnlySectionFlowProps> = ({
  caseId,
  jurisdiction,
  initialFacts,
}) => {
  const router = useRouter();

  // State
  const [facts, setFacts] = useState<WizardFacts>(
    initialFacts || { __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction } }
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  // Track the current question ID for Ask Heaven contextual help
  const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(undefined);

  // Debounce ref for save operations to prevent excessive API calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFactsRef = useRef<WizardFacts | null>(null);

  // Load existing facts on mount
  useEffect(() => {
    const loadFacts = async () => {
      try {
        setLoading(true);
        const loadedFacts = await getCaseFacts(caseId);
        if (loadedFacts && Object.keys(loadedFacts).length > 0) {
          // FIX FOR ISSUE C: Apply legacy migration for Wales notice_only cases
          // This handles old cases with different fact keys and normalizes data structures
          let migratedFacts = migrateWalesLegacyFacts(
            loadedFacts,
            jurisdiction,
            'notice_only'
          );

          // Scotland notice_only backward compatibility migration:
          // Scotland notice_only is now GENERATE ONLY - we no longer ask "Have you already served?"
          // Old cases may have notice_already_served=true saved. We need to unset it so the
          // generate-only flow works correctly. The value is no longer used for Scotland notice_only.
          if (jurisdiction === 'scotland') {
            const { notice_already_served, notice_served_date, ...restFacts } = migratedFacts as Record<string, any>;
            // Remove already-served related fields - they no longer apply to Scotland notice_only
            migratedFacts = restFacts as typeof migratedFacts;
          }

          setFacts((prev) => ({
            ...prev,
            ...migratedFacts,
            __meta: {
              ...prev.__meta,
              ...(migratedFacts as Record<string, any>).__meta,
              product: 'notice_only',
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
  }, [caseId, jurisdiction]);

  // Get visible sections based on jurisdiction and eviction route
  const visibleSections = useMemo(() => {
    const isWales = jurisdiction === 'wales';
    const isScotland = jurisdiction === 'scotland';

    // Scotland uses different sections entirely - no route-based filtering needed
    if (isScotland) {
      return getSectionsForJurisdiction('scotland');
    }

    // Normalize route for Wales to handle legacy prefixed values (wales_section_173 -> section_173)
    const rawRoute = facts.eviction_route as string | undefined;
    const route = isWales ? normalizeWalesRoute(rawRoute) : rawRoute;

    // Determine if route is valid for this jurisdiction
    const hasValidRoute = isWales
      ? route && WALES_ROUTES.includes(route as typeof WALES_ROUTES[number])
      : route && ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]);

    const filteredSections = SECTIONS.filter((section) => {
      // Route-specific sections (S21 compliance, S8 arrears) only apply to England
      if (section.routes) {
        // Wales doesn't use these England-specific sections
        if (isWales) return false;
        // England: only show if route matches
        if (!route) return false;
        return section.routes.includes(route as EvictionRoute);
      }

      // Jurisdiction-specific sections (e.g., Wales compliance)
      if (section.jurisdiction) {
        // Only show if jurisdiction matches
        if (section.jurisdiction !== jurisdiction) return false;
        // Also require valid route to be selected before showing
        if (!hasValidRoute) return false;
        return true;
      }

      // Non-route-specific sections: show case_basics always, others once route is valid
      if (!hasValidRoute) return section.id === 'case_basics';
      return true;
    });

    // Override labels for Wales jurisdiction
    if (isWales) {
      return filteredSections.map((section) => {
        if (section.id === 'tenancy') {
          return {
            ...section,
            label: 'Occupation Contract',
            description: 'Contract details and rent',
          };
        }
        if (section.id === 'notice') {
          return {
            ...section,
            label: 'Notice Details',
            description: route === 'section_173'
              ? 'Section 173 notice service'
              : 'Fault-based notice and grounds',
          };
        }
        return section;
      });
    }

    return filteredSections;
  }, [jurisdiction, facts.eviction_route]);

  const currentSection = visibleSections[currentSectionIndex];

  // Save facts to backend
  const saveFactsToServer = useCallback(
    async (updatedFacts: WizardFacts) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'eviction',
          product: 'notice_only',
        });
      } catch (err) {
        console.error('Failed to save facts:', err);
        setError('Failed to save. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [caseId, jurisdiction]
  );

  // P0-2 FIX: Retry save handler - allows users to retry failed saves
  const handleRetrySave = useCallback(() => {
    // Retry with current facts state
    saveFactsToServer(facts);
  }, [facts, saveFactsToServer]);

  // Update facts and save with debouncing to prevent excessive API calls
  const handleUpdate = useCallback(
    (updates: Record<string, any>) => {
      const updatedFacts = { ...facts, ...updates };
      setFacts(updatedFacts);

      // Store the latest facts to save
      pendingFactsRef.current = updatedFacts;

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
    [facts, saveFactsToServer]
  );

  // Cleanup debounce timeout on unmount and flush pending saves
  // FIX: Previously only cleared timeout without flushing, causing data loss
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

  // Flush pending saves when tab becomes hidden (prevents data loss on tab close)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pendingFactsRef.current) {
        // Flush immediately when tab is hidden
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveFactsToServer(pendingFactsRef.current);
        pendingFactsRef.current = null;
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
      if (current && current.isComplete(facts, jurisdiction)) {
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id);
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: 'notice_only',
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
  }, [currentSectionIndex, visibleSections, facts, jurisdiction]);

  // Navigate to previous section
  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  // Jump to specific section
  const handleJumpToSection = useCallback(
    (sectionId: string) => {
      const index = visibleSections.findIndex((s) => s.id === sectionId);
      if (index >= 0) {
        setCurrentSectionIndex(index);
      }
    },
    [visibleSections]
  );

  // Generate notice - navigate to review page for analysis before payment
  const handleGenerateNotice = useCallback(async () => {
    try {
      setGenerating(true);
      setError(null);

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
            caseType: 'eviction',
            product: 'notice_only',
          });
          pendingFactsRef.current = null;
          console.log('[Wizard] Pending facts flushed successfully before navigation to review');
        } catch (err) {
          console.error('[Wizard] Failed to flush pending facts before navigation:', err);
          // Continue with navigation even if save fails - user can retry from review page
        }
      }

      // Navigate to review page for compliance analysis
      router.push(`/wizard/review?case_id=${caseId}&product=notice_only`);
    } catch (err) {
      console.error('Failed to generate notice:', err);
      setError('Failed to generate notice. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [caseId, jurisdiction, router]);

  // Calculate progress
  const completedCount = visibleSections.filter((s) => s.isComplete(facts, jurisdiction)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = currentSection?.hasBlockers?.(facts, jurisdiction) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts) || [];

  // Check if all required sections are complete
  const allComplete = visibleSections
    .filter((s) => s.id !== 'review')
    .every((s) => s.isComplete(facts, jurisdiction));

  // Get overall blockers
  const getAllBlockers = useCallback(() => {
    const allBlockers: string[] = [];
    for (const section of visibleSections) {
      const sectionBlockers = section.hasBlockers?.(facts, jurisdiction) || [];
      allBlockers.push(...sectionBlockers);
    }
    return allBlockers;
  }, [visibleSections, facts, jurisdiction]);

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    const sectionProps = {
      facts,
      jurisdiction,
      onUpdate: handleUpdate,
    };

    const isWales = jurisdiction === 'wales';
    const isScotland = jurisdiction === 'scotland';

    // Type-narrowed props for England/Wales sections
    const englandWalesProps = {
      facts,
      jurisdiction: jurisdiction as 'england' | 'wales',
      onUpdate: handleUpdate,
    };

    switch (currentSection.id) {
      // Scotland-specific sections
      case 'scotland_basics':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800">Private Residential Tenancy (Scotland)</h4>
              <p className="text-blue-700 text-sm mt-2">
                This wizard is configured for Scottish law under the Private Housing (Tenancies) (Scotland) Act 2016.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800">Important: All Grounds are Discretionary</h4>
              <p className="text-amber-700 text-sm mt-2">
                Unlike England, Scotland has <strong>no mandatory grounds</strong> for eviction.
                The First-tier Tribunal has discretion on all grounds and may refuse eviction
                even if you prove your case.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">6-Month Rule</h4>
              <p className="text-gray-700 text-sm mt-2">
                A Notice to Leave cannot be served within the first 6 months of the tenancy.
                We will check this when you enter your tenancy details.
              </p>
            </div>
          </div>
        );
      case 'scotland_compliance':
        return <ScotlandComplianceSection facts={facts} onUpdate={handleUpdate} onSetCurrentQuestionId={setCurrentQuestionId} />;
      case 'scotland_grounds':
        return <ScotlandGroundsSection facts={facts} onUpdate={handleUpdate} onSetCurrentQuestionId={setCurrentQuestionId} caseId={caseId} />;
      case 'scotland_notice':
        return <ScotlandNoticeSection facts={facts} onUpdate={handleUpdate} onSetCurrentQuestionId={setCurrentQuestionId} caseId={caseId} />;

      // England/Wales sections
      case 'case_basics':
        // Use Wales-specific or England-specific case basics
        if (isWales) {
          return <WalesCaseBasicsSection {...englandWalesProps} />;
        }
        return <CaseBasicsSection {...englandWalesProps} />;
      case 'parties':
        // Scotland uses the same Parties section - pass actual jurisdiction for type safety
        if (isScotland) {
          return <PartiesSection facts={facts} jurisdiction="scotland" onUpdate={handleUpdate} />;
        }
        return <PartiesSection {...englandWalesProps} />;
      case 'property':
        // Scotland uses the same Property section - pass actual jurisdiction for type safety
        if (isScotland) {
          return <PropertySection facts={facts} jurisdiction="scotland" onUpdate={handleUpdate} />;
        }
        return <PropertySection {...englandWalesProps} />;
      case 'tenancy':
        // Scotland uses TenancySection, Wales uses OccupationContractSection, England uses TenancySection
        if (isScotland) {
          return <TenancySection facts={facts} jurisdiction="scotland" onUpdate={handleUpdate} />;
        }
        return isWales
          ? <OccupationContractSection {...englandWalesProps} />
          : <TenancySection {...englandWalesProps} />;
      case 'wales_compliance':
        // Wales-only compliance section
        return <WalesComplianceSection {...englandWalesProps} onSetCurrentQuestionId={setCurrentQuestionId} />;
      case 'section21_compliance':
        return <Section21ComplianceSection {...englandWalesProps} />;
      case 'section8_arrears':
        return <Section8ArrearsSection {...englandWalesProps} />;
      case 'notice':
        // Wales uses WalesNoticeSection, England uses NoticeSection
        return isWales
          ? <WalesNoticeSection {...englandWalesProps} mode="notice_only" />
          : <NoticeSection {...englandWalesProps} mode="notice_only" />;
      case 'review':
        return renderReviewSection();
      default:
        return <div>Unknown section: {currentSection.id}</div>;
    }
  };

  // Render review section
  const renderReviewSection = () => {
    const overallBlockers = getAllBlockers();
    const incompleteRequiredSections = visibleSections
      .filter((s) => s.id !== 'review' && !s.isComplete(facts, jurisdiction))
      .map((s) => s.label);

    return (
      <div className="space-y-6">
        {/* Completion status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Section Completion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleSections
              .filter((s) => s.id !== 'review')
              .map((section) => {
                const complete = section.isComplete(facts, jurisdiction);
                const blockers = section.hasBlockers?.(facts, jurisdiction) || [];
                const hasBlocker = blockers.length > 0;

                return (
                  <button
                    key={section.id}
                    onClick={() => handleJumpToSection(section.id)}
                    className="flex items-center justify-between p-3 rounded-lg border text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {complete && !hasBlocker ? (
                        <RiCheckLine className="w-5 h-5 text-green-500" />
                      ) : hasBlocker ? (
                        <RiErrorWarningLine className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="font-medium text-gray-900">{section.label}</span>
                    </div>
                    <RiArrowRightSLine className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })}
          </div>
        </div>

        {/* Blockers */}
        {overallBlockers.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">Issues to Resolve</h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {overallBlockers.map((blocker, i) => (
                <li key={i}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Incomplete sections */}
        {incompleteRequiredSections.length > 0 && overallBlockers.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Incomplete Sections</h3>
            <p className="text-sm text-amber-700">
              Please complete: {incompleteRequiredSections.join(', ')}
            </p>
          </div>
        )}

        {/* Ready to generate */}
        {allComplete && overallBlockers.length === 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-2">Ready to Generate</h3>
            <p className="text-sm text-green-700">
              All sections are complete. Click the button below to generate your notice.
            </p>
          </div>
        )}

        {/* Notice type summary */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Notice Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Type:</strong>{' '}
              {(() => {
                // Scotland routes
                if (jurisdiction === 'scotland') {
                  return 'Notice to Leave (Scotland)';
                }
                // Wales routes
                if (jurisdiction === 'wales') {
                  if (facts.eviction_route === 'section_173') {
                    return 'Section 173 (No-fault)';
                  } else if (facts.eviction_route === 'fault_based') {
                    return 'Fault-based (breach grounds)';
                  }
                  return 'Wales notice';
                }
                // England routes
                return facts.eviction_route === 'section_21'
                  ? 'Section 21 (No-Fault)'
                  : 'Section 8 (Fault-Based)';
              })()}
            </p>
            <p>
              <strong>Jurisdiction:</strong>{' '}
              {jurisdiction === 'england' ? 'England' : jurisdiction === 'wales' ? 'Wales' : 'Scotland'}
            </p>
            {/* England Section 8 grounds */}
            {jurisdiction === 'england' && facts.eviction_route === 'section_8' && (
              <p>
                <strong>Grounds:</strong>{' '}
                {((facts.section8_grounds as string[]) || []).join(', ') || 'Not selected'}
              </p>
            )}
            {/* Wales fault-based grounds */}
            {jurisdiction === 'wales' && facts.eviction_route === 'fault_based' && (
              <p>
                <strong>Grounds:</strong>{' '}
                {((facts.wales_fault_grounds as string[]) || []).join(', ') || 'Not selected'}
              </p>
            )}
            {/* Scotland grounds */}
            {jurisdiction === 'scotland' && facts.scotland_eviction_ground && (
              <p>
                <strong>Ground:</strong> Ground {facts.scotland_eviction_ground}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
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
              {jurisdiction === 'scotland'
                ? 'Scotland Notice to Leave'
                : `${jurisdiction === 'england' ? 'England' : 'Wales'} Eviction Notice`}
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
              const isComplete = section.isComplete(facts, jurisdiction);
              const isCurrent = index === currentSectionIndex;
              const hasBlocker = (section.hasBlockers?.(facts, jurisdiction) || []).length > 0;

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
          {/* P0-2 FIX: Error banner with retry button */}
          {error && (
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
          )}

          {/* Current section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{currentSection?.label}</h2>
              <p className="text-sm text-gray-500 mt-1">{currentSection?.description}</p>
            </div>

            {/* Blockers */}
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

            {/* Warnings */}
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
                ${
                  currentSectionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              ← Back
            </button>

            <div className="flex items-center gap-2">
              {saving && <span className="text-sm text-gray-500">Saving...</span>}

              {currentSection?.id === 'review' ? (
                <button
                  onClick={handleGenerateNotice}
                  disabled={!allComplete || getAllBlockers().length > 0 || generating}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      !allComplete || getAllBlockers().length > 0 || generating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  {generating ? 'Generating...' : 'Generate Notice'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentSectionIndex === visibleSections.length - 1}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md transition-colors
                    ${
                      currentSectionIndex === visibleSections.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                    }
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
              caseType="eviction"
              jurisdiction={jurisdiction}
              product="notice_only"
              currentQuestionId={currentQuestionId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NoticeOnlySectionFlow;
