/**
 * AST (Assured Shorthold Tenancy) Generator
 *
 * Generates jurisdiction-specific tenancy agreements:
 * - England: Assured Shorthold Tenancy (Housing Act 1988, Deregulation Act 2015)
 * - Wales: Standard Occupation Contract (Renting Homes (Wales) Act 2016)
 * - Scotland: Private Residential Tenancy (Private Housing (Tenancies) (Scotland) Act 2016)
 * - Northern Ireland: Private Tenancy Agreement (Private Tenancies Act (NI) 2022)
 *
 * PRODUCT TIERS:
 * - Standard: Base product - includes ONLY the tenancy agreement document
 * - Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * IMPORTANT: Each jurisdiction uses different terminology and legal frameworks.
 * This generator ensures the correct template and document_type is used.
 *
 * LEGAL NOTES BY JURISDICTION:
 * - England: Uses "Landlord", "Tenant", "Premises". AST wording only (not generic).
 * - Wales: Uses "Landlord", "Contract-holder", "Dwelling". Written Statement required.
 * - Scotland: Open-ended tenancy (no fixed end date). Rent Pressure Zone compatibility.
 * - NI: County Court NI jurisdiction. Electrical safety mandatory from 1 April 2025.
 */

import { compileAndMergeTemplates, GeneratedDocument, htmlToPdf } from './generator';
import { runtimeTenancyVariantsSelfCheck, assertTenancyVariantsInvariant, createFileSystemTemplateGetter } from '../products/tenancy-variant-validator';
import path from 'path';

// ============================================================================
// PRODUCT TIER (2-VARIANTS ONLY RULE)
// ============================================================================

/**
 * TENANCY PRODUCT TIERS - EXACTLY 2 VARIANTS
 *
 * Standard: Base tenancy agreement ONLY, NO HMO clauses
 * Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * This is enforced at compile time via TypeScript and runtime via assertions.
 */
export type TenancyTier = 'standard' | 'premium';

/**
 * Runtime validation for product tier
 * Throws if an invalid tier is provided
 */
export function validateTenancyTier(tier: string): asserts tier is TenancyTier {
  if (tier !== 'standard' && tier !== 'premium') {
    throw new Error(
      `Invalid tenancy tier: "${tier}". ` +
      `Only 2 tiers are allowed: "standard" (no HMO) or "premium" (HMO). ` +
      `This is a hard constraint - no other variants are permitted.`
    );
  }
}

/**
 * Assert that HMO flags are correctly set for the tier
 * - Standard: is_hmo MUST be false
 * - Premium: is_hmo MUST be true
 */
export function assertTierHMOConsistency(tier: TenancyTier, isHMO: boolean): void {
  if (tier === 'standard' && isHMO) {
    throw new Error(
      `HMO flag mismatch: Standard tier cannot have is_hmo=true. ` +
      `Standard = NO HMO clauses. Use "premium" tier for HMO properties.`
    );
  }
  if (tier === 'premium' && !isHMO) {
    throw new Error(
      `HMO flag mismatch: Premium tier must have is_hmo=true. ` +
      `Premium = HMO-specific agreement. Set is_hmo=true or use "standard" tier.`
    );
  }
}

// ============================================================================
// JURISDICTION CONFIGURATION
// ============================================================================

export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

/**
 * Jurisdiction-specific configuration for tenancy agreements
 */
interface JurisdictionConfig {
  jurisdiction: TenancyJurisdiction;
  agreementTitle: string;
  agreementDescription: string;
  agreementDocumentType: string; // Must match pack-contents keys
  modelClausesTitle: string;
  modelClausesDescription: string;
  legalFramework: string;
  jurisdictionLabel: string;
  templatePaths: {
    standard: string;
    premium: string;
    modelClauses: string;
    termsSchedule: string;
    inventory: string; // Wizard-completed inventory for premium tier
    inventoryBlank: string; // Blank inventory template for standard tier
    inventoryStandalone: string; // Standalone inventory PDF template
    complianceChecklist: string; // Jurisdiction-specific pre-tenancy checklist
    complianceChecklistStandalone: string; // Standalone checklist PDF template
    keySchedule: string;
    maintenanceGuide: string;
    checkoutProcedure: string;
  };
  /** Document type key for inventory schedule (must match pack-contents) */
  inventoryDocumentType: string;
  /** Document type key for compliance checklist (must match pack-contents) */
  checklistDocumentType: string;
}

/**
 * Configuration for each UK jurisdiction
 */
const JURISDICTION_CONFIGS: Record<TenancyJurisdiction, JurisdictionConfig> = {
  // ENGLAND: Uses AST terminology. Housing Act 1988 + Deregulation Act 2015.
  // Terminology: "Landlord", "Tenant", "Premises" (NOT generic tenancy)
  // Premium tier includes HMO-specific clauses aligned with Housing Act 2004
  england: {
    jurisdiction: 'england',
    agreementTitle: 'Assured Shorthold Tenancy Agreement',
    agreementDescription: 'Solicitor-grade tenancy agreement with embedded schedules. Compliant with Housing Act 1988.',
    agreementDocumentType: 'ast_agreement',
    modelClausesTitle: 'Government Model Clauses',
    modelClausesDescription: 'Recommended clauses from official government guidance',
    legalFramework: 'Housing Act 1988',
    jurisdictionLabel: 'England',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_england',
    templatePaths: {
      standard: 'uk/england/templates/standard_ast_formatted.hbs',
      premium: 'uk/england/templates/ast_hmo.hbs', // HMO-specific template
      modelClauses: 'uk/england/templates/government_model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'shared/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_england.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/england/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/england/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/england/templates/premium/checkout_procedure.hbs',
    },
  },
  // WALES: Uses Occupation Contract terminology. Renting Homes (Wales) Act 2016.
  // Terminology: "Landlord", "Contract-holder" (NOT Tenant), "Dwelling"
  // NO AST references allowed. Written Statement requirements apply.
  // Premium tier includes HMO clauses aligned with Housing Act 2004
  wales: {
    jurisdiction: 'wales',
    agreementTitle: 'Standard Occupation Contract',
    agreementDescription: 'Solicitor-grade occupation contract with embedded schedules. Compliant with Renting Homes (Wales) Act 2016.',
    agreementDocumentType: 'soc_agreement',
    modelClausesTitle: 'Model Clauses (Wales)',
    modelClausesDescription: 'Prescribed statutory terms under Renting Homes (Wales) Act 2016',
    legalFramework: 'Renting Homes (Wales) Act 2016',
    jurisdictionLabel: 'Wales',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_wales',
    templatePaths: {
      standard: 'uk/wales/templates/standard_occupation_contract.hbs',
      premium: 'uk/wales/templates/occupation_contract_hmo.hbs', // HMO-specific template
      modelClauses: 'uk/wales/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'shared/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_wales.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/wales/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/wales/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/wales/templates/premium/checkout_procedure.hbs',
    },
  },
  // SCOTLAND: Private Residential Tenancy (open-ended, no fixed end date).
  // Private Housing (Tenancies) (Scotland) Act 2016.
  // Key differences: Open-ended tenancy, Rent Pressure Zone compatibility required.
  // First-tier Tribunal for Scotland (not County Court).
  scotland: {
    jurisdiction: 'scotland',
    agreementTitle: 'Private Residential Tenancy Agreement',
    agreementDescription: 'Solicitor-grade PRT agreement with embedded schedules. Compliant with Private Housing (Tenancies) (Scotland) Act 2016.',
    agreementDocumentType: 'prt_agreement',
    modelClausesTitle: 'Model Clauses (Scotland)',
    modelClausesDescription: 'Scottish Government prescribed terms for PRTs',
    legalFramework: 'Private Housing (Tenancies) (Scotland) Act 2016',
    jurisdictionLabel: 'Scotland',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_scotland',
    templatePaths: {
      standard: 'uk/scotland/templates/prt_agreement.hbs',
      premium: 'uk/scotland/templates/prt_agreement_hmo.hbs', // HMO-specific template
      modelClauses: 'uk/scotland/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'uk/scotland/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_scotland.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/scotland/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/scotland/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/scotland/templates/premium/checkout_procedure.hbs',
    },
  },
  // NORTHERN IRELAND: Updated to 2022 Act. Key requirements:
  // - Electrical safety mandatory from 1 April 2025
  // - Rent increase restrictions: 12-month gap, 3-month notice
  // - County Court Northern Ireland jurisdiction
  'northern-ireland': {
    jurisdiction: 'northern-ireland',
    agreementTitle: 'Private Tenancy Agreement',
    agreementDescription: 'Solicitor-grade tenancy agreement with embedded schedules. Compliant with Private Tenancies Act (Northern Ireland) 2022',
    agreementDocumentType: 'private_tenancy_agreement',
    modelClausesTitle: 'Model Clauses (Northern Ireland)',
    modelClausesDescription: 'Prescribed statutory terms under NI legislation',
    legalFramework: 'Private Tenancies Act (Northern Ireland) 2022',
    jurisdictionLabel: 'Northern Ireland',
    inventoryDocumentType: 'inventory_schedule',
    checklistDocumentType: 'pre_tenancy_checklist_northern_ireland',
    templatePaths: {
      standard: 'uk/northern-ireland/templates/private_tenancy_agreement.hbs',
      premium: 'uk/northern-ireland/templates/private_tenancy_hmo.hbs',
      modelClauses: 'uk/northern-ireland/templates/model_clauses.hbs',
      termsSchedule: 'shared/templates/terms_and_conditions.hbs',
      inventory: 'uk/northern-ireland/templates/inventory_template.hbs', // Wizard-completed for premium
      inventoryBlank: '_shared/schedules/schedule_inventory_blank.hbs', // Blank for standard
      inventoryStandalone: '_shared/standalone/inventory_standalone.hbs', // Standalone inventory PDF
      complianceChecklist: '_shared/compliance/pre_tenancy_checklist_northern_ireland.hbs',
      complianceChecklistStandalone: '_shared/standalone/checklist_standalone.hbs', // Standalone checklist PDF
      keySchedule: 'uk/northern-ireland/templates/premium/key_schedule.hbs',
      maintenanceGuide: 'uk/northern-ireland/templates/premium/property_maintenance_guide.hbs',
      checkoutProcedure: 'uk/northern-ireland/templates/premium/checkout_procedure.hbs',
    },
  },
};

/**
 * Detect jurisdiction from ASTData
 * Checks multiple possible sources and normalizes to canonical jurisdiction
 */
function detectJurisdiction(data: ASTData): TenancyJurisdiction {
  // Check explicit jurisdiction field (canonical)
  const explicitJurisdiction = (data as any).jurisdiction;
  if (explicitJurisdiction) {
    const normalized = explicitJurisdiction.toLowerCase().replace(/\s+/g, '-');
    if (normalized === 'scotland') return 'scotland';
    if (normalized === 'northern-ireland' || normalized === 'ni') return 'northern-ireland';
    if (normalized === 'wales') return 'wales';
    if (normalized === 'england') return 'england';
  }

  // Check legacy jurisdiction flags
  if ((data as any).jurisdiction_scotland) return 'scotland';
  if ((data as any).jurisdiction_northern_ireland || (data as any).jurisdiction_ni) return 'northern-ireland';
  if (data.jurisdiction_wales) return 'wales';
  if (data.jurisdiction_england) return 'england';

  // Default to England if not specified
  console.warn('[AST Generator] No jurisdiction specified, defaulting to England');
  return 'england';
}

/**
 * Get jurisdiction configuration
 */
export function getJurisdictionConfig(jurisdiction: TenancyJurisdiction): JurisdictionConfig {
  return JURISDICTION_CONFIGS[jurisdiction];
}

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
  gas_safety_certificate_date?: string;
  gas_safety_certificate_expiry?: string;
  epc_rating?: string;
  epc_certificate_date?: string;
  electrical_safety_certificate?: boolean;
  eicr_certificate_date?: string;
  eicr_next_inspection_date?: string;
  smoke_alarms_fitted?: boolean;
  carbon_monoxide_alarms?: boolean;
  how_to_rent_guide_provided?: boolean;
  how_to_rent_guide_date?: string;

  // Deposit Compliance Dates
  prescribed_information_date?: string;

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
 * Result of AST suitability validation
 */
export interface ASTSuitabilityResult {
  valid: boolean;
  reasons: string[];
}

/**
 * Validate AST suitability based on tenancy characteristics.
 * Returns whether the arrangement is suitable for an AST and reasons if not.
 *
 * For an AST to be valid:
 * - Tenant must be an individual (not a company)
 * - Must be the tenant's main home
 * - Landlord must not live at the property (would be a lodger/licence)
 * - Must not be a holiday let or licence arrangement
 */
export function validateASTSuitability(data: ASTData): ASTSuitabilityResult {
  const reasons: string[] = [];

  // Check if tenant is an individual
  if (data.tenant_is_individual === false) {
    reasons.push('Tenant must be an individual (not a company) for an AST');
  }

  // Check if it's the tenant's main home
  if (data.main_home === false) {
    reasons.push('The property must be the tenant\'s main home for an AST');
  }

  // Check if landlord lives at property (lodger/licence scenario)
  if (data.landlord_lives_at_property === true) {
    reasons.push('If the landlord lives at the property, this is likely a lodger or licence arrangement, not an AST');
  }

  // Check if it's a holiday let or licence
  if (data.holiday_or_licence === true) {
    reasons.push('Holiday lets and licence arrangements are not covered by AST regulations');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

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
    if (!tenant.full_name) {
      errors.push(`tenant[${i}].full_name is required`);
    }

    // DOB is optional for now – we still *use* it if present, but don't block generation
    // if (!tenant.dob) {
    //   errors.push(`tenant[${i}].dob is required`);
    // }

    if (!tenant.email) {
      errors.push(`tenant[${i}].email is required`);
    }
    if (!tenant.phone) {
      errors.push(`tenant[${i}].phone is required`);
    }
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
 * Generate a standard tenancy agreement with inventory (blank) and compliance checklist
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * INTEGRATION LAYER: Standard tier includes:
 * - Main tenancy agreement
 * - Blank inventory template (ready for manual completion)
 * - Jurisdiction-specific pre-tenancy compliance checklist
 */
export async function generateStandardAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = '1 month';
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-STD-${Date.now()}`;

  // Add metadata flags
  const enrichedData = {
    ...data,
    premium: false,
    is_hmo: false,
    product_tier: data.product_tier || `Standard ${config.agreementTitle}`,
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    // Flag for inventory: standard tier always uses blank inventory
    inventory_wizard_completed: false,
    current_date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  // STANDARD PRODUCT: Agreement + Blank Inventory + Compliance Checklist
  // Integration Layer: Always includes inventory and checklist
  const templatePaths = [
    config.templatePaths.standard,
    config.templatePaths.inventoryBlank, // Blank inventory for manual completion
    config.templatePaths.complianceChecklist, // Jurisdiction-specific checklist
  ];

  // Compile and merge all templates
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);

  // Generate PDF from merged HTML
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: `${jurisdiction}_standard_tenancy`,
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
      jurisdiction,
      inventoryIncluded: true,
      inventoryType: 'blank',
      complianceChecklistIncluded: true,
    },
  };
}

/**
 * Generate a premium HMO tenancy agreement with wizard-completed inventory and compliance checklist
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * INTEGRATION LAYER: Premium tier includes:
 * - HMO-specific tenancy agreement
 * - Wizard-completed inventory (if data provided) OR blank inventory (fallback)
 * - Jurisdiction-specific pre-tenancy compliance checklist
 *
 * HMO clauses cover: multiple occupants, joint liability, shared facilities,
 * fire safety, licensing acknowledgement, house rules, occupancy limits.
 *
 * Jurisdiction handling:
 * - England/Wales: HMO clauses aligned with Housing Act 2004
 * - Scotland: Adapted to PRT framework
 * - NI: Only includes HMO clauses where legally permitted
 */
export async function generatePremiumAST(
  data: ASTData,
  isPreview = false
): Promise<GeneratedDocument> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  if (!data.rent_period) {
    data.rent_period = 'month';
  }

  if (!data.tenant_notice_period) {
    data.tenant_notice_period = '1 month';
  }

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-HMO-${Date.now()}`;

  // Check if inventory data was provided via wizard
  const hasInventoryData = data.inventory_attached || data.inventory_provided || false;

  // Add metadata flags for HMO premium
  const enrichedData = {
    ...data,
    premium: true,
    is_hmo: true,
    product_tier: data.product_tier || `HMO ${config.agreementTitle}`,
    generation_timestamp: data.generation_timestamp || generationTimestamp,
    document_id: data.document_id || documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    // Flag for inventory: premium tier uses wizard-completed if data exists
    inventory_wizard_completed: hasInventoryData,
    current_date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  // PREMIUM PRODUCT: HMO Agreement + Inventory (wizard or blank fallback) + Compliance Checklist
  // Integration Layer: Always includes inventory and checklist
  const templatePaths = [
    config.templatePaths.premium,
    // Use wizard-completed inventory if data exists, otherwise blank template
    hasInventoryData ? config.templatePaths.inventory : config.templatePaths.inventoryBlank,
    config.templatePaths.complianceChecklist, // Jurisdiction-specific checklist
  ];

  // Compile and merge all templates
  const mergedHtml = await compileAndMergeTemplates(templatePaths, enrichedData);

  // Generate PDF from merged HTML
  const pdf = await htmlToPdf(mergedHtml);

  return {
    html: mergedHtml,
    pdf,
    metadata: {
      templateUsed: `${jurisdiction}_hmo_tenancy`,
      generatedAt: new Date().toISOString(),
      documentId,
      isPreview,
      jurisdiction,
      inventoryIncluded: true,
      inventoryType: hasInventoryData ? 'wizard-completed' : 'blank',
      complianceChecklistIncluded: true,
    },
  };
}

// ============================================================================
// UNIFIED GENERATOR (Enforces 2-Variant Rule)
// ============================================================================

/**
 * Generate a tenancy agreement by tier (standard or premium)
 *
 * This is the PREFERRED entry point for generating tenancy agreements.
 * It enforces the 2-variant rule:
 * - Standard: Base agreement, NO HMO clauses
 * - Premium: HMO-specific agreement with multi-occupancy clauses
 *
 * @param data - Tenancy data
 * @param tier - 'standard' or 'premium' (NO other values allowed)
 * @param isPreview - Whether to generate a preview
 * @returns Generated document
 *
 * @example
 * // Generate standard agreement
 * const doc = await generateTenancyAgreement(data, 'standard');
 *
 * // Generate HMO agreement
 * const doc = await generateTenancyAgreement(data, 'premium');
 */
// Runtime self-check flag to avoid repeated checks
let _runtimeSelfCheckDone = false;

export async function generateTenancyAgreement(
  data: ASTData,
  tier: TenancyTier,
  isPreview = false
): Promise<GeneratedDocument> {
  // RUNTIME GUARDRAIL: Validate tier is exactly 'standard' or 'premium'
  validateTenancyTier(tier);

  // RUNTIME SELF-CHECK: On first generation, validate all invariants
  // Logs warning in production if invariants fail, but throws when generating
  if (!_runtimeSelfCheckDone) {
    _runtimeSelfCheckDone = true;
    try {
      const configDir = path.join(process.cwd(), 'config/jurisdictions');
      const selfCheckResult = runtimeTenancyVariantsSelfCheck(configDir);

      // If self-check fails, throw to prevent generating invalid documents
      if (!selfCheckResult.valid) {
        throw new Error(
          `Tenancy variant invariants failed during generation. ` +
          `Errors: ${selfCheckResult.errors.join('; ')}`
        );
      }
    } catch (err) {
      // Log but continue - the individual generator functions have their own validation
      console.error('[AST Generator] Runtime self-check error:', err);
    }
  }

  // Route to correct generator based on tier
  if (tier === 'standard') {
    // RUNTIME GUARDRAIL: Ensure is_hmo is not accidentally set for standard
    if ((data as any).is_hmo === true) {
      console.warn(
        '[AST Generator] WARNING: is_hmo=true provided for standard tier. ' +
        'This will be overridden to false. Use "premium" tier for HMO properties.'
      );
    }
    return generateStandardAST(data, isPreview);
  }

  // Premium tier
  return generatePremiumAST(data, isPreview);
}

/**
 * Get the correct template path for a jurisdiction and tier
 * This is a helper for external code that needs to know which template will be used.
 */
export function getTemplatePath(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): string {
  validateTenancyTier(tier);
  const config = getJurisdictionConfig(jurisdiction);
  return tier === 'standard' ? config.templatePaths.standard : config.templatePaths.premium;
}

/**
 * Get the document key for a jurisdiction and tier
 * This matches the keys used in pack-contents.ts
 */
export function getDocumentKey(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): string {
  validateTenancyTier(tier);
  const config = getJurisdictionConfig(jurisdiction);

  // Document keys by jurisdiction and tier
  const keyMap: Record<TenancyJurisdiction, Record<TenancyTier, string>> = {
    england: { standard: 'ast_agreement', premium: 'ast_agreement_hmo' },
    wales: { standard: 'soc_agreement', premium: 'soc_agreement_hmo' },
    scotland: { standard: 'prt_agreement', premium: 'prt_agreement_hmo' },
    'northern-ireland': { standard: 'private_tenancy_agreement', premium: 'private_tenancy_agreement_hmo' },
  };

  return keyMap[jurisdiction][tier];
}

// ============================================================================
// UNBUNDLED DOCUMENT GENERATION (Separate PDFs)
// ============================================================================

export interface ASTPackDocument {
  title: string;
  description: string;
  category: 'agreement' | 'schedule' | 'checklist' | 'guidance';
  /** Canonical document type key matching pack-contents (e.g., 'ast_agreement', 'terms_schedule') */
  document_type: string;
  html: string;
  pdf?: Buffer;
  file_name: string;
}

export interface ASTDocumentPack {
  case_id: string;
  tier: 'standard' | 'premium';
  generated_at: string;
  documents: ASTPackDocument[];
}

/**
 * Generate Standard tenancy agreement as separate documents (unbundled)
 * Jurisdiction-aware: uses correct templates and document_type for each UK jurisdiction
 *
 * IMPORTANT: Base product includes ONLY the tenancy agreement document.
 * No guides, no notices, no annexes, no explanatory PDFs.
 */
export async function generateStandardASTDocuments(
  data: ASTData,
  caseId?: string
): Promise<ASTDocumentPack> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  console.log(`[AST Generator] Using jurisdiction: ${jurisdiction} (${config.legalFramework})`);

  // Set defaults
  if (!data.rent_period) data.rent_period = 'month';
  if (!data.tenant_notice_period) data.tenant_notice_period = '1 month';

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-STD-${Date.now()}`;

  const enrichedData = {
    ...data,
    premium: false,
    is_hmo: false,
    product_tier: data.product_tier || `Standard ${config.agreementTitle}`,
    generation_timestamp: generationTimestamp,
    document_id: documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    current_date: new Date().toISOString().split('T')[0],
  };

  const documents: ASTPackDocument[] = [];

  // Import generateDocument for individual templates
  const { generateDocument } = await import('./generator');

  // DOCUMENT 1: Main Agreement
  try {
    const agreementDoc = await generateDocument({
      templatePath: config.templatePaths.standard,
      data: enrichedData,
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: config.agreementTitle,
      description: config.agreementDescription,
      category: 'agreement',
      document_type: config.agreementDocumentType, // jurisdiction-specific key
      html: agreementDoc.html,
      pdf: agreementDoc.pdf,
      file_name: 'tenancy_agreement.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate ${config.agreementTitle}:`, err);
    throw err;
  }

  // DOCUMENT 2: Standalone Inventory & Schedule of Condition (blank template for standard tier)
  try {
    const inventoryDoc = await generateDocument({
      templatePath: config.templatePaths.inventoryStandalone,
      data: {
        ...enrichedData,
        // Standard tier always uses blank template (no wizard data)
        inventory: null,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: 'Inventory & Schedule of Condition',
      description: 'Blank inventory template for manual completion at check-in',
      category: 'schedule',
      document_type: config.inventoryDocumentType,
      html: inventoryDoc.html,
      pdf: inventoryDoc.pdf,
      file_name: 'inventory_schedule.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate inventory schedule:`, err);
    // Don't throw - inventory should never block generation
    console.warn(`[AST Generator] Inventory generation failed but continuing without it`);
  }

  // DOCUMENT 3: Standalone Pre-Tenancy Compliance Checklist
  try {
    const checklistDoc = await generateDocument({
      templatePath: config.templatePaths.complianceChecklistStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: `Pre-Tenancy Compliance Checklist (${config.jurisdictionLabel})`,
      description: `Non-contractual guidance for landlord compliance in ${config.jurisdictionLabel}`,
      category: 'checklist',
      document_type: config.checklistDocumentType,
      html: checklistDoc.html,
      pdf: checklistDoc.pdf,
      file_name: 'compliance_checklist.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate compliance checklist:`, err);
    // Don't throw - checklist should never block generation
    console.warn(`[AST Generator] Checklist generation failed but continuing without it`);
  }

  console.log(`✅ Generated ${documents.length} documents for ${config.jurisdictionLabel} Standard pack`);

  return {
    case_id: caseId || documentId,
    tier: 'standard',
    generated_at: generationTimestamp,
    documents,
  };
}

/**
 * Generate Premium HMO tenancy agreement as separate documents (unbundled)
 * Jurisdiction-aware: uses correct templates for each UK jurisdiction
 *
 * PREMIUM PRODUCT includes 3 documents:
 * 1. HMO-specific tenancy agreement (multi-occupancy clauses)
 * 2. Inventory & Schedule of Condition (wizard-completed if data available, blank otherwise)
 * 3. Pre-Tenancy Compliance Checklist (jurisdiction-specific)
 *
 * HMO clauses cover: multiple occupants, joint liability, shared facilities,
 * fire safety, licensing acknowledgement, house rules, occupancy limits.
 */
export async function generatePremiumASTDocuments(
  data: ASTData,
  caseId?: string
): Promise<ASTDocumentPack> {
  const errors = validateASTData(data);
  if (errors.length > 0) {
    throw new Error(`AST validation failed:\n${errors.join('\n')}`);
  }

  // Detect jurisdiction and get configuration
  const jurisdiction = detectJurisdiction(data);
  const config = getJurisdictionConfig(jurisdiction);

  console.log(`[AST Generator] Using jurisdiction: ${jurisdiction} (${config.legalFramework}) - HMO Premium`);

  // Set defaults
  if (!data.rent_period) data.rent_period = 'month';
  if (!data.tenant_notice_period) data.tenant_notice_period = '1 month';

  const generationTimestamp = new Date().toISOString();
  const documentId = `${jurisdiction.toUpperCase()}-HMO-${Date.now()}`;

  // Check if wizard-completed inventory data is available
  const hasInventoryData = data.inventory_attached || data.inventory_provided || false;

  const enrichedData = {
    ...data,
    premium: true,
    is_hmo: true,
    product_tier: `HMO ${config.agreementTitle}`,
    generation_timestamp: generationTimestamp,
    document_id: documentId,
    jurisdiction_name: config.jurisdictionLabel,
    jurisdiction: jurisdiction,
    legal_framework: config.legalFramework,
    current_date: new Date().toISOString().split('T')[0],
    // Flag for inventory template to know if wizard data is present
    inventory_wizard_completed: hasInventoryData,
  };

  const documents: ASTPackDocument[] = [];

  const { generateDocument } = await import('./generator');

  // DOCUMENT 1: HMO-specific tenancy agreement
  // Includes HMO-specific clauses for multi-occupancy properties
  try {
    const agreementDoc = await generateDocument({
      templatePath: config.templatePaths.premium,
      data: enrichedData,
      isPreview: false,
      outputFormat: 'both',
    });

    // Get HMO-specific document type key
    const hmoDocumentType = config.agreementDocumentType + '_hmo';

    documents.push({
      title: `HMO ${config.agreementTitle}`,
      description: `Includes HMO-specific clauses for multi-occupancy properties. Compliant with ${config.legalFramework}.`,
      category: 'agreement',
      document_type: hmoDocumentType,
      html: agreementDoc.html,
      pdf: agreementDoc.pdf,
      file_name: 'tenancy_agreement_hmo.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate HMO ${config.agreementTitle}:`, err);
    throw err;
  }

  // DOCUMENT 2: Standalone Inventory & Schedule of Condition
  // Premium tier: Uses wizard-completed data if available, otherwise blank template
  try {
    const inventoryDoc = await generateDocument({
      templatePath: config.templatePaths.inventoryStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });

    const inventoryDescription = hasInventoryData
      ? 'Wizard-completed inventory with property condition details'
      : 'Blank inventory template for manual completion at check-in';

    documents.push({
      title: 'Inventory & Schedule of Condition',
      description: inventoryDescription,
      category: 'schedule',
      document_type: config.inventoryDocumentType,
      html: inventoryDoc.html,
      pdf: inventoryDoc.pdf,
      file_name: 'inventory_schedule.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate inventory schedule:`, err);
    // Don't throw - inventory should never block generation
    console.warn(`[AST Generator] Inventory generation failed but continuing without it`);
  }

  // DOCUMENT 3: Standalone Pre-Tenancy Compliance Checklist
  try {
    const checklistDoc = await generateDocument({
      templatePath: config.templatePaths.complianceChecklistStandalone,
      data: {
        ...enrichedData,
        case_id: caseId || documentId,
        timestamp: Date.now(),
      },
      isPreview: false,
      outputFormat: 'both',
    });
    documents.push({
      title: `Pre-Tenancy Compliance Checklist (${config.jurisdictionLabel})`,
      description: `Non-contractual guidance for landlord compliance in ${config.jurisdictionLabel}`,
      category: 'checklist',
      document_type: config.checklistDocumentType,
      html: checklistDoc.html,
      pdf: checklistDoc.pdf,
      file_name: 'compliance_checklist.pdf',
    });
  } catch (err) {
    console.error(`Failed to generate compliance checklist:`, err);
    // Don't throw - checklist should never block generation
    console.warn(`[AST Generator] Checklist generation failed but continuing without it`);
  }

  console.log(`✅ Generated ${documents.length} documents for ${config.jurisdictionLabel} HMO Premium pack`);

  return {
    case_id: caseId || documentId,
    tier: 'premium',
    generated_at: generationTimestamp,
    documents,
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
