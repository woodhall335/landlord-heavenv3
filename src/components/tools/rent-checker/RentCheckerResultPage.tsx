'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Download, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

import { Button } from '@/components/ui/Button';
import { captureLead } from '@/components/leads/useLeadCapture';
import { trackEvent } from '@/lib/analytics';
import { PRODUCTS } from '@/lib/pricing/products';
import type { RentCheckerResult } from '@/lib/section13';

interface RentCheckerResultPageProps {
  result: RentCheckerResult;
  onRestart: () => void;
}

export interface RentCheckerSourceStatus {
  source: 'rightmove' | 'openrent';
  route: string | null;
  ok: boolean;
  count: number;
  detail: string;
}

export interface RentCheckerInsufficientEvidenceState {
  code: 'insufficient_live_comparables';
  message: string;
  sourceStatuses: RentCheckerSourceStatus[];
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) {
    return 'Unavailable';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getToneClasses(result: RentCheckerResult) {
  switch (result.resultState) {
    case 'landlord_low_risk':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        accent: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-100',
      };
    case 'landlord_moderate_risk':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        accent: 'from-amber-500 to-orange-500',
        border: 'border-amber-100',
      };
    case 'landlord_high_risk':
    default:
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        accent: 'from-rose-500 to-red-500',
        border: 'border-rose-100',
      };
  }
}

function recommendedRouteLabel(result: RentCheckerResult) {
  return result.recommendedProduct === 'section13_standard'
    ? 'Standard Section 13 Pack'
    : 'Section 13 Defence Pack';
}

function trackProductCta(result: RentCheckerResult, clickedProduct: 'section13_standard' | 'section13_defensive') {
  trackEvent('product_cta_clicked', {
    recommendedProduct: result.recommendedProduct,
    clickedProduct,
    resultState: result.resultState,
    challengeRisk: result.challengeRisk,
    evidenceStrength: result.evidenceStrength,
  });
}

function buildEventPayload(result: RentCheckerResult) {
  return {
    userType: result.userType,
    postcodeOutcode: result.postcodeOutcode,
    bedrooms: result.bedrooms,
    currentRent: result.currentRent,
    proposedRent: result.proposedRent ?? undefined,
    marketMedian: result.marketMedian ?? undefined,
    evidenceStrength: result.evidenceStrength,
    challengeRisk: result.challengeRisk,
    recommendedProduct: result.recommendedProduct,
    resultState: result.resultState,
  };
}

function CtaLink({
  href,
  label,
  variant,
  subtext,
  onClick,
}: {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
  subtext?: string;
  onClick?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Link href={href} onClick={onClick} className="block">
        <Button
          variant={variant === 'primary' ? 'primary' : 'outline'}
          size="large"
          fullWidth
          className={clsx(
            variant === 'primary'
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
              : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
          )}
        >
          {label}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      {subtext ? <p className="text-sm leading-6 text-slate-500">{subtext}</p> : null}
    </div>
  );
}

export function ResultHeroCard({ result }: { result: RentCheckerResult }) {
  const tone = getToneClasses(result);
  const badgeLabel =
    result.challengeRiskLabel === 'Low'
      ? 'Supportable'
      : result.challengeRiskLabel === 'Moderate'
        ? 'Prepare well'
        : 'Higher risk';

  return (
    <div className={clsx('overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]', tone.border)}>
      <div className={clsx('h-2 w-full bg-gradient-to-r', tone.accent)} />
      <div className="space-y-5 p-7 sm:p-8">
        <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', tone.badge)}>
          {badgeLabel}
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{result.headline}</h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{result.subheadline}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{result.moneyImpactLabel}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{result.moneyImpactValue}</p>
        </div>
      </div>
    </div>
  );
}

export function MarketPositionCard({ result }: { result: RentCheckerResult }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">Your position vs local market</h3>
      <dl className="mt-5 space-y-4 text-sm text-slate-600">
        <div className="flex items-start justify-between gap-4">
          <dt>Estimated range</dt>
          <dd className="font-semibold text-slate-950">
            {result.marketLow != null && result.marketHigh != null
              ? `${formatCurrency(result.marketLow)} - ${formatCurrency(result.marketHigh)} pcm`
              : 'Unavailable'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt>Market median</dt>
          <dd className="max-w-[14rem] text-right">
            <div className="font-semibold text-slate-950">
              {result.marketMedian != null ? `${formatCurrency(result.marketMedian)} pcm` : 'Unavailable'}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{result.medianExplanation}</div>
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt>Current rent</dt>
          <dd className="text-right">
            <div className="font-semibold text-slate-950">{formatCurrency(result.currentRent)} pcm</div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.currentPositionLabel}</div>
          </dd>
        </div>
        {result.proposedRent != null ? (
          <div className="flex items-start justify-between gap-4">
            <dt>Proposed rent</dt>
            <dd className="text-right">
              <div className="font-semibold text-slate-950">{formatCurrency(result.proposedRent)} pcm</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.proposedPositionLabel}</div>
            </dd>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-4">
          <dt>Position</dt>
          <dd className="font-semibold text-slate-950">{result.overallPositionLabel}</dd>
        </div>
      </dl>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Calculation basis</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          {result.marketExplanation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RiskEvidenceCard({ result }: { result: RentCheckerResult }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">Risk and evidence</h3>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Challenge risk</dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">{result.challengeRiskLabel}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Evidence strength</dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">{result.evidenceStrength}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Comparable count</dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">{result.comparableCount}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Freshness</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-950">{result.freshnessLabel}</dd>
        </div>
      </dl>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Why this risk band</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{result.challengeExplanation}</p>
        </div>
        {result.saferRangeGuidance ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Safer range guidance</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">{result.saferRangeGuidance}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ComparableListingsCard({ result }: { result: RentCheckerResult }) {
  const groups = [
    {
      title: 'Used in market calculation',
      copy: 'These listings directly affect the displayed market range and median.',
      items: result.usedComparableListings,
    },
    {
      title: 'Context only',
      copy: 'These listings are nearby or relevant enough to show, but they do not directly support the final median or range.',
      items: result.contextComparableListings,
    },
    {
      title: 'Excluded / outlier',
      copy: 'These listings are shown for transparency, but they were excluded from the market calculation.',
      items: result.excludedComparableListings,
    },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Comparable evidence</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Every listing is labelled so you can see whether it influenced the market calculation or is shown only for context.
          </p>
        </div>
        <p className="max-w-sm text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {result.scrapeSummary}
        </p>
      </div>

      <div className="mt-5 space-y-8">
        {groups.map((group) => (
          <section key={group.title} className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-950">{group.title}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">{group.copy}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60">
                  <div className="aspect-[4/3] bg-slate-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.address}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available</div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                            item.usedInCalculation
                              ? 'bg-emerald-50 text-emerald-700'
                              : group.title.startsWith('Excluded')
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-200 text-slate-700'
                          )}
                        >
                          {item.reasonLabel}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.freshnessStatus}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-semibold leading-6 text-slate-950">{item.address}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {[item.propertyType, item.bedrooms != null ? `${item.bedrooms} bed` : null]
                          .filter(Boolean)
                          .join(' • ') || 'Comparable property'}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Raw listed rent</p>
                        <p className="mt-1 text-base font-semibold text-slate-950">{formatCurrency(item.rentPcmRaw)} pcm</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Adjusted rent used</p>
                        <p className="mt-1 text-base font-semibold text-slate-950">{formatCurrency(item.rentPcmAdjusted)} pcm</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p><span className="font-medium text-slate-700">Adjustment:</span> {item.adjustmentReason}</p>
                      <p><span className="font-medium text-slate-700">Reason:</span> {item.reasonDetail}</p>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xs leading-5 text-slate-500">{item.sourceLabel}</p>
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          View source
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function RecommendedActionCard({ result }: { result: RentCheckerResult }) {
  const product = PRODUCTS[result.recommendedProduct];
  const onPrimaryClick = () => {
    trackProductCta(result, result.recommendedProduct);
    if (result.primaryCtaTracksCheckout) {
      trackEvent('checkout_started', {
        product: result.recommendedProduct,
        source: 'rent_checker',
        resultState: result.resultState,
      });
    }
  };

  const onSecondaryClick = () => {
    const clickedProduct =
      result.secondaryCtaHref?.includes('section13_standard') ||
      result.secondaryCtaHref?.includes('section-13-standard')
        ? 'section13_standard'
        : 'section13_defensive';
    trackProductCta(result, clickedProduct);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-7">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended next step</p>
            <h3 className="text-xl font-semibold text-slate-950">{recommendedRouteLabel(result)}</h3>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Paid route</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{product.label}</p>
          <p className="mt-1 text-sm text-slate-500">{product.displayPrice} one-time</p>
        </div>

        <CtaLink
          href={result.primaryCtaHref}
          label={result.primaryCtaLabel}
          variant="primary"
          subtext={result.primaryCtaSubtext}
          onClick={onPrimaryClick}
        />

        {result.secondaryCtaLabel && result.secondaryCtaHref ? (
          <CtaLink
            href={result.secondaryCtaHref}
            label={result.secondaryCtaLabel}
            variant="secondary"
            onClick={onSecondaryClick}
          />
        ) : null}
      </div>
    </div>
  );
}

export function WhatThisMeansCard({ result }: { result: RentCheckerResult }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">What this means</h3>
      <p className="mt-4 text-base leading-7 text-slate-600">{result.whatThisMeans}</p>
    </div>
  );
}

export function NextStepsCard({ result }: { result: RentCheckerResult }) {
  const onRepeatCtaClick = () => {
    trackProductCta(result, result.recommendedProduct);
    if (result.primaryCtaTracksCheckout) {
      trackEvent('checkout_started', {
        product: result.recommendedProduct,
        source: 'rent_checker',
        resultState: result.resultState,
      });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">What should I do next?</h3>
      <ul className="mt-4 space-y-3">
        {result.nextSteps.map((step) => (
          <li key={step} className="flex items-start gap-3 text-base leading-7 text-slate-600">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Check className="h-4 w-4" />
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Link href={result.primaryCtaHref} onClick={onRepeatCtaClick}>
          <Button size="large" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
            {result.primaryCtaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function EmailReportCapture({ result }: { result: RentCheckerResult }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    if (!consent) {
      setError('Please confirm you want the report and follow-up emails.');
      return;
    }

    setLoading(true);

    try {
      const leadResult = await captureLead({
        email: email.trim(),
        source: 'tool:rent-increase-challenge-checker',
        jurisdiction: 'england',
        tags: ['rent_checker', 'section13_checker'],
        marketingConsent: true,
      });

      if (!leadResult.success) {
        setError(leadResult.error || 'Failed to save your email.');
        setStatus('error');
        return;
      }

      const response = await fetch('/api/tools/rent-increase-challenge-checker/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'tool:rent-increase-challenge-checker',
          jurisdiction: 'england',
          marketingConsent: true,
          result,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Failed to queue your report.');
        setStatus('error');
        return;
      }

      trackEvent('email_submitted', buildEventPayload(result));
      setStatus('success');
    } catch (submitError) {
      console.error(submitError);
      setError('Failed to queue your report.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Download className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Get your full rent evidence report</h3>
          <p className="mt-2 text-base leading-7 text-slate-600">
            We'll email your market range, risk band, evidence strength, and recommended next step.
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Your report request is queued. Check your inbox for the summary and follow-up emails.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
            />
            <span>I agree to receive my report and helpful follow-up emails.</span>
          </label>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              size="large"
              loading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300"
            >
              Send my report
            </Button>
            <button type="button" onClick={() => setStatus('idle')} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              No thanks, I'll continue
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            This tool gives guidance based on the information entered and available comparable market evidence. It is not a formal valuation or legal advice.
          </p>
        </form>
      )}
    </div>
  );
}

const comparisonRows = [
  { label: 'Form 4A notice', standard: true, defence: true },
  { label: 'Rent summary', standard: true, defence: true },
  { label: 'Market justification report', standard: true, defence: true },
  { label: 'Proof of service', standard: true, defence: true },
  { label: 'Challenge response handling', standard: false, defence: true },
  { label: 'Tribunal argument summary', standard: false, defence: true },
  { label: 'Tribunal bundle', standard: false, defence: true },
  { label: 'Legal briefing', standard: false, defence: true },
];

export function ProductComparisonStrip({ result }: { result: RentCheckerResult }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h3 className="text-xl font-semibold text-slate-950">Route comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-6 py-4">Feature</th>
              <th className="px-6 py-4">Standard Section 13 Pack</th>
              <th className="px-6 py-4">Section 13 Defence Pack</th>
              <th className="px-6 py-4">Recommended route</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {comparisonRows.map((row) => (
              <tr key={row.label}>
                <td className="px-6 py-4 font-medium text-slate-900">{row.label}</td>
                <td className="px-6 py-4 text-slate-600">{row.standard ? 'Included' : '-'}</td>
                <td className="px-6 py-4 text-slate-600">{row.defence ? 'Included' : '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                      result.recommendedProduct === 'section13_standard' && row.standard
                        ? 'bg-indigo-50 text-indigo-700'
                        : result.recommendedProduct === 'section13_defensive' && row.defence
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {result.recommendedProduct === 'section13_standard'
                      ? row.standard ? 'Recommended' : 'Optional'
                      : row.defence ? 'Recommended' : 'Optional'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BundleUpsellBlock({ result }: { result: RentCheckerResult }) {
  const onClick = () => {
    trackEvent('bundle_cta_clicked', {
      recommendedProduct: result.recommendedProduct,
      clickedProduct: 'section13_defensive',
      resultState: result.resultState,
      challengeRisk: result.challengeRisk,
      evidenceStrength: result.evidenceStrength,
    });
  };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm sm:p-7">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-semibold text-slate-950">Want full protection?</h3>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Use the complete Section 13 route: notice, evidence, service record, and tribunal defence preparation.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Serve correctly',
            copy: 'Generate Form 4A and supporting notice documents.',
          },
          {
            title: 'Prove the rent',
            copy: 'Use comparable evidence and a justification report.',
          },
          {
            title: 'Prepare for challenge',
            copy: 'Build the tribunal bundle, argument summary, and response pack.',
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">{card.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={result.bundleCtaHref} onClick={onClick}>
          <Button size="large" className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
            Get the full Section 13 protection route
          </Button>
        </Link>
        <p className="text-sm text-slate-500">
          Bundle recommendation only - phase one routes to the existing Standard and Defence products.
        </p>
      </div>
    </div>
  );
}

export function DisclaimerBlock({ result }: { result: RentCheckerResult }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 text-slate-500" />
        <p className="text-sm leading-6 text-slate-600">{result.disclaimer}</p>
      </div>
    </div>
  );
}

function sourceNameLabel(source: RentCheckerSourceStatus['source']) {
  return source === 'rightmove' ? 'Rightmove' : 'OpenRent';
}

export function RentCheckerInsufficientEvidencePage({
  failure,
  onRetry,
  onEditDetails,
}: {
  failure: RentCheckerInsufficientEvidenceState;
  onRetry: () => void;
  onEditDetails: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="space-y-5 p-7 sm:p-8">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            More evidence needed
          </span>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              We could not gather enough live comparables for a grounded result
            </h2>
            <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {failure.message}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              What this means
            </p>
            <p className="mt-2 text-base leading-7 text-slate-700">
              We only show a supportability result when we can ground it on at least 3 real live
              comparable listings. That protects the checker from giving a false sense of certainty.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">Live source check</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is what each live source returned during the search.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {failure.sourceStatuses.map((status) => (
                <div
                  key={status.source}
                  className={clsx(
                    'rounded-2xl border p-5',
                    status.ok
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {sourceNameLabel(status.source)}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {status.count} live listing{status.count === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                        status.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {status.ok ? 'Usable' : 'No match'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{status.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">What should I do next?</h3>
            <ul className="mt-4 space-y-3">
              {[
                'Retry the live search in case new listings or a temporary source issue changes the result.',
                'Check the postcode, bedroom count, and property type if the search area was too narrow.',
                'Use real linked comparables in the paid Section 13 flow if you already have suitable market evidence.',
              ].map((step) => (
                <li key={step} className="flex items-start gap-3 text-base leading-7 text-slate-600">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-7">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Next action
                </p>
                <h3 className="text-xl font-semibold text-slate-950">Strengthen the evidence first</h3>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Best path from here</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Retry the live search or move into the Standard pack with real linked evidence
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={onRetry}
                size="large"
                fullWidth
                className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300"
              >
                Retry live search
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-sm leading-6 text-slate-500">
                Run the search again before serving Form 4A.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onEditDetails}
                size="large"
                fullWidth
                className="border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
              >
                Edit property details
              </Button>
              <p className="text-sm leading-6 text-slate-500">
                Change the postcode or property details and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RentCheckerResultPage({ result, onRestart }: RentCheckerResultPageProps) {
  const [showStickyCta, setShowStickyCta] = useState(false);

  const onStickyCtaClick = () => {
    trackProductCta(result, result.recommendedProduct);
    if (result.primaryCtaTracksCheckout) {
      trackEvent('checkout_started', {
        product: result.recommendedProduct,
        source: 'rent_checker',
        resultState: result.resultState,
      });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <ResultHeroCard result={result} />
          <div className="grid gap-6 lg:grid-cols-2">
            <MarketPositionCard result={result} />
            <RiskEvidenceCard result={result} />
          </div>
          <ComparableListingsCard result={result} />
        </div>
        <RecommendedActionCard result={result} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WhatThisMeansCard result={result} />
        <NextStepsCard result={result} />
      </div>

      <EmailReportCapture result={result} />
      <ProductComparisonStrip result={result} />
      {result.showBundleUpsell ? <BundleUpsellBlock result={result} /> : null}
      <DisclaimerBlock result={result} />

      <div className="flex justify-end">
        <button onClick={onRestart} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Run the checker again
        </button>
      </div>

      {showStickyCta ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
            <Link href={result.primaryCtaHref} onClick={onStickyCtaClick} className="block">
              <Button fullWidth className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
              {result.recommendedProduct === 'section13_standard'
                ? 'Generate Section 13 notice'
                : 'Prepare for challenge'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
        </div>
      ) : null}
    </div>
  );
}

export default RentCheckerResultPage;
