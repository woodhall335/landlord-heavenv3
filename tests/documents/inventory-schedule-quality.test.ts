/**
 * Inventory Schedule Quality Tests
 *
 * Cross-jurisdiction tests to ensure:
 * - Inventory schedule does NOT contain "Qty" or "Quantity" column headers
 * - Inventory schedule includes Bedroom 3
 * - Keys section is note-first (no separate Quantity column)
 * - Standard vs Premium tier differentiation is maintained
 *
 * These tests verify the £14.99 Standard and £24.99 Premium value propositions.
 */

import { describe, expect, it, vi, beforeAll } from 'vitest';
import { generateDocument } from '@/lib/documents/generator';
import {
  generateStandardASTDocuments,
  generatePremiumASTDocuments,
  getJurisdictionConfig,
  type TenancyJurisdiction,
} from '@/lib/documents/ast-generator';
import { mapWizardToASTData } from '@/lib/documents/ast-wizard-mapper';

// Mock PDF generation to speed up tests (we only need HTML validation)
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

const ALL_JURISDICTIONS: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

const baseTestData = {
  property_address: '123 Test Street, London, E1 1AA',
  landlord_name: 'Test Landlord',
  tenant_names: 'Test Tenant',
  tenancy_start_date: '2025-01-01',
  current_date: '2025-01-01',
};

describe('Inventory Schedule - Quality Assurance', () => {
  describe('No Qty/Quantity columns in inventory schedule', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: standalone inventory should NOT contain "Qty" as a table header',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Check for <th> elements containing "Qty" (table headers)
        // This pattern catches "Qty", ">Qty<", "Qty<", etc.
        const qtyHeaderPattern = /<th[^>]*>[\s]*Qty[\s]*<\/th>/i;
        expect(result.html).not.toMatch(qtyHeaderPattern);

        // Also check for standalone Qty text in header cells
        expect(result.html).not.toMatch(/<th[^>]*class="qty-cell"[^>]*>/i);
      }
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: standalone inventory should NOT contain "Quantity" as a table header',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Check for <th> elements containing "Quantity" (table headers)
        const quantityHeaderPattern = /<th[^>]*>[\s]*Quantity[\s]*<\/th>/i;
        expect(result.html).not.toMatch(quantityHeaderPattern);
      }
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: Keys section should NOT have a separate "Quantity" column header',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Keys table should have Item | Notes structure, not Item | Quantity | Notes
        // Check that "Quantity" doesn't appear as a column header
        const keysSection = result.html.match(/Keys and Access Devices[\s\S]*?<\/table>/i);
        if (keysSection) {
          expect(keysSection[0]).not.toMatch(/<th[^>]*>[\s]*Quantity[\s]*<\/th>/i);
        }
      }
    );
  });

  describe('Bedroom 3 is present in inventory', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: standalone inventory should include Bedroom 3 section',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Check for Bedroom 3 title
        expect(result.html).toMatch(/Bedroom 3/i);
      }
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: inventory should have minimum 3 bedrooms (Bedroom 1, 2, and 3)',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        expect(result.html).toMatch(/Bedroom 1/i);
        expect(result.html).toMatch(/Bedroom 2/i);
        expect(result.html).toMatch(/Bedroom 3/i);
      }
    );
  });

  describe('Room inventory table structure', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: room tables should have Item | Condition | Notes structure',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Check for proper column structure: Item, Condition, Notes/Description
        expect(result.html).toMatch(/<th[^>]*>[\s]*Item[\s]*<\/th>/i);
        expect(result.html).toMatch(/<th[^>]*class="condition-cell"[^>]*>[\s]*Condition[\s]*<\/th>/i);
        expect(result.html).toMatch(/<th[^>]*class="notes-cell"[^>]*>[\s]*Notes/i);
      }
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: schedule-of-condition items (Walls, Ceiling, Flooring) are included',
      async (jurisdiction) => {
        const config = getJurisdictionConfig(jurisdiction);

        const result = await generateDocument({
          templatePath: config.templatePaths.inventoryStandalone,
          data: {
            ...baseTestData,
            jurisdiction,
          },
          isPreview: false,
          outputFormat: 'html',
        });

        // Check for schedule-of-condition items
        expect(result.html).toMatch(/Walls/i);
        expect(result.html).toMatch(/Ceiling/i);
        expect(result.html).toMatch(/Flooring/i);
      }
    );
  });
});

describe('Standard vs Premium Tier Differentiation', () => {
  const baseWizardFacts = {
    product_tier: 'Standard AST',
    landlord_full_name: 'Test Landlord',
    landlord_address: '1 High Street, London, E1 1AA',
    landlord_email: 'landlord@example.com',
    landlord_phone: '07000000001',
    property_address: '2 High Street, London, E1 2BB',
    property_type: 'flat',
    number_of_bedrooms: '3',
    furnished_status: 'unfurnished',
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
    tenants: {
      0: {
        full_name: 'Test Tenant',
        dob: '1990-01-01',
        email: 'tenant@example.com',
        phone: '07000000002',
      },
    },
  } as any;

  const premiumWizardFacts = {
    ...baseWizardFacts,
    product_tier: 'Premium AST',
    is_hmo: true,
    number_of_sharers: 4,
    communal_areas: 'Kitchen, lounge',
    hmo_licence_status: 'Currently licensed',
    guarantor_required: true,
    guarantor_name: 'Test Guarantor',
    guarantor_address: '3 High Street, London, E1 3CC',
    guarantor_email: 'guarantor@example.com',
    guarantor_phone: '07000000003',
  };

  describe('Pack document counts', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: Standard pack should include exactly 3 documents',
      async (jurisdiction) => {
        const astData = {
          ...mapWizardToASTData(baseWizardFacts),
          jurisdiction,
        } as any;

        const pack = await generateStandardASTDocuments(astData, 'test-case-id');

        expect(pack.tier).toBe('standard');
        expect(pack.documents).toHaveLength(3);

        // Verify document types
        const categories = pack.documents.map((d) => d.category);
        expect(categories).toContain('agreement');
        expect(categories).toContain('schedule');
        expect(categories).toContain('checklist');
      },
      20000
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: Premium pack should include exactly 3 documents',
      async (jurisdiction) => {
        const astData = {
          ...mapWizardToASTData(premiumWizardFacts),
          jurisdiction,
        } as any;

        const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

        expect(pack.tier).toBe('premium');
        expect(pack.documents).toHaveLength(3);

        // Verify document types
        const categories = pack.documents.map((d) => d.category);
        expect(categories).toContain('agreement');
        expect(categories).toContain('schedule');
        expect(categories).toContain('checklist');
      },
      20000
    );
  });

  describe('Tier markers in generated documents', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: Standard tier should NOT have is_hmo flag set',
      async (jurisdiction) => {
        const astData = {
          ...mapWizardToASTData(baseWizardFacts),
          jurisdiction,
        } as any;

        const pack = await generateStandardASTDocuments(astData, 'test-case-id');

        // Standard tier agreement should not have HMO markers
        const agreement = pack.documents.find((d) => d.category === 'agreement');
        expect(agreement).toBeDefined();
        expect(agreement?.document_type).not.toContain('hmo');
      },
      20000
    );

    it.each(ALL_JURISDICTIONS)(
      '%s: Premium tier should have HMO markers in agreement',
      async (jurisdiction) => {
        const astData = {
          ...mapWizardToASTData(premiumWizardFacts),
          jurisdiction,
        } as any;

        const pack = await generatePremiumASTDocuments(astData, 'test-case-id');

        // Premium tier agreement should have HMO markers
        const agreement = pack.documents.find((d) => d.category === 'agreement');
        expect(agreement).toBeDefined();
        expect(agreement?.document_type).toContain('hmo');
        expect(agreement?.title).toContain('HMO');
      },
      20000
    );
  });

  describe('Inventory schedule in both tiers', () => {
    it.each(ALL_JURISDICTIONS)(
      '%s: Both Standard and Premium include inventory_schedule',
      async (jurisdiction) => {
        const standardData = {
          ...mapWizardToASTData(baseWizardFacts),
          jurisdiction,
        } as any;

        const premiumData = {
          ...mapWizardToASTData(premiumWizardFacts),
          jurisdiction,
        } as any;

        const standardPack = await generateStandardASTDocuments(standardData, 'test-case-id');
        const premiumPack = await generatePremiumASTDocuments(premiumData, 'test-case-id');

        const standardInventory = standardPack.documents.find(
          (d) => d.document_type === 'inventory_schedule'
        );
        const premiumInventory = premiumPack.documents.find(
          (d) => d.document_type === 'inventory_schedule'
        );

        expect(standardInventory).toBeDefined();
        expect(premiumInventory).toBeDefined();

        expect(standardInventory?.title).toBe('Inventory & Schedule of Condition');
        expect(premiumInventory?.title).toBe('Inventory & Schedule of Condition');
      },
      20000
    );
  });

  describe('Cross-jurisdiction pricing consistency', () => {
    it('All jurisdictions should have consistent pack structure', async () => {
      const results: Record<string, { standard: number; premium: number }> = {};

      for (const jurisdiction of ALL_JURISDICTIONS) {
        const standardData = {
          ...mapWizardToASTData(baseWizardFacts),
          jurisdiction,
        } as any;

        const premiumData = {
          ...mapWizardToASTData(premiumWizardFacts),
          jurisdiction,
        } as any;

        const standardPack = await generateStandardASTDocuments(standardData, 'test-case-id');
        const premiumPack = await generatePremiumASTDocuments(premiumData, 'test-case-id');

        results[jurisdiction] = {
          standard: standardPack.documents.length,
          premium: premiumPack.documents.length,
        };
      }

      // All jurisdictions should have the same document counts for consistent value
      const firstJurisdiction = ALL_JURISDICTIONS[0];
      const expectedStandard = results[firstJurisdiction].standard;
      const expectedPremium = results[firstJurisdiction].premium;

      for (const jurisdiction of ALL_JURISDICTIONS) {
        expect(results[jurisdiction].standard).toBe(expectedStandard);
        expect(results[jurisdiction].premium).toBe(expectedPremium);
      }

      // Standard should have 3 documents (£14.99 value)
      expect(expectedStandard).toBe(3);
      // Premium should have 3 documents (£24.99 value - HMO-specific agreement)
      expect(expectedPremium).toBe(3);
    }, 60000);
  });
});

describe('Regression Prevention - Previous Bugs', () => {
  describe('Qty column regression', () => {
    it('Living Room table should NOT have qty-cell class', async () => {
      const config = getJurisdictionConfig('england');

      const result = await generateDocument({
        templatePath: config.templatePaths.inventoryStandalone,
        data: baseTestData,
        isPreview: false,
        outputFormat: 'html',
      });

      // Find Living Room section and verify no qty-cell
      const livingRoomMatch = result.html.match(
        /Living Room[\s\S]*?<\/table>/i
      );
      if (livingRoomMatch) {
        expect(livingRoomMatch[0]).not.toContain('qty-cell');
        expect(livingRoomMatch[0]).not.toMatch(/<th[^>]*>[\s]*Qty[\s]*<\/th>/i);
      }
    });

    it('Bedroom tables should NOT have qty-cell class', async () => {
      const config = getJurisdictionConfig('england');

      const result = await generateDocument({
        templatePath: config.templatePaths.inventoryStandalone,
        data: baseTestData,
        isPreview: false,
        outputFormat: 'html',
      });

      // Check all bedroom sections
      for (let i = 1; i <= 3; i++) {
        const bedroomPattern = new RegExp(`Bedroom ${i}[\\s\\S]*?<\\/table>`, 'i');
        const bedroomMatch = result.html.match(bedroomPattern);
        if (bedroomMatch) {
          expect(bedroomMatch[0]).not.toContain('qty-cell');
        }
      }
    });
  });

  describe('Bedroom 3 regression', () => {
    it('Bedroom 3 must appear BEFORE "Additional Rooms" section', async () => {
      const config = getJurisdictionConfig('england');

      const result = await generateDocument({
        templatePath: config.templatePaths.inventoryStandalone,
        data: baseTestData,
        isPreview: false,
        outputFormat: 'html',
      });

      const bedroom3Index = result.html.indexOf('Bedroom 3');
      const additionalRoomsIndex = result.html.indexOf('Additional Rooms');

      expect(bedroom3Index).toBeGreaterThan(-1);
      expect(additionalRoomsIndex).toBeGreaterThan(-1);
      expect(bedroom3Index).toBeLessThan(additionalRoomsIndex);
    });
  });

  describe('Keys section regression', () => {
    it('Keys table should have 2 columns (Item | Notes), not 3', async () => {
      const config = getJurisdictionConfig('england');

      const result = await generateDocument({
        templatePath: config.templatePaths.inventoryStandalone,
        data: baseTestData,
        isPreview: false,
        outputFormat: 'html',
      });

      // Find Keys section and count <th> elements
      const keysSection = result.html.match(
        /Keys and Access Devices[\s\S]*?<\/table>/i
      );
      expect(keysSection).toBeTruthy();

      if (keysSection) {
        const headerMatches = keysSection[0].match(/<th[^>]*>/g);
        // Should have exactly 2 headers: Item and Notes
        expect(headerMatches?.length).toBe(2);
      }
    });
  });
});
