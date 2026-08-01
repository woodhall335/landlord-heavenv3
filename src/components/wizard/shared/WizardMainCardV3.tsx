import React from 'react';
import { StepHeaderV3 } from './StepHeaderV3';

interface WizardMainCardV3Props {
  shellTitle?: string;
  sectionTitle: string;
  sectionDescription?: string;
  stepIconPath?: string;
  stepMotionKey?: string;
  banner?: React.ReactNode;
  showStepCarryForwardHint?: boolean;
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export function WizardMainCardV3({
  shellTitle,
  sectionTitle,
  sectionDescription,
  stepIconPath,
  stepMotionKey,
  banner,
  children,
  navigation,
}: WizardMainCardV3Props) {
  return (
    <main className="min-w-0 flex flex-1 flex-col lg:max-w-[860px]">
      {banner}
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#e4dcf5] bg-white/95 shadow-[0_18px_55px_rgba(76,29,149,0.09)] backdrop-blur-sm md:rounded-[1.5rem]">
        <div className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/70" />
        <div className="z-10 border-b border-[#eee8f8] bg-white/90 px-4 py-4 sm:px-5 md:px-7 md:py-5">
          {shellTitle ? (
            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7650cd] sm:text-[11px]">
                {shellTitle}
              </div>
              <span className="rounded-full border border-[#e4d8ff] bg-[#faf8ff] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6944bf]">
                Guided flow
              </span>
            </div>
          ) : null}
          <div key={`${stepMotionKey || sectionTitle}-header`} className="wizard-step-fade">
            <StepHeaderV3 title={sectionTitle} description={sectionDescription} iconPath={stepIconPath} />
          </div>
        </div>

        <div className="min-h-0 px-4 py-4 sm:px-5 md:px-7 md:py-5">
          <div key={stepMotionKey || sectionTitle} className="wizard-step-content wizard-step-fade min-h-0 overflow-visible space-y-4">
            {children}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 border-t border-[#eee8f8] bg-white/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_28px_rgba(76,29,149,0.07)] backdrop-blur-xl sm:px-5 md:px-7">
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
