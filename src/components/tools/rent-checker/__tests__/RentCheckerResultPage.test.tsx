/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { buildComparableFromPartial, buildRentCheckerResult, type RentCheckerInput } from '@/lib/section13';
import { RENT_CHECKER_HANDOFF_STORAGE_KEY } from '@/lib/section13/rent-checker-handoff';
import { RentCheckerResultPage } from '../RentCheckerResultPage';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

function makeInput(overrides: Partial<RentCheckerInput> = {}): RentCheckerInput {
  return {
    sessionId: 'test-result-session',
    userType: 'landlord',
    postcode: 'LS28 7HF',
    bedrooms: 3,
    propertyType: 'house',
    propertySubtype: 'semi_detached',
    furnishedStatus: 'furnished',
    currentRent: 1000,
    rentFrequency: 'monthly',
    proposedRent: 1300,
    tenancyStartDate: '2024-01-01',
    lastRentIncreaseDate: '2025-01-01',
    desiredIncreaseStartDate: '2026-08-01',
    propertyCondition: 'average',
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
        sourceUrl: `https://example.com/listing-${index + 1}`,
        sourceDomain: 'rightmove.co.uk',
        sourceDateKind: 'published',
        sourceDateValue: `2026-05-${String(10 + index).padStart(2, '0')}`,
        addressSnippet: `${index + 1} Example Road`,
        propertyType: 'Semi-Detached',
        postcodeRaw: 'LS28 7HF',
        postcodeNormalized: 'LS28 7HF',
        distanceMiles: 0.8,
        bedrooms: 3,
        rawRentValue: value,
        rawRentFrequency: 'pcm',
        isManual: false,
        adjustments: [],
        metadata: {
          subjectPropertyType: 'house',
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

describe('RentCheckerResultPage', () => {
  it('shows a simplified pre-check result and keeps comparable data for wizard handoff', () => {
    const result = buildRentCheckerResult({
      input: makeInput(),
      comparables: makeComparables([1125, 1300, 1375]),
      scrapeSource: 'rightmove',
      scrapeSummary: 'Imported comparables',
      now: new Date('2026-06-01T10:00:00.000Z'),
    });

    render(<RentCheckerResultPage result={result} onRestart={vi.fn()} />);

    expect(screen.getByText('Prepare evidence')).toBeInTheDocument();
    expect(screen.getByText('Supportable market range')).toBeInTheDocument();
    expect(screen.getByText(/Why we marked this as/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Prepare my tribunal-ready rent increase pack/i }).length).toBeGreaterThan(0);

    expect(screen.queryByRole('heading', { name: 'Comparable evidence' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Get your full rent evidence report' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Route comparison' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Want full protection?' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('tool-upsell-cta')[0]);
    const stored = window.sessionStorage.getItem(RENT_CHECKER_HANDOFF_STORAGE_KEY);
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored || '{}').draft.comparables).toHaveLength(3);
  });
});
