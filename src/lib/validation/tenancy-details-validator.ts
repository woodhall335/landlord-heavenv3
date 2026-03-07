import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

export const REQUIRED_TENANCY_FIELDS = [
  'landlord_full_name',
  'landlord_address_line1',
  'landlord_email',
  'landlord_phone',
  'property_address_line1',
  'property_address_town',
  'property_address_postcode',
  'tenancy_start_date',
  'rent_amount',
  'deposit_amount',
  'tenants',
] as const;

export type RequiredTenancyField = (typeof REQUIRED_TENANCY_FIELDS)[number];

export interface TenancyValidationResult {
  missing_fields: string[];
  invalid_fields: string[];
}

interface ValidateOptions {
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
}

function isBlankString(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function hasValidDate(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Shared tenancy agreement validator used by wizard/checkout/fulfillment.
 * Accepts raw WizardFacts (flat) and/or nested shapes.
 */
export function validateTenancyRequiredFacts(
  facts: Record<string, unknown> | null | undefined,
  options: ValidateOptions = {}
): TenancyValidationResult {
  const wizardFacts = (facts ?? {}) as Record<string, unknown>;
  const caseFacts = wizardFactsToCaseFacts(wizardFacts as any);

  const missing = new Set<string>();
  const invalid = new Set<string>();

  const landlordName = caseFacts.parties.landlord.name;
  const landlordAddressLine1 = caseFacts.parties.landlord.address_line1;
  const landlordEmail = caseFacts.parties.landlord.email;
  const landlordPhone = caseFacts.parties.landlord.phone;

  if (isBlankString(landlordName)) missing.add('landlord_full_name');
  if (isBlankString(landlordAddressLine1)) missing.add('landlord_address_line1');
  if (isBlankString(landlordEmail)) missing.add('landlord_email');
  if (isBlankString(landlordPhone)) missing.add('landlord_phone');

  if (isBlankString(caseFacts.property.address_line1)) missing.add('property_address_line1');
  if (isBlankString(caseFacts.property.city)) missing.add('property_address_town');
  if (isBlankString(caseFacts.property.postcode)) missing.add('property_address_postcode');

  const startDate = caseFacts.tenancy.start_date ?? (wizardFacts.tenancy_start_date as string | undefined);
  if (!hasValidDate(startDate)) {
    if (isBlankString(startDate)) {
      missing.add('tenancy_start_date');
    } else {
      invalid.add('tenancy_start_date');
    }
  }

  const rentAmount = toFiniteNumber(caseFacts.tenancy.rent_amount ?? wizardFacts.rent_amount);
  if (rentAmount === null) {
    missing.add('rent_amount');
  } else if (rentAmount <= 0) {
    invalid.add('rent_amount');
  }

  const depositAmount = toFiniteNumber(caseFacts.tenancy.deposit_amount ?? wizardFacts.deposit_amount);
  if (depositAmount === null) {
    missing.add('deposit_amount');
  } else if (depositAmount < 0) {
    invalid.add('deposit_amount');
  }

  const tenants = caseFacts.parties.tenants || [];
  if (tenants.length === 0) {
    missing.add('tenants');
  } else {
    tenants.forEach((tenant, index) => {
      if (isBlankString(tenant.name)) missing.add(`tenants[${index}].full_name`);
      if (isBlankString(tenant.email)) missing.add(`tenants[${index}].email`);
      if (isBlankString(tenant.phone)) missing.add(`tenants[${index}].phone`);
    });
  }

  const jurisdiction =
    options.jurisdiction ||
    (caseFacts.meta.jurisdiction as ValidateOptions['jurisdiction']) ||
    (caseFacts.property.country as ValidateOptions['jurisdiction']) ||
    null;

  const isFixedTerm =
    typeof wizardFacts.is_fixed_term === 'boolean'
      ? wizardFacts.is_fixed_term
      : caseFacts.tenancy.fixed_term;

  if (jurisdiction !== 'scotland' && isFixedTerm === true) {
    const endDate = (wizardFacts.tenancy_end_date as string | undefined) || caseFacts.tenancy.end_date;
    if (!hasValidDate(endDate)) {
      if (isBlankString(endDate)) {
        missing.add('tenancy_end_date');
      } else {
        invalid.add('tenancy_end_date');
      }
    }

    const termLength = (wizardFacts.term_length as string | undefined) || (wizardFacts.tenancy_fixed_term_months as string | undefined);
    if (isBlankString(termLength)) {
      missing.add('term_length');
    }
  }

  if (jurisdiction === 'scotland' && isBlankString(wizardFacts.landlord_registration_number)) {
    missing.add('landlord_registration_number');
  }

  if (jurisdiction === 'northern-ireland') {
    if (isBlankString(wizardFacts.agreement_date)) missing.add('agreement_date');
    if (isBlankString(wizardFacts.rent_due_day)) missing.add('rent_due_day');
    if (isBlankString(wizardFacts.payment_method)) missing.add('payment_method');
    if (isBlankString(wizardFacts.payment_details)) missing.add('payment_details');
  }

  return {
    missing_fields: Array.from(missing),
    invalid_fields: Array.from(invalid),
  };
}

export function getMissingRequiredTenancyFields(
  facts: Record<string, unknown> | null | undefined,
  options: ValidateOptions = {}
): string[] {
  const result = validateTenancyRequiredFacts(facts, options);
  return [...result.missing_fields, ...result.invalid_fields];
}
