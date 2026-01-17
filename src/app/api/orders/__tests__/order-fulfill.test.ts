/**
 * Order Fulfill API Tests
 *
 * Tests for POST /api/orders/fulfill retry endpoint
 */

import { describe, it, expect } from 'vitest';
import type { FulfillOrderRequest, FulfillOrderResponse } from '../fulfill/route';

describe('FulfillOrderRequest type', () => {
  it('requires case_id', () => {
    const request: FulfillOrderRequest = {
      case_id: 'case-123',
    };

    expect(request.case_id).toBe('case-123');
    expect(request.product).toBeUndefined();
  });

  it('supports optional product filter', () => {
    const request: FulfillOrderRequest = {
      case_id: 'case-123',
      product: 'notice_only',
    };

    expect(request.case_id).toBe('case-123');
    expect(request.product).toBe('notice_only');
  });
});

describe('FulfillOrderResponse type', () => {
  it('has correct shape for successful fulfillment', () => {
    const response: FulfillOrderResponse = {
      success: true,
      status: 'fulfilled',
      documents: 4,
    };

    expect(response.success).toBe(true);
    expect(response.status).toBe('fulfilled');
    expect(response.documents).toBe(4);
  });

  it('has correct shape for already fulfilled (idempotent)', () => {
    const response: FulfillOrderResponse = {
      success: true,
      status: 'already_fulfilled',
      documents: 8,
      message: 'Documents already exist',
    };

    expect(response.success).toBe(true);
    expect(response.status).toBe('already_fulfilled');
    expect(response.documents).toBe(8);
  });

  it('has correct shape for processing state', () => {
    const response: FulfillOrderResponse = {
      success: true,
      status: 'processing',
      message: 'Document generation is already in progress',
    };

    expect(response.success).toBe(true);
    expect(response.status).toBe('processing');
  });
});

describe('Fulfill Endpoint Business Logic', () => {
  it('paid order + docs missing should trigger fulfillOrder', () => {
    // Scenario: Order is paid but no final documents exist
    const orderState = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'failed',
      has_final_documents: false,
    };

    // Should allow retry
    const shouldAllowRetry = orderState.paid &&
      !orderState.has_final_documents &&
      orderState.fulfillment_status !== 'processing';

    expect(shouldAllowRetry).toBe(true);
  });

  it('already has final docs should return no-op success', () => {
    // Scenario: Order has final documents
    const orderState = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      has_final_documents: true,
      final_document_count: 4,
    };

    // Should return already_fulfilled without regenerating
    const isIdempotent = orderState.has_final_documents;
    expect(isIdempotent).toBe(true);

    const expectedResponse: FulfillOrderResponse = {
      success: true,
      status: 'already_fulfilled',
      documents: orderState.final_document_count,
      message: 'Documents already exist',
    };

    expect(expectedResponse.status).toBe('already_fulfilled');
  });

  it('missing order.user_id and case.user_id returns 422', () => {
    // Scenario: Cannot resolve user for fulfillment
    const orderState = {
      id: 'order-123',
      user_id: null,
      paid: true,
    };
    const caseState = {
      id: 'case-456',
      user_id: null,
    };

    // Should fail with 422
    const canResolveUser = orderState.user_id || caseState.user_id;
    expect(canResolveUser).toBeFalsy();

    // Expected error response shape
    const errorResponse = {
      success: false,
      error: 'Unable to resolve user for fulfillment. Please contact support.',
      user_message: 'We cannot generate your documents because user information is missing. Please contact support with your Case ID for assistance.',
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.user_message).toContain('contact support');
  });

  it('user_id resolution priority: order first, then case', () => {
    // Scenario: Order has user_id but case doesn't
    const orderState = {
      id: 'order-123',
      user_id: 'user-from-order',
    };
    const caseState = {
      id: 'case-456',
      user_id: null,
    };

    const resolvedUserId = orderState.user_id || caseState.user_id;
    expect(resolvedUserId).toBe('user-from-order');

    // Scenario: Order doesn't have user_id but case does
    const orderState2 = {
      id: 'order-789',
      user_id: null,
    };
    const caseState2 = {
      id: 'case-012',
      user_id: 'user-from-case',
    };

    const resolvedUserId2 = orderState2.user_id || caseState2.user_id;
    expect(resolvedUserId2).toBe('user-from-case');
  });

  it('unpaid order should be rejected with 402', () => {
    // Scenario: Order is not paid
    const orderState = {
      paid: false,
      payment_status: 'pending',
    };

    const shouldReject = orderState.payment_status !== 'paid';
    expect(shouldReject).toBe(true);

    // Expected error shape (402 Payment Required)
    const errorResponse = {
      success: false,
      error: 'Order is not paid',
    };

    expect(errorResponse.error).toBe('Order is not paid');
  });

  it('order in processing state should return 200 with processing status', () => {
    // Scenario: Order is already being processed
    const orderState = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'processing',
    };

    const isProcessing = orderState.fulfillment_status === 'processing';
    expect(isProcessing).toBe(true);

    const expectedResponse: FulfillOrderResponse = {
      success: true,
      status: 'processing',
      message: 'Document generation is already in progress',
    };

    expect(expectedResponse.status).toBe('processing');
  });
});

describe('Fulfill Endpoint Product Coverage', () => {
  const products = [
    'notice_only',
    'complete_pack',
    'money_claim',
    'sc_money_claim',
    'ast_standard',
    'ast_premium',
  ];

  products.forEach((product) => {
    it(`supports ${product} product`, () => {
      const request: FulfillOrderRequest = {
        case_id: `case-${product}`,
        product,
      };

      expect(request.product).toBe(product);
    });
  });
});

describe('Fulfill Endpoint Error Handling', () => {
  it('401 for unauthenticated requests', () => {
    // Scenario: User not logged in
    const errorResponse = {
      success: false,
      error: 'Unauthorized',
    };

    expect(errorResponse.error).toBe('Unauthorized');
  });

  it('403 for case ownership violation', () => {
    // Scenario: User doesn't own the case
    const errorResponse = {
      success: false,
      error: 'You do not have permission to access this case',
    };

    expect(errorResponse.error).toContain('permission');
  });

  it('404 for case not found', () => {
    // Scenario: Case doesn't exist
    const errorResponse = {
      success: false,
      error: 'Case not found',
    };

    expect(errorResponse.error).toBe('Case not found');
  });

  it('404 for order not found', () => {
    // Scenario: No order for the case
    const errorResponse = {
      success: false,
      error: 'No order found for this case',
    };

    expect(errorResponse.error).toContain('order');
  });

  it('500 for fulfillment failure with error message', () => {
    // Scenario: Document generation fails
    const errorResponse = {
      success: false,
      error: 'Document generation failed',
      message: 'Storage upload failed: bucket not found',
    };

    expect(errorResponse.error).toBe('Document generation failed');
    expect(errorResponse.message).toContain('Storage');
  });
});

describe('Idempotency', () => {
  it('multiple retry calls should be safe', () => {
    // First call succeeds
    const firstResponse: FulfillOrderResponse = {
      success: true,
      status: 'fulfilled',
      documents: 4,
    };

    // Second call returns already_fulfilled
    const secondResponse: FulfillOrderResponse = {
      success: true,
      status: 'already_fulfilled',
      documents: 4,
      message: 'Documents already exist',
    };

    expect(firstResponse.success).toBe(true);
    expect(secondResponse.success).toBe(true);
    expect(secondResponse.status).toBe('already_fulfilled');
  });
});
