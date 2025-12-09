// src/components/wizard/flows/MoneyClaimSectionFlow.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { getCaseFacts, saveCaseFacts } from '@/lib/wizard/facts-client';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { SectionContainer } from '@/components/wizard/SectionContainer';

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

type Jurisdiction = 'england-wales' | 'scotland';

interface MoneyClaimSectionFlowProps {
  caseId: string;
  jurisdiction: Jurisdiction;
}

const SECTIONS: { id: string; label: string }[] = [
  { id: 'claimant', label: 'Claimant' },
  { id: 'defendant', label: 'Defendant' },
  { id: 'tenancy', label: 'Tenancy' },
  { id: 'claim_details', label: 'Claim details' },
  { id: 'arrears', label: 'Rent & arrears' },
  { id: 'damages', label: 'Damages & costs' },
  { id: 'preaction', label: 'Pre-action steps' },
  { id: 'timeline', label: 'Timeline & PAP summary' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'enforcement', label: 'Enforcement preferences' },
  { id: 'review', label: 'Review & finish' },
];

export const MoneyClaimSectionFlow: React.FC<MoneyClaimSectionFlowProps> = ({
  caseId,
  jurisdiction,
}) => {
  const [facts, setFacts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await getCaseFacts(caseId);
        if (!cancelled) {
          setFacts(loaded || {});
        }
      } catch (err) {
        console.error('Failed to load case facts for section flow:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const handleUpdateFacts = async (updates: Record<string, any>) => {
    // Deep merge to preserve existing nested fields
    const next = { ...facts };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Merge nested objects
        next[key] = {
          ...(next[key] || {}),
          ...value,
        };
      } else {
        // Direct assignment for primitives and arrays
        next[key] = value;
      }
    }

    setFacts(next);

    try {
      await saveCaseFacts(caseId, next, {
        jurisdiction,
        caseType: 'money_claim',
        product: 'money_claim',
      });
    } catch (err) {
      console.error('Failed to save case facts checkpoint:', err);
    }
  };


  const goNext = () => {
    setCurrentIndex((idx) => Math.min(idx + 1, SECTIONS.length - 1));
  };

  const goBack = () => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-600">
        Loading money claim wizard…
      </div>
    );
  }

  const currentSection = SECTIONS[currentIndex];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main wizard column */}
      <div className="w-full lg:w-2/3">
        <SectionContainer
          title={currentSection.label}
          stepIndex={currentIndex}
          totalSteps={SECTIONS.length}
          onNext={goNext}
          onBack={goBack}
          isFirst={currentIndex === 0}
          isLast={currentIndex === SECTIONS.length - 1}
        >
          {currentSection.id === 'claimant' && (
            <ClaimantSection facts={facts} onUpdate={handleUpdateFacts} />
          )}

          {currentSection.id === 'defendant' && (
            <DefendantSection facts={facts} onUpdate={handleUpdateFacts} />
          )}

          {currentSection.id === 'tenancy' && (
            <TenancySection
              facts={facts}
              onUpdate={handleUpdateFacts}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'claim_details' && (
            <ClaimDetailsSection
              facts={facts}
              onUpdate={handleUpdateFacts}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'arrears' && (
            <ArrearsSection facts={facts} onUpdate={handleUpdateFacts} />
          )}

          {currentSection.id === 'damages' && (
            <DamagesSection facts={facts} onUpdate={handleUpdateFacts} />
          )}

          {currentSection.id === 'preaction' && (
            <PreActionSection
              facts={facts}
              onUpdate={handleUpdateFacts}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'timeline' && (
            <TimelineSection
              facts={facts}
              onUpdate={handleUpdateFacts}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'evidence' && (
            <EvidenceSection
              facts={facts}
              onUpdate={handleUpdateFacts}
              caseId={caseId}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'enforcement' && (
            <EnforcementSection
              facts={facts}
              onUpdate={handleUpdateFacts}
              jurisdiction={jurisdiction}
            />
          )}

          {currentSection.id === 'review' && (
            <ReviewSection
              facts={facts}
              caseId={caseId}
              jurisdiction={jurisdiction}
            />
          )}
        </SectionContainer>
      </div>

      {/* Ask Heaven sidebar */}
      <div className="w-full lg:w-1/3">
        <AskHeavenPanel
          caseId={caseId}
          caseType="money_claim"
          jurisdiction={jurisdiction}
          product="money_claim"
          currentQuestionId={undefined}
        />
      </div>
    </div>
  );
};

export default MoneyClaimSectionFlow;
