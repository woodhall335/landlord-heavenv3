/**
 * Smart Review Module
 *
 * AI-assisted evidence extraction and fact comparison for complete_pack.
 * Surfaces warnings for mismatches, contradictions, and missing evidence.
 *
 * @module src/lib/evidence/smart-review
 */

// Main orchestrator
export {
  runSmartReview,
  clearExtractionCache,
  clearThrottleTracking,
  getCacheStats,
  populateCache,
  isSmartReviewEnabled,
  isVisionOCREnabled,
  // v1 Hardening: Limit configuration
  getMaxFilesPerRun,
  getMaxPagesPerPdf,
  getMaxTotalPagesPerRun,
  getDocumentTimeoutMs,
  getMaxImageDimension,
  type SmartReviewInput,
  type SmartReviewPipelineResult,
  type SmartReviewRunMetadata,
} from './orchestrator';

// Classification
export {
  classifyDocument,
  classifyDocuments,
  partitionByExtractionMethod,
  inferDocumentType,
  maybeUpgradeToVision,
  type DocumentClassification,
  type TextLayerDetection,
} from './classify';

// Vision extraction
export {
  extractFromImage,
  extractFromMultipleImages,
  isVisionAvailable,
  getMaxVisionPages,
  type VisionExtractionInput,
  type VisionExtractionResult,
} from './vision-extract';

// Text extraction
export {
  extractFromText,
  isTextExtractionViable,
  getMaxTextChars,
  type TextExtractionInput,
  type TextExtractionResult,
} from './text-extract';

// Fact comparison
export {
  compareFacts,
  DEFAULT_COMPARISON_CONFIG,
  type WizardFacts,
  type ComparisonConfig,
  type ComparisonResult,
} from './compare';
