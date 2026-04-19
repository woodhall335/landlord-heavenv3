/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ASTProductPage from '@/app/(marketing)/products/ast/page';

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

function expectHeadingOrder(headings: HTMLElement[]) {
  for (let index = 0; index < headings.length - 1; index += 1) {
    expect(
      headings[index].compareDocumentPosition(headings[index + 1]) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  }
}

describe('/products/ast page', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('stays a chooser page with the new six-section sales contract', () => {
    render(<ASTProductPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Create the Right Tenancy Agreement for Your England Let/i,
      })
    ).toBeInTheDocument();

    const orderedHeadings = [
      screen.getByRole('heading', { level: 2, name: 'Choose the agreement that fits the tenancy' }),
      screen.getByRole('heading', { level: 2, name: 'Why you need the right route first' }),
      screen.getByRole('heading', { level: 2, name: 'How this hub helps the landlord outcome' }),
      screen.getByRole('heading', { level: 2, name: 'How it works' }),
      screen.getByRole('heading', { level: 2, name: 'Start with the agreement that fits the let' }),
      screen.getByRole('heading', { level: 2, name: 'England tenancy agreement FAQs' }),
    ];

    expectHeadingOrder(orderedHeadings);
  });

  it('links to the five exact England agreement owners and does not duplicate their breakdowns', () => {
    render(<ASTProductPage />);

    expect(
      screen.getByRole('link', { name: 'Choose the Standard agreement' })
    ).toHaveAttribute('href', '/standard-tenancy-agreement');
    expect(
      screen.getByRole('link', { name: 'Choose the Premium agreement' })
    ).toHaveAttribute('href', '/premium-tenancy-agreement');
    expect(
      screen.getByRole('link', { name: 'Choose the Student agreement' })
    ).toHaveAttribute('href', '/student-tenancy-agreement');
    expect(
      screen.getByRole('link', { name: 'Choose the HMO / Shared House agreement' })
    ).toHaveAttribute('href', '/hmo-shared-house-tenancy-agreement');
    expect(
      screen.getByRole('link', { name: 'Choose the Lodger agreement' })
    ).toHaveAttribute('href', '/lodger-agreement');

    const text = document.body.textContent ?? '';
    expect(text).not.toContain('Deposit Certificate');
    expect(text).not.toContain('Prescribed Information Pack');
    expect(text).not.toContain('View route');
    expect(text).not.toContain('Wales');
    expect(text).not.toContain('Scotland');
    expect(text).not.toContain('Northern Ireland');
  });

  it('emits one FAQ schema block through the rewritten page shell', () => {
    render(<ASTProductPage />);

    const faqSchemas = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).filter((node) => node.textContent?.includes('"@type":"FAQPage"'));

    expect(faqSchemas).toHaveLength(1);
  });
});
