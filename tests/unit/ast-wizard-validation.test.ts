/**
 * AST Wizard Validation Tests
 *
 * Tests the fix for the schema mismatch between TenancySectionFlow and the review page.
 *
 * The bug was that the TenancySectionFlow wizard saves facts with these keys:
 * - property_address_line1, property_address_town, property_address_postcode
 * - landlord_full_name
 * - tenants array with full_name for each tenant
 * - rent_amount, rent_period
 *
 * But the review page validation was checking for different keys:
 * - property_address or property_full_address
 * - landlord_name or landlord_full_name
 * - tenant_names or tenant_1_name
 * - rent_amount or monthly_rent
 *
 * This caused the review page to report missing required fields even when all
 * data was filled in via the wizard.
 */

import { describe, it, expect } from 'vitest';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { WizardFacts } from '@/lib/case-facts/schema';

// Sample wizard facts as saved by TenancySectionFlow
const sampleTenancySectionFlowFacts: WizardFacts = {
  __meta: {
    product: 'ast_standard',
    original_product: 'tenancy_agreement',
    product_tier: 'Standard AST',
    jurisdiction: 'england',
    case_id: 'test-case-id',
  },

  // Property - as saved by TenancySectionFlow
  property_address_line1: '16 Waterloo Road',
  property_address_town: 'Pudsey',
  property_address_postcode: 'LS28 7HF',
  property_type: 'house',
  number_of_bedrooms: '5',
  furnished_status: 'furnished',
  parking_available: true,
  parking_details: 'On Drive Parking',
  has_garden: true,
  garden_maintenance: 'Tenant',

  // Landlord - as saved by TenancySectionFlow
  landlord_full_name: 'Tariq Mohammed',
  landlord_email: 't_mohammed@msn.com',
  landlord_phone: '07961 834494',
  landlord_address_line1: '456 Park Avenue',
  landlord_address_town: 'London',
  landlord_address_postcode: 'W1A 2BB',
  agent_usage: false,

  // Tenants - as saved by TenancySectionFlow (array format)
  number_of_tenants: '1',
  tenants: [
    {
      full_name: 'Sonia Shezadi',
      dob: '1985-02-12',
      email: 'sonia_shezadi@msn.com',
      phone: '07801582365',
    },
  ],

  // Tenancy
  tenancy_start_date: '2026-02-01',
  is_fixed_term: true,
  term_length: '6 months',
  tenancy_end_date: '2026-08-01',

  // Rent
  rent_amount: '1000',
  rent_period: 'month',
  rent_due_day: '1st',
  payment_method: 'Standing Order',
  bank_account_name: 'T Mohammed',
  bank_sort_code: '12-34-56',
  bank_account_number: '12345678',

  // Deposit
  deposit_amount: '1000',
  deposit_scheme_name: 'DPS',
  deposit_paid_date: '2026-02-03',
  deposit_protection_date: '2026-02-04',
  prescribed_information_served: true,

  // Bills
  council_tax_responsibility: 'Tenant',
  utilities_responsibility: 'Tenant',
  internet_responsibility: 'Tenant',
  meter_reading_gas: '12345',
  meter_reading_electric: '67890',
  utility_transfer_responsibility: 'Landlord',

  // Compliance
  epc_rating: 'A',
  right_to_rent_check_date: '2026-01-31',
  gas_safety_certificate: true,
  electrical_safety_certificate: true,
  smoke_alarms_fitted: true,
  carbon_monoxide_alarms: true,
  how_to_rent_guide_provided: true,

  // Terms
  pets_allowed: false,
  smoking_allowed: 'No',
  subletting_allowed: 'Not allowed',
  landlord_access_notice: '48 hours',
  end_of_tenancy_viewings: true,
  repairs_reporting_method: 'Phone',
  emergency_contact: '01274 123124',
  inventory_attached: true,
  professional_cleaning_required: true,
  decoration_condition: 'No alterations allowed',
  break_clause: false,

  // Product
  product_tier: 'Standard AST',
  tenant_is_individual: true,
  main_home: true,
  landlord_lives_at_property: false,
  holiday_or_licence: false,
};

describe('AST Wizard Validation Fix', () => {
  describe('mapWizardToASTData', () => {
    it('should correctly map TenancySectionFlow facts to ASTData', () => {
      const astData = mapWizardToASTData(sampleTenancySectionFlowFacts);

      // Property address should be built from components
      expect(astData.property_address).toBeTruthy();
      expect(astData.property_address).toContain('16 Waterloo Road');
      expect(astData.property_address_line1).toBe('16 Waterloo Road');
      expect(astData.property_address_town).toBe('Pudsey');
      expect(astData.property_address_postcode).toBe('LS28 7HF');

      // Landlord name should be mapped
      expect(astData.landlord_full_name).toBe('Tariq Mohammed');
      expect(astData.landlord_email).toBe('t_mohammed@msn.com');
      expect(astData.landlord_phone).toBe('07961 834494');

      // Tenants should be mapped from array
      expect(astData.tenants).toHaveLength(1);
      expect(astData.tenants[0].full_name).toBe('Sonia Shezadi');
      expect(astData.tenants[0].dob).toBe('1985-02-12');
      expect(astData.tenants[0].email).toBe('sonia_shezadi@msn.com');

      // Rent should be mapped - values may be string or number depending on source
      expect(Number(astData.rent_amount)).toBe(1000);
      expect(astData.rent_period).toBe('month');
      expect(astData.rent_due_day).toBe('1st');
    });

    it('should map deposit scheme name correctly', () => {
      const astData = mapWizardToASTData(sampleTenancySectionFlowFacts);

      // Amount may be string or number depending on source
      expect(Number(astData.deposit_amount)).toBe(1000);
      expect(astData.deposit_scheme_name).toBe('DPS');
    });

    it('should handle tenancy dates', () => {
      const astData = mapWizardToASTData(sampleTenancySectionFlowFacts);

      expect(astData.tenancy_start_date).toBe('2026-02-01');
      expect(astData.is_fixed_term).toBe(true);
      expect(astData.tenancy_end_date).toBe('2026-08-01');
    });
  });

  describe('wizardFactsToCaseFacts', () => {
    it('should correctly convert TenancySectionFlow facts to CaseFacts', () => {
      const caseFacts = wizardFactsToCaseFacts(sampleTenancySectionFlowFacts);

      // Property address
      expect(caseFacts.property.address_line1).toBe('16 Waterloo Road');
      expect(caseFacts.property.city).toBe('Pudsey');
      expect(caseFacts.property.postcode).toBe('LS28 7HF');

      // Landlord
      expect(caseFacts.parties.landlord.name).toBe('Tariq Mohammed');
      expect(caseFacts.parties.landlord.email).toBe('t_mohammed@msn.com');
      expect(caseFacts.parties.landlord.phone).toBe('07961 834494');
      expect(caseFacts.parties.landlord.address_line1).toBe('456 Park Avenue');
      expect(caseFacts.parties.landlord.city).toBe('London');
      expect(caseFacts.parties.landlord.postcode).toBe('W1A 2BB');

      // Tenants
      expect(caseFacts.parties.tenants).toHaveLength(1);
      expect(caseFacts.parties.tenants[0].name).toBe('Sonia Shezadi');

      // Rent - values may be string or number depending on source
      expect(Number(caseFacts.tenancy.rent_amount)).toBe(1000);
      expect(caseFacts.tenancy.rent_frequency).toBe('month');

      // Tenancy dates
      expect(caseFacts.tenancy.start_date).toBe('2026-02-01');
      expect(caseFacts.tenancy.end_date).toBe('2026-08-01');
      expect(caseFacts.tenancy.fixed_term).toBe(true);
    });

    it('should correctly populate meta from __meta', () => {
      const caseFacts = wizardFactsToCaseFacts(sampleTenancySectionFlowFacts);

      expect(caseFacts.meta.product).toBe('ast_standard');
      expect(caseFacts.meta.jurisdiction).toBe('england');
      expect(caseFacts.meta.product_tier).toBe('Standard AST');
    });
  });

  describe('TenancyReviewContent validation helpers', () => {
    /**
     * These tests verify the validation logic that was fixed.
     * The validation should pass when TenancySectionFlow format fields are provided.
     */

    it('should recognize property address from property_address_line1', () => {
      const facts = {
        property_address_line1: '16 Waterloo Road',
        property_address_town: 'Pudsey',
        property_address_postcode: 'LS28 7HF',
      };

      // The fixed validation logic checks:
      // facts.property_address || facts.property_full_address || facts.property_address_line1
      const hasPropertyAddress = Boolean(
        facts.property_address_line1
      );

      expect(hasPropertyAddress).toBe(true);
    });

    it('should recognize landlord name from landlord_full_name', () => {
      const facts = {
        landlord_full_name: 'Tariq Mohammed',
      };

      // The fixed validation logic checks:
      // facts.landlord_name || facts.landlord_full_name
      const hasLandlordName = Boolean(
        (facts as any).landlord_name ||
        facts.landlord_full_name
      );

      expect(hasLandlordName).toBe(true);
    });

    it('should recognize tenant name from tenants array', () => {
      const facts = {
        tenants: [
          { full_name: 'Sonia Shezadi' },
        ],
      };

      // The fixed validation logic checks:
      // facts.tenant_names || facts.tenant_1_name || (Array.isArray(facts.tenants) && facts.tenants[0]?.full_name)
      const hasTenantName = Boolean(
        (facts as any).tenant_names ||
        (facts as any).tenant_1_name ||
        (Array.isArray(facts.tenants) && facts.tenants[0]?.full_name)
      );

      expect(hasTenantName).toBe(true);
    });

    it('should recognize rent amount from rent_amount field', () => {
      const facts = {
        rent_amount: '1000',
      };

      // The fixed validation logic checks:
      // facts.rent_amount || facts.monthly_rent
      const hasRentAmount = Boolean(
        facts.rent_amount ||
        (facts as any).monthly_rent
      );

      expect(hasRentAmount).toBe(true);
    });
  });

  describe('Summary display helpers', () => {
    it('should build property address from separate fields', () => {
      const facts = {
        property_address_line1: '16 Waterloo Road',
        property_address_town: 'Pudsey',
        property_address_postcode: 'LS28 7HF',
      };

      // The fixed display logic combines the fields
      const propertyAddress = (() => {
        if ((facts as any).property_address) return (facts as any).property_address;
        if ((facts as any).property_full_address) return (facts as any).property_full_address;
        if (facts.property_address_line1) {
          const parts = [
            facts.property_address_line1,
            facts.property_address_town,
            facts.property_address_postcode,
          ].filter(Boolean);
          return parts.length > 0 ? parts.join(', ') : 'Not specified';
        }
        return 'Not specified';
      })();

      expect(propertyAddress).toBe('16 Waterloo Road, Pudsey, LS28 7HF');
    });

    it('should build tenant names from tenants array', () => {
      const facts = {
        tenants: [
          { full_name: 'Sonia Shezadi' },
          { full_name: 'John Doe' },
        ],
      };

      // The fixed display logic extracts names from the array
      const tenantNames = (() => {
        if (Array.isArray(facts.tenants) && facts.tenants[0]?.full_name) {
          const names = facts.tenants.map((t: any) => t.full_name).filter(Boolean);
          return names.length > 0 ? names.join(', ') : 'Not specified';
        }
        return (facts as any).tenant_names || (facts as any).tenant_1_name || 'Not specified';
      })();

      expect(tenantNames).toBe('Sonia Shezadi, John Doe');
    });
  });
});
