import {
  SECTION13_CHALLENGE_EXPLAINER,
  SECTION13_EVIDENCE_EXPLAINER,
} from './rules';
import { maybeNormalizeUkPostcode } from './postcode';
import {
  SECTION13_RULES_VERSION,
  type Section13Comparable,
  type Section13IncludedCharge,
  type Section13ProductSku,
  type Section13State,
  type Section13WorkflowStatus,
} from './types';

export const SECTION13_INCLUDED_CHARGE_DEFINITIONS: Array<Pick<Section13IncludedCharge, 'key' | 'label'>> = [
  { key: 'council_tax', label: 'Council tax' },
  { key: 'water', label: 'Water' },
  { key: 'electricity_gas_fuel', label: 'Electricity / gas / fuel' },
  { key: 'communication_services', label: 'Communication services' },
  { key: 'fixed_service_charges', label: 'Fixed service charges' },
];

export function createDefaultIncludedCharges(): Section13IncludedCharge[] {
  return SECTION13_INCLUDED_CHARGE_DEFINITIONS.map((item) => ({
    ...item,
    included: false,
    currentAmount: null,
    proposedAmount: null,
  }));
}

export function createEmptySection13State(
  selectedPlan: Section13ProductSku = 'section13_standard'
): Section13State {
  return {
    rulesVersion: SECTION13_RULES_VERSION,
    selectedPlan,
    tenancy: {
      tenantNames: [''],
      propertyAddressLine1: '',
      propertyAddressLine2: '',
      propertyTownCity: '',
      postcodeRaw: '',
      postcodeNormalized: '',
      bedrooms: null,
      tenancyStartDate: '',
      currentRentAmount: null,
      currentRentFrequency: 'monthly',
      lastRentIncreaseDate: null,
      firstIncreaseAfter2003Date: null,
    },
    landlord: {
      landlordName: '',
      landlordAddressLine1: '',
      landlordAddressLine2: '',
      landlordTownCity: '',
      landlordPostcodeRaw: '',
      landlordPostcodeNormalized: '',
      landlordPhone: '',
      landlordEmail: '',
      agentName: '',
      agentAddressLine1: '',
      agentAddressLine2: '',
      agentTownCity: '',
      agentPostcodeRaw: '',
      agentPostcodeNormalized: '',
      agentPhone: '',
      agentEmail: '',
    },
    proposal: {
      proposedRentAmount: null,
      proposedStartDate: null,
      serviceDate: null,
      serviceMethod: null,
      serviceMethodOther: null,
    },
    includedCharges: createDefaultIncludedCharges(),
    comparablesMeta: {
      searchPostcodeRaw: '',
      searchPostcodeNormalized: '',
      bedrooms: null,
      lastScrapeAt: null,
      lastScrapeSource: null,
      lastScrapeSummary: null,
    },
    adjustments: {
      manualJustification: '',
      challengeBandExplainer: SECTION13_CHALLENGE_EXPLAINER,
      evidenceBandExplainer: SECTION13_EVIDENCE_EXPLAINER,
      expectTenantChallenge: false,
    },
  };
}

export function getSection13StateFromFacts(
  facts: Record<string, any> | null | undefined,
  selectedPlan: Section13ProductSku = 'section13_standard'
): Section13State {
  const defaults = createEmptySection13State(selectedPlan);
  const existing = facts?.section13 as Partial<Section13State> | undefined;

  return {
    ...defaults,
    ...existing,
    rulesVersion: existing?.rulesVersion || defaults.rulesVersion,
    selectedPlan: (existing?.selectedPlan as Section13ProductSku | undefined) || selectedPlan,
    tenancy: {
      ...defaults.tenancy,
      ...(existing?.tenancy || {}),
      tenantNames:
        Array.isArray(existing?.tenancy?.tenantNames) && existing.tenancy.tenantNames.length > 0
          ? existing.tenancy.tenantNames
          : defaults.tenancy.tenantNames,
    },
    landlord: {
      ...defaults.landlord,
      ...(existing?.landlord || {}),
    },
    proposal: {
      ...defaults.proposal,
      ...(existing?.proposal || {}),
    },
    includedCharges:
      Array.isArray(existing?.includedCharges) && existing.includedCharges.length > 0
        ? defaults.includedCharges.map((item) => {
            const match = existing.includedCharges?.find((candidate) => candidate.key === item.key);
            return match ? { ...item, ...match } : item;
          })
        : defaults.includedCharges,
    comparablesMeta: {
      ...defaults.comparablesMeta,
      ...(existing?.comparablesMeta || {}),
    },
    adjustments: {
      ...defaults.adjustments,
      ...(existing?.adjustments || {}),
      challengeBandExplainer:
        existing?.adjustments?.challengeBandExplainer || defaults.adjustments.challengeBandExplainer,
      evidenceBandExplainer:
        existing?.adjustments?.evidenceBandExplainer || defaults.adjustments.evidenceBandExplainer,
      expectTenantChallenge:
        existing?.adjustments?.expectTenantChallenge ?? defaults.adjustments.expectTenantChallenge,
    },
    preview: existing?.preview || undefined,
  };
}

export function normalizeSection13State(state: Section13State): Section13State {
  return {
    ...state,
    tenancy: {
      ...state.tenancy,
      postcodeNormalized: maybeNormalizeUkPostcode(state.tenancy.postcodeRaw) || '',
      tenantNames:
        Array.isArray(state.tenancy.tenantNames) && state.tenancy.tenantNames.length > 0
          ? state.tenancy.tenantNames
          : [''],
    },
    landlord: {
      ...state.landlord,
      landlordPostcodeNormalized:
        maybeNormalizeUkPostcode(state.landlord.landlordPostcodeRaw || '') || '',
      agentPostcodeNormalized:
        maybeNormalizeUkPostcode(state.landlord.agentPostcodeRaw || '') || '',
    },
    comparablesMeta: {
      ...state.comparablesMeta,
      searchPostcodeNormalized:
        maybeNormalizeUkPostcode(state.comparablesMeta.searchPostcodeRaw || '') || '',
    },
  };
}

export function setSection13StateOnFacts(
  existingFacts: Record<string, any> | null | undefined,
  state: Section13State,
  meta?: {
    caseId?: string;
    product?: Section13ProductSku;
    workflowStatus?: Section13WorkflowStatus;
  }
): Record<string, any> {
  const facts = { ...(existingFacts || {}) };
  const priorMeta = facts.__meta || {};

  return {
    ...facts,
    section13: state,
    __meta: {
      ...priorMeta,
      case_id: meta?.caseId ?? priorMeta.case_id ?? null,
      jurisdiction: 'england',
      case_type: 'rent_increase',
      product: meta?.product ?? state.selectedPlan,
      rules_version: state.rulesVersion || SECTION13_RULES_VERSION,
      workflow_status: meta?.workflowStatus ?? priorMeta.workflow_status ?? 'draft',
      updated_at: new Date().toISOString(),
    },
  };
}

export function sortSection13Comparables(comparables: Section13Comparable[]): Section13Comparable[] {
  return [...comparables].sort((a, b) => {
    const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.addressSnippet || '').localeCompare(b.addressSnippet || '');
  });
}
