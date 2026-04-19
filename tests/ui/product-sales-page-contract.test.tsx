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

vi.mock('@/components/value-proposition', () => ({
  WhatsIncludedInteractive: ({
    titleOverride,
    subtitleOverride,
  }: {
    titleOverride?: string;
    subtitleOverride?: string;
  }) => (
    <section>
      {titleOverride ? <h3>{titleOverride}</h3> : null}
      {subtitleOverride ? <p>{subtitleOverride}</p> : null}
    </section>
  ),
}));

vi.mock('@/lib/previews/noticeOnlyPreviews', () => ({
  getNoticeOnlyPreviewData: async () => ({
    england: { section8: [] },
    wales: { section173: [], rhw23: [] },
    scotland: { 'notice-to-leave': [] },
  }),
}));

vi.mock('@/lib/previews/completePackPreviews', () => ({
  getCompletePackPreviewData: async () => ({
    section8: [],
    section21: [],
  }),
}));

vi.mock('@/lib/previews/moneyClaimPreviews', () => ({
  getMoneyClaimPreviewData: async () => [],
}));

type PageContract = {
  name: string;
  load: () => Promise<{ default: () => Promise<React.ReactElement> | React.ReactElement }>;
  h1: RegExp;
  sectionTitles: string[];
  requiredItems: string[];
};

const pageContracts: PageContract[] = [
  {
    name: 'notice only',
    load: () => import('@/app/(marketing)/products/notice-only/page'),
    h1: /Eviction Notice Generator \(Section 8, May 2026\)/i,
    sectionTitles: [
      'Why a Section 8 case needs more than a blank notice',
      'How this puts you in a stronger position',
      'How it works',
      'Prepare the Section 8 notice with more confidence',
      'Eviction Notice Generator FAQs',
    ],
    requiredItems: [
      'Form 3A notice',
      'Service Instructions',
      'Service & Validity Checklist',
      'Pre-Service Compliance Declaration',
      'Rent Schedule / Arrears Statement',
    ],
  },
  {
    name: 'complete pack',
    load: () => import('@/app/(marketing)/products/complete-pack/page'),
    h1: /Complete Eviction Pack/i,
    sectionTitles: [
      'Why you need the full pack instead of isolated forms',
      'How the full pack improves the landlord outcome',
      'How it works',
      'Start the full possession file now',
      'Complete Eviction Pack FAQs',
    ],
    requiredItems: [
      'Form 3A notice',
      'Form N5 - Claim for Possession',
      'Form N119 - Particulars of Claim',
      'Schedule of Arrears',
      'Evidence Collection Checklist',
      'Proof of Service Certificate',
    ],
  },
  {
    name: 'money claim',
    load: () => import('@/app/(marketing)/products/money-claim/page'),
    h1: /Money Claim Pack/i,
    sectionTitles: [
      'Why a landlord money claim needs more than one form',
      'How this improves the landlord outcome',
      'How it works',
      'Start the money claim properly',
      'Money Claim Pack FAQs',
    ],
    requiredItems: [
      'Letter Before Claim (PAP-DEBT)',
      'Reply Form',
      'Financial Statement Form',
      'Particulars of claim',
      'Schedule of arrears',
      'Interest calculation',
      'Money Claims Filing Guide',
      'Enforcement Guide',
      'Form N1 (official PDF)',
    ],
  },
  {
    name: 'section 13 standard',
    load: () => import('@/app/(marketing)/products/section-13-standard/page'),
    h1: /Section 13 Rent Increase Pack for England landlords/i,
    sectionTitles: [
      'Why you need this',
      'How this helps you',
      'How it works',
      'Increase the rent with a cleaner Section 13 file',
      'Section 13 Rent Increase FAQs',
    ],
    requiredItems: [
      'Form 4A rent increase notice',
      'Rent increase justification report',
      'Proof of service record',
      'Rent increase cover letter',
    ],
  },
  {
    name: 'section 13 defence',
    load: () => import('@/app/(marketing)/products/section-13-defence/page'),
    h1: /Section 13 Defence Pack for England landlords/i,
    sectionTitles: [
      'Why you need this',
      'How this helps you',
      'How it works',
      'Prepare the stronger Section 13 defence file now',
      'Section 13 Defence Pack FAQs',
    ],
    requiredItems: [
      'Form 4A rent increase notice',
      'Tribunal Argument Summary',
      'Rent increase justification report',
      'Proof of service record',
      'Rent increase cover letter',
      'Tribunal defence guide',
      'Landlord response template',
      'Tribunal legal briefing',
      'Evidence checklist',
      'Negotiation email template',
      'Merged tribunal bundle PDF',
    ],
  },
];

function expectHeadingOrder(headings: HTMLElement[]) {
  for (let index = 0; index < headings.length - 1; index += 1) {
    expect(
      headings[index].compareDocumentPosition(headings[index + 1]) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  }
}

async function renderPage(
  load: () => Promise<{ default: () => Promise<React.ReactElement> | React.ReactElement }>
) {
  const pageModule = await load();
  return render(await pageModule.default());
}

describe('public product sales page contract', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  for (const contract of pageContracts) {
    it(`renders the six-section sales contract for ${contract.name}`, async () => {
      await renderPage(contract.load);

      expect(screen.getByRole('heading', { level: 1, name: contract.h1 })).toBeInTheDocument();
      expect(screen.getByText('Sample pack proof')).toBeInTheDocument();
      expect(screen.getByText(/See a real sample pack before you pay/i)).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 2, name: /What you get/i })
      ).not.toBeInTheDocument();

      const orderedHeadings = contract.sectionTitles.map((title) =>
        screen.getByRole('heading', { level: 2, name: title })
      );

      expectHeadingOrder(orderedHeadings);

      for (const item of contract.requiredItems) {
        expect(screen.getAllByText(item).length).toBeGreaterThan(0);
      }

      const text = document.body.textContent ?? '';

      expect(screen.queryByText(/Preview the Section 8 notice pack/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Preview the court possession pack/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Preview the money claim pack/i)).not.toBeInTheDocument();
      expect(text).not.toContain('What it is');
      expect(text).not.toContain('What it does');
      expect(text).not.toContain('Why it is needed');
      expect(text).not.toContain('How it helps you');
      expect(text).not.toContain('View route');
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
