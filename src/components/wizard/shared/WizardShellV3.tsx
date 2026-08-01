'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { WizardMainCardV3 } from './WizardMainCardV3';
import { GuidancePanelV3 } from './GuidancePanelV3';
import { WizardFooterNavV3 } from './WizardFooterNavV3';
import { WizardTopBarV3 } from './WizardTopBarV3';
import { scrollWizardViewportToTop } from './scrollWizardViewportToTop';
import { WIZARD_JURISDICTION_ARTWORK } from './jurisdictionArtwork';
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

export interface WizardShellV3Props {
  title: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  tabs: WizardTab[];
  sectionTitle: string;
  sectionDescription?: string;
  banner?: React.ReactNode;
  sidebar?: React.ReactNode;
  guidancePanel?: React.ReactNode;
  children: React.ReactNode;
  navigation?: React.ReactNode;
  navigationLeft?: React.ReactNode;
  navigationCenter?: React.ReactNode;
  navigationRight?: React.ReactNode;
  product: WizardProduct;
  jurisdiction: WizardJurisdiction;
  currentStepId?: string;
  saveState?: 'idle' | 'saving' | 'saved';
  saveStatusLabel?: string;
  statusChips?: string[];
  stepIconPathOverride?: string;
  getStepMetadataForId?: (stepId: string) => StepMetadata | undefined;
  showStepCarryForwardHint?: boolean;
}

export function WizardShellV3({
  title,
  tabs,
  sectionTitle,
  sectionDescription,
  banner,
  sidebar,
  guidancePanel,
  children,
  navigation,
  navigationLeft,
  navigationCenter,
  navigationRight,
  product,
  jurisdiction,
  currentStepId,
  saveState = 'idle',
  saveStatusLabel,
  stepIconPathOverride,
  getStepMetadataForId,
  showStepCarryForwardHint,
}: WizardShellV3Props) {
  const hasMountedRef = useRef(false);
  const currentMeta: StepMetadata | undefined = currentStepId
    ? (getStepMetadataForId ? getStepMetadataForId(currentStepId) : getStepMetadata(product, jurisdiction, currentStepId))
    : undefined;

  const currentTabIndex = tabs.findIndex((tab) => tab.isCurrent);
  const activeStepIndex = currentTabIndex >= 0 ? currentTabIndex : 0;
  const artwork = WIZARD_JURISDICTION_ARTWORK[jurisdiction];
  const resolvedGuidancePanel = guidancePanel ?? <GuidancePanelV3 metadata={currentMeta} askHeaven={sidebar} />;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    scrollWizardViewportToTop('smooth');
  }, [jurisdiction, currentStepId, activeStepIndex]);

  return (
    <div
      className="wizard-ui-v3 relative min-h-screen overflow-x-clip"
      style={{
        backgroundColor: '#f8f4ff',
        backgroundImage:
          "radial-gradient(circle at top, rgba(241,234,255,0.80) 0%, rgba(251,249,255,0.96) 38%, rgba(255,255,255,1) 76%), linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(248,245,255,0.96) 100%)",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <WizardTopBarV3
        tabs={tabs}
        saveState={saveState}
        saveStatusLabel={saveStatusLabel}
        getStepMetadataForId={(stepId) =>
          getStepMetadataForId ? getStepMetadataForId(stepId) : getStepMetadata(product, jurisdiction, stepId)
        }
      />

      <div style={{ height: 'var(--wizard-topbar-height)' }} aria-hidden="true" />

      {artwork.left ? (
        <div className="pointer-events-none absolute bottom-0 left-[-4rem] top-[calc(var(--wizard-topbar-height)+2rem)] hidden w-[clamp(280px,27vw,430px)] xl:block" aria-hidden="true">
          <Image src={artwork.left} alt="" fill sizes="430px" className="object-contain object-left opacity-60 2xl:opacity-75" priority />
        </div>
      ) : null}
      {artwork.right ? (
        <div
          className="pointer-events-none fixed bottom-[-4rem] right-[-10rem] top-[calc(var(--site-header-height)+var(--s21-banner-height)+var(--wizard-topbar-height)-1rem)] hidden w-[clamp(520px,43vw,760px)] xl:block"
          aria-hidden="true"
        >
          <Image src={artwork.right} alt="" fill sizes="760px" className="object-contain object-right opacity-65 2xl:opacity-75" priority />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-4 px-3 pb-10 pt-4 sm:px-4 lg:grid-cols-[minmax(0,860px)_260px] lg:gap-5">
        <WizardMainCardV3
          shellTitle={title}
          sectionTitle={sectionTitle}
          sectionDescription={sectionDescription}
          stepIconPath={stepIconPathOverride || resolveStepIconPath(currentMeta)}
          stepMotionKey={currentStepId || sectionTitle}
          banner={banner}
          showStepCarryForwardHint={showStepCarryForwardHint}
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

        <aside className="hidden w-full min-h-0 shrink-0 lg:block lg:self-start lg:w-[260px]">
          <div className="lg:sticky lg:top-[calc(var(--site-header-height)+var(--s21-banner-height)+var(--wizard-topbar-height)+16px)]">
            {resolvedGuidancePanel}
          </div>
        </aside>

        <div className="lg:hidden">{resolvedGuidancePanel}</div>
      </div>
    </div>
  );
}

export default WizardShellV3;


