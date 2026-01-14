/**
 * Section 21 Notice Generator
 *
 * ENGLAND-ONLY: Generates Housing Act 1988 Section 21 notices (no-fault eviction)
 *
 * IMPORTANT: Section 21 applies ONLY in England. Wales uses Section 173.
 * This generator will throw an error if called for non-England jurisdictions.
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
  // Break clause fields (for fixed term tenancies)
  has_break_clause?: boolean;
  break_clause_date?: string;
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
    has_break_clause: data.has_break_clause,
    break_clause_date: data.break_clause_date,
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
    templatePath: 'uk/england/templates/notice_only/form_6a_section21/notice.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}

/**
 * Validate Section 21 eligibility based on compliance requirements
 * This should be called by the decision engine before allowing S21 route
 */
/**
 * Map wizard facts to Section21NoticeData
 *
 * This provides a single source of truth for mapping wizard/case facts
 * to the format expected by generateSection21Notice().
 */
export function mapWizardToSection21Data(
  wizardFacts: Record<string, any>,
  options?: { serviceDate?: string }
): Section21NoticeData {
  // Build addresses - prefer pre-concatenated, fallback to building from parts
  const propertyAddress =
    wizardFacts.property_address ||
    [
      wizardFacts.property_address_line1,
      wizardFacts.property_address_line2,
      wizardFacts.property_address_town,
      wizardFacts.property_address_county,
      wizardFacts.property_address_postcode,
    ]
      .filter(Boolean)
      .join('\n') ||
    '';

  const landlordAddress =
    wizardFacts.landlord_address ||
    [
      wizardFacts.landlord_address_line1,
      wizardFacts.landlord_address_line2,
      wizardFacts.landlord_address_town,
      wizardFacts.landlord_address_county,
      wizardFacts.landlord_address_postcode,
    ]
      .filter(Boolean)
      .join('\n') ||
    '';

  // Normalize deposit scheme to expected enum
  const normalizeDepositScheme = (
    scheme: string | undefined
  ): 'DPS' | 'MyDeposits' | 'TDS' | undefined => {
    if (!scheme) return undefined;
    const upper = scheme.toUpperCase();
    if (upper === 'DPS' || upper.includes('DEPOSIT PROTECTION')) return 'DPS';
    if (upper.includes('MYDEPOSIT')) return 'MyDeposits';
    if (upper === 'TDS' || upper.includes('TENANCY DEPOSIT')) return 'TDS';
    return undefined;
  };

  return {
    // Landlord
    landlord_full_name: wizardFacts.landlord_full_name || '',
    landlord_2_name: wizardFacts.landlord_2_name || wizardFacts.joint_landlord_name,
    landlord_address: landlordAddress,
    landlord_email: wizardFacts.landlord_email,
    landlord_phone: wizardFacts.landlord_phone,

    // Tenant
    tenant_full_name: wizardFacts.tenant_full_name || '',
    tenant_2_name: wizardFacts.tenant_2_name || wizardFacts.joint_tenant_name,
    property_address: propertyAddress,

    // Tenancy
    tenancy_start_date: wizardFacts.tenancy_start_date || '',
    fixed_term:
      wizardFacts.fixed_term === true ||
      wizardFacts.is_fixed_term === true ||
      wizardFacts.tenancy_type === 'fixed_term' ||
      wizardFacts.tenancy_type === 'ast_fixed',
    fixed_term_end_date: wizardFacts.fixed_term_end_date,
    // Break clause fields (for fixed term tenancies)
    has_break_clause:
      wizardFacts.has_break_clause === true ||
      wizardFacts.has_break_clause === 'yes',
    break_clause_date: wizardFacts.break_clause_date,
    rent_amount: wizardFacts.rent_amount || 0,
    rent_frequency: wizardFacts.rent_frequency || 'monthly',
    periodic_tenancy_start: wizardFacts.periodic_tenancy_start,

    // Notice details - service_date and expiry_date will be calculated by generator
    service_date:
      options?.serviceDate ||
      wizardFacts.service_date ||
      wizardFacts.notice_date ||
      wizardFacts.notice_served_date,
    expiry_date: '', // Will be auto-calculated by generateSection21Notice

    // Compliance
    // IMPORTANT: Section21ComplianceSection stores these as *_served but
    // templates and interfaces use *_given/*_provided. Check all variants.
    deposit_protected:
      wizardFacts.deposit_protected === true ||
      wizardFacts.deposit_protected === 'yes',
    deposit_amount: wizardFacts.deposit_amount,
    deposit_scheme: normalizeDepositScheme(
      wizardFacts.deposit_scheme || wizardFacts.deposit_scheme_name
    ),
    deposit_reference: wizardFacts.deposit_reference,
    prescribed_info_given:
      wizardFacts.prescribed_info_given === true ||
      wizardFacts.prescribed_info_given === 'yes' ||
      wizardFacts.prescribed_info_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.prescribed_info_served === 'yes',
    gas_certificate_provided:
      wizardFacts.gas_certificate_provided === true ||
      wizardFacts.gas_certificate_provided === 'yes' ||
      wizardFacts.gas_safety_certificate === true ||
      wizardFacts.gas_safety_cert_provided === true ||
      wizardFacts.gas_safety_cert_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.gas_safety_cert_served === 'yes',
    how_to_rent_provided:
      wizardFacts.how_to_rent_provided === true ||
      wizardFacts.how_to_rent_provided === 'yes' ||
      wizardFacts.how_to_rent_given === true ||
      wizardFacts.how_to_rent_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.how_to_rent_served === 'yes',
    epc_provided:
      wizardFacts.epc_provided === true ||
      wizardFacts.epc_provided === 'yes' ||
      wizardFacts.epc_served === true ||  // Section21ComplianceSection uses this
      wizardFacts.epc_served === 'yes',
    epc_rating: wizardFacts.epc_rating,

    // Help information
    council_phone: wizardFacts.council_phone,
  };
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
