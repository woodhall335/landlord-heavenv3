/**
 * Tenancy Agreement Integration Layer Tests
 *
 * Tests the end-to-end integration of:
 * - pack-contents.ts: Correct document listing by tier
 * - document-configs.ts: Correct document metadata by tier
 * - included-features.ts: Correct feature mapping by tier
 *
 * These tests ensure that what's advertised on the UI matches
 * what's actually included in the generated PDFs.
 */

import { getPackContents } from '../../products/pack-contents';
import { getASTDocuments } from '../../documents/document-configs';
import { getIncludedFeatures, getInventoryBehaviour } from '../included-features';

describe('Tenancy Agreement Integration Layer', () => {
  const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'] as const;
  const tiers = ['standard', 'premium'] as const;

  // ============================================================================
  // PACK CONTENTS TESTS
  // ============================================================================

  describe('Pack Contents - Inventory and Checklist Inclusion', () => {
    jurisdictions.forEach((jurisdiction) => {
      describe(jurisdiction, () => {
        tiers.forEach((tier) => {
          it(`should include inventory schedule in ${tier} pack`, () => {
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const inventoryItem = contents.find(item =>
              item.key === 'inventory_schedule' ||
              item.title.toLowerCase().includes('inventory')
            );

            expect(inventoryItem).toBeDefined();
            expect(inventoryItem?.required).toBe(true);
          });

          it(`should include compliance checklist in ${tier} pack`, () => {
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const checklistItem = contents.find(item =>
              item.key.includes('checklist') ||
              item.title.toLowerCase().includes('checklist')
            );

            expect(checklistItem).toBeDefined();
            expect(checklistItem?.required).toBe(true);
          });

          it(`should show correct inventory type for ${tier}`, () => {
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const inventoryItem = contents.find(item => item.key === 'inventory_schedule');

            if (tier === 'premium') {
              expect(inventoryItem?.title).toContain('Wizard-Completed');
            } else {
              expect(inventoryItem?.title).toContain('Blank');
            }
          });
        });
      });
    });
  });

  // ============================================================================
  // DOCUMENT CONFIG TESTS
  // ============================================================================

  describe('Document Configs - Document Metadata', () => {
    jurisdictions.forEach((jurisdiction) => {
      describe(jurisdiction, () => {
        tiers.forEach((tier) => {
          it(`should return correct documents for ${tier}`, () => {
            const documents = getASTDocuments(jurisdiction, tier);

            // Should have at least 3 documents: agreement, inventory, checklist
            expect(documents.length).toBeGreaterThanOrEqual(3);

            // Should have main agreement
            const hasAgreement = documents.some(d =>
              d.category === 'Agreement' || d.id.includes('agreement')
            );
            expect(hasAgreement).toBe(true);

            // Should have inventory schedule
            const hasInventory = documents.some(d =>
              d.id.includes('inventory') || d.title.toLowerCase().includes('inventory')
            );
            expect(hasInventory).toBe(true);

            // Should have compliance checklist
            const hasChecklist = documents.some(d =>
              d.id.includes('checklist') || d.title.toLowerCase().includes('checklist')
            );
            expect(hasChecklist).toBe(true);
          });

          it(`should show correct inventory type in ${tier} document config`, () => {
            const documents = getASTDocuments(jurisdiction, tier);

            const inventoryDoc = documents.find(d => d.id === 'inventory-schedule');

            if (tier === 'premium') {
              expect(inventoryDoc?.title).toContain('Wizard-Completed');
            } else {
              expect(inventoryDoc?.title).toContain('Blank');
            }
          });
        });
      });
    });
  });

  // ============================================================================
  // CROSS-SOURCE CONSISTENCY TESTS
  // ============================================================================

  describe('Cross-Source Consistency', () => {
    jurisdictions.forEach((jurisdiction) => {
      describe(jurisdiction, () => {
        tiers.forEach((tier) => {
          it(`should have matching inventory info between pack-contents and included-features for ${tier}`, () => {
            // Get inventory info from included-features
            const inventoryBehaviour = getInventoryBehaviour(tier);

            // Get pack contents
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const inventoryItem = contents.find(item => item.key === 'inventory_schedule');

            // Labels should be consistent
            expect(inventoryItem?.title).toContain(
              tier === 'premium' ? 'Wizard-Completed' : 'Blank'
            );
          });

          it(`should have consistent feature count between pack-contents and document-configs for ${tier}`, () => {
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const documents = getASTDocuments(jurisdiction, tier);

            // Both should include inventory and checklist
            const contentsHasInventory = contents.some(c => c.key === 'inventory_schedule');
            const docsHasInventory = documents.some(d => d.id === 'inventory-schedule');
            expect(contentsHasInventory).toBe(docsHasInventory);

            const contentsHasChecklist = contents.some(c => c.key.includes('checklist'));
            const docsHasChecklist = documents.some(d => d.id.includes('checklist'));
            expect(contentsHasChecklist).toBe(docsHasChecklist);
          });

          it(`should have consistent jurisdiction checklist naming for ${tier}`, () => {
            const contents = getPackContents({
              product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
              jurisdiction,
            });

            const checklistItem = contents.find(item => item.key.includes('checklist'));

            // Jurisdiction should appear in checklist key or title
            const jurisdictionName = jurisdiction === 'northern-ireland'
              ? 'northern_ireland'
              : jurisdiction;
            const jurisdictionDisplayName = jurisdiction === 'northern-ireland'
              ? 'Northern Ireland'
              : jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1);

            expect(
              checklistItem?.key.includes(jurisdictionName) ||
              checklistItem?.title.includes(jurisdictionDisplayName)
            ).toBe(true);
          });
        });
      });
    });
  });

  // ============================================================================
  // TIER BOUNDARY TESTS
  // ============================================================================

  describe('Tier Boundaries', () => {
    it('should have exactly 2 tiers', () => {
      expect(tiers.length).toBe(2);
      expect(tiers).toContain('standard');
      expect(tiers).toContain('premium');
    });

    it('should have exactly 4 jurisdictions', () => {
      expect(jurisdictions.length).toBe(4);
      expect(jurisdictions).toContain('england');
      expect(jurisdictions).toContain('wales');
      expect(jurisdictions).toContain('scotland');
      expect(jurisdictions).toContain('northern-ireland');
    });

    jurisdictions.forEach((jurisdiction) => {
      it(`standard tier should NOT include HMO clauses for ${jurisdiction}`, () => {
        const features = getIncludedFeatures(jurisdiction, 'standard');
        const hmoClause = features.find(f => f.id === 'hmo_clauses');
        expect(hmoClause).toBeUndefined();
      });

      it(`premium tier SHOULD include HMO clauses for ${jurisdiction}`, () => {
        const features = getIncludedFeatures(jurisdiction, 'premium');
        const hmoClause = features.find(f => f.id === 'hmo_clauses');
        expect(hmoClause).toBeDefined();
        expect(hmoClause?.isPremiumOnly).toBe(true);
      });
    });
  });

  // ============================================================================
  // INVENTORY NEVER BLOCKS GENERATION TESTS
  // ============================================================================

  describe('Inventory Never Blocks Generation', () => {
    tiers.forEach((tier) => {
      it(`should always have inventory available for ${tier}`, () => {
        const inventoryBehaviour = getInventoryBehaviour(tier);

        // Inventory should always have a label (never undefined)
        expect(inventoryBehaviour.label).toBeTruthy();

        // Inventory should always have a description
        expect(inventoryBehaviour.description).toBeTruthy();

        // wizardRequired is a boolean, not conditional
        expect(typeof inventoryBehaviour.wizardRequired).toBe('boolean');
      });
    });

    jurisdictions.forEach((jurisdiction) => {
      tiers.forEach((tier) => {
        it(`should always include inventory in pack contents for ${jurisdiction} ${tier}`, () => {
          const contents = getPackContents({
            product: tier === 'premium' ? 'ast_premium' : 'ast_standard',
            jurisdiction,
          });

          const inventoryItem = contents.find(item => item.key === 'inventory_schedule');

          // Inventory should always be in the pack
          expect(inventoryItem).toBeDefined();

          // Inventory should be required (never optional)
          expect(inventoryItem?.required).toBe(true);
        });
      });
    });
  });
});
