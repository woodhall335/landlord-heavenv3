/**
 * PDF Text Extraction Module
 *
 * Provides real PDF text extraction using pdf-parse (which uses pdf.js under the hood).
 * This works in Node.js server environment (Next.js API routes).
 *
 * Fallback for scanned/image PDFs: marks as LOW_TEXT for vision processing.
 */

// Dynamic import to avoid issues with Next.js bundling
let pdfParse: typeof import('pdf-parse') | null = null;

async function getPdfParse(): Promise<typeof import('pdf-parse')> {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse as typeof import('pdf-parse');
}

// Debug logging helper
const DEBUG = process.env.DEBUG_EVIDENCE === 'true';
function debugLog(label: string, data: any): void {
  if (DEBUG) {
    console.log(`[DEBUG_EVIDENCE][pdf-extract][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

/**
 * Threshold for considering PDF text extraction as "low text" (likely scanned/image).
 * If extracted text is below this threshold, we should fall back to vision.
 */
export const LOW_TEXT_THRESHOLD = 200; // chars

/**
 * Threshold for considering PDF text as metadata-only (very minimal usable content).
 */
export const METADATA_ONLY_THRESHOLD = 50; // chars

/**
 * Patterns that indicate the "text" is actually just metadata, not document content.
 */
const METADATA_PATTERNS = [
  /^(title|author|subject|creator|producer|keywords):/im,
  /^microsoft\s+(word|office)/im,
  /^adobe\s+(acrobat|indesign|pdf)/im,
  /^\s*pdf\s*$/im,
  /^created\s+by/im,
];

export interface PdfExtractionResult {
  /** Extracted text content */
  text: string;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Whether this appears to be a scanned/image PDF with minimal text */
  isLowText: boolean;
  /** Whether the "text" appears to be metadata-only (no real content) */
  isMetadataOnly: boolean;
  /** Extraction method used */
  method: 'pdf_parse' | 'pdf_lib_metadata' | 'failed';
  /** Error message if extraction failed */
  error?: string;
  /** Per-page text if available */
  perPageText?: string[];
}

/**
 * Check if extracted text appears to be metadata-only.
 */
function isMetadataOnlyText(text: string): boolean {
  const trimmed = text.trim();

  // Very short text is likely metadata
  if (trimmed.length < METADATA_ONLY_THRESHOLD) {
    return true;
  }

  // Check if most lines match metadata patterns
  const lines = trimmed.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return true;

  const metadataLines = lines.filter(line =>
    METADATA_PATTERNS.some(pattern => pattern.test(line))
  );

  // If more than 50% of lines are metadata patterns, consider it metadata-only
  return metadataLines.length > lines.length * 0.5;
}

/**
 * Clean extracted text by removing excessive whitespace and control characters.
 */
function cleanExtractedText(text: string): string {
  return text
    // Replace multiple newlines with double newline
    .replace(/\n{3,}/g, '\n\n')
    // Replace multiple spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim();
}

/**
 * Extract text from a PDF buffer using pdf-parse.
 *
 * This is the primary extraction method for digital PDFs.
 * For scanned PDFs, it will return isLowText=true, signaling
 * that vision extraction should be used.
 *
 * @param buffer - PDF file buffer
 * @param maxPages - Maximum pages to extract (default: 10)
 * @returns Extraction result with text and metadata
 */
export async function extractPdfText(
  buffer: Buffer,
  maxPages: number = 10
): Promise<PdfExtractionResult> {
  debugLog('extract_start', { bufferSize: buffer.length, maxPages });

  try {
    const parse = await getPdfParse();

    // pdf-parse options
    const options = {
      // Limit pages for performance
      max: maxPages,
    };

    const data = await parse(buffer, options);

    const rawText = data.text || '';
    const cleanedText = cleanExtractedText(rawText);
    const pageCount = data.numpages || 0;

    debugLog('extract_result', {
      rawLength: rawText.length,
      cleanedLength: cleanedText.length,
      pageCount,
    });

    const isMetadataOnly = isMetadataOnlyText(cleanedText);
    const isLowText = cleanedText.length < LOW_TEXT_THRESHOLD || isMetadataOnly;

    debugLog('text_quality', {
      isMetadataOnly,
      isLowText,
      threshold: LOW_TEXT_THRESHOLD,
    });

    return {
      text: cleanedText,
      pageCount,
      isLowText,
      isMetadataOnly,
      method: 'pdf_parse',
    };
  } catch (error: any) {
    debugLog('extract_error', { error: error.message });
    console.error('[extractPdfText] PDF parsing failed:', error.message);

    return {
      text: '',
      pageCount: 0,
      isLowText: true,
      isMetadataOnly: true,
      method: 'failed',
      error: error.message,
    };
  }
}

/**
 * Extract metadata from PDF using pdf-lib (fast, but no text content).
 * Used as a fallback when pdf-parse fails.
 */
export async function extractPdfMetadata(buffer: Buffer): Promise<{
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  pageCount: number;
}> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    return {
      title: pdfDoc.getTitle() ?? undefined,
      author: pdfDoc.getAuthor() ?? undefined,
      subject: pdfDoc.getSubject() ?? undefined,
      keywords: pdfDoc.getKeywords() ?? undefined,
      pageCount: pdfDoc.getPageCount(),
    };
  } catch (error: any) {
    debugLog('metadata_error', { error: error.message });
    return { pageCount: 0 };
  }
}

/**
 * Analyze extracted text to detect document type markers.
 * Useful for classification when we have text content.
 */
export function analyzeTextForDocumentMarkers(text: string): {
  hasForm6A: boolean;
  hasSection21: boolean;
  hasSection8: boolean;
  hasHousingAct1988: boolean;
  hasWalesRHW: boolean;
  hasScotlandNTL: boolean;
  hasTenancyAgreement: boolean;
  hasDatePatterns: boolean;
  hasAddressPatterns: boolean;
  markers: string[];
} {
  const lower = text.toLowerCase();

  const hasForm6A = /form\s*6a/i.test(text);
  const hasSection21 = /section\s*21|s\.?\s*21\b|\bs21\b/i.test(text);
  const hasSection8 = /section\s*8|s\.?\s*8\b|\bs8\b/i.test(text);
  const hasHousingAct1988 = /housing\s*act\s*1988/i.test(text);
  const hasWalesRHW = /rhw\s*\d{1,2}|renting\s*homes\s*\(?wales\)?/i.test(text);
  const hasScotlandNTL = /notice\s*to\s*leave|private\s*residential\s*tenancy/i.test(text);
  const hasTenancyAgreement = /tenancy\s*agreement|assured\s*shorthold|occupation\s*contract/i.test(text);
  const hasDatePatterns = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/.test(text);
  const hasAddressPatterns = /\b[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b/i.test(text); // UK postcode

  const markers: string[] = [];
  if (hasForm6A) markers.push('form_6a');
  if (hasSection21) markers.push('section_21');
  if (hasSection8) markers.push('section_8');
  if (hasHousingAct1988) markers.push('housing_act_1988');
  if (hasWalesRHW) markers.push('wales_rhw');
  if (hasScotlandNTL) markers.push('scotland_ntl');
  if (hasTenancyAgreement) markers.push('tenancy_agreement');

  return {
    hasForm6A,
    hasSection21,
    hasSection8,
    hasHousingAct1988,
    hasWalesRHW,
    hasScotlandNTL,
    hasTenancyAgreement,
    hasDatePatterns,
    hasAddressPatterns,
    markers,
  };
}
