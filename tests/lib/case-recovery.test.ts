import { describe, expect, it } from 'vitest';

import {
  buildCaseRecoveryUrl,
  deriveCaseProductType,
  deriveCaseRecoveryContact,
  getHistoricalPreviewBackfillReason,
  isPreviewAbandonedCase,
} from '@/lib/cases/recovery';

describe('case recovery helpers', () => {
  it('derives Section 13 product and contact details from anonymous case facts', () => {
    const caseItem = {
      id: 'case-1',
      case_type: 'rent_increase',
      jurisdiction: 'england',
      workflow_status: 'preview_ready',
      wizard_progress: 80,
      collected_facts: {
        section13: {
          selectedPlan: 'section13_defensive',
          landlord: {
            landlordEmail: 'alex@example.com',
            landlordName: 'Alex Landlord',
          },
        },
      },
    };

    expect(deriveCaseProductType(caseItem)).toBe('section13_defensive');
    expect(deriveCaseRecoveryContact(caseItem)).toEqual({
      email: 'alex@example.com',
      name: 'Alex Landlord',
    });
    expect(
      isPreviewAbandonedCase({
        caseItem,
        order: null,
        hasFinalDocuments: false,
      })
    ).toBe(true);
  });

  it('does not treat paid cases or cases with final documents as preview abandoned', () => {
    const caseItem = {
      id: 'case-1',
      case_type: 'eviction',
      jurisdiction: 'england',
      wizard_progress: 100,
      collected_facts: { __meta: { product: 'notice_only' } },
    };

    expect(
      isPreviewAbandonedCase({
        caseItem,
        order: { payment_status: 'paid', product_type: 'notice_only' },
        hasFinalDocuments: false,
      })
    ).toBe(false);
    expect(
      isPreviewAbandonedCase({
        caseItem,
        order: null,
        hasFinalDocuments: true,
      })
    ).toBe(false);
  });

  it('treats cases with preview documents as preview abandoned even if legacy progress was not stamped', () => {
    const caseItem = {
      id: 'case-legacy-preview',
      case_type: 'tenancy_agreement',
      jurisdiction: 'england',
      workflow_status: 'in_progress',
      wizard_progress: 0,
      wizard_completed_at: null,
      collected_facts: { __meta: { product: 'ast_standard' } },
    };

    expect(
      isPreviewAbandonedCase({
        caseItem,
        order: null,
        hasFinalDocuments: false,
        hasPreviewDocuments: true,
      })
    ).toBe(true);
  });

  it('treats completed or preview-marked generic wizard cases as preview abandoned', () => {
    expect(
      isPreviewAbandonedCase({
        caseItem: {
          id: 'completed-eviction',
          case_type: 'eviction',
          jurisdiction: 'england',
          status: 'completed',
          workflow_status: 'in_progress',
          wizard_progress: 0,
          collected_facts: { __meta: { product: 'notice_only' } },
        },
        order: null,
        hasFinalDocuments: false,
      })
    ).toBe(true);

    expect(
      isPreviewAbandonedCase({
        caseItem: {
          id: 'preview-last-viewed-tenancy',
          case_type: 'tenancy_agreement',
          jurisdiction: 'england',
          status: 'in_progress',
          workflow_status: 'in_progress',
          wizard_progress: 0,
          collected_facts: {
            __meta: {
              product: 'england_standard_tenancy_agreement',
              preview_last_viewed_at: '2026-05-18T12:00:00.000Z',
            },
          },
        },
        order: null,
        hasFinalDocuments: false,
      })
    ).toBe(true);
  });

  it('keeps non-preview drafts out of preview abandoned recovery', () => {
    const caseItem = {
      id: 'case-draft',
      case_type: 'eviction',
      jurisdiction: 'england',
      workflow_status: 'in_progress',
      wizard_progress: 40,
      wizard_completed_at: null,
      collected_facts: { __meta: { product: 'notice_only' } },
    };

    expect(
      isPreviewAbandonedCase({
        caseItem,
        order: null,
        hasFinalDocuments: false,
        hasPreviewDocuments: false,
      })
    ).toBe(false);
  });

  it('can conservatively identify historical non-Section-13 review-ready cases for backfill', () => {
    expect(
      getHistoricalPreviewBackfillReason({
        id: 'historical-money-claim',
        case_type: 'money_claim',
        jurisdiction: 'england',
        workflow_status: 'in_progress',
        wizard_progress: 0,
        wizard_completed_at: null,
        collected_facts: {
          __meta: { product: 'money_claim', jurisdiction: 'england' },
          landlord_full_name: 'Alex Landlord',
          landlord_address_line1: '1 High Street',
          landlord_address_postcode: 'SW1A 1AA',
          tenant_full_name: 'Taylor Tenant',
          defendant_address_line1: '2 High Street',
          tenancy_start_date: '2025-01-01',
          rent_amount: 1200,
          rent_frequency: 'monthly',
          claiming_rent_arrears: true,
          money_claim: {
            court_name: 'County Court Money Claims Centre',
            basis_of_claim: 'Rent arrears under the tenancy agreement.',
            charge_interest: false,
            evidence_types_available: ['tenancy_agreement'],
          },
          arrears_items: [{ month: 'January', amount: 1200 }],
          letter_before_claim_sent: true,
          evidence_reviewed: true,
        },
      })
    ).toBe('money_claim_review_ready_facts');
  });

  it('does not backfill incomplete historical drafts', () => {
    expect(
      getHistoricalPreviewBackfillReason({
        id: 'draft-money-claim',
        case_type: 'money_claim',
        jurisdiction: 'england',
        workflow_status: 'in_progress',
        wizard_progress: 0,
        wizard_completed_at: null,
        collected_facts: {
          __meta: { product: 'money_claim', jurisdiction: 'england' },
          landlord_full_name: 'Alex Landlord',
        },
      })
    ).toBeNull();
  });

  it('builds a generic wizard recovery URL with product and token', () => {
    const url = buildCaseRecoveryUrl({
      baseUrl: 'https://landlordheaven.co.uk',
      caseId: 'case-1',
      caseType: 'rent_increase',
      jurisdiction: 'england',
      productType: 'section13_standard',
      token: 'token-123',
    });

    expect(url).toBe(
      'https://landlordheaven.co.uk/wizard/flow?type=rent_increase&jurisdiction=england&case_id=case-1&recovery_token=token-123&product=section13_standard'
    );
  });
});
