/**
 * Unit tests for Wales fault-based ground definitions and mapping
 *
 * Tests the single source of truth for Wales fault-based eviction grounds
 * under the Renting Homes (Wales) Act 2016.
 *
 * Key assertions:
 * - mapWalesFaultGroundsToGroundCodes derives codes from shared definition list (not hard-coded)
 * - All UI ground values have corresponding section mappings
 * - Ground codes are deduplicated correctly
 */

import {
  WALES_FAULT_GROUNDS,
  getWalesFaultGroundDefinitions,
  getAllWalesFaultGroundDefinitions,
  mapWalesFaultGroundsToGroundCodes,
  getWalesFaultGroundByValue,
  getWalesFaultGroundsBySection,
  calculateWalesMinNoticePeriod,
  hasWalesArrearsGroundSelected,
  hasWalesSection157Selected,
  WALES_ARREARS_GROUND_VALUES,
  type WalesFaultGroundDef,
} from '@/lib/wales';

describe('Wales Fault-Based Ground Definitions', () => {
  describe('WALES_FAULT_GROUNDS data structure', () => {
    it('should export non-empty WALES_FAULT_GROUNDS array', () => {
      expect(WALES_FAULT_GROUNDS).toBeDefined();
      expect(Array.isArray(WALES_FAULT_GROUNDS)).toBe(true);
      expect(WALES_FAULT_GROUNDS.length).toBeGreaterThan(0);
    });

    it('should have all required properties on each ground', () => {
      for (const ground of WALES_FAULT_GROUNDS) {
        expect(typeof ground.value).toBe('string');
        expect(ground.value.length).toBeGreaterThan(0);
        expect(typeof ground.label).toBe('string');
        expect(typeof ground.description).toBe('string');
        expect(typeof ground.section).toBe('number');
        expect([157, 159, 160, 161]).toContain(ground.section); // 160 for estate management
        expect(typeof ground.period).toBe('number');
        expect(ground.period).toBeGreaterThan(0);
        expect(typeof ground.mandatory).toBe('boolean');
        expect(typeof ground.requiresArrearsSchedule).toBe('boolean');
      }
    });

    it('should contain the core Wales fault grounds', () => {
      const values = WALES_FAULT_GROUNDS.map((g) => g.value);
      expect(values).toContain('rent_arrears_serious');
      expect(values).toContain('rent_arrears_other');
      expect(values).toContain('antisocial_behaviour');
      expect(values).toContain('breach_of_contract');
    });

    it('should have correct sections for known grounds', () => {
      const seriousArrears = WALES_FAULT_GROUNDS.find((g) => g.value === 'rent_arrears_serious');
      expect(seriousArrears?.section).toBe(157);

      const otherArrears = WALES_FAULT_GROUNDS.find((g) => g.value === 'rent_arrears_other');
      expect(otherArrears?.section).toBe(159);

      const asb = WALES_FAULT_GROUNDS.find((g) => g.value === 'antisocial_behaviour');
      expect(asb?.section).toBe(161);

      // Estate management is section 160 (community landlord only)
      const estateManagement = WALES_FAULT_GROUNDS.find((g) => g.value === 'estate_management');
      expect(estateManagement?.section).toBe(160);
    });

    it('estate_management should be marked as communityLandlordOnly', () => {
      const estateManagement = WALES_FAULT_GROUNDS.find((g) => g.value === 'estate_management');
      expect(estateManagement).toBeDefined();
      expect(estateManagement?.communityLandlordOnly).toBe(true);
    });
  });

  describe('getWalesFaultGroundDefinitions()', () => {
    it('should exclude community-landlord-only grounds by default (private landlord)', () => {
      const result = getWalesFaultGroundDefinitions();
      // Should not include estate_management for private landlords
      const estateManagement = result.find((g) => g.value === 'estate_management');
      expect(estateManagement).toBeUndefined();
      // Result should be smaller than full list
      expect(result.length).toBeLessThan(WALES_FAULT_GROUNDS.length);
    });

    it('should include community-landlord-only grounds when isCommunityLandlord=true', () => {
      const result = getWalesFaultGroundDefinitions({ isCommunityLandlord: true });
      const estateManagement = result.find((g) => g.value === 'estate_management');
      expect(estateManagement).toBeDefined();
      // Should return full list
      expect(result.length).toBe(WALES_FAULT_GROUNDS.length);
    });

    it('should return same as WALES_FAULT_GROUNDS when community landlord', () => {
      const result = getWalesFaultGroundDefinitions({ isCommunityLandlord: true });
      expect(result).toEqual(WALES_FAULT_GROUNDS);
    });
  });

  describe('getAllWalesFaultGroundDefinitions()', () => {
    it('should return the complete WALES_FAULT_GROUNDS array without filtering', () => {
      const result = getAllWalesFaultGroundDefinitions();
      expect(result).toBe(WALES_FAULT_GROUNDS);
      expect(result.length).toBe(WALES_FAULT_GROUNDS.length);
    });
  });

  describe('mapWalesFaultGroundsToGroundCodes()', () => {
    it('should derive codes from the shared definition list (not hard-coded)', () => {
      // This test ensures the mapping uses WALES_FAULT_GROUNDS as the source of truth
      // If someone hard-codes a mapping instead of using the definition list,
      // this test would fail when WALES_FAULT_GROUNDS is modified

      // Map all known grounds
      const allValues = WALES_FAULT_GROUNDS.map((g) => g.value);
      const result = mapWalesFaultGroundsToGroundCodes(allValues);

      // Should produce exactly the unique sections from WALES_FAULT_GROUNDS
      const expectedSections = new Set(WALES_FAULT_GROUNDS.map((g) => `section_${g.section}`));
      const resultSet = new Set(result);

      expect(resultSet).toEqual(expectedSections);
    });

    it('should convert rent_arrears_serious to section_157', () => {
      const result = mapWalesFaultGroundsToGroundCodes(['rent_arrears_serious']);
      expect(result).toContain('section_157');
    });

    it('should convert rent_arrears_other to section_159', () => {
      const result = mapWalesFaultGroundsToGroundCodes(['rent_arrears_other']);
      expect(result).toContain('section_159');
    });

    it('should convert antisocial_behaviour to section_161', () => {
      const result = mapWalesFaultGroundsToGroundCodes(['antisocial_behaviour']);
      expect(result).toContain('section_161');
    });

    it('should convert multiple grounds to deduplicated section codes', () => {
      // rent_arrears_serious (157), rent_arrears_other (159), breach_of_contract (159)
      const result = mapWalesFaultGroundsToGroundCodes([
        'rent_arrears_serious',
        'rent_arrears_other',
        'breach_of_contract', // Also section 159
      ]);

      // Should have section_157 and section_159 (deduplicated)
      expect(result).toContain('section_157');
      expect(result).toContain('section_159');
      expect(result.filter((c) => c === 'section_159').length).toBe(1); // Only one section_159
    });

    it('should handle multiple grounds with same section', () => {
      // All these are Section 159 grounds (not estate_management which is 160)
      const result = mapWalesFaultGroundsToGroundCodes([
        'rent_arrears_other',
        'breach_of_contract',
        'false_statement',
        'domestic_abuse',
      ]);

      expect(result).toEqual(['section_159']);
    });

    it('should handle estate_management as Section 160', () => {
      // estate_management is Section 160 (community landlord only)
      const result = mapWalesFaultGroundsToGroundCodes(['estate_management']);
      expect(result).toEqual(['section_160']);
    });

    it('should deduplicate Section 159 grounds with estate_management (160)', () => {
      const result = mapWalesFaultGroundsToGroundCodes([
        'rent_arrears_other', // Section 159
        'estate_management',  // Section 160
      ]);

      expect(result).toContain('section_159');
      expect(result).toContain('section_160');
      expect(result.length).toBe(2);
    });

    it('should return empty array for undefined input', () => {
      expect(mapWalesFaultGroundsToGroundCodes(undefined)).toEqual([]);
    });

    it('should return empty array for null input', () => {
      expect(mapWalesFaultGroundsToGroundCodes(null)).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(mapWalesFaultGroundsToGroundCodes([])).toEqual([]);
    });

    it('should ignore unknown ground values gracefully', () => {
      const result = mapWalesFaultGroundsToGroundCodes([
        'rent_arrears_serious',
        'unknown_ground',
        'antisocial_behaviour',
      ]);

      expect(result).toContain('section_157');
      expect(result).toContain('section_161');
      expect(result).not.toContain('unknown_ground');
    });

    it('should handle all unknown values', () => {
      const result = mapWalesFaultGroundsToGroundCodes([
        'not_a_real_ground',
        'also_not_real',
      ]);

      expect(result).toEqual([]);
    });
  });

  describe('getWalesFaultGroundByValue()', () => {
    it('should return correct ground for rent_arrears_serious', () => {
      const ground = getWalesFaultGroundByValue('rent_arrears_serious');
      expect(ground).toBeDefined();
      expect(ground?.section).toBe(157);
      expect(ground?.mandatory).toBe(true);
    });

    it('should return correct ground for antisocial_behaviour', () => {
      const ground = getWalesFaultGroundByValue('antisocial_behaviour');
      expect(ground).toBeDefined();
      expect(ground?.section).toBe(161);
    });

    it('should return undefined for unknown value', () => {
      const ground = getWalesFaultGroundByValue('unknown_ground');
      expect(ground).toBeUndefined();
    });
  });

  describe('getWalesFaultGroundsBySection()', () => {
    it('should return only Section 157 grounds', () => {
      const grounds = getWalesFaultGroundsBySection(157);
      expect(grounds.length).toBeGreaterThan(0);
      expect(grounds.every((g) => g.section === 157)).toBe(true);
    });

    it('should return only Section 159 grounds', () => {
      const grounds = getWalesFaultGroundsBySection(159);
      expect(grounds.length).toBeGreaterThan(0);
      expect(grounds.every((g) => g.section === 159)).toBe(true);
    });

    it('should return only Section 161 grounds', () => {
      const grounds = getWalesFaultGroundsBySection(161);
      expect(grounds.length).toBeGreaterThan(0);
      expect(grounds.every((g) => g.section === 161)).toBe(true);
    });

    it('should return empty array for unknown section', () => {
      const grounds = getWalesFaultGroundsBySection(999);
      expect(grounds).toEqual([]);
    });
  });

  describe('calculateWalesMinNoticePeriod()', () => {
    it('should return 14 days for rent_arrears_serious (Section 157)', () => {
      const period = calculateWalesMinNoticePeriod(['rent_arrears_serious']);
      expect(period).toBe(14);
    });

    it('should return 14 days for antisocial_behaviour (Section 161)', () => {
      const period = calculateWalesMinNoticePeriod(['antisocial_behaviour']);
      expect(period).toBe(14);
    });

    it('should return 56 days for rent_arrears_other (Section 159)', () => {
      const period = calculateWalesMinNoticePeriod(['rent_arrears_other']);
      expect(period).toBe(56);
    });

    it('should return minimum period across multiple grounds', () => {
      // 14 days (serious arrears) vs 56 days (other arrears)
      const period = calculateWalesMinNoticePeriod([
        'rent_arrears_serious', // 14 days
        'rent_arrears_other', // 56 days
      ]);
      expect(period).toBe(14);
    });

    it('should return 60 days (default) for empty array', () => {
      expect(calculateWalesMinNoticePeriod([])).toBe(60);
    });

    it('should return 60 days (default) for undefined', () => {
      expect(calculateWalesMinNoticePeriod(undefined)).toBe(60);
    });

    it('should return 60 days (default) for null', () => {
      expect(calculateWalesMinNoticePeriod(null)).toBe(60);
    });
  });
});

describe('Single Source of Truth Verification', () => {
  it('should ensure UI and validator use same definitions', () => {
    // This test verifies that the WALES_FAULT_GROUNDS array can be used by both:
    // 1. UI (WalesNoticeSection.tsx) for displaying ground options
    // 2. Validator (mapWalesFaultGroundsToGroundCodes) for deriving ground_codes

    // Verify all grounds have the required properties for UI rendering
    for (const ground of WALES_FAULT_GROUNDS) {
      // UI needs these for display
      expect(ground.value).toBeDefined();
      expect(ground.label).toBeDefined();
      expect(ground.description).toBeDefined();

      // UI needs these for section badges
      expect(ground.section).toBeDefined();

      // Validator needs section for mapping
      expect([157, 159, 160, 161]).toContain(ground.section); // 160 for estate management
    }

    // Verify the mapping function uses the definitions
    const allValues = WALES_FAULT_GROUNDS.map((g) => g.value);
    const codes = mapWalesFaultGroundsToGroundCodes(allValues);

    // Should produce codes for all unique sections
    expect(codes.length).toBeGreaterThan(0);
    expect(codes.every((c) => c.startsWith('section_'))).toBe(true);
  });

  it('should not allow drift between UI and validator', () => {
    // If someone adds a ground to the UI but forgets to add it to WALES_FAULT_GROUNDS,
    // this test should catch it (assuming they remember to add a test case here)

    // Known UI grounds that must be in WALES_FAULT_GROUNDS
    const requiredGrounds = [
      'rent_arrears_serious',
      'rent_arrears_other',
      'antisocial_behaviour',
      'breach_of_contract',
      'false_statement',
      'domestic_abuse',
      'estate_management',
    ];

    const definedValues = WALES_FAULT_GROUNDS.map((g) => g.value);

    for (const required of requiredGrounds) {
      expect(definedValues).toContain(required);
    }
  });
});

describe('Wales Arrears Ground Detection Helpers', () => {
  describe('WALES_ARREARS_GROUND_VALUES', () => {
    it('should contain rent_arrears_serious', () => {
      expect(WALES_ARREARS_GROUND_VALUES).toContain('rent_arrears_serious');
    });

    it('should contain rent_arrears_other', () => {
      expect(WALES_ARREARS_GROUND_VALUES).toContain('rent_arrears_other');
    });

    it('should NOT contain non-arrears grounds', () => {
      expect(WALES_ARREARS_GROUND_VALUES).not.toContain('antisocial_behaviour');
      expect(WALES_ARREARS_GROUND_VALUES).not.toContain('breach_of_contract');
      expect(WALES_ARREARS_GROUND_VALUES).not.toContain('estate_management');
    });

    it('should match grounds with requiresArrearsSchedule=true', () => {
      const expectedValues = WALES_FAULT_GROUNDS
        .filter((g) => g.requiresArrearsSchedule)
        .map((g) => g.value);
      expect(WALES_ARREARS_GROUND_VALUES).toEqual(expectedValues);
    });
  });

  describe('hasWalesArrearsGroundSelected()', () => {
    it('should return true for rent_arrears_serious', () => {
      expect(hasWalesArrearsGroundSelected(['rent_arrears_serious'])).toBe(true);
    });

    it('should return true for rent_arrears_other', () => {
      expect(hasWalesArrearsGroundSelected(['rent_arrears_other'])).toBe(true);
    });

    it('should return true when arrears ground is mixed with non-arrears', () => {
      expect(hasWalesArrearsGroundSelected([
        'rent_arrears_serious',
        'antisocial_behaviour',
      ])).toBe(true);
    });

    it('should return false for non-arrears grounds only', () => {
      expect(hasWalesArrearsGroundSelected(['antisocial_behaviour'])).toBe(false);
      expect(hasWalesArrearsGroundSelected(['breach_of_contract'])).toBe(false);
      expect(hasWalesArrearsGroundSelected(['estate_management'])).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(hasWalesArrearsGroundSelected([])).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasWalesArrearsGroundSelected(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(hasWalesArrearsGroundSelected(null)).toBe(false);
    });
  });

  describe('hasWalesSection157Selected()', () => {
    it('should return true for rent_arrears_serious (Section 157)', () => {
      expect(hasWalesSection157Selected(['rent_arrears_serious'])).toBe(true);
    });

    it('should return true when Section 157 is mixed with others', () => {
      expect(hasWalesSection157Selected([
        'rent_arrears_serious',
        'breach_of_contract',
      ])).toBe(true);
    });

    it('should return false for rent_arrears_other (Section 159)', () => {
      expect(hasWalesSection157Selected(['rent_arrears_other'])).toBe(false);
    });

    it('should return false for non-Section-157 grounds', () => {
      expect(hasWalesSection157Selected(['breach_of_contract'])).toBe(false);
      expect(hasWalesSection157Selected(['antisocial_behaviour'])).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(hasWalesSection157Selected([])).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasWalesSection157Selected(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(hasWalesSection157Selected(null)).toBe(false);
    });
  });
});
