/**
 * Smart Review Orchestrator Gating Tests
 *
 * Tests that the orchestrator correctly gates by product and jurisdiction.
 * Focus on notice_only pilot which is England-only, warning-only mode.
 *
 * @module src/lib/evidence/smart-review/__tests__/orchestrator-gating.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the classify module's feature flags BEFORE importing orchestrator
vi.mock('../classify', async () => {
  const actual = await vi.importActual('../classify');
  return {
    ...actual,
    isSmartReviewEnabled: vi.fn(() => true),
    isVisionOCREnabled: vi.fn(() => true),
  };
});

// Import after mocking
import { checkEligibility } from '../orchestrator';
import type { SmartReviewInput } from '../orchestrator';

describe('Smart Review Orchestrator Gating', () => {
  // Helper to create minimal input for eligibility checks
  const createInput = (
    product: string,
    jurisdiction: string
  ): SmartReviewInput => ({
    caseId: 'test-case-123',
    product,
    jurisdiction,
    wizardFacts: {},
    evidenceBundle: {
      tenancy_agreement: [
        {
          id: 'doc-1',
          filename: 'agreement.pdf',
          original_filename: 'agreement.pdf',
          content_type: 'application/pdf',
          size: 100000,
          url: 'https://example.com/doc.pdf',
          created_at: new Date().toISOString(),
          category: 'tenancy_agreement',
        },
      ],
    },
  });

  describe('Product gating', () => {
    it('should allow complete_pack for England', () => {
      const input = createInput('complete_pack', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(true);
      expect(result.skipReason).toBeUndefined();
    });

    it('should allow eviction_pack for England', () => {
      const input = createInput('eviction_pack', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(true);
      expect(result.skipReason).toBeUndefined();
    });

    it('should allow notice_only for England (pilot)', () => {
      const input = createInput('notice_only', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(true);
      expect(result.skipReason).toBeUndefined();
    });

    it('should reject money_claim', () => {
      const input = createInput('money_claim', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_PRODUCT');
    });

    it('should reject tenancy_agreement', () => {
      const input = createInput('tenancy_agreement', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_PRODUCT');
    });

    it('should reject ast_standard', () => {
      const input = createInput('ast_standard', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_PRODUCT');
    });
  });

  describe('Jurisdiction gating', () => {
    it('should allow England for notice_only', () => {
      const input = createInput('notice_only', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(true);
    });

    it('should reject Wales for notice_only (not in pilot)', () => {
      const input = createInput('notice_only', 'wales');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_JURISDICTION');
      expect(result.skipReason?.reason).toContain('England');
    });

    it('should reject Scotland for notice_only (not in pilot)', () => {
      const input = createInput('notice_only', 'scotland');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_JURISDICTION');
    });

    it('should reject Northern Ireland for notice_only', () => {
      const input = createInput('notice_only', 'northern-ireland');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_JURISDICTION');
    });

    it('should reject Wales for complete_pack', () => {
      const input = createInput('complete_pack', 'wales');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('WRONG_JURISDICTION');
    });
  });

  describe('Document presence check', () => {
    it('should reject when no documents uploaded', () => {
      const input: SmartReviewInput = {
        caseId: 'test-case-123',
        product: 'notice_only',
        jurisdiction: 'england',
        wizardFacts: {},
        evidenceBundle: {}, // Empty bundle
      };

      const result = checkEligibility(input);

      expect(result.eligible).toBe(false);
      expect(result.skipReason?.code).toBe('NO_DOCUMENTS');
    });

    it('should accept when at least one document exists', () => {
      const input = createInput('notice_only', 'england');
      const result = checkEligibility(input);

      expect(result.eligible).toBe(true);
    });
  });
});

describe('Notice Only Warning Downgrade', () => {
  // Note: Full runSmartReview tests would require mocking Supabase storage,
  // AI extraction, etc. These tests verify the gating logic only.
  // The warning downgrade is tested implicitly by the integration tests.

  it('notice_only should be in supported products list', () => {
    // This test documents that notice_only is explicitly supported
    const input = createInput('notice_only', 'england');
    const result = checkEligibility(input);

    expect(result.eligible).toBe(true);
  });
});

/**
 * Helper function for creating test input
 */
function createInput(product: string, jurisdiction: string): SmartReviewInput {
  return {
    caseId: 'test-case-123',
    product,
    jurisdiction,
    wizardFacts: {},
    evidenceBundle: {
      tenancy_agreement: [
        {
          id: 'doc-1',
          filename: 'agreement.pdf',
          original_filename: 'agreement.pdf',
          content_type: 'application/pdf',
          size: 100000,
          url: 'https://example.com/doc.pdf',
          created_at: new Date().toISOString(),
          category: 'tenancy_agreement',
        },
      ],
    },
  };
}
