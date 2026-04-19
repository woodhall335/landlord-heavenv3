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

describe('rent increase hub sample proof', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('shows the generated sample pack proof on the hub page', async () => {
    const pageModule = await import('@/app/rent-increase/page');

    render(pageModule.default());

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Increase Rent in England Using Section 13 \/ Form 4A/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Sample pack proof')).toBeInTheDocument();
    expect(screen.getByText(/See a real sample pack before you pay/i)).toBeInTheDocument();
  });
});
