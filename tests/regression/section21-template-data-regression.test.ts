/**
 * Section 21 Template Data Regression Tests
 *
 * Purpose:
 * - Verify Section 21 Notice Only pack templates receive correct data
 * - Test display_possession_date_formatted and other S21-specific fields
 * - Verify compliance booleans are correctly mapped
 * - Test fixed-term validation logic (Phase 3)
 *
 * These tests verify the fixes for:
 * - display_possession_date_formatted missing from templates
 * - generated_date field for template footers
 * - Compliance checklist boolean mapping
 */

import { describe, expect, it } from 'vitest';
import {
  mapNoticeOnlyFacts,
  formatUkLegalDate,
} from '@/lib/case-facts/normalize';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TEST FIXTURES
// =============================================================================

/**
 * Standard Section 21 wizard facts for regression testing.
 * This represents a typical AST tenancy where landlord wants no-fault eviction.
 */
function createSection21WizardFacts() {
  return {
    jurisdiction: 'england',
    selected_notice_route: 'section_21',
    // Landlord details
    landlord_full_name: 'Jane Owner',
    landlord_address_line1: '15 Investor Road',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    landlord_phone: '07700900456',
    landlord_email: 'jane@owner.com',
    // Tenant details
    tenant_full_name: 'Tom Renter',
    property_address_line1: '42 Tenant Way',
    property_address_town: 'London',
    property_address_postcode: 'E1 6AN',
    // Tenancy details
    tenancy_start_date: '2024-03-15',
    rent_amount: 1500,
    rent_frequency: 'monthly',
    fixed_term: false,
    is_fixed_term: false,
    // Notice dates (2 months notice required for S21)
    notice_service_date: '2026-01-15',
    notice_expiry_date: '2026-03-15', // 2 months from service
    // Deposit (S21 requires deposit protection)
    deposit_taken: true,
    deposit_protected: true,
    deposit_amount: 1500,
    deposit_scheme: 'TDS',
    // S21 compliance requirements (all must be true for valid S21)
    prescribed_info_given: true,
    gas_certificate_provided: true,
    gas_safety_cert_provided: true,
    epc_provided: true,
    epc_rating: 'C',
    how_to_rent_provided: true,
    how_to_rent_given: true,
    // Serving capacity
    serving_capacity: 'landlord',
  };
}

/**
 * Section 21 wizard facts with fixed-term tenancy
 */
function createSection21FixedTermWizardFacts() {
  return {
    ...createSection21WizardFacts(),
    fixed_term: true,
    is_fixed_term: true,
    fixed_term_end_date: '2026-06-30',
    // Notice must expire on or after fixed term end
    notice_expiry_date: '2026-06-30',
  };
}

/**
 * Section 21 wizard facts with break clause
 */
function createSection21BreakClauseWizardFacts() {
  return {
    ...createSection21FixedTermWizardFacts(),
    has_break_clause: true,
    break_clause_date: '2026-03-01',
    // Notice can expire after break clause date
    notice_expiry_date: '2026-03-15',
  };
}

// =============================================================================
// PHASE 2 FIXES: SECTION 21 TEMPLATE DATA
// =============================================================================

describe('Section 21 Regression Tests - mapNoticeOnlyFacts', () => {
  describe('Core Template Data Keys', () => {
    it('MUST produce all required Section 21 template data keys', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Required keys for Section 21 templates
      const requiredKeys = [
        // Party details
        'landlord_full_name',
        'landlord_address',
        'tenant_full_name',
        'property_address',
        // Dates (raw)
        'service_date',
        'notice_date',
        'notice_expiry_date',
        'tenancy_start_date',
        // Dates (formatted) - critical for S21 templates
        'service_date_formatted',
        'tenancy_start_date_formatted',
        'notice_expiry_date_formatted',
        // S21-specific: display_possession_date_formatted
        'display_possession_date_formatted',
        'display_possession_date',
        // Compliance booleans (critical for S21 validity)
        'deposit_protected',
        'prescribed_info_given',
        'gas_certificate_provided',
        'epc_provided',
        'how_to_rent_given',
        // Generated date for footers
        'generated_date',
        // Serving capacity
        'is_landlord_serving',
        'is_joint_landlords_serving',
        'is_agent_serving',
        // Fixed term
        'fixed_term',
      ];

      for (const key of requiredKeys) {
        expect(result).toHaveProperty(key);
      }
    });
  });

  describe('S21 Display Possession Date (FIX)', () => {
    it('MUST set display_possession_date_formatted from notice_expiry_date', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Service Instructions and Validity Checklist templates use this field
      expect(result.display_possession_date_formatted).toBeTruthy();
      expect(result.display_possession_date_formatted).toBe('15 March 2026');
    });

    it('MUST set display_possession_date (raw) from notice_expiry_date', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.display_possession_date).toBe('2026-03-15');
    });

    it('MUST fallback to earliest_possession_date if notice_expiry_date missing', () => {
      const wizardFacts = {
        ...createSection21WizardFacts(),
        notice_expiry_date: undefined,
        earliest_possession_date: '2026-03-20',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.display_possession_date_formatted).toBeTruthy();
    });
  });

  describe('S21 Generated Date (FIX)', () => {
    it('MUST set generated_date for template footers', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Templates use {{generated_date}} in footers
      expect(result.generated_date).toBeTruthy();
      // Should be formatted as UK legal date (e.g., "14 January 2026")
      expect(result.generated_date).toMatch(/\d{1,2} \w+ \d{4}/);
    });
  });

  describe('S21 Compliance Booleans', () => {
    it('MUST correctly map deposit_protected when YES', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit_protected).toBe(true);
    });

    it('MUST correctly map prescribed_info_given when YES', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.prescribed_info_given).toBe(true);
    });

    it('MUST correctly map gas_certificate_provided when YES', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.gas_certificate_provided).toBe(true);
      expect(result.gas_cert_provided).toBe(true); // Alias
    });

    it('MUST correctly map epc_provided when YES', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.epc_provided).toBe(true);
    });

    it('MUST correctly map how_to_rent_given when YES', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.how_to_rent_given).toBe(true);
      expect(result.how_to_rent_provided).toBe(true); // Alias
    });

    it('MUST handle compliance = NO correctly', () => {
      const wizardFacts = {
        ...createSection21WizardFacts(),
        deposit_protected: false,
        prescribed_info_given: false,
        gas_certificate_provided: false,
        epc_provided: false,
        how_to_rent_given: false,
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit_protected).toBe(false);
      expect(result.prescribed_info_given).toBe(false);
      expect(result.gas_certificate_provided).toBe(false);
      expect(result.epc_provided).toBe(false);
      expect(result.how_to_rent_given).toBe(false);
    });

    it('MUST handle string "yes" values for compliance', () => {
      const wizardFacts = {
        ...createSection21WizardFacts(),
        deposit_protected: 'yes',
        prescribed_info_given: 'Yes',
        gas_certificate_provided: 'YES',
        epc_provided: 'true',
        how_to_rent_given: 'y',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit_protected).toBe(true);
      expect(result.prescribed_info_given).toBe(true);
      expect(result.gas_certificate_provided).toBe(true);
      expect(result.epc_provided).toBe(true);
      expect(result.how_to_rent_given).toBe(true);
    });

    // CRITICAL FIX TEST: Section21ComplianceSection uses *_served field names
    // but templates and generators expect *_given/*_provided field names.
    // The mapper MUST recognize both variants.
    it('MUST correctly map *_served field variants from Section21ComplianceSection', () => {
      // Section21ComplianceSection stores values using *_served field names
      const wizardFacts = {
        ...createSection21WizardFacts(),
        // Remove the *_given/*_provided fields
        prescribed_info_given: undefined,
        gas_certificate_provided: undefined,
        gas_safety_cert_provided: undefined,
        epc_provided: undefined,
        how_to_rent_provided: undefined,
        how_to_rent_given: undefined,
        // Use Section21ComplianceSection field names (*_served)
        prescribed_info_served: true,
        gas_safety_cert_served: true,
        epc_served: true,
        how_to_rent_served: true,
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      // All compliance fields should be mapped correctly from *_served variants
      expect(result.prescribed_info_given).toBe(true);
      expect(result.gas_certificate_provided).toBe(true);
      expect(result.gas_cert_provided).toBe(true); // Alias
      expect(result.epc_provided).toBe(true);
      expect(result.how_to_rent_given).toBe(true);
      expect(result.how_to_rent_provided).toBe(true); // Alias
    });

    it('MUST correctly map *_served fields with string "yes" value', () => {
      const wizardFacts = {
        jurisdiction: 'england',
        // Only use *_served variants with string values
        prescribed_info_served: 'yes',
        gas_safety_cert_served: 'yes',
        epc_served: 'yes',
        how_to_rent_served: 'yes',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.prescribed_info_given).toBe(true);
      expect(result.gas_certificate_provided).toBe(true);
      expect(result.epc_provided).toBe(true);
      expect(result.how_to_rent_given).toBe(true);
    });

    it('MUST correctly map *_served fields with boolean false value', () => {
      const wizardFacts = {
        jurisdiction: 'england',
        // Only use *_served variants with false values
        prescribed_info_served: false,
        gas_safety_cert_served: false,
        epc_served: false,
        how_to_rent_served: false,
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.prescribed_info_given).toBe(false);
      expect(result.gas_certificate_provided).toBe(false);
      expect(result.epc_provided).toBe(false);
      expect(result.how_to_rent_given).toBe(false);
    });
  });

  describe('S21 Date Resolution', () => {
    it('MUST resolve service_date from notice_service_date', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.service_date).toBe('2026-01-15');
      expect(result.service_date_formatted).toBe('15 January 2026');
    });

    it('MUST resolve notice_expiry_date correctly', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.notice_expiry_date).toBe('2026-03-15');
      expect(result.notice_expiry_date_formatted).toBe('15 March 2026');
    });

    it('MUST format tenancy_start_date correctly', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.tenancy_start_date).toBe('2024-03-15');
      expect(result.tenancy_start_date_formatted).toBe('15 March 2024');
    });
  });

  describe('S21 Fixed Term Handling', () => {
    it('MUST set fixed_term flag correctly for periodic tenancy', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.fixed_term).toBe(false);
    });

    it('MUST set fixed_term flag correctly for fixed term tenancy', () => {
      const wizardFacts = createSection21FixedTermWizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.fixed_term).toBe(true);
      expect(result.fixed_term_end_date).toBe('2026-06-30');
      expect(result.fixed_term_end_date_formatted).toBe('30 June 2026');
    });
  });

  describe('S21 Serving Capacity', () => {
    it('MUST set is_landlord_serving when capacity is landlord', () => {
      const wizardFacts = createSection21WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.is_landlord_serving).toBe(true);
      expect(result.is_joint_landlords_serving).toBe(false);
      expect(result.is_agent_serving).toBe(false);
    });

    it('MUST set is_agent_serving when capacity is agent', () => {
      const wizardFacts = {
        ...createSection21WizardFacts(),
        serving_capacity: 'agent',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.is_landlord_serving).toBe(false);
      expect(result.is_agent_serving).toBe(true);
    });
  });

  // =============================================================================
  // S21 AUTO-CALCULATION TESTS (FIX FOR FORM 6A DATE MAPPING)
  // =============================================================================
  // These tests verify that when notice_expiry_date is NOT provided by the user,
  // the system correctly auto-calculates it using the Section 21 rules:
  // - 2 calendar months minimum notice
  // - 4-month bar from tenancy start
  // - Fixed term end date constraints
  // - Break clause handling
  // =============================================================================
  describe('S21 Expiry Date Auto-Calculation (FIX: Form 6A dates)', () => {
    it('MUST auto-calculate notice_expiry_date when not provided (2 months from service)', () => {
      // Create facts WITHOUT notice_expiry_date - mimics real wizard flow
      const wizardFacts = {
        jurisdiction: 'england',
        selected_notice_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2024-01-15', // Started over 4 months ago
        rent_frequency: 'monthly',
        is_fixed_term: false,
        fixed_term: false,
        notice_service_date: '2026-01-15',
        // notice_expiry_date NOT provided - should be auto-calculated
        deposit_taken: true,
        deposit_protected: true,
      };

      const result = mapNoticeOnlyFacts(wizardFacts);

      // Should auto-calculate 2 months from service date
      expect(result.notice_expiry_date).toBe('2026-03-15');
      expect(result.earliest_possession_date).toBe('2026-03-15');
      expect(result.notice_expiry_date_formatted).toBe('15 March 2026');
      expect(result.display_possession_date).toBe('2026-03-15');
      expect(result.display_possession_date_formatted).toBe('15 March 2026');
      expect(result.s21_expiry_explanation).toContain('2 calendar months');
    });

    it('MUST respect 4-month bar when tenancy started recently', () => {
      // Tenancy started only 2 months ago - 4-month bar applies
      const wizardFacts = {
        jurisdiction: 'england',
        selected_notice_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2025-11-15', // Only ~2 months ago
        rent_frequency: 'monthly',
        is_fixed_term: false,
        fixed_term: false,
        notice_service_date: '2026-01-15',
        // notice_expiry_date NOT provided
        deposit_taken: true,
        deposit_protected: true,
      };

      const result = mapNoticeOnlyFacts(wizardFacts);

      // 2 months from service = 2026-03-15
      // 4 months from tenancy start = 2026-03-15
      // Should be 2026-03-15 (max of both constraints)
      expect(result.notice_expiry_date).toBe('2026-03-15');
      expect(result.earliest_possession_date).toBe('2026-03-15');
    });

    it('MUST respect fixed term end date constraint', () => {
      // Fixed term ends after 2-month notice period
      const wizardFacts = {
        jurisdiction: 'england',
        selected_notice_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2024-06-01',
        rent_frequency: 'monthly',
        is_fixed_term: true,
        fixed_term: true,
        fixed_term_end_date: '2026-06-01', // Fixed term ends June 2026
        notice_service_date: '2026-01-15',
        // notice_expiry_date NOT provided
        deposit_taken: true,
        deposit_protected: true,
      };

      const result = mapNoticeOnlyFacts(wizardFacts);

      // 2 months from service = 2026-03-15
      // But fixed term ends 2026-06-01, so expiry must be on/after that
      expect(result.notice_expiry_date).toBe('2026-06-01');
      expect(result.earliest_possession_date).toBe('2026-06-01');
      expect(result.notice_expiry_date_formatted).toBe('1 June 2026');
    });

    it('MUST NOT override user-provided notice_expiry_date', () => {
      // User explicitly provides an expiry date
      const wizardFacts = {
        ...createSection21WizardFacts(),
        notice_expiry_date: '2026-04-20', // User provides custom date
      };

      const result = mapNoticeOnlyFacts(wizardFacts);

      // Should use user-provided date, not auto-calculate
      expect(result.notice_expiry_date).toBe('2026-04-20');
    });

    it('MUST NOT run for Section 8 routes', () => {
      // Section 8 should use ground-based calculation, not S21 calculation
      const wizardFacts = {
        jurisdiction: 'england',
        selected_notice_route: 'section_8',
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '1 Test Street',
        property_city: 'London',
        property_postcode: 'E1 1AA',
        tenancy_start_date: '2024-01-15',
        rent_frequency: 'monthly',
        notice_service_date: '2026-01-15',
        section8_grounds: ['Ground 8'],
      };

      const result = mapNoticeOnlyFacts(wizardFacts);

      // Should use ground-based calculation (14 days for Ground 8)
      expect(result.notice_period_days).toBe(14);
      expect(result.notice_period_description).toBe('2 weeks');
      // Should NOT have S21-specific explanation
      expect(result.s21_expiry_explanation).toBeUndefined();
    });
  });
});

// =============================================================================
// TEMPLATE STRUCTURE VERIFICATION
// =============================================================================

describe('Section 21 Template Files - Structure Verification', () => {
  const TEMPLATES_BASE = path.join(process.cwd(), 'config/jurisdictions/uk/england/templates');

  describe('Form 6A Template (notice.hbs)', () => {
    it('MUST exist and contain required placeholders', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_6a_section21/notice.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Required placeholders for Section 21 Form 6A
      expect(content).toContain('tenant_full_name');
      expect(content).toContain('landlord_full_name');
      expect(content).toContain('property_address');
      expect(content).toContain('landlord_address');

      // Date placeholders (uses format_date helper)
      expect(content).toContain('notice_expiry_date');
      expect(content).toContain('service_date');

      // Serving capacity checkboxes
      expect(content).toContain('is_landlord_serving');
      expect(content).toContain('is_joint_landlords_serving');
      expect(content).toContain('is_agent_serving');

      // Form header
      expect(content).toContain('Form 6A');
      expect(content).toContain('Section 21');
    });
  });

  describe('Service Instructions Template (S21)', () => {
    it('MUST exist and use display_possession_date_formatted', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_21.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('Section 21');
      expect(content).toContain('display_possession_date_formatted');
      expect(content).toContain('service_date_formatted');
      expect(content).toContain('property_address');
      expect(content).toContain('tenant_full_name');
    });
  });

  describe('Validity Checklist Template (S21)', () => {
    it('MUST exist and use display_possession_date_formatted', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_21.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('Section 21');
      expect(content).toContain('display_possession_date_formatted');
      expect(content).toContain('tenancy_start_date_formatted');
      expect(content).toContain('service_date_formatted');
      // S21-specific requirements
      expect(content).toContain('fixed_term');
      expect(content).toContain('Deposit');
    });
  });
});

// =============================================================================
// SNAPSHOT TEST FOR CRITICAL S21 TEMPLATE DATA
// =============================================================================

describe('Section 21 Template Data Snapshot', () => {
  it('MUST produce consistent S21 template data structure', () => {
    const wizardFacts = createSection21WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    // Critical S21 data structure check
    const criticalStructure = {
      hasLandlordName: typeof result.landlord_full_name === 'string',
      hasLandlordAddress: typeof result.landlord_address === 'string',
      hasTenantName: typeof result.tenant_full_name === 'string',
      hasPropertyAddress: typeof result.property_address === 'string',
      hasServiceDate: typeof result.service_date === 'string',
      hasNoticeExpiryDate: typeof result.notice_expiry_date === 'string',
      hasFormattedServiceDate: typeof result.service_date_formatted === 'string',
      hasFormattedExpiryDate: typeof result.notice_expiry_date_formatted === 'string',
      hasFormattedTenancyStart: typeof result.tenancy_start_date_formatted === 'string',
      // S21-specific fixes
      hasDisplayPossessionDateFormatted: typeof result.display_possession_date_formatted === 'string',
      hasGeneratedDate: typeof result.generated_date === 'string',
      // Compliance booleans
      hasDepositProtected: typeof result.deposit_protected === 'boolean',
      hasPrescribedInfo: typeof result.prescribed_info_given === 'boolean',
      hasGasCert: typeof result.gas_certificate_provided === 'boolean',
      hasEpc: typeof result.epc_provided === 'boolean',
      hasHowToRent: typeof result.how_to_rent_given === 'boolean',
      // Serving capacity
      hasServingCapacityFlags: typeof result.is_landlord_serving === 'boolean',
      // Nested objects
      hasNestedProperty: typeof result.property === 'object',
      hasNestedTenant: typeof result.tenant === 'object',
      hasNestedTenancy: typeof result.tenancy === 'object',
      hasNestedDeposit: typeof result.deposit === 'object',
    };

    // All must be true for S21 to work correctly
    expect(Object.values(criticalStructure).every(v => v === true)).toBe(true);
  });
});
