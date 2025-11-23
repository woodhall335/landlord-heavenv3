/**
 * Northern Ireland Official Forms Filler
 *
 * This utility fills official Northern Ireland court forms.
 *
 * CRITICAL: Northern Ireland Courts only accept their official forms.
 *
 * Official forms are stored in /public/official-forms/northern-ireland/
 *
 * Forms handled:
 * - Notice to Quit (Common law notice)
 * - Notice of Intention to Seek Possession (PT(NI) Order 2006)
 * - County Court Claim for Possession
 */

import { PDFDocument, PDFForm, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export interface NorthernIrelandCaseData {
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
  tenancy_type: 'weekly' | 'monthly' | 'fixed_term';
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  payment_day?: number;

  // Notice details
  notice_to_quit_date: string;
  notice_to_quit_expiry_date: string;
  notice_of_intention_date: string;
  grounds: NorthernIrelandGround[];

  // Arrears (if applicable)
  current_arrears?: number;
  arrears_breakdown?: Array<{
    period: string;
    amount_due: number;
    amount_paid: number;
    balance: number;
  }>;

  // Deposit
  deposit_amount?: number;
  deposit_scheme?: 'TDS NI';
  deposit_reference?: string;

  // Court details
  court_name?: string;
  court_address?: string;

  // Signature
  signatory_name: string;
  signature_date: string;

  // Additional data
  [key: string]: any;
}

export interface NorthernIrelandGround {
  code: string; // 'Ground 1', 'Ground 8', 'Ground 10', etc.
  type: 'mandatory' | 'discretionary';
  title: string;
  particulars: string;
  evidence?: string;
}

/**
 * Load an official PDF form
 */
async function loadOfficialForm(formName: string): Promise<PDFDocument> {
  const formPath = path.join(process.cwd(), 'public', 'official-forms', 'northern-ireland', formName);

  try {
    const pdfBytes = await fs.readFile(formPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc;
  } catch (error) {
    throw new Error(`Failed to load official form "${formName}". Make sure the PDF exists in /public/official-forms/northern-ireland/. Error: ${error}`);
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
    console.warn(`Field "${fieldName}" not found in form, skipping`);
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
    console.warn(`Checkbox "${fieldName}" not found in form, skipping`);
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
 * Fill Notice to Quit
 *
 * Common law notice to terminate tenancy in Northern Ireland
 *
 * Official template: /public/official-forms/northern-ireland/notice_to_quit.pdf
 */
export async function fillNoticeToQuit(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling Notice to Quit (Northern Ireland)...');

  const pdfDoc = await loadOfficialForm('notice_to_quit.pdf');
  const form = pdfDoc.getForm();

  // TO: Tenant details
  fillTextField(form, 'Tenant Name', data.tenant_full_name);
  if (data.tenant_2_name) {
    fillTextField(form, 'Tenant 2 Name', data.tenant_2_name);
  }
  fillTextField(form, 'Tenant Address', data.property_address);

  // FROM: Landlord details
  fillTextField(form, 'Landlord Name', data.landlord_full_name);
  fillTextField(form, 'Landlord Address', data.landlord_address);

  // Property address
  fillTextField(form, 'Property Address', data.property_address);

  // Notice date
  const noticeDate = splitDate(data.notice_to_quit_date);
  if (noticeDate) {
    fillTextField(form, 'Notice Date Day', noticeDate.day);
    fillTextField(form, 'Notice Date Month', noticeDate.month);
    fillTextField(form, 'Notice Date Year', noticeDate.year);
  }

  // Expiry date
  const expiryDate = splitDate(data.notice_to_quit_expiry_date);
  if (expiryDate) {
    fillTextField(form, 'Expiry Date Day', expiryDate.day);
    fillTextField(form, 'Expiry Date Month', expiryDate.month);
    fillTextField(form, 'Expiry Date Year', expiryDate.year);
  }

  // Tenancy type
  if (data.tenancy_type === 'weekly') {
    checkBox(form, 'Weekly Tenancy', true);
  } else if (data.tenancy_type === 'monthly') {
    checkBox(form, 'Monthly Tenancy', true);
  }

  // Signature
  fillTextField(form, 'Landlord Signature', data.signatory_name);

  const signatureDate = splitDate(data.signature_date);
  if (signatureDate) {
    fillTextField(form, 'Signature Date', `${signatureDate.day}/${signatureDate.month}/${signatureDate.year}`);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Notice to Quit filled successfully');

  return pdfBytes;
}

/**
 * Fill Notice of Intention to Seek Possession
 *
 * Statutory notice under Private Tenancies (NI) Order 2006
 *
 * Official template: /public/official-forms/northern-ireland/notice_of_intention.pdf
 */
export async function fillNoticeOfIntention(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling Notice of Intention to Seek Possession (Northern Ireland)...');

  const pdfDoc = await loadOfficialForm('notice_of_intention.pdf');
  const form = pdfDoc.getForm();

  // TO: Tenant details
  fillTextField(form, 'Tenant Name', data.tenant_full_name);
  if (data.tenant_2_name) {
    fillTextField(form, 'Tenant 2 Name', data.tenant_2_name);
  }
  fillTextField(form, 'Property Address', data.property_address);

  // FROM: Landlord details
  fillTextField(form, 'Landlord Name', data.landlord_full_name);
  fillTextField(form, 'Landlord Address', data.landlord_address);
  fillTextField(form, 'Landlord Phone', data.landlord_phone);

  // Notice date
  const noticeDate = splitDate(data.notice_of_intention_date);
  if (noticeDate) {
    fillTextField(form, 'Notice Date', `${noticeDate.day}/${noticeDate.month}/${noticeDate.year}`);
  }

  // Grounds for possession
  let hasMandatoryGround = false;
  let hasDiscretionaryGround = false;

  data.grounds.forEach((ground) => {
    const groundNumber = ground.code.replace('Ground ', '');

    // Check the ground checkbox
    checkBox(form, `Ground ${groundNumber}`, true);

    // Track mandatory vs discretionary
    if (ground.type === 'mandatory') {
      hasMandatoryGround = true;
    } else {
      hasDiscretionaryGround = true;
    }

    // Fill particulars
    fillTextField(form, `Ground ${groundNumber} Particulars`, ground.particulars);
  });

  // Indicate type of grounds
  if (hasMandatoryGround) {
    checkBox(form, 'Mandatory Grounds Claimed', true);
  }
  if (hasDiscretionaryGround) {
    checkBox(form, 'Discretionary Grounds Claimed', true);
  }

  // Notice period
  const hasGroundRequiring14Days = data.grounds.some(g =>
    g.code === 'Ground 8' || g.code === 'Ground 14' || g.code === 'Ground 17'
  );

  if (hasGroundRequiring14Days) {
    fillTextField(form, 'Notice Period', '14 days');
  } else {
    fillTextField(form, 'Notice Period', '28 days');
  }

  // Signature
  fillTextField(form, 'Landlord Signature', data.signatory_name);

  const signatureDate = splitDate(data.signature_date);
  if (signatureDate) {
    fillTextField(form, 'Signature Date', `${signatureDate.day}/${signatureDate.month}/${signatureDate.year}`);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Notice of Intention filled successfully');

  return pdfBytes;
}

/**
 * Fill County Court Claim for Possession
 *
 * Official court claim form for Northern Ireland County Courts
 *
 * Official form: /public/official-forms/northern-ireland/claim_for_possession.pdf
 */
export async function fillClaimForPossession(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling County Court Claim for Possession (Northern Ireland)...');

  const pdfDoc = await loadOfficialForm('claim_for_possession.pdf');
  const form = pdfDoc.getForm();

  // Court details
  fillTextField(form, 'Court Name', data.court_name || 'County Court');
  fillTextField(form, 'Court Address', data.court_address || '');

  // Claimant (Landlord) details
  fillTextField(form, 'Claimant Name', data.landlord_full_name);
  if (data.landlord_2_name) {
    fillTextField(form, 'Claimant 2 Name', data.landlord_2_name);
  }
  fillTextField(form, 'Claimant Address', data.landlord_address);
  fillTextField(form, 'Claimant Postcode', data.landlord_postcode);
  fillTextField(form, 'Claimant Phone', data.landlord_phone);
  fillTextField(form, 'Claimant Email', data.landlord_email);

  // Defendant (Tenant) details
  fillTextField(form, 'Defendant Name', data.tenant_full_name);
  if (data.tenant_2_name) {
    fillTextField(form, 'Defendant 2 Name', data.tenant_2_name);
  }
  fillTextField(form, 'Defendant Address', data.property_address);
  fillTextField(form, 'Defendant Postcode', data.property_postcode);

  // Property details
  fillTextField(form, 'Property Address', data.property_address);

  // Claim details
  checkBox(form, 'Claim for Possession', true);

  if (data.current_arrears && data.current_arrears > 0) {
    checkBox(form, 'Claim for Rent Arrears', true);
    fillTextField(form, 'Arrears Amount', `£${data.current_arrears.toFixed(2)}`);
  }

  // Grounds
  data.grounds.forEach((ground) => {
    const groundNumber = ground.code.replace('Ground ', '');
    checkBox(form, `Ground ${groundNumber} Claimed`, true);
  });

  // Notices served
  const noticeToQuitDate = splitDate(data.notice_to_quit_date);
  if (noticeToQuitDate) {
    fillTextField(form, 'Notice to Quit Date', `${noticeToQuitDate.day}/${noticeToQuitDate.month}/${noticeToQuitDate.year}`);
  }

  const noticeOfIntentionDate = splitDate(data.notice_of_intention_date);
  if (noticeOfIntentionDate) {
    fillTextField(form, 'Notice of Intention Date', `${noticeOfIntentionDate.day}/${noticeOfIntentionDate.month}/${noticeOfIntentionDate.year}`);
  }

  checkBox(form, 'Notice to Quit served', true);
  checkBox(form, 'Notice of Intention served', true);

  // Particulars of Claim
  const particulars = data.grounds.map(g =>
    `${g.code} - ${g.title}\n${g.particulars}`
  ).join('\n\n');

  fillTextField(form, 'Particulars of Claim', particulars);

  // Deposit protection
  if (data.deposit_amount) {
    checkBox(form, 'Deposit Protected', true);
    fillTextField(form, 'Deposit Scheme', data.deposit_scheme || '');
    fillTextField(form, 'Deposit Amount', `£${data.deposit_amount.toFixed(2)}`);
  }

  // Statement of Truth
  checkBox(form, 'I believe the facts stated in this claim are true', true);
  fillTextField(form, 'Statement of Truth Signature', data.signatory_name);

  const signatureDate = splitDate(data.signature_date);
  if (signatureDate) {
    fillTextField(form, 'Statement Date Day', signatureDate.day);
    fillTextField(form, 'Statement Date Month', signatureDate.month);
    fillTextField(form, 'Statement Date Year', signatureDate.year);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ County Court Claim for Possession filled successfully');

  return pdfBytes;
}

/**
 * Main entry point - fill any Northern Ireland official form
 */
export async function fillNorthernIrelandOfficialForm(
  formType: 'notice_to_quit' | 'notice_of_intention' | 'claim_for_possession',
  data: NorthernIrelandCaseData
): Promise<Uint8Array> {
  console.log(`\n🇬🇧  Filling Northern Ireland official form: ${formType.toUpperCase()}`);
  console.log('=' .repeat(60));

  switch (formType) {
    case 'notice_to_quit':
      return await fillNoticeToQuit(data);
    case 'notice_of_intention':
      return await fillNoticeOfIntention(data);
    case 'claim_for_possession':
      return await fillClaimForPossession(data);
    default:
      throw new Error(`Unknown Northern Ireland form type: ${formType}`);
  }
}

/**
 * Save filled form to file (for testing)
 */
export async function saveFilledForm(pdfBytes: Uint8Array, outputPath: string): Promise<void> {
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`💾 Saved filled form to: ${outputPath}`);
}
