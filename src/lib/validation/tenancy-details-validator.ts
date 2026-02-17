export const REQUIRED_TENANCY_FIELDS = [
  'deposit_amount',
  'tenancy_start_date',
  'rent_amount',
  'term_length',
  'landlord_full_name',
  'tenants',
] as const;

export type RequiredTenancyField = (typeof REQUIRED_TENANCY_FIELDS)[number];

interface TenancyFacts {
  deposit_amount?: number | null;
  tenancy_start_date?: string | null;
  rent_amount?: number | null;
  term_length?: string | null;
  landlord_full_name?: string | null;
  tenants?: unknown[] | null;
}

/**
 * Checkout/fulfillment validator for tenancy agreement facts.
 * deposit_amount must allow £0 and only reject null/undefined.
 */
export function getMissingRequiredTenancyFields(
  facts: TenancyFacts | null | undefined
): RequiredTenancyField[] {
  const safeFacts = facts ?? {};
  const missing: RequiredTenancyField[] = [];

  if (safeFacts.deposit_amount === null || safeFacts.deposit_amount === undefined) {
    missing.push('deposit_amount');
  }

  if (!safeFacts.tenancy_start_date) {
    missing.push('tenancy_start_date');
  }

  if (safeFacts.rent_amount === null || safeFacts.rent_amount === undefined) {
    missing.push('rent_amount');
  }

  if (!safeFacts.term_length) {
    missing.push('term_length');
  }

  if (!safeFacts.landlord_full_name) {
    missing.push('landlord_full_name');
  }

  if (!Array.isArray(safeFacts.tenants) || safeFacts.tenants.length === 0) {
    missing.push('tenants');
  }

  return missing;
}

