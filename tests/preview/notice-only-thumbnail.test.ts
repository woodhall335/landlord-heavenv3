/**
 * Notice Only Thumbnail Tests
 *
 * Tests for the notice-only thumbnail endpoint and preview page integration.
 * Ensures that notice_only document cards display thumbnails without requiring
 * database document records.
 *
 * Key scenarios:
 * - England Section 8/21 notice_only cases show thumbnails
 * - Wales Section 173 and fault-based notice_only cases show thumbnails
 * - Scotland Notice to Leave notice_only cases show thumbnails
 * - Non-notice-only products continue to use the existing thumbnail endpoint
 */

import { describe, it, expect } from 'vitest';
import {
  getNoticeOnlyDocuments,
} from '../../src/lib/documents/document-configs';

describe('Notice Only Thumbnail URL Generation', () => {
  /**
   * Helper that mimics the thumbnail URL generation logic from the preview page
   */
  function generateThumbnailUrl(
    caseId: string,
    docId: string,
    product: string,
    docTypeMapping: Record<string, string[]>
  ): string | undefined {
    if (product !== 'notice_only') {
      return undefined;
    }

    const possibleTypes = docTypeMapping[docId] || [docId];
    const docTypeForThumbnail = possibleTypes[0] || docId;
    return `/api/notice-only/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
  }

  // Document type mapping from preview page
  const docTypeMapping: Record<string, string[]> = {
    'notice-section-8': ['section8_notice', 'form_3_section8'],
    'notice-section-21': ['section21_notice', 'form_6a_section21'],
    'notice-section-173': ['section173_notice', 'wales_section_173'],
    'notice-fault-based': ['fault_based_notice', 'wales_fault_based'],
    'notice-to-leave': ['notice_to_leave', 'scotland_notice_to_leave'],
    'service-instructions-s8': ['service_instructions'],
    'service-instructions-s21': ['service_instructions'],
    'service-instructions-s173': ['service_instructions'],
    'service-instructions-fault': ['service_instructions'],
    'service-instructions-ntl': ['service_instructions'],
    'validity-checklist-s8': ['service_checklist'],
    'validity-checklist-s21': ['service_checklist'],
    'validity-checklist-s173': ['service_checklist'],
    'validity-checklist-fault': ['service_checklist'],
    'validity-checklist-ntl': ['service_checklist'],
    'arrears-schedule': ['arrears_schedule'],
  };

  describe('England Section 8 notice_only', () => {
    const caseId = 'test-case-123';
    const docs = getNoticeOnlyDocuments('england', 'section_8');

    it('generates thumbnailUrl for Section 8 notice', () => {
      const noticeDoc = docs.find(d => d.id === 'notice-section-8');
      expect(noticeDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, noticeDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=section8_notice`);
    });

    it('generates thumbnailUrl for service instructions', () => {
      const serviceDoc = docs.find(d => d.id === 'service-instructions-s8');
      expect(serviceDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, serviceDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_instructions`);
    });

    it('generates thumbnailUrl for validity checklist', () => {
      const checklistDoc = docs.find(d => d.id === 'validity-checklist-s8');
      expect(checklistDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, checklistDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_checklist`);
    });
  });

  describe('England Section 21 notice_only', () => {
    const caseId = 'test-case-456';
    const docs = getNoticeOnlyDocuments('england', 'section_21');

    it('generates thumbnailUrl for Section 21 notice', () => {
      const noticeDoc = docs.find(d => d.id === 'notice-section-21');
      expect(noticeDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, noticeDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=section21_notice`);
    });
  });

  describe('Wales Section 173 notice_only', () => {
    const caseId = 'test-case-wales-173';
    const docs = getNoticeOnlyDocuments('wales', 'wales_section_173');

    it('generates thumbnailUrl for Section 173 notice', () => {
      const noticeDoc = docs.find(d => d.id === 'notice-section-173');
      expect(noticeDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, noticeDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=section173_notice`);
    });

    it('generates thumbnailUrl for Wales service instructions', () => {
      const serviceDoc = docs.find(d => d.id === 'service-instructions-s173');
      expect(serviceDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, serviceDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_instructions`);
    });

    it('generates thumbnailUrl for Wales validity checklist', () => {
      const checklistDoc = docs.find(d => d.id === 'validity-checklist-s173');
      expect(checklistDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, checklistDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_checklist`);
    });
  });

  describe('Wales fault-based notice_only', () => {
    const caseId = 'test-case-wales-fault';
    const docs = getNoticeOnlyDocuments('wales', 'wales_fault_based');

    it('generates thumbnailUrl for fault-based notice', () => {
      const noticeDoc = docs.find(d => d.id === 'notice-fault-based');
      expect(noticeDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, noticeDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=fault_based_notice`);
    });

    it('generates thumbnailUrl for Wales fault service instructions', () => {
      const serviceDoc = docs.find(d => d.id === 'service-instructions-fault');
      expect(serviceDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, serviceDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_instructions`);
    });
  });

  describe('Scotland notice_only', () => {
    const caseId = 'test-case-scotland';
    const docs = getNoticeOnlyDocuments('scotland', 'notice_to_leave');

    it('generates thumbnailUrl for Notice to Leave', () => {
      const noticeDoc = docs.find(d => d.id === 'notice-to-leave');
      expect(noticeDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, noticeDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=notice_to_leave`);
    });

    it('generates thumbnailUrl for Scotland service instructions', () => {
      const serviceDoc = docs.find(d => d.id === 'service-instructions-ntl');
      expect(serviceDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, serviceDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_instructions`);
    });

    it('generates thumbnailUrl for Scotland validity checklist', () => {
      const checklistDoc = docs.find(d => d.id === 'validity-checklist-ntl');
      expect(checklistDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, checklistDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=service_checklist`);
    });
  });

  describe('Arrears schedule thumbnail', () => {
    const caseId = 'test-case-arrears';
    const docs = getNoticeOnlyDocuments('england', 'section_8', { includeArrearsSchedule: true });

    it('generates thumbnailUrl for arrears schedule', () => {
      const arrearsDoc = docs.find(d => d.id === 'arrears-schedule');
      expect(arrearsDoc).toBeDefined();

      const url = generateThumbnailUrl(caseId, arrearsDoc!.id, 'notice_only', docTypeMapping);
      expect(url).toBe(`/api/notice-only/thumbnail/${caseId}?document_type=arrears_schedule`);
    });
  });

  describe('Non-notice_only products', () => {
    it('does NOT generate notice-only thumbnailUrl for complete_pack', () => {
      const url = generateThumbnailUrl('case-123', 'notice-section-8', 'complete_pack', docTypeMapping);
      expect(url).toBeUndefined();
    });

    it('does NOT generate notice-only thumbnailUrl for money_claim (money_claim uses its own endpoint)', () => {
      // Note: money_claim now uses /api/money-claim/thumbnail instead
      // This test verifies notice_only endpoint is not used for money_claim
      const url = generateThumbnailUrl('case-123', 'form-n1', 'money_claim', docTypeMapping);
      expect(url).toBeUndefined();
    });

    it('does NOT generate notice-only thumbnailUrl for ast_standard', () => {
      const url = generateThumbnailUrl('case-123', 'tenancy-agreement', 'ast_standard', docTypeMapping);
      expect(url).toBeUndefined();
    });
  });
});

describe('Document Type Resolution', () => {
  /**
   * Helper that mimics the resolveDocumentType function from the thumbnail API
   */
  function resolveDocumentType(configId: string): string | null {
    // Notice documents
    if (configId === 'notice-section-21' || configId === 'section21_notice') {
      return 'section21_notice';
    }
    if (configId === 'notice-section-8' || configId === 'section8_notice') {
      return 'section8_notice';
    }
    if (configId === 'notice-section-173' || configId === 'section173_notice') {
      return 'section173_notice';
    }
    if (configId === 'notice-fault-based' || configId === 'fault_based_notice') {
      return 'fault_based_notice';
    }
    if (configId === 'notice-to-leave' || configId === 'notice_to_leave') {
      return 'notice_to_leave';
    }

    // Service instructions
    if (configId.startsWith('service-instructions') || configId === 'service_instructions') {
      return 'service_instructions';
    }

    // Checklists
    if (configId.startsWith('validity-checklist') || configId === 'service_checklist') {
      return 'service_checklist';
    }

    // Arrears schedule
    if (configId === 'arrears-schedule' || configId === 'arrears_schedule') {
      return 'arrears_schedule';
    }

    return null;
  }

  describe('Notice document types', () => {
    it('resolves notice-section-8 to section8_notice', () => {
      expect(resolveDocumentType('notice-section-8')).toBe('section8_notice');
    });

    it('resolves section8_notice to section8_notice', () => {
      expect(resolveDocumentType('section8_notice')).toBe('section8_notice');
    });

    it('resolves notice-section-21 to section21_notice', () => {
      expect(resolveDocumentType('notice-section-21')).toBe('section21_notice');
    });

    it('resolves notice-section-173 to section173_notice', () => {
      expect(resolveDocumentType('notice-section-173')).toBe('section173_notice');
    });

    it('resolves notice-fault-based to fault_based_notice', () => {
      expect(resolveDocumentType('notice-fault-based')).toBe('fault_based_notice');
    });

    it('resolves notice-to-leave to notice_to_leave', () => {
      expect(resolveDocumentType('notice-to-leave')).toBe('notice_to_leave');
    });
  });

  describe('Service instructions', () => {
    it('resolves service-instructions-s8 to service_instructions', () => {
      expect(resolveDocumentType('service-instructions-s8')).toBe('service_instructions');
    });

    it('resolves service-instructions-s21 to service_instructions', () => {
      expect(resolveDocumentType('service-instructions-s21')).toBe('service_instructions');
    });

    it('resolves service-instructions-s173 to service_instructions', () => {
      expect(resolveDocumentType('service-instructions-s173')).toBe('service_instructions');
    });

    it('resolves service-instructions-fault to service_instructions', () => {
      expect(resolveDocumentType('service-instructions-fault')).toBe('service_instructions');
    });

    it('resolves service-instructions-ntl to service_instructions', () => {
      expect(resolveDocumentType('service-instructions-ntl')).toBe('service_instructions');
    });

    it('resolves service_instructions to service_instructions', () => {
      expect(resolveDocumentType('service_instructions')).toBe('service_instructions');
    });
  });

  describe('Validity checklists', () => {
    it('resolves validity-checklist-s8 to service_checklist', () => {
      expect(resolveDocumentType('validity-checklist-s8')).toBe('service_checklist');
    });

    it('resolves validity-checklist-s21 to service_checklist', () => {
      expect(resolveDocumentType('validity-checklist-s21')).toBe('service_checklist');
    });

    it('resolves validity-checklist-s173 to service_checklist', () => {
      expect(resolveDocumentType('validity-checklist-s173')).toBe('service_checklist');
    });

    it('resolves validity-checklist-fault to service_checklist', () => {
      expect(resolveDocumentType('validity-checklist-fault')).toBe('service_checklist');
    });

    it('resolves validity-checklist-ntl to service_checklist', () => {
      expect(resolveDocumentType('validity-checklist-ntl')).toBe('service_checklist');
    });
  });

  describe('Arrears schedule', () => {
    it('resolves arrears-schedule to arrears_schedule', () => {
      expect(resolveDocumentType('arrears-schedule')).toBe('arrears_schedule');
    });

    it('resolves arrears_schedule to arrears_schedule', () => {
      expect(resolveDocumentType('arrears_schedule')).toBe('arrears_schedule');
    });
  });

  describe('Unknown types', () => {
    it('returns null for unknown document types', () => {
      expect(resolveDocumentType('unknown-doc')).toBeNull();
    });

    it('returns null for court forms (not supported in notice_only)', () => {
      expect(resolveDocumentType('form-n5')).toBeNull();
    });
  });
});

describe('Preview Page Document Enrichment', () => {
  /**
   * Helper that mimics the document enrichment logic from the preview page
   */
  function enrichDocumentsForNoticeOnly(
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

      // For notice_only, use the new thumbnail endpoint
      let thumbnailUrl: string | undefined;
      if (product === 'notice_only') {
        const docTypeForThumbnail = possibleTypes[0] || doc.id;
        thumbnailUrl = `/api/notice-only/thumbnail/${caseId}?document_type=${encodeURIComponent(docTypeForThumbnail)}`;
      }

      return {
        ...doc,
        documentId: matchingGenDoc?.id,
        thumbnailUrl,
      };
    });
  }

  const docTypeMapping: Record<string, string[]> = {
    'notice-section-8': ['section8_notice'],
    'service-instructions-s8': ['service_instructions'],
    'validity-checklist-s8': ['service_checklist'],
  };

  it('enriches notice_only documents with thumbnailUrl even without generated docs', () => {
    const docs = [
      { id: 'notice-section-8', title: 'Section 8 Notice' },
      { id: 'service-instructions-s8', title: 'Service Instructions' },
      { id: 'validity-checklist-s8', title: 'Validity Checklist' },
    ];

    const enriched = enrichDocumentsForNoticeOnly(
      docs,
      'case-123',
      'notice_only',
      [], // No generated docs (as happens for notice_only)
      docTypeMapping
    );

    // All documents should have thumbnailUrl even without documentId
    expect(enriched[0].thumbnailUrl).toBe('/api/notice-only/thumbnail/case-123?document_type=section8_notice');
    expect(enriched[0].documentId).toBeUndefined();

    expect(enriched[1].thumbnailUrl).toBe('/api/notice-only/thumbnail/case-123?document_type=service_instructions');
    expect(enriched[1].documentId).toBeUndefined();

    expect(enriched[2].thumbnailUrl).toBe('/api/notice-only/thumbnail/case-123?document_type=service_checklist');
    expect(enriched[2].documentId).toBeUndefined();
  });

  it('does NOT add thumbnailUrl for non-notice_only products', () => {
    const docs = [
      { id: 'notice-section-8', title: 'Section 8 Notice' },
    ];

    const enriched = enrichDocumentsForNoticeOnly(
      docs,
      'case-123',
      'complete_pack',
      [{ id: 'doc-abc', document_type: 'section8_notice' }],
      docTypeMapping
    );

    // Should have documentId but no thumbnailUrl (uses existing /api/documents/thumbnail endpoint)
    expect(enriched[0].documentId).toBe('doc-abc');
    expect(enriched[0].thumbnailUrl).toBeUndefined();
  });
});

describe('All Notice Only Document Types Coverage', () => {
  const jurisdictions = [
    { name: 'England Section 8', jurisdiction: 'england', route: 'section_8' },
    { name: 'England Section 21', jurisdiction: 'england', route: 'section_21' },
    { name: 'Wales Section 173', jurisdiction: 'wales', route: 'wales_section_173' },
    { name: 'Wales Fault-Based', jurisdiction: 'wales', route: 'wales_fault_based' },
    { name: 'Scotland Notice to Leave', jurisdiction: 'scotland', route: 'notice_to_leave' },
  ];

  for (const { name, jurisdiction, route } of jurisdictions) {
    describe(name, () => {
      it('should have at least 3 documents', () => {
        const docs = getNoticeOnlyDocuments(jurisdiction, route);
        expect(docs.length).toBeGreaterThanOrEqual(3);
      });

      it('should have a notice document', () => {
        const docs = getNoticeOnlyDocuments(jurisdiction, route);
        const noticeDoc = docs.find(d => d.category === 'Notice');
        expect(noticeDoc).toBeDefined();
      });

      it('should have a service instructions document', () => {
        const docs = getNoticeOnlyDocuments(jurisdiction, route);
        const guidanceDoc = docs.find(d => d.category === 'Guidance');
        expect(guidanceDoc).toBeDefined();
      });

      it('should have a checklist document', () => {
        const docs = getNoticeOnlyDocuments(jurisdiction, route);
        const checklistDoc = docs.find(d => d.category === 'Checklists');
        expect(checklistDoc).toBeDefined();
      });
    });
  }
});
