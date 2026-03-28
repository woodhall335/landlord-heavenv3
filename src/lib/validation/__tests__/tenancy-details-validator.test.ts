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
    is_fixed_term: false,
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

  it('rejects England deposits that exceed the legal cap', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      rent_amount: 1000,
      rent_period: 'monthly',
      deposit_amount: 2000,
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toContain('deposit_amount');
  });

  it('accepts England deposits that stay within the legal cap', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      rent_amount: 1000,
      rent_period: 'monthly',
      deposit_amount: 1000,
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).not.toContain('deposit_amount');
  });

  it('rejects partial or non-calendar tenancy dates deterministically', () => {
    const partialDate = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05',
    }, { jurisdiction: 'england' });

    const impossibleDate = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-02-30',
    }, { jurisdiction: 'england' });

    expect(partialDate.invalid_fields).toContain('tenancy_start_date');
    expect(impossibleDate.invalid_fields).toContain('tenancy_start_date');
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

  it('blocks new England fixed-term AST structures starting on or after 1 May 2026', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      is_fixed_term: true,
      tenancy_end_date: '2027-05-01',
      term_length: '12 months',
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toContain('is_fixed_term');
    expect(result.missing_fields).not.toContain('tenancy_end_date');
    expect(result.missing_fields).not.toContain('term_length');
  });

  it('does not require tenancy structure selection for new England tenancies starting on or after 1 May 2026', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      is_fixed_term: undefined,
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
    }, { jurisdiction: 'england' });

    expect(result.missing_fields).not.toContain('is_fixed_term');
    expect(result.invalid_fields).not.toContain('is_fixed_term');
  });

  it('does not block existing written England transition cases from carrying legacy fixed-term data', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'existing_written_tenancy',
      existing_written_tenancy_transition: true,
      is_fixed_term: true,
      tenancy_end_date: '2027-05-01',
      term_length: '12 months',
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).not.toContain('is_fixed_term');
    expect(result.missing_fields).not.toContain('tenancy_end_date');
    expect(result.missing_fields).not.toContain('term_length');
  });

  it('requires the verbal tenancy written-information acknowledgement for England transition cases', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'existing_verbal_tenancy',
      existing_verbal_tenancy_summary: false,
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toContain('existing_verbal_tenancy_summary');
  });

  it('does not enforce England transition acknowledgements outside England', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'wales' },
      england_tenancy_purpose: 'existing_written_tenancy',
    }, { jurisdiction: 'wales' });

    expect(result.missing_fields).not.toContain('existing_written_tenancy_transition');
    expect(result.invalid_fields).not.toContain('existing_written_tenancy_transition');
  });

  it('requires the England operational confirmations for new tenancies starting on or after 1 May 2026', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
    }, { jurisdiction: 'england' });

    expect(result.missing_fields).toEqual(
      expect.arrayContaining([
        'england_rent_in_advance_compliant',
        'england_no_bidding_confirmed',
        'england_no_discrimination_confirmed',
      ])
    );
  });

  it('rejects negative England operational confirmations for new tenancies starting on or after 1 May 2026', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      england_rent_in_advance_compliant: false,
      england_no_bidding_confirmed: false,
      england_no_discrimination_confirmed: false,
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toEqual(
      expect.arrayContaining([
        'england_rent_in_advance_compliant',
        'england_no_bidding_confirmed',
        'england_no_discrimination_confirmed',
      ])
    );
  });

  it('does not enforce the England operational confirmations for pre-reform or non-England cases', () => {
    const preReformEngland = validateTenancyRequiredFacts({
      ...completeFacts,
      tenancy_start_date: '2026-04-30',
      england_tenancy_purpose: 'new_agreement',
    }, { jurisdiction: 'england' });

    const wales = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'wales' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
    }, { jurisdiction: 'wales' });

    expect(preReformEngland.missing_fields).not.toContain('england_rent_in_advance_compliant');
    expect(preReformEngland.missing_fields).not.toContain('england_no_bidding_confirmed');
    expect(preReformEngland.missing_fields).not.toContain('england_no_discrimination_confirmed');
    expect(wales.missing_fields).not.toContain('england_rent_in_advance_compliant');
    expect(wales.invalid_fields).not.toContain('england_no_bidding_confirmed');
    expect(wales.invalid_fields).not.toContain('england_no_discrimination_confirmed');
  });

  it('requires the expanded England assured-tenancy facts for modern England products', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
    }, { jurisdiction: 'england', product: 'england_standard_tenancy_agreement' });

    expect(result.missing_fields).toEqual(
      expect.arrayContaining([
        'tenant_notice_period',
        'rent_increase_method',
        'bills_included_in_rent',
        'separate_bill_payments_taken',
        'tenant_improvements_allowed_with_consent',
        'supported_accommodation_tenancy',
        'relevant_gas_fitting_present',
        'epc_rating',
        'right_to_rent_check_date',
        'electrical_safety_certificate',
        'smoke_alarms_fitted',
        'carbon_monoxide_alarms',
        'how_to_rent_provided',
      ])
    );
  });

  it('requires deposit scheme details and prior-notice context for modern England assured products when applicable', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'monthly',
      rent_due_day_of_month: '1st',
      payment_method: 'cash',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'yes',
      included_bills: ['gas', 'internet_broadband'],
      separate_bill_payments_taken: false,
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: false,
      relevant_gas_fitting_present: true,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      gas_safety_certificate: true,
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
      deposit_amount: 1200,
      record_prior_notice_grounds: true,
      prior_notice_grounds: ['ground_4_student_occupation'],
    }, { jurisdiction: 'england', product: 'england_student_tenancy_agreement' });

    expect(result.missing_fields).toEqual(
      expect.arrayContaining(['deposit_scheme_name', 'prior_notice_ground_4_details'])
    );
  });

  it('accepts natural Section 13 wording and requires detailed separate bill rows plus supported accommodation explanation when applicable', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'monthly',
      rent_due_day_of_month: '1st',
      payment_method: 'cash',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'no',
      separate_bill_payments_taken: true,
      separate_bill_payment_rows: [
        { bill_type: 'communications', amount_detail: '', due_detail: '' },
      ],
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: true,
      relevant_gas_fitting_present: false,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
    }, { jurisdiction: 'england', product: 'england_standard_tenancy_agreement' });

    expect(result.invalid_fields).not.toContain('rent_increase_method');
    expect(result.missing_fields).toEqual(
      expect.arrayContaining([
        'separate_bill_payment_rows[0].amount_detail',
        'separate_bill_payment_rows[0].due_detail',
        'supported_accommodation_explanation',
      ])
    );
  });

  it('requires bank details and the correct rent due selector for modern England assured products', () => {
    const bankTransferResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'monthly',
      payment_method: 'bank_transfer',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'no',
      separate_bill_payments_taken: false,
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: false,
      relevant_gas_fitting_present: false,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
    }, { jurisdiction: 'england', product: 'england_standard_tenancy_agreement' });

    expect(bankTransferResult.missing_fields).toEqual(
      expect.arrayContaining([
        'rent_due_day_of_month',
        'payment_account_name',
        'payment_sort_code',
        'payment_account_number',
      ])
    );

    const weeklyResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'weekly',
      payment_method: 'cash',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'no',
      separate_bill_payments_taken: false,
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: false,
      relevant_gas_fitting_present: false,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
    }, { jurisdiction: 'england', product: 'england_standard_tenancy_agreement' });

    expect(weeklyResult.missing_fields).toContain('rent_due_weekday');
    expect(weeklyResult.missing_fields).not.toContain('payment_account_name');
  });

  it('requires included bill selections and only validates prior-notice detail when advanced grounds are enabled', () => {
    const billsResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'monthly',
      rent_due_day_of_month: '1st',
      payment_method: 'cash',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'yes',
      separate_bill_payments_taken: false,
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: false,
      relevant_gas_fitting_present: false,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
      prior_notice_grounds: ['ground_4_student_occupation'],
    }, { jurisdiction: 'england', product: 'england_student_tenancy_agreement' });

    expect(billsResult.missing_fields).toContain('included_bills');
    expect(billsResult.missing_fields).not.toContain('prior_notice_ground_4_details');

    const priorNoticeResult = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'new_agreement',
      rent_frequency: 'monthly',
      rent_due_day_of_month: '1st',
      payment_method: 'cash',
      england_rent_in_advance_compliant: true,
      england_no_bidding_confirmed: true,
      england_no_discrimination_confirmed: true,
      tenant_notice_period: '2 months',
      rent_increase_method: 'Section 13 rent increase process',
      bills_included_in_rent: 'no',
      separate_bill_payments_taken: false,
      tenant_improvements_allowed_with_consent: true,
      supported_accommodation_tenancy: false,
      relevant_gas_fitting_present: false,
      epc_rating: 'C',
      right_to_rent_check_date: '2026-04-20',
      electrical_safety_certificate: true,
      smoke_alarms_fitted: true,
      carbon_monoxide_alarms: true,
      how_to_rent_provided: true,
      record_prior_notice_grounds: true,
      prior_notice_grounds: ['ground_4_student_occupation'],
    }, { jurisdiction: 'england', product: 'england_student_tenancy_agreement' });

    expect(priorNoticeResult.missing_fields).toContain('prior_notice_ground_4_details');
  });

  it('does not require the expanded assured-tenancy facts for existing written England transition packs', () => {
    const result = validateTenancyRequiredFacts({
      ...completeFacts,
      __meta: { jurisdiction: 'england' },
      tenancy_start_date: '2026-05-02',
      england_tenancy_purpose: 'existing_written_tenancy',
      existing_written_tenancy_transition: true,
    }, { jurisdiction: 'england', product: 'england_hmo_shared_house_tenancy_agreement' });

    expect(result.missing_fields).not.toContain('tenant_notice_period');
    expect(result.missing_fields).not.toContain('rent_increase_method');
    expect(result.missing_fields).not.toContain('epc_rating');
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
