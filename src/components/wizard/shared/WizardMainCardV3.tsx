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
      <div className="flex flex-col overflow-hidden rounded-[2rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,246,255,0.96))] p-6 shadow-[0_28px_90px_rgba(76,29,149,0.12)] backdrop-blur-sm md:p-8">
        <div className="shrink-0">
          {shellTitle ? (
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7650cd]">
              {shellTitle}
            </div>
          ) : null}
          {stepNumber && totalSteps ? (
            <div className="mb-5 inline-flex rounded-full border border-[#ddd1ff] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5b36b3] shadow-sm">
              Step {stepNumber} of {totalSteps}
            </div>
          ) : null}
          <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
        </div>

        <div className="min-h-0 overflow-visible">{children}</div>

        <div className="mt-8 shrink-0">{navigation}</div>
      </div>
    </main>
  );
}
