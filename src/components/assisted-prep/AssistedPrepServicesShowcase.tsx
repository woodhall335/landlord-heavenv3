'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { RiArrowRightLine } from 'react-icons/ri';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { AssistedPrepCTA } from '@/components/assisted-prep/AssistedPrepCTA';
import { StaggerReveal } from '@/components/marketing/PremiumMotion';
import type { MarketingCtaPosition, MarketingPageType } from '@/lib/analytics';
import { getAssistedPrepConfig } from '@/lib/assisted-prep';

type AssistedPrepShowcaseCard = {
  title: string;
  eyebrow: string;
  description: string;
  service: string;
  product: string;
  priceLabel: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  routeIntent: string;
};

type AssistedPrepServicesShowcaseProps = {
  className?: string;
  pagePath?: string;
  pageType?: MarketingPageType;
  ctaPosition?: MarketingCtaPosition;
  src?: string;
};

const assistedPrepCards: AssistedPrepShowcaseCard[] = [
  {
    title: 'Landlord Section 8 notice assistance',
    eyebrow: 'Unsure about grounds or dates?',
    description:
      'Start with a free consultation. If suitable, we prepare or check the Form 3A notice, service details, and notice file before you serve it.',
    service: 'section8',
    product: 'notice_only',
    priceLabel: getAssistedPrepConfig('section8').priceLabel,
    ctaLabel: 'Book free consultation',
    imageSrc: '/images/generated/assisted-prep/section8-assisted-prep.png',
    imageAlt: 'Landlord checking compliance questions before taking action',
    routeIntent: 'section8_assisted_prep',
  },
  {
    title: 'Landlord eviction assistance service',
    eyebrow: 'Need to act after notice?',
    description:
      'Start with a free consultation. If suitable, we prepare or check N5, N119, service evidence, bundle steps, and the filing pack.',
    service: 'possession',
    product: 'complete_pack',
    priceLabel: getAssistedPrepConfig('possession').priceLabel,
    ctaLabel: 'Book free consultation',
    imageSrc: '/images/generated/assisted-prep/possession-assisted-prep.png',
    imageAlt: 'Landlord preparing urgent possession claim documents',
    routeIntent: 'possession_assisted_prep',
  },
  {
    title: 'Money claim prepared with you',
    eyebrow: 'Rent, damage, bills, or debt?',
    description:
      'A 30-minute callback to turn the debt, evidence, pre-action position, and claim wording into a clearer claim pack.',
    service: 'money_claim',
    product: 'money_claim',
    priceLabel: getAssistedPrepConfig('money_claim').priceLabel,
    ctaLabel: 'Book money claim assisted prep',
    imageSrc: '/images/generated/assisted-prep/money-claim-assisted-prep.png',
    imageAlt: 'Landlord organising tenancy records and claim evidence',
    routeIntent: 'money_claim_assisted_prep',
  },
];

export function getGroundCodeFromPath(pagePath: string, src: string) {
  if (src !== 'seo_ground_assisted_cta') {
    return null;
  }

  return pagePath.match(/ground-(1a|7a|\d+)\/?$/i)?.[1]?.toLowerCase() ?? null;
}

export function AssistedPrepServicesShowcase({
  className,
  pagePath = '/',
  pageType = 'entry_page',
  ctaPosition = 'section',
  src = 'assisted_showcase',
}: AssistedPrepServicesShowcaseProps) {
  const groundCode = getGroundCodeFromPath(pagePath, src);

  if (groundCode) {
    return (
      <AssistedPrepCTA
        service="section8"
        product="notice_only"
        caseType="eviction"
        src={`seo_ground_${groundCode}_assisted_prep`}
        variant="banner"
        className={className}
      />
    );
  }

  return (
    <section
      className={clsx(
        'mt-10 rounded-[2rem] border border-[#d8c8ff] bg-[linear-gradient(135deg,#7c5ce0_0%,#9b70e8_52%,#7546c8_100%)] p-6 shadow-[0_24px_70px_rgba(74,45,137,0.18)] md:p-8',
        className
      )}
      aria-label="Assisted preparation services"
    >
      <div className="mb-7 max-w-5xl">
        <p className="public-eyebrow">Prefer us to prepare it with you?</p>
        <h2 className="mt-3 max-w-4xl text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[2rem]">
          Free consultation before any assisted eviction preparation is agreed
        </h2>
        <p className="mt-3 max-w-4xl text-base leading-7 text-white/90">
          We discuss the facts first. If we can help, we confirm the scope and send a secure Stripe payment link afterwards.
        </p>
      </div>

      <StaggerReveal className="grid gap-5 lg:grid-cols-2">
        {assistedPrepCards.filter((card) => card.service !== 'money_claim').map((card) => (
          <article
            key={card.title}
            className="group overflow-hidden rounded-[1.4rem] border border-white/14 bg-white shadow-[0_18px_50px_rgba(9,4,25,0.22)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-white">
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 31vw"
                className="object-contain object-center transition duration-500 group-hover:scale-[1.025]"
              />
            </div>
            <div className="flex min-h-[18rem] flex-col p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">
                  {card.eyebrow}
                </p>
              </div>
              <h3 className="mt-3 text-xl font-bold leading-tight text-[#1c1431]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm font-semibold text-[#4c1d95]">
                Free consultation &middot; {card.priceLabel} only if we confirm we can help
              </p>
              <p className="mt-3 text-sm leading-6 text-[#5d5672]">
                {card.description}
              </p>
              <TrackedLink
                href={`/assisted-prep/start?service=${card.service}&product=${card.product}&src=${src}`}
                pagePath={pagePath}
                pageType={pageType}
                ctaLabel={card.ctaLabel}
                ctaPosition={ctaPosition}
                eventName={pageType === 'homepage' ? 'homepage_primary_cta_click' : 'entry_page_primary_cta_click'}
                routeIntent={card.routeIntent}
                product={card.product}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] lg:mt-auto"
              >
                {card.ctaLabel}
                <RiArrowRightLine className="h-4 w-4" />
              </TrackedLink>
            </div>
          </article>
        ))}
      </StaggerReveal>
    </section>
  );
}
