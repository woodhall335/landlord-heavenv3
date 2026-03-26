/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LodgerAgreementPage from '@/app/lodger-agreement-template/page';

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

vi.mock('@/components/ui/Container', () => ({
  Container: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div>{children}</div>,
}));

vi.mock('@/components/landing/UniversalHero', () => ({
  UniversalHero: ({
    title,
    primaryCta,
  }: {
    title: string;
    primaryCta?: { label: string; href: string };
  }) => (
    <section>
      <h1>{title}</h1>
      {primaryCta ? <a href={primaryCta.href}>{primaryCta.label}</a> : null}
    </section>
  ),
}));

vi.mock('@/lib/seo/structured-data', () => ({
  StructuredData: () => null,
  breadcrumbSchema: () => ({}),
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: () => null,
}));

describe('LodgerAgreementPage CTAs', () => {
  it('routes page CTAs to the surviving tenancy agreement landing page', () => {
    render(<LodgerAgreementPage />);

    expect(
      screen.getByRole('link', { name: 'Create Lodger Agreement' })
    ).toHaveAttribute('href', '/tenancy-agreement');

    expect(
      screen.getByRole('link', { name: 'tenancy agreement route' })
    ).toHaveAttribute('href', '/tenancy-agreement');

    expect(
      screen.getByRole('link', { name: 'recommended tenancy agreement pathway' })
    ).toHaveAttribute('href', '/tenancy-agreement');

    expect(
      screen.getByRole('link', { name: 'Get Lodger Agreement' })
    ).toHaveAttribute('href', '/tenancy-agreement');
  });
});
