import React, { useEffect, useRef } from 'react';
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { type StepMetadata } from './stepMetadata';

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
  variant?: 'surface' | 'header';
}

export function WizardStepperV3({ tabs, variant = 'surface' }: WizardStepperV3Props) {
  const isHeader = variant === 'header';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasAlignedOnceRef = useRef(false);
  const currentStepIndex = tabs.findIndex((tab) => tab.isCurrent);

  useEffect(() => {
    const container = containerRef.current;
    const activeButton = currentStepIndex >= 0 ? buttonRefs.current[currentStepIndex] : null;

    if (!container || !activeButton) {
      return;
    }

    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = window.requestAnimationFrame(() => {
      const containerWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;
      const activeStart = activeButton.offsetLeft;
      const activeWidth = activeButton.offsetWidth;
      const activeEnd = activeStart + activeWidth;
      const visibleStart = container.scrollLeft;
      const visibleEnd = visibleStart + containerWidth;
      const comfortPadding = Math.min(56, Math.max(24, Math.round(containerWidth * 0.14)));
      const comfortablyVisible =
        activeStart >= visibleStart + comfortPadding &&
        activeEnd <= visibleEnd - comfortPadding;

      const targetLeft = activeStart + activeWidth / 2 - containerWidth / 2;
      const maxScrollLeft = Math.max(scrollWidth - containerWidth, 0);
      const clampedTarget = Math.min(Math.max(targetLeft, 0), maxScrollLeft);

      if (comfortablyVisible) {
        hasAlignedOnceRef.current = true;
        return;
      }

      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: clampedTarget,
          behavior: !hasAlignedOnceRef.current || reduceMotion ? 'auto' : 'smooth',
        });
      } else {
        container.scrollLeft = clampedTarget;
      }
      hasAlignedOnceRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [currentStepIndex, tabs.length]);

  return (
    <div ref={containerRef} className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center">
        {tabs.map((tab, index) => {
          const isCurrent = tab.isCurrent;
          const hasIssue = Boolean(tab.hasIssue);
          const isComplete = Boolean(tab.isComplete);

          const connectorClass = isHeader
            ? isComplete || isCurrent
              ? 'bg-[#b99bff]'
              : hasIssue
              ? 'bg-rose-300/80'
              : 'bg-white/25'
            : isComplete || isCurrent
            ? 'bg-violet-400'
            : hasIssue
            ? 'bg-rose-300'
            : 'bg-violet-200';

          return (
            <li key={tab.id} className="flex items-center">
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                onClick={tab.onClick}
                aria-current={isCurrent ? 'step' : undefined}
                data-step-id={tab.id}
                className={[
                  'group inline-flex items-center gap-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300',
                  isHeader
                    ? isCurrent
                      ? 'rounded-full border border-[#ddceff] bg-white/88 px-2.5 py-1.5 shadow-sm'
                      : 'rounded-full border border-transparent px-2.5 py-1.5 hover:border-[#e5dbff] hover:bg-white/55'
                    : 'rounded-xl px-2 py-1.5',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition',
                    isCurrent
                      ? 'bg-[linear-gradient(180deg,#7c3aed_0%,#5b21b6_100%)] text-white ring-2 ring-[#d7c6ff]'
                      : isComplete
                      ? 'bg-emerald-500 text-white'
                      : hasIssue
                      ? 'bg-rose-500 text-white'
                      : isHeader
                      ? 'bg-[#efe7ff] text-[#5b36b3] group-hover:bg-white'
                      : 'bg-violet-100 text-violet-800 group-hover:bg-violet-200',
                  ].join(' ')}
                >
                  {isComplete ? (
                    <RiCheckLine className="h-4 w-4" />
                  ) : hasIssue ? (
                    <RiErrorWarningLine className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={[
                    'max-w-[156px] truncate font-medium',
                    isHeader ? 'text-sm' : 'text-sm',
                  isCurrent
                    ? isHeader
                        ? 'text-[#231246]'
                        : 'text-violet-950'
                      : hasIssue
                      ? isHeader
                        ? 'text-rose-700'
                        : 'text-rose-900'
                      : isHeader
                        ? 'text-[#6b6285] group-hover:text-[#231246]'
                        : 'text-violet-800 group-hover:text-violet-950',
                  ].join(' ')}
                >
                  {tab.label}
                </span>
              </button>

              {index < tabs.length - 1 ? (
                <span className={`mx-2 h-px w-8 ${connectorClass}`} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default WizardStepperV3;
