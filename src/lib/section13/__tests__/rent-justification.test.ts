import { describe, expect, it } from 'vitest';

import { calculateSection13RentJustification } from '@/lib/section13/rent-justification';

describe('calculateSection13RentJustification', () => {
  it('uses selected factors to adjust the supportable range directly', () => {
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
    expect(result.justificationAdjustmentPercent).toBe(19);
    expect(result.adjustedMarketHigh).toBe(1428);
    expect(result.marketHeadroom).toBe(428);
    expect(result.evidenceCappedJustifiedIncrease).toBe(205.44);
    expect(result.unexplainedIncrease).toBe(-85.44);
    expect(result.summary).toContain('adjust the supportable market range by 19%');
  });

  it('caps market-positive score at 100 and selected adjustment at 30%', () => {
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
    expect(result.justificationAdjustmentPercent).toBe(30);
    expect(result.justificationAdjustmentCapped).toBe(true);
    expect(result.adjustedMarketHigh).toBe(1560);
    expect(result.evidenceCappedJustifiedIncrease).toBe(560);
    expect(result.unexplainedIncrease).toBe(-460);
  });

  it('assesses above-market pricing against the adjusted supportable range', () => {
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
    expect(result.justificationAdjustmentPercent).toBe(25);
    expect(result.adjustedMarketHigh).toBe(1500);
    expect(result.summary).not.toContain('market evidence still shows pricing risk');
  });

  it('keeps condition factors mutually exclusive', () => {
    const result = calculateSection13RentJustification({
      selectedFactors: ['excellent_condition', 'good_condition'],
      currentRent: 1000,
      proposedRent: 1100,
      marketLow: 1000,
      marketHigh: 1200,
      comparableCount: 3,
      evidenceStrength: 'moderate',
      conditionScenario: 'excellent',
    });

    expect(result.selectedFactors).toEqual(['excellent_condition']);
    expect(result.justificationAdjustmentPercent).toBe(12);
  });
});
