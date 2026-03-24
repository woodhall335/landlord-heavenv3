/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ASTProductPage from '@/app/(marketing)/products/ast/page';
import { PRODUCTS } from '@/lib/pricing/products';

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

describe('/products/ast page', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(Date.now()), 0);
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    }

    window.scrollTo = vi.fn();

    if (!window.IntersectionObserver) {
      window.IntersectionObserver = class implements IntersectionObserver {
        root = null;
        rootMargin = '';
        thresholds = [];
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
      };
    }
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders the refreshed hero and core section headings', () => {
    render(<ASTProductPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Assured Periodic Tenancy Agreement for England',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Updated for the Renters' Rights Act from 1 May 2026\. Create a compliant England tenancy agreement with Standard and Premium options\./i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /If your England tenancy started before 1 May 2026, you will not usually start again with a new agreement\./i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'England is now the lead story on this page',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Choose Premium when the tenancy is more involved',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'This product also supports Wales, Scotland, and Northern Ireland.',
      }),
    ).toBeInTheDocument();

    expect(screen.getByAltText('Preview of Landlord Heaven tenancy agreement documents')).toHaveAttribute(
      'src',
      '/images/tenancy_agreements.webp',
    );
  });

  it('routes product and jurisdiction CTAs with the refreshed labels', () => {
    render(<ASTProductPage />);

    const standardProductCta = screen.getByRole('link', {
      name: `Start Standard Tenancy Agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    });
    expect(standardProductCta).toHaveAttribute(
      'href',
      'https://landlordheaven.co.uk/wizard?product=ast_standard&src=product_page&topic=tenancy',
    );

    const premiumProductCta = screen.getByRole('link', {
      name: `Start Premium Tenancy Agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    });
    expect(premiumProductCta).toHaveAttribute(
      'href',
      'https://landlordheaven.co.uk/wizard?product=ast_premium&src=product_page&topic=tenancy',
    );

    const englandCta = screen.getByRole('link', {
      name: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    });
    expect(englandCta.getAttribute('href')).toContain('jurisdiction=england');

    const englandPremiumCta = screen.getByRole('link', {
      name: `Create premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    });
    expect(englandPremiumCta.getAttribute('href')).toContain('jurisdiction=england');

    const niPremiumCta = screen.getByRole('link', {
      name: `Create premium Northern Ireland agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    });
    expect(niPremiumCta.getAttribute('href')).toContain('jurisdiction=northern-ireland');
  });

  it('renders the refreshed England update, FAQs, and closeout copy', () => {
    render(<ASTProductPage />);

    expect(
      screen.getByText(/Many landlords still search using AST language, but this product reflects the current framework/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/New tenancies use the assured periodic route/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Tenancy agreement FAQs' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A tenancy agreement is the contract between landlord and tenant for a residential let\./i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Is this still an AST for England?' }));
    expect(
      screen.getByText(/Many landlords still search using AST language\./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Start with the current England route, compare Standard and Premium clearly, and keep the other UK jurisdictions in view/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Standard is designed for straightforward lets\. Premium is the stronger fit for HMOs, student lets, guarantors, sharers, and other more complex arrangements\./i,
      ),
    ).toBeInTheDocument();

    const wordCount = document.body.textContent?.trim().split(/\s+/).length ?? 0;
    expect(wordCount).toBeGreaterThan(1100);
  });
});
