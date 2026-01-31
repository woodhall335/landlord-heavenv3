/**
 * Jurisdiction CTA Leakage Regression Tests
 *
 * Ensures Scotland/Wales/NI blog posts do NOT show England-only CTAs
 * and England posts still show appropriate England CTAs.
 */

import { describe, it, expect } from 'vitest';
import {
  getNextStepsCTAs,
  detectJurisdiction,
  ENGLAND_ONLY_URLS,
  isNonEnglandSlug,
  type NextStepsCTA,
} from '@/lib/blog/next-steps-cta';

// Helper to check if any CTA contains an England-only URL
function hasEnglandOnlyCTAs(ctas: NextStepsCTA[]): boolean {
  return ctas.some((cta) =>
    ENGLAND_ONLY_URLS.some((url) => cta.href.startsWith(url))
  );
}

// Helper to get England-only URLs from CTAs
function getEnglandOnlyURLs(ctas: NextStepsCTA[]): string[] {
  return ctas
    .filter((cta) =>
      ENGLAND_ONLY_URLS.some((url) => cta.href.startsWith(url))
    )
    .map((cta) => cta.href);
}

describe('Jurisdiction CTA Leakage Prevention', () => {
  describe('Scotland posts should NOT include England-only CTAs', () => {
    const scotlandSlugs = [
      'scotland-eviction-ground-1',
      'scotland-eviction-ground-4',
      'scotland-eviction-ground-11',
      'scotland-eviction-ground-12',
      'scotland-eviction-ground-14',
      'scotland-eviction-process',
      'scotland-notice-to-leave',
      'scotland-private-residential-tenancy',
      'scotland-first-tier-tribunal',
      'scotland-deposit-protection',
    ];

    scotlandSlugs.forEach((slug) => {
      it(`${slug} should not have Section 8/21 CTAs`, () => {
        const ctas = getNextStepsCTAs({ slug });
        const englandUrls = getEnglandOnlyURLs(ctas);

        expect(englandUrls).toEqual([]);
        expect(hasEnglandOnlyCTAs(ctas)).toBe(false);
      });
    });

    it('scotland-eviction-ground-1 (selling property) should have Scotland-appropriate CTAs', () => {
      const ctas = getNextStepsCTAs({ slug: 'scotland-eviction-ground-1' });

      // Should have Scotland eviction guide
      expect(ctas.some((c) => c.href === '/scotland-eviction-notices')).toBe(true);

      // Should NOT have Section 8 template
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(false);

      // Should NOT have Section 8 validator
      expect(ctas.some((c) => c.href === '/tools/validators/section-8')).toBe(false);
    });

    it('scotland-eviction-ground-12 (rent arrears) should have Scotland + money claim CTAs', () => {
      const ctas = getNextStepsCTAs({
        slug: 'scotland-eviction-ground-12',
        tags: ['Ground 12', 'rent arrears', 'Scotland'],
      });

      // Should have Scotland eviction guide
      expect(ctas.some((c) => c.href === '/scotland-eviction-notices')).toBe(true);

      // Should have money claim (rent arrears related)
      expect(ctas.some((c) => c.href === '/products/money-claim')).toBe(true);

      // Should NOT have Section 8 template
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(false);
    });
  });

  describe('Wales posts should NOT include England-only CTAs', () => {
    const walesSlugs = [
      'wales-eviction-notices-guide',
      'wales-renting-homes-act',
      'wales-eviction-process',
      'wales-deposit-protection',
      'wales-standard-occupation-contract',
      'wales-possession-grounds',
    ];

    walesSlugs.forEach((slug) => {
      it(`${slug} should not have Section 8/21 CTAs`, () => {
        const ctas = getNextStepsCTAs({ slug });
        const englandUrls = getEnglandOnlyURLs(ctas);

        expect(englandUrls).toEqual([]);
        expect(hasEnglandOnlyCTAs(ctas)).toBe(false);
      });
    });

    it('wales-eviction-process should have Wales-appropriate CTAs', () => {
      const ctas = getNextStepsCTAs({ slug: 'wales-eviction-process' });

      // Should have Wales eviction guide
      expect(ctas.some((c) => c.href === '/wales-eviction-notices')).toBe(true);

      // Should NOT have Section 21 template
      expect(ctas.some((c) => c.href === '/section-21-notice-template')).toBe(false);

      // Should NOT have Section 21 validator
      expect(ctas.some((c) => c.href === '/tools/validators/section-21')).toBe(false);
    });
  });

  describe('Northern Ireland posts should NOT include England-only CTAs', () => {
    const niSlugs = [
      'northern-ireland-tenancy-guide',
      'northern-ireland-eviction-process',
      'northern-ireland-deposit-protection',
      'northern-ireland-private-tenancies-order',
      'northern-ireland-landlord-registration',
    ];

    niSlugs.forEach((slug) => {
      it(`${slug} should not have Section 8/21 CTAs`, () => {
        const ctas = getNextStepsCTAs({ slug });
        const englandUrls = getEnglandOnlyURLs(ctas);

        expect(englandUrls).toEqual([]);
        expect(hasEnglandOnlyCTAs(ctas)).toBe(false);
      });
    });

    it('northern-ireland-eviction-process should have NI-appropriate CTAs', () => {
      const ctas = getNextStepsCTAs({ slug: 'northern-ireland-eviction-process' });

      // Should have Ask Heaven for NI or Complete Pack
      const hasAskHeaven = ctas.some((c) => c.href.includes('/ask-heaven'));
      const hasCompletePack = ctas.some((c) => c.href === '/products/complete-pack');
      expect(hasAskHeaven || hasCompletePack).toBe(true);

      // Should NOT have Section 21 template
      expect(ctas.some((c) => c.href === '/section-21-notice-template')).toBe(false);
    });
  });

  describe('England posts SHOULD include appropriate England CTAs', () => {
    it('what-is-section-21-notice should include Section 21 CTAs', () => {
      const ctas = getNextStepsCTAs({
        slug: 'what-is-section-21-notice',
        tags: ['Section 21', 'Eviction'],
      });

      // Should have Section 21 template
      expect(ctas.some((c) => c.href === '/section-21-notice-template')).toBe(true);

      // Should have Section 21 validator
      expect(ctas.some((c) => c.href === '/tools/validators/section-21')).toBe(true);
    });

    it('england-section-8-ground-8 should include Section 8 CTAs', () => {
      const ctas = getNextStepsCTAs({
        slug: 'england-section-8-ground-8',
        tags: ['Section 8', 'Ground 8', 'Rent Arrears'],
      });

      // Should have Section 8 template
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(true);

      // Should have Section 8 validator
      expect(ctas.some((c) => c.href === '/tools/validators/section-8')).toBe(true);
    });

    it('rent-arrears-eviction-guide (England) should include Section 8 CTAs', () => {
      const ctas = getNextStepsCTAs({
        slug: 'rent-arrears-eviction-guide',
        tags: ['Rent Arrears', 'Section 8'],
      });

      // Should have Section 8 template (via section-8 tag)
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(true);
    });

    it('section-21-vs-section-8 should include both Section 21 and Section 8 CTAs', () => {
      const ctas = getNextStepsCTAs({
        slug: 'section-21-vs-section-8',
        tags: ['Section 21', 'Section 8', 'Eviction'],
      });

      // Should have Section 21 template
      expect(ctas.some((c) => c.href === '/section-21-notice-template')).toBe(true);

      // Should have Section 8 template
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(true);
    });
  });

  describe('Jurisdiction detection', () => {
    it('should detect Scotland slugs', () => {
      expect(detectJurisdiction('scotland-eviction-ground-1')).toBe('scotland');
      expect(detectJurisdiction('scotland-private-residential-tenancy')).toBe('scotland');
    });

    it('should detect Wales slugs', () => {
      expect(detectJurisdiction('wales-eviction-process')).toBe('wales');
      expect(detectJurisdiction('renting-homes-act-guide')).toBe('wales');
    });

    it('should detect Northern Ireland slugs', () => {
      expect(detectJurisdiction('northern-ireland-tenancy-guide')).toBe('northern-ireland');
    });

    it('should default to England for general slugs', () => {
      expect(detectJurisdiction('section-21-vs-section-8')).toBe('england');
      expect(detectJurisdiction('rent-arrears-eviction-guide')).toBe('england');
    });

    it('should detect UK-wide slugs', () => {
      expect(detectJurisdiction('uk-landlord-insurance-guide')).toBe('uk-wide');
    });
  });

  describe('isNonEnglandSlug helper', () => {
    it('should return true for Scotland slugs', () => {
      expect(isNonEnglandSlug('scotland-eviction-ground-1')).toBe(true);
    });

    it('should return true for Wales slugs', () => {
      expect(isNonEnglandSlug('wales-eviction-process')).toBe(true);
      expect(isNonEnglandSlug('renting-homes-act-guide')).toBe(true);
    });

    it('should return true for NI slugs', () => {
      expect(isNonEnglandSlug('northern-ireland-tenancy-guide')).toBe(true);
    });

    it('should return false for England slugs', () => {
      expect(isNonEnglandSlug('section-21-vs-section-8')).toBe(false);
      expect(isNonEnglandSlug('rent-arrears-eviction-guide')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('slug with "ground-" should NOT trigger Section 8 for Scotland', () => {
      // This was the original bug - ground- pattern was matching Scotland posts
      const ctas = getNextStepsCTAs({ slug: 'scotland-eviction-ground-12' });

      expect(hasEnglandOnlyCTAs(ctas)).toBe(false);
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(false);
    });

    it('explicit section-8 tag should NOT add S8 CTAs to Scotland post', () => {
      // Even if someone mistakenly adds section-8 tag, it should be gated
      const ctas = getNextStepsCTAs({
        slug: 'scotland-rent-arrears',
        tags: ['section 8', 'rent arrears'],
      });

      // Scotland slug should gate out Section 8 CTAs
      expect(ctas.some((c) => c.href === '/section-8-notice-template')).toBe(false);
    });

    it('slug with "no-fault" should NOT trigger Section 21 for Wales', () => {
      const ctas = getNextStepsCTAs({ slug: 'wales-no-fault-eviction-guide' });

      expect(ctas.some((c) => c.href === '/section-21-notice-template')).toBe(false);
    });
  });
});
