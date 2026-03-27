/**
 * Money Claim Price Guard Tests
 *
 * CRITICAL: These tests ensure Money Claim is consistently priced at £29.99
 * and that no legacy £149.99 / £59.99 references remain in the codebase for money_claim.
 *
 * Added: January 2026
 * Reason: Price change from £59.99 to £29.99 for Money Claim (England only)
 */

import { describe, it, expect } from 'vitest';
import { PRICING, REGIONAL_PRICING, getRegionalPrice } from '@/lib/pricing';
import { PRODUCTS, ASK_HEAVEN_RECOMMENDATION_MAP } from '@/lib/pricing/products';

describe('Money Claim Price Guard Tests', () => {
  describe('Source of Truth - £29.99', () => {
    it('PRODUCTS.money_claim.price should be 29.99', () => {
      expect(PRODUCTS.money_claim.price).toBe(29.99);
    });

    it('PRODUCTS.money_claim.displayPrice should be "£29.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).toBe('£29.99');
    });

    it('PRICING.MONEY_CLAIM_PACK should be 29.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(29.99);
    });

    it('REGIONAL_PRICING.money_claim.england should be 29.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).toBe(29.99);
    });

    it('getRegionalPrice(money_claim, england) should return 29.99', () => {
      expect(getRegionalPrice('money_claim', 'england')).toBe(29.99);
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should be "£29.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).toBe('£29.99');
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

    it('price in pence should be 2999 (no float artifacts)', () => {
      const priceInPence = Math.round(PRODUCTS.money_claim.price * 100);
      expect(priceInPence).toBe(2999);
    });
  });

  describe('Guard against legacy prices (£149.99 and £59.99)', () => {
    it('PRODUCTS.money_claim.price should NOT be 149.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(149.99);
    });

    it('PRODUCTS.money_claim.price should NOT be 59.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(59.99);
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "149.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('149.99');
    });

    it('PRODUCTS.money_claim.displayPrice should NOT contain "59.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('59.99');
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 149.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(149.99);
    });

    it('PRICING.MONEY_CLAIM_PACK should NOT be 59.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(59.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 149.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(149.99);
    });

    it('REGIONAL_PRICING.money_claim.england should NOT be 59.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).not.toBe(59.99);
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "149.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('149.99');
    });

    it('ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice should NOT contain "59.99"', () => {
      expect(ASK_HEAVEN_RECOMMENDATION_MAP.money_claim.displayPrice).not.toContain('59.99');
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
      expect(PRODUCTS.money_claim.priceNote).toBe('England only');
    });
  });
});

