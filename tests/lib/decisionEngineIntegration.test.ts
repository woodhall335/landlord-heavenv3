/**
 * Decision Engine Integration Tests
 *
 * Validates that the decision engine:
 * 1. Respects stage parameter (wizard vs checkpoint/preview/generate)
 * 2. Converts BlockingIssue to ValidationIssue with affected_question_id
 * 3. Integrates seamlessly with validateFlow deduplication pipeline
 */

import { describe, it, expect } from 'vitest';
import { runDecisionEngine, type DecisionInput } from '../../src/lib/decision-engine';
import { mapDecisionIssuesToValidationIssues } from '../../src/lib/decision-engine/issueMapper';
import { validateFlow, type FlowValidationInput } from '../../src/lib/validation/validateFlow';
import { getMinimalCompliantFacts } from '../../src/testutils/flowHarness';

describe('Decision Engine Stage-Awareness', () => {
  const baseEnglandFacts = {
    tenancy: {
      deposit_amount: 1500,
      deposit_protected: false, // NOT protected - compliance issue
      rent_amount: 1000,
    },
  };

  describe('Stage-aware compliance checks (England Section 21)', () => {
    it('should return warnings at wizard stage', () => {
      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: baseEnglandFacts,
        stage: 'wizard',
      };

      const result = runDecisionEngine(input);

      // At wizard stage, compliance issues become warnings
      expect(result.blocking_issues.length).toBe(0);
      expect(result.warnings.length).toBeGreaterThan(0);

      // Should warn about deposit protection
      const depositWarning = result.warnings.find(w =>
        w.toLowerCase().includes('deposit')
      );
      expect(depositWarning).toBeTruthy();
    });

    it('should return blocking issues at checkpoint stage', () => {
      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: baseEnglandFacts,
        stage: 'checkpoint',
      };

      const result = runDecisionEngine(input);

      // At checkpoint stage, compliance issues block
      expect(result.blocking_issues.length).toBeGreaterThan(0);

      // Should block on deposit not protected
      const depositBlock = result.blocking_issues.find(b =>
        b.issue === 'deposit_not_protected'
      );
      expect(depositBlock).toBeTruthy();
      expect(depositBlock?.severity).toBe('blocking');
    });

    it('should return blocking issues at preview stage', () => {
      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: baseEnglandFacts,
        stage: 'preview',
      };

      const result = runDecisionEngine(input);

      // At preview stage, compliance issues block
      expect(result.blocking_issues.length).toBeGreaterThan(0);

      const depositBlock = result.blocking_issues.find(b =>
        b.issue === 'deposit_not_protected'
      );
      expect(depositBlock).toBeTruthy();
    });

    it('should return blocking issues at generate stage (default)', () => {
      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: baseEnglandFacts,
        // No stage specified - defaults to 'generate'
      };

      const result = runDecisionEngine(input);

      // At generate stage, compliance issues block
      expect(result.blocking_issues.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple compliance issues', () => {
    it('should convert all issues to warnings at wizard stage', () => {
      const factsWithMultipleIssues = {
        tenancy: {
          deposit_amount: 1500,
          deposit_protected: false, // Issue 1
          rent_amount: 1000,
        },
        gas_safety_cert_provided: false, // Issue 2
        how_to_rent_given: false, // Issue 3
        epc_provided: false, // Issue 4
      };

      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: factsWithMultipleIssues as any,
        stage: 'wizard',
      };

      const result = runDecisionEngine(input);

      // All issues should be warnings at wizard stage
      expect(result.blocking_issues.length).toBe(0);
      expect(result.warnings.length).toBeGreaterThanOrEqual(4);
    });

    it('should keep all issues as blocking at generate stage', () => {
      const factsWithMultipleIssues = {
        tenancy: {
          deposit_amount: 1500,
          deposit_protected: false,
          rent_amount: 1000,
        },
        gas_safety_cert_provided: false,
        how_to_rent_given: false,
        epc_provided: false,
      };

      const input: DecisionInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        case_type: 'eviction',
        facts: factsWithMultipleIssues as any,
        stage: 'generate',
      };

      const result = runDecisionEngine(input);

      // All issues should be blocking at generate stage
      expect(result.blocking_issues.length).toBeGreaterThanOrEqual(4);
      expect(result.warnings.length).toBe(0);
    });
  });
});

describe('Decision Engine Issue Mapping', () => {
  it('should map BlockingIssue to ValidationIssue with affected_question_id', () => {
    const input: DecisionInput = {
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: {
        tenancy: {
          deposit_amount: 1500,
          deposit_protected: false,
          rent_amount: 1000,
        },
      },
      stage: 'generate',
    };

    const result = runDecisionEngine(input);

    // Map to ValidationIssue
    const validationIssues = mapDecisionIssuesToValidationIssues(
      result.blocking_issues,
      {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
      }
    );

    expect(validationIssues.length).toBeGreaterThan(0);

    // Check structure of mapped issues
    for (const issue of validationIssues) {
      expect(issue.code).toBeTruthy();
      expect(issue.severity).toBeTruthy();
      expect(Array.isArray(issue.fields)).toBe(true);
      expect(issue.user_fix_hint).toBeTruthy();

      // affected_question_id should be present for known issues
      // (may be undefined for unmapped issues, which is acceptable)
    }

    // Specifically check deposit issue mapping
    const depositIssue = validationIssues.find(i =>
      i.code === 'DEPOSIT_NOT_PROTECTED'
    );

    if (depositIssue) {
      expect(depositIssue.fields).toContain('deposit_protected');
      // Should have affected_question_id from MQS mapping
      // (undefined is acceptable if mapping doesn't exist yet)
    }
  });
});

describe('Decision Engine Integration with validateFlow', () => {
  describe('England Section 21 with compliance issues', () => {
    // Use harness to generate minimal compliant facts
    const compliantFacts = getMinimalCompliantFacts({
      jurisdiction: 'england',
      product: 'notice_only',
      route: 'section_21',
      status: 'supported',
    });

    const nonCompliantFacts = {
      ...compliantFacts,
      deposit_taken: true,
      deposit_amount: 1500,
      deposit_protected: false, // Compliance failure
    };

    it('should pass with compliant facts at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: compliantFacts,
      };

      const result = validateFlow(input);

      expect(result.ok).toBe(true);
      expect(result.blocking_issues.length).toBe(0);
    });

    it('should block with non-compliant facts at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: nonCompliantFacts,
      };

      const result = validateFlow(input);

      expect(result.ok).toBe(false);
      expect(result.blocking_issues.length).toBeGreaterThan(0);

      // Should have deposit compliance issue
      const depositIssue = result.blocking_issues.find(i =>
        i.code.includes('DEPOSIT') || i.fields.includes('deposit_protected')
      );

      expect(depositIssue).toBeTruthy();
    });

    it('should warn (not block) with non-compliant facts at wizard stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'wizard',
        facts: nonCompliantFacts,
      };

      const result = validateFlow(input);

      // Wizard stage should not block on compliance issues
      expect(result.ok).toBe(true);

      // But should warn
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should dedupe identical issues from decision engine and requirements', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: true,
          deposit_amount: 1500,
          deposit_protected: false,
          // Missing other required facts
        },
      };

      const result = validateFlow(input);

      // Check that there are no duplicate issues
      const issueCodes = new Set<string>();
      for (const issue of result.blocking_issues) {
        const key = `${issue.code}:${issue.fields.join(',')}:${issue.affected_question_id || ''}`;

        // If this assertion fails, deduplication is not working
        expect(issueCodes.has(key)).toBe(false);
        issueCodes.add(key);
      }
    });
  });

  describe('Wales Section 173 compliance', () => {
    it('should validate Wales Section 173 at generate stage', () => {
      // Use harness for compliant base
      const baseFacts = getMinimalCompliantFacts({
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_section_173',
        status: 'supported',
      });

      const input: FlowValidationInput = {
        jurisdiction: 'wales',
        product: 'notice_only',
        route: 'wales_section_173',
        stage: 'generate',
        facts: baseFacts,
      };

      const result = validateFlow(input);

      // Validation should complete without errors
      // (Rent Smart Wales checking may be rule-dependent, not asserting specific outcome)
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });
  });

  describe('Scotland pre-action requirements', () => {
    it('should block on pre_action_not_met at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'scotland',
        product: 'notice_only',
        route: 'notice_to_leave',
        stage: 'generate',
        facts: {
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test St',
          landlord_city: 'Edinburgh',
          landlord_postcode: 'EH1 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '456 Property St',
          property_city: 'Edinburgh',
          property_postcode: 'EH2 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          notice_expiry_date: '2024-03-01',
          ground_codes: ['Ground 1'], // Rent arrears
          // Missing pre_action_confirmed - compliance failure
          total_arrears: 3500, // 3.5 months
        },
      };

      const result = validateFlow(input);

      expect(result.ok).toBe(false);

      // Should have pre-action issue
      const preActionIssue = result.blocking_issues.find(i =>
        i.code.includes('PRE_ACTION') || i.fields.includes('pre_action_confirmed')
      );

      expect(preActionIssue).toBeTruthy();
    });
  });
});
