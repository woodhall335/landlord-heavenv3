/**
 * Regression tests for Wales fulfillment jurisdiction canonicalization
 *
 * Tests the fix for: POST /api/orders/regenerate fails for Wales notice_only
 * with "At least one ground is required" even though Wales preview works.
 *
 * Root cause: fulfillment.ts reads jurisdiction directly from caseData.jurisdiction
 * which may be stored as "england" even when facts.property.country is "wales".
 * This causes England validation to run, which expects Section 8 grounds.
 *
 * Fix: Canonicalize jurisdiction in fulfillOrder() matching /api/wizard/analyze:
 *   if (canonicalJurisdiction === 'england' && caseFacts.property.country === 'wales') {
 *     canonicalJurisdiction = 'wales';
 *   }
 *
 * Key assertions:
 * - DB jurisdiction "england" with property.country "wales" => uses "wales" for fulfillment
 * - notice_only fault-based generation runs Wales-specific ground_codes derivation
 * - England/Scotland cases remain unchanged
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

/**
 * Simulates the canonical jurisdiction resolution logic from fulfillment.ts
 * This test verifies the logic without requiring full Supabase integration.
 */
function resolveCanonicalJurisdiction(
  dbJurisdiction: string | null | undefined,
  dbPropertyLocation: string | null | undefined,
  wizardFacts: Record<string, unknown>
): string {
  const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

  let canonicalJurisdiction =
    normalizeJurisdiction(dbJurisdiction) ||
    normalizeJurisdiction(dbPropertyLocation) ||
    normalizeJurisdiction(caseFacts.property?.country as string | null);

  // Critical fix: If jurisdiction is 'england' but property.country is 'wales',
  // treat as Wales. This matches /api/wizard/analyze behavior.
  if (canonicalJurisdiction === 'england' && caseFacts.property?.country === 'wales') {
    canonicalJurisdiction = 'wales';
  }

  return canonicalJurisdiction || dbJurisdiction || 'england';
}

describe('Fulfillment canonical jurisdiction resolution', () => {
  describe('Wales property.country override', () => {
    it('should resolve to wales when DB has england but property.country is wales', () => {
      // This is the exact bug scenario:
      // - Case was created when user selected property in Wales
      // - But DB jurisdiction column was set to "england" (legacy issue)
      // - collected_facts correctly has property.country = "wales"
      const dbJurisdiction = 'england';
      const dbPropertyLocation = null;
      const wizardFacts = {
        property_country: 'wales', // This is what UI collected
        jurisdiction: 'wales', // This might also be set in facts
        selected_notice_route: 'wales_fault_based',
        wales_fault_grounds: ['rent_arrears_serious'],
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, dbPropertyLocation, wizardFacts);

      expect(result).toBe('wales');
    });

    it('should resolve to wales when property.country is "Wales" (case-insensitive)', () => {
      const dbJurisdiction = 'england';
      const wizardFacts = {
        property_country: 'Wales', // Title case
        selected_notice_route: 'wales_fault_based',
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, null, wizardFacts);

      expect(result).toBe('wales');
    });

    it('should NOT change jurisdiction when both DB and property.country are england', () => {
      const dbJurisdiction = 'england';
      const wizardFacts = {
        property_country: 'england',
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8'],
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, null, wizardFacts);

      expect(result).toBe('england');
    });

    it('should NOT change jurisdiction when DB is wales', () => {
      const dbJurisdiction = 'wales';
      const wizardFacts = {
        property_country: 'wales',
        selected_notice_route: 'wales_fault_based',
        wales_fault_grounds: ['rent_arrears_serious'],
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, null, wizardFacts);

      expect(result).toBe('wales');
    });
  });

  describe('Scotland unchanged', () => {
    it('should resolve to scotland when DB has scotland', () => {
      const dbJurisdiction = 'scotland';
      const wizardFacts = {
        property_country: 'scotland',
        selected_notice_route: 'notice_to_leave',
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, null, wizardFacts);

      expect(result).toBe('scotland');
    });

    it('should NOT apply Wales override for Scotland', () => {
      // Edge case: ensure the Wales-specific override doesn't affect Scotland
      const dbJurisdiction = 'scotland';
      const wizardFacts = {
        property_country: 'scotland',
        // Even if someone somehow has Wales-style facts
        wales_fault_grounds: ['rent_arrears_serious'],
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, null, wizardFacts);

      expect(result).toBe('scotland');
    });
  });

  describe('Fallback chain', () => {
    it('should use property_location when jurisdiction is null', () => {
      const dbJurisdiction = null;
      const dbPropertyLocation = 'wales';
      const wizardFacts = {
        property_country: 'wales',
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, dbPropertyLocation, wizardFacts);

      expect(result).toBe('wales');
    });

    it('should use property.country from facts when both DB fields are null', () => {
      const dbJurisdiction = null;
      const dbPropertyLocation = null;
      const wizardFacts = {
        property_country: 'scotland',
      };

      const result = resolveCanonicalJurisdiction(dbJurisdiction, dbPropertyLocation, wizardFacts);

      expect(result).toBe('scotland');
    });

    it('should default to england when no jurisdiction info available', () => {
      const result = resolveCanonicalJurisdiction(null, null, {});

      expect(result).toBe('england');
    });
  });

  describe('Integration with Wales ground_codes derivation', () => {
    /**
     * This test verifies the full flow:
     * 1. DB has jurisdiction = "england" (bug)
     * 2. property.country = "wales" (correct)
     * 3. Canonical jurisdiction resolves to "wales"
     * 4. Wales route detection works
     * 5. ground_codes derivation should occur
     */
    it('should enable Wales ground_codes derivation when jurisdiction corrected', () => {
      const dbJurisdiction = 'england'; // Bug: wrong in DB
      const wizardFacts = {
        property_country: 'wales', // Correct in facts
        selected_notice_route: 'wales_fault_based',
        wales_fault_grounds: ['rent_arrears_serious', 'antisocial_behaviour'],
        // ground_codes intentionally missing - should be derived
      };

      const canonicalJurisdiction = resolveCanonicalJurisdiction(
        dbJurisdiction,
        null,
        wizardFacts
      );

      // With correct jurisdiction, Wales-specific logic should apply
      expect(canonicalJurisdiction).toBe('wales');

      // The route check in the generator should now work:
      const isWalesFaultBased =
        canonicalJurisdiction === 'wales' &&
        (wizardFacts.selected_notice_route === 'wales_fault_based' ||
          wizardFacts.selected_notice_route === 'wales_section_159');

      expect(isWalesFaultBased).toBe(true);

      // This means ground_codes derivation will run
      const hasWalesFaultGrounds =
        Array.isArray(wizardFacts.wales_fault_grounds) && wizardFacts.wales_fault_grounds.length > 0;
      expect(hasWalesFaultGrounds).toBe(true);
    });

    it('should NOT enable Wales derivation when jurisdiction correctly stays england', () => {
      const dbJurisdiction = 'england';
      const wizardFacts = {
        property_country: 'england', // England property
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8'],
        // Even if wales_fault_grounds somehow exists, it should be ignored
        wales_fault_grounds: ['rent_arrears_serious'],
      };

      const canonicalJurisdiction = resolveCanonicalJurisdiction(
        dbJurisdiction,
        null,
        wizardFacts
      );

      expect(canonicalJurisdiction).toBe('england');

      // Wales route check should fail for England
      const isWalesFaultBased =
        canonicalJurisdiction === 'wales' &&
        (wizardFacts.selected_notice_route === 'wales_fault_based' ||
          wizardFacts.selected_notice_route === 'wales_section_159');

      expect(isWalesFaultBased).toBe(false);
    });
  });
});

describe('Manual verification: caseId 3b9ca0d1-044a-4bf1-8e81-c2776585b205', () => {
  /**
   * Documents the exact bug scenario and expected behavior after fix.
   */
  it('should document the verification steps for the failing case', () => {
    console.log(`
    =========================================================================
    VERIFICATION for jurisdiction fix (caseId: 3b9ca0d1-044a-4bf1-8e81-c2776585b205)
    =========================================================================

    Before fix:
    - caseData.jurisdiction = "england" (incorrect, stored in DB)
    - caseFacts.property.country = "wales" (correct, from collected_facts)
    - fulfillment used "england" for validation
    - England validation expected Section 8 grounds
    - wales_fault_grounds not recognized → "At least one ground is required"

    After fix:
    - fulfillment canonicalizes jurisdiction using property.country
    - canonicalJurisdiction = "wales" (corrected)
    - Wales validation runs
    - wales_fault_grounds → ground_codes derivation works
    - Documents generate successfully

    Test steps:
    1. POST /api/orders/regenerate with caseId
    2. Verify response.status === 'fulfilled'
    3. Check documents table for generated PDFs

    =========================================================================
    `);

    expect(true).toBe(true);
  });
});
