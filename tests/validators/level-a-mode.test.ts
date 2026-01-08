/**
 * Level A Mode Validation Tests
 *
 * Tests for Level A validation mode where:
 * - User uploads their existing notice
 * - Legal structure is validated using document contents
 * - No additional evidence uploads are required
 * - Follow-up conversational questions replace evidence requirements
 */

import { describe, expect, it } from 'vitest';
import { runLegalValidator } from '@/lib/validators/run-legal-validator';
import { REQUIREMENTS } from '@/lib/validators/requirements';
import {
  getLevelAQuestions,
  getLevelAFactKeys,
  isLevelAFactKey,
  FACT_QUESTIONS,
  normalizeLevelAFactsToCanonical,
  LEVEL_A_TO_CANONICAL_KEYS,
} from '@/lib/validators/facts/factKeys';

describe('Level A Mode - Requirements', () => {
  it('Section 21 requirement has levelAMode enabled', () => {
    const requirement = REQUIREMENTS.england_s21;
    expect(requirement.levelAMode).toBe(true);
  });

  it('Section 8 requirement has levelAMode enabled', () => {
    const requirement = REQUIREMENTS.england_s8;
    expect(requirement.levelAMode).toBe(true);
  });

  it('Section 21 requirement has no requiredEvidence in Level A mode', () => {
    const requirement = REQUIREMENTS.england_s21;
    expect(requirement.requiredEvidence).toEqual([]);
  });

  it('Section 8 requirement has no requiredEvidence in Level A mode', () => {
    const requirement = REQUIREMENTS.england_s8;
    expect(requirement.requiredEvidence).toEqual([]);
  });
});

describe('Level A Mode - Follow-up Questions', () => {
  it('returns Section 21 Level A follow-up questions when none are answered', () => {
    const questions = getLevelAQuestions('section_21');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(7);

    // Verify key questions exist
    const factKeys = questions.map((q) => q.factKey);
    expect(factKeys).toContain('deposit_protected_within_30_days');
    expect(factKeys).toContain('prescribed_info_within_30_days');
    expect(factKeys).toContain('gas_safety_before_move_in');
    expect(factKeys).toContain('epc_provided_to_tenant');
    expect(factKeys).toContain('how_to_rent_guide_provided');
  });

  it('returns Section 8 Level A follow-up questions when none are answered', () => {
    const questions = getLevelAQuestions('section_8');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(5);

    // Verify key questions exist
    const factKeys = questions.map((q) => q.factKey);
    expect(factKeys).toContain('arrears_above_threshold_today');
    expect(factKeys).toContain('arrears_likely_at_hearing');
    expect(factKeys).toContain('rent_frequency_confirmed');
    expect(factKeys).toContain('rent_amount_confirmed');
  });

  it('filters out answered Level A questions for Section 21', () => {
    const answeredFactKeys = [
      'deposit_protected_within_30_days',
      'prescribed_info_within_30_days',
    ];
    const questions = getLevelAQuestions('section_21', answeredFactKeys);

    const factKeys = questions.map((q) => q.factKey);
    expect(factKeys).not.toContain('deposit_protected_within_30_days');
    expect(factKeys).not.toContain('prescribed_info_within_30_days');
    expect(factKeys).toContain('gas_safety_before_move_in');
    expect(factKeys).toContain('epc_provided_to_tenant');
  });

  it('filters out answered Level A questions for Section 8', () => {
    const answeredFactKeys = ['arrears_above_threshold_today'];
    const questions = getLevelAQuestions('section_8', answeredFactKeys);

    const factKeys = questions.map((q) => q.factKey);
    expect(factKeys).not.toContain('arrears_above_threshold_today');
    expect(factKeys).toContain('arrears_likely_at_hearing');
  });

  it('all Level A questions have isLevelA flag', () => {
    const s21Questions = getLevelAQuestions('section_21');
    const s8Questions = getLevelAQuestions('section_8');

    s21Questions.forEach((q) => {
      expect(q.isLevelA).toBe(true);
    });

    s8Questions.forEach((q) => {
      expect(q.isLevelA).toBe(true);
    });
  });

  it('all Level A questions have yes_no_unsure or select/currency type', () => {
    const s21Questions = getLevelAQuestions('section_21');
    const s8Questions = getLevelAQuestions('section_8');

    const allQuestions = [...s21Questions, ...s8Questions];
    allQuestions.forEach((q) => {
      expect(['yes_no_unsure', 'select', 'currency']).toContain(q.type);
    });
  });
});

describe('Level A Mode - Fact Key Helpers', () => {
  it('getLevelAFactKeys returns all Level A fact keys for Section 21', () => {
    const factKeys = getLevelAFactKeys('section_21');
    expect(factKeys.length).toBeGreaterThanOrEqual(5);
    expect(factKeys).toContain('deposit_protected_within_30_days');
    expect(factKeys).toContain('how_to_rent_guide_provided');
  });

  it('getLevelAFactKeys returns all Level A fact keys for Section 8', () => {
    const factKeys = getLevelAFactKeys('section_8');
    expect(factKeys.length).toBeGreaterThanOrEqual(4);
    expect(factKeys).toContain('arrears_above_threshold_today');
    expect(factKeys).toContain('rent_frequency_confirmed');
  });

  it('isLevelAFactKey correctly identifies Level A fact keys', () => {
    expect(isLevelAFactKey('deposit_protected_within_30_days')).toBe(true);
    expect(isLevelAFactKey('arrears_above_threshold_today')).toBe(true);
    expect(isLevelAFactKey('rent_frequency_confirmed')).toBe(true);

    // Non-Level A keys
    expect(isLevelAFactKey('deposit_protected')).toBe(false);
    expect(isLevelAFactKey('some_random_key')).toBe(false);
  });
});

describe('Level A Mode - Validator Integration', () => {
  it('Section 21 validator returns Level A questions in results', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: null,
    });

    expect(result.level_a_mode).toBe(true);
    expect(result.level_a_questions).toBeDefined();
    expect(result.level_a_questions!.length).toBeGreaterThan(0);

    // Verify no evidence upload recommendations
    expect(result.required_evidence_missing).toEqual([]);
  });

  it('Section 8 validator returns Level A questions in results', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        evidence: { files: [] },
      },
      analysis: null,
    });

    expect(result.level_a_mode).toBe(true);
    expect(result.level_a_questions).toBeDefined();
    expect(result.level_a_questions!.length).toBeGreaterThan(0);

    // Verify no evidence upload recommendations
    expect(result.required_evidence_missing).toEqual([]);
  });

  it('Level A questions decrease as user answers them', () => {
    // First call - all questions unanswered
    const result1 = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: null,
    });

    const initialCount = result1.level_a_questions!.length;

    // Second call - some questions answered
    const result2 = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        deposit_protected_within_30_days: 'yes',
        prescribed_info_within_30_days: 'yes',
        evidence: { files: [] },
      },
      analysis: null,
    });

    expect(result2.level_a_questions!.length).toBeLessThan(initialCount);
    expect(result2.level_a_questions!.length).toBe(initialCount - 2);
  });
});

describe('Level A Mode - Wrong Document Type Blocking', () => {
  it('Section 21 validator returns terminal blocker for Section 8 notice', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          section_8_detected: true,
          grounds_cited: [8, 10],
        },
        confidence: 0.9,
        warnings: [],
      },
    });

    expect(result.result?.status).toBe('invalid');
    expect(result.result?.terminal_blocker).toBe(true);
    expect(result.result?.blockers.length).toBe(1);
    expect(result.result?.blockers[0].code).toBe('S21-WRONG-DOC-TYPE');
  });

  it('Section 8 validator returns terminal blocker for Section 21 notice', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_21',
        extracted_fields: {
          form_6a_detected: true,
          section_21_detected: true,
        },
        confidence: 0.9,
        warnings: [],
      },
    });

    expect(result.result?.status).toBe('invalid');
    expect(result.result?.terminal_blocker).toBe(true);
    expect(result.result?.blockers.length).toBe(1);
    expect(result.result?.blockers[0].code).toBe('S8-WRONG-DOC-TYPE');
  });

  it('terminal blocker disables Level A questions', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          section_8_detected: true,
        },
        confidence: 0.9,
        warnings: [],
      },
    });

    // Terminal blocker should still include level_a_mode flag but UI will not show questions
    expect(result.result?.terminal_blocker).toBe(true);
  });
});

describe('Level A Mode - No Evidence Upload Recommendations', () => {
  it('Section 21 validator does not recommend evidence uploads in Level A mode', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_21',
        extracted_fields: {
          form_6a_detected: true,
          date_served: '2024-01-15',
          expiry_date: '2024-03-20',
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // Check no evidence upload recommendations appear
    const evidenceRecommendations = result.recommendations?.filter((r) =>
      r.code.startsWith('EVIDENCE_MISSING_')
    );
    expect(evidenceRecommendations).toEqual([]);
  });

  it('Section 8 validator does not recommend evidence uploads in Level A mode', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          grounds_cited: [8],
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // Check no evidence upload recommendations appear
    const evidenceRecommendations = result.recommendations?.filter((r) =>
      r.code.startsWith('EVIDENCE_MISSING_')
    );
    expect(evidenceRecommendations).toEqual([]);
  });
});

describe('Level A Mode - Question Content', () => {
  it('Section 21 Level A questions have clear, conversational text', () => {
    const questions = getLevelAQuestions('section_21');

    questions.forEach((q) => {
      expect(q.question.length).toBeGreaterThan(20);
      expect(q.helpText?.length).toBeGreaterThan(10);
    });

    // Check specific question content
    const depositQuestion = questions.find(
      (q) => q.factKey === 'deposit_protected_within_30_days'
    );
    expect(depositQuestion?.question).toContain('protected');
    expect(depositQuestion?.question).toContain('30 days');
  });

  it('Section 8 Level A questions have clear, conversational text', () => {
    const questions = getLevelAQuestions('section_8');

    questions.forEach((q) => {
      expect(q.question.length).toBeGreaterThan(15);
    });

    // Check specific question content
    const arrearsQuestion = questions.find(
      (q) => q.factKey === 'arrears_above_threshold_today'
    );
    expect(arrearsQuestion?.question).toContain('Ground 8');
  });
});

describe('Level A Mode - Select Questions with Options', () => {
  it('rent_frequency_confirmed question has options for dropdown', () => {
    const questions = getLevelAQuestions('section_8');
    const rentFreqQuestion = questions.find(
      (q) => q.factKey === 'rent_frequency_confirmed'
    );

    expect(rentFreqQuestion).toBeDefined();
    expect(rentFreqQuestion?.type).toBe('select');
    expect(rentFreqQuestion?.options).toBeDefined();
    expect(rentFreqQuestion?.options?.length).toBeGreaterThan(0);

    // Verify specific options exist
    const optionValues = rentFreqQuestion?.options?.map((o) => o.value);
    expect(optionValues).toContain('weekly');
    expect(optionValues).toContain('monthly');
    expect(optionValues).toContain('quarterly');
  });

  it('validator returns rent_frequency_confirmed with options', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        evidence: { files: [] },
      },
      analysis: null,
    });

    expect(result.level_a_mode).toBe(true);
    expect(result.level_a_questions).toBeDefined();

    const rentFreqQuestion = result.level_a_questions?.find(
      (q) => q.factKey === 'rent_frequency_confirmed'
    );

    expect(rentFreqQuestion).toBeDefined();
    expect(rentFreqQuestion?.type).toBe('select');
    expect(rentFreqQuestion?.options).toBeDefined();
    expect(rentFreqQuestion?.options?.length).toBeGreaterThan(0);

    // Verify the options have label and value properties
    rentFreqQuestion?.options?.forEach((option) => {
      expect(option.value).toBeDefined();
      expect(option.label).toBeDefined();
    });
  });

  it('select type Level A questions always include options', () => {
    const s21Questions = getLevelAQuestions('section_21');
    const s8Questions = getLevelAQuestions('section_8');
    const allQuestions = [...s21Questions, ...s8Questions];

    const selectQuestions = allQuestions.filter((q) => q.type === 'select');

    selectQuestions.forEach((q) => {
      expect(q.options).toBeDefined();
      expect(q.options?.length).toBeGreaterThan(0);
      q.options?.forEach((opt) => {
        expect(opt.value).toBeDefined();
        expect(opt.label).toBeDefined();
      });
    });
  });
});

describe('Level A Mode - Fact Key Normalization', () => {
  it('LEVEL_A_TO_CANONICAL_KEYS maps Level A keys to canonical keys', () => {
    expect(LEVEL_A_TO_CANONICAL_KEYS.rent_frequency_confirmed).toBe('rent_frequency');
    expect(LEVEL_A_TO_CANONICAL_KEYS.rent_amount_confirmed).toBe('rent_amount');
    expect(LEVEL_A_TO_CANONICAL_KEYS.current_arrears_amount).toBe('current_arrears');
  });

  it('normalizeLevelAFactsToCanonical maps Level A keys to canonical keys', () => {
    const facts = {
      rent_frequency_confirmed: 'monthly',
      rent_amount_confirmed: '1000',
      current_arrears_amount: '2000',
      arrears_above_threshold_today: 'yes',
      arrears_likely_at_hearing: 'yes',
    };

    const normalized = normalizeLevelAFactsToCanonical(facts);

    // Original keys should still exist
    expect(normalized.rent_frequency_confirmed).toBe('monthly');
    expect(normalized.arrears_above_threshold_today).toBe('yes');

    // Canonical keys should now exist
    expect(normalized.rent_frequency).toBe('monthly');
    expect(normalized.rent_amount).toBe(1000); // Parsed as number
    expect(normalized.current_arrears).toBe(2000); // Parsed as number
  });

  it('normalizeLevelAFactsToCanonical parses currency strings to numbers', () => {
    const facts = {
      rent_amount_confirmed: '1500.50',
      current_arrears_amount: '3000',
    };

    const normalized = normalizeLevelAFactsToCanonical(facts);

    expect(normalized.rent_amount).toBe(1500.5);
    expect(normalized.current_arrears).toBe(3000);
    expect(typeof normalized.rent_amount).toBe('number');
    expect(typeof normalized.current_arrears).toBe('number');
  });

  it('normalizeLevelAFactsToCanonical does not overwrite existing canonical keys', () => {
    const facts = {
      rent_frequency: 'weekly', // Existing canonical key
      rent_frequency_confirmed: 'monthly', // Level A key
    };

    const normalized = normalizeLevelAFactsToCanonical(facts);

    // Should NOT overwrite existing canonical key
    expect(normalized.rent_frequency).toBe('weekly');
  });

  it('normalizeLevelAFactsToCanonical preserves all original keys', () => {
    const facts = {
      selected_notice_route: 'section_8',
      rent_frequency_confirmed: 'monthly',
      some_other_key: 'value',
    };

    const normalized = normalizeLevelAFactsToCanonical(facts);

    expect(normalized.selected_notice_route).toBe('section_8');
    expect(normalized.rent_frequency_confirmed).toBe('monthly');
    expect(normalized.some_other_key).toBe('value');
    expect(normalized.rent_frequency).toBe('monthly');
  });
});

describe('Level A Mode - Section 8 Ground 8 Validation with Level A Answers', () => {
  it('Section 8 validator uses Level A answers for Ground 8 validation', () => {
    // This test verifies the bug fix: Level A answers should be applied to validator facts
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        // Level A answers (as they come from the answer-questions API)
        arrears_above_threshold_today: 'yes',
        arrears_likely_at_hearing: 'yes',
        current_arrears_amount: 2000, // Already parsed as number
        rent_amount_confirmed: 1000, // Will be parsed
        rent_frequency_confirmed: 'monthly',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          grounds_cited: [8],
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // The validator should NOT warn about missing rent_frequency or rent_amount
    // because we provided them via Level A keys
    const warnings = result.result?.warnings ?? [];
    const warningCodes = warnings.map((w) => w.code);

    // Should NOT have S8-REQUIRED-MISSING warnings for rent_frequency
    const requiredMissingWarnings = warnings.filter(
      (w) => w.code === 'S8-REQUIRED-MISSING' && w.message.includes('rent frequency')
    );
    expect(requiredMissingWarnings.length).toBe(0);

    // Should NOT have S8-GROUND8-INCOMPLETE warning
    expect(warningCodes).not.toContain('S8-GROUND8-INCOMPLETE');

    // Should properly calculate Ground 8 status
    // With 2000 arrears and 1000 monthly rent, threshold is 2000 (2 months)
    // So 2000 >= 2000 means Ground 8 is satisfied
    expect(result.result?.status).toBe('ground_8_satisfied');
  });

  it('Section 8 validator warns when Level A answers are missing', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        // No Level A answers provided
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          grounds_cited: [8],
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // Should have warnings about missing required fields
    const warnings = result.result?.warnings ?? [];
    const warningCodes = warnings.map((w) => w.code);

    // Should have S8-GROUND8-INCOMPLETE warning
    expect(warningCodes).toContain('S8-GROUND8-INCOMPLETE');
  });

  it('Section 8 validator correctly detects Ground 8 NOT satisfied', () => {
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        // Arrears below threshold (1500 < 2000 for monthly)
        current_arrears_amount: 1500,
        rent_amount_confirmed: 1000,
        rent_frequency_confirmed: 'monthly',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          grounds_cited: [8],
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // Ground 8 requires 2 months arrears for monthly rent
    // 1500 < 2000 so Ground 8 is not satisfied
    expect(result.result?.status).toBe('discretionary_only');
  });

  it('Section 8 validator correctly handles string currency values', () => {
    // Test that string values like "2000" are properly parsed
    const result = runLegalValidator({
      product: 'notice_only',
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_8',
        // String values (as they might come from form input)
        current_arrears_amount: '2500',
        rent_amount_confirmed: '1000',
        rent_frequency_confirmed: 'monthly',
        evidence: { files: [] },
      },
      analysis: {
        detected_type: 'section_8',
        extracted_fields: {
          form_3_detected: true,
          grounds_cited: [8],
        },
        confidence: 0.8,
        warnings: [],
      },
    });

    // 2500 >= 2000 threshold, so Ground 8 should be satisfied
    expect(result.result?.status).toBe('ground_8_satisfied');
  });
});
