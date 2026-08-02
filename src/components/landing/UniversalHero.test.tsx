/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { UniversalHero } from './UniversalHero';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    unoptimized: _unoptimized,
    fill: _fill,
    priority: _priority,
    ...props
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
    fill?: boolean;
    priority?: boolean;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/reviews/reviewStats', () => ({
  REVIEW_RATING: 4.8,
  getDynamicReviewCount: () => 1061,
}));

describe('UniversalHero review pill', () => {
  it('resolves a registered watercolor hero and applies the pastel contrast contract', () => {
    const { container } = render(
      <UniversalHero
        title="Wales agreement"
        variant="pastel"
        backgroundImageKey="tenancyWales"
        subtitle="Supporting copy"
      />
    );

    expect(screen.getByRole('region')).toHaveAttribute('data-hero-variant', 'pastel');
    expect(
      container.querySelector(
        'img[src="/images/heroes/universal/hero-tenancy-wales.webp"]'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wales agreement' })).toHaveClass('text-[#17112f]');
  });

  it('uses the compact desktop pill for shorter trust text', () => {
    render(
      <UniversalHero
        title="Short hero"
        trustText="Clear England landlord guidance"
        subtitle="Supporting copy"
      />
    );

    const desktopPill = screen.getByTestId('hero-review-pill-desktop');
    expect(desktopPill).toHaveClass('lg:flex');
    expect(screen.getByTestId('hero-review-pill-trust')).toHaveTextContent(
      'Clear England landlord guidance'
    );
    expect(desktopPill).toHaveTextContent('4.8/5 | 1061 reviews');
  });

  it('uses the stacked desktop pill for longer trust text and keeps the review row visible', () => {
    render(
      <UniversalHero
        title="Long hero"
        trustText="England tenancy agreements | Standard and Premium updated for 1 May 2026"
        subtitle="Supporting copy"
      />
    );

    const desktopPill = screen.getByTestId('hero-review-pill-desktop');
    expect(desktopPill).toHaveClass('lg:block');
    expect(screen.getByTestId('hero-review-pill-trust')).toHaveTextContent(
      'England tenancy agreements | Standard and Premium updated for 1 May 2026'
    );
    expect(screen.getByTestId('hero-review-pill-meta')).toHaveTextContent('4.8/5 | 1061 reviews');
  });

  it('keeps the site-wide proof contract and mobile benefit grid for legacy wrappers', () => {
    render(
      <UniversalHero
        title="Legacy wrapper"
        subtitle="Supporting copy"
        showReviewPill={false}
        showUsageCounter={false}
      />
    );

    expect(screen.getByTestId('hero-review-pill-desktop')).toHaveTextContent(
      '4.8/5 | 1061 reviews'
    );
    const benefits = screen.getByTestId('hero-benefit-grid');
    expect(benefits).toHaveTextContent('Solicitor approved');
    expect(benefits).toHaveTextContent('Instant download');
    expect(benefits).toHaveTextContent('Expert support');
    expect(benefits).toHaveTextContent('stripe');
    expect(benefits).toHaveClass('lg:hidden');
  });
});
