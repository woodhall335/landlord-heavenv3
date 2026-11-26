'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getReviewPresentation, getReviewIllustrationSrc } from './reviewPresentation';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { RiCheckboxCircleLine, RiErrorWarningLine } from 'react-icons/ri';

// Legacy helpers remain available; the review UI no longer uses a timer.
export const WIZARD_REVIEW_ANIMATION_DURATION_MS = 20000;
export interface AnimatedReviewPhase { label: string; detail: string; shortLabel: string }
export interface AnimatedReviewStat { label: string; value: string; detail?: string }
export interface AnimatedReviewShellProps {
  title: string; subtitle: string; routeLabel: string;
  product?: string;
  jurisdiction?: string;
  isPaid?: boolean;
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

export function AnimatedReviewShell({title, subtitle, routeLabel, product, jurisdiction, isPaid, stats, checks, warnings = [], positives = [], children}: AnimatedReviewShellProps) {
  const presentation = getReviewPresentation(product);
  const packTitle = getPublicProductDescriptor(product)?.displayName || presentation.title;
  const packContents = <><h2 className="mt-4 text-xl font-semibold leading-tight tracking-tight">{packTitle}</h2><ul className="mt-5 space-y-3">{presentation.documents.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#eee5f7]"><RiCheckboxCircleLine aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#cbb0df]" />{item}</li>)}</ul><p className="mt-5 border-t border-white/20 pt-4 text-xs leading-6 text-[#d7c9e1]">{isPaid ? 'Regenerate your documents using your updated, saved answers.' : 'Next: review your prepared documents before secure payment.'}</p></>;
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-6 text-[#291d38] sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5deed] pb-5">
          <Link href="/" aria-label="Landlord Heaven home"><Image src="/images/logo.png" alt="Landlord Heaven" width={215} height={32} priority className="h-auto w-[185px] sm:w-[215px]" /></Link>
          <nav aria-label="Document preparation progress" className="flex flex-wrap items-center gap-3 text-xs text-[#696174]">
            <span className="flex items-center gap-1"><RiCheckboxCircleLine aria-hidden="true" /> Answers</span>
            <span aria-hidden="true">/</span><span aria-current="step" className="font-semibold text-primary">Review</span>
            <span aria-hidden="true">/</span><span>Preview</span>
          </nav>
        </header>
        <section className="my-5 grid grid-cols-[minmax(0,1fr)_42%] items-center gap-4 sm:grid-cols-[minmax(0,1fr)_45%] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{routeLabel}</p>
          <h1 className="mt-3 text-[1.6rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[1.9rem]">{product ? presentation.heading : title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#696174]">{product ? `Check your details and resolve any issues before ${isPaid ? 'regenerating your documents' : 'document preview'}.` : subtitle}</p>
          </div>
          <Image src={getReviewIllustrationSrc(product, jurisdiction)} alt="" width={640} height={340} priority sizes="(max-width: 640px) 42vw, (max-width: 1024px) 45vw, 420px" className="h-40 w-full object-contain sm:h-48 lg:h-56" />
        </section>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-label="Detailed review" className="min-w-0 rounded-2xl border border-[#e5deed] bg-white p-4 sm:p-6">{children}</section>
        <aside className="min-w-0 space-y-5">
          <details className="rounded-2xl bg-[#30203e] p-5 text-white lg:hidden">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-[#d7c2ed]">Your selected pack</summary>
            {packContents}
          </details>
          <section aria-label="Your selected pack" className="hidden rounded-2xl bg-[#30203e] p-6 text-white lg:block"><p className="text-xs font-semibold uppercase tracking-widest text-[#d7c2ed]">Your selected pack</p>{packContents}</section>
          {stats.length > 0 && <dl className="grid grid-cols-2 gap-x-4 gap-y-5 px-2">
            {stats.map(stat => <div key={stat.label} className="min-w-0"><dt className="text-xs text-[#696174]">{stat.label}</dt><dd className="mt-1 break-words text-base font-semibold">{stat.value}</dd>{stat.detail && <dd className="mt-1 text-xs leading-5 text-[#696174]">{stat.detail}</dd>}</div>)}
          </dl>}
        </aside>
        </div>
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
