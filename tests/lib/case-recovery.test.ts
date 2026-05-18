import { describe, expect, it } from 'vitest';

import {
  buildCaseRecoveryUrl,
  deriveCaseProductType,
  deriveCaseRecoveryContact,
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
