/**
 * Document Delivery Tests
 *
 * Tests for document download URL resolution and deduplication logic.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveStoragePath,
  getDocumentDownloadEndpoint,
  hasDownloadableFile,
  type DocumentRecord,
} from '../download';

describe('resolveStoragePath', () => {
  it('returns null for null/undefined input', () => {
    expect(resolveStoragePath(null)).toBe(null);
    expect(resolveStoragePath(undefined)).toBe(null);
    expect(resolveStoragePath('')).toBe(null);
  });

  it('extracts path from full Supabase URL', () => {
    const url = 'https://xyz.supabase.co/storage/v1/object/public/documents/user-id/case-id/file.pdf';
    expect(resolveStoragePath(url)).toBe('user-id/case-id/file.pdf');
  });

  it('handles relative storage path without leading slash', () => {
    const path = 'user-id/case-id/section8_notice_1234.pdf';
    expect(resolveStoragePath(path)).toBe('user-id/case-id/section8_notice_1234.pdf');
  });

  it('handles path with leading slashes', () => {
    const path = '///user-id/case-id/section8_notice_1234.pdf';
    expect(resolveStoragePath(path)).toBe('user-id/case-id/section8_notice_1234.pdf');
  });

  it('handles anonymous user paths', () => {
    const path = 'anonymous/case-id/section21_notice_1234.pdf';
    expect(resolveStoragePath(path)).toBe('anonymous/case-id/section21_notice_1234.pdf');
  });
});

describe('getDocumentDownloadEndpoint', () => {
  it('returns API endpoint for document with pdf_url', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      pdf_url: 'user-id/case-id/file.pdf',
    };
    expect(getDocumentDownloadEndpoint(doc)).toBe('/api/documents/doc-123');
  });

  it('returns null for document without id', () => {
    const doc = {
      id: '',
      pdf_url: 'user-id/case-id/file.pdf',
    } as DocumentRecord;
    expect(getDocumentDownloadEndpoint(doc)).toBe(null);
  });

  it('returns null for document without pdf_url', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      pdf_url: null,
    };
    expect(getDocumentDownloadEndpoint(doc)).toBe(null);
  });
});

describe('hasDownloadableFile', () => {
  it('returns true when pdf_url exists', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      pdf_url: 'path/to/file.pdf',
    };
    expect(hasDownloadableFile(doc)).toBe(true);
  });

  it('returns false when pdf_url is null', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      pdf_url: null,
    };
    expect(hasDownloadableFile(doc)).toBe(false);
  });

  it('returns false when pdf_url is undefined', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
    };
    expect(hasDownloadableFile(doc)).toBe(false);
  });

  it('returns false when pdf_url is empty string', () => {
    const doc: DocumentRecord = {
      id: 'doc-123',
      pdf_url: '',
    };
    expect(hasDownloadableFile(doc)).toBe(false);
  });
});

describe('Document Deduplication', () => {
  // This tests the deduplication logic used in the API

  interface MockDocument {
    id: string;
    document_type: string;
    is_preview: boolean;
    created_at: string;
  }

  function deduplicateByType(documents: MockDocument[]): MockDocument[] {
    const latestByType = new Map<string, MockDocument>();

    for (const doc of documents) {
      const existing = latestByType.get(doc.document_type);
      if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
        latestByType.set(doc.document_type, doc);
      }
    }

    return documents.filter(doc => latestByType.get(doc.document_type)?.id === doc.id);
  }

  it('returns empty array for empty input', () => {
    expect(deduplicateByType([])).toEqual([]);
  });

  it('returns single document unchanged', () => {
    const docs: MockDocument[] = [
      { id: '1', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-01T00:00:00Z' },
    ];
    expect(deduplicateByType(docs)).toEqual(docs);
  });

  it('keeps only latest document per type', () => {
    const docs: MockDocument[] = [
      { id: '1', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: '3', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-03T00:00:00Z' },
    ];
    const result = deduplicateByType(docs);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('handles multiple document types correctly', () => {
    const docs: MockDocument[] = [
      { id: '1', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-01T00:00:00Z' },
      { id: '2', document_type: 'section21_notice', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: '3', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-03T00:00:00Z' },
      { id: '4', document_type: 'section21_notice', is_preview: false, created_at: '2024-01-04T00:00:00Z' },
    ];
    const result = deduplicateByType(docs);
    expect(result).toHaveLength(2);
    expect(result.map(d => d.id).sort()).toEqual(['3', '4']);
  });

  it('case with 4 preview + 4 final docs returns 4 final only when filtered', () => {
    // This simulates the API behavior after filtering is_preview=false
    const allDocs: MockDocument[] = [
      // Previews (would be filtered out by API before dedup)
      { id: 'p1', document_type: 'section8_notice', is_preview: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'p2', document_type: 'section21_notice', is_preview: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'p3', document_type: 'ast_standard', is_preview: true, created_at: '2024-01-01T00:00:00Z' },
      { id: 'p4', document_type: 'evidence_checklist', is_preview: true, created_at: '2024-01-01T00:00:00Z' },
      // Finals (these remain after filtering)
      { id: 'f1', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: 'f2', document_type: 'section21_notice', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: 'f3', document_type: 'ast_standard', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: 'f4', document_type: 'evidence_checklist', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
    ];

    // Simulate API filtering is_preview=false
    const finalDocsOnly = allDocs.filter(d => !d.is_preview);
    expect(finalDocsOnly).toHaveLength(4);

    // After deduplication (already unique types in this case)
    const result = deduplicateByType(finalDocsOnly);
    expect(result).toHaveLength(4);
    expect(result.every(d => !d.is_preview)).toBe(true);
  });

  it('deduplicates multiple finals of same type keeping newest', () => {
    const docs: MockDocument[] = [
      { id: 'f1', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-01T00:00:00Z' },
      { id: 'f2', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-02T00:00:00Z' },
      { id: 'f3', document_type: 'section8_notice', is_preview: false, created_at: '2024-01-03T00:00:00Z' },
      { id: 'f4', document_type: 'section21_notice', is_preview: false, created_at: '2024-01-01T00:00:00Z' },
    ];

    const result = deduplicateByType(docs);
    expect(result).toHaveLength(2);
    expect(result.find(d => d.document_type === 'section8_notice')?.id).toBe('f3');
    expect(result.find(d => d.document_type === 'section21_notice')?.id).toBe('f4');
  });
});
