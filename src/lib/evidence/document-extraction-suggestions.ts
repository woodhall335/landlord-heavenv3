/**
 * Document Extraction Suggestions
 *
 * Server-side helper that analyzes uploaded documents and returns
 * STRICT JSON "extraction suggestions" with confidence flags.
 *
 * IMPORTANT: This does NOT overwrite facts automatically.
 * It only produces suggestions for the user to review and confirm.
 *
 * Schema is limited to:
 * - Claimant/defendant/property addresses
 * - Tenancy dates
 * - Rent amount/frequency
 * - List of detected invoices/quotes with totals/dates
 */

/**
 * Confidence level for extracted suggestions
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Address suggestion extracted from document
 */
export interface AddressSuggestion {
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  confidence: ConfidenceLevel;
  source: string; // Document name/ID that this was extracted from
}

/**
 * Date suggestion extracted from document
 */
export interface DateSuggestion {
  date: string; // ISO date string
  confidence: ConfidenceLevel;
  source: string;
}

/**
 * Monetary amount suggestion
 */
export interface AmountSuggestion {
  amount: number;
  currency: 'GBP';
  confidence: ConfidenceLevel;
  source: string;
}

/**
 * Detected invoice or quote
 */
export interface DetectedInvoiceQuote {
  id: string;
  description: string;
  total?: number;
  date?: string;
  vendor?: string;
  type: 'invoice' | 'quote' | 'receipt';
  confidence: ConfidenceLevel;
  source: string;
}

/**
 * Complete extraction suggestions object
 */
export interface ExtractionSuggestions {
  /** Schema version for future compatibility */
  schemaVersion: '1.0';

  /** Timestamp of extraction */
  extractedAt: string;

  /** Overall extraction success */
  success: boolean;

  /** Error message if extraction failed */
  error?: string;

  /** Claimant address suggestions */
  claimantAddress?: AddressSuggestion;

  /** Defendant address suggestions */
  defendantAddress?: AddressSuggestion;

  /** Property address suggestions */
  propertyAddress?: AddressSuggestion;

  /** Tenancy start date suggestion */
  tenancyStartDate?: DateSuggestion;

  /** Tenancy end date suggestion */
  tenancyEndDate?: DateSuggestion;

  /** Rent amount suggestion */
  rentAmount?: AmountSuggestion;

  /** Rent frequency suggestion */
  rentFrequency?: {
    frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
    confidence: ConfidenceLevel;
    source: string;
  };

  /** Detected invoices and quotes */
  detectedInvoicesQuotes: DetectedInvoiceQuote[];

  /** Metadata about the extraction process */
  metadata: {
    documentsAnalyzed: number;
    processingTimeMs: number;
    extractionMethods: string[];
  };
}

/**
 * Input for document extraction
 */
export interface DocumentExtractionInput {
  /** Document ID */
  id: string;
  /** Filename */
  name: string;
  /** MIME type */
  mimeType?: string;
  /** Extracted text content (if already available) */
  extractedText?: string;
  /** URL to fetch document content (if text not available) */
  contentUrl?: string;
}

/**
 * Creates an empty/failed extraction suggestions object
 */
export function createEmptySuggestions(error?: string): ExtractionSuggestions {
  return {
    schemaVersion: '1.0',
    extractedAt: new Date().toISOString(),
    success: !error,
    error,
    detectedInvoicesQuotes: [],
    metadata: {
      documentsAnalyzed: 0,
      processingTimeMs: 0,
      extractionMethods: [],
    },
  };
}

/**
 * Validates that an extraction suggestions object matches the schema
 */
export function validateSuggestionsSchema(suggestions: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!suggestions || typeof suggestions !== 'object') {
    return { valid: false, errors: ['Suggestions must be an object'] };
  }

  const s = suggestions as Record<string, unknown>;

  // Required fields
  if (s.schemaVersion !== '1.0') {
    errors.push('schemaVersion must be "1.0"');
  }

  if (typeof s.extractedAt !== 'string') {
    errors.push('extractedAt must be a string');
  }

  if (typeof s.success !== 'boolean') {
    errors.push('success must be a boolean');
  }

  if (!Array.isArray(s.detectedInvoicesQuotes)) {
    errors.push('detectedInvoicesQuotes must be an array');
  }

  if (!s.metadata || typeof s.metadata !== 'object') {
    errors.push('metadata must be an object');
  }

  // Validate address suggestions if present
  const addressFields = ['claimantAddress', 'defendantAddress', 'propertyAddress'];
  for (const field of addressFields) {
    if (s[field]) {
      const addr = s[field] as Record<string, unknown>;
      if (!['high', 'medium', 'low'].includes(addr.confidence as string)) {
        errors.push(`${field}.confidence must be high, medium, or low`);
      }
      if (typeof addr.source !== 'string') {
        errors.push(`${field}.source must be a string`);
      }
    }
  }

  // Validate date suggestions if present
  const dateFields = ['tenancyStartDate', 'tenancyEndDate'];
  for (const field of dateFields) {
    if (s[field]) {
      const date = s[field] as Record<string, unknown>;
      if (typeof date.date !== 'string') {
        errors.push(`${field}.date must be a string`);
      }
      if (!['high', 'medium', 'low'].includes(date.confidence as string)) {
        errors.push(`${field}.confidence must be high, medium, or low`);
      }
    }
  }

  // Validate rent amount if present
  if (s.rentAmount) {
    const rent = s.rentAmount as Record<string, unknown>;
    if (typeof rent.amount !== 'number') {
      errors.push('rentAmount.amount must be a number');
    }
    if (rent.currency !== 'GBP') {
      errors.push('rentAmount.currency must be GBP');
    }
  }

  // Validate detected invoices/quotes
  if (Array.isArray(s.detectedInvoicesQuotes)) {
    (s.detectedInvoicesQuotes as unknown[]).forEach((item, i) => {
      if (!item || typeof item !== 'object') {
        errors.push(`detectedInvoicesQuotes[${i}] must be an object`);
        return;
      }
      const inv = item as Record<string, unknown>;
      if (typeof inv.id !== 'string') {
        errors.push(`detectedInvoicesQuotes[${i}].id must be a string`);
      }
      if (typeof inv.description !== 'string') {
        errors.push(`detectedInvoicesQuotes[${i}].description must be a string`);
      }
      if (!['invoice', 'quote', 'receipt'].includes(inv.type as string)) {
        errors.push(`detectedInvoicesQuotes[${i}].type must be invoice, quote, or receipt`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extract suggestions from documents
 *
 * TODO: Wire this into the wizard evidence upload flow.
 *
 * Current implementation is a stub that returns empty suggestions.
 * Full implementation will:
 * 1. Parse PDF/image content
 * 2. Run regex patterns for addresses, dates, amounts
 * 3. Optionally use LLM for complex extraction
 * 4. Return suggestions with confidence scores
 *
 * @param documents - Array of documents to analyze
 * @returns ExtractionSuggestions object with found data
 */
export async function extractDocumentSuggestions(
  documents: DocumentExtractionInput[]
): Promise<ExtractionSuggestions> {
  const startTime = Date.now();

  // Safety check
  if (!documents || documents.length === 0) {
    return createEmptySuggestions('No documents provided');
  }

  try {
    // TODO: Implement actual extraction logic
    // This is a scaffold - the actual implementation will:
    // 1. For each document, check if extractedText is available
    // 2. If not, fetch content from contentUrl and extract text
    // 3. Run pattern matching for:
    //    - UK postcodes: /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi
    //    - Dates: various UK formats
    //    - Monetary amounts: /£\s?[\d,]+\.?\d*/gi
    //    - Invoice numbers: /invoice\s*(no\.?|number|#)?\s*:?\s*([A-Z0-9-]+)/gi
    // 4. Return extracted suggestions with confidence scores

    const suggestions: ExtractionSuggestions = {
      schemaVersion: '1.0',
      extractedAt: new Date().toISOString(),
      success: true,
      detectedInvoicesQuotes: [],
      metadata: {
        documentsAnalyzed: documents.length,
        processingTimeMs: Date.now() - startTime,
        extractionMethods: ['stub'], // Will be: ['regex', 'llm'] when implemented
      },
    };

    // Basic extraction from document names (placeholder logic)
    for (const doc of documents) {
      const name = doc.name.toLowerCase();

      // Detect invoice/quote from filename
      if (name.includes('invoice') || name.includes('quote') || name.includes('receipt')) {
        suggestions.detectedInvoicesQuotes.push({
          id: `detected-${doc.id}`,
          description: `Detected from filename: ${doc.name}`,
          type: name.includes('invoice') ? 'invoice' : name.includes('quote') ? 'quote' : 'receipt',
          confidence: 'low',
          source: doc.name,
        });
      }
    }

    suggestions.metadata.processingTimeMs = Date.now() - startTime;

    return suggestions;
  } catch (error) {
    return createEmptySuggestions(
      error instanceof Error ? error.message : 'Unknown extraction error'
    );
  }
}

/**
 * Safe wrapper that catches all errors and returns valid JSON
 */
export async function safeExtractDocumentSuggestions(
  documents: DocumentExtractionInput[]
): Promise<ExtractionSuggestions> {
  try {
    const result = await extractDocumentSuggestions(documents);
    const validation = validateSuggestionsSchema(result);

    if (!validation.valid) {
      console.error('[DocumentExtraction] Schema validation failed:', validation.errors);
      return createEmptySuggestions(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    return result;
  } catch (error) {
    console.error('[DocumentExtraction] Unexpected error:', error);
    return createEmptySuggestions(
      error instanceof Error ? error.message : 'Unexpected extraction error'
    );
  }
}
