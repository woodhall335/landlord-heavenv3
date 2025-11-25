import { ASTData, TenantInfo } from './ast-generator';

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

function normalizeTenants(rawTenants: any): TenantInfo[] {
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

function mapRentPeriod(value: string | undefined): ASTData['rent_period'] {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('month')) return 'month';
  if (normalized.includes('week')) return 'week';
  if (normalized.includes('quarter')) return 'quarter';
  if (normalized.includes('year')) return 'year';
  return value as ASTData['rent_period'];
}

function normalizeDepositScheme(value: string | undefined): ASTData['deposit_scheme_name'] | undefined {
  if (!value) return undefined;
  if (value.toLowerCase().includes('dps')) return 'DPS';
  if (value.toLowerCase().includes('mydeposits')) return 'MyDeposits';
  if (value.toLowerCase().includes('tds')) return 'TDS';
  return value as ASTData['deposit_scheme_name'];
}

function normalizeApprovedPets(value: any): string | undefined {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'string') return value;
  return undefined;
}

export function mapWizardToASTData(facts: AnyRecord): ASTData {
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

  const jointLiability = coerceBoolean(getValueAtPath(facts, 'joint_and_several_liability'));

  const data: ASTData = {
    agreement_date: getValueAtPath(facts, 'agreement_date') || getValueAtPath(facts, 'tenancy_start_date') || '',
    landlord_full_name: getValueAtPath(facts, 'landlord_full_name') || '',
    landlord_address,
    landlord_address_line1: getValueAtPath(facts, 'landlord_address_line1'),
    landlord_address_town: getValueAtPath(facts, 'landlord_address_town'),
    landlord_address_postcode: getValueAtPath(facts, 'landlord_address_postcode'),
    landlord_email: getValueAtPath(facts, 'landlord_email') || '',
    landlord_phone: getValueAtPath(facts, 'landlord_phone') || '',

    agent_name: getValueAtPath(facts, 'agent_name'),
    agent_address: getValueAtPath(facts, 'agent_address'),
    agent_email: getValueAtPath(facts, 'agent_email'),
    agent_phone: getValueAtPath(facts, 'agent_phone'),
    agent_signs: coerceBoolean(getValueAtPath(facts, 'agent_signs')),

    tenants,
    number_of_tenants,

    property_address,
    property_address_line1: getValueAtPath(facts, 'property_address_line1'),
    property_address_town: getValueAtPath(facts, 'property_address_town'),
    property_address_postcode: getValueAtPath(facts, 'property_address_postcode'),
    property_type: getValueAtPath(facts, 'property_type'),
    number_of_bedrooms: getValueAtPath(facts, 'number_of_bedrooms')?.toString(),
    furnished_status: getValueAtPath(facts, 'furnished_status'),
    property_description: getValueAtPath(facts, 'property_description'),
    parking_available: coerceBoolean(getValueAtPath(facts, 'parking_available')),
    parking_details: getValueAtPath(facts, 'parking_details'),
    has_garden: coerceBoolean(getValueAtPath(facts, 'has_garden')),
    garden_maintenance: getValueAtPath(facts, 'garden_maintenance'),

    tenancy_start_date: getValueAtPath(facts, 'tenancy_start_date') || '',
    is_fixed_term: coerceBoolean(getValueAtPath(facts, 'is_fixed_term')) ?? false,
    tenancy_end_date: getValueAtPath(facts, 'tenancy_end_date'),
    term_length: getValueAtPath(facts, 'term_length'),

    rent_amount: Number(getValueAtPath(facts, 'rent_amount') ?? 0),
    rent_period: mapRentPeriod(getValueAtPath(facts, 'rent_period')),
    rent_due_day: getValueAtPath(facts, 'rent_due_day'),
    payment_method: getValueAtPath(facts, 'payment_method') || '',
    payment_details: getValueAtPath(facts, 'payment_details') || '',
    bank_account_name: getValueAtPath(facts, 'bank_account_name'),
    bank_sort_code: getValueAtPath(facts, 'bank_sort_code'),
    bank_account_number: getValueAtPath(facts, 'bank_account_number'),

    deposit_amount: Number(getValueAtPath(facts, 'deposit_amount') ?? 0),
    deposit_scheme_name: normalizeDepositScheme(getValueAtPath(facts, 'deposit_scheme_name')) as any,
    deposit_paid_date: getValueAtPath(facts, 'deposit_paid_date'),
    deposit_protection_date: getValueAtPath(facts, 'deposit_protection_date'),

    council_tax_responsibility: getValueAtPath(facts, 'council_tax_responsibility'),
    utilities_responsibility: getValueAtPath(facts, 'utilities_responsibility'),
    internet_responsibility: getValueAtPath(facts, 'internet_responsibility'),

    inventory_attached: coerceBoolean(getValueAtPath(facts, 'inventory_attached')),
    professional_cleaning_required: coerceBoolean(getValueAtPath(facts, 'professional_cleaning_required')),
    decoration_condition: getValueAtPath(facts, 'decoration_condition'),
    inventory_schedule_notes: getValueAtPath(facts, 'inventory_schedule_notes'),

    pets_allowed: coerceBoolean(getValueAtPath(facts, 'pets_allowed')),
    approved_pets: normalizeApprovedPets(getValueAtPath(facts, 'approved_pets')),
    smoking_allowed: coerceBoolean(getValueAtPath(facts, 'smoking_allowed')),

    guarantor_name: getValueAtPath(facts, 'guarantor_name'),
    guarantor_address: getValueAtPath(facts, 'guarantor_address'),
    guarantor_email: getValueAtPath(facts, 'guarantor_email'),
    guarantor_phone: getValueAtPath(facts, 'guarantor_phone'),
    guarantor_dob: getValueAtPath(facts, 'guarantor_dob'),
    guarantor_relationship: getValueAtPath(facts, 'guarantor_relationship'),
    guarantor_required: coerceBoolean(getValueAtPath(facts, 'guarantor_required')),

    right_to_rent_check_date: getValueAtPath(facts, 'right_to_rent_check_date'),
    how_to_rent_provision_date: getValueAtPath(facts, 'how_to_rent_provision_date'),
    how_to_rent_guide_provided: coerceBoolean(getValueAtPath(facts, 'how_to_rent_guide_provided')),

    gas_safety_certificate: coerceBoolean(getValueAtPath(facts, 'gas_safety_certificate')),
    epc_rating: getValueAtPath(facts, 'epc_rating'),
    electrical_safety_certificate: coerceBoolean(getValueAtPath(facts, 'electrical_safety_certificate')),
    smoke_alarms_fitted: coerceBoolean(getValueAtPath(facts, 'smoke_alarms_fitted')),
    carbon_monoxide_alarms: coerceBoolean(getValueAtPath(facts, 'carbon_monoxide_alarms')),

    landlord_maintenance_responsibilities: getValueAtPath(facts, 'landlord_maintenance_responsibilities'),
    repairs_reporting_method: getValueAtPath(facts, 'repairs_reporting_method'),
    emergency_contact: getValueAtPath(facts, 'emergency_contact'),

    break_clause: coerceBoolean(getValueAtPath(facts, 'break_clause')),
    break_clause_months: getValueAtPath(facts, 'break_clause_months'),
    break_clause_notice_period: getValueAtPath(facts, 'break_clause_notice_period'),
    subletting_allowed: getValueAtPath(facts, 'subletting_allowed'),
    rent_increase_clause: coerceBoolean(getValueAtPath(facts, 'rent_increase_clause')),
    rent_increase_method: getValueAtPath(facts, 'rent_increase_method'),
    rent_increase_frequency: getValueAtPath(facts, 'rent_increase_frequency'),
    tenant_notice_period: getValueAtPath(facts, 'tenant_notice_period'),
    additional_terms: getValueAtPath(facts, 'additional_terms'),

    landlord_insurance: coerceBoolean(getValueAtPath(facts, 'landlord_insurance')),
    tenant_insurance_required: getValueAtPath(facts, 'tenant_insurance_required'),

    landlord_access_notice: getValueAtPath(facts, 'landlord_access_notice'),
    inspection_frequency: getValueAtPath(facts, 'inspection_frequency'),
    end_of_tenancy_viewings: coerceBoolean(getValueAtPath(facts, 'end_of_tenancy_viewings')),

    communal_areas: getValueAtPath(facts, 'communal_areas'),
    is_hmo: coerceBoolean(getValueAtPath(facts, 'is_hmo')),
    communal_cleaning: getValueAtPath(facts, 'communal_cleaning'),
    number_of_sharers: getValueAtPath(facts, 'number_of_sharers'),
    hmo_licence_status: getValueAtPath(facts, 'hmo_licence_status'),
    recycling_bins: coerceBoolean(getValueAtPath(facts, 'recycling_bins')),

    jurisdiction_england: true,
    jurisdiction_wales: false,

    joint_and_several_liability: jointLiability ?? tenants.length > 1,
    product_tier: getValueAtPath(facts, 'product_tier') || getValueAtPath(facts, 'ast_tier'),
    has_shared_facilities: Boolean(
      coerceBoolean(getValueAtPath(facts, 'is_hmo')) ||
      getValueAtPath(facts, 'communal_areas') ||
      getValueAtPath(facts, 'number_of_sharers')
    ),
  };

  return data;
}
