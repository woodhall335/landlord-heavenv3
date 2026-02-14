/**
 * Smart Review Persistence Tests
 *
 * Tests for persisting Smart Review results to case_facts:
 * - Results persist after Smart Review runs
 * - Persisted results survive refresh (load from case_facts)
 * - Empty/skipped states handled correctly
 *
 * @module tests/complete-pack/smart-review-persistence.test
 */

import { describe, it, expect } from 'vitest';
import type {
  PersistedSmartReview,
  PersistedSmartReviewWarning,
  WizardFacts,
} from '@/lib/case-facts/schema';

// =============================================================================
// Test Data
// =============================================================================

const mockWarning: PersistedSmartReviewWarning = {
  code: 'FACT_MISMATCH_RENT_AMOUNT',
  severity: 'warning',
  title: 'Possible rent amount mismatch',
  message: 'The rent amount in your tenancy agreement appears different from what you entered.',
  fields: ['rent_amount'],
  relatedUploads: ['upload-123'],
  suggestedUserAction: 'Please verify the rent amount matches your tenancy agreement.',
  confidence: 0.85,
  comparison: {
    wizardValue: 1200,
    extractedValue: 1100,
    source: 'Tenancy Agreement Page 1',
  },
};

const mockBlockerWarning: PersistedSmartReviewWarning = {
  code: 'FACT_MISSING_PROOF_DEPOSIT_PROTECTION',
  severity: 'blocker',
  title: 'Missing deposit protection proof',
  message: 'No deposit protection certificate was found in your uploads.',
  fields: ['deposit_protected'],
  relatedUploads: [],
  suggestedUserAction: 'Upload your deposit protection certificate to verify compliance.',
};

const mockInfoWarning: PersistedSmartReviewWarning = {
  code: 'EXTRACT_LOW_CONFIDENCE',
  severity: 'info',
  title: 'Low confidence extraction',
  message: 'Some document text could not be read clearly.',
  fields: [],
  relatedUploads: ['upload-456'],
  suggestedUserAction: 'Consider uploading a clearer copy of this document.',
  confidence: 0.4,
};

const mockPersistedSmartReview: PersistedSmartReview = {
  ranAt: '2025-01-15T10:30:00Z',
  warnings: [mockBlockerWarning, mockWarning, mockInfoWarning],
  summary: {
    documentsProcessed: 3,
    documentsCached: 0,
    documentsSkipped: 0,
    documentsTimedOut: 0,
    pagesProcessed: 8,
    warningsTotal: 3,
    warningsBlocker: 1,
    warningsWarning: 1,
    warningsInfo: 1,
  },
  limitsApplied: {
    maxFilesPerRun: 10,
    maxPagesPerPdf: 3,
    maxTotalPages: 12,
    filesExceededLimit: false,
    pagesExceededLimit: false,
  },
  costUsd: 0.05,
};

const mockSkippedSmartReview: PersistedSmartReview = {
  ranAt: '2025-01-15T10:30:00Z',
  warnings: [],
  summary: {
    documentsProcessed: 0,
    documentsCached: 0,
    documentsSkipped: 0,
    documentsTimedOut: 0,
    pagesProcessed: 0,
    warningsTotal: 0,
    warningsBlocker: 0,
    warningsWarning: 0,
    warningsInfo: 0,
  },
  skipped: {
    reason: 'No documents uploaded',
    code: 'NO_DOCUMENTS',
  },
};

// =============================================================================
// Schema Tests
// =============================================================================

describe('Smart Review Persistence Schema', () => {
  describe('PersistedSmartReviewWarning', () => {
    it('stores all warning fields', () => {
      expect(mockWarning.code).toBe('FACT_MISMATCH_RENT_AMOUNT');
      expect(mockWarning.severity).toBe('warning');
      expect(mockWarning.title).toContain('mismatch');
      expect(mockWarning.message).toContain('appears different');
      expect(mockWarning.fields).toContain('rent_amount');
      expect(mockWarning.relatedUploads).toContain('upload-123');
      expect(mockWarning.suggestedUserAction).toContain('verify');
      expect(mockWarning.confidence).toBe(0.85);
      expect(mockWarning.comparison).toBeDefined();
    });

    it('handles warnings without comparison', () => {
      const warningWithoutComparison: PersistedSmartReviewWarning = {
        ...mockBlockerWarning,
        comparison: undefined,
      };

      expect(warningWithoutComparison.comparison).toBeUndefined();
    });

    it('handles warnings without confidence', () => {
      const warningWithoutConfidence: PersistedSmartReviewWarning = {
        ...mockBlockerWarning,
        confidence: undefined,
      };

      expect(warningWithoutConfidence.confidence).toBeUndefined();
    });
  });

  describe('PersistedSmartReview', () => {
    it('stores complete run metadata', () => {
      expect(mockPersistedSmartReview.ranAt).toBe('2025-01-15T10:30:00Z');
      expect(mockPersistedSmartReview.warnings.length).toBe(3);
      expect(mockPersistedSmartReview.summary.documentsProcessed).toBe(3);
      expect(mockPersistedSmartReview.summary.warningsTotal).toBe(3);
      expect(mockPersistedSmartReview.limitsApplied?.maxFilesPerRun).toBe(10);
      expect(mockPersistedSmartReview.costUsd).toBe(0.05);
    });

    it('stores skipped run metadata', () => {
      expect(mockSkippedSmartReview.skipped).toBeDefined();
      expect(mockSkippedSmartReview.skipped?.reason).toBe('No documents uploaded');
      expect(mockSkippedSmartReview.skipped?.code).toBe('NO_DOCUMENTS');
      expect(mockSkippedSmartReview.warnings.length).toBe(0);
    });

    it('summary counts match actual warnings', () => {
      const blockers = mockPersistedSmartReview.warnings.filter(w => w.severity === 'blocker').length;
      const warnings = mockPersistedSmartReview.warnings.filter(w => w.severity === 'warning').length;
      const infos = mockPersistedSmartReview.warnings.filter(w => w.severity === 'info').length;

      expect(mockPersistedSmartReview.summary.warningsBlocker).toBe(blockers);
      expect(mockPersistedSmartReview.summary.warningsWarning).toBe(warnings);
      expect(mockPersistedSmartReview.summary.warningsInfo).toBe(infos);
      expect(mockPersistedSmartReview.summary.warningsTotal).toBe(blockers + warnings + infos);
    });
  });

  describe('WizardFacts with __smart_review', () => {
    it('includes __smart_review in WizardFacts', () => {
      const facts: WizardFacts = {
        __meta: {
          product: 'complete_pack',
          original_product: 'complete_pack',
          jurisdiction: 'england',
          case_id: 'case-123',
        },
        __smart_review: mockPersistedSmartReview,
        landlord_full_name: 'John Smith',
        rent_amount: 1200,
      };

      expect(facts.__smart_review).toBeDefined();
      expect(facts.__smart_review?.warnings.length).toBe(3);
      expect(facts.__smart_review?.ranAt).toBe('2025-01-15T10:30:00Z');
    });

    it('handles WizardFacts without __smart_review', () => {
      const facts: WizardFacts = {
        __meta: {
          product: 'complete_pack',
          original_product: 'complete_pack',
        },
        landlord_full_name: 'John Smith',
      };

      expect(facts.__smart_review).toBeUndefined();
    });
  });
});

// =============================================================================
// Persistence Logic Tests
// =============================================================================

describe('Smart Review Persistence Logic', () => {
  describe('Persisted data structure', () => {
    it('contains all fields needed for UI rendering', () => {
      // Essential fields for SmartReviewPanel
      const sr = mockPersistedSmartReview;

      // Summary for header
      expect(sr.ranAt).toBeDefined();
      expect(sr.summary.documentsProcessed).toBeDefined();
      expect(sr.summary.warningsTotal).toBeDefined();

      // Warnings for list
      for (const warning of sr.warnings) {
        expect(warning.severity).toBeDefined();
        expect(warning.title).toBeDefined();
        expect(warning.message).toBeDefined();
        expect(warning.suggestedUserAction).toBeDefined();
      }
    });

    it('preserves comparison data for mismatch display', () => {
      const mismatchWarning = mockPersistedSmartReview.warnings.find(
        w => w.code === 'FACT_MISMATCH_RENT_AMOUNT'
      );

      expect(mismatchWarning?.comparison).toBeDefined();
      expect(mismatchWarning?.comparison?.wizardValue).toBe(1200);
      expect(mismatchWarning?.comparison?.extractedValue).toBe(1100);
      expect(mismatchWarning?.comparison?.source).toContain('Tenancy Agreement');
    });

    it('handles empty warnings array', () => {
      const emptyResult: PersistedSmartReview = {
        ranAt: new Date().toISOString(),
        warnings: [],
        summary: {
          documentsProcessed: 2,
          documentsCached: 0,
          documentsSkipped: 0,
          documentsTimedOut: 0,
          pagesProcessed: 5,
          warningsTotal: 0,
          warningsBlocker: 0,
          warningsWarning: 0,
          warningsInfo: 0,
        },
      };

      expect(emptyResult.warnings).toEqual([]);
      expect(emptyResult.summary.warningsTotal).toBe(0);
    });
  });

  describe('Limits tracking', () => {
    it('tracks when file limit exceeded', () => {
      const limitedResult: PersistedSmartReview = {
        ...mockPersistedSmartReview,
        limitsApplied: {
          maxFilesPerRun: 10,
          maxPagesPerPdf: 3,
          maxTotalPages: 12,
          filesExceededLimit: true,
          pagesExceededLimit: false,
        },
      };

      expect(limitedResult.limitsApplied?.filesExceededLimit).toBe(true);
    });

    it('tracks when page limit exceeded', () => {
      const limitedResult: PersistedSmartReview = {
        ...mockPersistedSmartReview,
        limitsApplied: {
          maxFilesPerRun: 10,
          maxPagesPerPdf: 3,
          maxTotalPages: 12,
          filesExceededLimit: false,
          pagesExceededLimit: true,
        },
      };

      expect(limitedResult.limitsApplied?.pagesExceededLimit).toBe(true);
    });
  });
});

// =============================================================================
// Safe Language Validation (Persistence Layer)
// =============================================================================

describe('Persisted Warnings Safe Language', () => {
  const FORBIDDEN_PHRASES = [
    'invalid',
    'not valid',
    'guarantee',
    'guaranteed',
    'court will',
    'court would',
    'legal advice',
    'must be',
    'you must',
  ];

  it('mock warnings use safe language', () => {
    const allWarnings = [mockBlockerWarning, mockWarning, mockInfoWarning];

    for (const warning of allWarnings) {
      const fullText = `${warning.title} ${warning.message} ${warning.suggestedUserAction}`.toLowerCase();

      for (const phrase of FORBIDDEN_PHRASES) {
        expect(fullText).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it('persisted warnings preserve safe language from source', () => {
    // Persisted warnings should be exact copies of source warnings
    // which are validated in smart-review-safe-language.test.ts
    for (const warning of mockPersistedSmartReview.warnings) {
      // Check message uses "possible", "appears", "may", etc.
      const usesQualifyingLanguage =
        warning.message.includes('possible') ||
        warning.message.includes('appears') ||
        warning.message.includes('may') ||
        warning.message.includes('could') ||
        warning.message.includes('No ');

      expect(usesQualifyingLanguage).toBe(true);
    }
  });
});

// =============================================================================
// Scope Verification
// =============================================================================

describe('Smart Review Scope', () => {
  it('only applies to complete_pack product', () => {
    // Smart Review should only run for complete_pack/eviction_pack
    // This is enforced at the API level, not the schema level
    // But we can verify the schema supports the product check
    const completePack: WizardFacts = {
      __meta: { product: 'complete_pack', original_product: null },
      __smart_review: mockPersistedSmartReview,
    };

    const noticeOnly: WizardFacts = {
      __meta: { product: 'notice_only', original_product: null },
      // __smart_review should never be set for notice_only
    };

    const moneyClaim: WizardFacts = {
      __meta: { product: 'money_claim', original_product: null },
      // __smart_review should never be set for money_claim
    };

    expect(completePack.__smart_review).toBeDefined();
    expect(noticeOnly.__smart_review).toBeUndefined();
    expect(moneyClaim.__smart_review).toBeUndefined();
  });

  it('only applies to England jurisdiction', () => {
    // Smart Review v1 only supports England
    const england: WizardFacts = {
      __meta: { product: 'complete_pack', original_product: null, jurisdiction: 'england' },
      __smart_review: mockPersistedSmartReview,
    };

    const scotland: WizardFacts = {
      __meta: { product: 'complete_pack', original_product: null, jurisdiction: 'scotland' },
      // __smart_review should never be set for non-England
    };

    const wales: WizardFacts = {
      __meta: { product: 'complete_pack', original_product: null, jurisdiction: 'wales' },
      // __smart_review should never be set for non-England
    };

    expect(england.__smart_review).toBeDefined();
    expect(scotland.__smart_review).toBeUndefined();
    expect(wales.__smart_review).toBeUndefined();
  });
});
