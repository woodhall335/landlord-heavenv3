/**
 * Tests for normalizeFacts - Dependent Fact Clearing
 *
 * These tests verify that when a controlling fact changes to a value
 * that makes dependent facts irrelevant, those dependent facts are cleared.
 */

import {
  clearDependentFacts,
  batchClearDependentFacts,
  normalizeFactKeys,
  getAffectedQuestionId,
} from '../normalizeFacts';

describe('clearDependentFacts', () => {
  describe('deposit_taken toggle', () => {
    it('should clear all deposit-related facts when deposit_taken=false', () => {
      const facts = {
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true,
        deposit_protected_scheme: true,
        prescribed_info_given: true,
        deposit_reduced_to_legal_cap_confirmed: 'yes',
        deposit_scheme: 'DPS',
        other_fact: 'preserved',
      };

      const result = clearDependentFacts(facts, 'deposit_taken', false);

      expect(result.deposit_amount).toBeUndefined();
      expect(result.deposit_protected).toBeUndefined();
      expect(result.deposit_protected_scheme).toBeUndefined();
      expect(result.prescribed_info_given).toBeUndefined();
      expect(result.deposit_reduced_to_legal_cap_confirmed).toBeUndefined();
      expect(result.deposit_scheme).toBeUndefined();
      expect(result.other_fact).toBe('preserved');
    });

    it('should NOT clear facts when deposit_taken=true', () => {
      const facts = {
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true,
      };

      const result = clearDependentFacts(facts, 'deposit_taken', true);

      expect(result.deposit_amount).toBe(1000);
      expect(result.deposit_protected).toBe(true);
    });
  });

  describe('deposit_protected_scheme toggle', () => {
    it('should clear prescribed_info_given when deposit_protected_scheme=false', () => {
      const facts = {
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected_scheme: true,
        prescribed_info_given: true,
      };

      const result = clearDependentFacts(facts, 'deposit_protected_scheme', false);

      expect(result.prescribed_info_given).toBeUndefined();
      // Other deposit facts should be preserved
      expect(result.deposit_amount).toBe(1000);
    });
  });

  describe('has_gas_appliances toggle', () => {
    it('should clear gas certificate facts when has_gas_appliances=false', () => {
      const facts = {
        has_gas_appliances: true,
        gas_certificate_provided: true,
        gas_safety_cert_provided: true,
        gas_safety_certificate_provided: true,
        other_fact: 'preserved',
      };

      const result = clearDependentFacts(facts, 'has_gas_appliances', false);

      expect(result.gas_certificate_provided).toBeUndefined();
      expect(result.gas_safety_cert_provided).toBeUndefined();
      expect(result.gas_safety_certificate_provided).toBeUndefined();
      expect(result.other_fact).toBe('preserved');
    });
  });

  describe('is_fixed_term toggle', () => {
    it('should clear fixed_term_end_date when is_fixed_term=false', () => {
      const facts = {
        is_fixed_term: true,
        fixed_term_end_date: '2025-12-31',
        tenancy_start_date: '2025-01-01',
      };

      const result = clearDependentFacts(facts, 'is_fixed_term', false);

      expect(result.fixed_term_end_date).toBeUndefined();
      expect(result.tenancy_start_date).toBe('2025-01-01');
    });
  });

  describe('has_rent_arrears toggle', () => {
    it('should clear arrears details when has_rent_arrears=false', () => {
      const facts = {
        has_rent_arrears: true,
        arrears_total: 5000,
        arrears_from_date: '2025-01-01',
        rent_arrears_amount: 5000,
        rent_amount: 1000,
      };

      const result = clearDependentFacts(facts, 'has_rent_arrears', false);

      expect(result.arrears_total).toBeUndefined();
      expect(result.arrears_from_date).toBeUndefined();
      expect(result.rent_arrears_amount).toBeUndefined();
      expect(result.rent_amount).toBe(1000);
    });
  });
});

describe('batchClearDependentFacts', () => {
  it('should process multiple changes at once', () => {
    const facts = {
      deposit_taken: true,
      deposit_amount: 1000,
      deposit_protected: true,
      prescribed_info_given: true,
      has_gas_appliances: true,
      gas_certificate_provided: true,
    };

    const changes = {
      deposit_taken: false,
      has_gas_appliances: false,
    };

    const result = batchClearDependentFacts(facts, changes);

    // Both deposit and gas facts should be cleared
    expect(result.deposit_amount).toBeUndefined();
    expect(result.gas_certificate_provided).toBeUndefined();
  });

  it('should handle cascading clears correctly', () => {
    // When deposit_taken goes false, it clears deposit_protected_scheme
    // which would have also cleared prescribed_info_given
    const facts = {
      deposit_taken: true,
      deposit_protected_scheme: true,
      prescribed_info_given: true,
    };

    const changes = {
      deposit_taken: false,
    };

    const result = batchClearDependentFacts(facts, changes);

    // Both should be cleared
    expect(result.deposit_protected_scheme).toBeUndefined();
    expect(result.prescribed_info_given).toBeUndefined();
  });
});

describe('normalizeFactKeys', () => {
  it('should map legacy keys to canonical keys', () => {
    const facts = {
      deposit_protected_scheme: true,
      gas_safety_cert_provided: true,
    };

    const result = normalizeFactKeys(facts);

    expect(result.deposit_protected).toBe(true);
    expect(result.gas_certificate_provided).toBe(true);
    // Original keys should still exist
    expect(result.deposit_protected_scheme).toBe(true);
    expect(result.gas_safety_cert_provided).toBe(true);
  });

  it('should handle nested notice_service object', () => {
    const facts = {
      notice_service: {
        notice_date: '2025-01-15',
        notice_expiry_date: '2025-03-15',
      },
    };

    const result = normalizeFactKeys(facts);

    expect(result.notice_service_date).toBe('2025-01-15');
    expect(result.notice_expiry_date).toBe('2025-03-15');
  });

  it('should handle undefined input', () => {
    const result = normalizeFactKeys(undefined);
    expect(result).toEqual({});
  });
});

describe('getAffectedQuestionId', () => {
  it('should map canonical fact keys to question IDs', () => {
    expect(getAffectedQuestionId('deposit_protected')).toBe('deposit_protected_scheme');
    expect(getAffectedQuestionId('gas_certificate_provided')).toBe('gas_safety_certificate');
    expect(getAffectedQuestionId('epc_provided')).toBe('epc_provided');
    expect(getAffectedQuestionId('section8_grounds')).toBe('section8_grounds_selection');
  });

  it('should fallback to field key if not in mapping', () => {
    expect(getAffectedQuestionId('unknown_field')).toBe('unknown_field');
  });
});
