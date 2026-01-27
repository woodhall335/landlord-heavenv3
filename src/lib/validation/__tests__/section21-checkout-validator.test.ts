/**
 * Section 21 Checkout Validator Tests
 *
 * Tests that the checkout validator correctly handles:
 * - Flat facts (epc_served at top level)
 * - Nested facts (epc_served inside compliance, section21, section_21, etc.)
 * - Key variants (epc_served vs epc_provided vs how_to_rent_given)
 *
 * These tests ensure that the "EPC UNKNOWN" / "HOW TO RENT UNKNOWN" bug is fixed
 * when users answer questions in wizards that store data in nested objects.
 */

import { describe, it, expect } from 'vitest';
import {
  validateSection21ForCheckout,
  extractSection21ValidationInput,
  isSection21Case,
} from '../section21-checkout-validator';

describe('Section 21 Checkout Validator', () => {
  describe('isSection21Case', () => {
    it('returns true for England + section_21 route', () => {
      expect(isSection21Case('england', 'section_21', null)).toBe(true);
    });

    it('returns true for England + section21 route (no underscore)', () => {
      expect(isSection21Case('england', 'section21', null)).toBe(true);
    });

    it('returns true for England + no_fault route', () => {
      expect(isSection21Case('england', 'no_fault', null)).toBe(true);
    });

    it('returns true for England + no_fault case type', () => {
      expect(isSection21Case('england', null, 'no_fault')).toBe(true);
    });

    it('returns false for Wales', () => {
      expect(isSection21Case('wales', 'section_21', null)).toBe(false);
    });

    it('returns false for Scotland', () => {
      expect(isSection21Case('scotland', 'section_21', null)).toBe(false);
    });

    it('returns false for England + section_8 route', () => {
      expect(isSection21Case('england', 'section_8', null)).toBe(false);
    });
  });

  describe('extractSection21ValidationInput - Flat Facts', () => {
    it('extracts epc_served from flat facts', () => {
      const facts = {
        epc_served: true,
        epc_provided_date: '2024-01-01',
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('extracts how_to_rent_served from flat facts', () => {
      const facts = {
        how_to_rent_served: true,
        how_to_rent_date: '2024-01-01',
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('extracts gas_safety_cert_served from flat facts', () => {
      const facts = {
        has_gas_appliances: true,
        gas_safety_cert_served: true,
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.has_gas_appliances).toBe(true);
      expect(input.gas_safety_cert_served).toBe(true);
    });
  });

  describe('extractSection21ValidationInput - Nested Facts (compliance)', () => {
    it('extracts epc_served from compliance nested object', () => {
      const facts = {
        compliance: {
          epc_served: true,
          epc_provided_date: '2024-01-01',
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('extracts how_to_rent_served from compliance nested object', () => {
      const facts = {
        compliance: {
          how_to_rent_served: true,
          how_to_rent_date: '2024-01-01',
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('extracts deposit_protected from compliance nested object', () => {
      const facts = {
        compliance: {
          deposit_protected: true,
          prescribed_info_served: true,
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.deposit_protected).toBe(true);
      expect(input.prescribed_info_served).toBe(true);
    });
  });

  describe('extractSection21ValidationInput - Nested Facts (section21)', () => {
    it('extracts epc_served from section21 nested object', () => {
      const facts = {
        section21: {
          epc_served: true,
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.epc_served).toBe(true);
    });

    it('extracts how_to_rent_served from section21 nested object', () => {
      const facts = {
        section21: {
          how_to_rent_served: true,
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
    });
  });

  describe('extractSection21ValidationInput - Nested Facts (section_21 with underscore)', () => {
    it('extracts epc_served from section_21 nested object', () => {
      const facts = {
        section_21: {
          epc_served: true,
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.epc_served).toBe(true);
    });

    it('extracts how_to_rent_served from section_21 nested object', () => {
      const facts = {
        section_21: {
          how_to_rent_served: true,
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
    });
  });

  describe('extractSection21ValidationInput - Nested Facts (tenancy)', () => {
    it('extracts tenancy_start_date from tenancy nested object', () => {
      const facts = {
        tenancy: {
          tenancy_start_date: '2024-01-01',
        },
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.tenancy_start_date).toBe('2024-01-01');
    });
  });

  describe('extractSection21ValidationInput - Top-level overrides nested', () => {
    it('top-level epc_served overrides nested compliance.epc_served', () => {
      const facts = {
        epc_served: false, // Top-level = false
        compliance: {
          epc_served: true, // Nested = true
        },
      };
      const input = extractSection21ValidationInput(facts);
      // Top-level should win
      expect(input.epc_served).toBe(false);
    });

    it('top-level how_to_rent_served overrides nested section21.how_to_rent_served', () => {
      const facts = {
        how_to_rent_served: true, // Top-level = true
        section21: {
          how_to_rent_served: false, // Nested = false
        },
      };
      const input = extractSection21ValidationInput(facts);
      // Top-level should win
      expect(input.how_to_rent_served).toBe(true);
    });
  });

  describe('extractSection21ValidationInput - Key Variants', () => {
    it('recognizes epc_provided as equivalent to epc_served', () => {
      const facts = {
        epc_provided: true,
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('recognizes how_to_rent_provided as equivalent to how_to_rent_served', () => {
      const facts = {
        how_to_rent_provided: true,
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('recognizes how_to_rent_given as equivalent to how_to_rent_served', () => {
      const facts = {
        how_to_rent_given: true,
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.how_to_rent_served).toBe(true);
    });

    it('recognizes gas_certificate_provided as equivalent to gas_safety_cert_served', () => {
      const facts = {
        has_gas_appliances: true,
        gas_certificate_provided: true,
      };
      const input = extractSection21ValidationInput(facts);
      expect(input.gas_safety_cert_served).toBe(true);
      expect(input.gas_certificate_provided).toBe(true);
    });
  });

  describe('validateSection21ForCheckout - Full Integration', () => {
    it('allows checkout when all compliance facts are nested under compliance object', () => {
      const facts = {
        selected_notice_route: 'section_21',
        compliance: {
          epc_served: true,
          how_to_rent_served: true,
          deposit_protected: true,
          prescribed_info_served: true,
        },
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      // Should not have EPC_UNKNOWN or HOW_TO_RENT_UNKNOWN blockers
      const unknownBlockers = result.missingConfirmations.filter(
        (c) => c.errorCode === 'S21_EPC_UNKNOWN' || c.errorCode === 'S21_HOW_TO_RENT_UNKNOWN'
      );
      expect(unknownBlockers).toHaveLength(0);
    });

    it('allows checkout when all compliance facts are nested under section21 object', () => {
      const facts = {
        selected_notice_route: 'section_21',
        section21: {
          epc_served: true,
          how_to_rent_served: true,
          deposit_protected: true,
          prescribed_info_served: true,
        },
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      // Should not have EPC_UNKNOWN or HOW_TO_RENT_UNKNOWN blockers
      const unknownBlockers = result.missingConfirmations.filter(
        (c) => c.errorCode === 'S21_EPC_UNKNOWN' || c.errorCode === 'S21_HOW_TO_RENT_UNKNOWN'
      );
      expect(unknownBlockers).toHaveLength(0);
    });

    it('allows checkout when all compliance facts are nested under section_21 object (with underscore)', () => {
      const facts = {
        selected_notice_route: 'section_21',
        section_21: {
          epc_served: true,
          how_to_rent_served: true,
          deposit_protected: true,
          prescribed_info_served: true,
        },
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      // Should not have EPC_UNKNOWN or HOW_TO_RENT_UNKNOWN blockers
      const unknownBlockers = result.missingConfirmations.filter(
        (c) => c.errorCode === 'S21_EPC_UNKNOWN' || c.errorCode === 'S21_HOW_TO_RENT_UNKNOWN'
      );
      expect(unknownBlockers).toHaveLength(0);
    });

    it('blocks checkout when EPC is explicitly set to false', () => {
      const facts = {
        selected_notice_route: 'section_21',
        epc_served: false, // Explicitly NO
        how_to_rent_served: true,
        has_gas_appliances: false,
        deposit_taken: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      expect(result.canCheckout).toBe(false);
      // Should have EPC_NOT_PROVIDED blocker (not UNKNOWN)
      const epcBlocker = result.missingConfirmations.find(
        (c) => c.errorCode === 'S21_EPC_NOT_PROVIDED'
      );
      expect(epcBlocker).toBeDefined();
    });

    it('blocks checkout when compliance facts are genuinely missing', () => {
      const facts = {
        selected_notice_route: 'section_21',
        // No epc_served or how_to_rent_served anywhere
        has_gas_appliances: false,
        tenancy_start_date: '2020-01-01',
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      expect(result.canCheckout).toBe(false);
      // Should have UNKNOWN blockers
      const unknownBlockers = result.missingConfirmations.filter(
        (c) => c.errorCode.endsWith('_UNKNOWN')
      );
      expect(unknownBlockers.length).toBeGreaterThan(0);
    });

    it('does not require Section 21 validation for non-Section 21 routes', () => {
      const facts = {
        selected_notice_route: 'section_8',
        // No compliance facts
      };

      const result = validateSection21ForCheckout(facts, 'england', 'complete_pack');

      expect(result.isSection21Case).toBe(false);
      expect(result.canCheckout).toBe(true);
    });

    it('does not require Section 21 validation for Wales', () => {
      const facts = {
        selected_notice_route: 'section_21',
        // No compliance facts
      };

      const result = validateSection21ForCheckout(facts, 'wales', 'complete_pack');

      expect(result.isSection21Case).toBe(false);
      expect(result.canCheckout).toBe(true);
    });

    it('allows checkout for non-eviction products (money_claim)', () => {
      const facts = {
        selected_notice_route: 'section_21',
        // No compliance facts
      };

      const result = validateSection21ForCheckout(facts, 'england', 'money_claim');

      expect(result.isSection21Case).toBe(true);
      expect(result.canCheckout).toBe(true);
      expect(result.message).toContain('does not require Section 21 precondition validation');
    });
  });

  describe('Mixed nesting scenarios', () => {
    it('handles facts split across multiple nested objects', () => {
      const facts = {
        selected_notice_route: 'section_21',
        compliance: {
          epc_served: true,
        },
        section21: {
          how_to_rent_served: true,
        },
        tenancy: {
          tenancy_start_date: '2020-01-01',
        },
        has_gas_appliances: false,
        deposit_taken: false,
      };

      const result = validateSection21ForCheckout(facts, 'england', 'notice_only');

      expect(result.isSection21Case).toBe(true);
      // Should find both epc_served (from compliance) and how_to_rent_served (from section21)
      const unknownBlockers = result.missingConfirmations.filter(
        (c) => c.errorCode === 'S21_EPC_UNKNOWN' || c.errorCode === 'S21_HOW_TO_RENT_UNKNOWN'
      );
      expect(unknownBlockers).toHaveLength(0);
    });
  });
});
