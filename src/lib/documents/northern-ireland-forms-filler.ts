/**
 * Northern Ireland Eviction Documents Generator
 *
 * IMPORTANT: Northern Ireland does NOT have prescribed official PDF forms like
 * Scotland or England & Wales. Instead, we generate documents from templates
 * that meet Northern Ireland legal requirements.
 *
 * Legal Framework:
 * - Private Tenancies (Northern Ireland) Order 2006
 * - Common law Notice to Quit
 * - County Court procedures (requires solicitor involvement)
 *
 * Templates are stored in: /config/jurisdictions/uk/northern-ireland/templates/
 *
 * Documents generated:
 * - Notice to Quit (common law notice)
 * - Notice of Intention to Seek Possession (PT(NI) Order 2006)
 * - Civil Bill Possession (guidance document for solicitor)
 */

import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { generatePDFFromMarkdown } from './pdf-generator';

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
 * Load a Handlebars template
 */
async function loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
  const templatePath = path.join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    'northern-ireland',
    'templates',
    templateName
  );

  try {
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  } catch (error) {
    throw new Error(
      `Failed to load template "${templateName}". ` +
      `Make sure it exists in /config/jurisdictions/uk/northern-ireland/templates/. ` +
      `Error: ${error}`
    );
  }
}

/**
 * Format date for display (DD/MM/YYYY)
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calculate notice period in weeks and days
 */
function calculateNoticePeriod(startDate: string, endDate: string): { weeks: number; days: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);

  return { weeks, days: diffDays };
}

/**
 * Classify grounds into mandatory and discretionary
 */
function classifyGrounds(grounds: NorthernIrelandGround[]): {
  mandatory_grounds: NorthernIrelandGround[];
  discretionary_grounds: NorthernIrelandGround[];
  has_mandatory_grounds: boolean;
  has_discretionary_grounds: boolean;
} {
  const mandatory = grounds.filter(g => g.type === 'mandatory');
  const discretionary = grounds.filter(g => g.type === 'discretionary');

  return {
    mandatory_grounds: mandatory,
    discretionary_grounds: discretionary,
    has_mandatory_grounds: mandatory.length > 0,
    has_discretionary_grounds: discretionary.length > 0
  };
}

/**
 * Generate Notice to Quit
 *
 * Common law notice to terminate tenancy in Northern Ireland
 *
 * Template: /config/jurisdictions/uk/northern-ireland/templates/notice_to_quit.hbs
 */
export async function generateNoticeToQuit(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Generating Notice to Quit (Northern Ireland)...');

  const template = await loadTemplate('notice_to_quit.hbs');

  // Calculate notice period
  const noticePeriod = calculateNoticePeriod(
    data.notice_to_quit_date,
    data.notice_to_quit_expiry_date
  );

  // Prepare template data
  const templateData = {
    ...data,
    generation_date: formatDate(new Date().toISOString()),
    notice_date: formatDate(data.notice_to_quit_date),
    quit_date: formatDate(data.notice_to_quit_expiry_date),
    notice_period_weeks: noticePeriod.weeks,
    notice_period_days: noticePeriod.days,
    grounds: data.grounds.map((g, index) => ({
      ...g,
      number: index + 1,
      legal_basis: g.particulars
    }))
  };

  // Render template to markdown
  const markdown = template(templateData);

  // Convert to PDF
  const pdfBytes = await generatePDFFromMarkdown(markdown);

  console.log('✅ Notice to Quit generated successfully');
  return pdfBytes;
}

/**
 * Generate Notice of Intention to Seek Possession
 *
 * Statutory notice under Private Tenancies (NI) Order 2006
 *
 * Template: /config/jurisdictions/uk/northern-ireland/templates/notice_of_intention.hbs
 */
export async function generateNoticeOfIntention(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Generating Notice of Intention to Seek Possession (Northern Ireland)...');

  const template = await loadTemplate('notice_of_intention.hbs');

  // Determine notice period (14 or 28 days)
  const hasGroundRequiring14Days = data.grounds.some(g =>
    g.code === 'Ground 8' || g.code === 'Ground 14' || g.code === 'Ground 17'
  );

  const noticePeriodDays = hasGroundRequiring14Days ? 14 : 28;

  // Calculate earliest court date
  const noticeDate = new Date(data.notice_of_intention_date);
  const earliestCourtDate = new Date(noticeDate);
  earliestCourtDate.setDate(earliestCourtDate.getDate() + noticePeriodDays);

  // Classify grounds
  const groundsClassification = classifyGrounds(data.grounds);

  // Prepare grounds with evidence
  const groundsWithEvidence = data.grounds.map(g => ({
    ...g,
    category: g.type === 'mandatory' ? 'Mandatory' : 'Discretionary',
    legal_basis: `Private Tenancies (Northern Ireland) Order 2006, ${g.code}`,
    evidence_required: g.evidence ? g.evidence.split('\n') : []
  }));

  // Prepare template data
  const templateData = {
    ...data,
    generation_date: formatDate(new Date().toISOString()),
    notice_date: formatDate(data.notice_of_intention_date),
    notice_period_days: noticePeriodDays,
    earliest_court_date: formatDate(earliestCourtDate.toISOString()),
    grounds: groundsWithEvidence,
    ...groundsClassification
  };

  // Render template to markdown
  const markdown = template(templateData);

  // Convert to PDF
  const pdfBytes = await generatePDFFromMarkdown(markdown);

  console.log('✅ Notice of Intention generated successfully');
  return pdfBytes;
}

/**
 * Generate Civil Bill for Possession (Guidance Document)
 *
 * NOTE: Actual County Court claims ("ejectment civil bills") must be prepared
 * by solicitors in Northern Ireland. This generates a guidance document only.
 *
 * Template: /config/jurisdictions/uk/northern-ireland/templates/civil_bill_possession.hbs
 */
export async function generateCivilBillGuidance(data: NorthernIrelandCaseData): Promise<Uint8Array> {
  console.log('📄 Generating Civil Bill Possession Guidance (Northern Ireland)...');
  console.log('ℹ️  Note: Actual court claims must be prepared by a solicitor');

  const template = await loadTemplate('civil_bill_possession.hbs');

  // Classify grounds
  const groundsClassification = classifyGrounds(data.grounds);

  // Prepare particulars of claim
  const particularsOfClaim = data.grounds.map(g =>
    `${g.code} - ${g.title}\n\n${g.particulars}\n\n${g.evidence ? `Evidence: ${g.evidence}` : ''}`
  ).join('\n\n---\n\n');

  // Calculate total arrears if applicable
  const totalArrears = data.current_arrears || 0;
  const arrearsSummary = data.arrears_breakdown?.map(a =>
    `Period: ${a.period} - Due: £${a.amount_due.toFixed(2)}, Paid: £${a.amount_paid.toFixed(2)}, Balance: £${a.balance.toFixed(2)}`
  ).join('\n') || 'Not applicable';

  // Prepare template data
  const templateData = {
    ...data,
    generation_date: formatDate(new Date().toISOString()),
    notice_to_quit_date_formatted: formatDate(data.notice_to_quit_date),
    notice_of_intention_date_formatted: formatDate(data.notice_of_intention_date),
    claim_for_arrears: totalArrears > 0,
    total_arrears: totalArrears.toFixed(2),
    arrears_summary: arrearsSummary,
    particulars_of_claim: particularsOfClaim,
    deposit_protected: !!data.deposit_amount,
    deposit_amount_formatted: data.deposit_amount ? data.deposit_amount.toFixed(2) : '0.00',
    ...groundsClassification
  };

  // Render template to markdown
  const markdown = template(templateData);

  // Convert to PDF
  const pdfBytes = await generatePDFFromMarkdown(markdown);

  console.log('✅ Civil Bill Guidance generated successfully');
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
