import React from 'react';
import { StepHeaderV3 } from './StepHeaderV3';

interface WizardMainCardV3Props {
  shellTitle?: string;
  sectionTitle: string;
  sectionDescription?: string;
  stepIconPath?: string;
  stepNumber?: number;
  totalSteps?: number;
  stepMotionKey?: string;
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
  stepMotionKey,
  banner,
  children,
  navigation,
}: WizardMainCardV3Props) {
  return (
    <main className="min-w-0 flex flex-1 flex-col lg:max-w-[860px]">
      {banner}
      <div className="relative flex flex-col overflow-hidden rounded-[1.7rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(249,244,255,0.965))] shadow-[0_30px_90px_rgba(76,29,149,0.11)] backdrop-blur-sm md:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/70" />
        <div className="z-10 border-b border-[#eee6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,242,255,0.97))] px-4 pb-5 pt-4 shadow-[0_12px_28px_rgba(76,29,149,0.05)] sm:px-5 sm:pb-6 sm:pt-5 md:px-8 md:pb-6 md:pt-6">
          {shellTitle ? (
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7650cd] sm:text-[11px]">
                {shellTitle}
              </div>
              <span className="rounded-full border border-[#e4d8ff] bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6944bf] shadow-sm">
                Premium flow
              </span>
            </div>
          ) : null}
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            {stepNumber && totalSteps ? (
              <div className="inline-flex rounded-full border border-[#ddd1ff] bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-[#5b36b3] shadow-sm sm:px-3.5 sm:text-xs">
                Step {stepNumber} of {totalSteps}
              </div>
            ) : null}
            <span className="inline-flex rounded-full border border-[#ece3ff] bg-[#fbf8ff] px-3 py-1.5 text-[11px] font-medium text-[#746b90] shadow-sm sm:text-xs">
              Saved as you go
            </span>
          </div>
          <div key={`${stepMotionKey || sectionTitle}-header`} className="wizard-step-fade">
            <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
          </div>
        </div>

        <div className="min-h-0 px-4 pb-7 pt-5 sm:px-5 sm:pb-8 sm:pt-6 md:px-8 md:pb-9 md:pt-7">
          <div className="mb-5 rounded-[1.15rem] border border-[#f0e8ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,247,255,0.88))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <p className="text-[12px] font-medium leading-6 text-[#6d6488] sm:text-[13px]">
              Work through this step carefully. We will carry these answers through the final documents automatically.
            </p>
          </div>
          <div key={stepMotionKey || sectionTitle} className="wizard-step-fade min-h-0 overflow-visible space-y-6">
            {children}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 bg-[linear-gradient(180deg,rgba(252,249,255,0.72),rgba(247,241,255,0.985))] px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-16px_40px_rgba(76,29,149,0.11)] backdrop-blur-xl sm:px-5 sm:pt-5 md:px-8">
          {navigation}
        </div>
      </div>
      <style>{`
        .wizard-step-fade {
          animation: wizardStepFade 280ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }

        @keyframes wizardStepFade {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
