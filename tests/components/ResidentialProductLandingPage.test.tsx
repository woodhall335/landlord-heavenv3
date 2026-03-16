/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResidentialProductLandingPage } from '@/components/seo/ResidentialProductLandingPage';
import { RESIDENTIAL_LANDING_CONTENT } from '@/lib/seo/residential-product-landing-content';

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
    actionsSlot,
    children,
  }: {
    title: string;
    subtitle?: React.ReactNode;
    actionsSlot?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
      {subtitle ? <div>{subtitle}</div> : null}
      {actionsSlot ? <div>{actionsSlot}</div> : null}
      {children ? <div>{children}</div> : null}
    </section>
  ),
}));

vi.mock('@/components/marketing/TrustPositioningBar', () => ({
  TrustPositioningBar: () => <div>Trust positioning bar</div>,
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: () => <div>FAQ section</div>,
}));

vi.mock('@/components/ui/Container', () => ({
  Container: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...rest}>{children}</div>,
}));

vi.mock('@/lib/seo/structured-data', () => ({
  StructuredData: () => null,
  breadcrumbSchema: () => ({}),
  productSchema: () => ({}),
}));

describe('ResidentialProductLandingPage', () => {
  it('removes the hero summary card from standalone document pages', () => {
    render(
      <ResidentialProductLandingPage
        content={RESIDENTIAL_LANDING_CONTENT.lease_amendment}
        canonicalUrl="https://landlordheaven.co.uk/lease-amendment-england"
      />
    );

    expect(screen.queryByText('What the document covers')).not.toBeInTheDocument();
    expect(screen.queryByText('How it is laid out')).not.toBeInTheDocument();
    expect(screen.getByText('Trust positioning bar')).toBeInTheDocument();
  });
});
