import type { EvidenceAnalysisResult } from '@/lib/evidence/analyze-evidence';
import {
  validateSection21Notice,
  validateSection8Notice,
  validateWalesNotice,
  validateScotlandNoticeToLeave,
  validateTenancyAgreement,
  validateMoneyClaim,
  type ValidatorKey,
  type ValidatorResult,
} from '@/lib/validators/legal-validators';
import { resolveRequirementKey, REQUIREMENTS } from '@/lib/validators/requirements';
import type { QuestionDefinition } from '@/lib/validators/question-schema';

export interface RunLegalValidatorInput {
  product?: string | null;
  jurisdiction?: string | null;
  facts: Record<string, any>;
  analysis?: EvidenceAnalysisResult | null;
}

export interface RunLegalValidatorResult {
  validator_key: ValidatorKey | null;
  result: ValidatorResult | null;
  missing_questions?: QuestionDefinition[];
  recommendations?: Array<{ code: string; message: string }>;
  required_evidence_missing?: string[];
}

function getFactValue(facts: Record<string, any>, paths: string[]): any {
  for (const path of paths) {
    const value = path.split('.').reduce<any>((acc, key) => (acc ? acc[key] : undefined), facts);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function resolveNoticeRoute(facts: Record<string, any>): string | undefined {
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
  missingEvidence.forEach((item) => {
    recommendations.push({
      code: `EVIDENCE_MISSING_${item.toUpperCase()}`,
      message: `Upload required evidence: ${item.replace(/_/g, ' ')}`,
    });
  });

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
      price: 149.99,
      reason: applyPricingMessage(149.99, 'Upgrade to the Eviction Pack for court-ready documents'),
    };
  }
  if (product === 'money_claim') {
    return {
      product: 'money_claim_pack',
      price: 179.99,
      reason: applyPricingMessage(179.99, 'Upgrade to the Money Claim Pack for court-ready filing'),
    };
  }
  if (product === 'tenancy_agreement') {
    const tier = facts.meta?.product_tier || facts.__meta?.product_tier || facts.tenancy_tier;
    if (tier !== 'premium') {
      return {
        product: 'tenancy_premium',
        price: 14.99,
        reason: applyPricingMessage(14.99, 'Upgrade to the Premium Tenancy Agreement for enhanced clauses'),
      };
    }
    return {
      product: 'tenancy_standard',
      price: 9.99,
      reason: applyPricingMessage(9.99, 'Standard tenancy agreement remains available'),
    };
  }
  return undefined;
}

function buildSection21Answers(facts: Record<string, any>) {
  const depositProtected = getFactValue(facts, ['deposit_protected', 'tenancy.deposit_protected']);
  const prescribedInfo = getFactValue(facts, [
    'prescribed_info_given',
    'prescribed_info_provided',
    'prescribed_info_served',
    'tenancy.prescribed_info_given',
  ]);
  const gasCert = getFactValue(facts, [
    'gas_certificate_provided',
    'gas_safety_cert_provided',
    'property.gas_certificate_provided',
  ]);
  const epcProvided = getFactValue(facts, ['epc_provided', 'property.epc_provided']);
  const howToRent = getFactValue(facts, ['how_to_rent_provided', 'tenancy.how_to_rent_provided']);
  const licensingStatus = getFactValue(facts, ['property_licensing_status', 'property.licensing_status']);
  const propertyLicensed = licensingStatus === 'unlicensed'
    ? 'no'
    : licensingStatus
      ? 'yes'
      : getFactValue(facts, ['property_licensed']);

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

function buildSection8Answers(facts: Record<string, any>) {
  const rentFrequency = getFactValue(facts, ['rent_frequency', 'tenancy.rent_frequency']);
  const rentAmount = getFactValue(facts, ['rent_amount', 'tenancy.rent_amount']);
  const arrearsTotal = getFactValue(facts, [
    'arrears_amount',
    'arrears_total',
    'issues.rent_arrears.total_arrears',
  ]);
  const tenantNames = getFactValue(facts, ['tenant_names', 'tenant_full_name', 'tenants']);
  const jointTenants = Array.isArray(tenantNames) ? tenantNames.length > 1 : undefined;

  return {
    rent_frequency: toYesNo(rentFrequency),
    rent_amount: rentAmount,
    current_arrears: arrearsTotal,
    payment_history: toYesNo(getFactValue(facts, ['payment_history'])),
    joint_tenants: toYesNo(getFactValue(facts, ['joint_tenants']) ?? jointTenants),
    benefit_delays: toYesNo(getFactValue(facts, ['benefit_delays'])),
    disrepair_counterclaims: toYesNo(getFactValue(facts, ['disrepair_counterclaims'])),
    payment_since_notice: toYesNo(getFactValue(facts, ['payment_since_notice'])),
  };
}

function buildWalesAnswers(facts: Record<string, any>) {
  return {
    written_statement_provided: toYesNo(getFactValue(facts, ['written_statement_provided'])),
    fitness_for_habitation: toYesNo(getFactValue(facts, ['fitness_for_habitation'])),
    deposit_protected: toYesNo(getFactValue(facts, ['deposit_protected'])),
    occupation_type_confirmed: toYesNo(getFactValue(facts, ['occupation_type_confirmed'])),
    retaliatory_eviction: toYesNo(getFactValue(facts, ['retaliatory_eviction'])),
    council_involvement: toYesNo(getFactValue(facts, ['council_involvement'])),
  };
}

function buildScotlandAnswers(facts: Record<string, any>) {
  return {
    ground_evidence: toYesNo(getFactValue(facts, ['ground_evidence'])),
    tenancy_length_confirmed: toYesNo(getFactValue(facts, ['tenancy_length_confirmed'])),
    tribunal_served: toYesNo(getFactValue(facts, ['tribunal_served'])),
    covid_protections: toYesNo(getFactValue(facts, ['covid_protections'])),
    rent_pressure_zone: toYesNo(getFactValue(facts, ['rent_pressure_zone'])),
    disrepair: toYesNo(getFactValue(facts, ['disrepair'])),
    ground_mandatory: toYesNo(getFactValue(facts, ['ground_mandatory'])),
  };
}

function buildTenancyAgreementAnswers(facts: Record<string, any>) {
  return {
    jurisdiction: resolveJurisdiction(facts, null),
    intended_use: getFactValue(facts, ['intended_use', 'tenancy_type']),
    prohibited_fees_present: toYesNo(getFactValue(facts, ['prohibited_fees_present'])),
    missing_clauses: toYesNo(getFactValue(facts, ['missing_clauses'])),
    unfair_terms_present: toYesNo(getFactValue(facts, ['unfair_terms_present'])),
  };
}

function buildMoneyClaimAnswers(facts: Record<string, any>) {
  return {
    pre_action_steps: toYesNo(getFactValue(facts, ['pre_action_steps'])),
    joint_liability_confirmed: toYesNo(getFactValue(facts, ['joint_liability_confirmed'])),
    payments_since: toYesNo(getFactValue(facts, ['payments_since'])),
  };
}

export function runLegalValidator(input: RunLegalValidatorInput): RunLegalValidatorResult {
  const product = resolveProduct(input.facts, input.product);
  const jurisdiction = resolveJurisdiction(input.facts, input.jurisdiction);
  const extracted = input.analysis?.extracted_fields || {};
  const requirementKey = resolveRequirementKey({
    product,
    jurisdiction,
    facts: input.facts,
  });
  const requirement = requirementKey ? REQUIREMENTS[requirementKey] : null;

  if (!product) {
    return { validator_key: null, result: null };
  }

  if (product === 'tenancy_agreement') {
    const answers = buildTenancyAgreementAnswers(input.facts);
    const result = validateTenancyAgreement({
      jurisdiction: jurisdiction ?? undefined,
      extracted,
      answers,
    });
    const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
    if (result && !result.upsell) {
      result.upsell = buildUpsell(product, input.facts);
    }
    return {
      validator_key: 'tenancy_agreement',
      result,
      missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
      recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
      required_evidence_missing: missingEvidence,
    };
  }

  if (product === 'money_claim') {
    const answers = buildMoneyClaimAnswers(input.facts);
    const result = validateMoneyClaim({
      jurisdiction: jurisdiction ?? undefined,
      extracted,
      answers,
    });
    const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
    if (result && !result.upsell) {
      result.upsell = buildUpsell(product, input.facts);
    }
    return {
      validator_key: 'money_claim',
      result,
      missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
      recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
      required_evidence_missing: missingEvidence,
    };
  }

  if (product === 'notice_only' || product === 'complete_pack') {
    const route = resolveNoticeRoute(input.facts).toLowerCase();
    if ((jurisdiction || '').toLowerCase() === 'wales') {
      const answers = buildWalesAnswers(input.facts);
      const result = validateWalesNotice({
        jurisdiction: 'wales',
        extracted,
        answers,
      });
      const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, input.facts);
      }
      return {
        validator_key: 'wales_notice',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
        required_evidence_missing: missingEvidence,
      };
    }

    if ((jurisdiction || '').toLowerCase() === 'scotland') {
      const answers = buildScotlandAnswers(input.facts);
      const result = validateScotlandNoticeToLeave({
        jurisdiction: 'scotland',
        extracted,
        answers,
      });
      const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, input.facts);
      }
      return {
        validator_key: 'scotland_notice_to_leave',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
        required_evidence_missing: missingEvidence,
      };
    }

    if (route.includes('section_21') || route.includes('section 21')) {
      const answers = buildSection21Answers(input.facts);
      const result = validateSection21Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });
      const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, input.facts);
      }
      return {
        validator_key: 'section_21',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
        required_evidence_missing: missingEvidence,
      };
    }

    if (route.includes('section_8') || route.includes('section 8')) {
      const answers = buildSection8Answers(input.facts);
      const result = validateSection8Notice({
        jurisdiction: 'england',
        extracted,
        answers,
      });
      const missingEvidence = collectMissingEvidence(requirement?.requiredEvidence, input.facts);
      if (result && !result.upsell) {
        result.upsell = buildUpsell(product, input.facts);
      }
      return {
        validator_key: 'section_8',
        result,
        missing_questions: requirement ? collectMissingQuestions(requirement.requiredFacts, input.facts) : [],
        recommendations: buildRecommendations(result, missingEvidence, requirementKey, input.facts),
        required_evidence_missing: missingEvidence,
      };
    }
  }

  return { validator_key: null, result: null };
}
