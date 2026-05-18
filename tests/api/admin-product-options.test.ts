import { describe, expect, it } from 'vitest';

import { ADMIN_PRODUCT_OPTIONS, getAdminProductLabel } from '@/lib/admin/products';

describe('admin product options', () => {
  it('includes Section 13 products for admin order and case filters', () => {
    expect(ADMIN_PRODUCT_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: 'section13_standard', label: 'Supported Rent Increase Pack' },
        { value: 'section13_defensive', label: 'Tribunal-Ready Rent Increase Pack' },
      ])
    );
  });

  it('maps Section 13 product labels consistently', () => {
    expect(getAdminProductLabel('section13_standard')).toBe('Supported Rent Increase Pack');
    expect(getAdminProductLabel('section13_defensive')).toBe('Tribunal-Ready Rent Increase Pack');
  });
});
