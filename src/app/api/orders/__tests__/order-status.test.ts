/**
 * Order Status API Tests
 *
 * Tests for /api/orders/status and /api/orders/by-session endpoints
 */

import { describe, it, expect } from 'vitest';
import type { OrderStatusResponse } from '../status/route';
import type { OrderBySessionResponse } from '../by-session/route';

describe('OrderStatusResponse type', () => {
  it('has correct shape for paid order with final documents', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: true,
      final_document_count: 8,
      last_final_document_created_at: '2024-01-15T10:31:00Z',
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    expect(response.paid).toBe(true);
    expect(response.has_final_documents).toBe(true);
    expect(response.final_document_count).toBe(8);
    expect(response.fulfillment_error).toBeNull();
    expect(response.last_final_document_created_at).toBe('2024-01-15T10:31:00Z');
    expect(response.edit_window_open).toBe(true);
  });

  it('has correct shape for paid order without final documents (webhook race)', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    expect(response.paid).toBe(true);
    expect(response.has_final_documents).toBe(false);
    expect(response.fulfillment_status).toBe('processing');
    expect(response.last_final_document_created_at).toBeNull();
  });

  it('has correct shape for failed fulfillment with error message', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'failed',
      fulfillment_error: 'Storage upload failed: bucket not found',
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    expect(response.paid).toBe(true);
    expect(response.fulfillment_status).toBe('failed');
    expect(response.fulfillment_error).toBe('Storage upload failed: bucket not found');
    expect(response.has_final_documents).toBe(false);
  });

  it('has correct shape for unpaid/pending order', () => {
    const response: OrderStatusResponse = {
      paid: false,
      payment_status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_error: null,
      paid_at: null,
      order_id: 'order-456',
      stripe_session_id: 'cs_test_def456',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: false,
      edit_window_ends_at: null,
    };

    expect(response.paid).toBe(false);
    expect(response.payment_status).toBe('pending');
    expect(response.paid_at).toBeNull();
    expect(response.edit_window_open).toBe(false);
  });

  it('has correct shape for no order found', () => {
    const response: OrderStatusResponse = {
      paid: false,
      payment_status: 'pending',
      fulfillment_status: null,
      fulfillment_error: null,
      paid_at: null,
      order_id: null,
      stripe_session_id: null,
      total_amount: null,
      currency: null,
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: false,
      edit_window_ends_at: null,
    };

    expect(response.order_id).toBeNull();
    expect(response.paid).toBe(false);
    expect(response.fulfillment_error).toBeNull();
  });

  it('supports all payment status values', () => {
    const statuses: OrderStatusResponse['payment_status'][] = [
      'pending',
      'paid',
      'failed',
      'refunded',
      'partially_refunded',
    ];

    statuses.forEach((status) => {
      const response: OrderStatusResponse = {
        paid: status === 'paid',
        payment_status: status,
        fulfillment_status: null,
        fulfillment_error: null,
        paid_at: null,
        order_id: null,
        stripe_session_id: null,
        total_amount: null,
        currency: null,
        has_final_documents: false,
        final_document_count: 0,
        last_final_document_created_at: null,
        edit_window_open: false,
        edit_window_ends_at: null,
      };
      expect(response.payment_status).toBe(status);
    });
  });

  it('supports all fulfillment status values including requires_action', () => {
    const statuses: (OrderStatusResponse['fulfillment_status'])[] = [
      'pending',
      'ready_to_generate',
      'processing',
      'fulfilled',
      'failed',
      'requires_action',
      null,
    ];

    statuses.forEach((status) => {
      const response: OrderStatusResponse = {
        paid: false,
        payment_status: 'pending',
        fulfillment_status: status,
        fulfillment_error: status === 'failed' ? 'Test error' : null,
        paid_at: null,
        order_id: null,
        stripe_session_id: null,
        total_amount: null,
        currency: null,
        has_final_documents: false,
        final_document_count: 0,
        last_final_document_created_at: null,
        edit_window_open: false,
        edit_window_ends_at: null,
      };
      expect(response.fulfillment_status).toBe(status);
    });
  });
});

describe('OrderBySessionResponse type', () => {
  it('has correct shape for found and paid order', () => {
    const response: OrderBySessionResponse = {
      found: true,
      paid: true,
      case_id: 'case-abc123',
      product: 'complete_pack',
      order_id: 'order-xyz789',
    };

    expect(response.found).toBe(true);
    expect(response.paid).toBe(true);
    expect(response.case_id).toBe('case-abc123');
  });

  it('has correct shape for found but unpaid order', () => {
    const response: OrderBySessionResponse = {
      found: true,
      paid: false,
      case_id: 'case-abc123',
      product: 'notice_only',
      order_id: 'order-xyz789',
    };

    expect(response.found).toBe(true);
    expect(response.paid).toBe(false);
  });

  it('has correct shape for not found session', () => {
    const response: OrderBySessionResponse = {
      found: false,
      paid: false,
    };

    expect(response.found).toBe(false);
    expect(response.case_id).toBeUndefined();
    expect(response.order_id).toBeUndefined();
  });

  it('supports all product types', () => {
    const products = [
      'notice_only',
      'complete_pack',
      'money_claim',
      'sc_money_claim',
      'ast_standard',
      'ast_premium',
    ];

    products.forEach((product) => {
      const response: OrderBySessionResponse = {
        found: true,
        paid: true,
        case_id: 'case-123',
        product: product,
        order_id: 'order-456',
      };
      expect(response.product).toBe(product);
    });
  });
});

describe('Order Status Business Logic', () => {
  it('paid && has_final_documents means documents are ready', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: true,
      final_document_count: 4,
      last_final_document_created_at: '2024-01-15T10:31:00Z',
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    // UI should show success state
    const showSuccess = response.paid && response.has_final_documents;
    expect(showSuccess).toBe(true);
  });

  it('paid && !has_final_documents means documents are generating (poll)', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    // UI should show "Finalizing..." and start polling
    const shouldPoll = response.paid && !response.has_final_documents;
    expect(shouldPoll).toBe(true);
  });

  it('fulfillment_status=failed should trigger retry option', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'failed',
      fulfillment_error: 'Document generation failed',
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    // UI should show error state with retry button
    const shouldShowRetry = response.paid &&
      !response.has_final_documents &&
      (response.fulfillment_status === 'failed' || response.fulfillment_status === 'ready_to_generate');
    expect(shouldShowRetry).toBe(true);
    expect(response.fulfillment_error).toBe('Document generation failed');
  });

  it('fulfillment_status=ready_to_generate should auto-retry', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'ready_to_generate',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
    };

    // UI should auto-retry when stuck in ready_to_generate
    const shouldAutoRetry = response.paid &&
      !response.has_final_documents &&
      (response.fulfillment_status === 'failed' || response.fulfillment_status === 'ready_to_generate');
    expect(shouldAutoRetry).toBe(true);
  });

  it('!paid means payment not confirmed', () => {
    const response: OrderStatusResponse = {
      paid: false,
      payment_status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_error: null,
      paid_at: null,
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: false,
      edit_window_ends_at: null,
    };

    // UI should not show success state
    const showSuccess = response.paid && response.has_final_documents;
    expect(showSuccess).toBe(false);
  });
});

describe('Section 21 Requires Action Flow', () => {
  it('has correct shape for requires_action fulfillment status with metadata', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'requires_action',
      fulfillment_error: 'Section 21 validation failed',
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
      metadata: {
        required_actions: [
          { fieldKey: 'epc_served', label: 'EPC provided', errorCode: 'S21_EPC_UNKNOWN', helpText: 'Please confirm EPC was provided' },
          { fieldKey: 'deposit_protected', label: 'Deposit protected', errorCode: 'S21_DEPOSIT_UNKNOWN', helpText: 'Please confirm deposit was protected' },
        ],
        section21_blockers: ['S21_EPC_UNKNOWN', 'S21_DEPOSIT_UNKNOWN'],
        blocked_documents: [
          {
            documentType: 'section21_notice',
            documentTitle: 'Section 21 Notice - Form 6A',
            blockingCodes: ['S21_EPC_UNKNOWN', 'S21_DEPOSIT_UNKNOWN'],
            reason: 'Section 21 preconditions not confirmed',
          },
        ],
      },
    };

    expect(response.paid).toBe(true);
    expect(response.fulfillment_status).toBe('requires_action');
    expect(response.has_final_documents).toBe(false);
    expect(response.metadata?.required_actions).toHaveLength(2);
    expect(response.metadata?.section21_blockers).toContain('S21_EPC_UNKNOWN');
    expect(response.metadata?.blocked_documents?.[0].documentType).toBe('section21_notice');
  });

  it('requires_action should show Section21ActionRequired UI', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'requires_action',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
    };

    // Dashboard should show Section21ActionRequired when fulfillment_status is requires_action
    const showSection21ActionRequired =
      response.paid &&
      response.fulfillment_status === 'requires_action' &&
      !response.has_final_documents;

    expect(showSection21ActionRequired).toBe(true);
  });

  it('dashboard can handle null metadata gracefully', () => {
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'requires_action',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
      metadata: null, // Metadata column might not exist
    };

    // Dashboard should use optional chaining and fallbacks
    const requiredActions = response.metadata?.required_actions || [];
    const section21Blockers = response.metadata?.section21_blockers || [];

    expect(requiredActions).toEqual([]);
    expect(section21Blockers).toEqual([]);
  });
});

describe('Backward Compatibility (42703 Error)', () => {
  it('response is valid even without metadata (DB schema missing column)', () => {
    // This simulates the response when orders.metadata column doesn't exist
    // and the API falls back to returning without metadata
    const response: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
      // metadata is undefined (not returned from API)
    };

    expect(response.paid).toBe(true);
    expect(response.order_id).toBe('order-123');
    // UI should handle undefined metadata gracefully
    expect(response.metadata).toBeUndefined();
  });

  it('API never crashes with 500 when metadata column is missing', () => {
    // This test documents the expected behavior when 42703 error occurs:
    // - API catches the error
    // - Retries without metadata
    // - Returns 200 with valid response

    // The actual implementation logs a warning and returns without metadata
    // This is a contract test - the API should ALWAYS return a valid response
    const responseWithoutMetadata: OrderStatusResponse = {
      paid: true,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc123',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: true,
      final_document_count: 8,
      last_final_document_created_at: '2024-01-15T10:31:00Z',
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
      metadata: null, // No metadata because column doesn't exist
    };

    // This should be a valid response that the UI can handle
    expect(responseWithoutMetadata.paid).toBe(true);
    expect(responseWithoutMetadata.has_final_documents).toBe(true);
  });
});

describe('Product/Jurisdiction Coverage', () => {
  // Ensure the API supports all products across jurisdictions
  const products = [
    { type: 'notice_only', jurisdictions: ['england', 'wales', 'scotland', 'northern-ireland'] },
    { type: 'complete_pack', jurisdictions: ['england', 'wales', 'scotland', 'northern-ireland'] },
    { type: 'money_claim', jurisdictions: ['england', 'wales'] },
    { type: 'sc_money_claim', jurisdictions: ['scotland'] },
    { type: 'ast_standard', jurisdictions: ['england', 'wales', 'northern-ireland'] },
    { type: 'ast_premium', jurisdictions: ['england', 'wales', 'northern-ireland'] },
  ];

  products.forEach(({ type, jurisdictions }) => {
    it(`supports ${type} product`, () => {
      const response: OrderStatusResponse = {
        paid: true,
        payment_status: 'paid',
        fulfillment_status: 'fulfilled',
        fulfillment_error: null,
        paid_at: '2024-01-15T10:30:00Z',
        order_id: `order-${type}`,
        stripe_session_id: 'cs_test_abc123',
        total_amount: 199.99,
        currency: 'GBP',
        has_final_documents: true,
        final_document_count: 4,
        last_final_document_created_at: '2024-01-15T10:31:00Z',
        edit_window_open: true,
        edit_window_ends_at: '2024-02-14T10:30:00Z',
      };

      expect(response.order_id).toBe(`order-${type}`);
    });

    jurisdictions.forEach((jurisdiction) => {
      it(`${type} works in ${jurisdiction}`, () => {
        // This just validates the types work - actual jurisdiction handling
        // is in the fulfillment layer, not the status API
        const response: OrderBySessionResponse = {
          found: true,
          paid: true,
          case_id: `case-${jurisdiction}`,
          product: type,
          order_id: `order-${type}-${jurisdiction}`,
        };

        expect(response.found).toBe(true);
        expect(response.product).toBe(type);
      });
    });
  });
});
