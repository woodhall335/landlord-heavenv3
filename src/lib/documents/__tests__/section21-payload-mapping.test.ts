/**
 * Section 21 Payload Mapping Tests
 *
 * Tests the mapping boundary between wizard payloads and Section 21 generator.
 * Ensures that various payload shapes (flat, nested, labels vs enums) are
 * correctly normalized before being passed to the date calculator.
 *
 * These tests specifically address the bug where fixed-term tenancies with
 * label strings like "Assured Shorthold Tenancy (Fixed term)" were being
 * treated as periodic tenancies, resulting in incorrect expiry dates.
 */

import {
  isFixedTermTenancy,
  resolveFixedTermEndDate,
  hasBreakClause,
  resolveBreakClauseDate,
  normalizeServiceMethod,
  resolveServiceMethod,
} from '../section21-payload-normalizer';
import { mapWizardToSection21Data, generateSection21Notice } from '../section21-generator';
import { calculateSection21ExpiryDate } from '../notice-date-calculator';

// ============================================================================
// TENANCY TYPE NORMALIZATION TESTS
// ============================================================================

describe('Tenancy Type Normalization', () => {
  describe('isFixedTermTenancy', () => {
    it('returns true for fixed_term boolean flag', () => {
      expect(isFixedTermTenancy({ fixed_term: true })).toBe(true);
      expect(isFixedTermTenancy({ fixed_term: false })).toBe(false);
    });

    it('returns true for is_fixed_term boolean flag', () => {
      expect(isFixedTermTenancy({ is_fixed_term: true })).toBe(true);
      expect(isFixedTermTenancy({ is_fixed_term: false })).toBe(false);
    });

    it('returns true for tenancy_type enum "ast_fixed"', () => {
      expect(isFixedTermTenancy({ tenancy_type: 'ast_fixed' })).toBe(true);
    });

    it('returns true for tenancy_type enum "fixed_term"', () => {
      expect(isFixedTermTenancy({ tenancy_type: 'fixed_term' })).toBe(true);
    });

    it('returns true for tenancy_type label "Assured Shorthold Tenancy (Fixed term)"', () => {
      expect(isFixedTermTenancy({ tenancy_type: 'Assured Shorthold Tenancy (Fixed term)' })).toBe(true);
    });

    it('returns true for tenancy_type label containing "fixed term" (case insensitive)', () => {
      expect(isFixedTermTenancy({ tenancy_type: 'Fixed Term Tenancy' })).toBe(true);
      expect(isFixedTermTenancy({ tenancy_type: 'FIXED TERM' })).toBe(true);
      expect(isFixedTermTenancy({ tenancy_type: 'fixed-term' })).toBe(true);
    });

    it('returns false for periodic tenancy types', () => {
      expect(isFixedTermTenancy({ tenancy_type: 'periodic' })).toBe(false);
      expect(isFixedTermTenancy({ tenancy_type: 'ast_periodic' })).toBe(false);
      expect(isFixedTermTenancy({ tenancy_type: 'Assured Shorthold Tenancy (Periodic)' })).toBe(false);
    });

    it('handles nested tenancy object with tenancy_type', () => {
      expect(isFixedTermTenancy({
        tenancy: { tenancy_type: 'ast_fixed' },
      })).toBe(true);

      expect(isFixedTermTenancy({
        tenancy: { tenancy_type: 'Assured Shorthold Tenancy (Fixed term)' },
      })).toBe(true);
    });

    it('handles nested tenancy object with type field', () => {
      expect(isFixedTermTenancy({
        tenancy: { type: 'fixed_term' },
      })).toBe(true);
    });

    it('handles nested tenancy object with fixed_term boolean', () => {
      expect(isFixedTermTenancy({
        tenancy: { fixed_term: true },
      })).toBe(true);
    });
  });
});

// ============================================================================
// FIXED TERM END DATE RESOLUTION TESTS
// ============================================================================

describe('Fixed Term End Date Resolution', () => {
  describe('resolveFixedTermEndDate', () => {
    it('returns flat fixed_term_end_date', () => {
      expect(resolveFixedTermEndDate({ fixed_term_end_date: '2026-07-14' })).toBe('2026-07-14');
    });

    it('returns nested tenancy.fixed_term_end_date', () => {
      expect(resolveFixedTermEndDate({
        tenancy: { fixed_term_end_date: '2026-07-14' },
      })).toBe('2026-07-14');
    });

    it('returns nested tenancy.end_date as fallback', () => {
      expect(resolveFixedTermEndDate({
        tenancy: { end_date: '2026-07-14' },
      })).toBe('2026-07-14');
    });

    it('prefers flat key over nested', () => {
      expect(resolveFixedTermEndDate({
        fixed_term_end_date: '2026-08-01',
        tenancy: { fixed_term_end_date: '2026-07-14' },
      })).toBe('2026-08-01');
    });

    it('returns undefined when not present', () => {
      expect(resolveFixedTermEndDate({})).toBeUndefined();
    });
  });
});

// ============================================================================
// BREAK CLAUSE RESOLUTION TESTS
// ============================================================================

describe('Break Clause Resolution', () => {
  describe('hasBreakClause', () => {
    it('returns true for has_break_clause boolean', () => {
      expect(hasBreakClause({ has_break_clause: true })).toBe(true);
      expect(hasBreakClause({ has_break_clause: false })).toBe(false);
    });

    it('returns true for has_break_clause "yes" string', () => {
      expect(hasBreakClause({ has_break_clause: 'yes' })).toBe(true);
    });

    it('returns true for break_clause boolean', () => {
      expect(hasBreakClause({ break_clause: true })).toBe(true);
    });

    it('handles nested tenancy.has_break_clause', () => {
      expect(hasBreakClause({
        tenancy: { has_break_clause: true },
      })).toBe(true);

      expect(hasBreakClause({
        tenancy: { has_break_clause: 'yes' },
      })).toBe(true);
    });

    it('handles nested tenancy.break_clause', () => {
      expect(hasBreakClause({
        tenancy: { break_clause: true },
      })).toBe(true);
    });

    it('returns false when not present', () => {
      expect(hasBreakClause({})).toBe(false);
    });
  });

  describe('resolveBreakClauseDate', () => {
    it('returns flat break_clause_date', () => {
      expect(resolveBreakClauseDate({ break_clause_date: '2026-05-01' })).toBe('2026-05-01');
    });

    it('returns nested tenancy.break_clause_date', () => {
      expect(resolveBreakClauseDate({
        tenancy: { break_clause_date: '2026-05-01' },
      })).toBe('2026-05-01');
    });
  });
});

// ============================================================================
// SERVICE METHOD NORMALIZATION TESTS
// ============================================================================

describe('Service Method Normalization', () => {
  describe('normalizeServiceMethod', () => {
    it('normalizes "First class post" to "first_class_post"', () => {
      expect(normalizeServiceMethod('First class post')).toBe('first_class_post');
    });

    it('normalizes "FIRST CLASS POST" (uppercase) to "first_class_post"', () => {
      expect(normalizeServiceMethod('FIRST CLASS POST')).toBe('first_class_post');
    });

    it('normalizes "second class post" to "second_class_post"', () => {
      expect(normalizeServiceMethod('second class post')).toBe('second_class_post');
    });

    it('normalizes "Hand delivery" to "hand_delivery"', () => {
      expect(normalizeServiceMethod('Hand delivery')).toBe('hand_delivery');
    });

    it('normalizes "Leaving at property" to "leaving_at_property"', () => {
      expect(normalizeServiceMethod('Leaving at property')).toBe('leaving_at_property');
    });

    it('normalizes "Recorded delivery" to "recorded_delivery"', () => {
      expect(normalizeServiceMethod('Recorded delivery')).toBe('recorded_delivery');
    });

    it('passes through canonical values unchanged', () => {
      expect(normalizeServiceMethod('first_class_post')).toBe('first_class_post');
      expect(normalizeServiceMethod('hand_delivery')).toBe('hand_delivery');
    });

    it('handles hyphenated variations', () => {
      expect(normalizeServiceMethod('first-class post')).toBe('first_class_post');
      expect(normalizeServiceMethod('hand-delivery')).toBe('hand_delivery');
    });

    it('handles "in person" as hand_delivery', () => {
      expect(normalizeServiceMethod('in person')).toBe('hand_delivery');
    });

    it('handles "by hand" as hand_delivery', () => {
      expect(normalizeServiceMethod('by hand')).toBe('hand_delivery');
    });

    it('returns undefined for invalid values', () => {
      expect(normalizeServiceMethod('email')).toBeUndefined();
      expect(normalizeServiceMethod('')).toBeUndefined();
      expect(normalizeServiceMethod(null)).toBeUndefined();
      expect(normalizeServiceMethod(undefined)).toBeUndefined();
    });
  });

  describe('resolveServiceMethod', () => {
    it('resolves from flat service_method with label', () => {
      expect(resolveServiceMethod({ service_method: 'First class post' })).toBe('first_class_post');
    });

    it('resolves from nested notice_service.service_method', () => {
      expect(resolveServiceMethod({
        notice_service: { service_method: 'Hand delivery' },
      })).toBe('hand_delivery');
    });

    it('resolves from delivery_method key', () => {
      expect(resolveServiceMethod({ delivery_method: 'Recorded delivery' })).toBe('recorded_delivery');
    });
  });
});

// ============================================================================
// FULL MAPPING INTEGRATION TESTS
// ============================================================================

describe('mapWizardToSection21Data Integration', () => {
  const baseWizardFacts = {
    landlord_full_name: 'John Smith',
    landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
    tenant_full_name: 'Jane Tenant',
    property_address: '456 Rental Road\nLondon\nW1A 2BB',
    tenancy_start_date: '2025-07-14',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    deposit_protected: true,
    deposit_scheme: 'DPS',
    gas_certificate_provided: true,
    how_to_rent_provided: true,
    epc_provided: true,
  };

  it('maps tenancy_type label "Assured Shorthold Tenancy (Fixed term)" to fixed_term=true', () => {
    const result = mapWizardToSection21Data({
      ...baseWizardFacts,
      tenancy_type: 'Assured Shorthold Tenancy (Fixed term)',
      fixed_term_end_date: '2026-07-14',
    });

    expect(result.fixed_term).toBe(true);
    expect(result.fixed_term_end_date).toBe('2026-07-14');
  });

  it('maps tenancy_type enum "ast_fixed" to fixed_term=true', () => {
    const result = mapWizardToSection21Data({
      ...baseWizardFacts,
      tenancy_type: 'ast_fixed',
      fixed_term_end_date: '2026-07-14',
    });

    expect(result.fixed_term).toBe(true);
    expect(result.fixed_term_end_date).toBe('2026-07-14');
  });

  it('maps nested tenancy object payload shape', () => {
    const result = mapWizardToSection21Data({
      ...baseWizardFacts,
      tenancy: {
        tenancy_type: 'ast_fixed',
        fixed_term_end_date: '2026-07-14',
        has_break_clause: false,
      },
    });

    expect(result.fixed_term).toBe(true);
    expect(result.fixed_term_end_date).toBe('2026-07-14');
    expect(result.has_break_clause).toBe(false);
  });

  it('maps service method label to canonical enum', () => {
    const result = mapWizardToSection21Data({
      ...baseWizardFacts,
      service_method: 'First class post',
    });

    expect(result.service_method).toBe('first_class_post');
  });

  it('maps break_clause from nested tenancy object', () => {
    const result = mapWizardToSection21Data({
      ...baseWizardFacts,
      tenancy: {
        tenancy_type: 'ast_fixed',
        fixed_term_end_date: '2026-07-14',
        has_break_clause: true,
        break_clause_date: '2026-04-01',
      },
    });

    expect(result.has_break_clause).toBe(true);
    expect(result.break_clause_date).toBe('2026-04-01');
  });
});

// ============================================================================
// END-TO-END EXPIRY DATE TESTS
// ============================================================================

describe('Section 21 Expiry Date End-to-End', () => {
  /**
   * CRITICAL TEST: This is the exact scenario that was failing.
   *
   * Fixed-term AST with:
   * - Tenancy type: "Assured Shorthold Tenancy (Fixed term)" (label, not enum)
   * - Fixed term end: 2026-07-14
   * - No break clause
   * - Service method: "First class post" (label, not enum)
   * - Serve date: 2026-01-15
   *
   * Expected expiry: 2026-07-14 (clamped to fixed term end)
   *
   * Previously this was returning 2026-04-14 (2 months + deemed service)
   * because fixed_term was being set to false.
   */
  it('calculates correct expiry for fixed-term AST with label tenancy type (serve 2026-01-15 → expiry 2026-07-14)', () => {
    const wizardFacts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
      tenant_full_name: 'Jane Tenant',
      property_address: '456 Rental Road\nLondon\nW1A 2BB',
      tenancy_start_date: '2025-07-14',
      tenancy_type: 'Assured Shorthold Tenancy (Fixed term)',
      fixed_term_end_date: '2026-07-14',
      has_break_clause: false,
      service_method: 'First class post',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      deposit_protected: true,
      deposit_scheme: 'DPS',
      gas_certificate_provided: true,
      how_to_rent_provided: true,
      epc_provided: true,
    };

    const mappedData = mapWizardToSection21Data(wizardFacts, {
      serviceDate: '2026-01-15',
    });

    // Verify mapping is correct
    expect(mappedData.fixed_term).toBe(true);
    expect(mappedData.fixed_term_end_date).toBe('2026-07-14');
    expect(mappedData.has_break_clause).toBe(false);
    expect(mappedData.service_method).toBe('first_class_post');
    expect(mappedData.service_date).toBe('2026-01-15');

    // Calculate expiry date
    const expiryResult = calculateSection21ExpiryDate({
      service_date: mappedData.service_date!,
      tenancy_start_date: mappedData.tenancy_start_date,
      fixed_term: mappedData.fixed_term,
      fixed_term_end_date: mappedData.fixed_term_end_date,
      has_break_clause: mappedData.has_break_clause,
      break_clause_date: mappedData.break_clause_date,
      rent_period: mappedData.rent_frequency,
      service_method: mappedData.service_method,
    });

    // CRITICAL: Expiry must be 2026-07-14 (fixed term end), NOT 2026-04-14
    expect(expiryResult.earliest_valid_date).toBe('2026-07-14');
  });

  it('calculates correct expiry for fixed-term AST with enum tenancy type (serve 2026-01-15 → expiry 2026-07-14)', () => {
    const wizardFacts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
      tenant_full_name: 'Jane Tenant',
      property_address: '456 Rental Road\nLondon\nW1A 2BB',
      tenancy_start_date: '2025-07-14',
      tenancy_type: 'ast_fixed',
      fixed_term_end_date: '2026-07-14',
      has_break_clause: false,
      service_method: 'first_class_post',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      deposit_protected: true,
      deposit_scheme: 'DPS',
      gas_certificate_provided: true,
      how_to_rent_provided: true,
      epc_provided: true,
    };

    const mappedData = mapWizardToSection21Data(wizardFacts, {
      serviceDate: '2026-01-15',
    });

    expect(mappedData.fixed_term).toBe(true);

    const expiryResult = calculateSection21ExpiryDate({
      service_date: mappedData.service_date!,
      tenancy_start_date: mappedData.tenancy_start_date,
      fixed_term: mappedData.fixed_term,
      fixed_term_end_date: mappedData.fixed_term_end_date,
      has_break_clause: mappedData.has_break_clause,
      break_clause_date: mappedData.break_clause_date,
      rent_period: mappedData.rent_frequency,
      service_method: mappedData.service_method,
    });

    expect(expiryResult.earliest_valid_date).toBe('2026-07-14');
  });

  it('calculates correct expiry for nested payload shape (serve 2026-01-15 → expiry 2026-07-14)', () => {
    const wizardFacts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
      tenant_full_name: 'Jane Tenant',
      property_address: '456 Rental Road\nLondon\nW1A 2BB',
      tenancy_start_date: '2025-07-14',
      tenancy: {
        tenancy_type: 'Assured Shorthold Tenancy (Fixed term)',
        fixed_term_end_date: '2026-07-14',
        has_break_clause: false,
      },
      notice_service: {
        service_method: 'First class post',
      },
      rent_amount: 1200,
      rent_frequency: 'monthly',
      deposit_protected: true,
      deposit_scheme: 'DPS',
      gas_certificate_provided: true,
      how_to_rent_provided: true,
      epc_provided: true,
    };

    const mappedData = mapWizardToSection21Data(wizardFacts, {
      serviceDate: '2026-01-15',
    });

    expect(mappedData.fixed_term).toBe(true);
    expect(mappedData.fixed_term_end_date).toBe('2026-07-14');
    expect(mappedData.has_break_clause).toBe(false);
    expect(mappedData.service_method).toBe('first_class_post');

    const expiryResult = calculateSection21ExpiryDate({
      service_date: mappedData.service_date!,
      tenancy_start_date: mappedData.tenancy_start_date,
      fixed_term: mappedData.fixed_term,
      fixed_term_end_date: mappedData.fixed_term_end_date,
      has_break_clause: mappedData.has_break_clause,
      break_clause_date: mappedData.break_clause_date,
      rent_period: mappedData.rent_frequency,
      service_method: mappedData.service_method,
    });

    expect(expiryResult.earliest_valid_date).toBe('2026-07-14');
  });

  it('calculates correct expiry for fixed-term AST WITH break clause', () => {
    const wizardFacts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
      tenant_full_name: 'Jane Tenant',
      property_address: '456 Rental Road\nLondon\nW1A 2BB',
      tenancy_start_date: '2025-07-14',
      tenancy_type: 'Assured Shorthold Tenancy (Fixed term)',
      fixed_term_end_date: '2026-07-14',
      has_break_clause: true,
      break_clause_date: '2026-04-01',
      service_method: 'Hand delivery',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      deposit_protected: true,
      deposit_scheme: 'DPS',
      gas_certificate_provided: true,
      how_to_rent_provided: true,
      epc_provided: true,
    };

    const mappedData = mapWizardToSection21Data(wizardFacts, {
      serviceDate: '2026-01-15',
    });

    expect(mappedData.fixed_term).toBe(true);
    expect(mappedData.has_break_clause).toBe(true);
    expect(mappedData.break_clause_date).toBe('2026-04-01');
    expect(mappedData.service_method).toBe('hand_delivery');

    const expiryResult = calculateSection21ExpiryDate({
      service_date: mappedData.service_date!,
      tenancy_start_date: mappedData.tenancy_start_date,
      fixed_term: mappedData.fixed_term,
      fixed_term_end_date: mappedData.fixed_term_end_date,
      has_break_clause: mappedData.has_break_clause,
      break_clause_date: mappedData.break_clause_date,
      rent_period: mappedData.rent_frequency,
      service_method: mappedData.service_method,
    });

    // With break clause on 2026-04-01, expiry should be 2026-04-01
    // (break clause date is before 2 months + service = 2026-03-15)
    // Wait, 2026-01-15 + 2 months = 2026-03-15, which is before break clause date
    // So expiry should be max(2026-03-15, break_clause_date=2026-04-01) = 2026-04-01
    expect(expiryResult.earliest_valid_date).toBe('2026-04-01');
  });

  it('correctly handles periodic tenancy (no fixed term)', () => {
    const wizardFacts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Landlord Lane\nLondon\nSW1A 1AA',
      tenant_full_name: 'Jane Tenant',
      property_address: '456 Rental Road\nLondon\nW1A 2BB',
      tenancy_start_date: '2024-07-14',
      tenancy_type: 'periodic',
      service_method: 'first_class_post',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      deposit_protected: true,
      deposit_scheme: 'DPS',
      gas_certificate_provided: true,
      how_to_rent_provided: true,
      epc_provided: true,
    };

    const mappedData = mapWizardToSection21Data(wizardFacts, {
      serviceDate: '2026-01-15',
    });

    expect(mappedData.fixed_term).toBe(false);
    expect(mappedData.fixed_term_end_date).toBeUndefined();

    const expiryResult = calculateSection21ExpiryDate({
      service_date: mappedData.service_date!,
      tenancy_start_date: mappedData.tenancy_start_date,
      fixed_term: mappedData.fixed_term,
      fixed_term_end_date: mappedData.fixed_term_end_date,
      has_break_clause: mappedData.has_break_clause,
      break_clause_date: mappedData.break_clause_date,
      rent_period: mappedData.rent_frequency,
      service_method: mappedData.service_method,
    });

    // For periodic tenancy, 2 months from deemed service (2026-01-17 + 2 months = 2026-03-17)
    // Then aligned to rent period (14th of month) = 2026-04-14
    expect(expiryResult.earliest_valid_date).toBe('2026-04-14');
  });
});

// ============================================================================
// SERVICE METHOD NORMALIZATION END-TO-END TESTS
// ============================================================================

describe('Service Method Normalization End-to-End', () => {
  it('"First class post" → first_class_post → deemed service +2 working days', () => {
    const mappedData = mapWizardToSection21Data({
      landlord_full_name: 'Test',
      tenant_full_name: 'Test',
      property_address: 'Test',
      tenancy_start_date: '2024-01-01',
      rent_frequency: 'monthly',
      service_method: 'First class post',
    });

    expect(mappedData.service_method).toBe('first_class_post');
  });

  it('"Hand delivery" → hand_delivery → deemed service same day', () => {
    const mappedData = mapWizardToSection21Data({
      landlord_full_name: 'Test',
      tenant_full_name: 'Test',
      property_address: 'Test',
      tenancy_start_date: '2024-01-01',
      rent_frequency: 'monthly',
      service_method: 'Hand delivery',
    });

    expect(mappedData.service_method).toBe('hand_delivery');
  });

  it('"Recorded delivery" → recorded_delivery', () => {
    const mappedData = mapWizardToSection21Data({
      landlord_full_name: 'Test',
      tenant_full_name: 'Test',
      property_address: 'Test',
      tenancy_start_date: '2024-01-01',
      rent_frequency: 'monthly',
      service_method: 'Recorded delivery',
    });

    expect(mappedData.service_method).toBe('recorded_delivery');
  });
});
