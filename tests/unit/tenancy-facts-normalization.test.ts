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
 * - Wizard uses is_fixed_term + tenancy_end_date, legal schema expects tenancy_type + fixed_term_end_date
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

// Sample with periodic tenancy
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

  describe('rent_frequency mapping', () => {
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
  });

  describe('payment_date mapping', () => {
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

      expect(normalized.payment_date).toBe(31);
    });
  });

  describe('tenancy_type mapping', () => {
    it('should map is_fixed_term=true to tenancy_type "ast"', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.tenancy_type).toBe('ast');
    });

    it('should map is_fixed_term=false to tenancy_type "periodic"', () => {
      const normalized = normalizeTenancyFacts(samplePeriodicWizardFacts);

      expect(normalized.tenancy_type).toBe('periodic');
    });

    it('should not overwrite existing tenancy_type', () => {
      const facts = {
        ...sampleFixedTermWizardFacts,
        tenancy_type: 'assured',
      };

      const normalized = normalizeTenancyFacts(facts);

      expect(normalized.tenancy_type).toBe('assured');
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

    it('should set fixed_term from is_fixed_term', () => {
      const normalized = normalizeTenancyFacts(sampleFixedTermWizardFacts);

      expect(normalized.fixed_term).toBe(true);
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
  });
});

describe('Tenancy Agreement Generation Validation', () => {
  describe('Fixed Term Tenancy', () => {
    it('should NOT throw LEGAL_BLOCK with standard AST wizard dataset', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts: sampleFixedTermWizardFacts,
      };

      const result = validateFlow(input);

      // Check for any blocking issues related to the mapped fields
      const relevantBlockingIssues = result.blocking_issues.filter(issue =>
        issue.fields.some(field =>
          ['tenant_full_name', 'rent_frequency', 'payment_date', 'tenancy_type', 'fixed_term_end_date'].includes(field)
        )
      );

      expect(relevantBlockingIssues).toHaveLength(0);
    });

    it('should correctly normalize all wizard fields before validation', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'preview',
        facts: sampleFixedTermWizardFacts,
      };

      const result = validateFlow(input);

      // Should not have blocking issues for the mapped fields
      const mappedFieldIssues = result.blocking_issues.filter(issue =>
        issue.code === 'REQUIRED_FACT_MISSING' &&
        issue.fields.some(field =>
          ['tenant_full_name', 'rent_frequency', 'payment_date', 'tenancy_type', 'fixed_term_end_date', 'landlord_address_line1', 'landlord_address_town', 'landlord_address_postcode'].includes(field)
        )
      );

      expect(mappedFieldIssues).toHaveLength(0);
    });
  });

  describe('Periodic Tenancy', () => {
    it('should NOT require fixed_term_end_date for periodic tenancy', () => {
      const input: FlowValidationInput = {
        jurisdiction: 'england',
        product: 'tenancy_agreement',
        route: 'ast_standard',
        stage: 'generate',
        facts: samplePeriodicWizardFacts,
      };

      const result = validateFlow(input);

      // Should not have blocking issue for fixed_term_end_date
      const fixedTermIssues = result.blocking_issues.filter(issue =>
        issue.fields.includes('fixed_term_end_date')
      );

      expect(fixedTermIssues).toHaveLength(0);
    });

    it('should derive tenancy_type as "periodic" for is_fixed_term=false', () => {
      const normalized = normalizeTenancyFacts(samplePeriodicWizardFacts);

      expect(normalized.tenancy_type).toBe('periodic');
      expect(normalized.fixed_term).toBe(false);
    });
  });

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
        issue.fields.some(field => field.includes('tenant'))
      );

      expect(tenantIssues).toHaveLength(0);
    });
  });
});
