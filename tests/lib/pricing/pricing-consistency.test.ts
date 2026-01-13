/**
 * Pricing Consistency Tests
 *
 * CRITICAL: These tests ensure all pricing sources stay in sync.
 * Added after Revenue Funnel Audit (Jan 2026) revealed multiple pricing mismatches.
 *
 * If these tests fail, it means pricing is inconsistent across the codebase.
 */

import { describe, it, expect } from 'vitest';
import { PRICING } from '@/lib/pricing';
import { PRODUCTS } from '@/lib/pricing/products';

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

  describe('Current prices are correct (Jan 2026)', () => {
    it('Notice Only should be £39.99', () => {
      expect(PRODUCTS.notice_only.price).toBe(39.99);
    });

    it('Complete Eviction Pack should be £199.99', () => {
      expect(PRODUCTS.complete_pack.price).toBe(199.99);
    });

    it('Money Claim Pack should be £199.99', () => {
      expect(PRODUCTS.money_claim.price).toBe(199.99);
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
});
