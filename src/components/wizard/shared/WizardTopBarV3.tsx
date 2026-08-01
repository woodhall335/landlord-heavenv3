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
  saveState?: 'idle' | 'saving' | 'saved';
  saveStatusLabel?: string;
}

export function WizardTopBarV3({
  tabs,
  getStepMetadataForId,
  saveState = 'idle',
  saveStatusLabel,
}: WizardTopBarV3Props) {
  const currentStepIndex = Math.max(
    tabs.findIndex((tab) => tab.isCurrent),
    0
  );
  const saveLabel = saveStatusLabel || (saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Auto-save on');

  return (
    <header className="fixed left-0 right-0 top-[calc(var(--site-header-height)+var(--s21-banner-height))] z-40 h-[var(--wizard-topbar-height)] border-b border-[#e9e2f7] bg-[#ffffffdb] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1480px] flex-col gap-2 px-4 py-2.5 lg:flex-row lg:items-center lg:gap-5 lg:px-6">
        <div className="flex shrink-0 items-center justify-between gap-3">
            <span className="shrink-0 rounded-lg border border-[#ded3f8] bg-white/90 px-3 py-1.5 text-sm font-semibold text-[#5b21b6] shadow-sm">
              Step {currentStepIndex + 1} of {tabs.length}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className={`h-2 w-2 rounded-full ${saveState === 'saving' ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`} />
              {saveLabel}
            </span>
        </div>

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

