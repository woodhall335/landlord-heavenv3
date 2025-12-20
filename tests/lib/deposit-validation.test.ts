import { describe, expect, it } from 'vitest';
import { validateJurisdictionCompliance } from '@/lib/jurisdictions/validators';

describe('deposit validation is product aware', () => {
  it('does not block notice-only preview when deposit extras are missing', () => {
    const result = validateJurisdictionCompliance({
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        deposit_taken: false,
      },
      selectedGroundCodes: [],
      product: 'notice_only',
      route: 'section_21',
      stage: 'preview',
    });

    expect(result.blocking.find((i) => i.code === 'DEPOSIT_FIELD_REQUIRED')).toBeUndefined();
  });

  it('treats missing deposit metadata as warnings for notice-only preview when deposit is protected', () => {
    const result = validateJurisdictionCompliance({
      jurisdiction: 'england',
      facts: {
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_protected: true,
      },
      selectedGroundCodes: [],
      product: 'notice_only',
      route: 'section_21',
      stage: 'preview',
    });

    expect(result.blocking.find((i) => i.code === 'DEPOSIT_FIELD_REQUIRED')).toBeUndefined();
    expect(result.warnings.some((i) => i.code === 'DEPOSIT_FIELD_REQUIRED')).toBe(true);
  });
});
