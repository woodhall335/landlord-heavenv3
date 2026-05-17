/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    [key: string]: unknown;
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/layout/HeaderConfig', () => ({
  HeaderConfig: () => null,
}));

vi.mock('@/components/landing/UniversalHero', () => ({
  UniversalHero: ({
    title,
    highlightTitle,
    subtitle,
    primaryCta,
    secondaryCta,
    children,
  }: {
    title: string;
    highlightTitle?: string;
    subtitle?: React.ReactNode;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    children?: React.ReactNode;
  }) => (
    <section>
      <h1>{[title, highlightTitle].filter(Boolean).join(' ')}</h1>
      {subtitle ? <div>{subtitle}</div> : null}
      {primaryCta ? <a href={primaryCta.href}>{primaryCta.label}</a> : null}
      {secondaryCta ? <a href={secondaryCta.href}>{secondaryCta.label}</a> : null}
      {children}
    </section>
  ),
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: ({
    title,
    faqs,
    includeSchema = true,
  }: {
    title?: string;
    faqs: Array<{ question: string; answer: string }>;
    includeSchema?: boolean;
  }) => (
    <section>
      {includeSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@type': 'FAQPage' }) }}
        />
      ) : null}
      {title ? <h2>{title}</h2> : null}
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </section>
  ),
}));

type TenancyPageContract = {
  name: string;
  load: () => Promise<{ default: () => Promise<React.ReactElement> | React.ReactElement }>;
  h1: RegExp;
  whyTitle: string;
  howTitle: string;
  ctaTitle: string;
  requiredItems: string[];
};

const tenancyPageContracts: TenancyPageContract[] = [
  {
    name: 'standard agreement',
    load: () => import('@/app/standard-tenancy-agreement/page'),
    h1: /Solicitor-approved Standard Tenancy Agreement - Periodic Tenancy Generator/i,
    whyTitle: 'Why a standard periodic agreement still needs proper setup',
    howTitle: 'How this helps you',
    ctaTitle: 'Create the Standard agreement pack',
    requiredItems: [
      'standard periodic tenancy agreement',
      'supporting paperwork',
      'deposit',
      'pets',
      'keys',
    ],
  },
  {
    name: 'premium agreement',
    load: () => import('@/app/premium-tenancy-agreement/page'),
    h1: /Solicitor-approved Premium Periodic Tenancy Agreement - Enhanced Builder/i,
    whyTitle: 'Why landlords choose Premium',
    howTitle: 'How this helps you',
    ctaTitle: 'Create the Premium agreement pack',
    requiredItems: [
      'premium tenancy agreement',
      'inspections',
      'repairs',
      'key handling',
      'handover',
    ],
  },
  {
    name: 'student agreement',
    load: () => import('@/app/student-tenancy-agreement/page'),
    h1: /Solicitor-approved Student Tenancy Agreement - Sharer & Guarantor Builder/i,
    whyTitle: 'Why student lets need their own pack',
    howTitle: 'How this helps you',
    ctaTitle: 'Create the Student agreement pack',
    requiredItems: [
      'student tenancy agreement',
      'Student Move-Out & Guarantor Schedule',
      'Pre-Tenancy Checklist (England)',
      'Keys & Handover Record',
      'Guarantor Agreement',
    ],
  },
  {
    name: 'hmo agreement',
    load: () => import('@/app/hmo-shared-house-tenancy-agreement/page'),
    h1: /Solicitor-approved HMO Tenancy Agreement - Shared House Builder/i,
    whyTitle: 'Why shared houses need fuller paperwork',
    howTitle: 'How this helps you',
    ctaTitle: 'Create the HMO / Shared House agreement pack',
    requiredItems: [
      'HMO tenancy agreement',
      'house rules',
      'communal areas',
      'visitors',
      'cleaning',
    ],
  },
  {
    name: 'lodger agreement',
    load: () => import('@/app/lodger-agreement/page'),
    h1: /Solicitor-approved Lodger Agreement - Resident Landlord Builder/i,
    whyTitle: 'Why a lodger arrangement needs its own paperwork',
    howTitle: 'How this helps you',
    ctaTitle: 'Create the Lodger agreement pack',
    requiredItems: [
      'Lodger Agreement',
      'Lodger Checklist',
      'Keys & Handover Record',
      'Lodger House Rules Appendix',
    ],
  },
];

async function renderPage(
  load: () => Promise<{ default: () => Promise<React.ReactElement> | React.ReactElement }>
) {
  const pageModule = await load();
  return render(await pageModule.default());
}

describe('exact tenancy product sales pages', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  for (const contract of tenancyPageContracts) {
    it(`renders the structured breakdown for the ${contract.name}`, async () => {
      await renderPage(contract.load);

      expect(screen.getByRole('heading', { level: 1, name: contract.h1 })).toBeInTheDocument();
      expect(screen.getByText('Sample document preview')).toBeInTheDocument();
      expect(screen.getByText(/Inspect the sample pack before you pay/i)).toBeInTheDocument();
      expect(screen.getByText('Documents in this sample pack')).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 2, name: /What you get/i })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: contract.whyTitle })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: contract.howTitle })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'How it works' })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: contract.ctaTitle })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: 'England tenancy agreement FAQs' })
      ).toBeInTheDocument();

      const text = document.body.textContent ?? '';
      const normalizedText = text.toLowerCase();

      for (const item of contract.requiredItems) {
        expect(normalizedText).toContain(item.toLowerCase());
      }

      expect(text).not.toContain('View route');
      expect(text).not.toContain('What it is');
      expect(text).not.toContain('What it does');
      expect(text).not.toContain('Why it is needed');
      expect(text).not.toContain('Wales');
      expect(text).not.toContain('Scotland');
      expect(text).not.toContain('Northern Ireland');

      const faqSchemas = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      ).filter((node) => node.textContent?.includes('"@type":"FAQPage"'));

      expect(faqSchemas).toHaveLength(1);
    });
  }
});
