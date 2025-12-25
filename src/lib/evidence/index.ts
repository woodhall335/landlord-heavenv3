/**
 * Evidence Module
 *
 * Structured evidence handling and Smart Review for complete_pack.
 *
 * @module src/lib/evidence
 */

// Schema types
export {
  EvidenceCategory,
  EVIDENCE_CATEGORY_LABELS,
  EVIDENCE_CATEGORY_HELPER_TEXT,
  SUPPORTED_EXTRACTION_MIME_TYPES,
  type EvidenceUploadItem,
  type EvidenceBundle,
  type EvidenceExtractedFacts,
  type DocumentExtractionResult,
  type SmartReviewResult,
  type DetectedDocType,
  type ExtractionQuality,
  type TextExtractionSource,
  type ExtractedParties,
  type ExtractedProperty,
  type ExtractedTenancy,
  type ExtractedNotice,
  type ExtractedArrears,
  type ExtractedDeposit,
  type ExtractedCompliance,
  // Helper functions
  createEmptyEvidenceBundle,
  mapLegacyUploadsToBundle,
  flattenEvidenceBundle,
  getUploadsForCategory,
  hasUploadsForCategory,
  getTotalUploadCount,
  isImageMimeType,
  isPdfMimeType,
  supportsExtraction,
} from './schema';

// Warning types
export {
  WarningCode,
  SEVERITY_LABELS,
  SEVERITY_PRIORITY,
  type WarningSeverity,
  type SmartReviewWarning,
  // Warning factory functions
  createWarning,
  createMissingCategoryWarning,
  createFactMismatchWarning,
  // Warning utilities
  validateWarningSafeLanguage,
  validateAllWarningTemplates,
  sortWarningsBySeverity,
  filterWarningsBySeverity,
  groupWarningsByDocument,
  groupWarningsByField,
  getWarningCounts,
} from './warnings';

// Smart Review pipeline
export {
  runSmartReview,
  isSmartReviewEnabled,
  isVisionOCREnabled,
  clearExtractionCache,
  // v1 Hardening: Limit configuration
  getMaxFilesPerRun,
  getMaxPagesPerPdf,
  getMaxTotalPagesPerRun,
  getDocumentTimeoutMs,
  getMaxImageDimension,
  type SmartReviewInput,
  type SmartReviewPipelineResult,
  type SmartReviewRunMetadata,
} from './smart-review';
