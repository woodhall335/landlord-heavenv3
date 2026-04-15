import { describe, expect, it } from 'vitest';

import {
  deriveVisibleFulfillmentState,
  getRequestedProductTypeFromOrder,
  resolveFulfillmentProductForCase,
} from '../fulfillment-routing';

describe('resolveFulfillmentProductForCase', () => {
  it('maps generic England tenancy checkout back to the modern standard product', () => {
    expect(
      resolveFulfillmentProductForCase({
        productType: 'tenancy_agreement',
        jurisdiction: 'england',
        caseType: 'tenancy_agreement',
      })
    ).toBe('england_standard_tenancy_agreement');
  });

  it('maps legacy England AST aliases to the modern England tenancy product', () => {
    expect(
      resolveFulfillmentProductForCase({
        productType: 'ast_standard',
        jurisdiction: 'england',
        caseType: 'tenancy_agreement',
      })
    ).toBe('england_standard_tenancy_agreement');
  });

  it('prefers the requested product from order metadata for England tenancy retries', () => {
    expect(
      resolveFulfillmentProductForCase({
        productType: 'ast_standard',
        jurisdiction: 'england',
        caseType: 'tenancy_agreement',
        order: {
          product_type: 'ast_standard',
          metadata: {
            requested_product_type: 'england_student_tenancy_agreement',
          },
        },
      })
    ).toBe('england_student_tenancy_agreement');
  });

  it('leaves non-England tenancy aliases unchanged', () => {
    expect(
      resolveFulfillmentProductForCase({
        productType: 'ast_standard',
        jurisdiction: 'wales',
        caseType: 'tenancy_agreement',
      })
    ).toBe('ast_standard');
  });
});

describe('getRequestedProductTypeFromOrder', () => {
  it('reads the stored requested product from metadata', () => {
    expect(
      getRequestedProductTypeFromOrder({
        metadata: {
          requested_product_type: 'england_standard_tenancy_agreement',
        },
      })
    ).toBe('england_standard_tenancy_agreement');
  });

  it('returns null when metadata is unavailable', () => {
    expect(getRequestedProductTypeFromOrder({})).toBeNull();
  });
});

describe('deriveVisibleFulfillmentState', () => {
  it('treats incomplete processing orders with no final documents as failed', () => {
    expect(
      deriveVisibleFulfillmentState({
        fulfillmentStatus: 'processing',
        hasFinalDocuments: false,
        productType: 'england_standard_tenancy_agreement',
        metadata: {
          validation: 'incomplete',
          error: 'Missing generated documents',
        },
      })
    ).toEqual({
      fulfillmentStatus: 'failed',
      fulfillmentError: 'Missing generated documents',
    });
  });

  it('keeps Section 13 processing states unchanged', () => {
    expect(
      deriveVisibleFulfillmentState({
        fulfillmentStatus: 'processing',
        hasFinalDocuments: false,
        productType: 'section13_standard',
        metadata: {
          validation: 'incomplete',
          error: 'Waiting for bundle assets',
        },
      })
    ).toEqual({
      fulfillmentStatus: 'processing',
      fulfillmentError: 'Waiting for bundle assets',
    });
  });
});
