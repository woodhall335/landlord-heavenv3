/**
 * Document Classification Module
 *
 * Determines document type (image, PDF with text, PDF scan) and routes
 * to appropriate extraction method (Vision API or text extraction).
 *
 * @module src/lib/evidence/smart-review/classify
 */

import {
  EvidenceUploadItem,
  isImageMimeType,
  isPdfMimeType,
  EvidenceCategory,
} from '../schema';

// =============================================================================
// Types
// =============================================================================

/**
 * Classification of a document for extraction routing.
 */
export interface DocumentClassification {
  /** The upload item being classified */
  upload: EvidenceUploadItem;
  /** Type of document for extraction routing */
  documentType: 'image' | 'pdf_text' | 'pdf_scan' | 'unsupported';
  /** Whether Vision API should be used */
  requiresVision: boolean;
  /** Confidence in classification (0-1) */
  confidence: number;
  /** Reason for classification */
  reason: string;
}

/**
 * Result of text layer detection for PDFs.
 */
export interface TextLayerDetection {
  /** Whether the PDF has extractable text */
  hasTextLayer: boolean;
  /** Number of characters found in text layer */
  characterCount: number;
  /** Confidence that this is a text PDF vs scanned */
  confidence: number;
  /** Sample text extracted (first 500 chars) */
  sampleText?: string;
}

// =============================================================================
// Feature Flags
// =============================================================================

/**
 * Check if Vision OCR is enabled.
 */
export function isVisionOCREnabled(): boolean {
  const flag = process.env.ENABLE_VISION_OCR;
  // Default to true in development, false in production if not explicitly set
  if (flag === undefined) {
    return process.env.NODE_ENV !== 'production';
  }
  return flag === 'true';
}

/**
 * Check if Smart Review is enabled.
 */
export function isSmartReviewEnabled(): boolean {
  const flag = process.env.ENABLE_SMART_REVIEW;
  // Default to true in development, false in production if not explicitly set
  if (flag === undefined) {
    return process.env.NODE_ENV !== 'production';
  }
  return flag === 'true';
}

// =============================================================================
// Classification Functions
// =============================================================================

/**
 * Classify a document for extraction routing.
 *
 * @param upload - The upload item to classify
 * @param textLayerInfo - Optional pre-detected text layer info for PDFs
 * @returns Classification result with routing information
 */
export function classifyDocument(
  upload: EvidenceUploadItem,
  textLayerInfo?: TextLayerDetection
): DocumentClassification {
  const mimeType = upload.mimeType.toLowerCase();

  // Case 1: Image files always use Vision
  if (isImageMimeType(mimeType)) {
    return {
      upload,
      documentType: 'image',
      requiresVision: true,
      confidence: 1.0,
      reason: 'Image file requires Vision API for text extraction',
    };
  }

  // Case 2: PDF files - check for text layer
  if (isPdfMimeType(mimeType)) {
    if (textLayerInfo) {
      // We have pre-detected text layer info
      if (textLayerInfo.hasTextLayer && textLayerInfo.characterCount > 100) {
        return {
          upload,
          documentType: 'pdf_text',
          requiresVision: false,
          confidence: textLayerInfo.confidence,
          reason: `PDF has extractable text layer (${textLayerInfo.characterCount} chars)`,
        };
      } else {
        return {
          upload,
          documentType: 'pdf_scan',
          requiresVision: true,
          confidence: textLayerInfo.confidence,
          reason: textLayerInfo.characterCount > 0
            ? `PDF has minimal text (${textLayerInfo.characterCount} chars), likely scanned`
            : 'PDF appears to be a scanned document with no text layer',
        };
      }
    }

    // No text layer info - assume text PDF initially
    // The actual text extraction will determine if Vision is needed
    return {
      upload,
      documentType: 'pdf_text',
      requiresVision: false,
      confidence: 0.6,
      reason: 'PDF assumed to have text layer (will verify during extraction)',
    };
  }

  // Case 3: Unsupported file type
  return {
    upload,
    documentType: 'unsupported',
    requiresVision: false,
    confidence: 1.0,
    reason: `Unsupported file type: ${mimeType}`,
  };
}

/**
 * Classify multiple documents.
 *
 * @param uploads - Array of upload items to classify
 * @param textLayerMap - Optional map of upload IDs to text layer info
 * @returns Array of classifications
 */
export function classifyDocuments(
  uploads: EvidenceUploadItem[],
  textLayerMap?: Map<string, TextLayerDetection>
): DocumentClassification[] {
  return uploads.map((upload) => {
    const textLayerInfo = textLayerMap?.get(upload.id);
    return classifyDocument(upload, textLayerInfo);
  });
}

/**
 * Partition documents by extraction method.
 *
 * @param classifications - Array of document classifications
 * @returns Object with documents grouped by extraction method
 */
export function partitionByExtractionMethod(
  classifications: DocumentClassification[]
): {
  vision: DocumentClassification[];
  text: DocumentClassification[];
  unsupported: DocumentClassification[];
} {
  const result = {
    vision: [] as DocumentClassification[],
    text: [] as DocumentClassification[],
    unsupported: [] as DocumentClassification[],
  };

  for (const classification of classifications) {
    if (classification.documentType === 'unsupported') {
      result.unsupported.push(classification);
    } else if (classification.requiresVision) {
      result.vision.push(classification);
    } else {
      result.text.push(classification);
    }
  }

  return result;
}

// =============================================================================
// Document Type Inference
// =============================================================================

/**
 * Keywords used to detect document types from extracted text.
 */
const DOCUMENT_TYPE_KEYWORDS: Record<EvidenceCategory, string[]> = {
  [EvidenceCategory.TENANCY_AGREEMENT]: [
    'assured shorthold tenancy',
    'tenancy agreement',
    'landlord and tenant',
    'rent payable',
    'term of the tenancy',
    'deposit scheme',
    'property let',
    'assured tenancy',
    'ast',
  ],
  [EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE]: [
    'deposit protection',
    'tenancy deposit scheme',
    'dps',
    'mydeposits',
    'tds',
    'deposit id',
    'deposit reference',
    'protection certificate',
  ],
  [EvidenceCategory.PRESCRIBED_INFORMATION_PROOF]: [
    'prescribed information',
    'deposit information',
    'housing act 2004',
    'within 30 days',
    'deposit protected',
  ],
  [EvidenceCategory.HOW_TO_RENT_PROOF]: [
    'how to rent',
    'renting guide',
    'tenant rights',
    'renting in england',
    'checklist for renting',
  ],
  [EvidenceCategory.EPC]: [
    'energy performance certificate',
    'epc',
    'energy efficiency rating',
    'environmental impact',
    'energy rating',
    'sap rating',
  ],
  [EvidenceCategory.GAS_SAFETY_CERTIFICATE]: [
    'gas safety',
    'cp12',
    'landlord gas safety record',
    'gas appliance',
    'gas engineer',
    'gas safe',
    'boiler service',
  ],
  [EvidenceCategory.BANK_STATEMENTS]: [
    'bank statement',
    'account statement',
    'transaction history',
    'balance',
    'standing order',
    'rent payment',
  ],
  [EvidenceCategory.NOTICE_SERVED_PROOF]: [
    'notice seeking possession',
    'section 8',
    'section 21',
    'notice to quit',
    'proof of posting',
    'recorded delivery',
    'certificate of posting',
  ],
  [EvidenceCategory.CORRESPONDENCE]: [
    'dear tenant',
    'dear landlord',
    're:',
    'regarding your tenancy',
    'rent arrears',
    'breach of tenancy',
  ],
  [EvidenceCategory.REPAIR_COMPLAINTS]: [
    'repair',
    'complaint',
    'maintenance',
    'disrepair',
    'broken',
    'fault',
    'leak',
    'damp',
    'mould',
  ],
  [EvidenceCategory.LICENSING]: [
    'property license',
    'landlord license',
    'selective licensing',
    'additional licensing',
  ],
  [EvidenceCategory.HMO_LICENSE]: [
    'hmo license',
    'house in multiple occupation',
    'multiple occupancy',
    'hmo registration',
  ],
  [EvidenceCategory.RETALIATORY_EVIDENCE]: [
    'retaliatory',
    'improvement notice',
    'hazard notice',
    'environmental health',
    'local authority',
  ],
  [EvidenceCategory.OTHER]: [],
};

/**
 * Infer document type from extracted text content.
 *
 * @param text - Extracted text content
 * @param currentCategory - The category assigned by user (if any)
 * @returns Inferred document type with confidence
 */
export function inferDocumentType(
  text: string,
  currentCategory?: EvidenceCategory
): {
  inferredType: EvidenceCategory;
  confidence: number;
  matchedKeywords: string[];
  alternativeTypes: Array<{ type: EvidenceCategory; confidence: number }>;
} {
  const normalizedText = text.toLowerCase();
  const scores: Map<EvidenceCategory, { score: number; matches: string[] }> = new Map();

  // Score each category based on keyword matches
  for (const [category, keywords] of Object.entries(DOCUMENT_TYPE_KEYWORDS)) {
    const matches: string[] = [];
    let score = 0;

    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matches.push(keyword);
        // Longer keywords are more specific, weight them higher
        score += 1 + keyword.length / 20;
      }
    }

    if (score > 0) {
      scores.set(category as EvidenceCategory, { score, matches });
    }
  }

  // Sort by score descending
  const sortedScores = Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score);

  if (sortedScores.length === 0) {
    // No matches - return current category or OTHER
    return {
      inferredType: currentCategory || EvidenceCategory.OTHER,
      confidence: 0.3,
      matchedKeywords: [],
      alternativeTypes: [],
    };
  }

  const [topType, topData] = sortedScores[0];
  const maxScore = topData.score;

  // Calculate confidence based on score and difference from runner-up
  let confidence = Math.min(0.95, 0.4 + maxScore * 0.1);
  if (sortedScores.length > 1) {
    const runnerUpScore = sortedScores[1][1].score;
    const scoreDiff = maxScore - runnerUpScore;
    confidence = Math.min(0.95, confidence + scoreDiff * 0.05);
  }

  // Get alternative types with at least half the top score
  const alternatives = sortedScores
    .slice(1)
    .filter(([_, data]) => data.score >= maxScore * 0.5)
    .map(([type, data]) => ({
      type,
      confidence: Math.min(0.8, 0.3 + data.score * 0.08),
    }));

  return {
    inferredType: topType,
    confidence,
    matchedKeywords: topData.matches,
    alternativeTypes: alternatives,
  };
}

/**
 * Check if classification should be upgraded to Vision.
 * Called after text extraction fails or returns minimal content.
 *
 * @param classification - Current classification
 * @param extractedTextLength - Length of extracted text
 * @returns Updated classification if upgrade needed
 */
export function maybeUpgradeToVision(
  classification: DocumentClassification,
  extractedTextLength: number
): DocumentClassification {
  // If text extraction returned very little content, upgrade to Vision
  if (
    classification.documentType === 'pdf_text' &&
    extractedTextLength < 100
  ) {
    return {
      ...classification,
      documentType: 'pdf_scan',
      requiresVision: true,
      confidence: 0.8,
      reason: `Text extraction returned minimal content (${extractedTextLength} chars), upgrading to Vision`,
    };
  }

  return classification;
}
