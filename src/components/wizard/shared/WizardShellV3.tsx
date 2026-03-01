'use client';

import React from 'react';
import { WizardHeaderV3 } from './WizardHeaderV3';
import { WizardStepperV3 } from './WizardStepperV3';
import { WizardMainCardV3 } from './WizardMainCardV3';
import { GuidancePanelV3 } from './GuidancePanelV3';
import { WizardFooterNavV3 } from './WizardFooterNavV3';
import { getStepMetadata, resolveStepIconPath, type StepMetadata, type WizardJurisdiction, type WizardProduct } from './stepMetadata';

interface WizardTab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

interface WizardShellV3Props {
  title: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  tabs: WizardTab[];
  sectionTitle: string;
  sectionDescription?: string;
  banner?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  navigation: React.ReactNode;
  product: WizardProduct;
  jurisdiction: WizardJurisdiction;
  currentStepId?: string;
}

export function WizardShellV3({
  title,
  completedCount,
  totalCount,
  progress,
  tabs,
  sectionTitle,
  sectionDescription,
  banner,
  sidebar,
  children,
  navigation,
  product,
  jurisdiction,
  currentStepId,
}: WizardShellV3Props) {
  const currentMeta: StepMetadata | undefined = currentStepId
    ? getStepMetadata(product, jurisdiction, currentStepId)
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100/55 via-violet-50/35 to-[#FAFAFC] pt-20">
      <WizardHeaderV3 title={title} completedCount={completedCount} totalCount={totalCount} progress={progress} />

      <div className="mx-auto max-w-[1240px] px-4 py-6">
        <WizardStepperV3
          tabs={tabs}
          getStepMetadataForId={(stepId) => getStepMetadata(product, jurisdiction, stepId)}
        />
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pb-8 md:flex-col lg:flex-row lg:items-start">
        <WizardMainCardV3
          sectionTitle={sectionTitle}
          sectionDescription={sectionDescription}
          stepIconPath={resolveStepIconPath(currentMeta)}
          banner={banner}
          navigation={<WizardFooterNavV3>{navigation}</WizardFooterNavV3>}
        >
          {children}
        </WizardMainCardV3>

        <aside className="w-full shrink-0 lg:w-[340px]">
          <div className="md:sticky md:top-40">
            <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WizardShellV3;
