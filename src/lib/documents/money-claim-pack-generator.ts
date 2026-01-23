/**
 * Money Claim Pack Generator (England & Wales)
 *
 * Builds a complete England & Wales money-claim bundle including:
 * - Official N1 claim form (PDF fill)
 * - Particulars of claim (template)
 * - Schedule of arrears (template)
 * - Interest calculation (template)
 * - Pre-Action Protocol for Debt Claims documents (PAP-DEBT), including:
 *   - Letter Before Claim
 *   - Information Sheet for Defendants
 *   - Reply Form
 *   - Financial Statement Form
 * - Filing guide (MCOL or paper)
 * - Enforcement guide (post-judgment options)
 *
 * Note:
 * - This pack is aligned with the Jan 2026 restructure:
 *   Removed pack cover/summary, evidence index, and hearing prep documents.
 */


import { generateDocument } from './generator';
import { assertOfficialFormExists, fillN1Form, CaseData } from '@/lib/documents/official-forms-filler';
import { buildServiceContact } from '@/lib/documents/service-contact';
import { generateMoneyClaimAskHeavenDrafts } from './money-claim-askheaven';
import { assertValidMoneyClaimData } from './money-claim-validator';
import type { CaseFacts } from '@/lib/case-facts/schema';

import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';

export type MoneyClaimJurisdiction = Exclude<CanonicalJurisdiction, 'northern-ireland'>; // england, wales, scotland

export interface ArrearsEntry {
  period: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  arrears: number;
  running_balance?: number;
  notes?: string;
}

export interface ClaimLineItem {
  description: string;
  amount: number;
}

export interface MoneyClaimCase {
  jurisdiction: MoneyClaimJurisdiction;
  case_id?: string;

  // Landlord / claimant
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_email?: string;
  landlord_phone?: string;
  claimant_reference?: string;

  // Defendant / tenant
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  // Tenancy / rent
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  payment_day?: number;
  usual_payment_weekday?: string;
  tenancy_start_date?: string;
  tenancy_end_date?: string;

  // Arrears / money claim breakdown
  arrears_total?: number;
  arrears_schedule?: ArrearsEntry[];
  damage_items?: ClaimLineItem[];
  other_charges?: ClaimLineItem[];

  // Additional narrative fields for AI drafting
  other_charges_notes?: string;
  other_costs_notes?: string;
  other_amounts_summary?: string;

  // Interest - REQUIRES EXPLICIT OPT-IN
  // claim_interest must be true for interest to be calculated and included in documents
  claim_interest?: boolean;
  interest_rate?: number;
  interest_start_date?: string;
  interest_to_date?: number;
  daily_interest?: number;

  // Fees / costs
  court_fee?: number;
  solicitor_costs?: number;

  // Representation (solicitor / agent)
  solicitor_firm?: string;
  solicitor_address?: string;
  solicitor_phone?: string;
  solicitor_email?: string;
  dx_number?: string;

  // Pre-action and PAP-DEBT
  lba_date?: string;
  lba_response_deadline?: string;
  pap_documents_sent?: string[];
  lba_method?: string[];
  lba_second_date?: string;
  lba_second_method?: string[];
  lba_second_response_deadline?: string;
  pap_documents_served?: boolean;
  pap_service_method?: string[];
  pap_service_proof?: string;
  tenant_responded?: boolean;
  tenant_response_details?: string;

  // Court route and fees
  preferred_issue_route?: 'mcol' | 'county_court_n1';
  claim_value_band?: string;
  help_with_fees_needed?: boolean;

  // Enforcement guidance
  enforcement_preferences?: string[];
  enforcement_notes?: string;

  // Evidence flags
  arrears_schedule_confirmed?: boolean;
  evidence_types_available?: string[];

  // Explicit address-for-service override (if collected in wizard)
  service_address_line1?: string;
  service_address_line2?: string;
  service_address_town?: string;
  service_address_county?: string;
  service_postcode?: string;
  service_phone?: string;
  service_email?: string;

  // Claim meta
  particulars_of_claim?: string;
  signatory_name?: string;
  signature_date?: string;
  claim_number?: string;
  court_name?: string;
  notes?: string;
}

export interface MoneyClaimPackDocument {
  title: string;
  description: string;
  category: 'court_form' | 'particulars' | 'schedule' | 'guidance' | 'evidence';
  /** Canonical document type key matching pack-contents (e.g., 'n1_claim', 'particulars_of_claim') */
  document_type: string;
  html?: string;
  pdf?: Buffer;
  file_name: string;
}

export interface MoneyClaimPack {
  case_id: string;
  jurisdiction: MoneyClaimJurisdiction;
  pack_type: 'money_claim_pack';
  generated_at: string;
  documents: MoneyClaimPackDocument[];
  metadata: {
    total_documents: number;
    includes_official_pdf: boolean;
    total_claim_amount: number;
    total_with_fees: number;
  };
}

interface CalculatedTotals {
  arrears_total: number;
  damages_total: number;
  other_total: number;
  claim_interest: boolean;
  interest_rate: number | null;
  interest_to_date: number | null;
  daily_interest: number | null;
  total_claim_amount: number;
  court_fee: number;
  solicitor_costs: number;
  total_with_fees: number;
}

function sumLineItems(items?: ClaimLineItem[]): number {
  return (items || []).reduce((total, item) => total + (item.amount || 0), 0);
}

function calculateTotals(claim: MoneyClaimCase): CalculatedTotals {
  const arrears_total =
    claim.arrears_total ||
    (claim.arrears_schedule || []).reduce((total, entry) => total + (entry.arrears || 0), 0);

  const damages_total = sumLineItems(claim.damage_items);
  const other_total = sumLineItems(claim.other_charges);

  const basePrincipal = arrears_total + damages_total + other_total;

  // INTEREST: Only calculate if user EXPLICITLY opted in via claim_interest === true
  // No default 8% rate - user must confirm they want to claim interest
  const claimInterest = claim.claim_interest === true;

  let interest_rate: number | null = null;
  let interest_to_date: number | null = null;
  let daily_interest: number | null = null;

  if (claimInterest) {
    // User opted in - use their rate or suggest 8% statutory rate
    // Note: The rate should have been explicitly confirmed in the wizard
    interest_rate = claim.interest_rate ?? 8;
    interest_to_date =
      claim.interest_to_date ?? Number((basePrincipal * (interest_rate / 100) * 0.25).toFixed(2));
    daily_interest =
      claim.daily_interest ?? Number(((basePrincipal * (interest_rate / 100)) / 365).toFixed(2));

    console.log(
      `[money-claim] Interest claimed at ${interest_rate}% (user opted in). ` +
        `Interest to date: £${interest_to_date}, Daily rate: £${daily_interest}`
    );
  } else {
    console.log('[money-claim] No interest claimed (user did not opt in or claim_interest !== true)');
  }

  const court_fee = claim.court_fee ?? 355;
  const solicitor_costs = claim.solicitor_costs ?? 0;

  const total_claim_amount = basePrincipal + (interest_to_date ?? 0);
  const total_with_fees = total_claim_amount + court_fee + solicitor_costs;

  return {
    arrears_total,
    damages_total,
    other_total,
    claim_interest: claimInterest,
    interest_rate,
    interest_to_date,
    daily_interest,
    total_claim_amount,
    court_fee,
    solicitor_costs,
    total_with_fees,
  };
}

function buildPreActionSummary(claim: MoneyClaimCase): string {
  const segments: string[] = [];

  if (claim.lba_date) {
    const methods =
      (claim.lba_method || []).length ? ` via ${(claim.lba_method || []).join(', ')}` : '';
    segments.push(`Initial demand sent on ${claim.lba_date}${methods}.`);
  }

  if (claim.lba_response_deadline) {
    segments.push(`Response deadline given: ${claim.lba_response_deadline}.`);
  }

  if (claim.pap_documents_sent && claim.pap_documents_sent.length) {
    segments.push(`Included PAP/defence forms: ${claim.pap_documents_sent.join(', ')}.`);
  }

  if (claim.lba_second_date) {
    const followUpMethods =
      (claim.lba_second_method || []).length
        ? ` via ${(claim.lba_second_method || []).join(', ')}`
        : '';
    segments.push(`Follow-up demand sent on ${claim.lba_second_date}${followUpMethods}.`);
  }

  if (claim.lba_second_response_deadline) {
    segments.push(`Follow-up response deadline: ${claim.lba_second_response_deadline}.`);
  }

  if (claim.tenant_responded !== undefined && claim.tenant_responded !== null) {
    segments.push(
      claim.tenant_responded
        ? `Tenant responded${claim.tenant_response_details ? `: ${claim.tenant_response_details}` : ''}.`
        : 'No reply received to demands.'
    );
  }

  if (claim.pap_documents_served) {
    const methodsArray = claim.pap_service_method ?? [];
    const methods = methodsArray.length ? methodsArray.join(', ') : 'unspecified method';
    segments.push(`Pre-action pack served (${methods}).`);
  }

  if (claim.pap_service_proof) {
    segments.push(`Proof of service noted: ${claim.pap_service_proof}.`);
  }

  return segments.join(' ');
}

function buildN1Payload(claim: MoneyClaimCase, totals: CalculatedTotals): CaseData {
  const service = buildServiceContact(claim);

  return {
    // Landlord / claimant core details
    landlord_full_name: claim.landlord_full_name,
    landlord_2_name: claim.landlord_2_name,
    landlord_address: claim.landlord_address,
    landlord_postcode: claim.landlord_postcode,
    landlord_phone: claim.landlord_phone,
    landlord_email: claim.landlord_email,

    // Defendant
    tenant_full_name: claim.tenant_full_name,
    tenant_2_name: claim.tenant_2_name,
    property_address: claim.property_address,
    property_postcode: claim.property_postcode,

    // Tenancy / rent
    tenancy_start_date: claim.tenancy_start_date || '',
    rent_amount: claim.rent_amount,
    rent_frequency: claim.rent_frequency,

    // Claim meta
    claim_type: 'money_claim',
    particulars_of_claim: claim.particulars_of_claim,
    total_claim_amount: totals.total_claim_amount,
    court_fee: totals.court_fee,
    solicitor_costs: totals.solicitor_costs,
    claimant_reference: claim.claimant_reference,
    court_name: claim.court_name,

    // Representation (passed through for N1 + fallbacks)
    solicitor_firm: claim.solicitor_firm,
    solicitor_address: claim.solicitor_address,
    solicitor_phone: claim.solicitor_phone,
    solicitor_email: claim.solicitor_email,
    dx_number: claim.dx_number,

    // Signature
    signatory_name: claim.signatory_name || claim.landlord_full_name,
    signature_date: claim.signature_date || new Date().toISOString().split('T')[0],

    // Unified address for service (from helper)
    service_address_line1: service.service_address_line1,
    service_address_line2: service.service_address_line2,
    service_address_town: service.service_address_town,
    service_address_county: service.service_address_county,
    service_postcode: service.service_postcode,
    service_phone: service.service_phone,
    service_email: service.service_email,
  };
}

async function generateEnglandWalesMoneyClaimPack(
  claim: MoneyClaimCase,
  caseFacts?: CaseFacts
): Promise<MoneyClaimPack> {
  // =========================================================================
  // PRE-GENERATION VALIDATION
  // Validate all required data and cross-document consistency BEFORE generating
  // =========================================================================
  const validationResult = assertValidMoneyClaimData(claim);
  console.log('[money-claim-pack] Pre-generation validation passed');
  console.log('[money-claim-pack] Computed totals:', validationResult.computedTotals);

  const totals = calculateTotals(claim);
  const generationDate = new Date().toISOString();
  const documents: MoneyClaimPackDocument[] = [];

  const jurisdictionKey = claim.jurisdiction === 'wales' ? 'wales' : 'england';
  const templateBase = `uk/${jurisdictionKey}`;

  // Generate AI-drafted content for templates (embedded into docs via templates)
  let askHeavenDrafts;
  if (caseFacts) {
    try {
      askHeavenDrafts = await generateMoneyClaimAskHeavenDrafts(caseFacts, claim, {
        includePostIssue: true,
        includeRiskReport: false,
        jurisdiction: jurisdictionKey,
      });
    } catch (error) {
      console.error('Failed to generate AI drafts, proceeding without:', error);
    }
  }

  const baseTemplateData = {
    ...claim,
    ...totals,
    generation_date: generationDate.split('T')[0],
    total_principal: totals.arrears_total + totals.damages_total + totals.other_total,
    arrears_schedule: claim.arrears_schedule || [],
    damage_items: claim.damage_items || [],
    other_charges: claim.other_charges || [],
    pre_action_summary: buildPreActionSummary(claim),
    enforcement_preferences: claim.enforcement_preferences || [],
    enforcement_notes: claim.enforcement_notes,
    evidence_types_available: claim.evidence_types_available || [],
    arrears_schedule_confirmed: claim.arrears_schedule_confirmed,
    ask_heaven: askHeavenDrafts,
  };

  // PACK COVER - Removed as of Jan 2026 pack restructure
  // Pack summary document no longer included in the money claim pack

  // PARTICULARS OF CLAIM
  const particulars = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/particulars_of_claim.hbs`,
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Particulars of claim',
    description: 'Detailed particulars for rent arrears, damages and costs.',
    category: 'particulars',
    document_type: 'particulars_of_claim',
    html: particulars.html,
    pdf: particulars.pdf,
    file_name: '01-particulars-of-claim.pdf',
  });

  // SCHEDULE OF ARREARS
  const arrears = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/schedule_of_arrears.hbs`,
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Schedule of arrears',
    description: 'Line-by-line arrears schedule required by HMCTS.',
    category: 'schedule',
    document_type: 'arrears_schedule',
    html: arrears.html,
    pdf: arrears.pdf,
    file_name: '02-schedule-of-arrears.pdf',
  });

  // INTEREST CALCULATION (optional - only if user opted in)
  if (totals.claim_interest === true) {
    const interest = await generateDocument({
      templatePath: `${templateBase}/templates/money_claims/interest_workings.hbs`,
      data: baseTemplateData,
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Interest calculation',
      description: 'Section 69 County Courts Act interest workings and daily rate.',
      category: 'guidance',
      document_type: 'interest_calculation',
      html: interest.html,
      pdf: interest.pdf,
      file_name: '03-interest-calculation.pdf',
    });
  }

  // EVIDENCE INDEX - Removed as of Jan 2026 pack restructure
  // COURT HEARING PREPARATION SHEET - Removed as of Jan 2026 pack restructure

  // PRE-ACTION PROTOCOL DOCUMENTS (Legally Required)
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + 30);

  const extendedData = {
    ...baseTemplateData,
    response_deadline: responseDeadline.toISOString().split('T')[0],
  };

  const letterBeforeClaim = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/letter_before_claim.hbs`,
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Letter Before Claim (PAP-DEBT)',
    description: 'Pre-Action Protocol letter required before issuing proceedings.',
    category: 'guidance',
    document_type: 'letter_before_claim',
    html: letterBeforeClaim.html,
    pdf: letterBeforeClaim.pdf,
    file_name: '04-letter-before-claim.pdf',
  });

  const infoSheet = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/information_sheet_for_defendants.hbs`,
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Information Sheet for Defendants',
    description: 'Explains defendant rights and options (enclose with Letter Before Claim).',
    category: 'guidance',
    document_type: 'defendant_info_sheet',
    html: infoSheet.html,
    pdf: infoSheet.pdf,
    file_name: '05-information-sheet-for-defendants.pdf',
  });

  const replyForm = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/reply_form.hbs`,
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Reply Form',
    description: 'Form for defendant to respond to Letter Before Claim.',
    category: 'guidance',
    document_type: 'reply_form',
    html: replyForm.html,
    pdf: replyForm.pdf,
    file_name: '06-reply-form.pdf',
  });

  const financialStatement = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/financial_statement_form.hbs`,
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Financial Statement Form',
    description: 'Form for defendant to disclose income/expenditure for payment plan.',
    category: 'guidance',
    document_type: 'financial_statement_form',
    html: financialStatement.html,
    pdf: financialStatement.pdf,
    file_name: '07-financial-statement-form.pdf',
  });

  // FILING GUIDE
  const filingGuide = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/filing_guide.hbs`,
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Money Claims Filing Guide',
    description: 'Step-by-step instructions for filing via MCOL or paper.',
    category: 'guidance',
    document_type: 'court_filing_guide',
    html: filingGuide.html,
    pdf: filingGuide.pdf,
    file_name: '08-filing-guide.pdf',
  });

  // ENFORCEMENT GUIDE (Post-Issue)
  const enforcementGuide = await generateDocument({
    templatePath: `${templateBase}/templates/money_claims/enforcement_guide.hbs`,
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Enforcement Guide',
    description: 'Explains enforcement options after obtaining a County Court Judgment.',
    category: 'guidance',
    document_type: 'enforcement_guide',
    html: enforcementGuide.html,
    pdf: enforcementGuide.pdf,
    file_name: '09-enforcement-guide.pdf',
  });

  // OFFICIAL N1 FORM
  await assertOfficialFormExists('N1_1224.pdf');
  const n1Pdf = await fillN1Form(buildN1Payload(claim, totals));

  documents.push({
    title: 'Form N1 (official PDF)',
    description: 'Completed claim form ready for County Court Money Claims Centre.',
    category: 'court_form',
    document_type: 'n1_claim',
    pdf: Buffer.from(n1Pdf),
    file_name: '10-n1-claim-form.pdf',
  });

  const caseId = claim.case_id || `MONEY-${Date.now()}`;

  return {
    case_id: caseId,
    jurisdiction: claim.jurisdiction,
    pack_type: 'money_claim_pack',
    generated_at: generationDate,
    documents,
    metadata: {
      total_documents: documents.length,
      includes_official_pdf: true,
      total_claim_amount: totals.total_claim_amount,
      total_with_fees: totals.total_with_fees,
    },
  };
}

export async function generateMoneyClaimPack(
  claim: MoneyClaimCase,
  caseFacts?: CaseFacts
): Promise<MoneyClaimPack> {
  const isEnglandWales = claim.jurisdiction === 'england' || claim.jurisdiction === 'wales';

  if (!isEnglandWales) {
    throw new Error('Money claim pack generation is currently available only for England & Wales.');
  }

  return generateEnglandWalesMoneyClaimPack(claim, caseFacts);
}
