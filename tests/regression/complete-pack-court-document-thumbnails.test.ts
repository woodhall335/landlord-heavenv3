/**
 * Regression Test: Complete Pack Court Document Thumbnails
 *
 * Ensures that court documents (N5, N119, N5B, proof_of_service) in complete_pack
 * correctly resolve documentId for thumbnail generation on the preview page.
 *
 * Root cause of bug: document-configs.ts and getDocumentTypesForProduct() were
 * generating N5+N119 for ALL routes, but Section 21 should only have N5B.
 * The docTypeMapping was correct but documents weren't being generated for the
 * right routes, causing missing thumbnails.
 *
 * Fix:
 * 1. Updated document-configs.ts to show route-specific court forms
 * 2. Updated getDocumentTypesForProduct() to generate route-specific court forms
 * 3. Added additional document_type aliases to docTypeMapping for robustness
 */

import { describe, it, expect } from 'vitest';
import { getCompletePackDocuments } from '@/lib/documents/document-configs';
import { getPackContents } from '@/lib/products/pack-contents';

// Mock the docTypeMapping from preview page
const docTypeMapping: Record<string, string[]> = {
  'form-n5': ['n5_claim', 'form_n5', 'n5_possession_claim'],
  'form-n119': ['n119_particulars', 'form_n119', 'n119_particulars_of_claim'],
  'form-n5b': ['n5b_claim', 'form_n5b', 'n5b_accelerated_possession'],
  'proof-of-service': ['proof_of_service', 'proof_of_service_certificate'],
  'form-e': ['form_e', 'tribunal_application', 'form_e_tribunal'],
};

describe('Complete Pack Court Document Thumbnails - England Section 8', () => {
  const jurisdiction = 'england';
  const route = 'section_8';

  it('document-configs returns N5 and N119 for Section 8 (not N5B)', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const docIds = docs.map((d) => d.id);

    // Section 8 should have N5 and N119, NOT N5B
    expect(docIds).toContain('form-n5');
    expect(docIds).toContain('form-n119');
    expect(docIds).not.toContain('form-n5b');

    // Should also have proof-of-service
    expect(docIds).toContain('proof-of-service');
  });

  it('pack-contents returns matching keys for Section 8', () => {
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });
    const packKeys = packItems.map((p) => p.key);

    // Section 8 should have n5_claim and n119_particulars, NOT n5b_claim
    expect(packKeys).toContain('n5_claim');
    expect(packKeys).toContain('n119_particulars');
    expect(packKeys).not.toContain('n5b_claim');
    expect(packKeys).toContain('proof_of_service');
  });

  it('docTypeMapping resolves form-n5 to n5_claim', () => {
    const possibleTypes = docTypeMapping['form-n5'];
    expect(possibleTypes).toBeDefined();
    expect(possibleTypes).toContain('n5_claim');
  });

  it('docTypeMapping resolves form-n119 to n119_particulars', () => {
    const possibleTypes = docTypeMapping['form-n119'];
    expect(possibleTypes).toBeDefined();
    expect(possibleTypes).toContain('n119_particulars');
  });

  it('docTypeMapping resolves proof-of-service to proof_of_service', () => {
    const possibleTypes = docTypeMapping['proof-of-service'];
    expect(possibleTypes).toBeDefined();
    expect(possibleTypes).toContain('proof_of_service');
  });

  it('document-configs and pack-contents are aligned for Section 8', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });

    // Check that court form configs have matching pack-contents keys
    const courtFormDocs = docs.filter((d) => d.category === 'Court Forms');

    for (const doc of courtFormDocs) {
      const possibleTypes = docTypeMapping[doc.id];
      expect(possibleTypes).toBeDefined();

      // At least one of the possible types should be in pack-contents
      const hasMatch = possibleTypes.some((type) =>
        packItems.some((p) => p.key === type)
      );
      expect(hasMatch).toBe(true);
    }
  });
});

describe('Complete Pack Court Document Thumbnails - England Section 21', () => {
  const jurisdiction = 'england';
  const route = 'section_21';

  it('document-configs returns N5B for Section 21 (not N5 or N119)', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const docIds = docs.map((d) => d.id);

    // Section 21 should have N5B ONLY, not N5 or N119
    expect(docIds).toContain('form-n5b');
    expect(docIds).not.toContain('form-n5');
    expect(docIds).not.toContain('form-n119');

    // Should also have proof-of-service
    expect(docIds).toContain('proof-of-service');
  });

  it('pack-contents returns matching keys for Section 21', () => {
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });
    const packKeys = packItems.map((p) => p.key);

    // Section 21 should have n5b_claim ONLY, not n5_claim or n119_particulars
    expect(packKeys).toContain('n5b_claim');
    expect(packKeys).not.toContain('n5_claim');
    expect(packKeys).not.toContain('n119_particulars');
    expect(packKeys).toContain('proof_of_service');
  });

  it('docTypeMapping resolves form-n5b to n5b_claim', () => {
    const possibleTypes = docTypeMapping['form-n5b'];
    expect(possibleTypes).toBeDefined();
    expect(possibleTypes).toContain('n5b_claim');
  });

  it('document-configs and pack-contents are aligned for Section 21', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });

    // Check that court form configs have matching pack-contents keys
    const courtFormDocs = docs.filter((d) => d.category === 'Court Forms');

    for (const doc of courtFormDocs) {
      const possibleTypes = docTypeMapping[doc.id];
      expect(possibleTypes).toBeDefined();

      // At least one of the possible types should be in pack-contents
      const hasMatch = possibleTypes.some((type) =>
        packItems.some((p) => p.key === type)
      );
      expect(hasMatch).toBe(true);
    }
  });
});

describe('Complete Pack Court Document Thumbnails - Wales Section 173', () => {
  const jurisdiction = 'wales';
  const route = 'section_173';

  it('document-configs returns N5 and N119 for Wales Section 173 (no N5B)', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const docIds = docs.map((d) => d.id);

    // Wales Section 173 uses N5 and N119 (same forms as England Section 8)
    // N5B is for accelerated procedure which is ENGLAND SECTION 21 ONLY
    expect(docIds).toContain('form-n5');
    expect(docIds).toContain('form-n119');
    expect(docIds).not.toContain('form-n5b');

    // Should also have proof-of-service
    expect(docIds).toContain('proof-of-service');
  });

  it('pack-contents returns matching keys for Wales Section 173', () => {
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });
    const packKeys = packItems.map((p) => p.key);

    // Wales Section 173 should have n5_claim and n119_particulars (no n5b_claim)
    expect(packKeys).toContain('n5_claim');
    expect(packKeys).toContain('n119_particulars');
    expect(packKeys).not.toContain('n5b_claim');
    expect(packKeys).toContain('proof_of_service');
  });
});

describe('Complete Pack Court Document Thumbnails - Wales Fault-Based', () => {
  const jurisdiction = 'wales';
  const route = 'fault_based';

  it('document-configs returns court forms for Wales fault-based', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const docIds = docs.map((d) => d.id);

    // Wales fault-based should have N5 and N119
    expect(docIds).toContain('form-n5');
    expect(docIds).toContain('form-n119');
    expect(docIds).not.toContain('form-n5b');

    // Should also have proof-of-service
    expect(docIds).toContain('proof-of-service');
  });

  it('pack-contents returns matching keys for Wales fault-based', () => {
    const packItems = getPackContents({
      product: 'complete_pack',
      jurisdiction,
      route,
    });
    const packKeys = packItems.map((p) => p.key);

    // Wales fault-based should have n5_claim and n119_particulars
    expect(packKeys).toContain('n5_claim');
    expect(packKeys).toContain('n119_particulars');
    expect(packKeys).toContain('proof_of_service');
  });
});

describe('Complete Pack Court Document Thumbnails - Scotland', () => {
  const jurisdiction = 'scotland';
  const route = 'notice_to_leave';

  it('document-configs returns Form E for Scotland', () => {
    const docs = getCompletePackDocuments(jurisdiction, route);
    const docIds = docs.map((d) => d.id);

    // Scotland should have Form E (tribunal application), not N5/N119/N5B
    expect(docIds).toContain('form-e');
    expect(docIds).not.toContain('form-n5');
    expect(docIds).not.toContain('form-n119');
    expect(docIds).not.toContain('form-n5b');

    // Should also have proof-of-service
    expect(docIds).toContain('proof-of-service');
  });

  it('docTypeMapping resolves form-e to form_e_tribunal', () => {
    const possibleTypes = docTypeMapping['form-e'];
    expect(possibleTypes).toBeDefined();
    expect(possibleTypes).toContain('form_e_tribunal');
  });
});

describe('Document ID Matching Logic', () => {
  // Simulate the matching logic from the preview page
  function findMatchingDocument(
    configId: string,
    generatedDocs: Array<{ id: string; document_type: string }>
  ): string | undefined {
    const possibleTypes = docTypeMapping[configId] || [configId];

    const matchingGenDoc = generatedDocs.find(
      (gd) =>
        possibleTypes.includes(gd.document_type) ||
        gd.document_type === configId ||
        gd.document_type.replace(/_/g, '-') === configId ||
        configId.replace(/-/g, '_') === gd.document_type
    );

    return matchingGenDoc?.id;
  }

  it('matches n5_claim to form-n5', () => {
    const generatedDocs = [
      { id: 'doc-1', document_type: 'n5_claim' },
      { id: 'doc-2', document_type: 'n119_particulars' },
    ];

    const docId = findMatchingDocument('form-n5', generatedDocs);
    expect(docId).toBe('doc-1');
  });

  it('matches n119_particulars to form-n119', () => {
    const generatedDocs = [
      { id: 'doc-1', document_type: 'n5_claim' },
      { id: 'doc-2', document_type: 'n119_particulars' },
    ];

    const docId = findMatchingDocument('form-n119', generatedDocs);
    expect(docId).toBe('doc-2');
  });

  it('matches n5b_claim to form-n5b', () => {
    const generatedDocs = [{ id: 'doc-3', document_type: 'n5b_claim' }];

    const docId = findMatchingDocument('form-n5b', generatedDocs);
    expect(docId).toBe('doc-3');
  });

  it('matches proof_of_service to proof-of-service', () => {
    const generatedDocs = [{ id: 'doc-4', document_type: 'proof_of_service' }];

    const docId = findMatchingDocument('proof-of-service', generatedDocs);
    expect(docId).toBe('doc-4');
  });

  it('returns undefined when no match found', () => {
    const generatedDocs = [{ id: 'doc-1', document_type: 'witness_statement' }];

    const docId = findMatchingDocument('form-n5', generatedDocs);
    expect(docId).toBeUndefined();
  });

  it('matches via underscore-to-hyphen normalization', () => {
    const generatedDocs = [{ id: 'doc-5', document_type: 'proof_of_service' }];

    // proof_of_service.replace(/_/g, '-') === 'proof-of-service'
    const docId = findMatchingDocument('proof-of-service', generatedDocs);
    expect(docId).toBe('doc-5');
  });
});
