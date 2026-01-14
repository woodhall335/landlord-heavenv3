/**
 * Section 8 Template Data Regression Tests
 *
 * CRITICAL: These tests verify Section 8 Notice Only pack functionality.
 * They MUST pass before and after any changes to shared mapping code.
 *
 * Purpose:
 * - Snapshot/assertion tests for Section 8 templateData keys + core values
 * - Verify compliance checklist, service instructions, validity checklist generate correctly
 * - Ensure Section 8 functionality doesn't regress when fixing Section 21 issues
 *
 * Run these tests after ANY change to:
 * - src/lib/case-facts/normalize.ts (mapNoticeOnlyFacts)
 * - src/lib/documents/section8-generator.ts
 * - config/jurisdictions/uk/england/templates/notice_only/form_3_section8/
 * - config/jurisdictions/uk/england/templates/eviction/checklist_section_8.hbs
 * - config/jurisdictions/uk/england/templates/eviction/service_instructions_section_8.hbs
 */

import { describe, expect, it } from 'vitest';
import {
  mapNoticeOnlyFacts,
  resolveNoticeServiceDate,
  resolveNoticeExpiryDate,
  formatUkLegalDate,
  buildGroundDescriptions,
} from '@/lib/case-facts/normalize';
import { generateDocument } from '@/lib/documents/generator';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TEST FIXTURES
// =============================================================================

/**
 * Standard Section 8 wizard facts for regression testing.
 * This represents a typical Ground 8 + Ground 10 rent arrears case.
 */
function createSection8WizardFacts() {
  return {
    jurisdiction: 'england',
    selected_notice_route: 'section_8',
    section8_grounds_selection: ['ground_8', 'ground_10'],
    section8_grounds: ['Ground 8 - Serious rent arrears', 'Ground 10 - Some rent unpaid'],
    ground_particulars: {
      ground_8: {
        factual_summary: 'Tenant owes two full months of rent.',
        evidence: 'Bank statements and ledger',
        total_amount_owed: 2400,
        period_of_arrears: 'November 2025 - December 2025',
      },
      ground_10: {
        factual_summary: 'Some rent remains unpaid from previous periods.',
        evidence_available: 'Payment records',
      },
    },
    // Landlord details
    landlord_full_name: 'James Landlord',
    landlord_address_line1: '10 Owner Lane',
    landlord_address_town: 'Manchester',
    landlord_address_postcode: 'M1 1AA',
    landlord_phone: '07700900123',
    landlord_email: 'james@landlord.com',
    // Tenant details
    tenant_full_name: 'Sarah Tenant',
    property_address_line1: '25 Rented House',
    property_address_town: 'Manchester',
    property_address_postcode: 'M2 2BB',
    // Tenancy details
    tenancy_start_date: '2023-06-15',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    fixed_term: false,
    // Arrears
    total_arrears: 2400,
    arrears_at_notice_date: 2400,
    // Notice dates
    notice_service_date: '2026-01-15',
    notice_expiry_date: '2026-01-29', // 14 days for Ground 8
    // Deposit
    deposit_taken: true,
    deposit_protected: true,
    deposit_amount: 1200,
    deposit_scheme: 'DPS',
    // Serving capacity
    serving_capacity: 'landlord',
  };
}

/**
 * Section 8 wizard facts with multiple grounds (mandatory + discretionary)
 */
function createSection8MixedGroundsWizardFacts() {
  return {
    ...createSection8WizardFacts(),
    section8_grounds_selection: ['ground_8', 'ground_10', 'ground_11', 'ground_12'],
    section8_grounds: [
      'Ground 8 - Serious rent arrears',
      'Ground 10 - Some rent unpaid',
      'Ground 11 - Persistent delay in paying rent',
      'Ground 12 - Breach of tenancy obligation',
    ],
    ground_particulars: {
      ground_8: {
        factual_summary: 'Tenant owes two full months of rent.',
        evidence: 'Bank statements',
      },
      ground_10: {
        factual_summary: 'Some rent unpaid.',
      },
      ground_11: {
        factual_summary: 'Consistently paid rent late over 6 months.',
      },
      ground_12: {
        factual_summary: 'Tenant has violated noise clause.',
        tenancy_clause_breached: 'Clause 15.2 - No excessive noise',
      },
    },
  };
}

// =============================================================================
// PHASE 0: SECTION 8 SAFETY NET REGRESSION TESTS
// =============================================================================

describe('Section 8 Regression Tests - mapNoticeOnlyFacts', () => {
  describe('Core Template Data Keys', () => {
    it('MUST produce all required Section 8 template data keys', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Required keys for Section 8 templates
      const requiredKeys = [
        // Party details
        'landlord_full_name',
        'landlord_address',
        'tenant_full_name',
        'property_address',
        // Dates (raw)
        'service_date',
        'notice_date',
        'earliest_possession_date',
        'tenancy_start_date',
        // Dates (formatted)
        'service_date_formatted',
        'tenancy_start_date_formatted',
        'earliest_possession_date_formatted',
        // Notice aliases
        'notice_service_date',
        'notice_expiry_date',
        // Grounds
        'grounds',
        'ground_descriptions',
        'has_mandatory_ground',
        // Deposit
        'deposit_protected',
        'deposit_amount',
        'deposit_scheme',
        // Serving capacity
        'is_landlord_serving',
        'is_joint_landlords_serving',
        'is_agent_serving',
        // Nested objects
        'property',
        'tenant',
        'tenancy',
        'deposit',
        'compliance',
        // Metadata
        'jurisdiction',
      ];

      for (const key of requiredKeys) {
        expect(result).toHaveProperty(key);
      }
    });

    it('MUST correctly map landlord details', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.landlord_full_name).toBe('James Landlord');
      expect(result.landlord_address).toContain('10 Owner Lane');
      expect(result.landlord_address).toContain('Manchester');
      expect(result.landlord_address).toContain('M1 1AA');
      expect(result.landlord_phone).toBe('07700900123');
    });

    it('MUST correctly map tenant and property details', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.tenant_full_name).toBe('Sarah Tenant');
      expect(result.property_address).toContain('25 Rented House');
      expect(result.property_address).toContain('Manchester');
      expect(result.property_address).toContain('M2 2BB');
    });

    it('MUST correctly format dates in UK legal format', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Service date: 2026-01-15 -> "15 January 2026"
      expect(result.service_date_formatted).toBe('15 January 2026');
      // Tenancy start: 2023-06-15 -> "15 June 2023"
      expect(result.tenancy_start_date_formatted).toBe('15 June 2023');
      // Earliest possession date should be formatted
      expect(result.earliest_possession_date_formatted).toBeTruthy();
    });
  });

  describe('Section 8 Grounds Mapping', () => {
    it('MUST build grounds array with correct structure', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(Array.isArray(result.grounds)).toBe(true);
      expect(result.grounds.length).toBeGreaterThan(0);

      // Each ground should have required fields
      for (const ground of result.grounds) {
        expect(ground).toHaveProperty('code');
        expect(ground).toHaveProperty('title');
        expect(ground).toHaveProperty('mandatory');
      }
    });

    it('MUST correctly identify mandatory ground (Ground 8)', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Ground 8 is mandatory
      expect(result.has_mandatory_ground).toBe(true);

      const ground8 = result.grounds.find((g: any) => g.code === 8 || g.code === '8');
      expect(ground8).toBeTruthy();
      expect(ground8?.mandatory).toBe(true);
    });

    it('MUST build ground_descriptions string', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.ground_descriptions).toBeTruthy();
      expect(result.ground_descriptions).toContain('Ground 8');
      expect(result.ground_descriptions).toContain('mandatory');
    });

    it('MUST handle mixed mandatory and discretionary grounds', () => {
      const wizardFacts = createSection8MixedGroundsWizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.has_mandatory_ground).toBe(true);
      expect(result.grounds.length).toBeGreaterThanOrEqual(2);

      // Should have both mandatory and discretionary
      const hasMandatory = result.grounds.some((g: any) => g.mandatory === true);
      const hasDiscretionary = result.grounds.some((g: any) => g.mandatory === false);

      expect(hasMandatory).toBe(true);
      // Ground 10, 11, 12 are discretionary
    });
  });

  describe('Section 8 Date Resolution', () => {
    it('MUST resolve service_date from notice_service_date', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.service_date).toBe('2026-01-15');
      expect(result.notice_service_date).toBe('2026-01-15');
      expect(result.intended_service_date).toBe('2026-01-15');
    });

    it('MUST resolve expiry_date from notice_expiry_date', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.expiry_date).toBe('2026-01-29');
      expect(result.notice_expiry_date).toBe('2026-01-29');
    });

    it('MUST calculate earliest_possession_date when not provided', () => {
      const wizardFacts = {
        ...createSection8WizardFacts(),
        notice_expiry_date: undefined,
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      // Should calculate based on notice period for grounds
      expect(result.earliest_possession_date).toBeTruthy();
      expect(result.earliest_possession_date_formatted).toBeTruthy();
    });
  });

  describe('Section 8 Deposit Mapping', () => {
    it('MUST correctly map deposit details when protected', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit_protected).toBe(true);
      expect(result.deposit_amount).toBe(1200);
      expect(result.deposit_scheme).toBe('DPS');
    });

    it('MUST handle deposit not taken scenario', () => {
      const wizardFacts = {
        ...createSection8WizardFacts(),
        deposit_taken: false,
        deposit_protected: false,
        deposit_amount: undefined,
        deposit_scheme: undefined,
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit_taken).toBe(false);
      expect(result.deposit_amount).toBe(0);
      expect(result.deposit_scheme).toBeNull();
    });

    it('MUST include nested deposit object', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.deposit).toBeTruthy();
      expect(result.deposit.protected).toBe(true);
      expect(result.deposit.amount).toBe(1200);
      expect(result.deposit.scheme).toBe('DPS');
    });
  });

  describe('Section 8 Serving Capacity', () => {
    it('MUST set is_landlord_serving when capacity is landlord', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.serving_capacity).toBe('landlord');
      expect(result.is_landlord_serving).toBe(true);
      expect(result.is_joint_landlords_serving).toBe(false);
      expect(result.is_agent_serving).toBe(false);
    });

    it('MUST handle agent serving capacity', () => {
      const wizardFacts = {
        ...createSection8WizardFacts(),
        serving_capacity: 'agent',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.is_landlord_serving).toBe(false);
      expect(result.is_joint_landlords_serving).toBe(false);
      expect(result.is_agent_serving).toBe(true);
    });

    it('MUST handle joint landlords serving capacity', () => {
      const wizardFacts = {
        ...createSection8WizardFacts(),
        serving_capacity: 'joint_landlords',
      };
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.is_landlord_serving).toBe(false);
      expect(result.is_joint_landlords_serving).toBe(true);
      expect(result.is_agent_serving).toBe(false);
    });
  });

  describe('Section 8 Arrears Data', () => {
    it('MUST map total_arrears for rent arrears grounds', () => {
      const wizardFacts = createSection8WizardFacts();
      const result = mapNoticeOnlyFacts(wizardFacts);

      expect(result.total_arrears).toBe(2400);
      expect(result.arrears_at_notice_date).toBe(2400);
    });
  });
});

// =============================================================================
// TEMPLATE STRUCTURE VERIFICATION
// =============================================================================

describe('Section 8 Template Files - Structure Verification', () => {
  const TEMPLATES_BASE = path.join(process.cwd(), 'config/jurisdictions/uk/england/templates');

  describe('Form 3 Template (notice.hbs)', () => {
    it('MUST exist and contain required placeholders', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_3_section8/notice.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Required placeholders for Section 8 Form 3
      expect(content).toContain('{{tenant_full_name}}');
      expect(content).toContain('{{landlord_full_name}}');
      expect(content).toContain('{{property_address}}');
      expect(content).toContain('{{landlord_address}}');

      // Date placeholders
      expect(content).toContain('earliest_possession_date');
      expect(content).toContain('service_date');

      // Grounds section
      expect(content).toContain('{{#each grounds}}');

      // Form header
      expect(content).toContain('Form 3');
      expect(content).toContain('Section 8');
    });

    it('MUST contain footer with landlordheaven.co.uk', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'notice_only/form_3_section8/notice.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('landlordheaven.co.uk');
    });
  });

  describe('Service Instructions Template (S8)', () => {
    it('MUST exist and contain Section 8 specific content', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('Section 8');
      expect(content).toContain('{{service_date_formatted}}');
      expect(content).toContain('{{earliest_possession_date_formatted}}');
      expect(content).toContain('{{property_address}}');
      expect(content).toContain('{{tenant_full_name}}');
    });

    it('MUST NOT contain S21-specific compliance blockers', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/service_instructions_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Section 8 service instructions should NOT mention S21 compliance requirements
      expect(content).not.toMatch(/Missing compliance requirements.*gas cert.*EPC.*How to Rent/i);
    });
  });

  describe('Checklist Template (S8)', () => {
    it('MUST exist and contain correct Section 8 content', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      expect(content).toContain('Section 8');
      expect(content).toContain('{{tenancy_start_date_formatted}}');
      expect(content).toContain('{{service_date_formatted}}');
      expect(content).toContain('{{earliest_possession_date_formatted}}');
      expect(content).toContain('{{ground_descriptions}}');
      // has_mandatory_ground is used as a conditional block
      expect(content).toContain('has_mandatory_ground');
    });

    it('MUST contain legally accurate notice period guidance', () => {
      const templatePath = path.join(TEMPLATES_BASE, 'eviction/checklist_section_8.hbs');
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Correct: 60 days for Grounds 1, 2, 5, 6, 7, 9, 10, 11, 16
      expect(content).toMatch(/60 days.*2 months.*Grounds 1.*2.*5.*6.*7.*9.*10.*11.*16/is);

      // Correct: 14 days for Grounds 3, 4, 7A, 7B, 8, 12, 13, 14, 15, 17
      expect(content).toMatch(/14 days.*2 weeks.*Ground.*8/is);
    });
  });
});

// =============================================================================
// DATE RESOLUTION HELPER TESTS
// =============================================================================

describe('Section 8 Date Resolution Helpers', () => {
  describe('resolveNoticeServiceDate', () => {
    it('MUST find date from notice_service_date', () => {
      const result = resolveNoticeServiceDate({ notice_service_date: '2026-01-15' } as any);
      expect(result).toBe('2026-01-15');
    });

    it('MUST find date from section8_notice_date', () => {
      const result = resolveNoticeServiceDate({ section8_notice_date: '2026-02-01' } as any);
      expect(result).toBe('2026-02-01');
    });

    it('MUST find date from section_8_notice_date', () => {
      const result = resolveNoticeServiceDate({ section_8_notice_date: '2026-02-15' } as any);
      expect(result).toBe('2026-02-15');
    });

    it('MUST find date from intended_service_date', () => {
      const result = resolveNoticeServiceDate({ intended_service_date: '2026-03-01' } as any);
      expect(result).toBe('2026-03-01');
    });

    it('MUST return null when no date found', () => {
      const result = resolveNoticeServiceDate({} as any);
      expect(result).toBeNull();
    });
  });

  describe('resolveNoticeExpiryDate', () => {
    it('MUST find date from notice_expiry_date', () => {
      const result = resolveNoticeExpiryDate({ notice_expiry_date: '2026-01-29' } as any);
      expect(result).toBe('2026-01-29');
    });

    it('MUST find date from earliest_possession_date', () => {
      const result = resolveNoticeExpiryDate({ earliest_possession_date: '2026-02-15' } as any);
      expect(result).toBe('2026-02-15');
    });

    it('MUST find date from section8_expiry_date', () => {
      const result = resolveNoticeExpiryDate({ section8_expiry_date: '2026-03-01' } as any);
      expect(result).toBe('2026-03-01');
    });
  });

  describe('formatUkLegalDate', () => {
    it('MUST format dates correctly for Section 8 templates', () => {
      expect(formatUkLegalDate('2026-01-15')).toBe('15 January 2026');
      expect(formatUkLegalDate('2026-12-25')).toBe('25 December 2026');
      expect(formatUkLegalDate('2023-06-01')).toBe('1 June 2023');
    });

    it('MUST return null for invalid dates', () => {
      expect(formatUkLegalDate(null)).toBeNull();
      expect(formatUkLegalDate(undefined)).toBeNull();
      expect(formatUkLegalDate('')).toBeNull();
      expect(formatUkLegalDate('not-a-date')).toBeNull();
    });
  });

  describe('buildGroundDescriptions', () => {
    it('MUST build correct descriptions for Section 8 grounds', () => {
      const grounds = [
        { code: 8, title: 'Serious rent arrears', mandatory: true },
        { code: 10, title: 'Some rent unpaid', mandatory: false },
      ];

      const result = buildGroundDescriptions(grounds);

      expect(result).toContain('Ground 8');
      expect(result).toContain('(mandatory)');
      expect(result).toContain('Ground 10');
    });

    it('MUST return null for empty grounds', () => {
      expect(buildGroundDescriptions([])).toBeNull();
      expect(buildGroundDescriptions(null)).toBeNull();
    });
  });
});

// =============================================================================
// NESTED OBJECT STRUCTURE VERIFICATION
// =============================================================================

describe('Section 8 Nested Object Structure', () => {
  it('MUST create property nested object correctly', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.property).toBeTruthy();
    expect(result.property.address_line1).toBe('25 Rented House');
    expect(result.property.address_town).toBe('Manchester');
    expect(result.property.postcode).toBe('M2 2BB');
  });

  it('MUST create tenant nested object correctly', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.tenant).toBeTruthy();
    expect(result.tenant.full_name).toBe('Sarah Tenant');
  });

  it('MUST create tenancy nested object correctly', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.tenancy).toBeTruthy();
    expect(result.tenancy.start_date).toBe('2023-06-15');
  });

  it('MUST create deposit nested object correctly', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.deposit).toBeTruthy();
    expect(result.deposit.protected).toBe(true);
    expect(result.deposit.amount).toBe(1200);
    expect(result.deposit.scheme).toBe('DPS');
  });

  it('MUST create compliance nested object', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.compliance).toBeTruthy();
    // Note: For Section 8, compliance items are not blockers like S21
    // but we still map them for completeness
  });
});

// =============================================================================
// EDGE CASES AND BACKWARD COMPATIBILITY
// =============================================================================

describe('Section 8 Edge Cases and Backward Compatibility', () => {
  it('MUST handle missing optional fields gracefully', () => {
    const minimalFacts = {
      jurisdiction: 'england',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address_line1: '123 Test St',
      notice_service_date: '2026-01-15',
      section8_grounds_selection: ['ground_8'],
    };

    const result = mapNoticeOnlyFacts(minimalFacts);

    expect(result.landlord_full_name).toBe('Test Landlord');
    expect(result.tenant_full_name).toBe('Test Tenant');
    expect(result.service_date).toBe('2026-01-15');
    // Should not throw error for missing fields
  });

  it('MUST handle legacy field names', () => {
    const legacyFacts = {
      jurisdiction: 'england',
      landlord_name: 'Legacy Landlord', // Old field name
      tenant_full_name: 'Test Tenant',
      property_address: '123 Test St', // Pre-concatenated
      served_on: '2026-01-15', // Legacy date field
      section8_grounds: ['Ground 8'],
    };

    const result = mapNoticeOnlyFacts(legacyFacts);

    // Should still work with legacy fields
    expect(result.service_date).toBe('2026-01-15');
  });

  it('MUST set default service date when none provided', () => {
    const factsNoDate = {
      jurisdiction: 'england',
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address_line1: '123 Test St',
      section8_grounds_selection: ['ground_8'],
    };

    const result = mapNoticeOnlyFacts(factsNoDate);

    // Should default to today's date
    expect(result.service_date).toBeTruthy();
    expect(result.notice_date).toBeTruthy();
  });

  it('MUST preserve ground_particulars for downstream templates', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    expect(result.ground_particulars).toBeTruthy();
    expect(result.ground_particulars.ground_8).toBeTruthy();
  });
});

// =============================================================================
// SNAPSHOT TEST FOR CRITICAL TEMPLATE DATA
// =============================================================================

describe('Section 8 Template Data Snapshot', () => {
  it('MUST produce consistent template data structure', () => {
    const wizardFacts = createSection8WizardFacts();
    const result = mapNoticeOnlyFacts(wizardFacts);

    // This serves as a "snapshot" of critical S8 data structure
    // If any of these change, investigation is required
    const criticalStructure = {
      hasLandlordName: typeof result.landlord_full_name === 'string',
      hasLandlordAddress: typeof result.landlord_address === 'string',
      hasTenantName: typeof result.tenant_full_name === 'string',
      hasPropertyAddress: typeof result.property_address === 'string',
      hasServiceDate: typeof result.service_date === 'string',
      hasEarliestPossessionDate: typeof result.earliest_possession_date === 'string',
      hasFormattedServiceDate: typeof result.service_date_formatted === 'string',
      hasFormattedPossessionDate: typeof result.earliest_possession_date_formatted === 'string',
      hasFormattedTenancyStart: typeof result.tenancy_start_date_formatted === 'string',
      hasGroundsArray: Array.isArray(result.grounds),
      hasGroundDescriptions: typeof result.ground_descriptions === 'string',
      hasMandatoryGroundFlag: typeof result.has_mandatory_ground === 'boolean',
      hasServingCapacityFlags: typeof result.is_landlord_serving === 'boolean',
      hasNestedProperty: typeof result.property === 'object',
      hasNestedTenant: typeof result.tenant === 'object',
      hasNestedTenancy: typeof result.tenancy === 'object',
      hasNestedDeposit: typeof result.deposit === 'object',
    };

    // All must be true for S8 to work correctly
    expect(Object.values(criticalStructure).every(v => v === true)).toBe(true);
  });
});
