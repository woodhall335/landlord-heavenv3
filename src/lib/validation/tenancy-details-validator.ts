import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { calculateDepositCap } from '@/lib/validation/mqs-field-validator';
import {
  getEnglandTenancyPurpose,
  isEnglandPostReformTenancy,
  normalizeIsoDateString,
} from '@/lib/tenancy/england-reform';

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
  return normalizeIsoDateString(value) !== undefined;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === 'no') return false;
  }

  return undefined;
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

  const rentFrequency =
    (caseFacts.tenancy as any).rent_frequency ||
    (wizardFacts.rent_period as string | undefined) ||
    (wizardFacts.rent_frequency as string | undefined);

  if (jurisdiction === 'england' && rentAmount !== null && depositAmount !== null && depositAmount > 0) {
    const depositCap = calculateDepositCap(rentAmount, rentFrequency, depositAmount);
    if (depositCap?.exceeds) {
      invalid.add('deposit_amount');
    }
  }

  const isFixedTerm =
    typeof wizardFacts.is_fixed_term === 'boolean'
      ? wizardFacts.is_fixed_term
      : caseFacts.tenancy.fixed_term;

  const englandTenancyPurpose = getEnglandTenancyPurpose(wizardFacts.england_tenancy_purpose);
  const englandPostReformStart = isEnglandPostReformTenancy({
    jurisdiction,
    tenancyStartDate: startDate,
    purpose: englandTenancyPurpose,
  });
  const existingWrittenTransitionAcknowledged = toOptionalBoolean(
    wizardFacts.existing_written_tenancy_transition
  );
  const existingVerbalTransitionAcknowledged = toOptionalBoolean(
    wizardFacts.existing_verbal_tenancy_summary
  );
  const englandRentInAdvanceCompliant = toOptionalBoolean(
    wizardFacts.england_rent_in_advance_compliant
  );
  const englandNoBiddingConfirmed = toOptionalBoolean(
    wizardFacts.england_no_bidding_confirmed
  );
  const englandNoDiscriminationConfirmed = toOptionalBoolean(
    wizardFacts.england_no_discrimination_confirmed
  );

  if (jurisdiction === 'england' && englandTenancyPurpose === 'existing_written_tenancy') {
    if (existingWrittenTransitionAcknowledged === undefined) {
      missing.add('existing_written_tenancy_transition');
    } else if (existingWrittenTransitionAcknowledged !== true) {
      invalid.add('existing_written_tenancy_transition');
    }
  }

  if (jurisdiction === 'england' && englandTenancyPurpose === 'existing_verbal_tenancy') {
    if (existingVerbalTransitionAcknowledged === undefined) {
      missing.add('existing_verbal_tenancy_summary');
    } else if (existingVerbalTransitionAcknowledged !== true) {
      invalid.add('existing_verbal_tenancy_summary');
    }
  }

  if (englandPostReformStart && isFixedTerm === true) {
    invalid.add('is_fixed_term');
  } else if (
    jurisdiction !== 'scotland' &&
    !(jurisdiction === 'england' && englandPostReformStart) &&
    isFixedTerm === undefined
  ) {
    missing.add('is_fixed_term');
  } else if (jurisdiction !== 'scotland' && isFixedTerm === true) {
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

  if (englandPostReformStart) {
    if (englandRentInAdvanceCompliant === undefined) {
      missing.add('england_rent_in_advance_compliant');
    } else if (englandRentInAdvanceCompliant !== true) {
      invalid.add('england_rent_in_advance_compliant');
    }

    if (englandNoBiddingConfirmed === undefined) {
      missing.add('england_no_bidding_confirmed');
    } else if (englandNoBiddingConfirmed !== true) {
      invalid.add('england_no_bidding_confirmed');
    }

    if (englandNoDiscriminationConfirmed === undefined) {
      missing.add('england_no_discrimination_confirmed');
    } else if (englandNoDiscriminationConfirmed !== true) {
      invalid.add('england_no_discrimination_confirmed');
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
