import { describe, expect, it } from 'vitest';

import {
  hasPreviewProductMismatch,
  resolveWizardPreviewProduct,
} from '../preview-product';

describe('wizard preview product resolution', () => {
  it('uses the paid order product over a stale URL product', () => {
    expect(
      resolveWizardPreviewProduct({
        lockedProduct: 'england_standard_tenancy_agreement',
        urlProduct: 'notice_only',
        caseType: 'tenancy_agreement',
      })
    ).toBe('england_standard_tenancy_agreement');
  });

  it('uses the URL product for unpaid checkout previews', () => {
    expect(
      resolveWizardPreviewProduct({
        lockedProduct: null,
        urlProduct: 'notice_only',
        caseType: 'eviction',
      })
    ).toBe('notice_only');
  });

  it('falls back to Section 13 selected plan before case-type defaults', () => {
    expect(
      resolveWizardPreviewProduct({
        section13SelectedPlan: 'section13_defensive',
        caseType: 'rent_increase',
      })
    ).toBe('section13_defensive');
  });

  it('infers notice-only only when eviction markers exist on an eviction case', () => {
    expect(
      resolveWizardPreviewProduct({
        wizardFacts: { selected_notice_route: 'section_8' },
        originalMeta: { flow: 'notice_only' },
        caseType: 'eviction',
      })
    ).toBe('notice_only');
  });

  it('detects mismatched URL and paid order products', () => {
    expect(hasPreviewProductMismatch('england_standard_tenancy_agreement', 'notice_only')).toBe(
      true
    );
    expect(hasPreviewProductMismatch('notice_only', 'notice_only')).toBe(false);
    expect(hasPreviewProductMismatch(null, 'notice_only')).toBe(false);
  });
});
