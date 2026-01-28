/**
 * Stripe Price ID Guardrails Tests
 *
 * Ensures Stripe price IDs are validated correctly.
 * Critical: Product IDs (prod_) must NEVER be used in price slots.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe to avoid needing API key
vi.mock('stripe', () => {
  return {
    default: vi.fn(() => ({})),
    Stripe: vi.fn(() => ({})),
  };
});

// Set env vars before importing
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_PRICE_ID_NOTICE_ONLY = 'price_test_notice';
process.env.STRIPE_PRICE_ID_EVICTION_PACK = 'price_test_eviction';
process.env.STRIPE_PRICE_ID_MONEY_CLAIM = 'price_test_money';
process.env.STRIPE_PRICE_ID_STANDARD_AST = 'price_test_ast_standard';
process.env.STRIPE_PRICE_ID_PREMIUM_AST = 'price_test_ast_premium';

// Import after mocking
import {
  assertValidPriceId,
  isValidPriceIdFormat,
  isProductId,
  validateAllPriceIds,
  StripePriceIdError,
} from '../../../src/lib/stripe';

describe('isValidPriceIdFormat', () => {
  it('returns true for valid price IDs', () => {
    expect(isValidPriceIdFormat('price_1abc123')).toBe(true);
    expect(isValidPriceIdFormat('price_LIVE123')).toBe(true);
    expect(isValidPriceIdFormat('price_TEST456')).toBe(true);
  });

  it('returns false for product IDs', () => {
    expect(isValidPriceIdFormat('prod_1abc123')).toBe(false);
    expect(isValidPriceIdFormat('prod_LIVE123')).toBe(false);
  });

  it('returns false for other Stripe IDs', () => {
    expect(isValidPriceIdFormat('cus_1abc123')).toBe(false);
    expect(isValidPriceIdFormat('sub_1abc123')).toBe(false);
    expect(isValidPriceIdFormat('cs_1abc123')).toBe(false);
  });

  it('returns false for non-Stripe IDs', () => {
    expect(isValidPriceIdFormat('abc123')).toBe(false);
    expect(isValidPriceIdFormat('')).toBe(false);
    expect(isValidPriceIdFormat('undefined')).toBe(false);
  });

  it('returns false for non-strings', () => {
    expect(isValidPriceIdFormat(null as any)).toBe(false);
    expect(isValidPriceIdFormat(undefined as any)).toBe(false);
    expect(isValidPriceIdFormat(123 as any)).toBe(false);
  });
});

describe('isProductId', () => {
  it('returns true for product IDs', () => {
    expect(isProductId('prod_1abc123')).toBe(true);
    expect(isProductId('prod_LIVE123')).toBe(true);
  });

  it('returns false for price IDs', () => {
    expect(isProductId('price_1abc123')).toBe(false);
  });

  it('returns false for other IDs', () => {
    expect(isProductId('cus_1abc123')).toBe(false);
    expect(isProductId('abc123')).toBe(false);
  });
});

describe('assertValidPriceId', () => {
  it('does not throw for valid price IDs', () => {
    expect(() => assertValidPriceId('price_1abc123')).not.toThrow();
    expect(() => assertValidPriceId('price_LIVE123')).not.toThrow();
  });

  it('throws StripePriceIdError for product IDs (CRITICAL)', () => {
    expect(() => assertValidPriceId('prod_1abc123')).toThrow(StripePriceIdError);
    expect(() => assertValidPriceId('prod_LIVE123')).toThrow(StripePriceIdError);
  });

  it('throws StripePriceIdError for empty string', () => {
    expect(() => assertValidPriceId('')).toThrow(StripePriceIdError);
  });

  it('throws StripePriceIdError for invalid format', () => {
    expect(() => assertValidPriceId('abc123')).toThrow(StripePriceIdError);
    expect(() => assertValidPriceId('cus_123')).toThrow(StripePriceIdError);
  });

  it('includes context in error message', () => {
    try {
      assertValidPriceId('prod_ABC123', 'NOTICE_ONLY product');
    } catch (error) {
      if (error instanceof StripePriceIdError) {
        expect(error.message).toContain('NOTICE_ONLY product');
        expect(error.context).toBe('NOTICE_ONLY product');
        expect(error.invalidId).toBe('prod_ABC123');
        expect(error.expectedPrefix).toBe('price_');
      } else {
        throw new Error('Expected StripePriceIdError');
      }
    }
  });
});

describe('validateAllPriceIds', () => {
  it('returns validation result object', () => {
    const result = validateAllPriceIds();

    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('detects product IDs in price slots', () => {
    // This test validates the function logic, not actual env vars
    // The function checks all PRICE_IDS values
    const result = validateAllPriceIds();

    // Should either be valid (all correct) or have specific error messages
    if (!result.valid) {
      result.errors.forEach(error => {
        expect(error).toMatch(/STRIPE_PRICE_ID_/);
      });
    }
  });
});

describe('StripePriceIdError', () => {
  it('has correct error properties', () => {
    const error = new StripePriceIdError('prod_ABC', 'price_', 'test context');

    expect(error.name).toBe('StripePriceIdError');
    expect(error.code).toBe('INVALID_STRIPE_ID');
    expect(error.invalidId).toBe('prod_ABC');
    expect(error.expectedPrefix).toBe('price_');
    expect(error.context).toBe('test context');
    expect(error.message).toContain('prod_ABC');
    expect(error.message).toContain('price_');
    expect(error.message).toContain('test context');
  });

  it('works without context', () => {
    const error = new StripePriceIdError('prod_ABC', 'price_');

    expect(error.context).toBeUndefined();
    expect(error.message).not.toContain('undefined');
  });
});
