/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import AstAgreementTemplatePage from '@/app/ast-agreement-template/page';
import TenancyAgreementTemplateUkPage from '@/app/tenancy-agreement-template-uk/page';
import TenancyAgreementEngland2026Page from '@/app/tenancy-agreement-england-2026/page';
import AssuredPeriodicTenancyAgreementPage from '@/app/assured-periodic-tenancy-agreement/page';
import HmoTenancyAgreementTemplatePage from '@/app/hmo-tenancy-agreement-template/page';

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

const pages = [
  {
    name: '/ast-agreement-template',
    component: <AstAgreementTemplatePage />,
    heading: 'AST Agreement Template',
    hook: /Looking for an AST agreement template\? For new England tenancies from 1 May 2026/i,
    mediaAlt: 'Illustration showing tenancy agreement options and summary cards',
    mediaSrc: '/images/wizard-icons/12-summary-cards.png',
  },
  {
    name: '/tenancy-agreement-template-uk',
    component: <TenancyAgreementTemplateUkPage />,
    heading: 'Tenancy Agreement Template UK',
    hook: /If you searched for a tenancy agreement template UK, the real question is not just which template to use\./i,
    mediaAlt: 'Illustration of tenancy terms and agreement clauses',
    mediaSrc: '/images/wizard-icons/44-terms.png',
  },
  {
    name: '/tenancy-agreement-england-2026',
    component: <TenancyAgreementEngland2026Page />,
    heading: 'Do I Need a New Tenancy Agreement After 1 May 2026?',
    hook: /If you are asking whether you need a new tenancy agreement after 1 May 2026/i,
    mediaAlt: 'Illustration showing a tenancy timeline and calendar change',
    mediaSrc: '/images/wizard-icons/11-calendar-timeline.png',
  },
  {
    name: '/assured-periodic-tenancy-agreement',
    component: <AssuredPeriodicTenancyAgreementPage />,
    heading: 'Assured Periodic Tenancy Agreement',
    hook: /If you searched for assured periodic tenancy agreement, you are probably trying to understand the current England route/i,
    mediaAlt: 'Illustration of a tenancy agreement being signed',
    mediaSrc: '/images/wizard-icons/10-signing.png',
  },
  {
    name: '/hmo-tenancy-agreement-template',
    component: <HmoTenancyAgreementTemplatePage />,
    heading: 'HMO Tenancy Agreement Template',
    hook: /Landlords searching for an HMO tenancy agreement template are usually not looking for the same thing/i,
    mediaAlt: 'Illustration showing premium tenancy agreement features',
    mediaSrc: '/images/wizard-icons/46-premium.png',
  },
];

describe('tenancy funnel SEO pages', () => {
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

  it.each(pages)('%s renders the intended funnel content', ({ component, heading, hook, mediaAlt, mediaSrc }) => {
    render(component);

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByText(hook)).toBeInTheDocument();

    const astProductLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/products/ast');
    expect(astProductLinks.length).toBeGreaterThanOrEqual(3);

    const relatedSeoLinks = screen
      .getAllByRole('link')
      .filter((link) => {
        const href = link.getAttribute('href') ?? '';
        return href.startsWith('/') && href !== '/products/ast';
      });
    expect(relatedSeoLinks.length).toBeGreaterThan(0);

    expect(screen.getByAltText(mediaAlt)).toHaveAttribute('src', mediaSrc);

    const wordCount = document.body.textContent?.trim().split(/\s+/).length ?? 0;
    expect(wordCount).toBeGreaterThan(650);
  });
});
