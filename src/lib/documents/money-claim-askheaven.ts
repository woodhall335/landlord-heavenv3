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
    jurisdiction?: 'england-wales' | 'scotland';
  }
): Promise<MoneyClaimDrafts> {
  const jurisdiction = options?.jurisdiction || ('jurisdiction' in moneyClaimCase ? moneyClaimCase.jurisdiction : 'england-wales');

  try {
    // TODO: Implement actual AskHeaven/LLM API call here
    // For now, return structured fallback content that templates can use

    // Build a comprehensive prompt for the AI
    const prompt = buildMoneyClaimDraftingPrompt(caseFacts, moneyClaimCase, jurisdiction);

    // In production, this would call your AI service:
    // const aiResponse = await callAskHeavenAPI(prompt);
    // return parseAIResponse(aiResponse);

    // For now, return intelligent fallback content
    return generateFallbackDrafts(caseFacts, moneyClaimCase, jurisdiction, options);

  } catch (error) {
    console.error('AskHeaven drafting failed, using fallback:', error);
    // Always return usable content, never crash the pack generator
    return generateFallbackDrafts(caseFacts, moneyClaimCase, jurisdiction, options);
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Builds a comprehensive prompt for AI drafting
 */
function buildMoneyClaimDraftingPrompt(
  caseFacts: CaseFacts,
  moneyClaimCase: MoneyClaimCase | ScotlandMoneyClaimCase,
  jurisdiction: 'england-wales' | 'scotland'
): string {
  const isScotland = jurisdiction === 'scotland';

  return `
You are a legal drafting assistant specializing in ${isScotland ? 'Scottish Simple Procedure' : 'England & Wales County Court'} money claims for residential rent arrears and related claims.

Generate professional, legally sound narrative content for the following money claim:

CLAIMANT: ${moneyClaimCase.landlord_full_name}
DEFENDANT: ${moneyClaimCase.tenant_full_name}
PROPERTY: ${moneyClaimCase.property_address}
CLAIM AMOUNT: £${moneyClaimCase.arrears_total || 0}

TENANCY DETAILS:
- Start Date: ${moneyClaimCase.tenancy_start_date || 'Not provided'}
- End Date: ${moneyClaimCase.tenancy_end_date || 'Ongoing'}
- Rent: £${moneyClaimCase.rent_amount} ${moneyClaimCase.rent_frequency}

ARREARS: £${moneyClaimCase.arrears_total || 0}
${moneyClaimCase.arrears_schedule ? `Schedule: ${JSON.stringify(moneyClaimCase.arrears_schedule, null, 2)}` : ''}

DAMAGE CLAIMS: ${moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0 ? JSON.stringify(moneyClaimCase.damage_items, null, 2) : 'None'}

INTEREST: ${moneyClaimCase.interest_rate || 8}% from ${moneyClaimCase.interest_start_date || 'date of issue'}

PRE-ACTION: ${caseFacts.money_claim.lba_date ? `Letter before action sent on ${caseFacts.money_claim.lba_date}` : 'No formal pre-action letter sent'}

ADDITIONAL CONTEXT:
${moneyClaimCase.other_charges_notes || ''}
${moneyClaimCase.other_costs_notes || ''}
${moneyClaimCase.other_amounts_summary || ''}

Generate the following sections in JSON format:
1. Letter Before Action (intro, tenancy_history, arrears_summary, amount_due, response_deadline, payment_instructions, consequences)
2. Particulars of Claim (tenancy_background, legal_basis, rent_obligation, arrears_calculation, interest_claim, pre_action_summary, remedy_sought)
3. Evidence Index (array of {tab, title, description} for typical evidence)

Tone: Professional, factual, firm but not aggressive. Cite relevant law where appropriate ${isScotland ? '(e.g., Housing (Scotland) Act 1988)' : '(e.g., Housing Act 1988, Senior Courts Act 1981 s.69)'}.
`;
}

/**
 * Generates fallback content when AI is unavailable
 * This ensures pack generation never fails
 */
function generateFallbackDrafts(
  caseFacts: CaseFacts,
  moneyClaimCase: MoneyClaimCase | ScotlandMoneyClaimCase,
  jurisdiction: 'england-wales' | 'scotland',
  options?: { includePostIssue?: boolean; includeRiskReport?: boolean }
): MoneyClaimDrafts {
  const isScotland = jurisdiction === 'scotland';
  const landlord = moneyClaimCase.landlord_full_name;
  const tenant = moneyClaimCase.tenant_full_name;
  const property = moneyClaimCase.property_address;
  const arrears = moneyClaimCase.arrears_total || 0;
  const rent = `£${moneyClaimCase.rent_amount} ${moneyClaimCase.rent_frequency}`;

  // LBA Draft
  const lba: LBADraft = {
    intro: `I am writing to you concerning the tenancy agreement for ${property}. You have been a tenant at this property since ${moneyClaimCase.tenancy_start_date || 'the start of the tenancy'}, with rent payable at ${rent}.`,

    tenancy_history: `The tenancy commenced on ${moneyClaimCase.tenancy_start_date || '[date]'} with rent set at ${rent}. ${moneyClaimCase.tenancy_end_date ? `The tenancy ended on ${moneyClaimCase.tenancy_end_date}.` : 'The tenancy is ongoing.'}`,

    arrears_summary: `You have failed to pay rent as required under the tenancy agreement. As of today's date, you owe a total of £${arrears} in rent arrears. ${moneyClaimCase.arrears_schedule && moneyClaimCase.arrears_schedule.length > 0 ? 'A detailed breakdown of the arrears is attached.' : ''}`,

    amount_due: `The total amount due is £${arrears} comprising:\n- Rent arrears: £${arrears}\n${moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0 ? `- Damages: £${moneyClaimCase.damage_items.reduce((sum, item) => sum + (item.amount || 0), 0)}` : ''}\nPlus interest and costs as appropriate.`,

    response_deadline: `You must pay the full amount or contact me to discuss payment within 14 days of the date of this letter (by ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}).`,

    payment_instructions: `Payment should be made to [insert bank details or payment method]. Please use reference "${tenant} rent arrears" to ensure prompt allocation.`,

    consequences: `If I do not receive payment or a satisfactory response by the deadline above, I will issue ${isScotland ? 'a Simple Procedure claim' : 'County Court proceedings'} against you without further notice. This will result in additional costs being added to the debt, and may affect your credit rating. A ${isScotland ? 'decree' : 'County Court Judgment (CCJ)'} against you may make it difficult for you to obtain credit in the future.`,
  };

  // Particulars of Claim Draft
  const particulars: ParticularsOfClaimDraft = {
    tenancy_background: `The Claimant is the landlord and the Defendant is (or was) the tenant of the residential property at ${property} ("the Property"). The tenancy commenced on ${moneyClaimCase.tenancy_start_date || '[date]'} pursuant to ${isScotland ? 'a Private Residential Tenancy agreement' : 'an Assured Shorthold Tenancy agreement'}.`,

    legal_basis: `This is a claim for rent arrears arising from a breach of the tenancy agreement, which constitutes a breach of contract. ${isScotland ? 'The claim is brought under the Sheriff Courts (Scotland) Act 1971 and the Simple Procedure Rules.' : 'The claim is brought under the jurisdiction of the County Court in accordance with the County Courts Act 1984.'}`,

    rent_obligation: `Under the terms of the tenancy agreement, the Defendant covenanted to pay rent of ${rent}, payable ${moneyClaimCase.payment_day ? `on or before the ${moneyClaimCase.payment_day}${getOrdinalSuffix(moneyClaimCase.payment_day)} day of each ${moneyClaimCase.rent_frequency === 'monthly' ? 'month' : 'payment period'}` : 'in accordance with the tenancy agreement'}.`,

    arrears_calculation: `The Defendant has failed to pay rent as required. ${moneyClaimCase.arrears_schedule && moneyClaimCase.arrears_schedule.length > 0 ? 'A full schedule of arrears showing the rent due, rent paid, and arrears accruing for each period is attached to this claim.' : `As at today's date, the Defendant owes £${arrears} in rent arrears.`} ${moneyClaimCase.other_charges_notes || ''}`,

    interest_claim: `The Claimant claims interest on the sum due ${isScotland ? 'at the rate of 8% per annum from the date of accrual of the debt' : 'pursuant to section 69 of the County Courts Act 1984 at the rate of ' + (moneyClaimCase.interest_rate || 8) + '% per annum from ' + (moneyClaimCase.interest_start_date || 'the date of issue') + ' to the date of judgment and thereafter at the judgment rate until payment'}.`,

    pre_action_summary: `${caseFacts.money_claim.lba_date ? `The Claimant sent a letter before action on ${caseFacts.money_claim.lba_date} by ${(caseFacts.money_claim.lba_method || []).join(' and ')}, giving the Defendant 14 days to pay or respond. ${caseFacts.money_claim.tenant_responded ? `The Defendant responded${caseFacts.money_claim.tenant_response_details ? ': ' + caseFacts.money_claim.tenant_response_details : ' but did not make payment or propose a satisfactory resolution.'}` : 'The Defendant did not respond or make payment.'}` : 'The Claimant has attempted to resolve this matter amicably but the Defendant has not paid the arrears.'}`,

    remedy_sought: `The Claimant seeks:\n1. Payment of the sum of £${arrears} being rent arrears.\n${moneyClaimCase.damage_items && moneyClaimCase.damage_items.length > 0 ? '2. Payment of damages as particularised.\n' : ''}${isScotland ? '3. Interest at 8% per annum.\n' : '3. Interest pursuant to section 69 of the County Courts Act 1984.\n'}4. Costs${isScotland ? '' : ' and court fees'}.`,
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
      description: `A detailed schedule showing rent due, rent paid, and arrears accruing for each rental period from ${moneyClaimCase.tenancy_start_date || 'the start of the tenancy'} to present. This demonstrates the calculation of the total arrears of £${arrears}.`,
    },
    {
      tab: 'Tab 3',
      title: 'Bank Statements / Rent Ledger',
      description: 'Bank statements or rent ledger showing payments received (or not received) from the Defendant. This corroborates the schedule of arrears and shows the Claimant's attempts to track payments.',
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

      timeline: `Typical timeline: Issue (Day 0) → Service (Days 1-5) → ${isScotland ? 'Defender' : 'Defendant'} response deadline (Day ${isScotland ? '21' : '14'}) → Default judgment OR directions for hearing (Days 28-56) → Final hearing (Days 90-180).`,
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
