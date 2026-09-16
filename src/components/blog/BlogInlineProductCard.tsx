'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { recordMarketingGrowthEvent } from '@/lib/analytics/growth-events';
import type { ProductCtaConfig } from '@/lib/blog/product-cta-map';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';

interface BlogInlineProductCardProps {
  cta: ProductCtaConfig;
  postSlug: string;
  category: string;
}

const CTA_ICONS: Record<NonNullable<ProductCtaConfig['iconKey']>, string> = {
  notice: '/images/blog/heroes/lh-blog-product-notice-wizard-v1.webp',
  'complete-pack': '/images/blog/heroes/lh-blog-product-complete-pack-v1.webp',
  'money-claim': '/images/blog/heroes/lh-blog-product-money-claim-v1.webp',
  ast: '/images/blog/heroes/lh-blog-product-ast-builder-v1.webp',
};

export function BlogInlineProductCard({
  cta,
  postSlug,
  category,
}: BlogInlineProductCardProps) {
  const iconSrc = CTA_ICONS[cta.iconKey ?? 'notice'];
  const sourceRoute = `/blog/${postSlug}`;
  const cardRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || hasTrackedView.current) return;
    const trackVisibleCard = () => {
      if (hasTrackedView.current) return;
      hasTrackedView.current = true;
      recordMarketingGrowthEvent('contextual_offer_view', {
        sourcePage: sourceRoute,
        pagePath: sourceRoute,
        pageType: 'blog',
        ctaPosition: 'section',
        destination: cta.primaryProductHref,
        recommendedProduct: cta.iconKey,
        experimentId: cta.trackingId,
      });
    };
    if (typeof IntersectionObserver === 'undefined') {
      trackVisibleCard();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackVisibleCard();
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [cta.iconKey, cta.primaryProductHref, cta.trackingId, sourceRoute]);

  return (
    <Reveal as="div">
      <section ref={cardRef} className="not-prose my-10 overflow-hidden rounded-3xl border border-[#e8ddfb] bg-[linear-gradient(135deg,#f8f1ff,#ffffff)] shadow-[0_18px_50px_rgba(105,46,212,0.12)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#692ed4]">
              {cta.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{cta.heading}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{cta.intro}</p>
            {(cta.price || cta.previewAvailable) && (
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {cta.price ? `Fixed price ${cta.price}. ` : ''}
                {cta.previewAvailable ? 'Preview available before payment.' : ''}
              </p>
            )}
            <StaggerReveal as="ul" className="mt-4 space-y-2 text-sm text-slate-700">
              {cta.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2.5 leading-6">
                  <span className="h-2 w-2 flex-none rounded-full bg-[#692ed4]" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </StaggerReveal>
            <Link
              href={cta.primaryProductHref}
              onClick={() => {
                trackEvent('click_blog_inline_product_card', {
                  slug: postSlug,
                  category,
                  productHref: cta.primaryProductHref,
                  placement: 'inline',
                });
                recordMarketingGrowthEvent('contextual_offer_click', {
                  sourcePage: sourceRoute,
                  pagePath: sourceRoute,
                  pageType: 'blog',
                  ctaPosition: 'section',
                  destination: cta.primaryProductHref,
                  recommendedProduct: cta.iconKey,
                  experimentId: cta.trackingId,
                });
              }}
              className="mt-5 inline-flex rounded-xl bg-[#692ed4] px-5 py-3 font-semibold text-white shadow-[0_14px_34px_rgba(105,46,212,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5b24be] hover:shadow-[0_20px_42px_rgba(105,46,212,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692ed4] focus-visible:ring-offset-2"
            >
              {cta.ctaLabel}
            </Link>
          </div>
          <div className="relative min-h-52 border-t border-[#e8ddfb] bg-white/70 lg:min-h-full lg:border-l lg:border-t-0">
            <Image
              src={iconSrc}
              alt="Illustration of the recommended landlord document workflow"
              fill
              sizes="(min-width: 1024px) 260px, 100vw"
              className="!m-0 !h-full !w-full !rounded-none !border-0 !bg-transparent object-cover object-center"
            />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
