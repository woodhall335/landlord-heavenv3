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

// =============================================================================
// REGEX PATTERNS FOR UK DOCUMENT EXTRACTION
// =============================================================================

/** UK Postcode pattern - matches standard UK postcodes */
const UK_POSTCODE_REGEX = /\b([A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2})\b/gi;

/**
 * Date patterns for UK formats and ISO
 * Supports: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
 */
const DATE_PATTERNS = [
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/g,
  // YYYY-MM-DD (ISO)
  /\b(\d{4})-(\d{2})-(\d{2})\b/g,
  // Written dates like "1st January 2024", "15 March 2023"
  /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi,
];

/** Monetary amount pattern - matches £ amounts */
const AMOUNT_REGEX = /£\s?([\d,]+(?:\.\d{2})?)/gi;

/** Invoice/reference number patterns - require explicit separator and ID format */
const INVOICE_PATTERNS = [
  // "Invoice No: INV-001" or "Invoice #123"
  /invoice\s*(?:no\.?|number|#)?\s*[:\s]\s*([A-Z0-9][A-Z0-9\-\/]{2,})/gi,
  // "Ref: REF-12345" or "Reference: ABC123"
  /ref(?:erence)?\s*(?:no\.?|#)?\s*[:\s]\s*([A-Z0-9][A-Z0-9\-\/]{2,})/gi,
  // "Order No: ORD-001"
  /order\s*(?:no\.?|number|#)?\s*[:\s]\s*([A-Z0-9][A-Z0-9\-\/]{2,})/gi,
  // "Quote No: Q-001"
  /quote\s*(?:no\.?|number|#)?\s*[:\s]\s*([A-Z0-9][A-Z0-9\-\/]{2,})/gi,
];

/** Rent frequency patterns */
const RENT_FREQUENCY_PATTERNS: { pattern: RegExp; frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly' }[] = [
  { pattern: /\bper\s+week\b|\bweekly\b|\bp\.?w\.?\b/i, frequency: 'weekly' },
  { pattern: /\bfortnightly\b|\bevery\s+(?:two|2)\s+weeks?\b/i, frequency: 'fortnightly' },
  { pattern: /\bper\s+month\b|\bmonthly\b|\bp\.?c\.?m\.?\b|\bpcm\b/i, frequency: 'monthly' },
  { pattern: /\bquarterly\b|\bper\s+quarter\b/i, frequency: 'quarterly' },
  { pattern: /\bper\s+(?:year|annum)\b|\byearly\b|\bannually\b|\bp\.?a\.?\b/i, frequency: 'yearly' },
];

/** Document type patterns for classification */
const DOCUMENT_TYPE_PATTERNS = {
  tenancyAgreement: /tenancy\s*agreement|assured\s*shorthold|ast\b|lease\s*agreement/i,
  rentLedger: /rent\s*(?:ledger|statement|account|schedule)|statement\s*of\s*(?:rent|account)/i,
  invoice: /invoice|bill|statement\s*of\s*charges/i,
  quote: /quote|quotation|estimate/i,
  receipt: /receipt|payment\s*confirmation|proof\s*of\s*payment/i,
  letterBeforeAction: /letter\s*before\s*(?:action|claim)|lba\b|pre[\-\s]?action/i,
};

// =============================================================================
// EXTRACTION HELPER FUNCTIONS
// =============================================================================

interface ExtractedData {
  postcodes: Array<{ value: string; context: string; source: string }>;
  dates: Array<{ value: string; isoDate: string; context: string; source: string }>;
  amounts: Array<{ value: number; context: string; source: string }>;
  invoiceNumbers: Array<{ value: string; type: string; source: string }>;
  frequencies: Array<{ frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly'; source: string }>;
  documentTypes: Array<{ type: string; source: string }>;
}

/**
 * Month name to number mapping
 */
const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

/**
 * Parses a date string to ISO format
 */
function parseToIsoDate(day: string, month: string, year: string): string | null {
  const d = day.padStart(2, '0');
  let m = month;

  // Check if month is a name
  if (isNaN(parseInt(month))) {
    m = MONTH_MAP[month.toLowerCase()] || '01';
  } else {
    m = month.padStart(2, '0');
  }

  const y = year;

  // Validate date
  const dateObj = new Date(`${y}-${m}-${d}`);
  if (isNaN(dateObj.getTime())) return null;

  // Check for reasonable date range (1990-2100)
  const yearNum = parseInt(y);
  if (yearNum < 1990 || yearNum > 2100) return null;

  return `${y}-${m}-${d}`;
}

/**
 * Extracts data from text using regex patterns
 */
function extractFromText(text: string, source: string): ExtractedData {
  const data: ExtractedData = {
    postcodes: [],
    dates: [],
    amounts: [],
    invoiceNumbers: [],
    frequencies: [],
    documentTypes: [],
  };

  if (!text) return data;

  // Extract postcodes
  let match;
  const postcodeRegex = new RegExp(UK_POSTCODE_REGEX.source, 'gi');
  while ((match = postcodeRegex.exec(text)) !== null) {
    const postcode = match[1].toUpperCase().replace(/\s+/g, ' ');
    // Get surrounding context (100 chars before and after for better address detection)
    const start = Math.max(0, match.index - 100);
    const end = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.slice(start, end).replace(/\s+/g, ' ').trim();

    if (!data.postcodes.some(p => p.value === postcode)) {
      data.postcodes.push({ value: postcode, context, source });
    }
  }

  // Extract dates - DD/MM/YYYY format
  const datePattern1 = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/g;
  while ((match = datePattern1.exec(text)) !== null) {
    // Assume DD/MM/YYYY for UK format
    const isoDate = parseToIsoDate(match[1], match[2], match[3]);
    if (isoDate) {
      const start = Math.max(0, match.index - 30);
      const end = Math.min(text.length, match.index + match[0].length + 30);
      const context = text.slice(start, end).replace(/\s+/g, ' ').trim();
      data.dates.push({ value: match[0], isoDate, context, source });
    }
  }

  // Extract dates - YYYY-MM-DD (ISO) format
  const datePattern2 = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((match = datePattern2.exec(text)) !== null) {
    const isoDate = parseToIsoDate(match[3], match[2], match[1]);
    if (isoDate) {
      const start = Math.max(0, match.index - 30);
      const end = Math.min(text.length, match.index + match[0].length + 30);
      const context = text.slice(start, end).replace(/\s+/g, ' ').trim();
      data.dates.push({ value: match[0], isoDate, context, source });
    }
  }

  // Extract dates - Written format (1st January 2024)
  const datePattern3 = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi;
  while ((match = datePattern3.exec(text)) !== null) {
    const isoDate = parseToIsoDate(match[1], match[2], match[3]);
    if (isoDate) {
      const start = Math.max(0, match.index - 30);
      const end = Math.min(text.length, match.index + match[0].length + 30);
      const context = text.slice(start, end).replace(/\s+/g, ' ').trim();
      data.dates.push({ value: match[0], isoDate, context, source });
    }
  }

  // Extract monetary amounts
  const amountRegex = new RegExp(AMOUNT_REGEX.source, 'gi');
  while ((match = amountRegex.exec(text)) !== null) {
    const amountStr = match[1].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0 && amount < 10000000) {
      const start = Math.max(0, match.index - 40);
      const end = Math.min(text.length, match.index + match[0].length + 40);
      const context = text.slice(start, end).replace(/\s+/g, ' ').trim();
      data.amounts.push({ value: amount, context, source });
    }
  }

  // Extract invoice/reference numbers
  for (const pattern of INVOICE_PATTERNS) {
    const regex = new RegExp(pattern.source, 'gi');
    while ((match = regex.exec(text)) !== null) {
      if (match[1] && match[1].length >= 3 && match[1].length <= 30) {
        const type = pattern.source.includes('invoice') || pattern.source.includes('inv')
          ? 'invoice'
          : pattern.source.includes('quote')
          ? 'quote'
          : 'reference';
        if (!data.invoiceNumbers.some(n => n.value === match[1])) {
          data.invoiceNumbers.push({ value: match[1], type, source });
        }
      }
    }
  }

  // Detect rent frequency
  for (const { pattern, frequency } of RENT_FREQUENCY_PATTERNS) {
    if (pattern.test(text)) {
      data.frequencies.push({ frequency, source });
      break; // Take first match
    }
  }

  // Detect document types
  for (const [type, pattern] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
    if (pattern.test(text)) {
      data.documentTypes.push({ type, source });
    }
  }

  return data;
}

/**
 * Determines confidence based on context keywords
 */
function determineConfidence(context: string, fieldType: string): ConfidenceLevel {
  const contextLower = context.toLowerCase();

  // High confidence indicators
  const highConfidence: Record<string, RegExp[]> = {
    postcode: [/property\s*address/i, /tenant\s*address/i, /landlord\s*address/i, /premises/i],
    date: [/tenancy\s*(?:start|commencement|begins?)/i, /tenancy\s*(?:end|terminat|expir)/i, /from\s*(?:date)?/i, /to\s*(?:date)?/i],
    amount: [/rent\s*(?:amount|payable|due)/i, /monthly\s*rent/i, /total\s*(?:amount|due)/i],
  };

  // Medium confidence indicators
  const mediumConfidence: Record<string, RegExp[]> = {
    postcode: [/address/i, /located\s*at/i, /property/i],
    date: [/date/i, /signed/i, /dated/i],
    amount: [/amount/i, /total/i, /sum/i, /£/],
  };

  const highPatterns = highConfidence[fieldType] || [];
  const mediumPatterns = mediumConfidence[fieldType] || [];

  for (const pattern of highPatterns) {
    if (pattern.test(contextLower)) return 'high';
  }

  for (const pattern of mediumPatterns) {
    if (pattern.test(contextLower)) return 'medium';
  }

  return 'low';
}

/**
 * Maps extracted data to Money Claim suggestions
 */
function mapToSuggestions(
  extracted: ExtractedData,
  suggestions: ExtractionSuggestions
): void {
  // Map postcodes to addresses
  for (const pc of extracted.postcodes) {
    const confidence = determineConfidence(pc.context, 'postcode');
    const contextLower = pc.context.toLowerCase();

    // Try to determine which address this belongs to
    if (/property|premises|let\s+property/i.test(contextLower)) {
      if (!suggestions.propertyAddress || confidence === 'high') {
        suggestions.propertyAddress = {
          postcode: pc.value,
          confidence,
          source: pc.source,
        };
      }
    } else if (/landlord|claimant|owner/i.test(contextLower)) {
      if (!suggestions.claimantAddress || confidence === 'high') {
        suggestions.claimantAddress = {
          postcode: pc.value,
          confidence,
          source: pc.source,
        };
      }
    } else if (/tenant|defendant|occupier/i.test(contextLower)) {
      if (!suggestions.defendantAddress || confidence === 'high') {
        suggestions.defendantAddress = {
          postcode: pc.value,
          confidence,
          source: pc.source,
        };
      }
    } else if (!suggestions.propertyAddress) {
      // Default to property address if no context
      suggestions.propertyAddress = {
        postcode: pc.value,
        confidence: 'low',
        source: pc.source,
      };
    }
  }

  // Map dates
  for (const date of extracted.dates) {
    const confidence = determineConfidence(date.context, 'date');
    const contextLower = date.context.toLowerCase();

    if (/(?:tenancy\s*)?(?:start|commence|begin|from)/i.test(contextLower)) {
      if (!suggestions.tenancyStartDate || confidence === 'high') {
        suggestions.tenancyStartDate = {
          date: date.isoDate,
          confidence,
          source: date.source,
        };
      }
    } else if (/(?:tenancy\s*)?(?:end|terminat|expir|until|to\s*date)/i.test(contextLower)) {
      if (!suggestions.tenancyEndDate || confidence === 'high') {
        suggestions.tenancyEndDate = {
          date: date.isoDate,
          confidence,
          source: date.source,
        };
      }
    }
  }

  // Map rent amount - look for the most likely rent value
  const rentIndicators = /rent|monthly\s*payment|pcm|per\s*month/i;
  const rentAmounts = extracted.amounts.filter(a => rentIndicators.test(a.context));
  if (rentAmounts.length > 0) {
    // Take the most common or highest confidence amount
    const sorted = rentAmounts.sort((a, b) => {
      const confA = determineConfidence(a.context, 'amount');
      const confB = determineConfidence(b.context, 'amount');
      const confOrder = { high: 3, medium: 2, low: 1 };
      return confOrder[confB] - confOrder[confA];
    });

    const best = sorted[0];
    suggestions.rentAmount = {
      amount: best.value,
      currency: 'GBP',
      confidence: determineConfidence(best.context, 'amount'),
      source: best.source,
    };
  }

  // Map rent frequency
  if (extracted.frequencies.length > 0) {
    suggestions.rentFrequency = {
      frequency: extracted.frequencies[0].frequency,
      confidence: 'medium',
      source: extracted.frequencies[0].source,
    };
  }
}

/**
 * Creates invoice/quote suggestions from extracted data
 */
function createInvoiceSuggestions(
  extracted: ExtractedData,
  docName: string,
  docId: string
): DetectedInvoiceQuote[] {
  const invoices: DetectedInvoiceQuote[] = [];

  // Check document types
  const isInvoice = extracted.documentTypes.some(d => d.type === 'invoice');
  const isQuote = extracted.documentTypes.some(d => d.type === 'quote');
  const isReceipt = extracted.documentTypes.some(d => d.type === 'receipt');

  // If we detected invoice numbers
  for (const inv of extracted.invoiceNumbers) {
    const type: 'invoice' | 'quote' | 'receipt' =
      inv.type === 'quote' ? 'quote' :
      isReceipt ? 'receipt' :
      'invoice';

    // Find associated amount (prefer the largest in context)
    const totalAmount = extracted.amounts.length > 0
      ? Math.max(...extracted.amounts.map(a => a.value))
      : undefined;

    // Find associated date
    const dateEntry = extracted.dates[0];

    invoices.push({
      id: `detected-${docId}-${inv.value}`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} ${inv.value}`,
      total: totalAmount,
      date: dateEntry?.isoDate,
      type,
      confidence: 'medium',
      source: docName,
    });
  }

  // If no invoice numbers but document is classified as invoice/quote/receipt
  if (invoices.length === 0 && (isInvoice || isQuote || isReceipt)) {
    const type: 'invoice' | 'quote' | 'receipt' =
      isQuote ? 'quote' :
      isReceipt ? 'receipt' :
      'invoice';

    const totalAmount = extracted.amounts.length > 0
      ? Math.max(...extracted.amounts.map(a => a.value))
      : undefined;

    invoices.push({
      id: `detected-${docId}`,
      description: `Detected ${type} from: ${docName}`,
      total: totalAmount,
      date: extracted.dates[0]?.isoDate,
      type,
      confidence: 'low',
      source: docName,
    });
  }

  return invoices;
}

/**
 * Safely gets document name, handling undefined/null
 */
function safeGetName(doc: DocumentExtractionInput): string {
  return doc.name || doc.id || 'unknown';
}

/**
 * Extract suggestions from documents
 *
 * Performs deterministic regex extraction for:
 * - UK postcodes
 * - Dates (UK formats + ISO)
 * - Monetary amounts (£)
 * - Invoice/reference numbers
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
    const suggestions: ExtractionSuggestions = {
      schemaVersion: '1.0',
      extractedAt: new Date().toISOString(),
      success: true,
      detectedInvoicesQuotes: [],
      metadata: {
        documentsAnalyzed: documents.length,
        processingTimeMs: 0,
        extractionMethods: ['regex', 'filename'],
      },
    };

    const allExtracted: ExtractedData[] = [];

    for (const doc of documents) {
      const docName = safeGetName(doc);
      const nameLower = docName.toLowerCase();

      // Extract from document text if available
      if (doc.extractedText) {
        const extracted = extractFromText(doc.extractedText, docName);
        allExtracted.push(extracted);

        // Create invoice suggestions from this document
        const docInvoices = createInvoiceSuggestions(extracted, docName, doc.id);
        suggestions.detectedInvoicesQuotes.push(...docInvoices);

        // Map to suggestions
        mapToSuggestions(extracted, suggestions);
      }

      // Also check filename for type hints
      if (nameLower.includes('invoice') || nameLower.includes('quote') || nameLower.includes('receipt')) {
        const type: 'invoice' | 'quote' | 'receipt' =
          nameLower.includes('invoice') ? 'invoice' :
          nameLower.includes('quote') ? 'quote' :
          'receipt';

        // Only add if not already detected from content
        const alreadyDetected = suggestions.detectedInvoicesQuotes.some(
          inv => inv.source === docName
        );

        if (!alreadyDetected) {
          suggestions.detectedInvoicesQuotes.push({
            id: `detected-${doc.id}`,
            description: `Detected from filename: ${docName}`,
            type,
            confidence: 'low',
            source: docName,
          });
        }
      }

      // Check for rent ledger from filename
      if (nameLower.includes('ledger') || nameLower.includes('rent') && nameLower.includes('statement')) {
        // This is likely a rent ledger - boost confidence of any amounts found
        if (suggestions.rentAmount) {
          suggestions.rentAmount.confidence = 'high';
        }
      }

      // Check for tenancy agreement from filename
      if (nameLower.includes('tenancy') || nameLower.includes('agreement') || nameLower.includes('ast')) {
        // Boost confidence of dates found
        if (suggestions.tenancyStartDate) {
          suggestions.tenancyStartDate.confidence = 'high';
        }
        if (suggestions.tenancyEndDate) {
          suggestions.tenancyEndDate.confidence = 'high';
        }
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
