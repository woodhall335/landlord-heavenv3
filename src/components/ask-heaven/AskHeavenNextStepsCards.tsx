'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { productLinks } from '@/lib/seo/internal-links';
import {
  RiDraftLine,
  RiFileList3Line,
  RiMoneyPoundBoxLine,
  RiScales3Line,
} from 'react-icons/ri';

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
      icon: <RiFileList3Line className="h-10 w-10 text-[#8B5CF6]" aria-hidden="true" />,
    },
    {
      title: 'Complete Eviction Pack',
      price: '£199.99',
      detail: '(England)',
      description: "Best if you're going to court and want a full, court-ready eviction bundle.",
      ctaText: 'Prepare your eviction case',
      href: productLinks.completePack.href,
      ariaLabel: 'Open Complete Eviction Pack',
      icon: <RiScales3Line className="h-10 w-10 text-[#8B5CF6]" aria-hidden="true" />,
    },
    {
      title: 'Money Claims Pack',
      price: '£99.99',
      description: 'Best for claiming back rent arrears, damage costs, or unpaid invoices.',
      ctaText: 'Prepare a money claim',
      href: productLinks.moneyClaim.href,
      ariaLabel: 'Open Money Claims Pack',
      icon: <RiMoneyPoundBoxLine className="h-10 w-10 text-[#14B8A6]" aria-hidden="true" />,
    },
    {
      title: 'Tenancy Agreements',
      price: 'from £14.99',
      description: 'Best for creating or updating a legally compliant tenancy agreement.',
      ctaText: 'Create a tenancy agreement',
      href: productLinks.tenancyAgreement.href,
      ariaLabel: 'Open Tenancy Agreements',
      icon: <RiDraftLine className="h-10 w-10 text-[#8B5CF6]" aria-hidden="true" />,
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
        className="text-center text-3xl font-bold tracking-tight text-slate-800 sm:text-5xl"
      >
        What we can help you do next
      </h2>

      <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.ariaLabel}
            className="group flex h-full flex-col rounded-[28px] border border-[#C4B5FD] bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#A78BFA] hover:shadow-[0_18px_35px_-18px_rgba(139,92,246,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 pt-0.5">
                {card.icon}
              </div>
              <h3 className="text-2xl font-semibold leading-tight text-slate-800 sm:text-[2rem]">
                {card.title} <span className="font-medium text-slate-700">— {card.price}</span>{' '}
                {card.detail && <span className="font-medium text-slate-600">{card.detail}</span>}
              </h3>
            </div>

            <p className="mt-5 text-xl leading-relaxed text-slate-700 sm:text-[1.85rem]">{card.description}</p>

            <p className="mt-auto pt-5 text-2xl font-medium text-[#6D28D9] transition-all group-hover:text-[#5B21B6] group-hover:underline group-focus-visible:underline sm:text-[1.8rem]">
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
