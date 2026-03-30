import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { getBlogSeoConfig } from '@/lib/blog/seo';
import type { BlogPost } from '@/lib/blog/types';

function makePost(overrides: Partial<BlogPost>): BlogPost {
  return {
    slug: 'phase1-test-post',
    title: 'Landlord guide',
    description: 'A landlord guide for the current route.',
    metaDescription: 'A landlord guide for the current route with the right next step.',
    date: '2026-03-30',
    readTime: '5 min read',
    wordCount: 800,
    category: 'Guides',
    tags: [],
    author: {
      name: 'Landlord Heaven',
      role: 'Editorial',
    },
    heroImage: '/images/test.webp',
    heroImageAlt: 'Test image',
    showUrgencyBanner: false,
    tableOfContents: [],
    relatedPosts: [],
    targetKeyword: 'landlord guide',
    secondaryKeywords: [],
    content: null as ReactNode,
    ...overrides,
  };
}

describe('Phase 1 blog SEO routing', () => {
  it('routes England tenancy intent to the tenancy template owner', () => {
    const config = getBlogSeoConfig(
      makePost({
        slug: 'england-tenancy-agreement-guide',
        title: 'Tenancy agreement template for landlords',
        description: 'How England landlords choose the right tenancy agreement template.',
        metaDescription: 'How England landlords choose the right tenancy agreement template.',
        targetKeyword: 'tenancy agreement template',
        tags: ['Tenancy Agreement', 'England'],
      }),
      'england'
    );

    expect(config.pillarLink.href).toBe('/tenancy-agreement-template');
    expect(config.supportingLinks[0]?.href).toBe('/tenancy-agreement-template');
    expect(config.supportingLinks[1]?.href).toBe('/products/ast');
    expect(config.supportingLinks.some((link) => link.href === '/tenancy-agreement-template-uk')).toBe(false);
  });

  it('routes England notice intent to the eviction notice template owner', () => {
    const config = getBlogSeoConfig(
      makePost({
        slug: 'england-eviction-notice-guide',
        title: 'Eviction notice template explained for landlords',
        description: 'Choose the right England eviction notice route before you serve anything.',
        metaDescription: 'Choose the right England eviction notice route before you serve anything.',
        targetKeyword: 'eviction notice template',
        tags: ['Eviction Notice', 'England'],
      }),
      'england'
    );

    expect(config.pillarLink.href).toBe('/eviction-notice-template');
    expect(config.supportingLinks[0]?.href).toBe('/eviction-notice-template');
    expect(config.supportingLinks[1]?.href).toBe('/products/notice-only');
  });

  it('routes complete-pack intent to the product owner rather than bridge pages', () => {
    const config = getBlogSeoConfig(
      makePost({
        slug: 'england-complete-eviction-pack-guide',
        title: 'Complete eviction pack for landlords',
        description: 'When England landlords need the notice-to-court eviction pack route.',
        metaDescription: 'When England landlords need the notice-to-court eviction pack route.',
        targetKeyword: 'complete eviction pack',
        tags: ['Eviction Pack', 'England'],
      }),
      'england'
    );

    expect(config.pillarLink.href).toBe('/products/complete-pack');
    expect(config.supportingLinks[0]?.href).toBe('/products/complete-pack');
    expect(config.supportingLinks.some((link) => link.href === '/eviction-process-england')).toBe(
      false
    );
  });

  it('routes broad money-claim intent to the money-claim owner and keeps MCOL as support only', () => {
    const config = getBlogSeoConfig(
      makePost({
        slug: 'england-money-claim-guide',
        title: 'Money claim for unpaid rent',
        description: 'How England landlords start a money claim for unpaid rent and tenant debt.',
        metaDescription: 'How England landlords start a money claim for unpaid rent and tenant debt.',
        targetKeyword: 'money claim unpaid rent',
        tags: ['Money Claim', 'Rent Arrears', 'England'],
      }),
      'england'
    );

    expect(config.pillarLink.href).toBe('/money-claim');
    expect(config.supportingLinks[0]?.href).toBe('/money-claim');
    expect(config.supportingLinks[1]?.href).toBe('/products/money-claim');
    expect(config.supportingLinks.some((link) => link.href === '/money-claim-online-mcol')).toBe(
      false
    );
  });
});
