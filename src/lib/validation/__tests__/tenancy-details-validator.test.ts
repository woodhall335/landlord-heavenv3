import { describe, expect, it } from 'vitest';
import { getMissingRequiredTenancyFields } from '@/lib/validation/tenancy-details-validator';

describe('getMissingRequiredTenancyFields', () => {
  it('allows deposit_amount = 0', () => {
    const missing = getMissingRequiredTenancyFields({
      deposit_amount: 0,
      tenancy_start_date: '2026-01-01',
      rent_amount: 1200,
      term_length: '12 months',
      landlord_full_name: 'Jane Landlord',
      tenants: [{ full_name: 'John Tenant' }],
    });

    expect(missing).toEqual([]);
  });

  it('returns required missing fields including null deposit', () => {
    const missing = getMissingRequiredTenancyFields({
      deposit_amount: null,
      tenancy_start_date: null,
      rent_amount: null,
      term_length: '',
      landlord_full_name: '',
      tenants: [],
    });

    expect(missing).toEqual([
      'deposit_amount',
      'tenancy_start_date',
      'rent_amount',
      'term_length',
      'landlord_full_name',
      'tenants',
    ]);
  });
});
