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
