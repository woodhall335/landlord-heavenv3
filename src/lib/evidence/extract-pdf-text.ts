/**
 * PDF Text Extraction Module
 *
 * Provides real PDF text extraction using pdf-parse (which uses pdf.js under the hood).
 * This works in Node.js server environment (Next.js API routes).
 *
 * Fallback for scanned/image PDFs: marks as LOW_TEXT for vision processing.
 * Fallback for serverless environments: uses unpdf when pdf-parse fails with DOMMatrix errors.
 *
 * IMPORTANT: All PDF parsing operations have hard timeouts to prevent hanging.
 */

// pdf-parse v2 uses a class-based API: PDFParse
// We cache the class reference for performance
let PDFParseClass: any = null;

/** Timeout for PDF module import (5s) */
const IMPORT_TIMEOUT_MS = 5000;
/** Timeout for getText operation (8s) - main parsing */
const PARSE_TIMEOUT_MS = 8000;
/** Timeout for cleanup (1s) - non-critical */
const CLEANUP_TIMEOUT_MS = 1000;

/**
 * Helper to run a promise with timeout, returning a fallback on timeout.
 */
async function withTimeoutFallback<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
  label: string
): Promise<{ result: T; timedOut: boolean }> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<{ result: T; timedOut: boolean }>((resolve) => {
    timeoutId = setTimeout(() => {
      debugLog(`${label}_timeout`, { timeoutMs });
      resolve({ result: fallback, timedOut: true });
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      promise.then((r) => ({ result: r, timedOut: false })),
      timeoutPromise,
    ]);
    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Helper to run a promise with timeout, throwing on timeout.
 */
async function withTimeoutError<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function getPDFParseClass(): Promise<any> {
  if (!PDFParseClass) {
    const importPromise = import('pdf-parse').then((module) => {
      const cls = module.PDFParse;
      if (!cls) {
        throw new Error('PDFParse class not found in pdf-parse module');
      }
      return cls;
    });

    // Timeout on import to prevent hanging if module loading fails
    PDFParseClass = await withTimeoutError(
      importPromise,
      IMPORT_TIMEOUT_MS,
      'PDF module import'
    );
  }
  return PDFParseClass;
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
 * IMPORTANT: This function has multiple timeout guards to prevent hanging:
 * - Module import timeout (5s)
 * - Parse/getText timeout (8s)
 * - Cleanup timeout (1s, non-blocking)
 *
 * @param buffer - PDF file buffer
 * @param maxPages - Maximum pages to extract (default: 10)
 * @returns Extraction result with text and metadata
 */
export async function extractPdfText(
  buffer: Buffer,
  maxPages: number = 10
): Promise<PdfExtractionResult> {
  const startTime = Date.now();
  debugLog('extract_start', { bufferSize: buffer.length, maxPages });
  console.log('[extractPdfText] Starting PDF extraction...', { bufferSize: buffer.length, maxPages });

  let parser: any = null;

  try {
    // Step 1: Import PDF module with timeout
    const PDFParse = await getPDFParseClass();
    const importDuration = Date.now() - startTime;
    debugLog('module_imported', { durationMs: importDuration });

    // Step 2: Create parser instance (synchronous, shouldn't hang)
    parser = new PDFParse({ data: buffer });
    debugLog('parser_created', true);

    // Step 3: Get text content with timeout (this is where hangs typically occur)
    const parseOptions = maxPages < 100
      ? { partial: Array.from({ length: maxPages }, (_, i) => i + 1) }
      : {};

    const parseStartTime = Date.now();
    console.log('[extractPdfText] Calling parser.getText()...');

    const { result, timedOut } = await withTimeoutFallback(
      parser.getText(parseOptions),
      PARSE_TIMEOUT_MS,
      { text: '', numPages: 0, pages: [] },
      'PDF getText'
    );

    const parseDuration = Date.now() - parseStartTime;
    debugLog('getText_complete', { durationMs: parseDuration, timedOut });
    console.log('[extractPdfText] getText complete:', { durationMs: parseDuration, timedOut });

    if (timedOut) {
      console.warn('[extractPdfText] PDF parsing timed out after', PARSE_TIMEOUT_MS, 'ms');
      // Still try to cleanup, but don't wait
      safeCleanupParser(parser);
      return {
        text: '',
        pageCount: 0,
        isLowText: true,
        isMetadataOnly: true,
        method: 'failed',
        error: `PDF parsing timed out after ${PARSE_TIMEOUT_MS}ms`,
      };
    }

    const rawText = result.text || '';
    const cleanedText = cleanExtractedText(rawText);
    const pageCount = result.numPages || result.pages?.length || 0;

    // Step 4: Clean up parser resources (non-blocking with short timeout)
    safeCleanupParser(parser);

    const totalDuration = Date.now() - startTime;
    debugLog('extract_result', {
      rawLength: rawText.length,
      cleanedLength: cleanedText.length,
      pageCount,
      totalDurationMs: totalDuration,
    });
    console.log('[extractPdfText] Extraction complete:', {
      textLength: cleanedText.length,
      pageCount,
      durationMs: totalDuration,
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
    const duration = Date.now() - startTime;
    debugLog('extract_error', { error: error.message, durationMs: duration });
    console.error('[extractPdfText] PDF parsing failed after', duration, 'ms:', error.message);

    // Try to clean up parser if it exists
    if (parser) {
      safeCleanupParser(parser);
    }

    // Check if this is a serverless/DOMMatrix error - try unpdf as fallback
    const isServerlessError = error.message?.includes('DOMMatrix') ||
      error.message?.includes('is not defined') ||
      error.message?.includes('Cannot polyfill');

    if (isServerlessError) {
      console.log('[extractPdfText] Trying unpdf fallback for serverless environment...');
      const unpdfResult = await extractWithUnpdf(buffer, maxPages);
      if (unpdfResult.method !== 'failed') {
        return unpdfResult;
      }
    }

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
 * Extract text from PDF using unpdf library (serverless-friendly fallback).
 * This library is designed to work in serverless environments without DOM dependencies.
 */
async function extractWithUnpdf(
  buffer: Buffer,
  maxPages: number = 10
): Promise<PdfExtractionResult> {
  const startTime = Date.now();
  debugLog('unpdf_start', { bufferSize: buffer.length, maxPages });
  console.log('[extractPdfText] Using unpdf fallback...', { bufferSize: buffer.length, maxPages });

  try {
    const { extractText, getDocumentProxy } = await import('unpdf');

    // Get document info for page count
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const pageCount = pdf.numPages;

    // Extract text from all pages (up to maxPages)
    const pagesToExtract = Math.min(pageCount, maxPages);
    const textParts: string[] = [];

    for (let i = 1; i <= pagesToExtract; i++) {
      try {
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: false });
        if (text && text[i - 1]) {
          textParts.push(text[i - 1]);
        }
        // Only need to call extractText once since it extracts all pages
        break;
      } catch (pageError) {
        debugLog('unpdf_page_error', { page: i, error: (pageError as any).message });
      }
    }

    // If above approach failed, try mergePages mode
    if (textParts.length === 0) {
      try {
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
        if (text) {
          textParts.push(text);
        }
      } catch (mergeError) {
        debugLog('unpdf_merge_error', { error: (mergeError as any).message });
      }
    }

    const rawText = textParts.join('\n\n');
    const cleanedText = cleanExtractedText(rawText);

    const duration = Date.now() - startTime;
    debugLog('unpdf_complete', {
      textLength: cleanedText.length,
      pageCount,
      durationMs: duration,
    });
    console.log('[extractPdfText] unpdf extraction complete:', {
      textLength: cleanedText.length,
      pageCount,
      durationMs: duration,
    });

    const isMetadataOnly = isMetadataOnlyText(cleanedText);
    const isLowText = cleanedText.length < LOW_TEXT_THRESHOLD || isMetadataOnly;

    return {
      text: cleanedText,
      pageCount,
      isLowText,
      isMetadataOnly,
      method: 'pdf_parse', // Report as pdf_parse for compatibility
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    debugLog('unpdf_error', { error: error.message, durationMs: duration });
    console.error('[extractPdfText] unpdf fallback failed after', duration, 'ms:', error.message);

    return {
      text: '',
      pageCount: 0,
      isLowText: true,
      isMetadataOnly: true,
      method: 'failed',
      error: `unpdf fallback failed: ${error.message}`,
    };
  }
}

/**
 * Safely clean up the PDF parser without blocking or throwing.
 * Uses a short timeout and catches all errors.
 */
function safeCleanupParser(parser: any): void {
  if (!parser || typeof parser.destroy !== 'function') {
    return;
  }

  // Fire and forget with timeout - don't await
  Promise.race([
    parser.destroy().catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, CLEANUP_TIMEOUT_MS)),
  ]).catch(() => {
    // Ignore any errors during cleanup
  });
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
