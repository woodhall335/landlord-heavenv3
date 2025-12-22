/**
 * Tests for Notice-Only Wizard UX Issues Helper
 *
 * Tests the following scenarios:
 * 1. S21: deposit_taken=true + deposit_protected=false -> route-invalidating issue
 * 2. S21: epc_provided=false -> route-invalidating issue
 * 3. S8: S21-only issues are not route-invalidating
 * 4. Deposit cap: inline warning includes computed max; no blocking
 * 5. prescribed_info_given hidden when deposit not protected
 * 6. Ask Heaven still works for Section 8 particulars (handled separately)
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { extractWizardUxIssues, getRouteLabel, type WizardUxIssuesInput } from '../noticeOnlyWizardUxIssues';

// Mock the decision engine and compliance evaluator
vi.mock('../../decision-engine', () => ({
  runDecisionEngine: vi.fn(() => ({
    recommended_routes: ['section_8'],
    allowed_routes: ['section_8'],
    blocked_routes: ['section_21'],
    recommended_grounds: [],
    notice_period_suggestions: {},
    pre_action_requirements: { required: false, met: null, details: [] },
    blocking_issues: [],
    warnings: [],
    analysis_summary: '',
    route_explanations: {},
  })),
}));

vi.mock('../../notices/evaluate-notice-compliance', () => ({
  evaluateNoticeCompliance: vi.fn(() => ({
    ok: true,
    hardFailures: [],
    warnings: [],
  })),
}));

import { runDecisionEngine } from '../../decision-engine';
import { evaluateNoticeCompliance } from '../../notices/evaluate-notice-compliance';

const mockRunDecisionEngine = runDecisionEngine as Mock;
const mockEvaluateNoticeCompliance = evaluateNoticeCompliance as Mock;

describe('extractWizardUxIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Section 21 route-invalidating issues', () => {
    it('should return route-invalidating issue when deposit_protected=false', () => {
      // Setup mocks
      mockRunDecisionEngine.mockReturnValue({
        recommended_routes: ['section_8'],
        allowed_routes: ['section_8'],
        blocked_routes: ['section_21'],
        recommended_grounds: [],
        notice_period_suggestions: {},
        pre_action_requirements: { required: false, met: null, details: [] },
        blocking_issues: [{
          route: 'section_21',
          issue: 'deposit_not_protected',
          description: 'Deposit must be protected before serving Section 21',
          action_required: 'Protect the deposit in an approved scheme',
          severity: 'blocking',
          legal_basis: 'Housing Act 2004 s213',
        }],
        warnings: [],
        analysis_summary: '',
        route_explanations: {},
      });

      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          deposit_taken: true,
          deposit_protected: false,
        },
        lastSavedQuestionIds: ['deposit_protected_scheme'],
      };

      const result = extractWizardUxIssues(input);

      expect(result.routeInvalidatingIssues).toHaveLength(1);
      expect(result.routeInvalidatingIssues[0].code).toBe('deposit_not_protected');
      expect(result.alternativeRoutes).toContain('section_8');
    });

    it('should return route-invalidating issue when epc_provided=false', () => {
      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: false,
        hardFailures: [{
          code: 'S21-EPC',
          affected_question_id: 'epc_provided',
          legal_reason: 'An EPC must be provided before serving Section 21',
          user_fix_hint: 'Confirm EPC has been provided to the tenant',
        }],
        warnings: [],
      });

      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          epc_provided: false,
        },
        lastSavedQuestionIds: ['epc_provided'],
      };

      const result = extractWizardUxIssues(input);

      expect(result.routeInvalidatingIssues).toHaveLength(1);
      expect(result.routeInvalidatingIssues[0].code).toBe('S21-EPC');
    });
  });

  describe('Section 8 route', () => {
    it('should NOT show S21 issues as route-invalidating for Section 8', () => {
      mockRunDecisionEngine.mockReturnValue({
        recommended_routes: ['section_8'],
        allowed_routes: ['section_8'],
        blocked_routes: [],
        recommended_grounds: [],
        notice_period_suggestions: {},
        pre_action_requirements: { required: false, met: null, details: [] },
        blocking_issues: [],
        warnings: [],
        analysis_summary: '',
        route_explanations: {},
      });

      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: true,
        hardFailures: [],
        warnings: [],
      });

      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_8',
        savedFacts: {
          deposit_taken: true,
          deposit_protected: false, // This would block S21, but not S8
          epc_provided: false, // This would block S21, but not S8
        },
        lastSavedQuestionIds: ['deposit_protected_scheme', 'epc_provided'],
      };

      const result = extractWizardUxIssues(input);

      // Section 8 should have no route-invalidating issues for S21 compliance
      expect(result.routeInvalidatingIssues).toHaveLength(0);
    });

    it('should show route-invalidating issue when grounds_required for Section 8', () => {
      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: false,
        hardFailures: [{
          code: 'S8-GROUNDS-REQUIRED',
          affected_question_id: 'section8_grounds_selection',
          legal_reason: 'At least one Section 8 ground is required',
          user_fix_hint: 'Select at least one ground for the Section 8 notice',
        }],
        warnings: [],
      });

      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_8',
        savedFacts: {
          section8_grounds: [], // No grounds selected
        },
        lastSavedQuestionIds: ['section8_grounds_selection'],
      };

      const result = extractWizardUxIssues(input);

      expect(result.routeInvalidatingIssues).toHaveLength(1);
      expect(result.routeInvalidatingIssues[0].code).toBe('S8-GROUNDS-REQUIRED');
    });
  });

  describe('Deposit cap warning', () => {
    it('should include computed max in deposit cap warning (inline only, never blocking)', () => {
      mockRunDecisionEngine.mockReturnValue({
        recommended_routes: ['section_8'],
        allowed_routes: ['section_8'],
        blocked_routes: ['section_21'],
        recommended_grounds: [],
        notice_period_suggestions: {},
        pre_action_requirements: { required: false, met: null, details: [] },
        blocking_issues: [],
        warnings: [],
        analysis_summary: '',
        route_explanations: {},
      });

      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: true,
        hardFailures: [],
        warnings: [],
      });

      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          deposit_taken: true,
          deposit_amount: 2000, // Exceeds cap for £1000/month rent
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        lastSavedQuestionIds: ['deposit_amount'],
      };

      const result = extractWizardUxIssues(input);

      // Should have inline warning with computed values
      const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
      expect(depositWarning).toBeDefined();
      expect(depositWarning?.message).toContain('Maximum allowed');
      expect(depositWarning?.computedValues).toBeDefined();
      expect(depositWarning?.computedValues?.maxDeposit).toBeCloseTo(1153.85, 1); // 5 weeks of £1000/month

      // Per task requirements: deposit cap is NEVER route-invalidating in wizard
      // Blocking happens only at preview/generate stage
      const routeInvalidating = result.routeInvalidatingIssues.find(
        i => i.code === 'S21-DEPOSIT-CAP-EXCEEDED' || i.code.includes('DEPOSIT-CAP')
      );
      expect(routeInvalidating).toBeUndefined();
    });

    it('should show deposit cap as info for Section 8 (not warn)', () => {
      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_8',
        savedFacts: {
          deposit_taken: true,
          deposit_amount: 2000, // Exceeds cap
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        lastSavedQuestionIds: ['deposit_amount'],
      };

      const result = extractWizardUxIssues(input);

      // Should have inline warning
      const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
      expect(depositWarning).toBeDefined();
      expect(depositWarning?.severity).toBe('info'); // Info, not warn for S8

      // Should NOT have route-invalidating issue for deposit cap
      const routeInvalidating = result.routeInvalidatingIssues.find(
        i => i.code.includes('DEPOSIT-CAP')
      );
      expect(routeInvalidating).toBeUndefined();
    });

    it('should NOT have deposit_reduced_to_legal_cap_confirmed as a step', () => {
      // This tests that the question was removed from the MSQ
      // The deposit cap should only be an inline warning, not a wizard step
      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          deposit_taken: true,
          deposit_amount: 2000,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        lastSavedQuestionIds: ['deposit_amount'],
      };

      const result = extractWizardUxIssues(input);

      // The affected question should be deposit_amount, not deposit_reduced_to_legal_cap_confirmed
      const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
      expect(depositWarning?.affectedQuestionId).toBe('deposit_amount');
    });
  });

  describe('Issue filtering by lastSavedQuestionIds', () => {
    it('should only return issues triggered by the last saved questions', () => {
      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: false,
        hardFailures: [
          {
            code: 'S21-EPC',
            affected_question_id: 'epc_provided',
            legal_reason: 'EPC not provided',
            user_fix_hint: 'Provide EPC',
          },
          {
            code: 'S21-DEPOSIT-NONCOMPLIANT',
            affected_question_id: 'deposit_protected_scheme',
            legal_reason: 'Deposit not protected',
            user_fix_hint: 'Protect deposit',
          },
        ],
        warnings: [],
      });

      // Only saving deposit question - should not see EPC issue
      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          deposit_taken: true,
          deposit_protected: false,
          epc_provided: false,
        },
        lastSavedQuestionIds: ['deposit_protected_scheme'],
      };

      const result = extractWizardUxIssues(input);

      // Should only see deposit issue, not EPC (EPC wasn't in lastSavedQuestionIds)
      expect(result.routeInvalidatingIssues.some(i => i.code.includes('DEPOSIT'))).toBe(true);
      expect(result.routeInvalidatingIssues.some(i => i.code.includes('EPC'))).toBe(false);
    });

    it('should include issues triggered by controlling question changes', () => {
      mockEvaluateNoticeCompliance.mockReturnValue({
        ok: false,
        hardFailures: [{
          code: 'S21-PRESCRIBED-INFO-REQUIRED',
          affected_question_id: 'prescribed_info_given',
          legal_reason: 'Prescribed info required',
          user_fix_hint: 'Provide prescribed info',
        }],
        warnings: [],
      });

      // Saving deposit_protected_scheme which controls prescribed_info_given visibility
      const input: WizardUxIssuesInput = {
        jurisdiction: 'england',
        route: 'section_21',
        savedFacts: {
          deposit_taken: true,
          deposit_protected: true,
          prescribed_info_given: false,
        },
        lastSavedQuestionIds: ['deposit_protected_scheme'], // This controls prescribed_info_given
      };

      const result = extractWizardUxIssues(input);

      // Should see prescribed info issue because deposit_protected_scheme controls it
      const prescribedIssue = result.routeInvalidatingIssues.find(
        i => i.code.includes('PRESCRIBED')
      );
      expect(prescribedIssue).toBeDefined();
    });
  });
});

describe('getRouteLabel', () => {
  it('should return friendly route labels', () => {
    expect(getRouteLabel('section_21')).toBe('Section 21');
    expect(getRouteLabel('section_8')).toBe('Section 8');
    expect(getRouteLabel('notice_to_leave')).toBe('Notice to Leave');
    expect(getRouteLabel('wales_section_173')).toBe('Section 173');
    expect(getRouteLabel('unknown_route')).toBe('unknown_route');
  });
});

// ============================================================================
// PHASE 7: REGRESSION TESTS for notice-only validation fixes
// ============================================================================

describe('PHASE 3: pendingRouteBlock reset behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to passing state
    mockRunDecisionEngine.mockReturnValue({
      recommended_routes: ['section_21', 'section_8'],
      allowed_routes: ['section_21', 'section_8'],
      blocked_routes: [],
      recommended_grounds: [],
      notice_period_suggestions: {},
      pre_action_requirements: { required: false, met: null, details: [] },
      blocking_issues: [],
      warnings: [],
      analysis_summary: '',
      route_explanations: {},
    });
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: true,
      hardFailures: [],
      warnings: [],
    });
  });

  it('should NOT return route-invalidating issues when deposit is protected (user fixed issue)', () => {
    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: {
        deposit_taken: true,
        deposit_protected: true, // User fixed the issue
        prescribed_info_given: true,
      },
      lastSavedQuestionIds: ['deposit_protected_scheme'],
    };

    const result = extractWizardUxIssues(input);

    // No route-invalidating issues should be present
    expect(result.routeInvalidatingIssues).toHaveLength(0);
  });

  it('should allow proceeding after Edit-my-answer and valid re-save', () => {
    // First, simulate a blocking issue
    mockEvaluateNoticeCompliance.mockReturnValueOnce({
      ok: false,
      hardFailures: [{
        code: 'S21-DEPOSIT-NONCOMPLIANT',
        affected_question_id: 'deposit_protected_scheme',
        legal_reason: 'Deposit not protected',
        user_fix_hint: 'Protect deposit',
      }],
      warnings: [],
    });

    const inputBlocking: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: { deposit_taken: true, deposit_protected: false },
      lastSavedQuestionIds: ['deposit_protected_scheme'],
    };

    const resultBlocking = extractWizardUxIssues(inputBlocking);
    expect(resultBlocking.routeInvalidatingIssues).toHaveLength(1);

    // Now simulate user fixing the issue
    mockEvaluateNoticeCompliance.mockReturnValueOnce({
      ok: true,
      hardFailures: [],
      warnings: [],
    });

    const inputFixed: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: { deposit_taken: true, deposit_protected: true },
      lastSavedQuestionIds: ['deposit_protected_scheme'],
    };

    const resultFixed = extractWizardUxIssues(inputFixed);
    // No blocking issues after fix
    expect(resultFixed.routeInvalidatingIssues).toHaveLength(0);
  });
});

describe('PHASE 4: Modal attribution and issues without affectedQuestionId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should still include issues with affectedQuestionId in routeInvalidatingIssues', () => {
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: false,
      hardFailures: [{
        code: 'S21-DEPOSIT-NONCOMPLIANT',
        affected_question_id: 'deposit_protected_scheme', // Has affected_question_id
        legal_reason: 'Deposit not protected',
        user_fix_hint: 'Protect deposit in an approved scheme',
      }],
      warnings: [],
    });

    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: { deposit_taken: true, deposit_protected: false },
      lastSavedQuestionIds: ['deposit_protected_scheme'],
    };

    const result = extractWizardUxIssues(input);
    expect(result.routeInvalidatingIssues).toHaveLength(1);
    expect(result.routeInvalidatingIssues[0].affectedQuestionId).toBe('deposit_protected_scheme');
  });
});

describe('PHASE 5: Section 8 grounds normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunDecisionEngine.mockReturnValue({
      recommended_routes: ['section_8'],
      allowed_routes: ['section_8'],
      blocked_routes: [],
      recommended_grounds: [],
      notice_period_suggestions: {},
      pre_action_requirements: { required: false, met: null, details: [] },
      blocking_issues: [],
      warnings: [],
      analysis_summary: '',
      route_explanations: {},
    });
  });

  it('should NOT show grounds required when grounds are stored as array', () => {
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: true,
      hardFailures: [],
      warnings: [],
    });

    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_8',
      savedFacts: {
        section8_grounds: ['ground_8', 'ground_11'], // Array format
      },
      lastSavedQuestionIds: ['section8_grounds_selection'],
    };

    const result = extractWizardUxIssues(input);

    // Should NOT have grounds required issue
    const groundsIssue = result.routeInvalidatingIssues.find(
      i => i.code === 'S8-GROUNDS-REQUIRED' || i.code === 'grounds_required'
    );
    expect(groundsIssue).toBeUndefined();
  });

  it('should handle grounds stored as comma-separated string', () => {
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: true,
      hardFailures: [],
      warnings: [],
    });

    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_8',
      savedFacts: {
        section8_grounds: 'ground_8,ground_11', // Comma-separated string
      },
      lastSavedQuestionIds: ['section8_grounds_selection'],
    };

    const result = extractWizardUxIssues(input);

    // Should NOT have grounds required issue (string is normalized to array)
    const groundsIssue = result.routeInvalidatingIssues.find(
      i => i.code === 'S8-GROUNDS-REQUIRED' || i.code === 'grounds_required'
    );
    expect(groundsIssue).toBeUndefined();
  });

  it('should show grounds required when grounds array is empty', () => {
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: false,
      hardFailures: [{
        code: 'S8-GROUNDS-REQUIRED',
        affected_question_id: 'section8_grounds_selection',
        legal_reason: 'At least one ground required',
        user_fix_hint: 'Select at least one ground',
      }],
      warnings: [],
    });

    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_8',
      savedFacts: {
        section8_grounds: [], // Empty array
      },
      lastSavedQuestionIds: ['section8_grounds_selection'],
    };

    const result = extractWizardUxIssues(input);

    // Should have grounds required issue
    expect(result.routeInvalidatingIssues.some(
      i => i.code === 'S8-GROUNDS-REQUIRED'
    )).toBe(true);
  });
});

describe('PHASE 6: Deposit cap warning appears on correct step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunDecisionEngine.mockReturnValue({
      recommended_routes: ['section_21'],
      allowed_routes: ['section_21', 'section_8'],
      blocked_routes: [],
      recommended_grounds: [],
      notice_period_suggestions: {},
      pre_action_requirements: { required: false, met: null, details: [] },
      blocking_issues: [],
      warnings: [],
      analysis_summary: '',
      route_explanations: {},
    });
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: true,
      hardFailures: [],
      warnings: [],
    });
  });

  it('should show deposit cap warning immediately after saving deposit_amount', () => {
    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: {
        deposit_taken: true,
        deposit_amount: 2000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      },
      lastSavedQuestionIds: ['deposit_amount'], // Just saved deposit_amount
    };

    const result = extractWizardUxIssues(input);

    const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
    expect(depositWarning).toBeDefined();
    expect(depositWarning?.affectedQuestionId).toBe('deposit_amount');
  });

  it('should NOT show deposit cap warning when saving unrelated question', () => {
    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: {
        deposit_taken: true,
        deposit_amount: 2000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
        epc_provided: true,
      },
      lastSavedQuestionIds: ['epc_provided'], // Saving EPC, not deposit
    };

    const result = extractWizardUxIssues(input);

    // Should NOT show deposit cap warning (wasn't just saved)
    const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
    expect(depositWarning).toBeUndefined();
  });

  it('should include computed values in deposit cap warning', () => {
    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: {
        deposit_taken: true,
        deposit_amount: 2000,
        rent_amount: 1000,
        rent_frequency: 'monthly',
      },
      lastSavedQuestionIds: ['deposit_amount'],
    };

    const result = extractWizardUxIssues(input);

    const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
    expect(depositWarning?.computedValues).toBeDefined();
    expect(depositWarning?.computedValues?.actualDeposit).toBe(2000);
    expect(depositWarning?.computedValues?.maxWeeks).toBe(5);
    // £1000/month * 12 / 52 * 5 = £1153.85
    expect(depositWarning?.computedValues?.maxDeposit).toBeCloseTo(1153.85, 1);
  });
});

describe('PHASE 2: Validation uses server-updated facts', () => {
  // This is more of an integration test - we verify the function uses the savedFacts parameter
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunDecisionEngine.mockReturnValue({
      recommended_routes: ['section_21'],
      allowed_routes: ['section_21', 'section_8'],
      blocked_routes: [],
      recommended_grounds: [],
      notice_period_suggestions: {},
      pre_action_requirements: { required: false, met: null, details: [] },
      blocking_issues: [],
      warnings: [],
      analysis_summary: '',
      route_explanations: {},
    });
    mockEvaluateNoticeCompliance.mockReturnValue({
      ok: true,
      hardFailures: [],
      warnings: [],
    });
  });

  it('should validate using savedFacts not any external state', () => {
    // Pass specific savedFacts
    const input: WizardUxIssuesInput = {
      jurisdiction: 'england',
      route: 'section_21',
      savedFacts: {
        deposit_taken: true,
        deposit_protected: true, // Protected
        deposit_amount: 500, // Under cap
        rent_amount: 1000,
        rent_frequency: 'monthly',
      },
      lastSavedQuestionIds: ['deposit_protected_scheme'],
    };

    const result = extractWizardUxIssues(input);

    // No issues when facts show compliant state
    expect(result.routeInvalidatingIssues).toHaveLength(0);
  });
});
