import { describe, expect, it } from 'vitest';
import { getGroundCodeFromPath } from '../AssistedPrepServicesShowcase';

describe('getGroundCodeFromPath', () => {
  it('identifies Section 8 Ground guide routes for the focused notice CTA', () => {
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-1a',
        'seo_ground_assisted_cta'
      )
    ).toBe('1a');
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-7a/',
        'seo_ground_assisted_cta'
      )
    ).toBe('7a');
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-17',
        'seo_ground_assisted_cta'
      )
    ).toBe('17');
  });

  it('keeps the general showcase for other contexts', () => {
    expect(
      getGroundCodeFromPath(
        '/section-8-grounds/how-to-evict-a-tenant-using-ground-8',
        'assisted_showcase'
      )
    ).toBeNull();
    expect(getGroundCodeFromPath('/tools/section-8-notice-date-calculator', 'seo_ground_assisted_cta')).toBeNull();
  });
});
