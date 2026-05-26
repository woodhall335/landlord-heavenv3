import { describe, expect, it } from 'vitest';

import { buildComparableFromPartial, buildRentCheckerResult, type RentCheckerInput } from '@/lib/section13';

function makeInput(overrides: Partial<RentCheckerInput> = {}): RentCheckerInput {
  return {
    sessionId: 'test-session',
    userType: 'landlord',
    postcode: 'SW1A 1AA',
    bedrooms: 2,
    propertyType: 'flat',
    propertySubtype: 'purpose_built_flat',
    furnishedStatus: 'furnished',
    currentRent: 1000,
    rentFrequency: 'monthly',
    proposedRent: 1100,
    tenancyStartDate: '2024-01-01',
    lastRentIncreaseDate: '2025-01-01',
    desiredIncreaseStartDate: '2026-08-01',
    propertyCondition: 'good',
    billsIncluded: false,
    comparableEvidenceAvailable: 'yes',
    tenantAlreadyObjected: false,
    ...overrides,
  };
}

function makeComparables(values: number[]) {
  return values.map((value, index) =>
    buildComparableFromPartial(
      {
        source: 'scraped',
        sourceUrl: `https://example.com/${index + 1}`,
        sourceDomain: 'example.com',
        sourceDateKind: 'published',
        sourceDateValue: `2026-04-${String(20 - index).padStart(2, '0')}`,
        addressSnippet: `${index + 1} Example Street`,
        propertyType: 'Flat',
        postcodeRaw: 'SW1A 1AA',
        postcodeNormalized: 'SW1A 1AA',
        distanceMiles: 0.8,
        bedrooms: 2,
        rawRentValue: value,
        rawRentFrequency: 'pcm',
        isManual: false,
        adjustments: [],
        metadata: {
          imageUrl: `https://example.com/image-${index + 1}.jpg`,
          subjectPropertyType: 'flat',
          subjectFurnishedStatus: 'furnished',
          furnishedStatus: 'furnished',
          subjectBillsIncluded: false,
          allInclusive: false,
        },
      },
      index
    )
  );
}

describe('buildRentCheckerResult', () => {
  const now = new Date('2026-05-03T10:00:00.000Z');

  it('returns landlord_low_risk for supportable rent with strong evidence', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ currentRent: 1000, proposedRent: 1100 }),
      comparables: makeComparables([1175, 1180, 1190, 1200, 1210, 1220]),
      scrapeSource: 'direct',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_low_risk');
    expect(result.recommendedProduct).toBe('section13_standard');
    expect(result.userType).toBe('landlord');
    expect(result.propertyType).toBe('flat');
    expect(result.propertySubtype).toBe('purpose_built_flat');
    expect(result.propertyCondition).toBe('good');
    expect(result.evidenceStrength).toBe('Strong');
    expect(result.challengeRisk).toBe('low');
    expect(result.usedComparableListings).toHaveLength(6);
    expect(result.contextComparableListings).toHaveLength(0);
    expect(result.excludedComparableListings).toHaveLength(0);
    expect(result.usedComparableListings[0]?.imageUrl).toBe('https://example.com/image-1.jpg');
    expect(result.usedComparableListings[0]?.address).toBe('1 Example Street');
    expect(result.medianExplanation).toContain('Median calculated from 6 comparable listings');
  });

  it('returns landlord_moderate_risk with strong evidence near the median', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ currentRent: 900, proposedRent: 1020 }),
      comparables: makeComparables([980, 990, 1000, 1010, 1020, 1030]),
      scrapeSource: 'direct',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_moderate_risk');
    expect(result.evidenceStrength).toBe('Strong');
    expect(result.showDefenceSecondary).toBe(true);
    expect(result.secondaryCtaLabel).toBe('Start with standard notice pack');
  });

  it('returns landlord_high_risk when evidence is weak', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ proposedRent: 1400 }),
      comparables: makeComparables([1000, 1010]),
      scrapeSource: 'direct',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_high_risk');
    expect(result.recommendedProduct).toBe('section13_defensive');
    expect(result.evidenceStrength).toBe('Weak');
    expect(result.showBundleUpsell).toBe(true);
  });

  it('explains the difference between strong evidence and aggressive pricing', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ currentRent: 800, proposedRent: 1800 }),
      comparables: makeComparables([1200, 1250, 1300, 1350, 1400, 1450]),
      scrapeSource: 'blended_live',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_high_risk');
    expect(result.evidenceStrength).toBe('Strong');
    expect(result.challengeRisk).toBe('high');
    expect(result.headline).toContain('above the supported market position');
    expect(result.subheadline).toContain('Evidence strength is strong');
    expect(result.challengeExplanation).toContain('proposed rent is high compared with the justified market calculation');
    expect(result.saferRangeGuidance).toBeTruthy();
  });

  it('keeps the moderate landlord route landlord-facing even with strong evidence', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ currentRent: 925, proposedRent: 1030 }),
      comparables: makeComparables([980, 990, 1000, 1010, 1020, 1030]),
      scrapeSource: 'direct',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_moderate_risk');
    expect(result.primaryCtaLabel).toBe('Prepare my tribunal-ready file - £69.99');
    expect(result.secondaryCtaLabel).toBe('Start with standard notice pack');
  });
});
