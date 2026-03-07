/**
 * Tenancy Facts Normalization Tests
 *
 * Tests the normalizeTenancyFacts function that maps TenancySectionFlow wizard facts
 * to the canonical legal document schema fields expected by document generation.
 *
 * This fix resolves LEGAL_BLOCK errors during document generation caused by:
 * - Wizard uses tenants[].full_name, legal schema expects tenant_full_name
 * - Wizard uses rent_period, legal schema expects rent_frequency
 * - Wizard uses rent_due_day, legal schema expects payment_date
 * - Wizard uses is_fixed_term, legal schema expects tenancy_type + fixed_term
 *
 * SCHEMA REFERENCE (from config/jurisdictions/uk/england/facts_schema.json):
 * - tenancy_type: enum ["ast", "assured", "other"] - LEGAL CLASSIFICATION, not fixed/periodic
 * - rent_frequency: enum ["weekly", "fortnightly", "monthly", "quarterly"]
 * - payment_date: number, min: 1, max: 31
 * - fixed_term_end_date: date, required_if fixed_term == true
 * - tenant_full_name: string, required
 * - landlord_address_*: string fields
 */

import { describe, it, expect } from 'vitest';
import { normalizeTenancyFacts, validateFlow, type FlowValidationInput } from '@/lib/validation/validateFlow';

// Sample wizard facts as saved by TenancySectionFlow - Fixed Term Tenancy
const sampleFixedTermWizardFacts = {
  __meta: {
    product: 'tenancy_agreement',
    jurisdiction: 'england',
  },

  // Landlord - as saved by TenancySectionFlow
  landlord_full_name: 'John Smith',
  landlord_email: 'john.smith@email.com',
  landlord_phone: '07123456789',
  landlord_address_line1: '123 Landlord Street',
  landlord_address_town: 'London',
  landlord_address_postcode: 'SW1A 1AA',

  // Tenants - wizard uses array format with full_name
  number_of_tenants: '1',
  tenants: [
    {
      full_name: 'Jane Doe',
      dob: '1990-05-15',
      email: 'jane.doe@email.com',
      phone: '07987654321',
    },
  ],

  // Property
  property_address_line1: '456 Property Lane',
  property_address_town: 'Manchester',
  property_address_postcode: 'M1 1AB',
  property_type: 'house',

  // Tenancy - wizard uses is_fixed_term and tenancy_end_date
  tenancy_start_date: '2026-02-01',
  is_fixed_term: true,
  term_length: '12 months',
  tenancy_end_date: '2027-02-01',

  // Rent - wizard uses rent_period and rent_due_day
  rent_amount: 1200,
  rent_period: 'month',
  rent_due_day: '1st',
  payment_method: 'Standing Order',

  // Deposit
  deposit_amount: 1200,
  deposit_scheme_name: 'DPS',
};

// Sample with periodic tenancy (no fixed term)
const samplePeriodicWizardFacts = {
  ...sampleFixedTermWizardFacts,
  is_fixed_term: false,
  tenancy_end_date: undefined,
};

// Sample with multiple tenants
const sampleJointTenantsFacts = {
  ...sampleFixedTermWizardFacts,
  number_of_tenants: '3',
  tenants: [
    { full_name: 'Alice Smith', email: 'alice@email.com', dob: '1988-03-20', phone: '07111111111' },
    { full_name: 'Bob Jones', email: 'bob@email.com', dob: '1990-07-10', phone: '07222222222' },
    { full_name: 'Charlie Brown', email: 'charlie@email.com', dob: '1985-12-01', phone: '07333333333' },
  ],
};

// Sample with landlord service address (fallback scenario)
const sampleServiceAddressFacts = {
  ...sampleFixedTermWizardFacts,
  landlord_address_line1: undefined,
  landlord_address_town: undefined,
  landlord_address_postcode: undefined,
  landlord_service_address_line1: '789 Service Road',
  landlord_service_address_town: 'Birmingham',
  landlord_service_address_postcode: 'B1 1CD',
};

describe('normalizeTenancyFacts', () => {
  describe('tenant_full_name mapping', () => {
    it('should map single tenant name from tenants[].full_name to tenant_full_name', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.tenant_full_name).toBe('Jane Doe');
    });

    it('should join multiple tenant names with " and "', () => {
      const normalized = normalizeTenancyFacts(sampleJointTenantsFacts);

      expect(normalized.tenant_full_name).toBe('Alice Smith and Bob Jones and Charlie Brown');
    });

    it('should extract tenant_2_name for joint tenants', () => {
      const normalized = normalizeTenancyFacts(sampleJointTenantsFacts);

      expect(normalized.tenant_2_name).toBe('Bob Jones');
    });

    it('should set joint_tenants flag when multiple tenants', () => {
      const normalized = normalizeTenancyFacts(sampleJointTenantsFacts);

      expect(normalized.joint_tenants).toBe(true);
    });

    it('should not overwrite existing tenant_full_name', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        tenant_full_name: 'Already Set Name',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenant_full_name).toBe('Already Set Name');
    });
  });

  describe('rent_frequency mapping (schema: ["weekly", "fortnightly", "monthly", "quarterly"])', () => {
    it('should map rent_period "month" to rent_frequency "monthly"', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.rent_frequency).toBe('monthly');
    });

    it('should map rent_period "week" to rent_frequency "weekly"', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_period: 'week' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.rent_frequency).toBe('weekly');
    });

    it('should map rent_period "quarter" to rent_frequency "quarterly"', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_period: 'quarter' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.rent_frequency).toBe('quarterly');
    });

    it('should handle case-insensitive rent_period values', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_period: 'Monthly' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.rent_frequency).toBe('monthly');
    });

    it('should not overwrite existing rent_frequency', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        rent_frequency: 'weekly',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.rent_frequency).toBe('weekly');
    });

    it('should map "fortnightly" correctly', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_period: 'fortnightly' };
      const normalized = normalizeTenancyFacts(facts);

      // Pass through as-is since it's already a valid enum value
      expect(normalized.rent_frequency).toBe('fortnightly');
    });
  });

  describe('payment_date mapping (schema: number, min: 1, max: 31)', () => {
    it('should map rent_due_day "1st" to payment_date 1', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.payment_date).toBe(1);
    });

    it('should map rent_due_day "15th" to payment_date 15', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: '15th' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(15);
    });

    it('should map numeric rent_due_day directly', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: 28 };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(28);
    });

    it('should map "Last day of month" to payment_date 31', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: 'Last day of month' };
      const normalized = normalizeTenancyFacts(facts);

      // Schema allows max: 31, this is valid
      expect(normalized.payment_date).toBe(31);
    });

    it('should handle "2nd" correctly', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: '2nd' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(2);
    });

    it('should handle "23rd" correctly', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: '23rd' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(23);
    });
  });

  describe('tenancy_type mapping (schema: ["ast", "assured", "other"])', () => {
    it('should default to "ast" for fixed term tenancy', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      // tenancy_type is LEGAL CLASSIFICATION, not fixed/periodic
      expect(normalized.tenancy_type).toBe('ast');
    });

    it('should default to "ast" for periodic tenancy (NOT "periodic")', () => {
      const normalized = normalizeTenancyFacts(samplePeriodicWizardFacts);

      // IMPORTANT: "periodic" is NOT a valid enum value
      // A periodic tenancy is still an AST, just without a fixed end date
      expect(normalized.tenancy_type).toBe('ast');
    });

    it('should not overwrite existing tenancy_type', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        tenancy_type: 'assured',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('assured');
    });

    it('should preserve "other" if explicitly set', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        tenancy_type: 'other',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('other');
    });
  });

  describe('fixed_term_end_date mapping', () => {
    it('should map tenancy_end_date to fixed_term_end_date when is_fixed_term=true', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.fixed_term_end_date).toBe('2027-02-01');
    });

    it('should not set fixed_term_end_date when is_fixed_term=false', () => {
      const normalized = normalizeTenancyFacts(samplePeriodicWizardFacts);

      expect(normalized.fixed_term_end_date).toBeUndefined();
    });

    it('should set fixed_term from is_fixed_term (true)', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.fixed_term).toBe(true);
    });

    it('should set fixed_term from is_fixed_term (false)', () => {
      const normalized = normalizeTenancyFacts(samplePeriodicWizardFacts);

      expect(normalized.fixed_term).toBe(false);
    });
  });

  describe('landlord_address fallback from service address', () => {
    it('should use landlord_service_address when landlord_address is missing', () => {
      const normalized = normalizeTenancyFacts(sampleServiceAddressFacts);

      expect(normalized.landlord_address_line1).toBe('789 Service Road');
      expect(normalized.landlord_address_town).toBe('Birmingham');
      expect(normalized.landlord_address_postcode).toBe('B1 1CD');
    });

    it('should not overwrite existing landlord_address with service_address', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.landlord_address_line1).toBe('123 Landlord Street');
      expect(normalized.landlord_address_town).toBe('London');
      expect(normalized.landlord_address_postcode).toBe('SW1A 1AA');
    });

    it('should use nested landlord.address_line1 when flat fields are missing', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        landlord_address_line1: undefined,
        landlord_address_town: undefined,
        landlord_address_postcode: undefined,
        landlord: {
          address_line1: '321 Nested Street',
          city: 'Bristol',
          postcode: 'BS1 1AB',
        },
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.landlord_address_line1).toBe('321 Nested Street');
      expect(normalized.landlord_address_town).toBe('Bristol');
      expect(normalized.landlord_address_postcode).toBe('BS1 1AB');
    });

    it('should use landlord_city as fallback for landlord_address_town', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        landlord_address_town: undefined,
        landlord_city: 'Leeds',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.landlord_address_town).toBe('Leeds');
    });

    it('should use landlord_postcode as fallback for landlord_address_postcode', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        landlord_address_postcode: undefined,
        landlord_postcode: 'LS1 1AB',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.landlord_address_postcode).toBe('LS1 1AB');
    });
  });
});

/**
 * VALIDATION MATRIX
 *
 * Tests all combinations of:
 * - Fixed term vs Periodic tenancy
 * - Monthly vs Weekly rent frequency
 *
 * Expected behavior:
 * | is_fixed_term | rent_period | tenancy_type | rent_frequency | fixed_term_end_date |
 * |---------------|-------------|--------------|----------------|---------------------|
 * | true          | month       | "ast"        | "monthly"      | required            |
 * | true          | week        | "ast"        | "weekly"       | required            |
 * | false         | month       | "ast"        | "monthly"      | not required        |
 * | false         | week        | "ast"        | "weekly"       | not required        |
 */
describe('Validation Matrix: Fixed/Periodic x Monthly/Weekly', () => {
  const baseWizardFacts = {
    __meta: { product: 'tenancy_agreement', jurisdiction: 'england' },
    landlord_full_name: 'Test Landlord',
    landlord_address_line1: '123 Test St',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    tenants: [{ full_name: 'Test Tenant', email: 'test@email.com', dob: '1990-01-01', phone: '07000000000' }],
    property_address_line1: '456 Property Lane',
    property_address_town: 'Manchester',
    property_address_postcode: 'M1 1AB',
    property_type: 'flat',
    tenancy_start_date: '2026-02-01',
    rent_amount: 1000,
    rent_due_day: '1st',
    deposit_amount: 1000,
    deposit_scheme_name: 'DPS',
  };

  describe('Fixed Term + Monthly', () => {
    const facts = {
      ...baseWizardFacts,
      is_fixed_term: true,
      tenancy_end_date: '2027-02-01',
      rent_period: 'month',
    };

    it('should normalize correctly', () => {
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('ast');
      expect(normalized.rent_frequency).toBe('monthly');
      expect(normalized.fixed_term).toBe(true);
      expect(normalized.fixed_term_end_date).toBe('2027-02-01');
      expect(normalized.payment_date).toBe(1);
    });

    it('should pass validation at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts,
      };

      const result = validateFlow(input);
      const criticalIssues = result.blocking_issues.filter(issue =>
        ['tenant_full_name', 'rent_frequency', 'payment_date', 'tenancy_type', 'fixed_term_end_date'].some(
          field => issue.fields.includes(field)
        )
      );

      expect(criticalIssues).toHaveLength(0);
    });
  });

  describe('Fixed Term + Weekly', () => {
    const facts = {
      ...baseWizardFacts,
      is_fixed_term: true,
      tenancy_end_date: '2027-02-01',
      rent_period: 'week',
    };

    it('should normalize correctly', () => {
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('ast');
      expect(normalized.rent_frequency).toBe('weekly');
      expect(normalized.fixed_term).toBe(true);
      expect(normalized.fixed_term_end_date).toBe('2027-02-01');
    });

    it('should pass validation at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts,
      };

      const result = validateFlow(input);
      const criticalIssues = result.blocking_issues.filter(issue =>
        ['tenant_full_name', 'rent_frequency', 'payment_date', 'tenancy_type', 'fixed_term_end_date'].some(
          field => issue.fields.includes(field)
        )
      );

      expect(criticalIssues).toHaveLength(0);
    });
  });

  describe('Periodic + Monthly', () => {
    const facts = {
      ...baseWizardFacts,
      is_fixed_term: false,
      rent_period: 'month',
    };

    it('should normalize correctly', () => {
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('ast'); // Still AST, just periodic
      expect(normalized.rent_frequency).toBe('monthly');
      expect(normalized.fixed_term).toBe(false);
      expect(normalized.fixed_term_end_date).toBeUndefined();
    });

    it('should NOT require fixed_term_end_date for periodic tenancy', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts,
      };

      const result = validateFlow(input);
      const fixedTermIssues = result.blocking_issues.filter(issue =>
        issue.fields.includes('fixed_term_end_date')
      );

      expect(fixedTermIssues).toHaveLength(0);
    });
  });

  describe('Periodic + Weekly', () => {
    const facts = {
      ...baseWizardFacts,
      is_fixed_term: false,
      rent_period: 'week',
    };

    it('should normalize correctly', () => {
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('ast'); // Still AST, just periodic
      expect(normalized.rent_frequency).toBe('weekly');
      expect(normalized.fixed_term).toBe(false);
      expect(normalized.fixed_term_end_date).toBeUndefined();
    });

    it('should pass validation at generate stage', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts,
      };

      const result = validateFlow(input);
      const criticalIssues = result.blocking_issues.filter(issue =>
        ['tenant_full_name', 'rent_frequency', 'payment_date', 'tenancy_type'].some(
          field => issue.fields.includes(field)
        )
      );

      expect(criticalIssues).toHaveLength(0);
    });
  });
});

describe('Tenancy Agreement Generation Validation', () => {
  describe('Joint Tenants', () => {
    it('should handle multiple tenants correctly', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts: sampleJointTenantsFacts,
      };

      const result = validateFlow(input);

      // Should not have blocking issue for tenant names
      const tenantIssues = result.blocking_issues.filter(issue =>
        issue.fields.some(field => field.includes('tenant_full_name'))
      );

      expect(tenantIssues).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle quarterly rent', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_period: 'quarter' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.rent_frequency).toBe('quarterly');
    });

    it('should handle payment on the 31st', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: '31st' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(31);
    });

    it('should handle payment on the 30th', () => {
      const facts = { ...sampleFixedTermWizardFacts, rent_due_day: '30th' };
      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.payment_date).toBe(30);
    });
  });
});
