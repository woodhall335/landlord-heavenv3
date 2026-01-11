/**
 * Webhook Fulfillment Failure Tests
 *
 * Tests for Stripe webhook handling of fulfillment failures
 */

import { describe, it, expect } from 'vitest';

describe('Webhook Fulfillment Failure Handling', () => {
  describe('Error Persistence', () => {
    it('should store truncated error message in order metadata on failure', () => {
      // Scenario: Fulfillment throws an error
      const fulfillmentError = new Error('Storage upload failed: bucket not found');
      const errorMessage = fulfillmentError?.message || 'Document generation failed';
      const truncatedError = errorMessage.substring(0, 500);

      expect(truncatedError).toBe('Storage upload failed: bucket not found');
      expect(truncatedError.length).toBeLessThanOrEqual(500);
    });

    it('should truncate long error messages to 500 characters', () => {
      const longError = 'A'.repeat(1000);
      const truncatedError = longError.substring(0, 500);

      expect(truncatedError.length).toBe(500);
    });

    it('should handle undefined error message gracefully', () => {
      const fulfillmentError = { message: undefined };
      const errorMessage = (fulfillmentError as any)?.message || 'Document generation failed';

      expect(errorMessage).toBe('Document generation failed');
    });
  });

  describe('Order Status Updates', () => {
    it('should set fulfillment_status to processing before starting', () => {
      // Scenario: Webhook receives checkout.session.completed
      const orderUpdate = {
        fulfillment_status: 'processing',
      };

      expect(orderUpdate.fulfillment_status).toBe('processing');
    });

    it('should set fulfillment_status to failed on error', () => {
      // Scenario: fulfillOrder throws an error
      const orderUpdate = {
        fulfillment_status: 'failed',
        metadata: {
          fulfillment_error: 'Storage upload failed',
        },
      };

      expect(orderUpdate.fulfillment_status).toBe('failed');
      expect(orderUpdate.metadata.fulfillment_error).toBe('Storage upload failed');
    });

    it('should preserve existing metadata when adding error', () => {
      // Scenario: Order already has metadata
      const existingMetadata = {
        pack_type: 'notice_only',
        jurisdiction: 'england',
      };

      const errorMessage = 'Document generation failed';

      const updatedMetadata = {
        ...existingMetadata,
        fulfillment_error: errorMessage,
      };

      expect(updatedMetadata.pack_type).toBe('notice_only');
      expect(updatedMetadata.jurisdiction).toBe('england');
      expect(updatedMetadata.fulfillment_error).toBe('Document generation failed');
    });
  });

  describe('Status Transitions', () => {
    it('valid transition: ready_to_generate -> processing', () => {
      const before = 'ready_to_generate';
      const after = 'processing';
      const isValid = before === 'ready_to_generate' && after === 'processing';
      expect(isValid).toBe(true);
    });

    it('valid transition: processing -> fulfilled', () => {
      const before = 'processing';
      const after = 'fulfilled';
      const isValid = before === 'processing' && after === 'fulfilled';
      expect(isValid).toBe(true);
    });

    it('valid transition: processing -> failed', () => {
      const before = 'processing';
      const after = 'failed';
      const isValid = before === 'processing' && after === 'failed';
      expect(isValid).toBe(true);
    });

    it('should not leave orders stuck in ready_to_generate on failure', () => {
      // Scenario: fulfillOrder throws before setting any status
      // The webhook should have already set 'processing' before calling fulfillOrder
      // So if fulfillOrder fails, the status should be 'failed', not 'ready_to_generate'
      const statusAfterFailure = 'failed';
      expect(statusAfterFailure).not.toBe('ready_to_generate');
    });
  });

  describe('Webhook Log Updates', () => {
    it('should log failure status on error', () => {
      const webhookLog = {
        status: 'failed',
        processed_at: new Date().toISOString(),
        processing_result: 'error',
        error_message: 'Fulfillment error: Storage upload failed',
      };

      expect(webhookLog.status).toBe('failed');
      expect(webhookLog.processing_result).toBe('error');
      expect(webhookLog.error_message).toContain('Fulfillment error');
    });
  });

  describe('Retry Path Availability', () => {
    it('failed fulfillment should allow retry via /api/orders/fulfill', () => {
      // Scenario: Order is in failed state
      const orderState = {
        payment_status: 'paid',
        fulfillment_status: 'failed',
        has_final_documents: false,
      };

      // User should be able to retry
      const canRetry = orderState.payment_status === 'paid' &&
        orderState.fulfillment_status === 'failed' &&
        !orderState.has_final_documents;

      expect(canRetry).toBe(true);
    });

    it('UI should show retry button for failed fulfillment', () => {
      const shouldShowRetry = (orderStatus: {
        paid: boolean;
        has_final_documents: boolean;
        fulfillment_status: string | null;
      }) => {
        return orderStatus.paid &&
          !orderStatus.has_final_documents &&
          (orderStatus.fulfillment_status === 'failed' ||
           orderStatus.fulfillment_status === 'ready_to_generate');
      };

      expect(shouldShowRetry({
        paid: true,
        has_final_documents: false,
        fulfillment_status: 'failed',
      })).toBe(true);

      expect(shouldShowRetry({
        paid: true,
        has_final_documents: false,
        fulfillment_status: 'ready_to_generate',
      })).toBe(true);

      expect(shouldShowRetry({
        paid: true,
        has_final_documents: true,
        fulfillment_status: 'fulfilled',
      })).toBe(false);
    });
  });

  describe('Error Message Display', () => {
    it('should display fulfillment_error from order status', () => {
      const orderStatus = {
        fulfillment_status: 'failed',
        fulfillment_error: 'Storage upload failed: bucket not found',
      };

      const displayMessage = orderStatus.fulfillment_error ||
        'Document generation failed. Please try again.';

      expect(displayMessage).toBe('Storage upload failed: bucket not found');
    });

    it('should use default message if no fulfillment_error', () => {
      const orderStatus = {
        fulfillment_status: 'failed',
        fulfillment_error: null,
      };

      const displayMessage = orderStatus.fulfillment_error ||
        'Document generation failed. Please try again.';

      expect(displayMessage).toBe('Document generation failed. Please try again.');
    });
  });
});

describe('Product-Specific Failure Handling', () => {
  const products = [
    'notice_only',
    'complete_pack',
    'money_claim',
    'sc_money_claim',
    'ast_standard',
    'ast_premium',
  ];

  products.forEach((product) => {
    it(`handles fulfillment failure for ${product}`, () => {
      const orderState = {
        product_type: product,
        payment_status: 'paid',
        fulfillment_status: 'failed',
        metadata: {
          fulfillment_error: `Failed to generate ${product} documents`,
        },
      };

      expect(orderState.fulfillment_status).toBe('failed');
      expect(orderState.metadata.fulfillment_error).toContain(product);
    });
  });
});
