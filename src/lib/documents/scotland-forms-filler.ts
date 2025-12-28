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
 * OFFICIAL FORM FIELD MAPPING (31 fields total):
 * ==============================================
 * Checkboxes (Application Type - Section 1):
 *   - Check Box13: Rule 65 (Assured/Short Assured 1989-2017)
 *   - Check Box14: Rule 66 (Short Assured termination)
 *   - Check Box15: Rule 77 (Regulated Tenancy pre-1989)
 *   - Check Box16: Rule 79 (Occupier termination pre-1989)
 *   - Check Box17: Rule 109 (PRT post-Dec 2017) ← Most common
 *
 * Text Fields - Section 2 (Applicant/Landlord Details):
 *   - 1: Company/organisation name
 *   - 2: Title (Mr, Mrs, etc.)
 *   - 3: First name
 *   - 4: Last name
 *   - 5: Contact address (line 1)
 *   - 6: Contact address (line 2)
 *   - 7: Contact address (line 3)
 *   - TEL: Contact telephone number
 *   - eml: Contact email address
 *   - 8: Landlord registration number
 *
 * Text Fields - Section 3 (Representative Details):
 *   - 9: Company/organisation name
 *   - 10: Title
 *   - 11: First name
 *   - 12: Last name
 *   - 13: Contact address (line 1)
 *   - 14: Contact address (line 2)
 *   - 15: Contact address (line 3)
 *   - P: Profession
 *
 * Text Fields - Section 4 (Tenant/Occupier Details):
 *   - 16: Company/organisation name
 *   - 17: Title
 *   - 18: First name
 *   - 19: Last name
 *   - 20: Property address
 *   - OTHER: Contact address if different
 *
 * Text Areas:
 *   - grounds: Section 5 - Possession/Eviction Grounds
 *   - reqd attach: Section 6 - Required Documents list
 */
export async function fillFormE(data: ScotlandCaseData): Promise<Uint8Array> {
  console.log('📄 Filling Form E (Tribunal Application for Eviction Order)...');

  const pdfDoc = await loadOfficialForm('form_e_eviction.pdf');
  const form = pdfDoc.getForm();

  // =========================================================================
  // Section 1: Application Type
  // For PRT tenancies (post 1 Dec 2017), use Rule 109
  // =========================================================================
  const tenancyStartDate = data.tenancy_start_date ? new Date(data.tenancy_start_date) : null;
  const prtCutoff = new Date('2017-12-01');

  if (tenancyStartDate && tenancyStartDate >= prtCutoff) {
    // Rule 109 - Private Residential Tenancy (most common)
    checkBox(form, 'Check Box17', true);
  } else if (tenancyStartDate && tenancyStartDate >= new Date('1989-01-02')) {
    // Rule 65 - Assured/Short Assured Tenancy (1989-2017)
    checkBox(form, 'Check Box13', true);
  }

  // =========================================================================
  // Section 2: Applicant (Landlord) Details
  // =========================================================================
  // Split landlord name into parts
  const landlordNameParts = data.landlord_full_name?.split(' ') || [];
  const landlordFirstName = landlordNameParts.slice(0, -1).join(' ') || data.landlord_full_name;
  const landlordLastName = landlordNameParts.slice(-1)[0] || '';

  fillTextField(form, '1', ''); // Company/organisation name (blank for individual)
  fillTextField(form, '2', ''); // Title - leave blank or could parse from name
  fillTextField(form, '3', landlordFirstName);
  fillTextField(form, '4', landlordLastName);

  // Split address into lines
  const landlordAddressParts = data.landlord_address?.split(',').map(s => s.trim()) || [];
  fillTextField(form, '5', landlordAddressParts[0] || data.landlord_address || '');
  fillTextField(form, '6', landlordAddressParts[1] || '');
  fillTextField(form, '7', landlordAddressParts.slice(2).join(', ') || '');

  fillTextField(form, 'TEL', data.landlord_phone || '');
  fillTextField(form, 'eml', data.landlord_email || '');
  fillTextField(form, '8', data.landlord_registration_number || '');

  // =========================================================================
  // Section 3: Representative Details (leave blank if self-representing)
  // =========================================================================
  // Fields 9-15, P are for representative - typically left blank

  // =========================================================================
  // Section 4: Tenant/Occupier Details
  // =========================================================================
  const tenantNameParts = data.tenant_full_name?.split(' ') || [];
  const tenantFirstName = tenantNameParts.slice(0, -1).join(' ') || data.tenant_full_name;
  const tenantLastName = tenantNameParts.slice(-1)[0] || '';

  fillTextField(form, '16', ''); // Company/organisation name
  fillTextField(form, '17', ''); // Title
  fillTextField(form, '18', tenantFirstName);
  fillTextField(form, '19', tenantLastName);
  fillTextField(form, '20', data.property_address || '');

  // If there's a second tenant, add to OTHER field
  if (data.tenant_2_name) {
    fillTextField(form, 'OTHER', `Second tenant: ${data.tenant_2_name}`);
  }

  // =========================================================================
  // Section 5: Possession/Eviction Grounds
  // =========================================================================
  const groundsText = data.grounds.map(g => {
    const groundNum = g.code.replace('Ground ', '');
    return `Ground ${groundNum} - ${g.title}\n\nParticulars:\n${g.particulars}${g.evidence ? `\n\nEvidence: ${g.evidence}` : ''}`;
  }).join('\n\n---\n\n');

  fillTextField(form, 'grounds', groundsText);

  // =========================================================================
  // Section 6: Required Documents
  // =========================================================================
  const requiredDocs = [
    '✓ Copy of Notice to Leave',
    '✓ Proof of service of Notice to Leave',
    '✓ Copy of tenancy agreement',
  ];

  if (data.deposit_amount) {
    requiredDocs.push('✓ Deposit protection certificate');
    requiredDocs.push(`  Scheme: ${data.deposit_scheme_name || data.deposit_scheme || 'N/A'}`);
    requiredDocs.push(`  Reference: ${data.deposit_reference || 'N/A'}`);
  }

  // Add ground-specific documents
  const hasRentArrears = data.grounds.some(g => g.code === 'Ground 1');
  if (hasRentArrears) {
    requiredDocs.push('✓ Rent statement showing arrears');
    requiredDocs.push('✓ Evidence of pre-action requirements compliance');
  }

  fillTextField(form, 'reqd attach', requiredDocs.join('\n'));

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Form E filled successfully');

  return pdfBytes;
}

/**
 * Fill Simple Procedure Claim Form (Form 3A)
 *
 * Scottish Courts and Tribunals Service form for money claims up to £5,000
 *
 * Official form: /public/official-forms/scotland/form-3a.pdf
 * Source: https://www.scotcourts.gov.uk/taking-action/simple-procedure
 *
 * OFFICIAL FORM FIELD MAPPING (74 fields total):
 * ==============================================
 * RadioGroups:
 *   - A1: Claimant type (individual/company)
 *   - A5: Contact preference
 *   - B1: Representation type
 *   - B4: Contact through representative
 *   - B5: Representative contact preference
 *   - C1: Respondent type (individual/company)
 *   - C2: Respondent known details
 *   - C6: Second respondent type
 *   - C10: Second respondent known details
 *   - D3: Consumer credit agreement
 *   - D5: Claim type selection
 *   - D6: Time order request
 *
 * Section A - Claimant Details:
 *   - A2 Name, A2 Middle name, A2 Surname, A2 Trading name (individual)
 *   - A3 Company Name, A3 Company type, A3 Company registration, A3 Trading name
 *   - A4 Address, A4 City, A4 Postcode, A4 Email address
 *
 * Section B - Representative:
 *   - B2 Representative Name, B2 Representative Surname, B2 Representative Organisation
 *   - B3 Representative Address, B3 Representative City, B3 Representative Postcode, B3 Representative Email
 *
 * Section C - Respondent:
 *   - C3 Respondent Name/Middle name/Surname/Trading name
 *   - C4 Respondent Company Name/type/registration/Trading name
 *   - C5 Respondent Address/City/Postcode/Email
 *   - C7/C8 Second respondent fields
 *
 * Section D - Claim Details:
 *   - D1 Background, D2 Address/City/Postcode/Details
 *   - D4 Details of consumer credit agreement
 *   - D5 Sum of money, D5 Deliver items, D5 Do something for me
 *   - D7 Why should your claim be successful
 *   - D8 Steps to settle your dispute
 *
 * Section E - Evidence:
 *   - E1 Witnesses, E2 Documents, E3 Evidence
 *
 * Checkboxes: D5a (money), D5b (items), D5c (action)
 */
export async function fillSimpleProcedureClaim(data: ScotlandMoneyClaimData): Promise<Uint8Array> {
  console.log('📄 Filling Simple Procedure Claim Form (Form 3A)...');

  const pdfDoc = await loadOfficialForm('form-3a.pdf');
  const form = pdfDoc.getForm();

  // =========================================================================
  // Section A - About You (Claimant/Pursuer)
  // =========================================================================
  // A1: Individual or Company - select via RadioGroup
  try {
    const a1Radio = form.getRadioGroup('A1');
    const options = a1Radio.getOptions();
    // Assume landlords are individuals by default
    if (options.length >= 1) {
      a1Radio.select(options[0]); // Individual
    }
  } catch (e) {
    console.warn('Could not set A1 radio group');
  }

  // A2: Individual claimant details
  const landlordNameParts = data.landlord_full_name?.split(' ') || [];
  const landlordFirstName = landlordNameParts[0] || '';
  const landlordMiddleName = landlordNameParts.length > 2 ? landlordNameParts.slice(1, -1).join(' ') : '';
  const landlordSurname = landlordNameParts.length > 1 ? landlordNameParts[landlordNameParts.length - 1] : '';

  fillTextField(form, 'A2 Name', landlordFirstName);
  fillTextField(form, 'A2 Middle name', landlordMiddleName);
  fillTextField(form, 'A2 Surname', landlordSurname);
  fillTextField(form, 'A2 Trading name', '');

  // A4: Contact details
  fillTextField(form, 'A4 Address', data.landlord_address || '');
  fillTextField(form, 'A4 City', ''); // Could parse from address
  fillTextField(form, 'A4 Postcode', data.landlord_postcode || '');
  fillTextField(form, 'A4 Email address', data.landlord_email || '');

  // A5: Contact preference
  try {
    const a5Radio = form.getRadioGroup('A5');
    const options = a5Radio.getOptions();
    if (options.length >= 1) {
      a5Radio.select(options[0]); // Default to first option
    }
  } catch (e) {
    console.warn('Could not set A5 radio group');
  }

  // =========================================================================
  // Section B - Representative (skip if self-representing)
  // =========================================================================
  // B1: Representation type - typically self-representing
  try {
    const b1Radio = form.getRadioGroup('B1');
    const options = b1Radio.getOptions();
    if (options.length >= 1) {
      b1Radio.select(options[0]); // Self-representing
    }
  } catch (e) {
    console.warn('Could not set B1 radio group');
  }

  // =========================================================================
  // Section C - About the Respondent (Defender)
  // =========================================================================
  // C1: Respondent type
  try {
    const c1Radio = form.getRadioGroup('C1');
    const options = c1Radio.getOptions();
    if (options.length >= 1) {
      c1Radio.select(options[0]); // Individual
    }
  } catch (e) {
    console.warn('Could not set C1 radio group');
  }

  // C3: Respondent individual details
  const tenantNameParts = data.tenant_full_name?.split(' ') || [];
  const tenantFirstName = tenantNameParts[0] || '';
  const tenantMiddleName = tenantNameParts.length > 2 ? tenantNameParts.slice(1, -1).join(' ') : '';
  const tenantSurname = tenantNameParts.length > 1 ? tenantNameParts[tenantNameParts.length - 1] : '';

  fillTextField(form, 'C3 Respondent Name', tenantFirstName);
  fillTextField(form, 'C3 Respondent Middle name', tenantMiddleName);
  fillTextField(form, 'C3 Respondent Surname', tenantSurname);
  fillTextField(form, 'C3 Respondent Trading name', '');

  // C5: Respondent address
  fillTextField(form, 'C5 Respondent Address', data.property_address || '');
  fillTextField(form, 'C5 Respondent City', '');
  fillTextField(form, 'C5 Respondent Postcode', data.property_postcode || '');
  fillTextField(form, 'C5 Respondent Email', '');

  // Second tenant if applicable
  if (data.tenant_2_name) {
    const tenant2Parts = data.tenant_2_name.split(' ');
    fillTextField(form, 'C7 Respondent 2 Name', tenant2Parts[0] || '');
    fillTextField(form, 'C7 Respondent 2 Surname', tenant2Parts[tenant2Parts.length - 1] || '');
  }

  // =========================================================================
  // Section D - About Your Claim
  // =========================================================================
  // D1: Background to your claim
  const background = data.particulars_of_claim ||
    `This claim relates to a tenancy at ${data.property_address}. ` +
    `The tenancy commenced on ${data.tenancy_start_date || '[date]'} with rent of ${formatCurrency(data.rent_amount || 0)} per ${data.rent_frequency || 'month'}. ` +
    (data.basis_of_claim === 'rent_arrears'
      ? `The respondent failed to pay rent as agreed, resulting in arrears of ${formatCurrency(data.arrears_total || 0)}.`
      : data.basis_of_claim === 'damages'
      ? `The respondent caused damage to the property beyond normal wear and tear.`
      : `The respondent failed to pay rent and caused damage to the property.`);

  fillTextField(form, 'D1 Background', background);

  // D2: Address where dispute arose
  fillTextField(form, 'D2 Address', data.property_address || '');
  fillTextField(form, 'D2 City', '');
  fillTextField(form, 'D2 Postcode', data.property_postcode || '');
  fillTextField(form, 'D2 Details', `Tenancy property - ${data.property_address}`);

  // D5: What you want - check money checkbox and fill amount
  checkBox(form, 'D5a', true); // Payment of money
  fillTextField(form, 'D5 Sum of money', formatCurrency(data.total_claim_amount));

  // D7: Why your claim should be successful
  const whySuccessful = `The claimant is the landlord of the property at ${data.property_address}. ` +
    `The respondent entered into a tenancy agreement and agreed to pay rent of ${formatCurrency(data.rent_amount || 0)} per ${data.rent_frequency || 'month'}. ` +
    (data.arrears_total ? `The respondent has failed to pay rent totalling ${formatCurrency(data.arrears_total)}. ` : '') +
    (data.damages_total ? `The respondent has caused damage costing ${formatCurrency(data.damages_total)} to repair. ` : '') +
    `The claimant is entitled to recover these sums.`;

  fillTextField(form, 'D7 Why should your claim be successful', whySuccessful);

  // D8: Steps to settle
  const steps = data.attempts_to_resolve ||
    'The claimant sent written demands for payment. ' +
    'The respondent failed to make payment or engage to resolve the debt. ' +
    'The claimant has complied with pre-action protocol requirements.';

  fillTextField(form, 'D8 Steps to settle your dispute', steps);

  // =========================================================================
  // Section E - Evidence
  // =========================================================================
  const documents = [
    'Tenancy agreement',
    'Rent statement/schedule of arrears',
    'Demand letters sent to respondent',
  ];
  if (data.damages_total) {
    documents.push('Photographs of damage');
    documents.push('Repair quotes/invoices');
  }

  fillTextField(form, 'E2 Documents', documents.join('\n'));
  fillTextField(form, 'E3 Evidence', data.evidence_summary || 'Documentary evidence as listed above.');

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
 * Data interface for Simple Procedure Response Form (Form 4A)
 */
export interface ScotlandSimpleProcedureResponseData {
  // Case details
  sheriff_court: string;
  claimant_name: string;
  case_reference_number?: string;

  // Respondent details (Section A)
  is_individual: boolean; // true = individual, false = company
  respondent_first_name?: string;
  respondent_middle_name?: string;
  respondent_surname?: string;
  respondent_trading_name?: string;
  company_name?: string;
  company_registration_number?: string;
  company_trading_name?: string;

  // Contact details (Section A4)
  respondent_address: string;
  respondent_city: string;
  respondent_postcode: string;
  respondent_email?: string;
  contact_preference: 'online' | 'post' | 'email';

  // Representation (Section B)
  representation_type: 'self' | 'solicitor' | 'non_solicitor';
  representative_first_name?: string;
  representative_surname?: string;
  representative_organisation?: string;
  representative_address?: string;
  representative_city?: string;
  representative_postcode?: string;
  representative_email?: string;
  contact_through_representative?: boolean;
  representative_contact_preference?: 'online' | 'post' | 'email';

  // Response type (Section C)
  response_type: 'admit_settle' | 'dispute' | 'admit_time_to_pay';

  // Response details (Section D)
  background_to_claim?: string; // D1
  steps_to_settle?: string; // D2
  has_additional_respondents?: boolean; // D3
  additional_respondents?: Array<{
    name: string;
    address: string;
    reason: string;
  }>;
  court_serve_additional_respondents?: boolean; // D5
}

/**
 * Fill Simple Procedure Response Form (Form 4A)
 *
 * Scottish Courts and Tribunals Service form for responding to Simple Procedure claims
 *
 * Official form: /public/official-forms/scotland/simple_procedure_response_form.pdf
 * Source: https://www.scotcourts.gov.uk/taking-action/simple-procedure
 *
 * OFFICIAL FORM FIELD MAPPING (46 fields total):
 * ==============================================
 * Header Fields:
 *   - Text1: Sheriff Court name
 *   - Text2: Claimant name (header)
 *   - 4A_Respondent: Respondent name (header)
 *   - 4A_CaseReferenceNumber: Case reference
 *
 * Section A - About You:
 *   - 4A_A1_RadioGroup: Individual vs Company
 *   - 4A_A2_Name: First name
 *   - 4A_A2_MiddleName: Middle name
 *   - 4A_A2_Surname: Surname
 *   - 4A_A2_TradingName: Trading name
 *   - 4A_A4_Address: Address
 *   - 4A_A4_City: City
 *   - 4A_A4_Postcode: Postcode
 *   - 4A_A4_Email: Email
 *   - 4A_A5_RadioGroup: Contact preference (online/post/email)
 *
 * Section B - Representation:
 *   - 4A_B1_RadioGroup: Representation type
 *   - 4A_B2_Name: Rep first name
 *   - 4A_B2_Surname: Rep surname
 *   - 4A_B2_OrganisationName: Rep organisation
 *   - 4A_B3_Address: Rep address
 *   - 4A_B3_City: Rep city
 *   - 4A_B3_Postcode: Rep postcode
 *   - 4A_B3_Email: Rep email
 *   - 4A_B4_RadioGroup: Contact through rep (yes/no)
 *   - 4A_B5_RadioGroup: Rep contact preference
 *
 * Section C - Response Type:
 *   - 4A_C_RadioGroup: Response type (C1/C2/C3)
 *
 * Section D - Response Details:
 *   - 4A_D1: Background to claim
 *   - 4A_D2: Steps to settle
 *   - 4A_D3_RadioGroup: Additional respondents (yes/no)
 *   - Text3-Text8: Additional respondent details
 *   - 4A_D5_RadioGroup: Court serve (yes/no)
 */
export async function fillSimpleProcedureResponse(data: ScotlandSimpleProcedureResponseData): Promise<Uint8Array> {
  console.log('📄 Filling Simple Procedure Response Form (Form 4A)...');

  const pdfDoc = await loadOfficialForm('simple_procedure_response_form.pdf');
  const form = pdfDoc.getForm();

  // =========================================================================
  // Header Fields
  // =========================================================================
  fillTextField(form, 'Text1', data.sheriff_court || '');
  fillTextField(form, 'Text2', data.claimant_name || '');

  // Construct respondent name for header
  const respondentFullName = data.is_individual
    ? `${data.respondent_first_name || ''} ${data.respondent_surname || ''}`.trim()
    : data.company_name || '';
  fillTextField(form, '4A_Respondent', respondentFullName);
  fillTextField(form, '4A_CaseReferenceNumber', data.case_reference_number || '');

  // =========================================================================
  // Section A - About You
  // =========================================================================
  // A1: Individual or Company
  try {
    const a1Radio = form.getRadioGroup('4A_A1_RadioGroup');
    const options = a1Radio.getOptions();
    if (options.length >= 2) {
      a1Radio.select(data.is_individual ? options[0] : options[1]);
    }
  } catch (e) {
    console.warn('Could not set A1 radio group');
  }

  // A2: Individual details
  if (data.is_individual) {
    fillTextField(form, '4A_A2_Name', data.respondent_first_name || '');
    fillTextField(form, '4A_A2_MiddleName', data.respondent_middle_name || '');
    fillTextField(form, '4A_A2_Surname', data.respondent_surname || '');
    fillTextField(form, '4A_A2_TradingName', data.respondent_trading_name || '');
  }

  // A4: Contact details
  fillTextField(form, '4A_A4_Address', data.respondent_address || '');
  fillTextField(form, '4A_A4_City', data.respondent_city || '');
  fillTextField(form, '4A_A4_Postcode', data.respondent_postcode || '');
  fillTextField(form, '4A_A4_Email', data.respondent_email || '');

  // A5: Contact preference
  try {
    const a5Radio = form.getRadioGroup('4A_A5_RadioGroup');
    const options = a5Radio.getOptions();
    const prefIndex = data.contact_preference === 'online' ? 0 : data.contact_preference === 'post' ? 1 : 2;
    if (options.length > prefIndex) {
      a5Radio.select(options[prefIndex]);
    }
  } catch (e) {
    console.warn('Could not set A5 radio group');
  }

  // =========================================================================
  // Section B - Representation
  // =========================================================================
  // B1: Representation type
  try {
    const b1Radio = form.getRadioGroup('4A_B1_RadioGroup');
    const options = b1Radio.getOptions();
    const repIndex = data.representation_type === 'self' ? 0 : data.representation_type === 'solicitor' ? 1 : 2;
    if (options.length > repIndex) {
      b1Radio.select(options[repIndex]);
    }
  } catch (e) {
    console.warn('Could not set B1 radio group');
  }

  // B2 & B3: Representative details (if applicable)
  if (data.representation_type !== 'self') {
    fillTextField(form, '4A_B2_Name', data.representative_first_name || '');
    fillTextField(form, '4A_B2_Surname', data.representative_surname || '');
    fillTextField(form, '4A_B2_OrganisationName', data.representative_organisation || '');
    fillTextField(form, '4A_B3_Address', data.representative_address || '');
    fillTextField(form, '4A_B3_City', data.representative_city || '');
    fillTextField(form, '4A_B3_Postcode', data.representative_postcode || '');
    fillTextField(form, '4A_B3_Email', data.representative_email || '');

    // B4: Contact through representative
    try {
      const b4Radio = form.getRadioGroup('4A_B4_RadioGroup');
      const options = b4Radio.getOptions();
      if (options.length >= 2) {
        b4Radio.select(data.contact_through_representative ? options[0] : options[1]);
      }
    } catch (e) {
      console.warn('Could not set B4 radio group');
    }

    // B5: Representative contact preference
    if (data.representative_contact_preference) {
      try {
        const b5Radio = form.getRadioGroup('4A_B5_RadioGroup');
        const options = b5Radio.getOptions();
        const prefIndex = data.representative_contact_preference === 'online' ? 0 :
                         data.representative_contact_preference === 'post' ? 1 : 2;
        if (options.length > prefIndex) {
          b5Radio.select(options[prefIndex]);
        }
      } catch (e) {
        console.warn('Could not set B5 radio group');
      }
    }
  }

  // =========================================================================
  // Section C - Response Type
  // =========================================================================
  try {
    const cRadio = form.getRadioGroup('4A_C_RadioGroup');
    const options = cRadio.getOptions();
    const respIndex = data.response_type === 'admit_settle' ? 0 :
                     data.response_type === 'dispute' ? 1 : 2;
    if (options.length > respIndex) {
      cRadio.select(options[respIndex]);
    }
  } catch (e) {
    console.warn('Could not set C radio group');
  }

  // =========================================================================
  // Section D - Response Details
  // =========================================================================
  // D1: Background to claim
  fillTextField(form, '4A_D1', data.background_to_claim || '');

  // D2: Steps to settle
  fillTextField(form, '4A_D2', data.steps_to_settle || '');

  // D3: Additional respondents
  try {
    const d3Radio = form.getRadioGroup('4A_D3_RadioGroup');
    const options = d3Radio.getOptions();
    if (options.length >= 2) {
      d3Radio.select(data.has_additional_respondents ? options[0] : options[1]);
    }
  } catch (e) {
    console.warn('Could not set D3 radio group');
  }

  // D4: Additional respondent details (Text3-Text8)
  if (data.additional_respondents && data.additional_respondents.length > 0) {
    const additionalRespondentText = data.additional_respondents.map((r, i) =>
      `${i + 1}. Name: ${r.name}\nAddress: ${r.address}\nReason: ${r.reason}`
    ).join('\n\n');

    // Try to fill in the text fields for additional respondents
    fillTextField(form, 'Text3', data.additional_respondents[0]?.name || '');
    fillTextField(form, 'Text4', data.additional_respondents[0]?.address || '');
    fillTextField(form, 'Text5', data.additional_respondents[0]?.reason || '');
    if (data.additional_respondents.length > 1) {
      fillTextField(form, 'Text6', data.additional_respondents[1]?.name || '');
      fillTextField(form, 'Text7', data.additional_respondents[1]?.address || '');
      fillTextField(form, 'Text8', data.additional_respondents[1]?.reason || '');
    }
  }

  // D5: Court serve additional respondents
  if (data.has_additional_respondents) {
    try {
      const d5Radio = form.getRadioGroup('4A_D5_RadioGroup');
      const options = d5Radio.getOptions();
      if (options.length >= 2) {
        d5Radio.select(data.court_serve_additional_respondents ? options[0] : options[1]);
      }
    } catch (e) {
      console.warn('Could not set D5 radio group');
    }
  }

  const pdfBytes = await pdfDoc.save();
  console.log('✅ Simple Procedure Response Form filled successfully');

  return pdfBytes;
}

/**
 * Main entry point - fill any Scotland official form
 */
export async function fillScotlandOfficialForm(
  formType: 'notice_to_leave' | 'form_e' | 'simple_procedure_claim' | 'simple_procedure_response',
  data: ScotlandCaseData | ScotlandMoneyClaimData | ScotlandSimpleProcedureResponseData
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
    case 'simple_procedure_response':
      return await fillSimpleProcedureResponse(data as ScotlandSimpleProcedureResponseData);
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
