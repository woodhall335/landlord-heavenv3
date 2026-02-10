'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AskHeavenCardJurisdiction = 'england' | 'wales' | 'scotland' | 'n_ireland' | 'northern-ireland';

interface AskHeavenNextStepsCardsProps {
  jurisdiction?: AskHeavenCardJurisdiction;
  className?: string;
}

interface CardDefinition {
  title: string;
  price: string;
  detail?: string;
  description: string;
  ctaText: string;
  href: string;
  ariaLabel: string;
  icon: React.ReactNode;
}

function NoticeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
      <path d="M18 15l2 2-4 4-2 .5.5-2z" />
    </svg>
  );
}

function BundleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="7" width="8" height="13" rx="1.5" />
      <rect x="13" y="4" width="8" height="16" rx="1.5" />
      <path d="M6 11h2M6 15h2M16 8h2M16 12h2M16 16h2" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9h.01M17 15h.01" />
    </svg>
  );
}

function TenancyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v3h3M9 11h6M9 15h6" />
      <path d="M8 19l3.6-3.6 1.8 1.8L9.8 21H8z" />
    </svg>
  );
}

export function AskHeavenNextStepsCards({ jurisdiction = 'england', className }: AskHeavenNextStepsCardsProps) {
  const isEngland = jurisdiction === 'england';

  const cards: CardDefinition[] = [
    {
      title: 'Notice Only Pack',
      price: '£49.99',
      description:
        'Best if you need to serve or check an eviction notice (Section 21, Section 8, Section 173, or Notice to Leave).',
      ctaText: 'Generate a compliant notice',
      href: '/products/notice-only',
      ariaLabel: 'Go to Notice Only Pack',
      icon: <NoticeIcon />,
    },
    {
      title: 'Complete Eviction Pack',
      price: '£199.99',
      detail: isEngland ? undefined : '(England)',
      description: "Best if you're going to court and want a full, court-ready eviction bundle.",
      ctaText: 'Prepare your eviction case',
      href: '/products/complete-pack',
      ariaLabel: 'Go to Complete Eviction Pack',
      icon: <BundleIcon />,
    },
    {
      title: 'Money Claims Pack',
      price: '£99.99',
      description: 'Best for claiming back rent arrears, damage costs, or unpaid invoices.',
      ctaText: 'Prepare a money claim',
      href: '/products/money-claim',
      ariaLabel: 'Go to Money Claims Pack',
      icon: <MoneyIcon />,
    },
    {
      title: 'Tenancy Agreements',
      price: 'from £14.99',
      description: 'Best for creating or updating a legally compliant tenancy agreement.',
      ctaText: 'Create a tenancy agreement',
      href: '/products/ast',
      ariaLabel: 'Go to Tenancy Agreements',
      icon: <TenancyIcon />,
    },
  ];

  return (
    <section className={cn('mt-8 md:mt-10', className)} aria-labelledby="ask-heaven-next-steps-heading">
      <h2
        id="ask-heaven-next-steps-heading"
        className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
      >
        What we can help you do next
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.ariaLabel}
            className="group block rounded-3xl border border-violet-300 bg-white p-5 shadow-[0_8px_24px_rgba(76,29,149,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-[0_14px_30px_rgba(76,29,149,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 shrink-0">{card.icon}</span>
              <div>
                <h3 className="text-xl font-bold leading-tight text-gray-900">
                  {card.title} <span className="font-medium">— {card.price}</span>{' '}
                  {card.detail && <span className="font-medium text-gray-600">{card.detail}</span>}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-base leading-relaxed text-gray-700">{card.description}</p>

            <p className="mt-4 text-lg font-medium text-violet-700 transition group-hover:underline group-focus-visible:underline">
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
