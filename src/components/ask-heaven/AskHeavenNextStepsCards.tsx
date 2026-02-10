'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { productLinks } from '@/lib/seo/internal-links';

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
    },
    {
      title: 'Complete Eviction Pack',
      price: '£199.99',
      detail: '(England)',
      description: "Best if you're going to court and want a full, court-ready eviction bundle.",
      ctaText: 'Prepare your eviction case',
      href: productLinks.completePack.href,
      ariaLabel: 'Open Complete Eviction Pack',
    },
    {
      title: 'Money Claims Pack',
      price: '£99.99',
      description: 'Best for claiming back rent arrears, damage costs, or unpaid invoices.',
      ctaText: 'Prepare a money claim',
      href: productLinks.moneyClaim.href,
      ariaLabel: 'Open Money Claims Pack',
    },
    {
      title: 'Tenancy Agreements',
      price: 'from £14.99',
      description: 'Best for creating or updating a legally compliant tenancy agreement.',
      ctaText: 'Create a tenancy agreement',
      href: productLinks.tenancyAgreement.href,
      ariaLabel: 'Open Tenancy Agreements',
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
        className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center"
      >
        What we can help you do next
      </h2>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.ariaLabel}
            className="group flex h-full flex-col rounded-2xl border border-violet-200/70 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <h3 className="text-lg sm:text-xl font-semibold leading-tight text-gray-900">
              {card.title} <span className="font-medium text-gray-500">— {card.price}</span>{' '}
              {card.detail && <span className="font-medium text-gray-500">{card.detail}</span>}
            </h3>

            <p className="mt-4 text-base leading-relaxed text-gray-700">{card.description}</p>

            <p className="mt-auto pt-5 text-base font-medium text-primary transition-colors group-hover:text-primary-700 group-hover:underline group-focus-visible:underline">
              <span aria-hidden="true" className="mr-2">→</span>
              {card.ctaText}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AskHeavenNextStepsCards;
