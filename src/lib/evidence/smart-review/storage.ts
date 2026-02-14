/**
 * Smart Review Storage Module
 *
 * Handles fetching documents from Supabase storage for Smart Review processing.
 * Provides utilities for:
 * - Fetching document content from storage
 * - Extracting text from PDFs
 * - Converting documents to base64 for Vision API
 *
 * @module src/lib/evidence/smart-review/storage
 */

import { createAdminClient } from '@/lib/supabase/server';
import { extractPdfText, type PdfExtractionResult } from '../extract-pdf-text';
import { EvidenceUploadItem, isPdfMimeType, isImageMimeType } from '../schema';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Default signed URL expiry time (5 minutes).
 * Smart Review processing should complete within this time.
 */
const SIGNED_URL_EXPIRY_SECONDS = 300;

/**
 * Maximum pages to extract text from.
 */
const MAX_PDF_PAGES = 10;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of fetching document content from storage.
 */
export interface DocumentFetchResult {
  /** Whether the fetch was successful */
  success: boolean;
  /** Document buffer (null if failed) */
  buffer: Buffer | null;
  /** Error message if failed */
  error?: string;
  /** Time taken in milliseconds */
  fetchTimeMs: number;
}

/**
 * Result of extracting text from a PDF document.
 */
export interface PdfTextResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted text (empty string if failed) */
  text: string;
  /** Whether the PDF has low text content (scanned/image-based) */
  isLowText: boolean;
  /** Whether the text appears to be metadata only */
  isMetadataOnly: boolean;
  /** Number of pages in the PDF */
  pageCount: number;
  /** Error message if failed */
  error?: string;
  /** Time taken in milliseconds */
  extractTimeMs: number;
}

/**
 * Result of converting a document to base64.
 */
export interface Base64ConversionResult {
  /** Whether conversion was successful */
  success: boolean;
  /** Base64-encoded document (empty string if failed) */
  base64: string;
  /** MIME type of the document */
  mimeType: string;
  /** Error message if failed */
  error?: string;
  /** Time taken in milliseconds */
  conversionTimeMs: number;
}

// =============================================================================
// Document Fetching
// =============================================================================

/**
 * Fetch a document from Supabase storage.
 *
 * @param storageKey - Storage path for the document
 * @param bucket - Storage bucket name (default: 'documents')
 * @returns Fetch result with buffer
 */
export async function fetchDocumentFromStorage(
  storageKey: string,
  bucket: string = 'documents'
): Promise<DocumentFetchResult> {
  const startTime = Date.now();

  if (!storageKey) {
    return {
      success: false,
      buffer: null,
      error: 'Storage key is required',
      fetchTimeMs: Date.now() - startTime,
    };
  }

  try {
    const supabase = createAdminClient();

    // Create a signed URL for the document
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return {
        success: false,
        buffer: null,
        error: `Failed to create signed URL: ${signedUrlError?.message || 'Unknown error'}`,
        fetchTimeMs: Date.now() - startTime,
      };
    }

    // Fetch the document content
    const response = await fetch(signedUrlData.signedUrl);

    if (!response.ok) {
      return {
        success: false,
        buffer: null,
        error: `Failed to fetch document: HTTP ${response.status}`,
        fetchTimeMs: Date.now() - startTime,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      buffer,
      fetchTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[SmartReview/Storage] Fetch failed:', error.message);
    return {
      success: false,
      buffer: null,
      error: error.message,
      fetchTimeMs: Date.now() - startTime,
    };
  }
}

// =============================================================================
// PDF Text Extraction
// =============================================================================

/**
 * Fetch a PDF from storage and extract its text content.
 *
 * @param storageKey - Storage path for the PDF
 * @param bucket - Storage bucket name (default: 'documents')
 * @returns Text extraction result
 */
export async function fetchPdfText(
  storageKey: string,
  bucket: string = 'documents'
): Promise<PdfTextResult> {
  const startTime = Date.now();

  // First, fetch the document
  const fetchResult = await fetchDocumentFromStorage(storageKey, bucket);

  if (!fetchResult.success || !fetchResult.buffer) {
    return {
      success: false,
      text: '',
      isLowText: true,
      isMetadataOnly: true,
      pageCount: 0,
      error: fetchResult.error || 'Failed to fetch document',
      extractTimeMs: Date.now() - startTime,
    };
  }

  try {
    // Extract text from the PDF
    const extractResult: PdfExtractionResult = await extractPdfText(
      fetchResult.buffer,
      MAX_PDF_PAGES
    );

    return {
      success: extractResult.method !== 'failed',
      text: extractResult.text,
      isLowText: extractResult.isLowText,
      isMetadataOnly: extractResult.isMetadataOnly,
      pageCount: extractResult.pageCount,
      error: extractResult.error,
      extractTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[SmartReview/Storage] PDF text extraction failed:', error.message);
    return {
      success: false,
      text: '',
      isLowText: true,
      isMetadataOnly: true,
      pageCount: 0,
      error: error.message,
      extractTimeMs: Date.now() - startTime,
    };
  }
}

// =============================================================================
// Base64 Conversion
// =============================================================================

/**
 * Fetch a document from storage and convert it to base64.
 *
 * @param storageKey - Storage path for the document
 * @param mimeType - MIME type of the document
 * @param bucket - Storage bucket name (default: 'documents')
 * @returns Base64 conversion result
 */
export async function fetchDocumentAsBase64(
  storageKey: string,
  mimeType: string,
  bucket: string = 'documents'
): Promise<Base64ConversionResult> {
  const startTime = Date.now();

  // Fetch the document
  const fetchResult = await fetchDocumentFromStorage(storageKey, bucket);

  if (!fetchResult.success || !fetchResult.buffer) {
    return {
      success: false,
      base64: '',
      mimeType,
      error: fetchResult.error || 'Failed to fetch document',
      conversionTimeMs: Date.now() - startTime,
    };
  }

  try {
    // Convert buffer to base64
    const base64 = fetchResult.buffer.toString('base64');

    return {
      success: true,
      base64,
      mimeType,
      conversionTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[SmartReview/Storage] Base64 conversion failed:', error.message);
    return {
      success: false,
      base64: '',
      mimeType,
      error: error.message,
      conversionTimeMs: Date.now() - startTime,
    };
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Fetch and prepare a document for Smart Review processing.
 * Automatically selects the appropriate extraction method based on MIME type.
 *
 * For PDFs: Extracts text content
 * For Images: Converts to base64
 *
 * @param upload - Evidence upload item
 * @param bucket - Storage bucket name (default: 'documents')
 * @returns Processing result with either text or base64
 */
export async function prepareDocumentForSmartReview(
  upload: EvidenceUploadItem,
  bucket: string = 'documents'
): Promise<{
  success: boolean;
  text?: string;
  base64?: string;
  isLowText?: boolean;
  needsVision: boolean;
  error?: string;
}> {
  const { storageKey, mimeType } = upload;

  if (!storageKey) {
    return {
      success: false,
      needsVision: false,
      error: 'Upload has no storage key',
    };
  }

  // For PDFs: try text extraction first
  if (isPdfMimeType(mimeType)) {
    const textResult = await fetchPdfText(storageKey, bucket);

    // If we got good text, use it
    if (textResult.success && textResult.text && !textResult.isLowText) {
      return {
        success: true,
        text: textResult.text,
        isLowText: false,
        needsVision: false,
      };
    }

    // If text extraction failed or returned low text, we need vision
    // Fetch the document as base64 for vision processing
    const base64Result = await fetchDocumentAsBase64(storageKey, mimeType, bucket);

    if (!base64Result.success) {
      return {
        success: false,
        needsVision: true,
        error: base64Result.error || 'Failed to prepare document for vision',
      };
    }

    return {
      success: true,
      text: textResult.text || undefined, // Include any text we did get
      base64: base64Result.base64,
      isLowText: true,
      needsVision: true,
    };
  }

  // For images: convert to base64 directly
  if (isImageMimeType(mimeType)) {
    const base64Result = await fetchDocumentAsBase64(storageKey, mimeType, bucket);

    if (!base64Result.success) {
      return {
        success: false,
        needsVision: true,
        error: base64Result.error || 'Failed to convert image to base64',
      };
    }

    return {
      success: true,
      base64: base64Result.base64,
      needsVision: true,
    };
  }

  // Unsupported MIME type
  return {
    success: false,
    needsVision: false,
    error: `Unsupported MIME type: ${mimeType}`,
  };
}

/**
 * Render PDF pages to base64 images for Vision API.
 * Uses puppeteer with pdf.js to render pages.
 *
 * @param storageKey - Storage path for the PDF
 * @param maxPages - Maximum pages to render (default: 3)
 * @param bucket - Storage bucket name (default: 'documents')
 * @returns Array of base64-encoded page images (data URLs)
 */
export async function renderPdfPagesToBase64(
  storageKey: string,
  maxPages: number = 3,
  bucket: string = 'documents'
): Promise<{ success: boolean; pages: string[]; error?: string }> {
  // Fetch the PDF first
  const fetchResult = await fetchDocumentFromStorage(storageKey, bucket);

  if (!fetchResult.success || !fetchResult.buffer) {
    return {
      success: false,
      pages: [],
      error: fetchResult.error || 'Failed to fetch PDF',
    };
  }

  try {
    // Dynamic import puppeteer
    let puppeteer;
    try {
      puppeteer = await import('puppeteer');
    } catch {
      console.warn('[SmartReview/Storage] Puppeteer not available for PDF rendering');
      return {
        success: false,
        pages: [],
        error: 'Puppeteer not available for PDF rendering',
      };
    }

    const browser = await puppeteer.default.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      const base64Pdf = fetchResult.buffer.toString('base64');

      const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>body{margin:0;padding:0}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <canvas id="page"></canvas>
  <script>
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      window.renderError = 'PDF.js library failed to load';
      window.renderPages = async () => [];
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      window.renderPages = async function renderPages() {
        try {
          const pdfData = atob('${base64Pdf}');
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          const pdf = await loadingTask.promise;
          const max = Math.min(pdf.numPages, ${maxPages});
          const results = [];
          for (let i = 1; i <= max; i++) {
            const pdfPage = await pdf.getPage(i);
            const viewport = pdfPage.getViewport({ scale: 1.4 });
            const canvas = document.getElementById('page');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await pdfPage.render({ canvasContext: context, viewport }).promise;
            results.push(canvas.toDataURL('image/png'));
          }
          return results;
        } catch (err) {
          window.renderError = err.message;
          return [];
        }
      };
    }
  </script>
</body>
</html>`;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      const dataUrls = await page.evaluate(async () => {
        // @ts-expect-error -- renderError/renderPages are attached in injected browser script
        if ((window as any).renderError) {
          throw new Error((window as any).renderError);
        }
        return await (window as any).renderPages();
      });

      return {
        success: true,
        pages: Array.isArray(dataUrls) ? dataUrls : [],
      };
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error('[SmartReview/Storage] PDF rendering failed:', error.message);
    return {
      success: false,
      pages: [],
      error: error.message,
    };
  }
}
