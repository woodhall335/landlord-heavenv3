/**
 * Vision Extraction Module
 *
 * Uses GPT-4o Vision API to extract structured facts from images and scanned PDFs.
 * Handles image encoding, page limiting, and structured output parsing.
 *
 * @module src/lib/evidence/smart-review/vision-extract
 */

import { getOpenAIClient } from '@/lib/ai/openai-client';
import {
  EvidenceExtractedFacts,
  EvidenceCategory,
  EvidenceUploadItem,
} from '../schema';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Maximum pages to process from a PDF with Vision API.
 * Can be overridden with SMART_REVIEW_MAX_VISION_PAGES env var.
 */
export function getMaxVisionPages(): number {
  const envValue = process.env.SMART_REVIEW_MAX_VISION_PAGES;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 3; // Default: first 3 pages
}

/**
 * Maximum image dimension (width or height) for Vision API.
 */
export const MAX_IMAGE_DIMENSION = 2048;

/**
 * Supported image MIME types for Vision API.
 */
export const VISION_SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// =============================================================================
// Types
// =============================================================================

/**
 * Input for vision extraction.
 */
export interface VisionExtractionInput {
  /** Upload item being processed */
  upload: EvidenceUploadItem;
  /** Base64-encoded image data */
  imageBase64: string;
  /** MIME type of the image */
  mimeType: string;
  /** Page number (for multi-page PDFs) */
  pageNumber?: number;
  /** Total pages in document */
  totalPages?: number;
}

/**
 * Result of vision extraction.
 */
export interface VisionExtractionResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted facts (null if failed) */
  facts: EvidenceExtractedFacts | null;
  /** Error message if failed */
  error?: string;
  /** Cost in USD */
  costUsd: number;
  /** Time taken in milliseconds */
  timeMs: number;
}

// =============================================================================
// Prompts
// =============================================================================

/**
 * System prompt for Vision extraction.
 */
const VISION_SYSTEM_PROMPT = `You are an expert document analyzer for UK tenancy documents. Extract structured information from the provided document image.

IMPORTANT RULES:
1. Only extract information that is CLEARLY visible in the document
2. For each extracted field, estimate your confidence (0.0 to 1.0)
3. Use null for fields that are not present or not clearly readable
4. Dates should be in YYYY-MM-DD format
5. Monetary amounts should be numbers only (no currency symbols)
6. Names should be extracted exactly as written

DOCUMENT TYPES TO IDENTIFY:
- tenancy_agreement: Assured Shorthold Tenancy (AST) or similar agreement
- deposit_protection_certificate: Certificate from DPS, MyDeposits, or TDS
- epc: Energy Performance Certificate
- gas_safety_certificate: Gas Safety Record (CP12)
- bank_statements: Bank statements showing rent payments
- notice_served_proof: Proof of notice service (S8, S21)
- correspondence: Letters between landlord and tenant
- other: Any other document type

Respond with a JSON object matching this schema:
{
  "detected_document_type": {
    "type": string (one of the types above),
    "confidence": number (0.0-1.0)
  },
  "extracted": {
    "parties": {
      "landlord_name": string | null,
      "tenant_name": string | null,
      "tenant_names": string[] | null
    },
    "property": {
      "address_line1": string | null,
      "town": string | null,
      "postcode": string | null
    },
    "tenancy": {
      "start_date": string | null (YYYY-MM-DD),
      "end_date": string | null (YYYY-MM-DD),
      "rent_amount": number | null,
      "rent_frequency": "weekly" | "fortnightly" | "monthly" | "quarterly" | "annually" | null,
      "deposit_amount": number | null
    },
    "notice": {
      "notice_type": string | null,
      "served_date": string | null (YYYY-MM-DD),
      "expiry_date": string | null (YYYY-MM-DD)
    },
    "deposit": {
      "scheme_name": "DPS" | "MyDeposits" | "TDS" | string | null,
      "protection_date": string | null (YYYY-MM-DD),
      "reference": string | null,
      "amount": number | null
    },
    "compliance": {
      "epc_rating": string | null,
      "epc_expiry_date": string | null (YYYY-MM-DD),
      "gas_cert_date": string | null (YYYY-MM-DD),
      "gas_cert_expiry_date": string | null (YYYY-MM-DD)
    },
    "arrears": {
      "total_arrears": number | null,
      "period": string | null
    }
  },
  "field_confidence": {
    "landlord_name": number,
    "tenant_name": number,
    "property_address": number,
    "tenancy_start_date": number,
    "rent_amount": number,
    "deposit_amount": number
  },
  "overall_confidence": number (0.0-1.0),
  "warnings": string[] (any issues noticed during extraction)
}`;

/**
 * User prompt template for Vision extraction.
 */
function createVisionUserPrompt(
  category: EvidenceCategory,
  pageInfo?: { current: number; total: number }
): string {
  let prompt = `Analyze this document image and extract all relevant information.`;

  if (category !== EvidenceCategory.OTHER) {
    prompt += `\n\nThis document was uploaded as: ${category.replace(/_/g, ' ')}.`;
    prompt += ` Please verify if this matches the document content.`;
  }

  if (pageInfo) {
    prompt += `\n\nThis is page ${pageInfo.current} of ${pageInfo.total}.`;
    if (pageInfo.current === 1) {
      prompt += ` Focus on identifying the document type and extracting key details from this first page.`;
    }
  }

  return prompt;
}

// =============================================================================
// Vision Extraction
// =============================================================================

/**
 * Extract facts from a single image using GPT-4o Vision.
 *
 * @param input - Vision extraction input
 * @returns Extraction result
 */
export async function extractFromImage(
  input: VisionExtractionInput
): Promise<VisionExtractionResult> {
  const startTime = Date.now();

  try {
    const openai = getOpenAIClient();

    // Prepare the image for the API
    const imageUrl = `data:${input.mimeType};base64,${input.imageBase64}`;

    const pageInfo = input.pageNumber && input.totalPages
      ? { current: input.pageNumber, total: input.totalPages }
      : undefined;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: VISION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: createVisionUserPrompt(input.upload.category, pageInfo),
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from Vision API');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);

    // Calculate cost (GPT-4o Vision pricing)
    const usage = response.usage;
    const costUsd = usage
      ? (usage.prompt_tokens / 1_000_000) * 2.5 +
        (usage.completion_tokens / 1_000_000) * 10
      : 0;

    // Convert to EvidenceExtractedFacts format
    const facts = convertVisionResponseToFacts(
      input.upload.id,
      parsed,
      input.pageNumber,
      input.totalPages
    );

    return {
      success: true,
      facts,
      costUsd,
      timeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[VisionExtract] Extraction failed:', error.message);
    return {
      success: false,
      facts: null,
      error: error.message,
      costUsd: 0,
      timeMs: Date.now() - startTime,
    };
  }
}

/**
 * Extract facts from multiple images (multi-page document).
 * Merges results from all pages.
 *
 * @param inputs - Array of vision extraction inputs
 * @returns Merged extraction result
 */
export async function extractFromMultipleImages(
  inputs: VisionExtractionInput[]
): Promise<VisionExtractionResult> {
  if (inputs.length === 0) {
    return {
      success: false,
      facts: null,
      error: 'No images provided',
      costUsd: 0,
      timeMs: 0,
    };
  }

  const startTime = Date.now();
  let totalCost = 0;
  const pageResults: EvidenceExtractedFacts[] = [];
  const errors: string[] = [];

  // Process each page (could be parallelized, but keeping sequential for rate limits)
  for (const input of inputs) {
    const result = await extractFromImage(input);
    totalCost += result.costUsd;

    if (result.success && result.facts) {
      pageResults.push(result.facts);
    } else if (result.error) {
      errors.push(`Page ${input.pageNumber || 1}: ${result.error}`);
    }
  }

  if (pageResults.length === 0) {
    return {
      success: false,
      facts: null,
      error: errors.join('; ') || 'No pages could be processed',
      costUsd: totalCost,
      timeMs: Date.now() - startTime,
    };
  }

  // Merge results from all pages
  const mergedFacts = mergePageResults(pageResults);

  return {
    success: true,
    facts: mergedFacts,
    costUsd: totalCost,
    timeMs: Date.now() - startTime,
  };
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Convert Vision API response to EvidenceExtractedFacts format.
 */
function convertVisionResponseToFacts(
  docId: string,
  response: any,
  pageNumber?: number,
  totalPages?: number
): EvidenceExtractedFacts {
  const detectedType = response.detected_document_type || {};
  const extracted = response.extracted || {};
  const fieldConfidence = response.field_confidence || {};

  return {
    docId,
    detectedDocType: {
      type: mapDocTypeToCategory(detectedType.type) || 'unknown',
      confidence: detectedType.confidence || 0.5,
    },
    extracted: {
      parties: extracted.parties || undefined,
      property: extracted.property || undefined,
      tenancy: extracted.tenancy || undefined,
      notice: extracted.notice || undefined,
      arrears: extracted.arrears || undefined,
      deposit: extracted.deposit || undefined,
      compliance: extracted.compliance || undefined,
    },
    quality: {
      text_source: 'vision',
      confidence_overall: response.overall_confidence || 0.5,
      field_confidence: fieldConfidence,
      warnings: response.warnings || [],
      pages_processed: pageNumber || 1,
      total_pages: totalPages || 1,
    },
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Map Vision API document type string to EvidenceCategory.
 */
function mapDocTypeToCategory(
  docType: string | undefined
): EvidenceCategory | 'unknown' {
  if (!docType) return 'unknown';

  const typeMap: Record<string, EvidenceCategory> = {
    tenancy_agreement: EvidenceCategory.TENANCY_AGREEMENT,
    deposit_protection_certificate: EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE,
    epc: EvidenceCategory.EPC,
    gas_safety_certificate: EvidenceCategory.GAS_SAFETY_CERTIFICATE,
    bank_statements: EvidenceCategory.BANK_STATEMENTS,
    bank_statement: EvidenceCategory.BANK_STATEMENTS,
    notice_served_proof: EvidenceCategory.NOTICE_SERVED_PROOF,
    notice: EvidenceCategory.NOTICE_SERVED_PROOF,
    correspondence: EvidenceCategory.CORRESPONDENCE,
    letter: EvidenceCategory.CORRESPONDENCE,
    prescribed_information: EvidenceCategory.PRESCRIBED_INFORMATION_PROOF,
    how_to_rent: EvidenceCategory.HOW_TO_RENT_PROOF,
    repair_complaints: EvidenceCategory.REPAIR_COMPLAINTS,
    other: EvidenceCategory.OTHER,
  };

  const normalized = docType.toLowerCase().replace(/\s+/g, '_');
  return typeMap[normalized] || EvidenceCategory.OTHER;
}

/**
 * Merge results from multiple pages into a single facts object.
 * Uses the first non-null value for each field, with confidence weighting.
 */
function mergePageResults(results: EvidenceExtractedFacts[]): EvidenceExtractedFacts {
  if (results.length === 0) {
    throw new Error('No results to merge');
  }

  if (results.length === 1) {
    return results[0];
  }

  // Use the first result as base
  const merged = { ...results[0] };

  // Track pages processed
  const totalPages = results.reduce(
    (max, r) => Math.max(max, r.quality.total_pages || 1),
    1
  );

  // Merge extracted data from subsequent pages
  for (let i = 1; i < results.length; i++) {
    const result = results[i];

    // Merge each category
    merged.extracted = mergeExtractedData(
      merged.extracted,
      result.extracted
    );

    // Merge warnings
    merged.quality.warnings = [
      ...new Set([...merged.quality.warnings, ...result.quality.warnings]),
    ];

    // Update confidence (average)
    merged.quality.confidence_overall =
      (merged.quality.confidence_overall + result.quality.confidence_overall) / 2;
  }

  merged.quality.pages_processed = results.length;
  merged.quality.total_pages = totalPages;

  return merged;
}

/**
 * Merge extracted data objects, preferring non-null values with higher confidence.
 */
function mergeExtractedData(
  base: EvidenceExtractedFacts['extracted'],
  overlay: EvidenceExtractedFacts['extracted']
): EvidenceExtractedFacts['extracted'] {
  const result = { ...base };

  // Merge parties
  if (overlay.parties) {
    result.parties = {
      ...result.parties,
      landlord_name: result.parties?.landlord_name || overlay.parties.landlord_name,
      tenant_name: result.parties?.tenant_name || overlay.parties.tenant_name,
      tenant_names: result.parties?.tenant_names || overlay.parties.tenant_names,
    };
  }

  // Merge property
  if (overlay.property) {
    result.property = {
      ...result.property,
      address_line1: result.property?.address_line1 || overlay.property.address_line1,
      town: result.property?.town || overlay.property.town,
      postcode: result.property?.postcode || overlay.property.postcode,
    };
  }

  // Merge tenancy
  if (overlay.tenancy) {
    result.tenancy = {
      ...result.tenancy,
      start_date: result.tenancy?.start_date || overlay.tenancy.start_date,
      end_date: result.tenancy?.end_date || overlay.tenancy.end_date,
      rent_amount: result.tenancy?.rent_amount ?? overlay.tenancy.rent_amount,
      rent_frequency: result.tenancy?.rent_frequency || overlay.tenancy.rent_frequency,
      deposit_amount: result.tenancy?.deposit_amount ?? overlay.tenancy.deposit_amount,
    };
  }

  // Merge other categories similarly
  if (overlay.notice) {
    result.notice = { ...result.notice, ...overlay.notice };
  }
  if (overlay.deposit) {
    result.deposit = { ...result.deposit, ...overlay.deposit };
  }
  if (overlay.arrears) {
    result.arrears = { ...result.arrears, ...overlay.arrears };
  }
  if (overlay.compliance) {
    result.compliance = { ...result.compliance, ...overlay.compliance };
  }

  return result;
}

/**
 * Check if Vision API is available (API key configured).
 */
export function isVisionAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
