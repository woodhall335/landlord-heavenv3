/**
 * Scotland Money Claim Pack Generator
 *
 * Builds a complete Simple Procedure money-claim bundle including:
 * - Official Simple Procedure claim form (PDF fill)
 * - Particulars of claim and arrears schedule
 * - Interest calculations and evidence index
 * - Cover sheet describing what is inside the pack
 */

import { generateDocument } from './generator';
import { fillSimpleProcedureClaim, ScotlandMoneyClaimData } from './scotland-forms-filler';
import { assertOfficialFormExists } from './official-forms-filler';

export interface ArrearsEntry {
  period: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  arrears: number;
}

export interface ClaimLineItem {
  description: string;
  amount: number;
}

export interface ScotlandMoneyClaimCase {
  jurisdiction: 'scotland';
  case_id?: string;

  // Claimant (Pursuer) details
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_email?: string;
  landlord_phone?: string;
  claimant_reference?: string;

  // Respondent (Defender) details
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  // Court details
  sheriffdom?: string; // e.g., "Lothian and Borders at Edinburgh"
  court_name?: string; // e.g., "Edinburgh Sheriff Court"

  // Tenancy details
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  payment_day?: number;
  tenancy_start_date?: string;
  tenancy_end_date?: string;

  // Claim breakdown
  arrears_total?: number;
  arrears_schedule?: ArrearsEntry[];
  damage_items?: ClaimLineItem[];
  other_charges?: ClaimLineItem[];

  // Interest
  interest_rate?: number; // Default 8%
  interest_start_date?: string;
  interest_to_date?: number;
  daily_interest?: number;

  // Costs
  court_fee?: number; // Varies by claim amount in Scotland
  solicitor_costs?: number;

  // Claim narrative
  basis_of_claim?: 'rent_arrears' | 'damages' | 'both';
  particulars_of_claim?: string;
  attempts_to_resolve?: string; // Required in Scotland
  evidence_summary?: string;

  // Statement of truth
  signatory_name?: string;
  signature_date?: string;
  notes?: string;

  // Pre-action demand details
  demand_letter_date?: string;
  second_demand_date?: string;
  lba_method?: string[];
  lba_second_method?: string[];
  lba_response_deadline?: string;
  lba_second_response_deadline?: string;
  pap_documents_sent?: string[];
  pap_documents_served?: boolean;
  pap_service_method?: string[];
  pap_service_proof?: string;
  tenant_responded?: boolean;
  tenant_response_details?: string;
  pre_action_deadline_confirmation?: boolean;

  // Court and lodging
  lodging_method?: 'civil_online' | 'paper_form';
  help_with_fees_needed?: boolean;
  court_jurisdiction_confirmed?: boolean;

  // Enforcement
  enforcement_preferences?: string[];
  enforcement_notes?: string;

  // Evidence flags
  arrears_schedule_confirmed?: boolean;
  evidence_types_available?: string[];
}

export interface ScotlandMoneyClaimPackDocument {
  title: string;
  description: string;
  category: 'court_form' | 'particulars' | 'schedule' | 'guidance' | 'evidence';
  html?: string;
  pdf?: Buffer;
  file_name: string;
}

export interface ScotlandMoneyClaimPack {
  case_id: string;
  jurisdiction: 'scotland';
  pack_type: 'scotland_money_claim_pack';
  generated_at: string;
  documents: ScotlandMoneyClaimPackDocument[];
  metadata: {
    total_documents: number;
    includes_official_pdf: boolean;
    total_claim_amount: number;
    total_with_fees: number;
    sheriffdom: string;
  };
}

interface CalculatedTotals {
  arrears_total: number;
  damages_total: number;
  other_total: number;
  interest_rate: number;
  interest_to_date: number;
  daily_interest: number;
  total_claim_amount: number;
  court_fee: number;
  solicitor_costs: number;
  total_with_fees: number;
}

function sumLineItems(items?: ClaimLineItem[]): number {
  return (items || []).reduce((total, item) => total + (item.amount || 0), 0);
}

function calculateScotlandCourtFee(claimAmount: number): number {
  // Scotland Simple Procedure fee structure
  if (claimAmount <= 300) return 21;
  if (claimAmount <= 1500) return 75;
  if (claimAmount <= 5000) return 145;
  return 145; // Maximum for Simple Procedure
}

function calculateTotals(claim: ScotlandMoneyClaimCase): CalculatedTotals {
  const arrears_total =
    claim.arrears_total ||
    (claim.arrears_schedule || []).reduce((total, entry) => total + (entry.arrears || 0), 0);
  const damages_total = sumLineItems(claim.damage_items);
  const other_total = sumLineItems(claim.other_charges);

  const basePrincipal = arrears_total + damages_total + other_total;

  // Validate Simple Procedure limit (£5,000)
  if (basePrincipal > 5000) {
    console.warn(`Claim amount £${basePrincipal} exceeds Simple Procedure limit of £5,000. This may need to be raised as an Ordinary Cause instead.`);
  }

  const interest_rate = claim.interest_rate ?? 8;
  const interest_to_date = claim.interest_to_date ?? Number((basePrincipal * (interest_rate / 100) * 0.25).toFixed(2));
  const daily_interest =
    claim.daily_interest ?? Number(((basePrincipal * (interest_rate / 100)) / 365).toFixed(2));

  const court_fee = claim.court_fee ?? calculateScotlandCourtFee(basePrincipal);
  const solicitor_costs = claim.solicitor_costs ?? 0;
  const total_claim_amount = basePrincipal + interest_to_date;
  const total_with_fees = total_claim_amount + court_fee + solicitor_costs;

  return {
    arrears_total,
    damages_total,
    other_total,
    interest_rate,
    interest_to_date,
    daily_interest,
    total_claim_amount,
    court_fee,
    solicitor_costs,
    total_with_fees,
  };
}

function buildScotlandPreActionSummary(claim: ScotlandMoneyClaimCase): string {
  const steps: string[] = [];

  if (claim.demand_letter_date) {
    const methods = (claim.lba_method || []).length ? ` via ${(claim.lba_method || []).join(', ')}` : '';
    steps.push(`First demand sent on ${claim.demand_letter_date}${methods}.`);
  }
  if (claim.lba_response_deadline) {
    steps.push(`Response deadline offered: ${claim.lba_response_deadline}.`);
  }
  if (claim.pap_documents_sent && claim.pap_documents_sent.length) {
    steps.push(`Included reply/financial forms: ${claim.pap_documents_sent.join(', ')}.`);
  }
  if (claim.second_demand_date) {
    const methods = (claim.lba_second_method || []).length ? ` via ${(claim.lba_second_method || []).join(', ')}` : '';
    steps.push(`Follow-up demand on ${claim.second_demand_date}${methods}.`);
  }
  if (claim.lba_second_response_deadline) {
    steps.push(`Follow-up response deadline: ${claim.lba_second_response_deadline}.`);
  }
  if (claim.pre_action_deadline_confirmation !== null && claim.pre_action_deadline_confirmation !== undefined) {
    steps.push(
      claim.pre_action_deadline_confirmation
        ? 'Confirmed 14+ days given to respond in line with Rule 3.1.'
        : '14-day response window not confirmed; highlight for review.'
    );
  }
  if (claim.pap_documents_served) {
    const methods = (claim.pap_service_method || []).length ? claim.pap_service_method.join(', ') : 'unspecified method';
    steps.push(`Pre-action letter served (${methods}).`);
  }
  if (claim.pap_service_proof) {
    steps.push(`Proof of service: ${claim.pap_service_proof}.`);
  }
  if (claim.tenant_responded !== null && claim.tenant_responded !== undefined) {
    steps.push(
      claim.tenant_responded
        ? `Defender replied${claim.tenant_response_details ? `: ${claim.tenant_response_details}` : ''}.`
        : 'No defender response received.'
    );
  }

  return steps.join(' ');
}

function buildSimpleProcedurePayload(
  claim: ScotlandMoneyClaimCase,
  totals: CalculatedTotals
): ScotlandMoneyClaimData {
  return {
    landlord_full_name: claim.landlord_full_name,
    landlord_2_name: claim.landlord_2_name,
    landlord_address: claim.landlord_address,
    landlord_postcode: claim.landlord_postcode,
    landlord_phone: claim.landlord_phone,
    landlord_email: claim.landlord_email,
    tenant_full_name: claim.tenant_full_name,
    tenant_2_name: claim.tenant_2_name,
    property_address: claim.property_address,
    property_postcode: claim.property_postcode,
    sheriffdom: claim.sheriffdom || 'Edinburgh Sheriff Court',
    court_name: claim.court_name,
    rent_amount: claim.rent_amount,
    rent_frequency: claim.rent_frequency,
    payment_day: claim.payment_day,
    tenancy_start_date: claim.tenancy_start_date,
    tenancy_end_date: claim.tenancy_end_date,
    arrears_total: totals.arrears_total,
    damages_total: totals.damages_total,
    other_total: totals.other_total,
    total_claim_amount: totals.total_claim_amount,
    interest_rate: totals.interest_rate,
    interest_to_date: totals.interest_to_date,
    daily_interest: totals.daily_interest,
    interest_start_date: claim.interest_start_date,
    court_fee: totals.court_fee,
    solicitor_costs: totals.solicitor_costs,
    total_with_fees: totals.total_with_fees,
    basis_of_claim: claim.basis_of_claim,
    particulars_of_claim: claim.particulars_of_claim,
    attempts_to_resolve: claim.attempts_to_resolve,
    evidence_summary: claim.evidence_summary,
    signatory_name: claim.signatory_name || claim.landlord_full_name,
    signature_date: claim.signature_date || new Date().toISOString().split('T')[0],
    claimant_reference: claim.claimant_reference,
  };
}

async function generateScotlandMoneyClaimPack(claim: ScotlandMoneyClaimCase): Promise<ScotlandMoneyClaimPack> {
  const totals = calculateTotals(claim);
  const generationDate = new Date().toISOString();
  const documents: ScotlandMoneyClaimPackDocument[] = [];

  const baseTemplateData = {
    ...claim,
    ...totals,
    generation_date: generationDate.split('T')[0],
    total_principal: totals.arrears_total + totals.damages_total + totals.other_total,
    arrears_schedule: claim.arrears_schedule || [],
    damage_items: claim.damage_items || [],
    other_charges: claim.other_charges || [],
    sheriffdom: claim.sheriffdom || 'Edinburgh Sheriff Court',
    document_id: claim.case_id || `SC-MONEY-${Date.now()}`,
    days_accrued: 90, // Default for template
    pre_action_summary: buildScotlandPreActionSummary(claim),
    enforcement_preferences: claim.enforcement_preferences || [],
    enforcement_notes: claim.enforcement_notes,
    evidence_types_available: claim.evidence_types_available || [],
    arrears_schedule_confirmed: claim.arrears_schedule_confirmed,
    help_with_fees_needed: claim.help_with_fees_needed,
    lodging_method: claim.lodging_method,
    court_jurisdiction_confirmed: claim.court_jurisdiction_confirmed,
  };

  // 1. Pack cover
  const packCover = await generateDocument({
    templatePath: 'uk/scotland/templates/money_claims/pack_cover.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Simple Procedure claim pack summary',
    description: 'Explains the contents of the bundle, claim totals and lodging steps.',
    category: 'guidance',
    html: packCover.html,
    pdf: packCover.pdf,
    file_name: 'scotland-money-claim-pack-summary.pdf',
  });

  // 2. Particulars of claim
  const particulars = await generateDocument({
    templatePath: 'uk/scotland/templates/money_claims/simple_procedure_particulars.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Statement of claim (Particulars)',
    description: 'Detailed particulars for rent arrears, damages and attempts to resolve.',
    category: 'particulars',
    html: particulars.html,
    pdf: particulars.pdf,
    file_name: 'simple-procedure-particulars.pdf',
  });

  // 3. Schedule of arrears
  if (claim.arrears_schedule && claim.arrears_schedule.length > 0) {
    const arrears = await generateDocument({
      templatePath: 'uk/scotland/templates/money_claims/schedule_of_arrears.hbs',
      data: baseTemplateData,
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Schedule of rent arrears',
      description: 'Period-by-period breakdown of rent arrears.',
      category: 'schedule',
      html: arrears.html,
      pdf: arrears.pdf,
      file_name: 'schedule-of-arrears.pdf',
    });
  }

  // 4. Interest calculation
  if (totals.interest_to_date > 0) {
    const interest = await generateDocument({
      templatePath: 'uk/scotland/templates/money_claims/interest_calculation.hbs',
      data: baseTemplateData,
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: 'Interest calculation',
      description: 'Statutory interest workings and daily rate.',
      category: 'guidance',
      html: interest.html,
      pdf: interest.pdf,
      file_name: 'interest-calculation.pdf',
    });
  }

  // 5. Evidence index
  const evidence = await generateDocument({
    templatePath: 'uk/scotland/templates/money_claims/evidence_index.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Evidence index',
    description: 'Checklist of supporting documents to attach to the claim form.',
    category: 'evidence',
    html: evidence.html,
    pdf: evidence.pdf,
    file_name: 'evidence-index.pdf',
  });

  // PRE-ACTION DOCUMENTS (Required by Simple Procedure Rule 3.1)
  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + 14);
  const extendedData = {
    ...baseTemplateData,
    response_deadline: responseDeadline.toISOString().split('T')[0],
    demand_letter_date: claim['demand_letter_date'] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    second_demand_date: claim['second_demand_date'] || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const preActionLetter = await generateDocument({
    templatePath: 'uk/scotland/templates/money_claims/pre_action_letter.hbs',
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Pre-Action Letter',
    description: 'Formal demand for payment before raising Simple Procedure proceedings.',
    category: 'guidance',
    html: preActionLetter.html,
    pdf: preActionLetter.pdf,
    file_name: 'pre-action-letter.pdf',
  });

  // FILING GUIDE
  const filingGuide = await generateDocument({
    templatePath: 'uk/scotland/templates/money_claims/filing_guide_scotland.hbs',
    data: extendedData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Simple Procedure Filing Guide',
    description: 'Step-by-step instructions for lodging your claim at the Sheriff Court.',
    category: 'guidance',
    html: filingGuide.html,
    pdf: filingGuide.pdf,
    file_name: 'filing-guide-scotland.pdf',
  });

  // 6. Official Simple Procedure claim form
  await assertOfficialFormExists('scotland/simple_procedure_claim_form.pdf');
  const simpleProcedurePdf = await fillSimpleProcedureClaim(buildSimpleProcedurePayload(claim, totals));

  documents.push({
    title: 'Simple Procedure Claim Form (Form 3A) - Official PDF',
    description: 'Completed claim form ready for Sheriff Court lodging.',
    category: 'court_form',
    pdf: Buffer.from(simpleProcedurePdf),
    file_name: 'simple-procedure-claim-form.pdf',
  });

  const caseId = claim.case_id || `SC-MONEY-${Date.now()}`;

  return {
    case_id: caseId,
    jurisdiction: 'scotland',
    pack_type: 'scotland_money_claim_pack',
    generated_at: generationDate,
    documents,
    metadata: {
      total_documents: documents.length,
      includes_official_pdf: true,
      total_claim_amount: totals.total_claim_amount,
      total_with_fees: totals.total_with_fees,
      sheriffdom: claim.sheriffdom || 'Edinburgh Sheriff Court',
    },
  };
}

export async function generateScotlandMoneyClaim(claim: ScotlandMoneyClaimCase): Promise<ScotlandMoneyClaimPack> {
  if (claim.jurisdiction !== 'scotland') {
    throw new Error('This generator is for Scotland Simple Procedure claims only.');
  }

  return generateScotlandMoneyClaimPack(claim);
}
