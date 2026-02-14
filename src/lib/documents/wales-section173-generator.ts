/**
 * Wales Section 173 Generator
 *
 * HARD-LOCKED: Section 173 is locked to 6 months minimum notice period (RHW16 form).
 * We do not support the 2-month regime (RHW17) for standard occupation contracts.
 *
 * COURT-GRADE ENFORCEMENT:
 * - Expiry date MUST be >= service_date + 6 calendar months
 * - Any attempt to generate with expiry < service + 6 months will HARD BLOCK
 * - Template is ALWAYS RHW16 (6-month notice)
 *
 * CLAUDE CODE FIX #1: Loads config from server module
 * Build-safe - all fs operations server-side only
 */

import { generateDocument, GeneratedDocument } from './generator';
import {
  calculateWalesSection173ExpiryDate,
  toISODateString,
  type WalesSection173DateParams,
} from './notice-date-calculator';
import { getWalesSection173Rule } from '@/server/config/wales-notice-periods';
import {
  determineSection173Form,
  validateSection173Timing,
  calculateSection173ExpiryDate as calculateSection173ExpiryDateGuardrail,
  addCalendarMonths,
  getSection173MinimumNoticeMonths,
  getSection173MinimumNoticeLabel,
  SECTION_173_LOCKED_NOTICE_MONTHS,
  type Section173Form,
} from '@/lib/wales/section173FormSelector';

export interface WalesSection173NoticeData {
  landlord_full_name: string;
  landlord_address?: string;
  contract_holder_full_name: string;
  property_address: string;
  contract_start_date: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  service_date?: string;
  notice_service_date?: string;
  expiry_date?: string;
  notice_expiry_date?: string;
  // Compliance fields
  wales_contract_category?: 'standard' | 'supported_standard' | 'secure';
  rent_smart_wales_registered?: boolean;
  deposit_taken?: boolean;
  deposit_protected?: boolean;
  // Language choice
  language_choice?: 'bilingual' | 'english_only';
}

/**
 * Generate Wales Section 173 Landlord's Notice
 *
 * HARD-LOCKED: Section 173 is locked to 6 months minimum notice period.
 * We do not support the 2-month regime; Section 173 is locked to 6 months
 * for standard occupation contracts.
 *
 * COURT-GRADE ENFORCEMENT:
 * - Expiry MUST be computed as service_date + 6 calendar months (using addCalendarMonths)
 * - If user-supplied expiry is earlier than computed minimum: HARD BLOCK with error
 * - If user-supplied expiry is later than computed minimum: Allow (valid)
 * - Template is ALWAYS RHW16 (never RHW17)
 *
 * Compliance checks:
 * - Contract type must be 'standard'
 * - Rent Smart Wales registration required
 * - Deposit protection required (if deposit taken)
 * - Prohibited period validation (cannot serve within first 6 months)
 * - Minimum notice period: 6 calendar months
 */
export async function generateWalesSection173Notice(
  data: WalesSection173NoticeData,
  isPreview = false
): Promise<GeneratedDocument> {
  // Basic validations
  if (!data.landlord_full_name) {
    throw new Error('VALIDATION_ERROR: landlord_full_name required');
  }
  if (!data.contract_holder_full_name) {
    throw new Error('VALIDATION_ERROR: contract_holder_full_name required');
  }
  if (!data.property_address) {
    throw new Error('VALIDATION_ERROR: property_address required');
  }
  if (!data.contract_start_date) {
    throw new Error('VALIDATION_ERROR: contract_start_date required');
  }

  // Contract category validation
  const contractCategory = data.wales_contract_category;
  if (!contractCategory) {
    throw new Error('VALIDATION_ERROR: wales_contract_category required');
  }

  if (contractCategory !== 'standard') {
    throw new Error(
      `LEGAL_COMPLIANCE_ERROR: WALES_SECTION173_INVALID_CONTRACT_TYPE - ` +
        `Section 173 not valid for "${contractCategory}" contracts. ` +
        `Only "standard" occupation contracts support Section 173.`
    );
  }

  // Rent Smart Wales validation
  if (data.rent_smart_wales_registered === false) {
    throw new Error(
      `LEGAL_COMPLIANCE_ERROR: WALES_RENT_SMART_REQUIRED - ` +
        `Must be registered with Rent Smart Wales to serve Section 173 notice.`
    );
  }

  // Deposit protection validation (if deposit taken)
  if (data.deposit_taken === true && data.deposit_protected === false) {
    throw new Error(
      `LEGAL_COMPLIANCE_ERROR: WALES_DEPOSIT_NOT_PROTECTED - ` +
        `Deposit must be protected before serving Section 173 notice.`
    );
  }

  // ============================================================================
  // HARD-LOCKED: 6 MONTHS MINIMUM NOTICE PERIOD (COURT-GRADE ENFORCEMENT)
  // ============================================================================
  // We do not support the 2-month regime; Section 173 is locked to 6 months
  // for standard occupation contracts.
  // ============================================================================

  const serviceDate = data.service_date || toISODateString(new Date());

  // Compute the LOCKED minimum expiry date: service_date + 6 calendar months
  // CRITICAL: Use addCalendarMonths (not days math) for legal correctness
  const minimumExpiryDate = addCalendarMonths(serviceDate, SECTION_173_LOCKED_NOTICE_MONTHS);

  console.log(
    `[Wales S173 Generator] HARD-LOCKED: ${SECTION_173_LOCKED_NOTICE_MONTHS} months minimum notice. ` +
      `Service: ${serviceDate}, Minimum expiry: ${minimumExpiryDate}`
  );

  // Check if user provided an expiry date
  const userProvidedExpiry = data.expiry_date || data.notice_expiry_date;

  if (userProvidedExpiry) {
    // HARD BLOCK: If user-supplied expiry is earlier than minimum, reject generation
    if (userProvidedExpiry < minimumExpiryDate) {
      throw new Error(
        `LEGAL_COMPLIANCE_ERROR: WALES_SECTION173_INSUFFICIENT_NOTICE - ` +
          `The notice expiry date (${userProvidedExpiry}) is earlier than the minimum required. ` +
          `Section 173 requires at least ${getSection173MinimumNoticeLabel()} notice. ` +
          `The notice expiry date must not be earlier than six months after the date of service. ` +
          `Service date: ${serviceDate}. ` +
          `Earliest valid expiry date: ${minimumExpiryDate}. ` +
          `Please correct the expiry date to ${minimumExpiryDate} or later.`
      );
    }
    // User expiry is valid (>= minimum) - use it
    data.expiry_date = userProvidedExpiry;
    console.log(
      `[Wales S173 Generator] User expiry accepted: ${userProvidedExpiry} ` +
        `(>= minimum ${minimumExpiryDate})`
    );
  } else {
    // No user expiry provided - auto-calculate using locked 6 months
    data.expiry_date = minimumExpiryDate;
    console.log(
      `[Wales S173 Generator] Auto-calculated expiry: ${data.expiry_date} ` +
        `(${SECTION_173_LOCKED_NOTICE_MONTHS} months from ${serviceDate})`
    );
  }

  // ============================================================================
  // ENGLISH-ONLY OUTPUT (BILINGUAL SUPPORT REMOVED)
  // ============================================================================
  // Our official sources are English-only. System now defaults to English output.
  // Bilingual option has been removed from MQS and compliance checks.
  // ============================================================================
  // HARD-LOCKED TEMPLATE: ALWAYS RHW16 (6-month notice)
  // ============================================================================
  // We do not support the 2-month regime; Section 173 is locked to 6 months
  // for standard occupation contracts. RHW17 template is NOT used.
  // ============================================================================

  const actualServiceDate = data.service_date || data.notice_service_date || serviceDate;

  // Use canonical form selector (will always return RHW16 now)
  const formSelectorFacts = {
    contract_start_date: data.contract_start_date,
    service_date: actualServiceDate,
    expiry_date: data.expiry_date,
    wales_contract_category: data.wales_contract_category,
  };

  // This will always return 'RHW16' due to hard-lock
  const selectedForm: Section173Form = determineSection173Form(formSelectorFacts);

  // Validate timing (will use 6 months due to hard-lock)
  const validation = validateSection173Timing(formSelectorFacts);

  // Log any validation warnings (non-blocking)
  if (validation.warnings.length > 0) {
    console.warn('[Wales S173 Generator] Validation warnings:', validation.warnings);
  }

  // HARD BLOCK on any validation errors
  if (validation.errors.length > 0) {
    console.error('[Wales S173 Generator] Validation errors:', validation.errors);
    // All errors are now hard blocks for Section 173
    const firstError = validation.errors[0];
    throw new Error(`LEGAL_COMPLIANCE_ERROR: ${firstError}`);
  }

  // Calculate notice period days for logging
  let noticePeriodDays = 0;
  if (data.expiry_date && actualServiceDate) {
    const serviceMs = new Date(actualServiceDate).getTime();
    const expiryMs = new Date(data.expiry_date).getTime();
    noticePeriodDays = Math.ceil((expiryMs - serviceMs) / (1000 * 60 * 60 * 24));
  }

  // HARD-LOCKED: Always use RHW16 template (6-month notice)
  // We do not support the 2-month regime; Section 173 is locked to 6 months
  // for standard occupation contracts.
  const templatePath = 'uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs';

  console.log(
    `[Wales S173 Generator] HARD-LOCKED template: RHW16 ` +
      `(${noticePeriodDays} days, ${SECTION_173_LOCKED_NOTICE_MONTHS} months minimum)`
  );

  // Generate document
  return generateDocument({
    templatePath,
    data: {
      ...data,
      // Ensure both field names are available for templates
      tenant_full_name: data.contract_holder_full_name,
      // Wales-specific terminology
      landlord_title: 'Landlord',
      tenant_title: 'Contract Holder',
      property_title: 'Dwelling',
      tenancy_title: 'Occupation Contract',
    },
    isPreview,
    outputFormat: 'both',
  });
}
