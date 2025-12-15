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

export interface WalesSection173NoticeData {
  landlord_full_name: string;
  contract_holder_full_name: string;
  property_address: string;
  contract_start_date: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';
  service_date?: string;
  expiry_date?: string;
  // Compliance fields
  wales_contract_category?: 'standard' | 'supported_standard' | 'secure';
  rent_smart_wales_registered?: boolean;
  deposit_taken?: boolean;
  deposit_protected?: boolean;
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

  // Generate document
  return generateDocument({
    templatePath: 'uk/wales/templates/eviction/section173_landlords_notice.hbs',
    data: {
      ...data,
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
