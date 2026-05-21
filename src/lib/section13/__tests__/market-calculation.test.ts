import { describe, expect, it } from 'vitest';

import { createEmptySection13State } from '@/lib/section13/facts';
import { buildSection13MarketCalculation } from '@/lib/section13';
import type { Section13Comparable, Section13State } from '@/lib/section13/types';

function buildState(): Section13State {
  const state = createEmptySection13State();
  state.tenancy.bedrooms = 3;
  state.tenancy.currentRentAmount = 800;
  state.proposal.proposedRentAmount = 1800;
  state.proposal.proposedStartDate = '2026-08-01';
  state.proposal.serviceDate = '2026-05-01';
  state.tenancy.currentRentFrequency = 'monthly';
  state.adjustments.expectTenantChallenge = false;
  return state;
}

function buildComparable(
  monthlyEquivalent: number,
  overrides: Partial<Section13Comparable> = {}
): Section13Comparable {
  return {
    source: 'scraped',
    sourceDomain: 'example.com',
    sourceUrl: `https://example.com/${monthlyEquivalent}`,
    sourceDateKind: 'published',
    sourceDateValue: '2026-04-20',
    addressSnippet: `Comparable ${monthlyEquivalent}`,
    propertyType: 'House',
    postcodeRaw: 'LS28 0AA',
    postcodeNormalized: 'LS28 0AA',
    distanceMiles: 0.8,
    bedrooms: 3,
    rawRentValue: monthlyEquivalent,
    rawRentFrequency: 'pcm',
    monthlyEquivalent,
    weeklyEquivalent: Number(((monthlyEquivalent * 12) / 52).toFixed(2)),
    adjustedMonthlyEquivalent: monthlyEquivalent,
    isManual: false,
    sortOrder: 0,
    adjustments: [],
    metadata: {
      subjectPropertyType: 'house',
      subjectFurnishedStatus: 'furnished',
      furnishedStatus: 'furnished',
      subjectBillsIncluded: false,
      allInclusive: false,
    },
    ...overrides,
  };
}

describe('buildSection13MarketCalculation', () => {
  it('calculates the median only from comparables marked as used in calculation', () => {
    const state = buildState();
    const comparables = [
      buildComparable(1200, { addressSnippet: 'Used 1', sortOrder: 0 }),
      buildComparable(1250, { addressSnippet: 'Used 2', sortOrder: 1 }),
      buildComparable(1300, { addressSnippet: 'Used 3', sortOrder: 2 }),
      buildComparable(1350, { addressSnippet: 'Used 4', sortOrder: 3 }),
      buildComparable(1400, { addressSnippet: 'Used 5', sortOrder: 4 }),
      buildComparable(1450, { addressSnippet: 'Used 6', sortOrder: 5 }),
      buildComparable(1500, {
        addressSnippet: 'Context older listing',
        sortOrder: 6,
        sourceDateValue: '2026-01-15',
      }),
      buildComparable(2400, {
        addressSnippet: 'Excluded 5 bed outlier',
        sortOrder: 7,
        bedrooms: 5,
        distanceMiles: 6.2,
      }),
    ];

    const calculation = buildSection13MarketCalculation(
      state,
      comparables,
      new Date('2026-05-03T10:00:00.000Z')
    );

    expect(calculation.usedComparableCount).toBe(6);
    expect(calculation.contextComparables).toHaveLength(1);
    expect(calculation.excludedComparables).toHaveLength(1);
    expect(calculation.marketMedian).toBe(1325);
    expect(calculation.usedComparables.every((item) => item.usedInCalculation)).toBe(true);
    expect(calculation.contextComparables.every((item) => !item.usedInCalculation)).toBe(true);
    expect(calculation.medianExplanation).toContain('6 comparable listings used in the market calculation');
  });

  it('extends to the 180-day fallback only when fewer than three strong recent matches exist', () => {
    const state = buildState();
    const comparables = [
      buildComparable(1200, { addressSnippet: 'Fresh 1', sortOrder: 0, sourceDateValue: '2026-04-25' }),
      buildComparable(1250, { addressSnippet: 'Fresh 2', sortOrder: 1, sourceDateValue: '2026-04-18' }),
      buildComparable(1300, { addressSnippet: 'Extended fallback', sortOrder: 2, sourceDateValue: '2026-01-20' }),
      buildComparable(2000, { addressSnippet: 'Excluded mismatch', sortOrder: 3, bedrooms: 5 }),
    ];

    const calculation = buildSection13MarketCalculation(
      state,
      comparables,
      new Date('2026-05-03T10:00:00.000Z')
    );

    expect(calculation.freshnessWindowUsed).toBe(180);
    expect(calculation.usedComparableCount).toBe(3);
    expect(calculation.evidenceStrength).toBe('moderate');
    expect(calculation.usedComparables.some((item) => item.freshnessBand === 'extended_180')).toBe(true);
    expect(
      calculation.explanationText.some((line) => line.includes('extends to 180-day comparables'))
    ).toBe(true);
  });

  it('uses older fallback evidence up to 2 years only when current evidence is thin', () => {
    const state = buildState();
    const comparables = [
      buildComparable(1200, { addressSnippet: 'Fresh 1', sortOrder: 0, sourceDateValue: '2026-04-25' }),
      buildComparable(1250, { addressSnippet: 'Fresh 2', sortOrder: 1, sourceDateValue: '2026-04-18' }),
      buildComparable(1300, { addressSnippet: 'Older fallback', sortOrder: 2, sourceDateValue: '2025-01-20' }),
    ];

    const calculation = buildSection13MarketCalculation(
      state,
      comparables,
      new Date('2026-05-03T10:00:00.000Z')
    );

    expect(calculation.freshnessWindowUsed).toBe(730);
    expect(calculation.usedComparableCount).toBe(3);
    expect(calculation.evidenceStrength).toBe('moderate');
    expect(calculation.usedComparables.some((item) => item.freshnessBand === 'older_2_year_fallback')).toBe(true);
    expect(
      calculation.explanationText.some((line) => line.includes('up to 2 years'))
    ).toBe(true);
  });

  it('applies selected justification factors to the operative market range while preserving raw values', () => {
    const state = buildState();
    state.adjustments.justificationFactors = ['excellent_condition', 'recent_refurbishment', 'parking_or_garage'];
    const comparables = [
      buildComparable(1200, { addressSnippet: 'Fresh 1', sortOrder: 0 }),
      buildComparable(1300, { addressSnippet: 'Fresh 2', sortOrder: 1 }),
      buildComparable(1400, { addressSnippet: 'Fresh 3', sortOrder: 2 }),
    ];

    const calculation = buildSection13MarketCalculation(
      state,
      comparables,
      new Date('2026-05-03T10:00:00.000Z')
    );

    expect(calculation.rawMarketMedian).toBe(1300);
    expect(calculation.justificationAdjustmentPercent).toBe(25);
    expect(calculation.marketMedian).toBe(1625);
    expect(calculation.justifiedMarketHigh).toBe(1687.5);
    expect(calculation.explanationText.some((line) => line.includes('increase the supportable range by 25%'))).toBe(true);
  });

  it('treats scraped zero-mile distances as unknown instead of precise evidence', () => {
    const state = buildState();
    const comparables = [
      buildComparable(1200, { addressSnippet: 'Scraped zero', sortOrder: 0, distanceMiles: 0 }),
      buildComparable(1250, {
        addressSnippet: 'Manual exact',
        sortOrder: 1,
        source: 'manual_linked',
        isManual: true,
        distanceMiles: 0,
      }),
    ];

    const calculation = buildSection13MarketCalculation(
      state,
      comparables,
      new Date('2026-05-03T10:00:00.000Z')
    );

    const allAssessments = [
      ...calculation.usedComparables,
      ...calculation.contextComparables,
      ...calculation.excludedComparables,
    ];

    expect(allAssessments.find((item) => item.addressSnippet === 'Scraped zero')?.distanceMiles).toBeNull();
    expect(allAssessments.find((item) => item.addressSnippet === 'Manual exact')?.distanceMiles).toBe(0);
  });
});
