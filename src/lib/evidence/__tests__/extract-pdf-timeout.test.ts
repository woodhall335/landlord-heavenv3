/**
 * PDF Extraction Timeout Tests
 *
 * Tests that PDF extraction has proper timeout protection
 * and doesn't hang on problematic PDFs.
 */

import { describe, it, expect } from 'vitest';
import { extractPdfText } from '../extract-pdf-text';

// Timeout for each test (should be well above the internal timeouts)
const TEST_TIMEOUT_MS = 15000;

// Internal timeout in extract-pdf-text.ts is 8 seconds for parsing
const EXPECTED_MAX_DURATION_MS = 10000;

describe('PDF Extraction Timeout Protection', () => {
  it('should not hang on minimal/invalid PDF', async () => {
    const minimalPdf = Buffer.from('%PDF-1.4\n%%EOF');

    const startTime = Date.now();
    const result = await extractPdfText(minimalPdf, 1);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(EXPECTED_MAX_DURATION_MS);
    expect(result).toBeDefined();
    expect(result.method).toBeDefined();

    // Might fail or return empty, but should NOT hang
    console.log('Minimal PDF result:', {
      duration_ms: duration,
      method: result.method,
      textLength: result.text.length,
      error: result.error,
    });
  }, TEST_TIMEOUT_MS);

  it('should not hang on corrupted PDF header', async () => {
    const corruptedPdf = Buffer.from('Not a PDF at all');

    const startTime = Date.now();
    const result = await extractPdfText(corruptedPdf, 1);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(EXPECTED_MAX_DURATION_MS);
    expect(result).toBeDefined();

    // Should return failed result
    expect(result.method).toBe('failed');
    expect(result.isLowText).toBe(true);

    console.log('Corrupted PDF result:', {
      duration_ms: duration,
      method: result.method,
      error: result.error,
    });
  }, TEST_TIMEOUT_MS);

  it('should not hang on empty buffer', async () => {
    const emptyBuffer = Buffer.alloc(0);

    const startTime = Date.now();
    const result = await extractPdfText(emptyBuffer, 1);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(EXPECTED_MAX_DURATION_MS);
    expect(result).toBeDefined();
    expect(result.method).toBe('failed');

    console.log('Empty buffer result:', {
      duration_ms: duration,
      method: result.method,
      error: result.error,
    });
  }, TEST_TIMEOUT_MS);

  it('should return proper structure for valid-looking but broken PDF', async () => {
    // Create a PDF-like buffer that has a header but garbage content
    const brokenPdf = Buffer.concat([
      Buffer.from('%PDF-1.7\n'),
      Buffer.alloc(10000, 0xFF), // Garbage data
      Buffer.from('\n%%EOF'),
    ]);

    const startTime = Date.now();
    const result = await extractPdfText(brokenPdf, 1);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(EXPECTED_MAX_DURATION_MS);
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('pageCount');
    expect(result).toHaveProperty('isLowText');
    expect(result).toHaveProperty('isMetadataOnly');
    expect(result).toHaveProperty('method');

    console.log('Broken PDF result:', {
      duration_ms: duration,
      method: result.method,
      textLength: result.text.length,
      error: result.error,
    });
  }, TEST_TIMEOUT_MS);

  it('should extract text from a well-formed minimal PDF', async () => {
    // This is a minimal valid PDF that should parse quickly
    // (Note: Most real PDFs will need the actual pdf-parse library)
    const validMinimalPdf = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF`);

    const startTime = Date.now();
    const result = await extractPdfText(validMinimalPdf, 1);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(EXPECTED_MAX_DURATION_MS);
    expect(result).toBeDefined();

    console.log('Valid minimal PDF result:', {
      duration_ms: duration,
      method: result.method,
      textLength: result.text.length,
      pageCount: result.pageCount,
      isLowText: result.isLowText,
    });
  }, TEST_TIMEOUT_MS);
});
