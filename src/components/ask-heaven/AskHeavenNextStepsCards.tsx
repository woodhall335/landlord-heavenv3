'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  RiFileCheckLine,
  RiFileList3Line,
  RiMoneyPoundCircleLine,
  RiScales3Line,
} from 'react-icons/ri';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
} from '@/lib/public-products';
import { TENANCY_AGREEMENT_FROM_PRICE } from '@/lib/pricing/products';

type AskHeavenCardJurisdiction = 'england' | 'wales' | 'scotland' | 'n_ireland' | 'northern-ireland';

interface AskHeavenNextStepsCardsProps {
  jurisdiction?: AskHeavenCardJurisdiction;
  className?: string;
}

interface CardDefinition {
  title: string;
  price: string;
  description: string;
  ctaText: string;
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
}

const cards: CardDefinition[] = [
  {
    title: 'Eviction Notice Generator',
    price: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.priceLabel,
    description:
      'England-only Section 8 route for landlords who need the notice, service guidance, and early route checks before serving.',
    ctaText: 'Open Section 8 notice product',
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref,
    ariaLabel: 'Open Eviction Notice Generator',
    icon: <RiFileList3Line className="h-8 w-8 text-violet-500" aria-hidden="true" />,
  },
  {
    title: 'Complete Eviction Pack',
    price: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.priceLabel,
    description:
      'England-only court possession route for landlords who want the notice, N5, N119, and filing guidance in one product.',
    ctaText: 'Open court possession pack',
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref,
    ariaLabel: 'Open Complete Eviction Pack',
    icon: <RiScales3Line className="h-8 w-8 text-violet-500" aria-hidden="true" />,
  },
  {
    title: 'Money Claim Pack',
    price: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.priceLabel,
    description:
      'England-only debt recovery route for unpaid rent, damage, bills, guarantor claims, and former-tenant debt.',
    ctaText: 'Open money claim product',
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref,
    ariaLabel: 'Open Money Claim Pack',
    icon: <RiMoneyPoundCircleLine className="h-8 w-8 text-emerald-500" aria-hidden="true" />,
  },
  {
    title: 'England Tenancy Agreements',
    price: TENANCY_AGREEMENT_FROM_PRICE,
    description:
      'Choose the right England agreement for Standard, Premium, Student, HMO / Shared House, or Lodger use.',
    ctaText: 'Open tenancy agreement hub',
    href: PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref,
    ariaLabel: 'Open England Tenancy Agreements',
    icon: <RiFileCheckLine className="h-8 w-8 text-violet-500" aria-hidden="true" />,
  },
];

export function AskHeavenNextStepsCards({
  jurisdiction = 'england',
  className,
}: AskHeavenNextStepsCardsProps) {
  return (
    <section
      className={cn('overflow-visible', className)}
      aria-labelledby="ask-heaven-next-steps-heading"
      data-jurisdiction={jurisdiction}
    >
      <h2
        id="ask-heaven-next-steps-heading"
        className="text-center text-3xl font-bold tracking-tight text-gray-800"
      >
        What we can help you do next in England
      </h2>
      <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-6 text-gray-600">
        Public recommendations now point to England-only products. Historic non-England cases can
        still be resumed directly through the account, but they are no longer promoted as public
        acquisition paths.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.ariaLabel}
            className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-violet-300/90 bg-[#fbfbfd] p-7 shadow-[0_1px_1px_rgba(109,40,217,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-400 hover:bg-white hover:shadow-[0_24px_48px_rgba(109,40,217,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100/70 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-100 group-hover:shadow-[0_8px_18px_rgba(109,40,217,0.18)]">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                {card.title} <span className="font-medium text-gray-700">— {card.price}</span>
              </h3>
            </div>

            <p className="relative mt-6 text-base leading-relaxed text-gray-700 transition-colors duration-300 group-hover:text-gray-800">
              {card.description}
            </p>

            <p className="relative mt-auto inline-flex w-fit items-center gap-2 pt-6 text-base font-medium text-violet-600 transition-all duration-300 group-hover:text-violet-700 group-focus-visible:underline">
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
              {card.ctaText}
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-violet-500/80 transition-transform duration-300 group-hover:scale-x-100"
              />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AskHeavenNextStepsCards;
