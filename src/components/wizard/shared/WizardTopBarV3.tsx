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
  const completedCount = tabs.filter((tab) => tab.isComplete).length;
  const issueCount = tabs.filter((tab) => tab.hasIssue).length;

  return (
    <header className="fixed left-0 right-0 top-[calc(var(--site-header-height)+var(--s21-banner-height))] z-40 border-b border-[#ece3ff] bg-[rgba(255,255,255,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3">
        <div className="hidden shrink-0 lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b56d8]">
            Case progress
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="shrink-0 rounded-full border border-[#dacdff] bg-[linear-gradient(180deg,#f9f6ff_0%,#efe6ff_100%)] px-3 py-1 text-sm font-semibold text-[#552fb0] shadow-sm">
              Step {currentStepIndex + 1} of {tabs.length}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-900">
              {completedCount} complete
            </span>
            {issueCount > 0 ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                {issueCount} need attention
              </span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="mb-2 flex items-center justify-between gap-3 lg:hidden">
            <span className="shrink-0 rounded-full border border-[#dacdff] bg-[linear-gradient(180deg,#f9f6ff_0%,#efe6ff_100%)] px-3 py-1 text-sm font-semibold text-[#552fb0] shadow-sm">
              Step {currentStepIndex + 1} of {tabs.length}
            </span>
            {issueCount > 0 ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                {issueCount} warning{issueCount === 1 ? '' : 's'}
              </span>
              ) : null}
          </div>
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

