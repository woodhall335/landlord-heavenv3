/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import EnglandPage from '@/app/tenancy-agreements/england/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
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
    subtitle,
    primaryCta,
    secondaryCta,
  }: {
    title: string;
    subtitle?: React.ReactNode;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  }) => (
    <section>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {primaryCta ? <a href={primaryCta.href}>{primaryCta.label}</a> : null}
      {secondaryCta ? <a href={secondaryCta.href}>{secondaryCta.label}</a> : null}
    </section>
  ),
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: ({
    title,
    intro,
    faqs,
  }: {
    title?: string;
    intro?: string;
    faqs?: Array<{ question: string; answer: string }>;
  }) => (
    <section>
      {title ? <h2>{title}</h2> : null}
      {intro ? <p>{intro}</p> : null}
      {faqs?.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </section>
  ),
}));

vi.mock('@/components/seo/SeoPageContextPanel', () => ({
  SeoPageContextPanel: () => <div data-testid="seo-page-context" />,
}));

const getSchemaPayloads = () =>
  Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
    (node) => node.textContent ?? '',
  );

describe('England tenancy agreement guide page', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('keeps the page positioned as support content that routes back to the hub', () => {
    render(<EnglandPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'England Tenancy Agreement Guide' })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/England template hub first/i).length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole('link', { name: /View the England tenancy agreement template/i })
        .every((link) => link.getAttribute('href') === '/tenancy-agreement-template')
    ).toBe(true);
  });

  it('includes FAQ and breadcrumb schema rather than product schema', () => {
    render(<EnglandPage />);

    const payloads = getSchemaPayloads();
    expect(payloads.some((payload) => payload.includes('"@type":"FAQPage"'))).toBe(true);
    expect(payloads.some((payload) => payload.includes('"@type":"BreadcrumbList"'))).toBe(true);
    expect(payloads.some((payload) => payload.includes('"@type":"Product"'))).toBe(false);
  });
});
