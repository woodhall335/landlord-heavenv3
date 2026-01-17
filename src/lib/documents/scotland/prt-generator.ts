/**
 * PRT (Private Residential Tenancy) Generator - Scotland
 *
 * Generates Private Residential Tenancy agreements for Scotland under
 * the Private Housing (Tenancies) (Scotland) Act 2016.
 */

import { generateDocument, GeneratedDocument } from '../generator';

// ============================================================================
// TYPES
// ============================================================================

export interface TenantInfo {
  number: number;
  full_name: string;
  dob: string;
  email: string;
  phone: string;
}

export interface PRTData {
  // Agreement
  agreement_date: string;
  current_date?: string;
  current_year?: number;

  // Landlord
  landlord_full_name: string;
  landlord_2_name?: string; // Joint landlord
  landlord_address: string;
  landlord_address_line1?: string;
  landlord_address_town?: string;
  landlord_address_postcode?: string;
  landlord_email: string;
  landlord_phone: string;
  landlord_reg_number?: string; // REQUIRED - Landlord registration
  registration_authority?: string; // e.g., "Edinburgh Council"
  registration_expiry?: string;

  // Agent (optional)
  agent_name?: string;
  agent_address?: string;
  agent_email?: string;
  agent_phone?: string;
  agent_reg_number?: string; // Letting agent registration
  agent_signs?: boolean;

  // Tenants
  tenants: TenantInfo[];
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
  furnished_status?: 'furnished' | 'unfurnished' | 'part-furnished';
  council_tax_band?: string;

  // Term - PRTs have NO fixed end date
  tenancy_start_date: string;
  is_fixed_term?: boolean; // Always false for PRTs
  // Note: No tenancy_end_date - PRTs are open-ended

  // Rent
  rent_amount: number;
  rent_period: 'week' | 'month' | 'quarter' | 'year';
  rent_due_day: string; // e.g., "1st", "15th"
  payment_method: string; // e.g., "Standing Order", "Bank Transfer"
  payment_details: string; // Bank details
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  first_payment?: number;
  first_payment_date?: string;
  rent_includes?: string; // What's included in rent
  rent_excludes?: string; // What tenant pays separately

  // Deposit - MUST be protected within 30 working days
  deposit_amount: number;
  deposit_scheme?: string;
  deposit_scheme_name?: 'SafeDeposits Scotland' | 'MyDeposits Scotland' | 'Letting Protection Service Scotland';

  // Bills & Utilities
  council_tax_responsibility?: string;
  utilities_responsibility?: string;
  internet_responsibility?: string;

  // Inventory
  inventory_attached?: boolean;
  inventory_provided?: boolean;
  inventory_items?: string; // Comprehensive list of furnished items
  professional_cleaning_required?: boolean;
  decoration_condition?: string;

  // Property features & rules
  has_garden?: boolean;
  garden_maintenance?: string;
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;

  // Legal Compliance & Safety
  gas_safety_certificate?: boolean;
  gas_safety_certificate_date?: string;
  gas_safety_certificate_expiry?: string;
  epc_rating?: string; // e.g., "C", "D" (minimum E required)
  epc_certificate_date?: string;
  epc_expiry?: string;
  electrical_safety_certificate?: boolean;
  eicr_certificate_date?: string;
  eicr_next_inspection_date?: string;
  smoke_alarms_fitted?: boolean;
  smoke_alarm_test_date?: string;
  carbon_monoxide_alarms?: boolean;
  repairing_standard_statement?: boolean; // Scotland-specific

  // Deposit Compliance Dates - 30 WORKING DAYS requirement
  deposit_paid_date?: string;
  deposit_protection_date?: string;
  prescribed_information_date?: string;

  // Maintenance & Repairs
  landlord_maintenance_responsibilities?: string;
  repairs_reporting_method?: string;
  emergency_contact?: string;

  // Tenancy Terms & Conditions
  subletting_allowed?: string;
  rent_increase_frequency?: string; // Must be 12+ months in Scotland
  tenant_notice_period?: string;
  additional_terms?: string;

  // Insurance & Liability
  landlord_insurance?: boolean;
  tenant_insurance_required?: string;

  // Access & Viewings
  landlord_access_notice?: string;
  inspection_frequency?: string;

  // Additional Terms
  white_goods_included?: string[];
  communal_areas?: boolean;
  communal_cleaning?: string;
  recycling_bins?: boolean;

  // Notification
  absence_notification_days?: number; // Default 28 days

  // Additional schedules
  additional_schedules?: string;

  // Premium Enhanced Features - HMO
  is_hmo?: boolean;
  hmo_licence_status?: string;
  hmo_licence_number?: string;
  hmo_licence_expiry?: string;
  number_of_sharers?: number;

  // Premium Enhanced Features - Meter Readings
  meter_reading_gas?: string;
  meter_reading_electric?: string;
  meter_reading_water?: string;
  utility_transfer_responsibility?: string;

  // Premium Enhanced Features - Late Payment Interest
  late_payment_interest_applicable?: boolean;
  late_payment_interest_rate?: number;
  grace_period_days?: number;
  late_payment_admin_fee?: number;

  // Premium Enhanced Features - Key Schedule
  number_of_front_door_keys?: number;
  number_of_back_door_keys?: number;
  number_of_window_keys?: number;
  number_of_mailbox_keys?: number;
  access_cards_fobs?: number;
  key_replacement_cost?: number;
  other_keys_notes?: string;

  // Premium Enhanced Features - Contractor Access
  contractor_access_notice_period?: string;
  emergency_access_allowed?: boolean;
  contractor_access_hours?: string;
  tenant_presence_required?: boolean;

  // Premium Enhanced Features - Emergency Procedures
  emergency_landlord_phone?: string;
  emergency_plumber_phone?: string;
  emergency_electrician_phone?: string;
  emergency_gas_engineer_phone?: string;
  emergency_locksmith_phone?: string;
  water_shutoff_location?: string;
  electricity_fuse_box_location?: string;
  gas_shutoff_location?: string;

  // Premium Enhanced Features - Maintenance Schedule
  boiler_service_frequency?: string;
  boiler_service_responsibility?: string;
  gutter_cleaning_frequency?: string;
  gutter_cleaning_responsibility?: string;
  window_cleaning_frequency?: string;
  appliance_maintenance_notes?: string;

  // Premium Enhanced Features - Garden Maintenance
  lawn_mowing_frequency?: string;
  lawn_mowing_responsibility?: string;
  hedge_trimming_responsibility?: string;
  weed_control_responsibility?: string;
  outdoor_furniture_notes?: string;

  // Premium Enhanced Features - Move-In Procedures
  pre_tenancy_meeting_required?: boolean;
  move_in_inspection_required?: boolean;
  photographic_inventory_provided?: boolean;
  tenant_handbook_provided?: boolean;
  utility_accounts_transfer_deadline?: string;
  council_tax_registration_deadline?: string;

  // Premium Enhanced Features - Move-Out Procedures
  checkout_inspection_required?: boolean;
  professional_cleaning_standard?: boolean;
  carpet_cleaning_required?: boolean;
  oven_cleaning_required?: boolean;
  garden_condition_required?: string;
  key_return_deadline?: string;
  forwarding_address_required?: boolean;
  deposit_return_timeline?: string;

  // Premium Enhanced Features - Cleaning Standards
  regular_cleaning_expectations?: string;
  deep_cleaning_areas?: string[];
  cleaning_checklist_provided?: boolean;
  cleaning_cost_estimates?: number;

  // Generation metadata
  product_tier?: string;
  document_id?: string;
  generation_timestamp?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates PRT data for Scotland compliance
 */
export function validatePRTData(data: PRTData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.landlord_full_name) errors.push('Landlord name is required');
  if (!data.landlord_address) errors.push('Landlord address is required');
  if (!data.property_address) errors.push('Property address is required');
  if (!data.tenancy_start_date) errors.push('Tenancy start date is required');
  if (!data.tenants || data.tenants.length === 0) errors.push('At least one tenant is required');
  if (!data.rent_amount || data.rent_amount <= 0) errors.push('Valid rent amount is required');
  if (!data.deposit_amount || data.deposit_amount < 0) errors.push('Deposit amount is required');

  // Landlord registration (CRITICAL in Scotland)
  if (!data.landlord_reg_number) {
    errors.push(
      'WARNING: Landlord registration number is required in Scotland. It is a criminal offence to let property without registration.'
    );
  }

  // Deposit must be protected
  if (!data.deposit_scheme_name && data.deposit_amount > 0) {
    errors.push('Deposit scheme must be specified (SafeDeposits Scotland, MyDeposits Scotland, or LPS Scotland)');
  }

  // EPC rating minimum E
  if (data.epc_rating && ['F', 'G'].includes(data.epc_rating.toUpperCase())) {
    errors.push(`EPC rating ${data.epc_rating} is below minimum standard (E). Property cannot be legally let.`);
  }

  // Tenant data validation
  data.tenants.forEach((tenant, idx) => {
    if (!tenant.full_name) errors.push(`Tenant ${idx + 1}: Name is required`);
    if (!tenant.email && !tenant.phone) errors.push(`Tenant ${idx + 1}: Email or phone is required`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generates a standard PRT agreement for Scotland
 */
export async function generatePRTAgreement(
  data: PRTData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'html'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validatePRTData(data);
  if (!validation.valid) {
    throw new Error(`PRT data validation failed:\n${validation.errors.join('\n')}`);
  }

  // Enrich data with defaults
  const enrichedData: PRTData = {
    ...data,
    multiple_tenants: data.tenants.length > 1,
    absence_notification_days: data.absence_notification_days || 28,
    rent_period: data.rent_period || 'month',
    is_fixed_term: false, // PRTs are always open-ended
    document_id: data.document_id || `PRT-${Date.now()}`,
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
  };

  // Generate from template
  return generateDocument({
    templatePath: 'uk/scotland/templates/prt_agreement.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

/**
 * Generates a premium PRT agreement for Scotland with enhanced formatting
 */
export async function generatePremiumPRT(
  data: PRTData,
  isPreview = false,
  outputFormat: 'html' | 'pdf' | 'both' = 'both'
): Promise<GeneratedDocument> {
  // Validate data
  const validation = validatePRTData(data);
  if (!validation.valid) {
    throw new Error(`Premium PRT data validation failed:\n${validation.errors.join('\n')}`);
  }

  // Enrich data with defaults
  const enrichedData: PRTData = {
    ...data,
    multiple_tenants: data.tenants.length > 1,
    absence_notification_days: data.absence_notification_days || 28,
    rent_period: data.rent_period || 'month',
    is_fixed_term: false, // PRTs are always open-ended
    current_date: data.current_date || new Date().toLocaleDateString('en-GB'),
    current_year: data.current_year || new Date().getFullYear(),
    document_id: data.document_id || `PRT-PREMIUM-${Date.now()}`,
    generation_timestamp: data.generation_timestamp || new Date().toISOString(),
  };

  // Generate from premium formatted template
  return generateDocument({
    templatePath: 'uk/scotland/templates/prt_agreement_premium.hbs',
    data: enrichedData,
    isPreview,
    outputFormat,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates sample PRT data for testing
 */
export function createSamplePRTData(): PRTData {
  return {
    agreement_date: '1 January 2025',

    // Landlord
    landlord_full_name: 'Sarah MacDonald',
    landlord_address: '123 Princes Street, Edinburgh, EH2 4AA',
    landlord_email: 'sarah.macdonald@example.com',
    landlord_phone: '0131 123 4567',
    landlord_reg_number: '123456/230/12345',
    registration_authority: 'City of Edinburgh Council',
    registration_expiry: '31 December 2025',

    // Tenants
    tenants: [
      {
        number: 1,
        full_name: 'James Murray',
        dob: '15 March 1990',
        email: 'james.murray@example.com',
        phone: '07700 900123',
      },
    ],

    // Property
    property_address: '45 Rose Street, Edinburgh, EH2 2NG',
    property_description: 'Two-bedroom first floor flat in Edinburgh city centre',
    furnished_status: 'furnished',
    has_garden: false,
    council_tax_band: 'D',

    // Term
    tenancy_start_date: '1 February 2025',

    // Rent
    rent_amount: 1200,
    rent_period: 'month',
    rent_due_day: '1st',
    payment_method: 'Standing Order',
    payment_details: 'Sort Code: 12-34-56, Account: 12345678, Reference: 45ROSE',
    first_payment: 1200,
    first_payment_date: '1 February 2025',
    rent_excludes: 'Council tax, utilities (gas, electricity, water)',

    // Deposit
    deposit_amount: 1800,
    deposit_scheme_name: 'SafeDeposits Scotland',

    // Energy
    epc_rating: 'C',
    epc_expiry: '15 January 2030',

    // Features
    pets_allowed: false,
    smoking_allowed: false,

    // Inventory
    inventory_attached: true,

    // Metadata
    document_id: 'PRT-SAMPLE-001',
    generation_timestamp: new Date().toISOString(),
  };
}

/**
 * Validates that deposit amount complies with Scottish regulations
 * (No statutory limit but market practice is usually 1-2 months' rent)
 */
export function validateDepositAmount(depositAmount: number, monthlyRent: number): {
  valid: boolean;
  warning?: string;
} {
  const ratio = depositAmount / monthlyRent;

  if (ratio > 2) {
    return {
      valid: true,
      warning: `Deposit is ${ratio.toFixed(1)}x monthly rent. While legal, this may be challenged as excessive.`,
    };
  }

  return { valid: true };
}

/**
 * Checks if EPC rating meets minimum standard (E or better)
 */
export function validateEPCRating(rating: string): { valid: boolean; error?: string } {
  const validRatings = ['A', 'B', 'C', 'D', 'E'];
  const upperRating = rating.toUpperCase();

  if (!validRatings.includes(upperRating)) {
    return {
      valid: false,
      error: `EPC rating ${rating} is below minimum standard (E). Property cannot be legally let in Scotland.`,
    };
  }

  return { valid: true };
}
