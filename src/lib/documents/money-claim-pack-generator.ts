/**
 * Money Claim Pack Generator (England & Wales)
 *
 * Builds a complete money-claim bundle including:
 * - Official N1 claim form (PDF fill)
 * - Particulars of claim and arrears schedule
 * - Interest calculations and evidence index
 * - Cover sheet describing what is inside the pack
 */

import { generateDocument, GeneratedDocument } from './generator';
import { assertOfficialFormExists, fillN1Form, CaseData } from './official-forms-filler';

export type MoneyClaimJurisdiction = 'england-wales';

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

export interface MoneyClaimCase {
  jurisdiction: MoneyClaimJurisdiction;
  case_id?: string;
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_email?: string;
  landlord_phone?: string;
  claimant_reference?: string;

  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  payment_day?: number;
  tenancy_start_date?: string;
  tenancy_end_date?: string;

  arrears_total?: number;
  arrears_schedule?: ArrearsEntry[];
  damage_items?: ClaimLineItem[];
  other_charges?: ClaimLineItem[];

  interest_rate?: number;
  interest_start_date?: string;
  interest_to_date?: number;
  daily_interest?: number;

  court_fee?: number;
  solicitor_costs?: number;

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

function calculateTotals(claim: MoneyClaimCase): CalculatedTotals {
  const arrears_total =
    claim.arrears_total ||
    (claim.arrears_schedule || []).reduce((total, entry) => total + (entry.arrears || 0), 0);
  const damages_total = sumLineItems(claim.damage_items);
  const other_total = sumLineItems(claim.other_charges);

  const basePrincipal = arrears_total + damages_total + other_total;
  const interest_rate = claim.interest_rate ?? 8;
  const interest_to_date = claim.interest_to_date ?? Number((basePrincipal * (interest_rate / 100) * 0.25).toFixed(2));
  const daily_interest =
    claim.daily_interest ?? Number(((basePrincipal * (interest_rate / 100)) / 365).toFixed(2));

  const court_fee = claim.court_fee ?? 355;
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

function buildN1Payload(claim: MoneyClaimCase, totals: CalculatedTotals): CaseData {
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
    tenancy_start_date: claim.tenancy_start_date || '',
    rent_amount: claim.rent_amount,
    rent_frequency: claim.rent_frequency,
    claim_type: 'money_claim',
    particulars_of_claim: claim.particulars_of_claim,
    total_claim_amount: totals.total_claim_amount,
    court_fee: totals.court_fee,
    solicitor_costs: totals.solicitor_costs,
    claimant_reference: claim.claimant_reference,
    court_name: claim.court_name,
    signatory_name: claim.signatory_name || claim.landlord_full_name,
    signature_date: claim.signature_date || new Date().toISOString().split('T')[0],
  };
}

async function generateEnglandWalesMoneyClaimPack(claim: MoneyClaimCase): Promise<MoneyClaimPack> {
  const totals = calculateTotals(claim);
  const generationDate = new Date().toISOString();
  const documents: MoneyClaimPackDocument[] = [];

  const baseTemplateData = {
    ...claim,
    ...totals,
    generation_date: generationDate.split('T')[0],
    total_principal: totals.arrears_total + totals.damages_total + totals.other_total,
    arrears_schedule: claim.arrears_schedule || [],
    damage_items: claim.damage_items || [],
    other_charges: claim.other_charges || [],
  };

  const packCover = await generateDocument({
    templatePath: 'uk/england-wales/templates/money_claims/pack_cover.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Money claim pack summary',
    description: 'Explains the contents of the bundle, claim totals and filing steps.',
    category: 'guidance',
    html: packCover.html,
    pdf: packCover.pdf,
    file_name: 'money-claim-pack-summary.pdf',
  });

  const particulars = await generateDocument({
    templatePath: 'uk/england-wales/templates/money_claims/particulars_of_claim.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Particulars of claim',
    description: 'Detailed particulars for rent arrears, damages and costs.',
    category: 'particulars',
    html: particulars.html,
    pdf: particulars.pdf,
    file_name: 'particulars-of-claim.pdf',
  });

  const arrears = await generateDocument({
    templatePath: 'uk/england-wales/templates/money_claims/schedule_of_arrears.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Schedule of arrears',
    description: 'Line-by-line arrears schedule required by HMCTS.',
    category: 'schedule',
    html: arrears.html,
    pdf: arrears.pdf,
    file_name: 'schedule-of-arrears.pdf',
  });

  const interest = await generateDocument({
    templatePath: 'uk/england-wales/templates/money_claims/interest_workings.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Interest calculation',
    description: 'Section 69 County Courts Act interest workings and daily rate.',
    category: 'guidance',
    html: interest.html,
    pdf: interest.pdf,
    file_name: 'interest-calculation.pdf',
  });

  const evidence = await generateDocument({
    templatePath: 'uk/england-wales/templates/money_claims/evidence_index.hbs',
    data: baseTemplateData,
    isPreview: false,
    outputFormat: 'both',
  });

  documents.push({
    title: 'Evidence index',
    description: 'Checklist of attachments to staple behind the N1 form.',
    category: 'evidence',
    html: evidence.html,
    pdf: evidence.pdf,
    file_name: 'evidence-index.pdf',
  });

  await assertOfficialFormExists('N1_1224.pdf');
  const n1Pdf = await fillN1Form(buildN1Payload(claim, totals));

  documents.push({
    title: 'Form N1 (official PDF)',
    description: 'Completed claim form ready for County Court Money Claims Centre.',
    category: 'court_form',
    pdf: Buffer.from(n1Pdf),
    file_name: 'n1-claim-form.pdf',
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

export async function generateMoneyClaimPack(claim: MoneyClaimCase): Promise<MoneyClaimPack> {
  if (claim.jurisdiction !== 'england-wales') {
    throw new Error('Money claim pack generation is currently available only for England & Wales.');
  }

  return generateEnglandWalesMoneyClaimPack(claim);
}

