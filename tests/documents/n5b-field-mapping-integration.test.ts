/**
 * N5B Field Mapping Integration Tests
 *
 * Integration tests that verify N5B fields are correctly mapped from wizard facts
 * through the eviction-wizard-mapper and into CaseData for N5B form filling.
 *
 * These tests do NOT generate actual PDFs but verify the data pipeline.
 */

import { describe, test, expect } from 'vitest';
import {
  buildN5BFields,
  checkN5BMandatoryFields,
} from '@/lib/documents/n5b-field-builder';
import type { WizardFacts } from '@/lib/case-facts/schema';

// =============================================================================
// TEST DATA
// =============================================================================

/**
 * Creates a complete Section 21 wizard facts object with all required fields.
 * This represents what a user would fill in via the wizard.
 */
function createCompleteSection21WizardFacts(
  overrides: Partial<WizardFacts> = {}
): WizardFacts {
  return {
    // Basic case metadata
    __meta: {
      product: 'eviction',
      original_product: 'eviction/england-wales',
      product_tier: 'complete_pack',
      jurisdiction: 'england',
    },

    // Eviction route - required for wizardFactsToEnglandWalesEviction
    eviction_route: 'no_fault',  // Section 21 = no_fault route

    // Property
    property_address_line1: '123 Test Street',
    property_address_line2: 'Flat 4B',
    property_city: 'London',
    property_postcode: 'SW1A 1AA',
    property_country: 'england',

    // Landlord
    landlord_name: 'John Smith',
    landlord_email: 'john.smith@example.com',
    landlord_phone: '020 1234 5678',
    landlord_address_line1: '456 Landlord Road',
    landlord_city: 'Manchester',
    landlord_postcode: 'M1 1AA',

    // Tenant
    'tenants.0.full_name': 'Jane Doe',
    'tenants.0.email': 'jane.doe@example.com',

    // Tenancy
    tenancy_type: 'ast',
    tenancy_start_date: '2023-01-15',
    rent_amount: 1500,
    rent_frequency: 'monthly',

    // Deposit
    deposit_amount: 1500,
    deposit_protected: true,
    deposit_scheme_name: 'DPS',
    deposit_protection_date: '2023-01-20',

    // Notice service
    notice_service_method: 'First class post',
    notice_service_date: '2024-06-01',
    notice_expiry_date: '2024-08-01',

    // Q9a-Q9g: AST Verification (all required for N5B)
    n5b_q9a_after_feb_1997: true,
    n5b_q9b_has_notice_not_ast: false,
    n5b_q9c_has_exclusion_clause: false,
    n5b_q9d_is_agricultural_worker: false,
    n5b_q9e_is_succession_tenancy: false,
    n5b_q9f_was_secure_tenancy: false,
    n5b_q9g_is_schedule_10: false,

    // Q15: EPC
    epc_provided: true,
    epc_provided_date: '2023-01-15',

    // Q16-Q17: Gas Safety
    has_gas_at_property: true,
    gas_safety_before_occupation: true,
    gas_safety_before_occupation_date: '2023-01-10',
    gas_safety_check_date: '2023-01-05',
    gas_safety_served_date: '2023-01-10',

    // Q18: How to Rent
    how_to_rent_provided: true,
    how_to_rent_date: '2023-01-15',
    how_to_rent_method: 'email',

    // Q19: Tenant Fees Act
    n5b_q19_has_unreturned_prohibited_payment: false,
    n5b_q19b_holding_deposit: true,

    // Q20: Paper Determination
    n5b_q20_paper_determination: true,

    // Court
    court_name: 'Central London County Court',

    ...overrides,
  } as WizardFacts;
}

// =============================================================================
// INTEGRATION TESTS: Wizard Facts → CaseData Pipeline
// =============================================================================

describe('N5B Field Mapping Integration', () => {
  describe('buildN5BFields with complete wizard facts', () => {
    test('maps all Q9a-Q9g fields correctly', () => {
      const wizardFacts = createCompleteSection21WizardFacts();

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
      expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);
      expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);
      expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);
      expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);
      expect(fields.n5b_q9g_is_schedule_10).toBe(false);
    });

    test('maps Q15-Q18 compliance fields correctly', () => {
      const wizardFacts = createCompleteSection21WizardFacts();

      const fields = buildN5BFields(wizardFacts);

      // Q15: EPC
      expect(fields.epc_provided).toBe(true);
      expect(fields.epc_provided_date).toBe('2023-01-15');

      // Q16-Q17: Gas Safety
      expect(fields.has_gas_at_property).toBe(true);
      expect(fields.gas_safety_check_date).toBe('2023-01-05');
      expect(fields.gas_safety_served_date).toBe('2023-01-10');

      // Q18: How to Rent
      expect(fields.how_to_rent_provided).toBe(true);
      expect(fields.how_to_rent_date).toBe('2023-01-15');
      expect(fields.how_to_rent_method).toBe('email');
    });

    test('maps Q19 and Q20 fields correctly', () => {
      const wizardFacts = createCompleteSection21WizardFacts();

      const fields = buildN5BFields(wizardFacts);

      // Q19: Tenant Fees Act
      expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBe(false);
      expect(fields.n5b_q19b_holding_deposit).toBe(true);

      // Q20: Paper Determination
      expect(fields.n5b_q20_paper_determination).toBe(true);
    });

    test('handles string boolean values ("yes"/"no")', () => {
      const wizardFacts = createCompleteSection21WizardFacts({
        n5b_q9a_after_feb_1997: 'yes' as any,
        n5b_q9b_has_notice_not_ast: 'no' as any,
        epc_provided: 'yes' as any,
        n5b_q20_paper_determination: 'yes' as any,
      });

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
      expect(fields.epc_provided).toBe(true);
      expect(fields.n5b_q20_paper_determination).toBe(true);
    });

    test('handles numeric boolean values (1/0)', () => {
      const wizardFacts = createCompleteSection21WizardFacts({
        n5b_q9a_after_feb_1997: 1 as any,
        n5b_q9b_has_notice_not_ast: 0 as any,
        epc_provided: 1 as any,
      });

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
      expect(fields.epc_provided).toBe(true);
    });

    test('preserves undefined for unanswered questions', () => {
      const wizardFacts = createCompleteSection21WizardFacts({
        // Remove some optional fields
        epc_provided_date: undefined,
        gas_safety_before_occupation_date: undefined,
        how_to_rent_date: undefined,
      });

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided_date).toBeUndefined();
      expect(fields.gas_safety_before_occupation_date).toBeUndefined();
      expect(fields.how_to_rent_date).toBeUndefined();
    });
  });

  describe('Alias resolution through eviction-wizard-mapper', () => {
    test('resolves Q9 fields from ast_verification.* nested paths', () => {
      const wizardFacts: WizardFacts = {
        ...createCompleteSection21WizardFacts(),
        // Remove canonical keys and use nested paths
        n5b_q9a_after_feb_1997: undefined as any,
        n5b_q9b_has_notice_not_ast: undefined as any,
        ast_verification: {
          after_feb_1997: true,
          notice_not_ast: false,
        },
      };

      const n5bFields = buildN5BFields(wizardFacts);

      expect(n5bFields.n5b_q9a_after_feb_1997).toBe(true);
      expect(n5bFields.n5b_q9b_has_notice_not_ast).toBe(false);
    });

    test('resolves notice_service_method from notice_service.method', () => {
      const wizardFacts: WizardFacts = {
        ...createCompleteSection21WizardFacts(),
        notice_service_method: undefined as any,
        notice_service: {
          method: 'Recorded delivery',
        },
      };

      const n5bFields = buildN5BFields(wizardFacts);

      expect(n5bFields.notice_service_method).toBe('Recorded delivery');
    });

    test('resolves gas fields from compliance.* nested paths', () => {
      const wizardFacts: WizardFacts = {
        ...createCompleteSection21WizardFacts(),
        gas_safety_check_date: undefined as any,
        compliance: {
          gas_check_date: '2024-01-15',
        },
      };

      const n5bFields = buildN5BFields(wizardFacts);

      expect(n5bFields.gas_safety_check_date).toBe('2024-01-15');
    });
  });
});

// =============================================================================
// VALIDATION INTEGRATION TESTS
// =============================================================================

describe('N5B Validation Integration', () => {
  test('complete wizard facts pass validation', () => {
    const wizardFacts = createCompleteSection21WizardFacts();

    const n5bFields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(n5bFields);

    expect(validation.isValid).toBe(true);
    expect(validation.missingFields).toEqual([]);
  });

  test('missing Q9a field fails validation', () => {
    const wizardFacts = createCompleteSection21WizardFacts({
      n5b_q9a_after_feb_1997: undefined as any,
    });

    const n5bFields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(n5bFields);

    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('n5b_q9a_after_feb_1997');
  });

  test('missing notice_service_method fails validation', () => {
    const wizardFacts = createCompleteSection21WizardFacts({
      notice_service_method: undefined as any,
    });

    const n5bFields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(n5bFields);

    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('notice_service_method');
  });

  test('missing Q19 field returns undefined from builder (defaults applied in mapper)', () => {
    const wizardFacts = createCompleteSection21WizardFacts({
      // Remove Q19 field
      n5b_q19_has_unreturned_prohibited_payment: undefined as any,
    });

    const fields = buildN5BFields(wizardFacts);

    // Builder returns undefined - defaults are applied in the mapper layer
    expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBeUndefined();
  });

  test('missing Q20 field fails validation', () => {
    const wizardFacts = createCompleteSection21WizardFacts({
      n5b_q20_paper_determination: undefined as any,
    });

    const n5bFields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(n5bFields);

    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('n5b_q20_paper_determination');
  });

  test('N5BMissingFieldError contains user-friendly labels', () => {
    const wizardFacts = createCompleteSection21WizardFacts({
      n5b_q9a_after_feb_1997: undefined as any,
      notice_service_method: undefined as any,
    });

    const n5bFields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(n5bFields);

    expect(validation.missingLabels.some(l => l.includes('Q9a'))).toBe(true);
    expect(validation.missingLabels.some(l => l.includes('Q10a'))).toBe(true);
  });
});

// =============================================================================
// FIELD MAPPING DOCUMENTATION TESTS
// =============================================================================

describe('Field Mapping Documentation', () => {
  /**
   * This test documents the complete mapping from wizard keys to CaseData keys
   * for N5B fields. If this test fails, the mapping documentation may be outdated.
   */
  test('documents boolean wizard key → CaseData key mappings', () => {
    // This is a documentation test - it verifies that certain wizard keys
    // map to specific CaseData keys as documented.
    const booleanMappings = [
      // Q9a-Q9g: AST Verification
      { wizardKey: 'n5b_q9a_after_feb_1997', caseDataKey: 'n5b_q9a_after_feb_1997' },
      { wizardKey: 'tenancy_after_feb_1997', caseDataKey: 'n5b_q9a_after_feb_1997' },
      { wizardKey: 'n5b_q9b_has_notice_not_ast', caseDataKey: 'n5b_q9b_has_notice_not_ast' },
      { wizardKey: 'notice_not_ast_given', caseDataKey: 'n5b_q9b_has_notice_not_ast' },
      { wizardKey: 'n5b_q9c_has_exclusion_clause', caseDataKey: 'n5b_q9c_has_exclusion_clause' },
      { wizardKey: 'has_exclusion_clause', caseDataKey: 'n5b_q9c_has_exclusion_clause' },
      { wizardKey: 'n5b_q9d_is_agricultural_worker', caseDataKey: 'n5b_q9d_is_agricultural_worker' },
      { wizardKey: 'is_agricultural_worker', caseDataKey: 'n5b_q9d_is_agricultural_worker' },
      { wizardKey: 'n5b_q9e_is_succession_tenancy', caseDataKey: 'n5b_q9e_is_succession_tenancy' },
      { wizardKey: 'is_succession_tenancy', caseDataKey: 'n5b_q9e_is_succession_tenancy' },
      { wizardKey: 'n5b_q9f_was_secure_tenancy', caseDataKey: 'n5b_q9f_was_secure_tenancy' },
      { wizardKey: 'was_secure_tenancy', caseDataKey: 'n5b_q9f_was_secure_tenancy' },
      { wizardKey: 'n5b_q9g_is_schedule_10', caseDataKey: 'n5b_q9g_is_schedule_10' },
      { wizardKey: 'is_schedule_10', caseDataKey: 'n5b_q9g_is_schedule_10' },

      // Q15: EPC (boolean)
      { wizardKey: 'epc_provided', caseDataKey: 'epc_provided' },

      // Q16-Q17: Gas Safety (booleans)
      { wizardKey: 'has_gas_at_property', caseDataKey: 'has_gas_at_property' },

      // Q18: How to Rent (boolean)
      { wizardKey: 'how_to_rent_provided', caseDataKey: 'how_to_rent_provided' },

      // Q19: Tenant Fees Act (booleans)
      { wizardKey: 'n5b_q19_has_unreturned_prohibited_payment', caseDataKey: 'n5b_q19_has_unreturned_prohibited_payment' },
      { wizardKey: 'has_unreturned_prohibited_payment', caseDataKey: 'n5b_q19_has_unreturned_prohibited_payment' },
      { wizardKey: 'n5b_q19b_holding_deposit', caseDataKey: 'n5b_q19b_holding_deposit' },
      { wizardKey: 'holding_deposit_taken', caseDataKey: 'n5b_q19b_holding_deposit' },

      // Q20: Paper Determination (boolean)
      { wizardKey: 'n5b_q20_paper_determination', caseDataKey: 'n5b_q20_paper_determination' },
      { wizardKey: 'paper_determination_consent', caseDataKey: 'n5b_q20_paper_determination' },
    ];

    // Verify each boolean mapping works
    for (const { wizardKey, caseDataKey } of booleanMappings) {
      const wizardFacts: Record<string, unknown> = {
        [wizardKey]: true,
      };

      const fields = buildN5BFields(wizardFacts);
      expect(
        (fields as Record<string, unknown>)[caseDataKey],
        `Expected boolean ${wizardKey} → ${caseDataKey} to map correctly`
      ).toBe(true);
    }
  });

  test('documents string wizard key → CaseData key mappings', () => {
    const stringMappings = [
      // Q10a: Notice Service Method (string)
      { wizardKey: 'notice_service_method', caseDataKey: 'notice_service_method', value: 'First class post' },
      { wizardKey: 'service_method', caseDataKey: 'notice_service_method', value: 'By hand' },

      // Q15: EPC date (string)
      { wizardKey: 'epc_provided_date', caseDataKey: 'epc_provided_date', value: '2024-01-15' },
      { wizardKey: 'epc_date', caseDataKey: 'epc_provided_date', value: '2024-02-20' },

      // Q16-Q17: Gas Safety dates (strings)
      { wizardKey: 'gas_safety_check_date', caseDataKey: 'gas_safety_check_date', value: '2024-03-01' },
      { wizardKey: 'gas_check_date', caseDataKey: 'gas_safety_check_date', value: '2024-03-15' },
      { wizardKey: 'gas_safety_served_date', caseDataKey: 'gas_safety_served_date', value: '2024-03-02' },

      // Q18: How to Rent date and method (strings)
      { wizardKey: 'how_to_rent_date', caseDataKey: 'how_to_rent_date', value: '2024-04-01' },
      { wizardKey: 'how_to_rent_method', caseDataKey: 'how_to_rent_method', value: 'email' },
    ];

    // Verify each string mapping works
    for (const { wizardKey, caseDataKey, value } of stringMappings) {
      const wizardFacts: Record<string, unknown> = {
        [wizardKey]: value,
      };

      const fields = buildN5BFields(wizardFacts);
      expect(
        (fields as Record<string, unknown>)[caseDataKey],
        `Expected string ${wizardKey} → ${caseDataKey} to map correctly`
      ).toBe(value);
    }
  });
});
