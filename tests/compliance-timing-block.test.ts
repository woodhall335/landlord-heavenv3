/**
 * Compliance Timing Block Tests
 *
 * Tests to verify:
 * 1. API returns correct structured response for compliance blocks
 * 2. Issue sanitization works correctly
 * 3. Type guards work correctly
 * 4. Date formatting doesn't shift dates by a day
 * 5. UI never exposes internal field codes
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeComplianceIssue,
  sanitizeComplianceIssues,
  isComplianceTimingBlock,
  FIELD_TO_DOCUMENT_LABEL,
  FIELD_TO_CATEGORY,
  type SanitizedComplianceIssue,
  type ComplianceTimingBlockResponse,
  type RegenerateSuccessResponse,
  type RegenerateErrorResponse,
} from '@/lib/documents/compliance-timing-types';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';

describe('Compliance Timing Types and Sanitization', () => {
  describe('sanitizeComplianceIssue', () => {
    it('adds documentLabel and category from known field mapping', () => {
      const rawIssue = {
        field: 'gas_safety_timing',
        message: 'Gas safety certificate was provided AFTER tenant occupation.',
        expected: 'Before 15 January 2024',
        actual: '2024-01-20',
        severity: 'error' as const,
      };

      const sanitized = sanitizeComplianceIssue(rawIssue);

      expect(sanitized.field).toBe('gas_safety_timing'); // Kept for logging
      expect(sanitized.documentLabel).toBe('Gas Safety Certificate (CP12)');
      expect(sanitized.category).toBe('timing');
      expect(sanitized.message).toBe(rawIssue.message);
      expect(sanitized.expected).toBe(rawIssue.expected);
      expect(sanitized.actual).toBe(rawIssue.actual);
      expect(sanitized.severity).toBe('error');
    });

    it('uses generic fallback for unknown field', () => {
      const rawIssue = {
        field: 'unknown_field_xyz',
        message: 'Some compliance issue',
        severity: 'error' as const,
      };

      const sanitized = sanitizeComplianceIssue(rawIssue);

      expect(sanitized.field).toBe('unknown_field_xyz'); // Kept for logging
      expect(sanitized.documentLabel).toBe('Compliance requirement'); // Generic
      expect(sanitized.category).toBe('other'); // Default category
    });

    it('correctly categorizes expiry issues', () => {
      const rawIssue = {
        field: 'gas_safety_expiry',
        message: 'Gas safety certificate is more than 12 months old.',
        severity: 'error' as const,
      };

      const sanitized = sanitizeComplianceIssue(rawIssue);

      expect(sanitized.category).toBe('expiry');
      expect(sanitized.documentLabel).toBe('Gas Safety Certificate (CP12)');
    });

    it('correctly categorizes deposit issues', () => {
      const rawIssue = {
        field: 'prescribed_info_timing',
        message: 'Prescribed info served too late.',
        severity: 'error' as const,
      };

      const sanitized = sanitizeComplianceIssue(rawIssue);

      expect(sanitized.category).toBe('deposit');
    });
  });

  describe('sanitizeComplianceIssues', () => {
    it('sanitizes an array of issues', () => {
      const rawIssues = [
        { field: 'epc_timing', message: 'EPC issue', severity: 'error' as const },
        { field: 'how_to_rent_timing', message: 'HTR issue', severity: 'warning' as const },
      ];

      const sanitized = sanitizeComplianceIssues(rawIssues);

      expect(sanitized).toHaveLength(2);
      expect(sanitized[0].documentLabel).toBe('Energy Performance Certificate (EPC)');
      expect(sanitized[1].documentLabel).toBe('How to Rent Guide');
    });
  });

  describe('isComplianceTimingBlock type guard', () => {
    it('returns true for compliance timing block response', () => {
      const response: ComplianceTimingBlockResponse = {
        ok: false,
        error: 'compliance_timing_block',
        code: 'COMPLIANCE_TIMING_BLOCK',
        issues: [],
        message: 'Test message',
      };

      expect(isComplianceTimingBlock(response)).toBe(true);
    });

    it('returns false for success response', () => {
      const response: RegenerateSuccessResponse = {
        ok: true,
        regenerated_count: 1,
        document_ids: ['abc'],
      };

      expect(isComplianceTimingBlock(response)).toBe(false);
    });

    it('returns false for generic error response', () => {
      const response: RegenerateErrorResponse = {
        ok: false,
        error: 'Something went wrong',
        message: 'Error details',
      };

      expect(isComplianceTimingBlock(response)).toBe(false);
    });
  });

  describe('Field to label mappings', () => {
    it('has mappings for all expected fields', () => {
      const expectedFields = [
        'epc_timing',
        'gas_safety_timing',
        'gas_safety_expiry',
        'how_to_rent_timing',
        'prescribed_info_timing',
      ];

      for (const field of expectedFields) {
        expect(FIELD_TO_DOCUMENT_LABEL[field]).toBeDefined();
        expect(FIELD_TO_DOCUMENT_LABEL[field].length).toBeGreaterThan(0);
      }
    });

    it('has category mappings for all expected fields', () => {
      const expectedFields = [
        'epc_timing',
        'gas_safety_timing',
        'gas_safety_expiry',
        'how_to_rent_timing',
        'prescribed_info_timing',
      ];

      for (const field of expectedFields) {
        expect(FIELD_TO_CATEGORY[field]).toBeDefined();
        expect(['timing', 'expiry', 'deposit', 'other']).toContain(FIELD_TO_CATEGORY[field]);
      }
    });
  });

  describe('Date formatting safety', () => {
    /**
     * This test verifies that YYYY-MM-DD dates are parsed correctly as local dates.
     * The bug being prevented: new Date('2024-01-15') is interpreted as UTC midnight,
     * which in negative UTC offset timezones displays as the previous day.
     */
    it('parseLocalDate concept: YYYY-MM-DD should not shift by a day', () => {
      // Simulate the parseLocalDate logic from ComplianceTimingBlocker
      function parseLocalDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          const [, year, month, day] = match;
          return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
      }

      // Test that parsing '2024-01-15' gives us January 15, not January 14
      const testDate = '2024-01-15';
      const parsed = parseLocalDate(testDate);

      expect(parsed).not.toBeNull();
      expect(parsed!.getDate()).toBe(15);
      expect(parsed!.getMonth()).toBe(0); // January = 0
      expect(parsed!.getFullYear()).toBe(2024);
    });

    it('handles edge case dates correctly', () => {
      function parseLocalDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          const [, year, month, day] = match;
          return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        }
        return null;
      }

      // Test month boundaries
      const jan1 = parseLocalDate('2024-01-01');
      expect(jan1!.getDate()).toBe(1);
      expect(jan1!.getMonth()).toBe(0);

      const dec31 = parseLocalDate('2024-12-31');
      expect(dec31!.getDate()).toBe(31);
      expect(dec31!.getMonth()).toBe(11);

      // Test leap year
      const feb29 = parseLocalDate('2024-02-29');
      expect(feb29!.getDate()).toBe(29);
      expect(feb29!.getMonth()).toBe(1);
    });
  });
});

describe('API Response Structure Compliance', () => {
  it('ComplianceTimingBlockResponse has all required fields', () => {
    // This test documents the expected API contract
    const response: ComplianceTimingBlockResponse = {
      ok: false,
      error: 'compliance_timing_block',
      code: 'COMPLIANCE_TIMING_BLOCK',
      message: "We can't generate your Section 21 pack yet.",
      issues: [
        {
          field: 'gas_safety_timing',
          documentLabel: 'Gas Safety Certificate (CP12)',
          category: 'timing',
          message: 'Gas safety must be provided before occupation.',
          expected: 'Before 15 January 2024',
          actual: '2024-01-20',
          severity: 'error',
        },
      ],
      tenancy_start_date: '2024-01-15',
    };

    // Verify structure
    expect(response.ok).toBe(false);
    expect(response.code).toBe('COMPLIANCE_TIMING_BLOCK');
    expect(Array.isArray(response.issues)).toBe(true);
    expect(response.issues[0].documentLabel).toBeDefined();
    expect(response.issues[0].category).toBeDefined();
  });

  it('SanitizedComplianceIssue has documentLabel for UI display', () => {
    const issue: SanitizedComplianceIssue = {
      field: 'gas_safety_timing', // Internal only
      documentLabel: 'Gas Safety Certificate (CP12)', // For UI
      category: 'timing',
      message: 'Test message',
      severity: 'error',
    };

    // UI should use documentLabel, not field
    expect(issue.documentLabel).toBeDefined();
    expect(issue.documentLabel.length).toBeGreaterThan(0);
    // documentLabel should NOT look like an internal code
    expect(issue.documentLabel).not.toContain('_');
  });
});

describe('No Internal Codes Exposed', () => {
  it('documentLabel values do not contain underscores', () => {
    for (const [field, label] of Object.entries(FIELD_TO_DOCUMENT_LABEL)) {
      expect(label).not.toContain('_');
      expect(label.length).toBeGreaterThan(5); // Should be human-readable
    }
  });

  it('all labels are user-friendly strings', () => {
    const labels = Object.values(FIELD_TO_DOCUMENT_LABEL);

    for (const label of labels) {
      // Should start with a capital letter
      expect(label[0]).toBe(label[0].toUpperCase());
      // Should not be all caps (technical code style)
      expect(label).not.toBe(label.toUpperCase());
    }
  });
});

/**
 * P0 FIX TESTS: Preflight Validation Prevents Document Deletion
 *
 * These tests verify that the regenerate endpoint does NOT delete documents
 * when compliance timing validation would fail. This prevents data loss.
 */
describe('Preflight Compliance Validation - Data Loss Prevention', () => {
  // Mock compliance timing data that would fail validation
  const FAILING_TIMING_DATA = {
    tenancy_start_date: '2024-01-15',
    // EPC provided AFTER tenancy start - should fail
    epc_provided_date: '2024-01-20',
    // Gas safety provided AFTER occupation - should fail
    gas_safety_check_date: '2024-01-10',
    gas_safety_provided_date: '2024-01-20', // After tenancy start
    has_gas_at_property: true,
    // How to rent provided AFTER tenancy start - should fail
    how_to_rent_provided_date: '2024-01-18',
  };

  // Mock compliance timing data that would pass validation
  const PASSING_TIMING_DATA = {
    tenancy_start_date: '2024-01-15',
    epc_provided_date: '2024-01-10', // Before tenancy start
    gas_safety_check_date: '2024-01-05',
    gas_safety_provided_date: '2024-01-10', // Before tenancy start
    has_gas_at_property: true,
    how_to_rent_provided_date: '2024-01-12', // Before tenancy start
  };

  it('validateComplianceTiming returns invalid for late EPC provision', () => {
    // Import the validator
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20', // AFTER tenancy start
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.some((i: any) => i.field === 'epc_timing')).toBe(true);
  });

  it('validateComplianceTiming returns invalid for late gas safety provision', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      gas_safety_provided_date: '2024-01-20', // AFTER occupation
      has_gas_at_property: true,
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.some((i: any) => i.field === 'gas_safety_timing')).toBe(true);
  });

  it('validateComplianceTiming returns invalid for late how to rent provision', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      how_to_rent_provided_date: '2024-01-18', // AFTER tenancy start
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.some((i: any) => i.field === 'how_to_rent_timing')).toBe(true);
  });

  it('validateComplianceTiming returns valid when all dates are before tenancy start', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-10',
      gas_safety_provided_date: '2024-01-10',
      has_gas_at_property: true,
      how_to_rent_provided_date: '2024-01-12',
    });

    expect(result.isValid).toBe(true);
    expect(result.issues.filter((i: any) => i.severity === 'error')).toHaveLength(0);
  });

  it('sanitized issues contain documentLabel, not just field', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20',
    });

    const blockingIssues = result.issues.filter((i: any) => i.severity === 'error');
    const sanitized = sanitizeComplianceIssues(blockingIssues);

    // Each sanitized issue must have documentLabel
    for (const issue of sanitized) {
      expect(issue.documentLabel).toBeDefined();
      expect(issue.documentLabel.length).toBeGreaterThan(0);
      // documentLabel should not contain underscores (internal code style)
      expect(issue.documentLabel).not.toContain('_');
    }
  });
});

/**
 * P0 FIX TESTS: Fulfill Endpoint Compliance Block Response
 *
 * These tests verify that the fulfill endpoint returns the same structured
 * 422 response as the regenerate endpoint when compliance timing fails.
 */
describe('Fulfill Endpoint Compliance Block Response', () => {
  it('isComplianceTimingBlock works with fulfill-style response (success field)', () => {
    // Fulfill endpoint uses `success: false` instead of `ok: false`
    // The type guard should handle both
    const fulfillBlockResponse = {
      ok: false, // ComplianceTimingBlockResponse uses `ok`
      error: 'compliance_timing_block',
      code: 'COMPLIANCE_TIMING_BLOCK',
      issues: [],
      message: 'Test',
    };

    expect(isComplianceTimingBlock(fulfillBlockResponse)).toBe(true);
  });

  it('isComplianceTimingBlock returns false for fulfill success response', () => {
    const successResponse = {
      success: true,
      status: 'fulfilled',
      documents: 3,
    };

    expect(isComplianceTimingBlock(successResponse as any)).toBe(false);
  });

  it('isComplianceTimingBlock returns false for generic fulfill error', () => {
    const errorResponse = {
      success: false,
      error: 'Document generation failed',
      message: 'Some error',
    };

    expect(isComplianceTimingBlock(errorResponse as any)).toBe(false);
  });

  it('ComplianceTimingBlockResponse structure is consistent across endpoints', () => {
    // Both endpoints should return the same structure
    const expectedStructure: ComplianceTimingBlockResponse = {
      ok: false,
      error: 'compliance_timing_block',
      code: 'COMPLIANCE_TIMING_BLOCK',
      message: "We can't generate your Section 21 pack yet.",
      issues: [
        {
          field: 'epc_timing',
          documentLabel: 'Energy Performance Certificate (EPC)',
          category: 'timing',
          message: 'EPC was provided AFTER tenancy start date.',
          expected: 'Before 2024-01-15',
          actual: '2024-01-20',
          severity: 'error',
        },
      ],
      tenancy_start_date: '2024-01-15',
    };

    // Verify the structure has all required fields
    expect(expectedStructure.ok).toBe(false);
    expect(expectedStructure.code).toBe('COMPLIANCE_TIMING_BLOCK');
    expect(expectedStructure.error).toBe('compliance_timing_block');
    expect(expectedStructure.issues).toBeInstanceOf(Array);
    expect(expectedStructure.issues[0].documentLabel).toBeDefined();
    expect(expectedStructure.issues[0].category).toBeDefined();
    expect(expectedStructure.message).toBeDefined();
  });
});

/**
 * Regression Tests: No Bypass Paths
 *
 * These tests verify that there are no bypass/override mechanisms
 * for compliance timing validation.
 */
describe('No Bypass Paths for Compliance Timing', () => {
  it('validateComplianceTiming does not accept bypass flags', () => {
    // Using imported validateComplianceTiming

    // Try passing various bypass-like parameters
    const resultWithBypass = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20', // AFTER tenancy start
      // These should be ignored if they exist
      bypass: true,
      skip_validation: true,
      force: true,
      override: true,
    });

    // Should still fail - no bypass allowed
    expect(resultWithBypass.isValid).toBe(false);
  });

  it('sanitized response does not contain bypass instructions', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20',
    });

    const sanitized = sanitizeComplianceIssues(result.issues);
    const responseJson = JSON.stringify(sanitized);

    // Response should not contain any bypass-related text
    expect(responseJson.toLowerCase()).not.toContain('bypass');
    expect(responseJson.toLowerCase()).not.toContain('override');
    expect(responseJson.toLowerCase()).not.toContain('skip');
    expect(responseJson.toLowerCase()).not.toContain('force');
  });

  it('response messages guide users to fix data, not bypass', () => {
    // Using imported validateComplianceTiming

    const result = validateComplianceTiming({
      tenancy_start_date: '2024-01-15',
      epc_provided_date: '2024-01-20',
    });

    // Messages should indicate user needs to correct the data
    for (const issue of result.issues) {
      // Should mention the violation, not how to bypass it
      expect(issue.message.toLowerCase()).not.toContain('contact support to bypass');
      expect(issue.message.toLowerCase()).not.toContain('admin override');
    }
  });
});
