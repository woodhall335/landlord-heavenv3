import React from 'react';
import { StepHeaderV3 } from './StepHeaderV3';

interface WizardMainCardV3Props {
  sectionTitle: string;
  sectionDescription?: string;
  stepIconPath?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export function WizardMainCardV3({ sectionTitle, sectionDescription, stepIconPath, banner, children, navigation }: WizardMainCardV3Props) {
  return (
    <main className="min-w-0 flex flex-1 flex-col lg:max-w-[860px]">
      {banner}
      <div className="flex min-h-[min(720px,calc(100vh-260px))] flex-col rounded-xl border border-violet-200 bg-white p-6 shadow-[0_8px_22px_rgba(31,41,55,0.08)] md:p-7">
        <div className="shrink-0">
          <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
        </div>
        <div className="min-h-0 flex-1 overflow-visible">
          {children}
        </div>
        <div className="mt-auto shrink-0">
          {navigation}
        </div>
      </div>
    </main>
  );
}
