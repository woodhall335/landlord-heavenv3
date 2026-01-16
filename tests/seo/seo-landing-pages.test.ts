/**
 * SEO Landing Pages Tests
 *
 * Verifies that Q1/Q2 2026 SEO landing pages:
 * 1. Are included in the sitemap
 * 2. Have proper canonical URLs
 * 3. Have required metadata (title, description)
 * 4. Have FAQ schema
 *
 * Run with: npx vitest run tests/seo/seo-landing-pages.test.ts
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// New SEO landing pages from Q1/Q2 2026
const Q1_PAGES = [
  '/tenant-wont-leave',
  '/tenant-not-paying-rent',
  '/possession-claim-guide',
  '/eviction-cost-uk',
];

const Q2_PAGES = [
  '/n5b-form-guide',
  '/warrant-of-possession',
];

const ALL_NEW_PAGES = [...Q1_PAGES, ...Q2_PAGES];

describe('SEO Landing Pages - Sitemap', () => {
  it('should include all Q1 pages in sitemap', () => {
    const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
    const content = fs.readFileSync(sitemapPath, 'utf-8');

    for (const page of Q1_PAGES) {
      expect(content).toContain(`'${page}'`);
    }
  });

  it('should include all Q2 pages in sitemap', () => {
    const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
    const content = fs.readFileSync(sitemapPath, 'utf-8');

    for (const page of Q2_PAGES) {
      expect(content).toContain(`'${page}'`);
    }
  });
});

describe('SEO Landing Pages - File Existence', () => {
  it.each(ALL_NEW_PAGES)('%s page.tsx should exist', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1), // Remove leading slash
      'page.tsx'
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

describe('SEO Landing Pages - Metadata', () => {
  it.each(ALL_NEW_PAGES)('%s should export metadata with canonical', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should have metadata export
    expect(content).toContain('export const metadata: Metadata');

    // Should have canonical URL
    expect(content).toContain('alternates:');
    expect(content).toContain('canonical:');
    expect(content).toContain(`https://landlordheaven.co.uk${pagePath}`);
  });

  it.each(ALL_NEW_PAGES)('%s should have title and description', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should have title
    expect(content).toMatch(/title:\s*['"`]/);

    // Should have description
    expect(content).toMatch(/description:\s*['"`]/);
  });
});

describe('SEO Landing Pages - Schema Markup', () => {
  it.each(ALL_NEW_PAGES)('%s should have FAQ schema', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should use faqPageSchema
    expect(content).toContain('faqPageSchema');
    // Should have FAQ items defined
    expect(content).toContain('const faqs');
  });

  it.each(ALL_NEW_PAGES)('%s should have breadcrumb schema', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should use breadcrumbSchema
    expect(content).toContain('breadcrumbSchema');
  });
});

describe('SEO Landing Pages - CTA Components', () => {
  it.each(ALL_NEW_PAGES)('%s should use SeoCtaBlock component', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should import SeoCtaBlock
    expect(content).toContain('SeoCtaBlock');
  });

  it.each(ALL_NEW_PAGES)('%s should have disclaimer', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should use SeoDisclaimer for "not legal advice" notice
    expect(content).toContain('SeoDisclaimer');
  });
});

describe('SEO Landing Pages - Internal Links', () => {
  it('internal-links.ts should have entries for new guide pages', () => {
    const linksPath = path.join(
      process.cwd(),
      'src/lib/seo/internal-links.ts'
    );
    const content = fs.readFileSync(linksPath, 'utf-8');

    // Should have guide entries for new pages
    expect(content).toContain("tenantWontLeave:");
    expect(content).toContain("tenantNotPayingRent:");
    expect(content).toContain("possessionClaimGuide:");
    expect(content).toContain("evictionCostUk:");
    expect(content).toContain("n5bFormGuide:");
    expect(content).toContain("warrantOfPossession:");
  });

  it('internal-links.ts should have related link groups for new pages', () => {
    const linksPath = path.join(
      process.cwd(),
      'src/lib/seo/internal-links.ts'
    );
    const content = fs.readFileSync(linksPath, 'utf-8');

    // Should have related link groups
    expect(content).toContain('tenantWontLeaveRelatedLinks');
    expect(content).toContain('tenantNotPayingRentRelatedLinks');
    expect(content).toContain('possessionClaimRelatedLinks');
    expect(content).toContain('evictionCostRelatedLinks');
    expect(content).toContain('n5bFormRelatedLinks');
    expect(content).toContain('warrantOfPossessionRelatedLinks');
  });
});

describe('SEO Landing Pages - No Guarantees', () => {
  it.each(ALL_NEW_PAGES)('%s should not contain guarantee language', (pagePath) => {
    const filePath = path.join(
      process.cwd(),
      'src/app',
      pagePath.slice(1),
      'page.tsx'
    );
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should NOT contain "guaranteed" outcomes
    const guaranteePatterns = [
      /guaranteed\s+to\s+(win|succeed|evict)/i,
      /100%\s+success/i,
      /court\s+will\s+definitely/i,
    ];

    for (const pattern of guaranteePatterns) {
      expect(content).not.toMatch(pattern);
    }
  });
});
