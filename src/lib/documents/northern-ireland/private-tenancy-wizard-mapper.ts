import { PrivateTenancyData, LandlordDetails, AgentDetails, TenantDetails } from './private-tenancy-generator';

type AnyRecord = Record<string, any>;

function getValueAtPath(facts: AnyRecord, path: string): any {
  return path
    .split('.')
    .filter(Boolean)
    .reduce((acc: any, key) => {
      if (acc === undefined || acc === null) return undefined;
      const resolvedKey = Number.isInteger(Number(key)) ? Number(key) : key;
      return acc[resolvedKey as keyof typeof acc];
    }, facts);
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

function normalizeTenants(rawTenants: any): TenantDetails[] {
  if (!rawTenants) return [];

  if (Array.isArray(rawTenants)) {
    return rawTenants
      .filter((t) => t && (t.full_name || t.email || t.dob || t.phone))
      .map((t) => ({
        full_name: t.full_name || '',
        dob: t.dob || '',
        email: t.email || '',
        phone: t.phone || '',
      }));
  }

  const entries = Object.entries(rawTenants)
    .filter(([key]) => !Number.isNaN(Number(key)))
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, value]) => value as AnyRecord);

  return entries
    .filter((t) => t && (t.full_name || t.email || t.dob || t.phone))
    .map((t) => ({
      full_name: t.full_name || '',
      dob: t.dob || '',
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

function mapRentPeriod(value: string | undefined): PrivateTenancyData['rent_period'] {
  if (!value) return 'month';
  const normalized = value.toLowerCase();
  if (normalized.includes('month')) return 'month';
  if (normalized.includes('week')) return 'week';
  return 'month';
}

function normalizeDepositScheme(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('tds')) return 'TDS Northern Ireland';
  if (normalized.includes('mydeposits')) return 'MyDeposits Northern Ireland';
  return value;
}

function normalizeApprovedPets(value: any): string | undefined {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  return undefined;
}

export function mapWizardToPrivateTenancyData(facts: AnyRecord): PrivateTenancyData {
  const tenants = normalizeTenants(getValueAtPath(facts, 'tenants'));
  const number_of_tenants = Number(getValueAtPath(facts, 'number_of_tenants') ?? tenants.length ?? 0);

  const property_address = buildAddress(
    getValueAtPath(facts, 'property_address'),
    getValueAtPath(facts, 'property_address_line1'),
    getValueAtPath(facts, 'property_address_town'),
    getValueAtPath(facts, 'property_address_postcode')
  );

  const landlord_address = buildAddress(
    getValueAtPath(facts, 'landlord_address'),
    getValueAtPath(facts, 'landlord_address_line1'),
    getValueAtPath(facts, 'landlord_address_town'),
    getValueAtPath(facts, 'landlord_address_postcode')
  );

  const landlord_full_name = getValueAtPath(facts, 'landlord_full_name') || '';
  const landlord_email = getValueAtPath(facts, 'landlord_email') || '';
  const landlord_phone = getValueAtPath(facts, 'landlord_phone') || '';

  const landlord: LandlordDetails = {
    full_name: landlord_full_name,
    address: landlord_address,
    email: landlord_email,
    phone: landlord_phone,
  };

  // Agent details (optional)
  let agent: AgentDetails | undefined = undefined;
  const agent_name = getValueAtPath(facts, 'agent_name');
  if (agent_name) {
    agent = {
      name: agent_name,
      company: getValueAtPath(facts, 'agent_company'),
      address: getValueAtPath(facts, 'agent_address') || '',
      email: getValueAtPath(facts, 'agent_email'),
      phone: getValueAtPath(facts, 'agent_phone'),
      signs: coerceBoolean(getValueAtPath(facts, 'agent_signs')),
    };
  }

  const data: PrivateTenancyData = {
    agreement_date: getValueAtPath(facts, 'agreement_date') || getValueAtPath(facts, 'tenancy_start_date') || '',

    // Landlord (nested structure)
    landlord,
    landlord_full_name,
    landlord_address,
    landlord_email,
    landlord_phone,

    // Agent (nested structure, optional)
    agent,
    agent_name: getValueAtPath(facts, 'agent_name'),
    agent_address: getValueAtPath(facts, 'agent_address'),
    agent_email: getValueAtPath(facts, 'agent_email'),
    agent_phone: getValueAtPath(facts, 'agent_phone'),
    agent_signs: coerceBoolean(getValueAtPath(facts, 'agent_signs')),

    // Tenants
    tenants,
    number_of_tenants,
    multiple_tenants: tenants.length > 1,

    // Property
    property_address,
    property_address_line1: getValueAtPath(facts, 'property_address_line1'),
    property_address_town: getValueAtPath(facts, 'property_address_town'),
    property_address_postcode: getValueAtPath(facts, 'property_address_postcode'),
    property_type: getValueAtPath(facts, 'property_type'),
    number_of_bedrooms: getValueAtPath(facts, 'number_of_bedrooms')?.toString(),
    furnished_status: getValueAtPath(facts, 'furnished_status'),
    property_description: getValueAtPath(facts, 'property_description'),
    included_areas: getValueAtPath(facts, 'included_areas'),
    excluded_areas: getValueAtPath(facts, 'excluded_areas'),
    parking_available: coerceBoolean(getValueAtPath(facts, 'parking_available')),
    parking_details: getValueAtPath(facts, 'parking_details'),
    has_garden: coerceBoolean(getValueAtPath(facts, 'has_garden')),
    garden_maintenance: getValueAtPath(facts, 'garden_maintenance'),

    // Term
    tenancy_start_date: getValueAtPath(facts, 'tenancy_start_date') || '',
    is_fixed_term: coerceBoolean(getValueAtPath(facts, 'is_fixed_term')) ?? false,
    tenancy_end_date: getValueAtPath(facts, 'tenancy_end_date'),
    term_length: getValueAtPath(facts, 'term_length'),
    rent_period: mapRentPeriod(getValueAtPath(facts, 'rent_period')),

    // Rent
    rent_amount: Number(getValueAtPath(facts, 'rent_amount') ?? 0),
    rent_due_day: getValueAtPath(facts, 'rent_due_day') || '1st',
    payment_method: getValueAtPath(facts, 'payment_method') || '',
    payment_details: getValueAtPath(facts, 'payment_details') || '',
    bank_account_name: getValueAtPath(facts, 'bank_account_name'),
    bank_sort_code: getValueAtPath(facts, 'bank_sort_code'),
    bank_account_number: getValueAtPath(facts, 'bank_account_number'),
    first_payment: Number(getValueAtPath(facts, 'first_payment')),
    first_payment_date: getValueAtPath(facts, 'first_payment_date'),
    rent_includes: getValueAtPath(facts, 'rent_includes'),
    rent_excludes: getValueAtPath(facts, 'rent_excludes'),

    // Deposit - NI specific schemes
    deposit_amount: Number(getValueAtPath(facts, 'deposit_amount') ?? 0),
    deposit_scheme: normalizeDepositScheme(getValueAtPath(facts, 'deposit_scheme_name') || getValueAtPath(facts, 'deposit_scheme')),

    // Bills & Utilities
    council_tax_responsibility: getValueAtPath(facts, 'council_tax_responsibility'),
    utilities_responsibility: getValueAtPath(facts, 'utilities_responsibility'),
    internet_responsibility: getValueAtPath(facts, 'internet_responsibility'),

    // Inventory
    inventory_attached: coerceBoolean(getValueAtPath(facts, 'inventory_attached')),
    inventory_provided: coerceBoolean(getValueAtPath(facts, 'inventory_provided')),
    inventory_description: getValueAtPath(facts, 'inventory_description'),
    inventory_items: getValueAtPath(facts, 'inventory_items'),
    professional_cleaning_required: coerceBoolean(getValueAtPath(facts, 'professional_cleaning_required')),
    decoration_condition: getValueAtPath(facts, 'decoration_condition'),

    // Property features & rules
    pets_allowed: coerceBoolean(getValueAtPath(facts, 'pets_allowed')),
    approved_pets: normalizeApprovedPets(getValueAtPath(facts, 'approved_pets')),
    smoking_allowed: coerceBoolean(getValueAtPath(facts, 'smoking_allowed')),

    // Legal Compliance & Safety
    gas_safety_certificate: coerceBoolean(getValueAtPath(facts, 'gas_safety_certificate')),
    epc_rating: getValueAtPath(facts, 'epc_rating'),
    electrical_safety_certificate: coerceBoolean(getValueAtPath(facts, 'electrical_safety_certificate')),
    smoke_alarms_fitted: coerceBoolean(getValueAtPath(facts, 'smoke_alarms_fitted')),
    carbon_monoxide_alarms: coerceBoolean(getValueAtPath(facts, 'carbon_monoxide_alarms')),

    // Maintenance & Repairs
    landlord_maintenance_responsibilities: getValueAtPath(facts, 'landlord_maintenance_responsibilities'),
    repairs_reporting_method: getValueAtPath(facts, 'repairs_reporting_method'),
    emergency_contact: getValueAtPath(facts, 'emergency_contact'),

    // Tenancy Terms & Conditions
    break_clause: coerceBoolean(getValueAtPath(facts, 'break_clause')),
    break_clause_terms: getValueAtPath(facts, 'break_clause_terms'),
    break_clause_months: getValueAtPath(facts, 'break_clause_months'),
    break_clause_notice_period: getValueAtPath(facts, 'break_clause_notice_period'),
    subletting_allowed: getValueAtPath(facts, 'subletting_allowed'),
    rent_increase_clause: coerceBoolean(getValueAtPath(facts, 'rent_increase_clause')),
    rent_increase_frequency: getValueAtPath(facts, 'rent_increase_frequency'),
    tenant_notice_period: getValueAtPath(facts, 'tenant_notice_period') || '28 days',
    additional_terms: getValueAtPath(facts, 'additional_terms'),

    // Insurance & Liability
    landlord_insurance: coerceBoolean(getValueAtPath(facts, 'landlord_insurance')),
    tenant_insurance_required: getValueAtPath(facts, 'tenant_insurance_required'),

    // Access & Viewings
    landlord_access_notice: getValueAtPath(facts, 'landlord_access_notice'),
    inspection_frequency: getValueAtPath(facts, 'inspection_frequency'),
    end_of_tenancy_viewings: coerceBoolean(getValueAtPath(facts, 'end_of_tenancy_viewings')),

    // Additional Terms
    white_goods_included: getValueAtPath(facts, 'white_goods_included'),
    communal_areas: coerceBoolean(getValueAtPath(facts, 'communal_areas')),
    communal_cleaning: getValueAtPath(facts, 'communal_cleaning'),
    recycling_bins: coerceBoolean(getValueAtPath(facts, 'recycling_bins')),

    // Premium Enhanced Features - HMO
    is_hmo: coerceBoolean(getValueAtPath(facts, 'is_hmo')),
    hmo_licence_status: getValueAtPath(facts, 'hmo_licence_status'),
    hmo_licence_number: getValueAtPath(facts, 'hmo_licence_number'),
    hmo_licence_expiry: getValueAtPath(facts, 'hmo_licence_expiry'),
    number_of_sharers: Number(getValueAtPath(facts, 'number_of_sharers')),

    // Premium Enhanced Features - Meter Readings
    meter_reading_gas: getValueAtPath(facts, 'meter_reading_gas'),
    meter_reading_electric: getValueAtPath(facts, 'meter_reading_electric'),
    meter_reading_water: getValueAtPath(facts, 'meter_reading_water'),
    utility_transfer_responsibility: getValueAtPath(facts, 'utility_transfer_responsibility'),

    // Premium Enhanced Features - Late Payment Interest
    late_payment_interest_applicable: coerceBoolean(getValueAtPath(facts, 'late_payment_interest_applicable')),
    late_payment_interest_rate: Number(getValueAtPath(facts, 'late_payment_interest_rate')),
    grace_period_days: Number(getValueAtPath(facts, 'grace_period_days')),
    late_payment_admin_fee: Number(getValueAtPath(facts, 'late_payment_admin_fee')),

    // Premium Enhanced Features - Key Schedule
    number_of_front_door_keys: Number(getValueAtPath(facts, 'number_of_front_door_keys')),
    number_of_back_door_keys: Number(getValueAtPath(facts, 'number_of_back_door_keys')),
    number_of_window_keys: Number(getValueAtPath(facts, 'number_of_window_keys')),
    number_of_mailbox_keys: Number(getValueAtPath(facts, 'number_of_mailbox_keys')),
    access_cards_fobs: Number(getValueAtPath(facts, 'access_cards_fobs')),
    key_replacement_cost: Number(getValueAtPath(facts, 'key_replacement_cost')),
    other_keys_notes: getValueAtPath(facts, 'other_keys_notes'),

    // Premium Enhanced Features - Contractor Access
    contractor_access_notice_period: getValueAtPath(facts, 'contractor_access_notice_period'),
    emergency_access_allowed: coerceBoolean(getValueAtPath(facts, 'emergency_access_allowed')),
    contractor_access_hours: getValueAtPath(facts, 'contractor_access_hours'),
    tenant_presence_required: coerceBoolean(getValueAtPath(facts, 'tenant_presence_required')),

    // Premium Enhanced Features - Emergency Procedures
    emergency_landlord_phone: getValueAtPath(facts, 'emergency_landlord_phone'),
    emergency_plumber_phone: getValueAtPath(facts, 'emergency_plumber_phone'),
    emergency_electrician_phone: getValueAtPath(facts, 'emergency_electrician_phone'),
    emergency_gas_engineer_phone: getValueAtPath(facts, 'emergency_gas_engineer_phone'),
    emergency_locksmith_phone: getValueAtPath(facts, 'emergency_locksmith_phone'),
    water_shutoff_location: getValueAtPath(facts, 'water_shutoff_location'),
    electricity_fuse_box_location: getValueAtPath(facts, 'electricity_fuse_box_location'),
    gas_shutoff_location: getValueAtPath(facts, 'gas_shutoff_location'),

    // Premium Enhanced Features - Maintenance Schedule
    boiler_service_frequency: getValueAtPath(facts, 'boiler_service_frequency'),
    boiler_service_responsibility: getValueAtPath(facts, 'boiler_service_responsibility'),
    gutter_cleaning_frequency: getValueAtPath(facts, 'gutter_cleaning_frequency'),
    gutter_cleaning_responsibility: getValueAtPath(facts, 'gutter_cleaning_responsibility'),
    window_cleaning_frequency: getValueAtPath(facts, 'window_cleaning_frequency'),
    appliance_maintenance_notes: getValueAtPath(facts, 'appliance_maintenance_notes'),

    // Premium Enhanced Features - Garden Maintenance
    lawn_mowing_frequency: getValueAtPath(facts, 'lawn_mowing_frequency'),
    lawn_mowing_responsibility: getValueAtPath(facts, 'lawn_mowing_responsibility'),
    hedge_trimming_responsibility: getValueAtPath(facts, 'hedge_trimming_responsibility'),
    weed_control_responsibility: getValueAtPath(facts, 'weed_control_responsibility'),
    outdoor_furniture_notes: getValueAtPath(facts, 'outdoor_furniture_notes'),

    // Premium Enhanced Features - Move-In Procedures
    pre_tenancy_meeting_required: coerceBoolean(getValueAtPath(facts, 'pre_tenancy_meeting_required')),
    move_in_inspection_required: coerceBoolean(getValueAtPath(facts, 'move_in_inspection_required')),
    photographic_inventory_provided: coerceBoolean(getValueAtPath(facts, 'photographic_inventory_provided')),
    tenant_handbook_provided: coerceBoolean(getValueAtPath(facts, 'tenant_handbook_provided')),
    utility_accounts_transfer_deadline: getValueAtPath(facts, 'utility_accounts_transfer_deadline'),
    domestic_rates_registration_deadline: getValueAtPath(facts, 'domestic_rates_registration_deadline'),

    // Premium Enhanced Features - Move-Out Procedures
    checkout_inspection_required: coerceBoolean(getValueAtPath(facts, 'checkout_inspection_required')),
    professional_cleaning_standard: coerceBoolean(getValueAtPath(facts, 'professional_cleaning_standard')),
    carpet_cleaning_required: coerceBoolean(getValueAtPath(facts, 'carpet_cleaning_required')),
    oven_cleaning_required: coerceBoolean(getValueAtPath(facts, 'oven_cleaning_required')),
    garden_condition_required: getValueAtPath(facts, 'garden_condition_required'),
    key_return_deadline: getValueAtPath(facts, 'key_return_deadline'),
    forwarding_address_required: coerceBoolean(getValueAtPath(facts, 'forwarding_address_required')),
    deposit_return_timeline: getValueAtPath(facts, 'deposit_return_timeline'),

    // Premium Enhanced Features - Cleaning Standards
    regular_cleaning_expectations: getValueAtPath(facts, 'regular_cleaning_expectations'),
    deep_cleaning_areas: getValueAtPath(facts, 'deep_cleaning_areas'),
    cleaning_checklist_provided: coerceBoolean(getValueAtPath(facts, 'cleaning_checklist_provided')),
    cleaning_cost_estimates: Number(getValueAtPath(facts, 'cleaning_cost_estimates')),

    // Document metadata
    product_tier: getValueAtPath(facts, 'product_tier') || getValueAtPath(facts, 'tenancy_tier'),
    additional_schedules: getValueAtPath(facts, 'additional_schedules'),
  };

  return data;
}
