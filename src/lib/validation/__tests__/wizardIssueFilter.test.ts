/**
 * Wizard Issue Filter Tests
 *
 * Tests for the validation context filtering system that ensures:
 * 1. No premature "missing fields" blockers appear before user reaches those steps
 * 2. Issues caused by problematic answers (e.g., deposit_protected=false) do appear
 * 3. Friendly labels are correctly applied
 *
 * Key regression test: "tenant_full_name appears as blocking issue before it's asked" must never happen.
 */

import { describe, test, expect } from 'vitest';
import {
  filterWizardIssues,
  transformIssuesWithFriendlyLabels,
  categorizeIssues,
  getIssueCounts,
  type WizardIssueFilterContext,
  type FilteredValidationIssue,
  type ValidationIssue,
} from '../wizardIssueFilter';

describe('Wizard Issue Filter', () => {
  describe('filterWizardIssues - Core Filtering Logic', () => {
    // ============================================================================
    // REGRESSION TEST: tenant_full_name should NOT appear before it's asked
    // ============================================================================
    test('REGRESSION: tenant_full_name does NOT appear as blocking issue before user answers it', () => {
      // Simulate: User just started the wizard, only answered landlord_details
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'John Smith',
          landlord_address_line1: '123 Main St',
          // tenant_full_name is NOT in facts yet - user hasn't reached that step
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['tenant_full_name'],
          affected_question_id: 'tenant_full_name',
          user_fix_hint: 'Please answer the question "tenant_full_name" to provide tenant_full_name',
        },
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['property_address_line1'],
          affected_question_id: 'property_details',
          user_fix_hint: 'Please answer the question "property_details" to provide property_address_line1',
        },
      ];

      const filtered = filterWizardIssues(issues, context);

      // CRITICAL: Neither tenant_full_name nor property_address_line1 should appear
      // because the user hasn't reached those steps yet
      expect(filtered.length).toBe(0);
      expect(filtered.find(i => i.fields.includes('tenant_full_name'))).toBeUndefined();
      expect(filtered.find(i => i.fields.includes('property_address_line1'))).toBeUndefined();
    });

    test('shows deposit_protected issue when user explicitly answered deposit_protected=false', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'John Smith',
          tenant_full_name: 'Jane Doe',
          deposit_taken: true,
          deposit_protected: false, // User explicitly answered this
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          affected_question_id: 'deposit_and_compliance',
          user_fix_hint: 'Deposit must be protected in a scheme',
        },
      ];

      const filtered = filterWizardIssues(issues, context);

      // This SHOULD appear because user answered deposit_protected=false
      expect(filtered.length).toBe(1);
      expect(filtered[0].code).toBe('DEPOSIT_NOT_PROTECTED');
    });

    test('does NOT show deposit issue when deposit_protected has not been answered yet', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'John Smith',
          tenant_full_name: 'Jane Doe',
          // deposit_protected is NOT in facts yet - user hasn't reached that step
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          affected_question_id: 'deposit_and_compliance',
          user_fix_hint: 'Deposit must be protected in a scheme',
        },
      ];

      const filtered = filterWizardIssues(issues, context);

      // This should NOT appear because user hasn't answered the deposit question yet
      expect(filtered.length).toBe(0);
    });

    test('shows REQUIRED_FACT_MISSING when user explicitly cleared a field', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'John Smith',
          tenant_full_name: '', // User explicitly cleared this field
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['tenant_full_name'],
          affected_question_id: 'tenant_full_name',
          user_fix_hint: 'Tenant name is required',
        },
      ];

      const filtered = filterWizardIssues(issues, context);

      // This SHOULD appear because user explicitly set tenant_full_name to empty string
      expect(filtered.length).toBe(1);
      expect(filtered[0].code).toBe('REQUIRED_FACT_MISSING');
    });
  });

  describe('Friendly Labels', () => {
    test('transforms user_fix_hint to friendly action', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          deposit_taken: true,
          deposit_protected: false,
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          affected_question_id: 'deposit_and_compliance',
          user_fix_hint: 'Please answer the question "deposit_and_compliance" to provide deposit_protected',
        },
      ];

      const filtered = filterWizardIssues(issues, context);

      expect(filtered.length).toBe(1);
      // Should have friendly action
      expect(filtered[0].friendlyAction).toBe('Confirm the deposit is protected in a government scheme');
    });

    test('transforms all issues with friendly labels in preview context', () => {
      const issues: ValidationIssue[] = [
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['tenant_full_name'],
          affected_question_id: 'tenant_full_name',
          user_fix_hint: 'Please answer the question "tenant_full_name" to provide tenant_full_name',
        },
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          affected_question_id: 'deposit_and_compliance',
          // No user_fix_hint - should use fields to generate friendly action
        },
      ];

      const transformed = transformIssuesWithFriendlyLabels(issues);

      expect(transformed.length).toBe(2);
      expect(transformed[0].friendlyAction).toBe("Add the tenant's full name");
      // For decision engine issues without user_fix_hint, uses fields to get friendly action
      expect(transformed[1].friendlyAction).toBe('Confirm the deposit is protected in a government scheme');
    });
  });

  describe('Issue Categorization', () => {
    test('categorizes issues into blocking and warnings', () => {
      const issues: FilteredValidationIssue[] = [
        {
          code: 'DEPOSIT_NOT_PROTECTED',
          severity: 'blocking',
          fields: ['deposit_protected'],
          friendlyAction: 'Confirm deposit protection',
        },
        {
          code: 'SOME_WARNING',
          severity: 'warning',
          fields: ['some_field'],
          friendlyAction: 'Consider this recommendation',
        },
        {
          code: 'ANOTHER_BLOCKER',
          severity: 'blocking',
          fields: ['another_field'],
          friendlyAction: 'Fix this issue',
        },
      ];

      const { blocking, warnings } = categorizeIssues(issues);

      expect(blocking.length).toBe(2);
      expect(warnings.length).toBe(1);
      expect(blocking[0].code).toBe('DEPOSIT_NOT_PROTECTED');
      expect(blocking[1].code).toBe('ANOTHER_BLOCKER');
      expect(warnings[0].code).toBe('SOME_WARNING');
    });

    test('counts issues correctly', () => {
      const issues: FilteredValidationIssue[] = [
        { code: 'A', severity: 'blocking', fields: [], friendlyAction: 'A' },
        { code: 'B', severity: 'blocking', fields: [], friendlyAction: 'B' },
        { code: 'C', severity: 'warning', fields: [], friendlyAction: 'C' },
      ];

      const counts = getIssueCounts(issues);

      expect(counts.blocking).toBe(2);
      expect(counts.warnings).toBe(1);
      expect(counts.total).toBe(3);
    });
  });

  describe('Multiple Routes Consistency', () => {
    const routeScenarios = [
      { jurisdiction: 'england', route: 'section_21' },
      { jurisdiction: 'england', route: 'section_8' },
      { jurisdiction: 'wales', route: 'wales_section_173' },
      { jurisdiction: 'scotland', route: 'notice_to_leave' },
    ];

    test.each(routeScenarios)(
      'filters correctly for $jurisdiction $route',
      ({ jurisdiction, route }) => {
        const context: WizardIssueFilterContext = {
          jurisdiction: jurisdiction as any,
          product: 'notice_only',
          route,
          facts: {
            landlord_full_name: 'Test',
            // Only landlord answered - other facts not yet reached
          },
        };

        const issues: ValidationIssue[] = [
          {
            code: 'REQUIRED_FACT_MISSING',
            severity: 'blocking',
            fields: ['tenant_full_name'],
            affected_question_id: 'tenant_full_name',
            user_fix_hint: 'Required: tenant_full_name',
          },
        ];

        const filtered = filterWizardIssues(issues, context);

        // Regardless of route, tenant_full_name should not appear if not answered
        expect(filtered.length).toBe(0);
      }
    );
  });

  describe('Wizard Save vs Preview Context', () => {
    test('wizard context filters out future missing facts', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'Test',
        },
      };

      const issues: ValidationIssue[] = [
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['tenant_full_name'],
          user_fix_hint: 'Missing tenant name',
        },
        {
          code: 'REQUIRED_FACT_MISSING',
          severity: 'blocking',
          fields: ['property_address_line1'],
          user_fix_hint: 'Missing property address',
        },
      ];

      // Wizard context: should filter out future steps
      const wizardFiltered = filterWizardIssues(issues, context);
      expect(wizardFiltered.length).toBe(0);

      // Preview context: should show all issues (use transformIssuesWithFriendlyLabels)
      const previewTransformed = transformIssuesWithFriendlyLabels(issues);
      expect(previewTransformed.length).toBe(2);
    });
  });

  // ============================================================================
  // REGRESSION TEST: Issue with undefined/missing fields (crash from FlowCapabilityError)
  // https://github.com/woodhall335/landlord-heavenv3/issues/X
  // ============================================================================
  describe('Defensive handling of malformed issues', () => {
    test('REGRESSION: does not crash when issue.fields is undefined (FlowCapabilityError case)', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {
          landlord_full_name: 'Test',
        },
      };

      // Simulate a FlowCapabilityError-style issue where fields is undefined
      const issuesWithUndefinedFields = [
        {
          code: 'FLOW_NOT_DEFINED',
          severity: 'blocking' as const,
          fields: undefined as any, // This was causing the crash: "issue.fields is not iterable"
          user_fix_hint: 'Flow england/complete_pack is not defined in matrix',
        },
      ];

      // Should NOT throw TypeError: issue.fields is not iterable
      expect(() => filterWizardIssues(issuesWithUndefinedFields, context)).not.toThrow();

      const filtered = filterWizardIssues(issuesWithUndefinedFields, context);
      // The issue should still be processed, just treated as having no fields to check
      expect(filtered).toBeDefined();
    });

    test('REGRESSION: does not crash when issue.fields is null', () => {
      const context: WizardIssueFilterContext = {
        jurisdiction: 'england',
        product: 'notice_only',
        route: 'section_21',
        facts: {},
      };

      const issuesWithNullFields = [
        {
          code: 'FLOW_MISCONFIGURED',
          severity: 'blocking' as const,
          fields: null as any,
          user_fix_hint: 'Flow is misconfigured',
        },
      ];

      expect(() => filterWizardIssues(issuesWithNullFields, context)).not.toThrow();
    });

    test('REGRESSION: transformIssuesWithFriendlyLabels handles undefined fields', () => {
      const issues = [
        {
          code: 'FLOW_NOT_SUPPORTED',
          severity: 'blocking' as const,
          fields: undefined as any,
          user_fix_hint: 'This flow is not supported',
        },
      ];

      // Should NOT throw
      expect(() => transformIssuesWithFriendlyLabels(issues)).not.toThrow();

      const transformed = transformIssuesWithFriendlyLabels(issues);
      expect(transformed.length).toBe(1);
      expect(transformed[0].friendlyAction).toBeDefined();
    });
  });
});
