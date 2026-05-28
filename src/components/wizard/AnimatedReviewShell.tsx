'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiShieldCheckLine,
} from 'react-icons/ri';

export const WIZARD_REVIEW_ANIMATION_DURATION_MS = 20000;
const TICK_MS = 120;

export interface AnimatedReviewPhase {
  label: string;
  detail: string;
  shortLabel: string;
}

export interface AnimatedReviewStat {
  label: string;
  value: string;
  detail?: string;
}

export interface AnimatedReviewShellProps {
  title: string;
  subtitle: string;
  routeLabel: string;
  scoreLabel?: string;
  scoreValue?: string;
  scoreTone?: string;
  phases: AnimatedReviewPhase[];
  stats: AnimatedReviewStat[];
  checks: string[];
  warnings?: string[];
  positives?: string[];
  children: React.ReactNode;
}

export function getWizardReviewProgress(
  elapsedMs: number,
  durationMs = WIZARD_REVIEW_ANIMATION_DURATION_MS
) {
  if (durationMs <= 0) return 100;
  if (elapsedMs >= durationMs) return 100;
  return Math.min(99, Math.max(0, Math.floor((elapsedMs / durationMs) * 100)));
}

export function getWizardReviewPhaseIndex(
  elapsedMs: number,
  phaseCount: number,
  durationMs = WIZARD_REVIEW_ANIMATION_DURATION_MS
) {
  if (phaseCount <= 0) return 0;
  if (durationMs <= 0) return phaseCount - 1;
  return Math.min(
    phaseCount - 1,
    Math.max(0, Math.floor((elapsedMs / durationMs) * phaseCount))
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', listener);
    return () => mediaQuery.removeEventListener?.('change', listener);
  }, []);

  return reducedMotion;
}

export function AnimatedReviewShell({
  title,
  subtitle,
  routeLabel,
  scoreLabel = 'Review status',
  scoreValue = 'Checking',
  scoreTone = 'Ready',
  phases,
  stats,
  checks,
  warnings = [],
  positives = [],
  children,
}: AnimatedReviewShellProps) {
  const reducedMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(() =>
    prefersReducedMotion() ? WIZARD_REVIEW_ANIMATION_DURATION_MS : 0
  );

  useEffect(() => {
    if (reducedMotion) {
      const syncTimer = window.setTimeout(
        () => setElapsed(WIZARD_REVIEW_ANIMATION_DURATION_MS),
        0
      );
      return () => window.clearTimeout(syncTimer);
    }

    const startedAt = Date.now();
    const resetTimer = window.setTimeout(() => setElapsed(0), 0);
    const completionTimer = window.setTimeout(
      () => setElapsed(WIZARD_REVIEW_ANIMATION_DURATION_MS),
      WIZARD_REVIEW_ANIMATION_DURATION_MS
    );
    const timer = window.setInterval(() => {
      setElapsed(Math.min(Date.now() - startedAt, WIZARD_REVIEW_ANIMATION_DURATION_MS));
    }, TICK_MS);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(completionTimer);
      window.clearInterval(timer);
    };
  }, [reducedMotion]);

  const progress = getWizardReviewProgress(elapsed);
  const complete = progress >= 100;
  const phaseIndex = getWizardReviewPhaseIndex(elapsed, phases.length);
  const activePhase = phases[phaseIndex] ?? phases[0];
  const secondsRemaining = Math.max(
    0,
    Math.ceil((WIZARD_REVIEW_ANIMATION_DURATION_MS - elapsed) / 1000)
  );
  const visibleChecks = useMemo(
    () => checks.slice(0, Math.min(checks.length, Math.floor(progress / 16) + 1)),
    [checks, progress]
  );
  const visibleStats = useMemo(
    () => stats.slice(0, Math.min(stats.length, Math.floor(progress / 24) + 1)),
    [stats, progress]
  );
  const visibleWarnings = complete ? warnings : warnings.slice(0, Math.min(warnings.length, 2));
  const visiblePositives = progress >= 80 ? positives : positives.slice(0, 1);

  return (
    <main className="min-h-screen w-full bg-[linear-gradient(135deg,#fbf8ff_0%,#f6f0ff_46%,#ffffff_100%)] px-3 py-4 text-charcoal sm:px-5 lg:px-8 lg:py-7">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1600px] flex-col">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/15 bg-white/90 p-4 shadow-[0_18px_60px_rgba(76,29,149,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Landlord Heaven review
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-charcoal md:text-3xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
            <span className="relative flex h-2.5 w-2.5">
              {!complete && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            {complete ? 'Review complete' : `Reviewing - ${secondsRemaining}s left`}
          </div>
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex min-h-0 flex-col gap-5">
            <Card className="overflow-hidden border-primary/15 bg-white/95 p-5 shadow-[0_22px_70px_rgba(76,29,149,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {complete ? 'Review finished' : activePhase?.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {complete
                      ? 'The route summary and detailed review are ready below.'
                      : activePhase?.detail || subtitle}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-2xl font-bold text-primary-dark">
                  {progress}%
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-primary/10 shadow-inner">
                <div
                  className="relative h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary,#7c3aed),var(--color-primary-dark,#5b21b6))] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 animate-wizard-review-shine bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {phases.map((phase, index) => {
                  const done = complete || index < phaseIndex;
                  const active = !complete && index === phaseIndex;
                  return (
                    <div
                      key={phase.shortLabel}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-500 ${
                        active
                          ? 'border-primary/30 bg-primary/5 shadow-[0_14px_40px_rgba(76,29,149,0.10)]'
                          : done
                          ? 'border-emerald-200 bg-emerald-50/80'
                          : 'border-slate-200 bg-white/80'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                            ? 'bg-primary text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {done ? <RiCheckboxCircleLine className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{phase.shortLabel}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{phase.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="border-primary/15 bg-white/90 p-5 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
              <div className="flex items-center gap-2">
                <RiFileList3Line className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Before you continue</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {visibleChecks.map((check) => (
                  <span
                    key={check}
                    className="animate-wizard-review-pop rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    {check}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex min-h-0 flex-col gap-5">
            <Card className="border-primary/15 bg-white/95 p-5 shadow-[0_22px_70px_rgba(76,29,149,0.10)]">
              <p className="text-sm font-semibold text-primary">{routeLabel}</p>
              <p className="mt-2 text-base leading-7 text-slate-600">{subtitle}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {visibleStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="animate-wizard-review-rise rounded-2xl border border-primary/10 bg-primary/5 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-charcoal">{stat.value}</p>
                    {stat.detail && (
                      <p className="mt-1 text-sm leading-5 text-slate-600">{stat.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
              <Card className="animate-wizard-review-rise border-primary/15 bg-white/95 p-4 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {scoreLabel}
                </p>
                <p className="mt-2 text-4xl font-bold text-charcoal">{scoreValue}</p>
                <p className="mt-1 text-sm font-semibold capitalize text-emerald-700">{scoreTone}</p>
              </Card>

              <Card className="border-primary/15 bg-white/95 p-4 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
                <div className="flex items-center gap-2">
                  <RiShieldCheckLine className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Review findings</h2>
                </div>
                <div className="mt-4 grid gap-3">
                  {visiblePositives.map((positive) => (
                    <div
                      key={positive}
                      className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm leading-6 text-emerald-800"
                    >
                      <RiCheckboxCircleLine className="mt-1 h-4 w-4 shrink-0" />
                      <span>{positive}</span>
                    </div>
                  ))}
                  {visibleWarnings.map((warning) => (
                    <div
                      key={warning}
                      className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-sm leading-6 text-amber-900"
                    >
                      <RiErrorWarningLine className="mt-1 h-4 w-4 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {!complete && (
              <Card className="border-primary/15 bg-white/95 p-5 shadow-[0_18px_55px_rgba(76,29,149,0.08)]">
                <p className="text-sm font-semibold text-primary">Detailed review locked</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The full review and action buttons unlock after the 20-second review finishes.
                </p>
              </Card>
            )}
          </div>
        </div>

        {complete && (
          <div className="mt-5 w-full animate-wizard-review-rise rounded-3xl border border-primary/15 bg-white/90 p-3 shadow-[0_22px_70px_rgba(76,29,149,0.10)]">
            {children}
          </div>
        )}
      </section>

      <style>{`
        @keyframes wizardReviewShine {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes wizardReviewPop {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes wizardReviewRise {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-wizard-review-shine {
          animation: wizardReviewShine 1.35s linear infinite;
        }

        .animate-wizard-review-pop {
          animation: wizardReviewPop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-wizard-review-rise {
          animation: wizardReviewRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-wizard-review-shine,
          .animate-wizard-review-pop,
          .animate-wizard-review-rise {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
