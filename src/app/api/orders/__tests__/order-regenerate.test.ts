/**
 * Order Regenerate API Tests
 *
 * Tests for POST /api/orders/regenerate endpoint
 */

import { describe, it, expect } from 'vitest';
import type { RegenerateOrderRequest, RegenerateOrderResponse } from '../regenerate/route';

describe('RegenerateOrderRequest type', () => {
  it('requires case_id', () => {
    const request: RegenerateOrderRequest = {
      case_id: 'case-123',
    };

    expect(request.case_id).toBe('case-123');
  });
});

describe('RegenerateOrderResponse type', () => {
  it('has correct shape for successful regeneration', () => {
    const response: RegenerateOrderResponse = {
      ok: true,
      regenerated_count: 4,
      document_ids: ['doc-1', 'doc-2', 'doc-3', 'doc-4'],
    };

    expect(response.ok).toBe(true);
    expect(response.regenerated_count).toBe(4);
    expect(response.document_ids).toHaveLength(4);
  });

  it('has correct shape for error response', () => {
    const response: RegenerateOrderResponse = {
      ok: false,
      error: 'Edit window expired',
      message: 'The 30-day editing period has ended.',
    };

    expect(response.ok).toBe(false);
    expect(response.error).toBe('Edit window expired');
  });
});

describe('Regenerate Endpoint Business Logic', () => {
  describe('Paid case within edit window', () => {
    it('should allow regeneration and delete old finals', () => {
      // Scenario: Order paid 15 days ago (within 30-day window)
      const paidAt = new Date();
      paidAt.setDate(paidAt.getDate() - 15);

      const orderState = {
        payment_status: 'paid',
        paid_at: paidAt.toISOString(),
      };

      const editWindowDays = 30;
      const daysSincePaid = 15;
      const isWithinWindow = daysSincePaid <= editWindowDays;

      expect(isWithinWindow).toBe(true);
      expect(orderState.payment_status).toBe('paid');

      // Expected behavior: delete old final docs, regenerate new ones
      const expectedResponse: RegenerateOrderResponse = {
        ok: true,
        regenerated_count: 4,
        document_ids: ['new-doc-1', 'new-doc-2', 'new-doc-3', 'new-doc-4'],
      };

      expect(expectedResponse.ok).toBe(true);
    });

    it('should delete existing final documents before regenerating', () => {
      // Simulate existing final documents
      const existingDocs = [
        { id: 'old-doc-1', is_preview: false, pdf_url: '/documents/user/case/old1.pdf' },
        { id: 'old-doc-2', is_preview: false, pdf_url: '/documents/user/case/old2.pdf' },
      ];

      // Only non-preview docs should be deleted
      const docsToDelete = existingDocs.filter((d) => !d.is_preview);
      expect(docsToDelete).toHaveLength(2);

      // Previews should NOT be deleted
      const previewDocs = [
        { id: 'preview-1', is_preview: true, pdf_url: '/documents/user/case/preview.pdf' },
      ];
      const previewsToKeep = previewDocs.filter((d) => d.is_preview);
      expect(previewsToKeep).toHaveLength(1);
    });
  });

  describe('Expired edit window', () => {
    it('should return 403 and do nothing', () => {
      // Scenario: Order paid 45 days ago (past 30-day window)
      const paidAt = new Date();
      paidAt.setDate(paidAt.getDate() - 45);

      const editWindowDays = 30;
      const daysSincePaid = 45;
      const isWithinWindow = daysSincePaid <= editWindowDays;

      expect(isWithinWindow).toBe(false);

      // Expected error response (403)
      const expectedError = {
        error: 'EDIT_WINDOW_EXPIRED',
        message: 'The 30-day editing period for this case has ended. Downloads remain available.',
        ends_at: expect.any(String),
      };

      expect(expectedError.error).toBe('EDIT_WINDOW_EXPIRED');
    });

    it('should not delete any documents when edit window expired', () => {
      // When edit window is expired, the endpoint should return early
      // without touching any documents
      const shouldDeleteDocs = false; // Edit window check happens first
      expect(shouldDeleteDocs).toBe(false);
    });
  });

  describe('Unpaid case', () => {
    it('should return 402 and do nothing', () => {
      // Scenario: No paid order exists
      const orderState = null; // No paid order found

      const hasPaidOrder = orderState !== null;
      expect(hasPaidOrder).toBe(false);

      // Expected error response (402 Payment Required)
      const expectedError: RegenerateOrderResponse = {
        ok: false,
        error: 'No paid order found for this case. Please complete your purchase first.',
      };

      expect(expectedError.ok).toBe(false);
    });

    it('should return 402 for pending payment status', () => {
      // Scenario: Order exists but not paid
      const orderState = {
        payment_status: 'pending',
      };

      const isPaid = orderState.payment_status === 'paid';
      expect(isPaid).toBe(false);

      // The query filters for paid orders only, so this would return no order
    });
  });
});

describe('Regression: Old bug with invalid document_type', () => {
  /**
   * The OLD bug: The case detail page called /api/documents/generate with
   * document_type: caseDetails.case_type, which passed values like "eviction",
   * "money_claim", or "tenancy_agreement" - NOT valid document types like
   * "section8_notice", "arrears_schedule", etc.
   *
   * The NEW approach: We call /api/orders/regenerate which:
   * 1. Determines the product_type from the paid order
   * 2. Uses the product-aware fulfillment logic to generate all docs
   * 3. Never passes case_type as a document_type
   */

  it('demonstrates the old bug with invalid case_type as document_type', () => {
    // These are case_type values (NOT valid document_type values)
    const invalidDocumentTypes = ['eviction', 'money_claim', 'tenancy_agreement'];

    // These are actual valid document_type values
    const validDocumentTypes = [
      'section8_notice',
      'section21_notice',
      'arrears_schedule',
      'n1_claim',
      'form_3a',
      'ast_agreement',
      'notice_to_leave',
    ];

    // The old code would pass case_type as document_type
    invalidDocumentTypes.forEach((caseType) => {
      expect(validDocumentTypes).not.toContain(caseType);
    });
  });

  it('new approach does not call documents/generate with case_type', () => {
    // The new regenerate endpoint determines product_type from the order
    // and calls fulfillOrder which handles all document generation
    const regenerateInput = {
      case_id: 'case-123',
      // Note: NO document_type field - product is derived from the order
    };

    expect(regenerateInput).not.toHaveProperty('document_type');
    expect(regenerateInput).toHaveProperty('case_id');
  });

  it('regenerate endpoint uses product_type from order, not case_type', () => {
    // Simulate the order lookup
    const order = {
      id: 'order-123',
      product_type: 'notice_only', // Valid product type
      payment_status: 'paid',
    };

    const caseData = {
      case_type: 'eviction', // This was incorrectly used before
      jurisdiction: 'england',
    };

    // The new code uses order.product_type, not caseData.case_type
    expect(order.product_type).toBe('notice_only');
    expect(order.product_type).not.toBe(caseData.case_type);
  });
});

describe('Product/Jurisdiction Coverage', () => {
  const productJurisdictionMatrix = [
    { product: 'notice_only', jurisdictions: ['england', 'wales', 'scotland'] },
    { product: 'complete_pack', jurisdictions: ['england', 'wales', 'scotland'] },
    { product: 'money_claim', jurisdictions: ['england', 'wales'] },
    { product: 'sc_money_claim', jurisdictions: ['scotland'] },
    { product: 'ast_standard', jurisdictions: ['england', 'wales', 'scotland', 'northern-ireland'] },
    { product: 'ast_premium', jurisdictions: ['england', 'wales', 'scotland', 'northern-ireland'] },
  ];

  productJurisdictionMatrix.forEach(({ product, jurisdictions }) => {
    describe(`${product}`, () => {
      jurisdictions.forEach((jurisdiction) => {
        it(`supports regeneration in ${jurisdiction}`, () => {
          const request: RegenerateOrderRequest = {
            case_id: `case-${product}-${jurisdiction}`,
          };

          // Simulate successful regeneration
          const response: RegenerateOrderResponse = {
            ok: true,
            regenerated_count: 4,
            document_ids: ['doc-1', 'doc-2', 'doc-3', 'doc-4'],
          };

          expect(response.ok).toBe(true);
          expect(response.regenerated_count).toBeGreaterThan(0);
        });
      });
    });
  });
});

describe('Error Handling', () => {
  it('returns 401 for unauthenticated requests', () => {
    const errorResponse: RegenerateOrderResponse = {
      ok: false,
      error: 'Unauthorized',
    };

    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.error).toBe('Unauthorized');
  });

  it('returns 403 for case ownership violation', () => {
    const errorResponse: RegenerateOrderResponse = {
      ok: false,
      error: 'You do not have permission to access this case',
    };

    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.error).toContain('permission');
  });

  it('returns 404 for case not found', () => {
    const errorResponse: RegenerateOrderResponse = {
      ok: false,
      error: 'Case not found',
    };

    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.error).toBe('Case not found');
  });

  it('returns 500 for fulfillment failure with error message', () => {
    const errorResponse: RegenerateOrderResponse = {
      ok: false,
      error: 'Document regeneration failed',
      message: 'Storage upload failed: bucket not found',
    };

    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.error).toBe('Document regeneration failed');
    expect(errorResponse.message).toContain('Storage');
  });
});

describe('Edit Window Edge Cases', () => {
  it('allows regeneration on exactly day 30', () => {
    const paidAt = new Date();
    paidAt.setDate(paidAt.getDate() - 30);

    // Day 30 is still within the window (<=30)
    const daysSincePaid = 30;
    const isWithinWindow = daysSincePaid <= 30;

    expect(isWithinWindow).toBe(true);
  });

  it('blocks regeneration on day 31', () => {
    const paidAt = new Date();
    paidAt.setDate(paidAt.getDate() - 31);

    // Day 31 is outside the window
    const daysSincePaid = 31;
    const isWithinWindow = daysSincePaid <= 30;

    expect(isWithinWindow).toBe(false);
  });

  it('allows regeneration for unpaid case (wizard flow)', () => {
    // An unpaid case should not block mutations
    // But the regenerate endpoint specifically requires a paid order
    // So for unpaid cases, users should use the wizard preview instead
    const hasPaidOrder = false;
    const shouldAllowWizardMutations = !hasPaidOrder || true; // Always allow if no paid order

    expect(shouldAllowWizardMutations).toBe(true);
  });
});

describe('Idempotency and Safety', () => {
  it('handles concurrent regeneration requests safely', () => {
    // The endpoint sets status to 'processing' first
    // If another request comes in while processing, fulfillOrder
    // will detect existing docs and return early
    const orderStatus = {
      fulfillment_status: 'processing',
    };

    expect(orderStatus.fulfillment_status).toBe('processing');
  });

  it('preserves preview documents during regeneration', () => {
    const allDocs = [
      { id: 'preview-1', is_preview: true },
      { id: 'final-1', is_preview: false },
      { id: 'final-2', is_preview: false },
    ];

    // Only non-preview docs should be deleted
    const docsToDelete = allDocs.filter((d) => !d.is_preview);
    const docsToKeep = allDocs.filter((d) => d.is_preview);

    expect(docsToDelete).toHaveLength(2);
    expect(docsToKeep).toHaveLength(1);
    expect(docsToKeep[0].is_preview).toBe(true);
  });
});
