/**
 * Tenancy Agreement Integration Tests
 *
 * Tests the end-to-end flow from wizard facts → mapper → template output
 * for all jurisdictions and tiers (standard/premium with guarantor).
 */

import { describe, it, expect } from 'vitest';
import { mapWizardToASTData } from '../ast-wizard-mapper';
import { mapWizardToPRTData } from '../scotland/prt-wizard-mapper';
import { mapWizardToPrivateTenancyData } from '../northern-ireland/private-tenancy-wizard-mapper';
import type { WizardFacts } from '@/lib/case-facts/schema';

// Base wizard facts for testing
const createBaseWizardFacts = (): Partial<WizardFacts> => ({
  // Property
  property_address_line1: '123 Test Street',
  property_address_town: 'London',
  property_address_postcode: 'SW1A 1AA',
  property_type: 'flat',
  number_of_bedrooms: 2,
  furnished_status: 'furnished',

  // Landlord
  landlord_full_name: 'John Smith',
  landlord_address_line1: '456 Landlord Road',
  landlord_address_town: 'Manchester',
  landlord_address_postcode: 'M1 1AA',
  landlord_email: 'landlord@example.com',
  landlord_phone: '07700 900000',

  // Tenants
  number_of_tenants: 1,
  tenants: [{
    full_name: 'Jane Doe',
    dob: '1990-01-15',
    email: 'tenant@example.com',
    phone: '07700 900001',
  }],

  // Tenancy
  tenancy_start_date: '2025-02-01',
  is_fixed_term: true,
  tenancy_end_date: '2026-01-31',
  rent_amount: 1500,
  rent_frequency: 'monthly',
  rent_due_day: 1,
  deposit_amount: 1730,
  deposit_scheme_name: 'DPS',

  // Safety
  gas_safety_certificate: true,
  electrical_safety_certificate: true,
  epc_rating: 'C',

  // Rules
  pets_allowed: false,
  smoking_allowed: false,
});

const createPremiumGuarantorFacts = (): Partial<WizardFacts> => ({
  guarantor_required: true,
  guarantor_name: 'Robert Smith',
  guarantor_address: '789 Guarantor Lane, Birmingham, B1 1AA',
  guarantor_email: 'guarantor@example.com',
  guarantor_phone: '07700 900002',
  guarantor_dob: '1960-05-20',
  guarantor_relationship: 'Parent',
  joint_and_several_liability: true,
});

describe('England AST Mapper Integration', () => {
  it('maps standard AST wizard facts correctly without guarantor', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ast_tier: 'Standard AST',
    } as WizardFacts;

    const result = mapWizardToASTData(wizardFacts);

    // Verify core fields mapped
    expect(result.landlord_full_name).toBe('John Smith');
    expect(result.property_address).toContain('123 Test Street');
    expect(result.rent_amount).toBe(1500);
    expect(result.deposit_amount).toBe(1730);

    // Verify no guarantor in standard tier (null or undefined)
    expect(result.guarantor_name).toBeFalsy();
    expect(result.guarantor_required).toBeFalsy();
  });

  it('maps premium AST wizard facts with guarantor correctly', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ...createPremiumGuarantorFacts(),
      ast_tier: 'Premium AST',
    } as WizardFacts;

    const result = mapWizardToASTData(wizardFacts);

    // Verify guarantor fields mapped
    expect(result.guarantor_required).toBe(true);
    expect(result.guarantor_name).toBe('Robert Smith');
    expect(result.guarantor_address).toBe('789 Guarantor Lane, Birmingham, B1 1AA');
    expect(result.guarantor_email).toBe('guarantor@example.com');
    expect(result.guarantor_phone).toBe('07700 900002');
    expect(result.guarantor_dob).toBe('1960-05-20');
    expect(result.guarantor_relationship).toBe('Parent');
    expect(result.joint_and_several_liability).toBe(true);
  });

  it('maps tenant information correctly', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
    } as WizardFacts;

    const result = mapWizardToASTData(wizardFacts);

    expect(result.tenants).toHaveLength(1);
    expect(result.tenants[0].full_name).toBe('Jane Doe');
    expect(result.tenants[0].email).toBe('tenant@example.com');
  });
});

describe('Scotland PRT Mapper Integration', () => {
  it('maps standard PRT wizard facts correctly without guarantor', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      prt_tier: 'Standard PRT',
      landlord_reg_number: 'SC123456',
    } as WizardFacts;

    const result = mapWizardToPRTData(wizardFacts);

    // Verify core fields mapped
    expect(result.landlord_full_name).toBe('John Smith');
    expect(result.landlord_reg_number).toBe('SC123456');
    expect(result.rent_amount).toBe(1500);

    // PRT has no fixed end date
    expect(result.is_fixed_term).toBe(false);

    // Verify no guarantor in standard tier (null or undefined)
    expect(result.guarantor_name).toBeFalsy();
  });

  it('maps premium PRT wizard facts with guarantor correctly', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ...createPremiumGuarantorFacts(),
      prt_tier: 'Premium PRT',
      landlord_reg_number: 'SC123456',
    } as WizardFacts;

    const result = mapWizardToPRTData(wizardFacts);

    // Verify guarantor fields mapped
    expect(result.guarantor_required).toBe(true);
    expect(result.guarantor_name).toBe('Robert Smith');
    expect(result.guarantor_address).toBe('789 Guarantor Lane, Birmingham, B1 1AA');
    expect(result.guarantor_email).toBe('guarantor@example.com');
    expect(result.joint_and_several_liability).toBe(true);
  });
});

describe('Northern Ireland Private Tenancy Mapper Integration', () => {
  it('maps standard NI wizard facts correctly without guarantor', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ni_tier: 'Standard NI Private Tenancy',
    } as WizardFacts;

    const result = mapWizardToPrivateTenancyData(wizardFacts);

    // Verify core fields mapped
    expect(result.landlord_full_name).toBe('John Smith');
    expect(result.rent_amount).toBe(1500);

    // Verify no guarantor in standard tier (null or undefined)
    expect(result.guarantor_name).toBeFalsy();
  });

  it('maps premium NI wizard facts with guarantor correctly', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ...createPremiumGuarantorFacts(),
      ni_tier: 'Premium NI Private Tenancy',
    } as WizardFacts;

    const result = mapWizardToPrivateTenancyData(wizardFacts);

    // Verify guarantor fields mapped
    expect(result.guarantor_required).toBe(true);
    expect(result.guarantor_name).toBe('Robert Smith');
    expect(result.guarantor_address).toBe('789 Guarantor Lane, Birmingham, B1 1AA');
    expect(result.guarantor_email).toBe('guarantor@example.com');
    expect(result.joint_and_several_liability).toBe(true);
  });
});

describe('Guarantor Consistency Across Jurisdictions', () => {
  const premiumFacts = {
    ...createBaseWizardFacts(),
    ...createPremiumGuarantorFacts(),
  } as WizardFacts;

  it('all mappers map guarantor_name consistently', () => {
    const englandResult = mapWizardToASTData({ ...premiumFacts, ast_tier: 'Premium AST' } as WizardFacts);
    const scotlandResult = mapWizardToPRTData({ ...premiumFacts, prt_tier: 'Premium PRT' } as WizardFacts);
    const niResult = mapWizardToPrivateTenancyData({ ...premiumFacts, ni_tier: 'Premium NI Private Tenancy' } as WizardFacts);

    expect(englandResult.guarantor_name).toBe('Robert Smith');
    expect(scotlandResult.guarantor_name).toBe('Robert Smith');
    expect(niResult.guarantor_name).toBe('Robert Smith');
  });

  it('all mappers map guarantor_email consistently', () => {
    const englandResult = mapWizardToASTData({ ...premiumFacts, ast_tier: 'Premium AST' } as WizardFacts);
    const scotlandResult = mapWizardToPRTData({ ...premiumFacts, prt_tier: 'Premium PRT' } as WizardFacts);
    const niResult = mapWizardToPrivateTenancyData({ ...premiumFacts, ni_tier: 'Premium NI Private Tenancy' } as WizardFacts);

    expect(englandResult.guarantor_email).toBe('guarantor@example.com');
    expect(scotlandResult.guarantor_email).toBe('guarantor@example.com');
    expect(niResult.guarantor_email).toBe('guarantor@example.com');
  });

  it('all mappers map joint_and_several_liability consistently', () => {
    const englandResult = mapWizardToASTData({ ...premiumFacts, ast_tier: 'Premium AST' } as WizardFacts);
    const scotlandResult = mapWizardToPRTData({ ...premiumFacts, prt_tier: 'Premium PRT' } as WizardFacts);
    const niResult = mapWizardToPrivateTenancyData({ ...premiumFacts, ni_tier: 'Premium NI Private Tenancy' } as WizardFacts);

    expect(englandResult.joint_and_several_liability).toBe(true);
    expect(scotlandResult.joint_and_several_liability).toBe(true);
    expect(niResult.joint_and_several_liability).toBe(true);
  });
});

describe('Legal Compliance Text Verification', () => {
  // These tests verify that mapper output does not contain prohibited text
  // The actual template tests are in tenancy-agreement-compliance.test.ts

  it('standard tier does not set guarantor_required to true by default', () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      ast_tier: 'Standard AST',
    } as WizardFacts;

    const result = mapWizardToASTData(wizardFacts);

    // Standard tier should not have guarantor_required set to true
    expect(result.guarantor_required).not.toBe(true);
  });

  it('premium tier only sets guarantor if wizard facts include it', () => {
    const wizardFactsWithoutGuarantor = {
      ...createBaseWizardFacts(),
      ast_tier: 'Premium AST',
      guarantor_required: false,
    } as WizardFacts;

    const result = mapWizardToASTData(wizardFactsWithoutGuarantor);

    expect(result.guarantor_required).toBe(false);
    expect(result.guarantor_name).toBeUndefined();
  });
});
