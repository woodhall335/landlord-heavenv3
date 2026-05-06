import { describe, expect, it } from 'vitest';

import {
  buildPreviewCheckoutReturnUrl,
  buildSection13CheckoutFixHref,
} from '../checkoutNavigation';

describe('preview checkout navigation', () => {
  it('preserves the selected product in signup return URLs', () => {
    expect(
      buildPreviewCheckoutReturnUrl({
        caseId: 'case-123',
        product: 'section13_defensive',
      })
    ).toBe('/wizard/preview/case-123?product=section13_defensive');
  });

  it('preserves add-ons in signup return URLs', () => {
    expect(
      buildPreviewCheckoutReturnUrl({
        caseId: 'case-123',
        product: 'ast_standard',
        addOns: ['money_claim'],
      })
    ).toBe('/wizard/preview/case-123?product=ast_standard&add_ons=money_claim');
  });

  it('builds a Section 13 wizard recovery URL for checkout blocks', () => {
    expect(
      buildSection13CheckoutFixHref({
        caseId: 'case-123',
        product: 'section13_standard',
      })
    ).toBe(
      '/wizard/flow?type=rent_increase&case_id=case-123&product=section13_standard&entry=steps&source=checkout_blocked'
    );
  });
});
