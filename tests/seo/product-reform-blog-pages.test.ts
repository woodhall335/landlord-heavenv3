import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getPostRegion } from '@/lib/blog/categories';
import { blogPosts } from '@/lib/blog/posts';
import { getBlogProductCta } from '@/lib/blog/product-cta-map';
import { getBlogSeoConfig } from '@/lib/blog/seo';

const EXPECTED_PRODUCT_REFORM_POSTS = {
  'england-form-3a-eviction-notice-generator-after-renters-rights-act': '/products/notice-only',
  'england-complete-eviction-pack-after-section-21-ban': '/products/complete-pack',
  'england-money-claim-unpaid-rent-after-renters-rights-act': '/products/money-claim',
  'england-section-13-rent-increase-pack-after-renters-rights-act': '/products/section-13-standard',
  'england-section-13-defence-pack-tribunal-challenge': '/products/section-13-defence',
  'england-standard-tenancy-agreement-after-1-may-2026': '/standard-tenancy-agreement',
  'england-premium-tenancy-agreement-after-renters-rights-act': '/premium-tenancy-agreement',
  'england-student-tenancy-agreement-after-renters-rights-act': '/student-tenancy-agreement',
  'england-hmo-shared-house-tenancy-agreement-after-renters-rights-act': '/hmo-shared-house-tenancy-agreement',
  'england-lodger-agreement-after-renters-rights-act': '/lodger-agreement',
} as const;

const expectedSlugs = Object.keys(EXPECTED_PRODUCT_REFORM_POSTS);

describe('product reform blog pages', () => {
  it('publishes all planned England product reform pages as substantive posts', () => {
    for (const slug of expectedSlugs) {
      const post = blogPosts.find((candidate) => candidate.slug === slug);

      expect(post, `${slug} should exist`).toBeDefined();
      expect(getPostRegion(slug)).toBe('england');
      expect(post?.wordCount, `${slug} should not be thin`).toBeGreaterThanOrEqual(1200);
      expect(post?.tableOfContents.length, `${slug} should have a useful structure`).toBeGreaterThanOrEqual(5);
      expect(post?.faqs?.length, `${slug} should support FAQ rich results`).toBeGreaterThanOrEqual(3);
      expect(post?.sources?.length, `${slug} should cite official sources`).toBeGreaterThanOrEqual(2);
      expect(post?.updatedDate, `${slug} should carry freshness metadata`).toBeTruthy();

      const metadataText = [
        post?.title,
        post?.description,
        post?.metaDescription,
        post?.targetKeyword,
        ...(post?.secondaryKeywords ?? []),
        ...(post?.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      expect(
        metadataText,
        `${slug} should be positioned around the Renters Rights Act or the 1 May 2026 transition`
      ).toMatch(/renters rights act|1 may 2026/);
    }
  });

  it('routes each post CTA and SEO pillar to the intended product page', () => {
    for (const [slug, expectedHref] of Object.entries(EXPECTED_PRODUCT_REFORM_POSTS)) {
      const post = blogPosts.find((candidate) => candidate.slug === slug);
      expect(post).toBeDefined();

      const cta = getBlogProductCta(post!);
      const seoConfig = getBlogSeoConfig(post!, getPostRegion(slug));

      expect(cta.primaryProductHref).toBe(expectedHref);
      expect(cta.usedDefault).toBe(false);
      expect(seoConfig.primaryCommercialLink.href).toBe(expectedHref);
      expect(seoConfig.pillarLink.href).toBe(expectedHref);
      expect(seoConfig.robots).toBe('index,follow');
    }
  });

  it('includes every product reform blog page in the sitemap', async () => {
    const sitemapEntries = await sitemap();
    const sitemapPaths = sitemapEntries.map((entry) => new URL(entry.url).pathname);

    expect(sitemapPaths).toEqual(
      expect.arrayContaining(expectedSlugs.map((slug) => `/blog/${slug}`))
    );
  });
});
