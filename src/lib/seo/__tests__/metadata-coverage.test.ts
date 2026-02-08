/**
 * Metadata Coverage Tests
 *
 * Regression tests to ensure SEO metadata helper applies
 * canonical, twitter cards, and keywords correctly.
 */

import { describe, it, expect } from 'vitest';
import {
  generateMetadata,
  generateMetadataForPageType,
  validateMetadataConfig,
  auditMetadata,
  CORE_KEYWORDS,
  PRODUCT_KEYWORDS,
} from '../metadata';

describe('generateMetadata', () => {
  describe('canonical URL', () => {
    it('should always include canonical URL when path is provided', () => {
      const metadata = generateMetadata({
        title: 'Test Page',
        description: 'Test description',
        path: '/test-page',
      });

      expect(metadata.alternates?.canonical).toBe(
        'https://landlordheaven.co.uk/test-page'
      );
    });

    it('should handle paths with and without leading slash', () => {
      const withSlash = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: '/products/notice-only',
      });

      const withoutSlash = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: 'products/notice-only',
      });

      expect(withSlash.alternates?.canonical).toContain('landlordheaven.co.uk');
      expect(withoutSlash.alternates?.canonical).toContain('landlordheaven.co.uk');
    });
  });

  describe('Twitter Card metadata', () => {
    it('should always include Twitter card type', () => {
      const metadata = generateMetadata({
        title: 'Test Page',
        description: 'Test description',
        path: '/test-page',
      });

      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should include Twitter title and description', () => {
      const metadata = generateMetadata({
        title: 'Test Title',
        description: 'Test description for social sharing',
        path: '/test-page',
      });

      expect(metadata.twitter?.title).toBe('Test Title');
      expect(metadata.twitter?.description).toBe('Test description for social sharing');
    });
  });

  describe('Keywords', () => {
    it('should include keywords when provided', () => {
      const customKeywords = ['custom', 'keywords', 'here'];

      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: '/test',
        keywords: customKeywords,
      });

      expect(metadata.keywords).toEqual(customKeywords);
    });
  });

  describe('Open Graph', () => {
    it('should include OpenGraph metadata', () => {
      const metadata = generateMetadata({
        title: 'Test OG Title',
        description: 'Test OG description',
        path: '/test-og',
      });

      expect(metadata.openGraph?.title).toBe('Test OG Title');
      expect(metadata.openGraph?.description).toBe('Test OG description');
      expect(metadata.openGraph?.url).toBe('https://landlordheaven.co.uk/test-og');
      expect(metadata.openGraph?.type).toBe('website');
    });

    it('should include OG image', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: '/test',
      });

      expect(metadata.openGraph?.images).toBeDefined();
      expect((metadata.openGraph?.images as any[])?.length).toBeGreaterThan(0);
    });
  });

  describe('noindex handling', () => {
    it('should set noindex when requested', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: '/test',
        noindex: true,
      });

      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
      });
    });

    it('should allow indexing by default', () => {
      const metadata = generateMetadata({
        title: 'Test',
        description: 'Test',
        path: '/test',
      });

      expect(metadata.robots).toEqual({
        index: true,
        follow: true,
      });
    });
  });
});

describe('generateMetadataForPageType', () => {
  it('should auto-select eviction keywords for eviction paths', () => {
    const metadata = generateMetadataForPageType({
      title: 'Section 21 Notice',
      description: 'How to serve a Section 21 notice',
      path: '/section-21-notice-template',
      pageType: 'product',
    });

    expect(metadata.keywords).toBeDefined();
    // Should contain eviction-related keywords
    const keywords = metadata.keywords as string[];
    expect(
      keywords.some((k) => k.toLowerCase().includes('eviction') || k.toLowerCase().includes('section'))
    ).toBe(true);
  });

  it('should auto-select money claim keywords for money claim paths', () => {
    const metadata = generateMetadataForPageType({
      title: 'Money Claim Guide',
      description: 'How to file a money claim',
      path: '/money-claim-unpaid-rent',
      pageType: 'guide',
    });

    expect(metadata.keywords).toBeDefined();
    const keywords = metadata.keywords as string[];
    expect(
      keywords.some((k) => k.toLowerCase().includes('mcol') || k.toLowerCase().includes('rent'))
    ).toBe(true);
  });

  it('should auto-select tenancy keywords for tenancy paths', () => {
    const metadata = generateMetadataForPageType({
      title: 'Tenancy Agreement Template',
      description: 'Create your tenancy agreement',
      path: '/assured-shorthold-tenancy-agreement-template',
      pageType: 'product',
    });

    expect(metadata.keywords).toBeDefined();
    const keywords = metadata.keywords as string[];
    expect(
      keywords.some((k) => k.toLowerCase().includes('tenancy') || k.toLowerCase().includes('agreement'))
    ).toBe(true);
  });

  it('should use tool keywords for tool pages', () => {
    const metadata = generateMetadataForPageType({
      title: 'Free Section 21 Generator',
      description: 'Generate a Section 21 notice for free',
      path: '/tools/free-section-21-notice-generator',
      pageType: 'tool',
    });

    expect(metadata.keywords).toBeDefined();
    const keywords = metadata.keywords as string[];
    expect(
      keywords.some((k) => k.toLowerCase().includes('generator') || k.toLowerCase().includes('tool'))
    ).toBe(true);
  });
});

describe('validateMetadataConfig', () => {
  it('should return empty array for valid config', () => {
    const issues = validateMetadataConfig({
      title: 'Test',
      description: 'Test description',
      path: '/test',
      keywords: ['test'],
    });

    expect(issues.filter((i) => !i.includes('will use defaults'))).toHaveLength(0);
  });

  it('should report missing title', () => {
    const issues = validateMetadataConfig({
      title: '',
      description: 'Test',
      path: '/test',
    });

    expect(issues.some((i) => i.includes('title'))).toBe(true);
  });

  it('should report missing description', () => {
    const issues = validateMetadataConfig({
      title: 'Test',
      description: '',
      path: '/test',
    });

    expect(issues.some((i) => i.includes('description'))).toBe(true);
  });

  it('should report missing path', () => {
    const issues = validateMetadataConfig({
      title: 'Test',
      description: 'Test',
      path: '',
    });

    expect(issues.some((i) => i.includes('path'))).toBe(true);
  });

  it('should warn about missing keywords (not error)', () => {
    const issues = validateMetadataConfig({
      title: 'Test',
      description: 'Test',
      path: '/test',
    });

    // Should only be a warning about keywords using defaults
    const keywordIssue = issues.find((i) => i.includes('keywords'));
    expect(keywordIssue).toBeDefined();
    expect(keywordIssue).toContain('will use defaults');
  });
});

describe('auditMetadata', () => {
  it('should pass audit for properly configured page', () => {
    const result = auditMetadata({
      title: 'Test Page',
      description: 'Test description with sufficient length',
      path: '/test-page',
      keywords: ['test', 'keywords'],
    });

    expect(result.hasCanonical).toBe(true);
    expect(result.hasTwitterCard).toBe(true);
    expect(result.hasKeywords).toBe(true);
    expect(result.hasOgImage).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('should fail audit for missing required fields', () => {
    const result = auditMetadata({
      title: '',
      description: '',
      path: '',
    });

    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe('Keyword constants', () => {
  it('CORE_KEYWORDS should contain essential terms', () => {
    expect(CORE_KEYWORDS.length).toBeGreaterThan(0);
    expect(CORE_KEYWORDS.some((k) => k.toLowerCase().includes('landlord'))).toBe(true);
  });

  it('PRODUCT_KEYWORDS should have all product categories', () => {
    expect(PRODUCT_KEYWORDS.eviction).toBeDefined();
    expect(PRODUCT_KEYWORDS.money_claim).toBeDefined();
    expect(PRODUCT_KEYWORDS.tenancy).toBeDefined();
    expect(PRODUCT_KEYWORDS.tool).toBeDefined();
  });

  it('each keyword category should have multiple keywords', () => {
    expect(PRODUCT_KEYWORDS.eviction.length).toBeGreaterThan(3);
    expect(PRODUCT_KEYWORDS.money_claim.length).toBeGreaterThan(3);
    expect(PRODUCT_KEYWORDS.tenancy.length).toBeGreaterThan(3);
    expect(PRODUCT_KEYWORDS.tool.length).toBeGreaterThan(3);
  });
});

describe('Representative page metadata', () => {
  const representativePages = [
    { path: '/products/notice-only', title: 'Notice Only Pack', type: 'product' as const },
    { path: '/tools/free-section-21-notice-generator', title: 'Section 21 Generator', type: 'tool' as const },
    { path: '/blog/what-is-section-21-notice', title: 'What is Section 21', type: 'blog' as const },
    { path: '/how-to-evict-tenant', title: 'How to Evict Tenant', type: 'seo_landing' as const },
  ];

  representativePages.forEach(({ path, title, type }) => {
    it(`${type} page (${path}) should have all required metadata`, () => {
      const metadata = generateMetadataForPageType({
        title,
        description: `Description for ${title}`,
        path,
        pageType: type,
      });

      // Canonical
      expect(metadata.alternates?.canonical).toBeDefined();

      // Twitter
      expect(metadata.twitter?.card).toBeDefined();
      expect(metadata.twitter?.title).toBeDefined();

      // Keywords
      expect(metadata.keywords).toBeDefined();

      // OG
      expect(metadata.openGraph?.url).toBeDefined();
    });
  });
});
