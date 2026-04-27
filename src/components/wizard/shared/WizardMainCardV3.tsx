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
      <div className="flex flex-col overflow-hidden rounded-[1.7rem] border border-[#e6dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,246,255,0.96))] shadow-[0_28px_90px_rgba(76,29,149,0.12)] backdrop-blur-sm md:rounded-[2rem]">
        <div className="sticky top-[calc(var(--site-header-height)+var(--s21-banner-height)+var(--wizard-topbar-height)+10px)] z-20 border-b border-[#efe6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,246,255,0.96))] px-4 pb-4 pt-4 shadow-[0_10px_28px_rgba(76,29,149,0.07)] backdrop-blur-xl sm:px-5 sm:pb-5 sm:pt-5 md:px-8 md:pb-6 md:pt-8">
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
          <div key={`${stepMotionKey || sectionTitle}-header`} className="wizard-step-fade">
            <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
          </div>
        </div>

        <div className="min-h-0 px-4 pb-6 pt-5 sm:px-5 sm:pb-7 sm:pt-6 md:px-8 md:pb-8 md:pt-7">
          <div key={stepMotionKey || sectionTitle} className="wizard-step-fade min-h-0 overflow-visible space-y-5">
            {children}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 bg-[linear-gradient(180deg,rgba(250,246,255,0.72),rgba(247,241,255,0.98))] px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_32px_rgba(76,29,149,0.10)] backdrop-blur-xl sm:px-5 sm:pt-5 md:px-8">
          {navigation}
        </div>
      </div>
      <style>{`
        .wizard-step-fade {
          animation: wizardStepFade 220ms ease-out;
        }

        @keyframes wizardStepFade {
          0% {
            opacity: 0;
            transform: translateY(6px);
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
