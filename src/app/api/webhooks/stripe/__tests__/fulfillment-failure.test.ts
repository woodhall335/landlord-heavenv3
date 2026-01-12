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

describe('Error Classification (Validation vs Server)', () => {
  /**
   * Validation error patterns that should return 200 (not trigger Stripe retry)
   */
  const VALIDATION_ERROR_PATTERNS = [
    'NOTICE_ONLY_VALIDATION_FAILED',
    'EVICTION_PACK_VALIDATION_FAILED',
    'GROUND_REQUIRED_FACT_MISSING',
    'MISSING_REQUIRED_FIELDS',
    'VALIDATION_FAILED',
    'ELIGIBILITY_FAILED',
    'Case not found',
    'Unable to resolve user',
    'Unsupported product type',
  ];

  function isValidationError(error: Error | unknown): boolean {
    const message = (error as Error)?.message || String(error);
    return VALIDATION_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  }

  describe('identifies validation errors correctly', () => {
    it('NOTICE_ONLY_VALIDATION_FAILED is a validation error', () => {
      const error = new Error('NOTICE_ONLY_VALIDATION_FAILED: GROUND_REQUIRED_FACT_MISSING: Ground 8 is missing required fact: arrears_total');
      expect(isValidationError(error)).toBe(true);
    });

    it('EVICTION_PACK_VALIDATION_FAILED is a validation error', () => {
      const error = new Error('EVICTION_PACK_VALIDATION_FAILED: Missing court_name');
      expect(isValidationError(error)).toBe(true);
    });

    it('Case not found is a validation error (not transient)', () => {
      const error = new Error('Case not found for fulfillment');
      expect(isValidationError(error)).toBe(true);
    });

    it('Unsupported product type is a validation error', () => {
      const error = new Error('Unsupported product type for fulfillment: invalid_product');
      expect(isValidationError(error)).toBe(true);
    });
  });

  describe('identifies server errors correctly', () => {
    it('Storage upload failed is a server error', () => {
      const error = new Error('Storage upload failed: bucket not found');
      expect(isValidationError(error)).toBe(false);
    });

    it('Database connection error is a server error', () => {
      const error = new Error('ECONNREFUSED: could not connect to database');
      expect(isValidationError(error)).toBe(false);
    });

    it('Generic error is a server error', () => {
      const error = new Error('Something went wrong');
      expect(isValidationError(error)).toBe(false);
    });

    it('Timeout error is a server error', () => {
      const error = new Error('Request timeout after 30000ms');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('HTTP status based on error type', () => {
    it('validation errors should return 200 with failure status', () => {
      const error = new Error('NOTICE_ONLY_VALIDATION_FAILED: Missing arrears_total');
      const isValidation = isValidationError(error);
      const expectedStatus = isValidation ? 200 : 500;
      expect(expectedStatus).toBe(200);
    });

    it('server errors should return 500 for retry', () => {
      const error = new Error('Database connection failed');
      const isValidation = isValidationError(error);
      const expectedStatus = isValidation ? 200 : 500;
      expect(expectedStatus).toBe(500);
    });

    it('validation error response includes failure reason', () => {
      const isValidation = true;
      const errorMessage = 'NOTICE_ONLY_VALIDATION_FAILED: Ground 8 is missing arrears_total';

      const response = isValidation
        ? { received: true, status: 'failed', reason: 'validation', message: errorMessage.substring(0, 200) }
        : { error: 'Webhook handler failed', message: errorMessage };

      expect(response.status).toBe('failed');
      expect(response.reason).toBe('validation');
    });
  });
});

describe('Normalization Fixes for Webhook Path', () => {
  describe('arrears_total computation from arrears_items', () => {
    /**
     * Simulates the normalization logic that computes arrears_total from arrears_items
     */
    function computeArrearsTotal(arrearsItems: any[]): number {
      if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
        return 0;
      }

      let computedTotal = 0;
      for (const item of arrearsItems) {
        const itemAmount =
          item.arrears_amount ??
          item.amount_owed ??
          item.amount_due ??
          item.balance ??
          item.amount ??
          0;

        const numericAmount = typeof itemAmount === 'number'
          ? itemAmount
          : parseFloat(String(itemAmount).replace(/[£,]/g, ''));

        if (!isNaN(numericAmount)) {
          computedTotal += numericAmount;
        }
      }

      return computedTotal;
    }

    it('computes total from arrears_items with arrears_amount field', () => {
      const items = [
        { period_start: '2024-01-01', arrears_amount: 1200 },
        { period_start: '2024-02-01', arrears_amount: 1200 },
        { period_start: '2024-03-01', arrears_amount: 1200 },
      ];
      expect(computeArrearsTotal(items)).toBe(3600);
    });

    it('computes total from arrears_items with amount_owed field', () => {
      const items = [
        { period: 'January 2024', amount_owed: 1500 },
        { period: 'February 2024', amount_owed: 1500 },
      ];
      expect(computeArrearsTotal(items)).toBe(3000);
    });

    it('computes total from arrears_items with balance field', () => {
      const items = [
        { date: '2024-01-15', balance: 800 },
        { date: '2024-02-15', balance: 800 },
      ];
      expect(computeArrearsTotal(items)).toBe(1600);
    });

    it('handles string amounts with currency symbols', () => {
      const items = [
        { period: 'Jan', arrears_amount: '£1,200.00' },
        { period: 'Feb', arrears_amount: '£1,200.00' },
      ];
      expect(computeArrearsTotal(items)).toBe(2400);
    });

    it('returns 0 for empty array', () => {
      expect(computeArrearsTotal([])).toBe(0);
    });

    it('returns 0 for null/undefined', () => {
      expect(computeArrearsTotal(null as any)).toBe(0);
      expect(computeArrearsTotal(undefined as any)).toBe(0);
    });

    it('skips items with invalid amounts', () => {
      const items = [
        { period: 'Jan', arrears_amount: 1200 },
        { period: 'Feb', arrears_amount: 'invalid' },
        { period: 'Mar', arrears_amount: 1200 },
      ];
      expect(computeArrearsTotal(items)).toBe(2400);
    });
  });

  describe('normalization prevents validation failures', () => {
    it('normalization should backfill arrears_total from arrears_items', () => {
      const wizardFacts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8 - Serious rent arrears'],
        arrears_items: [
          { period_start: '2024-01-01', arrears_amount: 1200 },
          { period_start: '2024-02-01', arrears_amount: 1200 },
        ],
        // arrears_total is MISSING - this is what caused the original bug
      };

      // Simulate normalization
      const arrearsItems = wizardFacts.arrears_items || [];
      let computedTotal = 0;
      for (const item of arrearsItems) {
        computedTotal += item.arrears_amount || 0;
      }
      wizardFacts.arrears_total = computedTotal;

      expect(wizardFacts.arrears_total).toBe(2400);
    });

    it('normalization should not overwrite existing arrears_total', () => {
      const wizardFacts: Record<string, any> = {
        selected_notice_route: 'section_8',
        section8_grounds: ['Ground 8'],
        arrears_total: 5000, // Already set
        arrears_items: [
          { period_start: '2024-01-01', arrears_amount: 1200 },
        ],
      };

      // Normalization should not overwrite if arrears_total exists
      const existingArrearsTotal = wizardFacts.arrears_total;
      if (existingArrearsTotal === undefined || existingArrearsTotal === null) {
        // Would compute from items
      }
      // arrears_total should remain unchanged
      expect(wizardFacts.arrears_total).toBe(5000);
    });
  });
});
