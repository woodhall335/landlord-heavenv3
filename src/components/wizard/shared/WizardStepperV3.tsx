import React from 'react';
import Image from 'next/image';
import { RiCheckLine, RiErrorWarningLine, RiImageLine } from 'react-icons/ri';
import { resolveStepIconPath, type StepMetadata } from './stepMetadata';

interface WizardStepperTab {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
  onClick: () => void;
}

interface WizardStepperV3Props {
  tabs: WizardStepperTab[];
  getStepMetadataForId: (stepId: string) => StepMetadata | undefined;
}

export function WizardStepperV3({ tabs, getStepMetadataForId }: WizardStepperV3Props) {
  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex min-w-max gap-3">
        {tabs.map((tab) => {
          const iconPath = resolveStepIconPath(getStepMetadataForId(tab.id));
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex min-w-[170px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                tab.isCurrent
                  ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300/70'
                  : 'border-violet-200 bg-white hover:bg-violet-50/50'
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-violet-100">
                {iconPath ? (
                  <Image src={iconPath} alt="" fill sizes="(max-width: 768px) 48px, 64px" className="object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-violet-700">
                    <RiImageLine className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-violet-950">{tab.label}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-violet-700">
                  {tab.hasIssue ? <RiErrorWarningLine className="h-3.5 w-3.5" /> : tab.isComplete ? <RiCheckLine className="h-3.5 w-3.5" /> : null}
                  {tab.hasIssue ? 'Needs attention' : tab.isComplete ? 'Complete' : 'In progress'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
