import { describe, expect, it } from 'vitest';

import { createEmptySection13State } from '@/lib/section13/facts';
import {
  computeSection13Preview,
  getEvidenceStrengthBand,
  getSection13PlanRecommendation,
  validateSection13StartDate,
} from '@/lib/section13/rules';
import type { Section13Comparable } from '@/lib/section13/types';

function buildComparable(overrides: Partial<Section13Comparable> = {}): Section13Comparable {
  return {
    source: 'scraped',
    sourceDateKind: 'published',
    sourceDateValue: '2026-03-15',
    addressSnippet: 'Flat 2, Market Street',
    rawRentValue: 1200,
    rawRentFrequency: 'pcm',
    monthlyEquivalent: 1200,
    weeklyEquivalent: 276.92,
    adjustedMonthlyEquivalent: 1225,
    isManual: false,
    sortOrder: 0,
    adjustments: [],
    metadata: {},
    ...overrides,
  };
}

describe('Section 13 date rules', () => {
  it('uses 52 weeks when the annual drift is 6 days or less', () => {
    const result = validateSection13StartDate({
      tenancyStartDate: '2026-04-10',
      currentRentFrequency: 'weekly',
      proposedStartDate: '2029-04-06',
      serviceDate: '2029-01-01',
      lastRentIncreaseDate: '2028-04-05',
      firstIncreaseAfter2003Date: '2026-04-10',
    });

    expect(result.earliestValidStartDate).toBe('2029-04-06');
    expect(result.isValid).toBe(true);
  });

  it('forces 53 weeks once the drift would exceed 6 days', () => {
    const result = validateSection13StartDate({
      tenancyStartDate: '2026-04-10',
      currentRentFrequency: 'weekly',
      proposedStartDate: '2030-04-03',
      serviceDate: '2029-12-01',
      lastRentIncreaseDate: '2029-04-04',
      firstIncreaseAfter2003Date: '2026-04-10',
    });

    expect(result.earliestValidStartDate).toBe('2030-04-12');
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain(
      'The proposed start date is too early based on the previous increase and the 52/53-week anti-drift rule.'
    );
  });

  it('returns the next tenancy-period boundary for monthly dates', () => {
    const result = validateSection13StartDate({
      tenancyStartDate: '2026-01-31',
      currentRentFrequency: 'monthly',
      proposedStartDate: '2027-01-24',
      serviceDate: '2026-11-15',
    });

    expect(result.earliestValidStartDate).toBe('2027-01-31');
    expect(result.isValid).toBe(false);
  });
});

describe('Section 13 evidence and preview metrics', () => {
  it('classifies strong evidence deterministically', () => {
    const comparables = Array.from({ length: 8 }, (_, index) =>
      buildComparable({
        addressSnippet: `Comparable ${index + 1}`,
        sortOrder: index,
        sourceDateValue: '2026-03-10',
      })
    );

    expect(getEvidenceStrengthBand(comparables, new Date('2026-04-08T00:00:00.000Z'))).toBe('strong');
  });

  it('forces weak evidence when no source-backed comparables remain', () => {
    const state = createEmptySection13State();
    state.tenancy.tenantNames = ['Alex Tenant'];
    state.tenancy.propertyAddressLine1 = '1 Test Street';
    state.tenancy.propertyTownCity = 'Leeds';
    state.tenancy.postcodeRaw = 'LS1 1AA';
    state.tenancy.tenancyStartDate = '2025-04-10';
    state.tenancy.currentRentAmount = 1200;
    state.proposal.proposedRentAmount = 1300;
    state.proposal.proposedStartDate = '2026-06-01';
    state.proposal.serviceDate = '2026-03-15';
    state.comparablesMeta.bedrooms = 2;

    const comparables = [
      buildComparable({
        source: 'manual_unlinked',
        sourceDateKind: 'unknown',
      }),
      buildComparable({
        source: 'manual_unlinked',
        sourceDateKind: 'unknown',
        addressSnippet: 'Comparable 2',
        sortOrder: 1,
      }),
    ];

    const preview = computeSection13Preview(state, comparables, new Date('2026-04-08T00:00:00.000Z'));

    expect(preview.evidenceBand).toBe('weak');
    expect(preview.sourceBackedCount).toBe(0);
    expect(preview.canAutoGenerateJustification).toBe(false);
    expect(preview.warnings[0]).toContain('No valid source-backed comparables');
  });

  it('keeps strong evidence distinct from aggressive pricing in the challenge explanation', () => {
    const state = createEmptySection13State();
    state.tenancy.tenantNames = ['Alex Tenant'];
    state.tenancy.propertyAddressLine1 = '1 Test Street';
    state.tenancy.propertyTownCity = 'Leeds';
    state.tenancy.postcodeRaw = 'LS1 1AA';
    state.tenancy.tenancyStartDate = '2025-04-10';
    state.tenancy.currentRentAmount = 800;
    state.tenancy.currentRentFrequency = 'monthly';
    state.tenancy.bedrooms = 3;
    state.proposal.proposedRentAmount = 1800;
    state.proposal.proposedStartDate = '2026-06-01';
    state.proposal.serviceDate = '2026-03-15';

    const comparables = [1200, 1250, 1300, 1350, 1400, 1450].map((rent, index) =>
      buildComparable({
        addressSnippet: `Comparable ${index + 1}`,
        bedrooms: 3,
        propertyType: 'House',
        distanceMiles: 0.8,
        monthlyEquivalent: rent,
        rawRentValue: rent,
        adjustedMonthlyEquivalent: rent,
        sourceDateValue: '2026-04-01',
        metadata: {
          subjectPropertyType: 'house',
          subjectFurnishedStatus: 'furnished',
          furnishedStatus: 'furnished',
          subjectBillsIncluded: false,
          allInclusive: false,
        },
      })
    );

    const preview = computeSection13Preview(state, comparables, new Date('2026-05-03T00:00:00.000Z'));

    expect(preview.evidenceBand).toBe('strong');
    expect(preview.challengeBand).toBe('higher_likelihood');
    expect(preview.challengeReasonSummary).toContain('proposed rent is high compared with the justified market calculation');
    expect(preview.saferRangeGuidance).toContain('£');
  });

  it('recommends Standard by default for lower-risk cases', () => {
    const recommendation = getSection13PlanRecommendation({
      comparableCount: 6,
      challengeBand: 'moderate_likelihood',
      challengeBandLabel: 'Moderate likelihood of challenge',
      evidenceBand: 'strong',
      evidenceBandLabel: 'Strong evidence',
      proposedPositionLabel: 'Within the adjusted comparable range',
    });

    expect(recommendation.recommendedPlan).toBe('section13_standard');
    expect(recommendation.headline).toContain('Standard');
  });

  it('recommends Defence when challenge risk is elevated', () => {
    const recommendation = getSection13PlanRecommendation({
      comparableCount: 6,
      challengeBand: 'elevated_likelihood',
      challengeBandLabel: 'Elevated likelihood of challenge',
      evidenceBand: 'moderate',
      evidenceBandLabel: 'Moderate evidence',
      proposedPositionLabel: 'Toward the top of the adjusted comparable range',
    });

    expect(recommendation.recommendedPlan).toBe('section13_defensive');
    expect(recommendation.reason).toContain('Elevated likelihood of challenge');
  });

  it('recommends Defence when the landlord expects pushback', () => {
    const recommendation = getSection13PlanRecommendation(
      {
        comparableCount: 6,
        challengeBand: 'moderate_likelihood',
        challengeBandLabel: 'Moderate likelihood of challenge',
        evidenceBand: 'strong',
        evidenceBandLabel: 'Strong evidence',
        proposedPositionLabel: 'Within the adjusted comparable range',
      },
      { expectTenantChallenge: true }
    );

    expect(recommendation.recommendedPlan).toBe('section13_defensive');
    expect(recommendation.reason).toContain('expect pushback');
  });

  it('keeps Standard as the starting recommendation before comparables exist', () => {
    const recommendation = getSection13PlanRecommendation({
      comparableCount: 0,
      challengeBand: 'higher_likelihood',
      challengeBandLabel: 'Higher likelihood of challenge',
      evidenceBand: 'weak',
      evidenceBandLabel: 'Weak evidence',
      proposedPositionLabel: 'No comparable market position yet',
    });

    expect(recommendation.recommendedPlan).toBe('section13_standard');
    expect(recommendation.reason).toContain('Run the local listings check next');
  });
});
