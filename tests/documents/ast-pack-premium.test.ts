import { describe, expect, it, vi } from 'vitest';

import { generatePremiumAST } from '@/lib/documents/ast-generator';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';

vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

describe('AST pack - Premium', () => {
  it('renders premium-only content when flags are set', async () => {
    const wizardFacts = {
      product_tier: 'Premium AST',
      landlord_full_name: 'Priya Landlord',
      landlord_address: '10 Market Street, Bristol, BS1 1AA',
      landlord_address_line1: '10 Market Street',
      landlord_address_town: 'Bristol',
      landlord_address_postcode: 'BS1 1AA',
      landlord_email: 'priya@example.com',
      landlord_phone: '07000000010',
      property_address: '12 Harbour Road, Bristol, BS1 2BB',
      property_address_line1: '12 Harbour Road',
      property_address_town: 'Bristol',
      property_address_postcode: 'BS1 2BB',
      property_type: 'house',
      number_of_bedrooms: 4,
      furnished_status: 'furnished',
      parking_available: true,
      tenancy_start_date: '2025-02-01',
      is_fixed_term: true,
      term_length: '12 months',
      tenancy_end_date: '2026-02-01',
      rent_amount: 2200,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Standing Order',
      payment_details: 'Use reference AST001',
      deposit_amount: 2500,
      deposit_scheme_name: 'MyDeposits',
      council_tax_responsibility: 'Tenant',
      utilities_responsibility: 'Tenant',
      internet_responsibility: 'Tenant',
      inventory_attached: true,
      inventory_schedule_notes: 'Detailed furnished inventory attached',
      professional_cleaning_required: true,
      decoration_condition: 'With written permission only',
      landlord_access_notice: '24 hours',
      inspection_frequency: 'Quarterly',
      end_of_tenancy_viewings: true,
      pets_allowed: true,
      approved_pets: 'One small dog',
      smoking_allowed: false,
      subletting_allowed: 'Only with written consent',
      rent_increase_clause: true,
      rent_increase_method: 'RPI',
      rent_increase_frequency: 'Annually',
      landlord_maintenance_responsibilities: 'All structural items, boiler, white goods',
      repairs_reporting_method: 'Online portal',
      emergency_contact: 'Call 07000 111222',
      is_hmo: true,
      number_of_sharers: 4,
      communal_areas: 'Kitchen, lounge, two bathrooms',
      communal_cleaning: 'Professional cleaner',
      hmo_licence_status: 'Currently licensed',
      guarantor_required: true,
      guarantor_name: 'Gina Guarantor',
      guarantor_address: '20 High Road, Cardiff, CF10 1AA',
      guarantor_email: 'gina@example.com',
      guarantor_phone: '07000000200',
      guarantor_dob: '1975-05-05',
      guarantor_relationship: 'Parent',
      tenants: {
        0: {
          full_name: 'Tenant One',
          dob: '1991-01-01',
          email: 't1@example.com',
          phone: '07000000020',
        },
        1: {
          full_name: 'Tenant Two',
          dob: '1992-02-02',
          email: 't2@example.com',
          phone: '07000000021',
        },
      },
    } as any;

    const astData = mapWizardToASTData(wizardFacts);
    const generated = await generatePremiumAST(astData, true);

    expect(generated.html).toContain('HMO & Shared Facilities');
    expect(generated.html).toContain('Guarantor');
    expect(generated.html).toContain('Joint and Several Liability');
    expect(generated.html).toContain('Legal Validity Summary');
    expect(generated.pdf).toBeInstanceOf(Buffer);
  }, 20000);
});
