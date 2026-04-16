/**
 * Pack Contents Tests
 *
 * Tests for product pack contents helper across all jurisdictions and products.
 */

import { describe, it, expect } from 'vitest';
import { getPackContents, isProductSupported } from '../pack-contents';
import type { GetPackContentsArgs, PackItem } from '../pack-contents';

describe('getPackContents', () => {
  describe('notice_only product', () => {
    describe('england', () => {
      it('always returns the Form 3A-led England notice pack', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const items = getPackContents(args);

        expect(items.length).toBeGreaterThan(0);
        expect(items.find(i => i.key === 'section8_notice')?.title).toContain('Form 3A');
        expect(items.find(i => i.key === 'service_instructions')).toBeDefined();
        expect(items.find(i => i.key === 'cover_letter_to_tenant')).toBeDefined();
        expect(items.find(i => i.key === 'service_checklist')).toBeDefined();
        expect(items.find(i => i.key === 'evidence_checklist')).toBeDefined();
        expect(items.find(i => i.key === 'proof_of_service')).toBeDefined();
        expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
      });

      it('returns the same Form 3A notice pack for the section_8 compatibility route', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section8_notice')).toBeDefined();
        expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
      });

      it('includes arrears schedule when has_arrears is true', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
          has_arrears: true,
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'arrears_schedule')).toBeDefined();
      });

      it('includes arrears schedule when include_arrears_schedule is true', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
          include_arrears_schedule: true,
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'arrears_schedule')).toBeDefined();
      });

      it('excludes arrears schedule when no arrears', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_8',
          has_arrears: false,
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'arrears_schedule')).toBeUndefined();
      });
    });

    describe('wales', () => {
      it('returns Section 173 notice items (Renting Homes Act)', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'wales',
          route: 'section_173',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section173_notice')).toBeDefined();
        expect(items.find(i => i.title.includes('Wales'))).toBeDefined();
      });

      it('returns fault-based notice items', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'wales',
          route: 'fault_based',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'fault_notice')).toBeDefined();
      });

      it('includes arrears schedule for fault_based with arrears', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'wales',
          route: 'fault_based',
          has_arrears: true,
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'arrears_schedule')).toBeDefined();
      });
    });

    describe('scotland', () => {
      it('returns Notice to Leave items', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'scotland',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'notice_to_leave')).toBeDefined();
        expect(items.find(i => i.title.includes('Scotland'))).toBeDefined();
      });

      it('includes arrears schedule for Scotland with arrears', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'scotland',
          has_arrears: true,
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'arrears_schedule')).toBeDefined();
      });
    });
  });

  describe('complete_pack product', () => {
    describe('england', () => {
      it('maps England complete pack to Form 3A plus N5/N119 even for legacy section_21 inputs', () => {
        const args: GetPackContentsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section8_notice')?.title).toContain('Form 3A');
        expect(items.find(i => i.key === 'n5_claim')).toBeDefined();
        expect(items.find(i => i.key === 'n119_particulars')).toBeDefined();
        expect(items.find(i => i.key === 'court_filing_guide')).toBeDefined();
        expect(items.find(i => i.key === 'cover_letter_to_tenant')).toBeDefined();
        expect(items.find(i => i.key === 'proof_of_service')).toBeDefined();
        expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
        expect(items.find(i => i.key === 'witness_statement')).toBeUndefined();
      });

      it('returns England complete pack with N5 and N119', () => {
        const args: GetPackContentsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_8',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section8_notice')?.title).toContain('Form 3A');
        expect(items.find(i => i.key === 'n5_claim')).toBeDefined();
        expect(items.find(i => i.key === 'n119_particulars')).toBeDefined();
        expect(items.find(i => i.key === 'proof_of_service')).toBeDefined();
        // N5B not included for Section 8
        expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
      });
    });

    describe('scotland', () => {
      it('returns complete pack with First-tier Tribunal Form E', () => {
        const args: GetPackContentsArgs = {
          product: 'complete_pack',
          jurisdiction: 'scotland',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'notice_to_leave')).toBeDefined();
        expect(items.find(i => i.key === 'form_e_tribunal')).toBeDefined();
        expect(items.find(i => i.description?.includes('First-tier Tribunal'))).toBeDefined();
        // No County Court forms
        expect(items.find(i => i.key === 'n5_claim')).toBeUndefined();
        expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
      });
    });
  });

  describe('money_claim product', () => {
    describe('england only', () => {
      it('returns England money claim items with Form N1', () => {
        const args: GetPackContentsArgs = {
          product: 'money_claim',
          jurisdiction: 'england',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'n1_claim')).toBeDefined();
        expect(items.find(i => i.key === 'particulars_of_claim')).toBeDefined();
        expect(items.find(i => i.key === 'letter_before_claim')).toBeDefined();
        expect(items.find(i => i.key === 'enforcement_guide')).toBeDefined();
      });

      it('returns no money claim items for Wales because the product is England only', () => {
        const args: GetPackContentsArgs = {
          product: 'money_claim',
          jurisdiction: 'wales',
        };
        const items = getPackContents(args);

        expect(items).toEqual([]);
      });
    });

    it('returns no money claim items for Scotland because the Scotland pack is discontinued', () => {
      const args: GetPackContentsArgs = {
        product: 'money_claim',
        jurisdiction: 'scotland',
      };
      const items = getPackContents(args);

      expect(items).toEqual([]);
    });
  });

  // ===========================================================================
  // TENANCY AGREEMENT PRODUCTS
  // Both tiers include: Agreement, Inventory Schedule, Compliance Checklist
  // England additionally includes the standalone deposit support documents
  // ===========================================================================

  describe('ast_standard product', () => {
    it('returns agreement, inventory, checklist, and deposit docs for England', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'england',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(5);
      expect(items.find(i => i.key === 'ast_agreement')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_england')).toBeDefined();
      expect(items.find(i => i.key === 'deposit_protection_certificate')).toBeDefined();
      expect(items.find(i => i.key === 'tenancy_deposit_information')).toBeDefined();
    });

    it('returns agreement, inventory, and checklist for Wales', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'wales',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(3);
      expect(items.find(i => i.key === 'soc_agreement')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_wales')).toBeDefined();
    });

    it('returns agreement, inventory, checklist, and easy read notes for Scotland', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'scotland',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(4);
      expect(items.find(i => i.key === 'prt_agreement')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_scotland')).toBeDefined();
      expect(items.find(i => i.key === 'easy_read_notes_scotland')).toBeDefined();
    });

    it('returns agreement, inventory, and checklist for Northern Ireland', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'northern-ireland',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(3);
      expect(items.find(i => i.key === 'private_tenancy_agreement')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_northern_ireland')).toBeDefined();
    });

    it('shows blank template copy for standard tier inventory', () => {
      const items = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'england',
      });
      const inventory = items.find(i => i.key === 'inventory_schedule');

      expect(inventory?.title).toContain('Blank Template');
      expect(inventory?.description).toContain('blank template');
    });
  });

  describe('ast_premium product', () => {
    it('returns premium agreement, core documents, deposit docs, and support docs for England', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'england',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(8);
      expect(items.find(i => i.key === 'ast_agreement_hmo')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_england')).toBeDefined();
      expect(items.find(i => i.key === 'deposit_protection_certificate')).toBeDefined();
      expect(items.find(i => i.key === 'tenancy_deposit_information')).toBeDefined();
      expect(items.find(i => i.key === 'key_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'property_maintenance_guide')).toBeDefined();
      expect(items.find(i => i.key === 'checkout_procedure')).toBeDefined();
    });

    it('returns premium agreement, checklist, and support docs for Wales', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'wales',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(6);
      expect(items.find(i => i.key === 'soc_agreement_hmo')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_wales')).toBeDefined();
      expect(items.find(i => i.key === 'key_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'property_maintenance_guide')).toBeDefined();
      expect(items.find(i => i.key === 'checkout_procedure')).toBeDefined();
    });

    it('returns premium agreement, easy read notes, and support docs for Scotland', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'scotland',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(7);
      expect(items.find(i => i.key === 'prt_agreement_hmo')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_scotland')).toBeDefined();
      expect(items.find(i => i.key === 'easy_read_notes_scotland')).toBeDefined();
      expect(items.find(i => i.key === 'key_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'property_maintenance_guide')).toBeDefined();
      expect(items.find(i => i.key === 'checkout_procedure')).toBeDefined();
    });

    it('returns premium agreement, checklist, and support docs for Northern Ireland', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'northern-ireland',
      };
      const items = getPackContents(args);

      expect(items.length).toBe(6);
      expect(items.find(i => i.key === 'private_tenancy_agreement_hmo')).toBeDefined();
      expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'pre_tenancy_checklist_northern_ireland')).toBeDefined();
      expect(items.find(i => i.key === 'key_schedule')).toBeDefined();
      expect(items.find(i => i.key === 'property_maintenance_guide')).toBeDefined();
      expect(items.find(i => i.key === 'checkout_procedure')).toBeDefined();
    });

    it('shows ready to complete copy for premium tier without inventory data', () => {
      const items = getPackContents({
        product: 'ast_premium',
        jurisdiction: 'england',
        hasInventoryData: false,
      });
      const inventory = items.find(i => i.key === 'inventory_schedule');

      expect(inventory?.title).toContain('Ready to Complete');
      expect(inventory?.description).toContain('ready to complete');
    });

    it('shows wizard-completed copy for premium tier with inventory data', () => {
      const items = getPackContents({
        product: 'ast_premium',
        jurisdiction: 'england',
        hasInventoryData: true,
      });
      const inventory = items.find(i => i.key === 'inventory_schedule');

      expect(inventory?.title).toContain('Wizard-Completed');
      expect(inventory?.description).toContain('wizard-completed');
    });

    it('premium packs add support docs by jurisdiction while standard packs stay unchanged', () => {
      const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];

      for (const jur of jurisdictions) {
        const standardItems = getPackContents({ product: 'ast_standard', jurisdiction: jur });
        const premiumItems = getPackContents({ product: 'ast_premium', jurisdiction: jur });

        if (jur === 'england') {
          expect(standardItems.length).toBe(5);
          expect(premiumItems.length).toBe(8);
          expect(standardItems.find(i => i.key === 'deposit_protection_certificate')).toBeDefined();
          expect(premiumItems.find(i => i.key === 'tenancy_deposit_information')).toBeDefined();
        } else if (jur === 'scotland') {
          expect(standardItems.length).toBe(4);
          expect(premiumItems.length).toBe(7);
          expect(standardItems.find(i => i.key === 'easy_read_notes_scotland')).toBeDefined();
          expect(premiumItems.find(i => i.key === 'easy_read_notes_scotland')).toBeDefined();
        } else {
          expect(standardItems.length).toBe(3);
          expect(premiumItems.length).toBe(6);
        }

        // Both should have inventory_schedule
        expect(standardItems.find(i => i.key === 'inventory_schedule')).toBeDefined();
        expect(premiumItems.find(i => i.key === 'inventory_schedule')).toBeDefined();
        expect(premiumItems.find(i => i.key === 'key_schedule')).toBeDefined();
        expect(premiumItems.find(i => i.key === 'property_maintenance_guide')).toBeDefined();
        expect(premiumItems.find(i => i.key === 'checkout_procedure')).toBeDefined();
      }
    });
  });

  describe('modern England tenancy agreement products', () => {
    const englandProducts: Array<{
      product: GetPackContentsArgs['product'];
      key: string;
      title: string;
      supportKey: string;
    }> = [
      {
        product: 'england_standard_tenancy_agreement',
        key: 'england_standard_tenancy_agreement',
        title: 'Standard Tenancy Agreement',
        supportKey: 'pre_tenancy_checklist_england',
      },
      {
        product: 'england_premium_tenancy_agreement',
        key: 'england_premium_tenancy_agreement',
        title: 'Premium Tenancy Agreement',
        supportKey: 'pre_tenancy_checklist_england',
      },
      {
        product: 'england_student_tenancy_agreement',
        key: 'england_student_tenancy_agreement',
        title: 'Student Tenancy Agreement',
        supportKey: 'pre_tenancy_checklist_england',
      },
      {
        product: 'england_hmo_shared_house_tenancy_agreement',
        key: 'england_hmo_shared_house_tenancy_agreement',
        title: 'HMO / Shared House Tenancy Agreement',
        supportKey: 'pre_tenancy_checklist_england',
      },
      {
        product: 'england_lodger_agreement',
        key: 'england_lodger_agreement',
        title: 'Room Let / Lodger Agreement',
        supportKey: 'england_lodger_checklist',
      },
    ];

    it.each(englandProducts)('$product returns its own primary agreement document plus its support document for England', ({ product, key, title, supportKey }) => {
      const items = getPackContents({
        product,
        jurisdiction: 'england',
      });

      expect(items[0]).toMatchObject({
        key,
        title,
        category: 'Tenancy agreement',
        required: true,
      });
      expect(items.some((item) => item.key === supportKey)).toBe(true);
    });

    it('adds the richer handover and operational support docs to the modern England assured products', () => {
      const premiumItems = getPackContents({
        product: 'england_premium_tenancy_agreement',
        jurisdiction: 'england',
      });
      const studentItems = getPackContents({
        product: 'england_student_tenancy_agreement',
        jurisdiction: 'england',
      });
      const hmoItems = getPackContents({
        product: 'england_hmo_shared_house_tenancy_agreement',
        jurisdiction: 'england',
      });
      const lodgerItems = getPackContents({
        product: 'england_lodger_agreement',
        jurisdiction: 'england',
      });

      expect(premiumItems.map((item) => item.key)).toEqual(
        expect.arrayContaining([
          'england_keys_handover_record',
          'england_utilities_handover_sheet',
          'england_pet_request_addendum',
          'england_tenancy_variation_record',
          'england_premium_management_schedule',
        ])
      );
      expect(studentItems.map((item) => item.key)).toEqual(
        expect.arrayContaining([
          'england_keys_handover_record',
          'england_utilities_handover_sheet',
          'england_pet_request_addendum',
          'england_tenancy_variation_record',
          'england_student_move_out_schedule',
        ])
      );
      expect(hmoItems.map((item) => item.key)).toEqual(
        expect.arrayContaining([
          'england_keys_handover_record',
          'england_utilities_handover_sheet',
          'england_pet_request_addendum',
          'england_tenancy_variation_record',
          'england_hmo_house_rules_appendix',
        ])
      );
      expect(lodgerItems.map((item) => item.key)).toEqual(
        expect.arrayContaining([
          'england_lodger_checklist',
          'england_keys_handover_record',
          'england_lodger_house_rules_appendix',
        ])
      );
      expect(lodgerItems.map((item) => item.key)).not.toContain('pre_tenancy_checklist_england');
    });

    it('uses the written statement variant for an existing verbal England assured tenancy', () => {
      const items = getPackContents({
        product: 'england_standard_tenancy_agreement',
        jurisdiction: 'england',
        englandTenancyPurpose: 'existing_verbal_tenancy',
      });

      expect(items.map((item) => item.key)).toEqual(
        expect.arrayContaining(['england_written_statement_of_terms', 'pre_tenancy_checklist_england'])
      );
      expect(items.find((item) => item.key === 'england_standard_tenancy_agreement')).toBeUndefined();
    });

    it('uses the transition guidance pack for an existing written England assured tenancy', () => {
      const items = getPackContents({
        product: 'england_student_tenancy_agreement',
        jurisdiction: 'england',
        englandTenancyPurpose: 'existing_written_tenancy',
      });

      expect(items.map((item) => item.key)).toEqual([
        'england_tenancy_transition_guidance',
        'renters_rights_information_sheet_2026',
      ]);
    });

    it('adds deposit support and guarantor deed where the answers require them', () => {
      const items = getPackContents({
        product: 'england_student_tenancy_agreement',
        jurisdiction: 'england',
        depositTaken: true,
        includeGuarantorDeed: true,
      });

      expect(items.map((item) => item.key)).toEqual(
        expect.arrayContaining([
          'england_student_tenancy_agreement',
          'pre_tenancy_checklist_england',
          'england_keys_handover_record',
          'england_student_move_out_schedule',
          'deposit_protection_certificate',
          'tenancy_deposit_information',
          'guarantor_agreement',
        ])
      );
    });

    it('does not support modern England tenancy products outside England', () => {
      for (const product of englandProducts.map((entry) => entry.product)) {
        expect(isProductSupported(product, 'wales')).toBe(false);
        expect(isProductSupported(product, 'scotland')).toBe(false);
        expect(isProductSupported(product, 'northern-ireland')).toBe(false);
      }
    });
  });

  // ===========================================================================
  // INVENTORY CONTEXT TESTS - Ensure correct messaging based on context
  // ===========================================================================

  describe('inventory context-aware messaging', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];

    describe('standard tier always shows blank template', () => {
      jurisdictions.forEach(jur => {
        it(`${jur}: shows blank template copy regardless of hasInventoryData`, () => {
          // Without hasInventoryData
          const itemsWithout = getPackContents({
            product: 'ast_standard',
            jurisdiction: jur,
          });
          const inventoryWithout = itemsWithout.find(i => i.key === 'inventory_schedule');
          expect(inventoryWithout?.title).toContain('Blank Template');
          expect(inventoryWithout?.description).toContain('blank template');

          // With hasInventoryData = true (should be ignored for standard)
          const itemsWith = getPackContents({
            product: 'ast_standard',
            jurisdiction: jur,
            hasInventoryData: true,
          });
          const inventoryWith = itemsWith.find(i => i.key === 'inventory_schedule');
          expect(inventoryWith?.title).toContain('Blank Template');
          expect(inventoryWith?.description).toContain('blank template');
        });
      });
    });

    describe('premium tier shows context-aware inventory messaging', () => {
      jurisdictions.forEach(jur => {
        it(`${jur}: shows "Ready to Complete" when hasInventoryData is false`, () => {
          const items = getPackContents({
            product: 'ast_premium',
            jurisdiction: jur,
            hasInventoryData: false,
          });
          const inventory = items.find(i => i.key === 'inventory_schedule');
          expect(inventory?.title).toContain('Ready to Complete');
          expect(inventory?.description).toContain('ready to complete');
        });

        it(`${jur}: shows "Wizard-Completed" when hasInventoryData is true`, () => {
          const items = getPackContents({
            product: 'ast_premium',
            jurisdiction: jur,
            hasInventoryData: true,
          });
          const inventory = items.find(i => i.key === 'inventory_schedule');
          expect(inventory?.title).toContain('Wizard-Completed');
          expect(inventory?.description).toContain('wizard-completed');
        });

        it(`${jur}: defaults to "Ready to Complete" when hasInventoryData is undefined`, () => {
          const items = getPackContents({
            product: 'ast_premium',
            jurisdiction: jur,
          });
          const inventory = items.find(i => i.key === 'inventory_schedule');
          expect(inventory?.title).toContain('Ready to Complete');
        });
      });
    });

    describe('inventory always included in pack (never blocks generation)', () => {
      jurisdictions.forEach(jur => {
        it(`${jur}: inventory_schedule is always present in standard tier`, () => {
          const items = getPackContents({
            product: 'ast_standard',
            jurisdiction: jur,
          });
          expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
        });

        it(`${jur}: inventory_schedule is always present in premium tier`, () => {
          const items = getPackContents({
            product: 'ast_premium',
            jurisdiction: jur,
          });
          expect(items.find(i => i.key === 'inventory_schedule')).toBeDefined();
        });
      });
    });
  });

  describe('unsupported products', () => {
    it('returns empty array for notice_only in Northern Ireland', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'northern-ireland',
      });

      expect(items).toEqual([]);
    });

    it('returns empty array for money_claim in Northern Ireland', () => {
      const items = getPackContents({
        product: 'money_claim',
        jurisdiction: 'northern-ireland',
      });

      expect(items).toEqual([]);
    });

    it('returns empty array for unknown product', () => {
      const items = getPackContents({
        product: 'unknown_product',
        jurisdiction: 'england',
      });

      expect(items).toEqual([]);
    });

    it('returns empty array for unknown jurisdiction', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'unknown_jurisdiction',
      });

      expect(items).toEqual([]);
    });
  });

  describe('PackItem structure', () => {
    it('all items have required fields', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      for (const item of items) {
        expect(typeof item.key).toBe('string');
        expect(item.key.length).toBeGreaterThan(0);
        expect(typeof item.title).toBe('string');
        expect(item.title.length).toBeGreaterThan(0);
        expect(['Notice', 'Court forms', 'Checklists', 'Guidance', 'Evidence', 'Tenancy agreement', 'Other']).toContain(item.category);
      }
    });

    it('items have unique keys within a pack', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      const keys = items.map(i => i.key);
      const uniqueKeys = [...new Set(keys)];
      expect(keys.length).toBe(uniqueKeys.length);
    });
  });
});

// =============================================================================
// JURISDICTION CORRECTNESS - CRITICAL LEGAL TESTS
// These tests prevent the reintroduction of jurisdiction bugs.
// Section 8 and Section 21 are ENGLAND ONLY under Housing Act 1988.
// Wales uses Renting Homes (Wales) Act 2016 (Section 173, fault_based).
// Scotland uses Private Housing (Tenancies) (Scotland) Act 2016 (Notice to Leave).
// =============================================================================

describe('Jurisdiction correctness', () => {
  describe('Wales - Section 8/21 must NOT be supported', () => {
    it('Wales + section_8 returns NO section8_notice (Section 8 is England-only)', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'section_8',
      });

      // Should NOT find any Section 8 related items
      expect(items.find(i => i.key === 'section8_notice')).toBeUndefined();
      expect(items.find(i => i.key.includes('section8'))).toBeUndefined();
      expect(items.find(i => i.title.toLowerCase().includes('section 8'))).toBeUndefined();

      // Should only have generic guidance items (service instructions, checklist)
      // No notice document because section_8 is invalid for Wales
      expect(items.find(i => i.category === 'Notice')).toBeUndefined();
    });

    it('Wales + section_21 returns NO section21_notice (Section 21 is England-only)', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'section_21',
      });

      // Should NOT find any Section 21 related items
      expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
      expect(items.find(i => i.key.includes('section21'))).toBeUndefined();
      expect(items.find(i => i.title.toLowerCase().includes('section 21'))).toBeUndefined();

      // No notice document because section_21 is invalid for Wales
      expect(items.find(i => i.category === 'Notice')).toBeUndefined();
    });

    it('Wales complete_pack + section_8 returns NO England court forms', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'wales',
        route: 'section_8',
      });

      // Should NOT have Section 8 specific content
      expect(items.find(i => i.key === 'section8_notice')).toBeUndefined();
    });

    it('Wales complete_pack + section_21 returns NO accelerated possession (N5B)', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'wales',
        route: 'section_21',
      });

      // N5B is for Section 21 accelerated procedure - England only
      expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
      expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
    });

    it('Wales ONLY supports section_173 and fault_based routes', () => {
      // section_173 should work
      const s173Items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'section_173',
      });
      expect(s173Items.find(i => i.key === 'section173_notice')).toBeDefined();
      expect(s173Items.find(i => i.category === 'Notice')).toBeDefined();

      // fault_based should work
      const faultItems = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'fault_based',
      });
      expect(faultItems.find(i => i.key === 'fault_notice')).toBeDefined();
      expect(faultItems.find(i => i.category === 'Notice')).toBeDefined();
    });
  });

  describe('Scotland - Section 8/21 and County Court must NOT be supported', () => {
    it('Scotland + section_8 returns NO section8_notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'scotland',
        route: 'section_8',
      });

      expect(items.find(i => i.key === 'section8_notice')).toBeUndefined();
      expect(items.find(i => i.title.toLowerCase().includes('section 8'))).toBeUndefined();
    });

    it('Scotland + section_21 returns NO section21_notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'scotland',
        route: 'section_21',
      });

      expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
      expect(items.find(i => i.title.toLowerCase().includes('section 21'))).toBeUndefined();
    });

    it('Scotland complete_pack returns NO County Court forms', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'scotland',
      });

      // Should NOT have County Court forms (N5, N5B, N119)
      expect(items.find(i => i.key === 'n5_claim')).toBeUndefined();
      expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
      expect(items.find(i => i.key === 'n119_particulars')).toBeUndefined();

      // Should have Tribunal form instead
      expect(items.find(i => i.key === 'form_e_tribunal')).toBeDefined();
      expect(items.find(i => i.description?.includes('First-tier Tribunal'))).toBeDefined();
    });

    it('Scotland uses Notice to Leave (PRT), not Section 8/21', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'scotland',
      });

      expect(items.find(i => i.key === 'notice_to_leave')).toBeDefined();
      expect(items.find(i => i.title.includes('Notice to Leave'))).toBeDefined();
    });
  });

  describe('England post-1 May 2026 possession packs', () => {
    it('England + section_8 returns Form 3A notice pack', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find(i => i.key === 'section8_notice')).toBeDefined();
      expect(items.find(i => i.title.includes('Form 3A'))).toBeDefined();
    });

    it('England + section_21 still resolves to the Form 3A notice pack', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_21',
      });

      expect(items.find(i => i.key === 'section8_notice')).toBeDefined();
      expect(items.find(i => i.key === 'section21_notice')).toBeUndefined();
    });

    it('England complete_pack uses the standard possession court forms', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find(i => i.key === 'n5_claim')).toBeDefined();
      expect(items.find(i => i.key === 'n119_particulars')).toBeDefined();
      expect(items.find(i => i.key === 'n5b_claim')).toBeUndefined();
      expect(items.find(i => i.description?.toLowerCase().includes('county court'))).toBeDefined();
    });
  });
});

describe('isProductSupported', () => {
  it('supports tenancy agreements everywhere', () => {
    expect(isProductSupported('ast_standard', 'england')).toBe(true);
    expect(isProductSupported('ast_standard', 'wales')).toBe(true);
    expect(isProductSupported('ast_standard', 'scotland')).toBe(true);
    expect(isProductSupported('ast_standard', 'northern-ireland')).toBe(true);
    expect(isProductSupported('ast_premium', 'northern-ireland')).toBe(true);
  });

  it('supports modern England tenancy products in England only', () => {
    expect(isProductSupported('england_standard_tenancy_agreement', 'england')).toBe(true);
    expect(isProductSupported('england_premium_tenancy_agreement', 'england')).toBe(true);
    expect(isProductSupported('england_student_tenancy_agreement', 'england')).toBe(true);
    expect(isProductSupported('england_hmo_shared_house_tenancy_agreement', 'england')).toBe(true);
    expect(isProductSupported('england_lodger_agreement', 'england')).toBe(true);
    expect(isProductSupported('england_standard_tenancy_agreement', 'wales')).toBe(false);
    expect(isProductSupported('england_student_tenancy_agreement', 'scotland')).toBe(false);
  });

  it('supports eviction products in England, Wales, Scotland', () => {
    expect(isProductSupported('notice_only', 'england')).toBe(true);
    expect(isProductSupported('notice_only', 'wales')).toBe(true);
    expect(isProductSupported('notice_only', 'scotland')).toBe(true);
    expect(isProductSupported('complete_pack', 'england')).toBe(true);
    expect(isProductSupported('complete_pack', 'wales')).toBe(true);
    expect(isProductSupported('complete_pack', 'scotland')).toBe(true);
  });

  it('does not support eviction products in Northern Ireland', () => {
    expect(isProductSupported('notice_only', 'northern-ireland')).toBe(false);
    expect(isProductSupported('complete_pack', 'northern-ireland')).toBe(false);
  });

  it('supports money_claim in England only', () => {
    expect(isProductSupported('money_claim', 'england')).toBe(true);
    expect(isProductSupported('money_claim', 'wales')).toBe(false);
    expect(isProductSupported('money_claim', 'scotland')).toBe(false);
    expect(isProductSupported('money_claim', 'northern-ireland')).toBe(false);
  });

  it('does not support sc_money_claim in any jurisdiction', () => {
    expect(isProductSupported('sc_money_claim', 'scotland')).toBe(false);
    expect(isProductSupported('sc_money_claim', 'england')).toBe(false);
    expect(isProductSupported('sc_money_claim', 'wales')).toBe(false);
    expect(isProductSupported('sc_money_claim', 'northern-ireland')).toBe(false);
  });

  it('returns false for unknown products', () => {
    expect(isProductSupported('unknown', 'england')).toBe(false);
  });
});
