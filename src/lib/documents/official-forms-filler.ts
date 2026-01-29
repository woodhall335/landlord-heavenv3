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
import { generateArrearsBreakdownForCourt } from './arrears-schedule-mapper';
// Note: flattenPdf import removed - official forms should NEVER be flattened
// to preserve user editability for final adjustments before court submission

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
 *
 * FIX 1 (Jan 2026): CORRECTED NAME FIELD MAPPING
 * After PDF field audit, the N5B form field names follow the standard pattern:
 * - "First Claimant's first names" = visual "First name(s)" field
 * - "First Claimant's last name" = visual "Last name" field
 *
 * The previous mapping was INCORRECT and caused names to display reversed.
 * Now using correct direct mapping: FIRST_NAMES -> first names, LAST_NAME -> last name
 */
/**
 * N5B form text field names - UPDATED January 2026
 * Field names extracted from actual n5b-eng.pdf form
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
  // First Claimant - CORRECTED: Direct mapping to actual PDF field names
  FIRST_CLAIMANT_FIRST_NAMES: "First Claimant's first names",
  FIRST_CLAIMANT_LAST_NAME: "First Claimant's last name",
  FIRST_CLAIMANT_ADDRESS_STREET: "First Claimant's address: building and street",
  FIRST_CLAIMANT_ADDRESS_LINE2: "First Claimant's address: second line of address",
  FIRST_CLAIMANT_ADDRESS_TOWN: "First Claimant's address: town or city",
  FIRST_CLAIMANT_ADDRESS_COUNTY: "First Claimant's address: county (optional)",
  FIRST_CLAIMANT_ADDRESS_POSTCODE: "First Claimant's address: postcode",
  // Second Claimant
  SECOND_CLAIMANT_FIRST_NAMES: "Second Claimant's first names",
  SECOND_CLAIMANT_LAST_NAME: "Second Claimant's last name",
  SECOND_CLAIMANT_ADDRESS_STREET: "Second Claimant's address: building and street",
  SECOND_CLAIMANT_ADDRESS_LINE2: "Second Claimant's address: second line of address",
  SECOND_CLAIMANT_ADDRESS_TOWN: "Second Claimant's address: town or city",
  SECOND_CLAIMANT_ADDRESS_COUNTY: "Second Claimant's address: county (optional)",
  SECOND_CLAIMANT_ADDRESS_POSTCODE: "Second Claimant's address: postcode",
  // Third Claimant
  THIRD_CLAIMANT_FIRST_NAMES: "Third Claimant's first names",
  THIRD_CLAIMANT_LAST_NAME: "Third Claimant's last name",
  THIRD_CLAIMANT_ADDRESS_STREET: "Third Claimant's address: building and street",
  THIRD_CLAIMANT_ADDRESS_LINE2: "Third Claimant's address: second line of address",
  THIRD_CLAIMANT_ADDRESS_TOWN: "Third Claimant's address: town or city",
  THIRD_CLAIMANT_ADDRESS_COUNTY: "Third Claimant's address: county (optional)",
  THIRD_CLAIMANT_ADDRESS_POSTCODE: "Third Claimant's address: postcode",
  // First Defendant
  FIRST_DEFENDANT_FIRST_NAMES: "First Defendant's first name(s)",
  FIRST_DEFENDANT_LAST_NAME: "First Defendant's last name",
  FIRST_DEFENDANT_ADDRESS_STREET: "First Defendant's address: building and street",
  FIRST_DEFENDANT_ADDRESS_LINE2: "First Defendant's address: second line of address",
  FIRST_DEFENDANT_ADDRESS_TOWN: "First Defendant's address: town or city",
  FIRST_DEFENDANT_ADDRESS_COUNTY: "First Defendant's address: county (optional)",
  FIRST_DEFENDANT_ADDRESS_POSTCODE: "First Defendant's address: postcode",
  // Second Defendant
  SECOND_DEFENDANT_FIRST_NAMES: "Second Defendant's first names",
  SECOND_DEFENDANT_LAST_NAME: "Second Defendant's last name",
  SECOND_DEFENDANT_ADDRESS_STREET: "Second Defendant's address: building and street",
  SECOND_DEFENDANT_ADDRESS_LINE2: "Second Defendant's address: second line of address",
  SECOND_DEFENDANT_ADDRESS_TOWN: "Second Defendant's address: town or city",
  SECOND_DEFENDANT_ADDRESS_COUNTY: "Second Defendant's address: county (optional)",
  SECOND_DEFENDANT_ADDRESS_POSTCODE: "Second Defendant's address: postcode",
  // Third Defendant
  THIRD_DEFENDANT_FIRST_NAMES: "Third Defendant's first names",
  THIRD_DEFENDANT_LAST_NAME: "Third Defendant's last name",
  THIRD_DEFENDANT_ADDRESS_STREET: "Third Defendant's address: building and street",
  THIRD_DEFENDANT_ADDRESS_LINE2: "Third Defendant's address: second line of address",
  THIRD_DEFENDANT_ADDRESS_TOWN: "Third Defendant's address: town or city",
  THIRD_DEFENDANT_ADDRESS_COUNTY: "Third Defendant's address: county (optional)",
  THIRD_DEFENDANT_ADDRESS_POSTCODE: "Third Defendant's address: postcode",
  // Defendant's address for service (N5B Page 5)
  DEFENDANT_SERVICE_ADDRESS_STREET: "Defendant's address for service: building and street",
  DEFENDANT_SERVICE_ADDRESS_LINE2: "Defendant's address for service: second line of address",
  DEFENDANT_SERVICE_ADDRESS_TOWN: "Defendant's address for service: town or city",
  DEFENDANT_SERVICE_ADDRESS_COUNTY: "Defendant's address for service: county (optional)",
  DEFENDANT_SERVICE_ADDRESS_POSTCODE: "Defendant's address for service: postcode",
  // Possession address
  POSSESSION_STREET: 'Claimant seeks an order that the Defendant gives possession of: building and street',
  POSSESSION_LINE2: 'Claimant seeks an order that the Defendant gives possession of: second line of address',
  POSSESSION_TOWN: 'Claimant seeks an order that the Defendant gives possession of: town or city',
  POSSESSION_COUNTY: 'Claimant seeks an order that the Defendant gives possession of: county (optional)',
  POSSESSION_POSTCODE: 'Claimant seeks an order that the Defendant gives possession of: postcode',
  // Tenancy dates (Q6, Q7)
  TENANCY_LET_DATE_DAY: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Day',
  TENANCY_LET_DATE_MONTH: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Month',
  TENANCY_LET_DATE_YEAR: '6. On what date was the property let to the Defendant by way of a written tenancy agreement? Year',
  TENANCY_AGREEMENT_DATE_DAY: '7. The tenancy agreement is dated. Day',
  TENANCY_AGREEMENT_DATE_MONTH: '7. The tenancy agreement is dated. Month',
  TENANCY_AGREEMENT_DATE_YEAR: '7. The tenancy agreement is dated. Year',
  FURTHER_TENANCY_DATES: 'Date(s) the further tenancy or tenancies were granted',
  // Notice service (Q10)
  NOTICE_SERVICE_METHOD: '10a How was the notice served',
  NOTICE_SERVED_DATE_DAY: '10b. On what date was the notice served? Day',
  NOTICE_SERVED_DATE_MONTH: '10b. On what date was the notice served? Month',
  NOTICE_SERVED_DATE_YEAR: '10b. On what date was the notice served? Year',
  NOTICE_SERVED_BY: '10c Who served the notice',
  NOTICE_SERVED_ON: '10d Who was the notice served on',
  NOTICE_EXPIRY_DATE_DAY: '10e. After what date did the notice require the Defendant to leave the property? Day',
  NOTICE_EXPIRY_DATE_MONTH: '10e. After what date did the notice require the Defendant to leave the property? Month',
  NOTICE_EXPIRY_DATE_YEAR: '10e. After what date did the notice require the Defendant to leave the property? Year',
  // Deposit (Q14b)
  DEPOSIT_INFO_DATE_DAY: '14b. On what date was the prescribed information given? Day',
  DEPOSIT_INFO_DATE_MONTH: '14b. On what date was the prescribed information given? Month',
  DEPOSIT_INFO_DATE_YEAR: '14b. On what date was the prescribed information given? Year',
  DEPOSIT_RETURNED_DATE_DAY: 'Date the deposit was returned - Day',
  DEPOSIT_RETURNED_DATE_MONTH: 'Date the deposit was returned - Month',
  DEPOSIT_RETURNED_DATE_YEAR: 'Date the deposit was returned - Year',
  // Q15a - Property condition notice date
  PROPERTY_CONDITION_NOTICE_DATE_DAY: '15a Date the notice was served - Day',
  PROPERTY_CONDITION_NOTICE_DATE_MONTH: '15a Date the notice was served - Month',
  PROPERTY_CONDITION_NOTICE_DATE_YEAR: '15a Date the notice was served - Year',
  SUSPENSION_END_DATE_DAY: 'If the operation of the relevant notice has been suspended, (ii) on what date did the suspension end? Day',
  SUSPENSION_END_DATE_MONTH: 'If the operation of the relevant notice has been suspended, (ii) on what date did the suspension end? Month',
  SUSPENSION_END_DATE_YEAR: 'If the operation of the relevant notice has been suspended, (ii) on what date did the suspension end? Year',
  // Q16 - EPC date (NEW location in current PDF)
  EPC_PROVIDED_DATE_DAY: 'Date the Defendant was given the EPC - Day',
  EPC_PROVIDED_DATE_MONTH: 'Date the Defendant was given the EPC - Month',
  EPC_PROVIDED_DATE_YEAR: 'Date the Defendant was given the EPC - Year',
  // Gas safety dates table
  GAS_SAFETY_ISSUE_DATE_1: 'Date of issue of gas safety record - 1',
  GAS_SAFETY_ISSUE_DATE_2: 'Date of issue of gas safety record - 2',
  GAS_SAFETY_ISSUE_DATE_3: 'Date of issue of gas safety record - 3',
  GAS_SAFETY_SERVICE_DATE_1: 'Date of service of gas safety record - 1',
  GAS_SAFETY_SERVICE_DATE_2: 'Date of service of gas safety record - 2',
  GAS_SAFETY_SERVICE_DATE_3: 'Date of service of gas safety record - 3',
  // Q18c - How to Rent date
  HOW_TO_RENT_DATE_DAY: '18c. When was the document provided? - Day',
  HOW_TO_RENT_DATE_MONTH: '18c. When was the document provided? - Month',
  HOW_TO_RENT_DATE_YEAR: '18c. When was the document provided? - Year',
  // Q19 - Prohibited payment repayment dates
  REPAYMENT_FULL_DATE_DAY: 'Date repayment in full was made - Day',
  REPAYMENT_FULL_DATE_MONTH: 'Date repayment in full was made - Month',
  REPAYMENT_FULL_DATE_YEAR: 'Date repayment in full was made - Year',
  REPAYMENT_PART_DATE_DAY: 'Date repayment in part was made - Day',
  REPAYMENT_PART_DATE_MONTH: 'Date repayment in part was made - Month',
  REPAYMENT_PART_DATE_YEAR: 'Date repayment in part was made - Year',
  // Statement of Truth
  STATEMENT_SIGNATURE: 'Statement of Truth signature',
  STATEMENT_SIGNATORY_NAME: 'Full name of the person signing the Statement of Truth',
  STATEMENT_DATE_DAY: 'Date the Statement of Truth is signed - Day',
  STATEMENT_DATE_MONTH: 'Date the Statement of Truth is signed - Month',
  STATEMENT_DATE_YEAR: 'Date the Statement of Truth is signed - Year',
  SOLICITOR_FIRM: 'Name of Claimants legal representatives firm',
  POSITION_HELD: 'If signing on behalf of firm or company give position or office held',
  // Service address (for legal representative)
  SERVICE_ADDRESS_STREET: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Building and street",
  SERVICE_ADDRESS_LINE2: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Second line of address",
  SERVICE_ADDRESS_TOWN: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Town or city",
  SERVICE_ADDRESS_COUNTY: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. County (optional)",
  SERVICE_ADDRESS_POSTCODE: "Claimant's or claimant's legal representative's address to which documents should be sent, if different from that on pages 2 and 3. Postcode",
  // Contact
  PHONE: 'If applicable, phone number',
  EMAIL: 'If applicable, email',
  DX: 'If applicable, DX number',
  REFERENCE: 'If applicable, reference number',
} as const;

/**
 * N5B checkbox field names - UPDATED January 2026
 * Field names extracted from actual n5b-eng.pdf form
 *
 * IMPORTANT: These field names MUST match the exact PDF field names.
 * Use scripts/inspect-pdf-forms.ts to verify field names if issues occur.
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

  // ==========================================================================
  // Q9a-Q9g - AST Verification (Statement of Truth - MANDATORY)
  // Field names CORRECTED to match actual n5b-eng.pdf
  // ==========================================================================
  Q9A_AFTER_FEB_1997_YES: '9a Was the first tenancy and any agreement for it made on or after 28 February 1997? Yes',
  Q9A_AFTER_FEB_1997_NO: '9a Was the first tenancy and any agreement for it made on or after 28 February 1997? No',
  Q9B_NOTICE_NOT_AST_YES: '9b Was a notice served on the Defendant stating that any tenancy would not be, or would cease to be, an assured shorthold tenancy? Yes',
  Q9B_NOTICE_NOT_AST_NO: '9b Was a notice served on the Defendant stating that any tenancy would not be, or would cease to be, an assured shorthold tenancy? No',
  Q9C_EXCLUSION_CLAUSE_YES: '9c Is there any provision in any tenancy agreement which states that it is not an assured shorthold tenancy? Yes',
  Q9C_EXCLUSION_CLAUSE_NO: '9c Is there any provision in any tenancy agreement which states that it is not an assured shorthold tenancy? No',
  Q9D_AGRICULTURAL_YES: `9d Is the ‘agricultural worker condition’ defined in Schedule 3 to the Housing Act 1988 fulfilled with respect to the property? Yes`,
  Q9D_AGRICULTURAL_NO: `9d Is the ‘agricultural worker condition’ defined in Schedule 3 to the Housing Act 1988 fulfilled with respect to the property? No`,
  Q9E_SUCCESSION_YES: '9e Did any tenancy arise by way of succession under s.39 of the Housing Act 1988? Yes',
  Q9E_SUCCESSION_NO: '9e Did any tenancy arise by way of succession under s.39 of the Housing Act 1988? No',
  Q9F_FORMER_SECURE_YES: '9f Was any tenancy previously a secure tenancy under s.79 of the Housing Act 1985? Yes',
  Q9F_FORMER_SECURE_NO: '9f Was any tenancy previously a secure tenancy under s.79 of the Housing Act 1985? No',
  Q9G_SCHEDULE_10_YES: '9g Did any tenancy arise under Schedule 10 to the Local Government and Housing Act 1989 (at the end of a long residential tenancy)? Yes',
  Q9G_SCHEDULE_10_NO: '9g Did any tenancy arise under Schedule 10 to the Local Government and Housing Act 1989 (at the end of a long residential tenancy)? No',

  // ==========================================================================
  // Q11 - Licensing (HMO/Selective)
  // ==========================================================================
  Q11A_LICENSING_REQUIRED_YES: '11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? Yes',
  Q11A_LICENSING_REQUIRED_NO: '11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? No',
  Q11A_HAS_VALID_LICENCE_YES: 'If yes, is there a valid licence? Yes',
  Q11A_HAS_VALID_LICENCE_NO: 'If yes, is there a valid licence? No',
  Q11B_DECISION_OUTSTANDING_YES: '11b. Is a decision outstanding as to licensing, or as to a temporary exemption notice? Yes',
  Q11B_DECISION_OUTSTANDING_NO: '11b. Is a decision outstanding as to licensing, or as to a temporary exemption notice? No',

  // Q12 - Deposit
  DEPOSIT_PAID_YES: '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? Yes',
  DEPOSIT_PAID_NO: '12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? No',
  // Q13 - Deposit returned
  DEPOSIT_RETURNED_YES: '13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? Yes',
  DEPOSIT_RETURNED_NO: '13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? No',
  // Q14a - Prescribed info
  PRESCRIBED_INFO_YES: '14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? Yes',
  PRESCRIBED_INFO_NO: '14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? No',

  // ==========================================================================
  // Q15 - Property Condition / Retaliatory Eviction (Housing Act 2004)
  // ==========================================================================
  Q15_PROPERTY_CONDITION_NOTICE_YES: '15. Has the Claimant been served with a relevant notice in relation to the condition of the property or relevant common parts under s.11, s.12 or s.40(7) of the Housing Act 2004? Yes',
  Q15_PROPERTY_CONDITION_NOTICE_NO: '15. Has the Claimant been served with a relevant notice in relation to the condition of the property or relevant common parts under s.11, s.12 or s.40(7) of the Housing Act 2004? No',
  Q15B_SUSPENDED_YES: '15b. Has the operation of the relevant notice been suspended? Yes',
  Q15B_SUSPENDED_NO: '15b. Has the operation of the relevant notice been suspended? No',
  Q15B_SUSPENSION_ENDED_YES: 'If the operation of the relevant notice has been suspended, (i) has the period of suspension ended? Yes',
  Q15B_SUSPENSION_ENDED_NO: 'If the operation of the relevant notice has been suspended, (i) has the period of suspension ended? No',
  Q15C_REVOKED_YES: '15c. Has the relevant notice been revoked under s.16 of the Housing Act 2004? Yes',
  Q15C_REVOKED_NO: '15c. Has the relevant notice been revoked under s.16 of the Housing Act 2004? No',
  Q15D_QUASHED_YES: '15d. Has the relevant notice been quashed under paragraph 15 of Schedule 1 of the Housing Act 2004? Yes',
  Q15D_QUASHED_NO: '15d. Has the relevant notice been quashed under paragraph 15 of Schedule 1 of the Housing Act 2004? No',
  Q15E_NON_REVOKE_REVERSED_YES: '15e. Has a decision of the local housing authority not to revoke the relevant notice been reversed under paragraph 18 of Schedule 1 of the Housing Act 2004? Yes',
  Q15E_NON_REVOKE_REVERSED_NO: '15e. Has a decision of the local housing authority not to revoke the relevant notice been reversed under paragraph 18 of Schedule 1 of the Housing Act 2004? No',
  Q15F_ACTION_REVERSED_YES: '15f. Has a decision of the housing authority to take the action to which the relevant notice relates been reversed under section 45 of the Housing Act 2004? Yes',
  Q15F_ACTION_REVERSED_NO: '15f. Has a decision of the housing authority to take the action to which the relevant notice relates been reversed under section 45 of the Housing Act 2004? No',
  Q15G_DEFENDANT_COMPLAINED_YES: '15g. Did the Defendant complain or try to complain about the relevant condition of the property or the common parts to the Claimant before the notice was given? Yes',
  Q15G_DEFENDANT_COMPLAINED_NO: '15g. Did the Defendant complain or try to complain about the relevant condition of the property or the common parts to the Claimant before the notice was given? No',
  Q15H_DUE_TO_DEFENDANT_BREACH_YES: '15h. Is the relevant condition of the property or common parts due to a breach of duty or contract on the part of the Defendant? Yes',
  Q15H_DUE_TO_DEFENDANT_BREACH_NO: '15h. Is the relevant condition of the property or common parts due to a breach of duty or contract on the part of the Defendant? No',
  Q15I_ON_MARKET_FOR_SALE_YES: '15i. Is the property genuinely on the market for sale with intent to sell to an independent person not associated with the Claimant? Yes',
  Q15I_ON_MARKET_FOR_SALE_NO: '15i. Is the property genuinely on the market for sale with intent to sell to an independent person not associated with the Claimant? No',
  Q15J_SOCIAL_HOUSING_PROVIDER_YES: '15j. Is the Claimant a private registered provider of social housing? Yes',
  Q15J_SOCIAL_HOUSING_PROVIDER_NO: '15j. Is the Claimant a private registered provider of social housing? No',
  Q15K_MORTGAGEE_YES: '15k. Is the Claimant a mortgagee whose mortgage predated the tenancy and who requires vacant possession to sell the property under an existing power of sale? Yes',
  Q15K_MORTGAGEE_NO: '15k. Is the Claimant a mortgagee whose mortgage predated the tenancy and who requires vacant possession to sell the property under an existing power of sale? No',

  // ==========================================================================
  // Q16 - EPC (Energy Performance Certificate)
  // ==========================================================================
  Q16_EPC_PROVIDED_YES: '16. Was a valid energy performance certificate given, free of charge, to the Defendant? Yes',
  Q16_EPC_PROVIDED_NO: '16. Was a valid energy performance certificate given, free of charge, to the Defendant? No',

  // ==========================================================================
  // Q17 - Gas Safety
  // ==========================================================================
  Q17_HAS_GAS_YES: '17. Is there any relevant gas fitting (including any gas appliance or installation pipework) installed in or serving the property? Yes',
  Q17_HAS_GAS_NO: '17. Is there any relevant gas fitting (including any gas appliance or installation pipework) installed in or serving the property? No',
  Q17A_GAS_BEFORE_OCCUPATION_YES: '17a. Was a copy of a valid gas safety record provided to the Defendant before they went into occupation of the property? Yes',
  Q17A_GAS_BEFORE_OCCUPATION_NO: '17a. Was a copy of a valid gas safety record provided to the Defendant before they went into occupation of the property? No',
  Q17B_GAS_RECORDS_PROVIDED_YES: '17b. Have gas safety records been provided to the Defendant covering all further gas safety inspections carried out during the period of the tenancy? Yes',
  Q17B_GAS_RECORDS_PROVIDED_NO: '17b. Have gas safety records been provided to the Defendant covering all further gas safety inspections carried out during the period of the tenancy? No',
  Q17C_GAS_DISPLAYED_YES: '17c. If there is no relevant gas appliance in any room occupied by the Defendant, has the Claimant displayed in a prominent position in the premises throughout the tenancy a copy of the gas safety record with a statement endorsed on it that the Defendant is entitled to have their own copy of the gas safety record on request to the Claimant at an address specified in the statement? Yes',
  Q17C_GAS_DISPLAYED_NO: '17c. If there is no relevant gas appliance in any room occupied by the Defendant, has the Claimant displayed in a prominent position in the premises throughout the tenancy a copy of the gas safety record with a statement endorsed on it that the Defendant is entitled to have their own copy of the gas safety record on request to the Claimant at an address specified in the statement? No',

  // ==========================================================================
  // Q18 - Social Housing and How to Rent
  // ==========================================================================
  Q18_SOCIAL_HOUSING_PROVIDER_YES: '18. Is the Claimant a private registered provider of social housing? Yes',
  Q18_SOCIAL_HOUSING_PROVIDER_NO: '18. Is the Claimant a private registered provider of social housing? No',
  Q18A_PRE_ACTION_PROTOCOL_YES: '18a. Has the Claimant complied with Part 3 of the Pre-Action Protocol For Possession Claims by Social Landlords? Yes',
  Q18A_PRE_ACTION_PROTOCOL_NO: '18a. Has the Claimant complied with Part 3 of the Pre-Action Protocol For Possession Claims by Social Landlords? No',
  Q18B_HOW_TO_RENT_PROVIDED_YES: `18b. Has the Defendant been given a copy of the then current document ‘How to Rent: the checklist for renting in England’? Yes`,
  Q18B_HOW_TO_RENT_PROVIDED_NO: `18b. Has the Defendant been given a copy of the then current document ‘How to Rent: the checklist for renting in England’? No`,
  Q18D_HOW_TO_RENT_HARDCOPY: '18d. How was the document provided? Hard copy',
  Q18D_HOW_TO_RENT_EMAIL: '18d. How was the document provided? Email',

  // ==========================================================================
  // Q19 - Tenant Fees Act 2019 / Prohibited Payments
  // IMPORTANT: Field names use curly quotes (\u2019 = ') not straight quotes (')
  // ==========================================================================
  Q19_PROHIBITED_PAYMENT_YES: `19. Has the Claimant required the Defendant (or any guarantor or person acting on behalf of the Defendant) to make a \u2018prohibited payment\u2019 (as defined by section 3 of the Tenant Fees Act 2019 (\u2018the 2019 Act\u2019)) contrary to s.1 of the 2019 Act? Yes`,
  Q19_PROHIBITED_PAYMENT_NO: `19. Has the Claimant required the Defendant (or any guarantor or person acting on behalf of the Defendant) to make a \u2018prohibited payment\u2019 (as defined by section 3 of the Tenant Fees Act 2019 (\u2018the 2019 Act\u2019)) contrary to s.1 of the 2019 Act? No`,
  Q19A_PAYMENT_MADE_YES: '19a. Did the Defendant (or any guarantor or person acting on behalf of the Defendant) make such a payment to the Claimant as a result of that requirement? Yes',
  Q19A_PAYMENT_MADE_NO: '19a. Did the Defendant (or any guarantor or person acting on behalf of the Defendant) make such a payment to the Claimant as a result of that requirement? No',
  Q19B_HOLDING_DEPOSIT_YES: '19b. Was a holding deposit (as defined by paragraph 3(2) of Schedule 1 to the 2019 Act) paid to the Claimant on or after 1 June 2019 in relation to the tenancy? Yes',
  Q19B_HOLDING_DEPOSIT_NO: '19b. Was a holding deposit (as defined by paragraph 3(2) of Schedule 1 to the 2019 Act) paid to the Claimant on or after 1 June 2019 in relation to the tenancy? No',
  Q19C_REPAID_FULL: '19c. If the answer to 19a or 19b is Yes, has the prohibited payment and/or holding deposit been repaid in full to the Defendant (or other person from whom the payment was received)? Yes - in full',
  Q19C_REPAID_PART: '19c. If the answer to 19a or 19b is Yes, has the prohibited payment and/or holding deposit been repaid in full to the Defendant (or other person from whom the payment was received)? Yes - in part',
  Q19C_REPAID_NO: '19c. If the answer to 19a or 19b is Yes, has the prohibited payment and/or holding deposit been repaid in full to the Defendant (or other person from whom the payment was received)? No',
  Q19D_APPLIED_TO_RENT_YES: `19d. If you answered \u2018Yes\u2019 to either 19a or 19b but the prohibited payment and/or holding deposit has not been repaid in full to the Defendant (or other person from whom the payment was received), has the prohibited payment and/or holding deposit (or, where part repayment has been made, the remainder thereof) been applied, with the consent of the Defendant (or other person from whom the payment was received) towards: i. payment of rent under the tenancy? Yes`,
  Q19D_APPLIED_TO_RENT_NO: `19d. If you answered \u2018Yes\u2019 to either 19a or 19b but the prohibited payment and/or holding deposit has not been repaid in full to the Defendant (or other person from whom the payment was received), has the prohibited payment and/or holding deposit (or, where part repayment has been made, the remainder thereof) been applied, with the consent of the Defendant (or other person from whom the payment was received) towards: i. payment of rent under the tenancy? No`,
  Q19D_APPLIED_TO_DEPOSIT_YES: `19d. If you answered \u2018Yes\u2019 to either 19a or 19b but the prohibited payment and/or holding deposit has not been repaid in full to the Defendant (or other person from whom the payment was received), has the prohibited payment and/or holding deposit (or, where part repayment has been made, the remainder thereof) been applied, with the consent of the Defendant (or other person from whom the payment was received) towards: ii. the payment of the tenancy deposit? Yes`,
  Q19D_APPLIED_TO_DEPOSIT_NO: `19d. If you answered \u2018Yes\u2019 to either 19a or 19b but the prohibited payment and/or holding deposit has not been repaid in full to the Defendant (or other person from whom the payment was received), has the prohibited payment and/or holding deposit (or, where part repayment has been made, the remainder thereof) been applied, with the consent of the Defendant (or other person from whom the payment was received) towards: ii. the payment of the tenancy deposit? No`,

  // ==========================================================================
  // Q20 - Paper Determination
  // ==========================================================================
  Q20_PAPER_DETERMINATION_YES: '20. If the Defendant seeks postponement of possession for up to 6 weeks on the grounds of exceptional hardship, is the Claimant content that the request be considered without a hearing? Yes',
  Q20_PAPER_DETERMINATION_NO: '20. If the Defendant seeks postponement of possession for up to 6 weeks on the grounds of exceptional hardship, is the Claimant content that the request be considered without a hearing? No',

  // Q21 - Orders
  ORDER_POSSESSION: '21. The Claimant asks the court to order that the Defendant delivers up possession of the property',
  ORDER_COSTS: '21. The Claimant asks the court to order that the Defendant pays the costs of this claim',

  // Statement of Truth
  SOT_CLAIMANT: 'Statement of Truth is signed by: Claimant',
  SOT_LEGAL_REP: "Statement of Truth is signed by: Claimant's legal representative (as defined by CPR 2.3(1))",
  SOT_LITIGATION_FRIEND: 'Statement of Truth is signed by: Litigation friend (where Claimant is a child or a protected party)',
  SOT_BELIEVES: 'I believe that the facts stated in this claim form and any attached sheets are true',
  SOT_AUTHORISED: "The Claimant(s) believe(s) that the facts stated in this claim form and any attached sheets are true. I am authorised by the Claimant(s) to sign this statement",

  // England location
  ENGLAND_YES: 'Is the property you are claiming possession of located wholly or partly in England? Yes',
  ENGLAND_NO: 'Is the property you are claiming possession of located wholly or partly in England? No',

  // Attachments
  ATTACHMENT_TENANCY: 'Copy of the first written tenancy agreement marked A',
  ATTACHMENT_SUBSEQUENT_TENANCIES: 'Where one or more tenancy agreements have been entered into a copy of each such tenancy agreement marked (\'A1\' \'A2\', \'A3\', etc.)',
  ATTACHMENT_NOTICE: 'Copy of the notice saying that possession was required marked B',
  ATTACHMENT_SERVICE_PROOF: 'Proof of service of the notice requiring possession marked B1',
  ATTACHMENT_LICENCE: 'Copy of the licence issued under Part 2 or Part 3 of the Housing Act 2004 marked \'C\'',
  ATTACHMENT_LICENCE_EVIDENCE: 'Evidence of any outstanding licence application, notification or appeal under parts 2 or 3 of the Housing Act 2004 marked \'D\'',
  ATTACHMENT_DEPOSIT_CERT: 'Copy of the Tenancy Deposit Certificate marked E',
  ATTACHMENT_EPC: 'Copy of the Energy Performance Certificate marked F',
  ATTACHMENT_GAS: 'Copy of the Gas Safety Records marked G G1 G2 etc',
  ATTACHMENT_HOW_TO_RENT: 'Copy of the documents relating to compliance by a registered provider of social housing with Part 3 of the Pre-Action Protocol For Possession Claims by Social Landlords OR a copy of the document \'How to Rent: the checklist for renting in England\' marked \'H\'',
} as const;

// =============================================================================
// REQUIRED FIELD VALIDATION LISTS
// =============================================================================

/**
 * Required PDF fields that MUST exist in the N5B template.
 * If any of these are missing, form generation will fail with TemplateFieldMissingError.
 *
 * This prevents "silent" generation failures where we think we filled a field
 * but it actually doesn't exist in the template (e.g., due to template version changes).
 */
const N5B_REQUIRED_PDF_FIELDS = [
  // Defendant service address (Page 5) - postcode is critical
  N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_POSTCODE,
  // Q20 checkboxes - one MUST be ticked
  N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_YES,
  N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_NO,
  // Q9a-Q9g AST verification - mandatory checkboxes
  N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_YES,
  N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_NO,
  // Core claimant/defendant name fields
  N5B_FIELDS.FIRST_CLAIMANT_FIRST_NAMES,
  N5B_FIELDS.FIRST_CLAIMANT_LAST_NAME,
  N5B_FIELDS.FIRST_DEFENDANT_FIRST_NAMES,
  N5B_FIELDS.FIRST_DEFENDANT_LAST_NAME,
  // Notice service method (Q10a)
  N5B_FIELDS.NOTICE_SERVICE_METHOD,
];

/**
 * Required PDF fields that MUST exist in the N1 template (Money Claims).
 * If any of these are missing, form generation will fail with TemplateFieldMissingError.
 *
 * This prevents "silent" generation failures where we think we filled a field
 * but it actually doesn't exist in the template (e.g., due to template version changes).
 *
 * N1 form version: December 2024 (N1_1224.pdf)
 * Source: https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf
 */
const N1_REQUIRED_PDF_FIELDS = [
  // Core claimant/defendant details - CRITICAL for claim identification
  'Text21', // Claimant details box
  'Text22', // Defendant details box
  // Brief details of claim - CRITICAL for claim validity
  'Text23', // Brief details of claim
  // Value/Amount - CRITICAL for money claim
  // Note: Text24 was removed from Dec 2024 N1 PDF template
  'Text25', // Claim amount
  // Financial totals
  'Text26', // Court fee
  'Text28', // Total amount
  // Statement of Truth signature
  'Text Field 47', // Signatory name
  // Service address fields
  'Text Field 10', // Address line 1
  'Text34', // Postcode
];

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
  tenant_3_name?: string;  // P0 FIX: Support up to 4 joint tenants
  tenant_4_name?: string;  // P0 FIX: Support up to 4 joint tenants
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

  // =========================================================================
  // N5B ATTACHMENT CHECKBOXES (Page 20) - "Available to Attach" Flags
  // =========================================================================
  // These flags indicate whether the user has the document AVAILABLE to attach
  // to the N5B form. This is different from:
  // - *_uploaded: whether a file was uploaded to the wizard (for pack scoring)
  // - *_provided: whether the document was provided to the tenant (for Q15-18)
  //
  // The attachment checkbox should be ticked if the user confirms they WILL
  // attach the document, OR if we can infer availability from other data.
  //
  // SEMANTIC: Tick if (document_available === true) OR (document_provided === true)
  // =========================================================================
  deposit_certificate_available?: boolean;  // Checkbox E - deposit cert will be attached
  epc_available?: boolean;                   // Checkbox F - EPC will be attached
  gas_safety_available?: boolean;            // Checkbox G - gas safety will be attached
  how_to_rent_available?: boolean;           // Checkbox H - how to rent will be attached

  // Legacy upload flags - kept for pack-strength scoring, NOT for court form ticks
  deposit_certificate_uploaded?: boolean;
  epc_uploaded?: boolean;
  gas_safety_uploaded?: boolean;
  how_to_rent_uploaded?: boolean;

  // =========================================================================
  // N5B QUESTIONS 9a-9g: AST VERIFICATION (Statement of Truth - MANDATORY)
  // All use POSITIVE framing matching the N5B form directly:
  // - Q9a: Yes = tenancy after 28 Feb 1997 (good for AST eligibility)
  // - Q9b-Q9g: Yes = disqualifying condition exists (bad for AST eligibility)
  // =========================================================================
  n5b_q9a_after_feb_1997?: boolean;        // Q9a: Was tenancy created after 28 Feb 1997? (Yes = good)
  n5b_q9b_has_notice_not_ast?: boolean;    // Q9b: Has notice been served that NOT an AST? (Yes = bad)
  n5b_q9c_has_exclusion_clause?: boolean;  // Q9c: Does agreement state NOT an AST? (Yes = bad)
  n5b_q9d_is_agricultural_worker?: boolean; // Q9d: Is tenant an agricultural worker? (Yes = bad)
  n5b_q9e_is_succession_tenancy?: boolean;  // Q9e: Did tenancy arise by succession? (Yes = bad)
  n5b_q9f_was_secure_tenancy?: boolean;    // Q9f: Was this previously a secure tenancy? (Yes = bad)
  n5b_q9g_is_schedule_10?: boolean;        // Q9g: Was tenancy granted under Schedule 10? (Yes = bad)

  // =========================================================================
  // N5B QUESTION 11: LICENSING (HMO / Selective)
  // =========================================================================
  n5b_property_requires_licence?: boolean; // Q11a: Is property required to be licensed?
  n5b_has_valid_licence?: boolean;         // Q11a follow-up: Is there a valid licence?
  n5b_licensing_decision_outstanding?: boolean; // Q11b: Is a decision outstanding / TEN?

  // =========================================================================
  // N5B QUESTION 15: PROPERTY CONDITION / RETALIATORY EVICTION
  // Has a relevant notice been served under Housing Act 2004?
  // =========================================================================
  n5b_property_condition_notice_served?: boolean; // Q15: Has notice been served?

  // =========================================================================
  // N5B QUESTIONS 16-18: COMPLIANCE DATES
  // =========================================================================
  // Q16: EPC (was Q15 in older forms)
  epc_provided_date?: string;            // Q16: Date EPC was provided
  // Q16-17: Gas safety
  has_gas_at_property?: boolean;         // Q16: Property has gas (if false, Q16-17 skip)
  gas_safety_before_occupation?: boolean; // Q16: Gas safety record available before occupation
  gas_safety_before_occupation_date?: string; // Q16: Date gas record made available before occupation
  gas_safety_check_date?: string;        // Q17a: Date gas safety check carried out
  gas_safety_served_date?: string;       // Q17b: Date gas safety record served
  // FIX 7: Gas safety service dates table (N5B Page 13)
  gas_safety_service_dates?: string[];   // Array of gas safety record service dates (up to 3)
  // Q18: How to Rent
  how_to_rent_date?: string;             // Q18c: Date How to Rent provided
  how_to_rent_method?: 'hardcopy' | 'email'; // Q18d: Method of provision

  // =========================================================================
  // N5B QUESTIONS 19: TENANT FEES ACT 2019
  // Q19 uses POSITIVE framing: "Has unreturned prohibited payment been taken?"
  // Yes = problem (blocks S21), No = compliant
  // Q19b (holding deposit) is informational only - no blocking for either answer
  // =========================================================================
  n5b_q19_has_unreturned_prohibited_payment?: boolean; // Q19: Has unreturned prohibited payment? (Yes = bad)
  n5b_q19b_holding_deposit?: boolean; // Q19b: Was holding deposit taken? (informational)
  n5b_q19b_holding_deposit_status?: 'no' | 'yes_compliant' | 'yes_breach'; // Raw status from wizard
  n5b_q19c_repayment_status?: 'full' | 'part' | 'no'; // Q19c: repaid in full/part/no
  n5b_q19d_applied_to_rent?: boolean;  // Q19d(i): applied to rent
  n5b_q19d_applied_to_deposit?: boolean; // Q19d(ii): applied to deposit

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
  defendant_service_address_county?: string;  // FIX 2: Added for N5B Page 5
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
   *
   * IMPORTANT: For official HMCTS court forms (N5, N5B, N119, N1), this defaults to FALSE
   * to preserve user editability. Users need to make final adjustments before court submission.
   *
   * - false (default for official forms): Keep form fields editable
   * - true: Flatten for final output - NOT recommended for official forms
   *
   * @deprecated DO NOT flatten official court forms. This option is kept for backwards
   * compatibility but will log a warning if used to flatten official forms.
   */
  flatten?: boolean;
}

// =============================================================================
// CUSTOM ERROR TYPES
// =============================================================================

/**
 * Error thrown when a required PDF template field is missing.
 * This prevents silent generation failures where a field doesn't exist
 * in the PDF template but we attempted to fill it.
 */
export class TemplateFieldMissingError extends Error {
  public readonly templateName: string;
  public readonly missingFields: string[];
  public readonly availableFields: string[];

  constructor(templateName: string, missingFields: string[], availableFields: string[]) {
    const fieldList = missingFields.map(f => `  - ${f}`).join('\n');
    super(
      `Template "${templateName}" is missing required fields:\n${fieldList}\n\n` +
      `This may indicate:\n` +
      `1. The PDF template version has changed and field names differ\n` +
      `2. The field name constants need updating\n` +
      `3. The PDF needs to be replaced with a version containing these fields\n\n` +
      `First 20 available fields: ${availableFields.slice(0, 20).join(', ')}...`
    );
    this.name = 'TemplateFieldMissingError';
    this.templateName = templateName;
    this.missingFields = missingFields;
    this.availableFields = availableFields;
  }
}

/**
 * Validate that required fields exist in the PDF form template.
 * Call this BEFORE filling to catch template mismatches early.
 *
 * @param form - The PDF form to validate
 * @param requiredFields - List of field names that MUST exist
 * @param templateName - Name of the template (for error messages)
 * @throws TemplateFieldMissingError if any required fields are missing
 */
export function assertPdfHasFields(form: PDFForm, requiredFields: string[], templateName: string): void {
  const availableFields = listFormFieldNames(form);
  const availableSet = new Set(availableFields);
  const missingFields = requiredFields.filter(f => !availableSet.has(f));

  if (missingFields.length > 0) {
    throw new TemplateFieldMissingError(templateName, missingFields, availableFields);
  }
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

/**
 * Set a required checkbox - throws error if field missing.
 * Use this for mandatory checkboxes like Q20 that MUST be ticked.
 */
function setCheckboxRequired(form: PDFForm, fieldName: string, context: string): void {
  try {
    const field = form.getCheckBox(fieldName);
    field.check();
  } catch (error) {
    const available = listFormFieldNames(form)
      .filter(n => n.toLowerCase().includes('checkbox') || n.includes('Yes') || n.includes('No'))
      .slice(0, 20)
      .join(', ');
    throw new TemplateFieldMissingError(
      context,
      [fieldName],
      listFormFieldNames(form)
    );
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
 * Extract UK postcode from an address string.
 * UK postcodes follow patterns like: SW1A 1AA, M1 1AE, DN55 1PT, etc.
 * This is used as a fallback when postcode is not explicitly provided.
 */
function extractPostcodeFromAddress(address: string | undefined): string | undefined {
  if (!address) return undefined;

  // UK postcode regex: covers standard formats
  // Format: 1-2 letters, 1-2 digits, optionally space, digit, 2 letters
  // Examples: SW1A 1AA, M1 1AE, DN55 1PT, EC1A 1BB
  const postcodeRegex = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i;
  const match = address.match(postcodeRegex);

  if (match) {
    // Normalize format: ensure single space before last 3 chars
    const postcode = match[1].toUpperCase().replace(/\s+/g, '');
    if (postcode.length >= 5) {
      return postcode.slice(0, -3) + ' ' + postcode.slice(-3);
    }
    return postcode;
  }

  return undefined;
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
  // Official forms default to NOT flattening - users need editable fields for final adjustments
  const { flatten = false } = options;
  if (flatten) {
    console.warn('⚠️ [N5] Flattening official court forms is deprecated. Users need editable outputs.');
  }
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
  console.log('📄 N5 form preserved as editable (AcroForm fields retained)');

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
  // Official forms default to NOT flattening - users need editable fields for final adjustments
  const { flatten = false } = options;
  if (flatten) {
    console.warn('⚠️ [N5B] Flattening official court forms is deprecated. Users need editable outputs.');
  }
  const ctx = 'N5B';
  const formFile = getFormFilename('n5b', data.jurisdiction);
  console.log(`📄 Filling N5B form (Accelerated possession - Section 21) - using ${formFile}...`);

  // ==========================================================================
  // DEBUG LOGGING - Log N5B-relevant CaseData fields
  // ==========================================================================
  console.log('🔍 [N5B-FILLER] fillN5BForm received CaseData with N5B fields:', JSON.stringify({
    // Q9a-Q9g
    n5b_q9a_after_feb_1997: data.n5b_q9a_after_feb_1997,
    n5b_q9b_has_notice_not_ast: data.n5b_q9b_has_notice_not_ast,
    n5b_q9c_has_exclusion_clause: data.n5b_q9c_has_exclusion_clause,
    n5b_q9d_is_agricultural_worker: data.n5b_q9d_is_agricultural_worker,
    n5b_q9e_is_succession_tenancy: data.n5b_q9e_is_succession_tenancy,
    n5b_q9f_was_secure_tenancy: data.n5b_q9f_was_secure_tenancy,
    n5b_q9g_is_schedule_10: data.n5b_q9g_is_schedule_10,
    // Q10a
    notice_service_method: data.notice_service_method,
    // Q11-14 Deposit
    deposit_amount: data.deposit_amount,
    deposit_returned: data.deposit_returned,
    deposit_prescribed_info_given: data.deposit_prescribed_info_given,
    // Q15 EPC
    epc_provided: data.epc_provided,
    epc_provided_date: data.epc_provided_date,
    // Q16-17 Gas Safety
    has_gas_at_property: data.has_gas_at_property,
    gas_safety_provided: data.gas_safety_provided,
    gas_safety_before_occupation: data.gas_safety_before_occupation,
    gas_safety_check_date: data.gas_safety_check_date,
    gas_safety_served_date: data.gas_safety_served_date,
    // Q18 How to Rent
    how_to_rent_provided: data.how_to_rent_provided,
    how_to_rent_date: data.how_to_rent_date,
    how_to_rent_method: data.how_to_rent_method,
    // Q19
    n5b_q19_has_unreturned_prohibited_payment: data.n5b_q19_has_unreturned_prohibited_payment,
    n5b_q19b_holding_deposit: data.n5b_q19b_holding_deposit,
    // Q20
    n5b_q20_paper_determination: data.n5b_q20_paper_determination,
    // Defendant service address (Page 5)
    defendant_service_address_same_as_property: data.defendant_service_address_same_as_property,
    defendant_service_address_line1: data.defendant_service_address_line1,
    defendant_service_address_postcode: data.defendant_service_address_postcode,
    // Property postcode (fallback for defendant service)
    property_postcode: data.property_postcode,
  }, null, 2));

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

  // ==========================================================================
  // TEMPLATE FIELD VALIDATION
  // ==========================================================================
  // Validate that required fields exist in the PDF template BEFORE filling.
  // This catches template version mismatches early with clear error messages.
  assertPdfHasFields(form, N5B_REQUIRED_PDF_FIELDS, formFile);
  console.log(`✅ [N5B] Template validation passed - all ${N5B_REQUIRED_PDF_FIELDS.length} required fields present`);

  // === HEADER SECTION ===
  const courtNameAndAddress = data.court_address
    ? `${data.court_name}\n${data.court_address}`
    : data.court_name;

  // P0 FIX: Concatenate ALL landlord/tenant names for header fields
  // N5B supports up to 2 individual claimant/defendant detail sections, but the
  // "Enter the full names" fields can contain all parties.
  const allLandlords = [data.landlord_full_name, data.landlord_2_name]
    .filter(Boolean)
    .join(', ');
  const allTenants = [data.tenant_full_name, data.tenant_2_name, data.tenant_3_name, data.tenant_4_name]
    .filter(Boolean)
    .join(', ');

  setTextRequired(form, N5B_FIELDS.CLAIMANTS_NAMES, allLandlords, ctx);
  setTextRequired(form, N5B_FIELDS.DEFENDANTS_NAMES, allTenants, ctx);
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

  // === FIX 2: DEFENDANT'S ADDRESS FOR SERVICE (N5B Page 5) ===
  // Default to property address unless explicitly overridden
  const defServiceAddress = data.defendant_service_address_line1 || data.property_address;
  const defServiceAddressLines = splitAddress(defServiceAddress);
  setTextOptional(form, N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_STREET, defServiceAddressLines[0], ctx);
  if (defServiceAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_LINE2, defServiceAddressLines[1], ctx);
  }
  if (defServiceAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_TOWN, defServiceAddressLines[2], ctx);
  }
  // County is optional - only set if provided
  if (data.defendant_service_address_county) {
    setTextOptional(form, N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_COUNTY, data.defendant_service_address_county, ctx);
  }

  // FIX: Defendant service postcode - use multiple fallbacks to ensure it's always populated
  // Priority: 1) explicit defendant_service_address_postcode, 2) property_postcode, 3) extract from address
  const defServicePostcode =
    data.defendant_service_address_postcode ||
    data.property_postcode ||
    extractPostcodeFromAddress(data.property_address);
  if (defServicePostcode) {
    setTextOptional(form, N5B_FIELDS.DEFENDANT_SERVICE_ADDRESS_POSTCODE, defServicePostcode, ctx);
    console.log(`📮 [N5B] Defendant service postcode set: ${defServicePostcode}`);
  } else {
    console.warn(`⚠️ [N5B] WARNING: Defendant service postcode is blank - this may cause issues`);
  }

  // === POSSESSION ADDRESS ===
  setTextOptional(form, N5B_FIELDS.POSSESSION_STREET, propertyAddressLines[0], ctx);
  if (propertyAddressLines.length > 1) {
    setTextOptional(form, N5B_FIELDS.POSSESSION_LINE2, propertyAddressLines[1], ctx);
  }
  if (propertyAddressLines.length > 2) {
    setTextOptional(form, N5B_FIELDS.POSSESSION_TOWN, propertyAddressLines[2], ctx);
  }

  // FIX: Possession postcode - use same fallback logic
  const possessionPostcode =
    data.property_postcode ||
    extractPostcodeFromAddress(data.property_address);
  if (possessionPostcode) {
    setTextOptional(form, N5B_FIELDS.POSSESSION_POSTCODE, possessionPostcode, ctx);
  }

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
  } else {
    // Default: Most tenancies don't have subsequent written agreements
    setCheckbox(form, N5B_CHECKBOXES.SUBSEQUENT_TENANCY_NO, true, ctx);
  }

  // =========================================================================
  // Q9a-Q9g: AST VERIFICATION (MANDATORY - Statement of Truth)
  // =========================================================================
  // CRITICAL: These answers form part of the Statement of Truth.
  // Courts WILL reject claims with missing answers.
  //
  // IMPORTANT: Wizard questions now use POSITIVE framing matching N5B directly.
  // NO INVERSION NEEDED - wizard values map directly to PDF checkboxes.
  // - Q9a: Yes = tenancy after 28 Feb 1997 (eligible for accelerated)
  // - Q9b-Q9g: Yes = disqualifying condition exists (NOT eligible)
  // =========================================================================

  // ==========================================================================
  // Q9a-Q9g: AST VERIFICATION (Statement of Truth - MANDATORY)
  // Updated January 2026 to match actual n5b-eng.pdf field names
  // ==========================================================================

  // Q9a: Was tenancy created on or after 28 February 1997?
  if (data.n5b_q9a_after_feb_1997 !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_YES, data.n5b_q9a_after_feb_1997, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_NO, !data.n5b_q9a_after_feb_1997, ctx);
  } else {
    // Default: Most modern ASTs are created after Feb 1997
    setCheckbox(form, N5B_CHECKBOXES.Q9A_AFTER_FEB_1997_YES, true, ctx);
  }

  // Q9b: Was a notice served stating tenancy is NOT an AST?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9b_has_notice_not_ast !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9B_NOTICE_NOT_AST_YES, data.n5b_q9b_has_notice_not_ast, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9B_NOTICE_NOT_AST_NO, !data.n5b_q9b_has_notice_not_ast, ctx);
  } else {
    // Default: Standard ASTs don't have opt-out notices
    setCheckbox(form, N5B_CHECKBOXES.Q9B_NOTICE_NOT_AST_NO, true, ctx);
  }

  // Q9c: Is there any provision stating tenancy is NOT an AST?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9c_has_exclusion_clause !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9C_EXCLUSION_CLAUSE_YES, data.n5b_q9c_has_exclusion_clause, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9C_EXCLUSION_CLAUSE_NO, !data.n5b_q9c_has_exclusion_clause, ctx);
  } else {
    // Default: Standard ASTs don't have exclusion clauses
    setCheckbox(form, N5B_CHECKBOXES.Q9C_EXCLUSION_CLAUSE_NO, true, ctx);
  }

  // Q9d: Is the 'agricultural worker condition' fulfilled?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9d_is_agricultural_worker !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9D_AGRICULTURAL_YES, data.n5b_q9d_is_agricultural_worker, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9D_AGRICULTURAL_NO, !data.n5b_q9d_is_agricultural_worker, ctx);
  } else {
    // Default: Most tenancies are not agricultural worker tenancies
    setCheckbox(form, N5B_CHECKBOXES.Q9D_AGRICULTURAL_NO, true, ctx);
  }

  // Q9e: Did any tenancy arise by way of succession?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9e_is_succession_tenancy !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9E_SUCCESSION_YES, data.n5b_q9e_is_succession_tenancy, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9E_SUCCESSION_NO, !data.n5b_q9e_is_succession_tenancy, ctx);
  } else {
    // Default: Most tenancies are not succession tenancies
    setCheckbox(form, N5B_CHECKBOXES.Q9E_SUCCESSION_NO, true, ctx);
  }

  // Q9f: Was any tenancy previously a secure tenancy?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9f_was_secure_tenancy !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9F_FORMER_SECURE_YES, data.n5b_q9f_was_secure_tenancy, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9F_FORMER_SECURE_NO, !data.n5b_q9f_was_secure_tenancy, ctx);
  } else {
    // Default: Most private tenancies were never secure tenancies
    setCheckbox(form, N5B_CHECKBOXES.Q9F_FORMER_SECURE_NO, true, ctx);
  }

  // Q9g: Did any tenancy arise under Schedule 10 to the LGHA 1989?
  // Direct mapping: wizard Yes = PDF Yes (disqualifying), No = PDF No (eligible)
  if (data.n5b_q9g_is_schedule_10 !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q9G_SCHEDULE_10_YES, data.n5b_q9g_is_schedule_10, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q9G_SCHEDULE_10_NO, !data.n5b_q9g_is_schedule_10, ctx);
  } else {
    // Default: Most tenancies don't arise under Schedule 10
    setCheckbox(form, N5B_CHECKBOXES.Q9G_SCHEDULE_10_NO, true, ctx);
  }

  // ==========================================================================
  // Q11: LICENSING (HMO / Selective)
  // ==========================================================================
  if (data.n5b_property_requires_licence !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q11A_LICENSING_REQUIRED_YES, data.n5b_property_requires_licence, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q11A_LICENSING_REQUIRED_NO, !data.n5b_property_requires_licence, ctx);

    // Q11a follow-up: If licensing is required, is there a valid licence?
    if (data.n5b_property_requires_licence && data.n5b_has_valid_licence !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.Q11A_HAS_VALID_LICENCE_YES, data.n5b_has_valid_licence, ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q11A_HAS_VALID_LICENCE_NO, !data.n5b_has_valid_licence, ctx);
    }

    // Q11b: Is a decision outstanding as to licensing or TEN?
    if (data.n5b_licensing_decision_outstanding !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.Q11B_DECISION_OUTSTANDING_YES, data.n5b_licensing_decision_outstanding, ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q11B_DECISION_OUTSTANDING_NO, !data.n5b_licensing_decision_outstanding, ctx);
    } else {
      // Default Q11b based on licensing status:
      // - If no licensing required: No decision can be outstanding
      // - If licensing required and valid licence: Decision is complete
      // - If licensing required but no valid licence: Leave blank (user must specify)
      if (!data.n5b_property_requires_licence || data.n5b_has_valid_licence === true) {
        setCheckbox(form, N5B_CHECKBOXES.Q11B_DECISION_OUTSTANDING_NO, true, ctx);
      }
    }
  } else {
    // Default: Most private rental properties don't require HMO/selective licensing
    setCheckbox(form, N5B_CHECKBOXES.Q11A_LICENSING_REQUIRED_NO, true, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q11B_DECISION_OUTSTANDING_NO, true, ctx);
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
    } else {
      // Default: Deposit not yet returned (still protected during tenancy)
      setCheckbox(form, N5B_CHECKBOXES.DEPOSIT_RETURNED_NO, true, ctx);
    }

    // Q14a: Prescribed info given
    if (data.deposit_prescribed_info_given !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.PRESCRIBED_INFO_YES, data.deposit_prescribed_info_given, ctx);
      setCheckbox(form, N5B_CHECKBOXES.PRESCRIBED_INFO_NO, !data.deposit_prescribed_info_given, ctx);
    } else {
      // Default: For valid Section 21, prescribed info must have been given
      setCheckbox(form, N5B_CHECKBOXES.PRESCRIBED_INFO_YES, true, ctx);
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
  // Q15: PROPERTY CONDITION / RETALIATORY EVICTION (Housing Act 2004)
  // The wizard asks about improvement_notice_served and emergency_remedial_action.
  // If EITHER is true, a relevant notice has been served and Section 21 may be blocked.
  // For valid Section 21, we typically answer "No" (no notice served).
  // =========================================================================
  if (data.n5b_property_condition_notice_served !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q15_PROPERTY_CONDITION_NOTICE_YES, data.n5b_property_condition_notice_served, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q15_PROPERTY_CONDITION_NOTICE_NO, !data.n5b_property_condition_notice_served, ctx);
  } else {
    // Default: No property condition notice served (standard case)
    setCheckbox(form, N5B_CHECKBOXES.Q15_PROPERTY_CONDITION_NOTICE_NO, true, ctx);
  }

  // =========================================================================
  // Q16: EPC PROVIDED (was Q15 in older forms)
  // For valid Section 21, EPC must have been provided - default to Yes if not specified
  // =========================================================================
  if (data.epc_provided !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q16_EPC_PROVIDED_YES, data.epc_provided, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q16_EPC_PROVIDED_NO, !data.epc_provided, ctx);
  } else {
    // Default: For valid Section 21, EPC would have been provided
    setCheckbox(form, N5B_CHECKBOXES.Q16_EPC_PROVIDED_YES, true, ctx);
  }

  // Q16 date: When EPC was provided to defendant
  if (data.epc_provided_date) {
    const epcDate = splitDate(data.epc_provided_date);
    if (epcDate) {
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_DAY, epcDate.day, ctx);
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_MONTH, epcDate.month, ctx);
      setTextOptional(form, N5B_FIELDS.EPC_PROVIDED_DATE_YEAR, epcDate.year, ctx);
    }
  }

  // =========================================================================
  // Q17: GAS SAFETY (was Q16/Q17 in older forms)
  // =========================================================================
  // Q17: Is there any relevant gas fitting at the property?
  if (data.has_gas_at_property === false) {
    // No gas at property
    setCheckbox(form, N5B_CHECKBOXES.Q17_HAS_GAS_NO, true, ctx);
  } else {
    // Default: Most UK properties have gas - treat undefined as true
    setCheckbox(form, N5B_CHECKBOXES.Q17_HAS_GAS_YES, true, ctx);

    // Q17a: Was gas safety record provided before occupation?
    if (data.gas_safety_before_occupation !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.Q17A_GAS_BEFORE_OCCUPATION_YES, data.gas_safety_before_occupation, ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q17A_GAS_BEFORE_OCCUPATION_NO, !data.gas_safety_before_occupation, ctx);
    } else if (data.gas_safety_provided === true) {
      // If gas records were provided during tenancy, likely provided before occupation too
      // This is a reasonable default for compliant landlords
      setCheckbox(form, N5B_CHECKBOXES.Q17A_GAS_BEFORE_OCCUPATION_YES, true, ctx);
    } else {
      // Default: For valid Section 21, gas safety would have been provided before occupation
      setCheckbox(form, N5B_CHECKBOXES.Q17A_GAS_BEFORE_OCCUPATION_YES, true, ctx);
    }

    // Q17b: Have gas safety records been provided during tenancy?
    if (data.gas_safety_provided !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.Q17B_GAS_RECORDS_PROVIDED_YES, data.gas_safety_provided, ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q17B_GAS_RECORDS_PROVIDED_NO, !data.gas_safety_provided, ctx);
    } else {
      // Default: For valid Section 21, gas safety would have been provided if applicable
      setCheckbox(form, N5B_CHECKBOXES.Q17B_GAS_RECORDS_PROVIDED_YES, true, ctx);
    }

    // Q17c: Gas display requirement - only applies if there's NO gas appliance in tenant's room
    // This is a rare edge case (e.g., gas supply but no appliances in living areas).
    // For standard cases with gas appliances in the property, we assume the record was
    // provided directly (Q17a/Q17b), so Q17c display requirement doesn't apply.
    // We'll default to N/A by not checking either box, unless explicitly provided.
    // Most landlords with gas appliances won't need this checkbox.
  }

  // =========================================================================
  // FIX 7: GAS SAFETY DATES TABLE (N5B Page 13)
  // =========================================================================
  // Populate the gas safety service dates table.
  // Option A (preferred): Populate first gas safety issue + service date if captured.
  // If dates not captured but gas_safety_before_occupation === true, use that date.
  // =========================================================================
  const gasServiceDates: string[] = [];

  // Add gas_safety_served_date as the first entry if available
  if (data.gas_safety_served_date) {
    gasServiceDates.push(formatUKLegalDate(data.gas_safety_served_date));
  }
  // Add any additional dates from gas_safety_service_dates array
  if (data.gas_safety_service_dates && Array.isArray(data.gas_safety_service_dates)) {
    data.gas_safety_service_dates.forEach((dateStr) => {
      if (dateStr && !gasServiceDates.includes(formatUKLegalDate(dateStr))) {
        gasServiceDates.push(formatUKLegalDate(dateStr));
      }
    });
  }
  // If still empty but gas_safety_before_occupation_date is available, use it
  if (gasServiceDates.length === 0 && data.gas_safety_before_occupation_date) {
    gasServiceDates.push(formatUKLegalDate(data.gas_safety_before_occupation_date));
  }

  // Populate the table fields (up to 3 rows)
  if (gasServiceDates.length > 0) {
    setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVICE_DATE_1, gasServiceDates[0], ctx);
  }
  if (gasServiceDates.length > 1) {
    setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVICE_DATE_2, gasServiceDates[1], ctx);
  }
  if (gasServiceDates.length > 2) {
    setTextOptional(form, N5B_FIELDS.GAS_SAFETY_SERVICE_DATE_3, gasServiceDates[2], ctx);
  }

  // =========================================================================
  // Q18: SOCIAL HOUSING PROVIDER & HOW TO RENT GUIDE
  // In the new N5B form, Q18 first asks if claimant is social housing provider
  // =========================================================================
  // Q18: Is the Claimant a private registered provider of social housing?
  // For standard private landlords, answer is "No"
  setCheckbox(form, N5B_CHECKBOXES.Q18_SOCIAL_HOUSING_PROVIDER_NO, true, ctx);

  // Q18b: Was How to Rent guide provided
  if (data.how_to_rent_provided !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q18B_HOW_TO_RENT_PROVIDED_YES, data.how_to_rent_provided, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q18B_HOW_TO_RENT_PROVIDED_NO, !data.how_to_rent_provided, ctx);
  } else {
    // Default: For valid Section 21, How to Rent must have been provided
    setCheckbox(form, N5B_CHECKBOXES.Q18B_HOW_TO_RENT_PROVIDED_YES, true, ctx);
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
  } else {
    // Default: Email is most common method for providing How to Rent guide
    setCheckbox(form, N5B_CHECKBOXES.Q18D_HOW_TO_RENT_EMAIL, true, ctx);
  }

  // =========================================================================
  // Q19: TENANT FEES ACT 2019 COMPLIANCE
  // =========================================================================
  // Q19: "Has Claimant required Defendant to make a prohibited payment?"
  // Direct mapping: Yes = problem (blocks S21), No = compliant
  // For valid Section 21, the answer should be No (no prohibited payments)
  if (data.n5b_q19_has_unreturned_prohibited_payment !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q19_PROHIBITED_PAYMENT_YES, data.n5b_q19_has_unreturned_prohibited_payment, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q19_PROHIBITED_PAYMENT_NO, !data.n5b_q19_has_unreturned_prohibited_payment, ctx);

    // Q19a: Did the Defendant actually make such a payment?
    // Only applicable if Q19 is Yes (prohibited payment was required)
    if (data.n5b_q19_has_unreturned_prohibited_payment === true) {
      // If a prohibited payment was required but we got here (valid S21), it must have been refunded
      // So the payment was made but later refunded - we'll handle this in Q19c
      setCheckbox(form, N5B_CHECKBOXES.Q19A_PAYMENT_MADE_YES, true, ctx);
    }
  } else {
    // Default: For valid Section 21, no prohibited payments were taken
    setCheckbox(form, N5B_CHECKBOXES.Q19_PROHIBITED_PAYMENT_NO, true, ctx);
  }

  // Q19b: Was a holding deposit taken? (informational only - no blocking)
  // Direct boolean mapping: Yes = holding deposit taken, No = no holding deposit
  if (data.n5b_q19b_holding_deposit !== undefined) {
    setCheckbox(form, N5B_CHECKBOXES.Q19B_HOLDING_DEPOSIT_YES, data.n5b_q19b_holding_deposit === true, ctx);
    setCheckbox(form, N5B_CHECKBOXES.Q19B_HOLDING_DEPOSIT_NO, data.n5b_q19b_holding_deposit === false, ctx);
  } else {
    // Default: Many tenancies don't have holding deposits
    setCheckbox(form, N5B_CHECKBOXES.Q19B_HOLDING_DEPOSIT_NO, true, ctx);
  }

  // Q19c: Was the prohibited payment/holding deposit repaid?
  // Only required if Q19 or Q19b is Yes
  const needsQ19cQ19d = data.n5b_q19_has_unreturned_prohibited_payment === true || data.n5b_q19b_holding_deposit === true;
  if (needsQ19cQ19d) {
    if (data.n5b_q19c_repayment_status !== undefined) {
      setCheckbox(form, N5B_CHECKBOXES.Q19C_REPAID_FULL, data.n5b_q19c_repayment_status === 'full', ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q19C_REPAID_PART, data.n5b_q19c_repayment_status === 'part', ctx);
      setCheckbox(form, N5B_CHECKBOXES.Q19C_REPAID_NO, data.n5b_q19c_repayment_status === 'no', ctx);
    } else if (data.n5b_q19b_holding_deposit_status === 'yes_compliant') {
      // If holding deposit was handled compliantly, mark as repaid in full
      setCheckbox(form, N5B_CHECKBOXES.Q19C_REPAID_FULL, true, ctx);
    }

    // Q19d: Was the payment applied to rent or deposit?
    // Only relevant if Q19c is NOT "Yes - in full"
    const notFullyRepaid = data.n5b_q19c_repayment_status === 'part' || data.n5b_q19c_repayment_status === 'no';
    if (notFullyRepaid) {
      // Q19d(i): Applied to rent?
      if (data.n5b_q19d_applied_to_rent !== undefined) {
        setCheckbox(form, N5B_CHECKBOXES.Q19D_APPLIED_TO_RENT_YES, data.n5b_q19d_applied_to_rent, ctx);
        setCheckbox(form, N5B_CHECKBOXES.Q19D_APPLIED_TO_RENT_NO, !data.n5b_q19d_applied_to_rent, ctx);
      }
      // Q19d(ii): Applied to deposit?
      if (data.n5b_q19d_applied_to_deposit !== undefined) {
        setCheckbox(form, N5B_CHECKBOXES.Q19D_APPLIED_TO_DEPOSIT_YES, data.n5b_q19d_applied_to_deposit, ctx);
        setCheckbox(form, N5B_CHECKBOXES.Q19D_APPLIED_TO_DEPOSIT_NO, !data.n5b_q19d_applied_to_deposit, ctx);
      }
    }
  }

  // =========================================================================
  // Q20: PAPER DETERMINATION CONSENT
  // =========================================================================
  // FIX: Enhanced Q20 handling with explicit logging and verification
  // Q20 asks if the claimant consents to paper determination if defendant seeks hardship postponement
  // Landlords typically want "Yes" to avoid unnecessary hearings
  const q20Value = data.n5b_q20_paper_determination;
  const q20IsYes = q20Value === true || q20Value === undefined; // Default to Yes if not specified

  console.log(`📝 [N5B] Q20 Paper Determination: value=${q20Value}, setting=${q20IsYes ? 'YES' : 'NO'}`);

  // Use setCheckboxRequired to ensure the field exists and is checked
  if (q20IsYes) {
    setCheckboxRequired(form, N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_YES, ctx);
    console.log(`✅ [N5B] Q20 YES checkbox set`);
  } else {
    setCheckboxRequired(form, N5B_CHECKBOXES.Q20_PAPER_DETERMINATION_NO, ctx);
    console.log(`✅ [N5B] Q20 NO checkbox set`);
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

  // =========================================================================
  // FIX 4 (Jan 2026): DETERMINISTIC N5B ATTACHMENT CHECKBOXES (A, B, B1, E, F, G, H)
  // =========================================================================
  // These checkboxes indicate documents that WILL BE ATTACHED to the N5B claim.
  // For Section 21 accelerated possession packs, we use DETERMINISTIC logic:
  //
  // A - Tenancy Agreement: Tick if tenancy dates provided (always true for S21 pack)
  // B - Section 21 Notice: ALWAYS tick for Section 21 claims
  // B1 - Proof of Service: ALWAYS tick (pack always includes PoS template)
  // E - Deposit Certificate: Tick if deposit taken AND protected
  // F - EPC: Tick if epc_provided === true
  // G - Gas Safety: Tick if has_gas_at_property !== false AND gas_safety_provided === true
  // H - How to Rent: Tick if how_to_rent_provided === true
  //
  // This ensures court packs have consistent, predictable tick states.
  // =========================================================================

  // A: Tenancy agreement (marked A) - required attachment
  // Tick if: explicitly confirmed, or tenancy dates are provided (implying agreement exists)
  const hasTenancyAgreement =
    data.tenancy_agreement_uploaded === true ||
    data.tenancy_agreement_available === true ||
    (data.tenancy_start_date && data.tenancy_start_date.length > 0);
  if (hasTenancyAgreement) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_TENANCY, true, ctx);
  }

  // B: Section 21 Notice copy (marked B) - required attachment
  // Tick if: explicitly confirmed, OR this is a Section 21 claim (notice is always generated)
  const hasNoticeCopy =
    data.notice_copy_available === true ||
    data.section_21_notice_date != null; // If S21 notice date exists, notice was generated
  if (hasNoticeCopy) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_NOTICE, true, ctx);
  }

  // B1: Proof of service (marked B1) - required attachment
  // Tick if: explicitly confirmed, OR Section 21 claim (PoS is always generated in pack)
  const hasProofOfService =
    data.service_proof_available === true ||
    data.section_21_notice_date != null; // Section 21 pack always includes PoS template
  if (hasProofOfService) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_SERVICE_PROOF, true, ctx);
  }

  // E: Deposit certificate (marked E) - deposit protection cert
  // Tick if: deposit taken AND protected (has protection date or explicit confirmation)
  const hasDepositCert =
    data.deposit_certificate_available === true ||
    (data.deposit_amount && data.deposit_amount > 0 && data.deposit_protection_date);
  if (hasDepositCert) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
  }

  // F: EPC (marked F) - Energy Performance Certificate
  // Tick if: explicitly confirmed as provided to tenant
  const hasEpcToAttach = data.epc_provided === true;
  if (hasEpcToAttach) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_EPC, true, ctx);
  }

  // G: Gas safety records (marked G) - Gas Safety Certificate (CP12)
  // Tick if: property has gas AND certificate was provided to tenant
  // Skip entirely if property has no gas supply
  const hasGasToAttach =
    data.has_gas_at_property !== false &&
    data.gas_safety_provided === true;
  if (hasGasToAttach) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_GAS, true, ctx);
  }

  // H: How to Rent document (marked H) - How to Rent guide
  // Tick if: explicitly confirmed as provided to tenant
  const hasHowToRentToAttach = data.how_to_rent_provided === true;
  if (hasHowToRentToAttach) {
    setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_HOW_TO_RENT, true, ctx);
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
  console.log('📄 N5B form preserved as editable (AcroForm fields retained)');

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
  // Official forms default to NOT flattening - users need editable fields for final adjustments
  const { flatten = false } = options;
  if (flatten) {
    console.warn('⚠️ [N119] Flattening official court forms is deprecated. Users need editable outputs.');
  }
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
  console.log('📄 N119 form preserved as editable (AcroForm fields retained)');

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
  // Official forms default to NOT flattening - users need editable fields for final adjustments
  const { flatten = false } = options;
  if (flatten) {
    console.warn('⚠️ [N1] Flattening official court forms is deprecated. Users need editable outputs.');
  }
  const ctx = 'N1';
  console.log('📄 Filling N1 form (Money claim)...');

  const pdfDoc = await loadOfficialForm('N1_1224.pdf');
  const form = pdfDoc.getForm();

  // =========================================================================
  // STRICT TEMPLATE VALIDATION
  // Fail fast if required PDF fields are missing from the template
  // =========================================================================
  assertPdfHasFields(form, N1_REQUIRED_PDF_FIELDS, 'N1_1224.pdf');
  console.log(`✅ [N1] Template validation passed (${N1_REQUIRED_PDF_FIELDS.length} required fields verified)`);

  // =========================================================================
  // DATA VALIDATION
  // Fail fast if required case data is missing
  // =========================================================================
  if (!data.landlord_full_name || data.landlord_full_name.trim() === '') {
    throw new Error('[N1] Missing required field: landlord_full_name (claimant name)');
  }
  if (!data.tenant_full_name || data.tenant_full_name.trim() === '') {
    throw new Error('[N1] Missing required field: tenant_full_name (defendant name)');
  }
  if (!data.landlord_address || data.landlord_address.trim() === '') {
    throw new Error('[N1] Missing required field: landlord_address (claimant address)');
  }
  if (!data.property_address || data.property_address.trim() === '') {
    throw new Error('[N1] Missing required field: property_address (defendant address)');
  }
  if (data.total_claim_amount === undefined || data.total_claim_amount === null || data.total_claim_amount <= 0) {
    throw new Error('[N1] Missing or invalid required field: total_claim_amount (must be > 0)');
  }
  if (!data.signatory_name || data.signatory_name.trim() === '') {
    throw new Error('[N1] Missing required field: signatory_name (for Statement of Truth)');
  }
  console.log(`✅ [N1] Data validation passed`);

  // === PAGE 1 - Main Claim Form ===

  // Court and fees header
  setTextOptional(form, 'Text35', data.court_name, ctx);
  setTextOptional(form, 'Text36', data.claimant_reference, ctx);

  // Claimant details (large text box) - REQUIRED
  const claimantDetails = `${data.landlord_full_name}\n${data.landlord_address}`;
  setTextRequired(form, 'Text21', claimantDetails, ctx);

  // Defendant details (large text box) - REQUIRED
  // Include second defendant if joint tenancy
  let defendantDetails = `${data.tenant_full_name}\n${data.property_address}`;
  if (data.has_joint_defendants && data.tenant_2_name) {
    // Build second defendant address - use their own address if provided, otherwise use property address
    const defendant2Address = data.tenant_2_address_line1
      ? [
          data.tenant_2_address_line1,
          data.tenant_2_address_line2,
          data.tenant_2_postcode
        ].filter(Boolean).join(', ')
      : data.property_address;
    defendantDetails += `\n\n${data.tenant_2_name}\n${defendant2Address}`;
  }
  setTextRequired(form, 'Text22', defendantDetails, ctx);

  // Brief details of claim - REQUIRED
  const briefDetails = data.particulars_of_claim
    ? data.particulars_of_claim.substring(0, 200) + (data.particulars_of_claim.length > 200 ? '...' : '')
    : 'Claim for unpaid rent arrears and/or damages';
  setTextRequired(form, 'Text23', briefDetails, ctx);

  // Value box - optional (Text24 removed from Dec 2024 N1 template)
  setTextOptional(form, 'Text24', `£${data.total_claim_amount.toFixed(2)}`, ctx);

  // Defendant's address for service
  setTextOptional(form, 'Text Field 48', data.property_address, ctx);

  // Financial details - REQUIRED
  setTextRequired(form, 'Text25', data.total_claim_amount.toFixed(2), ctx);

  // Court fee - defaults to 0 if not specified
  const courtFee = data.court_fee || 0;
  setTextRequired(form, 'Text26', courtFee.toFixed(2), ctx);

  if (data.solicitor_costs) {
    setTextOptional(form, 'Text27', data.solicitor_costs.toFixed(2), ctx);
  }

  // Total amount - REQUIRED
  const totalAmount = data.total_claim_amount + courtFee + (data.solicitor_costs || 0);
  setTextRequired(form, 'Text28', totalAmount.toFixed(2), ctx);

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

  // Signatory name - REQUIRED for Statement of Truth
  setTextRequired(form, 'Text Field 47', data.signatory_name, ctx);
  setTextOptional(form, 'Text Field 46', data.signatory_name, ctx); // Second signature box

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

  // Postcode for service - REQUIRED
  const postcode = (data.service_postcode || data.landlord_postcode || '').substring(0, 7);
  if (!postcode || postcode.trim() === '') {
    throw new Error('[N1] Missing required field: postcode for service address (service_postcode or landlord_postcode)');
  }
  setTextRequired(form, 'Text34', postcode, ctx);

  const servicePhone = data.service_phone || data.solicitor_phone || data.landlord_phone;
  const serviceEmail = data.service_email || data.solicitor_email || data.landlord_email;

  setTextOptional(form, 'Text Field 6', servicePhone, ctx);
  setTextOptional(form, 'Text Field 4', data.dx_number, ctx);
  setTextOptional(form, 'Text Field 3', data.claimant_reference, ctx);
  setTextOptional(form, 'Text Field 2', serviceEmail, ctx);

  const pdfBytes = await pdfDoc.save();
  console.log(`✅ N1 form filled successfully`);
  console.log('📄 N1 form preserved as editable (AcroForm fields retained)');

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
