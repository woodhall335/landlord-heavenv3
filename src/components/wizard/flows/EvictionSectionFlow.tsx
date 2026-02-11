/**
 * Eviction Section Flow - England, Wales & Scotland Complete Pack
 *
 * Redesigned wizard for eviction complete packs following a logical,
 * court-ready, jurisdiction-aware flow.
 *
 * Flow Structure (England/Wales):
 * 1. Case Basics - Jurisdiction and eviction route (S8 or S21)
 * 2. Parties - Landlord(s) and Tenant(s) with joint support
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency, due day
 * 5. Notice - Reuses notice-only schema, served date, service method, expiry
 * 6. Section 21 Compliance - S21 only (deposit, prescribed info, gas, EPC, HtR)
 * 7. Section 8 Arrears - S8 only using ArrearsScheduleStep
 * 8. Evidence - Upload categorized evidence
 * 9. Court & Signing - Court name, signatory details
 * 10. Review - Blockers, warnings, generated documents
 *
 * Flow Structure (Scotland):
 * 1. Case Basics - Jurisdiction (Scotland, PRT)
 * 2. Parties - Landlord(s) and Tenant(s)
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency (6-month rule validation)
 * 5. Grounds - Select eviction ground (ALL discretionary in Scotland)
 * 6. Notice - Notice to Leave details (6-month rule enforced)
 * 7. Evidence - Upload categorized evidence
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

import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { SmartReviewPanel } from '@/components/wizard/SmartReviewPanel';
import type { SmartReviewWarningItem, SmartReviewSummary } from '@/components/wizard/SmartReviewPanel';

// Section components
import { CaseBasicsSection } from '../sections/eviction/CaseBasicsSection';
import { PartiesSection } from '../sections/eviction/PartiesSection';
import { PropertySection } from '../sections/eviction/PropertySection';
import { TenancySection } from '../sections/eviction/TenancySection';
import { NoticeSection } from '../sections/eviction/NoticeSection';
import { Section21ComplianceSection } from '../sections/eviction/Section21ComplianceSection';
import { Section8ArrearsSection } from '../sections/eviction/Section8ArrearsSection';
import { EvidenceSection } from '../sections/eviction/EvidenceSection';
import { CourtSigningSection } from '../sections/eviction/CourtSigningSection';
import { ReviewSection } from '../sections/eviction/ReviewSection';

// Scotland-specific sections
import { ScotlandGroundsSection } from '../sections/eviction/ScotlandGroundsSection';
import { ScotlandNoticeSection } from '../sections/eviction/ScotlandNoticeSection';
import { ScotlandTribunalSection } from '../sections/eviction/ScotlandTribunalSection';

// Scotland utilities
import { validateSixMonthRule, getScotlandGroundByNumber } from '@/lib/scotland/grounds';

// Types and validation
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';

// Analytics and attribution
import { trackWizardStepCompleteWithAttribution } from '@/lib/analytics';
import { getWizardAttribution, isStepCompleted, markStepCompleted } from '@/lib/wizard/wizardAttribution';

// Validation context for live field validation
import { ValidationProvider, useValidationContext } from '@/components/wizard/ValidationContext';

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Route-specific visibility (England/Wales only)
  routes?: ('section_8' | 'section_21')[];
  // Jurisdiction-specific visibility
  jurisdictions?: ('england' | 'wales' | 'scotland')[];
  // Validation function to check if section is complete
  isComplete: (facts: WizardFacts, jurisdiction?: string) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: WizardFacts, jurisdiction?: string) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: WizardFacts, jurisdiction?: string) => string[];
}

// Define all sections with their visibility rules
// These sections apply to England and Wales
// Valid routes by jurisdiction
const ENGLAND_ROUTES = ['section_8', 'section_21'] as const;
const WALES_ROUTES = ['section_173', 'fault_based'] as const;
const ALL_VALID_ROUTES = [...ENGLAND_ROUTES, ...WALES_ROUTES] as const;

const ENGLAND_WALES_SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: 'Case Basics',
    description: 'Jurisdiction and eviction route',
    jurisdictions: ['england', 'wales'],
    isComplete: (facts, jurisdiction) => {
      const route = facts.eviction_route as string;
      if (!route) return false;

      // Validate route is appropriate for jurisdiction
      if (jurisdiction === 'wales') {
        return WALES_ROUTES.includes(route as typeof WALES_ROUTES[number]);
      }
      return ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]);
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
    id: 'notice',
    label: 'Notice',
    description: 'Notice service details',
    isComplete: (facts) => {
      // Must answer the gating question first
      if (facts.notice_already_served === undefined) return false;

      // If already served: require served date and service method
      // If generating: subflow populates notice_served_date and notice_service_method on completion
      return Boolean(facts.notice_served_date) && Boolean(facts.notice_service_method);
    },
  },
  {
    id: 'section21_compliance',
    label: 'Section 21 Compliance',
    description: 'Compliance requirements for no-fault eviction',
    routes: ['section_21'],
    isComplete: (facts) => {
      // Check all S21 compliance requirements
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
    id: 'section8_arrears',
    label: 'Arrears Schedule',
    description: 'Rent arrears breakdown for Section 8',
    routes: ['section_8'],
    isComplete: (facts) => {
      // For Section 8 with arrears grounds, arrears schedule + particulars must be complete
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasArrearsGround = selectedGrounds.some((g) =>
        ['Ground 8', 'Ground 10', 'Ground 11'].some((ag) => g.includes(ag))
      );

      if (!hasArrearsGround) return true; // No arrears grounds selected

      // Must have arrears items
      const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
      const hasArrearsItems = Array.isArray(arrearsItems) && arrearsItems.length > 0;

      // Must have particulars (now collected in this section after arrears)
      const hasParticulars = Boolean(facts.section8_details);

      return hasArrearsItems && hasParticulars;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasGround8 = selectedGrounds.some((g) => g.includes('Ground 8'));

      if (hasGround8) {
        // Ground 8 requires 2+ months arrears
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
    id: 'evidence',
    label: 'Evidence',
    description: 'Supporting documents',
    // Optional section - only complete when user has uploaded evidence or confirmed none needed
    isComplete: (facts) => Boolean(facts.evidence_reviewed || facts.uploaded_documents?.length > 0),
  },
  {
    id: 'court_signing',
    label: 'Court & Signing',
    description: 'Court details and statement of truth',
    isComplete: (facts) =>
      Boolean(facts.court_name) &&
      Boolean(facts.signatory_name) &&
      Boolean(facts.signatory_capacity),
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate documents',
    isComplete: () => false, // Always navigable for final review
  },
];

// Scotland-specific sections
// ALL GROUNDS IN SCOTLAND ARE DISCRETIONARY - no mandatory/discretionary split
const SCOTLAND_SECTIONS: WizardSection[] = [
  {
    id: 'scotland_basics',
    label: 'Case Basics',
    description: 'Private Residential Tenancy (Scotland)',
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
    description: 'Tenancy details and rent',
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
    description: 'Select eviction ground (all discretionary)',
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
    description: 'Supporting documents',
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
    description: 'Review and generate documents',
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
}

/**
 * Inner component that uses the validation context.
 * Wrapped by EvictionSectionFlow with ValidationProvider.
 */
const EvictionSectionFlowInner: React.FC<EvictionSectionFlowProps> = ({
  caseId,
  jurisdiction,
  initialFacts,
}) => {
  const router = useRouter();

  // Validation context for live field validation
  const { hasErrors, uploadsInProgress } = useValidationContext();

  // State
  const [facts, setFacts] = useState<WizardFacts>(initialFacts || { __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction } });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce ref for save operations to prevent excessive API calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFactsRef = useRef<WizardFacts | null>(null);

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
          setFacts((prev) => ({
            ...prev,
            ...loadedFacts,
            __meta: {
              ...prev.__meta,
              ...loadedFacts.__meta,
              product: 'complete_pack',
              jurisdiction,
            },
          }));

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
  }, [caseId, jurisdiction]);

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

    // Wales routes don't have route-specific sections (like S21 compliance or S8 arrears)
    // so we show all non-route-specific sections once a valid route is selected
    const isWales = jurisdiction === 'wales';
    const hasValidRoute = isWales
      ? route && WALES_ROUTES.includes(route as typeof WALES_ROUTES[number])
      : route && ENGLAND_ROUTES.includes(route as typeof ENGLAND_ROUTES[number]);

    return sections.filter((section) => {
      // Route-specific sections (S21 compliance, S8 arrears) only apply to England
      if (section.routes) {
        // Wales doesn't use these England-specific sections
        if (isWales) return false;
        // England: only show if route matches
        if (!route) return false;
        return section.routes.includes(route as 'section_8' | 'section_21');
      }

      // Non-route-specific sections: show case_basics always, others once route is valid
      if (!hasValidRoute) return section.id === 'case_basics';
      return true;
    });
  }, [jurisdiction, facts.eviction_route]);

  const currentSection = visibleSections[currentSectionIndex];

  // Save facts to backend using the facts-client helper
  const saveFactsToServer = useCallback(
    async (updatedFacts: WizardFacts) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'eviction',
          product: 'complete_pack',
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
        // Only fire if not already tracked for this step
        const shouldTrack = markStepCompleted(current.id);
        if (shouldTrack) {
          const attribution = getWizardAttribution();
          trackWizardStepCompleteWithAttribution({
            product: 'complete_pack',
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

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    const isScotland = jurisdiction === 'scotland';

    const sectionProps = {
      facts,
      jurisdiction,
      onUpdate: handleUpdate,
    };

    // Type-narrowed props for England/Wales sections (jurisdiction is never 'scotland' for these cases)
    const englandWalesProps = {
      facts,
      jurisdiction: jurisdiction as 'england' | 'wales',
      onUpdate: handleUpdate,
    };

    switch (currentSection.id) {
      // England/Wales sections
      case 'case_basics':
        return <CaseBasicsSection {...englandWalesProps} />;
      case 'parties':
        return <PartiesSection {...englandWalesProps} />;
      case 'property':
        return <PropertySection {...englandWalesProps} />;
      case 'tenancy':
        return <TenancySection {...englandWalesProps} />;
      case 'notice':
        return <NoticeSection {...englandWalesProps} />;
      case 'section21_compliance':
        return <Section21ComplianceSection {...englandWalesProps} />;
      case 'section8_arrears':
        return <Section8ArrearsSection {...englandWalesProps} />;
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

  return (
    <WizardFlowShell
      title={
        jurisdiction === 'scotland'
          ? 'Scotland Eviction Pack'
          : jurisdiction === 'wales'
          ? 'Wales Eviction Pack'
          : 'England Eviction Pack'
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
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${currentSectionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-gray-500">Saving...</span>}

            {currentSection?.id === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={currentBlockers.length > 0 || hasErrors || uploadsInProgress}
                className={`
                  px-6 py-2 text-sm font-medium rounded-md transition-colors
                  ${currentBlockers.length > 0 || hasErrors || uploadsInProgress
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'}
                `}
              >
                {uploadsInProgress ? 'Uploading...' : 'Generate Documents'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentSectionIndex === visibleSections.length - 1 || hasErrors || uploadsInProgress}
                className={`
                  px-6 py-2 text-sm font-medium rounded-md transition-colors
                  ${currentSectionIndex === visibleSections.length - 1 || hasErrors || uploadsInProgress
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'}
                `}
              >
                {uploadsInProgress ? 'Uploading...' : 'Next →'}
              </button>
            )}
          </div>
        </>
      )}
    >
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
    </WizardFlowShell>
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
