import { PRODUCTS, SEO_LANDING_ROUTES } from '@/lib/pricing/products';
import { createEmptySection13State, normalizeSection13State } from './facts';
import { maybeNormalizeUkPostcode } from './postcode';
import {
  addCalendarMonths,
  computeSection13Preview,
  getMonthlyEquivalent,
  getSourceBackedComparableCount,
  isFreshComparable,
  validateSection13StartDate,
} from './rules';
import type {
  Section13Comparable,
  Section13EvidenceStrengthBand,
  Section13ProductSku,
  Section13PreviewMetrics,
  Section13RentFrequency,
  Section13State,
} from './types';

export type RentCheckerUserType = 'landlord' | 'tenant';
export type RentCheckerPropertyType = 'flat' | 'house' | 'room' | 'hmo' | 'other';
export type RentCheckerFurnishedStatus = 'unfurnished' | 'part_furnished' | 'furnished';
export type RentCheckerPropertyCondition = 'below_average' | 'average' | 'good' | 'excellent';
export type RentCheckerComparableEvidenceAvailability = 'yes' | 'no' | 'not_sure';
export type RentCheckerChallengeRisk = 'low' | 'moderate' | 'high';
export type RentCheckerResultState =
  | 'landlord_low_risk'
  | 'landlord_moderate_risk'
  | 'landlord_high_risk'
  | 'tenant_challengeable'
  | 'tenant_within_market';
export type RentCheckerEvidenceStrength = Capitalize<Section13EvidenceStrengthBand>;

export interface RentCheckerInput {
  sessionId?: string | null;
  userType: RentCheckerUserType;
  postcode: string;
  bedrooms: number;
  propertyType: RentCheckerPropertyType;
  furnishedStatus: RentCheckerFurnishedStatus;
  currentRent: number;
  rentFrequency: Section13RentFrequency;
  proposedRent?: number | null;
  tenancyStartDate: string;
  lastRentIncreaseDate?: string | null;
  desiredIncreaseStartDate?: string | null;
  propertyCondition: RentCheckerPropertyCondition;
  billsIncluded: boolean;
  comparableEvidenceAvailable: RentCheckerComparableEvidenceAvailability;
  tenantAlreadyObjected: boolean;
}

export interface RentCheckerResult {
  sessionId: string | null;
  resultId?: string | null;
  userType: RentCheckerUserType;
  bedrooms: number;
  resultState: RentCheckerResultState;
  postcodeOutcode: string;
  recommendedProduct: Section13ProductSku;
  showBundleUpsell: boolean;
  showDefenceSecondary: boolean;
  headline: string;
  subheadline: string;
  moneyImpactLabel: string;
  moneyImpactValue: string;
  monthlyDiff: number;
  annualDiff: number;
  marketLow: number | null;
  marketMedian: number | null;
  marketHigh: number | null;
  currentRent: number;
  proposedRent: number | null;
  currentPositionLabel: string;
  proposedPositionLabel: string | null;
  overallPositionLabel: string;
  challengeRisk: RentCheckerChallengeRisk;
  challengeRiskLabel: 'Low' | 'Moderate' | 'High';
  evidenceStrength: RentCheckerEvidenceStrength;
  comparableCount: number;
  sourceBackedCount: number;
  freshComparableCount: number;
  freshnessLabel: string;
  whatThisMeans: string;
  nextSteps: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaSubtext: string;
  primaryCtaTracksCheckout: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaTracksCheckout?: boolean;
  bundleCtaHref: string;
  disclaimer: string;
  scrapeSource: 'direct' | 'proxy' | 'puppeteer' | 'demo';
  scrapeSummary: string;
  dateWarnings: string[];
  preview: Section13PreviewMetrics;
}

export interface RentCheckerAnalysisArgs {
  input: RentCheckerInput;
  comparables: Section13Comparable[];
  scrapeSource: 'direct' | 'proxy' | 'puppeteer' | 'demo';
  scrapeSummary: string;
  now?: Date;
}

const DISCLAIMER_TEXT =
  'This tool gives guidance based on the information entered and available comparable market evidence. It is not a formal valuation or legal advice.';

const FULL_DISCLAIMER_TEXT =
  'This tool provides guidance based on comparable market listings and the information entered. It is not a formal valuation or legal advice. For complex or disputed cases, consider independent advice.';

function getOutcode(postcode: string): string {
  const normalized = (maybeNormalizeUkPostcode(postcode) || postcode || '').trim().toUpperCase();
  const match = normalized.match(/^([A-Z]{1,2}\d[A-Z\d]?)\s?\d[A-Z]{2}$/i);
  if (match?.[1]) {
    return match[1].toUpperCase();
  }

  const compact = normalized.replace(/\s+/g, '');
  const compactMatch = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)/i);
  return compactMatch?.[1]?.toUpperCase() || compact || normalized;
}

function slugifyResultState(resultState: RentCheckerResultState): string {
  return resultState.replace(/_/g, '-');
}

function buildToolSessionId() {
  return `rent-checker-${Date.now()}`;
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '£0';
  return `£${Math.round(Number(value)).toLocaleString('en-GB')}`;
}

function formatSignedMoney(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatMoney(Math.abs(value))}`;
}

function roundCurrency(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Number(Number(value).toFixed(2));
}

function buildPrimaryWizardHref(product: Section13ProductSku, resultState: RentCheckerResultState) {
  const baseHref = PRODUCTS[product].wizardHref;
  const separator = baseHref.includes('?') ? '&' : '?';
  return `${baseHref}${separator}src=rent_checker&result_state=${slugifyResultState(resultState)}`;
}

function buildLandingHref(
  product: Section13ProductSku,
  resultState: RentCheckerResultState,
  extra?: Record<string, string>
) {
  const baseHref =
    product === 'section13_standard'
      ? SEO_LANDING_ROUTES.section13_standard
      : SEO_LANDING_ROUTES.section13_defensive;
  const params = new URLSearchParams({
    src: 'rent_checker',
    result_state: slugifyResultState(resultState),
    ...(extra || {}),
  }).toString();
  return `${baseHref}?${params}`;
}

function getCurrentPositionLabel(
  currentRentMonthly: number,
  marketLow: number | null,
  marketHigh: number | null
): string {
  if (marketLow == null || marketHigh == null) return 'Within range';
  if (currentRentMonthly < marketLow) return 'Below market';
  if (currentRentMonthly > marketHigh) return 'Above market';
  return 'Within range';
}

function getProposedPositionLabel(
  proposedRentMonthly: number | null,
  marketLow: number | null,
  marketMedian: number | null,
  marketHigh: number | null
): string | null {
  if (proposedRentMonthly == null || marketLow == null || marketMedian == null || marketHigh == null) {
    return null;
  }
  if (proposedRentMonthly > marketHigh) return 'Above market';
  if (proposedRentMonthly > marketMedian) return 'Above median';
  if (proposedRentMonthly < marketLow) return 'Below market';
  return 'Within range';
}

function toEvidenceStrengthLabel(band: Section13EvidenceStrengthBand): RentCheckerEvidenceStrength {
  switch (band) {
    case 'strong':
      return 'Strong';
    case 'moderate':
      return 'Moderate';
    case 'weak':
    default:
      return 'Weak';
  }
}

function toChallengeRiskLabel(risk: RentCheckerChallengeRisk): 'Low' | 'Moderate' | 'High' {
  switch (risk) {
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
    default:
      return 'High';
  }
}

function buildFreshnessLabel(comparableCount: number, freshComparableCount: number): string {
  if (comparableCount === 0) return 'No comparable data';
  if (freshComparableCount >= comparableCount) return 'Recent (within 90 days)';
  if (freshComparableCount === 0) return 'No recent comparables';
  return `${freshComparableCount} of ${comparableCount} within 90 days`;
}

function buildSyntheticState(input: RentCheckerInput, now = new Date()): Section13State {
  const selectedPlan: Section13ProductSku =
    input.userType === 'tenant' ? 'section13_defensive' : 'section13_standard';
  const base = createEmptySection13State(selectedPlan);
  const serviceDate = now.toISOString().slice(0, 10);
  const desiredStartDateCandidate =
    input.desiredIncreaseStartDate || addCalendarMonths(serviceDate, 2);
  const validationSeed = validateSection13StartDate({
    tenancyStartDate: input.tenancyStartDate,
    currentRentFrequency: input.rentFrequency,
    proposedStartDate: desiredStartDateCandidate,
    serviceDate,
    lastRentIncreaseDate: input.lastRentIncreaseDate || null,
  });
  const proposedStartDate =
    input.desiredIncreaseStartDate ||
    validationSeed.earliestValidStartDate ||
    desiredStartDateCandidate;

  return normalizeSection13State({
    ...base,
    selectedPlan,
    tenancy: {
      ...base.tenancy,
      tenantNames: ['Rent Checker'],
      propertyAddressLine1: 'Comparable market check',
      propertyTownCity: 'England',
      postcodeRaw: input.postcode,
      bedrooms: input.bedrooms,
      tenancyStartDate: input.tenancyStartDate,
      currentRentAmount: input.currentRent,
      currentRentFrequency: input.rentFrequency,
      lastRentIncreaseDate: input.lastRentIncreaseDate || null,
      firstIncreaseAfter2003Date: input.lastRentIncreaseDate || null,
    },
    landlord: {
      ...base.landlord,
      landlordName: 'Landlord',
      landlordAddressLine1: 'Market evidence review',
      landlordTownCity: 'England',
    },
    proposal: {
      ...base.proposal,
      proposedRentAmount:
        input.userType === 'tenant'
          ? roundCurrency(input.currentRent + 0.01)
          : roundCurrency(input.proposedRent),
      proposedStartDate,
      serviceDate,
      serviceMethod: 'post',
    },
    comparablesMeta: {
      ...base.comparablesMeta,
      searchPostcodeRaw: input.postcode,
      bedrooms: input.bedrooms,
      lastScrapeAt: now.toISOString(),
      lastScrapeSource: 'rent_checker',
      lastScrapeSummary: 'Rent checker comparable search',
    },
    adjustments: {
      ...base.adjustments,
      expectTenantChallenge: input.tenantAlreadyObjected,
    },
  });
}

function deriveEvidenceStrength(args: {
  comparableCount: number;
  freshComparableCount: number;
  sourceBackedCount: number;
  comparableEvidenceAvailable: RentCheckerComparableEvidenceAvailability;
  scrapeSource: 'direct' | 'proxy' | 'puppeteer' | 'demo';
}): RentCheckerEvidenceStrength {
  const {
    comparableCount,
    freshComparableCount,
    sourceBackedCount,
    comparableEvidenceAvailable,
    scrapeSource,
  } = args;

  if (
    comparableCount < 3 ||
    freshComparableCount < 3 ||
    comparableEvidenceAvailable === 'no' ||
    scrapeSource === 'demo'
  ) {
    return 'Weak';
  }

  const sourceBackedRatio = comparableCount > 0 ? sourceBackedCount / comparableCount : 0;

  if (comparableCount >= 6 && freshComparableCount >= 6 && sourceBackedRatio >= 0.7) {
    return 'Strong';
  }

  if (comparableCount >= 3 && freshComparableCount >= 3 && sourceBackedRatio >= 0.4) {
    return 'Moderate';
  }

  return 'Weak';
}

function deriveLandlordRisk(args: {
  proposedVsMedian: number;
  evidenceStrength: RentCheckerEvidenceStrength;
  tenantAlreadyObjected: boolean;
  hasDateWarnings: boolean;
}): RentCheckerChallengeRisk {
  const { proposedVsMedian, evidenceStrength, tenantAlreadyObjected, hasDateWarnings } = args;

  if (
    proposedVsMedian > 1.05 ||
    evidenceStrength === 'Weak' ||
    tenantAlreadyObjected ||
    hasDateWarnings
  ) {
    return 'high';
  }

  if (
    (proposedVsMedian > 0.98 && proposedVsMedian <= 1.05) ||
    evidenceStrength === 'Moderate'
  ) {
    return 'moderate';
  }

  return 'low';
}

function buildLowRiskResult(
  base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
  >
): RentCheckerResult {
  return {
    ...base,
    resultState: 'landlord_low_risk',
    headline: 'You can likely increase this rent safely',
    subheadline:
      'Your proposed rent sits within the supportable local market range and is backed by usable comparable evidence.',
    moneyImpactLabel: 'Potential uplift:',
    moneyImpactValue: `${formatSignedMoney(base.monthlyDiff)}/month (${formatSignedMoney(base.annualDiff)}/year)`,
    whatThisMeans:
      'This rent sits within the lower-to-mid range of comparable properties locally. Based on the information entered, this level appears supportable if the notice is served correctly and your evidence is kept with the file.',
    nextSteps: [
      'Generate a compliant Section 13 notice.',
      'Keep the market evidence with the notice.',
      'Record how and when the notice is served.',
      'Use the same figures across every document.',
    ],
    primaryCtaLabel: 'Generate my Section 13 notice',
    primaryCtaHref: buildPrimaryWizardHref('section13_standard', 'landlord_low_risk'),
    primaryCtaSubtext:
      'Create Form 4A, rent summary, justification report, cover letter, and proof of service.',
    primaryCtaTracksCheckout: true,
  };
}

function buildModerateRiskResult(
  base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
    | 'secondaryCtaLabel'
    | 'secondaryCtaHref'
    | 'secondaryCtaTracksCheckout'
  >
): RentCheckerResult {
  return {
    ...base,
    resultState: 'landlord_moderate_risk',
    headline: 'This increase looks supportable — but could be challenged',
    subheadline:
      'The market evidence supports the increase, but the risk of tenant challenge is not negligible.',
    moneyImpactLabel: 'Potential uplift:',
    moneyImpactValue: `${formatSignedMoney(base.monthlyDiff)}/month (${formatSignedMoney(base.annualDiff)}/year)`,
    whatThisMeans:
      'The proposed rent appears supported by comparable evidence, but it may be close enough to the upper market range that a tenant could question it. If challenged, the strength of your comparables, dates, service record, and explanation will matter.',
    nextSteps: [
      'Check that Form 4A dates are valid.',
      'Keep proof of service.',
      'Use recent comparable evidence.',
      'Prepare a response file in case the tenant refers it to tribunal.',
    ],
    primaryCtaLabel: 'Prepare for a tenant challenge',
    primaryCtaHref: buildPrimaryWizardHref('section13_defensive', 'landlord_moderate_risk'),
    primaryCtaSubtext:
      'Build the notice, evidence, and tribunal-ready defence file before the tenant challenges.',
    primaryCtaTracksCheckout: true,
    secondaryCtaLabel: 'Start with standard notice pack',
    secondaryCtaHref: buildPrimaryWizardHref('section13_standard', 'landlord_moderate_risk'),
    secondaryCtaTracksCheckout: true,
  };
}

function buildHighRiskResult(
  base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
    | 'secondaryCtaLabel'
    | 'secondaryCtaHref'
    | 'secondaryCtaTracksCheckout'
  >
): RentCheckerResult {
  return {
    ...base,
    resultState: 'landlord_high_risk',
    headline: 'This increase needs stronger evidence before you serve notice',
    subheadline:
      'The proposed figure may be above the supported market range or the evidence is not strong enough yet.',
    moneyImpactLabel: 'Potential uplift claimed:',
    moneyImpactValue: `${formatSignedMoney(base.monthlyDiff)}/month (${formatSignedMoney(base.annualDiff)}/year)`,
    whatThisMeans:
      'The proposed rent appears risky on the information entered. It may be above comparable market levels, supported by weak evidence, or likely to attract challenge. Serving now could increase the risk of a tenant referral or a reduced rent outcome.',
    nextSteps: [
      'Do not serve the notice until the dates and evidence are checked.',
      'Add stronger comparable evidence.',
      'Consider lowering the proposed figure.',
      'Prepare a tribunal defence file before sending Form 4A.',
    ],
    primaryCtaLabel: 'Build a defendable rent increase',
    primaryCtaHref: buildPrimaryWizardHref('section13_defensive', 'landlord_high_risk'),
    primaryCtaSubtext:
      'Strengthen the evidence and prepare for challenge before relying on the increase.',
    primaryCtaTracksCheckout: true,
    secondaryCtaLabel: 'View standard notice pack',
    secondaryCtaHref: buildLandingHref('section13_standard', 'landlord_high_risk', {
      intent: 'standard_notice',
    }),
    secondaryCtaTracksCheckout: false,
  };
}

function buildTenantChallengeableResult(
  base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
  >
): RentCheckerResult {
  return {
    ...base,
    resultState: 'tenant_challengeable',
    headline: 'This rent may be above market and challengeable',
    subheadline:
      'Based on the information entered, the rent appears higher than comparable local market evidence.',
    moneyImpactLabel: 'Possible over-market amount:',
    moneyImpactValue: `~${formatMoney(Math.abs(base.monthlyDiff))}/month (~${formatMoney(Math.abs(base.annualDiff))}/year)`,
    whatThisMeans:
      'The rent appears above the current comparable market range. If the landlord has served a valid Section 13 notice, you may be able to challenge the proposed rent before the new rent start date.',
    nextSteps: [
      'Check the Form 4A start date.',
      'Check how the notice was served.',
      'Compare similar homes nearby.',
      'Prepare your response before the deadline.',
    ],
    primaryCtaLabel: 'Check how to challenge this rent',
    primaryCtaHref: buildLandingHref('section13_defensive', 'tenant_challengeable', {
      audience: 'tenant',
    }),
    primaryCtaSubtext:
      'Review the notice, compare market evidence, and prepare your response before the deadline.',
    primaryCtaTracksCheckout: false,
  };
}

function buildTenantWithinMarketResult(
  base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
    | 'secondaryCtaLabel'
    | 'secondaryCtaHref'
    | 'secondaryCtaTracksCheckout'
  >
): RentCheckerResult {
  return {
    ...base,
    resultState: 'tenant_within_market',
    headline: 'This rent appears broadly within market range',
    subheadline:
      'The rent does not obviously sit above comparable local market evidence, but the notice still needs to be valid.',
    moneyImpactLabel: 'Estimated market position:',
    moneyImpactValue: 'within range',
    whatThisMeans:
      'The rent appears broadly consistent with similar local properties. However, a Section 13 notice can still fail if the wrong form, dates, timing, or service method were used.',
    nextSteps: [
      'Check the notice is Form 4A.',
      'Check the new rent start date.',
      'Check the service method.',
      'Get advice quickly if the deadline is close.',
    ],
    primaryCtaLabel: 'Check notice validity',
    primaryCtaHref: '/rent-increase?src=rent_checker&intent=notice_validity',
    primaryCtaSubtext:
      'Review the notice, timing, and service method before you decide whether to challenge it.',
    primaryCtaTracksCheckout: false,
    secondaryCtaLabel: 'Review challenge options',
    secondaryCtaHref: buildLandingHref('section13_defensive', 'tenant_within_market', {
      audience: 'tenant',
      intent: 'challenge_options',
    }),
    secondaryCtaTracksCheckout: false,
  };
}

export function buildRentCheckerResult({
  input,
  comparables,
  scrapeSource,
  scrapeSummary,
  now = new Date(),
}: RentCheckerAnalysisArgs): RentCheckerResult {
  const syntheticState = buildSyntheticState(input, now);
  const preview = computeSection13Preview(syntheticState, comparables, now);

  const comparableCount = comparables.length;
  const sourceBackedCount = getSourceBackedComparableCount(comparables);
  const freshComparableCount = comparables.filter((item) => isFreshComparable(item, now)).length;
  const evidenceStrength = deriveEvidenceStrength({
    comparableCount,
    freshComparableCount,
    sourceBackedCount,
    comparableEvidenceAvailable: input.comparableEvidenceAvailable,
    scrapeSource,
  });

  const currentRentMonthly = roundCurrency(getMonthlyEquivalent(input.currentRent, input.rentFrequency));
  const proposedRentMonthly =
    input.userType === 'landlord' && input.proposedRent != null
      ? roundCurrency(getMonthlyEquivalent(input.proposedRent, input.rentFrequency))
      : null;

  const marketLow = preview.lowerQuartile;
  const marketMedian = preview.median;
  const marketHigh = preview.upperQuartile;
  const currentPositionLabel = getCurrentPositionLabel(currentRentMonthly, marketLow, marketHigh);
  const proposedPositionLabel = getProposedPositionLabel(
    proposedRentMonthly,
    marketLow,
    marketMedian,
    marketHigh
  );
  const postcodeOutcode = getOutcode(input.postcode);
  const hasDateWarnings = input.userType === 'landlord' && preview.validationIssues.length > 0;
  const proposedVsMedian =
    input.userType === 'landlord' && proposedRentMonthly != null && marketMedian
      ? proposedRentMonthly / marketMedian
      : 0;

  const risk =
    input.userType === 'landlord'
      ? deriveLandlordRisk({
          proposedVsMedian,
          evidenceStrength,
          tenantAlreadyObjected: input.tenantAlreadyObjected,
          hasDateWarnings,
        })
      : currentRentMonthly >= (marketMedian || 0) * 1.05
        ? 'high'
        : 'moderate';

  const monthlyDiff =
    input.userType === 'landlord'
      ? roundCurrency((proposedRentMonthly || 0) - currentRentMonthly)
      : roundCurrency(currentRentMonthly - (marketMedian || currentRentMonthly));
  const annualDiff = roundCurrency(monthlyDiff * 12);

  const base: Omit<
    RentCheckerResult,
    | 'resultState'
    | 'headline'
    | 'subheadline'
    | 'moneyImpactLabel'
    | 'moneyImpactValue'
    | 'whatThisMeans'
    | 'nextSteps'
    | 'primaryCtaLabel'
    | 'primaryCtaHref'
    | 'primaryCtaSubtext'
    | 'primaryCtaTracksCheckout'
    | 'secondaryCtaLabel'
    | 'secondaryCtaHref'
    | 'secondaryCtaTracksCheckout'
  > = {
    sessionId: input.sessionId || buildToolSessionId(),
    userType: input.userType,
    bedrooms: input.bedrooms,
    postcodeOutcode,
    recommendedProduct: 'section13_standard',
    showBundleUpsell: false,
    showDefenceSecondary: false,
    monthlyDiff,
    annualDiff,
    marketLow,
    marketMedian,
    marketHigh,
    currentRent: currentRentMonthly,
    proposedRent: proposedRentMonthly,
    currentPositionLabel,
    proposedPositionLabel,
    overallPositionLabel:
      input.userType === 'tenant' ? currentPositionLabel : proposedPositionLabel || currentPositionLabel,
    challengeRisk: risk,
    challengeRiskLabel: toChallengeRiskLabel(risk),
    evidenceStrength,
    comparableCount,
    sourceBackedCount,
    freshComparableCount,
    freshnessLabel: buildFreshnessLabel(comparableCount, freshComparableCount),
    bundleCtaHref: buildLandingHref(
      'section13_defensive',
      input.userType === 'tenant' ? 'tenant_challengeable' : 'landlord_high_risk',
      { offer: 'full_protection_route' }
    ),
    disclaimer: FULL_DISCLAIMER_TEXT,
    scrapeSource,
    scrapeSummary,
    dateWarnings: input.userType === 'landlord' ? preview.validationIssues : [],
    preview,
  };

  if (input.userType === 'tenant') {
    const tenantBase = {
      ...base,
      recommendedProduct: 'section13_defensive' as const,
      showBundleUpsell: false,
      showDefenceSecondary: false,
    };

    if (currentRentMonthly >= (marketMedian || 0) * 1.05) {
      return buildTenantChallengeableResult(tenantBase);
    }

    return buildTenantWithinMarketResult(tenantBase);
  }

  if (risk === 'low') {
    return buildLowRiskResult({
      ...base,
      recommendedProduct: 'section13_standard',
    });
  }

  if (risk === 'moderate' && evidenceStrength === 'Strong') {
    return buildModerateRiskResult({
      ...base,
      recommendedProduct: 'section13_defensive',
      showBundleUpsell: proposedVsMedian > 1.02,
      showDefenceSecondary: true,
    });
  }

  if (risk === 'moderate') {
    return buildModerateRiskResult({
      ...base,
      recommendedProduct: 'section13_defensive',
      showBundleUpsell: proposedVsMedian > 1.02,
      showDefenceSecondary: true,
    });
  }

  return buildHighRiskResult({
    ...base,
    recommendedProduct: 'section13_defensive',
    showBundleUpsell:
      input.tenantAlreadyObjected ||
      evidenceStrength === 'Weak' ||
      (proposedRentMonthly != null && marketMedian != null && proposedRentMonthly > marketMedian),
  });
}

export function getRentCheckerDisclaimer() {
  return DISCLAIMER_TEXT;
}
