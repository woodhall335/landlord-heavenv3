/**
 * Regression tests for Wales ground_codes derivation
 *
 * Tests the fix for: Wales notice_only preview failing with
 * "Required information missing: ground_codes"
 *
 * Root cause: Wales UI collects wales_fault_grounds (e.g., ['rent_arrears_serious']),
 * but the validator requires ground_codes (e.g., ['section_157']).
 *
 * Fix: Derive ground_codes from wales_fault_grounds using the same WALES_FAULT_GROUNDS
 * definitions that power the UI (single source of truth), before validation runs.
 *
 * Key assertions:
 * - Wales fault-based case with wales_fault_grounds but no ground_codes passes validation
 * - England routes unaffected (no Wales mapping runs)
 * - Wales section_173 route does not try to derive ground_codes (not needed)
 */

import { validateFlow } from '@/lib/validation/validateFlow';
import type { FlowValidationInput } from '@/lib/validation/validateFlow';
import {
  WALES_FAULT_GROUNDS,
  mapWalesFaultGroundsToGroundCodes,
} from '@/lib/wales';

/**
 * Helper function that mimics the ground_codes derivation logic from the API endpoints
 * This allows us to unit test the derivation without making HTTP calls
 */
function deriveGroundCodesIfNeeded(
  jurisdiction: string,
  route: string,
  wizardFacts: Record<string, unknown>
): Record<string, unknown> {
  // Clone facts to avoid mutation
  const facts = { ...wizardFacts };

  if (jurisdiction === 'wales' && route === 'wales_fault_based') {
    const existingGroundCodes = facts.ground_codes;
    const hasGroundCodes = Array.isArray(existingGroundCodes) && existingGroundCodes.length > 0;
    const walesFaultGrounds = facts.wales_fault_grounds as string[] | undefined;
    const hasFaultGrounds = Array.isArray(walesFaultGrounds) && walesFaultGrounds.length > 0;

    if (!hasGroundCodes && hasFaultGrounds) {
      facts.ground_codes = mapWalesFaultGroundsToGroundCodes(walesFaultGrounds);
    }
  }

  return facts;
}

describe('Wales ground_codes Derivation', () => {
  const baseWalesFacts = {
    landlord_full_name: 'John Smith',
    landlord_address_line1: '123 Main St',
    landlord_city: 'Cardiff',
    landlord_postcode: 'CF10 1AA',
    tenant_full_name: 'Jane Doe',
    property_address_line1: '456 Rental Ave',
    property_city: 'Cardiff',
    property_postcode: 'CF10 2BB',
    tenancy_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',
  };

  describe('Derivation logic', () => {
    it('should derive ground_codes from wales_fault_grounds when missing', () => {
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious', 'antisocial_behaviour'],
        // No ground_codes provided
      });

      expect(facts.ground_codes).toBeDefined();
      expect(Array.isArray(facts.ground_codes)).toBe(true);
      expect(facts.ground_codes).toContain('section_157');
      expect(facts.ground_codes).toContain('section_161');
    });

    it('should NOT override existing ground_codes', () => {
      const existingCodes = ['section_999'];
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'],
        ground_codes: existingCodes, // Already has ground_codes
      });

      // Should keep the existing codes
      expect(facts.ground_codes).toEqual(existingCodes);
    });

    it('should NOT derive for wales_section_173 route', () => {
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_section_173', {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'], // Even with fault grounds
      });

      // Should not add ground_codes (section_173 doesn't need them)
      expect(facts.ground_codes).toBeUndefined();
    });

    it('should NOT derive for England jurisdiction', () => {
      const facts = deriveGroundCodesIfNeeded('england', 'section_8', {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'], // Even with Wales grounds (shouldn't exist for England)
      });

      // Should not add ground_codes (England uses different mechanism)
      expect(facts.ground_codes).toBeUndefined();
    });

    it('should NOT derive for Scotland jurisdiction', () => {
      const facts = deriveGroundCodesIfNeeded('scotland', 'notice_to_leave', {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'],
      });

      expect(facts.ground_codes).toBeUndefined();
    });

    it('should handle empty wales_fault_grounds', () => {
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        wales_fault_grounds: [], // Empty array
      });

      // Should not add ground_codes (nothing to derive from)
      expect(facts.ground_codes).toBeUndefined();
    });

    it('should handle missing wales_fault_grounds', () => {
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        // No wales_fault_grounds at all
      });

      expect(facts.ground_codes).toBeUndefined();
    });
  });

  describe('Integration with validateFlow', () => {
    it('should pass validation with derived ground_codes', () => {
      // Simulate what the API endpoint does: derive ground_codes before validation
      const rawFacts = {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'],
        // No ground_codes
      };

      const factsWithDerivedCodes = deriveGroundCodesIfNeeded(
        'wales',
        'wales_fault_based',
        rawFacts
      );

      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_fault_based',
        stage: 'preview',
        facts: factsWithDerivedCodes,
      };

      const result = validateFlow(input);

      // Should NOT have REQUIRED_FACT_MISSING for ground_codes
      const groundCodesError = result.blocking_issues.find(
        (issue) =>
          issue.code === 'REQUIRED_FACT_MISSING' &&
          issue.fields?.includes('ground_codes')
      );
      expect(groundCodesError).toBeUndefined();
    });

    it('should FAIL validation without derivation (regression baseline)', () => {
      // This test documents the original bug - validation fails without derivation
      const rawFacts = {
        ...baseWalesFacts,
        wales_fault_grounds: ['rent_arrears_serious'],
        // No ground_codes - and NOT deriving them
      };

      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_fault_based',
        stage: 'preview',
        facts: rawFacts, // Using raw facts WITHOUT derivation
      };

      const result = validateFlow(input);

      // Should have REQUIRED_FACT_MISSING for ground_codes
      const groundCodesError = result.blocking_issues.find(
        (issue) =>
          issue.code === 'REQUIRED_FACT_MISSING' &&
          issue.fields?.includes('ground_codes')
      );
      expect(groundCodesError).toBeDefined();
    });

    it('should pass validation for wales_section_173 without ground_codes', () => {
      // Section 173 is a no-fault route, doesn't need ground_codes
      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_section_173',
        stage: 'preview',
        facts: {
          ...baseWalesFacts,
          // No wales_fault_grounds or ground_codes
        },
      };

      const result = validateFlow(input);

      // Should NOT have REQUIRED_FACT_MISSING for ground_codes
      const groundCodesError = result.blocking_issues.find(
        (issue) =>
          issue.code === 'REQUIRED_FACT_MISSING' &&
          issue.fields?.includes('ground_codes')
      );
      expect(groundCodesError).toBeUndefined();
    });
  });

  describe('England routes unaffected', () => {
    it('should not interfere with section_8 ground_codes handling', () => {
      // England section_8 uses its own ground_codes mechanism (numeric Ground 1-17)
      // The Wales derivation should not affect it
      const facts = deriveGroundCodesIfNeeded('england', 'section_8', {
        ...baseWalesFacts,
        section8_grounds: ['Ground 8', 'Ground 10'],
        // England doesn't use wales_fault_grounds
      });

      // Wales derivation should not have added ground_codes
      expect(facts.ground_codes).toBeUndefined();

      // section8_grounds should remain untouched
      expect(facts.section8_grounds).toEqual(['Ground 8', 'Ground 10']);
    });

    it('should pass England section_8 validation with proper ground_codes', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'preview',
        facts: {
          ...baseWalesFacts,
          section8_grounds: ['Ground 8'],
          ground_codes: [8], // England uses numeric codes
        },
      };

      const result = validateFlow(input);

      // Validation should work with England's ground_codes format
      const routeError = result.blocking_issues.find(
        (issue) => issue.code === 'ROUTE_NOT_SUPPORTED'
      );
      expect(routeError).toBeUndefined();
    });
  });

  describe('Derivation correctness', () => {
    it('should correctly map all known Wales grounds', () => {
      // Test all grounds defined in WALES_FAULT_GROUNDS
      for (const ground of WALES_FAULT_GROUNDS) {
        const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
          ...baseWalesFacts,
          wales_fault_grounds: [ground.value],
        });

        expect(facts.ground_codes).toContain(`section_${ground.section}`);
      }
    });

    it('should deduplicate section codes from multiple grounds', () => {
      // Section 159 grounds: rent_arrears_other, breach_of_contract, false_statement, etc.
      const section159Grounds = WALES_FAULT_GROUNDS
        .filter((g) => g.section === 159)
        .map((g) => g.value);

      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        wales_fault_grounds: section159Grounds,
      });

      // Should only have one 'section_159'
      expect(facts.ground_codes).toEqual(['section_159']);
    });

    it('should combine multiple sections correctly', () => {
      const facts = deriveGroundCodesIfNeeded('wales', 'wales_fault_based', {
        ...baseWalesFacts,
        wales_fault_grounds: [
          'rent_arrears_serious', // Section 157
          'rent_arrears_other', // Section 159
          'antisocial_behaviour', // Section 161
          'breach_of_contract', // Section 159 (duplicate section)
        ],
      });

      expect(facts.ground_codes).toContain('section_157');
      expect(facts.ground_codes).toContain('section_159');
      expect(facts.ground_codes).toContain('section_161');
      expect((facts.ground_codes as string[]).length).toBe(3); // No duplicates
    });
  });
});

describe('Manual Verification Checklist Support', () => {
  /**
   * These tests support the manual verification checklist:
   * - Use caseId 3b9ca0d1-044a-4bf1-8e81-c2776585b205
   * - Open: /wizard/preview/{caseId}?product=notice_only&jurisdiction=wales
   * - Confirm "Required information missing: ground_codes" error is gone
   */

  it('should derive correct codes for typical Wales arrears case', () => {
    // This simulates a typical case where user selected serious rent arrears
    const typicalCaseFacts = {
      landlord_full_name: 'Test Landlord',
      landlord_address_line1: '1 Test Street',
      tenant_full_name: 'Test Tenant',
      property_address_line1: '2 Test Road',
      tenancy_start_date: '2022-06-01',
      rent_amount: 800,
      rent_frequency: 'monthly',
      wales_fault_grounds: ['rent_arrears_serious'],
      arrears_items: [
        { period_start: '2024-01-01', amount_due: 800, amount_paid: 0 },
        { period_start: '2024-02-01', amount_due: 800, amount_paid: 0 },
        { period_start: '2024-03-01', amount_due: 800, amount_paid: 0 },
      ],
      total_arrears: 2400,
    };

    const factsWithDerivedCodes = deriveGroundCodesIfNeeded(
      'wales',
      'wales_fault_based',
      typicalCaseFacts
    );

    // Should derive section_157 for serious arrears
    expect(factsWithDerivedCodes.ground_codes).toEqual(['section_157']);

    // Validation should pass
    const result = validateFlow({
      jurisdiction: 'wales',
      product: 'notice_only',
      route: 'wales_fault_based',
      stage: 'preview',
      facts: factsWithDerivedCodes,
    });

    const groundCodesError = result.blocking_issues.find(
      (issue) =>
        issue.code === 'REQUIRED_FACT_MISSING' &&
        issue.fields?.includes('ground_codes')
    );
    expect(groundCodesError).toBeUndefined();
  });
});
