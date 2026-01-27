/**
 * Section 21 Preconditions Validator Tests
 *
 * Regression tests to verify that buildSection21ValidationInputFromFacts
 * correctly normalizes wizard facts before validation.
 *
 * These tests specifically cover the Review page failure case where users
 * answered EPC/How to Rent questions but the validator saw "UNKNOWN" because:
 * 1. Facts were nested under compliance/section21/property containers
 * 2. Facts used variant keys (epc_served vs epc_provided)
 *
 * The buildSection21ValidationInputFromFacts adapter fixes this by:
 * - Flattening nested containers into a merged view
 * - Mapping variant keys to canonical validator fields
 */

import {
  validateSection21Preconditions,
  buildSection21ValidationInputFromFacts,
  type Section21ValidationInput,
} from '@/lib/validators/section21-preconditions';

describe('buildSection21ValidationInputFromFacts', () => {
  describe('Nested container flattening', () => {
    it('should extract epc_served from compliance container', () => {
      const facts = {
        compliance: { epc_served: true },
        tenancy_start_date: '2025-07-14',
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('should extract how_to_rent_served from compliance container', () => {
      const facts = {
        compliance: { how_to_rent_served: true },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('should extract facts from section21 container', () => {
      const facts = {
        section21: {
          epc_served: true,
          how_to_rent_given: true,
        },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.how_to_rent_served).toBe(true);
    });

    it('should extract facts from section_21 container (underscore variant)', () => {
      const facts = {
        section_21: {
          epc_provided: true,
          how_to_rent_provided: true,
        },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_provided).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('should extract facts from property container', () => {
      const facts = {
        property: {
          epc_served: true,
          has_gas_appliances: false,
        },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.has_gas_appliances).toBe(false);
    });

    it('should extract facts from tenancy container', () => {
      const facts = {
        tenancy: {
          tenancy_start_date: '2024-01-15',
          deposit_taken: true,
        },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.tenancy_start_date).toBe('2024-01-15');
      expect(input.deposit_taken).toBe(true);
    });
  });

  describe('Top-level overrides nested', () => {
    it('should prefer top-level false over nested true for epc_served', () => {
      const facts = {
        epc_served: false,
        compliance: { epc_served: true },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      // Top-level false should win
      expect(input.epc_served).toBe(false);
    });

    it('should prefer top-level true over nested false for how_to_rent_served', () => {
      const facts = {
        how_to_rent_served: true,
        section21: { how_to_rent_served: false },
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      // Top-level true should win
      expect(input.how_to_rent_served).toBe(true);
    });
  });

  describe('Variant key mapping', () => {
    it('should map epc_provided to both epc_served and epc_provided', () => {
      const facts = { epc_provided: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('should map epc_served to both epc_served and epc_provided', () => {
      const facts = { epc_served: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.epc_provided).toBe(true);
    });

    it('should map how_to_rent_given to how_to_rent fields', () => {
      const facts = { how_to_rent_given: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('should map how_to_rent_provided to how_to_rent fields', () => {
      const facts = { how_to_rent_provided: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.how_to_rent_served).toBe(true);
      expect(input.how_to_rent_provided).toBe(true);
    });

    it('should map prescribed_info_given to prescribed_info fields', () => {
      const facts = { prescribed_info_given: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.prescribed_info_served).toBe(true);
      expect(input.prescribed_info_given).toBe(true);
    });

    it('should map gas_certificate_provided to gas fields', () => {
      const facts = { gas_certificate_provided: true };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.gas_safety_cert_served).toBe(true);
      expect(input.gas_certificate_provided).toBe(true);
    });
  });

  describe('String boolean handling', () => {
    it('should treat "yes" as true', () => {
      const facts = {
        epc_served: 'yes',
        how_to_rent_served: 'yes',
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(true);
      expect(input.how_to_rent_served).toBe(true);
    });

    it('should treat "no" as false', () => {
      const facts = {
        epc_served: 'no',
        how_to_rent_served: 'no',
      };

      const input = buildSection21ValidationInputFromFacts(facts);

      expect(input.epc_served).toBe(false);
      expect(input.how_to_rent_served).toBe(false);
    });
  });

  describe('Service date extraction', () => {
    it('should extract service_date from multiple possible keys', () => {
      // Test each variant
      expect(
        buildSection21ValidationInputFromFacts({ service_date: '2025-01-01' }).service_date
      ).toBe('2025-01-01');

      expect(
        buildSection21ValidationInputFromFacts({ notice_date: '2025-02-01' }).service_date
      ).toBe('2025-02-01');

      expect(
        buildSection21ValidationInputFromFacts({ notice_service_date: '2025-03-01' }).service_date
      ).toBe('2025-03-01');

      expect(
        buildSection21ValidationInputFromFacts({ notice_served_date: '2025-04-01' }).service_date
      ).toBe('2025-04-01');

      expect(
        buildSection21ValidationInputFromFacts({ intended_service_date: '2025-05-01' }).service_date
      ).toBe('2025-05-01');
    });
  });
});

describe('validateSection21Preconditions with buildSection21ValidationInputFromFacts', () => {
  // Base facts that should pass all other checks
  const baseFacts = {
    deposit_taken: false, // No deposit = no deposit checks needed
    has_gas_appliances: false, // No gas = no gas cert needed
    licensing_required: '', // No licensing required
    no_retaliatory_notice: true,
    tenancy_start_date: '2024-01-01',
    service_date: '2025-07-01', // Well after 4 month rule
  };

  describe('Case 1: Facts nested under compliance', () => {
    it('should NOT return UNKNOWN blockers when EPC/H2R are in compliance container', () => {
      const facts = {
        ...baseFacts,
        compliance: {
          epc_served: true,
          how_to_rent_served: true,
        },
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Should NOT have UNKNOWN blockers
      const unknownBlockers = result.blockers.filter((b) => b.code.endsWith('_UNKNOWN'));
      expect(unknownBlockers).toHaveLength(0);

      // Specifically check EPC and H2R are not blocked
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(false);
    });
  });

  describe('Case 2: Facts using variant keys', () => {
    it('should NOT return UNKNOWN blockers when using epc_provided and how_to_rent_given', () => {
      const facts = {
        ...baseFacts,
        epc_provided: true,
        how_to_rent_given: true,
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Should NOT have UNKNOWN blockers
      const unknownBlockers = result.blockers.filter((b) => b.code.endsWith('_UNKNOWN'));
      expect(unknownBlockers).toHaveLength(0);

      // Should pass validation
      expect(result.ok).toBe(true);
    });
  });

  describe('Case 3: Explicit false must still block (not UNKNOWN)', () => {
    it('should return NOT_PROVIDED (not UNKNOWN) when epc_served is explicitly false', () => {
      const facts = {
        ...baseFacts,
        compliance: { epc_served: false },
        how_to_rent_served: true,
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Should have EPC_NOT_PROVIDED, not EPC_UNKNOWN
      expect(result.blockers.some((b) => b.code === 'S21_EPC_NOT_PROVIDED')).toBe(true);
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(false);
    });

    it('should return NOT_PROVIDED (not UNKNOWN) when how_to_rent_served is explicitly false', () => {
      const facts = {
        ...baseFacts,
        epc_served: true,
        section21: { how_to_rent_served: false },
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Should have HOW_TO_RENT_NOT_PROVIDED, not HOW_TO_RENT_UNKNOWN
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_NOT_PROVIDED')).toBe(true);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(false);
    });
  });

  describe('Case 4: Top-level overrides nested', () => {
    it('should block when top-level false overrides nested true for EPC', () => {
      const facts = {
        ...baseFacts,
        epc_served: false, // Top-level false
        compliance: { epc_served: true }, // Nested true (should be ignored)
        how_to_rent_served: true,
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Top-level false should win, causing NOT_PROVIDED blocker
      expect(result.blockers.some((b) => b.code === 'S21_EPC_NOT_PROVIDED')).toBe(true);
      expect(result.ok).toBe(false);
    });

    it('should pass when top-level true overrides nested false for H2R', () => {
      const facts = {
        ...baseFacts,
        epc_served: true,
        how_to_rent_served: true, // Top-level true
        section21: { how_to_rent_served: false }, // Nested false (should be ignored)
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Top-level true should win, no blocker
      expect(result.blockers.some((b) => b.code.includes('HOW_TO_RENT'))).toBe(false);
    });
  });

  describe('Full Review page scenario', () => {
    it('should pass validation for typical wizard output with nested compliance facts', () => {
      // Simulate typical wizard output structure
      const wizardFacts = {
        // Meta
        selected_notice_route: 'section_21',
        jurisdiction: 'england',
        product: 'notice_only',

        // Tenancy
        tenancy_start_date: '2024-01-15',
        monthly_rent: 1200,

        // Compliance nested
        compliance: {
          epc_served: true,
          epc_date: '2024-01-10',
          how_to_rent_served: true,
          how_to_rent_date: '2024-01-10',
          gas_safety_cert_served: true,
          prescribed_info_served: true,
        },

        // Deposit
        deposit_taken: true,
        deposit_amount: 1200,
        deposit_protected: true,
        deposit_scheme: 'DPS',

        // Property
        property: {
          has_gas_appliances: true,
        },

        // Service
        notice_service_date: '2025-06-15',
        no_retaliatory_notice: true,
      };

      const input = buildSection21ValidationInputFromFacts(wizardFacts);
      const result = validateSection21Preconditions(input);

      // Should pass with no blockers
      expect(result.ok).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('should detect missing EPC when not in any container', () => {
      const facts = {
        ...baseFacts,
        how_to_rent_served: true,
        // epc_served is NOT set anywhere
      };

      const input = buildSection21ValidationInputFromFacts(facts);
      const result = validateSection21Preconditions(input);

      // Should have EPC_UNKNOWN blocker
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(true);
    });
  });

  describe('Review page regression: caseFacts from /api/wizard/analyze', () => {
    /**
     * REGRESSION TEST: Review page was bypassing the extraction/normalization step
     *
     * Root cause: The /api/wizard/analyze endpoint was returning a limited caseFacts
     * object that only included grounds-related fields but NOT the Section 21 compliance
     * fields (epc_served, how_to_rent_served, etc.).
     *
     * The Review page passed this incomplete caseFacts to buildSection21ValidationInputFromFacts,
     * which couldn't find the compliance fields and returned undefined values,
     * causing UNKNOWN blockers.
     *
     * Fix: Include Section 21 compliance fields in the caseFacts response from /api/wizard/analyze
     */

    it('should NOT show UNKNOWN blockers when caseFacts includes compliance fields from analyze endpoint', () => {
      // Simulate caseFacts structure as returned by /api/wizard/analyze (AFTER fix)
      const caseFacts = {
        section8_grounds: [],
        include_recommended_grounds: false,
        arrears_items: [],
        recommended_grounds: [],
        jurisdiction: 'england',
        eviction_route: null,
        selected_notice_route: 'section_21',
        wales_fault_grounds: [],

        // Section 21 compliance fields (NOW INCLUDED after fix)
        deposit_taken: false,
        deposit_amount: undefined,
        deposit_protected: undefined,
        epc_served: true,
        epc_provided: true,
        how_to_rent_served: true,
        how_to_rent_provided: true,
        has_gas_appliances: false,
        gas_safety_cert_served: undefined,
        licensing_required: undefined,
        has_valid_licence: undefined,
        improvement_notice_served: undefined,
        no_retaliatory_notice: true,
        tenancy_start_date: '2024-01-15',
      };

      const input = buildSection21ValidationInputFromFacts(caseFacts);
      const result = validateSection21Preconditions(input);

      // Should NOT have UNKNOWN blockers
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(false);

      // Should pass validation
      expect(result.ok).toBe(true);
    });

    it('should show UNKNOWN blockers when caseFacts is MISSING compliance fields (pre-fix scenario)', () => {
      // Simulate caseFacts structure as returned by /api/wizard/analyze (BEFORE fix)
      // This was the bug: no compliance fields included
      const caseFacts = {
        section8_grounds: [],
        include_recommended_grounds: false,
        arrears_items: [],
        recommended_grounds: [],
        jurisdiction: 'england',
        eviction_route: null,
        selected_notice_route: 'section_21',
        wales_fault_grounds: [],
        // NO compliance fields - this was the bug!
      };

      const input = buildSection21ValidationInputFromFacts(caseFacts);
      const result = validateSection21Preconditions(input);

      // Should have UNKNOWN blockers (pre-fix behavior)
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(true);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(true);
      expect(result.ok).toBe(false);
    });

    it('should correctly extract compliance fields from nested wizardFacts structure', () => {
      // Simulate wizardFacts structure with compliance nested under different containers
      // This is how the wizard stores data
      const wizardFacts = {
        // Top-level meta
        selected_notice_route: 'section_21',
        jurisdiction: 'england',
        tenancy_start_date: '2024-01-15',

        // Compliance fields stored in various nested locations
        compliance: {
          epc_served: true,
          how_to_rent_served: true,
        },
        tenancy: {
          deposit_taken: false,
        },
        property: {
          has_gas_appliances: false,
        },
      };

      const input = buildSection21ValidationInputFromFacts(wizardFacts);
      const result = validateSection21Preconditions(input);

      // Should extract nested values correctly
      expect(input.epc_served).toBe(true);
      expect(input.how_to_rent_served).toBe(true);
      expect(input.deposit_taken).toBe(false);
      expect(input.has_gas_appliances).toBe(false);

      // Should NOT have UNKNOWN blockers
      expect(result.blockers.some((b) => b.code === 'S21_EPC_UNKNOWN')).toBe(false);
      expect(result.blockers.some((b) => b.code === 'S21_HOW_TO_RENT_UNKNOWN')).toBe(false);

      // Should pass validation
      expect(result.ok).toBe(true);
    });
  });
});
