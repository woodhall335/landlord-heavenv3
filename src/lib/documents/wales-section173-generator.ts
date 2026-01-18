/**
 * Wales Section 173 Generator
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
 * CLAUDE CODE FIX #1 + #2: Uses server-side config with UTC parsing
 *
 * Compliance checks:
 * - Contract type must be 'standard'
 * - Rent Smart Wales registration required
 * - Deposit protection required (if deposit taken)
 * - Prohibited period validation (auto-calculated)
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

  // Calculate expiry date if not provided
  const serviceDate = data.service_date || toISODateString(new Date());

  if (!data.expiry_date) {
    // CLAUDE CODE FIX #1 + #2: Load rule from server config with UTC parsing
    const rule = await getWalesSection173Rule(serviceDate);

    console.log(
      `[Wales S173 Generator] Using rule: ${rule.notice_period_months} months ` +
        `(effective ${rule.effective_from})`
    );

    // Calculate with prohibited period validation
    try {
      const calculatedDate = calculateWalesSection173ExpiryDate({
        service_date: serviceDate,
        contract_start_date: data.contract_start_date,
        ...rule, // Spread rule data
      });

      data.expiry_date = calculatedDate.earliest_valid_date;

      console.log(
        `[Wales S173 Generator] Calculated expiry: ${data.expiry_date} ` +
          `(${rule.notice_period_months} months from ${serviceDate})`
      );
    } catch (error: any) {
      // Re-throw prohibited period errors with clear message
      if (error.message?.includes('WALES_SECTION173_PROHIBITED_PERIOD')) {
        throw new Error(
          `LEGAL_COMPLIANCE_ERROR: ${error.message}. ` +
            `Section 173 cannot be served within the first 6 months of the contract.`
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // ENGLISH-ONLY OUTPUT (BILINGUAL SUPPORT REMOVED)
  // ============================================================================
  // Our official sources are English-only. System now defaults to English output.
  // Bilingual option has been removed from MQS and compliance checks.
  // ============================================================================
  // COURT-GRADE GUARDRAILS: DYNAMIC TEMPLATE SELECTION (RHW16 vs RHW17)
  // ============================================================================
  // RHW16 = 6-month minimum notice period (post-December 2022)
  // RHW17 = 2-month minimum notice period (original 2016-2022)
  //
  // CRITICAL: Use the canonical determineSection173Form() function from
  // section173FormSelector.ts which implements proper calendar month semantics
  // and legal period rules based on effective dates.
  // ============================================================================

  const actualServiceDate = data.service_date || data.notice_service_date || serviceDate;
  const actualExpiryDate = data.expiry_date || data.notice_expiry_date;

  // Use canonical form selector for deterministic template selection
  const formSelectorFacts = {
    contract_start_date: data.contract_start_date,
    service_date: actualServiceDate,
    expiry_date: actualExpiryDate,
    wales_contract_category: data.wales_contract_category,
  };

  const selectedForm: Section173Form = determineSection173Form(formSelectorFacts);

  // Validate timing and get any auto-corrections
  const validation = validateSection173Timing(formSelectorFacts);

  // Log any validation warnings (non-blocking)
  if (validation.warnings.length > 0) {
    console.warn('[Wales S173 Generator] Validation warnings:', validation.warnings);
  }

  // If there are timing errors, log them but continue (they should have been
  // caught earlier in the wizard flow)
  if (validation.errors.length > 0) {
    console.error('[Wales S173 Generator] Validation errors:', validation.errors);
    // Re-throw if prohibited period is violated - this is a hard block
    const prohibitedPeriodError = validation.errors.find((e) =>
      e.includes('WALES_SECTION173_PROHIBITED_PERIOD')
    );
    if (prohibitedPeriodError) {
      throw new Error(`LEGAL_COMPLIANCE_ERROR: ${prohibitedPeriodError}`);
    }
  }

  // Calculate and potentially auto-correct expiry date
  const expiryResult = calculateSection173ExpiryDateGuardrail({
    ...formSelectorFacts,
    expiry_date: actualExpiryDate,
  });

  // If expiry date was auto-corrected, log it
  if (expiryResult.wasCorrected) {
    console.warn(
      `[Wales S173 Generator] Expiry date auto-corrected: ${expiryResult.correctionMessage}`
    );
    // Update the data with the corrected expiry date
    data.expiry_date = expiryResult.expiryDate;
  }

  // Calculate notice period days for logging and template data
  let noticePeriodDays = 0;
  if (actualExpiryDate && actualServiceDate) {
    const serviceMs = new Date(actualServiceDate).getTime();
    const expiryMs = new Date(data.expiry_date || actualExpiryDate).getTime();
    noticePeriodDays = Math.ceil((expiryMs - serviceMs) / (1000 * 60 * 60 * 24));
  }

  // Select template based on canonical form determination
  const templatePath =
    selectedForm === 'RHW16'
      ? 'uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs'
      : 'uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs';

  console.log(
    `[Wales S173 Generator] Template selection: ` +
      `Form ${selectedForm} (${noticePeriodDays} days, ` +
      `${expiryResult.minimumNoticeMonths} month minimum)`
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
