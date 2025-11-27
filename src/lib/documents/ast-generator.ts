/**
 * AST (Assured Shorthold Tenancy) Generator
 *
 * Generates standard and premium tenancy agreements for England & Wales.
 */

import { compileAndMergeTemplates, GeneratedDocument, htmlToPdf } from './generator';

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
  // Product metadata
  product_tier?: string;

  // AST Suitability Check (Premium)
  tenant_is_individual?: boolean;
  main_home?: boolean;
  landlord_lives_at_property?: boolean;
  holiday_or_licence?: boolean;

  // Agreement
  agreement_date: string;
  current_date?: string;
  current_year?: number;
  generation_timestamp?: string;
  document_id?: string;

  // Landlord
  landlord_full_name: string;
  landlord_address: string;
  landlord_address_line1?: string;
  landlord_address_town?: string;
  landlord_address_postcode?: string;
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
  number_of_tenants?: number;

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
  has_shared_facilities?: boolean;
  number_of_sharers?: number;
  hmo_licence_status?: string;
  hmo_licence_number?: string;
  hmo_licence_expiry?: string;

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
  bank_account_name?: string;
  bank_sort_code?: string;
  bank_account_number?: string;
  first_payment?: number;
  first_payment_date?: string;
  rent_includes?: string; // What's included in rent
  rent_excludes?: string; // What tenant pays separately
  rent_increase_method?: string;

  // Deposit
  deposit_amount: number;
  deposit_scheme?: string;
  deposit_scheme_name: 'DPS' | 'MyDeposits' | 'TDS';
  deposit_paid_date?: string;
  deposit_protection_date?: string;
  deposit_already_protected?: boolean;
  deposit_reference_number?: string;
  prescribed_information_served?: boolean;

  // Bills & Utilities
  council_tax_responsibility?: string;
  utilities_responsibility?: string;
  internet_responsibility?: string;

  // Inventory
  inventory_attached?: boolean;
  inventory_provided?: boolean;
  professional_cleaning_required?: boolean;
  decoration_condition?: string;
  inventory_schedule_notes?: string;

  // Property features & rules
  has_garden?: boolean;
  garden_maintenance?: string;
  pets_allowed?: boolean;
  approved_pets?: string;
  smoking_allowed?: boolean;

  // Premium: Guarantor (optional)
  guarantor_name?: string;
  guarantor_address?: string;
  guarantor_email?: string;
  guarantor_phone?: string;
  guarantor_dob?: string;
  guarantor_relationship?: string;
  guarantor_required?: boolean;

  // Premium: Enhanced Pet Agreement
  pet_type?: string;
  pet_breed?: string;
  pet_age?: string;
  pet_name?: string;
  pet_weight?: string;
  pet_deposit_amount?: number;
  pet_insurance_required?: boolean;
  flea_treatment_frequency?: string;

  // Premium: Right to Rent Compliance
  right_to_rent_check_date?: string;
  right_to_rent_documents_checked?: string[];

  // Premium: How to Rent Guide
  how_to_rent_version?: string;
  how_to_rent_provision_date?: string;

  // Legal Compliance & Safety
  gas_safety_certificate?: boolean;
  epc_rating?: string;
  electrical_safety_certificate?: boolean;
  smoke_alarms_fitted?: boolean;
  carbon_monoxide_alarms?: boolean;
  how_to_rent_guide_provided?: boolean;

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
  rent_increase_frequency?: string;
  joint_and_several_liability?: boolean;
  tenant_notice_period?: string; // e.g., "1 month"
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
  communal_areas?: string; // Description of communal areas (for HMOs)
  is_hmo?: boolean; // Is this property a licensed HMO?
  communal_cleaning?: string; // Cleaning arrangements for shared areas
  recycling_bins?: boolean;

  // Jurisdiction
  jurisdiction_england?: boolean;
  jurisdiction_wales?: boolean;

  // Additional schedules
  additional_schedules?: string;

  // Meter Readings (both Standard and Premium)
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

  // Tenant Fees Act 2019 - Deposit Limits (England & Wales)
  if (data.deposit_amount > 0 && data.rent_amount > 0) {
    const monthlyRent = data.rent_amount;
    const annualRent = monthlyRent * 12;
    const weeklyRent = monthlyRent / 4.33; // Average weeks per month

    // 6 weeks if annual rent > £50,000, otherwise 5 weeks
    const maxWeeks = annualRent > 50000 ? 6 : 5;
    const maxDeposit = weeklyRent * maxWeeks;

    if (data.deposit_amount > maxDeposit + 0.01) { // Allow 1p rounding tolerance
      errors.push(
        `⚠️ ILLEGAL DEPOSIT: £${data.deposit_amount} exceeds ${maxWeeks} weeks rent (£${maxDeposit.toFixed(2)}). ` +
        `This VIOLATES the Tenant Fees Act 2019. Maximum permitted: £${maxDeposit.toFixed(2)}. ` +
        `Penalty: £5,000 fine + criminal prosecution for repeat offense.`
      );
    }
  }

  return errors;
}

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate a standard AST with all bonus documents
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

  const generationTimestamp = new Date().toISOString();
  const documentId = `AST-STD-${Date.now()}`;

  // Add metadata flags
  const enrichedData = {
    ...data,
    premium: false,
    product_tier: data.product_tier || 'Standard AST',
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: data.jurisdiction_england ? 'England & Wales' : 'England & Wales',
  };

  // List of all templates to merge (in order)
  const templatePaths = [
    'uk/england-wales/templates/standard_ast_formatted.hbs',
    'shared/templates/terms_and_conditions.hbs',
    'shared/templates/certificate_of_curation.hbs',
    'uk/england-wales/templates/ast_legal_validity_summary.hbs',
    'uk/england-wales/templates/government_model_clauses.hbs',
    'shared/templates/deposit_protection_certificate.hbs',
    'shared/templates/inventory_template.hbs',
  ];

  // Compile and merge all templates
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);

  // Generate PDF from merged HTML
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: 'standard_ast_with_bonus_docs',
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
    },
  };
}

/**
 * Generate a premium AST with all bonus documents + enhanced clauses
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

  const generationTimestamp = new Date().toISOString();
  const documentId = `AST-PREM-${Date.now()}`;

  // Add metadata flags for premium
  const enrichedData = {
    ...data,
    premium: true,
    product_tier: data.product_tier || 'Premium AST',
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: data.jurisdiction_england ? 'England & Wales' : 'England & Wales',
  };

  // Premium includes all standard docs PLUS exclusive premium documents
  const templatePaths = [
    'uk/england-wales/templates/premium_ast_formatted.hbs',
    'shared/templates/terms_and_conditions.hbs',
    'shared/templates/certificate_of_curation.hbs',
    'uk/england-wales/templates/ast_legal_validity_summary.hbs',
    'uk/england-wales/templates/government_model_clauses.hbs',
    'shared/templates/deposit_protection_certificate.hbs',
    'shared/templates/inventory_template.hbs',
    // Premium-exclusive documents (Option 2 enhancement)
    'uk/england-wales/templates/premium/key_schedule.hbs',
    'uk/england-wales/templates/premium/tenant_welcome_pack.hbs',
    'uk/england-wales/templates/premium/property_maintenance_guide.hbs',
    'uk/england-wales/templates/premium/move_in_condition_report.hbs',
    'uk/england-wales/templates/premium/checkout_procedure.hbs',
  ];

  // Compile and merge all templates
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);

  // Generate PDF from merged HTML
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: 'premium_ast_with_bonus_docs',
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
    },
  };
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
