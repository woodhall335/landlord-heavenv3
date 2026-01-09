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
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

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
const ENGLAND_WALES_SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: 'Case Basics',
    description: 'Jurisdiction and eviction route',
    jurisdictions: ['england', 'wales'],
    isComplete: (facts) =>
      Boolean(facts.eviction_route) &&
      ['section_8', 'section_21'].includes(facts.eviction_route as string),
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

export const EvictionSectionFlow: React.FC<EvictionSectionFlowProps> = ({
  caseId,
  jurisdiction,
  initialFacts,
}) => {
  const router = useRouter();

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

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Get visible sections based on jurisdiction and eviction route
  const visibleSections = useMemo(() => {
    const isScotland = jurisdiction === 'scotland';
    const sections = getSectionsForJurisdiction(jurisdiction);

    // For Scotland, all sections are visible (no route-based filtering)
    if (isScotland) {
      return sections;
    }

    // For England/Wales, filter by eviction route
    const route = facts.eviction_route as 'section_8' | 'section_21' | undefined;
    return sections.filter((section) => {
      if (!section.routes) return true;
      if (!route) return section.id === 'case_basics'; // Only show case basics until route is selected
      return section.routes.includes(route);
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
    // Navigate to review page
    router.push(`/wizard/review?case_id=${caseId}&product=complete_pack`);
  }, [caseId, router]);

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
        return <CourtSigningSection {...englandWalesProps} />;
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header with progress */}
      <header className="bg-white border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {jurisdiction === 'scotland'
                ? 'Scotland Eviction Pack'
                : jurisdiction === 'wales'
                ? 'Wales Eviction Pack'
                : 'England Eviction Pack'}
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
              caseType="eviction"
              jurisdiction={jurisdiction}
              product="complete_pack"
              currentQuestionId={undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EvictionSectionFlow;
