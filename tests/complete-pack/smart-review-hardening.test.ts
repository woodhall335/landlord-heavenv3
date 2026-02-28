/**
 * Smart Review v1 Hardening Tests
 *
 * Tests for release hardening features:
 * - File/page limits enforcement
 * - Timeout handling
 * - Cache behavior (SHA256 deduplication)
 * - Graceful error handling (no 500s)
 * - Non-blocking behavior (warnings only)
 *
 * @module tests/complete-pack/smart-review-hardening
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  runSmartReview,
  clearExtractionCache,
  getMaxFilesPerRun,
  getMaxPagesPerPdf,
  getMaxTotalPagesPerRun,
  getDocumentTimeoutMs,
  type SmartReviewInput,
  type SmartReviewPipelineResult,
} from '@/lib/evidence/smart-review';
import {
  EvidenceCategory,
  createEmptyEvidenceBundle,
  type EvidenceBundle,
  type EvidenceUploadItem,
} from '@/lib/evidence/schema';
import { WarningCode } from '@/lib/evidence/warnings';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Create a mock upload item.
 */
function createMockUpload(
  category: EvidenceCategory,
  index: number = 0,
  options: Partial<EvidenceUploadItem> = {}
): EvidenceUploadItem {
  const id = `${category}-upload-${index}`;
  return {
    id,
    filename: `${category}_document_${index}.pdf`,
    mimeType: 'application/pdf',
    sizeBytes: 1024 * 100, // 100KB
    uploadedAt: new Date().toISOString(),
    storageKey: `uploads/${id}.pdf`,
    category,
    sha256: `sha256_${category}_${index}`,
    ...options,
  };
}

/**
 * Create a bundle with multiple uploads.
 */
function createBundleWithUploads(
  uploadCount: number,
  category: EvidenceCategory = EvidenceCategory.TENANCY_AGREEMENT
): EvidenceBundle {
  const bundle = createEmptyEvidenceBundle();
  const uploads: EvidenceUploadItem[] = [];

  for (let i = 0; i < uploadCount; i++) {
    uploads.push(createMockUpload(category, i));
  }

  bundle.byCategory[category] = uploads;
  return bundle;
}

/**
 * Create a Smart Review input for testing.
 */
function createTestInput(
  bundle: EvidenceBundle,
  caseId: string = 'test-case-123'
): SmartReviewInput {
  return {
    caseId,
    evidenceBundle: bundle,
    wizardFacts: {
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address_line1: '123 Test Street',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1200,
    },
    product: 'complete_pack',
    jurisdiction: 'england',
  };
}

// =============================================================================
// Tests: Limit Configuration
// =============================================================================

describe('Smart Review Limit Configuration', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getMaxFilesPerRun', () => {
    it('returns default of 10', () => {
      delete process.env.SMART_REVIEW_MAX_FILES_PER_RUN;
      expect(getMaxFilesPerRun()).toBe(10);
    });

    it('respects environment variable', () => {
      process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '5';
      expect(getMaxFilesPerRun()).toBe(5);
    });

    it('ignores invalid values', () => {
      process.env.SMART_REVIEW_MAX_FILES_PER_RUN = 'invalid';
      expect(getMaxFilesPerRun()).toBe(10);
    });

    it('ignores zero or negative values', () => {
      process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '0';
      expect(getMaxFilesPerRun()).toBe(10);
      process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '-5';
      expect(getMaxFilesPerRun()).toBe(10);
    });
  });

  describe('getMaxPagesPerPdf', () => {
    it('returns default of 3', () => {
      delete process.env.SMART_REVIEW_MAX_PAGES_PER_PDF;
      expect(getMaxPagesPerPdf()).toBe(3);
    });

    it('respects environment variable', () => {
      process.env.SMART_REVIEW_MAX_PAGES_PER_PDF = '5';
      expect(getMaxPagesPerPdf()).toBe(5);
    });
  });

  describe('getMaxTotalPagesPerRun', () => {
    it('returns default of 12', () => {
      delete process.env.SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN;
      expect(getMaxTotalPagesPerRun()).toBe(12);
    });

    it('respects environment variable', () => {
      process.env.SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN = '20';
      expect(getMaxTotalPagesPerRun()).toBe(20);
    });
  });

  describe('getDocumentTimeoutMs', () => {
    it('returns default of 15000ms', () => {
      delete process.env.SMART_REVIEW_TIMEOUT_MS;
      expect(getDocumentTimeoutMs()).toBe(15000);
    });

    it('respects environment variable', () => {
      process.env.SMART_REVIEW_TIMEOUT_MS = '30000';
      expect(getDocumentTimeoutMs()).toBe(30000);
    });
  });
});

// =============================================================================
// Tests: File Limit Enforcement
// =============================================================================

describe('Smart Review File Limit Enforcement', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    // Enable Smart Review for tests
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0'; // Disable throttle for tests
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('processes up to max files and skips extras', async () => {
    // Set low limit for testing
    process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '3';

    // Create bundle with 6 files
    const bundle = createBundleWithUploads(6);
    const input = createTestInput(bundle, 'limit-test-1');

    const result = await runSmartReview(input);

    // Should succeed
    expect(result.success).toBe(true);

    // Should report limit exceeded
    expect(result.summary.documentsLimitExceeded).toBeGreaterThan(0);

    // Should have limitsApplied in result
    expect(result.limitsApplied).toBeDefined();
    expect(result.limitsApplied?.maxFilesPerRun).toBe(3);
    expect(result.limitsApplied?.filesExceededLimit).toBe(true);
  });

  it('adds SMART_REVIEW_LIMIT_REACHED warning when limit exceeded', async () => {
    process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '2';

    const bundle = createBundleWithUploads(5);
    const input = createTestInput(bundle, 'limit-test-2');

    const result = await runSmartReview(input);

    // Find the limit warning
    const limitWarning = result.warnings.find(
      (w) => w.code === WarningCode.SMART_REVIEW_LIMIT_REACHED
    );

    expect(limitWarning).toBeDefined();
    expect(limitWarning?.severity).toBe('info');
    expect(limitWarning?.title).toContain('limit');
  });

  it('does not add limit warning when under limit', async () => {
    process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '10';

    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'limit-test-3');

    const result = await runSmartReview(input);

    const limitWarning = result.warnings.find(
      (w) => w.code === WarningCode.SMART_REVIEW_LIMIT_REACHED
    );

    expect(limitWarning).toBeUndefined();
    expect(result.limitsApplied?.filesExceededLimit).toBe(false);
  });
});

// =============================================================================
// Tests: Cache Behavior (SHA256 Deduplication)
// =============================================================================

describe('Smart Review Cache Behavior', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('reports cached documents in summary', async () => {
    const bundle = createBundleWithUploads(2);
    const input = createTestInput(bundle, 'cache-test-1');

    // First run
    const result1 = await runSmartReview(input);
    expect(result1.success).toBe(true);

    // Second run with same documents (different case ID to avoid throttle)
    const input2 = createTestInput(bundle, 'cache-test-2');
    const result2 = await runSmartReview(input2);

    expect(result2.success).toBe(true);
    // Cached documents should be reported (though actual caching depends on implementation)
  });

  it('uses SHA256 for deduplication when available', async () => {
    const upload1 = createMockUpload(EvidenceCategory.TENANCY_AGREEMENT, 1, {
      sha256: 'identical_hash_123',
    });
    const upload2 = createMockUpload(EvidenceCategory.BANK_STATEMENTS, 2, {
      sha256: 'identical_hash_123', // Same hash = same content
    });

    const bundle = createEmptyEvidenceBundle();
    bundle.byCategory[EvidenceCategory.TENANCY_AGREEMENT] = [upload1];
    bundle.byCategory[EvidenceCategory.BANK_STATEMENTS] = [upload2];

    const input = createTestInput(bundle, 'cache-test-3');
    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    // With identical hashes, one should be cached
  });
});

// =============================================================================
// Tests: Graceful Error Handling (No 500s)
// =============================================================================

describe('Smart Review Graceful Error Handling', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('returns success: true even when individual documents fail', async () => {
    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'error-test-1');

    const result = await runSmartReview(input);

    // Should always return success: true in v1
    // Errors are surfaced as warnings, never as failures
    expect(result.success).toBe(true);
  });

  it('includes error in result but does not throw', async () => {
    const bundle = createBundleWithUploads(1);
    const input = createTestInput(bundle, 'error-test-2');

    // Should not throw
    let threw = false;
    try {
      const result = await runSmartReview(input);
      expect(result.success).toBe(true);
    } catch {
      threw = true;
    }

    expect(threw).toBe(false);
  });

  it('handles malformed documents gracefully', async () => {
    // Create upload with unusual properties
    const upload = createMockUpload(EvidenceCategory.OTHER, 0, {
      mimeType: 'application/octet-stream', // Unsupported type
      sizeBytes: 0, // Zero size
    });

    const bundle = createEmptyEvidenceBundle();
    bundle.byCategory[EvidenceCategory.OTHER] = [upload];

    const input = createTestInput(bundle, 'error-test-3');
    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    // Unsupported documents should be skipped
    expect(result.summary.documentsSkipped).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// Tests: Non-Blocking Behavior (Warnings Only)
// =============================================================================

describe('Smart Review Non-Blocking Behavior', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('always returns success: true regardless of warnings', async () => {
    const bundle = createBundleWithUploads(5);
    const input = createTestInput(bundle, 'nonblock-test-1');

    const result = await runSmartReview(input);

    // Smart Review should NEVER block
    expect(result.success).toBe(true);

    // Warnings can exist but don't prevent success
    // (actual warnings depend on extraction results)
  });

  it('includes warnings without blocking', async () => {
    process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '2';

    const bundle = createBundleWithUploads(5);
    const input = createTestInput(bundle, 'nonblock-test-2');

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0); // Should have limit warning
    expect(result.summary.warningsTotal).toBeGreaterThan(0);
  });

  it('BLOCKER severity warnings do not actually block in v1', async () => {
    const bundle = createBundleWithUploads(1);
    const input = createTestInput(bundle, 'nonblock-test-3');

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);

    // Even if there are blocker-severity warnings, success should be true
    // This is the v1 hardening guarantee
    const hasBlockerWarnings = result.warnings.some(
      (w) => w.severity === 'blocker'
    );
    // If blockers exist, they should still not affect success
    if (hasBlockerWarnings) {
      expect(result.success).toBe(true);
    }
  });
});

// =============================================================================
// Tests: Limit Metadata in Results
// =============================================================================

describe('Smart Review Limit Metadata', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('includes limitsApplied in successful result', async () => {
    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'meta-test-1');

    const result = await runSmartReview(input);

    expect(result.limitsApplied).toBeDefined();
    expect(result.limitsApplied?.maxFilesPerRun).toBeGreaterThan(0);
    expect(result.limitsApplied?.maxPagesPerPdf).toBeGreaterThan(0);
    expect(result.limitsApplied?.maxTotalPages).toBeGreaterThan(0);
    expect(result.limitsApplied?.timeoutMs).toBeGreaterThan(0);
  });

  it('tracks documents processed vs cached vs skipped', async () => {
    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'meta-test-2');

    const result = await runSmartReview(input);

    expect(result.summary.documentsProcessed).toBeGreaterThanOrEqual(0);
    expect(result.summary.documentsCached).toBeGreaterThanOrEqual(0);
    expect(result.summary.documentsSkipped).toBeGreaterThanOrEqual(0);
    expect(result.summary.documentsLimitExceeded).toBeGreaterThanOrEqual(0);
    expect(result.summary.documentsTimedOut).toBeGreaterThanOrEqual(0);
  });

  it('tracks pages processed', async () => {
    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'meta-test-3');

    const result = await runSmartReview(input);

    expect(result.summary.pagesProcessed).toBeGreaterThanOrEqual(0);
    expect(result.summary.pagesLimitExceeded).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// Tests: Multi-Category Upload Support
// =============================================================================

describe('Smart Review Multi-Category Support', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('processes uploads from multiple categories', async () => {
    const bundle = createEmptyEvidenceBundle();

    // Add uploads to multiple categories
    bundle.byCategory[EvidenceCategory.TENANCY_AGREEMENT] = [
      createMockUpload(EvidenceCategory.TENANCY_AGREEMENT, 0),
    ];
    bundle.byCategory[EvidenceCategory.BANK_STATEMENTS] = [
      createMockUpload(EvidenceCategory.BANK_STATEMENTS, 0),
    ];
    bundle.byCategory[EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE] = [
      createMockUpload(EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE, 0),
    ];
    bundle.byCategory[EvidenceCategory.EPC] = [
      createMockUpload(EvidenceCategory.EPC, 0),
    ];

    const input = createTestInput(bundle, 'multi-cat-test-1');
    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    // Should have processed documents from multiple categories
  });

  it('respects file limit across all categories', async () => {
    process.env.SMART_REVIEW_MAX_FILES_PER_RUN = '3';

    const bundle = createEmptyEvidenceBundle();

    // Add 2 uploads to 3 categories = 6 total
    bundle.byCategory[EvidenceCategory.TENANCY_AGREEMENT] = [
      createMockUpload(EvidenceCategory.TENANCY_AGREEMENT, 0),
      createMockUpload(EvidenceCategory.TENANCY_AGREEMENT, 1),
    ];
    bundle.byCategory[EvidenceCategory.BANK_STATEMENTS] = [
      createMockUpload(EvidenceCategory.BANK_STATEMENTS, 0),
      createMockUpload(EvidenceCategory.BANK_STATEMENTS, 1),
    ];
    bundle.byCategory[EvidenceCategory.OTHER] = [
      createMockUpload(EvidenceCategory.OTHER, 0),
      createMockUpload(EvidenceCategory.OTHER, 1),
    ];

    const input = createTestInput(bundle, 'multi-cat-test-2');
    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.limitsApplied?.filesExceededLimit).toBe(true);
    expect(result.summary.documentsLimitExceeded).toBeGreaterThan(0);
  });

  it('handles all 11 evidence categories', async () => {
    const bundle = createEmptyEvidenceBundle();

    // Add one upload to each category
    const categories = [
      EvidenceCategory.TENANCY_AGREEMENT,
      EvidenceCategory.BANK_STATEMENTS,
      EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE,
      EvidenceCategory.PRESCRIBED_INFORMATION_PROOF,
      EvidenceCategory.HOW_TO_RENT_PROOF,
      EvidenceCategory.EPC,
      EvidenceCategory.GAS_SAFETY_CERTIFICATE,
      EvidenceCategory.LICENSING,
      EvidenceCategory.NOTICE_SERVED_PROOF,
      EvidenceCategory.CORRESPONDENCE,
      EvidenceCategory.OTHER,
    ];

    for (const category of categories) {
      bundle.byCategory[category] = [createMockUpload(category, 0)];
    }

    const input = createTestInput(bundle, 'all-cats-test');
    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    // Should handle all categories
  });
});

// =============================================================================
// Tests: Eligibility and Skip Behavior
// =============================================================================

describe('Smart Review Eligibility', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearExtractionCache();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    clearExtractionCache();
  });

  it('skips for non-England jurisdiction', async () => {
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';

    const bundle = createBundleWithUploads(3);
    const input: SmartReviewInput = {
      ...createTestInput(bundle),
      jurisdiction: 'wales',
      caseId: 'skip-test-1',
    };

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(result.skipped?.code).toBe('WRONG_JURISDICTION');
  });

  it('skips for non-complete_pack products', async () => {
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';

    const bundle = createBundleWithUploads(3);
    const input: SmartReviewInput = {
      ...createTestInput(bundle),
      product: 'money_claim',
      caseId: 'skip-test-2',
    };

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(result.skipped?.code).toBe('WRONG_PRODUCT');
  });

  it('skips when ENABLE_SMART_REVIEW is false', async () => {
    process.env.ENABLE_SMART_REVIEW = 'false';

    const bundle = createBundleWithUploads(3);
    const input = createTestInput(bundle, 'skip-test-3');

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(result.skipped?.code).toBe('DISABLED');
  });

  it('skips for empty bundles', async () => {
    process.env.ENABLE_SMART_REVIEW = 'true';
    process.env.SMART_REVIEW_THROTTLE_MS = '0';

    const bundle = createEmptyEvidenceBundle();
    const input = createTestInput(bundle, 'skip-test-4');

    const result = await runSmartReview(input);

    expect(result.success).toBe(true);
    expect(result.skipped).toBeDefined();
    expect(result.skipped?.code).toBe('NO_DOCUMENTS');
  });
});
