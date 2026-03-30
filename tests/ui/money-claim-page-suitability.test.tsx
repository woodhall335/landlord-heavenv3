// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
  HeaderConfig: () => <div data-testid="header-config" />,
}));

vi.mock('@/components/seo/SeoLandingWrapper', () => ({
  SeoLandingWrapper: () => null,
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock('@/lib/previews/moneyClaimPreviews', () => ({
  getMoneyClaimPreviewData: async () => [],
}));

describe('money claim owner page', () => {
  it('puts the broad claim preview and support hierarchy ahead of the transactional CTA', async () => {
    const pageModule = await import('@/app/money-claim/page');
    const Page = pageModule.default;

    render(await Page());

    const h1 = screen.getByRole('heading', {
      level: 1,
      name: 'Money Claim for Landlords (England)',
    });
    const preview = screen.getByRole('heading', {
      level: 2,
      name: 'England landlord money claim example',
    });
    const hierarchy = screen.getByRole('heading', {
      level: 2,
      name: 'Choose the right money claim support route',
    });
    const unpaidRent = screen.getByRole('heading', {
      level: 3,
      name: 'Claim unpaid rent',
    });
    const productCta = screen.getByRole('link', {
      name: /start with the money claim pack/i,
    });

    expect(h1).toBeInTheDocument();
    expect(preview).toBeInTheDocument();
    expect(hierarchy).toBeInTheDocument();
    expect(unpaidRent).toBeInTheDocument();
    expect(productCta).toBeInTheDocument();

    expect(preview.compareDocumentPosition(hierarchy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hierarchy.compareDocumentPosition(unpaidRent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(unpaidRent.compareDocumentPosition(productCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
