/**
 * Wales Compliance Regressions Test Suite
 *
 * Tests for the fixes implemented in the Wales compliance schema refactoring:
 * A) Duplicate declaration (user_declaration rendered once)
 * B) Numeric validation (0 ≠ missing, but arrears must be > 0)
 * C) Legacy case migration
 * D) Ground-driven conditional field visibility
 * E) Wales rent schedule conditionally shown
 * F) England terminology warning in Part D
 *
 * These tests ensure backward compatibility and prevent regressions.
 */

import {
  WALES_COMPLIANCE_FIELDS,
  shouldFieldApply,
  normalizeWalesFaultGrounds,
  isNumericValueMissing,
  isArrearsValueInvalid,
  getGroundLogicViolations,
  getBlockingViolations,
  migrateWalesLegacyFacts,
} from '@/lib/wales/compliance-schema';

// ============================================================================
// ISSUE A: Declaration rendered once
// ============================================================================

describe('Issue A: Declaration duplication fix', () => {
  describe('user_declaration field in schema', () => {
    it('should have exactly one user_declaration field in WALES_COMPLIANCE_FIELDS', () => {
      const declarationFields = WALES_COMPLIANCE_FIELDS.filter(
        (f) => f.field_id === 'user_declaration'
      );
      expect(declarationFields.length).toBe(1);
    });

    it('user_declaration should be in breach_evidence category', () => {
      const declarationField = WALES_COMPLIANCE_FIELDS.find(
        (f) => f.field_id === 'user_declaration'
      );
      expect(declarationField).toBeDefined();
      expect(declarationField?.category).toBe('breach_evidence');
    });

    it('user_declaration should be a boolean HARD_BLOCK field', () => {
      const declarationField = WALES_COMPLIANCE_FIELDS.find(
        (f) => f.field_id === 'user_declaration'
      );
      expect(declarationField?.input_type).toBe('boolean');
      expect(declarationField?.blocking_level).toBe('HARD_BLOCK');
    });
  });
});

// ============================================================================
// ISSUE B: Numeric validation (0 ≠ missing, arrears > 0)
// ============================================================================

describe('Issue B: Numeric validation', () => {
  describe('isNumericValueMissing()', () => {
    it('should return true for undefined', () => {
      expect(isNumericValueMissing(undefined)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isNumericValueMissing(null)).toBe(true);
    });

    it('should return true for NaN', () => {
      expect(isNumericValueMissing(NaN)).toBe(true);
    });

    it('should return true for string that is not a number', () => {
      expect(isNumericValueMissing('abc')).toBe(true);
    });

    it('should return false for 0 (CRITICAL: 0 is NOT missing)', () => {
      expect(isNumericValueMissing(0)).toBe(false);
    });

    it('should return false for positive numbers', () => {
      expect(isNumericValueMissing(1)).toBe(false);
      expect(isNumericValueMissing(100.5)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isNumericValueMissing(-1)).toBe(false);
    });
  });

  describe('isArrearsValueInvalid()', () => {
    const factsWithArrearsGround = {
      wales_fault_grounds: ['rent_arrears_serious'],
    };

    const factsWithoutArrearsGround = {
      wales_fault_grounds: ['antisocial_behaviour'],
    };

    describe('when arrears ground is selected', () => {
      it('should flag arrears_amount = 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_amount',
          0,
          factsWithArrearsGround
        );
        expect(result.invalid).toBe(true);
        expect(result.message).toContain('greater than zero');
      });

      it('should flag arrears_weeks_unpaid = 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_weeks_unpaid',
          0,
          factsWithArrearsGround
        );
        expect(result.invalid).toBe(true);
        expect(result.message).toContain('greater than zero');
      });

      it('should NOT flag arrears_amount > 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_amount',
          500,
          factsWithArrearsGround
        );
        expect(result.invalid).toBe(false);
      });

      it('should NOT flag arrears_weeks_unpaid > 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_weeks_unpaid',
          8,
          factsWithArrearsGround
        );
        expect(result.invalid).toBe(false);
      });
    });

    describe('when no arrears ground is selected', () => {
      it('should NOT flag arrears_amount = 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_amount',
          0,
          factsWithoutArrearsGround
        );
        expect(result.invalid).toBe(false);
      });

      it('should NOT flag arrears_weeks_unpaid = 0 as invalid', () => {
        const result = isArrearsValueInvalid(
          'arrears_weeks_unpaid',
          0,
          factsWithoutArrearsGround
        );
        expect(result.invalid).toBe(false);
      });
    });

    it('should NOT flag non-arrears fields', () => {
      const result = isArrearsValueInvalid(
        'some_other_field',
        0,
        factsWithArrearsGround
      );
      expect(result.invalid).toBe(false);
    });
  });

  describe('getGroundLogicViolations()', () => {
    it('should flag arrears_amount = 0 with clear message when arrears ground selected', () => {
      const violations = getGroundLogicViolations({
        wales_fault_grounds: ['rent_arrears_serious'],
        arrears_amount: 0,
        arrears_weeks_unpaid: 8,
      });

      const arrearsMsgs = violations.filter((v) =>
        v.message.toLowerCase().includes('arrears amount')
      );
      expect(arrearsMsgs.length).toBeGreaterThan(0);
      expect(arrearsMsgs[0].message).toContain('greater than zero');
    });

    it('should flag arrears_weeks_unpaid = 0 with clear message when arrears ground selected', () => {
      const violations = getGroundLogicViolations({
        wales_fault_grounds: ['rent_arrears_serious'],
        arrears_amount: 500,
        arrears_weeks_unpaid: 0,
      });

      const weeksMsgs = violations.filter((v) =>
        v.message.toLowerCase().includes('weeks')
      );
      expect(weeksMsgs.length).toBeGreaterThan(0);
      expect(weeksMsgs[0].message).toContain('greater than zero');
    });

    it('should NOT violate when arrears_amount and weeks are valid positive numbers', () => {
      const violations = getGroundLogicViolations({
        wales_fault_grounds: ['rent_arrears_serious'],
        arrears_amount: 1000,
        arrears_weeks_unpaid: 9,
      });

      // Should only have threshold validation, not "greater than zero" errors
      const zeroErrors = violations.filter((v) =>
        v.message.includes('greater than zero')
      );
      expect(zeroErrors.length).toBe(0);
    });
  });
});

// ============================================================================
// ISSUE C: Legacy case migration
// ============================================================================

describe('Issue C: Legacy case migration', () => {
  describe('normalizeWalesFaultGrounds()', () => {
    it('should convert string to array', () => {
      const result = normalizeWalesFaultGrounds('rent_arrears_serious');
      expect(result).toEqual(['rent_arrears_serious']);
    });

    it('should return array as-is', () => {
      const input = ['rent_arrears_serious', 'antisocial_behaviour'];
      const result = normalizeWalesFaultGrounds(input);
      expect(result).toEqual(input);
    });

    it('should return empty array for null', () => {
      expect(normalizeWalesFaultGrounds(null)).toEqual([]);
    });

    it('should return empty array for undefined', () => {
      expect(normalizeWalesFaultGrounds(undefined)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(normalizeWalesFaultGrounds('')).toEqual([]);
    });
  });

  describe('migrateWalesLegacyFacts()', () => {
    it('should only run for Wales notice_only', () => {
      const facts = { asb_description: 'Test' };

      // Should not migrate for England
      const englandResult = migrateWalesLegacyFacts(facts, 'england', 'notice_only');
      expect(englandResult['wales_asb_description']).toBeUndefined();

      // Should not migrate for non-notice_only products
      const fullResult = migrateWalesLegacyFacts(facts, 'wales', 'eviction_pack');
      expect(fullResult['wales_asb_description']).toBeUndefined();
    });

    it('should migrate legacy asb_description to wales_asb_description', () => {
      const facts = {
        asb_description: 'Loud music at night',
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(result['wales_asb_description']).toBe('Loud music at night');
    });

    it('should migrate legacy breach_clause to wales_breach_clause', () => {
      const facts = {
        breach_clause: 'Clause 5.2',
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(result['wales_breach_clause']).toBe('Clause 5.2');
    });

    it('should migrate legacy total_arrears to arrears_amount', () => {
      const facts = {
        total_arrears: 1500,
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(result['arrears_amount']).toBe(1500);
    });

    it('should migrate legacy weeks_unpaid to arrears_weeks_unpaid', () => {
      const facts = {
        weeks_unpaid: 8,
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(result['arrears_weeks_unpaid']).toBe(8);
    });

    it('should NOT overwrite if new key already has data', () => {
      const facts = {
        wales_asb_description: 'New description',
        asb_description: 'Legacy description',
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      // Should keep the new value, not overwrite with legacy
      expect(result['wales_asb_description']).toBe('New description');
    });

    it('should normalize wales_fault_grounds from string to array', () => {
      const facts = {
        wales_fault_grounds: 'rent_arrears_serious',
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(Array.isArray(result['wales_fault_grounds'])).toBe(true);
      expect(result['wales_fault_grounds']).toEqual(['rent_arrears_serious']);
    });

    it('should migrate nested issues.rent_arrears.arrears_items', () => {
      const facts = {
        issues: {
          rent_arrears: {
            arrears_items: [{ period_start: '2024-01-01', rent_due: 1000, amount_owed: 500 }],
          },
        },
      };
      const result = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      expect(result['arrears_items']).toEqual([
        { period_start: '2024-01-01', rent_due: 1000, amount_owed: 500 },
      ]);
    });

    it('should be idempotent (safe to call multiple times)', () => {
      const facts = {
        asb_description: 'Test',
      };
      const result1 = migrateWalesLegacyFacts(facts, 'wales', 'notice_only');
      const result2 = migrateWalesLegacyFacts(result1, 'wales', 'notice_only');
      expect(result1).toEqual(result2);
    });
  });
});

// ============================================================================
// ISSUE D: Ground-driven conditional field visibility
// ============================================================================

describe('Issue D: Ground-driven conditional field visibility', () => {
  describe('shouldFieldApply() with applies_if conditions', () => {
    it('should show arrears_weeks_unpaid when rent_arrears_serious selected', () => {
      const field = WALES_COMPLIANCE_FIELDS.find(
        (f) => f.field_id === 'arrears_weeks_unpaid'
      );
      expect(field).toBeDefined();

      const facts = { wales_fault_grounds: ['rent_arrears_serious'] };
      expect(shouldFieldApply('arrears_weeks_unpaid', facts)).toBe(true);
    });

    it('should show arrears_weeks_unpaid when rent_arrears_other selected', () => {
      const facts = { wales_fault_grounds: ['rent_arrears_other'] };
      expect(shouldFieldApply('arrears_weeks_unpaid', facts)).toBe(true);
    });

    it('should NOT show arrears_weeks_unpaid when no arrears ground selected', () => {
      const facts = { wales_fault_grounds: ['antisocial_behaviour'] };
      expect(shouldFieldApply('arrears_weeks_unpaid', facts)).toBe(false);
    });

    it('should show asb_incident_description when antisocial_behaviour selected', () => {
      const facts = { wales_fault_grounds: ['antisocial_behaviour'] };
      expect(shouldFieldApply('asb_incident_description', facts)).toBe(true);
    });

    it('should NOT show asb_incident_description when ASB ground not selected', () => {
      const facts = { wales_fault_grounds: ['rent_arrears_serious'] };
      expect(shouldFieldApply('asb_incident_description', facts)).toBe(false);
    });

    it('should show breach_clause_identified when breach_of_contract selected', () => {
      const facts = { wales_fault_grounds: ['breach_of_contract'] };
      expect(shouldFieldApply('breach_clause_identified', facts)).toBe(true);
    });

    it('should NOT show breach_clause_identified when breach ground not selected', () => {
      const facts = { wales_fault_grounds: ['antisocial_behaviour'] };
      expect(shouldFieldApply('breach_clause_identified', facts)).toBe(false);
    });
  });
});

// ============================================================================
// ISSUE E: Wales rent schedule conditionally shown
// (Note: This is a UI component test - we test the data flow here)
// ============================================================================

describe('Issue E: Wales rent schedule conditional display', () => {
  describe('Arrears ground detection for rent schedule', () => {
    it('should require arrears schedule when rent_arrears_serious selected', () => {
      const field = WALES_COMPLIANCE_FIELDS.find(
        (f) => f.field_id === 'arrears_weeks_unpaid'
      );
      expect(field?.applies_if).toContain('rent_arrears_serious');
    });

    it('should require arrears schedule when rent_arrears_other selected', () => {
      const field = WALES_COMPLIANCE_FIELDS.find(
        (f) => f.field_id === 'arrears_weeks_unpaid'
      );
      expect(field?.applies_if).toContain('rent_arrears_other');
    });
  });
});

// ============================================================================
// Integration tests: Blockers and validation
// ============================================================================

describe('Integration: getBlockingViolations()', () => {
  it('should NOT block when arrears_amount = 0 and no arrears ground selected', () => {
    const violations = getBlockingViolations({
      eviction_route: 'fault_based',
      wales_fault_grounds: ['antisocial_behaviour'],
      rent_smart_wales_registered: true,
      written_statement_provided: true,
      deposit_taken: false,
      retaliatory_eviction_complaint: false,
      local_authority_investigation: false,
      asb_incident_description: 'Test ASB',
      user_declaration: true,
      evidence_exists: true,
      // arrears_amount can be 0 since no arrears ground selected
      arrears_amount: 0,
    });

    // Should not have any blocking violations for arrears
    const arrearsBlockers = violations.filter((v) =>
      v.message.toLowerCase().includes('arrears')
    );
    expect(arrearsBlockers.length).toBe(0);
  });

  it('should block when arrears_amount = 0 and arrears ground IS selected', () => {
    const violations = getBlockingViolations({
      eviction_route: 'fault_based',
      wales_fault_grounds: ['rent_arrears_serious'],
      rent_smart_wales_registered: true,
      written_statement_provided: true,
      deposit_taken: false,
      retaliatory_eviction_complaint: false,
      local_authority_investigation: false,
      user_declaration: true,
      evidence_exists: true,
      arrears_amount: 0,
      arrears_weeks_unpaid: 8,
    });

    // Should have a blocking violation for arrears amount
    const arrearsBlockers = violations.filter((v) =>
      v.message.toLowerCase().includes('arrears')
    );
    expect(arrearsBlockers.length).toBeGreaterThan(0);
  });

  it('should have user_declaration as a blocker when false', () => {
    const violations = getBlockingViolations({
      eviction_route: 'fault_based',
      wales_fault_grounds: ['breach_of_contract'],
      rent_smart_wales_registered: true,
      written_statement_provided: true,
      deposit_taken: false,
      retaliatory_eviction_complaint: false,
      local_authority_investigation: false,
      breach_clause: 'Clause 5',
      breach_description: 'Test breach',
      evidence_exists: true,
      user_declaration: false, // Declaration not ticked
    });

    const declarationBlockers = violations.filter((v) =>
      v.field.field_id === 'user_declaration'
    );
    expect(declarationBlockers.length).toBe(1);
  });
});
