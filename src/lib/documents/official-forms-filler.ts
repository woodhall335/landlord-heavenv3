/**
 * Official HMCTS Court Forms Filler
 *
 * This utility fills official PDF forms from HM Courts & Tribunals Service.
 *
 * CRITICAL: Courts ONLY accept their official forms. We cannot generate custom PDFs
 * that look like court forms. We must use the actual official PDFs and fill them.
 *
 * Official forms are stored in /public/official-forms/
 *
 * Forms handled:
 * - N5: Claim for possession of property
 * - N5B: Claim for possession (accelerated procedure)
 * - N119: Particulars of claim for possession
 * - N1: Claim form (for money claims)
 * - Form 6A: Section 21 notice (prescribed form)
 */

import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export interface CaseData {
  // Landlord details
  landlord_full_name: string;
  landlord_2_name?: string;
  landlord_address: string;
  landlord_postcode?: string;
  landlord_phone?: string;
  landlord_email?: string;
  claimant_reference?: string;

  // Tenant details
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;
  property_postcode?: string;

  // Tenancy details
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';

  // Claim details
  claim_type?: 'section_8' | 'section_21' | 'money_claim';
  ground_numbers?: string;
  section_8_notice_date?: string;
  section_21_notice_date?: string;
  particulars_of_claim?: string;

  // Amounts
  total_arrears?: number;
  total_claim_amount?: number;
  court_fee?: number;
  solicitor_costs?: number;

  // Deposit
  deposit_amount?: number;
  deposit_scheme?: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_protection_date?: string;
  deposit_reference?: string;

  // Solicitor
  solicitor_firm?: string;
  solicitor_address?: string;
  solicitor_reference?: string;
  solicitor_phone?: string;
  solicitor_email?: string;

  // Court
  court_name?: string;
  court_address?: string;

  // Signature
  signatory_name: string;
  signature_date: string;

  // Additional data
  [key: string]: any;
}

/**
 * Load an official PDF form
 */
async function loadOfficialForm(formName: string): Promise<PDFDocument> {
  const formPath = path.join(process.cwd(), 'public', 'official-forms', formName);

  try {
    const pdfBytes = await fs.readFile(formPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc;
  } catch (error) {
    throw new Error(`Failed to load official form "${formName}". Make sure the PDF exists in /public/official-forms/. Error: ${error}`);
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
 * Overlay text onto PDF at specific coordinates
 * (Use this when form fields don't exist - fallback method)
 */
async function overlayText(pdfDoc: PDFDocument, pageIndex: number, text: string, x: number, y: number, size: number = 10): Promise<void> {
  const page = pdfDoc.getPage(pageIndex);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

/**
 * Fill Form N5 - Claim for possession of property
 *
 * This is the standard possession claim form used for both Section 8 and Section 21.
 *
 * Official PDF: /public/official-forms/n5-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/601bc1858fa8f53fc3d799d9/n5-eng.pdf
 */
export async function fillN5Form(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling N5 form (Claim for possession)...');

  const pdfDoc = await loadOfficialForm('n5-eng.pdf');
  const form = pdfDoc.getForm();

  // Log all available fields (helpful for debugging)
  const fields = form.getFields();
  console.log(`Found ${fields.length} form fields in N5:`);
  fields.forEach(field => {
    console.log(`  - ${field.getName()} (${field.constructor.name})`);
  });

  // Fill claimant details
  fillTextField(form, 'claimant_name', data.landlord_full_name);
  fillTextField(form, 'claimant_address', data.landlord_address);
  fillTextField(form, 'claimant_postcode', data.landlord_postcode);
  fillTextField(form, 'claimant_phone', data.landlord_phone);
  fillTextField(form, 'claimant_email', data.landlord_email);
  fillTextField(form, 'claimant_reference', data.claimant_reference);

  // Fill defendant details
  fillTextField(form, 'defendant_name', data.tenant_full_name);
  fillTextField(form, 'defendant_address', data.property_address);

  // Fill property address
  fillTextField(form, 'property_address', data.property_address);

  // Fill court details
  fillTextField(form, 'court_name', data.court_name);
  fillTextField(form, 'court_address', data.court_address);

  // Property type
  checkBox(form, 'property_dwelling', true);

  // Grounds for possession
  if (data.claim_type === 'section_8') {
    checkBox(form, 'ground_section_8', true);
    fillTextField(form, 'ground_numbers', data.ground_numbers);
  }

  if (data.claim_type === 'section_21') {
    checkBox(form, 'ground_section_21', true);
  }

  // Particulars of claim
  fillTextField(form, 'particulars_of_claim', data.particulars_of_claim);

  // Amount claimed
  if (data.total_arrears) {
    fillTextField(form, 'rent_arrears', `£${data.total_arrears.toFixed(2)}`);
  }

  if (data.court_fee) {
    fillTextField(form, 'court_fee', `£${data.court_fee.toFixed(2)}`);
  }

  if (data.solicitor_costs) {
    fillTextField(form, 'solicitor_costs', `£${data.solicitor_costs.toFixed(2)}`);
  }

  // Statement of truth
  fillTextField(form, 'signatory_name', data.signatory_name);
  fillTextField(form, 'solicitor_firm', data.solicitor_firm);
  fillTextField(form, 'signature_date', data.signature_date);

  // Address for documents
  if (data.solicitor_firm) {
    fillTextField(form, 'service_address', data.solicitor_address);
    fillTextField(form, 'service_phone', data.solicitor_phone);
    fillTextField(form, 'service_email', data.solicitor_email);
  } else {
    fillTextField(form, 'service_address', data.landlord_address);
    fillTextField(form, 'service_phone', data.landlord_phone);
    fillTextField(form, 'service_email', data.landlord_email);
  }

  // Flatten form (make non-editable) - OPTIONAL
  // form.flatten();

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N5 form filled successfully');

  return pdfBytes;
}

/**
 * Fill Form N5B - Claim for possession (accelerated procedure)
 *
 * Section 21 ONLY - for no-fault evictions via accelerated procedure.
 *
 * Official PDF: /public/official-forms/n5b-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/5fb39bf98fa8f55de86fb3a3/n5b-eng.pdf
 */
export async function fillN5BForm(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling N5B form (Accelerated possession)...');

  const pdfDoc = await loadOfficialForm('n5b-eng.pdf');
  const form = pdfDoc.getForm();

  // Log all fields
  const fields = form.getFields();
  console.log(`Found ${fields.length} form fields in N5B`);

  // Fill all the N5B fields (similar pattern to N5)
  // The actual field names will be discovered when the PDF is added

  fillTextField(form, 'claimant_name', data.landlord_full_name);
  fillTextField(form, 'defendant_name', data.tenant_full_name);
  fillTextField(form, 'property_address', data.property_address);
  fillTextField(form, 'tenancy_start_date', data.tenancy_start_date);
  fillTextField(form, 'rent_amount', `£${data.rent_amount}`);
  fillTextField(form, 'rent_frequency', data.rent_frequency);

  // Section 21 details
  fillTextField(form, 'section_21_notice_date', data.section_21_notice_date);

  // Deposit protection
  if (data.deposit_amount) {
    fillTextField(form, 'deposit_amount', `£${data.deposit_amount}`);
    fillTextField(form, 'deposit_scheme', data.deposit_scheme);
    fillTextField(form, 'deposit_protection_date', data.deposit_protection_date);
    fillTextField(form, 'deposit_reference', data.deposit_reference);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N5B form filled successfully');

  return pdfBytes;
}

/**
 * Fill Form N119 - Particulars of claim for possession
 *
 * Official PDF: /public/official-forms/n119-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/601bc1f8e90e071292663ea8/n119-eng.pdf
 */
export async function fillN119Form(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling N119 form (Particulars of claim)...');

  const pdfDoc = await loadOfficialForm('n119-eng.pdf');
  const form = pdfDoc.getForm();

  fillTextField(form, 'claimant_name', data.landlord_full_name);
  fillTextField(form, 'defendant_name', data.tenant_full_name);
  fillTextField(form, 'property_address', data.property_address);
  fillTextField(form, 'particulars', data.particulars_of_claim);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N119 form filled successfully');

  return pdfBytes;
}

/**
 * Fill Form N1 - Claim form (for money claims)
 *
 * Official PDF: /public/official-forms/n1-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf
 */
export async function fillN1Form(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling N1 form (Money claim)...');

  const pdfDoc = await loadOfficialForm('n1-eng.pdf');
  const form = pdfDoc.getForm();

  fillTextField(form, 'claimant_name', data.landlord_full_name);
  fillTextField(form, 'claimant_address', data.landlord_address);
  fillTextField(form, 'defendant_name', data.tenant_full_name);
  fillTextField(form, 'defendant_address', data.property_address);
  fillTextField(form, 'court_name', data.court_name);
  fillTextField(form, 'claim_amount', `£${data.total_claim_amount}`);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N1 form filled successfully');

  return pdfBytes;
}

/**
 * Fill Form 6A - Section 21 notice (prescribed form)
 *
 * Official PDF: /public/official-forms/form-6a.pdf
 * Source: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/468937/form_6a.pdf
 */
export async function fillForm6A(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling Form 6A (Section 21 notice)...');

  const pdfDoc = await loadOfficialForm('form-6a.pdf');
  const form = pdfDoc.getForm();

  fillTextField(form, 'landlord_name', data.landlord_full_name);
  fillTextField(form, 'landlord_address', data.landlord_address);
  fillTextField(form, 'tenant_name', data.tenant_full_name);
  fillTextField(form, 'property_address', data.property_address);
  fillTextField(form, 'possession_date', data.section_21_notice_date);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Form 6A filled successfully');

  return pdfBytes;
}

/**
 * Main entry point - fill any official form
 */
export async function fillOfficialForm(formType: 'n5' | 'n5b' | 'n119' | 'n1' | 'form6a', data: CaseData): Promise<Uint8Array> {
  console.log(`\n🏛️  Filling official court form: ${formType.toUpperCase()}`);
  console.log('=' .repeat(60));

  switch (formType) {
    case 'n5':
      return await fillN5Form(data);
    case 'n5b':
      return await fillN5BForm(data);
    case 'n119':
      return await fillN119Form(data);
    case 'n1':
      return await fillN1Form(data);
    case 'form6a':
      return await fillForm6A(data);
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
}

/**
 * Save filled form to file (for testing)
 */
export async function saveFilledForm(pdfBytes: Uint8Array, outputPath: string): Promise<void> {
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`💾 Saved filled form to: ${outputPath}`);
}
