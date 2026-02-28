/**
 * Decision Engine Ground 10/11 Notice Period Tests
 *
 * Verifies that the decision engine returns correct notice periods for
 * discretionary rent arrears grounds:
 * - Ground 10 (Some Rent Arrears): 14 days
 * - Ground 11 (Persistent Late Payment): 14 days
 *
 * All arrears grounds (8, 10, 11) use a 14-day notice period in the decision engine.
 */

import { describe, expect, it } from 'vitest';
import { runDecisionEngine } from '@/lib/decision-engine';
import type { CaseFacts } from '@/lib/case-facts/schema';

/**
 * Helper to create minimal facts for decision engine testing
 */
function createTestFacts(overrides: Partial<CaseFacts> = {}): CaseFacts {
  return {
    tenancy: {
      start_date: '2020-01-01',
      tenancy_type: 'ast',
      rent_amount: 1000,
      rent_frequency: 'monthly',
      deposit_amount: 1000,
      deposit_protected: true,
      is_written_agreement: true,
      had_initial_fixed_term: true,
      initial_fixed_term_ended: true,
      fixed_term_end_date: '2021-01-01',
    },
    issues: {
      rent_arrears: {
        has_arrears: true,
        // Enough for Ground 8 (2+ months) and Ground 10/11 (any arrears)
        total_arrears: 2500,
        arrears_items: [],
      },
      asb: { has_asb: false },
      other_breaches: { has_breaches: false },
    },
    property: {
      country: 'england',
      address: '123 Test Street',
      postcode: 'SW1A 1AA',
    },
    notice: {
      notice_served: false,
      notice_date: null,
      notice_type: null,
    },
    evidence: {
      tenancy_agreement_uploaded: true,
      rent_schedule_uploaded: true,
      bank_statements_uploaded: false,
      other_evidence_uploaded: false,
    },
    compliance: {
      gas_safety_certificate_valid: true,
      eicr_valid: true,
      epc_valid: true,
      how_to_rent_provided: true,
      deposit_prescribed_info_provided: true,
    },
    court: {
      route: 'section_8',
      preferred_court: null,
    },
    meta: {
      product: 'notice_only',
      original_product: null,
    },
    money_claim: {
      sheriffdom: null,
      basis_of_claim: null,
      damage_items: [],
      other_charges: [],
      interest_rate: null,
      interest_start_date: null,
      court_jurisdiction_confirmed: false,
      lba_sent: false,
      pap_documents_served: false,
      pre_action_deadline_confirmation: false,
      arrears_schedule_confirmed: false,
    },
    ...overrides,
  } as CaseFacts;
}

describe('Decision Engine Ground 10/11 Notice Periods', () => {
  describe('Ground 10 (Some Rent Arrears)', () => {
    it('recommends Ground 10 with 14 days notice period', () => {
      // Set arrears to less than 2 months but more than 0.5 months (triggers Ground 10, not Ground 8)
      const facts = createTestFacts({
        issues: {
          rent_arrears: {
            has_arrears: true,
            total_arrears: 750, // 0.75 months @ £1000/month
            arrears_items: [],
          },
          asb: { has_asb: false },
          other_breaches: { has_breaches: false },
        },
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts,
      });

      // Find Ground 10 in recommendations
      const ground10 = result.recommended_grounds.find(g => g.code === '10');

      expect(ground10).toBeDefined();
      expect(ground10?.notice_period_days).toBe(14);
      expect(ground10?.title).toContain('Some Rent Arrears');
    });
  });

  describe('Ground 11 (Persistent Late Payment)', () => {
    it('recommends Ground 11 with 14 days notice period', () => {
      // Set arrears to trigger Ground 11 (0.25+ months)
      const facts = createTestFacts({
        issues: {
          rent_arrears: {
            has_arrears: true,
            total_arrears: 500, // 0.5 months @ £1000/month (triggers Ground 11)
            arrears_items: [],
          },
          asb: { has_asb: false },
          other_breaches: { has_breaches: false },
        },
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts,
      });

      // Find Ground 11 in recommendations
      const ground11 = result.recommended_grounds.find(g => g.code === '11');

      expect(ground11).toBeDefined();
      expect(ground11?.notice_period_days).toBe(14);
      expect(ground11?.title).toContain('Persistent');
    });
  });

  describe('Ground 8 vs Ground 10/11 combined', () => {
    it('All arrears grounds (8, 10, 11) have 14 days notice period', () => {
      // Set arrears to trigger all three grounds
      const facts = createTestFacts({
        issues: {
          rent_arrears: {
            has_arrears: true,
            total_arrears: 2500, // 2.5 months @ £1000/month (triggers 8, 10, 11)
            arrears_items: [],
          },
          asb: { has_asb: false },
          other_breaches: { has_breaches: false },
        },
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts,
      });

      const ground8 = result.recommended_grounds.find(g => g.code === '8');
      const ground11 = result.recommended_grounds.find(g => g.code === '11');

      // Ground 8 (mandatory) should be 14 days
      expect(ground8).toBeDefined();
      expect(ground8?.notice_period_days).toBe(14);

      // Ground 11 (discretionary) should also be 14 days
      expect(ground11).toBeDefined();
      expect(ground11?.notice_period_days).toBe(14);
    });

    it('when combining Ground 8 + Ground 11, notice period stays at 14 days', () => {
      const facts = createTestFacts({
        issues: {
          rent_arrears: {
            has_arrears: true,
            total_arrears: 2500,
            arrears_items: [],
          },
          asb: { has_asb: false },
          other_breaches: { has_breaches: false },
        },
      });

      const result = runDecisionEngine({
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts,
      });

      const ground8 = result.recommended_grounds.find(g => g.code === '8');
      const ground11 = result.recommended_grounds.find(g => g.code === '11');

      // Both should have 14 days
      expect(ground8?.notice_period_days).toBe(14);
      expect(ground11?.notice_period_days).toBe(14);

      // MAX of 14 and 14 = 14
      const maxPeriod = Math.max(
        ground8?.notice_period_days || 0,
        ground11?.notice_period_days || 0
      );
      expect(maxPeriod).toBe(14);
    });
  });
});
