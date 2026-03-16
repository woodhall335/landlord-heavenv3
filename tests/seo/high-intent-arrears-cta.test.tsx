/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import ClaimRentArrearsTenantPage from '@/app/claim-rent-arrears-tenant/page';
import RecoverRentArrearsAfterEvictionPage from '@/app/recover-rent-arrears-after-eviction/page';
import TenantLeftWithoutPayingRentPage from '@/app/tenant-left-without-paying-rent/page';
import TenantStoppedPayingRentPage from '@/app/tenant-stopped-paying-rent/page';
import EvictTenantNotPayingRentPage from '@/app/evict-tenant-not-paying-rent/page';
import { PASS2_LONGFORM_PAGES } from '@/lib/seo/pass2-longform-content';

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
    primaryCta,
    secondaryCta,
    children,
  }: {
    title: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    children?: React.ReactNode;
  }) => (
    <section data-testid="hero">
      <h1>{title}</h1>
      {primaryCta ? <a href={primaryCta.href}>{primaryCta.label}</a> : null}
      {secondaryCta ? <a href={secondaryCta.href}>{secondaryCta.label}</a> : null}
      {children}
    </section>
  ),
}));

vi.mock('@/components/ui/Container', () => ({
  Container: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div>{children}</div>,
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: () => null,
}));

vi.mock('@/components/seo/SeoLandingWrapper', () => ({
  SeoLandingWrapper: () => null,
}));

vi.mock('@/components/ui/SocialProofCounter', () => ({
  SocialProofCounter: () => null,
}));

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: () => null,
}));

vi.mock('@/components/seo/SeoCtaBlock', () => ({
  SeoCtaBlock: () => null,
  SeoDisclaimer: () => null,
}));

vi.mock('@/lib/seo/structured-data', () => ({
  StructuredData: () => null,
  breadcrumbSchema: () => ({}),
  articleSchema: () => ({}),
  faqPageSchema: () => ({}),
  HOWTO_SCHEMAS: {
    mcolProcess: {},
  },
}));

afterEach(() => {
  cleanup();
});

describe('High-intent arrears CTA alignment', () => {
  it('keeps claim-rent-arrears-tenant on money claim with complete-pack as the eviction route', () => {
    render(<ClaimRentArrearsTenantPage />);

    const hero = screen.getByTestId('hero');
    const primaryLink = within(hero).getByRole('link', { name: /Start Money Claim/i });
    const secondaryLink = within(hero).getByRole('link', { name: /Also Need Eviction\?/i });

    expect(primaryLink).toHaveAttribute('href', expect.stringContaining('product=money_claim'));
    expect(secondaryLink).toHaveAttribute('href', expect.stringContaining('product=complete_pack'));
  });

  it('leads recover-rent-arrears-after-eviction with the money-claim product page', () => {
    render(<RecoverRentArrearsAfterEvictionPage />);

    const hero = screen.getByTestId('hero');
    const primaryLink = within(hero).getByRole('link', { name: 'Start Money Claim Pack' });
    const secondaryLink = within(hero).getByRole('link', { name: 'Need Complete Pack instead?' });

    expect(primaryLink).toHaveAttribute('href', '/products/money-claim');
    expect(secondaryLink).toHaveAttribute('href', '/products/complete-pack');
  });

  it('leads tenant-left-without-paying-rent with the money-claim product page', () => {
    render(<TenantLeftWithoutPayingRentPage />);

    const hero = screen.getByTestId('hero');
    const primaryLink = within(hero).getByRole('link', { name: 'Start Money Claim Pack' });
    const secondaryLink = within(hero).getByRole('link', { name: 'Need Complete Pack instead?' });

    expect(primaryLink).toHaveAttribute('href', '/products/money-claim');
    expect(secondaryLink).toHaveAttribute('href', '/products/complete-pack');
  });
});

describe('Possession-led arrears routes stay eviction-first', () => {
  it('keeps tenant-stopped-paying-rent notice-first in the hero', () => {
    render(<TenantStoppedPayingRentPage />);

    const hero = screen.getByTestId('hero');
    const primaryLink = within(hero).getByRole('link', { name: 'Start Notice Only for arrears' });
    const secondaryLink = within(hero).getByRole('link', {
      name: 'Need court-ready bundle? Complete Pack',
    });

    expect(primaryLink).toHaveAttribute('href', '/products/notice-only');
    expect(secondaryLink).toHaveAttribute('href', '/products/complete-pack');
  });

  it('keeps evict-tenant-not-paying-rent notice-first in the hero', () => {
    render(<EvictTenantNotPayingRentPage />);

    const hero = screen.getByTestId('hero');
    const primaryLink = within(hero).getByRole('link', { name: 'Start Notice Only' });
    const secondaryLink = within(hero).getByRole('link', { name: 'Start Complete Eviction Pack' });

    expect(primaryLink).toHaveAttribute('href', '/products/notice-only');
    expect(secondaryLink).toHaveAttribute('href', '/products/complete-pack');
  });

  it('keeps the pass2 rent-arrears guide configured as eviction-first', () => {
    const rentArrearsGuide = PASS2_LONGFORM_PAGES['rent-arrears-eviction-guide'];

    expect(rentArrearsGuide.primaryCta).toEqual({
      label: 'Start Notice Only',
      href: '/products/notice-only',
    });
    expect(rentArrearsGuide.secondaryCta).toEqual({
      label: 'Recover arrears with Money Claim',
      href: '/products/money-claim',
    });
  });
});
