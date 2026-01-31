import {
  runRules,
  SECTION21_RULES,
  SECTION8_RULES,
  type RuleContext,
  type RulesEngineResult,
  type ValidatorStatus as RulesValidatorStatus,
} from './rules';
import { resolveFacts, type FactResolutionInput } from './facts';
import { VALIDATOR_RULESET_VERSION } from './rules/version';
import { parseUKDate, addCalendarMonths } from './rules/dateUtils';

export type ValidatorKey = 'section_21' | 'section_8';

export type ValidatorStatus =
  | 'pass'
  | 'warning'
  | 'invalid'
  | 'needs_info'
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
  info?: ValidationIssue[];
  upsell?: UpsellRecommendation;
  /** Ruleset version used for this validation */
  rulesetVersion?: string;
  /** Missing fact keys that need user confirmation */
  missingFacts?: string[];
  /** Provenance metadata for report display */
  provenanceMetadata?: Array<{
    factKey: string;
    value: unknown;
    provenance: string;
    sourceLabel?: string;
  }>;
  /**
   * Terminal blocker flag - when true, validation short-circuited due to
   * a fundamental issue (e.g., wrong document type). UI should hide
   * compliance questions and only show the blocker message.
   */
  terminal_blocker?: boolean;
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

export interface ExtractionQuality {
  text_extraction_method?: 'pdf_parse' | 'pdf_lib' | 'pdf_lib_metadata' | 'vision' | 'regex_only' | 'failed';
  text_length?: number;
  regex_fields_found?: number;
  llm_extraction_ran?: boolean;
  llm_extraction_skipped_reason?: string;
}

export interface ValidatorInput {
  jurisdiction?: string;
  extracted: Record<string, any>;
  answers: Record<string, any>;
  /** Extraction quality metadata for truthful error messages */
  extractionQuality?: ExtractionQuality;
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
  // Use UK date parser to properly handle DD/MM/YYYY format
  return parseUKDate(value);
}

function addMonths(date: Date, months: number): Date {
  // Use proper calendar month addition from dateUtils
  return addCalendarMonths(date, months);
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

/**
 * Generate truthful message suffix based on extraction quality.
 * Helps distinguish between:
 * - "Not found in document" (extraction worked but field absent)
 * - "Could not be extracted" (extraction failed)
 * - "Not provided yet" (user needs to answer)
 */
function getExtractionContext(quality?: ExtractionQuality): string {
  if (!quality) return '';

  if (quality.text_extraction_method === 'failed') {
    return ' (document could not be read)';
  }

  if (!quality.llm_extraction_ran) {
    if (quality.llm_extraction_skipped_reason === 'OPENAI_API_KEY missing') {
      return ' (AI extraction unavailable)';
    }
    return ' (extraction incomplete)';
  }

  if (quality.text_extraction_method === 'regex_only') {
    return ' (limited text extraction)';
  }

  return '';
}

/**
 * Add an issue with truthful context about extraction quality.
 */
function addTruthfulIssue(
  issues: ValidationIssue[],
  code: string,
  baseMessage: string,
  severity: ValidationIssue['severity'],
  quality?: ExtractionQuality
) {
  const context = getExtractionContext(quality);
  issues.push({ code, message: baseMessage + context, severity });
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

/**
 * Convert extracted fields to fact format for the rules engine.
 * Maps from legacy extracted field names to standardized fact keys.
 */
function mapExtractedToFacts(extracted: Record<string, any>, answers: Record<string, any>): Record<string, unknown> {
  const facts: Record<string, unknown> = { ...answers };

  // Map extracted fields to standardized fact keys
  const fieldMappings: Record<string, string> = {
    // Form detection
    form_6a_used: 'form_6a_present',
    form_6a_detected: 'form_6a_present',
    section_21_detected: 'form_6a_present',
    form_3_detected: 'form_3_present',
    section_8_detected: 'form_3_present',

    // Dates
    date_served: 'service_date',

    // Signature
    signature_present: 'signature_present',

    // Names/addresses
    property_address: 'property_address_present',
    property_address_line1: 'property_address_present',
    address: 'property_address_present',
    tenant_names: 'tenant_names_present',
    tenant_name: 'tenant_names_present',
    tenant_full_name: 'tenant_names_present',
    landlord_name: 'landlord_name_present',
    landlord_full_name: 'landlord_name_present',

    // Grounds
    grounds_cited: 'grounds_cited',

    // Rent/Arrears
    rent_amount: 'rent_amount',
    rent_frequency: 'rent_frequency',
    rent_arrears_stated: 'arrears_amount',
    current_arrears: 'arrears_amount',
  };

  for (const [extractedKey, factKey] of Object.entries(fieldMappings)) {
    if (extractedKey in extracted && extracted[extractedKey] !== undefined) {
      // For presence fields, convert to boolean
      if (factKey.endsWith('_present')) {
        facts[factKey] = !isMissing(extracted[extractedKey]);
      } else {
        facts[factKey] = extracted[extractedKey];
      }
    }
  }

  // Also pass through expiry_date
  if (extracted.expiry_date || extracted.notice_expiry_date) {
    facts['expiry_date'] = extracted.expiry_date || extracted.notice_expiry_date;
  }

  return facts;
}

/**
 * Convert rules engine result to legacy ValidatorResult format.
 */
function rulesResultToValidatorResult(rulesResult: RulesEngineResult): ValidatorResult {
  const blockers: ValidationIssue[] = rulesResult.blockers
    .filter((r) => r.outcome === 'fail')
    .map((r) => ({
      code: r.id,
      message: r.message,
      severity: 'blocking' as const,
    }));

  const warnings: ValidationIssue[] = rulesResult.warnings
    .filter((r) => r.outcome === 'fail')
    .map((r) => ({
      code: r.id,
      message: r.message,
      severity: 'warning' as const,
    }));

  const info: ValidationIssue[] = rulesResult.info
    .filter((r) => r.outcome !== 'pass')
    .map((r) => ({
      code: r.id,
      message: r.message,
      severity: 'warning' as const,
    }));

  // Collect all missing facts
  const missingFacts = rulesResult.results
    .filter((r) => r.outcome === 'needs_info' && r.missingFacts)
    .flatMap((r) => r.missingFacts || []);

  // Map rules engine status to legacy status
  let status: ValidatorStatus = rulesResult.status as ValidatorStatus;

  return {
    status,
    blockers,
    warnings,
    info,
    rulesetVersion: rulesResult.rulesetVersion,
    missingFacts: [...new Set(missingFacts)],
    upsell: determineUpsell(status, rulesResult),
  };
}

/**
 * Determine upsell recommendation based on status.
 */
function determineUpsell(status: ValidatorStatus, rulesResult: RulesEngineResult): UpsellRecommendation | undefined {
  if (status === 'invalid' || status === 'warning' || status === 'needs_info') {
    return {
      product: 'complete_eviction_pack',
      reason: 'Complete Eviction Pack recommended to address validation issues.',
    };
  }
  if (status === 'pass') {
    return {
      product: 'notice_only',
      reason: 'Notice Only Pack suitable for a compliant notice.',
    };
  }
  return undefined;
}

/**
 * Validate Section 21 Notice using the deterministic rules engine.
 * This is the new rules-based validation that should be used going forward.
 */
export function validateSection21WithRules(
  input: ValidatorInput,
  factInput?: FactResolutionInput
): ValidatorResult {
  // Build facts from input
  const extractedFacts = mapExtractedToFacts(input.extracted, input.answers);

  // Resolve facts with provenance
  const resolvedFacts = resolveFacts({
    extracted: extractedFacts,
    userAnswers: input.answers,
    ...factInput,
  });

  // Build rule context
  const ctx: RuleContext = {
    jurisdiction: input.jurisdiction || 'england',
    validatorKey: 'section_21',
    facts: resolvedFacts,
  };

  // Run rules
  const rulesResult = runRules(SECTION21_RULES, ctx);

  // Convert to legacy format
  return rulesResultToValidatorResult(rulesResult);
}

/**
 * Validate Section 8 Notice using the deterministic rules engine.
 * This is the new rules-based validation that should be used going forward.
 */
export function validateSection8WithRules(
  input: ValidatorInput,
  factInput?: FactResolutionInput
): ValidatorResult {
  // Build facts from input
  const extractedFacts = mapExtractedToFacts(input.extracted, input.answers);

  // Resolve facts with provenance
  const resolvedFacts = resolveFacts({
    extracted: extractedFacts,
    userAnswers: input.answers,
    ...factInput,
  });

  // Build rule context
  const ctx: RuleContext = {
    jurisdiction: input.jurisdiction || 'england',
    validatorKey: 'section_8',
    facts: resolvedFacts,
  };

  // Run rules
  const rulesResult = runRules(SECTION8_RULES, ctx);

  // Convert to legacy format
  return rulesResultToValidatorResult(rulesResult);
}

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

  // Check for Section 21 / Form 6A indicators in notice_type or direct detection flags
  const noticeType = String(input.extracted.notice_type || '').toLowerCase();
  const hasForm6aFlag = input.extracted.form_6a_used === true || input.extracted.form_6a_detected === true;
  const hasSection21Flag = input.extracted.section_21_detected === true;
  const isValidNoticeType =
    noticeType.includes('section 21') ||
    noticeType.includes('section_21') ||
    noticeType.includes('s21') ||
    noticeType.includes('form 6a') ||
    noticeType.includes('form_6a') ||
    hasForm6aFlag ||
    hasSection21Flag;

  // Check for wrong document type - detect if this is a Section 8 (Form 3) instead of Section 21
  const hasForm3Flag = input.extracted.form_3_detected === true || input.extracted.form_3_present === true;
  const hasSection8Flag = input.extracted.section_8_detected === true;
  const groundsCited = input.extracted.grounds_cited;
  const hasGrounds = Array.isArray(groundsCited) ? groundsCited.length > 0 : !!groundsCited;
  const isSection8Notice =
    noticeType.includes('section 8') ||
    noticeType.includes('section_8') ||
    noticeType.includes('s8') ||
    noticeType.includes('form 3') ||
    noticeType.includes('form_3') ||
    hasForm3Flag ||
    hasSection8Flag ||
    (hasGrounds && !isValidNoticeType); // Has grounds cited but no S21 indicators = likely S8

  if (isSection8Notice) {
    addIssue(blockers, 'S21-WRONG-DOC-TYPE', 'This appears to be a Section 8 notice (Form 3), not a Section 21 notice. Please upload a Section 21 (Form 6A) notice for no-fault possession.', 'blocking');
    // TERMINAL: Short-circuit validation - don't ask S21 compliance questions for wrong doc type
    return {
      status: 'invalid',
      blockers,
      warnings: [],
      upsell: undefined,
      terminal_blocker: true,
    };
  } else if (!isValidNoticeType) {
    addIssue(blockers, 'S21-WRONG-FORM', 'Notice must be a Section 21 Form 6A notice.', 'blocking');
  }

  const quality = input.extractionQuality;
  // Accept both date_served and service_date for compatibility
  const serviceDate = parseDate(input.extracted.date_served || input.extracted.service_date);
  const expiryDate = parseDate(input.extracted.expiry_date || input.extracted.notice_expiry_date);
  if (!serviceDate) {
    addTruthfulIssue(warnings, 'S21-SERVICE-DATE-MISSING', 'Service date not found in notice', 'warning', quality);
  }
  if (!expiryDate) {
    addTruthfulIssue(warnings, 'S21-EXPIRY-DATE-MISSING', 'Expiry date not found in notice', 'warning', quality);
  }

  if (serviceDate && expiryDate) {
    const minExpiry = addMonths(serviceDate, 2);
    if (expiryDate < minExpiry) {
      addIssue(blockers, 'S21-NOTICE-PERIOD', 'Expiry date does not meet the minimum two-month notice period.', 'blocking');
    }
  }

  // Accept various address field names
  const propertyAddress =
    input.extracted.property_address ||
    input.extracted.property_address_line1 ||
    input.extracted.address;
  if (isMissing(propertyAddress)) {
    addTruthfulIssue(warnings, 'S21-PROPERTY-ADDRESS-MISSING', 'Property address not found in notice', 'warning', quality);
  }

  // Accept both singular and plural tenant name fields
  const tenantNames =
    input.extracted.tenant_names ||
    input.extracted.tenant_name ||
    input.extracted.tenant_full_name;
  if (isMissing(tenantNames)) {
    addTruthfulIssue(warnings, 'S21-TENANT-NAME-MISSING', 'Tenant name(s) not found in notice', 'warning', quality);
  }

  // Accept various landlord name fields
  const landlordName = input.extracted.landlord_name || input.extracted.landlord_full_name;
  if (isMissing(landlordName)) {
    addTruthfulIssue(warnings, 'S21-LANDLORD-NAME-MISSING', 'Landlord name not found in notice', 'warning', quality);
  }

  const signaturePresent = normalizeBoolean(input.extracted.signature_present);
  if (signaturePresent === 'no') {
    addIssue(blockers, 'S21-SIGNATURE-MISSING', 'Notice must be signed to be valid.', 'blocking');
  } else if (signaturePresent === 'unknown') {
    addTruthfulIssue(warnings, 'S21-SIGNATURE-UNKNOWN', 'Signature could not be confirmed', 'warning', quality);
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
  const quality = input.extractionQuality;

  // Check for wrong document type - detect if this is a Section 21 (Form 6A) instead of Section 8
  const noticeType = String(input.extracted.notice_type || '').toLowerCase();
  const hasForm6aFlag = input.extracted.form_6a_used === true || input.extracted.form_6a_detected === true;
  const hasSection21Flag = input.extracted.section_21_detected === true;
  const isSection21Notice =
    noticeType.includes('section 21') ||
    noticeType.includes('section_21') ||
    noticeType.includes('s21') ||
    noticeType.includes('form 6a') ||
    noticeType.includes('form_6a') ||
    hasForm6aFlag ||
    hasSection21Flag;

  if (isSection21Notice) {
    addIssue(blockers, 'S8-WRONG-DOC-TYPE', 'This appears to be a Section 21 notice (Form 6A), not a Section 8 notice. Please upload a Section 8 (Form 3) notice for rent arrears possession.', 'blocking');
    // TERMINAL: Short-circuit validation - don't ask S8 compliance questions for wrong doc type
    return {
      status: 'invalid',
      blockers,
      warnings: [],
      upsell: undefined,
      terminal_blocker: true,
    };
  }

  const groundCodes = extractGroundCodes(input.extracted.grounds_cited);
  if (groundCodes.length === 0) {
    addTruthfulIssue(blockers, 'S8-GROUNDS-MISSING', 'At least one Section 8 ground must be cited', 'blocking', quality);
  }

  if (isMissing(input.extracted.date_served)) {
    addTruthfulIssue(warnings, 'S8-SERVICE-DATE-MISSING', 'Service date not found in notice', 'warning', quality);
  }

  if (isMissing(input.extracted.notice_period)) {
    addTruthfulIssue(warnings, 'S8-NOTICE-PERIOD-MISSING', 'Notice period not found in notice', 'warning', quality);
  }

  if (isMissing(input.extracted.rent_arrears_stated)) {
    addTruthfulIssue(warnings, 'S8-ARREARS-MISSING', 'Rent arrears amount not found in notice', 'warning', quality);
  }

  // Check tenant_names array (from regex extraction) OR tenant_details (from LLM extraction)
  // Official Form 3 provides tenant names, not a "tenant details" paragraph
  const hasTenantNames = Array.isArray(input.extracted.tenant_names) && input.extracted.tenant_names.length > 0;
  const hasTenantDetails = !isMissing(input.extracted.tenant_details);
  if (!hasTenantNames && !hasTenantDetails) {
    addTruthfulIssue(warnings, 'S8-TENANT-DETAILS-MISSING', 'Tenant details not found in notice', 'warning', quality);
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
      { id: 'deposit_protected', question: 'Was the tenant\'s deposit protected in a government-approved scheme?' },
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
];

export function getValidatorDefinition(key: ValidatorKey): ValidatorDefinition | undefined {
  return validatorDefinitions.find((def) => def.key === key);
}
