/**
 * Wizard Page Metadata Tests
 *
 * Tests for the wizard selection page's generateMetadata function:
 * - Product-specific titles with correct prices
 * - robots noindex,follow configuration
 * - Canonical URLs pointing to clean landing routes
 * - Default behavior for unknown/empty products
 */

import { describe, it, expect } from 'vitest';
import { SEO_PRICES, SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import {
  generateMetadata,
  WIZARD_PRODUCT_SEO,
  DEFAULT_SEO,
} from '@/app/wizard/page';

const BASE_URL = 'https://landlordheaven.co.uk';

describe('Wizard Page Metadata - generateMetadata', () => {
  describe('Product-specific titles with prices', () => {
    it('should include £49.99 price in notice_only title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.title).toContain(SEO_PRICES.evictionNotice.display);
      expect(metadata.title).toContain('£49.99');
    });

    it('should include £199.99 price in complete_pack title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'complete_pack' }),
      });
      expect(metadata.title).toContain(SEO_PRICES.evictionBundle.display);
      expect(metadata.title).toContain('£199.99');
    });

    it('should include £99.99 price in money_claim title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'money_claim' }),
      });
      expect(metadata.title).toContain(SEO_PRICES.moneyClaim.display);
      expect(metadata.title).toContain('£99.99');
    });

    it('should include £14.99 price in ast_standard title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'ast_standard' }),
      });
      expect(metadata.title).toContain(SEO_PRICES.tenancyStandard.display);
      expect(metadata.title).toContain('£14.99');
    });

    it('should include £24.99 price in ast_premium title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'ast_premium' }),
      });
      expect(metadata.title).toContain(SEO_PRICES.tenancyPremium.display);
      expect(metadata.title).toContain('£24.99');
    });

    it('should include "from £14.99" in tenancy_agreement title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'tenancy_agreement' }),
      });
      expect(metadata.title).toContain('from');
      expect(metadata.title).toContain(SEO_PRICES.tenancyStandard.display);
    });

    it('should include Landlord Heaven brand in all titles', async () => {
      const products = ['notice_only', 'complete_pack', 'money_claim', 'ast_standard', 'ast_premium'];
      for (const product of products) {
        const metadata = await generateMetadata({
          searchParams: Promise.resolve({ product }),
        });
        expect(metadata.title).toContain('Landlord Heaven');
      }
    });
  });

  describe('Robots configuration', () => {
    it('should set robots index to false (noindex)', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.robots).toBeDefined();
      expect((metadata.robots as any).index).toBe(false);
    });

    it('should set robots follow to true', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.robots).toBeDefined();
      expect((metadata.robots as any).follow).toBe(true);
    });

    it('should set googleBot index to false', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect((metadata.robots as any).googleBot).toBeDefined();
      expect((metadata.robots as any).googleBot.index).toBe(false);
    });

    it('should set googleBot follow to true', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect((metadata.robots as any).googleBot.follow).toBe(true);
    });

    it('should have noindex,follow for all known products', async () => {
      const products = ['notice_only', 'complete_pack', 'money_claim', 'ast_standard', 'ast_premium'];
      for (const product of products) {
        const metadata = await generateMetadata({
          searchParams: Promise.resolve({ product }),
        });
        expect((metadata.robots as any).index, `${product} should be noindex`).toBe(false);
        expect((metadata.robots as any).follow, `${product} should be follow`).toBe(true);
      }
    });

    it('should have noindex,follow for unknown product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'unknown_product' }),
      });
      expect((metadata.robots as any).index).toBe(false);
      expect((metadata.robots as any).follow).toBe(true);
    });

    it('should have noindex,follow for empty product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({}),
      });
      expect((metadata.robots as any).index).toBe(false);
      expect((metadata.robots as any).follow).toBe(true);
    });
  });

  describe('Canonical URLs', () => {
    it('should set canonical to /eviction-notice for notice_only', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/eviction-notice`);
    });

    it('should set canonical to /eviction-pack-england for complete_pack', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'complete_pack' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/eviction-pack-england`);
    });

    it('should set canonical to /money-claim for money_claim', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'money_claim' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/money-claim`);
    });

    it('should set canonical to /tenancy-agreement for ast_standard', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'ast_standard' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/tenancy-agreement`);
    });

    it('should set canonical to /premium-tenancy-agreement for ast_premium', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'ast_premium' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/premium-tenancy-agreement`);
    });

    it('should set canonical to /tenancy-agreement for tenancy_agreement', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'tenancy_agreement' }),
      });
      expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/tenancy-agreement`);
    });

    it('should NOT set canonical for unknown product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'unknown_product' }),
      });
      expect(metadata.alternates?.canonical).toBeUndefined();
    });

    it('should NOT set canonical for empty product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({}),
      });
      expect(metadata.alternates?.canonical).toBeUndefined();
    });

    it('should match canonical routes to SEO_LANDING_ROUTES', async () => {
      const productRouteMap: Record<string, string> = {
        notice_only: SEO_LANDING_ROUTES.notice_only,
        complete_pack: SEO_LANDING_ROUTES.complete_pack,
        money_claim: SEO_LANDING_ROUTES.money_claim,
        ast_standard: SEO_LANDING_ROUTES.ast_standard,
        ast_premium: SEO_LANDING_ROUTES.ast_premium,
      };

      for (const [product, route] of Object.entries(productRouteMap)) {
        const metadata = await generateMetadata({
          searchParams: Promise.resolve({ product }),
        });
        expect(metadata.alternates?.canonical).toBe(`${BASE_URL}${route}`);
      }
    });
  });

  describe('Default/fallback behavior', () => {
    it('should use default title for unknown product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'invalid_product' }),
      });
      expect(metadata.title).toBe(DEFAULT_SEO.title);
    });

    it('should use default title for empty product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({}),
      });
      expect(metadata.title).toBe(DEFAULT_SEO.title);
    });

    it('should use default description for unknown product', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'invalid_product' }),
      });
      expect(metadata.description).toBe(DEFAULT_SEO.description);
    });

    it('should include "Legal Document Wizard" in default title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({}),
      });
      expect(metadata.title).toContain('Legal Document Wizard');
    });
  });

  describe('Jurisdiction suffix', () => {
    it('should add jurisdiction to title if not already present', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only', jurisdiction: 'scotland' }),
      });
      expect(metadata.title).toContain('Scotland');
    });

    it('should not duplicate jurisdiction if already in title', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'complete_pack', jurisdiction: 'england' }),
      });
      // complete_pack title already contains "England"
      const englandCount = ((metadata.title as string).match(/England/g) || []).length;
      expect(englandCount).toBe(1);
    });
  });

  describe('OpenGraph metadata', () => {
    it('should set og:url to canonical for known products', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.openGraph?.url).toBe(`${BASE_URL}/eviction-notice`);
    });

    it('should not set og:url for unknown products', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'unknown' }),
      });
      expect(metadata.openGraph?.url).toBeUndefined();
    });

    it('should set og:siteName to Landlord Heaven', async () => {
      const metadata = await generateMetadata({
        searchParams: Promise.resolve({ product: 'notice_only' }),
      });
      expect(metadata.openGraph?.siteName).toBe('Landlord Heaven');
    });
  });
});

describe('Wizard Product SEO Configuration', () => {
  it('should have all 6 product configurations', () => {
    const expectedProducts = [
      'notice_only',
      'complete_pack',
      'money_claim',
      'ast_standard',
      'ast_premium',
      'tenancy_agreement',
    ];
    for (const product of expectedProducts) {
      expect(WIZARD_PRODUCT_SEO[product]).toBeDefined();
    }
  });

  it('should have canonicalRoute for all products', () => {
    for (const [product, seo] of Object.entries(WIZARD_PRODUCT_SEO)) {
      expect(seo.canonicalRoute, `${product} should have canonicalRoute`).toBeDefined();
      expect(seo.canonicalRoute).toMatch(/^\//);
    }
  });

  it('should have prices from SEO_PRICES in all titles', () => {
    expect(WIZARD_PRODUCT_SEO.notice_only.title).toContain(SEO_PRICES.evictionNotice.display);
    expect(WIZARD_PRODUCT_SEO.complete_pack.title).toContain(SEO_PRICES.evictionBundle.display);
    expect(WIZARD_PRODUCT_SEO.money_claim.title).toContain(SEO_PRICES.moneyClaim.display);
    expect(WIZARD_PRODUCT_SEO.ast_standard.title).toContain(SEO_PRICES.tenancyStandard.display);
    expect(WIZARD_PRODUCT_SEO.ast_premium.title).toContain(SEO_PRICES.tenancyPremium.display);
  });
});
