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
    expect(result.evidenceCappedJustifiedIncrease).toBe(428);
    expect(result.unexplainedIncrease).toBe(-308);
    expect(result.unsupportedIncrease).toBe(0);
    expect(result.headroomRemaining).toBe(308);
    expect(result.summary).toContain('adjust the supportable market range by 19%');
    expect(result.summary).toContain('Selected factors support the full £120 uplift');
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

    expect(result.score).toBe(53);
    expect(result.justificationAdjustmentPercent).toBe(25);
    expect(result.adjustedMarketHigh).toBe(1500);
    expect(result.summary).not.toContain('market evidence still shows pricing risk');
  });

  it('uses displayed adjusted headroom rather than score-weighted headroom', () => {
    const result = calculateSection13RentJustification({
      selectedFactors: [
        'good_condition',
        'recent_refurbishment',
        'new_kitchen_or_bathroom',
        'desirable_schools_or_amenities',
        'parking_or_garage',
        'strong_transport_links',
        'garden_or_outdoor_space',
        'good_furnishing',
      ],
      currentRent: 900,
      proposedRent: 1400,
      marketLow: 1100,
      marketHigh: 1300,
      comparableCount: 5,
      evidenceStrength: 'moderate',
      conditionScenario: 'good',
    });

    expect(result.score).toBe(71);
    expect(result.justificationAdjustmentPercent).toBe(30);
    expect(result.adjustedMarketHigh).toBe(1690);
    expect(result.marketHeadroom).toBe(790);
    expect(result.proposedIncrease).toBe(500);
    expect(result.evidenceCappedJustifiedIncrease).toBe(790);
    expect(result.unsupportedIncrease).toBe(0);
    expect(result.headroomRemaining).toBe(290);
    expect(result.summary).toMatch(/Selected factors support the full £500 uplift, with £290 headroom remaining\./);
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
