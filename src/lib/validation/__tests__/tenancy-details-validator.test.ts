import { describe, expect, it } from 'vitest';
import {
  getMissingRequiredTenancyFields,
  validateTenancyRequiredFacts,
} from '@/lib/validation/tenancy-details-validator';

describe('validateTenancyRequiredFacts', () => {
  const completeFacts = {
    __meta: { jurisdiction: 'england' },
    landlord_full_name: 'Jane Landlord',
    landlord_email: 'jane@example.com',
    landlord_phone: '07123456789',
    landlord_address_line1: '1 High Street',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    property_address_line1: '2 Main Road',
    property_address_town: 'London',
    property_address_postcode: 'E1 1AA',
    tenancy_start_date: '2026-01-01',
    rent_amount: 1200,
    deposit_amount: 0,
    tenants: [
      {
        full_name: 'John Tenant',
        email: 'john@example.com',
        phone: '07999999999',
      },
    ],
  };

  it('allows deposit_amount = 0', () => {
    const result = validateTenancyRequiredFacts(completeFacts, { jurisdiction: 'england' });
    expect(result.missing_fields).toEqual([]);
    expect(result.invalid_fields).toEqual([]);
  });

  it('treats empty strings as missing for required string fields', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      landlord_full_name: '   ',
      property_address_line1: '',
    }, { jurisdiction: 'england' });

    expect(result.missing_fields).toEqual(
      expect.arrayContaining(['landlord_full_name', 'property_address_line1'])
    );
  });

  it('flags invalid numeric/date fields', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      rent_amount: 0,
      deposit_amount: -1,
      tenancy_start_date: 'not-a-date',
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toEqual(
      expect.arrayContaining(['rent_amount', 'deposit_amount', 'tenancy_start_date'])
    );
  });

  it('requires tenant contact fields and non-empty tenant array', () => {
    const noTenants = validateTenancyRequiredFacts({ ...completeFacts, tenants: [] }, { jurisdiction: 'england' });
    expect(noTenants.missing_fields).toContain('tenants');

    const incompleteTenant = validateTenancyRequiredFacts({
      ...completeFacts,
      tenants: [{ full_name: 'John Tenant', email: '', phone: '' }],
    }, { jurisdiction: 'england' });
    expect(incompleteTenant.missing_fields).toEqual(
      expect.arrayContaining(['tenants[0].email', 'tenants[0].phone'])
    );
  });

  it('requires fixed-term fields outside Scotland when is_fixed_term is true', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      is_fixed_term: true,
      tenancy_end_date: '',
      term_length: '',
    }, { jurisdiction: 'england' });

    expect(result.missing_fields).toEqual(
      expect.arrayContaining(['tenancy_end_date', 'term_length'])
    );
  });

  it('does not require fixed-term fields for Scotland PRT', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'scotland' },
      is_fixed_term: true,
      tenancy_end_date: '',
      term_length: '',
      landlord_registration_number: '123456/999/12345',
    }, { jurisdiction: 'scotland' });

    expect(result.missing_fields).not.toContain('tenancy_end_date');
    expect(result.missing_fields).not.toContain('term_length');
  });

  it('enforces Scotland landlord registration and NI payment core fields', () => {
    const scotlandResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'scotland' },
      landlord_registration_number: '',
    }, { jurisdiction: 'scotland' });
    expect(scotlandResult.missing_fields).toContain('landlord_registration_number');

    const niResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'northern-ireland' },
      agreement_date: '',
      rent_due_day: '',
      payment_method: '',
      payment_details: '',
    }, { jurisdiction: 'northern-ireland' });
    expect(niResult.missing_fields).toEqual(
      expect.arrayContaining(['agreement_date', 'rent_due_day', 'payment_method', 'payment_details'])
    );
  });
});

describe('getMissingRequiredTenancyFields', () => {
  it('returns combined missing + invalid field list', () => {
    const fields = getMissingRequiredTenancyFields({
      tenancy_start_date: 'bad-date',
      deposit_amount: null,
      rent_amount: 0,
      tenants: [],
    }, { jurisdiction: 'england' });

    expect(fields).toEqual(expect.arrayContaining([
      'deposit_amount',
      'tenants',
      'tenancy_start_date',
      'rent_amount',
    ]));
  });
});
