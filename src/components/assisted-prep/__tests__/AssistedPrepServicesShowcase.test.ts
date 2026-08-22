/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedPrepServicesShowcase, getGroundCodeFromPath } from '../AssistedPrepServicesShowcase';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => createElement('img', { src, alt }),
}));

vi.mock('@/components/analytics/TrackedLink', () => ({
  TrackedLink: ({ href, children }: { href: string; children: ReactNode }) => createElement('a', { href }, children),
}));

vi.mock('@/components/marketing/PremiumMotion', () => ({
  StaggerReveal: ({ children }: { children: ReactNode }) => createElement('div', null, children),
}));

describe('getGroundCodeFromPath', () => {
  it('identifies Section 8 Ground guide routes for the focused notice CTA', () => {
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-1a',
        'seo_ground_assisted_cta'
      )
    ).toBe('1a');
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-7a/',
        'seo_ground_assisted_cta'
      )
    ).toBe('7a');
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-17',
        'seo_ground_assisted_cta'
      )
    ).toBe('17');
  });

  it('keeps the general showcase for other contexts', () => {
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-8',
        'assisted_showcase'
      )
    ).toBeNull();
    expect(getGroundCodeFromPath('/tools/section-8-notice-date-calculator', 'seo_ground_assisted_cta')).toBeNull();
  });

  it('shows the assisted-prep price after the free consultation message', () => {
    render(createElement(AssistedPrepServicesShowcase));

    expect(screen.getByText(/Free consultation.*£149\.00 only if we confirm we can help/)).toBeInTheDocument();
    expect(screen.getByText(/Free consultation.*£399\.00 only if we confirm we can help/)).toBeInTheDocument();
  });
});
