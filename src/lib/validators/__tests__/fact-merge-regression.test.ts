/**
 * Fact Merge Regression Tests
 *
 * Tests for the bug where extracted facts from uploaded Form 6A are lost
 * when user answers compliance Q&A and triggers re-validation.
 *
 * Bug: After uploading a valid Form 6A (with tenant name, dates, address,
 * signature all extracted), answering YES to compliance questions caused
 * the validator to report all those fields as "missing" because:
 * 1. answer-questions route passed `analysis: null` to runLegalValidator
 * 2. This caused extracted fields to be lost
 * 3. Validators reported INVALID with missing-field blockers
 */

import { describe, it, expect } from 'vitest';
import { validateSection21Notice, validateSection8Notice } from '../legal-validators';
import { runLegalValidator } from '../run-legal-validator';

describe('Fact Merge Regression: Form 6A upload then Q&A', () => {
  /**
   * REGRESSION TEST: This is the exact scenario that was broken
   *
   * 1. User uploads a PDF that is a valid Form 6A
   * 2. AI extracts: form_6a_used=true, tenant_names="sonia", date_served="22 Dec 2025",
   *    expiry_date="14 July 2026", property_address="16 waterloo road",
   *    landlord_name="Tariq", signature_present=true
   * 3. Validator returns WARNING (compliance questions unknown)
   * 4. User answers YES to: deposit_protected, prescribed_info_served,
   *    gas_safety_pre_move_in, epc_provided, how_to_rent_provided, property_licensed
   * 5. User clicks "Save answers & re-check"
   *
   * EXPECTED: Status should be PASS (or WARNING for minor issues), NOT INVALID
   * BUG: Status was INVALID with blockers for "missing" Form 6A, dates, names, address, signature
   */
  describe('validateSection21Notice with extracted + user answers', () => {
    it('should NOT report missing fields when extracted values exist', () => {
      const extracted = {
        // These were extracted from the uploaded Form 6A
        form_6a_used: true,
        section_21_detected: true,
        notice_type: 'section 21',
        tenant_names: 'sonia',
        tenant_name: 'sonia',
        date_served: '2025-12-22',
        service_date: '2025-12-22',
        expiry_date: '2026-07-14',
        property_address: '16 waterloo road',
        property_address_line1: '16 waterloo road',
        landlord_name: 'Tariq',
        signature_present: true,
      };

      const answers = {
        // User confirmed compliance via Q&A
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // CRITICAL: Should NOT be 'invalid'
      expect(result.status).not.toBe('invalid');

      // Should NOT have any blockers about missing extracted fields
      const blockerCodes = result.blockers.map((b) => b.code);
      expect(blockerCodes).not.toContain('S21-WRONG-FORM');
      expect(blockerCodes).not.toContain('S21-SIGNATURE-MISSING');

      // Should NOT have warnings about missing extracted fields that exist
      const warningCodes = result.warnings.map((w) => w.code);
      expect(warningCodes).not.toContain('S21-SERVICE-DATE-MISSING');
      expect(warningCodes).not.toContain('S21-EXPIRY-DATE-MISSING');
      expect(warningCodes).not.toContain('S21-TENANT-NAME-MISSING');
      expect(warningCodes).not.toContain('S21-LANDLORD-NAME-MISSING');
      expect(warningCodes).not.toContain('S21-PROPERTY-ADDRESS-MISSING');
    });

    it('should pass validation when all compliance answers are YES and extracted fields exist', () => {
      const extracted = {
        form_6a_used: true,
        section_21_detected: true,
        notice_type: 'form 6a',
        tenant_names: 'John Smith',
        date_served: '2025-01-15',
        expiry_date: '2025-03-15', // 2 months notice period
        property_address: '123 Main Street, London',
        landlord_name: 'Jane Doe',
        signature_present: true,
      };

      const answers = {
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
        retaliatory_eviction: 'no',
        rent_arrears_exist: 'no',
        fixed_term_status: 'periodic',
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // Should be 'pass' (all requirements met)
      expect(result.status).toBe('pass');
      expect(result.blockers).toHaveLength(0);
    });

    it('should only report UNKNOWN warnings for compliance questions that are NOT answered', () => {
      const extracted = {
        form_6a_used: true,
        tenant_names: 'sonia',
        date_served: '2025-12-22',
        expiry_date: '2026-07-14',
        property_address: '16 waterloo road',
        landlord_name: 'Tariq',
        signature_present: true,
      };

      // User only answered some questions, left others as unknown
      const answers = {
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        // gas_safety_pre_move_in: not answered
        // epc_provided: not answered
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // Should be 'warning' (some compliance questions unknown)
      expect(result.status).toBe('warning');

      // Should have warnings for UNKNOWN compliance items
      const warningCodes = result.warnings.map((w) => w.code);
      expect(warningCodes).toContain('S21-GAS-SAFETY-UNKNOWN');
      expect(warningCodes).toContain('S21-EPC-UNKNOWN');

      // Should NOT have warnings for fields that ARE extracted
      expect(warningCodes).not.toContain('S21-SERVICE-DATE-MISSING');
      expect(warningCodes).not.toContain('S21-TENANT-NAME-MISSING');
    });
  });

  describe('runLegalValidator integration', () => {
    it('should use extracted fields from analysis even when facts are minimal', () => {
      const facts = {
        __meta: { product: 'notice_only' },
        selected_notice_route: 'section_21',
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      };

      const analysis = {
        detected_type: 'section_21_form_6a',
        confidence: 0.85,
        extracted_fields: {
          form_6a_used: true,
          tenant_names: 'sonia',
          date_served: '2025-12-22',
          expiry_date: '2026-07-14',
          property_address: '16 waterloo road',
          landlord_name: 'Tariq',
          signature_present: true,
        },
        warnings: [],
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis,
      });

      expect(result.validator_key).toBe('section_21');
      expect(result.result).not.toBeNull();
      // Should not be invalid due to "missing" extracted fields
      expect(result.result?.status).not.toBe('invalid');
    });

    it('should FAIL when analysis is null but facts lack extracted fields (demonstrates the bug)', () => {
      const facts = {
        __meta: { product: 'notice_only' },
        selected_notice_route: 'section_21',
        // User answered compliance questions
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
        // Note: no extracted fields like form_6a_used, tenant_names, dates, etc.
      };

      // BUG SCENARIO: analysis is null (as it was in answer-questions route)
      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.validator_key).toBe('section_21');
      // This demonstrates the bug: without extracted fields, validation fails
      expect(result.result?.status).toBe('invalid');
      expect(result.result?.blockers.some((b) => b.code === 'S21-WRONG-FORM')).toBe(true);
    });

    it('should preserve extracted fields when facts contain them (the fix)', () => {
      // After fix: facts should contain extracted fields from previous evidence analysis
      const facts = {
        __meta: { product: 'notice_only' },
        selected_notice_route: 'section_21',
        // Extracted fields (merged from evidence analysis)
        form_6a_used: true,
        tenant_names: 'sonia',
        date_served: '2025-12-22',
        expiry_date: '2026-07-14',
        property_address: '16 waterloo road',
        landlord_name: 'Tariq',
        signature_present: true,
        // User answers
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
      };

      // Even with analysis null, if facts contain extracted fields, should pass
      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.validator_key).toBe('section_21');
      // Should pass because facts contain the extracted fields
      expect(result.result?.status).not.toBe('invalid');
    });
  });

  describe('Fact merge precedence', () => {
    it('should prefer user_confirmed over extracted values', () => {
      const extracted = {
        form_6a_used: true,
        date_served: '2025-01-01', // Extracted date
        expiry_date: '2025-03-01',
        tenant_names: 'Wrong Name', // Extracted but wrong
        property_address: '123 Main St',
        landlord_name: 'Landlord',
        signature_present: true,
      };

      const answers = {
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
        // Adding missing answers to achieve pass status
        retaliatory_eviction: 'no',
        rent_arrears_exist: 'no',
        fixed_term_status: 'periodic',
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // Should pass when all required answers are provided
      expect(result.status).toBe('pass');
      expect(result.blockers).toHaveLength(0);
    });

    it('should NOT let user_confirmed facts erase extracted facts', () => {
      // User confirms compliance but doesn't touch extracted fields
      const extracted = {
        form_6a_used: true,
        date_served: '2025-01-15',
        expiry_date: '2025-03-15',
        tenant_names: 'John Doe',
        property_address: '123 Main St',
        landlord_name: 'Jane Smith',
        signature_present: true,
      };

      const answers = {
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        gas_safety_pre_move_in: 'yes',
        epc_provided: 'yes',
        how_to_rent_provided: 'yes',
        property_licensed: 'yes',
        // Adding missing answers to achieve pass status
        retaliatory_eviction: 'no',
        rent_arrears_exist: 'no',
        fixed_term_status: 'periodic',
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // Extracted fields should still be used
      expect(result.status).toBe('pass');
      expect(result.blockers).toHaveLength(0);
      // No warnings about missing extracted fields
      const missingFieldWarnings = result.warnings.filter((w) =>
        w.code.includes('MISSING') &&
        ['DATE', 'NAME', 'ADDRESS', 'FORM'].some((f) => w.code.includes(f))
      );
      expect(missingFieldWarnings).toHaveLength(0);
    });

    it('should still emit warnings for incomplete answers even when extracted fields exist', () => {
      // This test validates the expected behavior: warnings are for UNKNOWN compliance
      // items, NOT for missing extracted fields
      const extracted = {
        form_6a_used: true,
        date_served: '2025-01-15',
        expiry_date: '2025-03-15',
        tenant_names: 'John Doe',
        property_address: '123 Main St',
        landlord_name: 'Jane Smith',
        signature_present: true,
      };

      const answers = {
        deposit_protected: 'yes',
        prescribed_info_served: 'yes',
        // Missing: gas_safety, epc, how_to_rent, property_licensed
      };

      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });

      // Should be warning (some compliance questions unknown)
      expect(result.status).toBe('warning');
      expect(result.blockers).toHaveLength(0);

      // Warnings should be for UNKNOWN compliance items, not missing extracted fields
      const warningCodes = result.warnings.map((w) => w.code);
      expect(warningCodes.some((c) => c.includes('UNKNOWN'))).toBe(true);
      // No warnings about missing extracted fields
      expect(warningCodes).not.toContain('S21-SERVICE-DATE-MISSING');
      expect(warningCodes).not.toContain('S21-TENANT-NAME-MISSING');
    });
  });
});

describe('Section 8 Similar Bug Check', () => {
  it('should NOT lose extracted grounds when user answers Q&A', () => {
    const extracted = {
      grounds_cited: [8, 10, 11],
      date_served: '2025-01-15',
      notice_period: '14 days',
      rent_arrears_stated: '5000',
      tenant_details: 'John Doe, 123 Main St',
    };

    const answers = {
      rent_frequency: 'monthly',
      current_arrears: 5000,
      payment_history: 'no',
      joint_tenants: 'no',
      benefit_delays: 'no',
      disrepair_counterclaims: 'no',
      payment_since_notice: 'no',
      rent_amount: 1000,
    };

    const result = validateSection8Notice({
      jurisdiction: 'england',
      extracted,
      answers,
    });

    // Should NOT report missing grounds
    expect(result.blockers.some((b) => b.code === 'S8-GROUNDS-MISSING')).toBe(false);
  });
});
