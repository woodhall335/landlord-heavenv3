import { describe, expect, it } from 'vitest';

import { TOP_30_UPGRADE_SLUGS } from '@/lib/blog/top30-upgrades';
import {
  buildSeoOpportunityAudit,
  classifySeoOpportunityCluster,
  renderSeoOpportunityAuditMarkdown,
} from '@/lib/seo/opportunity-audit';
import { OWNER_PAGE_CONTRACTS } from '@/lib/seo/owner-page-contracts';
import { PRODUCT_OWNER_METADATA_LIST } from '@/lib/seo/product-owner-metadata';

describe('SEO opportunity audit', () => {
  it('classifies owner pages, high-intent pages, and blog posts without dynamic routes', async () => {
    const result = await buildSeoOpportunityAudit();

    expect(result.items.some((item) => item.pageType === 'owner')).toBe(true);
    expect(result.items.some((item) => item.pageType === 'high-intent')).toBe(true);
    expect(result.items.some((item) => item.pageType === 'blog')).toBe(true);
    expect(result.items.every((item) => !item.pageUrl.includes('['))).toBe(true);
    expect(result.totalPagesAudited).toBe(result.items.length);

    for (const contract of OWNER_PAGE_CONTRACTS) {
      expect(result.items).toContainEqual(
        expect.objectContaining({
          pageUrl: contract.pathname,
          pageType: 'owner',
        })
      );
    }
  });

  it('maps commercial intents to practical SEO clusters', () => {
    expect(classifySeoOpportunityCluster('section 8 notice generator form 3a')).toBe('section-8-notice');
    expect(classifySeoOpportunityCluster('court-ready possession claim pack n5 n119')).toBe('section-8-court');
    expect(classifySeoOpportunityCluster('mcol pack for landlords rent arrears')).toBe('money-claim');
    expect(classifySeoOpportunityCluster('form 4a generator section 13 rent increase')).toBe('section-13');
    expect(classifySeoOpportunityCluster('premium periodic tenancy agreement builder')).toBe('tenancy-agreements');
  });

  it('tracks product links from high-intent support pages', async () => {
    const result = await buildSeoOpportunityAudit();
    const supportItems = result.items.filter((item) => item.pageType === 'high-intent');
    const commercialSupportItems = supportItems.filter((item) =>
      item.expectedProductLinks.some((href) => href.startsWith('/products/') || href.includes('tenancy-agreement'))
    );

    expect(supportItems.length).toBeGreaterThan(10);
    expect(commercialSupportItems.length).toBeGreaterThan(10);
    expect(
      commercialSupportItems.some((item) => item.presentProductLinks.includes('/products/notice-only'))
    ).toBe(true);
    expect(
      commercialSupportItems.some((item) => item.presentProductLinks.includes('/products/complete-pack'))
    ).toBe(true);
  });

  it('checks commercial phrases before FAQ-only contexts on product owner pages', async () => {
    const result = await buildSeoOpportunityAudit();
    const productOwners = result.items.filter((item) => item.pageType === 'owner');

    expect(productOwners.length).toBeGreaterThanOrEqual(OWNER_PAGE_CONTRACTS.length);
    const commercialOwnerPaths = new Set(PRODUCT_OWNER_METADATA_LIST.map((metadata) => metadata.path));
    for (const pageUrl of commercialOwnerPaths) {
      expect(productOwners.some((owner) => owner.pageUrl === pageUrl), pageUrl).toBe(true);
    }
    for (const item of productOwners.filter((owner) => commercialOwnerPaths.has(owner.pageUrl))) {
      expect(
        item.bodyKeywordHits.length > 0 ||
          item.issues.includes('No commercial phrase appears before FAQ content'),
        item.pageUrl
      ).toBe(true);
    }
  });

  it('retains blog target keywords and commercial next-step destinations', async () => {
    const result = await buildSeoOpportunityAudit();
    const blogItems = result.items.filter((item) => item.pageType === 'blog');

    expect(blogItems.length).toBeGreaterThan(20);
    for (const item of blogItems) {
      expect(item.targetKeyword, item.pageUrl).toBeTruthy();
      expect(item.primaryCommercialDestination, item.pageUrl).toMatch(/^\/.+/);
    }
  });

  it('keeps top-30 blog posts connected to commercial next-step links', async () => {
    const result = await buildSeoOpportunityAudit();

    const top30Items = result.items.filter((item) => item.isTop30BlogPost);

    expect(top30Items.length).toBeGreaterThan(0);
    expect(top30Items.length).toBeLessThanOrEqual(TOP_30_UPGRADE_SLUGS.length);

    for (const item of top30Items) {
      expect(item.isTop30BlogPost, item.pageUrl).toBe(true);
      expect(item.primaryCommercialDestination, item.pageUrl).toMatch(/^\/.+/);
      expect(item.issues, item.pageUrl).not.toContain('Top-30 blog post has no configured commercial next-step link');
    }
  });

  it('renders a ranked Markdown report with keyword, link, FAQ, and cannibalisation fields', async () => {
    const result = await buildSeoOpportunityAudit();
    const markdown = renderSeoOpportunityAuditMarkdown(result);

    expect(markdown).toContain('# High-Intent And Blog SEO Opportunity Audit');
    expect(markdown).toContain('## Ranked Opportunities');
    expect(markdown).toContain('Current target keyword');
    expect(markdown).toContain('Suggested internal-link anchors');
    expect(markdown).toContain('FAQ opportunities');
    expect(markdown).toContain('Issues and cannibalisation risks');
  });
});
