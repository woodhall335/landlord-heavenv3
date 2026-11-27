import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getReviewIllustrationSrc } from '../reviewPresentation';

describe('Dedicated review banner coverage', () => {
  it('gives every active wizard and tenancy jurisdiction its own new banner', () => {
    const products = ['notice_only', 'complete_pack', 'money_claim', 'section13_standard',
      'england_standard_tenancy_agreement', 'england_premium_tenancy_agreement',
      'england_student_tenancy_agreement', 'england_hmo_shared_house_tenancy_agreement',
      'england_lodger_agreement'];
    const sources = [...products.map(product => getReviewIllustrationSrc(product)),
      ...['wales', 'scotland', 'northern-ireland'].map(jurisdiction => getReviewIllustrationSrc('ast_standard', jurisdiction))];
    expect(new Set(sources).size).toBe(12);
    for (const source of sources) {
      expect(source).toContain('/banners-v2/');
      expect(existsSync(join(process.cwd(), 'public', source))).toBe(true);
    }
  });
  it('keeps equivalent product aliases and Northern Ireland spelling consistent', () => {
    expect(getReviewIllustrationSrc('ast_premium')).toBe(getReviewIllustrationSrc('england_premium_tenancy_agreement'));
    expect(getReviewIllustrationSrc('section13_defensive')).toBe(getReviewIllustrationSrc('section13_standard'));
    expect(getReviewIllustrationSrc('ast_standard', 'northern_ireland')).toBe(getReviewIllustrationSrc('ast_standard', 'northern-ireland'));
  });
});
