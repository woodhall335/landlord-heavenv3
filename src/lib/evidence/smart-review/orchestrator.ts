/**
 * Smart Review Orchestrator
 *
 * Coordinates the complete Smart Review pipeline:
 * 1. Document classification
 * 2. Text/Vision extraction
 * 3. Fact comparison
 * 4. Warning generation
 *
 * Includes caching, rate limiting, cost/perf limits, and feature flag checks.
 *
 * v1 Hardening:
 * - Enforces file/page limits to control costs
 * - Graceful fallback on errors (no 500s)
 * - Per-document timeouts
 * - Deduplication via SHA256
 *
 * @module src/lib/evidence/smart-review/orchestrator
 */

import {
  EvidenceBundle,
  EvidenceExtractedFacts,
  SmartReviewResult,
  DocumentExtractionResult,
  EvidenceUploadItem,
  flattenEvidenceBundle,
  supportsExtraction,
} from '../schema';
import { SmartReviewWarning, createWarning, WarningCode } from '../warnings';
import {
  classifyDocument,
  classifyDocuments,
  partitionByExtractionMethod,
  isSmartReviewEnabled,
  isVisionOCREnabled,
  DocumentClassification,
} from './classify';
import { extractFromImage, extractFromMultipleImages, VisionExtractionInput } from './vision-extract';
import { extractFromText } from './text-extract';
import { compareFacts, WizardFacts, ComparisonConfig, DEFAULT_COMPARISON_CONFIG } from './compare';

// =============================================================================
// Cost/Performance Limits (v1 Hardening)
// =============================================================================

/**
 * Maximum number of files to process per Smart Review run.
 * Default: 10 files
 */
export function getMaxFilesPerRun(): number {
  const envValue = process.env.SMART_REVIEW_MAX_FILES_PER_RUN;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 10;
}

/**
 * Maximum pages to process from a single PDF.
 * Default: 3 pages
 */
export function getMaxPagesPerPdf(): number {
  const envValue = process.env.SMART_REVIEW_MAX_PAGES_PER_PDF;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3;
}

/**
 * Maximum total pages across all documents per run.
 * Default: 12 pages
 */
export function getMaxTotalPagesPerRun(): number {
  const envValue = process.env.SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 12;
}

/**
 * Timeout for processing a single document (milliseconds).
 * Default: 15 seconds
 */
export function getDocumentTimeoutMs(): number {
  const envValue = process.env.SMART_REVIEW_TIMEOUT_MS;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 15000;
}

/**
 * Maximum image dimension for Vision processing.
 * Default: 1536px
 */
export function getMaxImageDimension(): number {
  const envValue = process.env.SMART_REVIEW_MAX_IMAGE_DIMENSION;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 1536;
}

// =============================================================================
// Types
// =============================================================================

/**
 * Smart Review pipeline input.
 */
export interface SmartReviewInput {
  /** Case ID for logging and caching */
  caseId: string;
  /** Evidence bundle to process */
  evidenceBundle: EvidenceBundle;
  /** Wizard facts to compare against */
  wizardFacts: WizardFacts;
  /** Product type (only complete_pack/eviction_pack supported) */
  product: string;
  /** Jurisdiction (only england supported in v1) */
  jurisdiction: string;
  /** Optional comparison config overrides */
  comparisonConfig?: Partial<ComparisonConfig>;
}

/**
 * Full Smart Review pipeline result.
 */
export interface SmartReviewPipelineResult {
  /** Whether Smart Review ran successfully */
  success: boolean;
  /** All generated warnings */
  warnings: SmartReviewWarning[];
  /** Extraction results per document */
  documentResults: DocumentExtractionResult[];
  /** Total cost in USD */
  totalCostUsd: number;
  /** Total processing time in milliseconds */
  processingTimeMs: number;
  /** Summary counts */
  summary: {
    documentsProcessed: number;
    documentsCached: number;
    documentsVision: number;
    documentsText: number;
    documentsSkipped: number;
    documentsLimitExceeded: number;
    documentsTimedOut: number;
    pagesProcessed: number;
    pagesLimitExceeded: number;
    warningsTotal: number;
    warningsBlocker: number;
    warningsWarning: number;
    warningsInfo: number;
  };
  /** Limits applied during this run */
  limitsApplied?: {
    maxFilesPerRun: number;
    maxPagesPerPdf: number;
    maxTotalPages: number;
    timeoutMs: number;
    filesExceededLimit: boolean;
    pagesExceededLimit: boolean;
  };
  /** Error if pipeline failed */
  error?: string;
  /** Whether Smart Review was skipped (and reason) */
  skipped?: {
    reason: string;
    code: 'DISABLED' | 'WRONG_PRODUCT' | 'WRONG_JURISDICTION' | 'NO_DOCUMENTS' | 'THROTTLED';
  };
}

/**
 * Persisted Smart Review run metadata.
 * Stored on the Case for resume/rerun.
 */
export interface SmartReviewRunMetadata {
  /** When this run occurred */
  ranAt: string;
  /** Warnings from this run */
  warnings: SmartReviewWarning[];
  /** Whether LLM extraction ran */
  llmRan: boolean;
  /** Whether Vision extraction ran */
  visionRan: boolean;
  /** Limits that were applied */
  limitsApplied: {
    maxFilesPerRun: number;
    maxPagesPerPdf: number;
    maxTotalPages: number;
  };
  /** Summary of this run */
  summary: SmartReviewPipelineResult['summary'];
}

/**
 * Cache for extraction results by document hash.
 */
interface ExtractionCache {
  /** Map of sha256 hash to extracted facts */
  byHash: Map<string, EvidenceExtractedFacts>;
  /** Map of upload ID to extracted facts */
  byId: Map<string, EvidenceExtractedFacts>;
}

/**
 * Throttle tracking for rate limiting.
 */
interface ThrottleTracker {
  /** Map of case ID to last run timestamp */
  lastRun: Map<string, number>;
}

// =============================================================================
// Module State
// =============================================================================

/** In-memory extraction cache */
const extractionCache: ExtractionCache = {
  byHash: new Map(),
  byId: new Map(),
};

/** Throttle tracker */
const throttleTracker: ThrottleTracker = {
  lastRun: new Map(),
};

/**
 * Minimum interval between Smart Review runs per case (milliseconds).
 * Default: 30 seconds
 */
function getThrottleIntervalMs(): number {
  const envValue = process.env.SMART_REVIEW_THROTTLE_MS;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return 30000; // 30 seconds default
}

// =============================================================================
// Main Orchestrator
// =============================================================================

/**
 * Helper to create empty summary with all required fields.
 */
function createEmptySummary(): SmartReviewPipelineResult['summary'] {
  return {
    documentsProcessed: 0,
    documentsCached: 0,
    documentsVision: 0,
    documentsText: 0,
    documentsSkipped: 0,
    documentsLimitExceeded: 0,
    documentsTimedOut: 0,
    pagesProcessed: 0,
    pagesLimitExceeded: 0,
    warningsTotal: 0,
    warningsBlocker: 0,
    warningsWarning: 0,
    warningsInfo: 0,
  };
}

/**
 * Wrap a promise with a timeout.
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Run the complete Smart Review pipeline.
 *
 * v1 Hardening Features:
 * - Enforces file limits (SMART_REVIEW_MAX_FILES_PER_RUN)
 * - Enforces page limits per PDF (SMART_REVIEW_MAX_PAGES_PER_PDF)
 * - Enforces total page limit (SMART_REVIEW_MAX_TOTAL_PAGES_PER_RUN)
 * - Per-document timeout (SMART_REVIEW_TIMEOUT_MS)
 * - Graceful error handling (no 500s)
 * - SHA256 deduplication via cache
 *
 * @param input - Pipeline input
 * @returns Pipeline result with warnings
 */
export async function runSmartReview(
  input: SmartReviewInput
): Promise<SmartReviewPipelineResult> {
  const startTime = Date.now();

  // Load limits
  const limits = {
    maxFilesPerRun: getMaxFilesPerRun(),
    maxPagesPerPdf: getMaxPagesPerPdf(),
    maxTotalPages: getMaxTotalPagesPerRun(),
    timeoutMs: getDocumentTimeoutMs(),
    filesExceededLimit: false,
    pagesExceededLimit: false,
  };

  // 1. Check feature flags and eligibility
  const eligibility = checkEligibility(input);
  if (!eligibility.eligible) {
    return {
      success: true,
      warnings: [],
      documentResults: [],
      totalCostUsd: 0,
      processingTimeMs: Date.now() - startTime,
      summary: createEmptySummary(),
      skipped: eligibility.skipReason,
    };
  }

  // 2. Check throttle
  const throttled = checkThrottle(input.caseId);
  if (throttled) {
    return {
      success: true,
      warnings: [],
      documentResults: [],
      totalCostUsd: 0,
      processingTimeMs: Date.now() - startTime,
      summary: createEmptySummary(),
      skipped: {
        reason: 'Smart Review was recently run for this case',
        code: 'THROTTLED',
      },
    };
  }

  // Update throttle tracker
  throttleTracker.lastRun.set(input.caseId, Date.now());

  // Track limits
  let filesProcessed = 0;
  let totalPagesProcessed = 0;
  let filesExceededLimit = 0;
  let pagesExceededLimit = 0;
  let timedOutCount = 0;

  try {
    // 3. Get documents to process
    const documents = flattenEvidenceBundle(input.evidenceBundle);
    const supportedDocs = documents.filter((d) => supportsExtraction(d.mimeType));

    if (supportedDocs.length === 0) {
      const summary = createEmptySummary();
      summary.documentsSkipped = documents.length;
      return {
        success: true,
        warnings: [],
        documentResults: [],
        totalCostUsd: 0,
        processingTimeMs: Date.now() - startTime,
        summary,
        skipped: {
          reason: 'No supported documents found for extraction',
          code: 'NO_DOCUMENTS',
        },
      };
    }

    // 4. Classify documents
    const classifications = classifyDocuments(supportedDocs);
    const { vision: visionDocs, text: textDocs, unsupported: unsupportedDocs } =
      partitionByExtractionMethod(classifications);

    // 5. Process documents (with caching and limits)
    const documentResults: DocumentExtractionResult[] = [];
    const allWarnings: SmartReviewWarning[] = [];
    let totalCost = 0;
    let cachedCount = 0;
    let visionCount = 0;
    let textCount = 0;

    // Helper to check if we can process more files
    const canProcessMoreFiles = () => filesProcessed < limits.maxFilesPerRun;
    const canProcessMorePages = () => totalPagesProcessed < limits.maxTotalPages;

    // Process text-extractable documents
    for (const classification of textDocs) {
      // Check file limit
      if (!canProcessMoreFiles()) {
        filesExceededLimit++;
        documentResults.push({
          upload: classification.upload,
          extraction: null,
          error: 'File limit reached for this run',
          wasProcessed: false,
        });
        continue;
      }

      // Check if already cached
      const cachedResult = getCachedExtraction(classification.upload);
      if (cachedResult) {
        documentResults.push({
          upload: classification.upload,
          extraction: cachedResult,
          wasProcessed: false,
        });
        cachedCount++;
        continue;
      }

      // Process with timeout
      try {
        const result = await withTimeout(
          processTextDocument(classification),
          limits.timeoutMs,
          'Document processing timed out'
        );
        documentResults.push(result);
        filesProcessed++;
        totalCost += result.extraction ? 0.001 : 0;
        if (result.wasProcessed) {
          textCount++;
          // Estimate 1 page for text extraction
          totalPagesProcessed++;
        } else {
          cachedCount++;
        }
      } catch (err: any) {
        // Timeout or other error - graceful fallback
        timedOutCount++;
        documentResults.push({
          upload: classification.upload,
          extraction: null,
          error: err.message || 'Processing failed',
          wasProcessed: false,
        });
        allWarnings.push(
          createWarning(WarningCode.SMART_REVIEW_TIMEOUT, {
            relatedUploads: [classification.upload.id],
          })
        );
      }
    }

    // Process vision-required documents (if Vision is enabled)
    if (isVisionOCREnabled()) {
      for (const classification of visionDocs) {
        // Check file limit
        if (!canProcessMoreFiles()) {
          filesExceededLimit++;
          documentResults.push({
            upload: classification.upload,
            extraction: null,
            error: 'File limit reached for this run',
            wasProcessed: false,
          });
          continue;
        }

        // Check page limit
        if (!canProcessMorePages()) {
          pagesExceededLimit++;
          documentResults.push({
            upload: classification.upload,
            extraction: null,
            error: 'Page limit reached for this run',
            wasProcessed: false,
          });
          allWarnings.push(
            createWarning(WarningCode.SMART_REVIEW_PAGE_LIMIT_REACHED, {
              relatedUploads: [classification.upload.id],
            })
          );
          continue;
        }

        // Check if already cached
        const cachedResult = getCachedExtraction(classification.upload);
        if (cachedResult) {
          documentResults.push({
            upload: classification.upload,
            extraction: cachedResult,
            wasProcessed: false,
          });
          cachedCount++;
          continue;
        }

        // Process with timeout
        try {
          const result = await withTimeout(
            processVisionDocument(classification, limits.maxPagesPerPdf),
            limits.timeoutMs,
            'Vision processing timed out'
          );
          documentResults.push(result);
          filesProcessed++;
          if (result.extraction) {
            totalCost += 0.01; // Approximate cost for Vision
          }
          if (result.wasProcessed) {
            visionCount++;
            // Track pages processed (estimate 1 for images, up to maxPagesPerPdf for PDFs)
            const pageEstimate = classification.upload.mimeType === 'application/pdf'
              ? Math.min(limits.maxPagesPerPdf, 3)
              : 1;
            totalPagesProcessed += pageEstimate;
          } else {
            cachedCount++;
          }
        } catch (err: any) {
          // Timeout or other error - graceful fallback
          timedOutCount++;
          documentResults.push({
            upload: classification.upload,
            extraction: null,
            error: err.message || 'Vision processing failed',
            wasProcessed: false,
          });
          allWarnings.push(
            createWarning(WarningCode.SMART_REVIEW_TIMEOUT, {
              relatedUploads: [classification.upload.id],
            })
          );
        }
      }
    } else {
      // Vision disabled - add extraction-failed results
      for (const classification of visionDocs) {
        documentResults.push({
          upload: classification.upload,
          extraction: null,
          error: 'Vision OCR is disabled. Enable ENABLE_VISION_OCR to process scanned documents.',
          wasProcessed: false,
        });
      }
    }

    // Mark unsupported docs
    for (const classification of unsupportedDocs) {
      documentResults.push({
        upload: classification.upload,
        extraction: null,
        error: `Unsupported file type: ${classification.upload.mimeType}`,
        wasProcessed: false,
      });
    }

    // Track if limits were exceeded
    limits.filesExceededLimit = filesExceededLimit > 0;
    limits.pagesExceededLimit = pagesExceededLimit > 0;

    // Add limit warning if files were skipped
    if (filesExceededLimit > 0) {
      allWarnings.push(
        createWarning(WarningCode.SMART_REVIEW_LIMIT_REACHED, {
          comparison: {
            wizardValue: filesProcessed,
            extractedValue: filesProcessed + filesExceededLimit,
          },
        })
      );
    }

    // 6. Extract facts from successful results
    const extractedFacts = documentResults
      .filter((r) => r.extraction !== null)
      .map((r) => r.extraction!);

    // 7. Compare facts and generate warnings
    const comparisonConfig: ComparisonConfig = {
      ...DEFAULT_COMPARISON_CONFIG,
      ...input.comparisonConfig,
    };

    const comparisonResult = compareFacts(
      extractedFacts,
      input.wizardFacts,
      input.evidenceBundle,
      comparisonConfig
    );

    // Add comparison warnings
    allWarnings.push(...comparisonResult.warnings);

    // 8. Add extraction warnings
    for (const result of documentResults) {
      if (result.error && !result.extraction) {
        // Only add EXTRACT_FAILED if it's not a limit/timeout error
        if (!result.error.includes('limit') && !result.error.includes('timed out')) {
          allWarnings.push(
            createWarning(WarningCode.EXTRACT_FAILED, {
              relatedUploads: [result.upload.id],
            })
          );
        }
      } else if (result.extraction) {
        // Add low confidence warning if applicable
        if (result.extraction.quality.confidence_overall < 0.5) {
          allWarnings.push(
            createWarning(WarningCode.EXTRACT_LOW_CONFIDENCE, {
              relatedUploads: [result.upload.id],
              confidence: result.extraction.quality.confidence_overall,
            })
          );
        }

        // Add document type uncertainty warning
        if (result.extraction.detectedDocType.confidence < 0.6) {
          allWarnings.push(
            createWarning(WarningCode.EXTRACT_DOC_TYPE_UNCERTAIN, {
              relatedUploads: [result.upload.id],
              confidence: result.extraction.detectedDocType.confidence,
            })
          );
        }
      }
    }

    // 9. Count warnings by severity
    const warningCounts = {
      blocker: allWarnings.filter((w) => w.severity === 'blocker').length,
      warning: allWarnings.filter((w) => w.severity === 'warning').length,
      info: allWarnings.filter((w) => w.severity === 'info').length,
    };

    console.log(`[SmartReview] Completed for case ${input.caseId}:`, {
      documentsProcessed: visionCount + textCount,
      documentsCached: cachedCount,
      documentsLimitExceeded: filesExceededLimit,
      documentsTimedOut: timedOutCount,
      pagesProcessed: totalPagesProcessed,
      warnings: allWarnings.length,
      cost: totalCost.toFixed(4),
    });

    return {
      success: true,
      warnings: allWarnings,
      documentResults,
      totalCostUsd: totalCost,
      processingTimeMs: Date.now() - startTime,
      summary: {
        documentsProcessed: visionCount + textCount,
        documentsCached: cachedCount,
        documentsVision: visionCount,
        documentsText: textCount,
        documentsSkipped: unsupportedDocs.length,
        documentsLimitExceeded: filesExceededLimit,
        documentsTimedOut: timedOutCount,
        pagesProcessed: totalPagesProcessed,
        pagesLimitExceeded: pagesExceededLimit,
        warningsTotal: allWarnings.length,
        warningsBlocker: warningCounts.blocker,
        warningsWarning: warningCounts.warning,
        warningsInfo: warningCounts.info,
      },
      limitsApplied: limits,
    };
  } catch (error: any) {
    // CRITICAL: Graceful fallback - never throw 500
    console.error('[SmartReview] Pipeline failed (graceful fallback):', error);

    // Return success: true with a warning, not success: false
    // This ensures Smart Review errors never block generation
    return {
      success: true, // Changed from false - never block on Smart Review failure
      warnings: [
        createWarning(WarningCode.EXTRACT_FAILED, {
          comparison: {
            wizardValue: 'Smart Review',
            extractedValue: error.message || 'Unknown error',
          },
        }),
      ],
      documentResults: [],
      totalCostUsd: 0,
      processingTimeMs: Date.now() - startTime,
      summary: {
        ...createEmptySummary(),
        documentsLimitExceeded: filesExceededLimit,
        documentsTimedOut: timedOutCount,
      },
      limitsApplied: limits,
      error: error.message,
    };
  }
}

/**
 * Get cached extraction result for an upload.
 */
function getCachedExtraction(upload: EvidenceUploadItem): EvidenceExtractedFacts | null {
  // Check by hash first (most reliable)
  if (upload.sha256) {
    const cached = extractionCache.byHash.get(upload.sha256);
    if (cached) return cached;
  }
  // Fallback to ID
  return extractionCache.byId.get(upload.id) || null;
}

// =============================================================================
// Eligibility Checks
// =============================================================================

/**
 * Check if Smart Review is eligible to run.
 */
function checkEligibility(input: SmartReviewInput): {
  eligible: boolean;
  skipReason?: {
    reason: string;
    code: 'DISABLED' | 'WRONG_PRODUCT' | 'WRONG_JURISDICTION' | 'NO_DOCUMENTS';
  };
} {
  // Check feature flag
  if (!isSmartReviewEnabled()) {
    return {
      eligible: false,
      skipReason: {
        reason: 'Smart Review is disabled',
        code: 'DISABLED',
      },
    };
  }

  // Check product (only complete_pack/eviction_pack)
  const supportedProducts = ['complete_pack', 'eviction_pack'];
  if (!supportedProducts.includes(input.product)) {
    return {
      eligible: false,
      skipReason: {
        reason: `Smart Review is only available for complete_pack, not ${input.product}`,
        code: 'WRONG_PRODUCT',
      },
    };
  }

  // Check jurisdiction (only england in v1)
  if (input.jurisdiction !== 'england') {
    return {
      eligible: false,
      skipReason: {
        reason: `Smart Review is only available for England, not ${input.jurisdiction}`,
        code: 'WRONG_JURISDICTION',
      },
    };
  }

  // Check if there are any documents
  const documents = flattenEvidenceBundle(input.evidenceBundle);
  if (documents.length === 0) {
    return {
      eligible: false,
      skipReason: {
        reason: 'No documents uploaded',
        code: 'NO_DOCUMENTS',
      },
    };
  }

  return { eligible: true };
}

/**
 * Check if Smart Review is throttled for this case.
 */
function checkThrottle(caseId: string): boolean {
  const lastRun = throttleTracker.lastRun.get(caseId);
  if (!lastRun) return false;

  const elapsed = Date.now() - lastRun;
  return elapsed < getThrottleIntervalMs();
}

// =============================================================================
// Document Processing
// =============================================================================

/**
 * Process a text-extractable document.
 */
async function processTextDocument(
  classification: DocumentClassification
): Promise<DocumentExtractionResult> {
  const upload = classification.upload;

  // Check cache by hash
  if (upload.sha256) {
    const cached = extractionCache.byHash.get(upload.sha256);
    if (cached) {
      return {
        upload,
        extraction: cached,
        wasProcessed: false,
      };
    }
  }

  // Check cache by ID
  const cachedById = extractionCache.byId.get(upload.id);
  if (cachedById) {
    return {
      upload,
      extraction: cachedById,
      wasProcessed: false,
    };
  }

  // TODO: In production, fetch document content from storage
  // For now, we'll create a placeholder that needs actual text
  // This would integrate with your Supabase storage

  try {
    // Placeholder: In real implementation, fetch text from PDF
    // const pdfText = await fetchPdfText(upload.storageKey);
    const pdfText: string | null = ''; // Placeholder - needs actual implementation

    if (!pdfText || pdfText.trim().length < 50) {
      // No text found - may need Vision
      return {
        upload,
        extraction: null,
        error: 'Could not extract text from PDF. Document may require Vision OCR.',
        wasProcessed: true,
      };
    }

    const result = await extractFromText({
      upload,
      text: pdfText,
    });

    if (result.success && result.facts) {
      // Cache the result
      if (upload.sha256) {
        extractionCache.byHash.set(upload.sha256, result.facts);
      }
      extractionCache.byId.set(upload.id, result.facts);

      return {
        upload,
        extraction: result.facts,
        wasProcessed: true,
      };
    }

    return {
      upload,
      extraction: null,
      error: result.error || 'Text extraction failed',
      wasProcessed: true,
    };
  } catch (error: any) {
    return {
      upload,
      extraction: null,
      error: error.message,
      wasProcessed: true,
    };
  }
}

/**
 * Process a document requiring Vision OCR.
 *
 * @param classification - Document classification
 * @param maxPages - Maximum pages to process from PDFs (default: 3)
 */
async function processVisionDocument(
  classification: DocumentClassification,
  maxPages: number = 3
): Promise<DocumentExtractionResult> {
  const upload = classification.upload;

  // Check cache by hash
  if (upload.sha256) {
    const cached = extractionCache.byHash.get(upload.sha256);
    if (cached) {
      return {
        upload,
        extraction: cached,
        wasProcessed: false,
      };
    }
  }

  // Check cache by ID
  const cachedById = extractionCache.byId.get(upload.id);
  if (cachedById) {
    return {
      upload,
      extraction: cachedById,
      wasProcessed: false,
    };
  }

  try {
    // TODO: In production, fetch and convert document to base64
    // For images: fetch directly
    // For PDFs: render pages to images

    // Placeholder: In real implementation, fetch and convert
    // const imageBase64 = await fetchDocumentAsBase64(upload.storageKey);
    const imageBase64 = ''; // Placeholder - needs actual implementation

    if (!imageBase64) {
      return {
        upload,
        extraction: null,
        error: 'Could not load document for Vision processing',
        wasProcessed: true,
      };
    }

    const visionInput: VisionExtractionInput = {
      upload,
      imageBase64,
      mimeType: upload.mimeType,
    };

    const result = await extractFromImage(visionInput);

    if (result.success && result.facts) {
      // Cache the result
      if (upload.sha256) {
        extractionCache.byHash.set(upload.sha256, result.facts);
      }
      extractionCache.byId.set(upload.id, result.facts);

      return {
        upload,
        extraction: result.facts,
        wasProcessed: true,
      };
    }

    return {
      upload,
      extraction: null,
      error: result.error || 'Vision extraction failed',
      wasProcessed: true,
    };
  } catch (error: any) {
    return {
      upload,
      extraction: null,
      error: error.message,
      wasProcessed: true,
    };
  }
}

// =============================================================================
// Cache Management
// =============================================================================

/**
 * Clear the extraction cache.
 */
export function clearExtractionCache(): void {
  extractionCache.byHash.clear();
  extractionCache.byId.clear();
}

/**
 * Clear throttle tracking.
 */
export function clearThrottleTracking(): void {
  throttleTracker.lastRun.clear();
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): {
  hashCacheSize: number;
  idCacheSize: number;
  throttleTrackingSize: number;
} {
  return {
    hashCacheSize: extractionCache.byHash.size,
    idCacheSize: extractionCache.byId.size,
    throttleTrackingSize: throttleTracker.lastRun.size,
  };
}

/**
 * Pre-populate cache with existing extracted facts.
 * Useful when loading from database.
 */
export function populateCache(
  facts: EvidenceExtractedFacts[],
  uploads: EvidenceUploadItem[]
): void {
  const uploadsById = new Map(uploads.map((u) => [u.id, u]));

  for (const fact of facts) {
    const upload = uploadsById.get(fact.docId);
    if (upload) {
      extractionCache.byId.set(fact.docId, fact);
      if (upload.sha256) {
        extractionCache.byHash.set(upload.sha256, fact);
      }
    }
  }
}

// =============================================================================
// Exports
// =============================================================================

export {
  isSmartReviewEnabled,
  isVisionOCREnabled,
} from './classify';
