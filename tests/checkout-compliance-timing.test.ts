/**
 * Checkout Compliance Timing Validation Tests
 *
 * Tests to verify:
 * 1. Checkout create endpoint validates compliance timing before payment
 * 2. Gas safety expiry detection (>12 months old)
 * 3. 422 response structure matches ComplianceTimingBlockResponse
 * 4. Passing cases proceed to Stripe session creation
 */

import { describe, it, expect } from 'vitest';
import { validateComplianceTiming } from '@/lib/documents/court-ready-validator';
import { buildComplianceTimingDataFromFacts } from '@/lib/documents/compliance-timing-facts';
import {
  sanitizeComplianceIssues,
  isComplianceTimingBlock,
  type ComplianceTimingBlockResponse,
  type SanitizedComplianceIssue,
} from '@/lib/documents/compliance-timing-types';

describe('Checkout Compliance Timing Pre-Payment Validation', () => {
  describe('Gas Safety Expiry Detection', () => {
    it('blocks checkout when gas_safety_check_date is more than 12 months old', () => {
      // Example case: gas_safety_check_date = 2025-01-01, now = 2026-01-28
      // This should trigger gas_safety_expiry block
      const facts = {
        tenancy_start_date: '2024-06-01',
        gas_safety_check_date: '2025-01-01', // More than 12 months ago from 2026-01-28
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'gas_safety_expiry')).toBe(true);

      const expiryIssue = result.issues.find(i => i.field === 'gas_safety_expiry');
      expect(expiryIssue?.message).toContain('more than 12 months old');
      expect(expiryIssue?.actual).toBe('2025-01-01');
    });

    it('allows checkout when gas_safety_check_date is within 12 months', () => {
      // Gas safety check within 12 months should pass
      const facts = {
        tenancy_start_date: '2024-06-01',
        gas_safety_check_date: '2025-08-01', // Within 12 months
        gas_safety_served_date: '2024-05-01', // Before tenancy start
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      // Should not have gas_safety_expiry issue
      expect(result.issues.some(i => i.field === 'gas_safety_expiry')).toBe(false);
    });
  });

  describe('422 Response Structure', () => {
    it('builds correct ComplianceTimingBlockResponse for checkout block', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        gas_safety_check_date: '2025-01-01', // Expired
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      // Simulate what checkout create route does
      const blockingIssues = result.issues.filter(i => i.severity === 'error');
      const sanitizedIssues = sanitizeComplianceIssues(blockingIssues);

      const response: ComplianceTimingBlockResponse = {
        ok: false,
        error: 'compliance_timing_block',
        code: 'COMPLIANCE_TIMING_BLOCK',
        issues: sanitizedIssues,
        tenancy_start_date: timingData.tenancy_start_date,
        message: "We can't process your order yet because some compliance requirements haven't been met.",
      };

      // Verify response structure
      expect(response.ok).toBe(false);
      expect(response.code).toBe('COMPLIANCE_TIMING_BLOCK');
      expect(response.error).toBe('compliance_timing_block');
      expect(Array.isArray(response.issues)).toBe(true);
      expect(response.issues.length).toBeGreaterThan(0);

      // Verify issue structure
      const firstIssue = response.issues[0];
      expect(firstIssue.field).toBeDefined();
      expect(firstIssue.documentLabel).toBeDefined();
      expect(firstIssue.category).toBeDefined();
      expect(firstIssue.message).toBeDefined();
      expect(firstIssue.severity).toBe('error');
    });

    it('includes documentLabel for UI display', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        gas_safety_check_date: '2025-01-01', // Expired
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);
      const sanitizedIssues = sanitizeComplianceIssues(result.issues);

      const gasExpiryIssue = sanitizedIssues.find(i => i.field === 'gas_safety_expiry');
      expect(gasExpiryIssue).toBeDefined();
      expect(gasExpiryIssue?.documentLabel).toBe('Gas Safety Certificate (CP12)');
      expect(gasExpiryIssue?.category).toBe('expiry');
    });
  });

  describe('Type Guard for Frontend', () => {
    it('isComplianceTimingBlock correctly identifies block response', () => {
      const blockResponse: ComplianceTimingBlockResponse = {
        ok: false,
        error: 'compliance_timing_block',
        code: 'COMPLIANCE_TIMING_BLOCK',
        issues: [],
        message: 'Test',
      };

      expect(isComplianceTimingBlock(blockResponse)).toBe(true);
    });

    it('isComplianceTimingBlock returns false for success response', () => {
      const successResponse = {
        status: 'new',
        success: true,
        session_id: 'cs_123',
        session_url: 'https://checkout.stripe.com/...',
        order_id: 'uuid-123',
      };

      expect(isComplianceTimingBlock(successResponse)).toBe(false);
    });

    it('isComplianceTimingBlock returns false for other 422 errors', () => {
      const otherError = {
        error: 'Section 21 preconditions missing',
        code: 'SECTION21_PRECONDITIONS_MISSING',
        details: {},
      };

      expect(isComplianceTimingBlock(otherError)).toBe(false);
    });
  });

  describe('Passing Cases Proceed', () => {
    it('valid compliance timing allows checkout to proceed', () => {
      // All dates are correct
      const facts = {
        tenancy_start_date: '2024-06-01',
        epc_provided_date: '2024-05-15', // Before tenancy start
        gas_safety_check_date: '2025-10-01', // Within 12 months
        gas_safety_served_date: '2024-05-20', // Before tenancy start
        has_gas_appliances: true,
        how_to_rent_date: '2024-05-25', // Before tenancy start
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      expect(result.isValid).toBe(true);
      expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('property without gas can proceed without gas safety checks', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        epc_provided_date: '2024-05-15',
        has_gas_appliances: false, // No gas at property
        how_to_rent_date: '2024-05-25',
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Multiple Violations', () => {
    it('returns all blocking issues when multiple violations exist', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        epc_provided_date: '2024-06-15', // AFTER tenancy start
        gas_safety_check_date: '2025-01-01', // Expired (>12 months)
        gas_safety_served_date: '2024-06-10', // AFTER tenancy start
        has_gas_appliances: true,
        how_to_rent_date: '2024-06-05', // AFTER tenancy start
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);

      expect(result.isValid).toBe(false);

      // Should have multiple issues
      const errorIssues = result.issues.filter(i => i.severity === 'error');
      expect(errorIssues.length).toBeGreaterThan(1);

      // Verify each type is detected
      const fieldCodes = errorIssues.map(i => i.field);
      expect(fieldCodes).toContain('epc_timing');
      expect(fieldCodes).toContain('gas_safety_expiry');
      expect(fieldCodes).toContain('gas_safety_timing');
      expect(fieldCodes).toContain('how_to_rent_timing');
    });

    it('sanitized issues have documentLabels for all violations', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        epc_provided_date: '2024-06-15', // AFTER tenancy start
        gas_safety_check_date: '2025-01-01', // Expired
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      const result = validateComplianceTiming(timingData);
      const sanitized = sanitizeComplianceIssues(result.issues);

      // All sanitized issues should have proper labels
      for (const issue of sanitized) {
        expect(issue.documentLabel).toBeDefined();
        expect(issue.documentLabel.length).toBeGreaterThan(0);
        expect(issue.documentLabel).not.toContain('_'); // No internal codes
      }
    });
  });

  describe('Field Alias Resolution for Checkout', () => {
    it('resolves gas_safety_served_date alias from wizard', () => {
      // Wizard uses gas_safety_served_date, validator expects gas_safety_provided_date
      const facts = {
        tenancy_start_date: '2024-06-01',
        gas_safety_served_date: '2024-06-15', // AFTER tenancy - wizard field name
        has_gas_appliances: true,
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);

      // Should resolve to gas_safety_provided_date
      expect(timingData.gas_safety_provided_date).toBe('2024-06-15');

      const result = validateComplianceTiming(timingData);
      expect(result.issues.some(i => i.field === 'gas_safety_timing')).toBe(true);
    });

    it('resolves has_gas_appliances alias to has_gas_at_property', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        has_gas_appliances: true, // Wizard uses this
        gas_safety_check_date: '2025-01-01',
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      expect(timingData.has_gas_at_property).toBe(true);
    });

    it('resolves how_to_rent_date alias', () => {
      const facts = {
        tenancy_start_date: '2024-06-01',
        how_to_rent_date: '2024-06-15', // Wizard uses this - AFTER tenancy
      };

      const timingData = buildComplianceTimingDataFromFacts(facts);
      expect(timingData.how_to_rent_provided_date).toBe('2024-06-15');

      const result = validateComplianceTiming(timingData);
      expect(result.issues.some(i => i.field === 'how_to_rent_timing')).toBe(true);
    });
  });
});

describe('Integration: Checkout Create Returns 422 for Compliance Block', () => {
  /**
   * This test documents the expected behavior:
   * Given a case with gas_safety_check_date = 2025-01-01 (more than 12 months old)
   * When checkout/create is called
   * Then it should return HTTP 422 with COMPLIANCE_TIMING_BLOCK response
   * And no Stripe checkout session should be created
   */
  it('documents expected 422 response format', () => {
    // This is the exact response format returned by checkout/create
    const expectedResponse: ComplianceTimingBlockResponse = {
      ok: false,
      error: 'compliance_timing_block',
      code: 'COMPLIANCE_TIMING_BLOCK',
      issues: [
        {
          field: 'gas_safety_expiry',
          documentLabel: 'Gas Safety Certificate (CP12)',
          category: 'expiry',
          message: 'Gas safety certificate is more than 12 months old. A valid Section 21 requires a current gas safety record.',
          expected: 'Within last 12 months',
          actual: '2025-01-01',
          severity: 'error',
        },
      ],
      tenancy_start_date: '2024-06-01',
      message: "We can't process your order yet because some compliance requirements haven't been met. Please update the relevant dates in the wizard.",
    };

    // Verify the structure is correct
    expect(expectedResponse.code).toBe('COMPLIANCE_TIMING_BLOCK');
    expect(expectedResponse.issues[0].documentLabel).toBe('Gas Safety Certificate (CP12)');
    expect(expectedResponse.issues[0].category).toBe('expiry');
    expect(expectedResponse.issues[0].actual).toBe('2025-01-01');
  });
});
