/**
 * Northern Ireland Private Tenancy Agreement Generator
 *
 * Generates Private Tenancy Agreement documents for Northern Ireland
 * under the Private Tenancies (Northern Ireland) Order 2006.
 *
 * Key Northern Ireland Features:
 * - 2025 legal updates: Electrical safety mandatory from 1 April 2025
 * - Rent increase restrictions: 12-month gap, 3-month notice (from 1 April 2025)
 * - Notice periods based on tenancy length (28/56/84 days)
 * - Deposit protection schemes: TDS NI, MyDeposits NI
 * - County Court Northern Ireland jurisdiction
 */

import { generateDocument, GeneratedDocument } from '../generator';

// ============================================================================
// TYPES
// ============================================================================

export interface LandlordDetails {
  full_name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface AgentDetails {
  name: string;
  company?: string;
  address: string;
  email?: string;
  phone?: string;
  signs?: boolean;
}

export interface TenantDetails {
  full_name: string;
  dob?: string;
  email?: string;
  phone?: string;
}

export interface PropertyDetails {
  address: string;
  description?: string;
  included_areas?: string;
  excluded_areas?: string;
  parking?: boolean;
  parking_details?: string;
  furnished_status?: 'furnished' | 'part-furnished' | 'unfurnished';
  has_garden?: boolean;
}

export interface TenancyTerms {
  start_date: string;
  is_fixed_term: boolean;
  end_date?: string;
  term_length?: string;
  rent_period?: 'week' | 'month';
}

export interface RentDetails {
  amount: number;
  period: 'week' | 'month';
  due_day: string;
  payment_method: string;
  payment_details: string;
  first_payment: number;
  first_payment_date: string;
  includes?: string;
  excludes?: string;
}

export interface DepositDetails {
  amount: number;
  scheme?: 'TDS Northern Ireland' | 'MyDeposits Northern Ireland';
}

export interface InventoryDetails {
  attached: boolean;
  description?: string;
}

export interface AdditionalTerms {
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;
  break_clause?: boolean;
  break_clause_terms?: string;
  additional_terms?: string;
  additional_schedules?: string;
}

export interface PrivateTenancyData {
  // Agreement
  agreement_date: string;
  current_date?: string;
  current_year?: number;

  // Parties
  landlord: LandlordDetails;
  agent?: AgentDetails;
  agent_name?: string;
  agent_address?: string;
  agent_email?: string;
  agent_phone?: string;
  agent_signs?: boolean;
  tenants: TenantDetails[];
  number_of_tenants?: number;
  multiple_tenants?: boolean;

  // Property
  property_address: string;
  property_address_line1?: string;
  property_address_town?: string;
  property_address_postcode?: string;
  property_type?: string;
  number_of_bedrooms?: string;
  property_description?: string;
  included_areas?: string;
  excluded_areas?: string;
  parking?: boolean;
  parking_available?: boolean;
  parking_details?: string;
  furnished_status?: 'furnished' | 'part-furnished' | 'unfurnished';
  has_garden?: boolean;

  // Agreement details
  tenancy_start_date: string;
  is_fixed_term: boolean;
  tenancy_end_date?: string;
  term_length?: string;
  rent_period?: 'week' | 'month';

  // Rent
  rent_amount: number;
  rent_due_day: string;
  payment_method: string;
  payment_details: string;
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  first_payment?: number;
  first_payment_date?: string;
  rent_includes?: string;
  rent_excludes?: string;

  // Deposit
  deposit_amount: number;
  deposit_scheme?: string | 'TDS Northern Ireland' | 'MyDeposits Northern Ireland';

  // Bills & Utilities
  council_tax_responsibility?: string;
  utilities_responsibility?: string;
  internet_responsibility?: string;

  // Inventory
  inventory_attached?: boolean;
  inventory_provided?: boolean;
  inventory_description?: string;
  inventory_items?: string; // Comprehensive list of furnished items
  professional_cleaning_required?: boolean;
  decoration_condition?: string;

  // Property features & rules
  garden_maintenance?: string;
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;

  // Legal Compliance & Safety (NI 2025 updates)
  gas_safety_certificate?: boolean;
  epc_rating?: string;
  electrical_safety_certificate?: boolean; // Mandatory from 1 April 2025
  smoke_alarms_fitted?: boolean;
  carbon_monoxide_alarms?: boolean;

  // Maintenance & Repairs
  landlord_maintenance_responsibilities?: string;
  repairs_reporting_method?: string;
  emergency_contact?: string;

  // Tenancy Terms & Conditions
  break_clause?: boolean;
  break_clause_terms?: string;
  break_clause_months?: string;
  break_clause_notice_period?: string;
  subletting_allowed?: string;
  rent_increase_clause?: boolean;
  rent_increase_frequency?: string; // Must be 12+ months, 3-month notice from 1 April 2025
  tenant_notice_period?: string;
  additional_terms?: string;

  // Insurance & Liability
  landlord_insurance?: boolean;
  tenant_insurance_required?: string;

  // Access & Viewings
  landlord_access_notice?: string;
  inspection_frequency?: string;
  end_of_tenancy_viewings?: boolean;

  // Additional Terms
  white_goods_included?: string[];
  communal_areas?: boolean;
  communal_cleaning?: string;
  recycling_bins?: boolean;

  // Additional schedules
  additional_schedules?: string;

  // Document metadata
  document_id?: string;
  generation_timestamp?: string;

  // Helper fields (flattened for templates)
  landlord_full_name?: string;
  landlord_address?: string;
  landlord_email?: string;
  landlord_phone?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePrivateTenancyData(data: PrivateTenancyData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields - Landlord
  if (!data.landlord?.full_name) errors.push('Landlord name is required');
  if (!data.landlord?.address) errors.push('Landlord address is required');

  // Required fields - Tenants
  if (!data.tenants || data.tenants.length === 0) {
    errors.push('At least one tenant is required');
  } else {
    data.tenants.forEach((tenant, idx) => {
      if (!tenant.full_name) errors.push(`Tenant ${idx + 1}: Full name is required`);
    });
  }

  // Required fields - Property
  if (!data.property_address) errors.push('Property address is required');

  // Required fields - Dates
  if (!data.agreement_date) errors.push('Agreement date is required');
  if (!data.tenancy_start_date) errors.push('Tenancy start date is required');

  // Fixed term validation
  if (data.is_fixed_term) {
    if (!data.tenancy_end_date) errors.push('Fixed term tenancy requires an end date');
    if (!data.term_length) warnings.push('Term length description recommended for fixed term tenancies');

    if (data.tenancy_end_date) {
      const startDate = new Date(data.tenancy_start_date);
      const endDate = new Date(data.tenancy_end_date);
      if (endDate <= startDate) {
        errors.push('Tenancy end date must be after start date');
      }
    }
  }

  // Rent validation
  if (!data.rent_amount || data.rent_amount <= 0) {
    errors.push('Rent amount must be greater than 0');
  }
  if (!data.rent_due_day) errors.push('Rent due day is required');
  if (!data.payment_method) errors.push('Payment method is required');
  if (!data.payment_details) errors.push('Payment details are required');
  if (!data.first_payment) warnings.push('First payment amount should be specified');
  if (!data.first_payment_date) warnings.push('First payment date should be specified');

  // Deposit validation
  if (!data.deposit_amount || data.deposit_amount < 0) {
    errors.push('Deposit amount is required (can be 0)');
  }

  // Deposit ratio check (typically 1-2 months rent)
  if (data.deposit_amount && data.rent_amount) {
    const rentPeriodMultiplier = data.rent_period === 'week' ? 4.33 : 1;
    const monthlyRent = data.rent_amount * rentPeriodMultiplier;
    const depositRatio = data.deposit_amount / monthlyRent;

    if (depositRatio > 2) {
      warnings.push(
        `Deposit (£${data.deposit_amount}) is more than 2 months rent. ` +
          `This may be challenged as excessive.`
      );
    }
  }

  if (data.deposit_amount > 0 && !data.deposit_scheme) {
    warnings.push('Deposit protection scheme should be specified (TDS NI or MyDeposits NI)');
  }

  // Date validations
  const agreementDate = new Date(data.agreement_date);
  const startDate = new Date(data.tenancy_start_date);

  if (startDate < agreementDate) {
    warnings.push('Tenancy start date is before agreement date - ensure this is intentional');
  }

  // Parking validation
  if (data.parking && !data.parking_details) {
    warnings.push('Parking is included but details are not specified');
  }

  // Pets validation
  if (data.pets_allowed && !data.approved_pets) {
    warnings.push('Pets are allowed but approved pets are not specified');
  }

  // Break clause validation
  if (data.break_clause && !data.break_clause_terms) {
    errors.push('Break clause is enabled but terms are not specified');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate deposit amount vs rent
 */
export function validateDepositAmount(
  depositAmount: number,
  rentAmount: number,
  rentPeriod: 'week' | 'month'
): { valid: boolean; warning?: string } {
  const rentPeriodMultiplier = rentPeriod === 'week' ? 4.33 : 1;
  const monthlyRent = rentAmount * rentPeriodMultiplier;
  const depositRatio = depositAmount / monthlyRent;

  if (depositRatio > 2) {
    return {
      valid: false,
      warning: `Deposit (£${depositAmount}) is ${depositRatio.toFixed(1)}x monthly rent. Maximum 2 months recommended.`,
    };
  }

  return { valid: true };
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generate a Private Tenancy Agreement for Northern Ireland
 */
export async function generatePrivateTenancyAgreement(
  data: PrivateTenancyData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'html'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validatePrivateTenancyData(data);
  if (!validation.valid) {
    throw new Error(`Private Tenancy Agreement validation failed:\n${validation.errors.join('\n')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Private Tenancy Agreement warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Enrich data with computed fields and defaults
  const enrichedData: PrivateTenancyData = {
    ...data,
    // Landlord details (flattened for template)
    landlord_full_name: data.landlord.full_name,
    landlord_address: data.landlord.address,
    landlord_email: data.landlord.email,
    landlord_phone: data.landlord.phone,

    // Helper fields
    multiple_tenants: data.tenants.length > 1,
    number_of_tenants: data.tenants.length,
    rent_period: data.rent_period || 'month',

    // Document metadata
    document_id: data.document_id || `NI-PTA-${Date.now()}`,
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
  };

  // Generate document
  return generateDocument({
    templatePath: 'uk/northern-ireland/templates/private_tenancy_agreement.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

/**
 * Generate a Premium Private Tenancy Agreement for Northern Ireland
 * with enhanced formatting, comprehensive clauses, and professional styling
 */
export async function generatePremiumPrivateTenancy(
  data: PrivateTenancyData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'both'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validatePrivateTenancyData(data);
  if (!validation.valid) {
    throw new Error(`Premium Private Tenancy Agreement validation failed:\n${validation.errors.join('\n')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Premium Private Tenancy Agreement warnings:');
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  // Enrich data with computed fields and defaults
  const enrichedData: PrivateTenancyData = {
    ...data,
    // Landlord details (flattened for template)
    landlord_full_name: data.landlord.full_name,
    landlord_address: data.landlord.address,
    landlord_email: data.landlord.email,
    landlord_phone: data.landlord.phone,

    // Helper fields
    multiple_tenants: data.tenants.length > 1,
    number_of_tenants: data.tenants.length,
    rent_period: data.rent_period || 'month',
    current_date: data.current_date || new Date().toLocaleDateString('en-GB'),
    current_year: data.current_year || new Date().getFullYear(),

    // Document metadata
    document_id: data.document_id || `NI-PTA-PREMIUM-${Date.now()}`,
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
  };

  // Generate from premium formatted template
  return generateDocument({
    templatePath: 'uk/northern-ireland/templates/private_tenancy_premium.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

// ============================================================================
// SAMPLE DATA GENERATORS (for testing)
// ============================================================================

export function generateSamplePrivateTenancyAgreement(
  type: 'fixed' | 'periodic' = 'fixed'
): PrivateTenancyData {
  const baseData: PrivateTenancyData = {
    landlord: {
      full_name: 'Patricia McGuinness',
      address: '22 Botanic Avenue, Belfast, BT7 1JQ',
      email: 'patricia.mcguinness@example.com',
      phone: '028 9032 1234',
    },
    tenants: [
      {
        full_name: 'James O\'Neill',
        dob: '1995-03-15',
        email: 'james.oneill@example.com',
        phone: '077 1234 5678',
      },
      {
        full_name: 'Sarah Kelly',
        dob: '1997-07-22',
        email: 'sarah.kelly@example.com',
        phone: '077 8765 4321',
      },
    ],
    property_address: '8 University Street, Belfast, BT7 1FY',
    property_description: 'Modern 2-bedroom apartment on the second floor',
    included_areas: 'All rooms, allocated parking space #12',
    furnished_status: 'furnished',
    parking: true,
    parking_details: 'One allocated parking space in rear car park (Space #12)',
    has_garden: false,
    agreement_date: '2025-01-10',
    tenancy_start_date: '2025-02-01',
    is_fixed_term: type === 'fixed',
    tenancy_end_date: type === 'fixed' ? '2026-01-31' : undefined,
    term_length: type === 'fixed' ? '12 months' : undefined,
    rent_amount: 950,
    rent_period: 'month',
    rent_due_day: '1st',
    payment_method: 'Standing Order',
    payment_details: 'Sort Code: 12-34-56, Account: 12345678, Reference: 8UNISTREET',
    first_payment: 950,
    first_payment_date: '2025-02-01',
    rent_includes: 'Wifi internet access',
    rent_excludes: 'Gas, electricity, water rates (tenant responsible)',
    deposit_amount: 1900,
    deposit_scheme: 'TDS Northern Ireland',
    inventory_attached: true,
    pets_allowed: false,
    smoking_allowed: false,
    break_clause: type === 'fixed',
    break_clause_terms:
      type === 'fixed'
        ? 'Either party may terminate this agreement after 6 months by giving 8 weeks written notice'
        : undefined,
  };

  return baseData;
}

export function generateSamplePrivateTenancyWithAgent(): PrivateTenancyData {
  const baseData = generateSamplePrivateTenancyAgreement('fixed');

  return {
    ...baseData,
    agent: {
      name: 'David Hughes',
      company: 'Belfast Property Management Ltd',
      address: '45 Royal Avenue, Belfast, BT1 1FE',
      email: 'david.hughes@bpm.co.uk',
      phone: '028 9024 7890',
      signs: true,
    },
    agent_name: 'David Hughes',
    agent_address: '45 Royal Avenue, Belfast, BT1 1FE',
    agent_email: 'david.hughes@bpm.co.uk',
    agent_phone: '028 9024 7890',
    agent_signs: true,
  };
}
