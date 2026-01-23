/**
 * Pricing Consistency Tests
 *
 * CRITICAL: These tests ensure all pricing sources stay in sync.
 * Added after Revenue Funnel Audit (Jan 2026) revealed multiple pricing mismatches.
 *
 * If these tests fail, it means pricing is inconsistent across the codebase.
 */

import { describe, it, expect } from 'vitest';
import { PRICING, REGIONAL_PRICING, PRODUCT_AVAILABILITY, isProductAvailable, getRegionalPrice } from '@/lib/pricing';
import { PRODUCTS, REGIONAL_PRODUCT_AVAILABILITY, isProductAvailableInRegion } from '@/lib/pricing/products';

describe('Pricing Consistency', () => {
  describe('pricing.ts and products.ts must match', () => {
    it('Notice Only prices must be consistent', () => {
      expect(PRICING.NOTICE_ONLY).toBe(PRODUCTS.notice_only.price);
    });

    it('Complete Eviction Pack prices must be consistent', () => {
      expect(PRICING.COMPLETE_EVICTION_PACK).toBe(PRODUCTS.complete_pack.price);
    });

    it('Money Claim Pack prices must be consistent', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(PRODUCTS.money_claim.price);
    });

    it('Standard AST prices must be consistent', () => {
      expect(PRICING.STANDARD_AST).toBe(PRODUCTS.ast_standard.price);
    });

    it('Premium AST prices must be consistent', () => {
      expect(PRICING.PREMIUM_AST).toBe(PRODUCTS.ast_premium.price);
    });
  });

  describe('Current prices are correct (Jan 2026 - Regional Pricing Update)', () => {
    it('Notice Only should be £39.99', () => {
      expect(PRODUCTS.notice_only.price).toBe(39.99);
    });

    it('Complete Eviction Pack should be £149.99 (England only)', () => {
      expect(PRODUCTS.complete_pack.price).toBe(149.99);
    });

    it('Money Claim Pack should be £99.99 (England only)', () => {
      expect(PRODUCTS.money_claim.price).toBe(99.99);
    });

    it('Standard AST should be £9.99', () => {
      expect(PRODUCTS.ast_standard.price).toBe(9.99);
    });

    it('Premium AST should be £14.99', () => {
      expect(PRODUCTS.ast_premium.price).toBe(14.99);
    });
  });

  describe('Display prices match numeric prices', () => {
    it('Notice Only displayPrice matches price', () => {
      expect(PRODUCTS.notice_only.displayPrice).toBe(`£${PRODUCTS.notice_only.price.toFixed(2)}`);
    });

    it('Complete Pack displayPrice matches price', () => {
      expect(PRODUCTS.complete_pack.displayPrice).toBe(`£${PRODUCTS.complete_pack.price.toFixed(2)}`);
    });

    it('Money Claim displayPrice matches price', () => {
      expect(PRODUCTS.money_claim.displayPrice).toBe(`£${PRODUCTS.money_claim.price.toFixed(2)}`);
    });

    it('Standard AST displayPrice matches price', () => {
      expect(PRODUCTS.ast_standard.displayPrice).toBe(`£${PRODUCTS.ast_standard.price.toFixed(2)}`);
    });

    it('Premium AST displayPrice matches price', () => {
      expect(PRODUCTS.ast_premium.displayPrice).toBe(`£${PRODUCTS.ast_premium.price.toFixed(2)}`);
    });
  });

  describe('Regional Product Availability (Jan 2026)', () => {
    describe('complete_pack - England only', () => {
      it('should be available in England', () => {
        expect(isProductAvailableInRegion('complete_pack', 'england')).toBe(true);
      });

      it('should NOT be available in Wales', () => {
        expect(isProductAvailableInRegion('complete_pack', 'wales')).toBe(false);
      });

      it('should NOT be available in Scotland', () => {
        expect(isProductAvailableInRegion('complete_pack', 'scotland')).toBe(false);
      });

      it('should NOT be available in Northern Ireland', () => {
        expect(isProductAvailableInRegion('complete_pack', 'northern-ireland')).toBe(false);
      });
    });

    describe('money_claim - England only', () => {
      it('should be available in England', () => {
        expect(isProductAvailableInRegion('money_claim', 'england')).toBe(true);
      });

      it('should NOT be available in Wales', () => {
        expect(isProductAvailableInRegion('money_claim', 'wales')).toBe(false);
      });

      it('should NOT be available in Scotland', () => {
        expect(isProductAvailableInRegion('money_claim', 'scotland')).toBe(false);
      });

      it('should NOT be available in Northern Ireland', () => {
        expect(isProductAvailableInRegion('money_claim', 'northern-ireland')).toBe(false);
      });
    });

    describe('notice_only - England, Wales, Scotland', () => {
      it('should be available in England', () => {
        expect(isProductAvailableInRegion('notice_only', 'england')).toBe(true);
      });

      it('should be available in Wales', () => {
        expect(isProductAvailableInRegion('notice_only', 'wales')).toBe(true);
      });

      it('should be available in Scotland', () => {
        expect(isProductAvailableInRegion('notice_only', 'scotland')).toBe(true);
      });

      it('should NOT be available in Northern Ireland', () => {
        expect(isProductAvailableInRegion('notice_only', 'northern-ireland')).toBe(false);
      });
    });

    describe('tenancy agreements - All UK regions', () => {
      it('ast_standard should be available in all regions', () => {
        expect(isProductAvailableInRegion('ast_standard', 'england')).toBe(true);
        expect(isProductAvailableInRegion('ast_standard', 'wales')).toBe(true);
        expect(isProductAvailableInRegion('ast_standard', 'scotland')).toBe(true);
        expect(isProductAvailableInRegion('ast_standard', 'northern-ireland')).toBe(true);
      });

      it('ast_premium should be available in all regions', () => {
        expect(isProductAvailableInRegion('ast_premium', 'england')).toBe(true);
        expect(isProductAvailableInRegion('ast_premium', 'wales')).toBe(true);
        expect(isProductAvailableInRegion('ast_premium', 'scotland')).toBe(true);
        expect(isProductAvailableInRegion('ast_premium', 'northern-ireland')).toBe(true);
      });
    });
  });

  describe('Regional Pricing (lib/pricing.ts)', () => {
    it('notice_only should have consistent regional prices', () => {
      expect(getRegionalPrice('notice_only', 'england')).toBe(39.99);
      expect(getRegionalPrice('notice_only', 'wales')).toBe(39.99);
      expect(getRegionalPrice('notice_only', 'scotland')).toBe(39.99);
      expect(getRegionalPrice('notice_only', 'northern_ireland')).toBeNull();
    });

    it('complete_pack should only have England pricing', () => {
      expect(getRegionalPrice('complete_pack', 'england')).toBe(149.99);
      expect(getRegionalPrice('complete_pack', 'wales')).toBeNull();
      expect(getRegionalPrice('complete_pack', 'scotland')).toBeNull();
      expect(getRegionalPrice('complete_pack', 'northern_ireland')).toBeNull();
    });

    it('money_claim should only have England pricing', () => {
      expect(getRegionalPrice('money_claim', 'england')).toBe(99.99);
      expect(getRegionalPrice('money_claim', 'wales')).toBeNull();
      expect(getRegionalPrice('money_claim', 'scotland')).toBeNull();
      expect(getRegionalPrice('money_claim', 'northern_ireland')).toBeNull();
    });

    it('tenancy_agreement should have all UK region prices', () => {
      expect(getRegionalPrice('tenancy_agreement', 'england')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'wales')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'scotland')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'northern_ireland')).toBe(9.99);
    });
  });
});
