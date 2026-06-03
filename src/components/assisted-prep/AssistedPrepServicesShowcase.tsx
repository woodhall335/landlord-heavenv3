'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { RiArrowRightLine } from 'react-icons/ri';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { StaggerReveal } from '@/components/marketing/PremiumMotion';
import type { MarketingCtaPosition, MarketingPageType } from '@/lib/analytics';

type AssistedPrepShowcaseCard = {
  title: string;
  eyebrow: string;
  description: string;
  price: string;
  service: string;
  product: string;
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
    title: 'Section 8 notice prepared with you',
    eyebrow: 'Unsure about grounds or dates?',
    description:
      'A 20-minute callback to prepare or check the Form 3A notice, service details, and notice file before you serve it.',
    price: '£149',
    service: 'section8',
    product: 'notice_only',
    ctaLabel: 'Book Section 8 assisted prep',
    imageSrc: '/images/2-Unsure-Compliance.webp',
    imageAlt: 'Landlord checking compliance questions before taking action',
    routeIntent: 'section8_assisted_prep',
  },
  {
    title: 'Possession claim pack prepared with you',
    eyebrow: 'Need to act after notice?',
    description:
      'A 45-minute callback to prepare or check N5, N119, service evidence, bundle steps, and the filing pack.',
    price: '£399',
    service: 'possession',
    product: 'complete_pack',
    ctaLabel: 'Book possession claim assisted prep',
    imageSrc: '/images/3-Need-to-Act.webp',
    imageAlt: 'Landlord preparing urgent possession claim documents',
    routeIntent: 'possession_assisted_prep',
  },
  {
    title: 'Money claim prepared with you',
    eyebrow: 'Rent, damage, bills, or debt?',
    description:
      'A 30-minute callback to turn the debt, evidence, pre-action position, and claim wording into a clearer claim pack.',
    price: '£249',
    service: 'money_claim',
    product: 'money_claim',
    ctaLabel: 'Book money claim assisted prep',
    imageSrc: '/images/4-Inherited-Tenancy-Admin.webp',
    imageAlt: 'Landlord organising tenancy records and claim evidence',
    routeIntent: 'money_claim_assisted_prep',
  },
];

export function AssistedPrepServicesShowcase({
  className,
  pagePath = '/',
  pageType = 'entry_page',
  ctaPosition = 'section',
  src = 'assisted_showcase',
}: AssistedPrepServicesShowcaseProps) {
  return (
    <section
      className={clsx(
        'mt-10 rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,#241447_0%,#4c1d95_55%,#2f174f_100%)] p-6 shadow-[0_24px_70px_rgba(24,10,52,0.24)] md:p-8',
        className
      )}
      aria-label="Assisted preparation services"
    >
      <div className="mb-5 max-w-3xl">
        <p className="public-eyebrow">Prefer us to prepare it with you?</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
          Assisted prep for landlords who want the file checked before they act
        </h2>
        <p className="mt-3 text-base leading-7 text-white/78">
          Short callback, focused document preparation, and a clear pack for you to approve before serving or filing.
        </p>
      </div>

      <StaggerReveal className="grid gap-5 lg:grid-cols-3">
        {assistedPrepCards.map((card) => (
          <article
            key={card.title}
            className="group overflow-hidden rounded-[1.4rem] border border-white/14 bg-white shadow-[0_18px_50px_rgba(9,4,25,0.22)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f7f3ff]">
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 31vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex min-h-[18rem] flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">
                  {card.eyebrow}
                </p>
                <span className="shrink-0 rounded-full bg-[#f1eaff] px-3 py-1 text-sm font-bold text-[#4b1fa3]">
                  {card.price}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold leading-tight text-[#1c1431]">
                {card.title}
              </h3>
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
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
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
