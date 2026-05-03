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

function getToneClasses(result: RentCheckerResult) {
  switch (result.resultState) {
    case 'landlord_low_risk':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        accent: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-100',
        icon: 'text-emerald-600',
      };
    case 'landlord_moderate_risk':
    case 'tenant_within_market':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        accent: 'from-amber-500 to-orange-500',
        border: 'border-amber-100',
        icon: 'text-amber-600',
      };
    case 'tenant_challengeable':
      return {
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        accent: 'from-sky-500 to-indigo-500',
        border: 'border-sky-100',
        icon: 'text-sky-600',
      };
    case 'landlord_high_risk':
    default:
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        accent: 'from-rose-500 to-red-500',
        border: 'border-rose-100',
        icon: 'text-rose-600',
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
    result.resultState === 'tenant_challengeable'
      ? 'Tenant route'
      : result.challengeRiskLabel === 'Low'
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
              ? `£${Math.round(result.marketLow)} – £${Math.round(result.marketHigh)} pcm`
              : 'Unavailable'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt>Market median</dt>
          <dd className="font-semibold text-slate-950">
            {result.marketMedian != null ? `£${Math.round(result.marketMedian)} pcm` : 'Unavailable'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt>Current rent</dt>
          <dd className="text-right">
            <div className="font-semibold text-slate-950">£{Math.round(result.currentRent)} pcm</div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.currentPositionLabel}</div>
          </dd>
        </div>
        {result.proposedRent != null ? (
          <div className="flex items-start justify-between gap-4">
            <dt>Proposed rent</dt>
            <dd className="text-right">
              <div className="font-semibold text-slate-950">£{Math.round(result.proposedRent)} pcm</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{result.proposedPositionLabel}</div>
            </dd>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-4">
          <dt>Position</dt>
          <dd className="font-semibold text-slate-950">{result.overallPositionLabel}</dd>
        </div>
      </dl>
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
            We’ll email your market range, risk band, evidence strength, and recommended next step.
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
              No thanks, I’ll continue
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
  { label: 'Tenant response handling', standard: false, defence: true },
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
                <td className="px-6 py-4 text-slate-600">{row.standard ? 'Included' : '—'}</td>
                <td className="px-6 py-4 text-slate-600">{row.defence ? 'Included' : '—'}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                    result.recommendedProduct === 'section13_standard' && row.standard
                      ? 'bg-indigo-50 text-indigo-700'
                      : result.recommendedProduct === 'section13_defensive' && row.defence
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-100 text-slate-500'
                  )}>
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
          Bundle recommendation only — phase one routes to the existing Standard and Defence products.
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
              {result.resultState.startsWith('tenant')
                ? 'Check challenge options'
                : result.recommendedProduct === 'section13_standard'
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
