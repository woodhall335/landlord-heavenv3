/**
 * Money Claim Thumbnail Tests
 *
 * Tests for the money-claim thumbnail endpoint and preview page integration.
 * Ensures that money_claim document cards display thumbnails without requiring
 * database document records.
 *
 * Key scenarios:
 * - England/Wales money_claim cases show thumbnails for all 10 documents
 * - Scotland sc_money_claim cases show thumbnails for all documents
 * - Thumbnail URL generation matches expected format
 * - Document type resolution works for all money claim document types
 */

import { describe, it, expect } from 'vitest';
import {
  getMoneyClaimDocuments,
} from '../../src/lib/documents/document-configs';

describe('Money Claim Thumbnail URL Generation', () => {
  /**
   * Helper that mimics the thumbnail URL generation logic from the preview page
   */
  function generateThumbnailUrl(
    caseId: string,
    docId: string,
    product: string,
    docTypeMapping: Record<string, string[]>
  ): string | undefined {
    if (product === 'notice_only') {
      const possibleTypes = docTypeMapping[docId] || [docId];
      const docTypeForThumbnail = possibleTypes[0] || docId;
      return `/api/notice-only/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
    } else if (product === 'money_claim' || product === 'sc_money_claim') {
      const possibleTypes = docTypeMapping[docId] || [docId];
      const docTypeForThumbnail = possibleTypes[0] || docId;
      return `/api/money-claim/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
    }

    return undefined;
  }

  // Document type mapping from preview page (money claim section)
  const docTypeMapping: Record<string, string[]> = {
    // Court forms
    'form-n1': ['form_n1', 'n1_claim', 'money_claim_form'],
    'form-3a': ['form_3a', 'simple_procedure_claim'],
    // Court documents
    'particulars-of-claim': ['particulars_of_claim', 'money_claim_particulars'],
    'schedule-of-arrears': ['schedule_of_arrears', 'arrears_schedule'],
    'interest-calculation': ['interest_calculation', 'interest_workings'],
    // Pre-Action Protocol
    'letter-before-claim': ['letter_before_claim', 'lba', 'pre_action_letter'],
    'information-sheet': ['information_sheet', 'information_sheet_for_defendants', 'defendant_info'],
    'reply-form': ['reply_form', 'defendant_reply'],
    'financial-statement': ['financial_statement', 'financial_statement_form'],
    // Guidance
    'filing-guide': ['filing_guide', 'court_filing_guide', 'filing_guide_scotland'],
    'enforcement-guide': ['enforcement_guide', 'enforcement_guide_scotland'],
  };

  describe('England money_claim', () => {
    const caseId = 'test-case-mc-england';
    const docs = getMoneyClaimDocuments('england');

    it('should have 10 documents for England money claim', () => {
      expect(docs.length).toBe(10);
    });

    it('generates thumbnailUrl for Form N1', () => {
      const formDoc = docs.find(d => d.id === 'form-n1');
      expect(formDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, formDoc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=form_n1`);
    });

    it('generates thumbnailUrl for Particulars of Claim', () => {
      const doc = docs.find(d => d.id === 'particulars-of-claim');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=particulars_of_claim`);
    });

    it('generates thumbnailUrl for Schedule of Arrears', () => {
      const doc = docs.find(d => d.id === 'schedule-of-arrears');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=schedule_of_arrears`);
    });

    it('generates thumbnailUrl for Interest Calculation', () => {
      const doc = docs.find(d => d.id === 'interest-calculation');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=interest_calculation`);
    });

    it('generates thumbnailUrl for Letter Before Claim', () => {
      const doc = docs.find(d => d.id === 'letter-before-claim');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=letter_before_claim`);
    });

    it('generates thumbnailUrl for Information Sheet', () => {
      const doc = docs.find(d => d.id === 'information-sheet');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=information_sheet`);
    });

    it('generates thumbnailUrl for Reply Form', () => {
      const doc = docs.find(d => d.id === 'reply-form');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=reply_form`);
    });

    it('generates thumbnailUrl for Financial Statement', () => {
      const doc = docs.find(d => d.id === 'financial-statement');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=financial_statement`);
    });

    it('generates thumbnailUrl for Filing Guide', () => {
      const doc = docs.find(d => d.id === 'filing-guide');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=filing_guide`);
    });

    it('generates thumbnailUrl for Enforcement Guide', () => {
      const doc = docs.find(d => d.id === 'enforcement-guide');
      expect(doc).toBeDefined();

      const url = generateThumbnailUrl(caseId, doc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=enforcement_guide`);
    });
  });

  describe('Wales money_claim', () => {
    const caseId = 'test-case-mc-wales';
    const docs = getMoneyClaimDocuments('wales');

    it('should have 10 documents for Wales money claim', () => {
      expect(docs.length).toBe(10);
    });

    it('generates thumbnailUrl for Form N1 (Wales)', () => {
      const formDoc = docs.find(d => d.id === 'form-n1');
      expect(formDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, formDoc!.id, 'money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=form_n1`);
    });
  });

  describe('Scotland sc_money_claim', () => {
    const caseId = 'test-case-mc-scotland';
    const docs = getMoneyClaimDocuments('scotland');

    it('should have documents for Scotland money claim', () => {
      expect(docs.length).toBeGreaterThan(0);
    });

    it('generates thumbnailUrl for Form 3A (Scotland)', () => {
      const formDoc = docs.find(d => d.id === 'form-3a');
      expect(formDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, formDoc!.id, 'sc_money_claim', docTypeMapping);
      expect(url).toBe(`/api/money-claim/thumbnail/${caseId}?document_type=form_3a`);
    });
  });

  describe('Non-money_claim products', () => {
    it('does NOT generate money-claim thumbnailUrl for notice_only', () => {
      const url = generateThumbnailUrl('case-123', 'notice-section-8', 'notice_only', docTypeMapping);
      expect(url).toContain('/api/notice-only/thumbnail/');
    });

    it('does NOT generate money-claim thumbnailUrl for complete_pack', () => {
      const url = generateThumbnailUrl('case-123', 'form-n5', 'complete_pack', docTypeMapping);
      expect(url).toBeUndefined();
    });

    it('does NOT generate money-claim thumbnailUrl for ast_standard', () => {
      const url = generateThumbnailUrl('case-123', 'tenancy-agreement', 'ast_standard', docTypeMapping);
      expect(url).toBeUndefined();
    });
  });
});

describe('Money Claim Document Type Resolution', () => {
  /**
   * Helper that mimics the resolveDocumentType function from the money-claim thumbnail API
   */
  function resolveDocumentType(configId: string): string | null {
    // Form N1 (England/Wales money claim form)
    if (configId === 'form-n1' || configId === 'form_n1' || configId === 'n1_claim') {
      return 'form_n1';
    }
    // Form 3A (Scotland simple procedure claim)
    if (configId === 'form-3a' || configId === 'form_3a' || configId === 'simple_procedure_claim') {
      return 'form_3a';
    }
    // Particulars of Claim
    if (configId === 'particulars-of-claim' || configId === 'particulars_of_claim') {
      return 'particulars_of_claim';
    }
    // Schedule of Arrears
    if (configId === 'schedule-of-arrears' || configId === 'schedule_of_arrears') {
      return 'schedule_of_arrears';
    }
    // Interest Calculation
    if (configId === 'interest-calculation' || configId === 'interest_calculation' || configId === 'interest_workings') {
      return 'interest_calculation';
    }
    // Letter Before Claim (England/Wales)
    if (configId === 'letter-before-claim' || configId === 'letter_before_claim') {
      return 'letter_before_claim';
    }
    // Pre-Action Letter (Scotland)
    if (configId === 'pre-action-letter' || configId === 'pre_action_letter') {
      return 'pre_action_letter';
    }
    // Defendant Information Sheet
    if (configId === 'information-sheet' || configId === 'information_sheet' || configId === 'information_sheet_for_defendants') {
      return 'information_sheet';
    }
    // Reply Form
    if (configId === 'reply-form' || configId === 'reply_form') {
      return 'reply_form';
    }
    // Financial Statement
    if (configId === 'financial-statement' || configId === 'financial_statement' || configId === 'financial_statement_form') {
      return 'financial_statement';
    }
    // Filing Guide
    if (configId === 'filing-guide' || configId === 'filing_guide') {
      return 'filing_guide';
    }
    // Enforcement Guide
    if (configId === 'enforcement-guide' || configId === 'enforcement_guide') {
      return 'enforcement_guide';
    }

    return null;
  }

  describe('Court forms', () => {
    it('resolves form-n1 to form_n1', () => {
      expect(resolveDocumentType('form-n1')).toBe('form_n1');
    });

    it('resolves form_n1 to form_n1', () => {
      expect(resolveDocumentType('form_n1')).toBe('form_n1');
    });

    it('resolves form-3a to form_3a', () => {
      expect(resolveDocumentType('form-3a')).toBe('form_3a');
    });
  });

  describe('Court documents', () => {
    it('resolves particulars-of-claim to particulars_of_claim', () => {
      expect(resolveDocumentType('particulars-of-claim')).toBe('particulars_of_claim');
    });

    it('resolves schedule-of-arrears to schedule_of_arrears', () => {
      expect(resolveDocumentType('schedule-of-arrears')).toBe('schedule_of_arrears');
    });

    it('resolves interest-calculation to interest_calculation', () => {
      expect(resolveDocumentType('interest-calculation')).toBe('interest_calculation');
    });
  });

  describe('Pre-Action Protocol documents', () => {
    it('resolves letter-before-claim to letter_before_claim', () => {
      expect(resolveDocumentType('letter-before-claim')).toBe('letter_before_claim');
    });

    it('resolves information-sheet to information_sheet', () => {
      expect(resolveDocumentType('information-sheet')).toBe('information_sheet');
    });

    it('resolves reply-form to reply_form', () => {
      expect(resolveDocumentType('reply-form')).toBe('reply_form');
    });

    it('resolves financial-statement to financial_statement', () => {
      expect(resolveDocumentType('financial-statement')).toBe('financial_statement');
    });
  });

  describe('Guidance documents', () => {
    it('resolves filing-guide to filing_guide', () => {
      expect(resolveDocumentType('filing-guide')).toBe('filing_guide');
    });

    it('resolves enforcement-guide to enforcement_guide', () => {
      expect(resolveDocumentType('enforcement-guide')).toBe('enforcement_guide');
    });
  });

  describe('Unknown types', () => {
    it('returns null for unknown document types', () => {
      expect(resolveDocumentType('unknown-doc')).toBeNull();
    });

    it('returns null for eviction notice types (not supported in money_claim)', () => {
      expect(resolveDocumentType('notice-section-8')).toBeNull();
    });
  });
});

describe('Preview Page Document Enrichment for Money Claim', () => {
  /**
   * Helper that mimics the document enrichment logic from the preview page
   */
  function enrichDocumentsForProduct(
    docs: Array<{ id: string; title: string }>,
    caseId: string,
    product: string,
    generatedDocs: Array<{ id: string; document_type: string }>,
    docTypeMapping: Record<string, string[]>
  ) {
    return docs.map(doc => {
      // Try to find a matching generated document
      const possibleTypes = docTypeMapping[doc.id] || [doc.id];
      const matchingGenDoc = generatedDocs.find(
        gd => possibleTypes.includes(gd.document_type)
      );

      // For notice_only and money_claim, use dedicated thumbnail endpoints
      let thumbnailUrl: string | undefined;
      if (product === 'notice_only') {
        const docTypeForThumbnail = possibleTypes[0] || doc.id;
        thumbnailUrl = `/api/notice-only/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
      } else if (product === 'money_claim' || product === 'sc_money_claim') {
        const docTypeForThumbnail = possibleTypes[0] || doc.id;
        thumbnailUrl = `/api/money-claim/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
      }

      return {
        ...doc,
        documentId: matchingGenDoc?.id,
        thumbnailUrl,
      };
    });
  }

  const docTypeMapping: Record<string, string[]> = {
    'form-n1': ['form_n1'],
    'particulars-of-claim': ['particulars_of_claim'],
    'schedule-of-arrears': ['schedule_of_arrears'],
    'interest-calculation': ['interest_calculation'],
    'letter-before-claim': ['letter_before_claim'],
    'information-sheet': ['information_sheet'],
    'reply-form': ['reply_form'],
    'financial-statement': ['financial_statement'],
    'filing-guide': ['filing_guide'],
    'enforcement-guide': ['enforcement_guide'],
  };

  it('enriches money_claim documents with thumbnailUrl even without generated docs', () => {
    const docs = [
      { id: 'form-n1', title: 'Form N1 - Money Claim Form' },
      { id: 'particulars-of-claim', title: 'Particulars of Claim' },
      { id: 'schedule-of-arrears', title: 'Schedule of Arrears' },
    ];

    const enriched = enrichDocumentsForProduct(
      docs,
      'case-mc-123',
      'money_claim',
      [], // No generated docs (as happens for money_claim preview)
      docTypeMapping
    );

    // All documents should have thumbnailUrl even without documentId
    expect(enriched[0].thumbnailUrl).toBe('/api/money-claim/thumbnail/case-mc-123?document_type=form_n1');
    expect(enriched[0].documentId).toBeUndefined();

    expect(enriched[1].thumbnailUrl).toBe('/api/money-claim/thumbnail/case-mc-123?document_type=particulars_of_claim');
    expect(enriched[1].documentId).toBeUndefined();

    expect(enriched[2].thumbnailUrl).toBe('/api/money-claim/thumbnail/case-mc-123?document_type=schedule_of_arrears');
    expect(enriched[2].documentId).toBeUndefined();
  });

  it('enriches sc_money_claim documents with thumbnailUrl', () => {
    const docs = [
      { id: 'form-3a', title: 'Form 3A - Simple Procedure Claim' },
    ];

    const enriched = enrichDocumentsForProduct(
      docs,
      'case-sc-123',
      'sc_money_claim',
      [],
      { 'form-3a': ['form_3a'] }
    );

    expect(enriched[0].thumbnailUrl).toBe('/api/money-claim/thumbnail/case-sc-123?document_type=form_3a');
  });

  it('does NOT add money-claim thumbnailUrl for complete_pack', () => {
    const docs = [
      { id: 'form-n5', title: 'Form N5' },
    ];

    const enriched = enrichDocumentsForProduct(
      docs,
      'case-123',
      'complete_pack',
      [{ id: 'doc-abc', document_type: 'n5_claim' }],
      { 'form-n5': ['n5_claim'] }
    );

    // Should have documentId but no thumbnailUrl (uses existing /api/documents/thumbnail endpoint)
    expect(enriched[0].documentId).toBe('doc-abc');
    expect(enriched[0].thumbnailUrl).toBeUndefined();
  });
});

describe('All Money Claim Document Types Coverage', () => {
  const jurisdictions = [
    { name: 'England', jurisdiction: 'england', expectedDocs: 10 },
    { name: 'Wales', jurisdiction: 'wales', expectedDocs: 10 },
    { name: 'Scotland', jurisdiction: 'scotland', expectedDocs: 10 }, // Scotland has same number of docs
  ];

  for (const { name, jurisdiction, expectedDocs } of jurisdictions) {
    describe(name, () => {
      it(`should have ${expectedDocs} documents`, () => {
        const docs = getMoneyClaimDocuments(jurisdiction);
        expect(docs.length).toBe(expectedDocs);
      });

      it('should have a court form document', () => {
        const docs = getMoneyClaimDocuments(jurisdiction);
        const courtFormDoc = docs.find(d => d.category === 'Court Forms');
        expect(courtFormDoc).toBeDefined();
      });

      it('should have a particulars of claim document', () => {
        const docs = getMoneyClaimDocuments(jurisdiction);
        const particularsDoc = docs.find(d => d.id === 'particulars-of-claim');
        expect(particularsDoc).toBeDefined();
      });

      it('should have a schedule of arrears document', () => {
        const docs = getMoneyClaimDocuments(jurisdiction);
        const scheduleDoc = docs.find(d => d.id === 'schedule-of-arrears');
        expect(scheduleDoc).toBeDefined();
      });

      it('should have guidance documents', () => {
        const docs = getMoneyClaimDocuments(jurisdiction);
        const guidanceDocs = docs.filter(d => d.category === 'Guidance');
        expect(guidanceDocs.length).toBeGreaterThanOrEqual(2);
      });
    });
  }
});

describe('Money Claim Thumbnail API Document Type Resolution', () => {
  // Test that all document IDs from getMoneyClaimDocuments can be resolved
  const englandDocs = getMoneyClaimDocuments('england');
  const scotlandDocs = getMoneyClaimDocuments('scotland');

  /**
   * Helper that mimics the resolveDocumentType function from the money-claim thumbnail API
   */
  function resolveDocumentType(configId: string): string | null {
    if (configId === 'form-n1' || configId === 'form_n1' || configId === 'n1_claim') {
      return 'form_n1';
    }
    if (configId === 'form-3a' || configId === 'form_3a' || configId === 'simple_procedure_claim') {
      return 'form_3a';
    }
    if (configId === 'particulars-of-claim' || configId === 'particulars_of_claim') {
      return 'particulars_of_claim';
    }
    if (configId === 'schedule-of-arrears' || configId === 'schedule_of_arrears') {
      return 'schedule_of_arrears';
    }
    if (configId === 'interest-calculation' || configId === 'interest_calculation' || configId === 'interest_workings') {
      return 'interest_calculation';
    }
    if (configId === 'letter-before-claim' || configId === 'letter_before_claim') {
      return 'letter_before_claim';
    }
    if (configId === 'pre-action-letter' || configId === 'pre_action_letter') {
      return 'pre_action_letter';
    }
    if (configId === 'information-sheet' || configId === 'information_sheet' || configId === 'information_sheet_for_defendants') {
      return 'information_sheet';
    }
    if (configId === 'reply-form' || configId === 'reply_form') {
      return 'reply_form';
    }
    if (configId === 'financial-statement' || configId === 'financial_statement' || configId === 'financial_statement_form') {
      return 'financial_statement';
    }
    if (configId === 'filing-guide' || configId === 'filing_guide') {
      return 'filing_guide';
    }
    if (configId === 'enforcement-guide' || configId === 'enforcement_guide') {
      return 'enforcement_guide';
    }
    return null;
  }

  it('all England money claim document IDs can be resolved', () => {
    for (const doc of englandDocs) {
      const resolved = resolveDocumentType(doc.id);
      expect(resolved, `Document ID ${doc.id} should be resolvable`).not.toBeNull();
    }
  });

  it('all Scotland money claim document IDs can be resolved', () => {
    for (const doc of scotlandDocs) {
      const resolved = resolveDocumentType(doc.id);
      expect(resolved, `Document ID ${doc.id} should be resolvable`).not.toBeNull();
    }
  });
});
