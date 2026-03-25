/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import RentersRightsInformationSheet2026Page from '@/app/renters-rights-act-information-sheet-2026/page';

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

describe("renters' rights information sheet page", () => {
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
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders the free-download landing page with core obligations and product links', () => {
    render(<RentersRightsInformationSheet2026Page />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "Renters' Rights Act Information Sheet 2026",
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getAllByAltText('Illustration showing tenancy compliance checks and document review')
        .length
    ).toBeGreaterThan(0);

    const downloadLinks = screen
      .getAllByRole('link')
      .filter(
        (link) =>
          link.getAttribute('href') ===
          '/downloads/renters-rights-act-information-sheet-2026'
      );
    expect(downloadLinks.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText(/20 March 2026/)).toBeInTheDocument();
    expect(screen.getAllByText(/1 May 2026/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/31 May 2026/).length).toBeGreaterThan(0);
    expect(screen.getByText(/every named tenant/i)).toBeInTheDocument();
    expect(screen.getByText(/exact PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/link alone is not valid/i)).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /view england tenancy agreements/i })
    ).toHaveAttribute('href', '/products/ast');
    expect(screen.getByRole('link', { name: /notice only/i })).toHaveAttribute(
      'href',
      '/products/notice-only'
    );
    expect(screen.getByRole('link', { name: /complete eviction pack/i })).toHaveAttribute(
      'href',
      '/products/complete-pack'
    );
    expect(screen.getByRole('link', { name: /money claim pack/i })).toHaveAttribute(
      'href',
      '/products/money-claim'
    );

    const wordCount = document.body.textContent?.trim().split(/\s+/).length ?? 0;
    expect(wordCount).toBeGreaterThan(700);
  });
});
