import { describe, expect, it } from 'vitest';
import {
  getAboveFoldCommercialDestinations,
  getAllSeoPageTaxonomyEntries,
  getCandidateRedirects,
  getFreshnessPolicy,
  getPhase3SitemapExclusions,
  getPrimaryDestinationAboveFold,
  getRetainedSeoPageTaxonomyEntries,
  getStickyPrimaryDestination,
  getTopInternalLinkRecipients,
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
        { source: '/court-bailiff-eviction-guide', destination: '/bailiff-eviction-process' },
        { source: '/eviction-timeline-uk', destination: '/how-long-does-eviction-take' },
        { source: '/eviction-notice-uk', destination: '/eviction-notice-template' },
      ])
    );

    for (const redirect of redirects) {
      expect(exclusions).toContain(redirect.source);
    }
  });

  it('covers the newly normalised long-tail live routes in the retained taxonomy set', () => {
    const retainedRoutes = Array.from(
      getRetainedSeoPageTaxonomyEntries().map((entry) => entry.pathname)
    );

    expect(retainedRoutes).toEqual(
      expect.arrayContaining([
        '/apply-possession-order-landlord',
        '/section-21-expired-what-next',
        '/section-21-notice-template',
        '/section-8-notice-template',
        '/possession-claim-guide',
        '/n5b-possession-claim-guide',
        '/wales-tenancy-agreement-template',
        '/private-residential-tenancy-agreement-template',
        '/northern-ireland-tenancy-agreement-template',
        '/renting-homes-wales-written-statement',
        '/scotland-prt-model-agreement-guide',
        '/update-occupation-contract-wales',
        '/joint-occupation-contract-wales',
        '/fixed-term-periodic-occupation-contract-wales',
        '/update-prt-tenancy-agreement-scotland',
        '/joint-prt-tenancy-agreement-scotland',
        '/common-prt-tenancy-mistakes-scotland',
        '/update-tenancy-agreement-northern-ireland',
        '/joint-tenancy-agreement-northern-ireland',
        '/fixed-term-tenancy-agreement-northern-ireland',
        '/county-court-claim-form-guide',
        '/eviction-cost-uk',
        '/eviction-court-forms-england',
        '/eviction-timeline-england',
        '/n5-n119-possession-claim',
        '/possession-order-process',
        '/eviction-notice',
        '/eviction-notice-template',
        '/eviction-notice-england',
        '/notice-to-quit-northern-ireland-guide',
        '/section-21-notice-period',
        '/section-8-vs-section-21',
        '/wales-eviction-notice-template',
      ])
    );
  });

  it('keeps the strategic money and transition hubs in the top internal-link recipient set', () => {
    const topRecipients = getTopInternalLinkRecipients(20).map(({ pathname }) => pathname);

    expect(topRecipients).toContain('/eviction-process-uk');
    expect(topRecipients).toContain('/tenant-not-paying-rent');
    expect(topRecipients).toContain('/section-21-ban-uk');
  });
});
