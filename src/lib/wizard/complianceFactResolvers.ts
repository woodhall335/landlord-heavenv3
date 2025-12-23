/**
 * Compliance Fact Resolvers
 *
 * Centralized resolution of compliance-critical facts for Section 21 and other notice routes.
 * These resolvers handle key aliasing (legacy vs canonical) and type coercion to ensure
 * consistent validation across decision engine, compliance evaluator, and templates.
 *
 * IMPORTANT: When the wizard collects facts using MQS keys like `gas_certificate_provided`,
 * but legacy code checks `gas_safety_cert_provided`, these resolvers bridge the gap.
 */

import { normalizeFactKeys, getFactValue, isTruthy, isFalsy } from './normalizeFacts';

/**
 * Resolved deposit facts with type-safe values
 */
export interface ResolvedDeposit {
  taken: boolean;
  amount: number | null;
  protected: boolean | null;
  scheme: string | null;
  prescribedInfoGiven: boolean | null;
  capConfirmed: boolean;
}

/**
 * Resolve all deposit-related facts from wizard answers
 * Handles legacy keys: deposit_protected_scheme, deposit_is_protected, etc.
 */
export function resolveDepositFacts(facts: Record<string, any>): ResolvedDeposit {
  const normalized = normalizeFactKeys(facts);

  // deposit_taken - check multiple possible keys
  const depositTaken = getFactValue(facts, 'deposit_taken', 'tenancy.deposit_taken');
  const taken = depositTaken === true || depositTaken === 'yes';

  // deposit_amount - coerce to number
  const rawAmount = getFactValue(facts, 'deposit_amount', 'tenancy.deposit_amount');
  const amount = rawAmount !== undefined && rawAmount !== null
    ? (typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount))
    : null;

  // deposit_protected - canonical key after normalization
  const depositProtected = normalized.deposit_protected ?? facts.deposit_protected_scheme ?? facts.deposit_is_protected;
  let protectedValue: boolean | null = null;
  if (depositProtected === true) protectedValue = true;
  else if (depositProtected === false) protectedValue = false;
  else if (depositProtected === 'yes') protectedValue = true;
  else if (depositProtected === 'no') protectedValue = false;

  // deposit_scheme
  const scheme = getFactValue(facts, 'deposit_scheme', 'deposit_scheme_name') ?? null;

  // prescribed_info_given - check canonical and legacy keys
  const prescribedInfo = normalized.prescribed_info_given
    ?? facts.prescribed_info_provided
    ?? facts.prescribed_info_served
    ?? facts.tenancy?.prescribed_info_given;
  let prescribedInfoGiven: boolean | null = null;
  if (prescribedInfo === true || prescribedInfo === 'yes') prescribedInfoGiven = true;
  else if (prescribedInfo === false || prescribedInfo === 'no') prescribedInfoGiven = false;

  // deposit_reduced_to_legal_cap_confirmed
  const capConfirmedRaw = facts.deposit_reduced_to_legal_cap_confirmed;
  const capConfirmed = capConfirmedRaw === true || capConfirmedRaw === 'yes';

  return {
    taken,
    amount: amount !== null && Number.isFinite(amount) ? amount : null,
    protected: protectedValue,
    scheme,
    prescribedInfoGiven,
    capConfirmed,
  };
}

/**
 * Resolved gas certificate facts
 */
export interface ResolvedGasCertificate {
  hasGasAppliances: boolean | null;
  certificateProvided: boolean | null;
}

/**
 * Resolve gas safety certificate facts
 * Handles legacy keys: gas_safety_cert_provided, gas_safety_certificate_provided, etc.
 */
export function resolveGasCertificateFacts(facts: Record<string, any>): ResolvedGasCertificate {
  const normalized = normalizeFactKeys(facts);

  // has_gas_appliances
  const hasGasRaw = facts.has_gas_appliances ?? facts.property?.has_gas_appliances;
  let hasGasAppliances: boolean | null = null;
  if (hasGasRaw === true || hasGasRaw === 'yes') hasGasAppliances = true;
  else if (hasGasRaw === false || hasGasRaw === 'no') hasGasAppliances = false;

  // gas_certificate_provided - canonical key
  // Check both canonical (after normalization) and all legacy variants
  const gasCertRaw = normalized.gas_certificate_provided
    ?? facts.gas_certificate_provided
    ?? facts.gas_safety_cert_provided
    ?? facts.gas_safety_certificate_provided
    ?? facts.gas_safety_record_provided
    ?? facts.gas_cert_provided;

  let certificateProvided: boolean | null = null;
  if (gasCertRaw === true || gasCertRaw === 'yes') certificateProvided = true;
  else if (gasCertRaw === false || gasCertRaw === 'no') certificateProvided = false;

  return {
    hasGasAppliances,
    certificateProvided,
  };
}

/**
 * Resolved How to Rent facts
 */
export interface ResolvedHowToRent {
  provided: boolean | null;
}

/**
 * Resolve How to Rent guide facts
 * Handles legacy keys: how_to_rent_given, h2r_provided, how_to_rent_guide_provided, etc.
 */
export function resolveHowToRentFacts(facts: Record<string, any>): ResolvedHowToRent {
  const normalized = normalizeFactKeys(facts);

  // how_to_rent_provided - canonical key
  // Check both canonical (after normalization) and all legacy variants
  const h2rRaw = normalized.how_to_rent_provided
    ?? facts.how_to_rent_provided
    ?? facts.how_to_rent_given
    ?? facts.h2r_provided
    ?? facts.how_to_rent_served
    ?? facts.how_to_rent_guide_provided;

  let provided: boolean | null = null;
  if (h2rRaw === true || h2rRaw === 'yes') provided = true;
  else if (h2rRaw === false || h2rRaw === 'no') provided = false;

  return { provided };
}

/**
 * Resolved EPC facts
 */
export interface ResolvedEPC {
  provided: boolean | null;
}

/**
 * Resolve EPC facts
 * Handles legacy keys: epc_certificate_provided, energy_certificate_provided, etc.
 */
export function resolveEPCFacts(facts: Record<string, any>): ResolvedEPC {
  const normalized = normalizeFactKeys(facts);

  // epc_provided - canonical key
  const epcRaw = normalized.epc_provided
    ?? facts.epc_provided
    ?? facts.epc_certificate_provided
    ?? facts.energy_certificate_provided;

  let provided: boolean | null = null;
  if (epcRaw === true || epcRaw === 'yes') provided = true;
  else if (epcRaw === false || epcRaw === 'no') provided = false;

  return { provided };
}

/**
 * Resolved licensing facts
 */
export interface ResolvedLicensing {
  status: 'licensed' | 'not_required' | 'unlicensed' | 'pending' | null;
  hmoRequired: boolean | null;
  hmoValid: boolean | null;
}

/**
 * Resolve property licensing facts
 * Handles legacy keys: licensing_status, hmo_license_status, etc.
 */
export function resolveLicensingFacts(facts: Record<string, any>): ResolvedLicensing {
  const normalized = normalizeFactKeys(facts);

  // property_licensing_status - canonical key
  const statusRaw = normalized.property_licensing_status
    ?? facts.property_licensing_status
    ?? facts.licensing_status
    ?? facts.hmo_license_status;

  let status: ResolvedLicensing['status'] = null;
  if (statusRaw === 'licensed') status = 'licensed';
  else if (statusRaw === 'not_required') status = 'not_required';
  else if (statusRaw === 'unlicensed') status = 'unlicensed';
  else if (statusRaw === 'pending') status = 'pending';

  // HMO license facts
  const hmoRequiredRaw = facts.hmo_license_required;
  const hmoValidRaw = facts.hmo_license_valid;

  let hmoRequired: boolean | null = null;
  let hmoValid: boolean | null = null;

  if (hmoRequiredRaw === true || hmoRequiredRaw === 'yes') hmoRequired = true;
  else if (hmoRequiredRaw === false || hmoRequiredRaw === 'no') hmoRequired = false;

  if (hmoValidRaw === true || hmoValidRaw === 'yes') hmoValid = true;
  else if (hmoValidRaw === false || hmoValidRaw === 'no') hmoValid = false;

  return { status, hmoRequired, hmoValid };
}

/**
 * Resolved rent facts with type-safe values
 */
export interface ResolvedRent {
  amount: number | null;
  frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly' | null;
  annualRent: number | null;
  weeklyRent: number | null;
}

/**
 * Resolve rent facts with proper numeric coercion
 */
export function resolveRentFacts(facts: Record<string, any>): ResolvedRent {
  // rent_amount - coerce to number
  const rawAmount = getFactValue(facts, 'rent_amount', 'tenancy.rent_amount');
  const amount = rawAmount !== undefined && rawAmount !== null
    ? (typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount))
    : null;

  // rent_frequency
  const rawFreq = getFactValue(facts, 'rent_frequency', 'tenancy.rent_frequency');
  let frequency: ResolvedRent['frequency'] = null;
  if (['weekly', 'fortnightly', 'monthly', 'quarterly', 'yearly'].includes(rawFreq)) {
    frequency = rawFreq as ResolvedRent['frequency'];
  }

  // Calculate annual and weekly rent
  let annualRent: number | null = null;
  let weeklyRent: number | null = null;

  if (amount !== null && Number.isFinite(amount) && frequency) {
    switch (frequency) {
      case 'weekly':
        annualRent = amount * 52;
        break;
      case 'fortnightly':
        annualRent = amount * 26;
        break;
      case 'monthly':
        annualRent = amount * 12;
        break;
      case 'quarterly':
        annualRent = amount * 4;
        break;
      case 'yearly':
        annualRent = amount;
        break;
    }
    weeklyRent = annualRent ? annualRent / 52 : null;
  }

  return {
    amount: amount !== null && Number.isFinite(amount) ? amount : null,
    frequency,
    annualRent,
    weeklyRent,
  };
}

/**
 * All Section 21 compliance facts resolved together
 */
export interface ResolvedSection21Compliance {
  deposit: ResolvedDeposit;
  gasCertificate: ResolvedGasCertificate;
  howToRent: ResolvedHowToRent;
  epc: ResolvedEPC;
  licensing: ResolvedLicensing;
  rent: ResolvedRent;
  recentRepairComplaints: boolean | null;
}

/**
 * Resolve all Section 21 compliance facts at once
 */
export function resolveSection21ComplianceFacts(facts: Record<string, any>): ResolvedSection21Compliance {
  // recent_repair_complaints
  const repairComplaintsRaw = facts.recent_repair_complaints ?? facts.repair_complaints ?? facts.outstanding_repairs;
  let recentRepairComplaints: boolean | null = null;
  if (repairComplaintsRaw === true || repairComplaintsRaw === 'yes') recentRepairComplaints = true;
  else if (repairComplaintsRaw === false || repairComplaintsRaw === 'no') recentRepairComplaints = false;

  return {
    deposit: resolveDepositFacts(facts),
    gasCertificate: resolveGasCertificateFacts(facts),
    howToRent: resolveHowToRentFacts(facts),
    epc: resolveEPCFacts(facts),
    licensing: resolveLicensingFacts(facts),
    rent: resolveRentFacts(facts),
    recentRepairComplaints,
  };
}

/**
 * Mapping from compliance issue codes to affected question IDs
 * This enables deep-linking from validation errors to wizard steps
 */
export const COMPLIANCE_ISSUE_TO_QUESTION_ID: Record<string, string> = {
  // Section 21 compliance evaluator codes
  'S21-DEPOSIT-NONCOMPLIANT': 'deposit_protected_scheme',
  'S21-PRESCRIBED-INFO-REQUIRED': 'prescribed_info_given',
  'S21-DEPOSIT-CAP-EXCEEDED': 'deposit_reduced_to_legal_cap_confirmed',
  'S21-LICENSING': 'property_licensing',
  'S21-GAS-CERT': 'gas_safety_certificate',
  'S21-EPC': 'epc_provided',
  'S21-H2R': 'how_to_rent_provided',
  'S21-RETALIATORY': 'recent_repair_complaints_s21',
  'S21-FOUR-MONTH-BAR': 'tenancy_start_date',
  'S21-DATE-TOO-SOON': 'notice_service',
  'S21-MINIMUM-NOTICE': 'notice_service',

  // Section 8 compliance evaluator codes
  'S8-GROUNDS-REQUIRED': 'section8_grounds_selection',
  'S8-NOTICE-PERIOD': 'notice_service',

  // Decision engine issue codes (uppercase converted)
  'DEPOSIT_NOT_PROTECTED': 'deposit_protected_scheme',
  'PRESCRIBED_INFO_NOT_GIVEN': 'prescribed_info_given',
  'GAS_SAFETY_NOT_PROVIDED': 'gas_safety_certificate',
  'HOW_TO_RENT_NOT_PROVIDED': 'how_to_rent_provided',
  'EPC_NOT_PROVIDED': 'epc_provided',
  'HMO_NOT_LICENSED': 'property_licensing',
  'DEPOSIT_EXCEEDS_CAP': 'deposit_reduced_to_legal_cap_confirmed',

  // Wales codes
  'S173-LICENSING': 'rent_smart_wales_registered',
  'S173-NOTICE-PERIOD-UNDETERMINED': 'notice_service_date',
  'S173-PERIOD-BAR': 'notice_service_date',

  // Scotland codes
  'NTL-GROUND-REQUIRED': 'eviction_grounds',
  'NTL-MIXED-GROUNDS': 'eviction_grounds',
  'NTL-PRE-ACTION': 'pre_action_contact',
  'NTL-NOTICE-PERIOD': 'notice_service',
};

/**
 * Get the question ID for a given compliance issue code
 */
export function getQuestionIdForIssue(issueCode: string): string | undefined {
  // Check direct match
  if (COMPLIANCE_ISSUE_TO_QUESTION_ID[issueCode]) {
    return COMPLIANCE_ISSUE_TO_QUESTION_ID[issueCode];
  }

  // Check uppercase version (decision engine codes are lowercase)
  const upperCode = issueCode.toUpperCase();
  if (COMPLIANCE_ISSUE_TO_QUESTION_ID[upperCode]) {
    return COMPLIANCE_ISSUE_TO_QUESTION_ID[upperCode];
  }

  return undefined;
}
