'use client';

import React from 'react';
import { RiCheckboxCircleLine, RiErrorWarningLine, RiFileList3Line } from 'react-icons/ri';

// Legacy helpers remain available; the review UI no longer uses a timer.
export const WIZARD_REVIEW_ANIMATION_DURATION_MS = 20000;
export interface AnimatedReviewPhase { label: string; detail: string; shortLabel: string }
export interface AnimatedReviewStat { label: string; value: string; detail?: string }
export interface AnimatedReviewShellProps {
  title: string; subtitle: string; routeLabel: string;
  scoreLabel?: string; scoreValue?: string; scoreTone?: string;
  phases: AnimatedReviewPhase[]; stats: AnimatedReviewStat[]; checks: string[];
  warnings?: string[]; positives?: string[]; children: React.ReactNode;
}
export function getWizardReviewProgress(elapsedMs: number, durationMs = WIZARD_REVIEW_ANIMATION_DURATION_MS) {
  if (durationMs <= 0 || elapsedMs >= durationMs) return 100;
  return Math.min(99, Math.max(0, Math.floor(elapsedMs / durationMs * 100)));
}
export function getWizardReviewPhaseIndex(elapsedMs: number, phaseCount: number, durationMs = WIZARD_REVIEW_ANIMATION_DURATION_MS) {
  if (phaseCount <= 0) return 0;
  if (durationMs <= 0) return phaseCount - 1;
  return Math.min(phaseCount - 1, Math.max(0, Math.floor(elapsedMs / durationMs * phaseCount)));
}

export function AnimatedReviewShell({title, subtitle, routeLabel, stats, checks, warnings = [], positives = [], children}: AnimatedReviewShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f6fc] px-4 py-6 text-[#241739] sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5deed] pb-5">
          <p className="text-sm font-bold tracking-tight"><span className="text-primary">LANDLORD</span> HEAVEN</p>
          <nav aria-label="Document preparation progress" className="flex flex-wrap items-center gap-3 text-xs text-[#696174]">
            <span className="flex items-center gap-1"><RiCheckboxCircleLine aria-hidden="true" /> Answers</span>
            <span aria-hidden="true">/</span><span aria-current="step" className="font-semibold text-primary">Review</span>
            <span aria-hidden="true">/</span><span>Preview</span>
          </nav>
        </header>
        <section className="relative isolate my-6 overflow-hidden rounded-3xl border border-[#e5deed] bg-white p-6 sm:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-[#f0eafb] blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{routeLabel}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#696174]">{subtitle}</p>
          <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#696174]"><RiFileList3Line aria-hidden="true" className="h-4 w-4 text-primary" /> Review your answers and any flagged issues before continuing.</p>
          {stats.length > 0 && <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#eee8f4] pt-5 sm:grid-cols-4">
            {stats.map(stat => <div key={stat.label} className="min-w-0"><dt className="text-xs text-[#696174]">{stat.label}</dt><dd className="mt-1 break-words text-base font-semibold">{stat.value}</dd>{stat.detail && <dd className="mt-1 text-xs leading-5 text-[#696174]">{stat.detail}</dd>}</div>)}
          </dl>}
        </section>
        <section aria-label="Detailed review" className="rounded-3xl border border-[#e5deed] bg-white p-4 shadow-[0_12px_40px_rgba(50,30,80,0.04)] sm:p-7">{children}</section>
        <details className="mt-5 rounded-2xl border border-[#e5deed] bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold">Review notes and reminders</summary>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div><h2 className="mb-3 text-sm font-semibold">Checks covered</h2><ul className="space-y-2">{checks.map(check => <li key={check} className="flex items-start gap-2 text-sm leading-6"><RiCheckboxCircleLine aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-primary" />{check}</li>)}</ul></div>
            <div className="space-y-3">{positives.map(item => <p key={item} className="text-sm leading-6 text-[#696174]">{item}</p>)}{warnings.map(item => <p key={item} className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900"><RiErrorWarningLine aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />{item}</p>)}</div>
          </div>
        </details>
        <p className="px-1 py-5 text-xs leading-6 text-[#696174]">Automated checks use the answers you supplied. Review the documents and supporting records before relying on them.</p>
      </div>
    </main>
  );
}
