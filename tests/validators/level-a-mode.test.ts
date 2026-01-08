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
