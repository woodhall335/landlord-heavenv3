export interface NormalizedWizardStep {
  rawStep: string;
  normalizedStepKey: string;
  normalizedEventName: string;
  stepGroup: string;
}

const STEP_GROUPS: Record<string, string> = {
  case_basics: 'case_basics',
  scotland_basics: 'case_basics',
  parties: 'parties',
  property: 'property',
  tenancy: 'tenancy',
  wales_compliance: 'compliance',
  section21_compliance: 'compliance',
  scotland_compliance: 'compliance',
  compliance: 'compliance',
  notice: 'notice',
  scotland_notice: 'notice',
  section8_arrears: 'arrears',
  arrears: 'arrears',
  scotland_grounds: 'grounds',
  evidence: 'evidence',
  comparables: 'evidence',
  court_signing: 'court',
  scotland_tribunal: 'court',
  review: 'review',
  preview_checkout: 'review',
  claimant: 'claimant',
  defendant: 'defendant',
  claim_details: 'claim_details',
  damages: 'damages',
  claim_statement: 'claim_statement',
  preaction: 'preaction',
  product: 'product',
  property_details: 'property',
  property_profile: 'property',
  landlord: 'landlord',
  tenant: 'tenants',
  tenants: 'tenants',
  rent: 'rent',
  deposit: 'deposit',
  document_details: 'document_details',
  bills: 'bills',
  terms: 'terms',
  tenancy_terms: 'terms',
  tenancy_reference: 'tenancy',
  england_transition_reference: 'tenancy',
  england_written_information: 'compliance',
  england_pre_tenancy_compliance: 'compliance',
  premium: 'premium',
};

function sanitizeStepKey(rawStep: string): string {
  return rawStep
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';
}

export function normalizeWizardStep(rawStep: string): NormalizedWizardStep {
  const normalizedStepKey = STEP_GROUPS[rawStep] ?? sanitizeStepKey(rawStep);

  return {
    rawStep,
    normalizedStepKey,
    normalizedEventName: `wizard_step_${normalizedStepKey}_complete`,
    stepGroup: normalizedStepKey,
  };
}
