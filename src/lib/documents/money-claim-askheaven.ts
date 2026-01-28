/**
 * AskHeaven Integration for Money Claim Pack Generation
 *
 * This module uses AI (AskHeaven) to generate premium narrative content for:
 * - Letter Before Action (LBA)
 * - Particulars of Claim (PoC)
 * - Evidence Index descriptions
 * - Post-issue guidance and risk reports
 *
 * The AI-generated content enriches the templates, making the pack "premium"
 * rather than just simple form-filling.
 */

import type { CaseFacts } from '@/lib/case-facts/schema';
import type { MoneyClaimCase } from './money-claim-pack-generator';
import type { ScotlandMoneyClaimCase } from './scotland-money-claim-pack-generator';
import { getJsonAIClient, hasCustomJsonAIClient, type ChatMessage } from '@/lib/ai/openai-client';
import { ASK_HEAVEN_BASE_SYSTEM_PROMPT } from '@/lib/ai/ask-heaven';

// =============================================================================
// Types for AI-Generated Content
// =============================================================================

export interface LBADraft {
  intro: string; // Opening paragraph establishing relationship and context
  tenancy_history: string; // Brief tenancy history and rent terms
  arrears_summary: string; // Clear statement of arrears with dates and amounts
  breach_description?: string; // Description of breaches (if applicable)
  amount_due: string; // Total amount due with breakdown
  response_deadline: string; // Clear deadline for payment or response
  payment_instructions: string; // How to make payment
  consequences: string; // What happens if no payment/response
  annexes?: string[]; // List of documents enclosed
}

export interface ParticularsOfClaimDraft {
  tenancy_background: string; // Establish the tenancy agreement and terms
  legal_basis: string; // Legal basis for the claim (contract, tort, etc.)
  rent_obligation: string; // Defendant's obligation to pay rent
  arrears_calculation: string; // Detailed calculation of arrears
  damage_items?: string; // Description of damages claimed (if applicable)
  other_charges?: string; // Other charges (if applicable)
  interest_claim: string; // Interest claimed under Section 69 or statutory basis
  pre_action_summary: string; // Summary of PAP/pre-action steps taken
  remedy_sought: string; // What relief the claimant seeks
}

export interface EvidenceIndexEntry {
  tab: string; // e.g., "Tab 1", "Tab A"
  title: string; // e.g., "Tenancy Agreement"
  description: string; // AI-generated description of what this evidence shows
}

export interface PostIssueDraft {
  what_happens_next: string; // What to expect after issuing the claim
  if_defended: string; // What happens if defendant defends
  if_admitted: string; // What happens if defendant admits
  if_no_response: string; // What happens if no response (default judgment)
  timeline: string; // Typical timeline for money claim
}

export interface RiskReportDraft {
  strengths: string[]; // Strong points of the case
  weaknesses: string[]; // Potential weaknesses or risks
  missing_evidence: string[]; // Evidence that would strengthen the case
  recommendations: string[]; // Tactical recommendations
}

/**
 * Complete AI-drafted content for money claim pack
 */
export interface MoneyClaimDrafts {
  lba: LBADraft;
  particulars_of_claim: ParticularsOfClaimDraft;
  evidence_index: EvidenceIndexEntry[];
  post_issue?: PostIssueDraft;
  risk_report?: RiskReportDraft;
}

// =============================================================================
// AI Drafting Function
// =============================================================================

/**
 * Generates AI-drafted content for money claim documents
 *
 * @param caseFacts - Normalized case facts from wizard
 * @param moneyClaimCase - Mapped money claim case ready for pack generation
 * @param options - Optional parameters for draft customization
 * @returns Promise<MoneyClaimDrafts> - Complete AI-generated content
 *
 * IMPORTANT: This function NEVER throws. It returns usable content even if AI fails.
 */
export async function generateMoneyClaimAskHeavenDrafts(
  caseFacts: CaseFacts,
  moneyClaimCase: MoneyClaimCase | ScotlandMoneyClaimCase,
  options?: {
    includePostIssue?: boolean;
    includeRiskReport?: boolean;
    jurisdiction?: 'england' | 'wales' | 'scotland';
  }
): Promise<MoneyClaimDrafts> {
  const rawJurisdiction = options?.jurisdiction || ('jurisdiction' in moneyClaimCase ? moneyClaimCase.jurisdiction : 'england');

  // Map to internal legal framework identifier (NOT a jurisdiction)
  // England and Wales share the same legal framework for money claims
  const legalFramework: 'ew_shared_framework' | 'scotland' = rawJurisdiction === 'scotland' ? 'scotland' : 'ew_shared_framework';

  // Start with fallback content as a baseline (ensures we never return incomplete data)
  const fallbackDrafts = generateFallbackDrafts(caseFacts, moneyClaimCase, legalFramework, options);

  // Check if AI is disabled via env var (allows safe rollout)
  if (process.env.DISABLE_MONEY_CLAIM_AI === 'true') {
    console.log('[MoneyClaimAI] AI drafting disabled via DISABLE_MONEY_CLAIM_AI env var');
    return fallbackDrafts;
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY && !hasCustomJsonAIClient()) {
    console.log('[MoneyClaimAI] No OpenAI API key available, using fallback content');
    return fallbackDrafts;
  }

  try {
    // Build comprehensive prompt for the AI
    const prompt = buildMoneyClaimDraftingPrompt(caseFacts, moneyClaimCase, legalFramework);

    // Call the LLM to generate AI drafts
    const aiDrafts = await callMoneyClaimLLM(prompt, legalFramework, options);

    // Merge AI content with fallback (AI takes precedence, fallback fills gaps)
    return mergeAIDraftsWithFallback(aiDrafts, fallbackDrafts);

  } catch (error) {
    console.error('[MoneyClaimAI] AI drafting failed, using fallback:', error);
    // Always return usable content, never crash the pack generator
    return fallbackDrafts;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds a comprehensive prompt for AI drafting
 * @param legalFramework - Internal framework identifier (NOT a jurisdiction): 'ew_shared_framework' | 'scotland'
 */
function buildMoneyClaimDraftingPrompt(
  caseFacts: CaseFacts,
  moneyClaimCase: MoneyClaimCase | ScotlandMoneyClaimCase,
  legalFramework: 'ew_shared_framework' | 'scotland'
): string {
  const isScotland = legalFramework === 'scotland';

  return `
You are a legal drafting assistant specializing in ${isScotland ? 'Scottish Simple Procedure' : 'England & Wales County Court'} money claims for residential rent arrears and related claims.

Generate professional, legally sound narrative content for the following money claim:

CLAIMANT: ${moneyClaimCase.landlord_full_name}
DEFENDANT: ${moneyClaimCase.tenant_full_name}
PROPERTY: ${moneyClaimCase.property_address}
CLAIM AMOUNT: \u00A3${moneyClaimCase.arrears_total || 0}

TENANCY DETAILS:
- Start Date: ${moneyClaimCase.tenancy_start_date || 'Not provided'}
- End Date: ${moneyClaimCase.tenancy_end_date || 'Ongoing'}
- Rent: \u00A3${moneyClaimCase.rent_amount} ${moneyClaimCase.rent_frequency}

ARREARS: \u00A3${moneyClaimCase.arrears_total || 0}
${moneyClaimCase.arrears_schedule ? `Schedule: ${JSON.stringify(moneyClaimCase.arrears_schedule, null, 2)}` : ''}

DAMAGE CLAIMS: ${moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0 ? JSON.stringify(moneyClaimCase.damage_items, null, 2) : 'None'}

INTEREST: ${moneyClaimCase.claim_interest === true ? `${moneyClaimCase.interest_rate || 8}% from ${moneyClaimCase.interest_start_date || 'date of issue'}` : 'Not claimed'}

PRE-ACTION: ${caseFacts.money_claim.lba_date ? `Letter before action sent on ${caseFacts.money_claim.lba_date}` : 'No formal pre-action letter sent'}

ADDITIONAL CONTEXT:
${moneyClaimCase.other_charges_notes || ''}
${moneyClaimCase.other_costs_notes || ''}
${moneyClaimCase.other_amounts_summary || ''}

Generate the following sections in JSON format:
1. Letter Before Action (intro, tenancy_history, arrears_summary, amount_due, response_deadline, payment_instructions, consequences)
2. Particulars of Claim (tenancy_background, legal_basis, rent_obligation, arrears_calculation, interest_claim, pre_action_summary, remedy_sought)
3. Evidence Index (array of {tab, title, description} for typical evidence)

Tone: Professional, factual, firm but not aggressive. Cite relevant law where appropriate ${isScotland ? '(e.g., Housing (Scotland) Act 1988)' : '(e.g., Housing Act 1981 s.69)'}.
`;
}

/**
 * Calls the LLM to generate AI-drafted money claim content
 * Returns structured JSON matching MoneyClaimDrafts interface
 * @param legalFramework - Internal framework identifier (NOT a jurisdiction): 'ew_shared_framework' | 'scotland'
 */
async function callMoneyClaimLLM(
  prompt: string,
  legalFramework: 'ew_shared_framework' | 'scotland',
  options?: { includePostIssue?: boolean; includeRiskReport?: boolean }
): Promise<Partial<MoneyClaimDrafts>> {
  const isScotland = legalFramework === 'scotland';

  // Build system prompt for legal drafting
  const systemPrompt = `
${ASK_HEAVEN_BASE_SYSTEM_PROMPT}

You are currently acting in MONEY CLAIM LEGAL DOCUMENT DRAFTING mode.

Your job in this mode:
- Draft professional, legally sound narrative content for ${isScotland ? 'Scottish Simple Procedure' : 'England & Wales County Court'} money claims.
- Generate Letter Before Action sections with clear, factual language.
- Draft Particulars of Claim following proper legal structure and terminology.
- Create Evidence Index entries with helpful descriptions.

CRITICAL RULES FOR THIS MODE:
- NEVER invent facts, dates, or amounts not provided in the user prompt.
- NEVER give personalised legal advice or strategy.
- NEVER guarantee outcomes or make promises about court decisions.
- ONLY use facts explicitly provided by the user.
- ONLY cite well-established legal principles and statutory references.
- Structure content for court/tribunal submission.
- Use neutral, professional language suitable for legal documents.

Legal Framework: ${legalFramework}
${isScotland ? 'Court: Sheriff Court (Simple Procedure)' : 'Court: County Court'}

STRICT JSON OUTPUT REQUIREMENTS:
- You MUST respond with ONLY a single JSON object.
- Do NOT include any markdown, prose, explanations, or commentary.
- Do NOT wrap the JSON in backticks or code blocks.
- The JSON must be valid (double quotes, no trailing commas, proper escaping).
- All string values must be properly escaped.

Required JSON structure:
{
  "lba": {
    "intro": "string",
    "tenancy_history": "string",
    "arrears_summary": "string",
    "amount_due": "string",
    "response_deadline": "string",
    "payment_instructions": "string",
    "consequences": "string"
  },
  "particulars_of_claim": {
    "tenancy_background": "string",
    "legal_basis": "string",
    "rent_obligation": "string",
    "arrears_calculation": "string",
    "interest_claim": "string",
    "pre_action_summary": "string",
    "remedy_sought": "string"
  },
  "evidence_index": [
    {"tab": "string", "title": "string", "description": "string"}
  ]${options?.includePostIssue ? `,
  "post_issue": {
    "what_happens_next": "string",
    "if_defended": "string",
    "if_admitted": "string",
    "if_no_response": "string",
    "timeline": "string"
  }` : ''}${options?.includeRiskReport ? `,
  "risk_report": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "missing_evidence": ["string"],
    "recommendations": ["string"]
  }` : ''}
}
`.trim();

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  // Define JSON schema for validation
  const schema = {
    type: 'object',
    properties: {
      lba: {
        type: 'object',
        properties: {
          intro: { type: 'string' },
          tenancy_history: { type: 'string' },
          arrears_summary: { type: 'string' },
          amount_due: { type: 'string' },
          response_deadline: { type: 'string' },
          payment_instructions: { type: 'string' },
          consequences: { type: 'string' },
        },
        required: ['intro', 'tenancy_history', 'arrears_summary', 'amount_due', 'response_deadline', 'payment_instructions', 'consequences'],
      },
      particulars_of_claim: {
        type: 'object',
        properties: {
          tenancy_background: { type: 'string' },
          legal_basis: { type: 'string' },
          rent_obligation: { type: 'string' },
          arrears_calculation: { type: 'string' },
          interest_claim: { type: 'string' },
          pre_action_summary: { type: 'string' },
          remedy_sought: { type: 'string' },
        },
        required: ['tenancy_background', 'legal_basis', 'rent_obligation', 'arrears_calculation', 'interest_claim', 'pre_action_summary', 'remedy_sought'],
      },
      evidence_index: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tab: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['tab', 'title', 'description'],
        },
      },
    },
    required: ['lba', 'particulars_of_claim', 'evidence_index'],
  };

  // Call the LLM with JSON mode
  const result = await getJsonAIClient().jsonCompletion<Partial<MoneyClaimDrafts>>(
    messages,
    schema,
    {
      model: 'gpt-4o-mini', // Fast and cost-effective for this task
      temperature: 0.3, // Low temperature for factual, consistent legal drafting
      max_tokens: 2500, // Enough for comprehensive drafts
    }
  );

  console.log(`[MoneyClaimAI] LLM call successful. Cost: $${result.cost_usd.toFixed(4)}, Tokens: ${result.usage.total_tokens}`);

  // Extract and return the JSON
  return result.json || {};
}

/**
 * Merges AI-generated content with fallback content
 * AI content takes precedence, fallback fills any gaps
 */
function mergeAIDraftsWithFallback(
  aiDrafts: Partial<MoneyClaimDrafts>,
  fallbackDrafts: MoneyClaimDrafts
): MoneyClaimDrafts {
  return {
    lba: {
      intro: aiDrafts.lba?.intro || fallbackDrafts.lba.intro,
      tenancy_history: aiDrafts.lba?.tenancy_history || fallbackDrafts.lba.tenancy_history,
      arrears_summary: aiDrafts.lba?.arrears_summary || fallbackDrafts.lba.arrears_summary,
      amount_due: aiDrafts.lba?.amount_due || fallbackDrafts.lba.amount_due,
      response_deadline: aiDrafts.lba?.response_deadline || fallbackDrafts.lba.response_deadline,
      payment_instructions: aiDrafts.lba?.payment_instructions || fallbackDrafts.lba.payment_instructions,
      consequences: aiDrafts.lba?.consequences || fallbackDrafts.lba.consequences,
      breach_description: aiDrafts.lba?.breach_description || fallbackDrafts.lba.breach_description,
      annexes: aiDrafts.lba?.annexes || fallbackDrafts.lba.annexes,
    },
    particulars_of_claim: {
      tenancy_background: aiDrafts.particulars_of_claim?.tenancy_background || fallbackDrafts.particulars_of_claim.tenancy_background,
      legal_basis: aiDrafts.particulars_of_claim?.legal_basis || fallbackDrafts.particulars_of_claim.legal_basis,
      rent_obligation: aiDrafts.particulars_of_claim?.rent_obligation || fallbackDrafts.particulars_of_claim.rent_obligation,
      arrears_calculation: aiDrafts.particulars_of_claim?.arrears_calculation || fallbackDrafts.particulars_of_claim.arrears_calculation,
      damage_items: aiDrafts.particulars_of_claim?.damage_items || fallbackDrafts.particulars_of_claim.damage_items,
      other_charges: aiDrafts.particulars_of_claim?.other_charges || fallbackDrafts.particulars_of_claim.other_charges,
      interest_claim: aiDrafts.particulars_of_claim?.interest_claim || fallbackDrafts.particulars_of_claim.interest_claim,
      pre_action_summary: aiDrafts.particulars_of_claim?.pre_action_summary || fallbackDrafts.particulars_of_claim.pre_action_summary,
      remedy_sought: aiDrafts.particulars_of_claim?.remedy_sought || fallbackDrafts.particulars_of_claim.remedy_sought,
    },
    evidence_index: aiDrafts.evidence_index && aiDrafts.evidence_index.length > 0
      ? aiDrafts.evidence_index
      : fallbackDrafts.evidence_index,
    post_issue: aiDrafts.post_issue || fallbackDrafts.post_issue,
    risk_report: aiDrafts.risk_report || fallbackDrafts.risk_report,
  };
}

/**
 * Generates fallback content when AI is unavailable
 * This ensures pack generation never fails
 * @param legalFramework - Internal framework identifier (NOT a jurisdiction): 'ew_shared_framework' | 'scotland'
 */
function generateFallbackDrafts(
  caseFacts: CaseFacts,
  moneyClaimCase: MoneyClaimCase | ScotlandMoneyClaimCase,
  legalFramework: 'ew_shared_framework' | 'scotland',
  options?: { includePostIssue?: boolean; includeRiskReport?: boolean }
): MoneyClaimDrafts {
  const isScotland = legalFramework === 'scotland';
  const tenant = moneyClaimCase.tenant_full_name;
  const property = moneyClaimCase.property_address;
  const arrears = moneyClaimCase.arrears_total || 0;
  const rent = `\u00A3${moneyClaimCase.rent_amount} ${moneyClaimCase.rent_frequency}`;

  // LBA Draft
  const lba: LBADraft = {
    intro: `I am writing to you concerning the tenancy agreement for ${property}. You have been a tenant at this property since ${moneyClaimCase.tenancy_start_date || 'the start of the tenancy'}, with rent payable at ${rent}.`,

    tenancy_history: `The tenancy commenced on ${moneyClaimCase.tenancy_start_date || '[date]'} with rent set at ${rent}. ${moneyClaimCase.tenancy_end_date ? `The tenancy ended on ${moneyClaimCase.tenancy_end_date}.` : 'The tenancy is ongoing.'}`,

    arrears_summary: `You have failed to pay rent as required under the tenancy agreement. As of today's date, you owe a total of \u00A3${arrears} in rent arrears. ${moneyClaimCase.arrears_schedule && moneyClaimCase.arrears_schedule.length > 0 ? 'A detailed breakdown of the arrears is attached.' : ''}`,

    amount_due: `The total amount due is \u00A3${arrears} comprising:\n- Rent arrears: \u00A3${arrears}\n${moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0 ? `- Damages: \u00A3${moneyClaimCase.damage_items.reduce((sum, item) => sum + (item.amount || 0), 0)}` : ''}\nPlus interest and costs as appropriate.`,

    response_deadline: `You must pay the full amount or contact me to discuss payment within 14 days of the date of this letter (by ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}).`,

    payment_instructions: `Payment should be made to [insert bank details or payment method]. Please use reference "${tenant} rent arrears" to ensure prompt allocation.`,

    consequences: `If I do not receive payment or a satisfactory response by the deadline above, I will issue ${isScotland ? 'a Simple Procedure claim' : 'County Court proceedings'} against you without further notice. This will result in additional costs being added to the debt, and may affect your credit rating. A ${isScotland ? 'decree' : 'County Court Judgment (CCJ)'} against you may make it difficult for you to obtain credit in the future.`,
  };

  // Particulars of Claim Draft
  const particulars: ParticularsOfClaimDraft = {
    tenancy_background: `The Claimant is the landlord and the Defendant is (or was) the tenant of the residential property at ${property} ("the Property"). The tenancy commenced on ${moneyClaimCase.tenancy_start_date || '[date]'} pursuant to ${isScotland ? 'a Private Residential Tenancy agreement' : 'an Assured Shorthold Tenancy agreement'}.`,

    legal_basis: `This is a claim for rent arrears arising from a breach of the tenancy agreement, which constitutes a breach of contract. ${isScotland ? 'The claim is brought under the Sheriff Courts (Scotland) Act 1971 and the Simple Procedure Rules.' : 'The claim is brought under the jurisdiction of the County Court in accordance with the County Courts Act 1984.'}`,

    rent_obligation: `Under the terms of the tenancy agreement, the Defendant covenanted to pay rent of ${rent}, payable ${moneyClaimCase.payment_day ? `on or before the ${moneyClaimCase.payment_day}${getOrdinalSuffix(moneyClaimCase.payment_day)} day of each ${moneyClaimCase.rent_frequency === 'monthly' ? 'month' : 'payment period'}` : 'in accordance with the tenancy agreement'}.`,

    arrears_calculation: (() => {
      let calc = 'The Defendant has failed to pay rent as required. ';
      if (moneyClaimCase.arrears_schedule && moneyClaimCase.arrears_schedule.length > 0) {
        calc += 'A full schedule of arrears showing the rent due, rent paid, and arrears accruing for each period is attached to this claim.';
      } else {
        calc += `As at today's date, the Defendant owes \u00A3${arrears} in rent arrears.`;
      }
      if (moneyClaimCase.other_charges_notes) {
        calc += ' ' + moneyClaimCase.other_charges_notes;
      }
      return calc;
    })(),

    interest_claim: (() => {
      // Interest: only include if user explicitly opted in via claim_interest === true
      if (moneyClaimCase.claim_interest !== true) {
        return 'The Claimant does not claim interest.';
      }
      if (isScotland) {
        const rate = moneyClaimCase.interest_rate || 8;
        return `The Claimant claims interest on the sum due at the rate of ${rate}% per annum from the date of accrual of the debt.`;
      } else {
        const rate = moneyClaimCase.interest_rate || 8;
        const startDate = moneyClaimCase.interest_start_date || 'the date of issue';
        return `The Claimant claims interest on the sum due pursuant to section 69 of the County Courts Act 1984 at the rate of ${rate}% per annum from ${startDate} to the date of judgment and thereafter at the judgment rate until payment.`;
      }
    })(),

    pre_action_summary: (() => {
      if (!caseFacts.money_claim.lba_date) {
        return 'The Claimant has attempted to resolve this matter amicably but the Defendant has not paid the arrears.';
      }
      const methods = (caseFacts.money_claim.lba_method || []).join(' and ');
      let summary = `The Claimant sent a letter before action on ${caseFacts.money_claim.lba_date} by ${methods}, giving the Defendant 14 days to pay or respond. `;
      if (caseFacts.money_claim.tenant_responded) {
        if (caseFacts.money_claim.tenant_response_details) {
          summary += `The Defendant responded: ${caseFacts.money_claim.tenant_response_details}`;
        } else {
          summary += 'The Defendant responded but did not make payment or propose a satisfactory resolution.';
        }
      } else {
        summary += 'The Defendant did not respond or make payment.';
      }
      return summary;
    })(),

    remedy_sought: (() => {
      let itemNum = 1;
      let remedy = `The Claimant seeks:\n${itemNum++}. Payment of the sum of \u00A3${arrears} being rent arrears.\n`;
      if (moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0) {
        remedy += `${itemNum++}. Payment of damages as particularised.\n`;
      }
      // Interest: only include if user explicitly opted in
      if (moneyClaimCase.claim_interest === true) {
        const rate = moneyClaimCase.interest_rate || 8;
        remedy += isScotland
          ? `${itemNum++}. Interest at ${rate}% per annum.\n`
          : `${itemNum++}. Interest pursuant to section 69 of the County Courts Act 1984 at ${rate}% per annum.\n`;
      }
      remedy += isScotland ? `${itemNum++}. Costs.` : `${itemNum++}. Costs and court fees.`;
      return remedy;
    })(),
  };

  // Evidence Index
  const evidenceIndex: EvidenceIndexEntry[] = [
    {
      tab: 'Tab 1',
      title: 'Tenancy Agreement',
      description: `The signed ${isScotland ? 'Private Residential Tenancy agreement' : 'Assured Shorthold Tenancy agreement'} dated ${moneyClaimCase.tenancy_start_date || '[date]'}, showing the Defendant's contractual obligation to pay rent of ${rent}. This establishes the legal basis for the claim.`,
    },
    {
      tab: 'Tab 2',
      title: 'Rent Account / Schedule of Arrears',
      description: `A detailed schedule showing rent due, rent paid, and arrears accruing for each rental period from ${moneyClaimCase.tenancy_start_date || 'the start of the tenancy'} to present. This demonstrates the calculation of the total arrears of \u00A3${arrears}.`,
    },
    {
      tab: 'Tab 3',
      title: 'Bank Statements / Rent Ledger',
      description:
        'Bank statements or rent ledger showing payments received (or not received) from the Defendant. This corroborates the schedule of arrears and shows the Claimant\'s attempts to track payments.',
    },

  ];

  if (caseFacts.money_claim.lba_date) {
    evidenceIndex.push({
      tab: 'Tab 4',
      title: 'Letter Before Action and Pre-Action Correspondence',
      description: `Letter before action dated ${caseFacts.money_claim.lba_date} and any responses, demonstrating compliance with ${isScotland ? 'Simple Procedure pre-action requirements' : 'the Pre-Action Protocol for Debt Claims'} and the Claimant's attempts to resolve the matter before court proceedings.`,
    });
  }

  if (moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0) {
    evidenceIndex.push({
      tab: evidenceIndex.length > 3 ? 'Tab 5' : 'Tab 4',
      title: 'Damage Evidence (Photos / Inventory)',
      description: 'Photographs and inventory reports showing the condition of the property and damage caused by the Defendant, supporting the damages claim.',
    });
  }

  // Optional: Post-Issue and Risk Report
  let postIssue: PostIssueDraft | undefined;
  let riskReport: RiskReportDraft | undefined;

  if (options?.includePostIssue) {
    postIssue = {
      what_happens_next: `After you ${isScotland ? 'lodge your claim at the Sheriff Court' : 'issue your claim at the County Court'}, the ${isScotland ? 'defender' : 'defendant'} will be served with the claim form and has ${isScotland ? '21 days' : '14 days'} to respond.`,

      if_defended: `If the ${isScotland ? 'defender' : 'defendant'} defends the claim, the court will issue directions for a hearing. You will need to prepare witness statements and evidence bundles. Most defended money claims settle before trial.`,

      if_admitted: `If the ${isScotland ? 'defender' : 'defendant'} admits the claim, they may request time to pay. You can accept or object to their proposal. If accepted, judgment will be entered with a payment plan.`,

      if_no_response: `If the ${isScotland ? 'defender' : 'defendant'} does not respond within the time limit, you can apply for ${isScotland ? 'a decree by default' : 'default judgment'}. This will give you a judgment without a hearing, and you can then proceed with enforcement.`,

      timeline: `Typical timeline: Issue (Day 0) -> Service (Days 1-5) -> ${isScotland ? 'Defender' : 'Defendant'} response deadline (Day ${isScotland ? '21' : '14'}) -> Default judgment OR directions for hearing (Days 28-56) -> Final hearing (Days 90-180).`,
    };
  }

  if (options?.includeRiskReport) {
    riskReport = {
      strengths: [
        'Clear contractual obligation to pay rent',
        'Documentary evidence of arrears',
        caseFacts.money_claim.lba_date ? 'Pre-action protocol complied with' : '',
      ].filter(Boolean),

      weaknesses: [
        !caseFacts.money_claim.lba_date ? 'No formal pre-action letter sent' : '',
        !moneyClaimCase.arrears_schedule || moneyClaimCase.arrears_schedule.length === 0 ? 'No detailed arrears schedule provided' : '',
      ].filter(Boolean),

      missing_evidence: [
        'Proof of service of tenancy agreement',
        'Bank statements showing rent payments',
        'Recent correspondence with tenant',
      ],

      recommendations: [
        'Ensure all evidence is clearly indexed and easy to follow',
        `Consider ${isScotland ? 'diligence' : 'enforcement'} options in advance of obtaining ${isScotland ? 'decree' : 'judgment'}`,
        'Check if tenant has applied for Universal Credit or other benefits that may affect payment',
      ],
    };
  }

  return {
    lba,
    particulars_of_claim: particulars,
    evidence_index: evidenceIndex,
    post_issue: postIssue,
    risk_report: riskReport,
  };
}

/**
 * Helper: Get ordinal suffix for day numbers (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day: number | undefined): string {
  if (!day) return '';
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
