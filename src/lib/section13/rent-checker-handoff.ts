import { createEmptySection13State, normalizeSection13State } from './facts';
import type { RentCheckerComparableListing, RentCheckerResult } from './rent-checker';
import type { Section13Comparable, Section13ProductSku, Section13State } from './types';

export const RENT_CHECKER_HANDOFF_STORAGE_KEY = 'section13-rent-checker-handoff';
export const SECTION13_WIZARD_DRAFT_STORAGE_PREFIX = 'section13-wizard-draft';

export type RentCheckerWizardDraft = {
  state: Section13State;
  comparables: Section13Comparable[];
};

function sourceDomainFromLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const label = value.toLowerCase();
  if (label.includes('rightmove')) return 'rightmove.co.uk';
  if (label.includes('openrent')) return 'openrent.co.uk';
  return value;
}

function listingToComparable(
  listing: RentCheckerComparableListing,
  sortOrder: number
): Section13Comparable {
  return {
    id: listing.id,
    postcodeRaw: null,
    postcodeNormalized: null,
    bedrooms: listing.bedrooms,
    source: 'scraped',
    sourceUrl: listing.sourceUrl,
    sourceDomain: sourceDomainFromLabel(listing.sourceLabel),
    sourceDateValue: listing.listedDate,
    sourceDateKind: listing.listedDate ? 'published' : 'unknown',
    addressSnippet: listing.address,
    propertyType: listing.propertyType,
    listedAt: listing.listedDate,
    distanceMiles: listing.distanceMiles,
    rawRentValue: listing.rentPcmRaw,
    rawRentFrequency: 'monthly',
    monthlyEquivalent: listing.rentPcmRaw,
    weeklyEquivalent: Number(((listing.rentPcmRaw * 12) / 52).toFixed(2)),
    adjustedMonthlyEquivalent: listing.rentPcmAdjusted,
    isManual: false,
    sortOrder,
    adjustments: [],
    metadata: {
      sourceLabel: listing.sourceLabel,
      imageUrl: listing.imageUrl,
      freshnessStatus: listing.freshnessStatus,
      reasonLabel: listing.reasonLabel,
      reasonDetail: listing.reasonDetail,
      adjustmentReason: listing.adjustmentReason,
      usedInCalculation: listing.usedInCalculation,
      source: 'rent_checker_handoff',
    },
  };
}

export function getSection13WizardDraftStorageKey(caseId: string): string {
  return `${SECTION13_WIZARD_DRAFT_STORAGE_PREFIX}:${caseId}`;
}

export function buildSection13WizardDraftFromRentCheckerResult(
  result: RentCheckerResult
): RentCheckerWizardDraft {
  const selectedPlan: Section13ProductSku = result.recommendedProduct;
  const base = createEmptySection13State(selectedPlan);
  const now = new Date().toISOString();
  const comparables = [
    ...result.usedComparableListings,
    ...result.contextComparableListings,
  ].map((listing, index) => listingToComparable(listing, index));

  const state = normalizeSection13State({
    ...base,
    selectedPlan,
    tenancy: {
      ...base.tenancy,
      postcodeRaw: result.postcodeOutcode,
      bedrooms: result.bedrooms,
      currentRentAmount: result.currentRent,
      currentRentFrequency: 'monthly',
    },
    proposal: {
      ...base.proposal,
      proposedRentAmount: result.proposedRent,
    },
    comparablesMeta: {
      ...base.comparablesMeta,
      searchPostcodeRaw: result.postcodeOutcode,
      bedrooms: result.bedrooms,
      propertyType: result.propertyType,
      propertySubtype: result.propertySubtype || null,
      freshnessWindowUsed: result.preview.marketCalculation.freshnessWindowUsed,
      lastScrapeAt: now,
      lastScrapeSource: 'rent_checker',
      lastScrapeSummary: result.scrapeSummary,
    },
    adjustments: {
      ...base.adjustments,
      conditionScenario: result.propertyCondition,
      justificationFactors: result.justificationAdjustmentFactors,
      expectTenantChallenge: result.challengeRisk !== 'low',
      challengeBandExplainer: result.preview.challengeBandExplainer,
      evidenceBandExplainer: result.preview.evidenceBandExplainer,
    },
    preview: result.preview,
  });

  return { state, comparables };
}
