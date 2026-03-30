/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ASTProductPage from '@/app/(marketing)/products/ast/page';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  ENGLAND_TENANCY_PRODUCT_ORDER,
} from '@/lib/tenancy/england-product-model';

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
        name: /Choose the right England agreement type/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Updated for current housing law/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/If your tenancy started before/i, {
        selector: 'p',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'New England tenancies no longer start with old AST assumptions',
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
      name: `Start Standard Tenancy Agreement - ${PRODUCTS.england_standard_tenancy_agreement.displayPrice}`,
    });
    expect(standardProductCta).toHaveAttribute(
      'href',
      '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=products_ast_hub&topic=tenancy',
    );

    const premiumProductCta = screen.getByRole('link', {
      name: `Start Premium Tenancy Agreement - ${PRODUCTS.england_premium_tenancy_agreement.displayPrice}`,
    });
    expect(premiumProductCta).toHaveAttribute(
      'href',
      '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=products_ast_hub&topic=tenancy',
    );

    const englandCta = screen.getByRole('link', {
      name: 'View England agreement routes',
    });
    expect(englandCta).toHaveAttribute('href', '/products/ast');

    const englandPremiumCta = screen.getByRole('link', {
      name: `Start England Premium - ${PRODUCTS.england_premium_tenancy_agreement.displayPrice}`,
    });
    expect(englandPremiumCta.getAttribute('href')).toContain(
      'product=england_premium_tenancy_agreement',
    );

    const niPremiumCta = screen.getByRole('link', {
      name: `Create premium Northern Ireland agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    });
    expect(niPremiumCta.getAttribute('href')).toContain('jurisdiction=northern-ireland');
  });

  it('renders the shared England tenancy product card images', () => {
    render(<ASTProductPage />);

    for (const sku of ENGLAND_TENANCY_PRODUCT_ORDER) {
      const image = ENGLAND_TENANCY_PRODUCT_IMAGES[sku];
      expect(screen.getByAltText(image.alt)).toHaveAttribute('src', image.src);
    }
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
      screen.getByText(/This page helps you compare the five live England agreement routes/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Is /products/ast the main England template hub?' })
    );
    expect(
      screen.getByText(/The main template hub is \/tenancy-agreement-template\./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Start with the current England route, compare Standard and Premium clearly, and use the Student, HMO \/ Shared House, or Lodger product/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Standard is designed for straightforward lets\. Premium is the stronger fit for ordinary residential lets that need fuller drafting\./i,
      ),
    ).toBeInTheDocument();

    const wordCount = document.body.textContent?.trim().split(/\s+/).length ?? 0;
    expect(wordCount).toBeGreaterThan(1100);
  });
});
