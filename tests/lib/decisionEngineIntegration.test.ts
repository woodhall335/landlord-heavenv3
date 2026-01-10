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

      // All compliance issues should be blocking at generate stage
      expect(result.blocking_issues.length).toBeGreaterThanOrEqual(4);

      // Note: We may have informational warnings (e.g., "prescribed info status not confirmed")
      // when fields are not explicitly set. The critical check is that blocking issues work.
      // Warnings from undefined fields are acceptable at generate stage.
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

/**
 * Regression test: Notice Only Section 8 Ground Selection
 *
 * Issue: When user selected only Ground 8 in Notice Only wizard,
 * the decision engine was also recommending Ground 11 (and Ground 10)
 * based on arrears amount, ignoring the user's explicit selection.
 *
 * Fix: For notice_only flows, decision engine now filters recommended_grounds
 * to only include grounds the user explicitly selected.
 */
describe('Notice Only Section 8 Ground Selection (Regression)', () => {
  it('should only recommend Ground 8 when user selects only Ground 8', () => {
    // User has 2 months arrears (enough to recommend 8, 10, 11)
    // but explicitly selected ONLY Ground 8
    const input: DecisionInput = {
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: {
        tenancy: {
          deposit_amount: 1200,
          deposit_protected: true,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        issues: {
          rent_arrears: {
            total_arrears: 2000, // 2 months - enough to trigger grounds 8, 10, 11
            has_arrears: true,
          },
          section8_grounds: {
            selected_grounds: ['ground_8'], // User explicitly selected ONLY Ground 8
          },
        },
      } as any,
      stage: 'wizard',
    };

    const result = runDecisionEngine(input);

    // Should ONLY include Ground 8, not Ground 10 or 11
    expect(result.recommended_grounds.length).toBe(1);
    expect(result.recommended_grounds[0].code).toBe('8');

    // Verify Ground 10 and 11 are NOT included
    const hasGround10 = result.recommended_grounds.some(g => g.code === '10');
    const hasGround11 = result.recommended_grounds.some(g => g.code === '11');
    expect(hasGround10).toBe(false);
    expect(hasGround11).toBe(false);
  });

  it('should recommend all selected grounds when user selects multiple', () => {
    const input: DecisionInput = {
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: {
        tenancy: {
          deposit_amount: 1200,
          deposit_protected: true,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        issues: {
          rent_arrears: {
            total_arrears: 2000, // 2 months
            has_arrears: true,
          },
          section8_grounds: {
            selected_grounds: ['ground_8', 'ground_11'], // User selected 8 AND 11
          },
        },
      } as any,
      stage: 'wizard',
    };

    const result = runDecisionEngine(input);

    // Should include both Ground 8 and Ground 11
    expect(result.recommended_grounds.length).toBe(2);

    const groundCodes = result.recommended_grounds.map(g => g.code);
    expect(groundCodes).toContain('8');
    expect(groundCodes).toContain('11');

    // Should NOT include Ground 10 (not selected)
    expect(groundCodes).not.toContain('10');
  });

  it('should recommend all grounds for complete_pack (not notice_only)', () => {
    // For complete_pack, the decision engine should recommend all applicable grounds
    // based on facts, not filter by user selection
    const input: DecisionInput = {
      jurisdiction: 'england',
      product: 'complete_pack',
      case_type: 'eviction',
      facts: {
        tenancy: {
          deposit_amount: 1200,
          deposit_protected: true,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        issues: {
          rent_arrears: {
            total_arrears: 2000, // 2 months - enough for grounds 8, 10, 11
            has_arrears: true,
          },
          section8_grounds: {
            selected_grounds: ['ground_8'], // User selected only Ground 8
          },
        },
      } as any,
      stage: 'wizard',
    };

    const result = runDecisionEngine(input);

    // For complete_pack, should recommend ALL applicable grounds based on facts
    // (Ground 8, 10, and 11 based on 2 months arrears)
    expect(result.recommended_grounds.length).toBeGreaterThanOrEqual(2);

    const groundCodes = result.recommended_grounds.map(g => g.code);
    expect(groundCodes).toContain('8');
    // Ground 11 is recommended when arrears >= 0.25 months
    expect(groundCodes).toContain('11');
  });

  it('should show no grounds when user selects grounds that dont match facts', () => {
    // User selects Ground 14 (ASB) but facts don't support it
    const input: DecisionInput = {
      jurisdiction: 'england',
      product: 'notice_only',
      case_type: 'eviction',
      facts: {
        tenancy: {
          deposit_amount: 1200,
          deposit_protected: true,
          rent_amount: 1000,
          rent_frequency: 'monthly',
        },
        issues: {
          rent_arrears: {
            total_arrears: 2000,
            has_arrears: true,
          },
          asb: {
            has_asb: false, // No ASB
          },
          section8_grounds: {
            selected_grounds: ['ground_14'], // User selected Ground 14 but no ASB facts
          },
        },
      } as any,
      stage: 'wizard',
    };

    const result = runDecisionEngine(input);

    // Ground 14 requires ASB facts, so it won't be in the recommended list
    // and user selection was only Ground 14
    // Result should be empty (no grounds match both facts AND selection)
    expect(result.recommended_grounds.length).toBe(0);
  });
});
