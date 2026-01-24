import { describe, expect, it } from 'vitest';
import {
  createEmptySuggestions,
  validateSuggestionsSchema,
  extractDocumentSuggestions,
  safeExtractDocumentSuggestions,
  type ExtractionSuggestions,
  type DocumentExtractionInput,
} from '@/lib/evidence/document-extraction-suggestions';

// =============================================================================
// SCHEMA VALIDATION TESTS
// =============================================================================

describe('Document Extraction Suggestions - Schema Validation', () => {
  describe('createEmptySuggestions', () => {
    it('creates valid empty suggestions object', () => {
      const result = createEmptySuggestions();

      expect(result.schemaVersion).toBe('1.0');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.detectedInvoicesQuotes).toEqual([]);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.documentsAnalyzed).toBe(0);
    });

    it('creates failed suggestions with error message', () => {
      const result = createEmptySuggestions('Test error');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });
  });

  describe('validateSuggestionsSchema', () => {
    it('validates correct schema', () => {
      const valid: ExtractionSuggestions = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: {
          documentsAnalyzed: 0,
          processingTimeMs: 100,
          extractionMethods: ['stub'],
        },
      };

      const result = validateSuggestionsSchema(valid);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects null input', () => {
      const result = validateSuggestionsSchema(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Suggestions must be an object');
    });

    it('rejects wrong schemaVersion', () => {
      const invalid = {
        schemaVersion: '2.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 0, extractionMethods: [] },
      };

      const result = validateSuggestionsSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('schemaVersion must be "1.0"');
    });

    it('validates address suggestion format', () => {
      const withAddress = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 0, extractionMethods: [] },
        claimantAddress: {
          line1: '123 Test St',
          postcode: 'E1 1AA',
          confidence: 'high',
          source: 'test.pdf',
        },
      };

      const result = validateSuggestionsSchema(withAddress);
      expect(result.valid).toBe(true);
    });

    it('rejects invalid address confidence', () => {
      const invalid = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 0, extractionMethods: [] },
        claimantAddress: {
          line1: '123 Test St',
          confidence: 'very_high', // Invalid
          source: 'test.pdf',
        },
      };

      const result = validateSuggestionsSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('claimantAddress.confidence'))).toBe(true);
    });

    it('validates detected invoice format', () => {
      const withInvoice = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [
          {
            id: 'inv-1',
            description: 'Repair invoice',
            total: 150.00,
            type: 'invoice',
            confidence: 'medium',
            source: 'invoice.pdf',
          },
        ],
        metadata: { documentsAnalyzed: 1, processingTimeMs: 100, extractionMethods: ['regex'] },
      };

      const result = validateSuggestionsSchema(withInvoice);
      expect(result.valid).toBe(true);
    });

    it('rejects invalid invoice type', () => {
      const invalid = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [
          {
            id: 'inv-1',
            description: 'Test',
            type: 'bill', // Invalid - should be invoice/quote/receipt
            confidence: 'high',
            source: 'test.pdf',
          },
        ],
        metadata: { documentsAnalyzed: 1, processingTimeMs: 0, extractionMethods: [] },
      };

      const result = validateSuggestionsSchema(invalid);
      expect(result.valid).toBe(false);
    });

    it('validates rent amount currency', () => {
      const valid = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 0, extractionMethods: [] },
        rentAmount: {
          amount: 1000,
          currency: 'GBP',
          confidence: 'high',
          source: 'tenancy.pdf',
        },
      };

      const result = validateSuggestionsSchema(valid);
      expect(result.valid).toBe(true);
    });

    it('rejects non-GBP currency', () => {
      const invalid = {
        schemaVersion: '1.0',
        extractedAt: new Date().toISOString(),
        success: true,
        detectedInvoicesQuotes: [],
        metadata: { documentsAnalyzed: 0, processingTimeMs: 0, extractionMethods: [] },
        rentAmount: {
          amount: 1000,
          currency: 'USD', // Invalid
          confidence: 'high',
          source: 'test.pdf',
        },
      };

      const result = validateSuggestionsSchema(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('rentAmount.currency must be GBP');
    });
  });
});

// =============================================================================
// EXTRACTION TESTS
// =============================================================================

describe('Document Extraction Suggestions - Extraction', () => {
  describe('extractDocumentSuggestions', () => {
    it('returns valid suggestions for empty input', async () => {
      const result = await extractDocumentSuggestions([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No documents provided');
    });

    it('returns valid suggestions with document metadata', async () => {
      const docs: DocumentExtractionInput[] = [
        { id: '1', name: 'test.pdf', mimeType: 'application/pdf' },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.success).toBe(true);
      expect(result.schemaVersion).toBe('1.0');
      expect(result.metadata.documentsAnalyzed).toBe(1);
      expect(result.extractedAt).toBeDefined();
    });

    it('detects invoice from filename', async () => {
      const docs: DocumentExtractionInput[] = [
        { id: '1', name: 'repair-invoice-123.pdf', mimeType: 'application/pdf' },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
      expect(result.detectedInvoicesQuotes[0].type).toBe('invoice');
    });

    it('detects quote from filename', async () => {
      const docs: DocumentExtractionInput[] = [
        { id: '1', name: 'cleaning-quote.pdf', mimeType: 'application/pdf' },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
      expect(result.detectedInvoicesQuotes[0].type).toBe('quote');
    });

    it('detects receipt from filename', async () => {
      const docs: DocumentExtractionInput[] = [
        { id: '1', name: 'payment-receipt.pdf', mimeType: 'application/pdf' },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
      expect(result.detectedInvoicesQuotes[0].type).toBe('receipt');
    });
  });

  describe('safeExtractDocumentSuggestions', () => {
    it('returns valid suggestions even on error', async () => {
      const result = await safeExtractDocumentSuggestions([]);

      expect(result).toBeDefined();
      expect(result.schemaVersion).toBe('1.0');
      // Schema validation passes
      const validation = validateSuggestionsSchema(result);
      expect(validation.valid).toBe(true);
    });

    it('always returns schema-valid output', async () => {
      const docs: DocumentExtractionInput[] = [
        { id: '1', name: 'test.pdf' },
      ];

      const result = await safeExtractDocumentSuggestions(docs);

      const validation = validateSuggestionsSchema(result);
      expect(validation.valid).toBe(true);
    });
  });
});

// =============================================================================
// SAFE FAILURE MODE TESTS
// =============================================================================

describe('Document Extraction Suggestions - Safe Failure Modes', () => {
  it('handles undefined document name gracefully', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: undefined as unknown as string },
    ];

    const result = await safeExtractDocumentSuggestions(docs);
    expect(result.success).toBe(true); // Should not crash
  });

  it('handles empty document name gracefully', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: '' },
    ];

    const result = await safeExtractDocumentSuggestions(docs);
    expect(result.success).toBe(true);
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
  });

  it('includes processing time in metadata', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: 'test.pdf' },
    ];

    const result = await extractDocumentSuggestions(docs);
    expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
  });
});
