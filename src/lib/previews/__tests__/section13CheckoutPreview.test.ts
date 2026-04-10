import { describe, expect, it } from 'vitest';

import { getSection13Documents } from '@/lib/documents/document-configs';
import { getSection13CheckoutThumbnailUrl } from '../section13CheckoutPreview';

describe('Section 13 checkout preview thumbnail mapping', () => {
  const caseId = '11111111-1111-1111-1111-111111111111';

  it('assigns thumbnail URLs to every standard pack document card', () => {
    const documents = getSection13Documents('section13_standard');

    for (const document of documents) {
      expect(getSection13CheckoutThumbnailUrl(caseId, document.id)).toMatch(
        new RegExp(`^/api/section13/thumbnail/${caseId}\\?document_type=`)
      );
    }

    expect(
      getSection13CheckoutThumbnailUrl(caseId, documents[0].id)
    ).toContain('section13_form_4a');
  });

  it('keeps bundle-only defensive items on icon fallback', () => {
    const documents = getSection13Documents('section13_defensive');
    const urlById = Object.fromEntries(
      documents.map((document) => [
        document.id,
        getSection13CheckoutThumbnailUrl(caseId, document.id),
      ])
    );

    expect(urlById['section13-tribunal-bundle-pdf']).toBeUndefined();
    expect(urlById['section13-tribunal-bundle-zip']).toBeUndefined();
    expect(urlById['section13-tribunal-argument-summary']).toBe(
      `/api/section13/thumbnail/${caseId}?document_type=section13_tribunal_argument_summary`
    );
  });
});
