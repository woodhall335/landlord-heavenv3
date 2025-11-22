/**
 * AST (Assured Shorthold Tenancy) Generator
 *
 * Generates standard and premium tenancy agreements for England & Wales.
 */

import { generateDocument, GeneratedDocument } from './generator';

// ============================================================================
// TYPES
// ============================================================================

export interface TenantInfo {
  full_name: string;
  dob: string;
  email: string;
  phone: string;
}

export interface ASTData {
  // Agreement
  agreement_date: string;

  // Landlord
  landlord_full_name: string;
  landlord_address: string;
  landlord_email: string;
  landlord_phone: string;

  // Agent (optional)
  agent_name?: string;
  agent_address?: string;
  agent_email?: string;
  agent_phone?: string;
  agent_signs?: boolean;

  // Tenants
  tenants: TenantInfo[];

  // Property
  property_address: string;
  property_description?: string;
  included_areas?: string;
  excluded_areas?: string;
  parking?: boolean;
  parking_details?: string;
  furnished_status?: 'furnished' | 'unfurnished' | 'part-furnished';

  // Term
  tenancy_start_date: string;
  is_fixed_term: boolean;
  tenancy_end_date?: string; // Required if fixed term
  term_length?: string; // e.g., "12 months"
  rent_period?: 'week' | 'month' | 'quarter' | 'year';

  // Rent
  rent_amount: number;
  rent_due_day: string; // e.g., "1st", "15th"
  payment_method: string; // e.g., "Standing Order", "Bank Transfer"
  payment_details: string; // Bank details
  first_payment: number;
  first_payment_date: string;
  rent_includes?: string; // What's included in rent
  rent_excludes?: string; // What tenant pays separately

  // Deposit
  deposit_amount: number;
  deposit_scheme_name: 'DPS' | 'MyDeposits' | 'TDS';

  // Inventory
  inventory_attached?: boolean;

  // Property features
  has_garden?: boolean;
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;

  // Clauses
  break_clause?: boolean;
  break_clause_terms?: string;
  tenant_notice_period?: string; // e.g., "1 month"
  additional_terms?: string;

  // Jurisdiction
  jurisdiction_england?: boolean;
  jurisdiction_wales?: boolean;

  // Additional schedules
  additional_schedules?: string;

  // QA metadata
  qa_score?: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate AST data before generation
 */
export function validateASTData(data: ASTData): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.landlord_full_name) errors.push('landlord_full_name is required');
  if (!data.landlord_address) errors.push('landlord_address is required');
  if (!data.landlord_email) errors.push('landlord_email is required');
  if (!data.landlord_phone) errors.push('landlord_phone is required');

  if (!data.tenants || data.tenants.length === 0) {
    errors.push('At least one tenant is required');
  } else {
    data.tenants.forEach((tenant, i) => {
      if (!tenant.full_name) errors.push(`tenant[${i}].full_name is required`);
      if (!tenant.dob) errors.push(`tenant[${i}].dob is required`);
      if (!tenant.email) errors.push(`tenant[${i}].email is required`);
      if (!tenant.phone) errors.push(`tenant[${i}].phone is required`);
    });
  }

  if (!data.property_address) errors.push('property_address is required');
  if (!data.tenancy_start_date) errors.push('tenancy_start_date is required');

  if (data.is_fixed_term) {
    if (!data.tenancy_end_date) errors.push('tenancy_end_date required for fixed term');
    if (!data.term_length) errors.push('term_length required for fixed term');
  }

  if (!data.rent_amount || data.rent_amount <= 0) {
    errors.push('rent_amount must be greater than 0');
  }

  if (!data.deposit_amount || data.deposit_amount < 0) {
    errors.push('deposit_amount is required');
  }

  // Deposit should typically be 5 weeks' rent max (Tenant Fees Act 2019)
  if (data.deposit_amount > 0 && data.rent_amount > 0) {
    const monthlyRent = data.rent_amount;
    const weeklyRent = monthlyRent / 4.33; // Average weeks per month
    const maxDeposit = weeklyRent * 5;

    if (data.deposit_amount > maxDeposit) {
      errors.push(
        `Deposit (£${data.deposit_amount}) exceeds 5 weeks rent (£${maxDeposit.toFixed(2)}). This may violate the Tenant Fees Act 2019.`
      );
    }
  }

  return errors;
}

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate a standard AST
 */
export async function generateStandardAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Set defaults
  if (!data.jurisdiction_england && !data.jurisdiction_wales) {
    data.jurisdiction_england = true;
  }

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = '1 month';
  }

  return generateDocument({
    templatePath: 'uk/england-wales/templates/standard_ast.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}

/**
 * Generate a premium AST (with additional clauses)
 */
export async function generatePremiumAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Set defaults
  if (!data.jurisdiction_england && !data.jurisdiction_wales) {
    data.jurisdiction_england = true;
  }

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = '1 month';
  }

  // Premium AST uses the same template but may have additional features
  return generateDocument({
    templatePath: 'uk/england-wales/templates/premium_ast.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate recommended deposit amount (5 weeks rent max)
 */
export function calculateRecommendedDeposit(monthlyRent: number): number {
  const weeklyRent = monthlyRent / 4.33;
  const fiveWeeksRent = weeklyRent * 5;
  return Math.round(fiveWeeksRent * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate first payment (pro-rata if starting mid-month)
 */
export function calculateFirstPayment(
  monthlyRent: number,
  startDate: string,
  rentDueDay: number
): number {
  const start = new Date(startDate);
  const startDay = start.getDate();

  // If starting on rent due day, full month's rent
  if (startDay === rentDueDay) {
    return monthlyRent;
  }

  // Calculate pro-rata
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const daysToCharge = rentDueDay > startDay
    ? rentDueDay - startDay
    : daysInMonth - startDay + rentDueDay;

  const dailyRent = monthlyRent / daysInMonth;
  const proRata = dailyRent * daysToCharge;

  // Add next month's rent if pro-rata period goes into next month
  if (rentDueDay <= startDay) {
    return Math.round((proRata + monthlyRent) * 100) / 100;
  }

  return Math.round(proRata * 100) / 100;
}
