import { describe, expect, it } from 'vitest';

import {
  getASTDocuments,
  getCompletePackDocuments,
  getMoneyClaimDocuments,
  getNoticeOnlyDocuments,
  getSection13Documents,
} from '@/lib/documents/document-configs';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import type { ResidentialLettingProductSku } from '@/lib/residential-letting/products';
import {
  getPreviewDocumentTypes,
  resolveDocumentPreview,
} from '../documentPreviewResolver';

const caseId = '11111111-1111-1111-1111-111111111111';

function expectPreviewRoutes(product: string, documents: ReturnType<typeof getNoticeOnlyDocuments>) {
  for (const document of documents) {
    const resolution = resolveDocumentPreview({
      caseId,
      product,
      document,
      possibleTypes: getPreviewDocumentTypes(document),
      jurisdiction: 'england',
      noticeRoute: 'section_8',
      variant: product === 'ast_premium' ? 'premium' : 'standard',
    });

    expect(resolution.thumbnailUrl, `${product}:${document.id} thumbnail`).toBeTruthy();
    expect(resolution.previewUrl, `${product}:${document.id} preview`).toBeTruthy();
    expect(resolution.previewUnavailableReason).toBeUndefined();
  }
}

describe('resolveDocumentPreview', () => {
  it('resolves every active eviction, money claim, and Section 13 document card', () => {
    expectPreviewRoutes(
      'notice_only',
      getNoticeOnlyDocuments('england', 'section_8', { includeArrearsSchedule: true })
    );
    expectPreviewRoutes('complete_pack', getCompletePackDocuments('england', 'section_8'));
    expectPreviewRoutes('money_claim', getMoneyClaimDocuments('england'));
    expectPreviewRoutes('section13_standard', getSection13Documents('section13_standard'));
    expectPreviewRoutes('section13_defensive', getSection13Documents('section13_defensive'));
  });

  it('resolves legacy tenancy agreement documents through the tenancy preview endpoints', () => {
    expectPreviewRoutes(
      'ast_standard',
      getASTDocuments('england', 'standard', { englandTenancyPurpose: 'new_tenancy' })
    );
    expectPreviewRoutes(
      'ast_premium',
      getASTDocuments('england', 'premium', { hasInventoryData: true })
    );
  });

  it('resolves modern England tenancy products per listed document', () => {
    const products: ResidentialLettingProductSku[] = [
      'england_standard_tenancy_agreement',
      'england_premium_tenancy_agreement',
      'england_student_tenancy_agreement',
      'england_hmo_shared_house_tenancy_agreement',
      'england_lodger_agreement',
    ];

    for (const product of products) {
      expectPreviewRoutes(product, getResidentialDocumentList(product));
    }
  });

  it('includes document_type on tenancy preview URLs so each card opens its own document', () => {
    const [firstDocument, secondDocument] = getResidentialDocumentList('england_standard_tenancy_agreement');

    expect(
      resolveDocumentPreview({
        caseId,
        product: 'england_standard_tenancy_agreement',
        document: firstDocument,
      }).previewUrl
    ).toContain(`document_type=${encodeURIComponent(firstDocument.id)}`);

    expect(
      resolveDocumentPreview({
        caseId,
        product: 'england_standard_tenancy_agreement',
        document: secondDocument,
      }).previewUrl
    ).toContain(`document_type=${encodeURIComponent(secondDocument.id)}`);
  });
});
