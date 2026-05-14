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
    ctaTitle: 'Start the Standard agreement pack',
    requiredItems: [
      'Standard Tenancy Agreement',
      'Pre-Tenancy Checklist (England)',
      'Keys & Handover Record',
      'Utilities & Meter Handover Sheet',
      'Pet Request / Consent Addendum',
      'Tenancy Variation Record',
      'Deposit Protection Certificate',
      'Prescribed Information Pack',
    ],
  },
  {
    name: 'premium agreement',
    load: () => import('@/app/premium-tenancy-agreement/page'),
    h1: /Solicitor-approved Premium Periodic Tenancy Agreement - Enhanced Builder/i,
    whyTitle: 'Why landlords choose Premium',
    howTitle: 'How this helps you',
    ctaTitle: 'Start the Premium agreement pack',
    requiredItems: [
      'Premium Tenancy Agreement',
      'Pre-Tenancy Checklist (England)',
      'Premium Management Schedule',
      'Keys & Handover Record',
      'Utilities & Meter Handover Sheet',
      'Pet Request / Consent Addendum',
      'Tenancy Variation Record',
      'Deposit Protection Certificate',
      'Prescribed Information Pack',
    ],
  },
  {
    name: 'student agreement',
    load: () => import('@/app/student-tenancy-agreement/page'),
    h1: /Solicitor-approved Student Tenancy Agreement - Sharer & Guarantor Builder/i,
    whyTitle: 'Why student lets need their own pack',
    howTitle: 'How this helps you',
    ctaTitle: 'Start the Student agreement pack',
    requiredItems: [
      'Student Tenancy Agreement',
      'Student Move-Out & Guarantor Schedule',
      'Pre-Tenancy Checklist (England)',
      'Keys & Handover Record',
      'Utilities & Meter Handover Sheet',
      'Pet Request / Consent Addendum',
      'Tenancy Variation Record',
      'Deposit Protection Certificate',
      'Prescribed Information Pack',
      'Guarantor Agreement',
    ],
  },
  {
    name: 'hmo agreement',
    load: () => import('@/app/hmo-shared-house-tenancy-agreement/page'),
    h1: /Solicitor-approved HMO Tenancy Agreement - Shared House Builder/i,
    whyTitle: 'Why shared houses need fuller paperwork',
    howTitle: 'How this helps you',
    ctaTitle: 'Start the HMO / Shared House agreement pack',
    requiredItems: [
      'HMO / Shared House Tenancy Agreement',
      'HMO / Shared House Rules Appendix',
      'Pre-Tenancy Checklist (England)',
      'Keys & Handover Record',
      'Utilities & Meter Handover Sheet',
      'Pet Request / Consent Addendum',
      'Tenancy Variation Record',
      'Deposit Protection Certificate',
      'Prescribed Information Pack',
    ],
  },
  {
    name: 'lodger agreement',
    load: () => import('@/app/lodger-agreement/page'),
    h1: /Solicitor-approved Lodger Agreement - Resident Landlord Builder/i,
    whyTitle: 'Why a lodger arrangement needs its own paperwork',
    howTitle: 'How this helps you',
    ctaTitle: 'Start the Lodger agreement pack',
    requiredItems: [
      'Room Let / Lodger Agreement',
      'Room Let / Lodger Checklist',
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
      expect(screen.getByText('Real PDF sample')).toBeInTheDocument();
      expect(screen.getByText(/Read the full sample documents on the page/i)).toBeInTheDocument();
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

      for (const item of contract.requiredItems) {
        expect(screen.getAllByText(item).length).toBeGreaterThan(0);
      }

      const text = document.body.textContent ?? '';
      expect(text).not.toContain('View route');
      expect(text).not.toContain('supporting documents');
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
