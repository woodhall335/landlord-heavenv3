/**
 * Compliance Audit Generator
 *
 * Generates AI-powered compliance audit reports for landlord eviction cases.
 * Checks critical compliance requirements that can block or weaken eviction claims.
 *
 * Key compliance areas checked:
 * - Deposit protection (TDP/DPS/MyDeposits within 30 days)
 * - Gas Safety Certificate (annual requirement)
 * - Electrical Safety Certificate (5-year requirement)
 * - Energy Performance Certificate (EPC rating E or above)
 * - How to Rent guide (England only)
 * - HMO licensing (if applicable)
 * - Retaliatory eviction risk (notices served within 6 months of complaint)
 * - Section 21 validity blockers
 * - Section 8 grounds strength
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import { getJsonAIClient, hasCustomJsonAIClient, type ChatMessage } from '@/lib/ai/openai-client';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';

// =============================================================================
// Types for Compliance Audit
// =============================================================================

export interface ComplianceAuditJSON {
  // Core compliance checks
  deposit_protection: string; // Status of deposit protection compliance
  gas_safety: string; // Gas safety certificate status
  electrical_safety: string; // Electrical safety certificate status
  epc: string; // Energy Performance Certificate compliance
  how_to_rent: string; // How to Rent guide provision (England only)
  licensing: string; // HMO/selective licensing status

  // Risk assessments
  retaliatory_eviction: string; // Risk of retaliation claim
  disrepair_risk: string; // Outstanding disrepair issues that could block eviction

  // Notice validity
  s21_valid: boolean; // Is Section 21 notice valid?
  s21_blocking_issues: string[]; // Issues that invalidate Section 21
  s8_grounds: string[]; // Available Section 8 grounds
  s8_recommendations: string[]; // Recommended Section 8 grounds

  // Overall assessment
  overall_status: 'ready' | 'needs_work' | 'blocked'; // Overall eviction readiness
  critical_actions: string[]; // Must-fix items before proceeding
  recommended_actions: string[]; // Should-fix items to strengthen case
}

export interface ComplianceAuditContext {
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  notice_type?: string; // 'Section 21', 'Section 8', 'Notice to Leave', etc.

  // Deposit
  has_deposit: boolean;
  deposit_amount?: number;
  deposit_protected?: boolean;
  deposit_protection_date?: string;
  deposit_scheme?: string;
  tenancy_start_date?: string;

  // Safety certificates
  has_gas_appliances: boolean;
  gas_cert_date?: string;
  gas_cert_expiry?: string;
  has_electrical_cert?: boolean;
  electrical_cert_date?: string;

  // EPC
  epc_rating?: string;
  epc_exempt?: boolean;

  // Other compliance
  how_to_rent_provided?: boolean;
  is_hmo?: boolean;
  hmo_licensed?: boolean;

  // Risks
  tenant_complained_recently?: boolean;
  complaint_date?: string;
  notice_served_date?: string;
  disrepair_issues?: string[];

  // Grounds
  arrears_amount?: number;
  has_asb?: boolean;
  has_breach?: boolean;
}

// =============================================================================
// Main Generation Function
// =============================================================================

/**
 * Generates AI-powered compliance audit report
 *
 * @param caseFacts - Normalized case facts from wizard
 * @param context - Simplified context for compliance checking
 * @returns Promise<ComplianceAuditJSON> - Compliance audit report
 *
 * IMPORTANT: Never throws. Returns fallback audit if AI fails.
 */
export async function generateComplianceAudit(
  caseFacts: CaseFacts,
  context: ComplianceAuditContext
): Promise<ComplianceAuditJSON> {
  // Start with fallback audit
  const fallbackAudit = generateFallbackComplianceAudit(caseFacts, context);

  // Check if AI is disabled
  if (process.env.DISABLE_COMPLIANCE_AUDIT_AI === 'true') {
    console.log('[ComplianceAuditAI] AI audit disabled via env var');
    return fallbackAudit;
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
    console.log('[ComplianceAuditAI] No OpenAI API key, using fallback');
    return fallbackAudit;
  }

  try {
    // Build prompt
    const prompt = buildComplianceAuditPrompt(caseFacts, context);

    // Call LLM
    const aiAudit = await callComplianceAuditLLM(prompt, context.jurisdiction);

    // Merge AI with fallback
    return mergeWithFallback(aiAudit, fallbackAudit);

  } catch (error) {
    console.error('[ComplianceAuditAI] AI audit failed, using fallback:', error);
    return fallbackAudit;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds comprehensive prompt for AI compliance auditing
 */
function buildComplianceAuditPrompt(
  caseFacts: CaseFacts,
  context: ComplianceAuditContext
): string {
  const isEnglandWales = context.jurisdiction === 'england-wales';
  const isScotland = context.jurisdiction === 'scotland';

  return `
You are a legal compliance auditor specializing in UK residential tenancy law.

Audit this landlord's compliance for eviction proceedings:

JURISDICTION: ${context.jurisdiction}
NOTICE TYPE: ${context.notice_type || 'Not specified'}

DEPOSIT COMPLIANCE:
- Has deposit: ${context.has_deposit ? 'Yes' : 'No'}
- Amount: £${context.deposit_amount || 0}
- Protected: ${context.deposit_protected ? 'Yes' : 'No'}
- Protection date: ${context.deposit_protection_date || 'Not provided'}
- Scheme: ${context.deposit_scheme || 'Not provided'}
- Tenancy start: ${context.tenancy_start_date || 'Not provided'}
${isEnglandWales ? '(Must protect within 30 days, serve prescribed information)' : ''}

GAS SAFETY:
- Has gas appliances: ${context.has_gas_appliances ? 'Yes' : 'No'}
- Certificate date: ${context.gas_cert_date || 'Not provided'}
- Certificate expiry: ${context.gas_cert_expiry || 'Not provided'}
(Annual requirement)

ELECTRICAL SAFETY:
- Has certificate: ${context.has_electrical_cert ? 'Yes' : 'No'}
- Certificate date: ${context.electrical_cert_date || 'Not provided'}
${isEnglandWales ? '(5-year requirement since June 2020)' : ''}

EPC COMPLIANCE:
- EPC rating: ${context.epc_rating || 'Not provided'}
- Exempt: ${context.epc_exempt ? 'Yes' : 'No'}
${isEnglandWales ? '(Minimum rating E required since April 2020)' : ''}

${isEnglandWales ? `
HOW TO RENT GUIDE:
- Provided to tenant: ${context.how_to_rent_provided ? 'Yes' : 'No'}
(Required for Section 21 since October 2015)
` : ''}

HMO LICENSING:
- Is HMO: ${context.is_hmo ? 'Yes' : 'No'}
- Licensed: ${context.hmo_licensed ? 'Yes' : 'No'}

RETALIATORY EVICTION RISK:
- Tenant complained recently: ${context.tenant_complained_recently ? 'Yes' : 'No'}
- Complaint date: ${context.complaint_date || 'N/A'}
- Notice served date: ${context.notice_served_date || 'N/A'}
${isEnglandWales ? '(Section 21 invalid if served within 6 months of complaint)' : ''}

DISREPAIR:
- Issues: ${context.disrepair_issues?.join(', ') || 'None reported'}

GROUNDS AVAILABLE:
- Rent arrears: £${context.arrears_amount || 0}
- ASB: ${context.has_asb ? 'Yes' : 'No'}
- Breach: ${context.has_breach ? 'Yes' : 'No'}

Generate a comprehensive compliance audit report with the following assessments:
1. Deposit Protection Status - compliant or issues
2. Gas Safety Status
3. Electrical Safety Status
4. EPC Compliance
${isEnglandWales ? '5. How to Rent Guide Provision' : ''}
6. Licensing Status
7. Retaliatory Eviction Risk
8. Disrepair Risk
9. Section 21 Validity ${isEnglandWales ? '(if applicable)' : 'N/A'}
10. Section 8 Grounds Available ${isEnglandWales ? '(if applicable)' : 'N/A'}
11. Overall Status (ready/needs_work/blocked)
12. Critical Actions Required
13. Recommended Actions

Be STRICT and identify ALL compliance failures. Better to over-flag than miss issues.
`;
}

/**
 * Calls LLM to generate compliance audit
 */
async function callComplianceAuditLLM(
  prompt: string,
  jurisdiction: string
): Promise<Partial<ComplianceAuditJSON>> {
  const isEnglandWales = jurisdiction === 'england-wales';

  const systemPrompt = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

You are currently acting in COMPLIANCE AUDIT mode.

Your job:
- Audit landlord compliance with ${jurisdiction === 'scotland' ? 'Scottish' : 'England & Wales'} tenancy law
- Identify compliance failures that could block or weaken eviction
- Provide clear, actionable recommendations
- Be STRICT - flag all potential issues

CRITICAL RULES:
- NEVER give legal advice or opinions
- ONLY assess compliance based on provided information
- Flag issues even if landlord might have excuse
- Be specific about which law/regulation is breached
- Distinguish between "blocking" issues (must fix) and "weakening" issues (should fix)

STRICT JSON OUTPUT REQUIREMENTS:
- Respond with ONLY a single JSON object
- No markdown, no backticks, no commentary
- Valid JSON with proper escaping

Required JSON structure:
{
  "deposit_protection": "string",
  "gas_safety": "string",
  "electrical_safety": "string",
  "epc": "string",
  "how_to_rent": "string",
  "licensing": "string",
  "retaliatory_eviction": "string",
  "disrepair_risk": "string",
  "s21_valid": boolean,
  "s21_blocking_issues": ["string"],
  "s8_grounds": ["string"],
  "s8_recommendations": ["string"],
  "overall_status": "ready|needs_work|blocked",
  "critical_actions": ["string"],
  "recommended_actions": ["string"]
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
      deposit_protection: { type: 'string' },
      gas_safety: { type: 'string' },
      electrical_safety: { type: 'string' },
      epc: { type: 'string' },
      how_to_rent: { type: 'string' },
      licensing: { type: 'string' },
      retaliatory_eviction: { type: 'string' },
      disrepair_risk: { type: 'string' },
      s21_valid: { type: 'boolean' },
      s21_blocking_issues: {
        type: 'array',
        items: { type: 'string' },
      },
      s8_grounds: {
        type: 'array',
        items: { type: 'string' },
      },
      s8_recommendations: {
        type: 'array',
        items: { type: 'string' },
      },
      overall_status: {
        type: 'string',
        enum: ['ready', 'needs_work', 'blocked'],
      },
      critical_actions: {
        type: 'array',
        items: { type: 'string' },
      },
      recommended_actions: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'deposit_protection',
      'gas_safety',
      'electrical_safety',
      'epc',
      'how_to_rent',
      'licensing',
      'retaliatory_eviction',
      'disrepair_risk',
      's21_valid',
      's21_blocking_issues',
      's8_grounds',
      's8_recommendations',
      'overall_status',
      'critical_actions',
      'recommended_actions',
    ],
  };

  // Call LLM
  const result = await getJsonAIClient().jsonCompletion<Partial<ComplianceAuditJSON>>(
    messages,
    schema,
    {
      model: 'gpt-4o-mini',
      temperature: 0.1, // Very low for accurate, consistent auditing
      max_tokens: 1500,
    }
  );

  console.log(`[ComplianceAuditAI] LLM call successful. Cost: $${result.cost_usd.toFixed(4)}, Tokens: ${result.usage.total_tokens}`);

  return result.json || {};
}

/**
 * Merges AI audit with fallback
 */
function mergeWithFallback(
  ai: Partial<ComplianceAuditJSON>,
  fallback: ComplianceAuditJSON
): ComplianceAuditJSON {
  return {
    deposit_protection: ai.deposit_protection || fallback.deposit_protection,
    gas_safety: ai.gas_safety || fallback.gas_safety,
    electrical_safety: ai.electrical_safety || fallback.electrical_safety,
    epc: ai.epc || fallback.epc,
    how_to_rent: ai.how_to_rent || fallback.how_to_rent,
    licensing: ai.licensing || fallback.licensing,
    retaliatory_eviction: ai.retaliatory_eviction || fallback.retaliatory_eviction,
    disrepair_risk: ai.disrepair_risk || fallback.disrepair_risk,
    s21_valid: ai.s21_valid !== undefined ? ai.s21_valid : fallback.s21_valid,
    s21_blocking_issues: ai.s21_blocking_issues || fallback.s21_blocking_issues,
    s8_grounds: ai.s8_grounds || fallback.s8_grounds,
    s8_recommendations: ai.s8_recommendations || fallback.s8_recommendations,
    overall_status: ai.overall_status || fallback.overall_status,
    critical_actions: ai.critical_actions || fallback.critical_actions,
    recommended_actions: ai.recommended_actions || fallback.recommended_actions,
  };
}

/**
 * Generates fallback compliance audit
 */
function generateFallbackComplianceAudit(
  caseFacts: CaseFacts,
  context: ComplianceAuditContext
): ComplianceAuditJSON {
  const isEnglandWales = context.jurisdiction === 'england-wales';
  const critical_actions: string[] = [];
  const recommended_actions: string[] = [];
  const s21_blocking_issues: string[] = [];
  let s21_valid = true;

  // Deposit Protection
  let deposit_protection = '';
  if (context.has_deposit) {
    if (!context.deposit_protected) {
      deposit_protection = '❌ CRITICAL: Deposit not protected. This blocks Section 21 and may result in 1-3x deposit penalty.';
      s21_blocking_issues.push('Deposit not protected');
      critical_actions.push('Protect deposit in approved scheme immediately');
      s21_valid = false;
    } else if (context.deposit_protection_date && context.tenancy_start_date) {
      const daysSinceStart = Math.floor(
        (new Date(context.deposit_protection_date).getTime() - new Date(context.tenancy_start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceStart > 30) {
        deposit_protection = `⚠️  WARNING: Deposit protected ${daysSinceStart} days after tenancy start (should be within 30 days). This may block Section 21.`;
        s21_blocking_issues.push('Deposit protected late');
        s21_valid = false;
      } else {
        deposit_protection = `✅ Deposit protected within 30 days (${context.deposit_scheme || 'approved scheme'}).`;
      }
    } else {
      deposit_protection = `✅ Deposit reported as protected in ${context.deposit_scheme || 'approved scheme'}.`;
    }
  } else {
    deposit_protection = '✅ No deposit taken, no protection requirement.';
  }

  // Gas Safety
  let gas_safety = '';
  if (context.has_gas_appliances) {
    if (!context.gas_cert_date) {
      gas_safety = '❌ CRITICAL: No gas safety certificate on record. This blocks Section 21.';
      s21_blocking_issues.push('No gas safety certificate');
      critical_actions.push('Obtain valid gas safety certificate');
      s21_valid = false;
    } else if (context.gas_cert_expiry) {
      const expiry = new Date(context.gas_cert_expiry);
      const now = new Date();
      if (expiry < now) {
        gas_safety = `❌ CRITICAL: Gas safety certificate expired on ${context.gas_cert_expiry}. This blocks Section 21.`;
        s21_blocking_issues.push('Expired gas safety certificate');
        critical_actions.push('Renew gas safety certificate immediately');
        s21_valid = false;
      } else {
        gas_safety = `✅ Valid gas safety certificate (expires ${context.gas_cert_expiry}).`;
      }
    } else {
      gas_safety = `⚠️  Gas safety certificate provided but expiry date not confirmed. Verify certificate is current.`;
      recommended_actions.push('Verify gas safety certificate is current');
    }
  } else {
    gas_safety = '✅ No gas appliances, no certificate required.';
  }

  // Electrical Safety
  let electrical_safety = '';
  if (isEnglandWales) {
    if (!context.has_electrical_cert) {
      electrical_safety =
        '⚠️  WARNING: No electrical safety certificate. Required since June 2020 (5-year validity). This may block Section 21.';
      s21_blocking_issues.push('No electrical safety certificate');
      critical_actions.push('Obtain electrical installation condition report (EICR)');
      s21_valid = false;
    } else {
      electrical_safety = `✅ Electrical safety certificate on record (${context.electrical_cert_date || 'date not provided'}).`;
    }
  } else {
    electrical_safety = '✅ Electrical safety certificate not required in Scotland.';
  }

  // EPC
  let epc = '';
  if (context.epc_rating) {
    const rating = context.epc_rating.toUpperCase();
    if (rating === 'F' || rating === 'G') {
      epc = `❌ CRITICAL: EPC rating ${rating} below minimum (E). Illegal to let since April 2020. Blocks Section 21.`;
      s21_blocking_issues.push(`EPC rating ${rating} below minimum`);
      critical_actions.push('Improve property to EPC rating E or obtain exemption');
      s21_valid = false;
    } else {
      epc = `✅ EPC rating ${rating} meets minimum requirement (E or above).`;
    }
  } else if (context.epc_exempt) {
    epc = '✅ EPC exemption registered.';
  } else {
    epc = '⚠️  EPC rating not confirmed. Verify property meets minimum rating E.';
    recommended_actions.push('Confirm EPC rating is E or above');
  }

  // How to Rent
  let how_to_rent = '';
  if (isEnglandWales) {
    if (!context.how_to_rent_provided) {
      how_to_rent =
        '⚠️  WARNING: How to Rent guide not confirmed as provided. Required for Section 21 since October 2015.';
      s21_blocking_issues.push('How to Rent guide not provided');
      critical_actions.push('Provide current version of How to Rent guide to tenant');
      s21_valid = false;
    } else {
      how_to_rent = '✅ How to Rent guide provided to tenant.';
    }
  } else {
    how_to_rent = 'N/A - Not required in Scotland.';
  }

  // Licensing
  let licensing = '';
  if (context.is_hmo) {
    if (!context.hmo_licensed) {
      licensing = '❌ CRITICAL: Unlicensed HMO. Blocks Section 21, may result in prosecution and rent repayment order.';
      s21_blocking_issues.push('Unlicensed HMO');
      critical_actions.push('Apply for HMO license immediately or cease HMO use');
      s21_valid = false;
    } else {
      licensing = '✅ HMO licensed.';
    }
  } else {
    licensing = '✅ Not an HMO, no licensing requirement.';
  }

  // Retaliatory Eviction
  let retaliatory_eviction = '';
  if (isEnglandWales && context.tenant_complained_recently && context.complaint_date && context.notice_served_date) {
    const complaintDate = new Date(context.complaint_date);
    const noticeDate = new Date(context.notice_served_date);
    const daysBetween = Math.floor((noticeDate.getTime() - complaintDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysBetween < 180) {
      retaliatory_eviction = `❌ CRITICAL: Section 21 served ${daysBetween} days after tenant complaint (within 6 months). This is retaliatory eviction and invalid.`;
      s21_blocking_issues.push('Retaliatory eviction - notice within 6 months of complaint');
      critical_actions.push('Wait until 6 months after complaint OR use Section 8 instead');
      s21_valid = false;
    } else {
      retaliatory_eviction = `✅ Notice served ${daysBetween} days after complaint (outside 6-month window).`;
    }
  } else {
    retaliatory_eviction = '✅ No recent tenant complaints or retaliatory eviction risk identified.';
  }

  // Disrepair Risk
  let disrepair_risk = '';
  if (context.disrepair_issues && context.disrepair_issues.length > 0) {
    disrepair_risk = `⚠️  WARNING: Outstanding disrepair issues: ${context.disrepair_issues.join(', ')}. Tenant may counterclaim or delay possession.`;
    recommended_actions.push('Resolve disrepair issues before proceeding with eviction');
  } else {
    disrepair_risk = '✅ No disrepair issues reported.';
  }

  // Section 8 Grounds
  const s8_grounds: string[] = [];
  if (context.arrears_amount && context.arrears_amount > 0) {
    if (context.arrears_amount >= (context.jurisdiction === 'england-wales' ? 2 : 3) * (caseFacts.tenancy.rent_amount || 0)) {
      s8_grounds.push('Ground 8 - Serious rent arrears (mandatory)');
    }
    s8_grounds.push('Ground 10 - Some rent arrears (discretionary)');
    s8_grounds.push('Ground 11 - Persistent delay in rent (discretionary)');
  }
  if (context.has_asb) {
    s8_grounds.push('Ground 14 - Nuisance or annoyance (discretionary)');
  }
  if (context.has_breach) {
    s8_grounds.push('Ground 12 - Breach of tenancy (discretionary)');
  }

  // Section 8 Recommendations
  const s8_recommendations: string[] = [];
  if (!s21_valid) {
    s8_recommendations.push('Section 21 is blocked. Use Section 8 instead.');
  }
  if (s8_grounds.includes('Ground 8 - Serious rent arrears (mandatory)')) {
    s8_recommendations.push('Ground 8 is available (mandatory ground) - strong case');
  }
  if (context.has_asb && context.has_breach) {
    s8_recommendations.push('Multiple grounds available (Ground 12, 14) - strengthen case with both');
  }

  // Overall Status
  let overall_status: 'ready' | 'needs_work' | 'blocked';
  if (critical_actions.length > 0) {
    overall_status = s21_valid ? 'needs_work' : 'blocked';
  } else if (recommended_actions.length > 0) {
    overall_status = 'needs_work';
  } else {
    overall_status = 'ready';
  }

  return {
    deposit_protection,
    gas_safety,
    electrical_safety,
    epc,
    how_to_rent,
    licensing,
    retaliatory_eviction,
    disrepair_risk,
    s21_valid,
    s21_blocking_issues,
    s8_grounds,
    s8_recommendations,
    overall_status,
    critical_actions,
    recommended_actions,
  };
}

// =============================================================================
// Helper function to extract context from CaseFacts
// =============================================================================

/**
 * Extracts compliance audit context from CaseFacts
 */
export function extractComplianceAuditContext(caseFacts: CaseFacts): ComplianceAuditContext {
  const tenancy = (caseFacts as any)?.tenancy || {};
  const property = (caseFacts as any)?.property || {};
  const eviction = (caseFacts as any)?.eviction || {};
  const jurisdiction =
    caseFacts.jurisdiction === 'scotland'
      ? 'scotland'
      : caseFacts.jurisdiction === 'northern-ireland'
      ? 'northern-ireland'
      : 'england-wales';

  return {
    jurisdiction,
    notice_type: eviction?.notice_type,

    // Deposit
    has_deposit: Boolean(tenancy.deposit_amount && tenancy.deposit_amount > 0),
    deposit_amount: tenancy.deposit_amount,
    deposit_protected: tenancy.deposit_protected,
    deposit_protection_date: tenancy.deposit_protection_date,
    deposit_scheme: tenancy.deposit_scheme,
    tenancy_start_date: tenancy.start_date,

    // Safety certificates
    has_gas_appliances: Boolean(property.has_gas_appliances),
    gas_cert_date: property.gas_cert_date,
    gas_cert_expiry: property.gas_cert_expiry,
    has_electrical_cert: Boolean(property.electrical_cert_date),
    electrical_cert_date: property.electrical_cert_date,

    // EPC
    epc_rating: property.epc_rating,
    epc_exempt: property.epc_exempt,

    // Other compliance
    how_to_rent_provided: tenancy.how_to_rent_provided,
    is_hmo: property.is_hmo,
    hmo_licensed: property.hmo_licensed,

    // Risks
    tenant_complained_recently: Boolean(eviction?.tenant_complained),
    complaint_date: eviction?.complaint_date,
    notice_served_date: eviction?.notice_served_date,
    disrepair_issues: eviction?.disrepair_issues,

    // Grounds
    arrears_amount: eviction?.rent_arrears_amount,
    has_asb: Boolean(eviction?.asb_incidents?.length),
    has_breach: Boolean(eviction?.breach_details),
  };
}
