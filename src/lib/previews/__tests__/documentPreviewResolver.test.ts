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

  it('routes Notice Only config document ids through generated pack preview document types', () => {
    const documents = getNoticeOnlyDocuments('england', 'section_8', { includeArrearsSchedule: true });
    const expectedTypes: Record<string, string> = {
      'case-summary-stage-1': 'case_summary',
      'notice-form-3a': 'section8_notice',
      'service-instructions-form-3a': 'service_instructions',
      'validity-checklist-form-3a': 'validity_checklist',
      'compliance-checklist-form-3a': 'compliance_declaration',
      'proof-of-service-form-3a': 'proof_of_service',
      'what-happens-next-stage-1': 'what_happens_next',
      'arrears-schedule': 'arrears_schedule',
    };

    for (const document of documents) {
      const expectedType = expectedTypes[document.id];
      expect(expectedType, `missing expectation for ${document.id}`).toBeTruthy();

      const resolution = resolveDocumentPreview({
        caseId,
        product: 'notice_only',
        document,
      });

      expect(resolution.thumbnailUrl).toContain('pack=notice_only');
      expect(resolution.thumbnailUrl).toContain(`document_type=${expectedType}`);
      expect(resolution.previewUrl).toContain('pack=notice_only');
      expect(resolution.previewUrl).toContain(`document_type=${expectedType}`);
    }
  });

  it('routes Wales notice cards through the document types emitted by the pack generator', () => {
    const section173Docs = getNoticeOnlyDocuments('wales', 'wales_section_173');
    const faultBasedDocs = getNoticeOnlyDocuments('wales', 'wales_fault_based');
    const expectedTypes: Record<string, string> = {
      'notice-section-173': 'section173_notice',
      'service-instructions-s173': 'service_instructions',
      'validity-checklist-s173': 'validity_checklist',
      'notice-fault-based': 'fault_based_notice',
      'pre-service-checklist-fault': 'pre_service_compliance_checklist',
      'service-instructions-fault': 'service_instructions',
      'validity-checklist-fault': 'validity_checklist',
    };

    for (const document of [...section173Docs, ...faultBasedDocs]) {
      const expectedType = expectedTypes[document.id];
      expect(expectedType, `missing expectation for ${document.id}`).toBeTruthy();

      const resolution = resolveDocumentPreview({
        caseId,
        product: 'notice_only',
        document,
      });

      expect(resolution.thumbnailUrl).toContain(`document_type=${expectedType}`);
      expect(resolution.previewUrl).toContain(`document_type=${expectedType}`);
    }
  });

  it('routes the Scotland tribunal form through the generated complete-pack document type', () => {
    const formEDocument = getCompletePackDocuments('scotland', 'notice_to_leave').find(
      (document) => document.id === 'form-e'
    );

    expect(formEDocument).toBeTruthy();

    const resolution = resolveDocumentPreview({
      caseId,
      product: 'complete_pack',
      document: formEDocument!,
    });

    expect(resolution.thumbnailUrl).toContain('document_type=form_e_tribunal');
    expect(resolution.previewUrl).toContain('document_type=form_e_tribunal');
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
