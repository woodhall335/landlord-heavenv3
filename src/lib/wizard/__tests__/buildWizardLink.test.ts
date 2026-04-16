import { describe, expect, it } from 'vitest';
import {
  getFallbackProduct,
  getUnsupportedProductMessage,
  isProductSupportedInJurisdiction,
} from '../buildWizardLink';

describe('buildWizardLink support helpers', () => {
  it('treats complete_pack as England only', () => {
    expect(isProductSupportedInJurisdiction('complete_pack', 'england')).toBe(true);
    expect(isProductSupportedInJurisdiction('complete_pack', 'wales')).toBe(false);
    expect(isProductSupportedInJurisdiction('complete_pack', 'scotland')).toBe(false);
    expect(isProductSupportedInJurisdiction('complete_pack', 'northern-ireland')).toBe(false);
  });

  it('treats money_claim as England only', () => {
    expect(isProductSupportedInJurisdiction('money_claim', 'england')).toBe(true);
    expect(isProductSupportedInJurisdiction('money_claim', 'wales')).toBe(false);
    expect(isProductSupportedInJurisdiction('money_claim', 'scotland')).toBe(false);
  });

  it('keeps notice_only available in Wales and Scotland only, not Northern Ireland', () => {
    expect(isProductSupportedInJurisdiction('notice_only', 'england')).toBe(true);
    expect(isProductSupportedInJurisdiction('notice_only', 'wales')).toBe(true);
    expect(isProductSupportedInJurisdiction('notice_only', 'scotland')).toBe(true);
    expect(isProductSupportedInJurisdiction('notice_only', 'northern-ireland')).toBe(false);
  });

  it('falls back from unsupported Wales and Scotland court/debt products to notice_only', () => {
    expect(getFallbackProduct('complete_pack', 'wales')).toBe('notice_only');
    expect(getFallbackProduct('complete_pack', 'scotland')).toBe('notice_only');
    expect(getFallbackProduct('money_claim', 'wales')).toBe('notice_only');
    expect(getFallbackProduct('money_claim', 'scotland')).toBe('notice_only');
  });

  it('returns product-specific unsupported messages for Scotland and Wales', () => {
    expect(getUnsupportedProductMessage('complete_pack', 'scotland')).toContain('England only');
    expect(getUnsupportedProductMessage('money_claim', 'wales')).toContain('England only');
  });
});
