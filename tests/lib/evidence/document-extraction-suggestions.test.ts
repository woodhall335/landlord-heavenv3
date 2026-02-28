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
    expect(result.schemaVersion).toBe('1.0');
    // Schema validation should still pass
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
  });

  it('handles null document name gracefully', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: null as unknown as string },
    ];

    const result = await safeExtractDocumentSuggestions(docs);
    expect(result.success).toBe(true);
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
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

// =============================================================================
// REGEX EXTRACTION TESTS
// =============================================================================

describe('Document Extraction Suggestions - Regex Extraction', () => {
  describe('UK Postcode Extraction', () => {
    it('extracts UK postcodes from text', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'The property address is 123 High Street, London, SW1A 1AA',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.propertyAddress).toBeDefined();
      expect(result.propertyAddress?.postcode).toBe('SW1A 1AA');
    });

    it('identifies landlord address from context', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Landlord address: 456 Owner Lane, Manchester, M1 2AB',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.claimantAddress).toBeDefined();
      expect(result.claimantAddress?.postcode).toBe('M1 2AB');
    });

    it('identifies tenant address from context', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Tenant current address: 789 Renter Road, Birmingham, B1 3CD',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.defendantAddress).toBeDefined();
      expect(result.defendantAddress?.postcode).toBe('B1 3CD');
    });
  });

  describe('Date Extraction', () => {
    it('extracts dates in DD/MM/YYYY format', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Tenancy start date: 01/06/2023',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.tenancyStartDate).toBeDefined();
      expect(result.tenancyStartDate?.date).toBe('2023-06-01');
    });

    it('extracts dates in ISO YYYY-MM-DD format', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Tenancy commences on 2023-06-01',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.tenancyStartDate).toBeDefined();
      expect(result.tenancyStartDate?.date).toBe('2023-06-01');
    });

    it('extracts written dates like "1st January 2024"', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'The tenancy begins on 1st January 2024',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.tenancyStartDate).toBeDefined();
      expect(result.tenancyStartDate?.date).toBe('2024-01-01');
    });

    it('identifies end date from context', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Tenancy expires on 31/12/2024',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.tenancyEndDate).toBeDefined();
      expect(result.tenancyEndDate?.date).toBe('2024-12-31');
    });
  });

  describe('Monetary Amount Extraction', () => {
    it('extracts GBP amounts from text', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Monthly rent payable: £1,200.00',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.rentAmount).toBeDefined();
      expect(result.rentAmount?.amount).toBe(1200);
      expect(result.rentAmount?.currency).toBe('GBP');
    });

    it('extracts amounts without decimals', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Rent is £850 per month',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.rentAmount?.amount).toBe(850);
    });
  });

  describe('Invoice Number Extraction', () => {
    it('extracts invoice numbers', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'repair-bill.pdf',
          extractedText: 'Invoice No: INV-2024-001\nTotal: £450.00',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
      expect(result.detectedInvoicesQuotes[0].total).toBe(450);
    });

    it('extracts reference numbers', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'document.pdf',
          extractedText: 'Reference: REF-12345',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
    });
  });

  describe('Rent Frequency Detection', () => {
    it('detects monthly frequency', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Rent: £1,200 pcm',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.rentFrequency).toBeDefined();
      expect(result.rentFrequency?.frequency).toBe('monthly');
    });

    it('detects weekly frequency', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Rent payable weekly',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.rentFrequency?.frequency).toBe('weekly');
    });

    it('detects yearly frequency', async () => {
      const docs: DocumentExtractionInput[] = [
        {
          id: '1',
          name: 'tenancy.pdf',
          extractedText: 'Annual rent: £14,400 per annum',
        },
      ];

      const result = await extractDocumentSuggestions(docs);

      expect(result.rentFrequency?.frequency).toBe('yearly');
    });
  });
});

// =============================================================================
// MULTIPLE DOCUMENT HANDLING TESTS
// =============================================================================

describe('Document Extraction Suggestions - Multiple Documents', () => {
  it('processes multiple documents', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: 'tenancy-agreement.pdf', extractedText: 'Property address: SW1A 1AA' },
      { id: '2', name: 'repair-invoice.pdf', extractedText: 'Invoice No: INV-001, Total: £250' },
    ];

    const result = await extractDocumentSuggestions(docs);

    expect(result.metadata.documentsAnalyzed).toBe(2);
    expect(result.propertyAddress).toBeDefined();
    expect(result.detectedInvoicesQuotes.length).toBeGreaterThan(0);
  });

  it('handles conflicting values by preferring higher confidence', async () => {
    const docs: DocumentExtractionInput[] = [
      {
        id: '1',
        name: 'tenancy.pdf',
        extractedText: 'Property address is at SW1A 1AA',
      },
      {
        id: '2',
        name: 'other.pdf',
        extractedText: 'Some location E1 6AN',
      },
    ];

    const result = await extractDocumentSuggestions(docs);

    // First document has "property" context, should be preferred
    expect(result.propertyAddress?.postcode).toBe('SW1A 1AA');
  });

  it('collects invoices from multiple documents', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: 'doc-1.pdf', extractedText: 'Invoice No: INV-001' },
      { id: '2', name: 'doc-2.pdf', extractedText: 'Invoice No: INV-002' },
    ];

    const result = await extractDocumentSuggestions(docs);

    // Should detect at least 2 invoices from the extracted text
    expect(result.detectedInvoicesQuotes.length).toBeGreaterThanOrEqual(2);
    // Verify both invoice numbers are found
    const invoiceIds = result.detectedInvoicesQuotes.map(inv => inv.description);
    expect(invoiceIds.some(d => d.includes('INV-001'))).toBe(true);
    expect(invoiceIds.some(d => d.includes('INV-002'))).toBe(true);
  });

  it('returns empty suggestions when no matches found', async () => {
    const docs: DocumentExtractionInput[] = [
      { id: '1', name: 'photo.jpg', extractedText: 'This is just a photo with no relevant data' },
    ];

    const result = await extractDocumentSuggestions(docs);

    expect(result.success).toBe(true);
    expect(result.propertyAddress).toBeUndefined();
    expect(result.tenancyStartDate).toBeUndefined();
    expect(result.rentAmount).toBeUndefined();
    expect(result.detectedInvoicesQuotes).toHaveLength(0);
  });
});

// =============================================================================
// CONFIDENCE SCORING TESTS
// =============================================================================

describe('Document Extraction Suggestions - Confidence Scoring', () => {
  it('assigns high confidence to property address context', async () => {
    const docs: DocumentExtractionInput[] = [
      {
        id: '1',
        name: 'tenancy.pdf',
        extractedText: 'The premises at property address: 123 High Street SW1A 1AA',
      },
    ];

    const result = await extractDocumentSuggestions(docs);

    expect(result.propertyAddress?.confidence).toBe('high');
  });

  it('boosts confidence for tenancy agreement filenames', async () => {
    const docs: DocumentExtractionInput[] = [
      {
        id: '1',
        name: 'tenancy-agreement.pdf',
        extractedText: 'Start date: 01/01/2024',
      },
    ];

    const result = await extractDocumentSuggestions(docs);

    expect(result.tenancyStartDate?.confidence).toBe('high');
  });

  it('boosts confidence for rent ledger filenames', async () => {
    const docs: DocumentExtractionInput[] = [
      {
        id: '1',
        name: 'rent-ledger.pdf',
        extractedText: 'Monthly rent: £1,000',
      },
    ];

    const result = await extractDocumentSuggestions(docs);

    expect(result.rentAmount?.confidence).toBe('high');
  });
});

// =============================================================================
// SCHEMA VALIDATION ALWAYS PASSES TESTS
// =============================================================================

describe('Document Extraction Suggestions - Schema Always Valid', () => {
  it('safe extraction always returns valid schema for undefined input', async () => {
    const result = await safeExtractDocumentSuggestions(undefined as unknown as DocumentExtractionInput[]);
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
  });

  it('safe extraction always returns valid schema for null input', async () => {
    const result = await safeExtractDocumentSuggestions(null as unknown as DocumentExtractionInput[]);
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
  });

  it('safe extraction always returns valid schema for malformed documents', async () => {
    const docs = [
      { id: undefined, name: undefined },
      { foo: 'bar' },
      null,
    ] as unknown as DocumentExtractionInput[];

    const result = await safeExtractDocumentSuggestions(docs);
    const validation = validateSuggestionsSchema(result);
    expect(validation.valid).toBe(true);
  });

  it('all extracted suggestions pass schema validation', async () => {
    const docs: DocumentExtractionInput[] = [
      {
        id: '1',
        name: 'full-tenancy.pdf',
        extractedText: `
          ASSURED SHORTHOLD TENANCY AGREEMENT

          Property Address: 123 High Street, London SW1A 1AA
          Landlord Address: 456 Owner Lane, Manchester M1 2AB
          Tenant Address: Same as property

          Tenancy Start Date: 1st January 2024
          Tenancy End Date: 31st December 2024

          Monthly Rent: £1,500.00 pcm

          Invoice No: INV-2024-001
          Amount Due: £3,000.00
        `,
      },
    ];

    const result = await extractDocumentSuggestions(docs);
    const validation = validateSuggestionsSchema(result);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
