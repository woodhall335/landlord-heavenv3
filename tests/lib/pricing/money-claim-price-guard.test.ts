/**
 * Money Claim Price Guard Tests
 *
 * CRITICAL: These tests ensure Money Claim is consistently priced at £28.99
 * and that legacy money-claim prices do not return.
 *
 * Added: January 2026
 * Reason: Lower price test to £28.99 for Money Claim (England only)
 */

import { describe, it, expect } from 'vitest';
import { PRICING, REGIONAL_PRICING, getRegionalPrice } from '@/lib/pricing';
import { PRODUCTS, ASK_HEAVEN_RECOMMENDATION_MAP } from '@/lib/pricing/products';

describe('Money Claim Price Guard Tests', () => {
  describe('Source of Truth - £28.99', () => {
    it('PRODUCTS.money_claim.price should be 28.99', () => {
      expect(PRODUCTS.money_claim.price).toBe(28.99);
    });

    it('PRODUCTS.money_claim.displayPrice should be "£28.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).toBe('£28.99');
    });

    it('PRICING.MONEY_CLAIM_PACK should be 28.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(28.99);
    });

    it('REGIONAL_PRICING.money_claim.england should be 28.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).toBe(28.99);
    });

    it('getRegionalPrice(money_claim, england) should return 28.99', () => {
      expect(getRegionalPrice('money_claim', 'england')).toBe(28.99);
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should be "£28.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).toBe('£28.99');
    });
  });

  describe('Consistency checks', () => {
    it('PRICING.MONEY_CLAIM_PACK should match PRODUCTS.money_claim.price', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(PRODUCTS.money_claim.price);
    });

    it('REGIONAL_PRICING.money_claim.england should match PRODUCTS.money_claim.price', () => {
      expect(REGIONAL_PRICING.money_claim.england).toBe(PRODUCTS.money_claim.price);
    });

    it('displayPrice should match formatted price', () => {
      const formattedPrice = `£${PRODUCTS.money_claim.price.toFixed(2)}`;
      expect(PRODUCTS.money_claim.displayPrice).toBe(formattedPrice);
    });

    it('price in pence should be 2899 (no float artifacts)', () => {
      const priceInPence = Math.round(PRODUCTS.money_claim.price * 100);
      expect(priceInPence).toBe(2899);
    });
  });

  describe('Guard against legacy prices (£149.99, £59.99, £49.99, and £29.99)', () => {
    it('PRODUCTS.money_claim.price should NOT be 149.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(149.99);
    });

    it('PRODUCTS.money_claim.price should NOT be 59.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(59.99);
    });

    it('PRODUCTS.money_claim.price should NOT be 49.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(49.99);
    });

    it('PRODUCTS.money_claim.price should NOT be 29.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(29.99);
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "149.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('149.99');
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "59.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('59.99');
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "49.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('49.99');
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "29.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('29.99');
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 149.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(149.99);
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 59.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(59.99);
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 49.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(49.99);
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 29.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(29.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 149.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(149.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 59.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(59.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 49.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(49.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 29.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(29.99);
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "149.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('149.99');
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "59.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('59.99');
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "49.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('49.99');
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "29.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('29.99');
    });
  });

  describe('Money Claim is England-only', () => {
    it('should NOT be available in Wales', () => {
      expect(getRegionalPrice('money_claim', 'wales')).toBeNull();
    });

    it('should NOT be available in Scotland', () => {
      expect(getRegionalPrice('money_claim', 'scotland')).toBeNull();
    });

    it('should NOT be available in Northern Ireland', () => {
      expect(getRegionalPrice('money_claim', 'northern_ireland')).toBeNull();
    });

    it('priceNote should indicate England only', () => {
      expect(PRODUCTS.money_claim.priceNote).toContain('England');
    });
  });
});

