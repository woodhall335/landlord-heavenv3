/**
 * Section 21 Notice Generator
 *
 * Generates Housing Act 1988 Section 21 notices (no-fault eviction)
 * for England & Wales.
 *
 * Form 6A is used for most assured shorthold tenancies.
 */

import { generateDocument, GeneratedDocument } from './generator';
import {
  calculateSection21ExpiryDate,
  validateSection21ExpiryDate,
  type Section21DateParams,
} from './notice-date-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface Section21NoticeData {
  // Landlord
  landlord_full_name: string;
  landlord_2_name?: string; // Joint landlord
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;

  // Tenant
  tenant_full_name: string;
  tenant_2_name?: string; // Joint tenant
  property_address: string;

  // Tenancy
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_end_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  periodic_tenancy_start?: string; // When it became periodic (if converted from fixed)

  // Notice details
  service_date?: string; // Date notice is served (defaults to today)
  expiry_date: string; // Date tenant must leave by
  expiry_date_explanation?: string; // How we calculated this

  // Compliance (checked by decision engine before allowing S21)
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_scheme?: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_reference?: string;
  prescribed_info_given?: boolean;
  gas_certificate_provided?: boolean;
  how_to_rent_provided?: boolean;
  epc_provided?: boolean;
  epc_rating?: string;

  // Help information
  council_phone?: string;
}

// ============================================================================
// GENERATOR
// ============================================================================

/**
 * Generate a Section 21 notice (Form 6A)
 */
export async function generateSection21Notice(
  data: Section21NoticeData,
  isPreview = false
): Promise<GeneratedDocument> {
  // Validate required fields
  if (!data.landlord_full_name) {
    throw new Error('landlord_full_name is required');
  }
  if (!data.tenant_full_name) {
    throw new Error('tenant_full_name is required');
  }
  if (!data.property_address) {
    throw new Error('property_address is required');
  }
  if (!data.tenancy_start_date) {
    throw new Error('tenancy_start_date is required');
  }
  if (!data.rent_frequency) {
    throw new Error('rent_frequency is required');
  }

  // Auto-calculate expiry date if not provided or validate if provided
  const serviceDate = data.service_date || new Date().toISOString().split('T')[0];

  const dateParams: Section21DateParams = {
    service_date: serviceDate,
    tenancy_start_date: data.tenancy_start_date,
    fixed_term: data.fixed_term,
    fixed_term_end_date: data.fixed_term_end_date,
    rent_period: data.rent_frequency,
    periodic_tenancy_start: data.periodic_tenancy_start,
  };

  // If expiry_date is provided, validate it
  if (data.expiry_date) {
    const validation = validateSection21ExpiryDate(data.expiry_date, dateParams);
    if (!validation.valid) {
      // Return 422 error with precise explanation
      const error = new Error(validation.errors.join(' '));
      (error as any).statusCode = 422;
      (error as any).validationErrors = validation.errors;
      (error as any).suggestedDate = validation.suggested_date;
      throw error;
    }
  } else {
    // Auto-calculate the expiry date
    const calculatedDate = calculateSection21ExpiryDate(dateParams);
    data.expiry_date = calculatedDate.earliest_valid_date;
    data.expiry_date_explanation = calculatedDate.explanation;
  }

  // Compliance warnings (should be checked by decision engine before allowing S21)
  const complianceWarnings: string[] = [];

  if (!data.deposit_protected) {
    complianceWarnings.push('Deposit must be protected in an approved scheme to serve valid Section 21');
  }
  if (!data.prescribed_info_given) {
    complianceWarnings.push('Prescribed information must be provided within 30 days of receiving deposit');
  }
  if (!data.gas_certificate_provided) {
    complianceWarnings.push('Gas safety certificate must be provided before tenancy starts');
  }
  if (!data.how_to_rent_provided) {
    complianceWarnings.push('How to Rent guide must be provided at start of tenancy (for tenancies starting after Oct 2015)');
  }
  if (!data.epc_provided) {
    complianceWarnings.push('EPC must be provided before tenancy starts');
  }

  // Log warnings but don't fail (decision engine should have caught these earlier)
  if (complianceWarnings.length > 0) {
    console.warn('Section 21 compliance warnings:', complianceWarnings);
  }

  return generateDocument({
    templatePath: 'uk/england-wales/templates/eviction/section21_form6a.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}

/**
 * Validate Section 21 eligibility based on compliance requirements
 * This should be called by the decision engine before allowing S21 route
 */
export function validateSection21Eligibility(data: Section21NoticeData): {
  eligible: boolean;
  blocking_issues: string[];
  warnings: string[];
} {
  const blocking_issues: string[] = [];
  const warnings: string[] = [];

  // Deposit protection is MANDATORY for valid Section 21
  if (!data.deposit_protected) {
    blocking_issues.push(
      'Section 21 cannot be used because the deposit is not protected in an approved scheme. You must use Section 8 instead.'
    );
  }

  // Prescribed information must be given
  if (!data.prescribed_info_given) {
    blocking_issues.push(
      'Section 21 cannot be used because prescribed information about the deposit was not provided within 30 days. You must use Section 8 instead.'
    );
  }

  // Gas safety certificate (if gas supply present)
  if (data.gas_certificate_provided === false) {
    blocking_issues.push(
      'Section 21 cannot be used because gas safety certificate was not provided. You must use Section 8 instead.'
    );
  }

  // How to Rent guide (for tenancies after Oct 1, 2015)
  const tenancyStartDate = new Date(data.tenancy_start_date);
  const howToRentRequiredDate = new Date('2015-10-01');
  if (tenancyStartDate >= howToRentRequiredDate && !data.how_to_rent_provided) {
    blocking_issues.push(
      'Section 21 cannot be used because the How to Rent guide was not provided at the start of the tenancy. You must use Section 8 instead.'
    );
  }

  // EPC rating below minimum (E) is a warning, not blocking
  if (data.epc_rating && ['F', 'G'].includes(data.epc_rating.toUpperCase())) {
    warnings.push(
      'Your EPC rating is below the minimum energy efficiency standard (E). Section 21 may be invalid if the tenancy started after April 1, 2020.'
    );
  }

  return {
    eligible: blocking_issues.length === 0,
    blocking_issues,
    warnings,
  };
}
