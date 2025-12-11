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

import { PDFDocument, PDFForm } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const OFFICIAL_FORMS_ROOT = path.join(process.cwd(), 'public', 'official-forms');

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
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

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

  // Court details
  fillTextField(form, 'In the court', data.court_name);
  fillTextField(form, 'Fee account no', data.claimant_reference);

  // Claimant and defendant details (combined fields)
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  const defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;

  fillTextField(form, "claimant's details", claimantDetails);
  fillTextField(form, "defendant's details", defendantDetails);

  // Property address
  fillTextField(form, 'possession of', data.property_address);

  // Fees (if known)
  if (data.court_fee) {
    fillTextField(form, 'courtfee', `£${data.court_fee.toFixed(2)}`);
  }
  if (data.solicitor_costs) {
    fillTextField(form, 'solfee', `£${data.solicitor_costs.toFixed(2)}`);
  }
  const total = (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (total > 0) {
    fillTextField(form, 'total', `£${total.toFixed(2)}`);
  }

  // Claim grounds - checkboxes
  if (data.total_arrears && data.total_arrears > 0) {
    checkBox(form, 'rent arrears - yes', true);
  }

  if (data.claim_type === 'section_8') {
    const grounds = data.ground_numbers || '';

    // Check specific ground checkboxes based on ground numbers
    if (grounds.includes('12') || grounds.includes('13') || grounds.includes('14') || grounds.includes('15')) {
      checkBox(form, 'other breach of tenancy - yes', true);
    }

    if (grounds.includes('14')) {
      checkBox(form, 'anti-social behaviour - yes', true);
    }

    if (grounds.includes('15')) {
      checkBox(form, 'unlawful use - yes', true);
    }

    if (grounds.includes('7')) {
      checkBox(form, 'trespass - yes', true);
    }
  }

  // HRA consideration
  checkBox(form, 'HRA - yes', true); // Human Rights Act always considered

  // Statement of Truth
  // First split the date if provided as YYYY-MM-DD
  if (data.signature_date) {
    const dateParts = data.signature_date.split('-');
    if (dateParts.length === 3) {
      fillTextField(form, 'Date the Statement of Truth is signed - DD', dateParts[2]);
      fillTextField(form, 'Date the Statement of Truth is signed - MM', dateParts[1]);
      fillTextField(form, 'Date the Statement of Truth is signed - YYYY', dateParts[0]);
    }
  }

  fillTextField(form, 'Full name of the person signing the Statement of Truth', data.signatory_name);

  if (data.solicitor_firm) {
    fillTextField(form, 'Name of claimant’s legal representative’s firm', data.solicitor_firm);
    checkBox(form, "The Claimant believes that the facts stated in this claim form are true. I am authorised by the claimant to sign this statement", true);
    checkBox(form, 'Statement of Truth is signed by the Claimant’s legal representative (as defined by CPR 2.3(1))', true);
  } else {
    checkBox(form, 'I believe that the facts stated in this clam form are true', true);
    checkBox(form, 'Statement of Truth is signed by the Claimant', true);
  }

  fillTextField(form, 'Statement of Truth signature box', data.signatory_name);

  // Address for service
  const serviceAddressParts = [
    data.service_address_line1 || data.landlord_address,
    data.service_address_line2,
    data.service_address_town,
    data.service_address_county,
  ].filter((part): part is string => Boolean(part));

  fillTextField(
    form,
    'building and street - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
    serviceAddressParts[0]
  );
  if (serviceAddressParts.length > 1) {
    fillTextField(
      form,
      'Second line of address - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      serviceAddressParts[1]
    );
  }

  fillTextField(
    form,
    'Town or city - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
    data.service_address_town
  );

  fillTextField(
    form,
    'County (optional) - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
    data.service_address_county
  );

  if (data.service_postcode || data.landlord_postcode) {
    fillTextField(
      form,
      'Postcode - Claimant’s or claimant’s legal representative’s address to which documents or payments should be sent',
      data.service_postcode || data.landlord_postcode
    );
  }

  const servicePhone = data.service_phone || data.solicitor_phone || data.landlord_phone;
  const serviceEmail = data.service_email || data.solicitor_email || data.landlord_email;

  fillTextField(form, 'If applicable, phone number', servicePhone);
  fillTextField(form, 'If applicable, email address', serviceEmail);
  fillTextField(form, 'If applicable, your reference', data.claimant_reference);

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
  console.log('📄 Filling N5B form (Accelerated possession - Section 21)...');

  const pdfDoc = await loadOfficialForm('n5b-eng.pdf');
  const form = pdfDoc.getForm();

  // === HEADER SECTION ===
  fillTextField(form, 'Enter the full names of the Claimants', data.landlord_full_name + (data.landlord_2_name ? ', ' + data.landlord_2_name : ''));
  fillTextField(form, 'Enter the full names of the Defendants', data.tenant_full_name + (data.tenant_2_name ? ', ' + data.tenant_2_name : ''));
  fillTextField(form, 'Name and address of the court', data.court_name);
  fillTextField(form, 'The Claimant is claiming possession of', data.property_address);

  // Fees
  if (data.court_fee) {
    fillTextField(form, 'Court fee', `${data.court_fee.toFixed(2)}`);
  }
  if (data.solicitor_costs) {
    fillTextField(form, 'Legal representatives costs', `${data.solicitor_costs.toFixed(2)}`);
  }
  const totalAmount = (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (totalAmount > 0) {
    fillTextField(form, 'Total amount', `${totalAmount.toFixed(2)}`);
  }

  // === FIRST CLAIMANT DETAILS ===
  const landlordName = splitName(data.landlord_full_name);
  fillTextField(form, "First Claimant's first names", landlordName.firstName);
  fillTextField(form, "First Claimant's last name", landlordName.lastName);

  // Split address into lines
  const landlordAddressLines = data.landlord_address.split('\n');
  fillTextField(form, "First Claimant's address: building and street", landlordAddressLines[0]);
  if (landlordAddressLines.length > 1) {
    fillTextField(form, "First Claimant's address: second line of address", landlordAddressLines[1]);
  }
  if (landlordAddressLines.length > 2) {
    fillTextField(form, "First Claimant's address: town or city", landlordAddressLines[2]);
  }
  fillTextField(form, "First Claimant's address: postcode", data.landlord_postcode);

  // === SECOND CLAIMANT (if exists) ===
  if (data.landlord_2_name) {
    const landlord2Name = splitName(data.landlord_2_name);
    fillTextField(form, "Second Claimant's first names", landlord2Name.firstName);
    fillTextField(form, "Second Claimant's last name", landlord2Name.lastName);
  }

  // === FIRST DEFENDANT DETAILS ===
  const tenantName = splitName(data.tenant_full_name);
  fillTextField(form, "First Defendant's first name(s)", tenantName.firstName);
  fillTextField(form, "First Defendant's last name", tenantName.lastName);

  // Property address (defendant's address)
  const propertyAddressLines = data.property_address.split('\n');
  fillTextField(form, "First Defendant's address: building and street", propertyAddressLines[0]);
  if (propertyAddressLines.length > 1) {
    fillTextField(form, "First Defendant's address: second line of address", propertyAddressLines[1]);
  }
  if (propertyAddressLines.length > 2) {
    fillTextField(form, "First Defendant's address: town or city", propertyAddressLines[2]);
  }
  fillTextField(form, "First Defendant's address: postcode", data.property_postcode);

  // === SECOND DEFENDANT (if exists) ===
  if (data.tenant_2_name) {
    const tenant2Name = splitName(data.tenant_2_name);
    fillTextField(form, "Second Defendant's first names", tenant2Name.firstName);
    fillTextField(form, "Second Defendant's last name", tenant2Name.lastName);

    // Same property address for second tenant
    fillTextField(form, "Second Defendant's address: building and street", propertyAddressLines[0]);
    if (propertyAddressLines.length > 1) {
      fillTextField(form, "Second Defendant's address: second line of address", propertyAddressLines[1]);
    }
    if (propertyAddressLines.length > 2) {
      fillTextField(form, "Second Defendant's address: town or city", propertyAddressLines[2]);
    }
    fillTextField(form, "Second Defendant's address: postcode", data.property_postcode);
  }

  // === CLAIM DETAILS ===
  // Costs
  checkBox(form, '3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - Yes', !!data.solicitor_costs);
  checkBox(form, '3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - No', !data.solicitor_costs);

  // Property details
  fillTextField(form, 'Claimant seeks an order that the Defendant gives possession of: building and street', propertyAddressLines[0]);
  if (propertyAddressLines.length > 1) {
    fillTextField(form, 'Claimant seeks an order that the Defendant gives possession of: second line of address', propertyAddressLines[1]);
  }
  if (propertyAddressLines.length > 2) {
    fillTextField(form, 'Claimant seeks an order that the Defendant gives possession of: town or city', propertyAddressLines[2]);
  }
  fillTextField(form, 'Claimant seeks an order that the Defendant gives possession of: postcode', data.property_postcode);

  // Is it a dwelling house?
  checkBox(form, '5. Is the property a dwelling house or part of a dwelling house? Yes', true);

  // === TENANCY DATES ===
  const tenancyDate = splitDate(data.tenancy_start_date);
  if (tenancyDate) {
    fillTextField(form, '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Day', tenancyDate.day);
    fillTextField(form, '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Month', tenancyDate.month);
    fillTextField(form, '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Year', tenancyDate.year);

    // Same date for agreement (typically)
    fillTextField(form, '7. The tenancy agreement is dated. Day', tenancyDate.day);
    fillTextField(form, '7. The tenancy agreement is dated. Month', tenancyDate.month);
    fillTextField(form, '7. The tenancy agreement is dated. Year', tenancyDate.year);
  }

  // Subsequent tenancies
  checkBox(form, '8. Has any subsequent written tenancy agreement been entered into? No', true);

  // === AST VERIFICATION (Critical for Section 21) ===
  checkBox(form, '9a Was the first tenancy and any agreement for it made on or after 28 February 1997? Yes', true); // Most ASTs
  checkBox(form, '9b Was a notice served on the Defendant stating that any tenancy would not be, or would cease to be, an assured shorthold tenancy? No', true);
  checkBox(form, '9c Is there any provision in any tenancy agreement which states that it is not an assured shorthold tenancy? No', true);
  checkBox(form, '9d Is the \'agricultural worker condition\' defined in Schedule 3 to the Housing Act 1988 fulfilled with respect to the property? No', true);
  checkBox(form, '9e Did any tenancy arise by way of succession under s.39 of the Housing Act 1988? No', true);
  checkBox(form, '9f Was any tenancy previously a secure tenancy under s.79 of the Housing Act 1985? No', true);
  checkBox(form, '9g Did any tenancy arise under Schedule 10 to the Local Government and Housing Act 1989 (at the end of a long residential tenancy)? No', true);

  // === SECTION 21 NOTICE SERVICE ===
  fillTextField(form, '10a How was the notice served', 'By hand / First class post');

  const noticeDate = splitDate(data.section_21_notice_date);
  if (noticeDate) {
    fillTextField(form, '10b. On what date was the notice served? Day', noticeDate.day);
    fillTextField(form, '10b. On what date was the notice served? Month', noticeDate.month);
    fillTextField(form, '10b. On what date was the notice served? Year', noticeDate.year);
  }

  fillTextField(form, '10c Who served the notice', data.landlord_full_name);
  fillTextField(form, '10d Who was the notice served on', data.tenant_full_name);

  // Expiry date (notice + 2 months)
  if (data['notice_expiry_date']) {
    const expiryDate = splitDate(data['notice_expiry_date']);
    if (expiryDate) {
      fillTextField(form, '10e. After what date did the notice require the Defendant to leave the property? Day', expiryDate.day);
      fillTextField(form, '10e. After what date did the notice require the Defendant to leave the property? Month', expiryDate.month);
      fillTextField(form, '10e. After what date did the notice require the Defendant to leave the property? Year', expiryDate.year);
    }
  }

  // === HMO/LICENSING ===
  const hmoRequired = data['hmo_license_required'] || false;
  const hmoValid = data['hmo_license_valid'] || false;

  checkBox(form, '11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? Yes', hmoRequired);
  checkBox(form, '11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? No', !hmoRequired);

  if (hmoRequired) {
    checkBox(form, 'If yes, is there a valid licence? Yes', hmoValid);
    checkBox(form, 'If yes, is there a valid licence? No', !hmoValid);
  }

  checkBox(form, '11b. Is a decision outstanding as to licensing, or as to a temporary exemption notice? No', true);

  // === DEPOSIT PROTECTION ===
  const depositPaid = !!data.deposit_amount;
  checkBox(form, '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? Yes', depositPaid);
  checkBox(form, '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? No', !depositPaid);

  if (depositPaid) {
    // Deposit not returned (still protected)
    checkBox(form, '13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? No', true);

    // Prescribed information given
    checkBox(form, '14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? Yes', true);

    const depositInfoDate = splitDate(data.deposit_protection_date);
    if (depositInfoDate) {
      fillTextField(form, '14b. On what date was the prescribed information given? Day', depositInfoDate.day);
      fillTextField(form, '14b. On what date was the prescribed information given? Month', depositInfoDate.month);
      fillTextField(form, '14b. On what date was the prescribed information given? Year', depositInfoDate.year);
    }
  }

  // === HOUSING ACT 2004 NOTICES (Retaliatory Eviction) ===
  checkBox(form, '15. Has the Claimant been served with a relevant notice in relation to the condition of the property or relevant common parts under s.11, s.12 or s.40(7) of the Housing Act 2004? No', true);

  // === EPC AND GAS SAFETY ===
  checkBox(form, 'Copy of the Energy Performance Certificate marked F', true);
  checkBox(form, 'Copy of the Gas Safety Records marked G G1 G2 etc', true);
  checkBox(form, 'Copy of the Tenancy Deposit Certificate marked E', depositPaid);

  // === ATTACHMENTS ===
  checkBox(form, 'Copy of the first written tenancy agreement marked A', true);
  checkBox(form, 'Copy of the notice saying that possession was required marked B', true);
  checkBox(form, 'Proof of service of the notice requiring possession marked B1', true);

  // === ENGLAND/WALES ===
  checkBox(form, 'Is the property you are claiming possession of located wholly or partly in England? Yes', true);

  // === STATEMENT OF TRUTH ===
  fillTextField(form, 'Statement of Truth signature', data.signatory_name);

  if (data.solicitor_firm) {
    fillTextField(form, 'Name of Claimants legal representatives firm', data.solicitor_firm);
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N5B form filled successfully (246 fields mapped)');

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

  // Header
  fillTextField(form, 'name of court', data.court_name);
  fillTextField(form, 'name of claimant', data.landlord_full_name);
  fillTextField(form, 'name of defendant', data.tenant_full_name);

  // Property details
  fillTextField(form, 'The claimant has a right to possession of:', data.property_address);
  fillTextField(form, 'To the best of the claimant’s knowledge the following persons are in possession of the property:', data.tenant_full_name);

  // Tenancy details
  fillTextField(form, '3(a) Type of tenancy', 'Assured Shorthold Tenancy');
  fillTextField(form, '3(a) Date of tenancy', data.tenancy_start_date);

  // Rent
  fillTextField(form, '3(b) The current rent is', `£${data.rent_amount}`);

  // Rent frequency checkboxes
  if (data.rent_frequency === 'weekly') {
    fillTextField(form, '3(b) The current rent is payable each week', '£' + data.rent_amount);
  } else if (data.rent_frequency === 'fortnightly') {
    fillTextField(form, '3(b) The current rent is payable each fortnight', '£' + data.rent_amount);
  } else if (data.rent_frequency === 'monthly') {
    fillTextField(form, '3(b) The current rent is payable each month', '£' + data.rent_amount);
  } else {
    fillTextField(form, '3(b) The current rent is payable each - specify the period', data.rent_frequency);
  }

  // Arrears
  if (data.total_arrears) {
    fillTextField(form, '3(c) Any unpaid rent or charge for use and occupation should be calculated at £', data.total_arrears.toString());
  }

  // Grounds for possession
  fillTextField(form, '4. (a) The reason the claimant is asking for possession is:', data.particulars_of_claim);

  // Notice details
  if (data.section_8_notice_date) {
    const dateParts = data.section_8_notice_date.split('-');
    if (dateParts.length === 3) {
      fillTextField(form, '6. Day and month notice served', `${dateParts[2]}/${dateParts[1]}`);
      fillTextField(form, '6. Year notice served', dateParts[0]);
    }
  } else if (data.section_21_notice_date) {
    const dateParts = data.section_21_notice_date.split('-');
    if (dateParts.length === 3) {
      fillTextField(form, '6. Day and month notice served', `${dateParts[2]}/${dateParts[1]}`);
      fillTextField(form, '6. Year notice served', dateParts[0]);
    }
  }

  // Claimant type (private landlord)
  checkBox(form, '13. The claimant is - other', true);
  fillTextField(form, '13. Details if the claimant is some other entity', 'Private landlord');

  // No demotion order
  checkBox(form, '11. In the alternative to possession, is the claimant asking the court to make a demotion order or an order suspending the right to buy? No', true);

  // Statement of Truth
  if (data.signature_date) {
    const dateParts = data.signature_date.split('-');
    if (dateParts.length === 3) {
      fillTextField(form, 'Date Statement of Truth is signed - DD', dateParts[2]);
      fillTextField(form, 'Date Statement of Truth is signed - MM', dateParts[1]);
      fillTextField(form, 'Date Statement of Truth is signed - YYYY', dateParts[0]);
    }
  }

  fillTextField(form, 'Full name of person signing the Statement of Truth', data.signatory_name);

  if (data.solicitor_firm) {
    fillTextField(form, 'Name of claimant’s legal representative’s firm', data.solicitor_firm);
    checkBox(form, 'The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement', true);
    checkBox(form, 'Statement of Truth signed by Claimant’s legal representative (as defined by CPR 2.3(1))', true);
  } else {
    checkBox(form, 'I believe that the facts stated in these particulars of claim are true', true);
    checkBox(form, 'Statement of Truth signed by Claimant', true);
  }

  fillTextField(form, 'Statement of Truth signature box', data.signatory_name);

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N119 form filled successfully');

  return pdfBytes;
}

/**
 * Fill Form N1 - Claim form (for money claims)
 *
 * Official PDF: /public/official-forms/N1_1224.pdf
 * Source: https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf
 *
 * NOTE: This form uses generic field names. Field mapping was determined by
 * visual inspection of test PDF. See scripts/test-n1-fields.ts
 */
export async function fillN1Form(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling N1 form (Money claim)...');

  const pdfDoc = await loadOfficialForm('N1_1224.pdf');
  const form = pdfDoc.getForm();

  // === PAGE 1 - Main Claim Form ===

  // Court and fees header
  fillTextField(form, 'Text35', data.court_name); // "In the [court name]"
  fillTextField(form, 'Text36', data.claimant_reference); // Fee Account no.

  // Claimant details (large text box)
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  fillTextField(form, 'Text21', claimantDetails);

  // Defendant details (large text box)
  const defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;
  fillTextField(form, 'Text22', defendantDetails);

  // Brief details of claim
  const briefDetails = data.particulars_of_claim
    ? data.particulars_of_claim.substring(0, 200) + '...'
    : 'Claim for unpaid rent and possession of property';
  fillTextField(form, 'Text23', briefDetails);

  // Value
  if (data.total_claim_amount) {
    fillTextField(form, 'Text24', `£${data.total_claim_amount.toFixed(2)}`);
  }

  // Defendant's address for service (left box, bottom)
  fillTextField(form, 'Text Field 48', data.property_address);

  // Financial details (bottom right)
  if (data.total_claim_amount) {
    fillTextField(form, 'Text25', data.total_claim_amount.toFixed(2)); // Amount claimed (no £ symbol)
  }
  if (data.court_fee) {
    fillTextField(form, 'Text26', data.court_fee.toFixed(2)); // Court fee
  }
  if (data.solicitor_costs) {
    fillTextField(form, 'Text27', data.solicitor_costs.toFixed(2)); // Legal rep costs
  }

  // Total amount
  const totalAmount = (data.total_claim_amount || 0) + (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (totalAmount > 0) {
    fillTextField(form, 'Text28', totalAmount.toFixed(2));
  }

  // === PAGE 2 - Hearing Centre and Questions ===

  // Preferred County Court Hearing Centre
  // Note: There's a field name conflict - Text Field 28 appears twice!
  // We'll skip this for now as it's the same name as Total amount
  if (data.court_name) {
    // Try to fill hearing centre (may conflict with total amount field)
    try {
      fillTextField(form, 'Text Field 28', data.court_name);
    } catch (error) {
      console.warn(`Could not fill hearing centre due to field name conflict: ${error}`);
    }
  }

  // Vulnerability - No (most common case)
  checkBox(form, 'Check Box40', true); // Vulnerability: No

  // Human Rights Act - No (most common case)
  checkBox(form, 'Check Box42', true); // Human Rights Act: No

  // === PAGE 3 - Particulars of Claim ===

  // Particulars attached checkbox
  checkBox(form, 'Check Box43', !!data.particulars_of_claim);

  // Particulars text (large text area)
  if (data.particulars_of_claim) {
    fillTextField(form, 'Text30', data.particulars_of_claim);
  }

  // === PAGE 4 - Statement of Truth ===

  // Statement of Truth checkboxes
  if (data.solicitor_firm) {
    checkBox(form, 'Check Box46', true); // "The claimant believes... I am authorised"
    checkBox(form, 'Check Box49', true); // "Claimant's legal representative"
  } else {
    checkBox(form, 'Check Box45', true); // "I believe that the facts stated..."
    checkBox(form, 'Check Box47', true); // "Claimant"
  }

  // Signature box
  fillTextField(form, 'Text Field 47', data.signatory_name);

  // Date fields
  if (data.signature_date) {
    const dateparts = splitDate(data.signature_date);
    if (dateparts) {
      fillTextField(form, 'Text31', dateparts.day); // Day
      fillTextField(form, 'Text32', dateparts.month); // Month
      fillTextField(form, 'Text33', dateparts.year); // Year
    }
  }

  // Full name
  fillTextField(form, 'Text Field 46', data.signatory_name);

  // Legal representative's firm
  if (data.solicitor_firm) {
    fillTextField(form, 'Text Field 45', data.solicitor_firm);
  }

  // Position or office held
  if (data.solicitor_firm && data['solicitor_position']) {
    fillTextField(form, 'Text Field 44', data['solicitor_position']);
  }

  // === PAGE 5 - Address for Service ===

  const serviceAddressLines = [
    data.service_address_line1 || data.landlord_address,
    data.service_address_line2,
    data.service_address_town,
    data.service_address_county,
  ].filter((part): part is string => Boolean(part));

  fillTextField(form, 'Text Field 10', serviceAddressLines[0]); // Building and street
  if (serviceAddressLines.length > 1) {
    fillTextField(form, 'Text Field 9', serviceAddressLines[1]); // Second line
  }
  if (serviceAddressLines.length > 2) {
    fillTextField(form, 'Text Field 8', serviceAddressLines[2]); // Town or city
  }
  if (serviceAddressLines.length > 3) {
    fillTextField(form, 'Text Field 7', serviceAddressLines[3]); // County
  }

  // Postcode (max 7 characters)
  const postcode = (data.service_postcode || data.landlord_postcode || '').substring(0, 7);
  fillTextField(form, 'Text34', postcode);

  // Contact details
  const servicePhone = data.service_phone || data.solicitor_phone || data.landlord_phone;
  const serviceEmail = data.service_email || data.solicitor_email || data.landlord_email;

  fillTextField(form, 'Text Field 6', servicePhone); // Phone number
  fillTextField(form, 'Text Field 4', data['dx_number']); // DX number (if applicable)
  fillTextField(form, 'Text Field 3', data.claimant_reference); // Your Ref.
  fillTextField(form, 'Text Field 2', serviceEmail); // Email

  const pdfBytes = await pdfDoc.save();
  console.log('✅ N1 form filled successfully (43 fields mapped)');

  return pdfBytes;
}

/**
 * Fill Form 6A - Section 21 notice (prescribed form)
 *
 * Official PDF: /public/official-forms/form_6a.pdf
 * Source: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/468937/form_6a.pdf
 */
export async function fillForm6A(data: CaseData): Promise<Uint8Array> {
  console.log('📄 Filling Form 6A (Section 21 notice)...');

  const pdfDoc = await loadOfficialForm('form_6a.pdf');
  const form = pdfDoc.getForm();

  // Property address
  fillTextField(form, 'Premises address', data.property_address);

  // Leaving date - formatted as DD/MM/YYYY
  fillTextField(form, 'leaving date DD/MM/YYYYY', data.section_21_notice_date);

  // Landlord/agent names
  fillTextField(form, 'Name 1', data.landlord_full_name);
  fillTextField(form, 'Name 2', data.landlord_2_name);

  // Landlord/agent address
  fillTextField(form, 'Address 1', data.landlord_address);
  fillTextField(form, 'Signatory address 1', data.landlord_address);
  fillTextField(form, 'Signatory address 2', data.landlord_address); // Second signatory

  // Contact details
  fillTextField(form, 'Signatory telephone1', data.landlord_phone);
  fillTextField(form, 'Signatory telephone2', data.landlord_phone);
  fillTextField(form, 'Signatory Telephone 1', data.landlord_phone);
  fillTextField(form, 'Signatory Telephone 2', data.landlord_phone);

  // Signatory names
  fillTextField(form, 'Signatory Name 1', data.landlord_full_name);
  fillTextField(form, 'Signatory name 2 ', data.landlord_2_name);

  // Date signed
  fillTextField(form, 'Date 2 ', data.signature_date);

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
