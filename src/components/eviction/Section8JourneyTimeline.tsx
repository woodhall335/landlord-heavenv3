'use client';

import Image from 'next/image';
import { getSection8JourneySteps, getSection8JourneySummary, type EnglandSection8JourneyStage } from '@/lib/england-possession/section8-journey';

interface Section8JourneyTimelineProps {
  stage: EnglandSection8JourneyStage;
  title?: string;
  intro?: string;
  showHeader?: boolean;
  showStatus?: boolean;
  compact?: boolean;
  className?: string;
}

function stepCardClasses(isHighlighted: boolean, isEmphasized: boolean) {
  if (isEmphasized) {
    return 'border-[#c9b8f8] bg-[#f8f4ff] shadow-[0_10px_26px_rgba(36,18,71,0.06)]';
  }

  if (isHighlighted) {
    return 'border-[#ddd6fe] bg-[#faf8ff]';
  }

  return 'border-[#e5e7eb] bg-[#f8fafc]';
}

function imageShellClasses(isHighlighted: boolean, isEmphasized: boolean) {
  if (isEmphasized) {
    return 'border-[#d5c7fb] bg-white';
  }

  if (isHighlighted) {
    return 'border-[#e6dcff] bg-white';
  }

  return 'border-[#e5e7eb] bg-white opacity-70';
}

export function Section8JourneyTimeline({
  stage,
  title = 'The possession journey',
  intro,
  showHeader = true,
  showStatus = true,
  compact = false,
  className,
}: Section8JourneyTimelineProps) {
  const steps = getSection8JourneySteps(stage);
  const resolvedIntro = intro || getSection8JourneySummary(stage);

  return (
    <section
      aria-label="Section 8 eviction journey timeline"
      className={`rounded-[1.8rem] border border-[#e7e2f3] bg-[#fcfbfe] p-5 sm:p-6 ${className || ''}`}
    >
      {showHeader ? (
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c5a8f]">
            Section 8 journey
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#17142b] sm:text-[1.9rem]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5f5877] sm:text-base">{resolvedIntro}</p>
        </div>
      ) : null}

      <div className={`${showHeader ? 'mt-5' : ''} overflow-x-auto`}>
        <div className="flex min-w-[760px] items-stretch gap-3 md:min-w-0 md:gap-4">
          {steps.map((step, index) => (
            <div key={step.key} className="flex min-w-[170px] flex-1 items-stretch gap-3">
              <article
                className={`flex-1 rounded-[1.45rem] border p-4 transition ${stepCardClasses(step.isHighlighted, step.isEmphasized)}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border ${imageShellClasses(step.isHighlighted, step.isEmphasized)}`}
                  >
                    <Image
                      src={step.imageSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-[#17142b]">{step.label}</p>
                    {showStatus && step.status ? (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d5a92]">
                        {step.status}
                      </p>
                    ) : null}
                  </div>
                </div>

                <p className={`mt-3 text-sm leading-6 text-[#5f5877] ${compact ? 'line-clamp-3' : ''}`}>
                  {step.text}
                </p>
              </article>

              {index < steps.length - 1 ? (
                <div className="hidden items-center justify-center text-[#8e84a8] md:flex" aria-hidden="true">
                  <span className="text-xl">→</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Section8JourneyTimeline;
