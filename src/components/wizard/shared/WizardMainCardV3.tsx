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
      <div className="flex flex-col overflow-hidden rounded-[1.7rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,246,255,0.96))] p-4 shadow-[0_28px_90px_rgba(76,29,149,0.12)] backdrop-blur-sm sm:p-5 md:rounded-[2rem] md:p-8">
        <div className="shrink-0">
          {shellTitle ? (
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7650cd] sm:text-[11px]">
              {shellTitle}
            </div>
          ) : null}
          {stepNumber && totalSteps ? (
            <div className="mb-4 inline-flex rounded-full border border-[#ddd1ff] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#5b36b3] shadow-sm sm:mb-5 sm:px-3.5 sm:text-xs">
              Step {stepNumber} of {totalSteps}
            </div>
          ) : null}
          <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
        </div>

        <div className="min-h-0 overflow-visible space-y-5">{children}</div>

        <div className="mt-6 shrink-0 md:mt-8">{navigation}</div>
      </div>
    </main>
  );
}
