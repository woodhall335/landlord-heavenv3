/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BlogSlugPage from '@/app/(marketing)/blog/[slug]/page';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    priority,
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

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound');
  },
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/layout/HeaderConfig', () => ({
  HeaderConfig: () => null,
}));

const renderBlogPage = async (slug: string) => {
  const element = await BlogSlugPage({ params: Promise.resolve({ slug }) });
  return render(element);
};

describe('Blog page next steps rollout', () => {
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

  it.each([
    [
      'england-county-court-forms',
      [
        { label: 'Eviction Court Forms England', href: '/eviction-court-forms-england' },
        { label: 'N5B Form Guide', href: '/n5b-form-guide' },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack' },
      ],
    ],
    [
      'england-bailiff-eviction',
      [
        { label: 'Warrant of Possession Guide', href: '/warrant-of-possession-guide' },
        { label: 'Court Bailiff Eviction Guide', href: '/court-bailiff-eviction-guide' },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack' },
      ],
    ],
    [
      'england-possession-hearing',
      [
        { label: 'Eviction Court Forms England', href: '/eviction-court-forms-england' },
        { label: 'Court Possession Order Guide', href: '/court-possession-order-guide' },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack' },
      ],
    ],
    [
      'how-to-serve-eviction-notice',
      [
        { label: 'Serve Section 21 Notice', href: '/serve-section-21-notice' },
        { label: 'Serve Section 8 Notice', href: '/serve-section-8-notice' },
        { label: 'Notice Only Bundle', href: '/products/notice-only' },
      ],
    ],
    [
      'how-long-does-eviction-take-uk',
      [
        { label: 'Eviction Timeline England', href: '/eviction-timeline-england' },
        { label: 'Possession Order Timeline', href: '/possession-order-timeline' },
        { label: 'Complete Eviction Pack', href: '/products/complete-pack' },
      ],
    ],
  ])('renders the next-steps block with sprint links for %s', async (slug, links) => {
    await renderBlogPage(slug);

    expect(
      screen.getByRole('heading', {
        name: 'What to do next',
      })
    ).toBeInTheDocument();

    links.forEach(({ label, href }) => {
      const link = screen.getByRole('link', { name: new RegExp(label, 'i') });
      expect(link).toHaveAttribute('href', href);
    });
  });
});
