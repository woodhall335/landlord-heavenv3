/**
 * Money Claim Price Guard Tests
 *
 * Ensures Money Claim pricing is locked to the current commercial model.
 */

import { describe, it, expect } from 'vitest';
import { PRICING, REGIONAL_PRICING, getRegionalPrice } from '@/lib/pricing';
import { PRODUCTS, ASK_HEAVEN_RECOMMENDATIONS } from '@/lib/pricing/products';

describe('Money Claim Price Guard Tests', () => {
  describe('Source of truth', () => {
    it('PRODUCTS.money_claim.price should be 45.99', () => {
      expect(PRODUCTS.money_claim.price).toBe(45.99);
    });

    it('PRODUCTS.money_claim.displayPrice should be "£45.99"', () => {
      expect(PRODUCTS.money_claim.displayPrice).toBe('£45.99');
    });

    it('PRICING.MONEY_CLAIM_PACK should be 45.99', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(45.99);
    });

    it('REGIONAL_PRICING.money_claim.england should be 45.99', () => {
      expect(REGIONAL_PRICING.money_claim.england).toBe(45.99);
    });

    it('getRegionalPrice(money_claim, england) should return 45.99', () => {
      expect(getRegionalPrice('money_claim', 'england')).toBe(45.99);
    });

    it('sc_money_claim display should mirror money_claim display', () => {
      expect(PRODUCTS.sc_money_claim.displayPrice).toBe(PRODUCTS.money_claim.displayPrice);
    });
  });

  describe('Consistency checks', () => {
    it('pricing config values must stay in sync', () => {
      expect(PRICING.MONEY_CLAIM_PACK).toBe(PRODUCTS.money_claim.price);
      expect(REGIONAL_PRICING.money_claim.england).toBe(PRODUCTS.money_claim.price);
    });

    it('displayPrice should match formatted numeric price', () => {
      const formattedPrice = `£${PRODUCTS.money_claim.price.toFixed(2)}`;
      expect(PRODUCTS.money_claim.displayPrice).toBe(formattedPrice);
    });

    it('price in pence should be 4599', () => {
      const priceInPence = Math.round(PRODUCTS.money_claim.price * 100);
      expect(priceInPence).toBe(4599);
    });
  });

  describe('Guard against legacy values', () => {
    it('money claim should not revert to 99.99 or 149.99', () => {
      expect(PRODUCTS.money_claim.price).not.toBe(99.99);
      expect(PRODUCTS.money_claim.price).not.toBe(149.99);
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(99.99);
      expect(PRICING.MONEY_CLAIM_PACK).not.toBe(149.99);
    });

    it('money claim display should not include legacy amount strings', () => {
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('99.99');
      expect(PRODUCTS.money_claim.displayPrice).not.toContain('149.99');
    });
  });

  describe('Scope + recommendation mapping', () => {
    it('Money Claim remains England-only', () => {
      expect(getRegionalPrice('money_claim', 'wales')).toBeNull();
      expect(getRegionalPrice('money_claim', 'scotland')).toBeNull();
      expect(getRegionalPrice('money_claim', 'northern_ireland')).toBeNull();
      expect(PRODUCTS.money_claim.priceNote).toBe('England only');
    });

    it('Ask Heaven recommendation set includes money_claim', () => {
      expect(ASK_HEAVEN_RECOMMENDATIONS).toContain('money_claim');
    });
  });
});
