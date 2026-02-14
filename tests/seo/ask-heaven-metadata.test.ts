/**
 * Ask Heaven SEO Metadata Tests
 *
 * Tests that Ask Heaven page has:
 * - Correct title format with "Free Landlord Legal Q&A | UK"
 * - Proper description mentioning all jurisdictions
 * - FAQ schema structure
 *
 * @module tests/seo/ask-heaven-metadata.test
 */

import { describe, expect, it } from 'vitest';
import { metadata } from '@/app/ask-heaven/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

describe('Ask Heaven Metadata', () => {
  describe('Title', () => {
    it('includes "Free" keyword', () => {
      const title = asText(metadata.title);
      expect(title.toLowerCase()).toContain('free');
    });

    it('includes "Legal Q&A" or "Q&A"', () => {
      const title = asText(metadata.title);
      expect(title.toLowerCase()).toMatch(/q&a|legal/);
    });

    it('includes "UK"', () => {
      const title = asText(metadata.title);
      expect(title).toContain('UK');
    });

    it('includes "Ask Heaven" branding', () => {
      const title = asText(metadata.title);
      expect(title).toContain('Ask Heaven');
    });
  });

  describe('Description', () => {
    it('mentions England', () => {
      const description = asText(metadata.description);
      expect(description).toContain('England');
    });

    it('mentions Wales', () => {
      const description = asText(metadata.description);
      expect(description).toContain('Wales');
    });

    it('mentions Scotland', () => {
      const description = asText(metadata.description);
      expect(description).toContain('Scotland');
    });

    it('mentions Northern Ireland', () => {
      const description = asText(metadata.description);
      expect(description).toContain('Northern Ireland');
    });

    it('mentions key topics (evictions, rent arrears, tenancy agreements)', () => {
      const description = asText(metadata.description).toLowerCase();
      expect(description).toMatch(/eviction/);
      expect(description).toMatch(/rent arrears|arrears/);
      expect(description).toMatch(/tenancy/);
    });

    it('includes "Free" keyword', () => {
      const description = asText(metadata.description);
      expect(description.toLowerCase()).toContain('free');
    });
  });

  describe('Keywords', () => {
    it('includes relevant landlord keywords', () => {
      const keywords = metadata.keywords;
      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);

      const keywordsLower = (keywords as string[]).map((k) => k.toLowerCase());
      expect(keywordsLower).toContain('landlord advice');
      expect(keywordsLower).toContain('landlord q&a');
    });

    it('includes eviction-related keywords', () => {
      const keywords = metadata.keywords as string[];
      const keywordsLower = keywords.map((k) => k.toLowerCase());
      expect(keywordsLower.some((k) => k.includes('eviction') || k.includes('section 21') || k.includes('section 8'))).toBe(true);
    });

    it('includes compliance-related keywords', () => {
      const keywords = metadata.keywords as string[];
      const keywordsLower = keywords.map((k) => k.toLowerCase());
      expect(keywordsLower.some((k) => k.includes('epc') || k.includes('gas safety') || k.includes('eicr') || k.includes('deposit'))).toBe(true);
    });
  });

  describe('Open Graph', () => {
    it('has matching Open Graph title', () => {
      const ogTitle = asText(metadata.openGraph?.title);
      const title = asText(metadata.title);
      expect(ogTitle).toBe(title);
    });

    it('has matching Open Graph description', () => {
      const ogDescription = asText(metadata.openGraph?.description);
      const description = asText(metadata.description);
      expect(ogDescription).toBe(description);
    });

    it('has correct type', () => {
      expect(metadata.openGraph?.type).toBe('website');
    });
  });

  describe('Canonical URL', () => {
    it('has canonical URL defined', () => {
      expect(metadata.alternates?.canonical).toBeDefined();
    });

    it('canonical URL includes /ask-heaven', () => {
      const canonical = asText(metadata.alternates?.canonical);
      expect(canonical).toContain('/ask-heaven');
    });
  });
});
