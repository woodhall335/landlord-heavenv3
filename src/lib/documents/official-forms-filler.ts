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

import { PDFDocument, PDFForm, PDFTextField } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { generateArrearsBreakdownForCourt } from './arrears-schedule-mapper';
import { flattenPdf } from './pdf-utils';

const OFFICIAL_FORMS_ROOT = path.join(process.cwd(), 'public', 'official-forms');
export const OFFICIAL_FORM_OUTPUT_ROOT = path.join(process.cwd(), '.tmp', 'official-form-output');

// =============================================================================
// JURISDICTION-BASED FORM SELECTION
// =============================================================================

/**
 * Court form filenames by jurisdiction.
 *
 * England uses the standard -eng.pdf forms.
 * Wales uses bilingual Wales-specific versions (required for Welsh courts).
 *
 * CRITICAL: Wales eviction_pack routes (wales_section_173, wales_fault_based)
 * MUST use Wales-specific forms. Using England forms in Wales is non-compliant.
 */
type CourtFormJurisdiction = 'england' | 'wales';

const COURT_FORM_FILES: Record<CourtFormJurisdiction, { n5: string; n5b: string; n119: string }> = {
  england: {
    n5: 'n5-eng.pdf',
    n5b: 'n5b-eng.pdf',
    n119: 'n119-eng.pdf',
  },
  wales: {
    n5: 'N5_WALES_1222.pdf',
    n5b: 'N5B_WALES_0323.pdf',
    n119: 'N119_WALES_1222.pdf',
  },
};

/**
 * Get the correct form filename for a jurisdiction.
 *
 * @param formType - The type of form (n5, n5b, n119)
 * @param jurisdiction - The jurisdiction (england, wales). Defaults to england for safety.
 * @returns The filename of the correct form to use
 */
export function getFormFilename(formType: 'n5' | 'n5b' | 'n119', jurisdiction?: string): string {
  // Normalize jurisdiction - only england and wales use these court forms
  const normalizedJurisdiction: CourtFormJurisdiction =
    jurisdiction === 'wales' ? 'wales' : 'england';

  return COURT_FORM_FILES[normalizedJurisdiction][formType];
}

/**
 * Get all court form filenames for a jurisdiction.
 * Exported for testing/validation purposes.
 */
export function getCourtFormFiles(jurisdiction: 'england' | 'wales'): { n5: string; n5b: string; n119: string } {
  return COURT_FORM_FILES[jurisdiction];
}

function assertNotInOfficialFormsDir(targetPath: string) {
  const normalizedTarget = path.resolve(targetPath);
  const normalizedRoot = path.resolve(OFFICIAL_FORMS_ROOT);

  if (normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error(
      `Refusing to write generated output inside public/official-forms. Use a tmp path such as ${path.join(
        OFFICIAL_FORM_OUTPUT_ROOT,
        '<filename>.pdf',
      )}.`,
    );
  }
}

// =============================================================================
// FIELD NAME CONSTANTS - Authoritative field names from PDF inventory
// =============================================================================

/**
 * N5 form field names (34 text fields, 20 checkboxes)
 * Source: public/official-forms/n5-eng.pdf (official HMCTS form, 123KB)
 * Field inventory updated: December 2025
 */
const N5_FIELDS = {
  // Header fields
  COURT: 'In the court',
  CLAIM_NO: 'claimno',
  CLAIM_NO_2: 'claim no',
  FEE_ACCOUNT: 'Fee account no',

  // Party details
  CLAIMANT_DETAILS: "claimant's details",
  DEFENDANT_DETAILS: "defendant's details",
  POSSESSION_OF: 'possession of',
  ADDRESS_FOR_SERVICE: 'address for service',

  // Hearing details
  HEARD_ON: 'heardon',
  YEAR: 'year',
  TIME: 'time',
  LOCATION: 'location',
  ISSUE_DATE: 'issuedate',

  // Fees
  COURT_FEE: 'courtfee',
  SOLICITOR_FEE: 'solfee',
  TOTAL: 'total',

  // Other reason details
  OTHER_REASON_DETAILS: 'some other reason - details',

  // Statement of Truth
  STATEMENT_SIGNATURE: 'Statement of Truth signature box',
  STATEMENT_DATE_DD: 'Date the Statement of Truth is signed - DD',
  STATEMENT_DATE_MM: 'Date the Statement of Truth is signed - MM',
  STATEMENT_DATE_YYYY: 'Date the Statement of Truth is signed - YYYY',
  SIGNATORY_NAME: 'Full name of the person signing the Statement of Truth',
  SOLICITOR_FIRM: "Name of claimant's legal representative's firm",
  POSITION_HELD: 'If signing on behalf of firm or company give position or office held',

  // Service address
  ADDRESS_POSTCODE: "Postcode - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_TOWN: "Town or city - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_BUILDING: "building and street - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_LINE2: "Second line of address - Claimant's or claimant's legal representative's address to which documents or payments should be sent",
  ADDRESS_COUNTY: "County (optional) - Claimant's or claimant's legal representative's address to which documents or payments should be sent",

  // Contact details
  FAX: 'If applicable, fax number',
  PHONE: 'If applicable, phone number',
  REFERENCE: 'If applicable, your reference',
  DX: 'If applicable, DX number',
  EMAIL: 'If applicable, email address',
} as const;

/**
 * N5 form checkbox field names (20 checkboxes)
 * Source: public/official-forms/n5-eng.pdf
 */
const N5_CHECKBOXES = {
  // Grounds for possession
  RENT_ARREARS: 'rent arrears - yes',
  OTHER_BREACH_TENANCY: 'other breach of tenancy - yes',
  FORFEITURE: 'forfeiture of the lease - yes',
  MORTGAGE_ARREARS: 'mortgage arrears - yes',
  OTHER_BREACH_MORTGAGE: 'other breach of the mortgage - yes',
  TRESPASS: 'trespass - yes',
  OTHER: 'other - yes',
  ANTI_SOCIAL_BEHAVIOUR: 'anti-social behaviour - yes',
  UNLAWFUL_USE: 'unlawful use - yes',

  // Demotion of tenancy
  DEMOTION_YES: 'demotion of tenancy - yes',
  DEMOTION_NO: 'demotion of tenancy - no',

  // Right to buy suspension
  RIGHT_TO_BUY_YES: 'order suspending the right to buy - yes',
  RIGHT_TO_BUY_NO: 'order suspending the right to buy - no',

  // Human Rights Act
  HRA_YES: 'HRA - yes',
  HRA_NO: 'HRA - no',

  // Statement of Truth
  SOT_BELIEVES: 'I believe that the facts stated in this clam form are true',
  SOT_AUTHORISED: 'The Claimant believes that the facts stated in this claim form are true. I am authorised by the claimant to sign this statement',
  SOT_CLAIMANT: 'Statement of Truth is signed by the Claimant',
  SOT_LITIGATION_FRIEND: 'Statement of Truth is signed by the Litigation friend (where claimant is a child or a patient)',
  SOT_LEGAL_REP: "Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))",
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
  // Compliance dates - Q15-Q18
  // Q15: EPC provided date
  EPC_PROVIDED_DATE_DAY: '15. On what date was the EPC provided to the Defendant? Day',
  EPC_PROVIDED_DATE_MONTH: '15. On what date was the EPC provided to the Defendant? Month',
  EPC_PROVIDED_DATE_YEAR: '15. On what date was the EPC provided to the Defendant? Year',
  // Q16: Gas safety before occupation
  GAS_SAFETY_BEFORE_OCCUPATION_DATE_DAY: '16. On what date was the current gas safety record made available to the Defendant before they occupied the property? Day',
  GAS_SAFETY_BEFORE_OCCUPATION_DATE_MONTH: '16. On what date was the current gas safety record made available to the Defendant before they occupied the property? Month',
  GAS_SAFETY_BEFORE_OCCUPATION_DATE_YEAR: '16. On what date was the current gas safety record made available to the Defendant before they occupied the property? Year',
  // Q17a: Date of current gas safety check
  GAS_SAFETY_CHECK_DATE_DAY: '17a. On what date was the current gas safety check carried out? Day',
  GAS_SAFETY_CHECK_DATE_MONTH: '17a. On what date was the current gas safety check carried out? Month',
  GAS_SAFETY_CHECK_DATE_YEAR: '17a. On what date was the current gas safety check carried out? Year',
  // Q17b: Date gas safety record served
  GAS_SAFETY_SERVED_DATE_DAY: '17b. On what date was the current gas safety record served on the Defendant? Day',
  GAS_SAFETY_SERVED_DATE_MONTH: '17b. On what date was the current gas safety record served on the Defendant? Month',
  GAS_SAFETY_SERVED_DATE_YEAR: '17b. On what date was the current gas safety record served on the Defendant? Year',
  // Q18c: Date How to Rent provided
  HOW_TO_RENT_DATE_DAY: '18c. On what date was the current version of the document provided? Day',
  HOW_TO_RENT_DATE_MONTH: '18c. On what date was the current version of the document provided? Month',
  HOW_TO_RENT_DATE_YEAR: '18c. On what date was the current version of the document provided? Year',
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
  ATTACHMENT_HOW_TO_RENT: 'Copy of the How to Rent document marked H',
  // Q9a-Q9g - AST Verification (Statement of Truth - MANDATORY)
  Q9A_AFTER_FEB_1997_YES: '9a. Was the tenancy created on or after 28 February 1997? Yes',
  Q9A_AFTER_FEB_1997_NO: '9a. Was the tenancy created on or after 28 February 1997? No',
  Q9B_NO_NOTICE_NOT_AST_YES: '9b. Has notice been given to the Defendant that the tenancy is not an assured shorthold tenancy? Yes',
  Q9B_NO_NOTICE_NOT_AST_NO: '9b. Has notice been given to the Defendant that the tenancy is not an assured shorthold tenancy? No',
  Q9C_NO_EXCLUSION_CLAUSE_YES: '9c. Does the tenancy agreement contain a provision to the effect that the tenancy is not an assured shorthold tenancy? Yes',
  Q9C_NO_EXCLUSION_CLAUSE_NO: '9c. Does the tenancy agreement contain a provision to the effect that the tenancy is not an assured shorthold tenancy? No',
  Q9D_NOT_AGRICULTURAL_YES: '9d. Is the Defendant an agricultural worker who occupies the premises as part of his employment? Yes',
  Q9D_NOT_AGRICULTURAL_NO: '9d. Is the Defendant an agricultural worker who occupies the premises as part of his employment? No',
  Q9E_NOT_SUCCESSION_YES: '9e. Did the tenancy arise on the death of a tenant under a Rent Act protected tenancy? Yes',
  Q9E_NOT_SUCCESSION_NO: '9e. Did the tenancy arise on the death of a tenant under a Rent Act protected tenancy? No',
  Q9F_NOT_FORMER_SECURE_YES: '9f. Was the tenancy formerly a secure tenancy? Yes',
  Q9F_NOT_FORMER_SECURE_NO: '9f. Was the tenancy formerly a secure tenancy? No',
  Q9G_NOT_SCHEDULE_10_YES: '9g. Was the tenancy granted under Schedule 10 to the Local Government and Housing Act 1989? Yes',
  Q9G_NOT_SCHEDULE_10_NO: '9g. Was the tenancy granted under Schedule 10 to the Local Government and Housing Act 1989? No',
  // Q15 - EPC provided
  Q15_EPC_PROVIDED_YES: '15. Has the Claimant given a copy of the Energy Performance Certificate to the Defendant? Yes',
  Q15_EPC_PROVIDED_NO: '15. Has the Claimant given a copy of the Energy Performance Certificate to the Defendant? No',
  // Q16 - Gas safety before occupation (only if gas in property)
  Q16_GAS_BEFORE_OCCUPATION_YES: '16. Was a current gas safety record made available to the Defendant before they occupied the property? Yes',
  Q16_GAS_BEFORE_OCCUPATION_NO: '16. Was a current gas safety record made available to the Defendant before they occupied the property? No',
  Q16_NO_GAS: '16. There is no gas at the property',
  // Q17 - Gas safety record served
  Q17_GAS_SERVED_YES: '17. Is the Defendant in possession of a copy of the current gas safety record? Yes',
  Q17_GAS_SERVED_NO: '17. Is the Defendant in possession of a copy of the current gas safety record? No',
  // Q18a-d - How to Rent guide
  Q18A_HOW_TO_RENT_PROVIDED_YES: '18a. Was the Defendant given a copy of the Department for Communities and Local Government document entitled How to rent: the checklist for renting in England? Yes',
  Q18A_HOW_TO_RENT_PROVIDED_NO: '18a. Was the Defendant given a copy of the Department for Communities and Local Government document entitled How to rent: the checklist for renting in England? No',
  Q18B_TENANCY_BEFORE_OCT_2015_YES: '18b. Did the tenancy begin before 1 October 2015? Yes',
  Q18B_TENANCY_BEFORE_OCT_2015_NO: '18b. Did the tenancy begin before 1 October 2015? No',
  Q18D_HOW_TO_RENT_HARDCOPY: '18d. Was the How to Rent document provided by way of hard copy? Yes',
  Q18D_HOW_TO_RENT_EMAIL: '18d. Was the How to Rent document provided by email? Yes',
  // Q19 - Tenant Fees Act 2019
  Q19_PROHIBITED_PAYMENT_YES: '19. Has any payment that is prohibited by section 1 of the Tenant Fees Act 2019 been required of, or received from, the Defendant, that has not been repaid? Yes',
  Q19_PROHIBITED_PAYMENT_NO: '19. Has any payment that is prohibited by section 1 of the Tenant Fees Act 2019 been required of, or received from, the Defendant, that has not been repaid? No',
  Q19B_HOLDING_DEPOSIT_YES: '19b. Was a holding deposit paid in connection with the grant of the tenancy on or after 1 June 2019? Yes',
  Q19B_HOLDING_DEPOSIT_NO: '19b. Was a holding deposit paid in connection with the grant of the tenancy on or after 1 June 2019? No',
  // Q20 - Paper determination consent
  Q20_PAPER_DETERMINATION_YES: '20. If the Defendant responds and seeks a postponement of possession, do you agree to the matter being dealt with without a hearing? Yes',
  Q20_PAPER_DETERMINATION_NO: '20. If the Defendant responds and seeks a postponement of possession, do you agree to the matter being dealt with without a hearing? No',
} as const;

/**
 * N119 form field names (38 text fields, 16 checkboxes)
 * Source: public/official-forms/n119-eng.pdf (official HMCTS form, 84.5KB)
 * Field inventory updated: December 2025
 */
const N119_FIELDS = {
  // Header
  COURT: 'name of court',
  CLAIM_NO: 'claim no',
  CLAIMANT: 'name of claimant',
  DEFENDANT: 'name of defendant',

  // Property details
  POSSESSION_OF: 'The claimant has a right to possession of:',
  // Note: PDF field uses curly apostrophe (U+2019 = ') not straight apostrophe (')
  // This MUST match exactly or the field won't be found
  OCCUPANTS: "To the best of the claimant\u2019s knowledge the following persons are in possession of the property:",

  // Tenancy details (Section 3)
  TENANCY_TYPE: '3(a) Type of tenancy',
  TENANCY_DATE: '3(a) Date of tenancy',
  RENT: '3(b) The current rent is',
  RENT_WEEKLY: '3(b) The current rent is payable each week',
  RENT_FORTNIGHTLY: '3(b) The current rent is payable each fortnight',
  RENT_MONTHLY: '3(b) The current rent is payable each month',
  RENT_OTHER_PERIOD: '3(b) The current rent is payable each - specify the period',
  DAILY_RATE: '3(c) Any unpaid rent or charge for use and occupation should be calculated at £',

  // Reasons for possession (Section 4)
  REASON_A: '4. (a) The reason the claimant is asking for possession is:',
  REASON_B: '4. (b) The reason the claimant is asking for possession is:',
  REASON_C: '4. (c) The reason the claimant is asking for possession is:',

  // Steps taken (Section 5)
  STEPS_TAKEN: '5. The following steps have already been taken to recover any arrears:',

  // Notice details (Section 6)
  NOTICE_OTHER_TYPE: '6. Other type of notice',
  NOTICE_DATE_DAY_MONTH: '6. Day and month notice served',
  NOTICE_DATE_YEAR: '6. Year notice served',

  // Defendant circumstances (Section 7) - uses curly apostrophe (U+2019)
  DEFENDANT_CIRCUMSTANCES: "7. The following information is known about the defendant\u2019s circumstances:",

  // Financial info (Section 8)
  FINANCIAL_INFO: '8. The claimant is asking the court to take the following financial or other information into account when making its decision whether or not to grant an order for possession:',

  // Forfeiture relief (Section 9)
  FORFEITURE_NAME: '9. (b) Entitled to relief against forfeiture - name',
  FORFEITURE_ADDRESS: '9. (b) Entitled to relief against forfeiture - address',

  // Claimant type (Section 13)
  CLAIMANT_TYPE_DETAILS: '13. Details if the claimant is some other entity',

  // Demotion (Section 15)
  DEMOTION_DETAILS: '15. The claimant is claiming demotion of tenancy',
  RIGHT_TO_BUY_DETAILS_1: '15. The claimant is claiming an order suspending the right to buy 1',
  RIGHT_TO_BUY_DETAILS_2: '15. The claimant is claiming an order suspending the right to buy 2',
  DEMOTED_TENANCY_TERMS: 'if the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy, please give details',
  CONDUCT_DETAILS: 'details of the conduct alleged and any other matters relied upon',

  // Statement of Truth
  STATEMENT_SIGNATURE: 'Statement of Truth signature box',
  STATEMENT_DATE_MM: 'Date Statement of Truth is signed - MM',
  STATEMENT_DATE_DD: 'Date Statement of Truth is signed - DD',
  STATEMENT_DATE_YYYY: 'Date Statement of Truth is signed - YYYY',
  SIGNATORY_NAME: 'Full name of person signing the Statement of Truth',
  // Uses curly apostrophes (U+2019)
  SOLICITOR_FIRM: "Name of claimant\u2019s legal representative\u2019s firm",
  POSITION_HELD: 'If signing on behalf of firm or company give position or office held',
} as const;

/**
 * N119 form checkbox field names (16 checkboxes)
 * Source: public/official-forms/n119-eng.pdf
 */
const N119_CHECKBOXES = {
  // Demotion/suspension order (Section 11)
  DEMOTION_ORDER_YES: '11. In the alternative to possession, is the claimant asking the court to make a demotion order or an order suspending the right to buy? Yes',
  DEMOTION_ORDER_NO: '11. In the alternative to possession, is the claimant asking the court to make a demotion order or an order suspending the right to buy? No',

  // Demotion claim basis (Section 12)
  HOUSING_ACT_1985_82A: '12. The (demotion) (suspension) claim is made under: section 82A(2) of the Housing Act 1985',
  HOUSING_ACT_1988_6A: '12. The (demotion) (suspension) claim is made under: section 6A(2) of the Housing Act 1988',
  HOUSING_ACT_1985_121A: '12. The (demotion) (suspension) claim is made under: section 121A of the Housing Act 1985',

  // Claimant type (Section 13)
  CLAIMANT_LOCAL_AUTHORITY: '13. The claimant is a: local authority',
  CLAIMANT_HOUSING_ACTION_TRUST: '13. The claimant is a: housing action trust',
  CLAIMANT_REGISTERED_SOCIAL: '13. The claimant is a: registered social landlord or a private registered provider of social housing',
  CLAIMANT_OTHER: '13. The claimant is - other',

  // Demoted tenancy terms (Section 14)
  DEMOTED_TERMS_YES: '14. Has the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy? Yes',
  DEMOTED_TERMS_NO: '14. Has the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy? No',

  // Statement of Truth
  SOT_BELIEVES: 'I believe that the facts stated in these particulars of claim are true',
  SOT_AUTHORISED: 'The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement',
  SOT_CLAIMANT: 'Statement of Truth signed by Claimant',
  SOT_LITIGATION_FRIEND: 'Statement of Truth signed by Litigation friend (where claimant is a child or a patient)',
  // Uses curly apostrophe (U+2019)
  SOT_LEGAL_REP: "Statement of Truth signed by Claimant\u2019s legal representative (as defined by CPR 2.3(1))",
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface CaseData {
  // Jurisdiction - CRITICAL for selecting correct court forms
  // Wales uses N5_WALES, N5B_WALES, N119_WALES instead of England versions
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland';

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
  how_to_rent_uploaded?: boolean;           // Checkbox H - how to rent doc uploaded

  // =========================================================================
  // N5B QUESTIONS 9a-9g: AST VERIFICATION (Statement of Truth - MANDATORY)
  // =========================================================================
  n5b_q9a_after_feb_1997?: boolean;      // Q9a: Tenancy created after 28 Feb 1997
  n5b_q9b_no_notice_not_ast?: boolean;   // Q9b: No notice given that NOT an AST
  n5b_q9c_no_exclusion_clause?: boolean; // Q9c: No exclusion clause in agreement
  n5b_q9d_not_agricultural_worker?: boolean; // Q9d: Not agricultural worker
  n5b_q9e_not_succession_tenancy?: boolean;  // Q9e: Not succession tenancy
  n5b_q9f_not_former_secure?: boolean;   // Q9f: Not former secure tenancy
  n5b_q9g_not_schedule_10?: boolean;     // Q9g: Not Schedule 10 LGHA 1989

  // =========================================================================
  // N5B QUESTIONS 15-18: COMPLIANCE DATES
  // =========================================================================
  // Q15: EPC
  epc_provided_date?: string;            // Q15: Date EPC was provided
  // Q16-17: Gas safety
  has_gas_at_property?: boolean;         // Q16: Property has gas (if false, Q16-17 skip)
  gas_safety_before_occupation?: boolean; // Q16: Gas safety record available before occupation
  gas_safety_before_occupation_date?: string; // Q16: Date gas record made available before occupation
  gas_safety_check_date?: string;        // Q17a: Date gas safety check carried out
  gas_safety_served_date?: string;       // Q17b: Date gas safety record served
  // Q18: How to Rent
  how_to_rent_date?: string;             // Q18c: Date How to Rent provided
  how_to_rent_method?: 'hardcopy' | 'email'; // Q18d: Method of provision

  // =========================================================================
  // N5B QUESTIONS 19: TENANT FEES ACT 2019
  // =========================================================================
  n5b_q19_prohibited_payment?: boolean;  // Q19: Prohibited payment taken and not refunded
  n5b_q19b_holding_deposit?: 'no' | 'yes_compliant' | 'yes_breach'; // Q19b: Holding deposit

  // =========================================================================
  // N5B QUESTION 20: PAPER DETERMINATION CONSENT
  // =========================================================================
  n5b_q20_paper_determination?: boolean; // Q20: Consent to paper determination

  // =========================================================================
  // N5B DEFENDANT SERVICE ADDRESS (Page 5)
  // =========================================================================
  defendant_service_address_same_as_property?: boolean;
  defendant_service_address_line1?: string;
  defendant_service_address_town?: string;
  defendant_service_address_postcode?: string;

  // Known occupants (for N119 Q2 - persons in possession)
  // Only include if landlord has confirmed these occupants exist
  knownOccupants?: string[];

  // Pre-action steps (for N119 Q5 - steps taken to recover arrears)
  // Only include steps that are actually recorded/confirmed by landlord
  preActionSteps?: Array<{
    date: string;
    description: string;
  }>;

  // Other breach details (for N119 Q4(b) - only populate if user has provided)
  // Do NOT invent or fabricate breach details - leave blank if not provided
  other_breach_details?: string;

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
 * Options for form filler functions
 */
export interface FormFillerOptions {
  /**
   * Whether to flatten the PDF after filling.
   * Flattened PDFs have form fields converted to static content.
   *
   * - true (default): Flatten for court submission - ensures fields visible in all viewers
   * - false: Keep form fields editable - useful for testing or preview
   */
  flatten?: boolean;
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

/**
 * Format a date string to UK legal format (e.g., "15 January 2026")
 */
function formatUKLegalDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

// =============================================================================
// N119 HELPER FUNCTIONS (Q2 and Q5)
// =============================================================================

/**
 * Get persons in possession for N119 Q2.
 *
 * IMPORTANT: Only include tenants and known occupants that the landlord has confirmed.
 * Do NOT invent or fabricate "unknown persons" or make assumptions.
 *
 * @param caseData - The case data containing tenant and occupant information
 * @returns Formatted string of persons in possession, or empty string if none
 */
function getPersonsInPossession(caseData: CaseData): string {
  const persons: string[] = [];

  // Add named tenants (defendants)
  if (caseData.tenant_full_name) {
    persons.push(caseData.tenant_full_name);
  }
  if (caseData.tenant_2_name) {
    persons.push(caseData.tenant_2_name);
  }

  // Build the tenants description
  const tenantsText = persons.join(' and ');

  // If we have known occupants collected from the landlord, append them
  // Q2 requirement: Just names, no parentheticals like "(the defendant)"
  if (caseData.knownOccupants && caseData.knownOccupants.length > 0) {
    const occupantsList = caseData.knownOccupants.join(', ');
    return `${tenantsText}, ${occupantsList}`;
  }

  // Just the tenants if no known occupants
  // Q2 requirement: Clean name only, no extra text
  if (persons.length > 0) {
    return tenantsText;
  }

  return '';
}

/**
 * Get steps taken to recover arrears for N119 Q5.
 *
 * CRITICAL RULE: Do NOT fabricate steps. This field must only contain:
 * 1. Steps that are actually recorded with dates and descriptions
 * 2. A safe neutral minimum statement if no steps are recorded
 *
 * IMPORTANT: Notice service info belongs in Q6 ONLY, NOT in Q5.
 * Q5 is for pre-action protocol steps (letters, contacts, payment plans).
 *
 * @param caseData - The case data containing pre-action steps information
 * @returns Formatted string of steps taken, using neutral wording if no data
 */
function getStepsToRecoverArrears(caseData: CaseData): string {
  const steps: string[] = [];

  // Only include steps if we have recorded evidence (dates/notes)
  // This should be actual pre-action protocol steps like letters, calls, payment plan offers
  if (caseData.preActionSteps && caseData.preActionSteps.length > 0) {
    for (const step of caseData.preActionSteps) {
      if (step.date && step.description) {
        const formattedDate = formatUKLegalDate(step.date);
        steps.push(`${formattedDate}: ${step.description}`);
      }
    }
  }

  // If we have recorded steps, return them as a timeline
  if (steps.length > 0) {
    return steps.join('\n');
  }

  // SAFE MINIMUM DEFAULT: Use neutral wording that doesn't fabricate specific actions.
  // DO NOT mention notice service here - that info goes in Q6 only.
  // This is the fallback when no specific pre-action steps are recorded.
  return 'The claimant contacted the defendant regarding the arrears and invited payment or proposals.';
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
 * Source: https://www.gov.uk/government/publications/form-n5-claim-form-for-possession-of-property
 *
 * FIELD INVENTORY: 34 text fields, 20 checkboxes
 * Field inventory updated: December 2025
 */
export async function fillN5Form(data: CaseData, options: FormFillerOptions = {}): Promise<Uint8Array> {
  const { flatten = true } = options;
  const ctx = 'N5';
  const formFile = getFormFilename('n5', data.jurisdiction);
  console.log(`📄 Filling N5 form (Claim for possession) - using ${formFile}...`);

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

  const pdfDoc = await loadOfficialForm(formFile);
  const form = pdfDoc.getForm();

  // === HEADER FIELDS ===
  setTextRequired(form, N5_FIELDS.COURT, data.court_name, ctx);
  setTextOptional(form, N5_FIELDS.FEE_ACCOUNT, data.claimant_reference, ctx);

  // === PARTY DETAILS ===
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  const defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;

  setTextWithVariants(
    form,
    [N5_FIELDS.CLAIMANT_DETAILS, "claimant's details"],
    claimantDetails,
    true,
    ctx
  );

  setTextWithVariants(
    form,
    [N5_FIELDS.DEFENDANT_DETAILS, "defendant's details"],
    defendantDetails,
    true,
    ctx
  );

  // Property address (possession of)
  setTextRequired(form, N5_FIELDS.POSSESSION_OF, data.property_address, ctx);

  // Defendant's address for service (same as property address by default)
  setTextOptional(form, N5_FIELDS.ADDRESS_FOR_SERVICE, data.property_address, ctx);

  // === FEES ===
  if (data.court_fee) {
    setTextOptional(form, N5_FIELDS.COURT_FEE, data.court_fee.toFixed(2), ctx);
  }
  if (data.solicitor_costs) {
    setTextOptional(form, N5_FIELDS.SOLICITOR_FEE, data.solicitor_costs.toFixed(2), ctx);
  }
  const totalFees = (data.court_fee || 0) + (data.solicitor_costs || 0);
  if (totalFees > 0) {
    setTextOptional(form, N5_FIELDS.TOTAL, totalFees.toFixed(2), ctx);
  }

  // === GROUNDS FOR POSSESSION CHECKBOXES ===
  // Tick the appropriate ground based on case data
  const groundCodes = data.ground_codes || [];
  const claimType = data.claim_type;

  // Rent arrears - Ground 8, 10, 11
  const hasArrearsGround = groundCodes.some(g => ['8', '10', '11'].includes(g));
  if (hasArrearsGround || data.total_arrears) {
    setCheckbox(form, N5_CHECKBOXES.RENT_ARREARS, true, ctx);
  }

  // Anti-social behaviour - Ground 14
  if (groundCodes.includes('14')) {
    setCheckbox(form, N5_CHECKBOXES.ANTI_SOCIAL_BEHAVIOUR, true, ctx);
  }

  // Other breach of tenancy - Ground 12, 13, 15, etc.
  const hasBreachGround = groundCodes.some(g => ['12', '13', '15'].includes(g));
  if (hasBreachGround) {
    setCheckbox(form, N5_CHECKBOXES.OTHER_BREACH_TENANCY, true, ctx);
  }

  // Section 21 (no-fault) - use "other" category with details
  if (claimType === 'section_21') {
    setCheckbox(form, N5_CHECKBOXES.OTHER, true, ctx);
    setTextOptional(form, N5_FIELDS.OTHER_REASON_DETAILS, 'Section 21 - No fault possession (Housing Act 1988)', ctx);
  }

  // === DEMOTION OF TENANCY ===
  // Default to "No" for private landlords
  setCheckbox(form, N5_CHECKBOXES.DEMOTION_NO, true, ctx);

  // === RIGHT TO BUY SUSPENSION ===
  // Default to "No" for private landlords
  setCheckbox(form, N5_CHECKBOXES.RIGHT_TO_BUY_NO, true, ctx);

  // === HUMAN RIGHTS ACT ===
  // Default to "No" unless specifically indicated
  setCheckbox(form, N5_CHECKBOXES.HRA_NO, true, ctx);

  // === STATEMENT OF TRUTH ===
  setTextOptional(form, N5_FIELDS.STATEMENT_SIGNATURE, data.signatory_name, ctx);
  setTextRequired(form, N5_FIELDS.SIGNATORY_NAME, data.signatory_name, ctx);

  if (data.signature_date) {
    const sigDate = splitDate(data.signature_date);
    if (sigDate) {
      setTextOptional(form, N5_FIELDS.STATEMENT_DATE_DD, sigDate.day, ctx);
      setTextOptional(form, N5_FIELDS.STATEMENT_DATE_MM, sigDate.month, ctx);
      setTextOptional(form, N5_FIELDS.STATEMENT_DATE_YYYY, sigDate.year, ctx);
    }
  }

  // Statement of Truth checkbox
  if (data.solicitor_firm) {
    setTextOptional(form, N5_FIELDS.SOLICITOR_FIRM, data.solicitor_firm, ctx);
    setCheckbox(form, N5_CHECKBOXES.SOT_LEGAL_REP, true, ctx);
    setCheckbox(form, N5_CHECKBOXES.SOT_AUTHORISED, true, ctx);
  } else {
    setCheckbox(form, N5_CHECKBOXES.SOT_CLAIMANT, true, ctx);
    setCheckbox(form, N5_CHECKBOXES.SOT_BELIEVES, true, ctx);
  }

  // === SERVICE ADDRESS ===
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

  // === CONTACT DETAILS ===
  setTextOptional(form, N5_FIELDS.PHONE, data.service_phone || data.landlord_phone, ctx);
  setTextOptional(form, N5_FIELDS.EMAIL, data.service_email || data.landlord_email, ctx);
  setTextOptional(form, N5_FIELDS.DX, data.dx_number, ctx);
  setTextOptional(form, N5_FIELDS.REFERENCE, data.claimant_reference, ctx);

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N5 form filled successfully (${listFormFieldNames(form).length} fields available, key fields set)`);

  // Flatten PDF to ensure filled fields are visible in all viewers/prints
  if (flatten) {
    const flattenedBytes = await flattenPdf(pdfBytes);
    console.log(`📄 N5 form flattened for court submission`);
    return flattenedBytes;
  }

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
export async function fillN5BForm(data: CaseData, options: FormFillerOptions = {}): Promise<Uint8Array> {
  const { flatten = true } = options;
  const ctx = 'N5B';
  const formFile = getFormFilename('n5b', data.jurisdiction);
  console.log(`📄 Filling N5B form (Accelerated possession - Section 21) - using ${formFile}...`);

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

  const pdfDoc = await loadOfficialForm(formFile);
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

  // === Q6: DATE PROPERTY LET ===
  const tenancyDate = splitDate(data.tenancy_start_date);
  if (tenancyDate) {
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_DAY, tenancyDate.day, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_MONTH, tenancyDate.month, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_LET_DATE_YEAR, tenancyDate.year, ctx);
  }

  // === Q7: TENANCY AGREEMENT DATE (may differ from Q6) ===
  // Use separate tenancy_agreement_date if provided, otherwise fallback to tenancy_start_date
  const agreementDateValue = data.tenancy_agreement_date || data.tenancy_start_date;
  const agreementDate = splitDate(agreementDateValue);
  if (agreementDate) {
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_DAY, agreementDate.day, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_MONTH, agreementDate.month, ctx);
    setTextOptional(form, N5B_FIELDS.TENANCY_AGREEMENT_DATE_YEAR, agreementDate.year, ctx);
  }

  // === Q8: SUBSEQUENT TENANCY ===
  if (data.subsequent_tenancy !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.SUBSEQUENT_TENANCY_YES, data.subsequent_tenancy, ctx);
    setCheckbox(form, N5B_CHECKBOXES.SUBSEQUENT_TENANCY_NO, !data.subsequent_tenancy, ctx);
  }

  // =========================================================================
  // Q9a-Q9g: AST VERIFICATION (MANDATORY - Statement of Truth)
  // =========================================================================
  // CRITICAL: These answers form part of the Statement of Truth.
  // Courts WILL reject claims with missing answers.
  // =========================================================================

  // Q9a: Tenancy created on or after 28 February 1997
  if (data.n5b_q9a_after_feb_1997 !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_YES, data.n5b_q9a_after_feb_1997, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_NO, !data.n5b_q9a_after_feb_1997, ctx);
  }

  // Q9b: Notice given that tenancy is NOT an AST (answer should be NO for valid S21)
  if (data.n5b_q9b_no_notice_not_ast !== undefined) {
    // NOTE: The wizard asks "Confirm NO notice was given saying NOT AST" (YES = correct)
    // The form asks "Has notice been given...?" so we INVERT the answer
    setCheckbox(form, N5B_CHECKBOXES.Q9B_NO_NOTICE_NOT_AST_YES, !data.n5b_q9b_no_notice_not_ast, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9B_NO_NOTICE_NOT_AST_NO, data.n5b_q9b_no_notice_not_ast, ctx);
  }

  // Q9c: Exclusion clause in tenancy agreement (answer should be NO for valid S21)
  if (data.n5b_q9c_no_exclusion_clause !== undefined) {
    // Wizard asks "Confirm NO exclusion clause" (YES = correct)
    // Form asks "Does agreement contain provision...?" so we INVERT
    setCheckbox(form, N5B_CHECKBOXES.Q9C_NO_EXCLUSION_CLAUSE_YES, !data.n5b_q9c_no_exclusion_clause, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9C_NO_EXCLUSION_CLAUSE_NO, data.n5b_q9c_no_exclusion_clause, ctx);
  }

  // Q9d: Agricultural worker (answer should be NO for valid S21)
  if (data.n5b_q9d_not_agricultural_worker !== undefined) {
    // Wizard asks "Confirm NOT agricultural worker" (YES = correct)
    // Form asks "Is defendant agricultural worker...?" so we INVERT
    setCheckbox(form, N5B_CHECKBOXES.Q9D_NOT_AGRICULTURAL_YES, !data.n5b_q9d_not_agricultural_worker, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9D_NOT_AGRICULTURAL_NO, data.n5b_q9d_not_agricultural_worker, ctx);
  }

  // Q9e: Succession tenancy from Rent Act (answer should be NO for valid S21)
  if (data.n5b_q9e_not_succession_tenancy !== undefined) {
    // Wizard asks "Confirm NOT succession tenancy" (YES = correct)
    // Form asks "Did tenancy arise on death...?" so we INVERT
    setCheckbox(form, N5B_CHECKBOXES.Q9E_NOT_SUCCESSION_YES, !data.n5b_q9e_not_succession_tenancy, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9E_NOT_SUCCESSION_NO, data.n5b_q9e_not_succession_tenancy, ctx);
  }

  // Q9f: Former secure tenancy (answer should be NO for valid S21)
  if (data.n5b_q9f_not_former_secure !== undefined) {
    // Wizard asks "Confirm NOT former secure tenancy" (YES = correct)
    // Form asks "Was tenancy formerly secure...?" so we INVERT
    setCheckbox(form, N5B_CHECKBOXES.Q9F_NOT_FORMER_SECURE_YES, !data.n5b_q9f_not_former_secure, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9F_NOT_FORMER_SECURE_NO, data.n5b_q9f_not_former_secure, ctx);
  }

  // Q9g: Schedule 10 LGHA 1989 tenancy (answer should be NO for valid S21)
  if (data.n5b_q9g_not_schedule_10 !== undefined) {
    // Wizard asks "Confirm NOT Schedule 10 tenancy" (YES = correct)
    // Form asks "Was tenancy granted under Schedule 10...?" so we INVERT
    setCheckbox(form, N5B_CHECKBOXES.Q9G_NOT_SCHEDULE_10_YES, !data.n5b_q9g_not_schedule_10, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9G_NOT_SCHEDULE_10_NO, data.n5b_q9g_not_schedule_10, ctx);
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

  // =========================================================================
  // Q15: EPC PROVIDED
  // =========================================================================
  if (data.epc_provided !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q15_EPC_PROVIDED_YES, data.epc_provided, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q15_EPC_PROVIDED_NO, !data.epc_provided, ctx);
  }

  // Q15 date: When EPC was provided to defendant
  if (data.epc_provided_date) {
    const epcDate = splitDate(data.epc_provided_date);
    if (epcDate) {
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_DAY, epcDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_MONTH, epcDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_YEAR, epcDate.year, ctx);
    }
  }

  // =========================================================================
  // Q16-17: GAS SAFETY
  // =========================================================================
  // Q16: Gas safety before occupation (or "no gas at property")
  if (data.has_gas_at_property === false) {
    // No gas at property - tick that box
    setCheckbox(form, N5B_CHECKBOXES.Q16_NO_GAS, true, ctx);
  } else if (data.gas_safety_before_occupation !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q16_GAS_BEFORE_OCCUPATION_YES, data.gas_safety_before_occupation, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q16_GAS_BEFORE_OCCUPATION_NO, !data.gas_safety_before_occupation, ctx);

    // Q16 date: When gas safety record made available before occupation
    if (data.gas_safety_before_occupation_date) {
      const gasBeforeDate = splitDate(data.gas_safety_before_occupation_date);
      if (gasBeforeDate) {
        setTextOptional(form, N5B_FIELDS.GAS_SAFETY_BEFORE_OCCUPATION_DATE_DAY, gasBeforeDate.day, ctx);
        setTextOptional(form, N5B_FIELDS.GAS_SAFETY_BEFORE_OCCUPATION_DATE_MONTH, gasBeforeDate.month, ctx);
        setTextOptional(form, N5B_FIELDS.GAS_SAFETY_BEFORE_OCCUPATION_DATE_YEAR, gasBeforeDate.year, ctx);
      }
    }
  }

  // Q17: Gas safety record served (tenant has copy)
  if (data.gas_safety_provided !== undefined && data.has_gas_at_property !== false) {
    setCheckbox(form, N5B_CHECKBOXES.Q17_GAS_SERVED_YES, data.gas_safety_provided, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q17_GAS_SERVED_NO, !data.gas_safety_provided, ctx);
  }

  // Q17a: Date gas safety check was carried out
  if (data.gas_safety_check_date) {
    const gasCheckDate = splitDate(data.gas_safety_check_date);
    if (gasCheckDate) {
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_CHECK_DATE_DAY, gasCheckDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_CHECK_DATE_MONTH, gasCheckDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_CHECK_DATE_YEAR, gasCheckDate.year, ctx);
    }
  }

  // Q17b: Date gas safety record served on defendant
  if (data.gas_safety_served_date) {
    const gasServedDate = splitDate(data.gas_safety_served_date);
    if (gasServedDate) {
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVED_DATE_DAY, gasServedDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVED_DATE_MONTH, gasServedDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVED_DATE_YEAR, gasServedDate.year, ctx);
    }
  }

  // =========================================================================
  // Q18: HOW TO RENT GUIDE
  // =========================================================================
  // Q18a: Was How to Rent guide provided
  if (data.how_to_rent_provided !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q18A_HOW_TO_RENT_PROVIDED_YES, data.how_to_rent_provided, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q18A_HOW_TO_RENT_PROVIDED_NO, !data.how_to_rent_provided, ctx);
  }

  // Q18b: Tenancy began before 1 October 2015 (exemption)
  // Derive from tenancy_start_date
  if (data.tenancy_start_date) {
    const tenancyStartDate = new Date(data.tenancy_start_date);
    const oct2015 = new Date('2015-10-01');
    const beforeOct2015 = tenancyStartDate < oct2015;
    setCheckbox(form, N5B_CHECKBOXES.Q18B_TENANCY_BEFORE_OCT_2015_YES, beforeOct2015, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q18B_TENANCY_BEFORE_OCT_2015_NO, !beforeOct2015, ctx);
  }

  // Q18c: Date How to Rent was provided
  if (data.how_to_rent_date) {
    const htrDate = splitDate(data.how_to_rent_date);
    if (htrDate) {
      setTextOptional(form, N5B_FIELDS.HOW_TO_RENT_DATE_DAY, htrDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.HOW_TO_RENT_DATE_MONTH, htrDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.HOW_TO_RENT_DATE_YEAR, htrDate.year, ctx);
    }
  }

  // Q18d: Method of provision (hardcopy or email)
  if (data.how_to_rent_method === 'hardcopy') {
    setCheckbox(form, N5B_CHECKBOXES.Q18D_HOW_TO_RENT_HARDCOPY, true, ctx);
  } else if (data.how_to_rent_method === 'email') {
    setCheckbox(form, N5B_CHECKBOXES.Q18D_HOW_TO_RENT_EMAIL, true, ctx);
  }

  // =========================================================================
  // Q19: TENANT FEES ACT 2019 COMPLIANCE
  // =========================================================================
  // Q19: Prohibited payment taken and not refunded (answer should be NO for valid S21)
  if (data.n5b_q19_prohibited_payment !== undefined) {
    // Wizard asks "Has prohibited payment been taken that hasn't been refunded?"
    // Answer NO for valid S21 (no prohibited payment, or all refunded)
    setCheckbox(form, N5B_CHECKBOXES.Q19_PROHIBITED_PAYMENT_YES, data.n5b_q19_prohibited_payment, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q19_PROHIBITED_PAYMENT_NO, !data.n5b_q19_prohibited_payment, ctx);
  }

  // Q19b: Holding deposit (on/after 1 June 2019)
  if (data.n5b_q19b_holding_deposit !== undefined) {
    const holdingDeposit = data.n5b_q19b_holding_deposit;
    setCheckbox(form, N5B_CHECKBOXES.Q19B_HOLDING_DEPOSIT_YES, holdingDeposit !== 'no', ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q19B_HOLDING_DEPOSIT_NO, holdingDeposit === 'no', ctx);
  }

  // =========================================================================
  // Q20: PAPER DETERMINATION CONSENT
  // =========================================================================
  if (data.n5b_q20_paper_determination !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_YES, data.n5b_q20_paper_determination, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_NO, !data.n5b_q20_paper_determination, ctx);
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

  // Flatten PDF to ensure filled fields are visible in all viewers/prints
  if (flatten) {
    const flattenedBytes = await flattenPdf(pdfBytes);
    console.log(`📄 N5B form flattened for court submission`);
    return flattenedBytes;
  }

  return pdfBytes;
}

// =============================================================================
// N119 PARTICULARS GENERATOR
// =============================================================================

/**
 * Build N119 Reason for Possession (Section 4) - SHORT VERSION
 *
 * Creates a court-appropriate short statement for N119 Question 4(a) that:
 * - Is legally sensible for the selected grounds
 * - References the attached Schedule of Arrears for detailed breakdown
 * - Does NOT include period-by-period bullet lists (prevents field overflow)
 * - For Ground 8: phrases arrears requirement correctly without asserting "at hearing" as fact
 *
 * @param data - CaseData with grounds, arrears, and tenancy information
 * @returns A short particulars string suitable for N119 field 4(a)
 */
export function buildN119ReasonForPossession(data: CaseData): string {
  const parts: string[] = [];

  // Parse ground codes/numbers
  const grounds = data.ground_numbers?.split(',').map(g => g.trim()) || [];
  const hasGround8 = grounds.includes('8') || data.ground_codes?.includes('ground_8');
  const hasGround10 = grounds.includes('10') || data.ground_codes?.includes('ground_10');
  const hasGround11 = grounds.includes('11') || data.ground_codes?.includes('ground_11');
  const hasArrearsGrounds = hasGround8 || hasGround10 || hasGround11;

  // Ground 8 - Mandatory ground for serious rent arrears
  if (hasGround8) {
    parts.push('The claimant relies on Ground 8 of Schedule 2 to the Housing Act 1988 (mandatory ground).');

    // Legally sensible statement: phrase as requirement + current facts
    // DO NOT assert "at the hearing" as a fact - instead cite the requirement
    const threshold = data.rent_frequency === 'weekly' ? '8 weeks\'' : '2 months\'';
    parts.push(
      `Under Ground 8, the court must order possession if at least ${threshold} rent was unpaid ` +
      `both at the date of service of the notice and at the date of the hearing.`
    );

    // State total arrears and reference the attached schedule
    if (data.total_arrears) {
      parts.push(`At the date of service of the notice, £${data.total_arrears.toFixed(2)} was outstanding.`);
    }
    parts.push('Full details of rent periods and payments are set out in the attached Schedule of Arrears.');
  }

  // Ground 10 - Discretionary ground (some arrears)
  if (hasGround10) {
    const prefix = parts.length > 0 ? 'The claimant also relies on' : 'The claimant relies on';
    parts.push(`${prefix} Ground 10 of Schedule 2 to the Housing Act 1988 (discretionary ground).`);
    parts.push('Some rent lawfully due from the tenant is unpaid on the date on which proceedings are begun.');
  }

  // Ground 11 - Discretionary ground (persistent delay)
  if (hasGround11) {
    const prefix = parts.length > 0 ? 'The claimant also relies on' : 'The claimant relies on';
    parts.push(`${prefix} Ground 11 of Schedule 2 to the Housing Act 1988 (discretionary ground).`);
    parts.push('The tenant has persistently delayed paying rent which has become lawfully due.');
  }

  // For arrears grounds without specific Ground 8/10/11, still reference schedule
  if (!hasGround8 && !hasGround10 && !hasGround11 && (hasArrearsGrounds || data.total_arrears)) {
    if (data.total_arrears) {
      parts.push(`Total arrears outstanding: £${data.total_arrears.toFixed(2)}.`);
    }
    parts.push('Full details are set out in the attached Schedule of Arrears.');
  }

  // Other grounds - provide generic statement
  if (!hasArrearsGrounds && !data.total_arrears && data.ground_numbers) {
    parts.push(`The claimant relies on Ground(s) ${data.ground_numbers} of Schedule 2 to the Housing Act 1988.`);
  }

  // Fallback if no particulars generated
  if (parts.length === 0) {
    return 'The defendant has not paid the rent lawfully due under the tenancy agreement.';
  }

  return parts.join(' ');
}

/**
 * Generate detailed particulars of claim based on case data
 * This creates proper legal particulars for the N119 form Section 4
 *
 * Uses the short version (buildN119ReasonForPossession) to prevent field overflow.
 */
function generateParticularsOfClaim(data: CaseData): string {
  // Use the short version to prevent overflow in PDF form fields
  return buildN119ReasonForPossession(data);
}

// =============================================================================
// N119 FORM FILLER
// =============================================================================

/**
 * Fill Form N119 - Particulars of claim for possession
 *
 * Official PDF: /public/official-forms/n119-eng.pdf
 * Source: https://www.gov.uk/government/publications/form-n119-particulars-of-claim-for-possession-arrears-of-rent
 *
 * FIELD INVENTORY: 38 text fields, 16 checkboxes
 * Field inventory updated: December 2025
 */
export async function fillN119Form(data: CaseData, options: FormFillerOptions = {}): Promise<Uint8Array> {
  const { flatten = true } = options;
  const ctx = 'N119';
  const formFile = getFormFilename('n119', data.jurisdiction);
  console.log(`📄 Filling N119 form (Particulars of claim) - using ${formFile}...`);

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

  const pdfDoc = await loadOfficialForm(formFile);
  const form = pdfDoc.getForm();

  // === HEADER FIELDS ===
  setTextRequired(form, N119_FIELDS.COURT, data.court_name, ctx);
  setTextRequired(form, N119_FIELDS.CLAIMANT, data.landlord_full_name, ctx);
  setTextRequired(form, N119_FIELDS.DEFENDANT, data.tenant_full_name, ctx);
  setTextRequired(form, N119_FIELDS.POSSESSION_OF, data.property_address, ctx);

  // === OCCUPANTS (Section 2 / Q2 - Persons in possession) ===
  // IMPORTANT: Only include tenants and known occupants that landlord has confirmed.
  // Do NOT invent or fabricate unknown persons.
  const occupantsText = getPersonsInPossession(data);
  if (occupantsText) {
    setTextOptional(form, N119_FIELDS.OCCUPANTS, occupantsText, ctx);
  }

  // === TENANCY DETAILS (Section 3) ===
  const tenancyType = data.tenancy_type || 'Assured Shorthold Tenancy';
  setTextOptional(form, N119_FIELDS.TENANCY_TYPE, tenancyType, ctx);
  // Format tenancy date in UK legal format (e.g., "14 July 2025")
  const tenancyDateFormatted = data.tenancy_start_date ? formatUKLegalDate(data.tenancy_start_date) : '';
  setTextOptional(form, N119_FIELDS.TENANCY_DATE, tenancyDateFormatted, ctx);

  // Rent amount - ensure proper currency formatting without duplicates
  if (data.rent_amount !== undefined) {
    // Format as currency: ensure it's a number and add single £ prefix
    const rentNum = typeof data.rent_amount === 'number' ? data.rent_amount :
      parseFloat(String(data.rent_amount).replace(/[£,]/g, '')) || 0;
    setTextOptional(form, N119_FIELDS.RENT, `£${rentNum.toFixed(2)}`, ctx);

    // Tick ONLY the appropriate rent frequency (single selection, not multiple)
    // Clear any that shouldn't be checked to ensure only one is marked
    if (data.rent_frequency === 'weekly') {
      setTextOptional(form, N119_FIELDS.RENT_WEEKLY, 'X', ctx);
    } else if (data.rent_frequency === 'fortnightly') {
      setTextOptional(form, N119_FIELDS.RENT_FORTNIGHTLY, 'X', ctx);
    } else if (data.rent_frequency === 'monthly') {
      setTextOptional(form, N119_FIELDS.RENT_MONTHLY, 'X', ctx);
    } else if (data.rent_frequency) {
      // Only use "other period" if it's not one of the standard options
      setTextOptional(form, N119_FIELDS.RENT_OTHER_PERIOD, data.rent_frequency, ctx);
    }

    // Daily rate for arrears calculation (properly formatted)
    const dailyRate = data.rent_frequency === 'weekly' ? rentNum / 7 :
                      data.rent_frequency === 'fortnightly' ? rentNum / 14 :
                      data.rent_frequency === 'monthly' ? rentNum / 30 :
                      data.rent_frequency === 'quarterly' ? rentNum / 91 :
                      rentNum / 30;
    setTextOptional(form, N119_FIELDS.DAILY_RATE, dailyRate.toFixed(2), ctx);
  }

  // === REASON FOR POSSESSION (Section 4) - Q4(a), Q4(b), Q4(c) ===
  // The N119 form has THREE separate sections for Section 4:
  // 4(a) - Rent arrears statement
  // 4(b) - Other breach details (only if provided, otherwise leave blank)
  // 4(c) - Statutory grounds (MUST be populated for Section 8 with explicit statutory basis)

  // Q4(a) - Rent Arrears
  // For arrears cases, state rent unpaid and reference the attached schedule
  if (data.total_arrears && data.total_arrears > 0) {
    const arrearsStatement = `Rent lawfully due under the tenancy agreement has not been paid. ` +
      `As at the date of service of the Section 8 Notice, the arrears amounted to £${data.total_arrears.toFixed(2)}. ` +
      `Full details of rent periods, payments, and outstanding arrears are set out in the attached Schedule of Arrears.`;
    setTextOptional(form, N119_FIELDS.REASON_A, arrearsStatement, ctx);
  } else if (data.particulars_of_claim) {
    // Use custom particulars if provided
    setTextOptional(form, N119_FIELDS.REASON_A, data.particulars_of_claim, ctx);
  }

  // Q4(b) - Other Breach Details
  // IMPORTANT: Only populate if user has explicitly provided other breach details
  // Do NOT invent breaches or insert placeholders
  if (data.other_breach_details) {
    setTextOptional(form, N119_FIELDS.REASON_B, data.other_breach_details, ctx);
  }
  // If no other breach details, leave Q4(b) blank (do not fill with anything)

  // Q4(c) - Statutory Grounds
  // MUST ALWAYS be populated for Section 8 cases with explicit statutory basis
  // This is legally mandatory for Ground 8 claims
  const grounds = data.ground_numbers?.split(',').map(g => g.trim()) || [];
  const hasGround8 = grounds.includes('8') || data.ground_codes?.includes('ground_8');
  const hasGround10 = grounds.includes('10') || data.ground_codes?.includes('ground_10');
  const hasGround11 = grounds.includes('11') || data.ground_codes?.includes('ground_11');

  const statutoryGroundsParts: string[] = [];
  if (hasGround8) {
    statutoryGroundsParts.push('Ground 8, Schedule 2, Housing Act 1988 (mandatory ground for serious rent arrears)');
  }
  if (hasGround10) {
    statutoryGroundsParts.push('Ground 10, Schedule 2, Housing Act 1988 (discretionary ground for rent arrears)');
  }
  if (hasGround11) {
    statutoryGroundsParts.push('Ground 11, Schedule 2, Housing Act 1988 (discretionary ground for persistent delay)');
  }
  // If other grounds are specified, add them
  if (statutoryGroundsParts.length === 0 && data.ground_numbers) {
    statutoryGroundsParts.push(`Ground(s) ${data.ground_numbers}, Schedule 2, Housing Act 1988`);
  }

  if (statutoryGroundsParts.length > 0) {
    const statutoryBasis = 'The claimant relies on the following statutory grounds for possession: ' +
      statutoryGroundsParts.join('; ') + '.';
    setTextOptional(form, N119_FIELDS.REASON_C, statutoryBasis, ctx);
  }

  // === STEPS TAKEN (Section 5 / Q5 - Steps to recover arrears) ===
  // CRITICAL: Do NOT fabricate steps. Use only recorded steps or a safe neutral default.
  const stepsText = getStepsToRecoverArrears(data);
  if (stepsText) {
    setTextOptional(form, N119_FIELDS.STEPS_TAKEN, stepsText, ctx);
  }

  // === NOTICE DETAILS (Section 6) ===
  // Q6: Notice type and date served
  // The form asks "(a) notice seeking possession..." or "(g) some other notice (specify)"
  // For Section 8 cases, we use "Notice seeking possession (Form 3)"
  // For Section 21 cases, we use "Section 21 Notice"

  // Determine notice type based on claim type
  const noticeType = data.claim_type === 'section_8'
    ? 'Notice seeking possession (Form 3)'
    : data.claim_type === 'section_21'
      ? 'Section 21 Notice'
      : 'Notice seeking possession';
  setTextOptional(form, N119_FIELDS.NOTICE_OTHER_TYPE, noticeType, ctx);

  // Notice served date - Q6 requires a complete, readable date
  // Day/month field: "DD Month" format (e.g., "19 January") - field is 88px wide
  // Year field: 2-digit year (e.g., "26") - field is only 22px wide
  const noticeDate = data.section_8_notice_date || data.section_21_notice_date || data.notice_served_date;
  if (noticeDate) {
    try {
      const date = new Date(noticeDate);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = months[date.getMonth()];
        const year = String(date.getFullYear()).slice(-2);

        // Format as "19 January" for day/month field (clear, readable format)
        setTextOptional(form, N119_FIELDS.NOTICE_DATE_DAY_MONTH, `${day} ${month}`, ctx);
        // 2-digit year for year field (e.g., "26" for 2026)
        setTextOptional(form, N119_FIELDS.NOTICE_DATE_YEAR, year, ctx);
      }
    } catch {
      // Fallback: parse date parts manually if Date parsing fails
      const dateParts = noticeDate.split('-');
      if (dateParts.length === 3) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIdx = parseInt(dateParts[1], 10) - 1;
        const monthName = monthNames[monthIdx] || dateParts[1];
        setTextOptional(form, N119_FIELDS.NOTICE_DATE_DAY_MONTH, `${dateParts[2]} ${monthName}`, ctx);
        setTextOptional(form, N119_FIELDS.NOTICE_DATE_YEAR, dateParts[0].slice(-2), ctx);
      }
    }
  }

  // === DEMOTION ORDER (Section 11) ===
  // Default to "No" for private landlords
  setCheckbox(form, N119_CHECKBOXES.DEMOTION_ORDER_NO, true, ctx);

  // === CLAIMANT TYPE (Section 13) ===
  // Private landlord = "other"
  setCheckbox(form, N119_CHECKBOXES.CLAIMANT_OTHER, true, ctx);
  setTextOptional(form, N119_FIELDS.CLAIMANT_TYPE_DETAILS, 'Private landlord', ctx);

  // === STATEMENT OF TRUTH ===
  setTextOptional(form, N119_FIELDS.STATEMENT_SIGNATURE, data.signatory_name, ctx);
  setTextOptional(form, N119_FIELDS.SIGNATORY_NAME, data.signatory_name, ctx);

  if (data.signature_date) {
    const sigDate = splitDate(data.signature_date);
    if (sigDate) {
      setTextOptional(form, N119_FIELDS.STATEMENT_DATE_DD, sigDate.day, ctx);
      setTextOptional(form, N119_FIELDS.STATEMENT_DATE_MM, sigDate.month, ctx);
      setTextOptional(form, N119_FIELDS.STATEMENT_DATE_YYYY, sigDate.year, ctx);
    }
  }

  // Statement of Truth checkboxes
  if (data.solicitor_firm) {
    setTextOptional(form, N119_FIELDS.SOLICITOR_FIRM, data.solicitor_firm, ctx);
    setCheckbox(form, N119_CHECKBOXES.SOT_LEGAL_REP, true, ctx);
    setCheckbox(form, N119_CHECKBOXES.SOT_AUTHORISED, true, ctx);
  } else {
    setCheckbox(form, N119_CHECKBOXES.SOT_CLAIMANT, true, ctx);
    setCheckbox(form, N119_CHECKBOXES.SOT_BELIEVES, true, ctx);
  }

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N119 form filled successfully (${listFormFieldNames(form).length} fields in form, key fields set)`);

  // Flatten PDF to ensure filled fields are visible in all viewers/prints
  if (flatten) {
    const flattenedBytes = await flattenPdf(pdfBytes);
    console.log(`📄 N119 form flattened for court submission`);
    return flattenedBytes;
  }

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
export async function fillN1Form(data: CaseData, options: FormFillerOptions = {}): Promise<Uint8Array> {
  const { flatten = true } = options;
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

  // Flatten PDF to ensure filled fields are visible in all viewers/prints
  if (flatten) {
    const flattenedBytes = await flattenPdf(pdfBytes);
    console.log(`📄 N1 form flattened for court submission`);
    return flattenedBytes;
  }

  return pdfBytes;
}

// =============================================================================
// FORM 6A (Section 21 Notice) - DEPRECATED
// =============================================================================

/**
 * Fill Form 6A - Section 21 notice (prescribed form)
 *
 * @deprecated DO NOT USE. Form 6A (Section 21 notice) must be generated via the
 * HBS template at config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs
 * using generateSection21Notice() from section21-generator.ts.
 *
 * Matrix compliance requires that prescribed notices come from the HBS pipeline,
 * not from official-forms-filler.ts. Only court forms (N5, N5B, N119, N1) should
 * be filled via this module.
 *
 * This function will throw an error if called in production to prevent misuse.
 *
 * @throws Error Always throws - use generateSection21Notice() instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fillForm6A(_data: CaseData): Promise<Uint8Array> {
  // P0-B: Block Form 6A generation via official PDF filler
  // Section 21 notices must come from HBS template for matrix compliance
  throw new Error(
    '[DEPRECATED] fillForm6A is disabled. ' +
    'Section 21 (Form 6A) notices must be generated via HBS template using generateSection21Notice() from section21-generator.ts. ' +
    'See: config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs'
  );

}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

/**
 * Main entry point - fill any official court form
 *
 * Supported forms:
 * - n5: Claim for possession of property
 * - n5b: Claim for possession (accelerated procedure - Section 21)
 * - n119: Particulars of claim for possession
 * - n1: Claim form (for money claims)
 *
 * @deprecated form6a - Use generateSection21Notice() from section21-generator.ts instead.
 *             Form 6A is a prescribed notice, not a court form, and must be generated
 *             via HBS template for matrix compliance.
 */
export async function fillOfficialForm(formType: 'n5' | 'n5b' | 'n119' | 'n1' | 'form6a', data: CaseData): Promise<Uint8Array> {
  // P0-B: Block form6a at entry point as well
  if (formType === 'form6a') {
    throw new Error(
      '[DEPRECATED] Form 6A cannot be generated via fillOfficialForm. ' +
      'Section 21 (Form 6A) notices must be generated via HBS template using generateSection21Notice() from section21-generator.ts. ' +
      'This function only supports court forms (N5, N5B, N119, N1).'
    );
  }

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
    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
}

/**
 * Save filled form to file (for testing)
 *
 * Writes are blocked if the target path is anywhere under public/official-forms.
 * Callers can omit outputPath to default to a repo-scoped tmp directory that is
 * .gitignored and safe for local inspection.
 */
export async function saveFilledForm(pdfBytes: Uint8Array, outputPath?: string): Promise<void> {
  const targetPath = outputPath ?? path.join(OFFICIAL_FORM_OUTPUT_ROOT, `filled-form-${Date.now()}.pdf`);
  assertNotInOfficialFormsDir(targetPath);

  const resolvedTarget = path.resolve(targetPath);
  const dir = path.dirname(resolvedTarget);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(resolvedTarget, pdfBytes);

  console.log(`💾 Saved filled form to: ${resolvedTarget}`);
  console.log(`📁 Note: official form outputs are restricted to tmp/test directories (not public/official-forms).`);
}
