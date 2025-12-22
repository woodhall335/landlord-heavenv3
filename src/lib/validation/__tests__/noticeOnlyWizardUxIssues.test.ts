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

import { extractWizardUxIssues, getRouteLabel, type WizardUxIssuesInput } from '../noticeOnlyWizardUxIssues';

// Mock the decision engine and compliance evaluator
jest.mock('../../decision-engine', () => ({
  runDecisionEngine: jest.fn(() => ({
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

jest.mock('../../notices/evaluate-notice-compliance', () => ({
  evaluateNoticeCompliance: jest.fn(() => ({
    ok: true,
    hardFailures: [],
    warnings: [],
  })),
}));

import { runDecisionEngine } from '../../decision-engine';
import { evaluateNoticeCompliance } from '../../notices/evaluate-notice-compliance';

const mockRunDecisionEngine = runDecisionEngine as jest.MockedFunction<typeof runDecisionEngine>;
const mockEvaluateNoticeCompliance = evaluateNoticeCompliance as jest.MockedFunction<typeof evaluateNoticeCompliance>;

describe('extractWizardUxIssues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    it('should include computed max in deposit cap warning for Section 21', () => {
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

      // For Section 21, deposit cap should also be route-invalidating
      const routeInvalidating = result.routeInvalidatingIssues.find(
        i => i.code === 'S21-DEPOSIT-CAP-EXCEEDED'
      );
      expect(routeInvalidating).toBeDefined();
    });

    it('should NOT block Section 8 for deposit cap', () => {
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

      // Should have inline warning but NOT be route-invalidating
      const depositWarning = result.inlineWarnings.find(w => w.code === 'DEPOSIT_EXCEEDS_CAP');
      expect(depositWarning).toBeDefined();
      expect(depositWarning?.severity).toBe('info'); // Info, not warn

      // Should NOT have route-invalidating issue for deposit cap
      const routeInvalidating = result.routeInvalidatingIssues.find(
        i => i.code.includes('DEPOSIT-CAP')
      );
      expect(routeInvalidating).toBeUndefined();
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
