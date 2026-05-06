'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

import { trackEvent } from '@/lib/analytics';
import type {
  GrowthCtaPosition,
  MarketingGrowthEventName,
  MarketingGrowthEventPayload,
} from '@/lib/analytics/growth-events';

type BridgeIntent = 'rent_increase' | 'section8' | 'money_claim' | 'tenancy_agreement' | string;

export interface CommercialBridgeProps {
  sourcePage: string;
  intent: BridgeIntent;
  headline: string;
  primaryProduct: string;
  primaryHref: string;
  secondaryProduct?: string;
  secondaryHref?: string;
  primaryToolHref?: string;
  ctaPosition: GrowthCtaPosition;
  proofPoints: string[];
  riskMessage: string;
  analyticsEventName?: MarketingGrowthEventName;
  primaryLabel?: string;
  secondaryLabel?: string;
  toolLabel?: string;
  body?: string;
  className?: string;
}

function labelFromProduct(product: string) {
  return product
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildPayload({
  sourcePage,
  intent,
  ctaPosition,
  destination,
  recommendedProduct,
  productClicked,
  toolName,
}: {
  sourcePage: string;
  intent: string;
  ctaPosition: GrowthCtaPosition;
  destination?: string;
  recommendedProduct?: string;
  productClicked?: string;
  toolName?: string;
}): MarketingGrowthEventPayload {
  return {
    sourcePage,
    pagePath: sourcePage,
    pageType: 'guide',
    intent,
    ctaPosition,
    destination,
    recommendedProduct,
    productClicked,
    userType: 'landlord',
    toolName,
  };
}

export function CommercialBridge({
  sourcePage,
  intent,
  headline,
  primaryProduct,
  primaryHref,
  secondaryProduct,
  secondaryHref,
  primaryToolHref,
  ctaPosition,
  proofPoints,
  riskMessage,
  analyticsEventName = 'commercial_bridge_clicked',
  primaryLabel,
  secondaryLabel,
  toolLabel,
  body,
  className,
}: CommercialBridgeProps) {
  useEffect(() => {
    trackEvent(
      'commercial_bridge_viewed',
      buildPayload({
        sourcePage,
        intent,
        ctaPosition,
        recommendedProduct: primaryProduct,
      }),
      {
        dedupeScope: 'page',
        dedupeKey: `${sourcePage}:${intent}:${ctaPosition}:commercial_bridge_viewed`,
      }
    );
  }, [ctaPosition, intent, primaryProduct, sourcePage]);

  const trackClick = (destination: string, productClicked?: string, toolName?: string) => {
    trackEvent(
      analyticsEventName,
      buildPayload({
        sourcePage,
        intent,
        ctaPosition,
        destination,
        recommendedProduct: primaryProduct,
        productClicked,
        toolName,
      })
    );

    if (productClicked) {
      trackEvent('product_cta_clicked', {
        sourcePage,
        pagePath: sourcePage,
        pageType: 'guide',
        intent,
        ctaPosition,
        destination,
        recommendedProduct: primaryProduct,
        productClicked,
        userType: 'landlord',
      });
    }
  };

  return (
    <section
      className={clsx(
        'my-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
        className
      )}
      data-commercial-bridge={intent}
      data-source-page={sourcePage}
      data-cta-position={ctaPosition}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {riskMessage}
          </div>
          <h2 className="max-w-3xl text-xl font-bold tracking-normal text-slate-950 sm:text-2xl">
            {headline}
          </h2>
          {body ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{body}</p> : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {primaryToolHref ? (
              <Link
                href={primaryToolHref}
                onClick={() => trackClick(primaryToolHref, undefined, intent)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {toolLabel || 'Check risk first'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}

            <Link
              href={primaryHref}
              onClick={() => trackClick(primaryHref, primaryProduct)}
              className={clsx(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
                primaryToolHref
                  ? 'border border-slate-300 bg-white text-slate-900 hover:border-slate-500 hover:bg-slate-50'
                  : 'bg-slate-950 text-white shadow-sm hover:bg-slate-800'
              )}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {primaryLabel || labelFromProduct(primaryProduct)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {secondaryProduct && secondaryHref ? (
              <Link
                href={secondaryHref}
                onClick={() => trackClick(secondaryHref, secondaryProduct)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                {secondaryLabel || labelFromProduct(secondaryProduct)}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-sm font-semibold text-slate-950">What this helps you do</p>
          <ul className="mt-4 space-y-3">
            {proofPoints.map((point) => (
              <li key={point} className="flex gap-2 text-sm leading-5 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function RentIncreaseBridge({
  sourcePage,
  ctaPosition,
  headline = 'Check if your rent increase is supportable before serving notice',
  className,
}: {
  sourcePage: string;
  ctaPosition: GrowthCtaPosition;
  headline?: string;
  className?: string;
}) {
  return (
    <CommercialBridge
      sourcePage={sourcePage}
      intent="rent_increase"
      headline={headline}
      primaryToolHref="/tools/rent-increase-challenge-checker"
      toolLabel="Check rent increase risk"
      primaryProduct="section13_standard"
      primaryHref="/products/section-13-standard"
      primaryLabel="Generate Section 13 pack"
      secondaryProduct="section13_defensive"
      secondaryHref="/products/section-13-defence"
      secondaryLabel="Prepare for tenant challenge"
      ctaPosition={ctaPosition}
      riskMessage="A weak rent figure can be challenged"
      proofPoints={[
        'Check the proposed rent against market support',
        'Decide whether Standard or Defence is the better route',
        'Keep Form 4A and Section 13 wording aligned with the facts',
      ]}
      body="Use the checker first if you are unsure whether the proposed rent is likely to stand up. Then choose the notice pack that matches the risk."
      className={className}
    />
  );
}

export function Section8Bridge({
  sourcePage,
  ctaPosition,
  headline = 'Need to serve notice or prepare for court?',
  className,
}: {
  sourcePage: string;
  ctaPosition: GrowthCtaPosition;
  headline?: string;
  className?: string;
}) {
  return (
    <CommercialBridge
      sourcePage={sourcePage}
      intent="section8"
      headline={headline}
      primaryProduct="complete_pack"
      primaryHref="/products/complete-pack"
      primaryLabel="Choose the right eviction pack"
      secondaryProduct="notice_only"
      secondaryHref="/products/notice-only"
      secondaryLabel="Generate notice pack"
      ctaPosition={ctaPosition}
      riskMessage="The wrong route can delay possession"
      proofPoints={[
        'Notice Only helps with Form 3A service',
        'Complete Pack adds claim forms and court preparation',
        'N5, N119, witness statement, arrears schedule, and readiness checks are covered in the court route',
      ]}
      body="If you only need to serve notice, start with Notice Only. If you expect to issue a claim or prepare for court, use the Complete Pack."
      className={className}
    />
  );
}

export function MoneyClaimBridge({
  sourcePage,
  ctaPosition,
  headline = 'Recover unpaid rent with a court-ready money claim pack',
  className,
}: {
  sourcePage: string;
  ctaPosition: GrowthCtaPosition;
  headline?: string;
  className?: string;
}) {
  return (
    <CommercialBridge
      sourcePage={sourcePage}
      intent="money_claim"
      headline={headline}
      primaryProduct="money_claim"
      primaryHref="/products/money-claim"
      primaryLabel="Create money claim pack"
      ctaPosition={ctaPosition}
      riskMessage="Rent arrears claims need clear figures and evidence"
      proofPoints={[
        'Turn arrears into a structured claim pack',
        'Prepare particulars, interest, and evidence prompts',
        'Keep the claim focused on unpaid rent and recoverable sums',
      ]}
      body="Use this when you want to claim unpaid rent as a money claim rather than only reading about MCOL."
      className={className}
    />
  );
}

export function TenancyAgreementBridge({
  sourcePage,
  ctaPosition,
  headline = 'Create the right tenancy agreement for this property',
  className,
}: {
  sourcePage: string;
  ctaPosition: GrowthCtaPosition;
  headline?: string;
  className?: string;
}) {
  return (
    <CommercialBridge
      sourcePage={sourcePage}
      intent="tenancy_agreement"
      headline={headline}
      primaryProduct="ast_standard"
      primaryHref="/products/ast"
      primaryLabel="Choose tenancy agreement pack"
      ctaPosition={ctaPosition}
      riskMessage="The agreement should match the property and occupier setup"
      proofPoints={[
        'Choose the right England tenancy route',
        'Include landlord-ready clauses and prescribed information prompts',
        'Avoid using the wrong template for the property type',
      ]}
      body="Start with the AST product page when the property is in England and you need a current landlord tenancy pack."
      className={className}
    />
  );
}

export default CommercialBridge;
