/**
 * End-to-End Flow Tests
 *
 * Matrix-driven tests for all supported flows.
 * Validates that compliant cases pass and non-compliant cases fail with proper error messages.
 */

import { describe, it, expect } from 'vitest';
import {
  getAllSupportedFlows,
  getAllUnsupportedFlows,
  getMinimalCompliantFacts,
  simulatePreviewValidation,
  simulateGenerateValidation,
  allIssuesHaveQuestionId,
  removeOneFact,
  type FlowDefinition,
} from '../../src/testutils/flowHarness';

describe('End-to-End Flow Tests', () => {
  describe('Supported Flows - Compliant Cases', () => {
    const supportedFlows = getAllSupportedFlows();

    it('should have at least one supported flow', () => {
      expect(supportedFlows.length).toBeGreaterThan(0);
    });

    // Test each supported flow
    for (const flow of supportedFlows) {
      describe(`${flow.jurisdiction}/${flow.product}/${flow.route}`, () => {
        const facts = getMinimalCompliantFacts(flow);

        it('should pass preview validation with minimal compliant facts', () => {
          const result = simulatePreviewValidation(flow, facts);

          if (!result.ok) {
            console.error('Preview validation failed:', {
              flow,
              result,
            });
          }

          expect(result.ok).toBe(true);
          expect(result.status).toBe(200);
          expect(result.blocking_issues || []).toHaveLength(0);
        });

        it('should pass generate validation with minimal compliant facts', () => {
          const result = simulateGenerateValidation(flow, facts);

          if (!result.ok) {
            console.error('Generate validation failed:', {
              flow,
              result,
            });
          }

          expect(result.ok).toBe(true);
          expect(result.status).toBe(200);
          expect(result.blocking_issues || []).toHaveLength(0);
        });
      });
    }
  });

  describe('Supported Flows - Non-Compliant Cases', () => {
    const supportedFlows = getAllSupportedFlows();

    // Test a subset of flows for non-compliant cases to keep test time reasonable
    const testFlows = supportedFlows.filter((f, index) => index % 2 === 0); // Test every other flow

    for (const flow of testFlows) {
      describe(`${flow.jurisdiction}/${flow.product}/${flow.route} - missing fact`, () => {
        it('should block at preview with missing required fact', () => {
          const compliantFacts = getMinimalCompliantFacts(flow);
          const { facts: incompleteFacts, removedKey } = removeOneFact(compliantFacts);

          const result = simulatePreviewValidation(flow, incompleteFacts);

          // Should fail validation
          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
          expect(result.code).toBe('LEGAL_BLOCK');

          // Should have blocking issues
          expect(result.blocking_issues).toBeDefined();
          expect(result.blocking_issues!.length).toBeGreaterThan(0);

          // All blocking issues should have affected_question_id
          const hasQuestionIds = allIssuesHaveQuestionId(result.blocking_issues!);
          if (!hasQuestionIds) {
            console.warn('Some issues missing affected_question_id:', {
              flow,
              removedKey,
              issues: result.blocking_issues,
            });
          }

          // At least some issues should have affected_question_id
          // (Some might not if they're about unmapped derived facts)
          expect(hasQuestionIds).toBe(true);
        });

        it('should block at generate with missing required fact', () => {
          const compliantFacts = getMinimalCompliantFacts(flow);
          const { facts: incompleteFacts } = removeOneFact(compliantFacts);

          const result = simulateGenerateValidation(flow, incompleteFacts);

          // Should fail validation
          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
          expect(result.code).toBe('LEGAL_BLOCK');

          // Should have blocking issues
          expect(result.blocking_issues).toBeDefined();
          expect(result.blocking_issues!.length).toBeGreaterThan(0);

          // All blocking issues should have affected_question_id
          expect(allIssuesHaveQuestionId(result.blocking_issues!)).toBe(true);
        });
      });
    }
  });

  describe('Unsupported Flows', () => {
    const unsupportedFlows = getAllUnsupportedFlows();

    it('should have at least one unsupported flow', () => {
      expect(unsupportedFlows.length).toBeGreaterThan(0);
    });

    // Test a sample of unsupported flows
    const testFlows = unsupportedFlows.slice(0, 5); // Test first 5 unsupported flows

    for (const flow of testFlows) {
      describe(`${flow.jurisdiction}/${flow.product}/${flow.route}`, () => {
        it('should return 422 for preview', () => {
          const facts = getMinimalCompliantFacts(flow);
          const result = simulatePreviewValidation(flow, facts);

          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
        });

        it('should return 422 for generate', () => {
          const facts = getMinimalCompliantFacts(flow);
          const result = simulateGenerateValidation(flow, facts);

          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
        });
      });
    }
  });

  describe('Special Cases', () => {
    describe('Northern Ireland - Non-Tenancy Products', () => {
      const niUnsupportedFlows: FlowDefinition[] = [
        { jurisdiction: 'northern-ireland', product: 'notice_only', route: 'default', status: 'unsupported' },
        { jurisdiction: 'northern-ireland', product: 'complete_pack', route: 'default', status: 'unsupported' },
        { jurisdiction: 'northern-ireland', product: 'money_claim', route: 'default', status: 'unsupported' },
      ];

      for (const flow of niUnsupportedFlows) {
        it(`should return 422 for ${flow.product} at preview`, () => {
          const facts = getMinimalCompliantFacts(flow);
          const result = simulatePreviewValidation(flow, facts);

          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
        });

        it(`should return 422 for ${flow.product} at generate`, () => {
          const facts = getMinimalCompliantFacts(flow);
          const result = simulateGenerateValidation(flow, facts);

          expect(result.ok).toBe(false);
          expect(result.status).toBe(422);
        });
      }
    });

    describe('Conditional Requirements - Deposit', () => {
      it('should NOT require deposit facts when deposit_taken=false (England Section 21)', () => {
        const flow: FlowDefinition = {
          jurisdiction: 'england',
          product: 'notice_only',
          route: 'section_21',
          status: 'supported',
        };

        const facts = {
          ...getMinimalCompliantFacts(flow),
          deposit_taken: false, // No deposit
          // Omit deposit_amount, deposit_protected, prescribed_info_given
        };

        const result = simulateGenerateValidation(flow, facts);

        expect(result.ok).toBe(true);

        // Should not have any deposit-related issues
        const depositIssues = (result.blocking_issues || []).filter(i =>
          i.fields.some(f => f.includes('deposit'))
        );
        expect(depositIssues).toHaveLength(0);
      });

      it('should require deposit facts when deposit_taken=true (England Section 21)', () => {
        const flow: FlowDefinition = {
          jurisdiction: 'england',
          product: 'notice_only',
          route: 'section_21',
          status: 'supported',
        };

        const facts = {
          ...getMinimalCompliantFacts(flow),
          deposit_taken: true,
          deposit_amount: 1500,
          // Omit deposit_protected - should fail
        };

        const result = simulateGenerateValidation(flow, facts);

        expect(result.ok).toBe(false);

        // Should have deposit-related issues
        const depositIssues = (result.blocking_issues || []).filter(i =>
          i.fields.some(f => f.includes('deposit'))
        );
        expect(depositIssues.length).toBeGreaterThan(0);

        // Issues should have affected_question_id
        expect(allIssuesHaveQuestionId(depositIssues)).toBe(true);
      });
    });

    describe('Conditional Requirements - Gas Safety', () => {
      it('should NOT require gas safety cert when has_gas_appliances=false', () => {
        const flow: FlowDefinition = {
          jurisdiction: 'england',
          product: 'notice_only',
          route: 'section_21',
          status: 'supported',
        };

        const facts = {
          ...getMinimalCompliantFacts(flow),
          has_gas_appliances: false,
          // Omit gas_safety_cert_provided
        };

        const result = simulateGenerateValidation(flow, facts);

        expect(result.ok).toBe(true);

        // Should not have gas safety issues
        const gasIssues = (result.blocking_issues || []).filter(i =>
          i.fields.some(f => f.includes('gas'))
        );
        expect(gasIssues).toHaveLength(0);
      });
    });
  });

  describe('Stage-Aware Validation', () => {
    it('should have different requirements at preview vs generate', () => {
      const flow: FlowDefinition = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        status: 'supported',
      };

      // Facts missing some optional preview-only fields
      const facts = getMinimalCompliantFacts(flow);

      const previewResult = simulatePreviewValidation(flow, facts);
      const generateResult = simulateGenerateValidation(flow, facts);

      // Both should pass for minimal compliant facts
      expect(previewResult.ok).toBe(true);
      expect(generateResult.ok).toBe(true);

      // Generate stage should be at least as strict as preview
      expect(generateResult.blocking_issues?.length || 0).toBeGreaterThanOrEqual(
        previewResult.blocking_issues?.length || 0
      );
    });
  });
});
