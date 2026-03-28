import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { calculateDepositCap } from '@/lib/validation/mqs-field-validator';
import {
  getEnglandTenancyPurpose,
  isEnglandPostReformTenancy,
  normalizeIsoDateString,
} from '@/lib/tenancy/england-reform';
import { isEnglandModernTenancyProductSku } from '@/lib/tenancy/england-product-model';

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
  product?: string | null;
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

function isEnglandModernAssuredProduct(value: string | null | undefined): boolean {
  return (
    isEnglandModernTenancyProductSku(value) &&
    value !== 'england_lodger_agreement'
  );
}

function parseTenantNoticePeriodDays(value: unknown): number | null {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!text) return null;

  const knownValues: Record<string, number> = {
    '28 days': 28,
    '1 month': 31,
    '6 weeks': 42,
    '2 months': 62,
  };

  if (knownValues[text]) return knownValues[text];

  const dayMatch = text.match(/^(\d+)\s+days?$/);
  if (dayMatch) return Number(dayMatch[1]);

  const weekMatch = text.match(/^(\d+)\s+weeks?$/);
  if (weekMatch) return Number(weekMatch[1]) * 7;

  const monthMatch = text.match(/^(\d+)\s+months?$/);
  if (monthMatch) return Number(monthMatch[1]) * 31;

  return null;
}

function normalizePaymentMethodText(value: unknown): string {
  const text = typeof value === 'string' ? value.trim().toLowerCase().replace(/\s+/g, '_') : '';
  if (text === 'standing_order') return 'bank_transfer';
  return text;
}

function requiresWeeklyRentDueSelection(value: unknown): boolean {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return text === 'weekly' || text === 'week';
}

function requiresPeriodicRentDueDaySelection(value: unknown): boolean {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ['monthly', 'month', 'quarterly', 'quarter', 'yearly', 'year'].includes(text);
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
  const product = options.product || (wizardFacts.__meta as any)?.canonical_product || (wizardFacts.__meta as any)?.product || null;

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
  const isModernEnglandAssuredProduct =
    jurisdiction === 'england' && isEnglandModernAssuredProduct(product);

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

  if (isModernEnglandAssuredProduct) {
    const tenantNoticePeriod = wizardFacts.tenant_notice_period;
    const rentIncreaseMethod = wizardFacts.rent_increase_method;
    const billsIncludedInRent = wizardFacts.bills_included_in_rent;
    const normalizedPaymentMethod = normalizePaymentMethodText(wizardFacts.payment_method);
    const separateBillPaymentsTaken = toOptionalBoolean(
      wizardFacts.separate_bill_payments_taken
    );
    const recordPriorNoticeGrounds = toOptionalBoolean(wizardFacts.record_prior_notice_grounds);
    const tenantImprovementsAllowedWithConsent = toOptionalBoolean(
      wizardFacts.tenant_improvements_allowed_with_consent
    );
    const supportedAccommodationTenancy = toOptionalBoolean(
      wizardFacts.supported_accommodation_tenancy
    );
    const relevantGasFittingPresent = toOptionalBoolean(
      wizardFacts.relevant_gas_fitting_present
    );

    if (englandTenancyPurpose !== 'existing_written_tenancy') {
      if (isBlankString(tenantNoticePeriod)) {
        missing.add('tenant_notice_period');
      } else {
        const noticeDays = parseTenantNoticePeriodDays(tenantNoticePeriod);
        if (noticeDays !== null && noticeDays > 62) {
          invalid.add('tenant_notice_period');
        }
      }

      if (isBlankString(rentIncreaseMethod)) {
        missing.add('rent_increase_method');
      } else {
        const normalizedRentIncreaseMethod = String(rentIncreaseMethod)
          .toLowerCase()
          .replace(/\s+/g, '_');
        if (!normalizedRentIncreaseMethod.includes('section_13')) {
          invalid.add('rent_increase_method');
        }
      }

      if (requiresWeeklyRentDueSelection(rentFrequency)) {
        if (isBlankString(wizardFacts.rent_due_weekday)) {
          missing.add('rent_due_weekday');
        }
      } else if (requiresPeriodicRentDueDaySelection(rentFrequency)) {
        if (isBlankString(wizardFacts.rent_due_day_of_month)) {
          missing.add('rent_due_day_of_month');
        }
      }

      if (isBlankString(wizardFacts.payment_method)) {
        missing.add('payment_method');
      } else if (!['bank_transfer', 'cash'].includes(normalizedPaymentMethod)) {
        invalid.add('payment_method');
      } else if (normalizedPaymentMethod === 'bank_transfer') {
        if (isBlankString(wizardFacts.payment_account_name)) {
          missing.add('payment_account_name');
        }
        if (isBlankString(wizardFacts.payment_sort_code)) {
          missing.add('payment_sort_code');
        }
        if (isBlankString(wizardFacts.payment_account_number)) {
          missing.add('payment_account_number');
        }
      }

      if (isBlankString(billsIncludedInRent)) {
        missing.add('bills_included_in_rent');
      } else if (
        String(billsIncludedInRent).trim().toLowerCase() === 'yes' &&
        (!Array.isArray(wizardFacts.included_bills) || wizardFacts.included_bills.length === 0)
      ) {
        missing.add('included_bills');
      }

      if (separateBillPaymentsTaken === undefined) {
        missing.add('separate_bill_payments_taken');
      } else if (
        separateBillPaymentsTaken === true &&
        (!Array.isArray(wizardFacts.separate_bill_payment_rows) ||
          wizardFacts.separate_bill_payment_rows.length === 0)
      ) {
        missing.add('separate_bill_payment_rows');
      } else if (separateBillPaymentsTaken === true) {
        const separateBillPaymentRows = Array.isArray(wizardFacts.separate_bill_payment_rows)
          ? (wizardFacts.separate_bill_payment_rows as Array<Record<string, unknown>>)
          : [];

        separateBillPaymentRows.forEach((row, index) => {
          if (isBlankString(row.bill_type)) {
            missing.add(`separate_bill_payment_rows[${index}].bill_type`);
          }
          if (isBlankString(row.amount_detail)) {
            missing.add(`separate_bill_payment_rows[${index}].amount_detail`);
          }
          if (isBlankString(row.due_detail)) {
            missing.add(`separate_bill_payment_rows[${index}].due_detail`);
          }
        });
      }

      if (tenantImprovementsAllowedWithConsent === undefined) {
        missing.add('tenant_improvements_allowed_with_consent');
      }

      if (supportedAccommodationTenancy === undefined) {
        missing.add('supported_accommodation_tenancy');
      } else if (
        supportedAccommodationTenancy === true &&
        isBlankString(wizardFacts.supported_accommodation_explanation)
      ) {
        missing.add('supported_accommodation_explanation');
      }

      if (relevantGasFittingPresent === undefined) {
        missing.add('relevant_gas_fitting_present');
      } else if (
        relevantGasFittingPresent === true &&
        toOptionalBoolean(wizardFacts.gas_safety_certificate) === undefined
      ) {
        missing.add('gas_safety_certificate');
      }

      if (isBlankString(wizardFacts.epc_rating)) missing.add('epc_rating');
      if (!hasValidDate(wizardFacts.right_to_rent_check_date)) {
        if (isBlankString(wizardFacts.right_to_rent_check_date)) {
          missing.add('right_to_rent_check_date');
        } else {
          invalid.add('right_to_rent_check_date');
        }
      }
      if (toOptionalBoolean(wizardFacts.electrical_safety_certificate) === undefined) {
        missing.add('electrical_safety_certificate');
      }
      if (toOptionalBoolean(wizardFacts.smoke_alarms_fitted) === undefined) {
        missing.add('smoke_alarms_fitted');
      }
      if (toOptionalBoolean(wizardFacts.carbon_monoxide_alarms) === undefined) {
        missing.add('carbon_monoxide_alarms');
      }
      if (toOptionalBoolean(wizardFacts.how_to_rent_provided) === undefined) {
        missing.add('how_to_rent_provided');
      }

      if (depositAmount !== null && depositAmount > 0 && isBlankString(wizardFacts.deposit_scheme_name)) {
        missing.add('deposit_scheme_name');
      }

      if (recordPriorNoticeGrounds === true) {
        const priorNoticeGrounds = Array.isArray(wizardFacts.prior_notice_grounds)
          ? (wizardFacts.prior_notice_grounds as string[])
          : [];

        if (
          priorNoticeGrounds.includes('ground_4_student_occupation') &&
          isBlankString(wizardFacts.prior_notice_ground_4_details)
        ) {
          missing.add('prior_notice_ground_4_details');
        }

        if (
          priorNoticeGrounds.includes('ground_4a_students_for_new_students') &&
          isBlankString(wizardFacts.prior_notice_ground_4a_details)
        ) {
          missing.add('prior_notice_ground_4a_details');
        }

        if (
          priorNoticeGrounds.some((ground) =>
            [
              'ground_5e_supported_accommodation',
              'ground_5f_supported_dwelling_house',
              'ground_5g_homelessness_duty',
              'ground_5h_stepping_stone',
              'ground_18_supported_accommodation',
            ].includes(ground)
          ) &&
          isBlankString(wizardFacts.prior_notice_supported_accommodation_details)
        ) {
          missing.add('prior_notice_supported_accommodation_details');
        }
      }
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
