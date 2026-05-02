/**
 * Eviction Section Flow - England, Wales & Scotland Complete Pack
 *
 * Redesigned wizard for eviction complete packs following a logical,
 * court-ready, jurisdiction-aware flow.
 *
 * Flow Structure (England/Wales):
 * 1. Case Basics - England Form 3A possession route and court-pack summary
 * 2. Parties - Landlord(s) and Tenant(s) with joint support
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency, due day
 * 5. Notice - Reuses notice-only schema, served date, service method, expiry
 * 6. Section 8 Arrears - arrears-led and grounds support using ArrearsScheduleStep
 * 7. Evidence - service proof, chronology, and supporting records
 * 8. Court & Signing - Court name, signatory details
 * 9. Review - Blockers, warnings, generated documents
 *
 * Flow Structure (Scotland):
 * 1. Case Basics - Jurisdiction (Scotland, PRT)
 * 2. Parties - Landlord(s) and Tenant(s)
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency (6-month rule validation)
 * 5. Grounds - Select eviction ground (ALL discretionary in Scotland)
 * 6. Notice - Notice to Leave details (6-month rule enforced)
 * 7. Evidence - tribunal confirmations and supporting records
 * 8. Tribunal - First-tier Tribunal info and signatory
 * 9. Review - Blockers, warnings, generated documents
 *
 * Scotland-specific rules:
 * - NO MANDATORY GROUNDS - All 18 grounds are discretionary
 * - 6-MONTH RULE - Notice cannot be served within first 6 months
 * - NOTICE PERIODS - 28 or 84 days from config (not hardcoded)
 * - TRIBUNAL - First-tier Tribunal, not county courts
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WizardFlowShell } from '@/components/wizard/shared/WizardFlowShell';
import { WizardShellV3 } from '@/components/wizard/shared/WizardShellV3';
import { EnglandPossessionWorkspaceShell } from '@/components/wizard/shared/EnglandPossessionWorkspaceShell';
import { isWizardUiV3Enabled } from '@/components/wizard/shared/flags';

import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';
import type { SmartReviewWarningItem, SmartReviewSummary } from '@/components/wizard/SmartReviewPanel';

// Section components
import { CaseBasicsSection } from '../sections/eviction/CaseBasicsSection';
import { PartiesSection } from '../sections/eviction/PartiesSection';
import { PropertySection } from '../sections/eviction/PropertySection';
import { TenancySection } from '../sections/eviction/TenancySection';
import { NoticeSection } from '../sections/eviction/NoticeSection';
import { GroundDetailsSection } from '../sections/eviction/GroundDetailsSection';
import { Section8ArrearsSection } from '../sections/eviction/Section8ArrearsSection';
import { EvidenceSection } from '../sections/eviction/EvidenceSection';
import { CourtSigningSection } from '../sections/eviction/CourtSigningSection';
import { ReviewSection } from '../sections/eviction/ReviewSection';

// Scotland-specific sections
import { ScotlandGroundsSection } from '../sections/eviction/ScotlandGroundsSection';
import { ScotlandNoticeSection } from '../sections/eviction/ScotlandNoticeSection';
import { ScotlandTribunalSection } from '../sections/eviction/ScotlandTribunalSection';

// Scotland utilities
import { validateSixMonthRule } from '@/lib/scotland/grounds';
import {
  getEnglandGroundDefinition,
  normalizeEnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

// Types and validation
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';

// Analytics and attribution
import { trackWizardStepCompleteWithAttribution } from '@/lib/analytics';
import { normalizeWizardStep } from '@/lib/analytics/wizard-step-taxonomy';
import { getWizardAttribution, markStepCompleted } from '@/lib/wizard/wizardAttribution';
import { hasCompleteDefenceRiskAnswers } from '@/lib/england-possession/defence-risk';
import { getSelectedGroundDetailPanels, hasSelectedGroundDetailPanels } from '../sections/eviction/ground-detail-config';

// Validation context for live field validation
import { ValidationProvider, useValidationContext } from '@/components/wizard/ValidationContext';

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Route-specific visibility (England/Wales only)
  routes?: ('section_8')[];
  // Jurisdiction-specific visibility
  jurisdictions?: ('england' | 'wales' | 'scotland')[];
  // Validation function to check if section is complete
  isComplete: (facts: WizardFacts, jurisdiction?: string) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: WizardFacts, jurisdiction?: string) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: WizardFacts, jurisdiction?: string) => string[];
}

function hasCompleteCollectibleN215Facts(facts: WizardFacts): boolean {
  const serviceMethod = String(facts.notice_service_method || '').trim();
  const serviceLocation = String(facts.notice_service_location || 'usual_residence').trim();

  if (serviceMethod === 'email' && !String(facts.notice_service_recipient_email || facts.tenant_email || '').trim()) {
    return false;
  }

  if (serviceLocation === 'other' && !String(facts.notice_service_location_other || '').trim()) {
    return false;
  }

  return true;
}

// Define all sections with their visibility rules
// These sections apply to England and Wales
// Valid routes by jurisdiction
const ENGLAND_ROUTES = ['section_8'] as const;
const WALES_ROUTES = ['section_173', 'fault_based'] as const;

const ENGLAND_WALES_SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: "What's going on?",
    description: 'Pick the main reason you need possession. You can confirm the legal grounds next.',
    jurisdictions: ['england', 'wales'],
    isComplete: (facts, jurisdiction) => {
      const route = facts.eviction_route as string;
      if (!route) return false;

      // Validate route is appropriate for jurisdiction
      if (jurisdiction === 'wales') {
        return WALES_ROUTES.includes(route as typeof WALES_ROUTES[number]);
      }
      return ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]) && Boolean(facts.england_primary_issue);
    },
  },
  {
    id: 'parties',
    label: 'Who and where?',
    description: 'Landlord, tenant, and notice service details',
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
    description: 'The property address used across the notice and court papers',
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) &&
      Boolean(facts.property_address_town) &&
      Boolean(facts.property_address_postcode),
  },
  {
    id: 'tenancy',
    label: 'Tenancy details',
    description: 'Tenancy dates, rent, and how rent is paid',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency) &&
      Boolean(facts.rent_due_day),
  },
  {
    id: 'notice',
    label: 'When will you serve?',
    description: 'Notice date, service method, and N215 details before the claim is prepared',
    isComplete: (facts) => {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const requiresPriorNoticeConfirmation = selectedGrounds.some((ground) => {
        const normalized = normalizeEnglandGroundCode(ground);
        return normalized ? getEnglandGroundDefinition(normalized)?.requiresPriorNotice === true : false;
      });

      // Must answer the gating question first
      if (facts.notice_already_served === undefined) return false;

      // If already served: require served date and service method
      // If generating: subflow populates notice_served_date and notice_service_method on completion
      return (
        Boolean(facts.notice_served_date) &&
        Boolean(facts.notice_service_method) &&
        hasCompleteCollectibleN215Facts(facts) &&
        (!requiresPriorNoticeConfirmation || facts.ground_prerequisite_notice_served !== undefined)
      );
    },
  },
  {
    id: 'ground_details',
    label: 'Ground details',
    description: 'The facts and evidence behind any specialist grounds you selected',
    routes: ['section_8'],
    isComplete: (facts) => {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasSpecialistGrounds = hasSelectedGroundDetailPanels(selectedGrounds);
      if (!hasSpecialistGrounds) return true;

      const panels = getSelectedGroundDetailPanels(selectedGrounds);
      return panels.every((panel) =>
        panel.fields.some((field) => Boolean(String((facts as Record<string, any>)[field.field] || '').trim()))
      );
    },
  },
  {
    id: 'section8_arrears',
    label: 'About the arrears',
    description: 'Arrears details and supporting facts for Section 8 where needed',
    routes: ['section_8'],
    isComplete: (facts) => {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasSelectedGrounds = selectedGrounds.length > 0;
      const hasArrearsGround = selectedGrounds.some((g) =>
        ['Ground 8', 'Ground 10', 'Ground 11'].some((ag) => g.includes(ag))
      );
      const hasParticulars = Boolean(String(facts.section8_details || '').trim());

      if (!hasSelectedGrounds) return false;

      if (!hasArrearsGround) return hasParticulars;

      // Must have arrears items
      const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
      const hasArrearsItems = Array.isArray(arrearsItems) && arrearsItems.length > 0;

      return hasArrearsItems && hasParticulars;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasGround8 = selectedGrounds.some((g) => g.includes('Ground 8'));

      if (hasGround8) {
        // Ground 8 requires the post-1 May 2026 statutory arrears threshold
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
              `Ground 8 threshold not met: ${validation.arrears_in_months?.toFixed(2) || 0} months arrears (minimum ${validation.threshold_label || '3 months'} required)`
            );
          }
        }
      }
      return blockers;
    },
  },
  {
    id: 'evidence',
    label: 'Evidence summary',
    description: 'Service proof, chronology, supporting records, and final checks before court',
    isComplete: (facts) => {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const requiresPriorNoticeConfirmation = selectedGrounds.some((ground) => {
        const normalized = normalizeEnglandGroundCode(ground);
        return normalized ? getEnglandGroundDefinition(normalized)?.requiresPriorNotice === true : false;
      });

      const depositTaken = facts.deposit_taken === true;
      const epcProvided = facts.epc_served ?? facts.epc_provided;
      const howToRentProvided = facts.how_to_rent_served ?? facts.how_to_rent_provided;
      const hasGasAppliances = facts.has_gas_appliances;
      const gasSafetyProvided = facts.gas_safety_cert_served ?? facts.gas_safety_cert_provided;
      const depositQuestionsComplete =
        facts.deposit_taken !== undefined &&
        (!depositTaken ||
          (facts.deposit_protected !== undefined &&
            facts.deposit_protected_within_30_days !== undefined &&
            facts.prescribed_info_served !== undefined &&
            facts.deposit_returned !== undefined));
      const propertyComplianceQuestionsComplete =
        epcProvided !== undefined &&
        howToRentProvided !== undefined &&
        hasGasAppliances !== undefined &&
        (hasGasAppliances !== true || gasSafetyProvided !== undefined);

      return (
        Boolean(facts.evidence?.notice_service_description?.trim()) &&
        facts.communication_timeline?.total_attempts !== undefined &&
        facts.communication_timeline?.total_attempts !== null &&
        Boolean(facts.communication_timeline?.tenant_responsiveness) &&
        Boolean(facts.evidence_reviewed) &&
        facts.section_16e_duties_checked !== undefined &&
        facts.breathing_space_checked !== undefined &&
        (facts.breathing_space_checked !== true || facts.tenant_in_breathing_space !== undefined) &&
        facts.evidence_bundle_ready !== undefined &&
        (!requiresPriorNoticeConfirmation || facts.ground_prerequisite_notice_served !== undefined) &&
        depositQuestionsComplete &&
        propertyComplianceQuestionsComplete &&
        hasCompleteDefenceRiskAnswers(facts as Record<string, any>, {
          requireArrearsContext: selectedGrounds.some((ground) =>
            ['Ground 8', 'Ground 10', 'Ground 11'].some((arrearsGround) => ground.includes(arrearsGround))
          ),
        })
      );
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];

      if (facts.section_16e_duties_checked === false) {
        blockers.push('You must confirm the section 16E landlord duties have been checked before serving or filing.');
      }

      if (facts.breathing_space_checked === false) {
        blockers.push('You must check whether the tenant is in a Debt Respite Scheme breathing space before proceeding.');
      }

      if (facts.tenant_in_breathing_space === true) {
        blockers.push('The tenant is marked as being in an active breathing space, so the possession route should not proceed yet.');
      }

      if (facts.evidence_bundle_ready === false) {
        blockers.push('The complete pack needs the supporting records and readiness confirmations to be in place before generation.');
      }

      const depositTaken = facts.deposit_taken === true;
      const depositResolved = facts.deposit_returned === true;

      if (depositTaken && !depositResolved && facts.deposit_protected === false) {
        blockers.push('Deposit protection still needs to be cured or the deposit returned before the possession file is relied on.');
      }

      if (depositTaken && !depositResolved && facts.deposit_protected_within_30_days === false) {
        blockers.push('Late deposit protection still needs to be resolved or the deposit returned before relying on these grounds.');
      }

      if (depositTaken && !depositResolved && facts.prescribed_info_served === false) {
        blockers.push('Prescribed information still needs to be cured or the deposit returned before relying on these grounds.');
      }

      return blockers;
    },
    hasWarnings: (facts) => {
      const warnings: string[] = [];

      const epcProvided = facts.epc_served ?? facts.epc_provided;
      const howToRentProvided = facts.how_to_rent_served ?? facts.how_to_rent_provided;
      const hasGasAppliances = facts.has_gas_appliances;
      const gasSafetyProvided = facts.gas_safety_cert_served ?? facts.gas_safety_cert_provided;

      if (epcProvided === false) {
        warnings.push('EPC is currently marked as not provided. That does not automatically block a Form 3A route, but it weakens the wider compliance story if challenged.');
      }

      if (howToRentProvided === false) {
        warnings.push("The file currently records that the How to Rent guide was not given. That should be treated as a compliance risk and explained if the tenant raises it.");
      }

      if (hasGasAppliances === true && gasSafetyProvided === false) {
        warnings.push('The property has gas appliances but the gas safety certificate is currently marked as not provided. That should be corrected or explained before the case reaches court.');
      }

      if (!String(facts.communication_timeline?.log || '').trim()) {
        warnings.push('No extra chronology notes have been added. The generated chronology will still be used, but add incident detail here if the case has unusual facts or a non-arrears breach story.');
      }

      return warnings;
    },
  },
  {
    id: 'court_signing',
    label: 'Prepare your court claim',
    description: 'Court details, signing details, and the claim forms',
    isComplete: (facts) =>
      Boolean(facts.court_name) &&
      Boolean(facts.signatory_name) &&
      Boolean(facts.signatory_capacity),
  },
  {
    id: 'review',
    label: 'Review your court documents',
    description: 'Open the completed documents and make sure everything is ready to file',
    isComplete: () => false, // Always navigable for final review
  },
];

// Scotland-specific sections
// ALL GROUNDS IN SCOTLAND ARE DISCRETIONARY - no mandatory/discretionary split
const SCOTLAND_SECTIONS: WizardSection[] = [
  {
    id: 'scotland_basics',
    label: 'Case Basics',
    description: 'Scottish Private Residential Tenancy case',
    jurisdictions: ['scotland'],
    isComplete: () => true, // Auto-complete as Scotland is pre-selected
  },
  {
    id: 'parties',
    label: 'Parties',
    description: 'Landlord and tenant details',
    jurisdictions: ['scotland'],
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
    jurisdictions: ['scotland'],
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) &&
      Boolean(facts.property_address_town) &&
      Boolean(facts.property_address_postcode),
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy details and rent information',
    jurisdictions: ['scotland'],
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
    id: 'scotland_grounds',
    label: 'Grounds',
    description: 'Choose the eviction ground you want to rely on',
    jurisdictions: ['scotland'],
    isComplete: (facts) => Boolean(facts.scotland_eviction_ground),
    hasWarnings: () => [
      'All grounds in Scotland are discretionary. The First-tier Tribunal may refuse eviction even if grounds are proven.',
    ],
  },
  {
    id: 'scotland_notice',
    label: 'Notice',
    description: 'Notice to Leave details',
    jurisdictions: ['scotland'],
    isComplete: (facts) => {
      if (facts.notice_already_served === undefined) return false;
      return Boolean(facts.notice_service_method);
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
  },
  {
    id: 'evidence',
    label: 'Evidence',
    description: 'Supporting documents and records',
    jurisdictions: ['scotland'],
    isComplete: (facts) => Boolean(facts.evidence_reviewed || facts.uploaded_documents?.length > 0),
  },
  {
    id: 'scotland_tribunal',
    label: 'Tribunal',
    description: 'First-tier Tribunal details',
    jurisdictions: ['scotland'],
    isComplete: (facts) =>
      Boolean(facts.understands_tribunal_process) &&
      Boolean(facts.signatory_name) &&
      Boolean(facts.signatory_capacity),
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review the documents and generate them',
    jurisdictions: ['scotland'],
    isComplete: () => false, // Always navigable for final review
  },
];

// Helper to get sections based on jurisdiction
function getSectionsForJurisdiction(jurisdiction: 'england' | 'wales' | 'scotland'): WizardSection[] {
  if (jurisdiction === 'scotland') {
    return SCOTLAND_SECTIONS;
  }
  return ENGLAND_WALES_SECTIONS;
}

interface EvictionSectionFlowProps {
  caseId: string;
  jurisdiction: 'england' | 'wales' | 'scotland';
  /** Pre-loaded facts from notice-only flow (for data reuse) */
  initialFacts?: WizardFacts;
  /** True when the user is continuing from the England notice-only flow */
  upgradeFromNoticeOnly?: boolean;
}

const COMPLETE_PACK_UPGRADE_SECTION_ORDER = ['evidence', 'court_signing', 'review'] as const;

function normalizeCompletePackFacts(
  facts: WizardFacts,
  jurisdiction: 'england' | 'wales' | 'scotland',
  upgradeFromNoticeOnly: boolean
): WizardFacts {
  const normalizedFacts: WizardFacts = {
    ...facts,
    __meta: {
      ...(facts.__meta || {}),
      product: 'complete_pack',
      original_product:
        facts.__meta?.original_product ?? facts.__meta?.product ?? (upgradeFromNoticeOnly ? 'notice_only' : 'complete_pack'),
      jurisdiction,
    },
  };

  if (
    upgradeFromNoticeOnly &&
    jurisdiction === 'england' &&
    normalizedFacts.notice_already_served === undefined
  ) {
    normalizedFacts.notice_already_served = false;
  }

  return normalizedFacts;
}

function getCompletePackUpgradeTargetSection(
  sections: WizardSection[],
  facts: WizardFacts,
  jurisdiction: 'england' | 'wales' | 'scotland'
): string {
  for (const sectionId of COMPLETE_PACK_UPGRADE_SECTION_ORDER) {
    const section = sections.find((candidate) => candidate.id === sectionId);
    if (!section) {
      continue;
    }

    if (sectionId === 'review' || !section.isComplete(facts, jurisdiction)) {
      return sectionId;
    }
  }

  return 'review';
}

/**
 * Inner component that uses the validation context.
 * Wrapped by EvictionSectionFlow with ValidationProvider.
 */
const EvictionSectionFlowInner: React.FC<EvictionSectionFlowProps> = ({
  caseId,
  jurisdiction,
  initialFacts,
  upgradeFromNoticeOnly = false,
}) => {
  const router = useRouter();

  // Validation context for live field validation
  const { hasErrors, uploadsInProgress } = useValidationContext();

  // State
  const [facts, setFacts] = useState<WizardFacts>(
    normalizeCompletePackFacts(
      initialFacts || { __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction } },
      jurisdiction,
      upgradeFromNoticeOnly,
    )
  );
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [upgradeLandingSectionId, setUpgradeLandingSectionId] = useState<string | null>(null);

  // Debounce ref for save operations to prevent excessive API calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFactsRef = useRef<WizardFacts | null>(null);
  const saveResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const upgradeEntryAppliedRef = useRef(false);

  // Smart Review state (hydrated from persisted facts.__smart_review)
  const [smartReviewWarnings, setSmartReviewWarnings] = useState<SmartReviewWarningItem[]>([]);
  const [smartReviewSummary, setSmartReviewSummary] = useState<SmartReviewSummary | null>(null);

  // Load existing facts on mount using the facts-client helper
  useEffect(() => {
    const loadFacts = async () => {
      try {
        setLoading(true);
        const loadedFacts = await getCaseFacts(caseId);
        if (loadedFacts && Object.keys(loadedFacts).length > 0) {
          setFacts((prev) =>
            normalizeCompletePackFacts(
              {
                ...prev,
                ...loadedFacts,
                __meta: {
                  ...prev.__meta,
                  ...loadedFacts.__meta,
                  product: 'complete_pack',
                  jurisdiction,
                },
              },
              jurisdiction,
              upgradeFromNoticeOnly,
            )
          );

          // Hydrate Smart Review state from persisted data
          const sr = (loadedFacts as any).__smart_review;
          if (sr?.warnings) {
            setSmartReviewWarnings(sr.warnings);
            setSmartReviewSummary(sr.summary || null);
          }
        }
      } catch (err) {
        console.error('Failed to load facts:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadFacts();
  }, [caseId, jurisdiction, upgradeFromNoticeOnly]);

  // Get visible sections based on jurisdiction and eviction route
  const visibleSections = useMemo(() => {
    const isScotland = jurisdiction === 'scotland';
    const sections = getSectionsForJurisdiction(jurisdiction);

    // For Scotland, all sections are visible (no route-based filtering)
    if (isScotland) {
      return sections;
    }

    // For England/Wales, filter by eviction route
    const route = facts.eviction_route as string | undefined;
    const selectedGrounds = (facts.section8_grounds as string[]) || [];
    const hasSpecialistGrounds = hasSelectedGroundDetailPanels(selectedGrounds);
    const hasArrearsGround = selectedGrounds.some((ground) =>
      ['Ground 8', 'Ground 10', 'Ground 11'].some((arrearsGround) => ground.includes(arrearsGround))
    );

    // Wales routes don't have route-specific sections (like S21 compliance or S8 arrears)
    // so we show all non-route-specific sections once a valid route is selected
    const isWales = jurisdiction === 'wales';
    const hasValidRoute = isWales
      ? route && WALES_ROUTES.includes(route as typeof WALES_ROUTES[number])
      : route && ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]);

    const filteredSections = sections.filter((section) => {
      if (!isWales && section.id === 'ground_details') {
        return Boolean(route === 'section_8' && hasSpecialistGrounds);
      }

      if (!isWales && section.id === 'section8_arrears') {
        return Boolean(route === 'section_8' && hasArrearsGround);
      }

      // Route-specific sections (S21 compliance, S8 arrears) only apply to England
      if (section.routes) {
        // Wales doesn't use these England-specific sections
        if (isWales) return false;
        // England: only show if route matches
        if (!route) return false;
        return section.routes.includes(route as 'section_8');
      }

      // Non-route-specific sections: show case_basics always, others once route is valid
      if (!hasValidRoute) return section.id === 'case_basics';
      return true;
    });

    const englandOrder = [
      'case_basics',
      'parties',
      'property',
      'tenancy',
      'notice',
      'ground_details',
      'section8_arrears',
      'evidence',
      'court_signing',
      'review',
    ];

    return filteredSections.sort(
      (left, right) => englandOrder.indexOf(left.id) - englandOrder.indexOf(right.id),
    );
  }, [jurisdiction, facts.eviction_route, facts.section8_grounds]);

  const currentSection = visibleSections[currentSectionIndex];

  useEffect(() => {
    if (currentSectionIndex >= visibleSections.length) {
      setCurrentSectionIndex(Math.max(visibleSections.length - 1, 0));
    }
  }, [currentSectionIndex, visibleSections.length]);

  useEffect(() => {
    if (
      !upgradeFromNoticeOnly ||
      jurisdiction !== 'england' ||
      loading ||
      visibleSections.length === 0 ||
      upgradeEntryAppliedRef.current
    ) {
      return;
    }

    const targetSectionId = getCompletePackUpgradeTargetSection(visibleSections, facts, jurisdiction);
    const targetIndex = visibleSections.findIndex((section) => section.id === targetSectionId);

    if (targetIndex >= 0) {
      setCurrentSectionIndex(targetIndex);
      setUpgradeLandingSectionId(targetSectionId);
      upgradeEntryAppliedRef.current = true;
    }
  }, [facts, jurisdiction, loading, upgradeFromNoticeOnly, visibleSections]);

  // Save facts to backend using the facts-client helper
  const saveFactsToServer = useCallback(
    async (updatedFacts: WizardFacts) => {
      try {
        setSaving(true);
        setSaveState('saving');
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'eviction',
          product: 'complete_pack',
        });
        setSaveState('saved');
        if (saveResetTimeoutRef.current) clearTimeout(saveResetTimeoutRef.current);
        saveResetTimeoutRef.current = setTimeout(() => setSaveState('idle'), 1600);
      } catch (err) {
        console.error('Failed to save facts:', err);
        setError('Failed to save. Please try again.');
        setSaveState('idle');
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
      setSaveState('saving');

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
      if (saveResetTimeoutRef.current) {
        clearTimeout(saveResetTimeoutRef.current);
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
      if (current && current.isComplete(facts, jurisdiction)) {
        const normalizedStep = normalizeWizardStep(current.id);
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id, {
          caseId,
          product: 'complete_pack',
          jurisdiction,
          stepGroup: normalizedStep.stepGroup,
        });
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: 'complete_pack',
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
  }, [caseId, currentSectionIndex, visibleSections, facts, jurisdiction]);

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

  // Handle wizard completion
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
          caseType: 'eviction',
          product: 'complete_pack',
        });
        pendingFactsRef.current = null;
        console.log('[Wizard] Pending facts flushed successfully before navigation to review');
      } catch (err) {
        console.error('[Wizard] Failed to flush pending facts before navigation:', err);
        // Continue with navigation even if save fails - user can retry from review page
      }
    }

    // Navigate to review page
    router.push(`/wizard/review?case_id=${caseId}&product=complete_pack`);
  }, [caseId, jurisdiction, router]);

  // Calculate progress
  const completedCount = visibleSections.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = currentSection?.hasBlockers?.(facts) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts) || [];
  const showUpgradeRecap =
    upgradeFromNoticeOnly &&
    jurisdiction === 'england' &&
    Boolean(upgradeLandingSectionId) &&
    currentSection?.id === upgradeLandingSectionId;
  const upgradeOutstandingSteps = visibleSections
    .filter(
      (section) =>
        COMPLETE_PACK_UPGRADE_SECTION_ORDER.includes(
          section.id as (typeof COMPLETE_PACK_UPGRADE_SECTION_ORDER)[number]
        ) &&
        section.id !== 'review' &&
        !section.isComplete(facts, jurisdiction)
    )
    .map((section) => section.label);

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    // Type-narrowed props for England/Wales sections (jurisdiction is never 'scotland' for these cases)
    const englandWalesProps = {
      facts,
      jurisdiction: jurisdiction as 'england' | 'wales',
      onUpdate: handleUpdate,
    };

    switch (currentSection.id) {
      // England/Wales sections
      case 'case_basics':
        return <CaseBasicsSection {...englandWalesProps} flowProduct="complete_pack" />;
      case 'parties':
        return <PartiesSection {...englandWalesProps} />;
      case 'property':
        return <PropertySection {...englandWalesProps} />;
      case 'tenancy':
        return <TenancySection {...englandWalesProps} />;
      case 'notice':
        return <NoticeSection {...englandWalesProps} />;
      case 'ground_details':
        return (
          <GroundDetailsSection
            {...englandWalesProps}
            caseId={caseId}
            product="complete_pack"
          />
        );
      case 'section8_arrears':
        return <Section8ArrearsSection {...englandWalesProps} caseId={caseId} product="complete_pack" />;
      case 'evidence':
        return <EvidenceSection {...englandWalesProps} caseId={caseId} />;
      case 'court_signing':
        return <CourtSigningSection {...englandWalesProps} product="complete_pack" />;
      case 'review':
        return (
          <ReviewSection
            {...englandWalesProps}
            caseId={caseId}
            sections={visibleSections}
            onComplete={handleComplete}
            onJumpToSection={handleJumpToSection}
          />
        );

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
      case 'scotland_grounds':
        return <ScotlandGroundsSection facts={facts} onUpdate={handleUpdate} />;
      case 'scotland_notice':
        return <ScotlandNoticeSection facts={facts} onUpdate={handleUpdate} />;
      case 'scotland_tribunal':
        return <ScotlandTribunalSection facts={facts} onUpdate={handleUpdate} />;

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

  const ShellComponent: React.ComponentType<any> =
    isWizardUiV3Enabled && jurisdiction === 'england'
      ? EnglandPossessionWorkspaceShell
      : isWizardUiV3Enabled
        ? WizardShellV3
        : WizardFlowShell;

  return (
    <ShellComponent
      title={
        jurisdiction === 'scotland'
          ? 'Scotland Eviction Pack'
          : jurisdiction === 'wales'
          ? 'Wales Eviction Pack'
          : 'Stage 2: Section 8 Court & Possession Pack'
      }
      completedCount={completedCount}
      totalCount={visibleSections.length}
      progress={progress}
      tabs={visibleSections.map((section, index) => ({
        id: section.id,
        label: section.label,
        isCurrent: index === currentSectionIndex,
        isComplete: section.isComplete(facts),
        hasIssue: (section.hasBlockers?.(facts) || []).length > 0,
        onClick: () => setCurrentSectionIndex(index),
      }))}
      sectionTitle={currentSection?.label ?? ''}
      sectionDescription={currentSection?.description}
      product="complete_pack"
      jurisdiction={jurisdiction}
      currentStepId={currentSection?.id}
      saveState={saveState}
      banner={error ? (
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
      sidebar={(
        <AskHeavenPanel
          caseId={caseId}
          caseType="eviction"
          jurisdiction={jurisdiction}
          product="complete_pack"
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

          <div className="flex min-w-0 items-center justify-end gap-2 sm:min-w-[220px]">
            {!isWizardUiV3Enabled && saving && <span className="text-sm text-gray-500 whitespace-nowrap">Auto-saving...</span>}

            {currentSection?.id === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={currentBlockers.length > 0 || hasErrors || uploadsInProgress}
                className={`
                  px-7 py-2.5 text-sm font-semibold rounded-xl transition-all
                  ${currentBlockers.length > 0 || hasErrors || uploadsInProgress
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-[0_6px_16px_rgba(109,40,217,0.28)]'}
                `}
              >
                {uploadsInProgress ? 'Uploading...' : 'Generate documents'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentSectionIndex === visibleSections.length - 1 || hasErrors || uploadsInProgress}
                className={`
                  px-7 py-2.5 text-sm font-semibold rounded-xl transition-all
                  ${currentSectionIndex === visibleSections.length - 1 || hasErrors || uploadsInProgress
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-[0_6px_16px_rgba(109,40,217,0.28)]'}
                `}
              >
                {uploadsInProgress ? 'Uploading...' : 'Continue'}
              </button>
            )}
          </div>
        </>
      )}
    >
      {showUpgradeRecap && (
        <div className="mb-6 rounded-[1.55rem] border border-[#e4d7ff] bg-[linear-gradient(180deg,#fcfaff_0%,#f5eeff_100%)] p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b56d8]">
            Stage 1 upgraded into Stage 2
          </p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-[#241247]">
            Your notice-stage answers have been carried into the combined court pack
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#5f5877]">
            This case now includes the Stage 1 notice and service file, plus the Stage 2 claim forms,
            witness statement, and court bundle support.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm leading-6 text-[#473d63]">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]" />
              <span>Stage 1 notice basics, grounds, tenancy details, and arrears facts stay on this case.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]" />
              <span>Stage 2 adds N5, N119, the witness statement, and the court bundle structure.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]" />
              <span>
                {upgradeOutstandingSteps.length > 0
                  ? `You still need to complete: ${upgradeOutstandingSteps.join(', ')}.`
                  : 'The court-only sections are already complete, so you can review the full combined pack now.'}
              </span>
            </li>
          </ul>
        </div>
      )}

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

            {/* Smart Review Panel - Show in evidence and review sections */}
            {(currentSection?.id === 'evidence' || currentSection?.id === 'review') &&
              smartReviewWarnings.length > 0 && (
                <div className="mt-6">
                  <SmartReviewPanel
                    warnings={smartReviewWarnings}
                    summary={smartReviewSummary}
                    defaultCollapsed={currentSection?.id !== 'evidence'}
                  />
                </div>
              )}
    </ShellComponent>
  );
};

/**
 * Main exported component that wraps the inner flow with ValidationProvider.
 * This enables live field validation across all sections.
 */
export const EvictionSectionFlow: React.FC<EvictionSectionFlowProps> = (props) => {
  return (
    <ValidationProvider>
      <EvictionSectionFlowInner {...props} />
    </ValidationProvider>
  );
};

export default EvictionSectionFlow;



