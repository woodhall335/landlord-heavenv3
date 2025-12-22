/**
 * Tests for normalizeFactKeys null-safety fixes
 *
 * Regression tests for GitHub issue: notice-only wizard crash on initial load
 * caused by normalizeFactKeys reading undefined facts.
 */

import { normalizeFactKeys, getFactValue } from '@/lib/wizard/normalizeFacts';

describe('normalizeFactKeys', () => {
  describe('null-safety', () => {
    it('does not throw when facts is undefined', () => {
      expect(() => normalizeFactKeys(undefined)).not.toThrow();
    });

    it('returns empty object when facts is undefined', () => {
      const result = normalizeFactKeys(undefined);
      expect(result).toEqual({});
    });

    it('does not throw when facts is null', () => {
      expect(() => normalizeFactKeys(null as any)).not.toThrow();
    });

    it('returns empty object when facts is null', () => {
      const result = normalizeFactKeys(null as any);
      expect(result).toEqual({});
    });

    it('works correctly with empty object', () => {
      const result = normalizeFactKeys({});
      expect(result).toEqual({});
    });
  });

  describe('normalization behavior', () => {
    it('normalizes legacy deposit_protected_scheme to deposit_protected', () => {
      const result = normalizeFactKeys({
        deposit_protected_scheme: true,
      });
      expect(result.deposit_protected).toBe(true);
    });

    it('normalizes legacy gas_safety_cert_provided to gas_certificate_provided', () => {
      const result = normalizeFactKeys({
        gas_safety_cert_provided: true,
      });
      expect(result.gas_certificate_provided).toBe(true);
    });

    it('does not overwrite existing canonical keys', () => {
      const result = normalizeFactKeys({
        deposit_protected: false,
        deposit_protected_scheme: true, // Should not overwrite
      });
      expect(result.deposit_protected).toBe(false);
    });

    it('handles nested notice_service object', () => {
      const result = normalizeFactKeys({
        notice_service: {
          notice_date: '2024-01-01',
          notice_expiry_date: '2024-03-01',
        },
      });
      expect(result.notice_service_date).toBe('2024-01-01');
      expect(result.notice_expiry_date).toBe('2024-03-01');
    });

    it('handles nested tenancy object', () => {
      const result = normalizeFactKeys({
        tenancy: {
          prescribed_info_given: true,
        },
      });
      expect(result.prescribed_info_given).toBe(true);
    });
  });
});

describe('getFactValue', () => {
  describe('null-safety', () => {
    it('does not throw when facts is undefined', () => {
      expect(() => getFactValue(undefined, 'test_key')).not.toThrow();
    });

    it('returns undefined when facts is undefined', () => {
      const result = getFactValue(undefined, 'test_key');
      expect(result).toBeUndefined();
    });

    it('does not throw when facts is null', () => {
      expect(() => getFactValue(null as any, 'test_key')).not.toThrow();
    });

    it('returns undefined when facts is null', () => {
      const result = getFactValue(null as any, 'test_key');
      expect(result).toBeUndefined();
    });
  });

  describe('value retrieval', () => {
    it('retrieves direct key value', () => {
      const result = getFactValue({ test_key: 'value' }, 'test_key');
      expect(result).toBe('value');
    });

    it('retrieves canonical key value from legacy key', () => {
      const result = getFactValue(
        { deposit_protected_scheme: true },
        'deposit_protected'
      );
      expect(result).toBe(true);
    });

    it('returns undefined for missing key', () => {
      const result = getFactValue({ other_key: 'value' }, 'missing_key');
      expect(result).toBeUndefined();
    });
  });
});
