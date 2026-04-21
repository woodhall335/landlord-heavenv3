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
  const completionLabel = `${completedCount} of ${totalCount} sections complete`;
  const percentageLabel = `${Math.round(progress)}% complete`;

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: '#f8f4ff',
        backgroundImage:
          "radial-gradient(circle at top, rgba(231,216,255,0.92) 0%, rgba(248,244,255,0.98) 32%, rgba(255,255,255,1) 72%), linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(247,242,255,0.96) 100%), url('/images/bg.webp')",
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
          shellTitle={title}
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
            <div className="space-y-4">
              <section className="rounded-[1.8rem] border border-[#e7dbff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,242,255,0.94))] p-5 shadow-[0_20px_60px_rgba(76,29,149,0.10)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
                      Progress
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#20103f]">
                      {percentageLabel}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#ddd0ff] bg-white px-3 py-1 text-xs font-semibold text-[#5b36b3] shadow-sm">
                    Step {activeStepIndex + 1} of {tabs.length}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5e5872]">{completionLabel}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#ede4ff]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#5b21b6)] shadow-[0_8px_24px_rgba(91,33,182,0.28)] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[#61597a]">
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Preview before payment
                  </span>
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Save answers as you go
                  </span>
                  <span className="rounded-full border border-[#e5dcff] bg-white px-3 py-1.5 shadow-sm">
                    Built for {jurisdiction}
                  </span>
                </div>
              </section>
              <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} />
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pb-8 text-center text-sm text-[#6f6788]">
        This service provides document preparation assistance. It does not provide legal advice.
      </div>
    </div>
  );
}

export default WizardShellV3;

