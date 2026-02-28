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

describe('clearDependentFacts', () => {
  // Import the function
  let clearDependentFacts: typeof import('@/lib/wizard/normalizeFacts').clearDependentFacts;
  let batchClearDependentFacts: typeof import('@/lib/wizard/normalizeFacts').batchClearDependentFacts;

  beforeAll(async () => {
    const mod = await import('@/lib/wizard/normalizeFacts');
    clearDependentFacts = mod.clearDependentFacts;
    batchClearDependentFacts = mod.batchClearDependentFacts;
  });

  describe('deposit_taken clearing', () => {
    it('clears deposit-related facts when deposit_taken becomes false', () => {
      const facts = {
        deposit_taken: true,
        deposit_amount: 1500,
        deposit_protected: true,
        prescribed_info_given: true,
        deposit_reduced_to_legal_cap_confirmed: 'yes',
        other_fact: 'should remain',
      };

      const result = clearDependentFacts(facts, 'deposit_taken', false);

      expect(result.deposit_amount).toBeUndefined();
      expect(result.deposit_protected).toBeUndefined();
      expect(result.prescribed_info_given).toBeUndefined();
      expect(result.deposit_reduced_to_legal_cap_confirmed).toBeUndefined();
      expect(result.other_fact).toBe('should remain');
    });

    it('does not clear facts when deposit_taken is true', () => {
      const facts = {
        deposit_taken: false,
        deposit_amount: 1500,
      };

      const result = clearDependentFacts(facts, 'deposit_taken', true);

      expect(result.deposit_amount).toBe(1500);
    });
  });

  describe('has_gas_appliances clearing', () => {
    it('clears gas certificate facts when has_gas_appliances becomes false', () => {
      const facts = {
        has_gas_appliances: true,
        gas_certificate_provided: true,
        gas_safety_cert_provided: true,
        epc_provided: true,  // should remain
      };

      const result = clearDependentFacts(facts, 'has_gas_appliances', false);

      expect(result.gas_certificate_provided).toBeUndefined();
      expect(result.gas_safety_cert_provided).toBeUndefined();
      expect(result.epc_provided).toBe(true);
    });
  });

  describe('is_fixed_term clearing', () => {
    it('clears fixed_term_end_date when is_fixed_term becomes false', () => {
      const facts = {
        is_fixed_term: true,
        fixed_term_end_date: '2025-01-01',
        tenancy_start_date: '2024-01-01',  // should remain
      };

      const result = clearDependentFacts(facts, 'is_fixed_term', false);

      expect(result.fixed_term_end_date).toBeUndefined();
      expect(result.tenancy_start_date).toBe('2024-01-01');
    });
  });

  describe('has_rent_arrears clearing', () => {
    it('clears arrears details when has_rent_arrears becomes false', () => {
      const facts = {
        has_rent_arrears: true,
        arrears_total: 2500,
        arrears_from_date: '2024-01-01',
        rent_amount: 1000,  // should remain
      };

      const result = clearDependentFacts(facts, 'has_rent_arrears', false);

      expect(result.arrears_total).toBeUndefined();
      expect(result.arrears_from_date).toBeUndefined();
      expect(result.rent_amount).toBe(1000);
    });
  });

  describe('deposit_protected_scheme clearing', () => {
    it('clears prescribed_info when deposit_protected_scheme becomes false', () => {
      const facts = {
        deposit_taken: true,
        deposit_protected_scheme: true,
        prescribed_info_given: true,
        deposit_amount: 1500,  // should remain
      };

      const result = clearDependentFacts(facts, 'deposit_protected_scheme', false);

      expect(result.prescribed_info_given).toBeUndefined();
      expect(result.deposit_amount).toBe(1500);
    });
  });

  describe('deposit_protected (canonical fact) clearing', () => {
    it('clears prescribed_info when deposit_protected becomes false', () => {
      // This tests the canonical fact path used when MQS maps_to is used
      const facts = {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: true,
        prescribed_info_provided: true,
        deposit_amount: 1500,  // should remain
      };

      const result = clearDependentFacts(facts, 'deposit_protected', false);

      expect(result.prescribed_info_given).toBeUndefined();
      expect(result.prescribed_info_provided).toBeUndefined();
      expect(result.deposit_amount).toBe(1500);
      expect(result.deposit_taken).toBe(true);
    });

    it('does not clear prescribed_info when deposit_protected is true', () => {
      const facts = {
        deposit_taken: true,
        deposit_protected: false,
        prescribed_info_given: true,
      };

      const result = clearDependentFacts(facts, 'deposit_protected', true);

      expect(result.prescribed_info_given).toBe(true);
    });
  });

  describe('batchClearDependentFacts', () => {
    it('clears multiple dependent facts from multiple changes', () => {
      const facts = {
        deposit_taken: true,
        deposit_amount: 1500,
        deposit_protected: true,
        has_gas_appliances: true,
        gas_certificate_provided: true,
        other_fact: 'should remain',
      };

      const changes = {
        deposit_taken: false,
        has_gas_appliances: false,
      };

      const result = batchClearDependentFacts(facts, changes);

      expect(result.deposit_amount).toBeUndefined();
      expect(result.deposit_protected).toBeUndefined();
      expect(result.gas_certificate_provided).toBeUndefined();
      expect(result.other_fact).toBe('should remain');
    });
  });

  describe('null-safety', () => {
    it('returns empty object when facts is null', () => {
      const result = clearDependentFacts(null as any, 'deposit_taken', false);
      expect(result).toEqual({});
    });

    it('returns facts unchanged for unknown controlling fact', () => {
      const facts = { test: 'value' };
      const result = clearDependentFacts(facts, 'unknown_fact', false);
      expect(result).toEqual(facts);
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
