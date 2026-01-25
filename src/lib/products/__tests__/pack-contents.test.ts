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
      it('returns Section 21 notice items', () => {
        const args: GetPackContentsArgs = {
          product: 'notice_only',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const items = getPackContents(args);

        expect(items.length).toBeGreaterThan(0);
        expect(items.find(i => i.key === 'section21_notice')).toBeDefined();
        expect(items.find(i => i.key === 'service_instructions')).toBeDefined();
        expect(items.find(i => i.key === 'service_checklist')).toBeDefined();
      });

      it('returns Section 8 notice items', () => {
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
      it('returns Section 21 complete pack with N5B (accelerated)', () => {
        const args: GetPackContentsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_21',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section21_notice')).toBeDefined();
        expect(items.find(i => i.key === 'n5b_claim')).toBeDefined();
        expect(items.find(i => i.key === 'witness_statement')).toBeDefined();
        expect(items.find(i => i.key === 'court_filing_guide')).toBeDefined();
        // N5 not included for Section 21 (uses accelerated)
        expect(items.find(i => i.key === 'n5_claim')).toBeUndefined();
      });

      it('returns Section 8 complete pack with N5 and N119', () => {
        const args: GetPackContentsArgs = {
          product: 'complete_pack',
          jurisdiction: 'england',
          route: 'section_8',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'section8_notice')).toBeDefined();
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
    describe('england/wales', () => {
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

      it('returns same items for Wales (uses County Court)', () => {
        const args: GetPackContentsArgs = {
          product: 'money_claim',
          jurisdiction: 'wales',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'n1_claim')).toBeDefined();
      });
    });

    describe('scotland (sc_money_claim)', () => {
      it('returns Scotland money claim items with Form 3A (Simple Procedure)', () => {
        const args: GetPackContentsArgs = {
          product: 'sc_money_claim',
          jurisdiction: 'scotland',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'form_3a')).toBeDefined();
        expect(items.find(i => i.key === 'statement_of_claim')).toBeDefined();
        expect(items.find(i => i.key === 'pre_action_letter')).toBeDefined();
        expect(items.find(i => i.description?.includes('Sheriff Court'))).toBeDefined();
        // No County Court forms
        expect(items.find(i => i.key === 'n1_claim')).toBeUndefined();
      });

      it('falls back to sc_money_claim for generic money_claim in Scotland', () => {
        const args: GetPackContentsArgs = {
          product: 'money_claim',
          jurisdiction: 'scotland',
        };
        const items = getPackContents(args);

        expect(items.find(i => i.key === 'form_3a')).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // TENANCY AGREEMENT PRODUCTS - Jan 2026 Update
  // Base product: ONLY the tenancy agreement (no supporting docs)
  // Premium (HMO): ONLY the HMO tenancy agreement
  // ===========================================================================

  describe('ast_standard product (base - agreement only)', () => {
    it('returns ONLY the AST agreement for England (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'england',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('ast_agreement');
      expect(items[0].title).toContain('Assured Shorthold');
      expect(items[0].description).toContain('agreement only');

      // MUST NOT have supporting documents
      expect(items.find(i => i.key === 'terms_schedule')).toBeUndefined();
      expect(items.find(i => i.key === 'model_clauses')).toBeUndefined();
      expect(items.find(i => i.key === 'inventory_template')).toBeUndefined();
    });

    it('returns ONLY the SOC agreement for Wales (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'wales',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('soc_agreement');
      expect(items[0].title).toContain('Standard Occupation Contract');
      expect(items[0].description).toContain('occupation contract only');

      // MUST NOT have supporting documents
      expect(items.find(i => i.key === 'terms_schedule')).toBeUndefined();
      expect(items.find(i => i.key === 'model_clauses')).toBeUndefined();
    });

    it('returns ONLY the PRT agreement for Scotland (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'scotland',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('prt_agreement');
      expect(items[0].title).toContain('Private Residential Tenancy');
      expect(items[0].description).toContain('agreement only');

      // MUST NOT have supporting documents
      expect(items.find(i => i.key === 'terms_schedule')).toBeUndefined();
      expect(items.find(i => i.key === 'model_clauses')).toBeUndefined();
    });

    it('returns ONLY the Private Tenancy agreement for Northern Ireland (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_standard',
        jurisdiction: 'northern-ireland',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('private_tenancy_agreement');
      expect(items[0].title).toContain('Private Tenancy');
      expect(items[0].description).toContain('agreement only');

      // MUST NOT have supporting documents
      expect(items.find(i => i.key === 'terms_schedule')).toBeUndefined();
      expect(items.find(i => i.key === 'model_clauses')).toBeUndefined();
    });
  });

  describe('ast_premium product (HMO - HMO agreement only)', () => {
    it('returns ONLY the HMO AST agreement for England (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'england',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the HMO agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('ast_agreement_hmo');
      expect(items[0].title).toContain('HMO');
      expect(items[0].description).toContain('HMO-specific');

      // MUST NOT have supporting documents
      expect(items.find(i => i.key === 'key_schedule')).toBeUndefined();
      expect(items.find(i => i.key === 'maintenance_guide')).toBeUndefined();
      expect(items.find(i => i.key === 'checkout_procedure')).toBeUndefined();
    });

    it('returns ONLY the HMO SOC agreement for Wales (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'wales',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the HMO agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('soc_agreement_hmo');
      expect(items[0].title).toContain('HMO');
    });

    it('returns ONLY the HMO PRT agreement for Scotland (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'scotland',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the HMO agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('prt_agreement_hmo');
      expect(items[0].title).toContain('HMO');
    });

    it('returns ONLY the HMO Private Tenancy agreement for Northern Ireland (no supporting docs)', () => {
      const args: GetPackContentsArgs = {
        product: 'ast_premium',
        jurisdiction: 'northern-ireland',
      };
      const items = getPackContents(args);

      // MUST have exactly 1 document - the HMO agreement only
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('private_tenancy_agreement_hmo');
      expect(items[0].title).toContain('HMO');
    });

    it('both standard and premium have exactly 1 document (no supporting docs for either)', () => {
      const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];

      for (const jur of jurisdictions) {
        const standardItems = getPackContents({ product: 'ast_standard', jurisdiction: jur });
        const premiumItems = getPackContents({ product: 'ast_premium', jurisdiction: jur });

        // Both tiers now have exactly 1 document each (agreement only)
        expect(standardItems.length).toBe(1);
        expect(premiumItems.length).toBe(1);

        // But different document types
        expect(standardItems[0].key).not.toBe(premiumItems[0].key);
      }
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

  describe('England - Section 8/21 ARE supported (Housing Act 1988)', () => {
    it('England + section_8 returns Section 8 notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find(i => i.key === 'section8_notice')).toBeDefined();
    });

    it('England + section_21 returns Section 21 notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_21',
      });

      expect(items.find(i => i.key === 'section21_notice')).toBeDefined();
    });

    it('England complete_pack uses County Court forms', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find(i => i.key === 'n5_claim')).toBeDefined();
      expect(items.find(i => i.key === 'n119_particulars')).toBeDefined();
      expect(items.find(i => i.description?.includes('County Court'))).toBeDefined();
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

  it('supports money_claim in England and Wales only', () => {
    expect(isProductSupported('money_claim', 'england')).toBe(true);
    expect(isProductSupported('money_claim', 'wales')).toBe(true);
    expect(isProductSupported('money_claim', 'scotland')).toBe(false);
    expect(isProductSupported('money_claim', 'northern-ireland')).toBe(false);
  });

  it('supports sc_money_claim in Scotland only', () => {
    expect(isProductSupported('sc_money_claim', 'scotland')).toBe(true);
    expect(isProductSupported('sc_money_claim', 'england')).toBe(false);
    expect(isProductSupported('sc_money_claim', 'wales')).toBe(false);
    expect(isProductSupported('sc_money_claim', 'northern-ireland')).toBe(false);
  });

  it('returns false for unknown products', () => {
    expect(isProductSupported('unknown', 'england')).toBe(false);
  });
});
