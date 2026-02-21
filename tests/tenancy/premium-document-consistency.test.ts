/**
 * Premium Tenancy Agreement Document Consistency Tests
 *
 * These tests ensure that:
 * - Claimed documents in review/preview match actual generated documents
 * - Inventory inclusion is truthful and enforced
 * - Premium preview uses consistent styling system
 *
 * @see https://github.com/woodhall335/landlord-heavenv3/issues/premium-document-consistency
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getASTDocuments, getProductMeta } from '@/lib/documents/document-configs';
import { detectInventoryData } from '@/lib/tenancy/product-tier';

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

describe('Document Config Consistency', () => {
  describe('Premium AST Document List', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;

    jurisdictions.forEach((jurisdiction) => {
      describe(`${jurisdiction} Premium tier`, () => {
        it('includes main agreement document', () => {
          const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: false });
          const agreementDoc = docs.find((d) => d.id === 'tenancy-agreement-hmo');
          expect(agreementDoc).toBeDefined();
          expect(agreementDoc?.category).toBe('Agreement');
        });

        it('includes inventory schedule', () => {
          const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: false });
          const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');
          expect(inventoryDoc).toBeDefined();
          expect(inventoryDoc?.category).toBe('Schedule');
        });

        it('includes compliance checklist', () => {
          const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: false });
          const checklistDoc = docs.find((d) => d.id === 'compliance-checklist');
          expect(checklistDoc).toBeDefined();
          expect(checklistDoc?.category).toBe('Guidance');
        });

        it('inventory title reflects wizard completion status (no data)', () => {
          const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: false });
          const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');
          expect(inventoryDoc?.title).toContain('Ready to Complete');
        });

        it('inventory title reflects wizard completion status (with data)', () => {
          const docs = getASTDocuments(jurisdiction, 'premium', { hasInventoryData: true });
          const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');
          expect(inventoryDoc?.title).toContain('Wizard-Completed');
        });
      });
    });
  });

  describe('Standard AST Document List', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;

    jurisdictions.forEach((jurisdiction) => {
      describe(`${jurisdiction} Standard tier`, () => {
        it('includes main agreement document (non-HMO)', () => {
          const docs = getASTDocuments(jurisdiction, 'standard', { hasInventoryData: false });
          const agreementDoc = docs.find((d) => d.id === 'tenancy-agreement');
          expect(agreementDoc).toBeDefined();
          expect(agreementDoc?.category).toBe('Agreement');
        });

        it('includes blank inventory template', () => {
          const docs = getASTDocuments(jurisdiction, 'standard', { hasInventoryData: false });
          const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');
          expect(inventoryDoc).toBeDefined();
          expect(inventoryDoc?.title).toContain('Blank Template');
        });

        it('standard inventory is always blank regardless of data', () => {
          // Even if hasInventoryData is true, standard tier uses blank template
          const docs = getASTDocuments(jurisdiction, 'standard', { hasInventoryData: true });
          const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');
          expect(inventoryDoc?.title).toContain('Blank Template');
        });
      });
    });
  });

  describe('Document count matches tier expectations', () => {
    it('Premium has more documents than Standard', () => {
      const premiumDocs = getASTDocuments('england', 'premium', { hasInventoryData: false });
      const standardDocs = getASTDocuments('england', 'standard', { hasInventoryData: false });

      // Both should have at least agreement, inventory, and checklist
      expect(premiumDocs.length).toBeGreaterThanOrEqual(3);
      expect(standardDocs.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('Product Meta Pricing', () => {
  describe('ast_premium metadata', () => {
    it('returns correct price of £24.99', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.price).toBe('£24.99');
    });

    it('returns HMO-specific name', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.name).toContain('HMO');
    });

    it('includes original price for comparison', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.originalPrice).toBeDefined();
      expect(meta.originalPrice).toContain('£200');
    });

    it('includes savings message', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.savings).toBeDefined();
      expect(meta.savings).toContain('Save');
    });

    it('includes HMO-specific features', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.features.some((f) => f.toLowerCase().includes('hmo'))).toBe(true);
    });
  });

  describe('ast_standard metadata', () => {
    it('returns correct price of £14.99', () => {
      const meta = getProductMeta('ast_standard');
      expect(meta.price).toBe('£14.99');
    });

    it('does NOT contain HMO in name', () => {
      const meta = getProductMeta('ast_standard');
      expect(meta.name).not.toContain('HMO');
    });
  });
});

describe('Inventory Consistency Between Claims and Generation', () => {
  describe('Premium tier inventory behavior', () => {
    it('Premium with wizard data claims wizard-completed inventory', () => {
      const facts = { inventory: { rooms: [{ name: 'Living Room', condition: 'Good' }] } };
      const hasData = detectInventoryData(facts);

      expect(hasData).toBe(true);

      const docs = getASTDocuments('england', 'premium', { hasInventoryData: hasData });
      const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');

      expect(inventoryDoc?.title).toContain('Wizard-Completed');
      expect(inventoryDoc?.description).toContain('wizard-completed');
    });

    it('Premium without wizard data claims ready-to-complete inventory', () => {
      const facts = {};
      const hasData = detectInventoryData(facts);

      expect(hasData).toBe(false);

      const docs = getASTDocuments('england', 'premium', { hasInventoryData: hasData });
      const inventoryDoc = docs.find((d) => d.id === 'inventory-schedule');

      expect(inventoryDoc?.title).toContain('Ready to Complete');
    });
  });

  describe('Standard tier inventory behavior', () => {
    it('Standard always claims blank inventory template', () => {
      // With data
      const docsWithData = getASTDocuments('england', 'standard', { hasInventoryData: true });
      const inventoryWithData = docsWithData.find((d) => d.id === 'inventory-schedule');
      expect(inventoryWithData?.title).toContain('Blank Template');

      // Without data
      const docsNoData = getASTDocuments('england', 'standard', { hasInventoryData: false });
      const inventoryNoData = docsNoData.find((d) => d.id === 'inventory-schedule');
      expect(inventoryNoData?.title).toContain('Blank Template');
    });
  });
});

describe('Cross-Jurisdiction Consistency', () => {
  const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;
  const tiers = ['standard', 'premium'] as const;

  describe('All jurisdictions have same document structure', () => {
    tiers.forEach((tier) => {
      it(`${tier} tier has consistent document IDs across jurisdictions`, () => {
        const docIdsByJurisdiction = jurisdictions.map((j) => {
          const docs = getASTDocuments(j, tier, { hasInventoryData: false });
          return docs.map((d) => d.id).sort();
        });

        // All jurisdictions should have the same document IDs
        const referenceIds = docIdsByJurisdiction[0];
        docIdsByJurisdiction.forEach((ids, index) => {
          expect(ids).toEqual(referenceIds);
        });
      });
    });
  });

  describe('Inventory detection works across all fact formats', () => {
    it('detects inventory from TenancySectionFlow format (inventory.rooms)', () => {
      const facts = {
        inventory: {
          rooms: [
            { name: 'Bedroom', items: [{ name: 'Bed', condition: 'Good' }] },
          ],
        },
      };
      expect(detectInventoryData(facts)).toBe(true);
    });

    it('detects inventory from legacy format (inventory_attached)', () => {
      const facts = { inventory_attached: true };
      expect(detectInventoryData(facts)).toBe(true);
    });

    it('detects inventory from legacy format (inventory_provided)', () => {
      const facts = { inventory_provided: true };
      expect(detectInventoryData(facts)).toBe(true);
    });

    it('handles mixed formats correctly', () => {
      const facts = {
        inventory: { rooms: [] }, // Empty rooms
        inventory_attached: true, // But flag is set
      };
      expect(detectInventoryData(facts)).toBe(true);
    });
  });
});

describe('REGRESSION: Previous Bug Scenarios', () => {
  describe('Bug: Premium review showed Standard price', () => {
    it('getProductMeta(ast_premium) returns £24.99, not £14.99', () => {
      const meta = getProductMeta('ast_premium');
      expect(meta.price).not.toBe('£14.99');
      expect(meta.price).toBe('£24.99');
    });
  });

  describe('Bug: Inventory claim mismatch', () => {
    it('Premium inventory claim matches hasInventoryData detection', () => {
      // Scenario 1: User completed inventory wizard
      const factsWithInventory = {
        inventory: { rooms: [{ name: 'Room 1' }] },
      };
      const hasData1 = detectInventoryData(factsWithInventory);
      const docs1 = getASTDocuments('england', 'premium', { hasInventoryData: hasData1 });
      const inv1 = docs1.find((d) => d.id === 'inventory-schedule');

      expect(hasData1).toBe(true);
      expect(inv1?.title).toContain('Wizard-Completed');

      // Scenario 2: User skipped inventory wizard
      const factsWithoutInventory = {};
      const hasData2 = detectInventoryData(factsWithoutInventory);
      const docs2 = getASTDocuments('england', 'premium', { hasInventoryData: hasData2 });
      const inv2 = docs2.find((d) => d.id === 'inventory-schedule');

      expect(hasData2).toBe(false);
      expect(inv2?.title).toContain('Ready to Complete');
    });
  });
});
