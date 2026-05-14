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
    subtitle,
    primaryCta,
    secondaryCta,
    children,
  }: {
    title: string;
    subtitle?: React.ReactNode;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    children?: React.ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
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
  }: {
    title?: string;
    faqs: Array<{ question: string; answer: string }>;
  }) => (
    <section>
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

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: ({ title }: { title: string }) => <section><h2>{title}</h2></section>,
}));

vi.mock('@/components/seo/SeoLandingWrapper', () => ({
  SeoLandingWrapper: () => null,
}));

describe('rent increase hub product routing', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('shows the current Section 13 product choices on the hub page', async () => {
    const pageModule = await import('@/app/rent-increase/page');

    render(pageModule.default());

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Increase rent in England with a Section 13 pack/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Standard Section 13 Rent Increase Pack')).toBeInTheDocument();
    expect(screen.getByText('Challenge-Ready Section 13 Defence Pack')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the Standard Section 13 Rent Increase Pack' })
    ).toHaveAttribute('href', '/products/section-13-standard');
    expect(
      screen.getAllByRole('link', { name: 'Open the Challenge-Ready Defence Pack' }).length
    ).toBeGreaterThan(0);
  });
});
