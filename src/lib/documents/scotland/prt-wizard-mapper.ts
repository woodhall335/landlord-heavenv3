/**
 * Scotland PRT Wizard Mapper
 *
 * This mapper follows the WizardFacts → CaseFacts pattern.
 * WizardFacts comes from case_facts.facts; we convert to CaseFacts for domain logic
 * and still read some jurisdiction-specific fields directly from WizardFacts
 * until CaseFacts is extended.
 */

import { PRTData, TenantInfo } from './prt-generator';
import type { WizardFacts, CaseFacts } from '@/lib/case-facts/schema';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

function getValueAtPath(facts: WizardFacts, path: string): any {
  return facts[path] ?? null;
}

function coerceBoolean(value: any): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === 'no') return false;
  }
  if (typeof value === 'number') return value > 0;
  return Boolean(value);
}

function normalizeTenants(caseFacts: CaseFacts, wizardFacts: WizardFacts): TenantInfo[] {
  // Use CaseFacts tenants array if available
  const tenants = caseFacts.parties.tenants;

  return tenants.map((t, index) => ({
    number: index + 1,
    full_name: t.name || '',
    // TODO: dob not yet in CaseFacts PartyDetails - read from WizardFacts
    dob: getValueAtPath(wizardFacts, `tenants.${index}.dob`) || '',
    email: t.email || '',
    phone: t.phone || '',
  }));
}

function buildAddress(
  primary: string | undefined,
  line1?: string,
  town?: string,
  postcode?: string
): string {
  if (primary && primary.trim().length > 0) return primary.trim();

  const parts = [line1, town, postcode].filter(Boolean);
  return parts.join(', ');
}

function mapRentPeriod(
  value:
    | 'weekly'
    | 'fortnightly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'other'
    | null
    | undefined
): PRTData['rent_period'] {
  if (!value) return 'month';

  if (value === 'fortnightly') return 'week'; // map to weekly for PRT template
  if (value === 'quarterly') return 'month'; // map to monthly equivalent

  if (value === 'weekly') return 'week';
  if (value === 'monthly') return 'month';
  if (value === 'yearly') return 'year';

  return 'month';
}

function normalizeDepositScheme(value: string | undefined): PRTData['deposit_scheme_name'] | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('safedeposits')) return 'SafeDeposits Scotland';
  if (normalized.includes('mydeposits')) return 'MyDeposits Scotland';
  if (normalized.includes('letting protection') || normalized.includes('lps')) return 'Letting Protection Service Scotland';
  return undefined;
}

function normalizeApprovedPets(value: any): string | undefined {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  return undefined;
}

export function mapWizardToPRTData(wizardFacts: WizardFacts): PRTData {
  // Convert flat WizardFacts to nested CaseFacts for core domain logic
  const caseFacts: CaseFacts = wizardFactsToCaseFacts(wizardFacts);

  const tenants = normalizeTenants(caseFacts, wizardFacts);
  const number_of_tenants = Number(getValueAtPath(wizardFacts, 'number_of_tenants') ?? tenants.length ?? 0);

  // Build addresses from CaseFacts
  const property_address = buildAddress(
    getValueAtPath(wizardFacts, 'property_address'), // Fallback to flat address if present
    caseFacts.property.address_line1 || undefined,
    caseFacts.property.city || undefined,
    caseFacts.property.postcode || undefined
  );

  const landlord_address = buildAddress(
    getValueAtPath(wizardFacts, 'landlord_address'), // Fallback to flat address if present
    caseFacts.parties.landlord.address_line1 || undefined,
    caseFacts.parties.landlord.city || undefined,
    caseFacts.parties.landlord.postcode || undefined
  );

  const data: PRTData = {
    // TODO: agreement_date not yet in CaseFacts - read from WizardFacts
    agreement_date: getValueAtPath(wizardFacts, 'agreement_date') || caseFacts.tenancy.start_date || '',

    // Landlord - use CaseFacts for core fields
    landlord_full_name: caseFacts.parties.landlord.name || '',
    // TODO: landlord_2_name, landlord_reg_number, registration_authority, registration_expiry are Scotland-specific
    landlord_2_name: getValueAtPath(wizardFacts, 'landlord_2_name') ?? undefined,
    landlord_address,
    landlord_address_line1: caseFacts.parties.landlord.address_line1 ?? undefined,
    landlord_address_town: caseFacts.parties.landlord.city ?? undefined,
    landlord_address_postcode: caseFacts.parties.landlord.postcode ?? undefined,
    landlord_email: caseFacts.parties.landlord.email || '',
    landlord_phone: caseFacts.parties.landlord.phone || '',
    landlord_reg_number: getValueAtPath(wizardFacts, 'landlord_reg_number') ?? undefined,
    registration_authority: getValueAtPath(wizardFacts, 'registration_authority') ?? undefined,
    registration_expiry: getValueAtPath(wizardFacts, 'registration_expiry') ?? undefined,

    // Agent - use CaseFacts for core fields
    agent_name: caseFacts.parties.agent.name ?? undefined,
    // TODO: agent_address (flat string) not yet in CaseFacts - build from components or read from WizardFacts
    agent_address: getValueAtPath(wizardFacts, 'agent_address') || buildAddress(
      undefined,
      caseFacts.parties.agent.address_line1 || undefined,
      caseFacts.parties.agent.city || undefined,
      caseFacts.parties.agent.postcode || undefined
    ),
    agent_email: caseFacts.parties.agent.email ?? undefined,
    agent_phone: caseFacts.parties.agent.phone ?? undefined,
    // TODO: agent_reg_number, agent_signs are Scotland-specific
    agent_reg_number: getValueAtPath(wizardFacts, 'agent_reg_number'),
    agent_signs: coerceBoolean(getValueAtPath(wizardFacts, 'agent_signs')),

    // Tenants
    tenants,
    number_of_tenants,
    multiple_tenants: tenants.length > 1,

    // Property - use CaseFacts for core fields
    property_address,
    property_address_line1: caseFacts.property.address_line1 ?? undefined,
    property_address_town: caseFacts.property.city ?? undefined,
    property_address_postcode: caseFacts.property.postcode ?? undefined,
    // TODO: property_type, number_of_bedrooms, furnished_status, etc. not yet in CaseFacts
    property_type: getValueAtPath(wizardFacts, 'property_type'),
    number_of_bedrooms: getValueAtPath(wizardFacts, 'number_of_bedrooms')?.toString(),
    furnished_status: getValueAtPath(wizardFacts, 'furnished_status'),
    property_description: getValueAtPath(wizardFacts, 'property_description'),
    included_areas: getValueAtPath(wizardFacts, 'included_areas'),
    excluded_areas: getValueAtPath(wizardFacts, 'excluded_areas'),
    parking_available: coerceBoolean(getValueAtPath(wizardFacts, 'parking_available')),
    parking_details: getValueAtPath(wizardFacts, 'parking_details'),
    has_garden: coerceBoolean(getValueAtPath(wizardFacts, 'has_garden')),
    garden_maintenance: getValueAtPath(wizardFacts, 'garden_maintenance'),
    council_tax_band: getValueAtPath(wizardFacts, 'council_tax_band'),

    // Term - use CaseFacts for core fields
    tenancy_start_date: caseFacts.tenancy.start_date || '',
    is_fixed_term: false, // Always false for PRTs

    // Rent - use CaseFacts for core fields
    rent_amount: caseFacts.tenancy.rent_amount ?? 0,
    rent_period: mapRentPeriod(caseFacts.tenancy.rent_frequency),
    rent_due_day: caseFacts.tenancy.rent_due_day?.toString() || '1st',
    // TODO: payment_method, payment_details, bank details not yet in CaseFacts
    payment_method: getValueAtPath(wizardFacts, 'payment_method') || '',
    payment_details: getValueAtPath(wizardFacts, 'payment_details') || '',
    bank_account_name: getValueAtPath(wizardFacts, 'bank_account_name'),
    bank_sort_code: getValueAtPath(wizardFacts, 'bank_sort_code'),
    bank_account_number: getValueAtPath(wizardFacts, 'bank_account_number'),
    first_payment: Number(getValueAtPath(wizardFacts, 'first_payment')),
    first_payment_date: getValueAtPath(wizardFacts, 'first_payment_date'),
    rent_includes: getValueAtPath(wizardFacts, 'rent_includes'),
    rent_excludes: getValueAtPath(wizardFacts, 'rent_excludes'),

    // Deposit - use CaseFacts for core fields
    deposit_amount: caseFacts.tenancy.deposit_amount ?? 0,
    // TODO: deposit_scheme (flat field) not yet in CaseFacts
    deposit_scheme: getValueAtPath(wizardFacts, 'deposit_scheme'),
    deposit_scheme_name: normalizeDepositScheme(caseFacts.tenancy.deposit_scheme_name || getValueAtPath(wizardFacts, 'deposit_scheme_name')),

    // Bills & Utilities - TODO: not yet in CaseFacts
    council_tax_responsibility: getValueAtPath(wizardFacts, 'council_tax_responsibility'),
    utilities_responsibility: getValueAtPath(wizardFacts, 'utilities_responsibility'),
    internet_responsibility: getValueAtPath(wizardFacts, 'internet_responsibility'),

    // Inventory - TODO: not yet in CaseFacts
    inventory_attached: coerceBoolean(getValueAtPath(wizardFacts, 'inventory_attached')),
    inventory_provided: coerceBoolean(getValueAtPath(wizardFacts, 'inventory_provided')),
    inventory_items: getValueAtPath(wizardFacts, 'inventory_items'),
    professional_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'professional_cleaning_required')),
    decoration_condition: getValueAtPath(wizardFacts, 'decoration_condition'),

    // Property features & rules - TODO: not yet in CaseFacts
    pets_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'pets_allowed')),
    approved_pets: normalizeApprovedPets(getValueAtPath(wizardFacts, 'approved_pets')),
    smoking_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'smoking_allowed')),

    // Guarantor (Premium) - TODO: not yet in CaseFacts
    guarantor_name: getValueAtPath(wizardFacts, 'guarantor_name'),
    guarantor_address: getValueAtPath(wizardFacts, 'guarantor_address'),
    guarantor_email: getValueAtPath(wizardFacts, 'guarantor_email'),
    guarantor_phone: getValueAtPath(wizardFacts, 'guarantor_phone'),
    guarantor_dob: getValueAtPath(wizardFacts, 'guarantor_dob'),
    guarantor_relationship: getValueAtPath(wizardFacts, 'guarantor_relationship'),
    guarantor_required: coerceBoolean(getValueAtPath(wizardFacts, 'guarantor_required')),

    // Joint and Several Liability (Premium)
    joint_and_several_liability: coerceBoolean(getValueAtPath(wizardFacts, 'joint_and_several_liability')) ?? tenants.length > 1,

    // Legal Compliance & Safety - boolean flags
    gas_safety_certificate: coerceBoolean(getValueAtPath(wizardFacts, 'gas_safety_certificate')),
    epc_rating: getValueAtPath(wizardFacts, 'epc_rating'),
    electrical_safety_certificate: coerceBoolean(getValueAtPath(wizardFacts, 'electrical_safety_certificate')),
    smoke_alarms_fitted: coerceBoolean(getValueAtPath(wizardFacts, 'smoke_alarms_fitted')),
    carbon_monoxide_alarms: coerceBoolean(getValueAtPath(wizardFacts, 'carbon_monoxide_alarms')),
    repairing_standard_statement: coerceBoolean(getValueAtPath(wizardFacts, 'repairing_standard_compliance')),

    // Safety Certificate Dates - for compliance verification
    gas_safety_certificate_date: getValueAtPath(wizardFacts, 'gas_safety_certificate_date'),
    gas_safety_certificate_expiry: getValueAtPath(wizardFacts, 'gas_safety_certificate_expiry'),
    epc_certificate_date: getValueAtPath(wizardFacts, 'epc_certificate_date'),
    eicr_certificate_date: getValueAtPath(wizardFacts, 'eicr_certificate_date'),
    eicr_next_inspection_date: getValueAtPath(wizardFacts, 'eicr_next_inspection_date'),
    smoke_alarm_test_date: getValueAtPath(wizardFacts, 'smoke_alarm_test_date'),

    // Deposit Compliance Dates - 30 WORKING DAYS requirement
    deposit_paid_date: getValueAtPath(wizardFacts, 'deposit_paid_date'),
    deposit_protection_date: getValueAtPath(wizardFacts, 'deposit_protection_date'),
    prescribed_information_date: getValueAtPath(wizardFacts, 'prescribed_information_date'),

    // Maintenance & Repairs
    landlord_maintenance_responsibilities: getValueAtPath(wizardFacts, 'landlord_maintenance_responsibilities'),
    repairs_reporting_method: getValueAtPath(wizardFacts, 'repairs_reporting_method'),
    emergency_contact: getValueAtPath(wizardFacts, 'emergency_contact'),

    // Tenancy Terms & Conditions - TODO: not yet in CaseFacts
    subletting_allowed: getValueAtPath(wizardFacts, 'subletting_allowed'),
    rent_increase_frequency: getValueAtPath(wizardFacts, 'rent_increase_frequency'),
    tenant_notice_period: getValueAtPath(wizardFacts, 'tenant_notice_period') || '28 days',
    additional_terms: getValueAtPath(wizardFacts, 'additional_terms'),

    // Insurance & Liability - TODO: not yet in CaseFacts
    landlord_insurance: coerceBoolean(getValueAtPath(wizardFacts, 'landlord_insurance')),
    tenant_insurance_required: getValueAtPath(wizardFacts, 'tenant_insurance_required'),

    // Access & Viewings - TODO: not yet in CaseFacts
    landlord_access_notice: getValueAtPath(wizardFacts, 'landlord_access_notice'),
    inspection_frequency: getValueAtPath(wizardFacts, 'inspection_frequency'),

    // Additional Terms - TODO: not yet in CaseFacts
    white_goods_included: getValueAtPath(wizardFacts, 'white_goods_included'),
    communal_areas: coerceBoolean(getValueAtPath(wizardFacts, 'communal_areas')),
    communal_cleaning: getValueAtPath(wizardFacts, 'communal_cleaning'),
    recycling_bins: coerceBoolean(getValueAtPath(wizardFacts, 'recycling_bins')),

    // Notification - TODO: not yet in CaseFacts
    absence_notification_days: Number(getValueAtPath(wizardFacts, 'absence_notification_days')) || 28,

    // Premium Enhanced Features - HMO - use CaseFacts for is_hmo
    is_hmo: caseFacts.property.is_hmo ?? undefined,
    // TODO: hmo_licence_* fields not yet in CaseFacts
    hmo_licence_status: getValueAtPath(wizardFacts, 'hmo_licence_status'),
    hmo_licence_number: getValueAtPath(wizardFacts, 'hmo_licence_number'),
    hmo_licence_expiry: getValueAtPath(wizardFacts, 'hmo_licence_expiry'),
    number_of_sharers: Number(getValueAtPath(wizardFacts, 'number_of_sharers')),

    // Premium Enhanced Features - Meter Readings - TODO: not yet in CaseFacts
    meter_reading_gas: getValueAtPath(wizardFacts, 'meter_reading_gas'),
    meter_reading_electric: getValueAtPath(wizardFacts, 'meter_reading_electric'),
    meter_reading_water: getValueAtPath(wizardFacts, 'meter_reading_water'),
    utility_transfer_responsibility: getValueAtPath(wizardFacts, 'utility_transfer_responsibility'),

    // Premium Enhanced Features - Late Payment Interest - TODO: not yet in CaseFacts
    late_payment_interest_applicable: coerceBoolean(getValueAtPath(wizardFacts, 'late_payment_interest_applicable')),
    late_payment_interest_rate: Number(getValueAtPath(wizardFacts, 'late_payment_interest_rate')),
    grace_period_days: Number(getValueAtPath(wizardFacts, 'grace_period_days')),
    late_payment_admin_fee: Number(getValueAtPath(wizardFacts, 'late_payment_admin_fee')),

    // Premium Enhanced Features - Key Schedule - TODO: not yet in CaseFacts
    number_of_front_door_keys: Number(getValueAtPath(wizardFacts, 'number_of_front_door_keys')),
    number_of_back_door_keys: Number(getValueAtPath(wizardFacts, 'number_of_back_door_keys')),
    number_of_window_keys: Number(getValueAtPath(wizardFacts, 'number_of_window_keys')),
    number_of_mailbox_keys: Number(getValueAtPath(wizardFacts, 'number_of_mailbox_keys')),
    access_cards_fobs: Number(getValueAtPath(wizardFacts, 'access_cards_fobs')),
    key_replacement_cost: Number(getValueAtPath(wizardFacts, 'key_replacement_cost')),
    other_keys_notes: getValueAtPath(wizardFacts, 'other_keys_notes'),

    // Premium Enhanced Features - Contractor Access - TODO: not yet in CaseFacts
    contractor_access_notice_period: getValueAtPath(wizardFacts, 'contractor_access_notice_period'),
    emergency_access_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'emergency_access_allowed')),
    contractor_access_hours: getValueAtPath(wizardFacts, 'contractor_access_hours'),
    tenant_presence_required: coerceBoolean(getValueAtPath(wizardFacts, 'tenant_presence_required')),

    // Premium Enhanced Features - Emergency Procedures - TODO: not yet in CaseFacts
    emergency_landlord_phone: getValueAtPath(wizardFacts, 'emergency_landlord_phone'),
    emergency_plumber_phone: getValueAtPath(wizardFacts, 'emergency_plumber_phone'),
    emergency_electrician_phone: getValueAtPath(wizardFacts, 'emergency_electrician_phone'),
    emergency_gas_engineer_phone: getValueAtPath(wizardFacts, 'emergency_gas_engineer_phone'),
    emergency_locksmith_phone: getValueAtPath(wizardFacts, 'emergency_locksmith_phone'),
    water_shutoff_location: getValueAtPath(wizardFacts, 'water_shutoff_location'),
    electricity_fuse_box_location: getValueAtPath(wizardFacts, 'electricity_fuse_box_location'),
    gas_shutoff_location: getValueAtPath(wizardFacts, 'gas_shutoff_location'),

    // Premium Enhanced Features - Maintenance Schedule - TODO: not yet in CaseFacts
    boiler_service_frequency: getValueAtPath(wizardFacts, 'boiler_service_frequency'),
    boiler_service_responsibility: getValueAtPath(wizardFacts, 'boiler_service_responsibility'),
    gutter_cleaning_frequency: getValueAtPath(wizardFacts, 'gutter_cleaning_frequency'),
    gutter_cleaning_responsibility: getValueAtPath(wizardFacts, 'gutter_cleaning_responsibility'),
    window_cleaning_frequency: getValueAtPath(wizardFacts, 'window_cleaning_frequency'),
    appliance_maintenance_notes: getValueAtPath(wizardFacts, 'appliance_maintenance_notes'),

    // Premium Enhanced Features - Garden Maintenance - TODO: not yet in CaseFacts
    lawn_mowing_frequency: getValueAtPath(wizardFacts, 'lawn_mowing_frequency'),
    lawn_mowing_responsibility: getValueAtPath(wizardFacts, 'lawn_mowing_responsibility'),
    hedge_trimming_responsibility: getValueAtPath(wizardFacts, 'hedge_trimming_responsibility'),
    weed_control_responsibility: getValueAtPath(wizardFacts, 'weed_control_responsibility'),
    outdoor_furniture_notes: getValueAtPath(wizardFacts, 'outdoor_furniture_notes'),

    // Premium Enhanced Features - Move-In Procedures - TODO: not yet in CaseFacts
    pre_tenancy_meeting_required: coerceBoolean(getValueAtPath(wizardFacts, 'pre_tenancy_meeting_required')),
    move_in_inspection_required: coerceBoolean(getValueAtPath(wizardFacts, 'move_in_inspection_required')),
    photographic_inventory_provided: coerceBoolean(getValueAtPath(wizardFacts, 'photographic_inventory_provided')),
    tenant_handbook_provided: coerceBoolean(getValueAtPath(wizardFacts, 'tenant_handbook_provided')),
    utility_accounts_transfer_deadline: getValueAtPath(wizardFacts, 'utility_accounts_transfer_deadline'),
    council_tax_registration_deadline: getValueAtPath(wizardFacts, 'council_tax_registration_deadline'),

    // Premium Enhanced Features - Move-Out Procedures - TODO: not yet in CaseFacts
    checkout_inspection_required: coerceBoolean(getValueAtPath(wizardFacts, 'checkout_inspection_required')),
    professional_cleaning_standard: coerceBoolean(getValueAtPath(wizardFacts, 'professional_cleaning_standard')),
    carpet_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'carpet_cleaning_required')),
    oven_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'oven_cleaning_required')),
    garden_condition_required: getValueAtPath(wizardFacts, 'garden_condition_required'),
    key_return_deadline: getValueAtPath(wizardFacts, 'key_return_deadline'),
    forwarding_address_required: coerceBoolean(getValueAtPath(wizardFacts, 'forwarding_address_required')),
    deposit_return_timeline: getValueAtPath(wizardFacts, 'deposit_return_timeline'),

    // Premium Enhanced Features - Cleaning Standards - TODO: not yet in CaseFacts
    regular_cleaning_expectations: getValueAtPath(wizardFacts, 'regular_cleaning_expectations'),
    deep_cleaning_areas: getValueAtPath(wizardFacts, 'deep_cleaning_areas'),
    cleaning_checklist_provided: coerceBoolean(getValueAtPath(wizardFacts, 'cleaning_checklist_provided')),
    cleaning_cost_estimates: Number(getValueAtPath(wizardFacts, 'cleaning_cost_estimates')),

    // Generation metadata - use CaseFacts.meta
    product_tier: caseFacts.meta.product_tier || getValueAtPath(wizardFacts, 'tenancy_tier'),
    additional_schedules: getValueAtPath(wizardFacts, 'additional_schedules'),
  };

  return data;
}
