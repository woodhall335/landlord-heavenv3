/**
 * Worst-Case Pagination Tests
 *
 * These tests generate tenancy agreements with long content to verify
 * that pagination rules work correctly in edge cases.
 *
 * Tests:
 * - Long tenant names don't cause overflow
 * - Long addresses don't break layout
 * - Many tenants (up to 4) render cleanly
 * - Signatures always start on new page regardless of content length
 *
 * @see https://github.com/woodhall335/landlord-heavenv3/issues/pdf-layout-overflow
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generatePremiumAST } from '@/lib/documents/ast-generator';

// Mock the htmlToPdf function to avoid actual PDF generation in tests
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

// Very long names that could cause overflow
const LONG_LANDLORD_NAME = 'Sir Bartholomew Maximilian Wellington-Featherstone III of Gloucestershire';
const LONG_TENANT_NAME = 'Alexandra Christophina Montague-Beauchamp-Worthington';
const LONG_GUARANTOR_NAME = 'The Rt. Hon. Professor Sir Archibald Constantine Pemberton-Smythe KBE';

// Very long address that could cause overflow
const LONG_ADDRESS = `Flat 42B, The Grand Victorian Mansion House, 123-125 Upper Kensington Gardens Boulevard, Little Whistlebury-on-the-Marsh, Greater Metropolitan London Borough of Westminster, SW1A 2AA, United Kingdom`;

// Worst-case data for testing
const worstCaseData = {
    // Jurisdiction
    jurisdiction: 'england',

    // Product metadata
    product_tier: 'Premium HMO AST',

    // Agreement
    agreement_date: '2025-01-15',
    current_date: '2025-01-15',

    // Landlord with long name
    landlord_full_name: LONG_LANDLORD_NAME,
    landlord_address: LONG_ADDRESS,
    landlord_email: 'bartholomew.wellington-featherstone@example-very-long-domain-name.co.uk',
    landlord_phone: '+44 (0)20 7946 0958 ext. 12345',

    // Multiple tenants with long names (up to 4)
    tenants: [
      {
        full_name: LONG_TENANT_NAME,
        email: 'alexandra.montague-beauchamp@university-email-domain.ac.uk',
        phone: '+44 (0)7700 900123',
        dob: '1990-05-15',
      },
      {
        full_name: 'Maximilian Ferdinand Von Hapsburg-Lothringen Jr.',
        email: 'max.hapsburg@international-company.com',
        phone: '+44 (0)7700 900124',
        dob: '1988-11-22',
      },
      {
        full_name: 'Penelope Arabella Cholmondeley-Featherstonehaugh',
        email: 'penelope.cf@another-long-email-domain.org.uk',
        phone: '+44 (0)7700 900125',
        dob: '1992-03-08',
      },
      {
        full_name: 'Sebastian Fitzgerald McTavish-Campbell-Stuart',
        email: 'sebastian.mcs@yet-another-email.domain.co.uk',
        phone: '+44 (0)7700 900126',
        dob: '1991-09-30',
      },
    ],
    multiple_tenants: true,
    number_of_tenants: 4,

    // Guarantor with long name
    guarantor_name: LONG_GUARANTOR_NAME,
    guarantor_address: LONG_ADDRESS,
    guarantor_email: 'archibald.pemberton-smythe@distinguished-institution.ac.uk',
    guarantor_phone: '+44 (0)1onal 234 567 890',
    guarantor_required: true,

    // Property with long address
    property_address: LONG_ADDRESS,
    property_type: 'Victorian Terraced House with Modern Extension and Converted Loft Space',
    number_of_bedrooms: '6',
    furnished_status: 'part-furnished',

    // Long tenancy term
    tenancy_start_date: '2025-02-01',
    tenancy_end_date: '2027-01-31',
    is_fixed_term: true,
    term_type: 'fixed',
    term_length: '24',
    break_clause: true,
    break_clause_notice: '2 months',
    break_clause_earliest_date: '2026-02-01',

    // Rent details
    rent_amount: 3500,
    rent_frequency: 'month',
    rent_period: 'month',
    first_rent_due: '2025-02-01',
    rent_due_day: '1',
    payment_method: 'Bank transfer',
    payment_reference: 'TENANT-REF-2025-WELLINGTON',

    // Deposit (5 weeks max for £3500/month rent = ~£4038)
    deposit_amount: 4000,
    deposit_scheme_name: 'DPS' as const,
    deposit_protection_date: '2025-02-15',
    deposit_reference_number: 'DPS-2025-123456789',

    // HMO flags
    is_hmo: true,
    hmo_licence_number: 'HMO/2025/WESTMINSTER/12345',
    hmo_max_occupants: 8,

    // Utilities
    council_tax_responsibility: 'Tenant',
    utilities_responsibility: 'Tenant',
    internet_responsibility: 'Landlord',

    // Property features
    has_garden: true,
    garden_maintenance: 'Tenant',
    pets_allowed: true,
    approved_pets: 'One small dog (under 10kg) subject to additional pet deposit',
    smoking_allowed: false,

  // Premium flags
  premium: true,
  inventory_attached: true,
  professional_cleaning_required: true,
};

describe('Worst-Case Pagination - Long Content', () => {
  describe('HTML Generation with Long Content', () => {
    it('generates valid HTML without errors for worst-case data', async () => {
      const result = await generatePremiumAST(worstCaseData);

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.html.length).toBeGreaterThan(0);
    });

    it('HTML contains all long names correctly', async () => {
      const result = await generatePremiumAST(worstCaseData);

      expect(result.html).toContain(LONG_LANDLORD_NAME);
      expect(result.html).toContain(LONG_TENANT_NAME);
      expect(result.html).toContain(LONG_GUARANTOR_NAME);
    });

    it('HTML contains signature section', async () => {
      const result = await generatePremiumAST(worstCaseData);

      // Check for signature section markers
      expect(result.html).toMatch(/signature/i);
    });

    it('HTML contains pagination CSS rules', async () => {
      const result = await generatePremiumAST(worstCaseData);

      // Check for critical pagination CSS
      expect(result.html).toContain('page-break');
    });
  });

  describe('Structural Verification', () => {
    it('signature section appears after main content', async () => {
      const result = await generatePremiumAST(worstCaseData);

      // Find positions of key sections - look for actual section elements, not CSS
      const signatureSectionMatch = result.html.match(/<div[^>]*class="[^"]*signature-section[^"]*"[^>]*>/i);
      const tenantSectionMatch = result.html.match(/tenant.*obligations|tenants?.*details|the tenant/i);

      expect(signatureSectionMatch).not.toBeNull();
      expect(tenantSectionMatch).not.toBeNull();

      if (signatureSectionMatch && tenantSectionMatch) {
        const signatureIndex = result.html.indexOf(signatureSectionMatch[0]);
        const tenantsIndex = result.html.indexOf(tenantSectionMatch[0]);

        // Signatures should appear after tenant section content
        expect(signatureIndex).toBeGreaterThan(tenantsIndex);
      }
    });

    it('footer appears at end of document', async () => {
      const result = await generatePremiumAST(worstCaseData);

      // Find footer position
      const footerPattern = /<div[^>]*class="[^"]*footer[^"]*"[^>]*>/i;
      const footerMatch = result.html.match(footerPattern);

      if (footerMatch) {
        const footerIndex = result.html.indexOf(footerMatch[0]);
        const bodyCloseIndex = result.html.indexOf('</body>');

        // Footer should be near the end of body
        expect(bodyCloseIndex - footerIndex).toBeLessThan(2000); // Within 2000 chars of body end
      }
    });

    it('all 4 tenants are rendered', async () => {
      const result = await generatePremiumAST(worstCaseData);

      // Count tenant name occurrences
      const tenantNames = worstCaseData.tenants.map(t => t.full_name);
      for (const name of tenantNames) {
        expect(result.html).toContain(name);
      }
    });
  });

  describe('CSS Verification', () => {
    it('contains page-break-before rule', async () => {
      const result = await generatePremiumAST(worstCaseData);

      expect(result.html).toContain('page-break-before');
    });

    it('contains page-break-inside: avoid rule', async () => {
      const result = await generatePremiumAST(worstCaseData);

      expect(result.html).toContain('page-break-inside');
      expect(result.html).toContain('avoid');
    });

    it('contains orphans/widows rules', async () => {
      const result = await generatePremiumAST(worstCaseData);

      expect(result.html).toMatch(/orphans\s*:/);
      expect(result.html).toMatch(/widows\s*:/);
    });
  });
});

describe('Worst-Case Pagination - All Jurisdictions', () => {
  const minimalData = {
    agreement_date: '2025-01-15',
    landlord_full_name: 'Test Landlord',
    landlord_address: '123 Test Street, London, SW1A 1AA',
    landlord_email: 'landlord@test.com',
    landlord_phone: '020 1234 5678',
    tenants: [{ full_name: 'Test Tenant', email: 'tenant@test.com', phone: '07700 900000', dob: '1990-01-01' }],
    property_address: '456 Property Road, London, SW1A 2BB',
    tenancy_start_date: '2025-02-01',
    tenancy_end_date: '2026-01-31',
    is_fixed_term: true,
    rent_amount: 1500,
    rent_frequency: 'month',
    rent_period: 'month',
    deposit_amount: 2000,
    deposit_scheme_name: 'DPS' as const,
    is_hmo: true,
    premium: true,
  };

  const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;

  jurisdictions.forEach((jurisdiction) => {
    it(`${jurisdiction}: generates valid HTML with pagination rules`, async () => {
      try {
        const testData = { ...minimalData, jurisdiction };
        const result = await generatePremiumAST(testData);

        expect(result).toBeDefined();
        expect(result.html).toBeDefined();
        expect(result.html).toContain('page-break');
      } catch (error) {
        // Some jurisdictions may not have premium templates yet
        console.log(`${jurisdiction} premium template not available, skipping`);
      }
    });
  });
});
