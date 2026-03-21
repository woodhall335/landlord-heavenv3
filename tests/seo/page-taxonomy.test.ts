import { describe, expect, it } from 'vitest';
import {
  getAboveFoldCommercialDestinations,
  getAllSeoPageTaxonomyEntries,
  getCandidateRedirects,
  getFreshnessPolicy,
  getPhase3SitemapExclusions,
  getPrimaryDestinationAboveFold,
  getStickyPrimaryDestination,
} from '@/lib/seo/page-taxonomy';

describe('SEO page taxonomy', () => {
  const entries = getAllSeoPageTaxonomyEntries();

  it('maps public content pages with required taxonomy fields', () => {
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry.pathname.startsWith('/')).toBe(true);
      expect(entry.primaryPillar.startsWith('/')).toBe(true);
      expect(entry.supportingPage.startsWith('/')).toBe(true);
      expect(entry.primaryProduct.startsWith('/products/')).toBe(true);
      expect(entry.pageRole).toBeTruthy();
      expect(entry.canonicalTarget).toBeTruthy();
      expect(entry.consolidationStatus).toBeTruthy();
      expect(entry.anchorVariants.pillar.length).toBeGreaterThan(0);
      expect(entry.anchorVariants.supporting.length).toBeGreaterThan(0);
      expect(entry.anchorVariants.product.length).toBeGreaterThan(0);
    }
  });

  it('keeps primary CTA destinations product-first and aligned across hero and sticky slots', () => {
    for (const entry of entries) {
      const primaryHref = getPrimaryDestinationAboveFold(entry);
      const stickyHref = getStickyPrimaryDestination(entry);

      expect(primaryHref.startsWith('/products/')).toBe(true);
      expect(stickyHref.startsWith('/products/')).toBe(true);
      expect(primaryHref.includes('/wizard')).toBe(false);
      expect(stickyHref.includes('/wizard')).toBe(false);
      expect(primaryHref).toBe(stickyHref);
    }
  });

  it('allows only one above-the-fold commercial destination unless the page is a bridge', () => {
    for (const entry of entries) {
      const destinations = getAboveFoldCommercialDestinations(entry);

      if (entry.pageRole === 'bridge') {
        expect(destinations.length).toBeLessThanOrEqual(2);
        expect(destinations.length).toBeGreaterThanOrEqual(1);
      } else {
        expect(destinations).toHaveLength(1);
      }
    }
  });

  it('requires freshness metadata for every pillar and bridge page', () => {
    const freshnessEntries = entries.filter(
      (entry) => entry.pageRole === 'pillar' || entry.pageRole === 'bridge'
    );

    expect(freshnessEntries.length).toBeGreaterThan(0);

    for (const entry of freshnessEntries) {
      expect(entry.freshnessRequired).toBe(true);

      const freshness = getFreshnessPolicy(entry);
      expect(freshness).not.toBeNull();
      expect(freshness?.reviewedDate).toBeTruthy();
      expect(freshness?.jurisdictionScope).toBeTruthy();
      expect(freshness?.legalContextNote).toBeTruthy();

      if (entry.section21TransitionEligible) {
        expect(freshness?.legalContextNote).toContain('1 May 2026');
        expect(freshness?.legalContextNote).toContain('31 July 2026');
      }
    }
  });

  it('exposes redirect candidates and sitemap exclusions from consolidation metadata', () => {
    const redirects = getCandidateRedirects();
    const exclusions = getPhase3SitemapExclusions();

    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: '/section-8-notice-guide', destination: '/section-8-notice' },
        { source: '/section-21-notice-guide', destination: '/section-21-notice' },
        { source: '/section-21-ban', destination: '/section-21-ban-uk' },
      ])
    );

    for (const redirect of redirects) {
      expect(exclusions).toContain(redirect.source);
    }
  });
});
