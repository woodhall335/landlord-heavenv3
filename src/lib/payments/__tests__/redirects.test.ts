/**
 * Tests for checkout redirect URL generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSuccessUrl,
  getCancelUrl,
  getCheckoutRedirectUrls,
  isSingleTransactionProduct,
  isDashboardProduct,
  type CheckoutProduct,
} from '../redirects';

describe('redirects', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Set a known base URL for testing
    process.env.NEXT_PUBLIC_APP_URL = 'https://landlordheaven.co.uk';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isSingleTransactionProduct', () => {
    it('returns true for notice_only', () => {
      expect(isSingleTransactionProduct('notice_only')).toBe(true);
    });

    it('returns true for ast_standard', () => {
      expect(isSingleTransactionProduct('ast_standard')).toBe(true);
    });

    it('returns true for ast_premium', () => {
      expect(isSingleTransactionProduct('ast_premium')).toBe(true);
    });

    it('returns false for complete_pack', () => {
      expect(isSingleTransactionProduct('complete_pack')).toBe(false);
    });

    it('returns false for money_claim', () => {
      expect(isSingleTransactionProduct('money_claim')).toBe(false);
    });

    it('returns false for sc_money_claim', () => {
      expect(isSingleTransactionProduct('sc_money_claim')).toBe(false);
    });
  });

  describe('isDashboardProduct', () => {
    it('returns true for complete_pack', () => {
      expect(isDashboardProduct('complete_pack')).toBe(true);
    });

    it('returns true for money_claim', () => {
      expect(isDashboardProduct('money_claim')).toBe(true);
    });

    it('returns true for sc_money_claim', () => {
      expect(isDashboardProduct('sc_money_claim')).toBe(true);
    });

    it('returns false for notice_only', () => {
      expect(isDashboardProduct('notice_only')).toBe(false);
    });

    it('returns false for ast_standard', () => {
      expect(isDashboardProduct('ast_standard')).toBe(false);
    });

    it('returns false for ast_premium', () => {
      expect(isDashboardProduct('ast_premium')).toBe(false);
    });
  });

  describe('getSuccessUrl', () => {
    const caseId = 'case-123';

    describe('single-transaction products', () => {
      it('routes notice_only to success page', () => {
        const url = getSuccessUrl({ product: 'notice_only', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/success/notice_only/case-123');
      });

      it('routes ast_standard to success page', () => {
        const url = getSuccessUrl({ product: 'ast_standard', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/success/ast_standard/case-123');
      });

      it('routes ast_premium to success page', () => {
        const url = getSuccessUrl({ product: 'ast_premium', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/success/ast_premium/case-123');
      });
    });

    describe('dashboard products', () => {
      it('routes complete_pack to dashboard with payment flag', () => {
        const url = getSuccessUrl({ product: 'complete_pack', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/dashboard/cases/case-123?payment=success');
      });

      it('routes money_claim to dashboard with payment flag', () => {
        const url = getSuccessUrl({ product: 'money_claim', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/dashboard/cases/case-123?payment=success');
      });

      it('routes sc_money_claim to dashboard with payment flag', () => {
        const url = getSuccessUrl({ product: 'sc_money_claim', caseId });
        expect(url).toBe('https://landlordheaven.co.uk/dashboard/cases/case-123?payment=success');
      });
    });

    describe('fallback behavior', () => {
      it('returns dashboard with session_id when no caseId', () => {
        const url = getSuccessUrl({ product: 'notice_only' });
        expect(url).toBe('https://landlordheaven.co.uk/dashboard?session_id={CHECKOUT_SESSION_ID}');
      });

      it('uses provided baseUrl', () => {
        const url = getSuccessUrl({
          product: 'notice_only',
          caseId,
          baseUrl: 'http://localhost:5000',
        });
        expect(url).toBe('http://localhost:5000/success/notice_only/case-123');
      });
    });
  });

  describe('getCancelUrl', () => {
    const caseId = 'case-123';

    it('returns preview page with cancelled flag when caseId provided', () => {
      const url = getCancelUrl({ product: 'notice_only', caseId });
      expect(url).toBe('https://landlordheaven.co.uk/wizard/preview/case-123?payment=cancelled');
    });

    it('returns dashboard when no caseId', () => {
      const url = getCancelUrl({ product: 'notice_only' });
      expect(url).toBe('https://landlordheaven.co.uk/dashboard');
    });

    it('uses provided baseUrl', () => {
      const url = getCancelUrl({
        product: 'notice_only',
        caseId,
        baseUrl: 'http://localhost:5000',
      });
      expect(url).toBe('http://localhost:5000/wizard/preview/case-123?payment=cancelled');
    });
  });

  describe('getCheckoutRedirectUrls', () => {
    const caseId = 'case-123';

    it('returns both successUrl and cancelUrl for notice_only', () => {
      const result = getCheckoutRedirectUrls({ product: 'notice_only', caseId });
      expect(result.successUrl).toBe('https://landlordheaven.co.uk/success/notice_only/case-123');
      expect(result.cancelUrl).toBe('https://landlordheaven.co.uk/wizard/preview/case-123?payment=cancelled');
    });

    it('returns both successUrl and cancelUrl for complete_pack', () => {
      const result = getCheckoutRedirectUrls({ product: 'complete_pack', caseId });
      expect(result.successUrl).toBe('https://landlordheaven.co.uk/dashboard/cases/case-123?payment=success');
      expect(result.cancelUrl).toBe('https://landlordheaven.co.uk/wizard/preview/case-123?payment=cancelled');
    });

    it('returns fallback URLs when no caseId', () => {
      const result = getCheckoutRedirectUrls({ product: 'notice_only' });
      expect(result.successUrl).toBe('https://landlordheaven.co.uk/dashboard?session_id={CHECKOUT_SESSION_ID}');
      expect(result.cancelUrl).toBe('https://landlordheaven.co.uk/dashboard');
    });
  });

  describe('product type coverage', () => {
    const products: CheckoutProduct[] = [
      'notice_only',
      'complete_pack',
      'money_claim',
      'sc_money_claim',
      'ast_standard',
      'ast_premium',
    ];

    it('all products are classified as either single-transaction or dashboard', () => {
      for (const product of products) {
        const isSingle = isSingleTransactionProduct(product);
        const isDash = isDashboardProduct(product);
        // Each product should be in exactly one category
        expect(isSingle || isDash).toBe(true);
        expect(isSingle && isDash).toBe(false);
      }
    });

    it('all products return valid success URLs with caseId', () => {
      const caseId = 'test-case';
      for (const product of products) {
        const url = getSuccessUrl({ product, caseId });
        expect(url).toMatch(/^https:\/\/landlordheaven\.co\.uk\/(success|dashboard)/);
        expect(url).not.toContain('undefined');
      }
    });
  });
});
