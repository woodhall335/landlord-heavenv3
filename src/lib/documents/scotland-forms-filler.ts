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
    const pdfDoc = await PDFDocument.load(pdfBytes);
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

  const pdfDoc = await loadOfficialForm('scotland/notice_to_leave.pdf');
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
 */
export async function fillFormE(data: ScotlandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling Form E (Tribunal Application for Eviction Order)...');

  const pdfDoc = await loadOfficialForm('scotland/form_e_eviction.pdf');
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
  fillTextField(form, 'Sheriff Court', data.sheriffdom || data.court_name || 'Edinburgh Sheriff Court');

  // Section 1: Claimant (Pursuer) Details
  fillTextField(form, 'Claimant Name', data.landlord_full_name);

  // Build full claimant address
  const claimantAddress = [
    data.landlord_address,
    data.landlord_postcode
  ].filter(Boolean).join('\n');
  fillTextField(form, 'Claimant Address', claimantAddress);

  fillTextField(form, 'Claimant Phone', data.landlord_phone || '');
  fillTextField(form, 'Claimant Email', data.landlord_email || '');
  fillTextField(form, 'Claimant Reference', data.claimant_reference || '');

  // Section 2: Respondent (Defender) Details
  fillTextField(form, 'Respondent Name', data.tenant_full_name);

  // Build full respondent address (property address for tenant claims)
  const respondentAddress = [
    data.property_address,
    data.property_postcode
  ].filter(Boolean).join('\n');
  fillTextField(form, 'Respondent Address', respondentAddress);

  // Section 3: What the claim is about
  const claimSummary = data.particulars_of_claim ||
    `Claim for unpaid rent arrears of ${formatCurrency(data.arrears_total || 0)}` +
    (data.damages_total ? ` and property damage costs of ${formatCurrency(data.damages_total)}` : '') +
    ` relating to tenancy at ${data.property_address}.`;

  fillTextField(form, 'What is your claim about', claimSummary.substring(0, 500)); // Limit length

  // Section 4: What has happened
  const background = data.basis_of_claim === 'rent_arrears'
    ? `The respondent occupied the property under a tenancy commencing ${data.tenancy_start_date || 'on or about'} with rent of ${formatCurrency(data.rent_amount || 0)} per ${data.rent_frequency || 'month'}. The respondent failed to pay rent as agreed, resulting in arrears.`
    : data.basis_of_claim === 'damages'
    ? `The respondent caused damage to the property beyond normal wear and tear. The claimant seeks recovery of repair costs.`
    : `The respondent occupied the property under a tenancy and has failed to pay rent as agreed, and has also caused damage to the property.`;

  fillTextField(form, 'What has happened', background.substring(0, 1000));

  // Section 5: What have you done to try to resolve the dispute
  const attempts = data.attempts_to_resolve ||
    'The claimant sent written demands for payment but the respondent failed to make payment or engage to resolve the debt.';

  fillTextField(form, 'What you have done to resolve', attempts.substring(0, 500));

  // Section 6: What do you want the respondent to do
  fillTextField(form, 'What you want',
    `Pay the sum of ${formatCurrency(data.total_claim_amount)} plus interest and expenses.`
  );

  // Section 7: How much are you claiming
  fillTextField(form, 'Amount claimed', formatCurrency(data.total_claim_amount));

  // Breakdown
  if (data.arrears_total) {
    fillTextField(form, 'Amount claimed - arrears', formatCurrency(data.arrears_total));
  }
  if (data.damages_total) {
    fillTextField(form, 'Amount claimed - damages', formatCurrency(data.damages_total));
  }
  if (data.other_total) {
    fillTextField(form, 'Amount claimed - other', formatCurrency(data.other_total));
  }

  // Interest
  if (data.interest_to_date && data.interest_to_date > 0) {
    fillTextField(form, 'Interest claimed', formatCurrency(data.interest_to_date));
    fillTextField(form, 'Interest rate', `${data.interest_rate || 8}% per annum`);
    fillTextField(form, 'Interest from date', data.interest_start_date || '');
  }

  // Court fee
  if (data.court_fee) {
    fillTextField(form, 'Court fee', formatCurrency(data.court_fee));
  }

  // Total
  const totalWithFees = data.total_with_fees ||
    (data.total_claim_amount + (data.interest_to_date || 0) + (data.court_fee || 0) + (data.solicitor_costs || 0));
  fillTextField(form, 'Total amount claimed', formatCurrency(totalWithFees));

  // Section 8: Attachments checklist
  checkBox(form, 'Attached - particulars of claim', true);
  checkBox(form, 'Attached - schedule of arrears', !!data.arrears_total);
  checkBox(form, 'Attached - evidence list', true);
  checkBox(form, 'Attached - tenancy agreement', true);

  // Section 9: Statement of truth
  fillTextField(form, 'Statement signatory', data.signatory_name || data.landlord_full_name);

  const sigDate = splitDate(data.signature_date || new Date().toISOString().split('T')[0]);
  if (sigDate) {
    fillTextField(form, 'Signature day', sigDate.day);
    fillTextField(form, 'Signature month', sigDate.month);
    fillTextField(form, 'Signature year', sigDate.year);
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
