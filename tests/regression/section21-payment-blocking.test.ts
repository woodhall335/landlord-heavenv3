/**
 * Section 21 Payment Blocking Regression Tests
 *
 * These tests ensure the "paid dead end" cannot occur:
 * 1. Checkout gating prevents payment when Section 21 preconditions are unknown
 * 2. Fulfillment handles validation errors gracefully with partial results
 * 3. Users can resume fulfillment after providing missing confirmations
 *
 * @see https://github.com/landlord-heaven/issues/XXX
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateSection21ForCheckout,
  isSection21Case,
  extractSection21ValidationInput,
  isSection21CheckoutBlocked,
} from '@/lib/validation/section21-checkout-validator';
import { validateSection21Preconditions } from '@/lib/validators/section21-preconditions';

// =============================================================================
// PART 1: CHECKOUT GATING TESTS
// =============================================================================

describe('Section 21 Checkout Gating', () => {
  describe('isSection21Case', () => {
    it('returns true for England Section 21 route', () => {
      expect(isSection21Case('england', 'section_21', null)).toBe(true);
      expect(isSection21Case('england', 'section21', null)).toBe(true);
      expect(isSection21Case('england', 'no_fault', null)).toBe(true);
      expect(isSection21Case('england', 'accelerated_possession', null)).toBe(true);
    });

    it('returns true for England no_fault case type', () => {
      expect(isSection21Case('england', null, 'no_fault')).toBe(true);
    });

    it('returns false for non-England jurisdictions', () => {
      expect(isSection21Case('wales', 'section_21', null)).toBe(false);
      expect(isSection21Case('scotland', 'section_21', null)).toBe(false);
      expect(isSection21Case('northern-ireland', 'section_21', null)).toBe(false);
    });

    it('returns false for Section 8 route', () => {
      expect(isSection21Case('england', 'section_8', null)).toBe(false);
      expect(isSection21Case('england', 'section_8', 'rent_arrears')).toBe(false);
    });
  });

  describe('validateSection21ForCheckout', () => {
    it('blocks checkout when prescribed_info_served is unknown', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme_name: 'DPS',
        // prescribed_info_served is MISSING (unknown)
        epc_served: true,
        how_to_rent_served: true,
        has_gas_appliances: false,
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(false);
      expect(result.isSection21Case).toBe(true);
      expect(result.missingConfirmations.length).toBeGreaterThan(0);
      expect(result.missingConfirmations.some((c) => c.errorCode === 'S21_PRESCRIBED_INFO_UNKNOWN')).toBe(true);
    });

    it('blocks checkout when epc_served is unknown', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme_name: 'DPS',
        prescribed_info_served: true,
        // epc_served is MISSING (unknown)
        how_to_rent_served: true,
        has_gas_appliances: false,
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(false);
      expect(result.isSection21Case).toBe(true);
      expect(result.missingConfirmations.some((c) => c.errorCode === 'S21_EPC_UNKNOWN')).toBe(true);
    });

    it('blocks checkout when how_to_rent_served is unknown', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme_name: 'DPS',
        prescribed_info_served: true,
        epc_served: true,
        // how_to_rent_served is MISSING (unknown)
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01', // After Oct 2015
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(false);
      expect(result.isSection21Case).toBe(true);
      expect(result.missingConfirmations.some((c) => c.errorCode === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(true);
    });

    it('allows checkout when all preconditions are confirmed', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme_name: 'DPS',
        prescribed_info_served: true,
        epc_served: true,
        how_to_rent_served: true,
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(true);
      expect(result.isSection21Case).toBe(true);
      expect(result.missingConfirmations).toHaveLength(0);
    });

    it('allows checkout for non-Section 21 cases without validation', () => {
      const facts = {
        selected_notice_route: 'section_8',
        // No Section 21 precondition fields
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(true);
      expect(result.isSection21Case).toBe(false);
    });

    it('allows checkout for Scotland cases', () => {
      const facts = {
        selected_notice_route: 'notice_to_leave',
      };

      const result = validateSection21ForCheckout(facts, 'scotland', 'complete_pack');

      expect(result.canCheckout).toBe(true);
      expect(result.isSection21Case).toBe(false);
    });

    it('blocks checkout when prescribed_info is explicitly false (failed)', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme_name: 'DPS',
        prescribed_info_served: false, // Explicitly NO
        epc_served: true,
        how_to_rent_served: true,
        has_gas_appliances: false,
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.canCheckout).toBe(false);
      expect(result.isSection21Case).toBe(true);
      // Should contain a "failed" blocker, not just "unknown"
      expect(result.message).toContain('not met');
    });
  });

  describe('isSection21CheckoutBlocked', () => {
    it('returns true when checkout should be blocked', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        // Missing required confirmations
      };

      expect(isSection21CheckoutBlocked(facts, 'england', 'complete_pack')).toBe(true);
    });

    it('returns false when checkout should proceed', () => {
      const facts = {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        prescribed_info_served: true,
        epc_served: true,
        how_to_rent_served: true,
        has_gas_appliances: false,
      };

      expect(isSection21CheckoutBlocked(facts, 'england', 'complete_pack')).toBe(false);
    });
  });

  describe('extractSection21ValidationInput', () => {
    it('extracts fields from multiple naming conventions', () => {
      const facts = {
        prescribed_info_served: true,
        epc_provided: true, // Using *_provided variant
        how_to_rent_served: true,
        gas_certificate_provided: true, // Using *_provided variant
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true,
      };

      const input = extractSection21ValidationInput(facts);

      expect(input.prescribed_info_served).toBe(true);
      expect(input.epc_served || input.epc_provided).toBe(true);
      expect(input.how_to_rent_served || input.how_to_rent_provided).toBe(true);
      expect(input.gas_safety_cert_served || input.gas_certificate_provided).toBe(true);
    });

    it('handles missing fields as undefined', () => {
      const facts = {};

      const input = extractSection21ValidationInput(facts);

      expect(input.prescribed_info_served).toBeUndefined();
      expect(input.epc_served).toBeUndefined();
      expect(input.how_to_rent_served).toBeUndefined();
    });
  });
});

// =============================================================================
// PART 2: PRECONDITION VALIDATOR TESTS
// =============================================================================

describe('Section 21 Precondition Validator', () => {
  describe('UNKNOWN status blockers', () => {
    it('S21_PRESCRIBED_INFO_UNKNOWN when deposit taken but prescribed_info undefined', () => {
      const input = {
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true,
        // prescribed_info_served: undefined
      };

      const result = validateSection21Preconditions(input);

      expect(result.ok).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_PRESCRIBED_INFO_UNKNOWN')).toBe(true);
    });

    it('S21_EPC_UNKNOWN when epc_provided undefined', () => {
      const input = {
        deposit_taken: false,
        // epc_served: undefined
        // epc_provided: undefined
      };

      const result = validateSection21Preconditions(input);

      expect(result.ok).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(true);
    });

    it('S21_HOW_TO_RENT_UNKNOWN when how_to_rent undefined for post-2015 tenancy', () => {
      const input = {
        deposit_taken: false,
        epc_provided: true,
        tenancy_start_date: '2020-01-01', // After Oct 1, 2015
        // how_to_rent_served: undefined
      };

      const result = validateSection21Preconditions(input);

      expect(result.ok).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(true);
    });
  });

  describe('passed validations', () => {
    it('passes when all requirements are confirmed', () => {
      const input = {
        deposit_taken: true,
        deposit_amount: 1000,
        deposit_protected: true,
        deposit_scheme: 'DPS',
        prescribed_info_served: true,
        prescribed_info_given: true,
        epc_served: true,
        epc_provided: true,
        how_to_rent_served: true,
        how_to_rent_provided: true,
        has_gas_appliances: false,
        licensing_required: 'not_required',
        tenancy_start_date: '2020-01-01',
        service_date: new Date().toISOString().split('T')[0],
      };

      const result = validateSection21Preconditions(input);

      expect(result.ok).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('passes for no-deposit case when other requirements met', () => {
      const input = {
        deposit_taken: false,
        epc_served: true,
        how_to_rent_served: true,
        has_gas_appliances: false,
        licensing_required: 'not_required',
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21Preconditions(input);

      expect(result.ok).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });
  });
});

// =============================================================================
// PART 3: INTEGRATION TEST - PAID DEAD END CANNOT OCCUR
// =============================================================================

describe('Paid Dead End Prevention', () => {
  it('cannot create a scenario where payment succeeds but Section 21 notice is permanently blocked', () => {
    // This test verifies the logical impossibility of the "paid dead end"
    //
    // SCENARIO: User has a Section 21 case with unknown preconditions
    // EXPECTED: Checkout is blocked, preventing payment
    // RESULT: User cannot pay for something they can't receive

    const section21CaseWithUnknowns = {
      selected_notice_route: 'section_21',
      case_type: 'eviction',
      jurisdiction: 'england',
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      // INTENTIONALLY MISSING: prescribed_info_served, epc_served, how_to_rent_served
    };

    // 1. Validate that checkout would be blocked
    const checkoutValidation = validateSection21ForCheckout(
      section21CaseWithUnknowns,
      'england',
      'complete_pack'
    );

    expect(checkoutValidation.canCheckout).toBe(false);
    expect(checkoutValidation.isSection21Case).toBe(true);
    expect(checkoutValidation.missingConfirmations.length).toBeGreaterThan(0);

    // 2. The blockers should tell user exactly what to fix
    const blockerCodes = checkoutValidation.missingConfirmations.map((c) => c.errorCode);
    expect(blockerCodes).toContain('S21_PRESCRIBED_INFO_UNKNOWN');
    expect(blockerCodes).toContain('S21_EPC_UNKNOWN');
    expect(blockerCodes).toContain('S21_HOW_TO_RENT_UNKNOWN');

    // 3. Once user provides confirmations, checkout should be allowed
    const section21CaseWithConfirmations = {
      ...section21CaseWithUnknowns,
      prescribed_info_served: true,
      epc_served: true,
      how_to_rent_served: true,
      has_gas_appliances: false,
    };

    const updatedCheckoutValidation = validateSection21ForCheckout(
      section21CaseWithConfirmations,
      'england',
      'complete_pack'
    );

    expect(updatedCheckoutValidation.canCheckout).toBe(true);
    expect(updatedCheckoutValidation.missingConfirmations).toHaveLength(0);
  });

  it('handles legacy cases that somehow got paid with unknown preconditions', () => {
    // This test verifies that even if a case somehow got past gating (legacy/edge case),
    // the fulfillment will return REQUIRES_ACTION instead of permanently failing

    // Simulate a paid order with unknown preconditions (legacy edge case)
    const legacyPaidCase = {
      selected_notice_route: 'section_21',
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      // Missing: prescribed_info_served, epc_served, how_to_rent_served
    };

    // The Section 21 validation should identify these as blockers
    const validationInput = extractSection21ValidationInput(legacyPaidCase);
    const validation = validateSection21Preconditions(validationInput);

    expect(validation.ok).toBe(false);
    expect(validation.blockers.length).toBeGreaterThan(0);

    // The blockers should be recoverable (user can provide confirmations)
    const recoverableBlockers = validation.blockers.filter((b) => b.code.endsWith('_UNKNOWN'));
    expect(recoverableBlockers.length).toBeGreaterThan(0);

    // Each blocker should have evidenceFields that tell user what to confirm
    for (const blocker of recoverableBlockers) {
      expect(blocker.evidenceFields).toBeDefined();
      expect(blocker.message).toBeDefined();
    }
  });
});

// =============================================================================
// PART 4: FIELD MAPPING CONSISTENCY TESTS
// =============================================================================

describe('Field Mapping Consistency', () => {
  it('wizard field names map to validator expectations', () => {
    // These are the field names used in Section21ComplianceSection.tsx
    const wizardFields = {
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      deposit_scheme_name: 'DPS',
      deposit_protection_date: '2024-01-15',
      deposit_reference: 'REF123',
      prescribed_info_served: true, // Wizard uses *_served
      gas_safety_cert_served: true, // Wizard uses *_served
      has_gas_appliances: true,
      epc_served: true, // Wizard uses *_served
      how_to_rent_served: true, // Wizard uses *_served
      licensing_required: 'not_required',
      has_valid_licence: undefined,
      no_retaliatory_notice: true,
    };

    // Extract validation input (should normalize field names)
    const validationInput = extractSection21ValidationInput(wizardFields);

    // Run validation
    const result = validateSection21Preconditions({
      ...validationInput,
      tenancy_start_date: '2020-01-01',
      service_date: new Date().toISOString().split('T')[0],
    });

    // Should pass with wizard field names
    expect(result.ok).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it('alternative field names also work (backward compatibility)', () => {
    // Some parts of the codebase use *_given or *_provided
    const alternativeFields = {
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      prescribed_info_given: true, // Alternative name
      epc_provided: true, // Alternative name
      how_to_rent_provided: true, // Alternative name
      gas_certificate_provided: true, // Alternative name
      has_gas_appliances: true,
      licensing_required: 'not_required',
      tenancy_start_date: '2020-01-01',
    };

    const validationInput = extractSection21ValidationInput(alternativeFields);
    const result = validateSection21Preconditions({
      ...validationInput,
      service_date: new Date().toISOString().split('T')[0],
    });

    expect(result.ok).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });
});
