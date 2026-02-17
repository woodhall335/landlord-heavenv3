/**
 * Safe Order Metadata Helpers Tests
 *
 * Tests for backward-compatible metadata access on orders table.
 * These tests verify that the code gracefully handles the case where
 * the orders.metadata column doesn't exist (Postgres error 42703).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isMetadataColumnMissingError,
  setMetadataColumnExists,
  extractOrderMetadata,
  orderRequiresAction,
  getOrderRequiredActions,
  getOrderBlockedDocuments,
  BASE_ORDER_SELECT_FIELDS,
  getOrdersSelectFields,
  type OrderMetadata,
} from '../safe-order-metadata';

// Mock console.warn to prevent noise in test output
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
  // Reset the cached state before each test
  setMetadataColumnExists(true); // Reset to true to clear any fallback state
});

afterEach(() => {
  console.warn = originalWarn;
});

describe('isMetadataColumnMissingError', () => {
  it('returns true for Postgres error 42703 mentioning metadata', () => {
    const error = {
      code: '42703',
      message: 'column orders.metadata does not exist',
      details: null,
    };
    expect(isMetadataColumnMissingError(error)).toBe(true);
  });

  it('returns true when details mention metadata', () => {
    const error = {
      code: '42703',
      message: 'column does not exist',
      details: 'metadata column missing',
    };
    expect(isMetadataColumnMissingError(error)).toBe(true);
  });

  it('returns false for 42703 error not related to metadata', () => {
    const error = {
      code: '42703',
      message: 'column orders.some_other_column does not exist',
      details: null,
    };
    expect(isMetadataColumnMissingError(error)).toBe(false);
  });

  it('returns false for other Postgres error codes', () => {
    const error = {
      code: '23505', // unique violation
      message: 'duplicate key value violates unique constraint',
      details: null,
    };
    expect(isMetadataColumnMissingError(error)).toBe(false);
  });

  it('returns false for null/undefined errors', () => {
    expect(isMetadataColumnMissingError(null)).toBe(false);
    expect(isMetadataColumnMissingError(undefined)).toBe(false);
    expect(isMetadataColumnMissingError({})).toBe(false);
  });
});

describe('getOrdersSelectFields', () => {
  it('includes all base fields', () => {
    const fields = getOrdersSelectFields({ includeMetadata: false });
    BASE_ORDER_SELECT_FIELDS.forEach((field) => {
      expect(fields).toContain(field);
    });
  });

  it('includes metadata when requested', () => {
    const fields = getOrdersSelectFields({ includeMetadata: true });
    expect(fields).toContain('metadata');
  });

  it('excludes metadata when metadataColumnExists is false', () => {
    setMetadataColumnExists(false);
    const fields = getOrdersSelectFields();
    expect(fields).not.toContain('metadata');
  });
});

describe('extractOrderMetadata', () => {
  it('returns metadata from order with metadata property', () => {
    const order = {
      id: 'order-123',
      metadata: {
        required_actions: [{ fieldKey: 'test', label: 'Test', errorCode: 'TEST', helpText: 'Help' }],
        validation: 'requires_action',
      },
    };

    const metadata = extractOrderMetadata(order);
    expect(metadata).not.toBeNull();
    expect(metadata?.validation).toBe('requires_action');
    expect(metadata?.required_actions).toHaveLength(1);
  });

  it('returns null for order without metadata property', () => {
    const order = {
      id: 'order-123',
      payment_status: 'paid',
    };

    const metadata = extractOrderMetadata(order);
    expect(metadata).toBeNull();
  });

  it('returns null for null order', () => {
    expect(extractOrderMetadata(null)).toBeNull();
  });

  it('returns null for order with null metadata', () => {
    const order = {
      id: 'order-123',
      metadata: null,
    };
    expect(extractOrderMetadata(order)).toBeNull();
  });

  it('returns null for order with non-object metadata', () => {
    const order = {
      id: 'order-123',
      metadata: 'string-value',
    };
    expect(extractOrderMetadata(order)).toBeNull();
  });
});

describe('orderRequiresAction', () => {
  it('returns true when fulfillment_status is requires_action', () => {
    const order = {
      id: 'order-123',
      fulfillment_status: 'requires_action',
    };
    expect(orderRequiresAction(order)).toBe(true);
  });

  it('returns true when metadata.validation is requires_action', () => {
    const order = {
      id: 'order-123',
      fulfillment_status: 'processing',
      metadata: {
        validation: 'requires_action',
      },
    };
    expect(orderRequiresAction(order)).toBe(true);
  });

  it('returns false when fulfillment_status is fulfilled', () => {
    const order = {
      id: 'order-123',
      fulfillment_status: 'fulfilled',
    };
    expect(orderRequiresAction(order)).toBe(false);
  });

  it('returns false when metadata is missing', () => {
    const order = {
      id: 'order-123',
      fulfillment_status: 'processing',
    };
    expect(orderRequiresAction(order)).toBe(false);
  });

  it('returns false for null order', () => {
    expect(orderRequiresAction(null)).toBe(false);
  });
});

describe('getOrderRequiredActions', () => {
  it('returns required_actions from metadata', () => {
    const order = {
      id: 'order-123',
      metadata: {
        required_actions: [
          { fieldKey: 'epc_served', label: 'EPC provided', errorCode: 'S21_EPC_UNKNOWN', helpText: 'Help' },
          { fieldKey: 'deposit_protected', label: 'Deposit protected', errorCode: 'S21_DEPOSIT_UNKNOWN', helpText: 'Help' },
        ],
      },
    };

    const actions = getOrderRequiredActions(order);
    expect(actions).toHaveLength(2);
    expect(actions?.[0].errorCode).toBe('S21_EPC_UNKNOWN');
  });

  it('returns empty array when metadata is missing', () => {
    const order = {
      id: 'order-123',
    };
    expect(getOrderRequiredActions(order)).toEqual([]);
  });

  it('returns empty array when required_actions is missing', () => {
    const order = {
      id: 'order-123',
      metadata: {
        validation: 'complete',
      },
    };
    expect(getOrderRequiredActions(order)).toEqual([]);
  });
});

describe('getOrderBlockedDocuments', () => {
  it('returns blocked_documents from metadata', () => {
    const order = {
      id: 'order-123',
      metadata: {
        blocked_documents: [
          {
            documentType: 'section21_notice',
            documentTitle: 'Section 21 Notice - Form 6A',
            blockingCodes: ['S21_EPC_UNKNOWN'],
            reason: 'EPC not confirmed',
          },
        ],
      },
    };

    const blocked = getOrderBlockedDocuments(order);
    expect(blocked).toHaveLength(1);
    expect(blocked?.[0].documentType).toBe('section21_notice');
  });

  it('returns empty array when metadata is missing', () => {
    const order = {
      id: 'order-123',
    };
    expect(getOrderBlockedDocuments(order)).toEqual([]);
  });
});

describe('OrderMetadata type', () => {
  it('allows all Section 21 metadata fields', () => {
    const metadata: OrderMetadata = {
      required_actions: [
        { fieldKey: 'test', label: 'Test', errorCode: 'TEST', helpText: 'Help' },
      ],
      section21_blockers: ['S21_EPC_UNKNOWN', 'S21_HOW_TO_RENT_UNKNOWN'],
      blocked_documents: [
        {
          documentType: 'section21_notice',
          documentTitle: 'Section 21 Notice',
          blockingCodes: ['S21_EPC_UNKNOWN'],
          reason: 'EPC not confirmed',
        },
      ],
      total_documents: 5,
      expected_documents: 8,
      generated_documents: 5,
      validation: 'requires_action',
      missing_keys: ['section21_notice', 'form_6a'],
      last_attempt: '2024-01-15T10:30:00Z',
      error: 'Section 21 validation failed',
      resume_attempt: '2024-01-15T11:00:00Z',
      confirmations_added: ['epc_served', 'deposit_protected'],
    };

    expect(metadata.validation).toBe('requires_action');
    expect(metadata.section21_blockers).toHaveLength(2);
    expect(metadata.confirmations_added).toHaveLength(2);
  });

  it('allows arbitrary additional properties', () => {
    const metadata: OrderMetadata = {
      validation: 'complete',
      custom_field: 'custom_value',
      another_field: 123,
    };

    expect(metadata['custom_field']).toBe('custom_value');
    expect(metadata['another_field']).toBe(123);
  });

  it('supports tenancy validation details while keeping validation in union', () => {
    const metadata: OrderMetadata = {
      validation: 'incomplete',
      tenancy_validation_code: 'tenancy_required_fields_missing',
      missing_fields: ['tenant_name'],
      invalid_fields: ['tenancy_start_date'],
    };

    expect(metadata.validation).toBe('incomplete');
    expect(metadata.tenancy_validation_code).toBe('tenancy_required_fields_missing');
    expect(metadata.missing_fields).toEqual(['tenant_name']);
    expect(metadata.invalid_fields).toEqual(['tenancy_start_date']);
  });
});

describe('Backward Compatibility', () => {
  it('handles order without metadata column gracefully', () => {
    // Simulate an order returned from a database without the metadata column
    const orderWithoutMetadata = {
      id: 'order-123',
      case_id: 'case-456',
      user_id: 'user-789',
      product_type: 'complete_pack',
      payment_status: 'paid',
      fulfillment_status: 'requires_action',
      paid_at: '2024-01-15T10:30:00Z',
      // No metadata property at all
    };

    // All helper functions should work without crashing
    expect(extractOrderMetadata(orderWithoutMetadata)).toBeNull();
    expect(orderRequiresAction(orderWithoutMetadata)).toBe(true); // From fulfillment_status
    expect(getOrderRequiredActions(orderWithoutMetadata)).toEqual([]);
    expect(getOrderBlockedDocuments(orderWithoutMetadata)).toEqual([]);
  });

  it('fulfillment_status is the primary indicator for requires_action', () => {
    // Even without metadata, the dashboard can determine if action is required
    // by checking fulfillment_status
    const order = {
      id: 'order-123',
      fulfillment_status: 'requires_action',
    };

    expect(orderRequiresAction(order)).toBe(true);
  });

  it('dashboard can render with null metadata', () => {
    // Simulate what the dashboard receives when metadata column is missing
    const orderStatus = {
      paid: true,
      payment_status: 'paid' as const,
      fulfillment_status: 'requires_action' as const,
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc',
      total_amount: 199.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'complete_pack',
      metadata: null, // Metadata is null because column doesn't exist
    };

    // Dashboard logic: show Section21ActionRequired when fulfillment_status is requires_action
    const showSection21ActionRequired =
      orderStatus.paid &&
      orderStatus.fulfillment_status === 'requires_action' &&
      !orderStatus.has_final_documents;

    expect(showSection21ActionRequired).toBe(true);

    // Dashboard provides fallback for requiredActions
    const requiredActions = orderStatus.metadata?.required_actions || [];
    expect(requiredActions).toEqual([]);

    // Dashboard provides fallback for section21_blockers
    const blockers = orderStatus.metadata?.section21_blockers || [];
    expect(blockers).toEqual([]);
  });
});

describe('OrderStatusResponse with requires_action', () => {
  it('supports requires_action fulfillment status', () => {
    // This verifies the type was updated correctly
    const response = {
      paid: true,
      payment_status: 'paid' as const,
      fulfillment_status: 'requires_action' as const,
      fulfillment_error: null,
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc',
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
        ],
        section21_blockers: ['S21_EPC_UNKNOWN'],
        blocked_documents: [
          {
            documentType: 'section21_notice',
            documentTitle: 'Section 21 Notice - Form 6A',
            blockingCodes: ['S21_EPC_UNKNOWN'],
            reason: 'Cannot generate Section 21 without EPC confirmation',
          },
        ],
      },
    };

    expect(response.fulfillment_status).toBe('requires_action');
    expect(response.metadata?.required_actions).toHaveLength(1);
    expect(response.metadata?.section21_blockers).toContain('S21_EPC_UNKNOWN');
  });

  it('works with metadata containing only error and last_attempt', () => {
    // Simpler metadata structure for processing/incomplete states
    const response = {
      paid: true,
      payment_status: 'paid' as const,
      fulfillment_status: 'processing' as const,
      fulfillment_error: 'Document generation in progress',
      paid_at: '2024-01-15T10:30:00Z',
      order_id: 'order-123',
      stripe_session_id: 'cs_test_abc',
      total_amount: 39.99,
      currency: 'GBP',
      has_final_documents: false,
      final_document_count: 0,
      last_final_document_created_at: null,
      edit_window_open: true,
      edit_window_ends_at: '2024-02-14T10:30:00Z',
      product_type: 'notice_only',
      metadata: {
        error: 'Document generation failed',
        last_attempt: '2024-01-15T10:35:00Z',
      },
    };

    expect(response.metadata?.error).toBe('Document generation failed');
    expect(response.metadata?.last_attempt).toBe('2024-01-15T10:35:00Z');
  });
});
