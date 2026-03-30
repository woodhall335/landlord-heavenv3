/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import TenancyAgreementTemplatePage from '@/app/tenancy-agreement-template/page';
import EnglandTenancyAgreementsPage from '@/app/tenancy-agreements/england/page';
import AssuredShortholdTenancyAgreementTemplatePage from '@/app/assured-shorthold-tenancy-agreement-template/page';
import TenancyAgreementTemplateUkPage from '@/app/tenancy-agreement-template-uk/page';
import AssuredPeriodicTenancyAgreementPage from '@/app/assured-periodic-tenancy-agreement/page';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    fill?: boolean;
    priority?: boolean;
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
    mediaAlt,
    mediaSrc,
  }: {
    title: string;
    subtitle?: React.ReactNode;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    mediaAlt?: string;
    mediaSrc?: string;
  }) => (
    <section>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {primaryCta ? <a href={primaryCta.href}>{primaryCta.label}</a> : null}
      {secondaryCta ? <a href={secondaryCta.href}>{secondaryCta.label}</a> : null}
      {mediaAlt && mediaSrc ? <img alt={mediaAlt} src={mediaSrc} /> : null}
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

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: ({
    title,
    links,
  }: {
    title?: string;
    links: Array<{ href: string; title: string }>;
  }) => (
    <section>
      {title ? <h2>{title}</h2> : null}
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.title}
        </a>
      ))}
    </section>
  ),
}));

vi.mock('@/components/seo/SeoCtaBlock', () => ({
  SeoCtaBlock: ({
    title,
    description,
    primaryText,
  }: {
    title: string;
    description: string;
    primaryText: string;
  }) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{primaryText}</span>
    </section>
  ),
}));

vi.mock('@/lib/seo/structured-data', async () => {
  const actual = await vi.importActual<object>('@/lib/seo/structured-data');
  return {
    ...actual,
    StructuredData: () => null,
    breadcrumbSchema: () => ({}),
    articleSchema: () => ({}),
    faqPageSchema: () => ({}),
  };
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

const expectDocumentOrder = (before: HTMLElement, after: HTMLElement) => {
  expect(before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
};

describe('tenancy funnel SEO pages', () => {
  it('renders the rebuilt England template hub with the sample preview and the full seven-route hierarchy', () => {
    render(<TenancyAgreementTemplatePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tenancy Agreement Template (England)' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('sample-agreement-preview')).toBeInTheDocument();

    [
      'Parties',
      'Property',
      'Rent',
      'Deposit',
      'Term',
      'Repairs / responsibilities',
      'Notices / ending tenancy',
    ].forEach((heading) => {
      expect(screen.getAllByRole('heading', { name: heading }).length).toBeGreaterThan(0);
    });

    const primaryRoutesHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Primary England agreement routes',
    });
    const specialistRoutesHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Specialist England agreement routes',
    });
    const supportRoutesHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Legacy AST and assured periodic support routes',
    });
    const comparisonHelpHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Need route-selection help?',
    });

    const standardLink = screen.getByRole('link', { name: /view standard agreement/i });
    const premiumLink = screen.getByRole('link', { name: /view premium agreement/i });
    const studentLink = screen.getByRole('link', { name: /view student agreement/i });
    const hmoLink = screen.getByRole('link', { name: /view hmo \/ shared house agreement/i });
    const lodgerLink = screen.getByRole('link', { name: /view lodger agreement/i });
    const astLink = screen.getByRole('link', { name: /read ast legacy guide/i });
    const assuredPeriodicLink = screen.getByRole('link', { name: /read assured periodic guide/i });
    const compareRoutesLink = screen.getByRole('link', { name: /compare all england agreement routes/i });

    expect(standardLink).toHaveAttribute(
      'href',
      '/standard-tenancy-agreement'
    );
    expect(premiumLink).toHaveAttribute(
      'href',
      '/premium-tenancy-agreement'
    );
    expect(studentLink).toHaveAttribute('href', '/student-tenancy-agreement');
    expect(hmoLink).toHaveAttribute('href', '/hmo-shared-house-tenancy-agreement');
    expect(lodgerLink).toHaveAttribute('href', '/lodger-agreement');
    expect(astLink).toHaveAttribute('href', '/assured-shorthold-tenancy-agreement-template');
    expect(assuredPeriodicLink).toHaveAttribute('href', '/assured-periodic-tenancy-agreement');
    expect(compareRoutesLink).toHaveAttribute(
      'href',
      '/products/ast'
    );

    expectDocumentOrder(primaryRoutesHeading, specialistRoutesHeading);
    expectDocumentOrder(specialistRoutesHeading, supportRoutesHeading);
    expectDocumentOrder(supportRoutesHeading, comparisonHelpHeading);
    expectDocumentOrder(standardLink, premiumLink);
    expectDocumentOrder(premiumLink, studentLink);
    expectDocumentOrder(lodgerLink, astLink);
    expectDocumentOrder(assuredPeriodicLink, compareRoutesLink);

    const wordCount = document.body.textContent?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    expect(wordCount).toBeGreaterThan(700);
  });

  it('keeps the England guide page as support-only and routes broad users back to the hub first', () => {
    render(<EnglandTenancyAgreementsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'England Tenancy Agreement Guide' })
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: /view the england tenancy agreement template/i })
        .every((link) => link.getAttribute('href') === '/tenancy-agreement-template')
    ).toBe(true);
    expect(
      screen.getAllByText(/move to the england template hub first/i).length
    ).toBeGreaterThan(0);
  });

  it('keeps the AST page as a legacy bridge into the main hub', () => {
    render(<AssuredShortholdTenancyAgreementTemplatePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Assured Shorthold Tenancy Agreement Template',
      })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sample-agreement-preview')).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: 'View the England tenancy agreement template' })
        .some((link) => link.getAttribute('href') === '/tenancy-agreement-template')
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: 'Read the assured periodic guide' })
        .some((link) => link.getAttribute('href') === '/assured-periodic-tenancy-agreement')
    ).toBe(true);
  });

  it('renders the UK router as a thin jurisdiction selector with no preview', () => {
    render(<TenancyAgreementTemplateUkPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tenancy Agreement Template UK' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sample-agreement-preview')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose England' })).toHaveAttribute(
      'href',
      '/tenancy-agreement-template'
    );
    expect(screen.getByRole('link', { name: 'Choose Wales' })).toHaveAttribute(
      'href',
      '/wales-tenancy-agreement-template'
    );
  });

  it('keeps the assured periodic page support-only and linked back to the hub', () => {
    render(<AssuredPeriodicTenancyAgreementPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Assured Periodic Tenancy Agreement' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sample-agreement-preview')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View the England tenancy agreement template' })
    ).toHaveAttribute('href', '/tenancy-agreement-template');
    expect(
      screen.getByText(/this page is not trying to replicate the main template preview/i)
    ).toBeInTheDocument();
  });
});
