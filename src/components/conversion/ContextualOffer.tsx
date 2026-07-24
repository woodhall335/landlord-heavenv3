'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { getConversionMapping } from '@/lib/conversion/registry';
import {
  assignSales002OfferVariant,
  SALES002_CONTEXTUAL_OFFER_EXPERIMENT,
} from '@/lib/experiments/sales002';
import {
  getMarketingSessionId,
  recordMarketingGrowthEvent,
} from '@/lib/analytics/growth-events';

export function ContextualOffer({
  sourceRoute,
  placement = 'after_answer',
  className = '',
}: {
  sourceRoute: string;
  placement?: string;
  className?: string;
}) {
  const mapping = getConversionMapping(sourceRoute);
  const viewed = useRef(false);
  const identity = useMemo(
    () => getMarketingSessionId() || `route:${sourceRoute}`,
    [sourceRoute],
  );
  const variant = assignSales002OfferVariant(identity);
  const experimentId = `${SALES002_CONTEXTUAL_OFFER_EXPERIMENT}:${variant}`;

  useEffect(() => {
    if (!mapping || viewed.current) return;
    viewed.current = true;
    recordMarketingGrowthEvent('contextual_offer_view', {
      sourcePage: sourceRoute,
      pagePath: sourceRoute,
      pageType: mapping.sourceCategory,
      destination: mapping.destinationRoute,
      recommendedProduct: mapping.primaryProduct,
      ctaPosition: placement,
      experimentId,
      price: mapping.price,
      deviceCategory: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    });
  }, [experimentId, mapping, placement, sourceRoute]);

  if (!mapping) return null;

  const supportingCopy =
    variant === 'treatment'
      ? `${mapping.supportingCopy} Continue this task for ${mapping.price}${
          mapping.previewAvailable ? ' and preview the supported output before payment.' : '.'
        }`
      : mapping.supportingCopy;

  return (
    <section
      data-contextual-offer={mapping.trackingId}
      data-experiment={experimentId}
      className={`border-y border-[#E6DBFF] bg-white py-8 ${className}`}
      aria-label="Recommended paid next step"
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl border border-[#CAB6FF] bg-[#FBF8FF] p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">
            Relevant next step
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2a2161]">{mapping.headline}</h2>
          <p className="mt-3 leading-7 text-gray-700">{supportingCopy}</p>
          <p className="mt-3 font-semibold text-gray-900">
            Fixed price {mapping.price}.
            {mapping.previewAvailable ? ' Preview available before payment.' : ''}
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-gray-700 md:grid-cols-3">
            {mapping.benefits.map((benefit) => <li key={benefit}>• {benefit}</li>)}
          </ul>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={mapping.destinationRoute}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#692ed4] px-5 py-3 font-semibold text-white hover:bg-[#5922bc]"
              onClick={() =>
                recordMarketingGrowthEvent('contextual_offer_click', {
                  sourcePage: sourceRoute,
                  pagePath: sourceRoute,
                  pageType: mapping.sourceCategory,
                  destination: mapping.destinationRoute,
                  recommendedProduct: mapping.primaryProduct,
                  ctaPosition: placement,
                  experimentId,
                  price: mapping.price,
                  deviceCategory: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
                })
              }
            >
              {mapping.ctaLabel}
            </Link>
            <Link href="#main-content" className="px-2 py-3 text-sm font-semibold text-[#5922bc]">
              Keep reading this guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

