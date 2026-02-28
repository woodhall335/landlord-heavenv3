/**
 * N5B Field Builder Tests
 *
 * Tests for the canonical N5B field mapping layer that handles:
 * - Wizard alias resolution
 * - Boolean parsing (true/false, yes/no, 1/0)
 * - Mandatory field validation
 */

import { describe, test, expect } from 'vitest';
import {
  buildN5BFields,
  parseN5BBoolean,
  validateN5BMandatoryFields,
  checkN5BMandatoryFields,
  mergeN5BFieldsIntoCaseData,
  buildAndValidateN5BFields,
  N5BMissingFieldError,
  N5B_FIELD_LABELS,
} from '../n5b-field-builder';

// =============================================================================
// BOOLEAN PARSING TESTS
// =============================================================================

describe('parseN5BBoolean', () => {
  describe('handles boolean values', () => {
    test('returns true for boolean true', () => {
      expect(parseN5BBoolean(true)).toBe(true);
    });

    test('returns false for boolean false', () => {
      expect(parseN5BBoolean(false)).toBe(false);
    });
  });

  describe('handles string values', () => {
    test('returns true for "true"', () => {
      expect(parseN5BBoolean('true')).toBe(true);
    });

    test('returns true for "TRUE"', () => {
      expect(parseN5BBoolean('TRUE')).toBe(true);
    });

    test('returns true for "True"', () => {
      expect(parseN5BBoolean('True')).toBe(true);
    });

    test('returns true for "yes"', () => {
      expect(parseN5BBoolean('yes')).toBe(true);
    });

    test('returns true for "YES"', () => {
      expect(parseN5BBoolean('YES')).toBe(true);
    });

    test('returns true for "y"', () => {
      expect(parseN5BBoolean('y')).toBe(true);
    });

    test('returns true for "1"', () => {
      expect(parseN5BBoolean('1')).toBe(true);
    });

    test('returns false for "false"', () => {
      expect(parseN5BBoolean('false')).toBe(false);
    });

    test('returns false for "FALSE"', () => {
      expect(parseN5BBoolean('FALSE')).toBe(false);
    });

    test('returns false for "no"', () => {
      expect(parseN5BBoolean('no')).toBe(false);
    });

    test('returns false for "NO"', () => {
      expect(parseN5BBoolean('NO')).toBe(false);
    });

    test('returns false for "n"', () => {
      expect(parseN5BBoolean('n')).toBe(false);
    });

    test('returns false for "0"', () => {
      expect(parseN5BBoolean('0')).toBe(false);
    });

    test('returns undefined for unparseable strings', () => {
      expect(parseN5BBoolean('maybe')).toBeUndefined();
      expect(parseN5BBoolean('unknown')).toBeUndefined();
      expect(parseN5BBoolean('')).toBeUndefined();
    });

    test('handles whitespace', () => {
      expect(parseN5BBoolean('  true  ')).toBe(true);
      expect(parseN5BBoolean('  no  ')).toBe(false);
    });
  });

  describe('handles numeric values', () => {
    test('returns true for number 1', () => {
      expect(parseN5BBoolean(1)).toBe(true);
    });

    test('returns false for number 0', () => {
      expect(parseN5BBoolean(0)).toBe(false);
    });

    test('returns undefined for other numbers', () => {
      expect(parseN5BBoolean(2)).toBeUndefined();
      expect(parseN5BBoolean(-1)).toBeUndefined();
      expect(parseN5BBoolean(0.5)).toBeUndefined();
    });
  });

  describe('handles null and undefined', () => {
    test('returns undefined for null', () => {
      expect(parseN5BBoolean(null)).toBeUndefined();
    });

    test('returns undefined for undefined', () => {
      expect(parseN5BBoolean(undefined)).toBeUndefined();
    });
  });
});

// =============================================================================
// BUILD N5B FIELDS TESTS
// =============================================================================

describe('buildN5BFields', () => {
  describe('Q9a-Q9g: AST Verification', () => {
    test('maps n5b_q9a_after_feb_1997 from canonical key', () => {
      const wizardFacts = {
        n5b_q9a_after_feb_1997: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    });

    test('maps n5b_q9a_after_feb_1997 from alias "tenancy_after_feb_1997"', () => {
      const wizardFacts = {
        tenancy_after_feb_1997: 'yes',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    });

    test('maps n5b_q9b_has_notice_not_ast from canonical key', () => {
      const wizardFacts = {
        n5b_q9b_has_notice_not_ast: false,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
    });

    test('maps n5b_q9b_has_notice_not_ast from alias "notice_not_ast_given"', () => {
      const wizardFacts = {
        notice_not_ast_given: 'no',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
    });

    test('maps all Q9 fields from nested ast_verification path', () => {
      const wizardFacts = {
        ast_verification: {
          after_feb_1997: true,
          notice_not_ast: false,
          exclusion_clause: false,
          agricultural_worker: false,
          succession_tenancy: false,
          secure_tenancy: false,
          schedule_10: false,
        },
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
      expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);
      expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);
      expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);
      expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);
      expect(fields.n5b_q9g_is_schedule_10).toBe(false);
    });

    test('maps Q9 fields from section21.* nested paths', () => {
      const wizardFacts = {
        section21: {
          q9a_after_feb_1997: true,
          q9b_notice_not_ast: false,
        },
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9a_after_feb_1997).toBe(true);
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
    });

    // =========================================================================
    // NEGATIVE→POSITIVE INVERSION TESTS
    // These test the actual wizard MQS field IDs which use NEGATIVE framing
    // =========================================================================

    test('INVERTS n5b_q9b_no_notice_not_ast (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm NO notice was served?" → YES
      // Means: NO notice was served → has_notice_not_ast = false
      const wizardFacts = {
        n5b_q9b_no_notice_not_ast: true,  // User confirmed NO notice
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);  // INVERTED
    });

    test('INVERTS n5b_q9b_no_notice_not_ast (wizard NO → CaseData true)', () => {
      // Wizard: "Confirm NO notice was served?" → NO
      // Means: notice WAS served → has_notice_not_ast = true
      const wizardFacts = {
        n5b_q9b_no_notice_not_ast: false,  // User said NO (notice was served)
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9b_has_notice_not_ast).toBe(true);  // INVERTED
    });

    test('INVERTS n5b_q9c_no_exclusion_clause (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm agreement does NOT contain exclusion clause?" → YES
      // Means: NO exclusion clause → has_exclusion_clause = false
      const wizardFacts = {
        n5b_q9c_no_exclusion_clause: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);  // INVERTED
    });

    test('INVERTS n5b_q9d_not_agricultural_worker (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm tenant is NOT agricultural worker?" → YES
      // Means: tenant is NOT agricultural worker → is_agricultural_worker = false
      const wizardFacts = {
        n5b_q9d_not_agricultural_worker: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);  // INVERTED
    });

    test('INVERTS n5b_q9e_not_succession_tenancy (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm NOT succession tenancy?" → YES
      // Means: NOT succession tenancy → is_succession_tenancy = false
      const wizardFacts = {
        n5b_q9e_not_succession_tenancy: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);  // INVERTED
    });

    test('INVERTS n5b_q9f_not_former_secure (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm NOT formerly secure tenancy?" → YES
      // Means: NOT formerly secure → was_secure_tenancy = false
      const wizardFacts = {
        n5b_q9f_not_former_secure: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);  // INVERTED
    });

    test('INVERTS n5b_q9g_not_schedule_10 (wizard YES → CaseData false)', () => {
      // Wizard: "Confirm NOT Schedule 10 tenancy?" → YES
      // Means: NOT Schedule 10 → is_schedule_10 = false
      const wizardFacts = {
        n5b_q9g_not_schedule_10: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9g_is_schedule_10).toBe(false);  // INVERTED
    });

    test('handles all Q9 negative-framed MQS fields together', () => {
      // This mimics what the actual wizard sends for a compliant landlord
      const wizardFacts = {
        n5b_q9a_after_feb_1997: true,  // Positive framing (direct)
        n5b_q9b_no_notice_not_ast: true,  // Negative framing (invert)
        n5b_q9c_no_exclusion_clause: true,  // Negative framing (invert)
        n5b_q9d_not_agricultural_worker: true,  // Negative framing (invert)
        n5b_q9e_not_succession_tenancy: true,  // Negative framing (invert)
        n5b_q9f_not_former_secure: true,  // Negative framing (invert)
        n5b_q9g_not_schedule_10: true,  // Negative framing (invert)
      };

      const fields = buildN5BFields(wizardFacts);

      // Q9a is positive framing - remains true
      expect(fields.n5b_q9a_after_feb_1997).toBe(true);

      // Q9b-Q9g are negative framing - should all be inverted to false
      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
      expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);
      expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);
      expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);
      expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);
      expect(fields.n5b_q9g_is_schedule_10).toBe(false);
    });

    test('handles string boolean values for negative-framed fields', () => {
      const wizardFacts = {
        n5b_q9b_no_notice_not_ast: 'yes',  // String true
        n5b_q9c_no_exclusion_clause: 'true',  // String true
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);  // INVERTED from 'yes'
      expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);  // INVERTED from 'true'
    });
  });

  describe('Q10a: Notice Service Method', () => {
    test('maps notice_service_method from canonical key', () => {
      const wizardFacts = {
        notice_service_method: 'First class post',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.notice_service_method).toBe('First class post');
    });

    test('maps notice_service_method from alias "service_method"', () => {
      const wizardFacts = {
        service_method: 'By hand',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.notice_service_method).toBe('By hand');
    });

    test('maps notice_service_method from nested notice_service.method', () => {
      const wizardFacts = {
        notice_service: {
          method: 'Recorded delivery',
        },
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.notice_service_method).toBe('Recorded delivery');
    });

    test('trims whitespace from notice_service_method', () => {
      const wizardFacts = {
        notice_service_method: '  First class post  ',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.notice_service_method).toBe('First class post');
    });

    test('ignores empty string for notice_service_method', () => {
      const wizardFacts = {
        notice_service_method: '',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.notice_service_method).toBeUndefined();
    });
  });

  describe('Q15: EPC', () => {
    test('maps epc_provided from canonical key', () => {
      const wizardFacts = {
        epc_provided: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided).toBe(true);
    });

    test('maps epc_provided_date from canonical key', () => {
      const wizardFacts = {
        epc_provided_date: '2024-01-15',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided_date).toBe('2024-01-15');
    });

    test('maps epc_provided from alias "has_epc_provided"', () => {
      const wizardFacts = {
        has_epc_provided: 'yes',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided).toBe(true);
    });

    test('maps epc_provided_date from alias "epc_date"', () => {
      const wizardFacts = {
        epc_date: '2024-02-20',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided_date).toBe('2024-02-20');
    });

    // =========================================================================
    // WIZARD MQS FIELD ALIASES (actual field IDs from england.yaml)
    // =========================================================================

    test('maps epc_provided from wizard MQS field "epc_served"', () => {
      const wizardFacts = {
        epc_served: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided).toBe(true);
    });

    test('maps epc_provided_date from wizard MQS field "epc_certificate_date"', () => {
      const wizardFacts = {
        epc_certificate_date: '2024-05-15',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.epc_provided_date).toBe('2024-05-15');
    });
  });

  describe('Q16-Q17: Gas Safety', () => {
    test('maps has_gas_at_property from canonical key', () => {
      const wizardFacts = {
        has_gas_at_property: false,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.has_gas_at_property).toBe(false);
    });

    test('maps gas_safety_check_date from canonical key', () => {
      const wizardFacts = {
        gas_safety_check_date: '2024-03-01',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_check_date).toBe('2024-03-01');
    });

    test('maps gas_safety_check_date from alias "gas_check_date"', () => {
      const wizardFacts = {
        gas_check_date: '2024-03-15',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_check_date).toBe('2024-03-15');
    });

    test('maps gas_safety_served_date from canonical key', () => {
      const wizardFacts = {
        gas_safety_served_date: '2024-03-02',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_served_date).toBe('2024-03-02');
    });

    test('maps gas_safety_service_dates as array', () => {
      const wizardFacts = {
        gas_safety_service_dates: ['2024-01-01', '2024-06-01', '2025-01-01'],
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_service_dates).toEqual(['2024-01-01', '2024-06-01', '2025-01-01']);
    });

    test('filters out empty strings from gas_safety_service_dates', () => {
      const wizardFacts = {
        gas_safety_service_dates: ['2024-01-01', '', '2024-06-01', '  '],
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_service_dates).toEqual(['2024-01-01', '2024-06-01']);
    });

    // =========================================================================
    // WIZARD MQS FIELD ALIASES (actual field IDs from england.yaml)
    // =========================================================================

    test('maps has_gas_at_property from wizard MQS field "has_gas_appliances"', () => {
      const wizardFacts = {
        has_gas_appliances: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.has_gas_at_property).toBe(true);
    });

    test('maps gas_safety_provided from wizard MQS field "gas_cert_served"', () => {
      const wizardFacts = {
        gas_cert_served: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_provided).toBe(true);
    });

    test('maps gas_safety_check_date from wizard MQS field "gas_cert_date"', () => {
      const wizardFacts = {
        gas_cert_date: '2024-06-20',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.gas_safety_check_date).toBe('2024-06-20');
    });
  });

  describe('Q18: How to Rent', () => {
    test('maps how_to_rent_provided from canonical key', () => {
      const wizardFacts = {
        how_to_rent_provided: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_provided).toBe(true);
    });

    test('maps how_to_rent_date from canonical key', () => {
      const wizardFacts = {
        how_to_rent_date: '2024-04-01',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_date).toBe('2024-04-01');
    });

    test('maps how_to_rent_method "hardcopy"', () => {
      const wizardFacts = {
        how_to_rent_method: 'hardcopy',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_method).toBe('hardcopy');
    });

    test('maps how_to_rent_method "hard copy" to "hardcopy"', () => {
      const wizardFacts = {
        how_to_rent_method: 'hard copy',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_method).toBe('hardcopy');
    });

    test('maps how_to_rent_method "email"', () => {
      const wizardFacts = {
        how_to_rent_method: 'email',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_method).toBe('email');
    });

    // =========================================================================
    // WIZARD MQS FIELD ALIASES (actual field IDs from england.yaml)
    // =========================================================================

    test('maps how_to_rent_provided from wizard MQS field "how_to_rent_served"', () => {
      const wizardFacts = {
        how_to_rent_served: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.how_to_rent_provided).toBe(true);
    });
  });

  describe('Q19: Tenant Fees Act 2019', () => {
    test('maps n5b_q19_has_unreturned_prohibited_payment from canonical key', () => {
      const wizardFacts = {
        n5b_q19_has_unreturned_prohibited_payment: false,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBe(false);
    });

    test('maps n5b_q19_has_unreturned_prohibited_payment from alias "has_unreturned_prohibited_payment"', () => {
      const wizardFacts = {
        has_unreturned_prohibited_payment: 'no',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBe(false);
    });

    test('maps n5b_q19b_holding_deposit from canonical key', () => {
      const wizardFacts = {
        n5b_q19b_holding_deposit: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q19b_holding_deposit).toBe(true);
    });

    test('maps n5b_q19b_holding_deposit from alias "holding_deposit_taken"', () => {
      const wizardFacts = {
        holding_deposit_taken: 'yes',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q19b_holding_deposit).toBe(true);
    });
  });

  describe('Q20: Paper Determination', () => {
    test('maps n5b_q20_paper_determination from canonical key', () => {
      const wizardFacts = {
        n5b_q20_paper_determination: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q20_paper_determination).toBe(true);
    });

    test('maps n5b_q20_paper_determination from alias "paper_determination_consent"', () => {
      const wizardFacts = {
        paper_determination_consent: 'yes',
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q20_paper_determination).toBe(true);
    });

    test('maps n5b_q20_paper_determination from alias "agree_paper_determination"', () => {
      const wizardFacts = {
        agree_paper_determination: true,
      };

      const fields = buildN5BFields(wizardFacts);

      expect(fields.n5b_q20_paper_determination).toBe(true);
    });
  });

  describe('Empty/missing wizard facts', () => {
    test('handles empty wizard facts', () => {
      const fields = buildN5BFields({});

      expect(fields.n5b_q9a_after_feb_1997).toBeUndefined();
      expect(fields.notice_service_method).toBeUndefined();
      expect(fields.epc_provided).toBeUndefined();
    });

    test('handles null values in wizard facts', () => {
      const wizardFacts = {
        n5b_q9a_after_feb_1997: null,
        notice_service_method: null,
      };

      const fields = buildN5BFields(wizardFacts as any);

      expect(fields.n5b_q9a_after_feb_1997).toBeUndefined();
      expect(fields.notice_service_method).toBeUndefined();
    });
  });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

describe('validateN5BMandatoryFields', () => {
  test('throws N5BMissingFieldError when all mandatory fields are missing', () => {
    const fields = buildN5BFields({});

    expect(() => validateN5BMandatoryFields(fields)).toThrow(N5BMissingFieldError);
  });

  test('throws with correct missing field list', () => {
    const fields = buildN5BFields({});

    try {
      validateN5BMandatoryFields(fields);
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(N5BMissingFieldError);
      const err = error as N5BMissingFieldError;
      expect(err.missingFields).toContain('n5b_q9a_after_feb_1997');
      expect(err.missingFields).toContain('n5b_q20_paper_determination');
      expect(err.missingFields).toContain('notice_service_method');
    }
  });

  test('does not throw when all mandatory fields are present', () => {
    const wizardFacts = {
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,
      notice_service_method: 'First class post',
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(wizardFacts);

    expect(() => validateN5BMandatoryFields(fields)).not.toThrow();
  });

  test('throws when notice_service_method is empty string', () => {
    const wizardFacts = {
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,
      notice_service_method: '', // Empty string
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(wizardFacts);

    expect(() => validateN5BMandatoryFields(fields)).toThrow(N5BMissingFieldError);
  });
});

describe('checkN5BMandatoryFields', () => {
  test('returns isValid: false when fields are missing', () => {
    const fields = buildN5BFields({});

    const result = checkN5BMandatoryFields(fields);

    expect(result.isValid).toBe(false);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.missingLabels.length).toBeGreaterThan(0);
  });

  test('returns isValid: true when all mandatory fields are present', () => {
    const wizardFacts = {
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,
      notice_service_method: 'First class post',
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(wizardFacts);
    const result = checkN5BMandatoryFields(fields);

    expect(result.isValid).toBe(true);
    expect(result.missingFields).toEqual([]);
    expect(result.missingLabels).toEqual([]);
  });

  test('returns human-readable labels for missing fields', () => {
    const fields = buildN5BFields({});

    const result = checkN5BMandatoryFields(fields);

    expect(result.missingLabels).toContain(N5B_FIELD_LABELS['n5b_q9a_after_feb_1997']);
    expect(result.missingLabels).toContain(N5B_FIELD_LABELS['notice_service_method']);
  });
});

// =============================================================================
// MERGE TESTS
// =============================================================================

describe('mergeN5BFieldsIntoCaseData', () => {
  test('merges N5B fields into CaseData', () => {
    const caseData = {
      landlord_full_name: 'John Smith',
      tenant_full_name: 'Jane Doe',
    };

    const n5bFields = buildN5BFields({
      n5b_q9a_after_feb_1997: true,
      epc_provided: true,
    });

    const merged = mergeN5BFieldsIntoCaseData(caseData, n5bFields);

    expect(merged.landlord_full_name).toBe('John Smith');
    expect(merged.n5b_q9a_after_feb_1997).toBe(true);
    expect(merged.epc_provided).toBe(true);
  });

  test('does not overwrite existing CaseData values with undefined', () => {
    const caseData = {
      epc_provided: true,
    };

    const n5bFields = buildN5BFields({}); // All undefined

    const merged = mergeN5BFieldsIntoCaseData(caseData, n5bFields);

    expect(merged.epc_provided).toBe(true);
  });
});

// =============================================================================
// BUILD AND VALIDATE TESTS
// =============================================================================

describe('buildAndValidateN5BFields', () => {
  test('throws when mandatory fields are missing and validation is enabled', () => {
    expect(() => buildAndValidateN5BFields({})).toThrow(N5BMissingFieldError);
  });

  test('does not throw when skipValidation is true', () => {
    expect(() => buildAndValidateN5BFields({}, { skipValidation: true })).not.toThrow();
  });

  test('returns fields when all mandatory fields are present', () => {
    const wizardFacts = {
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,
      notice_service_method: 'First class post',
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    };

    const fields = buildAndValidateN5BFields(wizardFacts);

    expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    expect(fields.notice_service_method).toBe('First class post');
  });
});

// =============================================================================
// FIELD LABELS TESTS
// =============================================================================

describe('N5B_FIELD_LABELS', () => {
  test('has labels for all mandatory fields', () => {
    const mandatoryFields = [
      'n5b_q9a_after_feb_1997',
      'n5b_q9b_has_notice_not_ast',
      'n5b_q9c_has_exclusion_clause',
      'n5b_q9d_is_agricultural_worker',
      'n5b_q9e_is_succession_tenancy',
      'n5b_q9f_was_secure_tenancy',
      'n5b_q9g_is_schedule_10',
      'notice_service_method',
      'n5b_q19_has_unreturned_prohibited_payment',
      'n5b_q20_paper_determination',
    ];

    for (const field of mandatoryFields) {
      expect(N5B_FIELD_LABELS[field]).toBeDefined();
      expect(N5B_FIELD_LABELS[field].length).toBeGreaterThan(0);
    }
  });

  test('labels are human-readable', () => {
    expect(N5B_FIELD_LABELS['n5b_q9a_after_feb_1997']).toContain('Q9a');
    expect(N5B_FIELD_LABELS['notice_service_method']).toContain('Q10a');
    expect(N5B_FIELD_LABELS['n5b_q20_paper_determination']).toContain('Q20');
  });
});

// =============================================================================
// INTEGRATION TESTS - Complete Wizard Facts
// =============================================================================

describe('Complete wizard facts integration', () => {
  test('builds all N5B fields from a complete Section 21 wizard payload', () => {
    const wizardFacts = {
      // Basic case info
      landlord_name: 'John Smith',
      tenant_full_name: 'Jane Doe',
      property_address_line1: '123 Test Street',

      // Q9a-Q9g: AST Verification
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,

      // Q10a: Notice service
      notice_service_method: 'First class post',

      // Q15: EPC
      epc_provided: true,
      epc_provided_date: '2024-01-15',

      // Q16-Q17: Gas Safety
      has_gas_at_property: true,
      gas_safety_before_occupation: true,
      gas_safety_before_occupation_date: '2024-01-10',
      gas_safety_check_date: '2024-01-05',
      gas_safety_served_date: '2024-01-10',

      // Q18: How to Rent
      how_to_rent_provided: true,
      how_to_rent_date: '2024-01-15',
      how_to_rent_method: 'email',

      // Q19: Tenant Fees Act
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q19b_holding_deposit: true,

      // Q20: Paper Determination
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(wizardFacts);

    // Verify all fields are set correctly
    expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
    expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);
    expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);
    expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);
    expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);
    expect(fields.n5b_q9g_is_schedule_10).toBe(false);
    expect(fields.notice_service_method).toBe('First class post');
    expect(fields.epc_provided).toBe(true);
    expect(fields.epc_provided_date).toBe('2024-01-15');
    expect(fields.has_gas_at_property).toBe(true);
    expect(fields.gas_safety_check_date).toBe('2024-01-05');
    expect(fields.gas_safety_served_date).toBe('2024-01-10');
    expect(fields.how_to_rent_provided).toBe(true);
    expect(fields.how_to_rent_date).toBe('2024-01-15');
    expect(fields.how_to_rent_method).toBe('email');
    expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBe(false);
    expect(fields.n5b_q19b_holding_deposit).toBe(true);
    expect(fields.n5b_q20_paper_determination).toBe(true);
  });

  test('validation passes for complete wizard payload', () => {
    const wizardFacts = {
      n5b_q9a_after_feb_1997: 'yes',
      n5b_q9b_has_notice_not_ast: 'no',
      n5b_q9c_has_exclusion_clause: 'no',
      n5b_q9d_is_agricultural_worker: 'no',
      n5b_q9e_is_succession_tenancy: 'no',
      n5b_q9f_was_secure_tenancy: 'no',
      n5b_q9g_is_schedule_10: 'no',
      notice_service_method: 'First class post',
      n5b_q19_has_unreturned_prohibited_payment: 'no',
      n5b_q20_paper_determination: 'yes',
    };

    const fields = buildN5BFields(wizardFacts);
    const validation = checkN5BMandatoryFields(fields);

    expect(validation.isValid).toBe(true);
  });

  // =============================================================================
  // REACT COMPONENT WIZARD SIMULATION
  // =============================================================================
  // This test simulates the exact field names used by the React wizard components:
  // - Section21ComplianceSection.tsx (Q9a-Q9g, Q15-Q18, Q19-Q20)
  // - EvictionSectionFlow.tsx and NoticeOnlySectionFlow.tsx (compliance fields)

  test('maps all fields from actual React wizard component field names', () => {
    // This is the exact payload a user would generate by filling out the wizard
    const reactWizardFacts = {
      // Q9a-Q9g: AST Verification (from Section21ComplianceSection.tsx)
      // NOTE: React component stores Q9a as positive, Q9b-Q9g as positive with inversion in onChange
      n5b_q9a_after_feb_1997: true,         // User clicked Yes
      n5b_q9b_has_notice_not_ast: false,    // User clicked Yes to "was NO notice served?" -> stored as !true = false
      n5b_q9c_has_exclusion_clause: false,  // User clicked Yes to "does NOT state" -> stored as !true = false
      n5b_q9d_is_agricultural_worker: false, // User clicked Yes to "is NOT agricultural" -> stored as !true = false
      n5b_q9e_is_succession_tenancy: false,  // User clicked Yes to "did NOT arise by succession" -> stored as !true = false
      n5b_q9f_was_secure_tenancy: false,    // User clicked Yes to "was NOT secure" -> stored as !true = false
      n5b_q9g_is_schedule_10: false,        // User clicked Yes to "was NOT Schedule 10" -> stored as !true = false

      // Q10a: Notice service method
      notice_service_method: 'First class post',

      // Q15: EPC (from Section21ComplianceSection.tsx)
      epc_served: true,                     // User clicked Yes
      epc_provided_date: '2024-01-15',

      // Q16-Q17: Gas Safety (from Section21ComplianceSection.tsx)
      has_gas_appliances: true,             // User clicked Yes
      gas_safety_cert_served: true,         // User clicked Yes
      gas_safety_before_occupation: true,
      gas_safety_before_occupation_date: '2024-01-01',
      gas_safety_check_date: '2024-01-01',
      gas_safety_served_date: '2024-01-05',

      // Q18: How to Rent (from Section21ComplianceSection.tsx)
      how_to_rent_served: true,             // User clicked Yes
      how_to_rent_date: '2024-01-15',
      how_to_rent_method: 'email',

      // Q19: Tenant Fees Act (from Section21ComplianceSection.tsx)
      n5b_q19_has_unreturned_prohibited_payment: false, // User clicked Yes to "all repaid" -> stored as !true = false
      n5b_q19b_holding_deposit: false,

      // Q20: Paper Determination (from Section21ComplianceSection.tsx)
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(reactWizardFacts);

    // Verify Q9a-Q9g
    expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);
    expect(fields.n5b_q9c_has_exclusion_clause).toBe(false);
    expect(fields.n5b_q9d_is_agricultural_worker).toBe(false);
    expect(fields.n5b_q9e_is_succession_tenancy).toBe(false);
    expect(fields.n5b_q9f_was_secure_tenancy).toBe(false);
    expect(fields.n5b_q9g_is_schedule_10).toBe(false);

    // Verify Q10a
    expect(fields.notice_service_method).toBe('First class post');

    // Verify Q15: EPC
    expect(fields.epc_provided).toBe(true);
    expect(fields.epc_provided_date).toBe('2024-01-15');

    // Verify Q16-Q17: Gas Safety
    expect(fields.has_gas_at_property).toBe(true);
    expect(fields.gas_safety_provided).toBe(true);
    expect(fields.gas_safety_before_occupation).toBe(true);
    expect(fields.gas_safety_before_occupation_date).toBe('2024-01-01');
    expect(fields.gas_safety_check_date).toBe('2024-01-01');
    expect(fields.gas_safety_served_date).toBe('2024-01-05');

    // Verify Q18: How to Rent
    expect(fields.how_to_rent_provided).toBe(true);
    expect(fields.how_to_rent_date).toBe('2024-01-15');
    expect(fields.how_to_rent_method).toBe('email');

    // Verify Q19: Tenant Fees Act
    expect(fields.n5b_q19_has_unreturned_prohibited_payment).toBe(false);
    expect(fields.n5b_q19b_holding_deposit).toBe(false);

    // Verify Q20: Paper Determination
    expect(fields.n5b_q20_paper_determination).toBe(true);

    // Verify validation passes
    const validation = checkN5BMandatoryFields(fields);
    expect(validation.isValid).toBe(true);
  });

  test('maps all fields from MQS nested section21.* paths', () => {
    // This simulates how MQS YAML stores data under section21.* nested paths
    // via the maps_to directive
    const mqsNestedFacts = {
      section21: {
        epc_served: true,
        epc_certificate_date: '2024-01-15',
        how_to_rent_served: true,
        how_to_rent_date: '2024-01-10',
        gas_safety_cert_served: true,
        gas_cert_date: '2024-01-01',
      },
      has_gas_appliances: true,
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_has_notice_not_ast: false,
      n5b_q9c_has_exclusion_clause: false,
      n5b_q9d_is_agricultural_worker: false,
      n5b_q9e_is_succession_tenancy: false,
      n5b_q9f_was_secure_tenancy: false,
      n5b_q9g_is_schedule_10: false,
      notice_service_method: 'First class post',
      n5b_q19_has_unreturned_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    };

    const fields = buildN5BFields(mqsNestedFacts);

    // Verify nested paths are resolved correctly
    expect(fields.epc_provided).toBe(true);
    expect(fields.epc_provided_date).toBe('2024-01-15');
    expect(fields.how_to_rent_provided).toBe(true);
    expect(fields.how_to_rent_date).toBe('2024-01-10');
    expect(fields.gas_safety_provided).toBe(true);
    expect(fields.gas_safety_check_date).toBe('2024-01-01');
    expect(fields.has_gas_at_property).toBe(true);

    // Verify Q9 fields still work
    expect(fields.n5b_q9a_after_feb_1997).toBe(true);
    expect(fields.n5b_q9b_has_notice_not_ast).toBe(false);

    // Verify validation passes
    const validation = checkN5BMandatoryFields(fields);
    expect(validation.isValid).toBe(true);
  });
});
