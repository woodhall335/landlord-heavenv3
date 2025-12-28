/**
 * Money Claim Section Flow
 *
 * Redesigned wizard for Money Claim packs following a logical,
 * court-ready, jurisdiction-aware flow.
 *
 * Flow Structure:
 * 1. Claimant - Landlord/Company details
 * 2. Defendant - Tenant details
 * 3. Tenancy - Start date, rent amount, frequency
 * 4. Claim details - Jurisdiction-specific claim info
 * 5. Rent & arrears - Schedule of arrears breakdown
 * 6. Damages & costs - Additional claims
 * 7. Pre-action steps - Letter before action
 * 8. Timeline & PAP summary - Pre-action protocol timeline
 * 9. Evidence - Supporting documents upload
 * 10. Enforcement preferences - Bailiff/wage attachment choices
 * 11. Review & finish - Final review and checkout
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';

import { ClaimantSection } from '@/components/wizard/money-claim/ClaimantSection';
import { DefendantSection } from '@/components/wizard/money-claim/DefendantSection';
import { TenancySection } from '@/components/wizard/money-claim/TenancySection';
import { ClaimDetailsSection } from '@/components/wizard/money-claim/ClaimDetailsSection';
import { ArrearsSection } from '@/components/wizard/money-claim/ArrearsSection';
import { DamagesSection } from '@/components/wizard/money-claim/DamagesSection';
import { PreActionSection } from '@/components/wizard/money-claim/PreActionSection';
import { TimelineSection } from '@/components/wizard/money-claim/TimelineSection';
import { EvidenceSection } from '@/components/wizard/money-claim/EvidenceSection';
import { EnforcementSection } from '@/components/wizard/money-claim/EnforcementSection';
import { ReviewSection } from '@/components/wizard/money-claim/ReviewSection';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface MoneyClaimSectionFlowProps {
  caseId: string;
  jurisdiction: Jurisdiction;
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
}

// Define all sections with their validation rules
const SECTIONS: WizardSection[] = [
  {
    id: 'claimant',
    label: 'Claimant',
    description: 'Your contact details as the landlord or company',
    isComplete: (facts) =>
      Boolean(facts.landlord_full_name) &&
      Boolean(facts.landlord_address_line1) &&
      Boolean(facts.landlord_address_postcode),
  },
  {
    id: 'defendant',
    label: 'Defendant',
    description: 'Tenant details for the claim',
    isComplete: (facts) =>
      Boolean(facts.tenant_full_name) &&
      Boolean(facts.defendant_address_line1 || facts.property_address_line1),
  },
  {
    id: 'tenancy',
    label: 'Tenancy',
    description: 'Tenancy agreement details',
    isComplete: (facts) =>
      Boolean(facts.tenancy_start_date) &&
      Boolean(facts.rent_amount) &&
      Boolean(facts.rent_frequency),
  },
  {
    id: 'claim_details',
    label: 'Claim Details',
    description: 'What you are claiming',
    isComplete: (facts) =>
      facts.claiming_rent_arrears === true ||
      facts.claiming_damages === true ||
      facts.claiming_other === true,
  },
  {
    id: 'arrears',
    label: 'Arrears',
    description: 'Rent arrears schedule',
    isComplete: (facts) => {
      if (facts.claiming_rent_arrears !== true) return true;
      const arrearsItems = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
      return Array.isArray(arrearsItems) && arrearsItems.length > 0;
    },
    hasBlockers: (facts) => {
      const blockers: string[] = [];
      if (facts.claiming_rent_arrears === true) {
        const arrearsItems = facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          blockers.push('Please add at least one arrears entry');
        }
      }
      return blockers;
    },
  },
  {
    id: 'damages',
    label: 'Damages',
    description: 'Property damage and other costs',
    isComplete: (facts) => {
      if (facts.claiming_damages !== true && facts.claiming_other !== true) return true;
      return Boolean(facts.damage_items?.length > 0 || facts.other_charges?.length > 0);
    },
  },
  {
    id: 'preaction',
    label: 'Pre-Action',
    description: 'Letter Before Claim (PAP-DEBT compliance)',
    isComplete: (facts) =>
      Boolean(facts.letter_before_claim_sent) ||
      Boolean(facts.pap_letter_date),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Pre-action protocol timeline',
    isComplete: () => true, // Timeline is informational
  },
  {
    id: 'evidence',
    label: 'Evidence',
    description: 'Supporting documents',
    isComplete: () => true, // Evidence is optional but recommended
  },
  {
    id: 'enforcement',
    label: 'Enforcement',
    description: 'Preferred enforcement methods',
    isComplete: () => true, // Enforcement preferences are optional
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and generate documents',
    isComplete: () => false, // Always navigable for final review
  },
];

export const MoneyClaimSectionFlow: React.FC<MoneyClaimSectionFlowProps> = ({
  caseId,
  jurisdiction,
}) => {
  const router = useRouter();

  // State
  const [facts, setFacts] = useState<any>({ __meta: { product: 'money_claim', jurisdiction } });
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
              product: 'money_claim',
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

  const currentSection = SECTIONS[currentSectionIndex];

  // Save facts to backend
  const saveFactsToServer = useCallback(
    async (updatedFacts: any) => {
      try {
        setSaving(true);
        setError(null);

        await saveCaseFacts(caseId, updatedFacts, {
          jurisdiction,
          caseType: 'money_claim',
          product: 'money_claim',
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

  // Navigate to next section
  const handleNext = useCallback(() => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex]);

  // Navigate to previous section
  const handleBack = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  // Jump to specific section
  const handleJumpToSection = useCallback((sectionId: string) => {
    const index = SECTIONS.findIndex((s) => s.id === sectionId);
    if (index >= 0) {
      setCurrentSectionIndex(index);
    }
  }, []);

  // Handle wizard completion
  const handleComplete = useCallback(async () => {
    router.push(`/wizard/preview/${caseId}`);
  }, [caseId, router]);

  // Calculate progress
  const completedCount = SECTIONS.filter((s) => s.isComplete(facts)).length;
  const progress = Math.round((completedCount / SECTIONS.length) * 100);

  // Get blockers and warnings for current section
  const currentBlockers = currentSection?.hasBlockers?.(facts) || [];
  const currentWarnings = currentSection?.hasWarnings?.(facts) || [];

  // Jurisdiction label
  const jurisdictionLabel = useMemo(() => {
    switch (jurisdiction) {
      case 'scotland':
        return 'Scotland Simple Procedure';
      case 'wales':
        return 'Wales Money Claim';
      default:
        return 'England Money Claim';
    }
  }, [jurisdiction]);

  // Render section content
  const renderSection = () => {
    if (!currentSection) return null;

    switch (currentSection.id) {
      case 'claimant':
        return <ClaimantSection facts={facts} onUpdate={handleUpdate} />;
      case 'defendant':
        return <DefendantSection facts={facts} onUpdate={handleUpdate} />;
      case 'tenancy':
        return (
          <TenancySection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'claim_details':
        return (
          <ClaimDetailsSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'arrears':
        return <ArrearsSection facts={facts} onUpdate={handleUpdate} />;
      case 'damages':
        return <DamagesSection facts={facts} onUpdate={handleUpdate} />;
      case 'preaction':
        return (
          <PreActionSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'timeline':
        return (
          <TimelineSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'evidence':
        return (
          <EvidenceSection
            facts={facts}
            onUpdate={handleUpdate}
            caseId={caseId}
            jurisdiction={jurisdiction}
          />
        );
      case 'enforcement':
        return (
          <EnforcementSection
            facts={facts}
            onUpdate={handleUpdate}
            jurisdiction={jurisdiction}
          />
        );
      case 'review':
        return (
          <ReviewSection
            facts={facts}
            caseId={caseId}
            jurisdiction={jurisdiction}
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header with progress */}
      <header className="bg-white border-b border-gray-200 sticky top-20 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {jurisdictionLabel} Pack
            </h1>
            <span className="text-sm text-gray-500">
              {completedCount} of {SECTIONS.length} sections complete
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
            {SECTIONS.map((section, index) => {
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
                  disabled={currentSectionIndex === SECTIONS.length - 1}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md transition-colors
                    ${currentSectionIndex === SECTIONS.length - 1
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
              caseType="money_claim"
              jurisdiction={jurisdiction}
              product="money_claim"
              currentQuestionId={undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MoneyClaimSectionFlow;
