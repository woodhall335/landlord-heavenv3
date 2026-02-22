/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import NoticeOnlyPage from '@/app/(marketing)/products/notice-only/page';
import CompletePackPage from '@/app/(marketing)/products/complete-pack/page';
import MoneyClaimPage from '@/app/(marketing)/products/money-claim/page';
import AstPage from '@/app/(marketing)/products/ast/page';
import TenancyAgreementTemplatePage from '@/app/tenancy-agreement-template/page';
import AssuredShortholdTenancyAgreementTemplatePage from '@/app/assured-shorthold-tenancy-agreement-template/page';
import WalesTenancyAgreementTemplatePage from '@/app/wales-tenancy-agreement-template/page';
import PrivateResidentialTenancyAgreementTemplatePage from '@/app/private-residential-tenancy-agreement-template/page';
import NorthernIrelandTenancyAgreementTemplatePage from '@/app/northern-ireland-tenancy-agreement-template/page';
import EvictionNoticeTemplatePage from '@/app/eviction-notice-template/page';
import EvictionProcessEnglandPage from '@/app/eviction-process-england/page';
import MoneyClaimOnlineMcolPage from '@/app/money-claim-online-mcol/page';
import MoneyClaimUnpaidRentPage from '@/app/money-claim-unpaid-rent/page';
import BlogSlugPage from '@/app/(marketing)/blog/[slug]/page';
import RentArrearsCalculatorPage from '@/app/tools/rent-arrears-calculator/page';
import Section21NoticeGeneratorPage from '@/app/tools/free-section-21-notice-generator/page';
import AskHeavenPage from '@/app/ask-heaven/page';
import { blogPosts } from '@/lib/blog/posts';

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

const renderPage = async (renderer: () => React.ReactElement | Promise<React.ReactElement>) => {
  const element = await renderer();
  return render(element);
};

describe('critical routes render exactly one h1', () => {
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
    ['/products/notice-only', () => NoticeOnlyPage()],
    ['/products/complete-pack', () => CompletePackPage()],
    ['/products/money-claim', () => MoneyClaimPage()],
    ['/products/ast', () => AstPage()],
    ['/tenancy-agreement-template', () => TenancyAgreementTemplatePage()],
    [
      '/assured-shorthold-tenancy-agreement-template',
      () => AssuredShortholdTenancyAgreementTemplatePage(),
    ],
    ['/wales-tenancy-agreement-template', () => WalesTenancyAgreementTemplatePage()],
    [
      '/private-residential-tenancy-agreement-template',
      () => PrivateResidentialTenancyAgreementTemplatePage(),
    ],
    [
      '/northern-ireland-tenancy-agreement-template',
      () => NorthernIrelandTenancyAgreementTemplatePage(),
    ],
    ['/eviction-notice-template', () => EvictionNoticeTemplatePage()],
    ['/eviction-process-england', () => EvictionProcessEnglandPage()],
    ['/money-claim-online-mcol', () => MoneyClaimOnlineMcolPage()],
    ['/money-claim-unpaid-rent', () => MoneyClaimUnpaidRentPage()],
    [
      '/blog/[slug]',
      () => BlogSlugPage({ params: Promise.resolve({ slug: blogPosts[0].slug }) }),
    ],
    ['/tools/rent-arrears-calculator', () => <RentArrearsCalculatorPage />],
    ['/tools/free-section-21-notice-generator', () => <Section21NoticeGeneratorPage />],
    ['/ask-heaven', () => AskHeavenPage({ searchParams: Promise.resolve({}) })],
  ])('renders a single h1 for %s', async (_route, renderer) => {
    const { container } = await renderPage(renderer);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });
});
