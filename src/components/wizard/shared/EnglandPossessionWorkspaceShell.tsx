'use client';

import React from 'react';
import { WizardShellV3 } from './WizardShellV3';
import {
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

interface EnglandPossessionWorkspaceShellProps {
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
  jurisdiction: Extract<WizardJurisdiction, 'england'>;
  currentStepId?: string;
  saveState?: 'idle' | 'saving' | 'saved';
  saveStatusLabel?: string;
  statusChips?: string[];
  stepIconPathOverride?: string;
  getStepMetadataForId?: (stepId: string) => StepMetadata | undefined;
  showStepCarryForwardHint?: boolean;
}

export function EnglandPossessionWorkspaceShell({
  title,
  completedCount,
  totalCount,
  progress,
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
  statusChips,
  stepIconPathOverride,
  getStepMetadataForId,
  showStepCarryForwardHint,
}: EnglandPossessionWorkspaceShellProps) {
  return (
    <WizardShellV3
      title={title}
      completedCount={completedCount}
      totalCount={totalCount}
      progress={progress}
      tabs={tabs}
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      banner={banner}
      sidebar={sidebar}
      guidancePanel={guidancePanel}
      navigation={navigation}
      navigationLeft={navigationLeft}
      navigationCenter={navigationCenter}
      navigationRight={navigationRight}
      product={product}
      jurisdiction={jurisdiction}
      currentStepId={currentStepId}
      saveState={saveState}
      saveStatusLabel={saveStatusLabel}
      statusChips={statusChips}
      stepIconPathOverride={stepIconPathOverride}
      getStepMetadataForId={getStepMetadataForId}
      showStepCarryForwardHint={showStepCarryForwardHint}
    >
      {children}
    </WizardShellV3>
  );
}

export default EnglandPossessionWorkspaceShell;
