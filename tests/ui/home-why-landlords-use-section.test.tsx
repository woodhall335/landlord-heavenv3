/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WhyLandlordsUseSection } from '@/components/landing/HomeContent';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    fill?: boolean;
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

afterEach(() => {
  cleanup();
});

describe('WhyLandlordsUseSection', () => {
  it('renders the homepage cards with the new illustrations and existing CTA', () => {
    render(<WhyLandlordsUseSection />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Know your route before you serve anything',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Avoid invalid notices and expensive possession delays',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Generate court-ready landlord documents for the right UK jurisdiction',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByAltText('Landlord notice route decision illustration'),
    ).toHaveAttribute('src', '/images/decision_image.webp');
    expect(
      screen.getByAltText('Landlord notice validation illustration'),
    ).toHaveAttribute('src', '/images/validation_image.webp');
    expect(
      screen.getByAltText('UK jurisdiction landlord document illustration'),
    ).toHaveAttribute('src', '/images/jurisdiction_image.webp');

    const cta = screen.getByRole('link', { name: /Find out which notice you need/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/wizard?product=notice_only&topic=eviction&src=seo_homepage');
  });
});
