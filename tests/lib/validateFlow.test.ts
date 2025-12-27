import { describe, it, expect } from 'vitest';
import { validateFlow, create422Response, type FlowValidationInput } from '../../src/lib/validation/validateFlow';
import { getMinimalCompliantFacts } from '../../src/testutils/flowHarness';

describe('validateFlow orchestrator', () => {
  describe('Fail-closed behavior', () => {
    it('should fail closed for unsupported jurisdiction/product', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'northern-ireland',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {},
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.status).toBe('unsupported');
      expect(result.code).toContain('NOT_SUPPORTED');
    });

    it('should fail closed for unsupported route', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'invalid_route',
        stage: 'preview',
        facts: {},
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.status).toBe('unsupported');
    });
  });

  describe('England notice_only section_21 validation', () => {
    it('should block at generate stage when required facts are missing', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
          has_gas_appliances: false,
          is_fixed_term: false,
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.status).toBe('invalid');
      expect(result.blocking_issues.length).toBeGreaterThan(0);
      expect(result.code).toBe('LEGAL_BLOCK');

      // At least some blocking issues should have affected_question_id
      // (All issues for facts with MQS mappings should have it)
      const issuesWithQuestionId = result.blocking_issues.filter(
        i => i.affected_question_id !== undefined
      );
      expect(issuesWithQuestionId.length).toBeGreaterThan(0);
    });

    it('should NOT require deposit facts when deposit_taken=false', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
          has_gas_appliances: false,
          is_fixed_term: false,
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '456 Property St',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          notice_expiry_date: '2024-03-01',
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);
      expect(result.status).toBe('ok');

      // Should NOT have blocking issues about deposit
      const depositIssues = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('deposit'))
      );
      expect(depositIssues.length).toBe(0);
    });

    it('should require deposit facts when deposit_taken=true at generate', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: true,
          has_gas_appliances: false,
          is_fixed_term: false,
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '456 Property St',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          notice_expiry_date: '2024-03-01',
          // Missing deposit_amount, deposit_protected, prescribed_info_given
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.status).toBe('invalid');

      // Should have blocking issues about deposit
      const depositIssues = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('deposit') || f.includes('prescribed_info'))
      );
      expect(depositIssues.length).toBeGreaterThan(0);
    });

    it('should pass when all required facts are provided', () => {
      // Use harness to generate minimal compliant facts
      const facts = getMinimalCompliantFacts({
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        status: 'supported',
      });

      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts,
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true);
      expect(result.status).toBe('ok');
      expect(result.blocking_issues.length).toBe(0);
    });
  });

  describe('Stage-aware validation', () => {
    it('should not block at wizard stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'wizard',
        facts: {},
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(true); // Wizard stage should not block
      expect(result.warnings.length).toBeGreaterThan(0); // But should warn
    });

    it('should block at checkpoint stage for core facts', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'checkpoint',
        facts: {},
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.blocking_issues.length).toBeGreaterThan(0);
    });

    it('should block at preview stage for preview-required facts', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'preview',
        facts: {
          deposit_taken: false,
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);
      expect(result.blocking_issues.length).toBeGreaterThan(0);
    });
  });

  describe('422 Response generation', () => {
    it('should create standardized 422 payload', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
        },
      };

      const result = validateFlow(input);
      const payload = create422Response(result);

      expect(payload.code).toBe('LEGAL_BLOCK');
      expect(payload.error).toBe('LEGAL_BLOCK');
      expect(payload.user_message).toBeTruthy();
      expect(Array.isArray(payload.blocking_issues)).toBe(true);
      expect(Array.isArray(payload.warnings)).toBe(true);

      // At least some blocking issues should have affected_question_id
      // (All issues for facts with MQS mappings should have it)
      const issuesWithQuestionId = payload.blocking_issues.filter(
        i => i.affected_question_id !== undefined
      );
      expect(issuesWithQuestionId.length).toBeGreaterThan(0);

      // All issues should have user_fix_hint
      for (const issue of payload.blocking_issues) {
        expect(issue.user_fix_hint).toBeTruthy();
      }
    });

    it('should create standardized 422 for unsupported flow', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'northern-ireland',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {},
      };

      const result = validateFlow(input);
      const payload = create422Response(result);

      expect(payload.code).toContain('NOT_SUPPORTED');
      expect(payload.user_message).toContain('not supported');
    });
  });

  describe('Issue deduplication', () => {
    it('should dedupe issues with same code + field + question_id', () => {
      // This test validates that validateFlow dedupes issues
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        stage: 'generate',
        facts: {
          deposit_taken: false,
          has_gas_appliances: false,
        },
      };

      const result = validateFlow(input);

      // Check for duplicate issues
      const issueKeys = new Set<string>();
      for (const issue of result.blocking_issues) {
        const key = `${issue.code}:${issue.fields.join(',')}:${issue.affected_question_id || ''}`;
        expect(issueKeys.has(key)).toBe(false); // No duplicates
        issueKeys.add(key);
      }
    });
  });

  describe('Scotland notice_to_leave', () => {
    it('should require grounds at generate stage', () => {
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
          // Missing ground_codes
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);

      const groundIssue = result.blocking_issues.find(i =>
        i.fields.includes('ground_codes')
      );
      expect(groundIssue).toBeTruthy();
      // affected_question_id should be present if fact is mapped in MQS
      // (Not all facts may have MQS mappings yet)
    });
  });

  describe('Money claim validation', () => {
    it('should require claim details at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'money_claim',
        route: 'money_claim',
        stage: 'generate',
        facts: {
          landlord_full_name: 'Test Landlord',
          landlord_address_line1: '123 Test St',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant_full_name: 'Test Tenant',
          property_address_line1: '456 Property St',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2023-01-01',
          rent_amount: 1000,
          rent_frequency: 'monthly',
          // Missing claim_type, total_claim_amount
        },
      };

      const result = validateFlow(input);
      expect(result.ok).toBe(false);

      const claimIssues = result.blocking_issues.filter(i =>
        i.fields.some(f => f.includes('claim'))
      );
      expect(claimIssues.length).toBeGreaterThan(0);
    });
  });
});
