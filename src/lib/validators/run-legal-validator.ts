import type { EvidenceAnalysisResult, LevelAValidationResult } from '@/lib/evidence/analyze-evidence';
import {
  validateSection21Notice,
  validateSection8Notice,
  type ValidatorKey,
  type ValidatorResult,
} from '@/lib/validators/legal-validators';
import { resolveRequirementKey, REQUIREMENTS } from '@/lib/validators/requirements';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { getLevelAQuestions, normalizeLevelAFactsToCanonical, getKnownFactKeysFromExtraction, type FactQuestionConfig } from '@/lib/validators/facts/factKeys';

export interface RunLegalValidatorInput {
  product?: string | null;
  jurisdiction?: string | null;
  facts: Record<string, any>;
  analysis?: EvidenceAnalysisResult | null;
  /** Level A extraction result (if using Level A mode) */
  levelAResult?: LevelAValidationResult | null;
}

export interface RunLegalValidatorResult {
  validator_key: ValidatorKey | null;
  result: ValidatorResult | null;
  missing_questions?: QuestionDefinition[];
  recommendations?: Array<{ code: string; message: string }>;
  required_evidence_missing?: string[];
  /** Level A follow-up questions (replaces evidence upload requirements) */
  level_a_questions?: FactQuestionConfig[];
  /** Whether validator is in Level A mode */
  level_a_mode?: boolean;
}

function getFactValue(facts: Record<string, any>, paths: string[]): any {
  for (const path of paths) {
    const value = path.split('.').reduce<any>((acc, key) => (acc ? acc[key] : undefined), facts);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function resolveNoticeRoute(facts: Record<string, any>): string {
  return (
    getFactValue(facts, ['selected_notice_route', 'eviction_route', 'notice_type']) || ''
  ).toString();
}

function resolveProduct(facts: Record<string, any>, product?: string | null): string | null {
  return (
    product ||
    facts.__meta?.product ||
    facts.meta?.product ||
    facts.product ||
    null
  );
}

function resolveJurisdiction(facts: Record<string, any>, jurisdiction?: string | null): string | null {
  return (
    jurisdiction ||
    facts.jurisdiction ||
    facts.property_location ||
    facts.property?.country ||
    null
  );
}

function toYesNo(value: any): string | boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value;
  return value;
}

function isMissingAnswer(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim().length === 0) return true;
  if (value === 'unknown') return true;
  return false;
}

/**
 * Normalize extracted field names to match what validators expect.
 *
 * The LLM may return field names in different formats:
 * - camelCase (tenantName) vs snake_case (tenant_name)
 * - Singular (tenant_name) vs plural (tenant_names)
 * - Different variations (tenant vs tenant_names)
 *
 * This function maps all variations to the canonical names expected by validators.
 */
function normalizeExtractedFields(raw: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  // Define field name mappings: [source variations] -> target name
  const FIELD_MAPPINGS: Array<{ sources: string[]; target: string }> = [
    // Tenant names - validators expect tenant_names or tenant_name
    { sources: ['tenant_names', 'tenant_name', 'tenantNames', 'tenantName', 'tenant', 'tenants', 'contract_holder_names', 'contractHolderNames'], target: 'tenant_names' },
    // Landlord name
    { sources: ['landlord_name', 'landlordName', 'landlord', 'landlord_details', 'landlordDetails'], target: 'landlord_name' },
    // Property address
    { sources: ['property_address', 'propertyAddress', 'address', 'property', 'premises_address', 'premisesAddress'], target: 'property_address' },
    // Date served
    { sources: ['date_served', 'dateServed', 'service_date', 'serviceDate', 'served_date', 'servedDate', 'issue_date', 'issueDate'], target: 'date_served' },
    // Expiry date
    { sources: ['expiry_date', 'expiryDate', 'expiry', 'notice_expiry', 'noticeExpiry', 'possession_date', 'possessionDate'], target: 'expiry_date' },
    // Notice type
    { sources: ['notice_type', 'noticeType', 'type', 'form_type', 'formType'], target: 'notice_type' },
    // Signature
    { sources: ['signature_present', 'signaturePresent', 'signed', 'has_signature', 'hasSignature', 'is_signed', 'isSigned'], target: 'signature_present' },
    // Form 6A
    { sources: ['form_6a_used', 'form6aUsed', 'form_6a', 'form6a', 'is_form_6a', 'isForm6a'], target: 'form_6a_used' },
    // Section 21 detected
    { sources: ['section_21_detected', 'section21Detected', 's21_detected', 's21Detected'], target: 'section_21_detected' },
    // Housing Act mention
    { sources: ['housing_act_1988_mentioned', 'housingAct1988Mentioned', 'housing_act_mentioned', 'housingActMentioned'], target: 'housing_act_1988_mentioned' },
    // Deposit protected
    { sources: ['deposit_protected', 'depositProtected', 'deposit_protection', 'depositProtection'], target: 'deposit_protected' },
    // Prescribed info
    { sources: ['prescribed_info_served', 'prescribedInfoServed', 'prescribed_information', 'prescribedInformation'], target: 'prescribed_info_served' },
    // Gas safety
    { sources: ['gas_safety_mentioned', 'gasSafetyMentioned', 'gas_safety', 'gasSafety', 'gas_certificate'], target: 'gas_safety_mentioned' },
    // EPC
    { sources: ['epc_mentioned', 'epcMentioned', 'epc', 'energy_performance_certificate'], target: 'epc_mentioned' },
    // How to rent
    { sources: ['how_to_rent_mentioned', 'howToRentMentioned', 'how_to_rent', 'howToRent'], target: 'how_to_rent_mentioned' },
    // Section 8 fields
    { sources: ['grounds_cited', 'groundsCited', 'grounds', 'eviction_grounds', 'evictionGrounds', 'ground_for_possession', 'groundForPossession'], target: 'grounds_cited' },
    { sources: ['rent_arrears_stated', 'rentArrearsStated', 'arrears_amount', 'arrearsAmount', 'rent_arrears'], target: 'rent_arrears_stated' },
    { sources: ['tenant_details', 'tenantDetails'], target: 'tenant_details' },
    { sources: ['notice_period', 'noticePeriod'], target: 'notice_period' },
    { sources: ['rent_amount', 'rentAmount', 'rent'], target: 'rent_amount' },
    { sources: ['rent_frequency', 'rentFrequency'], target: 'rent_frequency' },
    // Wales fields
    { sources: ['rhw_form_number', 'rhwFormNumber', 'rhw_form', 'rhwForm'], target: 'rhw_form_number' },
    { sources: ['bilingual_text_present', 'bilingualTextPresent', 'bilingual', 'is_bilingual', 'isBilingual'], target: 'bilingual_text_present' },
    { sources: ['contract_holder_details', 'contractHolderDetails'], target: 'contract_holder_details' },
    { sources: ['written_statement_referenced', 'writtenStatementReferenced'], target: 'written_statement_referenced' },
    { sources: ['fitness_for_habitation_confirmed', 'fitnessForHabitationConfirmed'], target: 'fitness_for_habitation_confirmed' },
    { sources: ['deposit_protection_confirmed', 'depositProtectionConfirmed'], target: 'deposit_protection_confirmed' },
    { sources: ['occupation_type', 'occupationType'], target: 'occupation_type' },
    // Scotland fields
    { sources: ['ground_cited', 'groundCited', 'scotland_ground', 'scotlandGround'], target: 'ground_cited' },
    { sources: ['ground_description', 'groundDescription'], target: 'ground_description' },
    { sources: ['ground_mandatory', 'groundMandatory', 'is_mandatory', 'isMandatory'], target: 'ground_mandatory' },
    { sources: ['ground_evidence_mentioned', 'groundEvidenceMentioned'], target: 'ground_evidence_mentioned' },
    { sources: ['tribunal_reference', 'tribunalReference'], target: 'tribunal_reference' },
    { sources: ['tenancy_start_date', 'tenancyStartDate', 'start_date', 'startDate'], target: 'tenancy_start_date' },
    // Tenancy agreement fields
    { sources: ['tenancy_type', 'tenancyType', 'agreement_type', 'agreementType'], target: 'tenancy_type' },
    { sources: ['prohibited_fees_present', 'prohibitedFeesPresent'], target: 'prohibited_fees_present' },
    { sources: ['unfair_terms_present', 'unfairTermsPresent'], target: 'unfair_terms_present' },
    { sources: ['missing_clauses', 'missingClauses'], target: 'missing_clauses' },
    // Money claim fields
    { sources: ['claim_amount', 'claimAmount'], target: 'claim_amount' },
    { sources: ['lba_sent', 'lbaSent', 'letter_before_action'], target: 'lba_sent' },
    { sources: ['lba_date', 'lbaDate'], target: 'lba_date' },
    { sources: ['payment_plan_offered', 'paymentPlanOffered'], target: 'payment_plan_offered' },
    { sources: ['payment_history', 'paymentHistory'], target: 'payment_history' },
  ];

  // First, copy all original fields
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = value;
  }

  // Then apply mappings - find the first source that exists and map to target
  for (const mapping of FIELD_MAPPINGS) {
    for (const source of mapping.sources) {
      if (raw[source] !== undefined && raw[source] !== null) {
        // Only set if target isn't already set (prefer earlier sources in list)
        if (normalized[mapping.target] === undefined || normalized[mapping.target] === null) {
          normalized[mapping.target] = raw[source];
        }
        break;
      }
    }
  }

  return normalized;
}

function collectMissingQuestions(questions: QuestionDefinition[], facts: Record<string, any>) {
  return questions.filter((question) => {
    const value = getFactValue(facts, [question.factKey]);
    return question.required && isMissingAnswer(value);
  });
}

function collectEvidenceCategories(facts: Record<string, any>): string[] {
  const files = (facts.evidence?.files || []) as Array<{
    category?: string;
    doc_type?: string;
    doc_type_confidence?: number | null;
  }>;
  const categories = files
    .map((file) => (file.category || '').toLowerCase())
    .filter((category) => category.length > 0);
  const docTypes = files
    .filter((file) => (file.doc_type_confidence ?? 0) >= 0.6)
    .map((file) => (file.doc_type || '').toLowerCase())
    .filter((docType) => docType.length > 0);
  return [...categories, ...docTypes];
}

function collectMissingEvidence(requiredEvidence: string[] | undefined, facts: Record<string, any>) {
  if (!requiredEvidence?.length) return [];
  const present = new Set(collectEvidenceCategories(facts));
  return requiredEvidence.filter((evidenceType) => !present.has(evidenceType));
}

function buildRecommendations(
  result: ValidatorResult | null,
  missingEvidence: string[],
  requirementKey: ReturnType<typeof resolveRequirementKey>,
  facts: Record<string, any>,
  levelAMode?: boolean,
): Array<{ code: string; message: string }> {
  if (!result) return [];
  const recommendations: Array<{ code: string; message: string }> = [];
  if (result.blockers?.length) {
    recommendations.push({ code: 'BLOCKERS_PRESENT', message: 'Resolve blocking compliance issues before proceeding.' });
  }
  if (result.warnings?.length) {
    recommendations.push({ code: 'WARNINGS_PRESENT', message: 'Address warning items to reduce risk.' });
  }
  if (result.upsell?.reason) {
    recommendations.push({ code: 'UPSELL_RECOMMENDED', message: result.upsell.reason });
  }

  // In Level A mode, don't recommend evidence uploads - use follow-up questions instead
  if (!levelAMode) {
    missingEvidence.forEach((item) => {
      recommendations.push({
        code: `EVIDENCE_MISSING_${item.toUpperCase()}`,
        message: `Upload required evidence: ${item.replace(/_/g, ' ')}`,
      });
    });
  }

  if (requirementKey === 'money_claim') {
    const preAction = getFactValue(facts, ['pre_action_steps']);
    if (preAction !== 'yes') {
      recommendations.push({
        code: 'MONEY_CLAIM_LBA_MISSING',
        message: 'Send a Letter Before Action (LBA) before filing a money claim.',
      });
    }
  }
  return recommendations;
}

function applyPricingMessage(price: number, reason: string) {
  return `${reason} (£${price.toFixed(2)}).`;
}

function buildUpsell(product: string | null, facts: Record<string, any>) {
  if (!product) return undefined;
  if (product === 'notice_only') {
    return {
      product: 'eviction_pack',
      price: 199.99,
      reason: applyPricingMessage(199.99, 'Upgrade to the Eviction Pack for court-ready documents'),
    };
  }
  if (product === 'money_claim') {
    return {
      product: 'money_claim_pack',
      price: 149.99,
      reason: applyPricingMessage(149.99, 'Upgrade to the Money Claim Pack for court-ready filing'),
    };
  }
  if (product === 'tenancy_agreement') {
    const tier = facts.meta?.product_tier || facts.__meta?.product_tier || facts.tenancy_tier;
    if (tier !== 'premium') {
      return {
        product: 'tenancy_premium',
        price: 24.99,
        reason: applyPricingMessage(24.99, 'Upgrade to the Premium Tenancy Agreement for enhanced clauses'),
      };
    }
    return {
      product: 'tenancy_standard',
      price: 14.99,
      reason: applyPricingMessage(14.99, 'Standard tenancy agreement remains available'),
    };
  }
  return undefined;
}

function buildSection21Answers(facts: Record<string, any>, extracted?: Record<string, any>) {
  const ext = extracted || {};

  // FIX: Include Level A keys in the lookup paths for S21 compliance facts
  // Level A answers are stored with keys like deposit_protected_within_30_days
  // but the validator expects canonical keys like deposit_protected
  const depositProtected = ext.deposit_protected ?? getFactValue(facts, [
    'deposit_protected',
    'deposit_protected_within_30_days', // Level A key
    'tenancy.deposit_protected',
  ]);
  const prescribedInfo = ext.prescribed_info_served ?? getFactValue(facts, [
    'prescribed_info_served',
    'prescribed_info_within_30_days', // Level A key
    'prescribed_info_given',
    'prescribed_info_provided',
    'tenancy.prescribed_info_given',
  ]);
  const gasCert = ext.gas_safety_mentioned ?? getFactValue(facts, [
    'gas_safety_pre_move_in',
    'gas_safety_before_move_in', // Level A key
    'gas_certificate_provided',
    'gas_safety_cert_provided',
    'property.gas_certificate_provided',
  ]);
  const epcProvided = ext.epc_mentioned ?? getFactValue(facts, [
    'epc_provided',
    'epc_served',  // Section21ComplianceSection uses this key
    'epc_provided_to_tenant', // Level A key
    'property.epc_provided',
    'section21.epc_provided',
    'section21.epc_served',
    'compliance.epc_provided',
    'compliance.epc_served',
  ]);
  const howToRent = ext.how_to_rent_mentioned ?? getFactValue(facts, [
    'how_to_rent_provided',
    'how_to_rent_served',  // Section21ComplianceSection uses this key
    'how_to_rent_given',
    'how_to_rent_guide_provided', // Level A key
    'tenancy.how_to_rent_provided',
    'section21.how_to_rent_provided',
    'section21.how_to_rent_served',
    'compliance.how_to_rent_provided',
    'compliance.how_to_rent_served',
  ]);

  // For licensing, check both canonical and Level A keys
  const licensingStatus = getFactValue(facts, ['property_licensing_status', 'property.licensing_status']);
  const propertyLicensed = licensingStatus === 'unlicensed'
    ? 'no'
    : licensingStatus
      ? 'yes'
      : getFactValue(facts, [
          'licence_held',
          'property_licensing_compliant', // Level A key
          'property_licensed',
        ]);

  const arrearsTotal = getFactValue(facts, [
    'arrears_amount',
    'arrears_total',
    'issues.rent_arrears.total_arrears',
  ]);

  return {
    deposit_protected: toYesNo(depositProtected),
    prescribed_info_served: toYesNo(prescribedInfo),
    gas_safety_pre_move_in: toYesNo(gasCert),
    epc_provided: toYesNo(epcProvided),
    how_to_rent_provided: toYesNo(howToRent),
    property_licensed: toYesNo(propertyLicensed),
    retaliatory_eviction: toYesNo(getFactValue(facts, ['recent_repair_complaints', 'eviction.tenant_complained'])),
    rent_arrears_exist: toYesNo(
      typeof arrearsTotal === 'number' ? arrearsTotal > 0 : arrearsTotal
    ),
    fixed_term_status: toYesNo(getFactValue(facts, ['is_fixed_term', 'tenancy.is_fixed_term'])),
  };
}

function buildSection8Answers(facts: Record<string, any>, extracted?: Record<string, any>) {
  const ext = extracted || {};

  // FIX: Include Level A keys in the lookup paths for rent_frequency, rent_amount, and arrears
  // Level A answers are stored with keys like rent_frequency_confirmed, rent_amount_confirmed, current_arrears_amount
  // but the validator expects canonical keys like rent_frequency, rent_amount, current_arrears
  const rentFrequency = ext.rent_frequency ?? getFactValue(facts, [
    'rent_frequency',
    'rent_frequency_confirmed', // Level A key
    'tenancy.rent_frequency',
  ]);
  const rentAmount = ext.rent_amount ?? getFactValue(facts, [
    'rent_amount',
    'rent_amount_confirmed', // Level A key
    'tenancy.rent_amount',
  ]);
  const arrearsTotal = ext.rent_arrears_stated ?? getFactValue(facts, [
    'current_arrears',
    'current_arrears_amount', // Level A key
    'arrears_amount',
    'arrears_total',
    'issues.rent_arrears.total_arrears',
  ]);
  const tenantNames = ext.tenant_names ?? getFactValue(facts, ['tenant_names', 'tenant_full_name', 'tenants']);
  const jointTenants = Array.isArray(tenantNames) ? tenantNames.length > 1 : undefined;

  return {
    rent_frequency: toYesNo(rentFrequency),
    rent_amount: rentAmount,
    current_arrears: arrearsTotal,
    payment_history: toYesNo(ext.payment_history ?? getFactValue(facts, ['payment_history'])),
    joint_tenants: toYesNo(getFactValue(facts, ['joint_tenants']) ?? jointTenants),
    benefit_delays: toYesNo(getFactValue(facts, ['benefit_delays'])),
    disrepair_counterclaims: toYesNo(getFactValue(facts, ['disrepair_counterclaims'])),
    payment_since_notice: toYesNo(getFactValue(facts, ['payment_since_notice'])),
  };
}

/**
 * Extract fields from facts that may have been previously extracted from documents.
 * This allows validation to work even when analysis is null (e.g., during Q&A re-check).
 *
 * These fields are typically populated by mergeExtractedFacts() during document upload,
 * so they persist in the case facts even after the original analysis is no longer passed.
 */
function extractFieldsFromFacts(facts: Record<string, any>): Record<string, any> {
  const extracted: Record<string, any> = {};

  // Form detection fields
  if (facts.form_6a_used !== undefined) extracted.form_6a_used = facts.form_6a_used;
  if (facts.form_6a_detected !== undefined) extracted.form_6a_detected = facts.form_6a_detected;
  if (facts.section_21_detected !== undefined) extracted.section_21_detected = facts.section_21_detected;
  if (facts.form_3_detected !== undefined) extracted.form_3_detected = facts.form_3_detected;
  if (facts.section_8_detected !== undefined) extracted.section_8_detected = facts.section_8_detected;

  // Notice type
  if (facts.notice_type !== undefined) extracted.notice_type = facts.notice_type;

  // Dates
  if (facts.date_served !== undefined) extracted.date_served = facts.date_served;
  if (facts.service_date !== undefined) extracted.service_date = facts.service_date;
  if (facts.notice_date !== undefined) extracted.notice_date = facts.notice_date;
  if (facts.expiry_date !== undefined) extracted.expiry_date = facts.expiry_date;
  if (facts.notice_expiry_date !== undefined) extracted.notice_expiry_date = facts.notice_expiry_date;
  if (facts.earliest_proceedings_date !== undefined) extracted.earliest_proceedings_date = facts.earliest_proceedings_date;

  // Names
  if (facts.tenant_names !== undefined) extracted.tenant_names = facts.tenant_names;
  if (facts.tenant_name !== undefined) extracted.tenant_name = facts.tenant_name;
  if (facts.tenant_full_name !== undefined) extracted.tenant_full_name = facts.tenant_full_name;
  if (facts.landlord_name !== undefined) extracted.landlord_name = facts.landlord_name;
  if (facts.landlord_full_name !== undefined) extracted.landlord_full_name = facts.landlord_full_name;

  // Address
  if (facts.property_address !== undefined) extracted.property_address = facts.property_address;
  if (facts.property_address_line1 !== undefined) extracted.property_address_line1 = facts.property_address_line1;
  if (facts.address !== undefined) extracted.address = facts.address;

  // Signature
  if (facts.signature_present !== undefined) extracted.signature_present = facts.signature_present;

  // Compliance fields (may be extracted from notice or confirmed by user)
  if (facts.deposit_protected !== undefined) extracted.deposit_protected = facts.deposit_protected;
  if (facts.prescribed_info_served !== undefined) extracted.prescribed_info_served = facts.prescribed_info_served;
  if (facts.gas_safety_mentioned !== undefined) extracted.gas_safety_mentioned = facts.gas_safety_mentioned;
  if (facts.epc_mentioned !== undefined) extracted.epc_mentioned = facts.epc_mentioned;
  if (facts.how_to_rent_mentioned !== undefined) extracted.how_to_rent_mentioned = facts.how_to_rent_mentioned;

  // Section 8 specific
  if (facts.grounds_cited !== undefined) extracted.grounds_cited = facts.grounds_cited;
  if (facts.ground_for_possession !== undefined) extracted.ground_for_possession = facts.ground_for_possession;
  if (facts.rent_arrears_stated !== undefined) extracted.rent_arrears_stated = facts.rent_arrears_stated;
  if (facts.tenant_details !== undefined) extracted.tenant_details = facts.tenant_details;
  if (facts.notice_period !== undefined) extracted.notice_period = facts.notice_period;

  // Rent/deposit
  if (facts.rent_amount !== undefined) extracted.rent_amount = facts.rent_amount;
  if (facts.rent_frequency !== undefined) extracted.rent_frequency = facts.rent_frequency;
  if (facts.deposit_amount !== undefined) extracted.deposit_amount = facts.deposit_amount;

  return extracted;
}

export function runLegalValidator(input: RunLegalValidatorInput): RunLegalValidatorResult {
  const product = resolveProduct(input.facts, input.product);
  const jurisdiction = resolveJurisdiction(input.facts, input.jurisdiction);

  // FIX: Normalize Level A fact keys to canonical validator keys FIRST
  // This ensures that Level A answers (e.g., rent_frequency_confirmed) are mapped to
  // canonical keys (e.g., rent_frequency) that validators expect
  const normalizedFacts = normalizeLevelAFactsToCanonical(input.facts);

  // FIX: Build extracted fields from BOTH analysis.extracted_fields AND facts
  // This ensures extracted values are not lost when analysis is null (e.g., after Q&A re-check)
  const rawExtracted = input.analysis?.extracted_fields || {};
  const factsBasedExtracted = extractFieldsFromFacts(normalizedFacts);

  // Merge: analysis.extracted_fields takes precedence, but facts fills in gaps
  const mergedExtracted = { ...factsBasedExtracted, ...rawExtracted };
  const extracted = normalizeExtractedFields(mergedExtracted);
  const extractionQuality = input.analysis?.extraction_quality || undefined;

  // Debug logging for field normalization
  const rawKeys = Object.keys(rawExtracted);
  const factsKeys = Object.keys(factsBasedExtracted);
  const normalizedKeys = Object.keys(extracted);
  if (factsKeys.length > 0 && rawKeys.length === 0) {
    console.log('[runLegalValidator] Using facts-based extracted fields (analysis was null):', {
      factsFieldCount: factsKeys.length,
      factsFields: factsKeys.slice(0, 10),
    });
  }
  const newKeys = normalizedKeys.filter(k => !rawKeys.includes(k) && !factsKeys.includes(k));
  if (newKeys.length > 0) {
    console.log('[runLegalValidator] Field normalization applied:', {
      rawFieldCount: rawKeys.length,
      normalizedFieldCount: normalizedKeys.length,
      newMappedFields: newKeys,
    });
  }

  const requirementKey = resolveRequirementKey({
    product,
    jurisdiction,
    facts: normalizedFacts,
  });
  const requirement = requirementKey ? REQUIREMENTS[requirementKey] : null;
  const isLevelAMode = requirement?.levelAMode === true;

  if (!product) {
    return { validator_key: null, result: null };
  }

  // Helper to get answered fact keys from normalizedFacts AND extracted fields
  // This ensures we don't ask Level A questions for values already extracted from documents
  const getAnsweredFactKeys = (): string[] => {
    // Get keys from user-provided facts
    const userAnsweredKeys = Object.keys(normalizedFacts).filter((key) => {
      const value = normalizedFacts[key];
      return value !== undefined && value !== null && value !== '' && value !== 'unknown';
    });

    // Get Level A keys that correspond to extracted fields from document
    const extractedLevelAKeys = getKnownFactKeysFromExtraction(extracted);

    // Combine and deduplicate
    return [...new Set([...userAnsweredKeys, ...extractedLevelAKeys])];
  };

  // Only support Section 21 and Section 8 validators for England
  if (product === 'notice_only' || product === 'complete_pack') {
    const route = resolveNoticeRoute(normalizedFacts).toLowerCase();

    if (route.includes('section_21') || route.includes('section 21')) {
      const answers = buildSection21Answers(normalizedFacts, extracted);
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
        extractionQuality,
      });
      const missingEvidence = isLevelAMode ? [] : collectMissingEvidence(requirement?.requiredEvidence, normalizedFacts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, normalizedFacts);
      }

      // Get Level A follow-up questions (unanswered ones only)
      const levelAQuestions = isLevelAMode
        ? getLevelAQuestions('section_21', getAnsweredFactKeys())
        : [];

      return {
        validator_key: 'section_21',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, normalizedFacts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, normalizedFacts, isLevelAMode),
        required_evidence_missing: isLevelAMode ? [] : missingEvidence,
        level_a_questions: levelAQuestions,
        level_a_mode: isLevelAMode,
      };
    }

    if (route.includes('section_8') || route.includes('section 8')) {
      const answers = buildSection8Answers(normalizedFacts, extracted);
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted,
        answers,
        extractionQuality,
      });
      const missingEvidence = isLevelAMode ? [] : collectMissingEvidence(requirement?.requiredEvidence, normalizedFacts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, normalizedFacts);
      }

      // Get Level A follow-up questions (unanswered ones only)
      const levelAQuestions = isLevelAMode
        ? getLevelAQuestions('section_8', getAnsweredFactKeys())
        : [];

      return {
        validator_key: 'section_8',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, normalizedFacts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, normalizedFacts, isLevelAMode),
        required_evidence_missing: isLevelAMode ? [] : missingEvidence,
        level_a_questions: levelAQuestions,
        level_a_mode: isLevelAMode,
      };
    }
  }

  return { validator_key: null, result: null };
}
