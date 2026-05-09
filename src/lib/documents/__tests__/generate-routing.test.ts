import { describe, expect, it } from 'vitest';

import {
  resolveGenerateValidationContext,
  resolveProductForDocument,
} from '@/lib/documents/generate-routing';

describe('documents/generate routing context', () => {
  it('treats court possession forms as complete-pack documents even when case facts are stale notice-only', () => {
    const facts = {
      __meta: { product: 'notice_only' },
      product: 'notice_only',
    };

    expect(resolveProductForDocument('n5_claim', facts)).toBe('complete_pack');
    expect(resolveProductForDocument('n119_particulars', facts)).toBe('complete_pack');
  });

  it('maps N5 and N119 validation to England complete_pack Section 8 instead of notice_only Section 21', () => {
    expect(
      resolveGenerateValidationContext({
        documentType: 'n5_claim',
        jurisdiction: 'england',
        effectiveRoute: 'section_21',
        caseFacts: { __meta: { product: 'notice_only' } },
      }),
    ).toEqual({ product: 'complete_pack', route: 'section_8' });

    expect(
      resolveGenerateValidationContext({
        documentType: 'n119_particulars',
        jurisdiction: 'england',
        effectiveRoute: 'section_21',
        requestedProduct: 'complete_pack',
      }),
    ).toEqual({ product: 'complete_pack', route: 'section_8' });
  });

  it('keeps official notice forms on notice-only validation rules', () => {
    expect(
      resolveGenerateValidationContext({
        documentType: 'section8_notice',
        jurisdiction: 'england',
        effectiveRoute: 'section_21',
        requestedProduct: 'complete_pack',
      }),
    ).toEqual({ product: 'notice_only', route: 'section_8' });

    expect(
      resolveGenerateValidationContext({
        documentType: 'section21_notice',
        jurisdiction: 'england',
        effectiveRoute: 'section_8',
        requestedProduct: 'complete_pack',
      }),
    ).toEqual({ product: 'notice_only', route: 'section_8' });
  });

  it('silently treats stale England section21_notice requests as current Form 3A routing', () => {
    expect(
      resolveGenerateValidationContext({
        documentType: 'section21_notice',
        jurisdiction: 'england',
        effectiveRoute: 'section_21',
        requestedProduct: 'notice_only',
      }),
    ).toEqual({ product: 'notice_only', route: 'section_8' });
  });

  it('coerces shared England Form 3A pack documents away from stale Section 21 routes', () => {
    expect(
      resolveGenerateValidationContext({
        documentType: 'service_instructions',
        jurisdiction: 'england',
        effectiveRoute: 'section_21',
        requestedProduct: 'complete_pack',
      }),
    ).toEqual({ product: 'complete_pack', route: 'section_8' });
  });

  it('keeps tenancy agreement generation on tenancy validation while preserving AST entitlements', () => {
    expect(resolveProductForDocument('ast_standard', {})).toBe('ast_standard');
    expect(
      resolveGenerateValidationContext({
        documentType: 'ast_standard',
        jurisdiction: 'england',
        effectiveRoute: 'section_8',
        requestedProduct: 'ast_standard',
      }),
    ).toEqual({ product: 'tenancy_agreement', route: 'tenancy_agreement' });
  });
});
