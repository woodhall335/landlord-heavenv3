import { describe, test, expect } from '@jest/globals';
import { mapWizardToPrivateTenancyData } from '@/lib/documents/northern-ireland/private-tenancy-wizard-mapper';

describe('Private Tenancy Wizard Mapper - Northern Ireland', () => {
  test('should map basic private tenancy data correctly', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road, Belfast, BT1 1AA',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      tenants: [
        {
          full_name: 'Patrick Murphy',
          dob: '1988-05-15',
          email: 'patrick@example.com',
          phone: '028 9087 6543',
        },
      ],

      property_address: '25 Derry Road, Londonderry, BT2 2BB',
      tenancy_start_date: '2024-02-01',
      is_fixed_term: true,
      tenancy_end_date: '2025-02-01',
      term_length: '12 months',

      rent_amount: 750,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Standing Order',
      payment_details: 'Sort Code: 98-76-54, Account: 87654321',

      deposit_amount: 750,
      deposit_scheme_name: 'TDS Northern Ireland',
    };

    const result = mapWizardToPrivateTenancyData(facts);

    // Landlord details
    expect(result.landlord.full_name).toBe('Mary O\'Brien');
    expect(result.landlord.address).toBe('10 Belfast Road, Belfast, BT1 1AA');
    expect(result.landlord.email).toBe('mary@example.com');
    expect(result.landlord_full_name).toBe('Mary O\'Brien'); // Flattened helper
    expect(result.landlord_address).toBe('10 Belfast Road, Belfast, BT1 1AA'); // Flattened helper

    // Tenant details
    expect(result.tenants).toHaveLength(1);
    expect(result.tenants[0].full_name).toBe('Patrick Murphy');
    expect(result.number_of_tenants).toBe(1);
    expect(result.multiple_tenants).toBe(false);

    // Property details
    expect(result.property_address).toBe('25 Derry Road, Londonderry, BT2 2BB');
    expect(result.tenancy_start_date).toBe('2024-02-01');
    expect(result.is_fixed_term).toBe(true);
    expect(result.tenancy_end_date).toBe('2025-02-01');
    expect(result.term_length).toBe('12 months');

    // Rent details
    expect(result.rent_amount).toBe(750);
    expect(result.rent_period).toBe('month');
    expect(result.deposit_amount).toBe(750);
    expect(result.deposit_scheme).toBe('TDS Northern Ireland');
  });

  test('should handle multiple tenants correctly', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      tenants: [
        { full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' },
        { full_name: 'Sean Kelly', dob: '1990-08-20', email: 'sean@example.com', phone: '028 9087 2222' },
      ],

      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 900,
      deposit_amount: 900,
    };

    const result = mapWizardToPrivateTenancyData(facts);

    expect(result.tenants).toHaveLength(2);
    expect(result.number_of_tenants).toBe(2);
    expect(result.multiple_tenants).toBe(true);
    expect(result.tenants[0].full_name).toBe('Patrick Murphy');
    expect(result.tenants[1].full_name).toBe('Sean Kelly');
  });

  test('should handle agent details correctly', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      agent_name: 'Belfast Properties Ltd',
      agent_company: 'Belfast Properties Limited',
      agent_address: '100 High Street, Belfast, BT1 5AA',
      agent_email: 'info@belfastproperties.com',
      agent_phone: '028 9012 9999',
      agent_signs: 'true',

      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],

      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,
    };

    const result = mapWizardToPrivateTenancyData(facts);

    expect(result.agent).toBeDefined();
    expect(result.agent?.name).toBe('Belfast Properties Ltd');
    expect(result.agent?.company).toBe('Belfast Properties Limited');
    expect(result.agent?.address).toBe('100 High Street, Belfast, BT1 5AA');
    expect(result.agent?.signs).toBe(true);

    // Flattened helpers
    expect(result.agent_name).toBe('Belfast Properties Ltd');
    expect(result.agent_address).toBe('100 High Street, Belfast, BT1 5AA');
    expect(result.agent_signs).toBe(true);
  });

  test('should map Premium Enhanced Features correctly', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],

      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,

      // Premium Enhanced Features
      number_of_front_door_keys: 3,
      number_of_back_door_keys: 2,
      key_replacement_cost: 75,

      emergency_landlord_phone: '07700 800000',
      water_shutoff_location: 'Outside meter cupboard',
      gas_shutoff_location: 'Next to boiler',

      boiler_service_frequency: 'Annual',
      gutter_cleaning_frequency: 'Biannual',

      lawn_mowing_responsibility: 'Tenant',
      hedge_trimming_responsibility: 'Landlord',

      pre_tenancy_meeting_required: 'yes',
      move_in_inspection_required: 'true',
      checkout_inspection_required: 'yes',

      regular_cleaning_expectations: 'Fortnightly deep clean',
      deep_cleaning_areas: ['Kitchen', 'Bathroom', 'Windows'],
      cleaning_cost_estimates: 200,
    };

    const result = mapWizardToPrivateTenancyData(facts);

    // Key Schedule
    expect(result.number_of_front_door_keys).toBe(3);
    expect(result.number_of_back_door_keys).toBe(2);
    expect(result.key_replacement_cost).toBe(75);

    // Emergency Procedures
    expect(result.emergency_landlord_phone).toBe('07700 800000');
    expect(result.water_shutoff_location).toBe('Outside meter cupboard');
    expect(result.gas_shutoff_location).toBe('Next to boiler');

    // Maintenance Schedule
    expect(result.boiler_service_frequency).toBe('Annual');
    expect(result.gutter_cleaning_frequency).toBe('Biannual');

    // Garden Maintenance
    expect(result.lawn_mowing_responsibility).toBe('Tenant');
    expect(result.hedge_trimming_responsibility).toBe('Landlord');

    // Move-In/Out Procedures
    expect(result.pre_tenancy_meeting_required).toBe(true);
    expect(result.move_in_inspection_required).toBe(true);
    expect(result.checkout_inspection_required).toBe(true);

    // Cleaning Standards
    expect(result.regular_cleaning_expectations).toBe('Fortnightly deep clean');
    expect(result.deep_cleaning_areas).toEqual(['Kitchen', 'Bathroom', 'Windows']);
    expect(result.cleaning_cost_estimates).toBe(200);
  });

  test('should handle address building from components', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address_line1: '10 Belfast Road',
      landlord_address_town: 'Belfast',
      landlord_address_postcode: 'BT1 1AA',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],

      property_address_line1: '25 Derry Road',
      property_address_town: 'Londonderry',
      property_address_postcode: 'BT2 2BB',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,
    };

    const result = mapWizardToPrivateTenancyData(facts);

    expect(result.landlord_address).toBe('10 Belfast Road, Belfast, BT1 1AA');
    expect(result.property_address).toBe('25 Derry Road, Londonderry, BT2 2BB');
  });

  test('should normalize deposit scheme names', () => {
    const factsWithTDS = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',
      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],
      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,
      deposit_scheme_name: 'TDS Northern Ireland',
    };

    const result1 = mapWizardToPrivateTenancyData(factsWithTDS);
    expect(result1.deposit_scheme).toBe('TDS Northern Ireland');

    const factsWithMyDeposits = {
      ...factsWithTDS,
      deposit_scheme_name: 'mydeposits ni',
    };

    const result2 = mapWizardToPrivateTenancyData(factsWithMyDeposits);
    expect(result2.deposit_scheme).toBe('MyDeposits Northern Ireland');
  });

  test('should handle domestic rates registration deadline (NI specific)', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',
      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],
      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,

      domestic_rates_registration_deadline: '7 days from tenancy start',
    };

    const result = mapWizardToPrivateTenancyData(facts);

    expect(result.domestic_rates_registration_deadline).toBe('7 days from tenancy start');
  });

  test('should handle HMO properties correctly', () => {
    const facts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',

      tenants: [
        { full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' },
        { full_name: 'Sean Kelly', dob: '1990-08-20', email: 'sean@example.com', phone: '028 9087 2222' },
        { full_name: 'Liam Byrne', dob: '1992-11-10', email: 'liam@example.com', phone: '028 9087 3333' },
      ],

      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 1200,
      deposit_amount: 1200,

      is_hmo: 'yes',
      hmo_licence_number: 'HMO-NI-67890',
      hmo_licence_status: 'Active',
      number_of_sharers: 3,
      communal_areas: 'true',
      communal_cleaning: 'Rota system',
    };

    const result = mapWizardToPrivateTenancyData(facts);

    expect(result.is_hmo).toBe(true);
    expect(result.hmo_licence_number).toBe('HMO-NI-67890');
    expect(result.hmo_licence_status).toBe('Active');
    expect(result.number_of_sharers).toBe(3);
    expect(result.communal_areas).toBe(true);
    expect(result.communal_cleaning).toBe('Rota system');
  });

  test('should handle product tier mapping', () => {
    const factsWithProductTier = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',
      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],
      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,
      product_tier: 'Premium Private Tenancy',
    };

    const result1 = mapWizardToPrivateTenancyData(factsWithProductTier);
    expect(result1.product_tier).toBe('Premium Private Tenancy');

    const factsWithTenancyTier = {
      ...factsWithProductTier,
      product_tier: undefined,
      tenancy_tier: 'Standard Private Tenancy',
    };

    const result2 = mapWizardToPrivateTenancyData(factsWithTenancyTier);
    expect(result2.product_tier).toBe('Standard Private Tenancy');
  });

  test('should handle missing optional fields gracefully', () => {
    const minimalFacts = {
      landlord_full_name: 'Mary O\'Brien',
      landlord_address: '10 Belfast Road',
      landlord_email: 'mary@example.com',
      landlord_phone: '028 9012 3456',
      tenants: [{ full_name: 'Patrick Murphy', dob: '1988-05-15', email: 'patrick@example.com', phone: '028 9087 1111' }],
      property_address: '25 Derry Road',
      tenancy_start_date: '2024-02-01',
      rent_amount: 750,
      deposit_amount: 750,
    };

    const result = mapWizardToPrivateTenancyData(minimalFacts);

    expect(result.landlord_full_name).toBe('Mary O\'Brien');
    expect(result.property_address).toBe('25 Derry Road');
    expect(result.rent_amount).toBe(750);

    // Optional fields should be undefined or have sensible defaults
    expect(result.agent).toBeUndefined();
    expect(result.is_fixed_term).toBe(false);
    expect(result.rent_period).toBe('month'); // Default
    expect(result.tenant_notice_period).toBe('28 days'); // Default
  });
});
