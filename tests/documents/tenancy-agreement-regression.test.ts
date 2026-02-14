/**
 * Tenancy Agreement Regression Tests
 *
 * These tests ensure the following quality requirements are maintained:
 * 1. NO ISO date formats (YYYY-MM-DD) appear in generated documents
 * 2. Signature sections start on a new page
 * 3. Witness sections never split across pages
 * 4. AST documents don't contain license wording that contradicts tenancy status
 * 5. End-of-tenancy cleaning wording is Tenant Fees Act safe
 * 6. Subletting wording is accurate and defensible
 * 7. Placeholder fields are clearly marked when data is missing
 *
 * @module tests/documents/tenancy-agreement-regression
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generatePremiumAST, generateStandardAST } from '@/lib/documents/ast-generator';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';
import { findISODates, formatUKDateLong, isISODateFormat } from '@/lib/formatters/date-uk';

// Mock the PDF generation to avoid needing Chromium in tests
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>('@/lib/documents/generator');
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

// Sample test data representing a worst-case scenario
const createTestWizardFacts = (overrides = {}) => ({
  product_tier: 'Premium AST',
  jurisdiction: 'england',
  landlord_full_name: 'Test Landlord With Very Long Name That Might Cause Overflow',
  landlord_address: '123 Very Long Street Name Avenue, Extremely Long Town Name, Long County, SW1A 1AA',
  landlord_address_line1: '123 Very Long Street Name Avenue',
  landlord_address_town: 'Extremely Long Town Name',
  landlord_address_postcode: 'SW1A 1AA',
  landlord_email: 'very.long.email.address@extremely-long-domain-name.example.co.uk',
  landlord_phone: '07000000010',
  property_address: '456 Another Very Long Property Address Street, Long City Name, LC1 2ZZ',
  property_address_line1: '456 Another Very Long Property Address Street',
  property_address_town: 'Long City Name',
  property_address_postcode: 'LC1 2ZZ',
  property_type: 'house',
  number_of_bedrooms: 4,
  furnished_status: 'furnished',
  parking_available: true,
  agreement_date: '2026-02-01',
  tenancy_start_date: '2026-02-15',
  is_fixed_term: true,
  term_length: '12 months',
  tenancy_end_date: '2027-02-15',
  rent_amount: 2200,
  rent_period: 'month',
  rent_due_day: '1st',
  payment_method: 'Standing Order',
  payment_details: 'Reference AST001',
  deposit_amount: 2500,
  deposit_scheme_name: 'MyDeposits',
  council_tax_responsibility: 'Tenant',
  utilities_responsibility: 'Tenant',
  internet_responsibility: 'Tenant',
  inventory_attached: true,
  professional_cleaning_required: false,
  pets_allowed: true,
  approved_pets: 'One small dog',
  smoking_allowed: false,
  is_hmo: true,
  hmo_licence_number: 'HMO12345/2026',
  number_of_sharers: 4,
  communal_areas: 'Kitchen, lounge, two bathrooms',
  guarantor_required: true,
  guarantor_name: 'Test Guarantor',
  guarantor_address: '789 Guarantor Street, Guarantor Town, GT1 1AA',
  guarantor_email: 'guarantor@example.com',
  guarantor_phone: '07000000200',
  guarantor_dob: '1975-05-15',
  guarantor_relationship: 'Parent',
  right_to_rent_check_date: '2026-01-20',
  how_to_rent_version: 'January 2026',
  how_to_rent_provision_date: '2026-01-25',
  current_date: '2026-01-31',
  // 4 tenants to test worst-case overflow
  tenants: {
    0: {
      full_name: 'Tenant One With Very Long Full Name',
      dob: '1990-01-15',
      email: 'tenant.one.with.very.long.email@example.co.uk',
      phone: '07000000020',
    },
    1: {
      full_name: 'Tenant Two With Another Long Name',
      dob: '1991-02-20',
      email: 'tenant.two@example.com',
      phone: '07000000021',
    },
    2: {
      full_name: 'Tenant Three With Yet Another Name',
      dob: '1992-03-25',
      email: 'tenant.three@example.com',
      phone: '07000000022',
    },
    3: {
      full_name: 'Tenant Four With Final Long Name',
      dob: '1993-04-30',
      email: 'tenant.four@example.com',
      phone: '07000000023',
    },
  },
  ...overrides,
});

describe('Tenancy Agreement Regression Tests', () => {
  describe('A) UK Date Formatting', () => {
    it('should not contain any ISO date formats (YYYY-MM-DD) in generated HTML', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Find any ISO dates in the generated HTML
      const isoDateMatches = findISODates(generated.html);

      // Should be empty - no ISO dates allowed
      expect(isoDateMatches).toEqual([]);
    }, 30000);

    it('should format all date fields in long UK format (D Month YYYY)', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Check that dates appear in correct format
      expect(generated.html).toContain('1 February 2026'); // agreement_date
      expect(generated.html).toContain('15 February 2026'); // tenancy_start_date
      expect(generated.html).toContain('15 February 2027'); // tenancy_end_date
      expect(generated.html).toContain('15 January 1990'); // tenant dob
      expect(generated.html).toContain('15 May 1975'); // guarantor dob
    }, 30000);

    it('should handle missing date fields gracefully', async () => {
      const wizardFacts = createTestWizardFacts({
        how_to_rent_provision_date: undefined,
        right_to_rent_check_date: undefined,
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should not crash and should not contain Invalid Date
      expect(generated.html).not.toContain('Invalid Date');
      expect(generated.html).not.toContain('NaN');
    }, 30000);
  });

  describe('B) Layout and Overflow Protection', () => {
    it('should have signature section with page-break-before: always', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Check CSS contains proper signature section styling
      expect(generated.html).toMatch(/\.signature-section\s*\{[^}]*page-break-before:\s*always/);
    }, 30000);

    it('should have witness section with page-break-inside: avoid', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Check CSS contains proper witness section styling
      expect(generated.html).toMatch(/\.witness-section\s*\{[^}]*page-break-inside:\s*avoid/);
    }, 30000);

    it('should not have footer overlap with main content', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Footer should have proper styling
      expect(generated.html).toMatch(/\.footer-info\s*\{[^}]*margin-top:\s*\d+pt/);
    }, 30000);
  });

  describe('C) Legal Wording Compliance', () => {
    it('should NOT contain "license to occupy" or "NOT an exclusive tenancy" in AST documents', async () => {
      const wizardFacts = createTestWizardFacts({ is_hmo: true });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // These phrases contradict AST status
      expect(generated.html.toLowerCase()).not.toContain('license to occupy');
      expect(generated.html.toLowerCase()).not.toContain('not an exclusive tenancy');
      expect(generated.html.toLowerCase()).not.toContain('this is not an exclusive');
    }, 30000);

    it('should NOT contain mandatory "professional cleaning MUST" or "Receipts must be provided" language', async () => {
      const wizardFacts = createTestWizardFacts({
        professional_cleaning_required: true,
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Tenant Fees Act prohibits requiring professional cleaning
      expect(generated.html).not.toMatch(/tenant\s+must\s+arrange\s+professional\s+cleaning/i);
      expect(generated.html).not.toMatch(/receipts\s+must\s+be\s+provided/i);
    }, 30000);

    it('should NOT contain unconditional "CRIMINAL OFFENSE" subletting headlines', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should not have aggressive unconditional criminal language
      expect(generated.html).not.toMatch(/STRICTLY PROHIBITED\s*-\s*Criminal Offense/i);
    }, 30000);

    it('should contain appropriate Tenant Fees Act compliant cleaning language', async () => {
      const wizardFacts = createTestWizardFacts();
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should contain compliant language about returning to same standard
      expect(generated.html).toMatch(/same\s+standard\s+of\s+cleanliness/i);
      expect(generated.html).toMatch(/fair\s+wear\s+and\s+tear\s+excepted/i);
    }, 30000);

    it('should use AST-safe HMO room occupancy language', async () => {
      const wizardFacts = createTestWizardFacts({ is_hmo: true });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should reference exclusive occupation and AST status
      expect(generated.html).toMatch(/exclusive\s+occupation/i);
      expect(generated.html).toMatch(/Assured\s+Shorthold\s+Tenancy/i);
    }, 30000);
  });

  describe('D) Blank Placeholder Handling', () => {
    it('should show "TO BE COMPLETED BEFORE SIGNING" when HMO licence number is missing', async () => {
      const wizardFacts = createTestWizardFacts({
        is_hmo: true,
        hmo_licence_number: undefined,
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should show placeholder for missing HMO licence number
      expect(generated.html).toContain('TO BE COMPLETED BEFORE SIGNING');
    }, 30000);

    it('should show "TO BE COMPLETED BEFORE SIGNING" when How to Rent date is missing', async () => {
      const wizardFacts = createTestWizardFacts({
        how_to_rent_provision_date: undefined,
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should show placeholder for missing How to Rent date
      expect(generated.html).toContain('TO BE COMPLETED BEFORE SIGNING');
    }, 30000);

    it('should populate HMO licence number when provided', async () => {
      const wizardFacts = createTestWizardFacts({
        is_hmo: true,
        hmo_licence_number: 'HMO/12345/2026',
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should show the actual licence number
      expect(generated.html).toContain('HMO/12345/2026');
    }, 30000);

    it('should NOT have empty date parentheses like "dated )" or "on .)"', async () => {
      const wizardFacts = createTestWizardFacts({
        agreement_date: undefined,
        tenancy_start_date: '2026-02-01',
      });
      const astData = mapWizardToASTData(wizardFacts);
      const generated = await generatePremiumAST(astData, true);

      // Should not have malformed date references
      expect(generated.html).not.toMatch(/dated\s*\)/);
      expect(generated.html).not.toMatch(/on\s*\.\)/);
      expect(generated.html).not.toMatch(/provided\s+on\s*\./);
    }, 30000);
  });

  describe('UK Date Formatter Utility', () => {
    it('should correctly format YYYY-MM-DD to UK long format', () => {
      expect(formatUKDateLong('2026-02-01')).toBe('1 February 2026');
      expect(formatUKDateLong('2026-12-25')).toBe('25 December 2026');
      expect(formatUKDateLong('2026-01-01')).toBe('1 January 2026');
    });

    it('should handle Date objects correctly', () => {
      const date = new Date(2026, 1, 15); // Feb 15, 2026
      expect(formatUKDateLong(date)).toBe('15 February 2026');
    });

    it('should return empty string for null/undefined/empty values', () => {
      expect(formatUKDateLong(null)).toBe('');
      expect(formatUKDateLong(undefined)).toBe('');
      expect(formatUKDateLong('')).toBe('');
    });

    it('should detect ISO date format correctly', () => {
      expect(isISODateFormat('2026-02-01')).toBe(true);
      expect(isISODateFormat('2026-12-31')).toBe(true);
      expect(isISODateFormat('1 February 2026')).toBe(false);
      expect(isISODateFormat('01/02/2026')).toBe(false);
    });

    it('should find ISO dates in text', () => {
      const text = 'Agreement dated 2026-02-01 with end date 2027-02-01';
      const found = findISODates(text);
      expect(found).toEqual(['2026-02-01', '2027-02-01']);
    });
  });
});
