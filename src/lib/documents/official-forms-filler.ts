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
 *
 * FIELD INVENTORY (as of 2024):
 * - N5: 13 text fields, 0 checkboxes
 * - N5B: 128 text fields, 118 checkboxes
 * - N119: 17 text fields, 0 checkboxes
 */

import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const OFFICIAL_FORMS_ROOT = path.join(process.cwd(), 'public', 'official-forms');

// =============================================================================
// FIELD NAME CONSTANTS - Authoritative field names from PDF inventory
// =============================================================================

/**
 * N5 form field names (13 fields total)
 * Source: public/official-forms/n5-eng.pdf
 */
const N5_FIELDS = {
  // Note: Uses curly apostrophe (') not straight (')
  COURT: 'In the court',
  CLAIMANT_DETAILS: "claimant’s details", // curly apostrophe U+2019
  DEFENDANT_DETAILS: "defendant’s details", // curly apostrophe U+2019
  POSSESSION_OF: 'possession of',
  FEE_ACCOUNT: 'Fee account no',
  SIGNATORY_NAME: 'Full name of the person signing the Statement of Truth',
  SOLICITOR_FIRM: "Name of claimant's legal representative's firm",
  ADDRESS_BUILDING: "building and street - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_LINE2: "Second line of address - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_TOWN: "Town or city - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_COUNTY: "County (optional) - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_POSTCODE: "Postcode - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  STATEMENT_SIGNED_BY_REP: "Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))",
} as const;

/**
 * N5B form field names (subset - key fields only)
 * Source: public/official-forms/n5b-eng.pdf
 */
const N5B_FIELDS = {
  // Header
  CLAIMANTS_NAMES: 'Enter the full names of the Claimants',
  DEFENDANTS_NAMES: 'Enter the full names of the Defendants',
  COURT_NAME_ADDRESS: 'Name and address of the court',
  CLAIMING_POSSESSION_OF: 'The Claimant is claiming possession of',
  // Fees
  COURT_FEE: 'Court fee',
  LEGAL_COSTS: 'Legal representatives costs',
  TOTAL_AMOUNT: 'Total amount',
  // First Claimant
  FIRST_CLAIMANT_FIRST_NAMES: "First Claimant's first names",
  FIRST_CLAIMANT_LAST_NAME: "First Claimant's last name",
  FIRST_CLAIMANT_ADDRESS_STREET: "First Claimant's address: building and street",
  FIRST_CLAIMANT_ADDRESS_LINE2: "First Claimant's address: second line of address",
  FIRST_CLAIMANT_ADDRESS_TOWN: "First Claimant's address: town or city",
  FIRST_CLAIMANT_ADDRESS_POSTCODE: "First Claimant's address: postcode",
  // Second Claimant
  SECOND_CLAIMANT_FIRST_NAMES: "Second Claimant's first names",
  SECOND_CLAIMANT_LAST_NAME: "Second Claimant's last name",
  // First Defendant
  FIRST_DEFENDANT_FIRST_NAMES: "First Defendant's first name(s)",
  FIRST_DEFENDANT_LAST_NAME: "First Defendant's last name",
  FIRST_DEFENDANT_ADDRESS_STREET: "First Defendant's address: building and street",
  FIRST_DEFENDANT_ADDRESS_LINE2: "First Defendant's address: second line of address",
  FIRST_DEFENDANT_ADDRESS_TOWN: "First Defendant's address: town or city",
  FIRST_DEFENDANT_ADDRESS_POSTCODE: "First Defendant's address: postcode",
  // Second Defendant
  SECOND_DEFENDANT_FIRST_NAMES: "Second Defendant's first names",
  SECOND_DEFENDANT_LAST_NAME: "Second Defendant's last name",
  SECOND_DEFENDANT_ADDRESS_STREET: "Second Defendant's address: building and street",
  SECOND_DEFENDANT_ADDRESS_LINE2: "Second Defendant's address: second line of address",
  SECOND_DEFENDANT_ADDRESS_TOWN: "Second Defendant's address: town or city",
  SECOND_DEFENDANT_ADDRESS_POSTCODE: "Second Defendant's address: postcode",
  // Possession address
  POSSESSION_STREET: 'Claimant seeks an order that the Defendant gives possession of: building and street',
  POSSESSION_LINE2: 'Claimant seeks an order that the Defendant gives possession of: second line of address',
  POSSESSION_TOWN: 'Claimant seeks an order that the Defendant gives possession of: town or city',
  POSSESSION_POSTCODE: 'Claimant seeks an order that the Defendant gives possession of: postcode',
  // Tenancy dates
  TENANCY_LET_DATE_DAY: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Day',
  TENANCY_LET_DATE_MONTH: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Month',
  TENANCY_LET_DATE_YEAR: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Year',
  TENANCY_AGREEMENT_DATE_DAY: '7. The tenancy agreement is dated. Day',
  TENANCY_AGREEMENT_DATE_MONTH: '7. The tenancy agreement is dated. Month',
  TENANCY_AGREEMENT_DATE_YEAR: '7. The tenancy agreement is dated. Year',
  // Notice service
  NOTICE_SERVICE_METHOD: '10a How was the notice served',
  NOTICE_SERVED_DATE_DAY: '10b. On what date was the notice served? Day',
  NOTICE_SERVED_DATE_MONTH: '10b. On what date was the notice served? Month',
  NOTICE_SERVED_DATE_YEAR: '10b. On what date was the notice served? Year',
  NOTICE_SERVED_BY: '10c Who served the notice',
  NOTICE_SERVED_ON: '10d Who was the notice served on',
  NOTICE_EXPIRY_DATE_DAY: '10e. After what date did the notice require the Defendant to leave the property? Day',
  NOTICE_EXPIRY_DATE_MONTH: '10e. After what date did the notice require the Defendant to leave the property? Month',
  NOTICE_EXPIRY_DATE_YEAR: '10e. After what date did the notice require the Defendant to leave the property? Year',
  // Deposit
  DEPOSIT_INFO_DATE_DAY: '14b. On what date was the prescribed information given? Day',
  DEPOSIT_INFO_DATE_MONTH: '14b. On what date was the prescribed information given? Month',
  DEPOSIT_INFO_DATE_YEAR: '14b. On what date was the prescribed information given? Year',
  // Statement of Truth
  STATEMENT_SIGNATURE: 'Statement of Truth signature',
  STATEMENT_SIGNATORY_NAME: 'Full name of the person signing the Statement of Truth',
  STATEMENT_DATE_DAY: 'Date the Statement of Truth is signed - Day',
  STATEMENT_DATE_MONTH: 'Date the Statement of Truth is signed - Month',
  STATEMENT_DATE_YEAR: 'Date the Statement of Truth is signed - Year',
  SOLICITOR_FIRM: 'Name of Claimants legal representatives firm',
  // Service address
  SERVICE_ADDRESS_STREET: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Building and street",
  SERVICE_ADDRESS_LINE2: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Second line of address",
  SERVICE_ADDRESS_TOWN: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Town or city",
  SERVICE_ADDRESS_POSTCODE: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Postcode",
  // Contact
  PHONE: 'If applicable, phone number',
  EMAIL: 'If applicable, email',
  DX: 'If applicable, DX number',
  REFERENCE: 'If applicable, reference number',
} as const;

/**
 * N5B checkbox field names (key fields only)
 */
const N5B_CHECKBOXES = {
  // Q3 - Costs
  COSTS_YES: '3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - Yes',
  COSTS_NO: '3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - No',
  // Q5 - Dwelling house
  DWELLING_YES: '5. Is the property a dwelling house or part of a dwelling house? Yes',
  DWELLING_NO: '5. Is the property a dwelling house or part of a dwelling house? No',
  // Q8 - Subsequent tenancy
  SUBSEQUENT_TENANCY_YES: '8. Has any subsequent written tenancy agreement been entered into? Yes',
  SUBSEQUENT_TENANCY_NO: '8. Has any subsequent written tenancy agreement been entered into? No',
  // Q12 - Deposit
  DEPOSIT_PAID_YES: '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? Yes',
  DEPOSIT_PAID_NO: '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? No',
  // Q13 - Deposit returned
  DEPOSIT_RETURNED_YES: '13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? Yes',
  DEPOSIT_RETURNED_NO: '13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? No',
  // Q14a - Prescribed info
  PRESCRIBED_INFO_YES: '14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? Yes',
  PRESCRIBED_INFO_NO: '14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? No',
  // Q21 - Orders
  ORDER_POSSESSION: '21. The Claimant asks the court to order that the Defendant delivers up possession of the property',
  ORDER_COSTS: '21. The Claimant asks the court to order that the Defendant pays the costs of this claim',
  // Statement of Truth
  SOT_CLAIMANT: 'Statement of Truth is signed by: Claimant',
  SOT_LEGAL_REP: "Statement of Truth is signed by: Claimant's legal representative (as defined by CPR 2.3(1))",
  SOT_BELIEVES: 'I believe that the facts stated in this claim form and any attached sheets are true',
  SOT_AUTHORISED: "The Claimant(s) believe(s) that the facts stated in this claim form and any attached sheets are true. I am authorised by the Claimant(s) to sign this statement",
  // England location
  ENGLAND_YES: 'Is the property you are claiming possession of located wholly or partly in England? Yes',
  ENGLAND_NO: 'Is the property you are claiming possession of located wholly or partly in England? No',
  // Attachments
  ATTACHMENT_TENANCY: 'Copy of the first written tenancy agreement marked A',
  ATTACHMENT_NOTICE: 'Copy of the notice saying that possession was required marked B',
  ATTACHMENT_SERVICE_PROOF: 'Proof of service of the notice requiring possession marked B1',
  ATTACHMENT_DEPOSIT_CERT: 'Copy of the Tenancy Deposit Certificate marked E',
  ATTACHMENT_EPC: 'Copy of the Energy Performance Certificate marked F',
  ATTACHMENT_GAS: 'Copy of the Gas Safety Records marked G G1 G2 etc',
} as const;

/**
 * N119 form field names (17 fields total, ALL are text fields)
 * Source: public/official-forms/n119-eng.pdf
 */
const N119_FIELDS = {
  COURT: 'name of court',
  CLAIMANT: 'name of claimant',
  DEFENDANT: 'name of defendant',
  POSSESSION_OF: 'The claimant has a right to possession of:',
  OCCUPANTS: "To the best of the claimant's knowledge the following persons are in possession of the property:",
  TENANCY_TYPE: '3(a) Type of tenancy',
  TENANCY_DATE: '3(a) Date of tenancy',
  RENT: '3(b) The current rent is',
  REASON: '4. (a) The reason the claimant is asking for possession is:',
  NOTICE_DATE_DAY_MONTH: '6. Day and month notice served',
  NOTICE_DATE_YEAR: '6. Year notice served',
  CLAIMANT_TYPE_OTHER: '13. The claimant is - other',  // Text field, NOT checkbox!
  CLAIMANT_TYPE_DETAILS: '13. Details if the claimant is some other entity',
  SOT_BELIEVES: 'I believe that the facts stated in these particulars of claim are true',  // Text field!
  SOT_AUTHORISED: 'The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement',  // Text field!
  SOT_SIGNED_BY_REP: "Statement of Truth signed by Claimant's legal representative (as defined by CPR 2.3(1))",  // Text field!
  SOLICITOR_FIRM: "Name of claimant's legal representative's firm",
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

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
  tenancy_type?: string;  // e.g. "Assured Shorthold Tenancy"
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

  // Claim details
  claim_type?: 'section_8' | 'section_21' | 'money_claim';
  ground_numbers?: string;
  ground_codes?: string[];
  section_8_notice_date?: string;
  section_21_notice_date?: string;
  notice_served_date?: string;
  notice_service_method?: string;  // REQUIRED for N5B: e.g. "First class post", "By hand"
  notice_expiry_date?: string;
  particulars_of_claim?: string;

  // Amounts
  total_arrears?: number;
  arrears_at_notice_date?: number;
  total_claim_amount?: number;
  court_fee?: number;
  solicitor_costs?: number;

  // Deposit
  deposit_amount?: number;
  deposit_scheme?: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_protection_date?: string;
  deposit_reference?: string;
  deposit_prescribed_info_given?: boolean;
  deposit_returned?: boolean;

  // Compliance
  epc_provided?: boolean;
  gas_safety_provided?: boolean;
  how_to_rent_provided?: boolean;
  subsequent_tenancy?: boolean;

  // Evidence uploads - used for N5B attachment checkboxes
  // Only tick attachment boxes if user has actually uploaded/indicated they have the document
  tenancy_agreement_uploaded?: boolean;
  notice_copy_available?: boolean;
  service_proof_available?: boolean;

  // P0-2: Upload-based attachment flags for N5B checkboxes E, F, G
  // CRITICAL: These must be based on ACTUAL file uploads, NOT compliance flags.
  // Ticking these boxes falsely is a false statement on a court form.
  deposit_certificate_uploaded?: boolean;  // Checkbox E - deposit protection cert uploaded
  epc_uploaded?: boolean;                   // Checkbox F - EPC uploaded
  gas_safety_uploaded?: boolean;            // Checkbox G - gas safety cert uploaded

  // Solicitor
  solicitor_firm?: string;
  solicitor_address?: string;
  solicitor_reference?: string;
  solicitor_phone?: string;
  solicitor_email?: string;
  dx_number?: string;

  // Service contact (address for service)
  service_address_line1?: string;
  service_address_line2?: string;
  service_address_town?: string;
  service_address_county?: string;
  service_postcode?: string;
  service_phone?: string;
  service_email?: string;

  // Court
  court_name?: string;
  court_address?: string;

  // Signature
  signatory_name: string;
  signature_date: string;

  // Additional data
  [key: string]: any;
}

// =============================================================================
// STRICT FIELD HELPERS
// =============================================================================

/**
 * List all field names in a PDF form
 */
export function listFormFieldNames(form: PDFForm): string[] {
  return form.getFields().map(f => f.getName());
}

/**
 * Get a text field strictly - throws if not found
 */
function getTextFieldStrict(form: PDFForm, fieldName: string, context: string): PDFTextField {
  try {
    return form.getTextField(fieldName);
  } catch {
    const available = listFormFieldNames(form).slice(0, 20).join(', ');
    throw new Error(
      `[${context}] Text field "${fieldName}" not found in PDF. ` +
      `Available fields (first 20): ${available}...`
    );
  }
}

/**
 * Get a checkbox strictly - throws if not found
 */
function getCheckBoxStrict(form: PDFForm, fieldName: string, context: string): PDFCheckBox {
  try {
    return form.getCheckBox(fieldName);
  } catch {
    const available = listFormFieldNames(form).slice(0, 20).join(', ');
    throw new Error(
      `[${context}] Checkbox "${fieldName}" not found in PDF. ` +
      `Available fields (first 20): ${available}...`
    );
  }
}

/**
 * Set a required text field - throws if value missing or field not found
 */
function setTextRequired(form: PDFForm, fieldName: string, value: string | undefined, context: string): void {
  if (!value || value.trim() === '') {
    throw new Error(
      `[${context}] Required field "${fieldName}" has no value. ` +
      `Please provide this data before generating court forms.`
    );
  }
  const field = getTextFieldStrict(form, fieldName, context);
  field.setText(value);
}

/**
 * Set an optional text field - silently skips if value missing, throws if field missing
 */
function setTextOptional(form: PDFForm, fieldName: string, value: string | undefined, context: string): void {
  if (!value || value.trim() === '') return;

  try {
    const field = form.getTextField(fieldName);
    field.setText(value);
  } catch {
    // Field doesn't exist - this is acceptable for optional fields, but log it
    console.debug(`[${context}] Optional field "${fieldName}" not found, skipping`);
  }
}

/**
 * Try multiple field name variants for a text field (handles apostrophe differences)
 */
function setTextWithVariants(
  form: PDFForm,
  fieldNames: string[],
  value: string | undefined,
  required: boolean,
  context: string
): void {
  if (!value || value.trim() === '') {
    if (required) {
      throw new Error(
        `[${context}] Required field (variants: ${fieldNames.join(' / ')}) has no value.`
      );
    }
    return;
  }

  for (const fieldName of fieldNames) {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
      return; // Success
    } catch {
      continue; // Try next variant
    }
  }

  // None of the variants worked
  if (required) {
    throw new Error(
      `[${context}] Could not find any of these text fields: ${fieldNames.join(' / ')}. ` +
      `First 10 available: ${listFormFieldNames(form).slice(0, 10).join(', ')}...`
    );
  }
}

/**
 * Set a checkbox - silently skips if field missing (checkboxes are often optional)
 */
function setCheckbox(form: PDFForm, fieldName: string, checked: boolean, context: string): void {
  if (!checked) return;

  try {
    const field = form.getCheckBox(fieldName);
    field.check();
  } catch {
    console.debug(`[${context}] Checkbox "${fieldName}" not found, skipping`);
  }
}

/**
 * Set a required checkbox - throws if field not found
 */
function setCheckboxRequired(form: PDFForm, fieldName: string, checked: boolean, context: string): void {
  const field = getCheckBoxStrict(form, fieldName, context);
  if (checked) {
    field.check();
  } else {
    field.uncheck();
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Guard to ensure the referenced official PDF exists before attempting to load it.
 */
export async function assertOfficialFormExists(formName: string): Promise<string> {
  const formPath = path.join(OFFICIAL_FORMS_ROOT, formName);

  try {
    await fs.access(formPath);
    return formPath;
  } catch (error) {
    throw new Error(
      `Official form "${formName}" is missing. Add the PDF under public/official-forms (jurisdiction subfolder allowed) or update the manifest. Error: ${error}`
    );
  }
}

/**
 * Load an official PDF form
 */
async function loadOfficialForm(formName: string): Promise<PDFDocument> {
  const formPath = await assertOfficialFormExists(formName);

  try {
    const pdfBytes = await fs.readFile(formPath);
    const byteSource = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes as any);
    const pdfDoc = await PDFDocument.load(byteSource);
    return pdfDoc;
  } catch (error) {
    throw new Error(
      `Failed to load official form "${formName}". Make sure the PDF exists in /public/official-forms/. Error: ${error}`
    );
  }
}

/**
 * Split full name into first names and last name
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ') || parts[0]; // Handle single name
  return { firstName, lastName };
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
 * Split address into lines
 */
function splitAddress(address: string): string[] {
  return address.split('\n').filter(line => line.trim());
}

// =============================================================================
// N5 FORM FILLER
// =============================================================================

/**
 * Fill Form N5 - Claim for possession of property
 *
 * This is the standard possession claim form used for both Section 8 and Section 21.
 *
 * Official PDF: /public/official-forms/n5-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/601bc1858fa8f53fc3d799d9/n5-eng.pdf
 *
 * FIELD INVENTORY: 13 text fields, 0 checkboxes
 */
export async function fillN5Form(data: CaseData): Promise<Uint8Array> {
  const ctx = 'N5';
  console.log('📄 Filling N5 form (Claim for possession)...');

  // === VALIDATION ===
  if (!data.court_name) {
    throw new Error(`[${ctx}] court_name is required. Please provide court details before generating court forms.`);
  }
  if (!data.landlord_full_name) {
    throw new Error(`[${ctx}] landlord_full_name is required.`);
  }
  if (!data.tenant_full_name) {
    throw new Error(`[${ctx}] tenant_full_name is required.`);
  }
  if (!data.property_address) {
    throw new Error(`[${ctx}] property_address is required.`);
  }

  const pdfDoc = await loadOfficialForm('n5-eng.pdf');
  const form = pdfDoc.getForm();

  // === REQUIRED FIELDS ===

  // Court name
  setTextRequired(form, N5_FIELDS.COURT, data.court_name, ctx);

  // Claimant and defendant details - try both apostrophe variants (curly ' and straight ')
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  const defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;

  setTextWithVariants(
    form,
    [N5_FIELDS.CLAIMANT_DETAILS, "claimant's details"], // curly then straight
    claimantDetails,
    true,
    ctx
  );

  setTextWithVariants(
    form,
    [N5_FIELDS.DEFENDANT_DETAILS, "defendant's details"], // curly then straight
    defendantDetails,
    true,
    ctx
  );

  // Property address (possession of)
  setTextRequired(form, N5_FIELDS.POSSESSION_OF, data.property_address, ctx);

  // Signatory name
  setTextRequired(form, N5_FIELDS.SIGNATORY_NAME, data.signatory_name, ctx);

  // === OPTIONAL FIELDS ===

  setTextOptional(form, N5_FIELDS.FEE_ACCOUNT, data.claimant_reference, ctx);
  setTextOptional(form, N5_FIELDS.SOLICITOR_FIRM, data.solicitor_firm, ctx);

  // Service address
  const serviceAddressLines = splitAddress(
    data.service_address_line1 || data.landlord_address
  );

  setTextOptional(form, N5_FIELDS.ADDRESS_BUILDING, serviceAddressLines[0], ctx);
  if (serviceAddressLines.length > 1) {
    setTextOptional(form, N5_FIELDS.ADDRESS_LINE2, serviceAddressLines[1], ctx);
  }
  setTextOptional(form, N5_FIELDS.ADDRESS_TOWN, data.service_address_town, ctx);
  setTextOptional(form, N5_FIELDS.ADDRESS_COUNTY, data.service_address_county, ctx);
  setTextOptional(form, N5_FIELDS.ADDRESS_POSTCODE, data.service_postcode || data.landlord_postcode, ctx);

  // Note: N5 has NO checkboxes for grounds/arrears/HRA/statement of truth type
  // Those fields don't exist in this PDF

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N5 form filled successfully (${listFormFieldNames(form).length} fields available, key fields set)`);

  return pdfBytes;
}

// =============================================================================
// N5B FORM FILLER
// =============================================================================

/**
 * Fill Form N5B - Claim for possession (accelerated procedure)
 *
 * Section 21 ONLY - for no-fault evictions via accelerated procedure.
 *
 * Official PDF: /public/official-forms/n5b-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/5fb39bf98fa8f55de86fb3a3/n5b-eng.pdf
 *
 * FIELD INVENTORY: 128 text fields, 118 checkboxes
 *
 * IMPORTANT: This form requires specific compliance data to be collected.
 * We only fill fields where we have actual data - no hardcoding of answers.
 */
export async function fillN5BForm(data: CaseData): Promise<Uint8Array> {
  const ctx = 'N5B';
  console.log('📄 Filling N5B form (Accelerated possession - Section 21)...');

  // === VALIDATION ===
  if (!data.court_name) {
    throw new Error(`[${ctx}] court_name is required. Please provide court details before generating court forms.`);
  }
  if (!data.landlord_full_name) {
    throw new Error(`[${ctx}] landlord_full_name is required.`);
  }
  if (!data.tenant_full_name) {
    throw new Error(`[${ctx}] tenant_full_name is required.`);
  }
  if (!data.property_address) {
    throw new Error(`[${ctx}] property_address is required.`);
  }
  if (!data.notice_service_method) {
    throw new Error(
      `[${ctx}] notice_service_method is required for N5B (field 10a: "How was the notice served"). ` +
      `Valid values: "First class post", "By hand", "Email", etc. Please collect this in the wizard.`
    );
  }
  if (!data.section_21_notice_date) {
    throw new Error(`[${ctx}] section_21_notice_date is required.`);
  }
  if (!data.tenancy_start_date) {
    throw new Error(`[${ctx}] tenancy_start_date is required.`);
  }

  const pdfDoc = await loadOfficialForm('n5b-eng.pdf');
  const form = pdfDoc.getForm();

  // === HEADER SECTION ===
  const courtNameAndAddress = data.court_address
    ? `${data.court_name}\n${data.court_address}`
    : data.court_name;

  setTextRequired(form, N5B_FIELDS.CLAIMANTS_NAMES,
    data.landlord_full_name + (data.landlord_2_name ? ', ' + data.landlord_2_name : ''), ctx);
  setTextRequired(form, N5B_FIELDS.DEFENDANTS_NAMES,
    data.tenant_full_name + (data.tenant_2_name ? ', ' + data.tenant_2_name : ''), ctx);
  setTextRequired(form, N5B_FIELDS.COURT_NAME_ADDRESS, courtNameAndAddress, ctx);
  setTextRequired(form, N5B_FIELDS.CLAIMING_POSSESSION_OF, data.property_address, ctx);

  // === FEES (optional) ===
  if (data.court_fee) {
    setTextOptional(form, N5B_FIELDS.COURT_FEE, data.court_fee.toFixed(2), ctx);
  }
  if (data.solicitor_costs) {
    setTextOptional(form, N5B_FIELDS.LEGAL_COSTS, data.solicitor_costs.toFixed(2), ctx);
  }
  const totalAmount = (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (totalAmount > 0) {
    setTextOptional(form, N5B_FIELDS.TOTAL_AMOUNT, totalAmount.toFixed(2), ctx);
  }

  // === Q3: COSTS ===
  setCheckbox(form, N5B_CHECKBOXES.COSTS_YES, !!data.solicitor_costs, ctx);
  setCheckbox(form, N5B_CHECKBOXES.COSTS_NO, !data.solicitor_costs, ctx);

  // === FIRST CLAIMANT DETAILS ===
  const landlordName = splitName(data.landlord_full_name);
  setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_FIRST_NAMES, landlordName.firstName, ctx);
  setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_LAST_NAME, landlordName.lastName, ctx);

  const landlordAddressLines = splitAddress(data.landlord_address);
  setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_ADDRESS_STREET, landlordAddressLines[0], ctx);
  if (landlordAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_ADDRESS_LINE2, landlordAddressLines[1], ctx);
  }
  if (landlordAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_ADDRESS_TOWN, landlordAddressLines[2], ctx);
  }
  setTextOptional(form, N5B_FIELDS.FIRST_CLAIMANT_ADDRESS_POSTCODE, data.landlord_postcode, ctx);

  // === SECOND CLAIMANT (if exists) ===
  if (data.landlord_2_name) {
    const landlord2Name = splitName(data.landlord_2_name);
    setTextOptional(form, N5B_FIELDS.SECOND_CLAIMANT_FIRST_NAMES, landlord2Name.firstName, ctx);
    setTextOptional(form, N5B_FIELDS.SECOND_CLAIMANT_LAST_NAME, landlord2Name.lastName, ctx);
  }

  // === FIRST DEFENDANT DETAILS ===
  const tenantName = splitName(data.tenant_full_name);
  setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_FIRST_NAMES, tenantName.firstName, ctx);
  setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_LAST_NAME, tenantName.lastName, ctx);

  const propertyAddressLines = splitAddress(data.property_address);
  setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_ADDRESS_STREET, propertyAddressLines[0], ctx);
  if (propertyAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_ADDRESS_LINE2, propertyAddressLines[1], ctx);
  }
  if (propertyAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_ADDRESS_TOWN, propertyAddressLines[2], ctx);
  }
  setTextOptional(form, N5B_FIELDS.FIRST_DEFENDANT_ADDRESS_POSTCODE, data.property_postcode, ctx);

  // === SECOND DEFENDANT (if exists) ===
  if (data.tenant_2_name) {
    const tenant2Name = splitName(data.tenant_2_name);
    setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_FIRST_NAMES, tenant2Name.firstName, ctx);
    setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_LAST_NAME, tenant2Name.lastName, ctx);
    setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_ADDRESS_STREET, propertyAddressLines[0], ctx);
    if (propertyAddressLines.length > 1) {
      setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_ADDRESS_LINE2, propertyAddressLines[1], ctx);
    }
    if (propertyAddressLines.length > 2) {
      setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_ADDRESS_TOWN, propertyAddressLines[2], ctx);
    }
    setTextOptional(form, N5B_FIELDS.SECOND_DEFENDANT_ADDRESS_POSTCODE, data.property_postcode, ctx);
  }

  // === POSSESSION ADDRESS ===
  setTextOptional(form, N5B_FIELDS.POSSESSION_STREET, propertyAddressLines[0], ctx);
  if (propertyAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.POSSESSION_LINE2, propertyAddressLines[1], ctx);
  }
  if (propertyAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.POSSESSION_TOWN, propertyAddressLines[2], ctx);
  }
  setTextOptional(form, N5B_FIELDS.POSSESSION_POSTCODE, data.property_postcode, ctx);

  // === Q5: DWELLING HOUSE (always yes for residential) ===
  setCheckbox(form, N5B_CHECKBOXES.DWELLING_YES, true, ctx);

  // === Q6-7: TENANCY DATES ===
  const tenancyDate = splitDate(data.tenancy_start_date);
  if (tenancyDate) {
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_DAY, tenancyDate.day, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_MONTH, tenancyDate.month, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_YEAR, tenancyDate.year, ctx);
    // Assume agreement dated same as let date (common case)
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_DAY, tenancyDate.day, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_MONTH, tenancyDate.month, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_YEAR, tenancyDate.year, ctx);
  }

  // === Q8: SUBSEQUENT TENANCY ===
  if (data.subsequent_tenancy !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.SUBSEQUENT_TENANCY_YES, data.subsequent_tenancy, ctx);
    setCheckbox(form, N5B_CHECKBOXES.SUBSEQUENT_TENANCY_NO, !data.subsequent_tenancy, ctx);
  }

  // === Q10: NOTICE SERVICE (REQUIRED) ===
  setTextRequired(form, N5B_FIELDS.NOTICE_SERVICE_METHOD, data.notice_service_method, ctx);

  const noticeDate = splitDate(data.section_21_notice_date);
  if (noticeDate) {
    setTextOptional(form, N5B_FIELDS.NOTICE_SERVED_DATE_DAY, noticeDate.day, ctx);
    setTextOptional(form, N5B_FIELDS.NOTICE_SERVED_DATE_MONTH, noticeDate.month, ctx);
    setTextOptional(form, N5B_FIELDS.NOTICE_SERVED_DATE_YEAR, noticeDate.year, ctx);
  }

  setTextOptional(form, N5B_FIELDS.NOTICE_SERVED_BY, data.landlord_full_name, ctx);
  setTextOptional(form, N5B_FIELDS.NOTICE_SERVED_ON, data.tenant_full_name, ctx);

  if (data.notice_expiry_date) {
    const expiryDate = splitDate(data.notice_expiry_date);
    if (expiryDate) {
      setTextOptional(form, N5B_FIELDS.NOTICE_EXPIRY_DATE_DAY, expiryDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.NOTICE_EXPIRY_DATE_MONTH, expiryDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.NOTICE_EXPIRY_DATE_YEAR, expiryDate.year, ctx);
    }
  }

  // === Q12-14: DEPOSIT (only if we have data) ===
  const depositPaid = data.deposit_amount !== undefined && data.deposit_amount > 0;
  if (depositPaid) {
    setCheckbox(form, N5B_CHECKBOXES.DEPOSIT_PAID_YES, true, ctx);

    // Q13: Deposit returned
    if (data.deposit_returned !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.DEPOSIT_RETURNED_YES, data.deposit_returned, ctx);
      setCheckbox(form, N5B_CHECKBOXES.DEPOSIT_RETURNED_NO, !data.deposit_returned, ctx);
    }

    // Q14a: Prescribed info given
    if (data.deposit_prescribed_info_given !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.PRESCRIBED_INFO_YES, data.deposit_prescribed_info_given, ctx);
      setCheckbox(form, N5B_CHECKBOXES.PRESCRIBED_INFO_NO, !data.deposit_prescribed_info_given, ctx);
    }

    // Q14b: Date prescribed info given
    if (data.deposit_protection_date) {
      const depositInfoDate = splitDate(data.deposit_protection_date);
      if (depositInfoDate) {
        setTextOptional(form, N5B_FIELDS.DEPOSIT_INFO_DATE_DAY, depositInfoDate.day, ctx);
        setTextOptional(form, N5B_FIELDS.DEPOSIT_INFO_DATE_MONTH, depositInfoDate.month, ctx);
        setTextOptional(form, N5B_FIELDS.DEPOSIT_INFO_DATE_YEAR, depositInfoDate.year, ctx);
      }
    }
  } else if (data.deposit_amount === 0 || data.deposit_amount === undefined) {
    // Explicitly no deposit
    setCheckbox(form, N5B_CHECKBOXES.DEPOSIT_PAID_NO, true, ctx);
  }

  // === Q21: ORDERS REQUESTED ===
  setCheckbox(form, N5B_CHECKBOXES.ORDER_POSSESSION, true, ctx);
  if (data.solicitor_costs) {
    setCheckbox(form, N5B_CHECKBOXES.ORDER_COSTS, true, ctx);
  }

  // === ENGLAND LOCATION ===
  setCheckbox(form, N5B_CHECKBOXES.ENGLAND_YES, true, ctx);

  // === STATEMENT OF TRUTH ===
  setTextOptional(form, N5B_FIELDS.STATEMENT_SIGNATURE, data.signatory_name, ctx);
  setTextOptional(form, N5B_FIELDS.STATEMENT_SIGNATORY_NAME, data.signatory_name, ctx);

  if (data.signature_date) {
    const sigDate = splitDate(data.signature_date);
    if (sigDate) {
      setTextOptional(form, N5B_FIELDS.STATEMENT_DATE_DAY, sigDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.STATEMENT_DATE_MONTH, sigDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.STATEMENT_DATE_YEAR, sigDate.year, ctx);
    }
  }

  if (data.solicitor_firm) {
    setTextOptional(form, N5B_FIELDS.SOLICITOR_FIRM, data.solicitor_firm, ctx);
    setCheckbox(form, N5B_CHECKBOXES.SOT_LEGAL_REP, true, ctx);
    setCheckbox(form, N5B_CHECKBOXES.SOT_AUTHORISED, true, ctx);
  } else {
    setCheckbox(form, N5B_CHECKBOXES.SOT_CLAIMANT, true, ctx);
    setCheckbox(form, N5B_CHECKBOXES.SOT_BELIEVES, true, ctx);
  }

  // === ATTACHMENTS ===
  // Only tick attachment boxes if the user has confirmed/uploaded the document.
  // This prevents false claims on court forms - if user hasn't confirmed they have
  // the document, the box is left unchecked for them to complete manually.

  // Tenancy agreement (marked A) - required attachment
  // Only tick if user has uploaded/confirmed they have a copy
  if (data.tenancy_agreement_uploaded === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_TENANCY, true, ctx);
  }

  // Notice copy (marked B) - required attachment
  // Only tick if user has confirmed notice copy is available
  if (data.notice_copy_available === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_NOTICE, true, ctx);
  }

  // Proof of service (marked B1) - required attachment
  // Only tick if user has confirmed proof of service is available
  if (data.service_proof_available === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_SERVICE_PROOF, true, ctx);
  }

  // =========================================================================
  // P0-2 FIX: N5B ATTACHMENT CHECKBOXES E, F, G - TRUTHFULNESS
  // =========================================================================
  // CRITICAL: These checkboxes declare that documents are ATTACHED to the claim.
  // Ticking these boxes without the actual document uploaded is a FALSE STATEMENT.
  //
  // OLD BEHAVIOR (WRONG):
  //   - E: Ticked if depositPaid (regardless of certificate upload)
  //   - F: Ticked if epc_provided compliance flag (regardless of upload)
  //   - G: Ticked if gas_safety_provided compliance flag (regardless of upload)
  //
  // NEW BEHAVIOR (CORRECT):
  //   - E: Only tick if deposit_certificate_uploaded === true
  //   - F: Only tick if epc_uploaded === true
  //   - G: Only tick if gas_safety_uploaded === true
  //
  // The upload-based flags are derived from facts.evidence.files[] in
  // eviction-wizard-mapper.ts using the canonical EvidenceCategory enum.
  // =========================================================================

  // Deposit certificate (marked E) - only if certificate was ACTUALLY UPLOADED
  if (data.deposit_certificate_uploaded === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
  }

  // EPC (marked F) - only if EPC was ACTUALLY UPLOADED
  if (data.epc_uploaded === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_EPC, true, ctx);
  }

  // Gas safety records (marked G) - only if gas cert was ACTUALLY UPLOADED
  if (data.gas_safety_uploaded === true) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_GAS, true, ctx);
  }

  // === SERVICE ADDRESS ===
  const serviceAddressLines = splitAddress(data.service_address_line1 || data.landlord_address);
  setTextOptional(form, N5B_FIELDS.SERVICE_ADDRESS_STREET, serviceAddressLines[0], ctx);
  if (serviceAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.SERVICE_ADDRESS_LINE2, serviceAddressLines[1], ctx);
  }
  if (serviceAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.SERVICE_ADDRESS_TOWN, serviceAddressLines[2], ctx);
  }
  setTextOptional(form, N5B_FIELDS.SERVICE_ADDRESS_POSTCODE, data.service_postcode || data.landlord_postcode, ctx);

  // Contact details
  setTextOptional(form, N5B_FIELDS.PHONE, data.service_phone || data.landlord_phone, ctx);
  setTextOptional(form, N5B_FIELDS.EMAIL, data.service_email || data.landlord_email, ctx);
  setTextOptional(form, N5B_FIELDS.DX, data.dx_number, ctx);
  setTextOptional(form, N5B_FIELDS.REFERENCE, data.claimant_reference, ctx);

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N5B form filled successfully (${listFormFieldNames(form).length} fields in form, key fields set)`);

  return pdfBytes;
}

// =============================================================================
// N119 FORM FILLER
// =============================================================================

/**
 * Fill Form N119 - Particulars of claim for possession
 *
 * Official PDF: /public/official-forms/n119-eng.pdf
 * Source: https://assets.publishing.service.gov.uk/media/601bc1f8e90e071292663ea8/n119-eng.pdf
 *
 * FIELD INVENTORY: 17 text fields, 0 checkboxes
 * Note: All fields are TEXT fields - no checkboxes in this form!
 */
export async function fillN119Form(data: CaseData): Promise<Uint8Array> {
  const ctx = 'N119';
  console.log('📄 Filling N119 form (Particulars of claim)...');

  // === VALIDATION ===
  if (!data.court_name) {
    throw new Error(`[${ctx}] court_name is required. Please provide court details before generating court forms.`);
  }
  if (!data.landlord_full_name) {
    throw new Error(`[${ctx}] landlord_full_name is required.`);
  }
  if (!data.tenant_full_name) {
    throw new Error(`[${ctx}] tenant_full_name is required.`);
  }
  if (!data.property_address) {
    throw new Error(`[${ctx}] property_address is required.`);
  }
  if (!data.tenancy_start_date) {
    throw new Error(`[${ctx}] tenancy_start_date is required.`);
  }

  const pdfDoc = await loadOfficialForm('n119-eng.pdf');
  const form = pdfDoc.getForm();

  // === REQUIRED FIELDS ===
  setTextRequired(form, N119_FIELDS.COURT, data.court_name, ctx);
  setTextRequired(form, N119_FIELDS.CLAIMANT, data.landlord_full_name, ctx);
  setTextRequired(form, N119_FIELDS.DEFENDANT, data.tenant_full_name, ctx);
  setTextRequired(form, N119_FIELDS.POSSESSION_OF, data.property_address, ctx);

  // Occupants - default to tenant name
  setTextOptional(form, N119_FIELDS.OCCUPANTS, data.tenant_full_name, ctx);

  // === TENANCY DETAILS ===
  // Type of tenancy - use collected value or a safe generic
  const tenancyType = data.tenancy_type || 'Assured Shorthold Tenancy';
  setTextOptional(form, N119_FIELDS.TENANCY_TYPE, tenancyType, ctx);
  setTextOptional(form, N119_FIELDS.TENANCY_DATE, data.tenancy_start_date, ctx);

  // Rent
  if (data.rent_amount !== undefined) {
    const rentFrequencyText = data.rent_frequency === 'weekly' ? 'per week' :
                               data.rent_frequency === 'fortnightly' ? 'per fortnight' :
                               data.rent_frequency === 'monthly' ? 'per month' :
                               data.rent_frequency === 'quarterly' ? 'per quarter' :
                               data.rent_frequency === 'yearly' ? 'per year' : '';
    setTextOptional(form, N119_FIELDS.RENT, `£${data.rent_amount} ${rentFrequencyText}`, ctx);
  }

  // === REASON FOR POSSESSION ===
  setTextOptional(form, N119_FIELDS.REASON,
    data.particulars_of_claim || (data.ground_numbers ? `Grounds: ${data.ground_numbers}` : undefined),
    ctx
  );

  // === NOTICE DATES ===
  const noticeDate = data.section_8_notice_date || data.section_21_notice_date;
  if (noticeDate) {
    const dateParts = noticeDate.split('-');
    if (dateParts.length === 3) {
      setTextOptional(form, N119_FIELDS.NOTICE_DATE_DAY_MONTH, `${dateParts[2]}/${dateParts[1]}`, ctx);
      setTextOptional(form, N119_FIELDS.NOTICE_DATE_YEAR, dateParts[0], ctx);
    }
  }

  // === CLAIMANT TYPE (Section 13) ===
  // Note: These are TEXT fields, not checkboxes!
  // We mark "other" and provide details
  setTextOptional(form, N119_FIELDS.CLAIMANT_TYPE_OTHER, 'X', ctx);  // Mark this option
  setTextOptional(form, N119_FIELDS.CLAIMANT_TYPE_DETAILS, 'Private landlord', ctx);

  // === STATEMENT OF TRUTH ===
  // Note: These are also TEXT fields, not checkboxes!
  if (data.solicitor_firm) {
    setTextOptional(form, N119_FIELDS.SOT_AUTHORISED, data.signatory_name, ctx);
    setTextOptional(form, N119_FIELDS.SOT_SIGNED_BY_REP, data.signatory_name, ctx);
    setTextOptional(form, N119_FIELDS.SOLICITOR_FIRM, data.solicitor_firm, ctx);
  } else {
    setTextOptional(form, N119_FIELDS.SOT_BELIEVES, data.signatory_name, ctx);
  }

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N119 form filled successfully (${listFormFieldNames(form).length} fields in form, key fields set)`);

  return pdfBytes;
}

// =============================================================================
// N1 FORM FILLER (Money Claims)
// =============================================================================

/**
 * Fill Form N1 - Claim form (for money claims)
 *
 * Official PDF: /public/official-forms/N1_1224.pdf
 * Source: https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf
 */
export async function fillN1Form(data: CaseData): Promise<Uint8Array> {
  const ctx = 'N1';
  console.log('📄 Filling N1 form (Money claim)...');

  const pdfDoc = await loadOfficialForm('N1_1224.pdf');
  const form = pdfDoc.getForm();

  // === PAGE 1 - Main Claim Form ===

  // Court and fees header
  setTextOptional(form, 'Text35', data.court_name, ctx);
  setTextOptional(form, 'Text36', data.claimant_reference, ctx);

  // Claimant details (large text box)
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  setTextOptional(form, 'Text21', claimantDetails, ctx);

  // Defendant details (large text box)
  const defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;
  setTextOptional(form, 'Text22', defendantDetails, ctx);

  // Brief details of claim
  const briefDetails = data.particulars_of_claim
    ? data.particulars_of_claim.substring(0, 200) + (data.particulars_of_claim.length > 200 ? '...' : '')
    : 'Claim for unpaid rent and possession of property';
  setTextOptional(form, 'Text23', briefDetails, ctx);

  // Value
  if (data.total_claim_amount) {
    setTextOptional(form, 'Text24', `£${data.total_claim_amount.toFixed(2)}`, ctx);
  }

  // Defendant's address for service
  setTextOptional(form, 'Text Field 48', data.property_address, ctx);

  // Financial details
  if (data.total_claim_amount) {
    setTextOptional(form, 'Text25', data.total_claim_amount.toFixed(2), ctx);
  }
  if (data.court_fee) {
    setTextOptional(form, 'Text26', data.court_fee.toFixed(2), ctx);
  }
  if (data.solicitor_costs) {
    setTextOptional(form, 'Text27', data.solicitor_costs.toFixed(2), ctx);
  }

  const totalAmount = (data.total_claim_amount || 0) + (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (totalAmount > 0) {
    setTextOptional(form, 'Text28', totalAmount.toFixed(2), ctx);
  }

  // === PAGE 2 ===
  setCheckbox(form, 'Check Box40', true, ctx); // Vulnerability: No
  setCheckbox(form, 'Check Box42', true, ctx); // Human Rights Act: No

  // === PAGE 3 ===
  if (data.particulars_of_claim) {
    setCheckbox(form, 'Check Box43', true, ctx);
    setTextOptional(form, 'Text30', data.particulars_of_claim, ctx);
  }

  // === PAGE 4 - Statement of Truth ===
  if (data.solicitor_firm) {
    setCheckbox(form, 'Check Box46', true, ctx);
    setCheckbox(form, 'Check Box49', true, ctx);
  } else {
    setCheckbox(form, 'Check Box45', true, ctx);
    setCheckbox(form, 'Check Box47', true, ctx);
  }

  setTextOptional(form, 'Text Field 47', data.signatory_name, ctx);
  setTextOptional(form, 'Text Field 46', data.signatory_name, ctx);

  if (data.signature_date) {
    const dateparts = splitDate(data.signature_date);
    if (dateparts) {
      setTextOptional(form, 'Text31', dateparts.day, ctx);
      setTextOptional(form, 'Text32', dateparts.month, ctx);
      setTextOptional(form, 'Text33', dateparts.year, ctx);
    }
  }

  if (data.solicitor_firm) {
    setTextOptional(form, 'Text Field 45', data.solicitor_firm, ctx);
  }

  // === PAGE 5 - Address for Service ===
  const serviceAddressLines = splitAddress(data.service_address_line1 || data.landlord_address);
  setTextOptional(form, 'Text Field 10', serviceAddressLines[0], ctx);
  if (serviceAddressLines.length > 1) {
    setTextOptional(form, 'Text Field 9', serviceAddressLines[1], ctx);
  }
  if (serviceAddressLines.length > 2) {
    setTextOptional(form, 'Text Field 8', serviceAddressLines[2], ctx);
  }
  if (serviceAddressLines.length > 3) {
    setTextOptional(form, 'Text Field 7', serviceAddressLines[3], ctx);
  }

  const postcode = (data.service_postcode || data.landlord_postcode || '').substring(0, 7);
  setTextOptional(form, 'Text34', postcode, ctx);

  const servicePhone = data.service_phone || data.solicitor_phone || data.landlord_phone;
  const serviceEmail = data.service_email || data.solicitor_email || data.landlord_email;

  setTextOptional(form, 'Text Field 6', servicePhone, ctx);
  setTextOptional(form, 'Text Field 4', data.dx_number, ctx);
  setTextOptional(form, 'Text Field 3', data.claimant_reference, ctx);
  setTextOptional(form, 'Text Field 2', serviceEmail, ctx);

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N1 form filled successfully`);

  return pdfBytes;
}

// =============================================================================
// FORM 6A (Section 21 Notice)
// =============================================================================

/**
 * Fill Form 6A - Section 21 notice (prescribed form)
 *
 * Official PDF: /public/official-forms/form_6a.pdf
 */
export async function fillForm6A(data: CaseData): Promise<Uint8Array> {
  const ctx = 'Form6A';
  console.log('📄 Filling Form 6A (Section 21 notice)...');

  const pdfDoc = await loadOfficialForm('form_6a.pdf');
  const form = pdfDoc.getForm();

  // Property address
  setTextOptional(form, 'Premises address', data.property_address, ctx);

  // Leaving date
  setTextOptional(form, 'leaving date DD/MM/YYYYY', data.section_21_notice_date, ctx);

  // Landlord/agent names
  setTextOptional(form, 'Name 1', data.landlord_full_name, ctx);
  setTextOptional(form, 'Name 2', data.landlord_2_name, ctx);

  // Landlord/agent address
  setTextOptional(form, 'Address 1', data.landlord_address, ctx);
  setTextOptional(form, 'Signatory address 1', data.landlord_address, ctx);
  setTextOptional(form, 'Signatory address 2', data.landlord_address, ctx);

  // Contact details
  setTextOptional(form, 'Signatory telephone1', data.landlord_phone, ctx);
  setTextOptional(form, 'Signatory telephone2', data.landlord_phone, ctx);
  setTextOptional(form, 'Signatory Telephone 1', data.landlord_phone, ctx);
  setTextOptional(form, 'Signatory Telephone 2', data.landlord_phone, ctx);

  // Signatory names
  setTextOptional(form, 'Signatory Name 1', data.landlord_full_name, ctx);
  setTextOptional(form, 'Signatory name 2 ', data.landlord_2_name, ctx);

  // Date signed
  setTextOptional(form, 'Date 2 ', data.signature_date, ctx);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Form 6A filled successfully');

  return pdfBytes;
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

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
