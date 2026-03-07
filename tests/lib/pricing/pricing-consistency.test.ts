/**
 * Pricing Consistency Tests
 *
 * Canonical price lock for core one-time products.
 */

import { describe, it, expect } from 'vitest';
import {
  PRICING,
  REGIONAL_PRICING,
  getRegionalPrice,
} from '@/lib/pricing';
import {
  PRODUCTS,
  isProductAvailableInRegion,
} from '@/lib/pricing/products';

describe('Pricing Consistency', () => {
  describe('pricing.ts and products.ts must match', () => {
    it('Notice Only', () => {
      expect(PRICING.NOTICE_ONLY).toBe(PRODUCTS.notice_only.price);
    });

    it('Complete Pack', () => {
      expect(PRICING.COMPLETE_EVICTION_PACK).toBe(PRODUCTS.complete_pack.price);
    });

    it('Money Claim', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(PRODUCTS.money_claim.price);
    });

    it('Standard AST', () => {
      expect(PRICING.STANDARD_AST).toBe(PRODUCTS.ast_standard.price);
    });

    it('Premium AST', () => {
      expect(PRICING.PREMIUM_AST).toBe(PRODUCTS.ast_premium.price);
    });
  });

  describe('Current locked prices (March 2026)', () => {
    it('Notice Only should be 29.99', () => {
      expect(PRODUCTS.notice_only.price).toBe(29.99);
      expect(PRODUCTS.notice_only.displayPrice).toBe('£29.99');
    });

    it('Complete Pack should be 69.99', () => {
      expect(PRODUCTS.complete_pack.price).toBe(69.99);
      expect(PRODUCTS.complete_pack.displayPrice).toBe('£69.99');
    });

    it('Money Claim should be 45.99', () => {
      expect(PRODUCTS.money_claim.price).toBe(45.99);
      expect(PRODUCTS.money_claim.displayPrice).toBe('£45.99');
    });

    it('Standard AST should be 9.99', () => {
      expect(PRODUCTS.ast_standard.price).toBe(9.99);
      expect(PRODUCTS.ast_standard.displayPrice).toBe('£9.99');
    });

    it('Premium AST should be 19.99', () => {
      expect(PRODUCTS.ast_premium.price).toBe(19.99);
      expect(PRODUCTS.ast_premium.displayPrice).toBe('£19.99');
    });
  });

  describe('Regional Product Availability', () => {
    it('complete_pack is England-only', () => {
      expect(isProductAvailableInRegion('complete_pack', 'england')).toBe(true);
      expect(isProductAvailableInRegion('complete_pack', 'wales')).toBe(false);
      expect(isProductAvailableInRegion('complete_pack', 'scotland')).toBe(false);
      expect(isProductAvailableInRegion('complete_pack', 'northern-ireland')).toBe(false);
    });

    it('money_claim is England-only', () => {
      expect(isProductAvailableInRegion('money_claim', 'england')).toBe(true);
      expect(isProductAvailableInRegion('money_claim', 'wales')).toBe(false);
      expect(isProductAvailableInRegion('money_claim', 'scotland')).toBe(false);
      expect(isProductAvailableInRegion('money_claim', 'northern-ireland')).toBe(false);
    });

    it('notice_only is England/Wales/Scotland only', () => {
      expect(isProductAvailableInRegion('notice_only', 'england')).toBe(true);
      expect(isProductAvailableInRegion('notice_only', 'wales')).toBe(true);
      expect(isProductAvailableInRegion('notice_only', 'scotland')).toBe(true);
      expect(isProductAvailableInRegion('notice_only', 'northern-ireland')).toBe(false);
    });

    it('tenancy agreements available across all UK regions', () => {
      expect(isProductAvailableInRegion('ast_standard', 'england')).toBe(true);
      expect(isProductAvailableInRegion('ast_standard', 'wales')).toBe(true);
      expect(isProductAvailableInRegion('ast_standard', 'scotland')).toBe(true);
      expect(isProductAvailableInRegion('ast_standard', 'northern-ireland')).toBe(true);

      expect(isProductAvailableInRegion('ast_premium', 'england')).toBe(true);
      expect(isProductAvailableInRegion('ast_premium', 'wales')).toBe(true);
      expect(isProductAvailableInRegion('ast_premium', 'scotland')).toBe(true);
      expect(isProductAvailableInRegion('ast_premium', 'northern-ireland')).toBe(true);
    });
  });

  describe('Regional Pricing Matrix', () => {
    it('notice_only region prices', () => {
      expect(getRegionalPrice('notice_only', 'england')).toBe(29.99);
      expect(getRegionalPrice('notice_only', 'wales')).toBe(29.99);
      expect(getRegionalPrice('notice_only', 'scotland')).toBe(29.99);
      expect(getRegionalPrice('notice_only', 'northern_ireland')).toBeNull();
    });

    it('complete_pack region prices', () => {
      expect(getRegionalPrice('complete_pack', 'england')).toBe(69.99);
      expect(getRegionalPrice('complete_pack', 'wales')).toBeNull();
      expect(getRegionalPrice('complete_pack', 'scotland')).toBeNull();
      expect(getRegionalPrice('complete_pack', 'northern_ireland')).toBeNull();
    });

    it('money_claim region prices', () => {
      expect(getRegionalPrice('money_claim', 'england')).toBe(45.99);
      expect(getRegionalPrice('money_claim', 'wales')).toBeNull();
      expect(getRegionalPrice('money_claim', 'scotland')).toBeNull();
      expect(getRegionalPrice('money_claim', 'northern_ireland')).toBeNull();
    });

    it('tenancy_agreement region prices', () => {
      expect(getRegionalPrice('tenancy_agreement', 'england')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'wales')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'scotland')).toBe(9.99);
      expect(getRegionalPrice('tenancy_agreement', 'northern_ireland')).toBe(9.99);
    });

    it('premium tenancy region prices', () => {
      expect(REGIONAL_PRICING.tenancy_agreement_premium.england).toBe(19.99);
      expect(REGIONAL_PRICING.tenancy_agreement_premium.wales).toBe(19.99);
      expect(REGIONAL_PRICING.tenancy_agreement_premium.scotland).toBe(19.99);
      expect(REGIONAL_PRICING.tenancy_agreement_premium.northern_ireland).toBe(19.99);
    });
  });
});
