import { describe, expect, it } from 'vitest';

import {
  getRentArrearsResultCtas,
  getSection13ResultProductHref,
} from '@/lib/tools/result-ctas';

describe('tool result CTAs', () => {
  it('routes lower arrears results to money claim before possession', () => {
    const ctas = getRentArrearsResultCtas(750, 1_000);

    expect(ctas?.primaryAction).toEqual({
      label: 'Prepare my money claim',
      href: '/products/money-claim',
    });
    expect(ctas?.secondaryAction.href).toBe('/tools/free-rent-demand-letter');
  });

  it('routes two-month arrears results to notice first and money claim second', () => {
    const ctas = getRentArrearsResultCtas(2_400, 1_000);

    expect(ctas?.primaryAction.href).toBe('/products/notice-only');
    expect(ctas?.secondaryAction.href).toBe('/products/money-claim');
  });

  it('maps Section 13 checker recommendations to the exact product owner page', () => {
    expect(getSection13ResultProductHref('section13_standard')).toBe(
      '/products/section-13-standard'
    );
    expect(getSection13ResultProductHref('section13_defensive')).toBe(
      '/products/section-13-defence'
    );
  });
});
