/**
 * Ask Heaven SEO Metadata Tests
 *
 * @module tests/seo/ask-heaven-metadata.test
 */

import type { Metadata } from 'next';
import { beforeAll, describe, expect, it } from 'vitest';
import { generateMetadata } from '@/app/ask-heaven/page';

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : value?.toString?.() ?? '';

let metadata: Metadata;

beforeAll(async () => {
  metadata = await generateMetadata({});
});

describe('Ask Heaven Metadata', () => {
  describe('Title', () => {
    it('includes Free, UK, and Ask Heaven branding', () => {
      const title = asText(metadata.title).toLowerCase();
      expect(title).toContain('free');
      expect(title).toContain('uk');
      expect(title).toContain('ask heaven');
    });

    it('includes legal Q&A intent', () => {
      const title = asText(metadata.title).toLowerCase();
      expect(title).toMatch(/q&a|legal/);
    });
  });

  describe('Description', () => {
    it('covers landlord legal topics', () => {
      const description = asText(metadata.description).toLowerCase();
      expect(description).toContain('free');
      expect(description).toMatch(/eviction/);
      expect(description).toMatch(/rent arrears|arrears/);
      expect(description).toMatch(/tenancy/);
    });

    it('signals UK-wide coverage', () => {
      const description = asText(metadata.description);
      const lower = description.toLowerCase();

      const explicitJurisdictions =
        description.includes('England') &&
        description.includes('Wales') &&
        description.includes('Scotland') &&
        description.includes('Northern Ireland');

      const umbrellaCoverage =
        lower.includes('uk') ||
        lower.includes('all jurisdictions') ||
        lower.includes('across all jurisdictions');

      expect(explicitJurisdictions || umbrellaCoverage).toBe(true);
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

    it('includes eviction and compliance terms', () => {
      const keywords = metadata.keywords as string[];
      const keywordsLower = keywords.map((k) => k.toLowerCase());
      expect(keywordsLower.some((k) => k.includes('eviction') || k.includes('section 21') || k.includes('section 8'))).toBe(true);
      expect(keywordsLower.some((k) => k.includes('epc') || k.includes('gas safety') || k.includes('eicr') || k.includes('deposit'))).toBe(true);
    });
  });

  describe('Open Graph', () => {
    it('has matching Open Graph title', () => {
      const ogTitle = asText(metadata.openGraph?.title);
      const title = asText(metadata.title);
      expect(ogTitle).toBe(title);
    });

    it('has legal Q&A OG description and website type', () => {
      const ogDescription = asText(metadata.openGraph?.description).toLowerCase();
      expect(ogDescription).toMatch(/q&a|legal/);
      expect(ogDescription).toMatch(/eviction|arrears|tenancy/);
      expect(metadata.openGraph?.type).toBe('website');
    });
  });

  describe('Canonical URL', () => {
    it('has canonical URL set to /ask-heaven', () => {
      const canonical = asText(metadata.alternates?.canonical);
      expect(canonical).toContain('/ask-heaven');
    });
  });
});
