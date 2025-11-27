import { describe, test, expect } from 'vitest';
import { mapWizardToPRTData } from '@/lib/documents/scotland/prt-wizard-mapper';

describe('PRT Wizard Mapper - Scotland', () => {
  test('should map basic PRT data correctly', () => {
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road, Edinburgh, EH1 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',
      landlord_reg_number: 'LL123456',
      registration_authority: 'City of Edinburgh Council',

      tenants: [
        {
          full_name: 'Jane Doe',
          dob: '1990-01-01',
          email: 'jane@example.com',
          phone: '0131 987 6543',
        },
      ],

      property_address: '456 Glasgow Road, Glasgow, G1 1AA',
      tenancy_start_date: '2024-01-01',

      rent_amount: 1000,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Bank Transfer',
      payment_details: 'Sort Code: 12-34-56, Account: 12345678',

      deposit_amount: 1150,
      deposit_scheme_name: 'SafeDeposits Scotland',
    };

    const result = mapWizardToPRTData(facts);

    expect(result.landlord_full_name).toBe('John Smith');
    expect(result.landlord_address).toBe('123 Edinburgh Road, Edinburgh, EH1 1AA');
    expect(result.landlord_reg_number).toBe('LL123456');
    expect(result.registration_authority).toBe('City of Edinburgh Council');

    expect(result.tenants).toHaveLength(1);
    expect(result.tenants[0].full_name).toBe('Jane Doe');
    expect(result.number_of_tenants).toBe(1);

    expect(result.property_address).toBe('456 Glasgow Road, Glasgow, G1 1AA');
    expect(result.tenancy_start_date).toBe('2024-01-01');
    expect(result.is_fixed_term).toBe(false); // Always false for PRTs

    expect(result.rent_amount).toBe(1000);
    expect(result.rent_period).toBe('month');
    expect(result.deposit_amount).toBe(1150);
    expect(result.deposit_scheme_name).toBe('SafeDeposits Scotland');
  });

  test('should handle multiple tenants correctly', () => {
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',

      tenants: [
        { full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' },
        { full_name: 'John Doe', dob: '1991-02-02', email: 'john@example.com', phone: '0131 222 2222' },
      ],

      property_address: '456 Glasgow Road',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1500,
      deposit_amount: 1730,
    };

    const result = mapWizardToPRTData(facts);

    expect(result.tenants).toHaveLength(2);
    expect(result.number_of_tenants).toBe(2);
    expect(result.multiple_tenants).toBe(true);
    expect(result.tenants[0].number).toBe(1);
    expect(result.tenants[1].number).toBe(2);
  });

  test('should map Premium Enhanced Features correctly', () => {
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',

      tenants: [{ full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' }],

      property_address: '456 Glasgow Road',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      deposit_amount: 1150,

      // Premium Enhanced Features
      number_of_front_door_keys: 2,
      number_of_back_door_keys: 1,
      key_replacement_cost: 50,

      emergency_landlord_phone: '07700 900000',
      water_shutoff_location: 'Under kitchen sink',
      electricity_fuse_box_location: 'Hallway cupboard',

      boiler_service_frequency: 'Annual',
      lawn_mowing_frequency: 'Fortnightly in summer',

      pre_tenancy_meeting_required: 'true',
      checkout_inspection_required: 'yes',

      regular_cleaning_expectations: 'Weekly hoovering and dusting',
      cleaning_cost_estimates: 150,
    };

    const result = mapWizardToPRTData(facts);

    // Key Schedule
    expect(result.number_of_front_door_keys).toBe(2);
    expect(result.number_of_back_door_keys).toBe(1);
    expect(result.key_replacement_cost).toBe(50);

    // Emergency Procedures
    expect(result.emergency_landlord_phone).toBe('07700 900000');
    expect(result.water_shutoff_location).toBe('Under kitchen sink');
    expect(result.electricity_fuse_box_location).toBe('Hallway cupboard');

    // Maintenance Schedule
    expect(result.boiler_service_frequency).toBe('Annual');

    // Garden Maintenance
    expect(result.lawn_mowing_frequency).toBe('Fortnightly in summer');

    // Move-In/Out Procedures
    expect(result.pre_tenancy_meeting_required).toBe(true);
    expect(result.checkout_inspection_required).toBe(true);

    // Cleaning Standards
    expect(result.regular_cleaning_expectations).toBe('Weekly hoovering and dusting');
    expect(result.cleaning_cost_estimates).toBe(150);
  });

  test('should handle address building from components', () => {
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address_line1: '123 High Street',
      landlord_address_town: 'Edinburgh',
      landlord_address_postcode: 'EH1 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',

      tenants: [{ full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' }],

      property_address_line1: '456 Main Street',
      property_address_town: 'Glasgow',
      property_address_postcode: 'G1 1AA',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      deposit_amount: 1150,
    };

    const result = mapWizardToPRTData(facts);

    expect(result.landlord_address).toBe('123 High Street, Edinburgh, EH1 1AA');
    expect(result.property_address).toBe('456 Main Street, Glasgow, G1 1AA');
  });

  test('should normalize deposit scheme names', () => {
    const factsWithSafeDeposits = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',
      tenants: [{ full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' }],
      property_address: '456 Glasgow Road',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      deposit_amount: 1150,
      deposit_scheme_name: 'safedeposits scotland',
    };

    const result1 = mapWizardToPRTData(factsWithSafeDeposits);
    expect(result1.deposit_scheme_name).toBe('SafeDeposits Scotland');

    const factsWithMyDeposits = {
      ...factsWithSafeDeposits,
      deposit_scheme_name: 'MyDeposits Scotland',
    };

    const result2 = mapWizardToPRTData(factsWithMyDeposits);
    expect(result2.deposit_scheme_name).toBe('MyDeposits Scotland');

    const factsWithLPS = {
      ...factsWithSafeDeposits,
      deposit_scheme_name: 'Letting Protection Service Scotland',
    };

    const result3 = mapWizardToPRTData(factsWithLPS);
    expect(result3.deposit_scheme_name).toBe('Letting Protection Service Scotland');
  });

  test('should handle HMO properties correctly', () => {
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',

      tenants: [
        { full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' },
        { full_name: 'John Doe', dob: '1991-02-02', email: 'john@example.com', phone: '0131 222 2222' },
        { full_name: 'Jim Doe', dob: '1992-03-03', email: 'jim@example.com', phone: '0131 333 3333' },
      ],

      property_address: '456 Glasgow Road',
      tenancy_start_date: '2024-01-01',
      rent_amount: 2000,
      deposit_amount: 2300,

      is_hmo: 'true',
      hmo_licence_number: 'HMO-12345',
      hmo_licence_expiry: '2025-12-31',
      number_of_sharers: 3,
      communal_areas: 'true',
      communal_cleaning: 'Shared responsibility',
    };

    const result = mapWizardToPRTData(facts);

    expect(result.is_hmo).toBe(true);
    expect(result.hmo_licence_number).toBe('HMO-12345');
    expect(result.hmo_licence_expiry).toBe('2025-12-31');
    expect(result.number_of_sharers).toBe(3);
    expect(result.communal_areas).toBe(true);
    expect(result.communal_cleaning).toBe('Shared responsibility');
  });

  test('should handle product tier mapping', () => {
    const factsWithProductTier = {
      landlord_full_name: 'John Smith',
      landlord_address: '123 Edinburgh Road',
      landlord_email: 'john@example.com',
      landlord_phone: '0131 123 4567',
      tenants: [{ full_name: 'Jane Doe', dob: '1990-01-01', email: 'jane@example.com', phone: '0131 111 1111' }],
      property_address: '456 Glasgow Road',
      tenancy_start_date: '2024-01-01',
      rent_amount: 1000,
      deposit_amount: 1150,
      product_tier: 'Premium PRT',
    };

    const result1 = mapWizardToPRTData(factsWithProductTier);
    expect(result1.product_tier).toBe('Premium PRT');

    const factsWithTenancyTier = {
      ...factsWithProductTier,
      product_tier: undefined,
      tenancy_tier: 'Standard PRT',
    };

    const result2 = mapWizardToPRTData(factsWithTenancyTier);
    expect(result2.product_tier).toBe('Standard PRT');
  });
});
