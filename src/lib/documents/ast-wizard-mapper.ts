/**
 * AST Wizard Mapper
 *
 * Maps WizardFacts (flat DB format) to ASTData (document generator format).
 *
 * Flow:
 * 1. Accepts WizardFacts at the boundary (from case_facts.facts or collected_facts)
 * 2. Converts to nested CaseFacts using wizardFactsToCaseFacts()
 * 3. Maps CaseFacts domain model to ASTData for document generation
 */

import { ASTData, TenantInfo } from './ast-generator';
import type { WizardFacts, CaseFacts } from '@/lib/case-facts/schema';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

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

function normalizeTenants(caseFacts: CaseFacts, wizardFacts: WizardFacts): TenantInfo[] {
  // Try nested CaseFacts first
  if (caseFacts.parties.tenants && caseFacts.parties.tenants.length > 0) {
    return caseFacts.parties.tenants
      .filter((t) => t && (t.name || t.email || (t as any).dob || t.phone))
      .map((t, index) => {
        // Prefer DOB from CaseFacts, fall back to WizardFacts
        const dobFromCase = (t as any).dob;
        const dobFromWizard = getValueAtPath(wizardFacts, `tenants.${index}.dob`);

        const fullNameFromWizard = getValueAtPath(wizardFacts, `tenants.${index}.full_name`);
        const emailFromWizard = getValueAtPath(wizardFacts, `tenants.${index}.email`);
        const phoneFromWizard = getValueAtPath(wizardFacts, `tenants.${index}.phone`);

        return {
          full_name: t.name || fullNameFromWizard || '',
          dob: dobFromCase || dobFromWizard || '',
          email: t.email || emailFromWizard || '',
          phone: t.phone || phoneFromWizard || '',
        };
      });
  }

  // Fallback: extract from flat WizardFacts for fields not yet in CaseFacts
  const rawTenants = getValueAtPath(wizardFacts, 'tenants');
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
  primary: string | null,
  line1?: string | null,
  town?: string | null,
  postcode?: string | null
): string {
  if (primary && primary.trim().length > 0) return primary.trim();

  const parts = [line1, town, postcode].filter(Boolean);
  return parts.join(', ');
}

function mapRentPeriod(value: string | null): ASTData['rent_period'] {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.includes('month')) return 'month';
  if (normalized.includes('week')) return 'week';
  if (normalized.includes('quarter')) return 'quarter';
  if (normalized.includes('year')) return 'year';
  return value as ASTData['rent_period'];
}

function normalizeDepositScheme(value: string | null): ASTData['deposit_scheme_name'] | undefined {
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

/**
 * Format bank payment details into a professional, complete format.
 * If fields are missing, uses bracketed placeholders instead of truncated/blank output.
 */
function formatPaymentDetails(
  accountName: string | undefined,
  sortCode: string | undefined,
  accountNumber: string | undefined,
  rawPaymentDetails: string | undefined
): string {
  const hasStructuredDetails = accountName || sortCode || accountNumber;

  if (hasStructuredDetails) {
    const parts: string[] = [];

    // Account name
    if (accountName && accountName.trim()) {
      parts.push(`Account Name: ${accountName.trim()}`);
    } else {
      parts.push('Account Name: [TO BE COMPLETED BEFORE SIGNING]');
    }

    // Sort code
    if (sortCode && sortCode.trim()) {
      // Format sort code with hyphens if not already formatted
      const formatted = sortCode.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3');
      parts.push(`Sort Code: ${formatted}`);
    } else {
      parts.push('Sort Code: [TO BE COMPLETED BEFORE SIGNING]');
    }

    // Account number
    if (accountNumber && accountNumber.trim()) {
      parts.push(`Account Number: ${accountNumber.trim()}`);
    } else {
      parts.push('Account Number: [TO BE COMPLETED BEFORE SIGNING]');
    }

    return parts.join(' | ');
  }

  // Fallback to raw payment details if provided
  if (rawPaymentDetails && rawPaymentDetails.trim()) {
    // Check if it looks like a truncated/incomplete value (single token without structure)
    const trimmed = rawPaymentDetails.trim();
    if (trimmed.length < 15 && !trimmed.includes(':') && !trimmed.includes(' ')) {
      // Looks incomplete - wrap it with a note
      return `${trimmed} [COMPLETE BANK DETAILS REQUIRED BEFORE SIGNING]`;
    }
    return trimmed;
  }

  // No payment details at all - return full placeholder
  return 'Account Name: [TO BE COMPLETED] | Sort Code: [TO BE COMPLETED] | Account Number: [TO BE COMPLETED]';
}

/**
 * Calculate first payment amount and date.
 * - First payment defaults to monthly rent amount
 * - First payment date defaults to tenancy start date
 * - Returns placeholder strings if values cannot be determined
 */
function calculateFirstPayment(
  rentAmount: number | undefined,
  tenancyStartDate: string | undefined,
  explicitFirstPayment: number | string | undefined,
  explicitFirstPaymentDate: string | undefined
): { amount: string; date: string } {
  // First payment amount
  let amount: string;
  if (explicitFirstPayment !== undefined && explicitFirstPayment !== null && explicitFirstPayment !== '') {
    const numAmount = typeof explicitFirstPayment === 'string' ? parseFloat(explicitFirstPayment) : explicitFirstPayment;
    amount = !isNaN(numAmount) && numAmount > 0 ? numAmount.toFixed(2) : '[AMOUNT TO BE COMPLETED BEFORE SIGNING]';
  } else if (rentAmount && rentAmount > 0) {
    amount = rentAmount.toFixed(2);
  } else {
    amount = '[AMOUNT TO BE COMPLETED BEFORE SIGNING]';
  }

  // First payment date
  let date: string;
  if (explicitFirstPaymentDate && explicitFirstPaymentDate.trim()) {
    date = explicitFirstPaymentDate.trim();
  } else if (tenancyStartDate && tenancyStartDate.trim()) {
    date = tenancyStartDate.trim();
  } else {
    date = '[DATE TO BE COMPLETED BEFORE SIGNING]';
  }

  return { amount, date };
}

/**
 * Maps WizardFacts (flat DB format) to ASTData (document generator format).
 *
 * @param wizardFacts - Flat facts from case_facts.facts or collected_facts
 * @param options - Optional configuration including canonical jurisdiction
 * @param options.canonicalJurisdiction - If provided, ALWAYS use this jurisdiction
 *        instead of deriving from wizardFacts. This is critical for ensuring
 *        Scotland cases never get Wales/England templates.
 * @returns ASTData ready for AST document generation
 */
export function mapWizardToASTData(
  wizardFacts: WizardFacts,
  options?: { canonicalJurisdiction?: string }
): ASTData {
  // Log canonical jurisdiction usage for debugging
  if (options?.canonicalJurisdiction) {
    console.log(
      `[AST Mapper] Using canonical jurisdiction: "${options.canonicalJurisdiction}" ` +
      `(overrides any derived value from wizardFacts)`
    );
  }

  // Convert flat WizardFacts to nested CaseFacts domain model
  const caseFacts = wizardFactsToCaseFacts(wizardFacts);

  // Extract tenants (hybrid approach for fields not yet in CaseFacts)
  const tenants = normalizeTenants(caseFacts, wizardFacts);
  const number_of_tenants = Number(getValueAtPath(wizardFacts, 'number_of_tenants') ?? tenants.length ?? 0);

  // Build addresses from CaseFacts
  const property_address = buildAddress(
    caseFacts.property.address_line1,
    caseFacts.property.address_line2 ?? null,
    caseFacts.property.city,
    caseFacts.property.postcode
  );

  const landlord_address = buildAddress(
    caseFacts.parties.landlord.address_line1,
    caseFacts.parties.landlord.address_line2 ?? null,
    caseFacts.parties.landlord.city,
    caseFacts.parties.landlord.postcode
  );

  const jointLiability = coerceBoolean(getValueAtPath(wizardFacts, 'joint_and_several_liability'));

  const data: ASTData = {
    // AST Suitability Check (not in CaseFacts yet - use WizardFacts)
    tenant_is_individual: coerceBoolean(getValueAtPath(wizardFacts, 'tenancy.ast_suitability.tenant_is_individual')),
    main_home: coerceBoolean(getValueAtPath(wizardFacts, 'tenancy.ast_suitability.main_home')),
    landlord_lives_at_property: coerceBoolean(getValueAtPath(wizardFacts, 'tenancy.ast_suitability.landlord_lives_at_property')),
    holiday_or_licence: coerceBoolean(getValueAtPath(wizardFacts, 'tenancy.ast_suitability.holiday_or_licence')),

    // Dates - use CaseFacts
    agreement_date: getValueAtPath(wizardFacts, 'agreement_date') || caseFacts.tenancy.start_date || '',
    landlord_full_name: caseFacts.parties.landlord.name || '',
    landlord_address,
    landlord_address_line1: caseFacts.parties.landlord.address_line1 ?? undefined,
    landlord_address_town: caseFacts.parties.landlord.city ?? undefined,
    landlord_address_postcode: caseFacts.parties.landlord.postcode ?? undefined,
    landlord_email: caseFacts.parties.landlord.email || '',
    landlord_phone: caseFacts.parties.landlord.phone || '',

    // Agent - use CaseFacts
    agent_name: caseFacts.parties.agent.name ?? undefined,
    agent_address: buildAddress(
      caseFacts.parties.agent.address_line1,
      caseFacts.parties.agent.address_line2 ?? null,
      caseFacts.parties.agent.city,
      caseFacts.parties.agent.postcode
    ),
    agent_email: caseFacts.parties.agent.email ?? undefined,
    agent_phone: caseFacts.parties.agent.phone ?? undefined,
    agent_signs: coerceBoolean(getValueAtPath(wizardFacts, 'agent_signs')),

    // Tenants
    tenants,
    number_of_tenants,

    // Property - use CaseFacts
    property_address,
    property_address_line1: caseFacts.property.address_line1 ?? undefined,
    property_address_town: caseFacts.property.city ?? undefined,
    property_address_postcode: caseFacts.property.postcode ?? undefined,
    property_type: getValueAtPath(wizardFacts, 'property_type'),
    number_of_bedrooms: getValueAtPath(wizardFacts, 'number_of_bedrooms')?.toString(),
    furnished_status: getValueAtPath(wizardFacts, 'furnished_status'),
    property_description: getValueAtPath(wizardFacts, 'property_description'),
    parking_available: coerceBoolean(getValueAtPath(wizardFacts, 'parking_available')),
    parking_details: getValueAtPath(wizardFacts, 'parking_details'),
    has_garden: coerceBoolean(getValueAtPath(wizardFacts, 'has_garden')),
    garden_maintenance: getValueAtPath(wizardFacts, 'garden_maintenance'),

    // Tenancy - use CaseFacts where available
    tenancy_start_date: caseFacts.tenancy.start_date || '',
    is_fixed_term: caseFacts.tenancy.fixed_term ?? false,
    tenancy_end_date: caseFacts.tenancy.end_date ?? undefined,
    term_length: getValueAtPath(wizardFacts, 'term_length'),

    // Rent - use CaseFacts
    rent_amount: caseFacts.tenancy.rent_amount ?? 0,
    rent_period: mapRentPeriod(caseFacts.tenancy.rent_frequency),
    rent_due_day: caseFacts.tenancy.rent_due_day != null ? String(caseFacts.tenancy.rent_due_day) : '',
    payment_method: getValueAtPath(wizardFacts, 'payment_method') || 'Bank Transfer',

    // Payment details - formatted with proper structure or placeholders
    payment_details: formatPaymentDetails(
      getValueAtPath(wizardFacts, 'bank_account_name'),
      getValueAtPath(wizardFacts, 'bank_sort_code'),
      getValueAtPath(wizardFacts, 'bank_account_number'),
      getValueAtPath(wizardFacts, 'payment_details')
    ),
    bank_account_name: getValueAtPath(wizardFacts, 'bank_account_name'),
    bank_sort_code: getValueAtPath(wizardFacts, 'bank_sort_code'),
    bank_account_number: getValueAtPath(wizardFacts, 'bank_account_number'),

    // First payment - calculated from rent or explicit values, with placeholders for missing data
    first_payment: calculateFirstPayment(
      caseFacts.tenancy.rent_amount ?? undefined,
      caseFacts.tenancy.start_date ?? undefined,
      getValueAtPath(wizardFacts, 'first_payment'),
      getValueAtPath(wizardFacts, 'first_payment_date')
    ).amount,
    first_payment_date: calculateFirstPayment(
      caseFacts.tenancy.rent_amount ?? undefined,
      caseFacts.tenancy.start_date ?? undefined,
      getValueAtPath(wizardFacts, 'first_payment'),
      getValueAtPath(wizardFacts, 'first_payment_date')
    ).date,

    // Deposit - use CaseFacts
    // Output both deposit_scheme and deposit_scheme_name for template compatibility
    deposit_amount: caseFacts.tenancy.deposit_amount ?? 0,
    deposit_scheme: normalizeDepositScheme(caseFacts.tenancy.deposit_scheme_name) as any,
    deposit_scheme_name: normalizeDepositScheme(caseFacts.tenancy.deposit_scheme_name) as any,
    deposit_paid_date: getValueAtPath(wizardFacts, 'deposit_paid_date'),
    deposit_protection_date: caseFacts.tenancy.deposit_protection_date ?? undefined,
    deposit_already_protected: caseFacts.tenancy.deposit_protected ?? undefined,
    deposit_reference_number: getValueAtPath(wizardFacts, 'deposit.reference_number'),
    prescribed_information_served: coerceBoolean(getValueAtPath(wizardFacts, 'deposit.prescribed_information_served')),

    // Utilities (not in CaseFacts yet)
    council_tax_responsibility: getValueAtPath(wizardFacts, 'council_tax_responsibility'),
    utilities_responsibility: getValueAtPath(wizardFacts, 'utilities_responsibility'),
    internet_responsibility: getValueAtPath(wizardFacts, 'internet_responsibility'),

    // Inventory
    inventory_attached: coerceBoolean(getValueAtPath(wizardFacts, 'inventory_attached')),
    professional_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'professional_cleaning_required')),
    decoration_condition: getValueAtPath(wizardFacts, 'decoration_condition'),
    inventory_schedule_notes: getValueAtPath(wizardFacts, 'inventory_schedule_notes'),

    // Pets and Smoking
    pets_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'pets_allowed')),
    approved_pets: normalizeApprovedPets(getValueAtPath(wizardFacts, 'approved_pets')),
    smoking_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'smoking_allowed')),

    // Guarantor
    guarantor_name: getValueAtPath(wizardFacts, 'guarantor_name'),
    guarantor_address: getValueAtPath(wizardFacts, 'guarantor_address'),
    guarantor_email: getValueAtPath(wizardFacts, 'guarantor_email'),
    guarantor_phone: getValueAtPath(wizardFacts, 'guarantor_phone'),
    guarantor_dob: getValueAtPath(wizardFacts, 'guarantor_dob'),
    guarantor_relationship: getValueAtPath(wizardFacts, 'guarantor_relationship'),
    guarantor_required: coerceBoolean(getValueAtPath(wizardFacts, 'guarantor_required')),

    // Compliance Documents (England/Wales only - fields removed from Scotland/NI in MQS v2.0.1)
    // These will be undefined/null for Scotland/NI jurisdictions, which is correct behavior
    right_to_rent_check_date: getValueAtPath(wizardFacts, 'right_to_rent_check_date'),
    how_to_rent_provision_date: getValueAtPath(wizardFacts, 'how_to_rent_provision_date'),
    how_to_rent_guide_provided: coerceBoolean(getValueAtPath(wizardFacts, 'how_to_rent_guide_provided')),

    // Safety Certificates - boolean flags
    gas_safety_certificate: coerceBoolean(getValueAtPath(wizardFacts, 'gas_safety_certificate')),
    epc_rating: getValueAtPath(wizardFacts, 'epc_rating'),
    electrical_safety_certificate: coerceBoolean(getValueAtPath(wizardFacts, 'electrical_safety_certificate')),
    smoke_alarms_fitted: coerceBoolean(getValueAtPath(wizardFacts, 'smoke_alarms_fitted')),
    carbon_monoxide_alarms: coerceBoolean(getValueAtPath(wizardFacts, 'carbon_monoxide_alarms')),

    // Safety Certificate Dates - for compliance verification
    gas_safety_certificate_date: getValueAtPath(wizardFacts, 'gas_safety_certificate_date'),
    gas_safety_certificate_expiry: getValueAtPath(wizardFacts, 'gas_safety_certificate_expiry'),
    epc_certificate_date: getValueAtPath(wizardFacts, 'epc_certificate_date'),
    eicr_certificate_date: getValueAtPath(wizardFacts, 'eicr_certificate_date'),
    eicr_next_inspection_date: getValueAtPath(wizardFacts, 'eicr_next_inspection_date'),
    how_to_rent_guide_date: getValueAtPath(wizardFacts, 'how_to_rent_guide_date'),

    // Prescribed Information Date
    prescribed_information_date: getValueAtPath(wizardFacts, 'prescribed_information_date'),

    // Maintenance
    landlord_maintenance_responsibilities: getValueAtPath(wizardFacts, 'landlord_maintenance_responsibilities'),
    repairs_reporting_method: getValueAtPath(wizardFacts, 'repairs_reporting_method'),
    emergency_contact: getValueAtPath(wizardFacts, 'emergency_contact'),

    // Clauses
    break_clause: coerceBoolean(getValueAtPath(wizardFacts, 'break_clause')),
    break_clause_months: getValueAtPath(wizardFacts, 'break_clause_months'),
    break_clause_notice_period: getValueAtPath(wizardFacts, 'break_clause_notice_period'),
    subletting_allowed: getValueAtPath(wizardFacts, 'subletting_allowed'),
    rent_increase_clause: coerceBoolean(getValueAtPath(wizardFacts, 'rent_increase_clause')),
    rent_increase_method: getValueAtPath(wizardFacts, 'rent_increase_method'),
    rent_increase_frequency: getValueAtPath(wizardFacts, 'rent_increase_frequency'),
    tenant_notice_period: getValueAtPath(wizardFacts, 'tenant_notice_period'),
    additional_terms: getValueAtPath(wizardFacts, 'additional_terms'),

    // Insurance
    landlord_insurance: coerceBoolean(getValueAtPath(wizardFacts, 'landlord_insurance')),
    tenant_insurance_required: getValueAtPath(wizardFacts, 'tenant_insurance_required'),

    // Access
    landlord_access_notice: getValueAtPath(wizardFacts, 'landlord_access_notice'),
    inspection_frequency: getValueAtPath(wizardFacts, 'inspection_frequency'),
    end_of_tenancy_viewings: coerceBoolean(getValueAtPath(wizardFacts, 'end_of_tenancy_viewings')),

    // HMO - use CaseFacts
    communal_areas: getValueAtPath(wizardFacts, 'communal_areas'),
    is_hmo: caseFacts.property.is_hmo ?? undefined,
    communal_cleaning: getValueAtPath(wizardFacts, 'communal_cleaning'),
    number_of_sharers: getValueAtPath(wizardFacts, 'number_of_sharers'),
    hmo_licence_status: getValueAtPath(wizardFacts, 'hmo_licence_status'),
    hmo_licence_number: getValueAtPath(wizardFacts, 'hmo_licence_number'),
    hmo_licence_expiry: getValueAtPath(wizardFacts, 'hmo_licence_expiry'),
    recycling_bins: coerceBoolean(getValueAtPath(wizardFacts, 'recycling_bins')),

    // Premium Enhanced Features - Meter Readings
    meter_reading_gas: getValueAtPath(wizardFacts, 'meter_reading_gas'),
    meter_reading_electric: getValueAtPath(wizardFacts, 'meter_reading_electric'),
    meter_reading_water: getValueAtPath(wizardFacts, 'meter_reading_water'),
    utility_transfer_responsibility: getValueAtPath(wizardFacts, 'utility_transfer_responsibility'),

    // Premium Enhanced Features - Late Payment Interest
    late_payment_interest_applicable: coerceBoolean(getValueAtPath(wizardFacts, 'late_payment_interest_applicable')),
    late_payment_interest_rate: Number(getValueAtPath(wizardFacts, 'late_payment_interest_rate')) ?? 0,
    grace_period_days: Number(getValueAtPath(wizardFacts, 'grace_period_days')) ?? 0,
    late_payment_admin_fee: Number(getValueAtPath(wizardFacts, 'late_payment_admin_fee')) ?? 0,

    // Premium Enhanced Features - Key Schedule
    number_of_front_door_keys: Number(getValueAtPath(wizardFacts, 'number_of_front_door_keys')) ?? 0,
    number_of_back_door_keys: Number(getValueAtPath(wizardFacts, 'number_of_back_door_keys')) ?? 0,
    number_of_window_keys: Number(getValueAtPath(wizardFacts, 'number_of_window_keys')) ?? 0,
    number_of_mailbox_keys: Number(getValueAtPath(wizardFacts, 'number_of_mailbox_keys')) ?? 0,
    access_cards_fobs: Number(getValueAtPath(wizardFacts, 'access_cards_fobs')) ?? 0,
    key_replacement_cost: Number(getValueAtPath(wizardFacts, 'key_replacement_cost')) ?? 0,
    other_keys_notes: getValueAtPath(wizardFacts, 'other_keys_notes'),

    // Premium Enhanced Features - Contractor Access
    contractor_access_notice_period: getValueAtPath(wizardFacts, 'contractor_access_notice_period'),
    emergency_access_allowed: coerceBoolean(getValueAtPath(wizardFacts, 'emergency_access_allowed')),
    contractor_access_hours: getValueAtPath(wizardFacts, 'contractor_access_hours'),
    tenant_presence_required: coerceBoolean(getValueAtPath(wizardFacts, 'tenant_presence_required')),

    // Premium Enhanced Features - Emergency Procedures
    emergency_landlord_phone: getValueAtPath(wizardFacts, 'emergency_landlord_phone'),
    emergency_plumber_phone: getValueAtPath(wizardFacts, 'emergency_plumber_phone'),
    emergency_electrician_phone: getValueAtPath(wizardFacts, 'emergency_electrician_phone'),
    emergency_gas_engineer_phone: getValueAtPath(wizardFacts, 'emergency_gas_engineer_phone'),
    emergency_locksmith_phone: getValueAtPath(wizardFacts, 'emergency_locksmith_phone'),
    water_shutoff_location: getValueAtPath(wizardFacts, 'water_shutoff_location'),
    electricity_fuse_box_location: getValueAtPath(wizardFacts, 'electricity_fuse_box_location'),
    gas_shutoff_location: getValueAtPath(wizardFacts, 'gas_shutoff_location'),

    // Premium Enhanced Features - Maintenance Schedule
    boiler_service_frequency: getValueAtPath(wizardFacts, 'boiler_service_frequency'),
    boiler_service_responsibility: getValueAtPath(wizardFacts, 'boiler_service_responsibility'),
    gutter_cleaning_frequency: getValueAtPath(wizardFacts, 'gutter_cleaning_frequency'),
    gutter_cleaning_responsibility: getValueAtPath(wizardFacts, 'gutter_cleaning_responsibility'),
    window_cleaning_frequency: getValueAtPath(wizardFacts, 'window_cleaning_frequency'),
    appliance_maintenance_notes: getValueAtPath(wizardFacts, 'appliance_maintenance_notes'),

    // Premium Enhanced Features - Garden Maintenance
    lawn_mowing_frequency: getValueAtPath(wizardFacts, 'lawn_mowing_frequency'),
    lawn_mowing_responsibility: getValueAtPath(wizardFacts, 'lawn_mowing_responsibility'),
    hedge_trimming_responsibility: getValueAtPath(wizardFacts, 'hedge_trimming_responsibility'),
    weed_control_responsibility: getValueAtPath(wizardFacts, 'weed_control_responsibility'),
    outdoor_furniture_notes: getValueAtPath(wizardFacts, 'outdoor_furniture_notes'),

    // Premium Enhanced Features - Move-In Procedures
    pre_tenancy_meeting_required: coerceBoolean(getValueAtPath(wizardFacts, 'pre_tenancy_meeting_required')),
    move_in_inspection_required: coerceBoolean(getValueAtPath(wizardFacts, 'move_in_inspection_required')),
    photographic_inventory_provided: coerceBoolean(getValueAtPath(wizardFacts, 'photographic_inventory_provided')),
    tenant_handbook_provided: coerceBoolean(getValueAtPath(wizardFacts, 'tenant_handbook_provided')),
    utility_accounts_transfer_deadline: getValueAtPath(wizardFacts, 'utility_accounts_transfer_deadline'),
    council_tax_registration_deadline: getValueAtPath(wizardFacts, 'council_tax_registration_deadline'),

    // Premium Enhanced Features - Move-Out Procedures
    checkout_inspection_required: coerceBoolean(getValueAtPath(wizardFacts, 'checkout_inspection_required')),
    professional_cleaning_standard: coerceBoolean(getValueAtPath(wizardFacts, 'professional_cleaning_standard')),
    carpet_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'carpet_cleaning_required')),
    oven_cleaning_required: coerceBoolean(getValueAtPath(wizardFacts, 'oven_cleaning_required')),
    garden_condition_required: getValueAtPath(wizardFacts, 'garden_condition_required'),
    key_return_deadline: getValueAtPath(wizardFacts, 'key_return_deadline'),
    forwarding_address_required: coerceBoolean(getValueAtPath(wizardFacts, 'forwarding_address_required')),
    deposit_return_timeline: getValueAtPath(wizardFacts, 'deposit_return_timeline'),

    // Premium Enhanced Features - Cleaning Standards
    regular_cleaning_expectations: getValueAtPath(wizardFacts, 'regular_cleaning_expectations'),
    deep_cleaning_areas: getValueAtPath(wizardFacts, 'deep_cleaning_areas'),
    cleaning_checklist_provided: coerceBoolean(getValueAtPath(wizardFacts, 'cleaning_checklist_provided')),
    cleaning_cost_estimates: Number(getValueAtPath(wizardFacts, 'cleaning_cost_estimates')) ?? 0,

    // Jurisdiction - CRITICAL: Use canonical jurisdiction if provided (from fulfillment resolver)
    // This ensures Scotland cases ALWAYS get Scotland templates, never Wales/England.
    // Priority: canonicalJurisdiction > __meta.jurisdiction > property.country > property_country
    jurisdiction: options?.canonicalJurisdiction ||
                  caseFacts.meta.jurisdiction ||
                  caseFacts.property.country ||
                  getValueAtPath(wizardFacts, 'property_country') ||
                  getValueAtPath(wizardFacts, '__meta.jurisdiction') ||
                  undefined,
    // Legacy boolean flags for template compatibility - derive from resolved jurisdiction
    jurisdiction_england: (options?.canonicalJurisdiction || caseFacts.meta.jurisdiction || caseFacts.property.country || getValueAtPath(wizardFacts, 'property_country')) === 'england',
    jurisdiction_wales: (options?.canonicalJurisdiction || caseFacts.meta.jurisdiction || caseFacts.property.country || getValueAtPath(wizardFacts, 'property_country')) === 'wales',

    // Meta
    joint_and_several_liability: jointLiability ?? tenants.length > 1,
    product_tier: caseFacts.meta.product_tier || getValueAtPath(wizardFacts, 'ast_tier'),
    has_shared_facilities: Boolean(
      caseFacts.property.is_hmo ||
      getValueAtPath(wizardFacts, 'communal_areas') ||
      getValueAtPath(wizardFacts, 'number_of_sharers')
    ),
  };

  return data;
}
