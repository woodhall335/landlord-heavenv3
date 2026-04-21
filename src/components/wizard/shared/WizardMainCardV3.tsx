import React from 'react';
import { StepHeaderV3 } from './StepHeaderV3';

interface WizardMainCardV3Props {
  shellTitle?: string;
  sectionTitle: string;
  sectionDescription?: string;
  stepIconPath?: string;
  stepNumber?: number;
  totalSteps?: number;
  banner?: React.ReactNode;
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export function WizardMainCardV3({
  shellTitle,
  sectionTitle,
  sectionDescription,
  stepIconPath,
  stepNumber,
  totalSteps,
  banner,
  children,
  navigation,
}: WizardMainCardV3Props) {
  return (
    <main className="min-w-0 flex flex-1 flex-col lg:max-w-[860px]">
      {banner}
      <div className="flex flex-col rounded-2xl border border-violet-200 bg-white p-6 shadow-[0_12px_28px_rgba(76,29,149,0.10)] md:p-7">
        <div className="shrink-0">
          {shellTitle ? (
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-violet-700">
              {shellTitle}
            </div>
          ) : null}
          {stepNumber && totalSteps ? (
            <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
              Step {stepNumber} of {totalSteps}
            </div>
          ) : null}
          <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
        </div>

        <div className="min-h-0 overflow-visible">{children}</div>

        <div className="mt-6 shrink-0">{navigation}</div>
      </div>
    </main>
  );
}
