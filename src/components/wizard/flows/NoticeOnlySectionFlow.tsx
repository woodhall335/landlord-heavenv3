/**
 * Notice Only Section Flow - England/Wales
 *
 * Section-based wizard for generating eviction notices, matching the
 * EvictionSectionFlow design language for consistency.
 *
 * Flow Structure:
 * 1. Case Basics - Jurisdiction and eviction route selection
 * 2. Parties - Landlord(s) and Tenant(s) with joint support
 * 3. Property - Full address and postcode
 * 4. Tenancy - Start date, rent amount, frequency, due day
 * 5. Section 21 Compliance - S21 only (deposit, prescribed info, gas, EPC, HtR)
 * 6. Notice Details - Grounds and service details (S8 grounds selected here BEFORE arrears)
 * 7. Section 8 Arrears - S8 only using ArrearsScheduleStep (needs grounds to be selected first)
 * 8. Review - Generate and download notice
 *
 * Design: Matches EvictionSectionFlow UI exactly (gray-50 background, purple-600
 * primary #7C3AED, section tabs, progress bar, white card content area)
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { WalesNoticeSection } from '../sections/eviction/WalesNoticeSection';

// Types and validation
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';

// Route types for England and Wales
type EvictionRoute = 'section_8' | 'section_21' | 'wales_fault_based' | 'wales_section_173';

// Section definition type
interface WizardSection {
  id: string;
  label: string;
  description: string;
  // Route-specific visibility
  routes?: EvictionRoute[];
  // Validation function to check if section is complete
  isComplete: (facts: WizardFacts) => boolean;
  // Check if section has blockers
  hasBlockers?: (facts: WizardFacts) => string[];
  // Check if section has warnings
  hasWarnings?: (facts: WizardFacts) => string[];
}

// Helper to check if route is valid for any jurisdiction
const isValidRoute = (route: string | undefined): boolean => {
  const validRoutes: EvictionRoute[] = ['section_8', 'section_21', 'wales_fault_based', 'wales_section_173'];
  return Boolean(route) && validRoutes.includes(route as EvictionRoute);
};

// Define all sections with their visibility rules
const SECTIONS: WizardSection[] = [
  {
    id: 'case_basics',
    label: 'Case Basics',
    description: 'Jurisdiction and eviction route',
    isComplete: (facts) => isValidRoute(facts.eviction_route as string),
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
    id: 'section21_compliance',
    label: 'Compliance',
    description: 'Compliance requirements for Section 21',
    routes: ['section_21'],
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

      // For Section 21: just need to confirm service method
      if (route === 'section_21') {
        return Boolean(facts.notice_service_method);
      }

      // For Section 8: need grounds selected
      if (route === 'section_8') {
        const selectedGrounds = (facts.section8_grounds as string[]) || [];
        return selectedGrounds.length > 0 && Boolean(facts.notice_service_method);
      }

      // For Wales Section 173: just need service method
      if (route === 'wales_section_173') {
        return Boolean(facts.notice_service_method);
      }

      // For Wales fault-based: need grounds selected and breach description
      if (route === 'wales_fault_based') {
        const selectedGrounds = (facts.wales_fault_grounds as string[]) || [];
        return selectedGrounds.length > 0 &&
          Boolean(facts.breach_description) &&
          Boolean(facts.notice_service_method);
      }

      return false;
    },
  },
  {
    id: 'section8_arrears',
    label: 'Arrears',
    description: 'Rent arrears breakdown for Section 8',
    routes: ['section_8'],
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

interface NoticeOnlySectionFlowProps {
  caseId: string;
  jurisdiction: 'england' | 'wales';
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

  // Load existing facts on mount
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

  // Get visible sections based on eviction route
  const visibleSections = useMemo(() => {
    const route = facts.eviction_route as EvictionRoute | undefined;
    return SECTIONS.filter((section) => {
      if (!section.routes) return true;
      if (!route) return section.id === 'case_basics';
      return section.routes.includes(route);
    });
  }, [facts.eviction_route]);

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

  // Generate notice
  const handleGenerateNotice = useCallback(async () => {
    try {
      setGenerating(true);
      setError(null);

      // Navigate to preview page
      router.push(`/wizard/preview/${caseId}`);
    } catch (err) {
      console.error('Failed to generate notice:', err);
      setError('Failed to generate notice. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [caseId, router]);

  // Calculate progress
  const completedCount = visibleSections.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / visibleSections.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = currentSection?.hasBlockers?.(facts) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts) || [];

  // Check if all required sections are complete
  const allComplete = visibleSections
    .filter((s) => s.id !== 'review')
    .every((s) => s.isComplete(facts));

  // Get overall blockers
  const getAllBlockers = useCallback(() => {
    const allBlockers: string[] = [];
    for (const section of visibleSections) {
      const sectionBlockers = section.hasBlockers?.(facts) || [];
      allBlockers.push(...sectionBlockers);
    }
    return allBlockers;
  }, [visibleSections, facts]);

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
      case 'section21_compliance':
        return <Section21ComplianceSection {...sectionProps} />;
      case 'section8_arrears':
        return <Section8ArrearsSection {...sectionProps} />;
      case 'notice':
        // Use WalesNoticeSection for Wales fault-based route
        if (jurisdiction === 'wales' && facts.eviction_route === 'wales_fault_based') {
          return <WalesNoticeSection {...sectionProps} mode="notice_only" />;
        }
        return <NoticeSection {...sectionProps} mode="notice_only" />;
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
      .filter((s) => s.id !== 'review' && !s.isComplete(facts))
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
                const complete = section.isComplete(facts);
                const blockers = section.hasBlockers?.(facts) || [];
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
                switch (facts.eviction_route) {
                  case 'section_21':
                    return 'Section 21 (No-Fault)';
                  case 'section_8':
                    return 'Section 8 (Fault-Based)';
                  case 'wales_section_173':
                    return 'Section 173 (No-Fault)';
                  case 'wales_fault_based':
                    return 'Fault-Based (Renting Homes Act)';
                  default:
                    return 'Not selected';
                }
              })()}
            </p>
            <p>
              <strong>Jurisdiction:</strong> {jurisdiction === 'england' ? 'England' : 'Wales'}
            </p>
            {facts.eviction_route === 'section_8' && (
              <p>
                <strong>Grounds:</strong>{' '}
                {((facts.section8_grounds as string[]) || []).join(', ') || 'Not selected'}
              </p>
            )}
            {facts.eviction_route === 'wales_fault_based' && (
              <p>
                <strong>Grounds:</strong>{' '}
                {((facts.wales_fault_grounds as string[]) || []).join(', ') || 'Not selected'}
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
              {jurisdiction === 'england' ? 'England' : 'Wales'} Eviction Notice
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
              currentQuestionId={undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NoticeOnlySectionFlow;
