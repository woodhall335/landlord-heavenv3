/**
 * SEO Regression Tests
 *
 * These tests ensure SEO best practices are maintained:
 * 1. robots.txt allows /_next/ for Google rendering
 * 2. structured data follows the current shared rating policy
 * 3. blog CTAs avoid hardcoded prices and rely on shared CTA plumbing
 *
 * Run with: npx vitest run tests/seo/seo-regression.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

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
      process.env.VERCEL_ENV = 'production';

      const { default: robots } = await import('@/app/robots');
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const hasNextAllowed = rules.some(
        (rule) => Array.isArray(rule.allow) && rule.allow.includes('/_next/')
      );
      expect(hasNextAllowed).toBe(true);

      const hasNextDisallowed = rules.some(
        (rule) => Array.isArray(rule.disallow) && rule.disallow.includes('/_next/')
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
    it('productSchema should include aggregateRating by default', async () => {
      const { productSchema } = await import('@/lib/seo/structured-data');
      const schema = productSchema({
        name: 'Test Product',
        description: 'Test',
        price: '39.99',
        url: 'https://example.com',
      });

      expect(schema).toHaveProperty('aggregateRating');
    });

    it('productSchema should still include aggregateRating when ENABLE_STRUCTURED_RATINGS=true', async () => {
      process.env.ENABLE_STRUCTURED_RATINGS = 'true';
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

    it('softwareApplicationSchema should include aggregateRating by default', async () => {
      const { softwareApplicationSchema } = await import('@/lib/seo/structured-data');
      const schema = softwareApplicationSchema();

      expect(schema).toHaveProperty('aggregateRating');
    });

    it('softwareApplicationSchema should use correct price range from PRODUCTS', async () => {
      vi.resetModules();
      const { softwareApplicationSchema } = await import('@/lib/seo/structured-data');
      const { PRODUCTS } = await import('@/lib/pricing/products');

      const schema = softwareApplicationSchema();
      const offers = schema.offers as { lowPrice: string; highPrice: string };

      expect(parseFloat(offers.lowPrice)).toBe(PRODUCTS.ast_standard.price);
      expect(parseFloat(offers.highPrice)).toBe(
        Math.max(PRODUCTS.complete_pack.price, PRODUCTS.money_claim.price)
      );
    });
  });

  describe('Blog CTAs - Centralized Pricing', () => {
    it('BlogCTA.tsx should not contain hardcoded pound price strings', () => {
      const blogCTAPath = path.join(process.cwd(), 'src/components/blog/BlogCTA.tsx');
      const content = fs.readFileSync(blogCTAPath, 'utf-8');

      const hardcodedPricePattern = /["'](?:GBP\s*)?\u00A3\d+\.\d{2}["']|["'](?:Â£|£)\d+\.\d{2}["']/g;
      const matches = content.match(hardcodedPricePattern);

      expect(matches).toBeNull();
    });

    it('BlogCTA.tsx should route through the shared inline CTA card', () => {
      const blogCTAPath = path.join(process.cwd(), 'src/components/blog/BlogCTA.tsx');
      const content = fs.readFileSync(blogCTAPath, 'utf-8');

      expect(content).toContain("import { BlogInlineProductCard } from './BlogInlineProductCard'");
      expect(content).toContain("import { useBlogCtaContext } from './BlogCtaContext'");
      expect(content).toContain('<BlogInlineProductCard');
    });

    it('blog slug pages should not contain hardcoded pound price strings', () => {
      const blogPagePath = path.join(process.cwd(), 'src/app/(marketing)/blog/[slug]/page.tsx');
      const content = fs.readFileSync(blogPagePath, 'utf-8');

      const hardcodedPricePattern = /["'](?:Â£|£)\d+\.\d{2}["']/g;
      const matches = content.match(hardcodedPricePattern);

      expect(matches).toBeNull();
    });
  });

  describe('Sitemap - lastModified stability', () => {
    it('should not use Date.now() or new Date() for all entries', () => {
      const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');

      expect(content).toContain('STABLE_PRODUCT_DATE');

      const nowPattern = /lastModified:\s*now[,\s\n]/g;
      const matches = content.match(nowPattern);

      expect(matches).toBeNull();
    });

    it('blog posts should use their actual dates', () => {
      const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
      const content = fs.readFileSync(sitemapPath, 'utf-8');

      expect(content).toContain('post.updatedDate || post.date');
    });
  });
});
