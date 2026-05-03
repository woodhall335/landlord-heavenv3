import { describe, expect, it } from 'vitest';

import { buildComparableFromPartial, buildRentCheckerResult, type RentCheckerInput } from '@/lib/section13';

function makeInput(overrides: Partial<RentCheckerInput> = {}): RentCheckerInput {
  return {
    sessionId: 'test-session',
    userType: 'landlord',
    postcode: 'SW1A 1AA',
    bedrooms: 2,
    propertyType: 'flat',
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
        bedrooms: 2,
        rawRentValue: value,
        rawRentFrequency: 'pcm',
        isManual: false,
        adjustments: [],
        metadata: {
          imageUrl: `https://example.com/image-${index + 1}.jpg`,
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
    expect(result.evidenceStrength).toBe('Strong');
    expect(result.challengeRisk).toBe('low');
    expect(result.comparableListings).toHaveLength(6);
    expect(result.comparableListings[0]?.imageUrl).toBe('https://example.com/image-1.jpg');
    expect(result.comparableListings[0]?.address).toBe('1 Example Street');
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

  it('keeps the moderate landlord route landlord-facing even with strong evidence', () => {
    const result = buildRentCheckerResult({
      input: makeInput({ currentRent: 925, proposedRent: 1030 }),
      comparables: makeComparables([980, 990, 1000, 1010, 1020, 1030]),
      scrapeSource: 'direct',
      scrapeSummary: 'Imported comparables',
      now,
    });

    expect(result.resultState).toBe('landlord_moderate_risk');
    expect(result.primaryCtaLabel).toBe('Prepare for a tenant challenge');
    expect(result.secondaryCtaLabel).toBe('Start with standard notice pack');
  });
});
