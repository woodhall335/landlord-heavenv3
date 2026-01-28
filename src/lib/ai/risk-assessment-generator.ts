/**
 * Risk Assessment Generator
 *
 * Generates AI-powered risk assessment reports for landlord eviction cases.
 * Analyzes case strength, identifies red flags, and provides success probability.
 *
 * Key assessments:
 * - Success probability score (0-100%)
 * - Case strengths
 * - Red flags and critical issues
 * - Compliance issues
 * - Missing evidence
 * - Tactical recommendations
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import { getJsonAIClient, hasCustomJsonAIClient, type ChatMessage } from '@/lib/ai/openai-client';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';

// =============================================================================
// Types for Risk Assessment
// =============================================================================

export interface RiskAssessmentJSON {
  success_probability: number; // 0-100 percentage
  strengths: string[]; // Case strengths
  red_flags: string[]; // Critical issues that could block the case
  compliance_issues: string[]; // Compliance gaps
  missing_evidence: string[]; // Evidence that should be gathered
  recommendations: string[]; // Tactical recommendations
  timeline_estimate: string; // Estimated timeline
  cost_estimate: string; // Estimated costs
}

export interface RiskAssessmentContext {
  legalFramework: 'ew_shared_framework' | 'scotland' | 'northern-ireland';
  notice_type?: string;
  landlord_name: string;
  tenant_name: string;
  property_address: string;

  // Case details
  has_arrears: boolean;
  arrears_amount?: number;
  has_asb: boolean;
  has_breach: boolean;

  // Compliance
  deposit_protected?: boolean;
  has_gas_cert?: boolean;
  has_eicr?: boolean;
  has_epc?: boolean;
  how_to_rent_provided?: boolean;

  // Notice
  notice_served?: boolean;
  notice_date?: string;
  notice_valid?: boolean;

  // Evidence
  has_tenancy_agreement?: boolean;
  has_rent_records?: boolean;
  has_correspondence?: boolean;
}

// =============================================================================
// Main Generation Function
// =============================================================================

/**
 * Generates AI-powered risk assessment report
 *
 * @param caseFacts - Normalized case facts from wizard
 * @param context - Simplified context for risk analysis
 * @returns Promise<RiskAssessmentJSON> - Risk assessment report
 *
 * IMPORTANT: Never throws. Returns fallback assessment if AI fails.
 */
export async function generateRiskAssessment(
  caseFacts: CaseFacts,
  context: RiskAssessmentContext
): Promise<RiskAssessmentJSON> {
  // Start with fallback assessment
  const fallbackAssessment = generateFallbackRiskAssessment(caseFacts, context);

  // Check if AI is disabled
  if (process.env.DISABLE_RISK_ASSESSMENT_AI === 'true') {
    console.log('[RiskAssessmentAI] AI assessment disabled via env var');
    return fallbackAssessment;
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
    console.log('[RiskAssessmentAI] No OpenAI API key, using fallback');
    return fallbackAssessment;
  }

  try {
    // Build prompt
    const prompt = buildRiskAssessmentPrompt(caseFacts, context);

    // Call LLM
    const aiAssessment = await callRiskAssessmentLLM(prompt, context.legalFramework);

    // Merge AI with fallback
    return mergeWithFallback(aiAssessment, fallbackAssessment);

  } catch (error) {
    console.error('[RiskAssessmentAI] AI assessment failed, using fallback:', error);
    return fallbackAssessment;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds comprehensive prompt for AI risk assessment
 */
function buildRiskAssessmentPrompt(
  caseFacts: CaseFacts,
  context: RiskAssessmentContext
): string {
  const isEnglandWales = context.legalFramework === 'ew_shared_framework';
  const isScotland = context.legalFramework === 'scotland';

  return `
You are a senior UK housing solicitor assessing the strength of a landlord's eviction case.

CASE DETAILS:
- Landlord: ${context.landlord_name}
- Tenant: ${context.tenant_name}
- Property: ${context.property_address}
- Legal Framework: ${isScotland ? 'Scotland (First-tier Tribunal)' : 'England & Wales (County Court)'}
- Notice Type: ${context.notice_type || 'Not specified'}

GROUNDS:
- Rent Arrears: ${context.has_arrears ? `Yes - £${context.arrears_amount || 0}` : 'No'}
- Anti-social Behaviour: ${context.has_asb ? 'Yes' : 'No'}
- Tenancy Breach: ${context.has_breach ? 'Yes' : 'No'}

COMPLIANCE STATUS:
- Deposit Protected: ${context.deposit_protected ? 'Yes' : 'Unknown/No'}
- Gas Safety Certificate: ${context.has_gas_cert ? 'Yes' : 'Unknown/No'}
- Electrical Safety Certificate: ${context.has_eicr ? 'Yes' : 'Unknown/No'}
- EPC: ${context.has_epc ? 'Yes' : 'Unknown/No'}
${isEnglandWales ? `- How to Rent Guide: ${context.how_to_rent_provided ? 'Yes' : 'Unknown/No'}` : ''}

NOTICE STATUS:
- Notice Served: ${context.notice_served ? 'Yes' : 'No'}
- Notice Date: ${context.notice_date || 'Not provided'}
- Notice Valid: ${context.notice_valid ? 'Yes' : 'Unknown'}

EVIDENCE AVAILABLE:
- Tenancy Agreement: ${context.has_tenancy_agreement ? 'Yes' : 'Unknown'}
- Rent Records: ${context.has_rent_records ? 'Yes' : 'Unknown'}
- Correspondence with Tenant: ${context.has_correspondence ? 'Yes' : 'Unknown'}

FULL CASE CONTEXT:
${JSON.stringify(caseFacts, null, 2)}

Analyze this case and provide:
1. Success probability (0-100%)
2. Case strengths (what's working in landlord's favor)
3. Red flags (critical issues that could block or seriously weaken the case)
4. Compliance issues (gaps that need addressing)
5. Missing evidence (documents the landlord should gather)
6. Tactical recommendations (what the landlord should do)
7. Timeline estimate (realistic timeframes)
8. Cost estimate (expected costs)

Be REALISTIC and HONEST. Many landlords underestimate the challenges of eviction.
${isScotland ? 'Remember: ALL Scottish grounds are discretionary - the tribunal has full discretion.' : ''}
`;
}

/**
 * Calls LLM to generate risk assessment
 */
async function callRiskAssessmentLLM(
  prompt: string,
  legalFramework: string
): Promise<Partial<RiskAssessmentJSON>> {
  const systemPrompt = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

You are currently acting in CASE RISK ASSESSMENT mode.

Your job:
- Analyze landlord eviction cases for ${legalFramework === 'scotland' ? 'Scottish First-tier Tribunal' : 'England & Wales County Court'}
- Provide realistic success probability scores
- Identify strengths, weaknesses, and risks
- Give practical, actionable recommendations

CRITICAL RULES:
- Be REALISTIC - many evictions fail due to procedural errors
- Flag ALL compliance issues - these are common blocking points
- Consider tenant defenses and court discretion
- ${legalFramework === 'scotland' ? 'Remember ALL Scottish grounds are discretionary' : 'Distinguish mandatory vs discretionary grounds'}
- DO NOT overstate success chances
- DO NOT understate risks

STRICT JSON OUTPUT REQUIREMENTS:
- Respond with ONLY a single JSON object
- No markdown, no backticks, no commentary
- Valid JSON with proper escaping

Required JSON structure:
{
  "success_probability": number (0-100),
  "strengths": ["string"],
  "red_flags": ["string"],
  "compliance_issues": ["string"],
  "missing_evidence": ["string"],
  "recommendations": ["string"],
  "timeline_estimate": "string",
  "cost_estimate": "string"
}
`.trim();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  // Define JSON schema
  const schema = {
    type: 'object',
    properties: {
      success_probability: { type: 'number' },
      strengths: {
        type: 'array',
        items: { type: 'string' },
      },
      red_flags: {
        type: 'array',
        items: { type: 'string' },
      },
      compliance_issues: {
        type: 'array',
        items: { type: 'string' },
      },
      missing_evidence: {
        type: 'array',
        items: { type: 'string' },
      },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
      },
      timeline_estimate: { type: 'string' },
      cost_estimate: { type: 'string' },
    },
    required: [
      'success_probability',
      'strengths',
      'red_flags',
      'compliance_issues',
      'missing_evidence',
      'recommendations',
      'timeline_estimate',
      'cost_estimate',
    ],
  };

  // Call LLM
  const result = await getJsonAIClient().jsonCompletion<Partial<RiskAssessmentJSON>>(
    messages,
    schema,
    {
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1500,
    }
  );

  console.log(`[RiskAssessmentAI] LLM call successful. Cost: $${result.cost_usd.toFixed(4)}, Tokens: ${result.usage.total_tokens}`);

  return result.json || {};
}

/**
 * Merges AI assessment with fallback
 */
function mergeWithFallback(
  ai: Partial<RiskAssessmentJSON>,
  fallback: RiskAssessmentJSON
): RiskAssessmentJSON {
  return {
    success_probability: ai.success_probability ?? fallback.success_probability,
    strengths: ai.strengths || fallback.strengths,
    red_flags: ai.red_flags || fallback.red_flags,
    compliance_issues: ai.compliance_issues || fallback.compliance_issues,
    missing_evidence: ai.missing_evidence || fallback.missing_evidence,
    recommendations: ai.recommendations || fallback.recommendations,
    timeline_estimate: ai.timeline_estimate || fallback.timeline_estimate,
    cost_estimate: ai.cost_estimate || fallback.cost_estimate,
  };
}

/**
 * Generates fallback risk assessment
 */
function generateFallbackRiskAssessment(
  caseFacts: CaseFacts,
  context: RiskAssessmentContext
): RiskAssessmentJSON {
  const strengths: string[] = [];
  const red_flags: string[] = [];
  const compliance_issues: string[] = [];
  const missing_evidence: string[] = [];
  const recommendations: string[] = [];

  let successScore = 60; // Start with baseline

  // Analyze grounds
  if (context.has_arrears && context.arrears_amount) {
    const rentAmount = caseFacts.tenancy?.rent_amount || 0;
    if (context.arrears_amount >= rentAmount * 2) {
      strengths.push('Significant rent arrears - may qualify for mandatory Ground 8');
      successScore += 15;
    } else {
      strengths.push('Some rent arrears - discretionary grounds available');
      successScore += 5;
    }
  }

  if (context.has_asb) {
    strengths.push('Anti-social behaviour documented - Ground 14 available');
    successScore += 5;
  }

  if (context.has_breach) {
    strengths.push('Tenancy breach documented - Ground 12 available');
    successScore += 5;
  }

  // Analyze compliance
  if (!context.deposit_protected) {
    red_flags.push('Deposit protection status unknown or not protected - blocks Section 21');
    compliance_issues.push('Verify deposit is protected in approved scheme');
    successScore -= 20;
  } else {
    strengths.push('Deposit properly protected');
  }

  if (!context.has_gas_cert) {
    compliance_issues.push('Gas safety certificate not confirmed - required annually');
    successScore -= 10;
  }

  if (!context.has_eicr) {
    compliance_issues.push('Electrical safety certificate not confirmed - required every 5 years');
    successScore -= 5;
  }

  if (!context.how_to_rent_provided && context.legalFramework === 'ew_shared_framework') {
    compliance_issues.push('How to Rent guide not confirmed as provided - blocks Section 21');
    successScore -= 15;
  }

  // Analyze evidence
  if (!context.has_tenancy_agreement) {
    missing_evidence.push('Signed tenancy agreement');
    successScore -= 5;
  }

  if (!context.has_rent_records && context.has_arrears) {
    missing_evidence.push('Detailed rent payment records or bank statements');
    successScore -= 10;
  }

  if (!context.has_correspondence) {
    missing_evidence.push('Correspondence with tenant regarding issues');
    successScore -= 5;
  }

  // Analyze notice
  if (!context.notice_served) {
    red_flags.push('Notice not yet served - cannot proceed to court');
    recommendations.push('Serve valid notice before any court action');
    successScore -= 30;
  } else if (!context.notice_valid) {
    red_flags.push('Notice validity in question - may need to re-serve');
    successScore -= 20;
  }

  // Cap score
  successScore = Math.max(10, Math.min(95, successScore));

  // Generate recommendations
  if (red_flags.length > 0) {
    recommendations.push('Address all red flags before proceeding with eviction');
  }
  if (compliance_issues.length > 0) {
    recommendations.push('Fix compliance issues to strengthen your case and enable Section 21');
  }
  if (missing_evidence.length > 0) {
    recommendations.push('Gather all missing evidence before filing court claim');
  }
  recommendations.push('Consider mediation or negotiated exit to save time and costs');
  recommendations.push('Seek legal advice if case is complex or you are unsure');

  // Timeline and cost
  const timeline_estimate = context.legalFramework === 'scotland'
    ? 'Scotland: 3-6 months typical (Notice to Leave + Tribunal process)'
    : 'England & Wales: 4-7 months typical (Notice + Court + Bailiff)';

  const cost_estimate = 'Court fees: £325-£485, Bailiff: £121-£130, Solicitor (if used): £1,500-£3,000+';

  return {
    success_probability: successScore,
    strengths: strengths.length > 0 ? strengths : ['Case details provided - basis for eviction established'],
    red_flags,
    compliance_issues,
    missing_evidence,
    recommendations,
    timeline_estimate,
    cost_estimate,
  };
}

// =============================================================================
// Helper function to extract context from CaseFacts
// =============================================================================

/**
 * Extracts risk assessment context from CaseFacts
 */
export function extractRiskAssessmentContext(caseFacts: CaseFacts): RiskAssessmentContext {
  const cf = caseFacts as any;
  const tenancy = cf?.tenancy || {};
  const property = cf?.property || {};
  const eviction = cf?.eviction || {};
  const parties = cf?.parties || {};
  const compliance = cf?.compliance || {};

  const rawJurisdiction =
    cf?.jurisdiction ??
    eviction?.jurisdiction ??
    property?.jurisdiction ??
    'england';

  const legalFramework =
    rawJurisdiction === 'scotland'
      ? 'scotland'
      : rawJurisdiction === 'northern-ireland'
      ? 'northern-ireland'
      : 'ew_shared_framework';

  // Landlord and tenant names
  const landlord = parties?.landlord || cf?.landlord || {};
  const tenant = parties?.tenants?.[0] || parties?.tenant || cf?.tenant || {};

  const landlordName =
    [landlord.first_name, landlord.last_name, landlord.name].filter(Boolean).join(' ').trim() ||
    'Landlord';

  const tenantName =
    [tenant.first_name, tenant.last_name, tenant.name].filter(Boolean).join(' ').trim() ||
    'Tenant';

  // Property address
  const propertyAddress =
    property?.full_address ||
    [property?.address_line1, property?.city, property?.postcode].filter(Boolean).join(', ') ||
    'the property';

  // Arrears
  const arrearsAmount =
    typeof eviction?.rent_arrears_amount === 'number'
      ? eviction.rent_arrears_amount
      : typeof cf?.issues?.rent_arrears?.total_arrears === 'number'
      ? cf.issues.rent_arrears.total_arrears
      : undefined;

  return {
    legalFramework,
    notice_type: eviction?.notice_type,
    landlord_name: landlordName,
    tenant_name: tenantName,
    property_address: propertyAddress,

    // Case details
    has_arrears: (arrearsAmount ?? 0) > 0,
    arrears_amount: arrearsAmount,
    has_asb: Boolean(eviction?.asb_incidents?.length),
    has_breach: Boolean(eviction?.breach_details),

    // Compliance
    deposit_protected: tenancy.deposit_protected,
    has_gas_cert: Boolean(property.gas_cert_date || compliance?.gas_safety_valid),
    has_eicr: Boolean(property.electrical_cert_date || compliance?.eicr_valid),
    has_epc: Boolean(property.epc_rating),
    how_to_rent_provided: tenancy.how_to_rent_provided,

    // Notice
    notice_served: Boolean(eviction?.notice_served_date),
    notice_date: eviction?.notice_served_date,
    notice_valid: eviction?.notice_valid,

    // Evidence
    has_tenancy_agreement: Boolean(cf?.evidence?.tenancy_agreement),
    has_rent_records: Boolean(cf?.evidence?.rent_statements || cf?.issues?.rent_arrears?.arrears_items?.length),
    has_correspondence: Boolean(cf?.evidence?.correspondence),
  };
}
