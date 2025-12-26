/**
 * Eviction Section Flow - England Complete Pack
 *
 * Redesigned wizard for England eviction complete packs following a logical,
 * court-ready, jurisdiction-aware flow.
 *
 * Flow Structure:
 * 1. Case Basics - Jurisdiction and eviction route
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
 * Key Design Decisions:
 * - Notice-only data is REUSED, not duplicated
 * - Arrears UI uses existing ArrearsScheduleStep and canonical engine
 * - Evidence truthfulness is preserved (checkboxes only tick if uploads exist)
 * - Jurisdiction matrix rules are respected
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

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

// Types and validation
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Route-specific visibility
  routes?: ('section_8' | 'section_21')[];
  // Validation function to check if section is complete
  isComplete: (facts: WizardFacts) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: WizardFacts) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: WizardFacts) => string[];
}

// Define all sections with their visibility rules
const SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: 'Case Basics',
    description: 'Jurisdiction and eviction route',
    isComplete: (facts) =>
      Boolean(facts.eviction_route) &&
      ['section_8', 'section_21'].includes(facts.eviction_route as string),
  },
  {
    id: 'parties',
    label: 'Parties',
    description: 'Landlord and tenant details',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name) && Boolean(facts.tenant_full_name),
  },
  {
    id: 'property',
    label: 'Property',
    description: 'Property address',
    isComplete: (facts) =>
      Boolean(facts.property_address_line1) && Boolean(facts.property_address_postcode),
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
    isComplete: () => true, // Evidence is optional but recommended
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

interface EvictionSectionFlowProps {
  caseId: string;
  jurisdiction: 'england' | 'wales';
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
        }
      } catch (err) {
        console.error('Failed to load facts:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadFacts();
  }, [caseId, jurisdiction]);

  // Get visible sections based on eviction route
  const visibleSections = useMemo(() => {
    const route = facts.eviction_route as 'section_8' | 'section_21' | undefined;
    return SECTIONS.filter((section) => {
      if (!section.routes) return true;
      if (!route) return section.id === 'case_basics'; // Only show case basics until route is selected
      return section.routes.includes(route);
    });
  }, [facts.eviction_route]);

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

  // Update facts and save
  const handleUpdate = useCallback(
    async (updates: Record<string, any>) => {
      const updatedFacts = { ...facts, ...updates };
      setFacts(updatedFacts);
      await saveFactsToServer(updatedFacts);
    },
    [facts, saveFactsToServer]
  );

  // Navigate to next section
  const handleNext = useCallback(() => {
    if (currentSectionIndex < visibleSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, visibleSections.length]);

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

    const sectionProps = {
      facts,
      jurisdiction,
      onUpdate: handleUpdate,
    };

    switch (currentSection.id) {
      case 'case_basics':
        return <CaseBasicsSection {...sectionProps} />;
      case 'parties':
        return <PartiesSection {...sectionProps} />;
      case 'property':
        return <PropertySection {...sectionProps} />;
      case 'tenancy':
        return <TenancySection {...sectionProps} />;
      case 'notice':
        return <NoticeSection {...sectionProps} />;
      case 'section21_compliance':
        return <Section21ComplianceSection {...sectionProps} />;
      case 'section8_arrears':
        return <Section8ArrearsSection {...sectionProps} />;
      case 'evidence':
        return <EvidenceSection {...sectionProps} caseId={caseId} />;
      case 'court_signing':
        return <CourtSigningSection {...sectionProps} />;
      case 'review':
        return (
          <ReviewSection
            {...sectionProps}
            caseId={caseId}
            sections={visibleSections}
            onComplete={handleComplete}
            onJumpToSection={handleJumpToSection}
          />
        );
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              England Eviction Pack
            </h1>
            <span className="text-sm text-gray-500">
              {completedCount} of {visibleSections.length} sections complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
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
                    ${isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${hasBlocker && !isCurrent ? 'ring-2 ring-red-300' : ''}
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    {isComplete && !hasBlocker && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {hasBlocker && (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
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
                    : 'bg-blue-600 text-white hover:bg-blue-700'}
                `}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvictionSectionFlow;
