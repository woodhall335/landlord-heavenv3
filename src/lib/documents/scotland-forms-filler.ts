/**
 * Scotland Official Forms Filler
 *
 * This utility fills official Scottish court/tribunal forms.
 *
 * CRITICAL: Scottish Courts & Tribunals only accept their official forms.
 *
 * Official forms are stored in /public/official-forms/scotland/
 *
 * Forms handled:
 * - Notice to Leave (Prescribed form under PRT Act 2016)
 * - Form E: Application for eviction order (First-tier Tribunal)
 * - Simple Procedure Claim Form (Form 3A): Money claims up to £5,000
 */

import { PDFDocument, PDFForm } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export interface ScotlandCaseData {
  // Landlord details
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_phone?: string;
  landlord_email?: string;

  // Tenant details
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  // Tenancy details
  tenancy_start_date: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  payment_day?: number;

  // Notice details
  notice_date: string;
  leaving_date: string; // Date tenant must leave by
  grounds: ScotlandGround[];

  // Deposit
  deposit_amount?: number;
  deposit_scheme?: 'SafeDeposits Scotland' | 'Letting Protection Service Scotland' | 'MyDeposits Scotland';
  deposit_scheme_name?: string;
  deposit_reference?: string;

  // Landlord registration
  landlord_registration_number?: string;

  // Additional data
  [key: string]: any;
}

export interface ScotlandGround {
  code: string; // 'Ground 1', 'Ground 10', etc.
  title: string;
  particulars: string;
  evidence?: string;
}

export interface ScotlandMoneyClaimData {
  // Claimant (Pursuer) details
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_phone?: string;
  landlord_email?: string;

  // Respondent (Defender) details
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  // Court details
  sheriffdom?: string; // e.g., "Lothian and Borders at Edinburgh"
  court_name?: string; // e.g., "Edinburgh Sheriff Court"

  // Claim details
  arrears_total?: number;
  damages_total?: number;
  other_total?: number;
  total_claim_amount: number;

  // Interest
  interest_rate?: number; // Default 8% for Scotland
  interest_to_date?: number;
  daily_interest?: number;
  interest_start_date?: string;

  // Costs
  court_fee?: number;
  solicitor_costs?: number;
  total_with_fees?: number;

  // Tenancy details
  rent_amount?: number;
  rent_frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  payment_day?: number;
  tenancy_start_date?: string;
  tenancy_end_date?: string;

  // Claim narrative
  basis_of_claim?: string; // 'rent_arrears' | 'damages' | 'both'
  particulars_of_claim?: string;
  attempts_to_resolve?: string; // Required in Scotland
  evidence_summary?: string;

  // Statement of truth
  signatory_name?: string;
  signature_date?: string;
  claimant_reference?: string;

  // Additional data
  [key: string]: any;
}

/**
 * Load an official PDF form
 */
async function loadOfficialForm(formName: string): Promise<PDFDocument> {
  const formPath = path.join(process.cwd(), 'public', 'official-forms', 'scotland', formName);

  try {
    const pdfBytes = await fs.readFile(formPath);
    const byteSource = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes as any);
    const pdfDoc = await PDFDocument.load(byteSource);
    return pdfDoc;
  } catch (error) {
    throw new Error(`Failed to load official form "${formName}". Make sure the PDF exists in /public/official-forms/scotland/. Error: ${error}`);
  }
}

/**
 * Fill a PDF form field safely (handles missing fields)
 */
function fillTextField(form: PDFForm, fieldName: string, value: string | undefined): void {
  if (!value) return;

  try {
    const field = form.getTextField(fieldName);
    field.setText(value);
  } catch (error) {
    console.warn(`Field "${fieldName}" not found in form, skipping: ${error}`);
  }
}

/**
 * Check a PDF checkbox safely (handles missing fields)
 */
function checkBox(form: PDFForm, fieldName: string, checked: boolean = true): void {
  if (!checked) return;

  try {
    const field = form.getCheckBox(fieldName);
    field.check();
  } catch (error) {
    console.warn(`Checkbox "${fieldName}" not found in form, skipping: ${error}`);
  }
}

/**
 * Split date string (YYYY-MM-DD) into day, month, year components
 */
function splitDate(dateString: string | undefined): { day: string; month: string; year: string } | null {
  if (!dateString) return null;

  const parts = dateString.split('-');
  if (parts.length === 3) {
    return {
      day: parts[2],
      month: parts[1],
      year: parts[0]
    };
  }

  return null;
}

/**
 * Fill Notice to Leave
 *
 * Official prescribed form under Private Housing (Tenancies) (Scotland) Act 2016
 *
 * Official template: /public/official-forms/scotland/notice_to_leave.pdf
 * Source: https://www.mygov.scot/downloads/
 */
export async function fillNoticeToLeave(data: ScotlandCaseData): Promise<Uint8Array> {
 console.log('📄 Filling Notice to Leave (Scotland)...');

  const pdfDoc = await loadOfficialForm('notice_to_leave.pdf');
  const form = pdfDoc.getForm();

  // Landlord details
  fillTextField(form, 'Landlord Name', data.landlord_full_name);
  fillTextField(form, 'Landlord Address', data.landlord_address);
  fillTextField(form, 'Landlord Postcode', data.landlord_postcode);
  fillTextField(form, 'Landlord Telephone', data.landlord_phone);
  fillTextField(form, 'Landlord Email', data.landlord_email);

  // Landlord registration
  if (data.landlord_registration_number) {
    fillTextField(form, 'Landlord Registration Number', data.landlord_registration_number);
  }

  // Tenant details
  fillTextField(form, 'Tenant Name', data.tenant_full_name);
  if (data.tenant_2_name) {
    fillTextField(form, 'Tenant 2 Name', data.tenant_2_name);
  }

  // Property address
  fillTextField(form, 'Property Address', data.property_address);
  fillTextField(form, 'Property Postcode', data.property_postcode);

  // Tenancy start date
  const tenancyDate = splitDate(data.tenancy_start_date);
  if (tenancyDate) {
    fillTextField(form, 'Tenancy Start Day', tenancyDate.day);
    fillTextField(form, 'Tenancy Start Month', tenancyDate.month);
    fillTextField(form, 'Tenancy Start Year', tenancyDate.year);
  }

  // Notice date
  const noticeDate = splitDate(data.notice_date);
  if (noticeDate) {
    fillTextField(form, 'Notice Date Day', noticeDate.day);
    fillTextField(form, 'Notice Date Month', noticeDate.month);
    fillTextField(form, 'Notice Date Year', noticeDate.year);
  }

  // Leaving date (earliest date tenant must leave)
  const leavingDate = splitDate(data.leaving_date);
  if (leavingDate) {
    fillTextField(form, 'Leaving Date Day', leavingDate.day);
    fillTextField(form, 'Leaving Date Month', leavingDate.month);
    fillTextField(form, 'Leaving Date Year', leavingDate.year);
  }

  // Grounds for eviction
  data.grounds.forEach((ground) => {
    const groundNumber = ground.code.replace('Ground ', '');

    // Check the ground checkbox
    checkBox(form, `Ground ${groundNumber}`, true);

    // Fill in particulars for this ground
    fillTextField(form, `Ground ${groundNumber} Particulars`, ground.particulars);
  });

  // Deposit details
  if (data.deposit_scheme || data.deposit_scheme_name) {
    fillTextField(form, 'Deposit Scheme', data.deposit_scheme_name || data.deposit_scheme);
  }
  fillTextField(form, 'Deposit Reference', data.deposit_reference);

  // Rent details
  fillTextField(form, 'Rent Amount', `£${data.rent_amount}`);
  fillTextField(form, 'Rent Frequency', data.rent_frequency);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Notice to Leave filled successfully');

  return pdfBytes;
}

/**
 * Fill Form E - Application for Eviction Order
 *
 * First-tier Tribunal for Scotland (Housing and Property Chamber)
 *
 * Official form: /public/official-forms/scotland/form_e_eviction.pdf
 * Source: https://www.housingandpropertychamber.scot/
 *
 * FIELD MAPPING (Form E → CaseFacts):
 * ====================================
 * Section 1: Applicant (Landlord) Details
 *   - Applicant Name                → parties.landlord.name
 *   - Applicant Address             → parties.landlord.address_line1 + city + postcode
 *   - Applicant Postcode            → parties.landlord.postcode
 *   - Applicant Telephone           → parties.landlord.phone
 *   - Applicant Email               → parties.landlord.email
 *   - Landlord Registration Number  → landlord_registration_number
 *
 * Section 2: Respondent (Tenant) Details
 *   - Respondent Name               → parties.tenants[0].name
 *   - Respondent 2 Name             → parties.tenants[1].name
 *
 * Section 3: Property Details
 *   - Property Address              → property.address_line1 + city
 *   - Property Postcode             → property.postcode
 *
 * Section 4: Tenancy Details
 *   - Tenancy Start Date            → tenancy.start_date
 *   - Rent Amount                   → tenancy.rent_amount
 *   - Rent Payment Frequency        → tenancy.rent_frequency
 *
 * Section 5: Notice to Leave Details
 *   - Notice to Leave Served Date   → notice.notice_date
 *   - Notice to Leave Expiry Date   → notice.expiry_date (leaving_date)
 *   - Copy of Notice to Leave attached → evidence checkbox
 *
 * Section 6: Grounds for Eviction
 *   - Ground 1-18 checkboxes        → issues.grounds (Scotland grounds)
 *
 * Section 7: Supporting Evidence
 *   - Tenancy agreement attached    → evidence.tenancy_agreement_uploaded
 *   - Copy of Notice attached       → evidence checkbox
 *   - Proof of service attached     → evidence checkbox
 *   - Deposit protection cert       → evidence checkbox
 *   - Deposit Scheme                → tenancy.deposit_scheme_name
 *   - Deposit Reference             → deposit_reference
 *
 * Section 8: Other Information
 *   - Additional Information        → issues.grounds[].particulars (concatenated)
 *
 * Section 9: Declaration
 *   - Applicant Signature           → parties.landlord.name
 *   - Signature Date                → today's date
 *
 * NOTE: All form fields are filled using fillTextField() and checkBox() helpers
 * which gracefully handle missing fields in the PDF.
 */
export async function fillFormE(data: ScotlandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling Form E (Tribunal Application for Eviction Order)...');

  const pdfDoc = await loadOfficialForm('form_e_eviction.pdf');
  const form = pdfDoc.getForm();

  // Section 1: Applicant (Landlord) Details
  fillTextField(form, 'Applicant Name', data.landlord_full_name);
  fillTextField(form, 'Applicant Address', data.landlord_address);
  fillTextField(form, 'Applicant Postcode', data.landlord_postcode);
  fillTextField(form, 'Applicant Telephone', data.landlord_phone);
  fillTextField(form, 'Applicant Email', data.landlord_email);

  // Landlord registration
  if (data.landlord_registration_number) {
    fillTextField(form, 'Landlord Registration Number', data.landlord_registration_number);
  }

  // Section 2: Respondent (Tenant) Details
  fillTextField(form, 'Respondent Name', data.tenant_full_name);
  if (data.tenant_2_name) {
    fillTextField(form, 'Respondent 2 Name', data.tenant_2_name);
  }

  // Section 3: Property Details
  fillTextField(form, 'Property Address', data.property_address);
  fillTextField(form, 'Property Postcode', data.property_postcode);

  // Section 4: Tenancy Details
  const tenancyDate = splitDate(data.tenancy_start_date);
  if (tenancyDate) {
    fillTextField(form, 'Tenancy Start Date', `${tenancyDate.day}/${tenancyDate.month}/${tenancyDate.year}`);
  }

  fillTextField(form, 'Rent Amount', `£${data.rent_amount}`);
  fillTextField(form, 'Rent Payment Frequency', data.rent_frequency);

  // Section 5: Notice to Leave Details
  const noticeDate = splitDate(data.notice_date);
  if (noticeDate) {
    fillTextField(form, 'Notice to Leave Served Date', `${noticeDate.day}/${noticeDate.month}/${noticeDate.year}`);
  }

  // Deposit scheme details
  if (data.deposit_scheme || data.deposit_scheme_name) {
    fillTextField(form, 'Deposit Scheme', data.deposit_scheme_name || data.deposit_scheme);
  }
  fillTextField(form, 'Deposit Reference', data.deposit_reference);

  const leavingDate = splitDate(data.leaving_date);
  if (leavingDate) {
    fillTextField(form, 'Notice to Leave Expiry Date', `${leavingDate.day}/${leavingDate.month}/${leavingDate.year}`);
  }

  // Attach copy of Notice to Leave
  checkBox(form, 'Copy of Notice to Leave attached', true);

  // Section 6: Grounds for Eviction
  data.grounds.forEach((ground) => {
    const groundNumber = ground.code.replace('Ground ', '');
    checkBox(form, `Ground ${groundNumber} claimed`, true);
  });

  // Section 7: Supporting Evidence
  checkBox(form, 'Tenancy agreement attached', true);
  checkBox(form, 'Copy of Notice to Leave attached', true);
  checkBox(form, 'Proof of service attached', true);

  if (data.deposit_amount) {
    checkBox(form, 'Deposit protection certificate attached', true);
    fillTextField(form, 'Deposit Scheme', data.deposit_scheme || '');
    fillTextField(form, 'Deposit Reference', data.deposit_reference || '');
  }

  // Section 8: Other Information
  // Build summary of grounds
  const groundsSummary = data.grounds.map(g =>
    `${g.code}: ${g.title}\n${g.particulars}`
  ).join('\n\n');

  fillTextField(form, 'Additional Information', groundsSummary);

  // Section 9: Declaration
  checkBox(form, 'I confirm the information is correct', true);
  fillTextField(form, 'Applicant Signature', data.landlord_full_name);

  const today = new Date().toISOString().split('T')[0];
  const signatureDate = splitDate(today);
  if (signatureDate) {
    fillTextField(form, 'Signature Date', `${signatureDate.day}/${signatureDate.month}/${signatureDate.year}`);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Form E filled successfully');

  return pdfBytes;
}

/**
 * Fill Simple Procedure Claim Form (Form 3A)
 *
 * Scottish Courts and Tribunals Service form for money claims up to £5,000
 *
 * Official form: /public/official-forms/scotland/simple_procedure_claim_form.pdf
 * Source: https://www.scotcourts.gov.uk/taking-action/simple-procedure
 */
export async function fillSimpleProcedureClaim(data: ScotlandMoneyClaimData): Promise<Uint8Array> {
  console.log('📄 Filling Simple Procedure Claim Form (Form 3A)...');

  const pdfDoc = await loadOfficialForm('simple_procedure_claim_form.pdf');
  const form = pdfDoc.getForm();

  // Court details
  fillTextField(form, '3A_SheriffCourt', data.sheriffdom || data.court_name || 'Edinburgh Sheriff Court');

  // Section 1: Claimant (Pursuer) Details
  fillTextField(form, '3A_Claimant', data.landlord_full_name);

  // Claimant address fields (Section A1 - likely 5 fields for address lines)
  const claimantAddressParts = [
    data.landlord_address,
    '',  // address line 2
    '',  // address line 3
    '',  // city/town
    data.landlord_postcode
  ];
  fillTextField(form, '3A_A1_1', claimantAddressParts[0] || '');
  fillTextField(form, '3A_A1_2', claimantAddressParts[1] || '');
  fillTextField(form, '3A_A1_3', claimantAddressParts[2] || '');
  fillTextField(form, '3A_A1_4', claimantAddressParts[3] || '');
  fillTextField(form, '3A_A1_5', data.landlord_phone || data.landlord_email || '');

  // Section 2: Respondent (Defender) Details
  fillTextField(form, '3A_Respondent', data.tenant_full_name);

  // Respondent address fields (Section B2 - likely 4 fields)
  const respondentAddressParts = [
    data.property_address,
    '',  // address line 2
    '',  // city/town
    data.property_postcode
  ];
  fillTextField(form, '3A_B2_1', respondentAddressParts[0] || '');
  fillTextField(form, '3A_B2_2', respondentAddressParts[1] || '');
  fillTextField(form, '3A_B2_3', respondentAddressParts[2] || '');
  fillTextField(form, '3A_B2_4', respondentAddressParts[3] || '');

  // Section B3: What the claim is about (3 fields for detailed description)
  const claimSummary = data.particulars_of_claim ||
    `Claim for unpaid rent arrears of ${formatCurrency(data.arrears_total || 0)}` +
    (data.damages_total ? ` and property damage costs of ${formatCurrency(data.damages_total)}` : '') +
    ` relating to tenancy at ${data.property_address}.`;

  fillTextField(form, '3A_B3_1', claimSummary.substring(0, 500));

  // Section B3_2: What has happened
  const background = data.basis_of_claim === 'rent_arrears'
    ? `The respondent occupied the property under a tenancy commencing ${data.tenancy_start_date || 'on or about'} with rent of ${formatCurrency(data.rent_amount || 0)} per ${data.rent_frequency || 'month'}. The respondent failed to pay rent as agreed, resulting in arrears.`
    : data.basis_of_claim === 'damages'
    ? `The respondent caused damage to the property beyond normal wear and tear. The claimant seeks recovery of repair costs.`
    : `The respondent occupied the property under a tenancy and has failed to pay rent as agreed, and has also caused damage to the property.`;

  fillTextField(form, '3A_B3_2', background.substring(0, 1000));

  // Section B3_3: What have you done to try to resolve
  const attempts = data.attempts_to_resolve ||
    'The claimant sent written demands for payment but the respondent failed to make payment or engage to resolve the debt.';

  fillTextField(form, '3A_B3_3', attempts.substring(0, 500));

  // Section B4: Financial details (amounts claimed)
  fillTextField(form, '3A_B4_1', formatCurrency(data.total_claim_amount));

  // Breakdown in B4 fields
  if (data.arrears_total) {
    fillTextField(form, '3A_B4_2', `Arrears: ${formatCurrency(data.arrears_total)}`);
  }
  if (data.damages_total) {
    fillTextField(form, '3A_B4_3', `Damages: ${formatCurrency(data.damages_total)}`);
  }

  // Interest details
  if (data.interest_to_date && data.interest_to_date > 0) {
    fillTextField(form, '3A_B4_4', `Interest: ${formatCurrency(data.interest_to_date)} at ${data.interest_rate || 8}% per annum from ${data.interest_start_date || 'date of claim'}`);
  }

  // Court fee and total
  if (data.court_fee) {
    fillTextField(form, '3A_B4_5', `Court fee: ${formatCurrency(data.court_fee)}`);
  }

  // Section B5: Total amount (RadioGroup field - skip for now, value shown in B4 fields)
  // Note: B5 is a RadioGroup, not a text field. Total is captured in B4 breakdown.

  // Section E: Attachments checklist (using CheckBox fields)
  // CheckBox1-6 likely represent different attachment types
  checkBox(form, 'CheckBox1', true);  // Particulars of claim
  checkBox(form, 'CheckBox2', !!data.arrears_total);  // Schedule of arrears
  checkBox(form, 'CheckBox3', true);  // Evidence list
  checkBox(form, 'CheckBox4', true);  // Tenancy agreement
  // CheckBox5 and CheckBox6 available for other attachments

  // Section D/F: Statement of truth and signature
  // Note: D1 and F1 are RadioGroups. Signature name might be in a different field.
  // Text1 field might be for signatory name
  fillTextField(form, 'Text1', data.signatory_name || data.landlord_full_name);

  // Date fields: Text2/3/4 appear to have constraints, use alternative Text fields if available
  // Using Text22/23/24 for date components as they're standard text fields
  const sigDate = splitDate(data.signature_date || new Date().toISOString().split('T')[0]);
  if (sigDate) {
    fillTextField(form, 'Text22', sigDate.day);
    fillTextField(form, 'Text23', sigDate.month);
    fillTextField(form, 'Text24', sigDate.year);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Simple Procedure Claim Form filled successfully');

  return pdfBytes;
}

/**
 * Helper to format currency for PDF fields
 */
function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '£0.00';
  return `£${amount.toFixed(2)}`;
}

/**
 * Main entry point - fill any Scotland official form
 */
export async function fillScotlandOfficialForm(
  formType: 'notice_to_leave' | 'form_e' | 'simple_procedure_claim',
  data: ScotlandCaseData | ScotlandMoneyClaimData
): Promise<Uint8Array> {
  console.log(`\n🏴󠁧󠁢󠁳󠁣󠁴󠁿  Filling Scotland official form: ${formType.toUpperCase()}`);
  console.log('=' .repeat(60));

  switch (formType) {
    case 'notice_to_leave':
      return await fillNoticeToLeave(data as ScotlandCaseData);
    case 'form_e':
      return await fillFormE(data as ScotlandCaseData);
    case 'simple_procedure_claim':
      return await fillSimpleProcedureClaim(data as ScotlandMoneyClaimData);
    default:
      throw new Error(`Unknown Scotland form type: ${formType}`);
  }
}

/**
 * Save filled form to file (for testing)
 */
export async function saveFilledForm(pdfBytes: Uint8Array, outputPath: string): Promise<void> {
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`💾 Saved filled form to: ${outputPath}`);
}
