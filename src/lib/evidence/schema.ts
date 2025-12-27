/**
 * Evidence Schema Types
 *
 * Defines structured types for categorized evidence uploads and extracted facts.
 * Part of the Smart Review feature for complete_pack (England).
 *
 * @module src/lib/evidence/schema
 */

// =============================================================================
// Evidence Categories
// =============================================================================

/**
 * Evidence document categories for structured uploads.
 * Each category maps to a specific type of supporting document.
 */
export enum EvidenceCategory {
  TENANCY_AGREEMENT = 'tenancy_agreement',
  BANK_STATEMENTS = 'bank_statements',
  DEPOSIT_PROTECTION_CERTIFICATE = 'deposit_protection_certificate',
  PRESCRIBED_INFORMATION_PROOF = 'prescribed_information_proof',
  HOW_TO_RENT_PROOF = 'how_to_rent_proof',
  EPC = 'epc',
  GAS_SAFETY_CERTIFICATE = 'gas_safety_certificate',
  LICENSING = 'licensing',
  HMO_LICENSE = 'hmo_license',
  NOTICE_SERVED_PROOF = 'notice_served_proof',
  CORRESPONDENCE = 'correspondence',
  REPAIR_COMPLAINTS = 'repair_complaints',
  RETALIATORY_EVIDENCE = 'retaliatory_evidence',
  OTHER = 'other',
}

/**
 * Human-readable labels for each evidence category.
 */
export const EVIDENCE_CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  [EvidenceCategory.TENANCY_AGREEMENT]: 'Tenancy Agreement',
  [EvidenceCategory.BANK_STATEMENTS]: 'Bank Statements / Rent Records',
  [EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE]: 'Deposit Protection Certificate',
  [EvidenceCategory.PRESCRIBED_INFORMATION_PROOF]: 'Prescribed Information Proof',
  [EvidenceCategory.HOW_TO_RENT_PROOF]: 'How to Rent Guide Proof',
  [EvidenceCategory.EPC]: 'Energy Performance Certificate (EPC)',
  [EvidenceCategory.GAS_SAFETY_CERTIFICATE]: 'Gas Safety Certificate',
  [EvidenceCategory.LICENSING]: 'Property Licensing Documents',
  [EvidenceCategory.HMO_LICENSE]: 'HMO License',
  [EvidenceCategory.NOTICE_SERVED_PROOF]: 'Notice Service Proof',
  [EvidenceCategory.CORRESPONDENCE]: 'Tenant Correspondence',
  [EvidenceCategory.REPAIR_COMPLAINTS]: 'Repair Complaints',
  [EvidenceCategory.RETALIATORY_EVIDENCE]: 'Retaliatory Eviction Evidence',
  [EvidenceCategory.OTHER]: 'Other Documents',
};

/**
 * Helper text for each evidence category.
 */
export const EVIDENCE_CATEGORY_HELPER_TEXT: Record<EvidenceCategory, string> = {
  [EvidenceCategory.TENANCY_AGREEMENT]:
    'Upload the signed tenancy agreement or AST. Used to verify tenant/landlord names, property address, rent amount, and tenancy start date.',
  [EvidenceCategory.BANK_STATEMENTS]:
    'Upload bank statements or rent payment records showing rent payments received.',
  [EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE]:
    'Upload the deposit protection certificate from DPS, MyDeposits, or TDS.',
  [EvidenceCategory.PRESCRIBED_INFORMATION_PROOF]:
    'Upload proof that prescribed deposit information was served to the tenant.',
  [EvidenceCategory.HOW_TO_RENT_PROOF]:
    'Upload proof the How to Rent guide was provided (email confirmation, signed acknowledgment).',
  [EvidenceCategory.EPC]:
    'Upload the current Energy Performance Certificate for the property.',
  [EvidenceCategory.GAS_SAFETY_CERTIFICATE]:
    'Upload the current Gas Safety Certificate (CP12) for the property.',
  [EvidenceCategory.LICENSING]:
    'Upload any required property licensing documents.',
  [EvidenceCategory.HMO_LICENSE]:
    'Upload the HMO license if the property is a House in Multiple Occupation.',
  [EvidenceCategory.NOTICE_SERVED_PROOF]:
    'Upload proof of notice service (photo, proof of postage, email confirmation).',
  [EvidenceCategory.CORRESPONDENCE]:
    'Upload relevant correspondence with the tenant(s).',
  [EvidenceCategory.REPAIR_COMPLAINTS]:
    'Upload any repair complaints or related communications.',
  [EvidenceCategory.RETALIATORY_EVIDENCE]:
    'Upload evidence related to potential retaliatory eviction concerns.',
  [EvidenceCategory.OTHER]:
    'Upload any other supporting documents not covered above.',
};

// =============================================================================
// Upload Item Types
// =============================================================================

/**
 * Represents a single uploaded evidence file.
 */
export interface EvidenceUploadItem {
  /** Unique identifier for this upload */
  id: string;
  /** Original filename */
  filename: string;
  /** MIME type (e.g., 'application/pdf', 'image/jpeg') */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** ISO timestamp of upload */
  uploadedAt: string;
  /** Storage key/path for retrieval */
  storageKey: string;
  /** Assigned category */
  category: EvidenceCategory;
  /** Optional user-provided label/description */
  userProvidedLabel?: string;
  /** Number of pages (for PDFs) */
  pageCount?: number;
  /** SHA256 hash for deduplication and caching */
  sha256?: string;
}

/**
 * A bundle of evidence documents organized by category.
 */
export interface EvidenceBundle {
  /** Documents organized by category */
  byCategory: Partial<Record<EvidenceCategory, EvidenceUploadItem[]>>;
  /** Legacy uploads from old evidence_uploads field (backward compatibility) */
  legacy?: EvidenceUploadItem[];
}

// =============================================================================
// Extracted Facts Types
// =============================================================================

/**
 * The source method used to extract text from a document.
 */
export type TextExtractionSource = 'vision' | 'ocr' | 'pdf_text';

/**
 * Extracted party information from a document.
 */
export interface ExtractedParties {
  landlord_name?: string;
  landlord_address?: string;
  tenant_name?: string;
  tenant_names?: string[]; // For joint tenancies
}

/**
 * Extracted property information from a document.
 */
export interface ExtractedProperty {
  address?: string;
  address_line1?: string;
  town?: string;
  postcode?: string;
  full_address?: string;
}

/**
 * Extracted tenancy information from a document.
 */
export interface ExtractedTenancy {
  start_date?: string;
  end_date?: string;
  is_fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_amount?: number;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annually';
  deposit_amount?: number;
}

/**
 * Extracted notice information from a document.
 */
export interface ExtractedNotice {
  notice_type?: string;
  served_date?: string;
  expiry_date?: string;
  grounds?: string[];
}

/**
 * Extracted arrears information from a document.
 */
export interface ExtractedArrears {
  total_arrears?: number;
  period?: string;
  last_payment_date?: string;
  last_payment_amount?: number;
}

/**
 * Extracted deposit protection information from a document.
 */
export interface ExtractedDeposit {
  scheme_name?: 'DPS' | 'MyDeposits' | 'TDS' | string;
  protection_date?: string;
  reference?: string;
  amount?: number;
}

/**
 * Extracted compliance document information.
 */
export interface ExtractedCompliance {
  epc_present?: boolean;
  epc_rating?: string;
  epc_expiry_date?: string;
  gas_cert_present?: boolean;
  gas_cert_date?: string;
  gas_cert_expiry_date?: string;
  how_to_rent_present?: boolean;
  how_to_rent_served_date?: string;
}

/**
 * Quality metadata for extracted facts.
 */
export interface ExtractionQuality {
  /** How text was extracted from the document */
  text_source: TextExtractionSource;
  /** Overall confidence score (0-1) */
  confidence_overall: number;
  /** Per-field confidence scores */
  field_confidence?: Record<string, number>;
  /** Extraction-level warnings (not fact mismatches) */
  warnings: string[];
  /** Number of pages processed */
  pages_processed?: number;
  /** Total pages in document */
  total_pages?: number;
}

/**
 * Detected document type with confidence.
 */
export interface DetectedDocType {
  /** Primary detected document type */
  type: EvidenceCategory | 'unknown';
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative possible types */
  alternatives?: Array<{ type: EvidenceCategory; confidence: number }>;
}

/**
 * All extracted facts from a single document.
 */
export interface EvidenceExtractedFacts {
  /** Reference to the source document */
  docId: string;
  /** Detected document type */
  detectedDocType: DetectedDocType;
  /** Extracted data organized by category */
  extracted: {
    parties?: ExtractedParties;
    property?: ExtractedProperty;
    tenancy?: ExtractedTenancy;
    notice?: ExtractedNotice;
    arrears?: ExtractedArrears;
    deposit?: ExtractedDeposit;
    compliance?: ExtractedCompliance;
  };
  /** Quality metadata */
  quality: ExtractionQuality;
  /** ISO timestamp of extraction */
  extractedAt: string;
}

// =============================================================================
// Smart Review Result Types
// =============================================================================

/**
 * Result of Smart Review extraction for a single document.
 */
export interface DocumentExtractionResult {
  /** The upload item that was processed */
  upload: EvidenceUploadItem;
  /** Extraction result (null if extraction failed) */
  extraction: EvidenceExtractedFacts | null;
  /** Error message if extraction failed */
  error?: string;
  /** Whether the document was processed (false if cached/skipped) */
  wasProcessed: boolean;
}

/**
 * Result of Smart Review for an entire evidence bundle.
 */
export interface SmartReviewResult {
  /** Results for each document processed */
  documentResults: DocumentExtractionResult[];
  /** Total cost in USD for API calls */
  totalCostUsd: number;
  /** Total processing time in milliseconds */
  processingTimeMs: number;
  /** Number of documents from cache (not re-processed) */
  cachedCount: number;
  /** Number of documents processed via Vision API */
  visionCount: number;
  /** Number of documents processed via text extraction */
  textCount: number;
  /** Whether extraction completed successfully */
  success: boolean;
  /** Error if overall extraction failed */
  error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create an empty evidence bundle.
 */
export function createEmptyEvidenceBundle(): EvidenceBundle {
  return {
    byCategory: {},
    legacy: [],
  };
}

/**
 * Map legacy evidence_uploads array to evidence bundle.
 * Maintains backward compatibility with existing cases.
 */
export function mapLegacyUploadsToBundle(
  legacyUploads: Array<{
    id?: string;
    filename?: string;
    name?: string;
    mimeType?: string;
    type?: string;
    size?: number;
    sizeBytes?: number;
    uploadedAt?: string;
    storageKey?: string;
    path?: string;
    category?: string;
  }> | undefined
): EvidenceBundle {
  const bundle = createEmptyEvidenceBundle();

  if (!legacyUploads || !Array.isArray(legacyUploads)) {
    return bundle;
  }

  for (const upload of legacyUploads) {
    const item: EvidenceUploadItem = {
      id: upload.id || crypto.randomUUID(),
      filename: upload.filename || upload.name || 'unknown',
      mimeType: upload.mimeType || upload.type || 'application/octet-stream',
      sizeBytes: upload.sizeBytes || upload.size || 0,
      uploadedAt: upload.uploadedAt || new Date().toISOString(),
      storageKey: upload.storageKey || upload.path || '',
      category: (upload.category as EvidenceCategory) || EvidenceCategory.OTHER,
    };

    // Add to legacy array for reference
    if (!bundle.legacy) {
      bundle.legacy = [];
    }
    bundle.legacy.push(item);

    // Also add to byCategory for unified access
    if (!bundle.byCategory[item.category]) {
      bundle.byCategory[item.category] = [];
    }
    bundle.byCategory[item.category]!.push(item);
  }

  return bundle;
}

/**
 * Get all uploads from a bundle as a flat array.
 */
export function flattenEvidenceBundle(bundle: EvidenceBundle): EvidenceUploadItem[] {
  const items: EvidenceUploadItem[] = [];
  const seenIds = new Set<string>();

  // Add categorized items
  for (const category of Object.values(EvidenceCategory)) {
    const categoryItems = bundle.byCategory[category];
    if (categoryItems) {
      for (const item of categoryItems) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          items.push(item);
        }
      }
    }
  }

  // Add any legacy items not already included
  if (bundle.legacy) {
    for (const item of bundle.legacy) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Get uploads for a specific category.
 */
export function getUploadsForCategory(
  bundle: EvidenceBundle,
  category: EvidenceCategory
): EvidenceUploadItem[] {
  return bundle.byCategory[category] || [];
}

/**
 * Check if a category has any uploads.
 */
export function hasUploadsForCategory(
  bundle: EvidenceBundle,
  category: EvidenceCategory
): boolean {
  return (bundle.byCategory[category]?.length ?? 0) > 0;
}

/**
 * Get total upload count across all categories.
 */
export function getTotalUploadCount(bundle: EvidenceBundle): number {
  return flattenEvidenceBundle(bundle).length;
}

/**
 * Determine if a MIME type is an image.
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Determine if a MIME type is a PDF.
 */
export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Supported MIME types for Smart Review extraction.
 */
export const SUPPORTED_EXTRACTION_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
];

/**
 * Check if a MIME type supports extraction.
 */
export function supportsExtraction(mimeType: string): boolean {
  return SUPPORTED_EXTRACTION_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Set of valid EvidenceCategory values for type narrowing.
 */
const VALID_EVIDENCE_CATEGORIES = new Set<string>(Object.values(EvidenceCategory));

/**
 * Type guard to check if a string is a valid EvidenceCategory.
 */
export function isEvidenceCategory(value: unknown): value is EvidenceCategory {
  return typeof value === 'string' && VALID_EVIDENCE_CATEGORIES.has(value);
}

/**
 * Parse a string to an EvidenceCategory, returning null if invalid.
 */
export function parseEvidenceCategory(value: unknown): EvidenceCategory | null {
  if (isEvidenceCategory(value)) {
    return value;
  }
  return null;
}
