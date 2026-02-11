'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { productLinks } from '@/lib/seo/internal-links';
import { RiFileList3Line, RiScales3Line, RiMoneyPoundCircleLine, RiFileTextLine } from 'react-icons/ri';

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
  detail?: string;
  icon: React.ReactNode;
}

export function AskHeavenNextStepsCards({ jurisdiction = 'england', className }: AskHeavenNextStepsCardsProps) {
  const cards: CardDefinition[] = [
    {
      title: 'Notice Only Pack',
      price: '£49.99',
      description:
        'Best if you need to serve or check an eviction notice (Section 21, Section 8, Section 173, or Notice to Leave).',
      ctaText: 'Generate a compliant notice',
      href: productLinks.noticeOnly.href,
      ariaLabel: 'Open Notice Only Pack',
      icon: <RiFileList3Line className="h-8 w-8 text-violet-500" aria-hidden="true" />,
    },
    {
      title: 'Complete Eviction Pack',
      price: '£199.99',
      detail: '(England)',
      description: "Best if you're going to court and want a full, court-ready eviction bundle.",
      ctaText: 'Prepare your eviction case',
      href: productLinks.completePack.href,
      ariaLabel: 'Open Complete Eviction Pack',
      icon: <RiScales3Line className="h-8 w-8 text-violet-500" aria-hidden="true" />,
    },
    {
      title: 'Money Claims Pack',
      price: '£99.99',
      description: 'Best for claiming back rent arrears, damage costs, or unpaid invoices.',
      ctaText: 'Prepare a money claim',
      href: productLinks.moneyClaim.href,
      ariaLabel: 'Open Money Claims Pack',
      icon: <RiMoneyPoundCircleLine className="h-8 w-8 text-emerald-500" aria-hidden="true" />,
    },
    {
      title: 'Tenancy Agreements',
      price: 'from £14.99',
      description: 'Best for creating or updating a legally compliant tenancy agreement.',
      ctaText: 'Create a tenancy agreement',
      href: productLinks.tenancyAgreement.href,
      ariaLabel: 'Open Tenancy Agreements',
      icon: <RiFileTextLine className="h-8 w-8 text-violet-500" aria-hidden="true" />,
    },
  ];

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
        What we can help you do next
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.ariaLabel}
            className="group flex h-full flex-col rounded-[30px] border border-violet-300/90 bg-[#fbfbfd] p-7 shadow-[0_1px_1px_rgba(109,40,217,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-white hover:shadow-[0_18px_36px_rgba(109,40,217,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100/70 transition-colors duration-300 group-hover:bg-violet-100">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                {card.title} <span className="font-medium text-gray-700">— {card.price}</span>{' '}
                {card.detail && <span className="text-gray-600">{card.detail}</span>}
              </h3>
            </div>

            <p className="mt-6 text-base leading-relaxed text-gray-700">{card.description}</p>

            <p className="mt-auto pt-6 text-base font-medium text-violet-600 transition-all duration-300 group-hover:text-violet-700 group-hover:underline group-focus-visible:underline">
              <span
                aria-hidden="true"
                className="mr-2 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
              {card.ctaText}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AskHeavenNextStepsCards;
