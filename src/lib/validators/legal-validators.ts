export type ValidatorKey =
  | 'section_21'
  | 'section_8'
  | 'wales_notice'
  | 'scotland_notice_to_leave'
  | 'tenancy_agreement'
  | 'money_claim';

export type ValidatorStatus =
  | 'pass'
  | 'warning'
  | 'invalid'
  | 'unsupported'
  | 'ground_8_satisfied'
  | 'discretionary_only'
  | 'high_risk'
  | 'likely_valid'
  | 'procedural_risk'
  | 'ground_mandatory'
  | 'ground_discretionary'
  | 'insufficient_evidence'
  | 'compliant'
  | 'needs_update'
  | 'non_compliant'
  | 'claim_ready'
  | 'missing_steps';

export interface ExtractableFact {
  id: string;
  label: string;
  reason?: string;
}

export interface ValidatorQuestion {
  id: string;
  question: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'blocking' | 'warning';
}

export interface UpsellRecommendation {
  product: string;
  reason: string;
  price?: number;
}

export interface ValidatorResult {
  status: ValidatorStatus;
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  upsell?: UpsellRecommendation;
}

export interface ValidatorDefinition {
  key: ValidatorKey;
  title: string;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'all';
  extractableFacts: ExtractableFact[];
  requiredQuestions: ValidatorQuestion[];
  riskQuestions: ValidatorQuestion[];
  requiredEvidence?: string[];
  riskFacts?: ValidatorQuestion[];
  evaluate: (input: ValidatorInput) => ValidatorResult;
}

export interface ValidatorInput {
  jurisdiction?: string;
  extracted: Record<string, any>;
  answers: Record<string, any>;
}

const YES_VALUES = new Set(['yes', 'true', 'y']);
const NO_VALUES = new Set(['no', 'false', 'n']);

function normalizeBoolean(value: any): 'yes' | 'no' | 'unknown' {
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (YES_VALUES.has(normalized)) return 'yes';
    if (NO_VALUES.has(normalized)) return 'no';
    if (normalized.length === 0 || normalized === 'unknown') return 'unknown';
  }
  if (value === null || value === undefined) return 'unknown';
  return 'unknown';
}

function isMissing(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim().length === 0) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function extractGroundCodes(raw: any): number[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((item) => {
      if (typeof item === 'number') return item;
      if (typeof item === 'string') {
        const match = item.match(/(\d+)/);
        if (match) return parseInt(match[1], 10);
      }
      return null;
    })
    .filter((code): code is number => code !== null && !Number.isNaN(code));
}

function addIssue(
  issues: ValidationIssue[],
  code: string,
  message: string,
  severity: ValidationIssue['severity']
) {
  issues.push({ code, message, severity });
}

function buildUpsell(status: ValidatorStatus, mapping: Record<ValidatorStatus, UpsellRecommendation>): UpsellRecommendation | undefined {
  return mapping[status];
}

function hasUnsupportedJurisdiction(input: ValidatorInput, allowed: string): boolean {
  if (!input.jurisdiction) return false;
  return input.jurisdiction.toLowerCase() !== allowed;
}

export const sharedFactTypes = [
  'jurisdiction',
  'tenancy_type',
  'deposit_status',
  'certificate_delivery_timing',
];

export function validateSection21Notice(input: ValidatorInput): ValidatorResult {
  if (hasUnsupportedJurisdiction(input, 'england')) {
    return {
      status: 'unsupported',
      blockers: [
        {
          code: 'S21-JURISDICTION-UNSUPPORTED',
          message: 'Section 21 validation is only supported for England.',
          severity: 'blocking',
        },
      ],
      warnings: [],
    };
  }

  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const noticeType = String(input.extracted.notice_type || '').toLowerCase();
  if (!noticeType.includes('section 21') && !noticeType.includes('s21') && !noticeType.includes('form 6a')) {
    addIssue(blockers, 'S21-WRONG-FORM', 'Notice must be a Section 21 Form 6A notice.', 'blocking');
  }

  const serviceDate = parseDate(input.extracted.date_served);
  const expiryDate = parseDate(input.extracted.expiry_date);
  if (!serviceDate) {
    addIssue(warnings, 'S21-SERVICE-DATE-MISSING', 'Service date is missing from the notice.', 'warning');
  }
  if (!expiryDate) {
    addIssue(warnings, 'S21-EXPIRY-DATE-MISSING', 'Expiry date is missing from the notice.', 'warning');
  }

  if (serviceDate && expiryDate) {
    const minExpiry = addMonths(serviceDate, 2);
    if (expiryDate < minExpiry) {
      addIssue(blockers, 'S21-NOTICE-PERIOD', 'Expiry date does not meet the minimum two-month notice period.', 'blocking');
    }
  }

  const propertyAddress = input.extracted.property_address;
  if (isMissing(propertyAddress)) {
    addIssue(warnings, 'S21-PROPERTY-ADDRESS-MISSING', 'Property address is missing from the notice.', 'warning');
  }

  const tenantNames = input.extracted.tenant_names || input.extracted.tenant_name;
  if (isMissing(tenantNames)) {
    addIssue(warnings, 'S21-TENANT-NAME-MISSING', 'Tenant name(s) are missing from the notice.', 'warning');
  }

  const landlordName = input.extracted.landlord_name;
  if (isMissing(landlordName)) {
    addIssue(warnings, 'S21-LANDLORD-NAME-MISSING', 'Landlord name is missing from the notice.', 'warning');
  }

  const signaturePresent = normalizeBoolean(input.extracted.signature_present);
  if (signaturePresent === 'no') {
    addIssue(blockers, 'S21-SIGNATURE-MISSING', 'Notice must be signed to be valid.', 'blocking');
  } else if (signaturePresent === 'unknown') {
    addIssue(warnings, 'S21-SIGNATURE-UNKNOWN', 'Signature could not be confirmed from the notice.', 'warning');
  }

  const requiredChecks: Array<[string, string, string]> = [
    ['deposit_protected', 'S21-DEPOSIT-PROTECTION', 'Deposit must be protected in an approved scheme.'],
    ['prescribed_info_served', 'S21-PRESCRIBED-INFO', 'Prescribed information must be served within 30 days.'],
    ['gas_safety_pre_move_in', 'S21-GAS-SAFETY', 'Gas safety certificate must be given before move-in.'],
    ['epc_provided', 'S21-EPC', 'A valid EPC must be provided to the tenant.'],
    ['how_to_rent_provided', 'S21-HOW-TO-RENT', 'The How to Rent guide must be provided.'],
    ['property_licensed', 'S21-LICENSING', 'Confirm the property licensing position.'],
  ];

  requiredChecks.forEach(([key, code, message]) => {
    const status = normalizeBoolean(input.answers[key]);
    if (status === 'no') {
      addIssue(blockers, code, message, 'blocking');
    } else if (status === 'unknown') {
      addIssue(warnings, `${code}-UNKNOWN`, `${message} Confirm this before relying on the notice.`, 'warning');
    }
  });

  const retaliatory = normalizeBoolean(input.answers.retaliatory_eviction);
  if (retaliatory === 'yes') {
    addIssue(warnings, 'S21-RETALIATORY', 'Recent council action may block Section 21 (retaliatory eviction).', 'warning');
  }

  const rentArrears = normalizeBoolean(input.answers.rent_arrears_exist);
  if (rentArrears === 'yes') {
    addIssue(warnings, 'S21-ARREARS', 'Rent arrears exist; consider Section 8 for stronger grounds.', 'warning');
  }

  const fixedTermStatus = input.answers.fixed_term_status;
  if (isMissing(fixedTermStatus)) {
    addIssue(warnings, 'S21-FIXED-TERM-UNKNOWN', 'Fixed-term status affects expiry logic; confirm the tenancy status.', 'warning');
  }

  const status = blockers.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'pass';

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      invalid: {
        product: 'complete_eviction_pack',
        reason: 'Complete Eviction Pack recommended when Section 21 compliance is at risk.',
      },
      warning: {
        product: 'complete_eviction_pack',
        reason: 'Complete Eviction Pack recommended to address potential weaknesses.',
      },
      pass: {
        product: 'notice_only_or_pack',
        reason: 'Notice Only or Complete Pack are suitable options.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export function validateSection8Notice(input: ValidatorInput): ValidatorResult {
  if (hasUnsupportedJurisdiction(input, 'england')) {
    return {
      status: 'unsupported',
      blockers: [
        {
          code: 'S8-JURISDICTION-UNSUPPORTED',
          message: 'Section 8 validation is only supported for England.',
          severity: 'blocking',
        },
      ],
      warnings: [],
    };
  }

  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const groundCodes = extractGroundCodes(input.extracted.grounds_cited);
  if (groundCodes.length === 0) {
    addIssue(blockers, 'S8-GROUNDS-MISSING', 'At least one Section 8 ground must be cited.', 'blocking');
  }

  if (isMissing(input.extracted.date_served)) {
    addIssue(warnings, 'S8-SERVICE-DATE-MISSING', 'Service date is missing from the notice.', 'warning');
  }

  if (isMissing(input.extracted.notice_period)) {
    addIssue(warnings, 'S8-NOTICE-PERIOD-MISSING', 'Notice period is missing from the notice.', 'warning');
  }

  if (isMissing(input.extracted.rent_arrears_stated)) {
    addIssue(warnings, 'S8-ARREARS-MISSING', 'Rent arrears amount is missing from the notice.', 'warning');
  }

  if (isMissing(input.extracted.tenant_details)) {
    addIssue(warnings, 'S8-TENANT-DETAILS-MISSING', 'Tenant details are missing from the notice.', 'warning');
  }

  const requiredKeys = ['rent_frequency', 'current_arrears', 'payment_history', 'joint_tenants'];
  requiredKeys.forEach((key) => {
    if (isMissing(input.answers[key])) {
      addIssue(warnings, 'S8-REQUIRED-MISSING', `Confirm ${key.replace(/_/g, ' ')} to validate Ground 8.`, 'warning');
    }
  });

  const rentFrequency = input.answers.rent_frequency || input.extracted.rent_frequency;
  const rentAmount = toNumber(input.answers.rent_amount || input.extracted.rent_amount);
  const arrearsAmount = toNumber(input.answers.current_arrears || input.extracted.rent_arrears_stated);

  let ground8Satisfied = false;
  let ground8Evaluated = false;

  if (groundCodes.includes(8)) {
    if (rentAmount && arrearsAmount && rentFrequency) {
      ground8Evaluated = true;
      const frequency = String(rentFrequency).toLowerCase();
      let threshold = rentAmount * 2;
      if (frequency === 'weekly') threshold = rentAmount * 8;
      if (frequency === 'fortnightly') threshold = rentAmount * 4;
      if (frequency === 'quarterly') threshold = rentAmount * 2;
      if (frequency === 'yearly' || frequency === 'annually') threshold = rentAmount * (2 / 12);
      ground8Satisfied = arrearsAmount >= threshold;
    } else {
      addIssue(warnings, 'S8-GROUND8-INCOMPLETE', 'Ground 8 cannot be validated without rent amount, frequency, and arrears.', 'warning');
    }
  }

  const benefitDelays = normalizeBoolean(input.answers.benefit_delays);
  if (benefitDelays === 'yes') {
    addIssue(warnings, 'S8-BENEFIT-DELAYS', 'Benefit delays may affect enforcement timelines.', 'warning');
  }

  const disrepair = normalizeBoolean(input.answers.disrepair_counterclaims);
  if (disrepair === 'yes') {
    addIssue(warnings, 'S8-DISREPAIR', 'Disrepair counterclaims can delay or reduce arrears outcomes.', 'warning');
  }

  const paymentSince = normalizeBoolean(input.answers.payment_since_notice);
  if (paymentSince === 'yes') {
    addIssue(warnings, 'S8-PAYMENT-SINCE', 'Payments since notice may reduce arrears below Ground 8 threshold.', 'warning');
  }

  let status: ValidatorStatus = 'discretionary_only';

  if (blockers.length > 0) {
    status = 'invalid';
  } else if (groundCodes.includes(8)) {
    if (!ground8Evaluated) {
      status = 'high_risk';
    } else if (ground8Satisfied) {
      status = 'ground_8_satisfied';
    } else {
      status = 'discretionary_only';
    }
  } else {
    status = warnings.length > 0 ? 'high_risk' : 'discretionary_only';
  }

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      ground_8_satisfied: {
        product: 'complete_eviction_pack',
        reason: 'Complete Pack recommended when Ground 8 is satisfied.',
      },
      discretionary_only: {
        product: 'money_claim_pack',
        reason: 'Money Claim Pack suggested when grounds are discretionary or weak.',
      },
      high_risk: {
        product: 'money_claim_pack',
        reason: 'Money Claim Pack suggested while evidence is incomplete.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export function validateWalesNotice(input: ValidatorInput): ValidatorResult {
  if (hasUnsupportedJurisdiction(input, 'wales')) {
    return {
      status: 'unsupported',
      blockers: [
        {
          code: 'WLS-JURISDICTION-UNSUPPORTED',
          message: 'Wales notice validation is only supported for Wales.',
          severity: 'blocking',
        },
      ],
      warnings: [],
    };
  }

  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const bilingual = normalizeBoolean(input.extracted.bilingual_text_present);
  if (bilingual === 'no') {
    addIssue(blockers, 'WLS-BILINGUAL', 'Bilingual notice text is required in Wales.', 'blocking');
  } else if (bilingual === 'unknown') {
    addIssue(warnings, 'WLS-BILINGUAL-UNKNOWN', 'Confirm bilingual text is present.', 'warning');
  }

  const requiredChecks: Array<[string, string, string]> = [
    ['written_statement_provided', 'WLS-WRITTEN-STATEMENT', 'Written occupation contract statement must be provided.'],
    ['deposit_protected', 'WLS-DEPOSIT', 'Deposit must be protected and prescribed information served.'],
    ['occupation_type_confirmed', 'WLS-OCCUPATION-TYPE', 'Occupation contract type must be confirmed.'],
  ];

  requiredChecks.forEach(([key, code, message]) => {
    const status = normalizeBoolean(input.answers[key]);
    if (status === 'no') {
      addIssue(blockers, code, message, 'blocking');
    } else if (status === 'unknown') {
      addIssue(warnings, `${code}-UNKNOWN`, `${message} Confirm this before relying on the notice.`, 'warning');
    }
  });

  const fitnessIssues = normalizeBoolean(input.answers.fitness_for_habitation);
  if (fitnessIssues === 'yes') {
    addIssue(blockers, 'WLS-FITNESS', 'Unresolved fitness issues can block notice validity.', 'blocking');
  } else if (fitnessIssues === 'unknown') {
    addIssue(warnings, 'WLS-FITNESS-UNKNOWN', 'Confirm whether any fitness issues remain unresolved.', 'warning');
  }

  const retaliatory = normalizeBoolean(input.answers.retaliatory_eviction);
  if (retaliatory === 'yes') {
    addIssue(warnings, 'WLS-RETALIATORY', 'Retaliatory eviction risks may apply.', 'warning');
  }

  const council = normalizeBoolean(input.answers.council_involvement);
  if (council === 'yes') {
    addIssue(warnings, 'WLS-COUNCIL', 'Council involvement may delay possession proceedings.', 'warning');
  }

  const status = blockers.length > 0
    ? 'invalid'
    : warnings.length > 0
      ? 'procedural_risk'
      : 'likely_valid';

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      invalid: {
        product: 'complete_eviction_pack',
        reason: 'Complete Eviction Pack recommended when procedural issues exist.',
      },
      procedural_risk: {
        product: 'complete_eviction_pack',
        reason: 'Complete Eviction Pack recommended due to procedural risks.',
      },
      likely_valid: {
        product: 'notice_only',
        reason: 'Notice Only is suitable when the notice appears compliant.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export function validateScotlandNoticeToLeave(input: ValidatorInput): ValidatorResult {
  if (hasUnsupportedJurisdiction(input, 'scotland')) {
    return {
      status: 'unsupported',
      blockers: [
        {
          code: 'NTL-JURISDICTION-UNSUPPORTED',
          message: 'Notice to Leave validation is only supported for Scotland.',
          severity: 'blocking',
        },
      ],
      warnings: [],
    };
  }

  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (isMissing(input.extracted.ground_cited)) {
    addIssue(blockers, 'NTL-GROUND-MISSING', 'A Notice to Leave must cite a valid ground.', 'blocking');
  }

  if (isMissing(input.extracted.notice_period)) {
    addIssue(warnings, 'NTL-PERIOD-MISSING', 'Notice period is missing.', 'warning');
  }

  if (isMissing(input.extracted.property_address)) {
    addIssue(warnings, 'NTL-ADDRESS-MISSING', 'Property address is missing.', 'warning');
  }

  if (isMissing(input.extracted.tenant_name)) {
    addIssue(warnings, 'NTL-TENANT-MISSING', 'Tenant name is missing.', 'warning');
  }

  const evidence = normalizeBoolean(input.answers.ground_evidence);
  if (evidence === 'no') {
    addIssue(warnings, 'NTL-EVIDENCE-MISSING', 'Evidence supporting the ground is required.', 'warning');
  } else if (evidence === 'unknown') {
    addIssue(warnings, 'NTL-EVIDENCE-UNKNOWN', 'Confirm evidence supporting the ground.', 'warning');
  }

  const length = normalizeBoolean(input.answers.tenancy_length_confirmed);
  if (length === 'unknown') {
    addIssue(warnings, 'NTL-TENANCY-LENGTH', 'Tenancy length impacts notice period; confirm the start date.', 'warning');
  }

  const tribunal = normalizeBoolean(input.answers.tribunal_served);
  if (tribunal === 'no') {
    addIssue(blockers, 'NTL-TRIBUNAL-SERVICE', 'Notice must be served correctly to proceed.', 'blocking');
  } else if (tribunal === 'unknown') {
    addIssue(warnings, 'NTL-TRIBUNAL-UNKNOWN', 'Confirm proper service before proceeding.', 'warning');
  }

  const covid = normalizeBoolean(input.answers.covid_protections);
  if (covid === 'yes') {
    addIssue(warnings, 'NTL-COVID', 'Covid protections may affect notice periods.', 'warning');
  }

  const rentPressure = normalizeBoolean(input.answers.rent_pressure_zone);
  if (rentPressure === 'yes') {
    addIssue(warnings, 'NTL-RPZ', 'Rent pressure zone rules may affect notice periods.', 'warning');
  }

  const disrepair = normalizeBoolean(input.answers.disrepair);
  if (disrepair === 'yes') {
    addIssue(warnings, 'NTL-DISREPAIR', 'Disrepair issues can weaken eviction grounds.', 'warning');
  }

  const groundMandatory = normalizeBoolean(input.answers.ground_mandatory);

  let status: ValidatorStatus = 'ground_discretionary';
  if (blockers.length > 0) {
    status = 'invalid';
  } else if (evidence !== 'yes') {
    status = 'insufficient_evidence';
  } else if (groundMandatory === 'yes') {
    status = 'ground_mandatory';
  } else {
    status = 'ground_discretionary';
  }

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      ground_mandatory: {
        product: 'complete_eviction_pack',
        reason: 'Complete Pack recommended for tribunal-ready evidence.',
      },
      ground_discretionary: {
        product: 'complete_eviction_pack',
        reason: 'Complete Pack recommended to strengthen discretionary grounds.',
      },
      insufficient_evidence: {
        product: 'complete_eviction_pack',
        reason: 'Complete Pack recommended to address evidence gaps.',
      },
      invalid: {
        product: 'complete_eviction_pack',
        reason: 'Complete Pack recommended to resolve procedural issues.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export function validateTenancyAgreement(input: ValidatorInput): ValidatorResult {
  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const jurisdiction = input.answers.jurisdiction || input.extracted.jurisdiction;
  if (isMissing(jurisdiction)) {
    addIssue(warnings, 'TA-JURISDICTION-MISSING', 'Jurisdiction must be confirmed.', 'warning');
  }

  const intendedUse = input.answers.intended_use;
  if (isMissing(intendedUse)) {
    addIssue(warnings, 'TA-INTENDED-USE', 'Intended tenancy use (AST/PRT/occupation contract) must be confirmed.', 'warning');
  }

  const prohibitedFees = normalizeBoolean(input.answers.prohibited_fees_present);
  if (prohibitedFees === 'yes') {
    addIssue(blockers, 'TA-PROHIBITED-FEES', 'Prohibited fees make the agreement non-compliant.', 'blocking');
  }

  const unfairTerms = normalizeBoolean(input.answers.unfair_terms_present);
  if (unfairTerms === 'yes') {
    addIssue(blockers, 'TA-UNFAIR-TERMS', 'Unfair terms should be removed before relying on the agreement.', 'blocking');
  }

  const missingClauses = normalizeBoolean(input.answers.missing_clauses);
  if (missingClauses === 'yes') {
    addIssue(warnings, 'TA-MISSING-CLAUSES', 'Important clauses appear to be missing.', 'warning');
  }

  const status = blockers.length > 0
    ? 'non_compliant'
    : warnings.length > 0
      ? 'needs_update'
      : 'compliant';

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      needs_update: {
        product: 'premium_tenancy_agreement',
        reason: 'Premium Tenancy Agreement recommended to update clauses.',
      },
      compliant: {
        product: 'no_hard_sell',
        reason: 'Agreement appears compliant; no hard sell required.',
      },
      non_compliant: {
        product: 'premium_tenancy_agreement',
        reason: 'Premium Tenancy Agreement recommended due to compliance risks.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export function validateMoneyClaim(input: ValidatorInput): ValidatorResult {
  const blockers: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const preAction = normalizeBoolean(input.answers.pre_action_steps);
  if (preAction !== 'yes') {
    addIssue(blockers, 'MC-PRE-ACTION', 'Pre-action steps (rent demand/LBA) must be completed.', 'blocking');
  }

  const jointLiability = normalizeBoolean(input.answers.joint_liability_confirmed);
  if (jointLiability === 'unknown') {
    addIssue(warnings, 'MC-JOINT-LIABILITY', 'Confirm joint tenant liability to avoid claim defects.', 'warning');
  }

  const paymentsSince = normalizeBoolean(input.answers.payments_since);
  if (paymentsSince === 'yes') {
    addIssue(warnings, 'MC-PAYMENTS-SINCE', 'Payments since notice may affect the claim value.', 'warning');
  }

  const status = blockers.length > 0
    ? 'missing_steps'
    : warnings.length > 0
      ? 'high_risk'
      : 'claim_ready';

  return {
    status,
    blockers,
    warnings,
    upsell: buildUpsell(status, {
      claim_ready: {
        product: 'money_claim_pack',
        reason: 'Money Claim Pack recommended for court-ready filing.',
      },
      missing_steps: {
        product: 'guidance_checklist',
        reason: 'Guidance and checklist recommended before filing.',
      },
      high_risk: {
        product: 'guidance_checklist',
        reason: 'Guidance recommended to reduce claim risks.',
      },
    } as Record<ValidatorStatus, UpsellRecommendation>),
  };
}

export const validatorDefinitions: ValidatorDefinition[] = [
  {
    key: 'section_21',
    title: 'Section 21 Notice Validator (England)',
    jurisdiction: 'england',
    extractableFacts: [
      { id: 'notice_type', label: 'Notice type (S21 / Form 6A)', reason: 'Wrong form = fatal' },
      { id: 'date_served', label: 'Date served', reason: 'Timing rules' },
      { id: 'expiry_date', label: 'Expiry date', reason: 'Minimum notice' },
      { id: 'property_address', label: 'Property address', reason: 'Jurisdiction + accuracy' },
      { id: 'tenant_names', label: 'Tenant names', reason: 'Matching tenancy' },
      { id: 'landlord_name', label: 'Landlord name', reason: 'Standing' },
      { id: 'signature_present', label: 'Signature present', reason: 'Formal validity' },
    ],
    requiredQuestions: [
      { id: 'deposit_protected', question: 'Was the tenant’s deposit protected in a government-approved scheme?' },
      { id: 'prescribed_info_served', question: 'Was the deposit prescribed information given within 30 days?' },
      { id: 'gas_safety_pre_move_in', question: 'Was the gas safety certificate given before the tenant moved in?' },
      { id: 'epc_provided', question: 'Was a valid EPC given to the tenant?' },
      { id: 'how_to_rent_provided', question: 'Was the How to Rent guide provided?' },
      { id: 'property_licensed', question: 'Is the property subject to selective or additional licensing?' },
    ],
    riskQuestions: [
      { id: 'retaliatory_eviction', question: 'Is there a retaliatory eviction risk (council notice)?' },
      { id: 'rent_arrears_exist', question: 'Are there rent arrears that may indicate a Section 8 route?' },
      { id: 'fixed_term_status', question: 'Is the tenancy still in a fixed term?' },
    ],
    requiredEvidence: [
      'deposit_protection_certificate',
      'prescribed_information_proof',
      'gas_safety_certificate',
      'epc',
      'how_to_rent_proof',
      'licensing',
    ],
    riskFacts: [
      { id: 'retaliatory_eviction', question: 'Is there a retaliatory eviction risk (council notice)?' },
    ],
    evaluate: validateSection21Notice,
  },
  {
    key: 'section_8',
    title: 'Section 8 Notice Validator (England)',
    jurisdiction: 'england',
    extractableFacts: [
      { id: 'grounds_cited', label: 'Grounds cited' },
      { id: 'date_served', label: 'Date served' },
      { id: 'notice_period', label: 'Notice period' },
      { id: 'rent_arrears_stated', label: 'Rent arrears stated' },
      { id: 'tenant_details', label: 'Tenant details' },
    ],
    requiredQuestions: [
      { id: 'rent_frequency', question: 'Is rent weekly, fortnightly, or monthly?' },
      { id: 'current_arrears', question: 'How much rent is currently unpaid?' },
      { id: 'payment_history', question: 'Have there been partial payments?' },
      { id: 'joint_tenants', question: 'Are there multiple tenants on the tenancy?' },
    ],
    riskQuestions: [
      { id: 'benefit_delays', question: 'Are delays in benefits affecting arrears?' },
      { id: 'disrepair_counterclaims', question: 'Are there disrepair counterclaims?' },
      { id: 'payment_since_notice', question: 'Have there been payments since the notice?' },
    ],
    requiredEvidence: ['bank_statements', 'correspondence'],
    evaluate: validateSection8Notice,
  },
  {
    key: 'wales_notice',
    title: 'Wales Notice Validator (RHW16 / RHW17 / RHW23)',
    jurisdiction: 'wales',
    extractableFacts: [
      { id: 'rhw_form_number', label: 'RHW form number' },
      { id: 'bilingual_text_present', label: 'Bilingual text present' },
      { id: 'service_date', label: 'Service date' },
      { id: 'expiry_date', label: 'Expiry date' },
      { id: 'contract_holder_details', label: 'Contract holder details' },
    ],
    requiredQuestions: [
      { id: 'written_statement_provided', question: 'Was a written statement of occupation contract provided?' },
      { id: 'fitness_for_habitation', question: 'Are there unresolved fitness issues?' },
      { id: 'deposit_protected', question: 'Was the deposit protected and prescribed info served?' },
      { id: 'occupation_type_confirmed', question: 'Is the occupation contract standard or secure?' },
    ],
    riskQuestions: [
      { id: 'retaliatory_eviction', question: 'Is there a retaliatory eviction concern?' },
      { id: 'council_involvement', question: 'Is there council involvement or enforcement action?' },
    ],
    requiredEvidence: ['tenancy_agreement'],
    evaluate: validateWalesNotice,
  },
  {
    key: 'scotland_notice_to_leave',
    title: 'Scotland Notice to Leave Validator',
    jurisdiction: 'scotland',
    extractableFacts: [
      { id: 'ground_cited', label: 'Ground cited' },
      { id: 'notice_period', label: 'Notice period' },
      { id: 'property_address', label: 'Property address' },
      { id: 'tenant_name', label: 'Tenant name' },
    ],
    requiredQuestions: [
      { id: 'ground_evidence', question: 'Do you have evidence supporting this ground?' },
      { id: 'tenancy_length_confirmed', question: 'What is the length of tenancy (for notice period)?' },
      { id: 'tribunal_served', question: 'Has this been served correctly?' },
    ],
    riskQuestions: [
      { id: 'covid_protections', question: 'Do Covid protections apply?' },
      { id: 'rent_pressure_zone', question: 'Is the property in a rent pressure zone?' },
      { id: 'disrepair', question: 'Are there disrepair issues?' },
    ],
    requiredEvidence: ['correspondence'],
    evaluate: validateScotlandNoticeToLeave,
  },
  {
    key: 'tenancy_agreement',
    title: 'Tenancy Agreement Validator (All Jurisdictions)',
    jurisdiction: 'all',
    extractableFacts: [
      { id: 'tenancy_type', label: 'Tenancy type' },
      { id: 'start_date', label: 'Start date' },
      { id: 'rent', label: 'Rent' },
      { id: 'deposit', label: 'Deposit' },
      { id: 'parties', label: 'Parties' },
      { id: 'address', label: 'Address' },
    ],
    requiredQuestions: [
      { id: 'jurisdiction', question: 'Is this for England, Wales, Scotland, or NI?' },
      { id: 'intended_use', question: 'Is the tenancy AST, PRT, or occupation contract?' },
    ],
    riskQuestions: [
      { id: 'prohibited_fees_present', question: 'Are prohibited fees present?' },
      { id: 'missing_clauses', question: 'Are any required clauses missing?' },
      { id: 'unfair_terms_present', question: 'Are there unfair terms?' },
    ],
    requiredEvidence: ['tenancy_agreement'],
    evaluate: validateTenancyAgreement,
  },
  {
    key: 'money_claim',
    title: 'Money Claim Validator (Arrears)',
    jurisdiction: 'all',
    extractableFacts: [
      { id: 'claim_amount', label: 'Claim amount' },
      { id: 'rent_schedule', label: 'Rent schedule' },
      { id: 'parties', label: 'Parties' },
    ],
    requiredQuestions: [
      { id: 'pre_action_steps', question: 'Have you sent a rent demand / LBA?' },
      { id: 'joint_liability_confirmed', question: 'Are tenants jointly liable?' },
      { id: 'payments_since', question: 'Any payments made since the notice?' },
    ],
    riskQuestions: [],
    requiredEvidence: ['bank_statements', 'rent_schedule'],
    evaluate: validateMoneyClaim,
  },
];

export function getValidatorDefinition(key: ValidatorKey): ValidatorDefinition | undefined {
  return validatorDefinitions.find((def) => def.key === key);
}
