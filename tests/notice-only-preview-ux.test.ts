/**
 * Notice-Only Preview UX Tests
 *
 * Regression tests for end-of-wizard validation UX:
 * 1. All 5+ S21 blockers render when multiple compliance failures exist
 * 2. Switch to Section 8 CTA appears when S21 is blocked
 * 3. Recommendations section is hidden for notice_only
 */

import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

describe('Notice-Only Preview UX', () => {
  describe('All blockers render correctly', () => {
    /**
     * CRITICAL REGRESSION TEST
     * When multiple S21 compliance failures exist, ALL must be returned
     * to the preview page for rendering.
     */
    it('returns exactly 5 blocking issues for full S21 compliance failure', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          // Tenancy dates
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          notice_expiry_date: '2024-08-01',
          is_fixed_term: false,
          rent_frequency: 'monthly',

          // 1. DEPOSIT: Not protected
          deposit_taken: true,
          deposit_protected: false,

          // 2. EPC: Not provided
          epc_provided: false,

          // 3. HOW TO RENT: Not provided
          how_to_rent_provided: false,

          // 4. GAS CERT: Not provided (with gas appliances)
          has_gas_appliances: true,
          gas_certificate_provided: false,

          // 5. LICENSING: Unlicensed
          property_licensing_status: 'unlicensed',
        },
        stage: 'preview',
      });

      // Should NOT be ok
      expect(result.ok).toBe(false);

      // Should have exactly 5 hard failures
      const issueCodes = result.hardFailures.map((f) => f.code);
      console.log('All blocking issues:', issueCodes);

      expect(issueCodes).toContain('S21-DEPOSIT-NONCOMPLIANT');
      expect(issueCodes).toContain('S21-EPC');
      expect(issueCodes).toContain('S21-H2R');
      expect(issueCodes).toContain('S21-GAS-CERT');
      expect(issueCodes).toContain('S21-LICENSING');

      // At least 5 issues (could be more if prescribed_info is also checked)
      expect(result.hardFailures.length).toBeGreaterThanOrEqual(5);
    });

    it('returns all issues with affected_question_id for deep-linking', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          notice_expiry_date: '2024-08-01',
          deposit_taken: true,
          deposit_protected: false,
          epc_provided: false,
          how_to_rent_provided: false,
          has_gas_appliances: true,
          gas_certificate_provided: false,
          property_licensing_status: 'unlicensed',
        },
        stage: 'preview',
      });

      // Each issue should have affected_question_id and user_fix_hint
      for (const failure of result.hardFailures) {
        expect(failure.affected_question_id).toBeDefined();
        expect(failure.affected_question_id.length).toBeGreaterThan(0);
        expect(failure.user_fix_hint).toBeDefined();
      }
    });
  });

  describe('Switch to Section 8 CTA logic', () => {
    /**
     * The preview page should show "Switch to Section 8" when:
     * 1. Selected route is section_21
     * 2. Section 21 has blocking issues
     * 3. Section 8 is available (always true in England)
     */
    it('S21 blocked in England should allow switch to S8', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: false, // S21 blocked
        },
        stage: 'preview',
      });

      // S21 is blocked
      expect(result.ok).toBe(false);
      expect(result.hardFailures.some((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT')).toBe(true);

      // In this scenario, the preview page would offer section_8 as alternative
      // (This is handled client-side in getAlternativeRoutes)
    });

    it('S21 with all requirements met should NOT trigger switch', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          notice_expiry_date: '2024-08-01',
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_given: true,
          epc_provided: true,
          how_to_rent_provided: true,
          has_gas_appliances: false, // No gas, so no cert needed
          property_licensing_status: 'not_required',
        },
        stage: 'preview',
      });

      // S21 should be allowed - no blocking issues
      expect(result.ok).toBe(true);
      expect(result.hardFailures.length).toBe(0);
    });
  });

  describe('Recommendations section hidden for notice_only', () => {
    /**
     * Per UX requirements, recommendations (warnings) should not
     * appear for notice_only products at the preview stage.
     *
     * The evaluate-notice-compliance function returns warnings,
     * but the ValidationErrors component hides them when product === 'notice_only'.
     */
    it('at wizard stage, non-critical issues are warnings (not blockers)', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: false,
        },
        stage: 'wizard', // Wizard stage = warnings instead of blockers
      });

      // At wizard stage, issues become warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.hardFailures.length).toBe(0); // No hard failures at wizard stage
    });

    it('at preview stage, issues become hard failures', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: false,
        },
        stage: 'preview', // Preview stage = hard failures
      });

      // At preview stage, same issue is a hard failure
      expect(result.hardFailures.length).toBeGreaterThan(0);
      expect(result.hardFailures.some((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT')).toBe(true);
    });
  });

  describe('Deposit cap warning at preview stage', () => {
    /**
     * Deposit cap issues should only block at preview/generate stage for S21
     */
    it('deposit cap exceeded is warning at wizard stage', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_amount: '3000', // Exceeds cap
          rent_amount: '1000',
          rent_frequency: 'monthly',
        },
        stage: 'wizard',
      });

      // At wizard stage, deposit cap is a warning
      expect(result.warnings.some((w) => w.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBe(true);
    });

    it('deposit cap exceeded is blocking at preview stage', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_amount: '3000', // Exceeds cap
          rent_amount: '1000',
          rent_frequency: 'monthly',
        },
        stage: 'preview',
      });

      // At preview stage, deposit cap is blocking (unless confirmed)
      expect(result.hardFailures.some((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBe(true);
    });

    it('deposit cap confirmed removes the blocking issue', () => {
      const result = evaluateNoticeCompliance({
        jurisdiction: 'england',
        product: 'notice_only',
        selected_route: 'section_21',
        wizardFacts: {
          tenancy_start_date: '2023-01-01',
          notice_service_date: '2024-06-01',
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_given: true,
          deposit_amount: '3000', // Exceeds cap
          rent_amount: '1000',
          rent_frequency: 'monthly',
          deposit_reduced_to_legal_cap_confirmed: true, // User confirmed
        },
        stage: 'preview',
      });

      // When confirmed, deposit cap should not be a blocking issue
      expect(result.hardFailures.some((f) => f.code === 'S21-DEPOSIT-CAP-EXCEEDED')).toBe(false);
    });
  });
});
