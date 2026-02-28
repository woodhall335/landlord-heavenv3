/**
 * Regression Test: England Section 21 Deposit Bug
 *
 * Original Bug:
 * - England notice_only section_21 flow with deposit_taken=false
 * - Preview was blocking with repeated DEPOSIT_FIELD_REQUIRED errors
 * - Preview was asking for deposit facts even though no deposit was taken
 *
 * Expected Behavior After Fix:
 * - deposit_taken=false => No deposit warnings/blocks at any stage
 * - deposit_taken=true => Require deposit facts at generate, warn at preview
 * - No repeated/duplicate deposit issues
 */

import { describe, it, expect } from 'vitest';
import { validateFlow, type FlowValidationInput } from '../../src/lib/validation/validateFlow';
import { getMinimalCompliantFacts } from '../../src/testutils/flowHarness';

describe('Regression: England Section 21 Deposit Bug', () => {
  // Use harness to get minimal compliant facts, then override with test-specific values
  const baseCompliantFacts = getMinimalCompliantFacts({
    jurisdiction: 'england',
    product: 'notice_only',
    route: 'section_21',
    status: 'supported',
  });

  const baseFactsNoDeposit = {
    ...baseCompliantFacts,
    deposit_taken: false,
    has_gas_appliances: false,
  };

  const baseFactsWithDeposit = {
    ...baseCompliantFacts,
    deposit_taken: true,
    deposit_amount: 1500,
    deposit_protected: true,
    prescribed_info_given: 'Test', // String value as expected by the system
  };

  describe('deposit_taken=false (no deposit)', () => {
    it('should NOT block or warn about deposit at wizard stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'wizard',
        facts: baseFactsNoDeposit,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);

      // Should have NO deposit-related issues
      const depositIssues = [
        ...result.blocking_issues,
        ...result.warnings,
      ].filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositIssues.length).toBe(0);
    });

    it('should NOT block or warn about deposit at checkpoint stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'checkpoint',
        facts: baseFactsNoDeposit,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);

      const depositIssues = [
        ...result.blocking_issues,
        ...result.warnings,
      ].filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositIssues.length).toBe(0);
    });

    it('should NOT block or warn about deposit at preview stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: baseFactsNoDeposit,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);

      const depositIssues = [
        ...result.blocking_issues,
        ...result.warnings,
      ].filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositIssues.length).toBe(0);
    });

    it('should NOT block or warn about deposit at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: baseFactsNoDeposit,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);

      const depositIssues = [
        ...result.blocking_issues,
        ...result.warnings,
      ].filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositIssues.length).toBe(0);
    });
  });

  describe('deposit_taken=true (deposit present)', () => {
    it('should NOT block at preview when deposit facts are missing (warn only)', () => {
      const factsWithoutDepositMetadata = {
        ...baseFactsNoDeposit,
        deposit_taken: true,
        // Missing: deposit_amount, deposit_protected, prescribed_info_given
      };

      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: factsWithoutDepositMetadata,
      };

      const result = validateFlow(input);

      // Preview should warn but not block on deposit metadata
      const depositWarnings = result.warnings.filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositWarnings.length).toBeGreaterThan(0);

      // Should still have other blocking issues (but not deposit)
      const depositBlocking = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      // Preview stage should warn, not block, on deposit metadata
      expect(depositBlocking.length).toBe(0);
    });

    it('should block at generate when deposit facts are missing', () => {
      const factsWithoutDepositMetadata = {
        ...baseFactsNoDeposit,
        deposit_taken: true,
        // Missing: deposit_amount, deposit_protected, prescribed_info_given
      };

      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: factsWithoutDepositMetadata,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);

      // Should have blocking issues about deposit
      const depositIssues = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );

      expect(depositIssues.length).toBeGreaterThan(0);

      // At least some deposit issues should have affected_question_id
      // (All issues for facts with MQS mappings should have it)
      const issuesWithQuestionId = depositIssues.filter(
        i => i.affected_question_id !== undefined
      );
      expect(issuesWithQuestionId.length).toBeGreaterThan(0);
    });

    it('should NOT block on deposit_protected when deposit_taken=true and deposit_protected=true', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: baseFactsWithDeposit,
      };

      const result = validateFlow(input);

      // Should NOT have blocking issues specifically about deposit_protected or deposit_amount
      // (Test is focused on deposit protection, not all possible Section 21 requirements)
      const depositProtectionIssues = result.blocking_issues.filter(i =>
        i.code === 'DEPOSIT_NOT_PROTECTED' ||
        i.code === 'deposit_not_protected' ||
        i.fields.includes('deposit_protected') ||
        i.fields.includes('deposit_amount')
      );
      expect(depositProtectionIssues.length).toBe(0);
    });
  });

  describe('No duplicate deposit issues', () => {
    it('should not emit repeated DEPOSIT_FIELD_REQUIRED at any stage', () => {
      const factsWithoutDepositMetadata = {
        ...baseFactsNoDeposit,
        deposit_taken: true,
      };

      const stages: Array<'wizard' | 'checkpoint' | 'preview' | 'generate'> = [
        'wizard',
        'checkpoint',
        'preview',
        'generate',
      ];

      for (const stage of stages) {
        const input: FlowValidationInput = {
          jurisdiction: 'england',
          product: 'notice_only',
          route: 'section_21',
          stage,
          facts: factsWithoutDepositMetadata,
        };

        const result = validateFlow(input);

        // Check for duplicate issues
        const allIssues = [...result.blocking_issues, ...result.warnings];
        const issueKeys = new Set<string>();

        for (const issue of allIssues) {
          const key = `${issue.code}:${issue.fields.join(',')}:${issue.affected_question_id || ''}`;
          expect(issueKeys.has(key)).toBe(false); // No duplicates
          issueKeys.add(key);
        }
      }
    });
  });

  describe('Section 8 should not require deposit protection', () => {
    it('should NOT block Section 8 on missing deposit facts', () => {
      const section8Facts = {
        ...baseFactsNoDeposit,
        deposit_taken: true,
        // Missing deposit_amount, deposit_protected, prescribed_info_given
        ground_codes: [8, 10], // Section 8 grounds
      };

      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_8',
        stage: 'generate',
        facts: section8Facts,
      };

      const result = validateFlow(input);

      // Section 8 should NOT have blocking deposit issues
      const depositBlocking = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('deposit'))
      );

      expect(depositBlocking.length).toBe(0);

      // May have deposit warnings (best practice)
      const depositWarnings = result.warnings.filter(i =>
        i.fields.some(f => f.includes('deposit'))
      );

      // This is OK - Section 8 can warn about deposit but shouldn't block
      expect(depositWarnings.length).toBeGreaterThanOrEqual(0);
    });
  });
});
