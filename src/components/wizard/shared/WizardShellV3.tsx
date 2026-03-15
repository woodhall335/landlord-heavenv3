'use client';

import React from 'react';
import { WizardMainCardV3 } from './WizardMainCardV3';
import { GuidancePanelV3 } from './GuidancePanelV3';
import { WizardFooterNavV3 } from './WizardFooterNavV3';
import { WizardTopBarV3 } from './WizardTopBarV3';
import {
  getStepMetadata,
  resolveStepIconPath,
  type StepMetadata,
  type WizardJurisdiction,
  type WizardProduct,
} from './stepMetadata';

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
  navigation?: React.ReactNode;
  navigationLeft?: React.ReactNode;
  navigationCenter?: React.ReactNode;
  navigationRight?: React.ReactNode;
  product: WizardProduct;
  jurisdiction: WizardJurisdiction;
  currentStepId?: string;
}

export function WizardShellV3({
  tabs,
  sectionTitle,
  sectionDescription,
  banner,
  sidebar,
  children,
  navigation,
  navigationLeft,
  navigationCenter,
  navigationRight,
  product,
  jurisdiction,
  currentStepId,
}: WizardShellV3Props) {
  const currentMeta: StepMetadata | undefined = currentStepId
    ? getStepMetadata(product, jurisdiction, currentStepId)
    : undefined;

  const currentTabIndex = tabs.findIndex((tab) => tab.isCurrent);
  const activeStepIndex = currentTabIndex >= 0 ? currentTabIndex : 0;

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: '#150733',
        backgroundImage:
          "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(10,5,28,0.52) 45%, rgba(30,12,72,0.64) 100%), url('/images/bg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <WizardTopBarV3
        tabs={tabs}
        getStepMetadataForId={(stepId) => getStepMetadata(product, jurisdiction, stepId)}
      />

      <div style={{ height: "calc(var(--site-header-height) + var(--s21-banner-height) + var(--wizard-topbar-height))" }} aria-hidden="true" />

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-stretch gap-6 px-4 pb-12 pt-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <WizardMainCardV3
          sectionTitle={sectionTitle}
          sectionDescription={sectionDescription}
          stepIconPath={resolveStepIconPath(currentMeta)}
          stepNumber={activeStepIndex + 1}
          totalSteps={tabs.length}
          banner={banner}
          navigation={
            navigation ? (
              <WizardFooterNavV3>{navigation}</WizardFooterNavV3>
            ) : (
              <WizardFooterNavV3
                leftSlot={navigationLeft}
                centerSlot={navigationCenter}
                rightSlot={navigationRight}
              />
            )
          }
        >
          {children}
        </WizardMainCardV3>

        <aside className="w-full min-h-0 shrink-0 lg:self-start lg:w-[340px]">
          <div className="lg:sticky lg:top-[calc(var(--site-header-height)+var(--s21-banner-height)+var(--wizard-topbar-height)+8px)]">
            <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} />
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pb-8 text-center text-sm text-violet-100/80">
        This service provides document preparation assistance. It does not provide legal advice.
      </div>
    </div>
  );
}

export default WizardShellV3;

