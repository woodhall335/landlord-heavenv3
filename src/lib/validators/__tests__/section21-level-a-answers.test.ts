/**
 * Section 21 Level A Answer Flow Tests
 *
 * These tests verify that Section 21 Level A questions are properly:
 * 1. Normalized from Level A keys to canonical validator keys
 * 2. Used to update validation results
 * 3. Reflected in next_questions (removing answered questions)
 * 4. Affecting validation status appropriately
 *
 * This is a regression test to ensure parity with Section 8 Level A handling.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeLevelAFactsToCanonical,
  LEVEL_A_TO_CANONICAL_KEYS,
  getLevelAQuestions,
  getLevelAFactKeys,
  isLevelAFactKey,
} from '../facts/factKeys';
import { runLegalValidator } from '../run-legal-validator';

describe('Section 21 Level A Answer Flow', () => {
  describe('LEVEL_A_TO_CANONICAL_KEYS includes S21 keys', () => {
    it('should have mappings for all S21 Level A keys', () => {
      // Section 21 Level A keys that should be mapped
      const s21LevelAKeys = [
        'deposit_protected_within_30_days',
        'prescribed_info_within_30_days',
        'gas_safety_before_move_in',
        'epc_provided_to_tenant',
        'how_to_rent_guide_provided',
        'property_licensing_compliant',
      ];

      for (const key of s21LevelAKeys) {
        expect(LEVEL_A_TO_CANONICAL_KEYS[key]).toBeDefined();
        expect(typeof LEVEL_A_TO_CANONICAL_KEYS[key]).toBe('string');
      }
    });

    it('should map S21 Level A keys to correct canonical keys', () => {
      expect(LEVEL_A_TO_CANONICAL_KEYS['deposit_protected_within_30_days']).toBe('deposit_protected');
      expect(LEVEL_A_TO_CANONICAL_KEYS['prescribed_info_within_30_days']).toBe('prescribed_info_served');
      expect(LEVEL_A_TO_CANONICAL_KEYS['gas_safety_before_move_in']).toBe('gas_safety_pre_move_in');
      expect(LEVEL_A_TO_CANONICAL_KEYS['epc_provided_to_tenant']).toBe('epc_provided');
      expect(LEVEL_A_TO_CANONICAL_KEYS['how_to_rent_guide_provided']).toBe('how_to_rent_provided');
      expect(LEVEL_A_TO_CANONICAL_KEYS['property_licensing_compliant']).toBe('licence_held');
    });
  });

  describe('normalizeLevelAFactsToCanonical for S21', () => {
    it('should convert yes/no S21 answers to boolean canonical keys', () => {
      const facts = {
        deposit_protected_within_30_days: 'yes',
        prescribed_info_within_30_days: 'yes',
        gas_safety_before_move_in: 'no',
        epc_provided_to_tenant: 'yes',
        how_to_rent_guide_provided: 'yes',
        property_licensing_compliant: 'yes',
      };

      const normalized = normalizeLevelAFactsToCanonical(facts);

      // Should have canonical keys with boolean values
      expect(normalized.deposit_protected).toBe(true);
      expect(normalized.prescribed_info_served).toBe(true);
      expect(normalized.gas_safety_pre_move_in).toBe(false);
      expect(normalized.epc_provided).toBe(true);
      expect(normalized.how_to_rent_provided).toBe(true);
      expect(normalized.licence_held).toBe(true);
    });

    it('should not set canonical key for not_sure answers', () => {
      const facts = {
        deposit_protected_within_30_days: 'not_sure',
        epc_provided_to_tenant: 'yes',
      };

      const normalized = normalizeLevelAFactsToCanonical(facts);

      // deposit_protected should NOT be set (not_sure means unknown)
      expect(normalized.deposit_protected).toBeUndefined();
      // epc_provided SHOULD be set
      expect(normalized.epc_provided).toBe(true);
    });

    it('should preserve original Level A keys alongside canonical keys', () => {
      const facts = {
        deposit_protected_within_30_days: 'yes',
      };

      const normalized = normalizeLevelAFactsToCanonical(facts);

      // Should have both Level A and canonical keys
      expect(normalized.deposit_protected_within_30_days).toBe('yes');
      expect(normalized.deposit_protected).toBe(true);
    });

    it('should handle mixed S8 and S21 Level A keys', () => {
      const facts = {
        // S21 Level A keys
        deposit_protected_within_30_days: 'yes',
        epc_provided_to_tenant: 'no',
        // S8 Level A keys
        rent_frequency_confirmed: 'monthly',
        rent_amount_confirmed: '1500.00',
        current_arrears_amount: '3000',
      };

      const normalized = normalizeLevelAFactsToCanonical(facts);

      // S21 canonical keys
      expect(normalized.deposit_protected).toBe(true);
      expect(normalized.epc_provided).toBe(false);
      // S8 canonical keys
      expect(normalized.rent_frequency).toBe('monthly');
      expect(normalized.rent_amount).toBe(1500);
      expect(normalized.current_arrears).toBe(3000);
    });
  });

  describe('getLevelAQuestions for S21', () => {
    it('should return S21 Level A questions', () => {
      const questions = getLevelAQuestions('section_21');

      // Should have S21 Level A questions
      expect(questions.length).toBeGreaterThan(0);

      const factKeys = questions.map((q) => q.factKey);
      expect(factKeys).toContain('deposit_protected_within_30_days');
      expect(factKeys).toContain('prescribed_info_within_30_days');
      expect(factKeys).toContain('gas_safety_before_move_in');
      expect(factKeys).toContain('epc_provided_to_tenant');
      expect(factKeys).toContain('how_to_rent_guide_provided');
      expect(factKeys).toContain('property_licensing_compliant');
    });

    it('should filter out answered questions', () => {
      const answeredKeys = ['deposit_protected_within_30_days', 'epc_provided_to_tenant'];
      const questions = getLevelAQuestions('section_21', answeredKeys);

      const factKeys = questions.map((q) => q.factKey);
      expect(factKeys).not.toContain('deposit_protected_within_30_days');
      expect(factKeys).not.toContain('epc_provided_to_tenant');
      expect(factKeys).toContain('prescribed_info_within_30_days');
    });

    it('should return all questions when none answered', () => {
      const allQuestions = getLevelAQuestions('section_21', []);
      const noAnswers = getLevelAQuestions('section_21');

      expect(allQuestions.length).toBe(noAnswers.length);
    });
  });

  describe('getLevelAFactKeys for S21', () => {
    it('should return all S21 Level A fact keys', () => {
      const keys = getLevelAFactKeys('section_21');

      expect(keys).toContain('deposit_protected_within_30_days');
      expect(keys).toContain('prescribed_info_within_30_days');
      expect(keys).toContain('gas_safety_before_move_in');
      expect(keys).toContain('epc_provided_to_tenant');
      expect(keys).toContain('how_to_rent_guide_provided');
      expect(keys).toContain('property_licensing_compliant');
      expect(keys).toContain('tenancy_periodic_not_fixed');
    });
  });

  describe('isLevelAFactKey', () => {
    it('should return true for S21 Level A keys', () => {
      expect(isLevelAFactKey('deposit_protected_within_30_days')).toBe(true);
      expect(isLevelAFactKey('prescribed_info_within_30_days')).toBe(true);
      expect(isLevelAFactKey('gas_safety_before_move_in')).toBe(true);
      expect(isLevelAFactKey('epc_provided_to_tenant')).toBe(true);
    });

    it('should return false for canonical keys', () => {
      expect(isLevelAFactKey('deposit_protected')).toBe(false);
      expect(isLevelAFactKey('prescribed_info_served')).toBe(false);
      expect(isLevelAFactKey('epc_provided')).toBe(false);
    });
  });

  describe('runLegalValidator with S21 Level A answers', () => {
    const baseFacts = {
      selected_notice_route: 'section_21',
      // Form detection - both keys needed for validator + extraction
      form_6a_present: true,
      form_6a_detected: true,
      section_21_detected: true,
      notice_type: 'Section 21 Notice',
      // Core notice fields
      service_date: '2025-01-01',
      expiry_date: '2025-03-02',
      signature_present: true,
      // Property and tenant details
      property_address: '123 Test Street, London, SW1A 1AA',
      tenant_names: 'John Doe',
      landlord_name: 'Jane Landlord',
      // Compliance prerequisites
      deposit_taken: true,
      gas_appliances_present: true,
      licence_required: false,
    };

    it('should process Level A answers and update validation', () => {
      const facts = {
        ...baseFacts,
        // Level A answers (using Level A keys)
        deposit_protected_within_30_days: 'yes',
        prescribed_info_within_30_days: 'yes',
        gas_safety_before_move_in: 'yes',
        epc_provided_to_tenant: 'yes',
        how_to_rent_guide_provided: 'yes',
        property_licensing_compliant: 'yes',
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.validator_key).toBe('section_21');
      expect(result.result).toBeDefined();

      // Should not have deposit/prescribed info blockers (answered yes)
      const depositBlocker = result.result?.blockers?.find((b) => b.code === 'S21-DEPOSIT-PROTECTED');
      const prescribedBlocker = result.result?.blockers?.find((b) => b.code === 'S21-PRESCRIBED-INFO');
      expect(depositBlocker).toBeUndefined();
      expect(prescribedBlocker).toBeUndefined();

      // Should pass or have only minor warnings (no blockers)
      // Note: With all Level A answers as 'yes', validation should pass or have only non-blocking warnings
      expect(result.result?.blockers ?? []).toHaveLength(0);
      expect(['pass', 'valid_with_warnings', 'warning', 'valid']).toContain(result.result?.status);
    });

    it('should return blockers when Level A answer is no', () => {
      const facts = {
        ...baseFacts,
        // Deposit not protected - should be a blocker
        deposit_protected_within_30_days: 'no',
        prescribed_info_within_30_days: 'yes',
        gas_safety_before_move_in: 'yes',
        epc_provided_to_tenant: 'yes',
        how_to_rent_guide_provided: 'yes',
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.validator_key).toBe('section_21');
      expect(result.result?.status).toBe('invalid');

      // Should have deposit protection blocker
      const depositBlocker = result.result?.blockers?.find(
        (b) => b.code === 'S21-DEPOSIT-PROTECTED' || b.message?.toLowerCase().includes('deposit')
      );
      expect(depositBlocker).toBeDefined();
    });

    it('should return Level A questions when answers are missing', () => {
      const facts = {
        ...baseFacts,
        // No Level A answers provided
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.validator_key).toBe('section_21');
      expect(result.level_a_mode).toBe(true);

      // Should have Level A questions for unanswered compliance checks
      expect(result.level_a_questions).toBeDefined();
      expect(result.level_a_questions?.length).toBeGreaterThan(0);

      const questionKeys = result.level_a_questions?.map((q) => q.factKey);
      expect(questionKeys).toContain('deposit_protected_within_30_days');
    });

    it('should remove answered questions from level_a_questions', () => {
      const facts = {
        ...baseFacts,
        // Some Level A answers provided
        deposit_protected_within_30_days: 'yes',
        prescribed_info_within_30_days: 'yes',
        // Others not answered yet
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.level_a_mode).toBe(true);

      // Should have remaining questions (not deposit or prescribed info)
      const questionKeys = result.level_a_questions?.map((q) => q.factKey) ?? [];
      expect(questionKeys).not.toContain('deposit_protected_within_30_days');
      expect(questionKeys).not.toContain('prescribed_info_within_30_days');

      // Should still have unanswered questions
      expect(questionKeys.length).toBeGreaterThan(0);
    });

    it('should have empty level_a_questions when all answered', () => {
      const facts = {
        ...baseFacts,
        // All Level A questions answered
        deposit_protected_within_30_days: 'yes',
        prescribed_info_within_30_days: 'yes',
        gas_safety_before_move_in: 'yes',
        epc_provided_to_tenant: 'yes',
        how_to_rent_guide_provided: 'yes',
        property_licensing_compliant: 'yes',
        tenancy_periodic_not_fixed: 'yes',
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      expect(result.level_a_mode).toBe(true);

      // Should have no remaining Level A questions
      expect(result.level_a_questions?.length ?? 0).toBe(0);
    });

    it('should handle not_sure answers as still needing info', () => {
      const facts = {
        ...baseFacts,
        // Answer with not_sure - validator should still need this info
        deposit_protected_within_30_days: 'not_sure',
        prescribed_info_within_30_days: 'yes',
        gas_safety_before_move_in: 'yes',
        epc_provided_to_tenant: 'yes',
        how_to_rent_guide_provided: 'yes',
      };

      const result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts,
        analysis: null,
      });

      // The not_sure answer means we don't know if deposit is protected
      // The question should be removed from level_a_questions since user answered
      // But the validator rule should return needs_info status for that check
      const questionKeys = result.level_a_questions?.map((q) => q.factKey) ?? [];

      // deposit_protected_within_30_days was answered (albeit with not_sure),
      // so it should not appear in questions list anymore
      expect(questionKeys).not.toContain('deposit_protected_within_30_days');
    });
  });

  describe('Parity with Section 8 Level A handling', () => {
    it('S21 and S8 should both normalize Level A keys consistently', () => {
      // S8 facts
      const s8Facts = {
        rent_frequency_confirmed: 'monthly',
        rent_amount_confirmed: '1500',
        current_arrears_amount: '3000',
      };

      // S21 facts
      const s21Facts = {
        deposit_protected_within_30_days: 'yes',
        epc_provided_to_tenant: 'yes',
      };

      const s8Normalized = normalizeLevelAFactsToCanonical(s8Facts);
      const s21Normalized = normalizeLevelAFactsToCanonical(s21Facts);

      // Both should have canonical keys populated
      expect(s8Normalized.rent_frequency).toBe('monthly');
      expect(s8Normalized.rent_amount).toBe(1500);
      expect(s8Normalized.current_arrears).toBe(3000);

      expect(s21Normalized.deposit_protected).toBe(true);
      expect(s21Normalized.epc_provided).toBe(true);
    });

    it('both validators should use Level A mode when requirements configured', () => {
      const s8Result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts: {
          selected_notice_route: 'section_8',
          form_3_present: true,
          grounds_cited: [8],
          service_date: '2025-01-01',
        },
        analysis: null,
      });

      const s21Result = runLegalValidator({
        product: 'notice_only',
        jurisdiction: 'england',
        facts: {
          selected_notice_route: 'section_21',
          form_6a_present: true,
          service_date: '2025-01-01',
          expiry_date: '2025-03-02',
          signature_present: true,
          deposit_taken: true,
        },
        analysis: null,
      });

      // Both should be in Level A mode
      expect(s8Result.level_a_mode).toBe(true);
      expect(s21Result.level_a_mode).toBe(true);

      // Both should have Level A questions
      expect(s8Result.level_a_questions?.length).toBeGreaterThan(0);
      expect(s21Result.level_a_questions?.length).toBeGreaterThan(0);
    });
  });
});
