'use client';

import React from 'react';
import { type StepMetadata } from './stepMetadata';
import { WizardStepperV3 } from './WizardStepperV3';

interface WizardTopBarV3Tab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

interface WizardTopBarV3Props {
  tabs: WizardTopBarV3Tab[];
  getStepMetadataForId: (stepId: string) => StepMetadata | undefined;
}

export function WizardTopBarV3({ tabs, getStepMetadataForId }: WizardTopBarV3Props) {
  const currentStepIndex = Math.max(
    tabs.findIndex((tab) => tab.isCurrent),
    0
  );

  return (
    <header className="fixed left-0 right-0 top-[calc(var(--site-header-height)+var(--s21-banner-height))] z-40 border-b border-white/15 bg-[rgba(20,8,48,0.84)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-3">
        <span className="shrink-0 rounded-full border border-violet-200/40 bg-violet-500/25 px-3 py-1 text-sm font-semibold text-violet-50">
          Step {currentStepIndex + 1} of {tabs.length}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <WizardStepperV3
            tabs={tabs}
            getStepMetadataForId={getStepMetadataForId}
            variant="header"
          />
        </div>
      </div>
    </header>
  );
}

export default WizardTopBarV3;

