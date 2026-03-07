import { describe, expect, it, vi } from 'vitest';

import { generateStandardAST } from '@/lib/documents/ast-generator';
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

describe('AST pack - Standard', () => {
  it('renders the standard AST pack with certificate and legal summary', async () => {
    const wizardFacts = {
      product_tier: 'Standard AST',
      landlord_full_name: 'Alice Landlord',
      landlord_address: '1 High Street, London, E1 1AA',
      landlord_address_line1: '1 High Street',
      landlord_address_town: 'London',
      landlord_address_postcode: 'E1 1AA',
      landlord_email: 'alice@example.com',
      landlord_phone: '07000000001',
      property_address: '2 High Street, London, E1 2BB',
      property_address_line1: '2 High Street',
      property_address_town: 'London',
      property_address_postcode: 'E1 2BB',
      property_type: 'flat',
      number_of_bedrooms: '2',
      furnished_status: 'unfurnished',
      parking_available: true,
      tenancy_start_date: '2025-01-01',
      is_fixed_term: true,
      term_length: '12 months',
      tenancy_end_date: '2026-01-01',
      rent_amount: 1200,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Bank Transfer',
      payment_details: 'Sort code 00-00-00 / Account 12345678',
      deposit_amount: 1200,
      deposit_scheme_name: 'DPS',
      deposit_paid_date: '2024-12-15',
      council_tax_responsibility: 'Tenant',
      utilities_responsibility: 'Tenant',
      internet_responsibility: 'Tenant',
      inventory_attached: true,
      professional_cleaning_required: false,
      decoration_condition: 'Minor alterations allowed',
      landlord_access_notice: '24 hours',
      inspection_frequency: 'Quarterly',
      end_of_tenancy_viewings: true,
      pets_allowed: false,
      smoking_allowed: false,
      subletting_allowed: 'Not allowed',
      rent_increase_clause: false,
      landlord_maintenance_responsibilities: 'Structural repairs and boilers',
      repairs_reporting_method: 'Email',
      emergency_contact: 'Call 07000',
      tenants: {
        0: {
          full_name: 'Bob Tenant',
          dob: '1990-01-01',
          email: 'bob@example.com',
          phone: '07000000002',
        },
      },
    } as any;

    const astData = mapWizardToASTData(wizardFacts);
    const generated = await generateStandardAST(astData, true);

    expect(generated.pdf).toBeInstanceOf(Buffer);
    // Certificate of Curation and Legal Validity Summary removed as of Jan 2026 restructure
    // Instead verify core tenancy agreement content is present
    expect(generated.html).toContain('Alice Landlord');
    expect(generated.html).toContain('Bob Tenant');
    expect(generated.html).not.toContain('HMO & Shared Facilities');
  }, 20000);
});
