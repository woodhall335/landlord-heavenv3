/**
 * Witness Statement Generator
 *
 * Generates AI-drafted witness statements for landlord eviction cases.
 * Supports England & Wales (Section 8/21) and Scotland (Notice to Leave) cases.
 *
 * A witness statement is a formal written account of evidence that will be
 * submitted to court. It must include:
 * - Statement of truth declaration
 * - Chronological account of events
 * - References to supporting evidence
 * - Professional, factual tone
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import { getJsonAIClient, hasCustomJsonAIClient, type ChatMessage } from '@/lib/ai/openai-client';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';

// =============================================================================
// Types for Witness Statement
// =============================================================================

export interface WitnessStatementJSON {
  introduction: string; // Who you are, your role as landlord
  tenancy_history: string; // When tenancy started, rent terms, key dates
  rent_arrears?: string; // If claiming rent arrears - amounts, dates, attempts to recover
  conduct_issues?: string; // If claiming ASB, breach of tenancy - specific incidents with dates
  grounds_summary: string; // Summary of grounds being relied upon
  timeline: string; // Chronological timeline of key events
  evidence_references: string; // Reference to exhibits/documents supporting the statement
  conclusion: string; // Final statement affirming truthfulness
}

export interface WitnessStatementContext {
  landlord_name: string;
  tenant_name: string;
  property_address: string;
  tenancy_start_date?: string;
  rent_amount?: number;
  rent_frequency?: string;
  grounds: string[]; // e.g., ["Ground 8", "Ground 10"] or ["non-payment", "asb"]
  arrears_total?: number;
  has_arrears: boolean;
  has_conduct_issues: boolean;
  jurisdiction: 'england-wales' | 'scotland';
}

// =============================================================================
// Main Generation Function
// =============================================================================

/**
 * Generates an AI-drafted witness statement for an eviction case
 *
 * @param caseFacts - Normalized case facts from wizard
 * @param context - Simplified context extracted from case facts
 * @returns Promise<WitnessStatementJSON> - AI-generated witness statement content
 *
 * IMPORTANT: This function NEVER throws. Returns fallback content if AI fails.
 */
export async function generateWitnessStatement(
  caseFacts: CaseFacts,
  context: WitnessStatementContext
): Promise<WitnessStatementJSON> {
  // Start with fallback content
  const fallbackStatement = generateFallbackWitnessStatement(caseFacts, context);

  // Check if AI is disabled
  if (process.env.DISABLE_WITNESS_STATEMENT_AI === 'true') {
    console.log('[WitnessStatementAI] AI drafting disabled via env var');
    return fallbackStatement;
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
    console.log('[WitnessStatementAI] No OpenAI API key, using fallback');
    return fallbackStatement;
  }

  try {
    // Build prompt
    const prompt = buildWitnessStatementPrompt(caseFacts, context);

    // Call LLM
    const aiStatement = await callWitnessStatementLLM(prompt, context.jurisdiction);

    // Merge AI with fallback (AI takes precedence)
    return mergeWithFallback(aiStatement, fallbackStatement);

  } catch (error) {
    console.error('[WitnessStatementAI] AI drafting failed, using fallback:', error);
    return fallbackStatement;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds comprehensive prompt for AI witness statement drafting
 */
function buildWitnessStatementPrompt(
  caseFacts: CaseFacts,
  context: WitnessStatementContext
): string {
  const isScotland = context.jurisdiction === 'scotland';

  return `
You are drafting a witness statement for a landlord seeking possession of a residential property.

LANDLORD: ${context.landlord_name}
TENANT: ${context.tenant_name}
PROPERTY: ${context.property_address}
JURISDICTION: ${isScotland ? 'Scotland (First-tier Tribunal)' : 'England & Wales (County Court)'}

TENANCY DETAILS:
- Start Date: ${context.tenancy_start_date || 'Not provided'}
- Rent: ${context.rent_amount ? `£${context.rent_amount} ${context.rent_frequency}` : 'Not provided'}

GROUNDS FOR POSSESSION: ${context.grounds.join(', ')}

${context.has_arrears ? `RENT ARREARS: £${context.arrears_total || 0}` : ''}

${context.has_conduct_issues ? `CONDUCT ISSUES: Yes (anti-social behavior, breach of tenancy, damage, etc.)` : ''}

CASE CONTEXT:
${JSON.stringify(caseFacts, null, 2)}

Generate a professional witness statement with the following sections:
1. Introduction - Identify yourself and your role
2. Tenancy History - When it started, rent terms, key dates
${context.has_arrears ? '3. Rent Arrears - Amounts owed, attempts to recover, dates' : ''}
${context.has_conduct_issues ? '4. Conduct Issues - Specific incidents with dates and details' : ''}
5. Grounds Summary - Summary of legal grounds being relied upon
6. Timeline - Chronological timeline of key events
7. Evidence References - Reference to supporting documents/exhibits
8. Conclusion - Statement affirming truthfulness

CRITICAL REQUIREMENTS:
- Use first person ("I am the landlord...", "I let the property...")
- Be factual and specific with dates, amounts, and incidents
- Reference evidence (e.g., "see Exhibit 1 - Tenancy Agreement")
- Professional, non-emotional tone
- Include statement of truth language at the end
- Do NOT invent facts not provided in the case context
- Cite relevant law where appropriate ${isScotland ? '(Housing (Scotland) Act 2006)' : '(Housing Act 1988)'}
`;
}

/**
 * Calls LLM to generate witness statement content
 */
async function callWitnessStatementLLM(
  prompt: string,
  jurisdiction: 'england-wales' | 'scotland'
): Promise<Partial<WitnessStatementJSON>> {
  const isScotland = jurisdiction === 'scotland';

  const systemPrompt = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

You are currently acting in WITNESS STATEMENT DRAFTING mode.

Your job:
- Draft professional witness statements for ${isScotland ? 'Scottish First-tier Tribunal' : 'England & Wales County Court'} possession cases
- Use first-person narrative from the landlord's perspective
- Be factual, specific, and chronological
- Reference supporting evidence
- Follow proper witness statement format

CRITICAL RULES:
- NEVER invent facts, dates, or incidents not provided
- NEVER give legal advice or opinions
- ONLY use information explicitly provided by the user
- Use professional, courtroom-appropriate language
- Include statement of truth declaration
- Be specific with dates, amounts, and descriptions

STRICT JSON OUTPUT REQUIREMENTS:
- Respond with ONLY a single JSON object
- No markdown, no backticks, no commentary
- Valid JSON with proper escaping

Required JSON structure:
{
  "introduction": "string",
  "tenancy_history": "string",
  "rent_arrears": "string (optional)",
  "conduct_issues": "string (optional)",
  "grounds_summary": "string",
  "timeline": "string",
  "evidence_references": "string",
  "conclusion": "string"
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
      introduction: { type: 'string' },
      tenancy_history: { type: 'string' },
      rent_arrears: { type: 'string' },
      conduct_issues: { type: 'string' },
      grounds_summary: { type: 'string' },
      timeline: { type: 'string' },
      evidence_references: { type: 'string' },
      conclusion: { type: 'string' },
    },
    required: ['introduction', 'tenancy_history', 'grounds_summary', 'timeline', 'evidence_references', 'conclusion'],
  };

  // Call LLM
  const result = await getJsonAIClient().jsonCompletion<Partial<WitnessStatementJSON>>(
    messages,
    schema,
    {
      model: 'gpt-4o-mini',
      temperature: 0.2, // Very low for factual, consistent statements
      max_tokens: 2000,
    }
  );

  console.log(`[WitnessStatementAI] LLM call successful. Cost: $${result.cost_usd.toFixed(4)}, Tokens: ${result.usage.total_tokens}`);

  return result.json || {};
}

/**
 * Merges AI content with fallback content
 */
function mergeWithFallback(
  ai: Partial<WitnessStatementJSON>,
  fallback: WitnessStatementJSON
): WitnessStatementJSON {
  return {
    introduction: ai.introduction || fallback.introduction,
    tenancy_history: ai.tenancy_history || fallback.tenancy_history,
    rent_arrears: ai.rent_arrears || fallback.rent_arrears,
    conduct_issues: ai.conduct_issues || fallback.conduct_issues,
    grounds_summary: ai.grounds_summary || fallback.grounds_summary,
    timeline: ai.timeline || fallback.timeline,
    evidence_references: ai.evidence_references || fallback.evidence_references,
    conclusion: ai.conclusion || fallback.conclusion,
  };
}

/**
 * Generates fallback witness statement content when AI is unavailable
 */
function generateFallbackWitnessStatement(
  caseFacts: CaseFacts,
  context: WitnessStatementContext
): WitnessStatementJSON {
  const isScotland = context.jurisdiction === 'scotland';

  // Introduction
  const introduction = `I, ${context.landlord_name}, am the landlord of the property at ${context.property_address}. I make this statement in support of my application for possession of the property. The contents of this statement are true to the best of my knowledge and belief.`;

  // Tenancy History
  const tenancy_history = `The tenancy commenced on ${context.tenancy_start_date || '[date]'} when I let the property to ${context.tenant_name}. The rent was agreed at ${context.rent_amount ? `£${context.rent_amount} ${context.rent_frequency}` : '[rent amount and frequency]'}, payable ${context.rent_frequency === 'monthly' ? 'monthly in advance' : 'in advance'}.`;

  // Rent Arrears (if applicable)
  let rent_arrears = undefined;
  if (context.has_arrears) {
    rent_arrears = `The tenant has failed to pay rent as required under the tenancy agreement. As at the date of this statement, the total arrears amount to £${context.arrears_total || 0}. I have made numerous attempts to recover the arrears, including sending letters and speaking with the tenant, but the arrears remain unpaid. A full schedule of arrears is attached as Exhibit 2.`;
  }

  // Conduct Issues (if applicable)
  let conduct_issues = undefined;
  if (context.has_conduct_issues) {
    conduct_issues = `The tenant has breached the terms of the tenancy agreement through [describe conduct issues - e.g., anti-social behavior, damage to property, use for unlawful purposes]. Full details of these breaches are set out in the attached documentation.`;
  }

  // Grounds Summary
  const grounds_summary = isScotland
    ? `I am seeking possession on the following grounds under the Housing (Scotland) Act 2006: ${context.grounds.join(', ')}. The tenant has been served with a valid Notice to Leave and the required notice period has expired.`
    : `I am seeking possession under ${context.grounds.join(' and ')} of Schedule 2 to the Housing Act 1988. The tenant has been served with a valid ${context.grounds.some(g => g.includes('Section 21')) ? 'Section 21 notice' : 'Section 8 notice'} and the required notice period has expired.`;

  // Timeline
  const timeline = `
- ${context.tenancy_start_date || '[Date]'}: Tenancy commenced
${context.has_arrears ? `- [Date]: First missed rent payment
- [Date]: Letter sent to tenant regarding arrears
- [Date]: Further attempts to contact tenant` : ''}
${context.has_conduct_issues ? `- [Date]: First incident of [issue]
- [Date]: Written warning sent to tenant
- [Date]: Further incidents occurred` : ''}
- [Date]: Notice served on tenant
- [Date]: Notice period expired
- [Date]: Claim form issued
  `.trim();

  // Evidence References
  const evidence_references = `
I refer to the following exhibits in support of this statement:
- Exhibit 1: Tenancy Agreement dated ${context.tenancy_start_date || '[date]'}
${context.has_arrears ? `- Exhibit 2: Schedule of rent arrears
- Exhibit 3: Correspondence with tenant regarding arrears` : ''}
${context.has_conduct_issues ? `- Exhibit 4: Evidence of conduct issues (photos, witness accounts, etc.)
- Exhibit 5: Correspondence with tenant regarding breaches` : ''}
- Exhibit ${context.has_arrears || context.has_conduct_issues ? '6' : '2'}: Copy of ${isScotland ? 'Notice to Leave' : 'Section 8/21 Notice'}
- Exhibit ${context.has_arrears || context.has_conduct_issues ? '7' : '3'}: Proof of service
  `.trim();

  // Conclusion
  const conclusion = `I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth without an honest belief in its truth.`;

  return {
    introduction,
    tenancy_history,
    rent_arrears,
    conduct_issues,
    grounds_summary,
    timeline,
    evidence_references,
    conclusion,
  };
}

// =============================================================================
// Helper function to extract context from CaseFacts
// =============================================================================

/**
 * Extracts witness statement context from CaseFacts
 */
export function extractWitnessStatementContext(caseFacts: CaseFacts): WitnessStatementContext {
  const jurisdiction = caseFacts.jurisdiction === 'scotland' ? 'scotland' : 'england-wales';

  // Determine if has arrears
  const has_arrears = (caseFacts.eviction?.rent_arrears_amount || 0) > 0;

  // Determine if has conduct issues
  const has_conduct_issues = Boolean(
    caseFacts.eviction?.asb_incidents?.length ||
    caseFacts.eviction?.breach_details ||
    caseFacts.eviction?.damage_description
  );

  // Extract grounds
  const grounds: string[] = [];
  if (caseFacts.eviction?.notice_type) {
    grounds.push(caseFacts.eviction.notice_type);
  }
  if (caseFacts.eviction?.grounds_england_wales) {
    grounds.push(...caseFacts.eviction.grounds_england_wales);
  }

  return {
    landlord_name: `${caseFacts.landlord.first_name} ${caseFacts.landlord.last_name}`,
    tenant_name: `${caseFacts.tenant.first_name} ${caseFacts.tenant.last_name}`,
    property_address: caseFacts.property.full_address || caseFacts.property.postcode || 'the property',
    tenancy_start_date: caseFacts.tenancy.start_date,
    rent_amount: caseFacts.tenancy.rent_amount,
    rent_frequency: caseFacts.tenancy.rent_frequency,
    grounds: grounds.length > 0 ? grounds : ['Not specified'],
    arrears_total: caseFacts.eviction?.rent_arrears_amount,
    has_arrears,
    has_conduct_issues,
    jurisdiction,
  };
}
