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
 */

import { PDFDocument, PDFForm, rgb, StandardFonts } from 'pdf-lib';
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
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
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
  data.grounds.forEach((ground, index) => {
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
 * Main entry point - fill any Scotland official form
 */
export async function fillScotlandOfficialForm(
  formType: 'notice_to_leave' | 'form_e',
  data: ScotlandCaseData
): Promise<Uint8Array> {
  console.log(`\n🏴󠁧󠁢󠁳󠁣󠁴󠁿  Filling Scotland official form: ${formType.toUpperCase()}`);
  console.log('=' .repeat(60));

  switch (formType) {
    case 'notice_to_leave':
      return await fillNoticeToLeave(data);
    case 'form_e':
      return await fillFormE(data);
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
