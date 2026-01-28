/**
 * Text Extraction Module
 *
 * Extracts structured facts from text-based PDFs using GPT-4o-mini.
 * Uses efficient text extraction and structured JSON output.
 *
 * @module src/lib/evidence/smart-review/text-extract
 */

import { jsonCompletion, type ChatMessage } from '@/lib/ai/openai-client';
import {
  EvidenceExtractedFacts,
  EvidenceCategory,
  EvidenceUploadItem,
} from '../schema';
import { inferDocumentType } from './classify';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Maximum characters of text to send to the LLM.
 * Can be overridden with SMART_REVIEW_MAX_TEXT_CHARS env var.
 */
export function getMaxTextChars(): number {
  const envValue = process.env.SMART_REVIEW_MAX_TEXT_CHARS;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 8000; // Default: ~8000 chars (~2000 tokens)
}

// =============================================================================
// Types
// =============================================================================

/**
 * Input for text extraction.
 */
export interface TextExtractionInput {
  /** Upload item being processed */
  upload: EvidenceUploadItem;
  /** Extracted text content */
  text: string;
}

/**
 * Result of text extraction.
 */
export interface TextExtractionResult {
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
  /** Whether text was truncated */
  wasTruncated: boolean;
  /** Original text length */
  originalTextLength: number;
}

// =============================================================================
// Schema
// =============================================================================

/**
 * JSON schema for structured extraction output.
 */
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    detected_document_type: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        confidence: { type: 'number' },
      },
      required: ['type', 'confidence'],
    },
    extracted: {
      type: 'object',
      properties: {
        parties: {
          type: 'object',
          properties: {
            landlord_name: { type: ['string', 'null'] },
            landlord_address: { type: ['string', 'null'] },
            tenant_name: { type: ['string', 'null'] },
            tenant_names: {
              type: ['array', 'null'],
              items: { type: 'string' },
            },
          },
        },
        property: {
          type: 'object',
          properties: {
            address_line1: { type: ['string', 'null'] },
            town: { type: ['string', 'null'] },
            postcode: { type: ['string', 'null'] },
            full_address: { type: ['string', 'null'] },
          },
        },
        tenancy: {
          type: 'object',
          properties: {
            start_date: { type: ['string', 'null'] },
            end_date: { type: ['string', 'null'] },
            is_fixed_term: { type: ['boolean', 'null'] },
            rent_amount: { type: ['number', 'null'] },
            rent_frequency: { type: ['string', 'null'] },
            deposit_amount: { type: ['number', 'null'] },
          },
        },
        notice: {
          type: 'object',
          properties: {
            notice_type: { type: ['string', 'null'] },
            served_date: { type: ['string', 'null'] },
            expiry_date: { type: ['string', 'null'] },
            grounds: {
              type: ['array', 'null'],
              items: { type: 'string' },
            },
          },
        },
        deposit: {
          type: 'object',
          properties: {
            scheme_name: { type: ['string', 'null'] },
            protection_date: { type: ['string', 'null'] },
            reference: { type: ['string', 'null'] },
            amount: { type: ['number', 'null'] },
          },
        },
        compliance: {
          type: 'object',
          properties: {
            epc_rating: { type: ['string', 'null'] },
            epc_expiry_date: { type: ['string', 'null'] },
            gas_cert_date: { type: ['string', 'null'] },
            gas_cert_expiry_date: { type: ['string', 'null'] },
          },
        },
        arrears: {
          type: 'object',
          properties: {
            total_arrears: { type: ['number', 'null'] },
            period: { type: ['string', 'null'] },
            last_payment_date: { type: ['string', 'null'] },
            last_payment_amount: { type: ['number', 'null'] },
          },
        },
      },
    },
    field_confidence: {
      type: 'object',
      additionalProperties: { type: 'number' },
    },
    overall_confidence: { type: 'number' },
    warnings: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'detected_document_type',
    'extracted',
    'overall_confidence',
    'warnings',
  ],
};

// =============================================================================
// Prompts
// =============================================================================

/**
 * System prompt for text extraction.
 */
const TEXT_EXTRACTION_SYSTEM_PROMPT = `You are an expert document analyzer for UK tenancy documents. Extract structured information from the provided document text.

IMPORTANT RULES:
1. Only extract information that is CLEARLY stated in the text
2. For each extracted field, estimate your confidence (0.0 to 1.0)
3. Use null for fields that are not present or unclear
4. Dates should be in YYYY-MM-DD format
5. Monetary amounts should be numbers only (no currency symbols)
6. Names should be extracted exactly as written

DOCUMENT TYPES TO IDENTIFY:
- tenancy_agreement: Assured Shorthold Tenancy (AST) or similar agreement
- deposit_protection_certificate: Certificate from DPS, MyDeposits, or TDS
- prescribed_information: Prescribed deposit information
- epc: Energy Performance Certificate
- gas_safety_certificate: Gas Safety Record (CP12)
- bank_statements: Bank statements showing rent payments
- notice_served_proof: Eviction notice (S8, S21)
- correspondence: Letters between landlord and tenant
- how_to_rent: How to Rent guide acknowledgment
- other: Any other document type

EXTRACTION PRIORITIES:
1. Landlord and tenant names
2. Property address and postcode
3. Tenancy start date
4. Rent amount and frequency
5. Deposit amount and scheme
6. Notice dates (if notice document)

Respond ONLY with valid JSON matching the required schema.`;

/**
 * Create user prompt for text extraction.
 */
function createTextExtractionPrompt(
  text: string,
  category: EvidenceCategory,
  wasTruncated: boolean
): string {
  let prompt = `Extract structured information from this UK tenancy document:\n\n`;

  if (category !== EvidenceCategory.OTHER) {
    prompt += `Document category: ${category.replace(/_/g, ' ')}\n\n`;
  }

  if (wasTruncated) {
    prompt += `Note: This text has been truncated. Focus on key information in the visible portion.\n\n`;
  }

  prompt += `DOCUMENT TEXT:\n${text}`;

  return prompt;
}

// =============================================================================
// Text Extraction
// =============================================================================

/**
 * Extract facts from document text using GPT-4o-mini.
 *
 * @param input - Text extraction input
 * @returns Extraction result
 */
export async function extractFromText(
  input: TextExtractionInput
): Promise<TextExtractionResult> {
  const startTime = Date.now();
  const originalLength = input.text.length;

  // Check for minimal text
  if (input.text.trim().length < 50) {
    return {
      success: false,
      facts: null,
      error: 'Text content too short for extraction (less than 50 characters)',
      costUsd: 0,
      timeMs: Date.now() - startTime,
      wasTruncated: false,
      originalTextLength: originalLength,
    };
  }

  // Truncate text if needed
  const maxChars = getMaxTextChars();
  const wasTruncated = input.text.length > maxChars;
  const processedText = wasTruncated
    ? input.text.substring(0, maxChars) + '\n\n[Text truncated...]'
    : input.text;

  try {
    // First, infer document type from text
    const typeInference = inferDocumentType(processedText, input.upload.category);

    const messages: ChatMessage[] = [
      { role: 'system', content: TEXT_EXTRACTION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: createTextExtractionPrompt(
          processedText,
          input.upload.category,
          wasTruncated
        ),
      },
    ];

    const result = await jsonCompletion<{
      detected_document_type: {
        type: string;
        confidence: number;
      };
      extracted: {
        parties?: {
          landlord_name?: string;
          landlord_address?: string;
          tenant_name?: string;
          tenant_names?: string[];
        };
        property?: {
          address_line1?: string;
          town?: string;
          postcode?: string;
          full_address?: string;
        };
        tenancy?: {
          start_date?: string;
          end_date?: string;
          is_fixed_term?: boolean;
          rent_amount?: number;
          rent_frequency?: string;
          deposit_amount?: number;
        };
        notice?: {
          notice_type?: string;
          served_date?: string;
          expiry_date?: string;
          grounds?: string[];
        };
        deposit?: {
          scheme_name?: string;
          protection_date?: string;
          reference?: string;
          amount?: number;
        };
        compliance?: {
          epc_rating?: string;
          epc_expiry_date?: string;
          gas_cert_date?: string;
          gas_cert_expiry_date?: string;
        };
        arrears?: {
          total_arrears?: number;
          period?: string;
          last_payment_date?: string;
          last_payment_amount?: number;
        };
      };
      field_confidence?: Record<string, number>;
      overall_confidence: number;
      warnings: string[];
    }>(messages, EXTRACTION_SCHEMA, {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 1500,
    });

    const response = result.json;

    // Convert to EvidenceExtractedFacts format
    const facts = convertTextResponseToFacts(
      input.upload.id,
      response,
      typeInference,
      wasTruncated,
      originalLength
    );

    return {
      success: true,
      facts,
      costUsd: result.cost_usd,
      timeMs: Date.now() - startTime,
      wasTruncated,
      originalTextLength: originalLength,
    };
  } catch (error: any) {
    console.error('[TextExtract] Extraction failed:', error.message);
    return {
      success: false,
      facts: null,
      error: error.message,
      costUsd: 0,
      timeMs: Date.now() - startTime,
      wasTruncated,
      originalTextLength: originalLength,
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Convert text extraction response to EvidenceExtractedFacts format.
 */
function convertTextResponseToFacts(
  docId: string,
  response: any,
  typeInference: ReturnType<typeof inferDocumentType>,
  wasTruncated: boolean,
  originalLength: number
): EvidenceExtractedFacts {
  const detectedType = response.detected_document_type || {};
  const extracted = response.extracted || {};

  // Use LLM's detected type, but compare with keyword inference
  let finalType = mapDocTypeToCategory(detectedType.type);
  let typeConfidence = detectedType.confidence || 0.5;

  // If keyword inference is high confidence and differs, add warning
  const warnings = [...(response.warnings || [])];
  if (
    typeInference.confidence > 0.7 &&
    typeInference.inferredType !== finalType &&
    typeInference.inferredType !== EvidenceCategory.OTHER
  ) {
    warnings.push(
      `Document type may be ${typeInference.inferredType.replace(/_/g, ' ')} based on keywords`
    );
  }

  if (wasTruncated) {
    warnings.push(
      `Document text was truncated (${originalLength} chars to ${getMaxTextChars()} chars)`
    );
  }

  return {
    docId,
    detectedDocType: {
      type: finalType || 'unknown',
      confidence: typeConfidence,
      alternatives: typeInference.alternativeTypes.map((alt) => ({
        type: alt.type,
        confidence: alt.confidence,
      })),
    },
    extracted: {
      parties: extracted.parties || undefined,
      property: extracted.property || undefined,
      tenancy: normalizeExtractedTenancy(extracted.tenancy),
      notice: extracted.notice || undefined,
      arrears: extracted.arrears || undefined,
      deposit: extracted.deposit || undefined,
      compliance: extracted.compliance || undefined,
    },
    quality: {
      text_source: 'pdf_text',
      confidence_overall: response.overall_confidence || 0.5,
      field_confidence: response.field_confidence || {},
      warnings,
    },
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Map document type string to EvidenceCategory.
 */
function mapDocTypeToCategory(
  docType: string | undefined
): EvidenceCategory | 'unknown' {
  if (!docType) return 'unknown';

  const typeMap: Record<string, EvidenceCategory> = {
    tenancy_agreement: EvidenceCategory.TENANCY_AGREEMENT,
    deposit_protection_certificate: EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE,
    deposit_protection: EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE,
    prescribed_information: EvidenceCategory.PRESCRIBED_INFORMATION_PROOF,
    epc: EvidenceCategory.EPC,
    energy_performance_certificate: EvidenceCategory.EPC,
    gas_safety_certificate: EvidenceCategory.GAS_SAFETY_CERTIFICATE,
    gas_safety: EvidenceCategory.GAS_SAFETY_CERTIFICATE,
    bank_statements: EvidenceCategory.BANK_STATEMENTS,
    bank_statement: EvidenceCategory.BANK_STATEMENTS,
    notice_served_proof: EvidenceCategory.NOTICE_SERVED_PROOF,
    notice: EvidenceCategory.NOTICE_SERVED_PROOF,
    eviction_notice: EvidenceCategory.NOTICE_SERVED_PROOF,
    correspondence: EvidenceCategory.CORRESPONDENCE,
    letter: EvidenceCategory.CORRESPONDENCE,
    how_to_rent: EvidenceCategory.HOW_TO_RENT_PROOF,
    repair_complaints: EvidenceCategory.REPAIR_COMPLAINTS,
    licensing: EvidenceCategory.LICENSING,
    hmo_license: EvidenceCategory.HMO_LICENSE,
    other: EvidenceCategory.OTHER,
  };

  const normalized = docType.toLowerCase().replace(/\s+/g, '_');
  return typeMap[normalized] || EvidenceCategory.OTHER;
}

/**
 * Normalize extracted tenancy data.
 * Converts rent_frequency to standard values.
 */
function normalizeExtractedTenancy(
  tenancy: any
): EvidenceExtractedFacts['extracted']['tenancy'] {
  if (!tenancy) return undefined;

  const frequencyMap: Record<string, string> = {
    weekly: 'weekly',
    week: 'weekly',
    'per week': 'weekly',
    fortnightly: 'fortnightly',
    'two weeks': 'fortnightly',
    monthly: 'monthly',
    month: 'monthly',
    'per month': 'monthly',
    pcm: 'monthly',
    quarterly: 'quarterly',
    quarter: 'quarterly',
    annually: 'annually',
    annual: 'annually',
    yearly: 'annually',
    year: 'annually',
    'per annum': 'annually',
    pa: 'annually',
  };

  let rentFrequency = tenancy.rent_frequency;
  if (rentFrequency) {
    const normalized = rentFrequency.toLowerCase().trim();
    rentFrequency = frequencyMap[normalized] || rentFrequency;
  }

  return {
    ...tenancy,
    rent_frequency: rentFrequency as any,
  };
}

/**
 * Check if text extraction is viable for given text.
 */
export function isTextExtractionViable(text: string): {
  viable: boolean;
  reason?: string;
  characterCount: number;
} {
  const charCount = text.trim().length;

  if (charCount < 50) {
    return {
      viable: false,
      reason: 'Text too short (less than 50 characters)',
      characterCount: charCount,
    };
  }

  if (charCount < 200) {
    return {
      viable: true,
      reason: 'Limited text content, extraction may be incomplete',
      characterCount: charCount,
    };
  }

  return {
    viable: true,
    characterCount: charCount,
  };
}
