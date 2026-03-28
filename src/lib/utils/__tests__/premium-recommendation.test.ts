import { describe, expect, it } from 'vitest';

import { detectPremiumRecommendation } from '../premium-recommendation';

describe('detectPremiumRecommendation', () => {
  it('does not recommend England Premium purely because the facts look like a specialist student/HMO/shared-house route', () => {
    const result = detectPremiumRecommendation(
      {
        number_of_tenants: 4,
        tenants_unrelated: true,
        is_hmo: true,
        room_by_room_let: true,
        student_accommodation: true,
      },
      'england'
    );

    expect(result.isRecommended).toBe(false);
    expect(result.strength).toBe('none');
  });

  it('still recommends England Premium for ordinary-residential premium signals', () => {
    const result = detectPremiumRecommendation(
      {
        guarantor_required: true,
        rent_increase_clause: true,
      },
      'england'
    );

    expect(result.isRecommended).toBe(true);
    expect(result.strength).not.toBe('none');
  });

  it('filters England specialist-route signals out of the returned reasons when premium is still recommended for ordinary-residential add-ons', () => {
    const result = detectPremiumRecommendation(
      {
        is_hmo: true,
        room_by_room_let: true,
        guarantor_required: true,
      },
      'england'
    );

    expect(result.isRecommended).toBe(true);
    expect(result.reasons).toEqual(['guarantor_needed']);
    expect(result.message).not.toContain('HMO');
  });
});
