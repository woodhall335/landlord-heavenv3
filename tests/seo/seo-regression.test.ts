/**
 * SEO Regression Tests
 *
 * These tests ensure SEO best practices are maintained:
 * 1. robots.txt allows /_next/ for Google rendering
 * 2. Structured data doesn't include fake ratings (unless explicitly enabled)
 * 3. Blog CTAs use centralized PRODUCTS pricing, not hardcoded strings
 *
 * Run with: npx vitest run tests/seo/seo-regression.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock environment for testing
const originalEnv = process.env;

describe('SEO Regression Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('robots.txt', () => {
    it('should NOT disallow /_next/ in production', async () => {
      // Set production environment
      process.env.VERCEL_ENV = 'production';

      // Import robots dynamically to get fresh module with env vars
      const { default: robots } = await import('@/app/robots');
      const result = robots();

      // Check that /_next/ is in allow list
      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const hasNextAllowed = rules.some(
        (rule) =>
          Array.isArray(rule.allow) && rule.allow.includes('/_next/')
      );
      expect(hasNextAllowed).toBe(true);

      // Check that /_next/ is NOT in disallow list
      const hasNextDisallowed = rules.some(
        (rule) =>
          Array.isArray(rule.disallow) && rule.disallow.includes('/_next/')
      );
      expect(hasNextDisallowed).toBe(false);
    });

    it('should include sitemap directive', async () => {
      process.env.VERCEL_ENV = 'production';
      const { default: robots } = await import('@/app/robots');
      const result = robots();

      expect(result.sitemap).toBeDefined();
      expect(result.sitemap).toContain('sitemap.xml');
    });
  });

  describe('Structured Data - aggregateRating', () => {
    it('productSchema should NOT include aggregateRating by default', async () => {
      // Ensure ENABLE_STRUCTURED_RATINGS is not set
      delete process.env.ENABLE_STRUCTURED_RATINGS;

      const { productSchema } = await import('@/lib/seo/structured-data');
      const schema = productSchema({
        name: 'Test Product',
        description: 'Test',
        price: '39.99',
        url: 'https://example.com',
      });

      expect(schema).not.toHaveProperty('aggregateRating');
    });

    it('productSchema should include aggregateRating when ENABLE_STRUCTURED_RATINGS=true', async () => {
      process.env.ENABLE_STRUCTURED_RATINGS = 'true';

      // Need to re-import to pick up new env var
      vi.resetModules();
      const { productSchema } = await import('@/lib/seo/structured-data');
      const schema = productSchema({
        name: 'Test Product',
        description: 'Test',
        price: '39.99',
        url: 'https://example.com',
      });

      expect(schema).toHaveProperty('aggregateRating');
    });

    it('softwareApplicationSchema should NOT include aggregateRating by default', async () => {
      delete process.env.ENABLE_STRUCTURED_RATINGS;

      vi.resetModules();
      const { softwareApplicationSchema } = await import('@/lib/seo/structured-data');
      const schema = softwareApplicationSchema();

      expect(schema).not.toHaveProperty('aggregateRating');
    });

    it('softwareApplicationSchema should use correct price range from PRODUCTS', async () => {
      delete process.env.ENABLE_STRUCTURED_RATINGS;

      vi.resetModules();
      const { softwareApplicationSchema } = await import('@/lib/seo/structured-data');
      const { PRODUCTS } = await import('@/lib/pricing/products');

      const schema = softwareApplicationSchema();
      const offers = schema.offers as { lowPrice: string; highPrice: string };

      // Verify prices come from PRODUCTS (£9.99 - £199.99)
      expect(parseFloat(offers.lowPrice)).toBe(PRODUCTS.ast_standard.price);
      expect(parseFloat(offers.highPrice)).toBe(
        Math.max(PRODUCTS.complete_pack.price, PRODUCTS.money_claim.price)
      );
    });
  });

  describe('Blog CTAs - Centralized Pricing', () => {
    it('BlogCTA.tsx should not contain hardcoded pound price strings', () => {
      const blogCTAPath = path.join(
        process.cwd(),
        'src/components/blog/BlogCTA.tsx'
      );
      const content = fs.readFileSync(blogCTAPath, 'utf-8');

      // Should NOT contain hardcoded prices like "£39.99" or "£199.99"
      // but SHOULD use PRODUCTS.notice_only.displayPrice etc.
      const hardcodedPricePattern = /["']£\d+\.\d{2}["']/g;
      const matches = content.match(hardcodedPricePattern);

      expect(matches).toBeNull();
    });

    it('BlogCTA.tsx should import PRODUCTS for pricing', () => {
      const blogCTAPath = path.join(
        process.cwd(),
        'src/components/blog/BlogCTA.tsx'
      );
      const content = fs.readFileSync(blogCTAPath, 'utf-8');

      expect(content).toContain("import { PRODUCTS } from '@/lib/pricing/products'");
      expect(content).toContain('PRODUCTS.notice_only.displayPrice');
      expect(content).toContain('PRODUCTS.complete_pack.displayPrice');
    });

    it('blog/page.tsx should not contain hardcoded pound price strings', () => {
      const blogPagePath = path.join(process.cwd(), 'src/app/blog/page.tsx');
      const content = fs.readFileSync(blogPagePath, 'utf-8');

      // Check for hardcoded prices in the CTA section
      const hardcodedPricePattern = /["']£\d+\.\d{2}["']/g;
      const matches = content.match(hardcodedPricePattern);

      expect(matches).toBeNull();
    });
  });

  describe('Sitemap - lastModified stability', () => {
    it('should not use Date.now() or new Date() for all entries', () => {
      const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');

      // Should use STABLE_PRODUCT_DATE instead of "now" for most pages
      expect(content).toContain('STABLE_PRODUCT_DATE');

      // Should not have a pattern like "lastModified: now" or "lastModified: new Date()"
      // that would set all pages to current time
      const nowPattern = /lastModified:\s*now[,\s\n]/g;
      const matches = content.match(nowPattern);

      expect(matches).toBeNull();
    });

    it('blog posts should use their actual dates', () => {
      const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');

      // Blog posts should use post.updatedDate or post.date
      expect(content).toContain('post.updatedDate || post.date');
    });
  });
});
