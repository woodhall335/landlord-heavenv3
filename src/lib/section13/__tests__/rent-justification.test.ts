import { describe, expect, it } from 'vitest';

import { calculateSection13RentJustification } from '@/lib/section13/rent-justification';

describe('calculateSection13RentJustification', () => {
  it('uses tick score as evidence-capped uplift rather than direct proposed increase percentage', () => {
    const result = calculateSection13RentJustification({
      selectedFactors: ['recent_refurbishment', 'new_kitchen_or_bathroom', 'parking_or_garage'],
      currentRent: 1000,
      proposedRent: 1120,
      marketLow: 1050,
      marketHigh: 1200,
      comparableCount: 4,
      evidenceStrength: 'moderate',
      conditionScenario: 'good',
    });

    expect(result.score).toBe(48);
    expect(result.marketHeadroom).toBe(200);
    expect(result.evidenceCappedJustifiedIncrease).toBe(96);
    expect(result.unexplainedIncrease).toBe(24);
    expect(result.summary).toContain('Some of the proposed uplift remains outside');
  });

  it('caps market-positive and selected factors at 100', () => {
    const result = calculateSection13RentJustification({
      selectedFactors: [
        'excellent_condition',
        'recent_refurbishment',
        'new_kitchen_or_bathroom',
        'strong_transport_links',
        'desirable_schools_or_amenities',
        'parking_or_garage',
        'garden_or_outdoor_space',
        'good_furnishing',
        'energy_efficiency_improvements',
        'bills_included',
      ],
      currentRent: 1000,
      proposedRent: 1100,
      marketLow: 1050,
      marketHigh: 1200,
      comparableCount: 6,
      evidenceStrength: 'strong',
      conditionScenario: 'excellent',
    });

    expect(result.score).toBe(100);
    expect(result.band).toBe('Strong');
    expect(result.evidenceCappedJustifiedIncrease).toBe(200);
    expect(result.unexplainedIncrease).toBe(-100);
  });

  it('keeps above-market pricing risk visible even with a good score', () => {
    const result = calculateSection13RentJustification({
      selectedFactors: ['excellent_condition', 'recent_refurbishment', 'parking_or_garage'],
      currentRent: 1000,
      proposedRent: 1300,
      marketLow: 1050,
      marketHigh: 1200,
      comparableCount: 6,
      evidenceStrength: 'strong',
      conditionScenario: 'excellent',
    });

    expect(result.score).toBe(33);
    expect(result.summary).toContain('market evidence still shows pricing risk');
  });
});
