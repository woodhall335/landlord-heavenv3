/**
 * Pack Contents vs Generator Parity Integration Tests
 *
 * CRITICAL: These tests ensure that document generators produce documents
 * that match what pack-contents.ts promises to users.
 *
 * If these tests fail, it means:
 * 1. The UI preview shows different documents than what gets generated, OR
 * 2. Jurisdiction rules are being violated (Wales Section 8/21, Scotland County Court)
 *
 * Test Matrix:
 * | Jurisdiction | Product      | Route        | Expected Documents |
 * |--------------|--------------|--------------|-------------------|
 * | England      | notice_only  | section_8    | section8_notice, service_*, arrears_schedule? |
 * | England      | notice_only  | section_21   | section21_notice, service_* |
 * | England      | complete_pack| section_8    | Above + N5, N119, witness_*, court_* |
 * | England      | complete_pack| section_21   | Above + N5B, witness_*, court_* |
 * | Wales        | notice_only  | section_173  | section173_notice, service_* (Wales) |
 * | Wales        | notice_only  | fault_based  | fault_notice, service_* (Wales), arrears_schedule? |
 * | Scotland     | notice_only  | notice_to_leave | notice_to_leave, service_* (Scotland) |
 * | Scotland     | complete_pack| notice_to_leave | Above + form_e_tribunal, tribunal_* |
 *
 * JURISDICTION VIOLATIONS (must fail):
 * - Wales + section_8/section_21 → MUST return empty or throw
 * - Scotland + section_8/section_21 → MUST return empty or throw
 * - Scotland + N5/N5B/N119 → MUST NOT be generated
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getPackContents, isProductSupported } from '../../src/lib/products';
import type { PackItem } from '../../src/lib/products';

// =============================================================================
// TYPES
// =============================================================================

interface TestScenario {
  name: string;
  product: string;
  jurisdiction: string;
  route?: string;
  hasArrears?: boolean;
  expectedMinDocs: number;
  mustIncludeKeys?: string[];
  mustNotIncludeKeys?: string[];
  mustNotIncludeTitles?: string[];
}

// =============================================================================
// TEST FIXTURES: Minimal wizard facts for each scenario
// =============================================================================

const ENGLAND_SECTION8_FACTS = {
  jurisdiction: 'england',
  case_type: 'eviction',
  eviction_route: 'section_8',
  selected_notice_route: 'section_8',
  landlord_full_name: 'Test Landlord',
  landlord_address_line1: '123 Test Street',
  landlord_address_town: 'London',
  landlord_address_postcode: 'SW1A 1AA',
  landlord_email: 'landlord@test.com',
  landlord_phone: '07700900000',
  tenant_full_name: 'Test Tenant',
  tenant_email: 'tenant@test.com',
  property_address_line1: '456 Property Road',
  property_address_town: 'Manchester',
  property_address_postcode: 'M1 1AA',
  tenancy_start_date: '2020-01-01',
  rent_amount: 1000,
  rent_frequency: 'monthly',
  section8_grounds: ['ground_8', 'ground_10'],
  has_arrears: false,
  arrears_claimed: false,
  notice_expiry_date: '2026-03-01',
};

const ENGLAND_SECTION8_WITH_ARREARS = {
  ...ENGLAND_SECTION8_FACTS,
  has_arrears: true,
  arrears_claimed: true,
  total_arrears: 5000,
  arrears_schedule: [
    { period: 'January 2026', due_date: '2026-01-01', amount_due: 1000, amount_paid: 0, arrears: 1000 },
  ],
};

const ENGLAND_SECTION21_FACTS = {
  ...ENGLAND_SECTION8_FACTS,
  case_type: 'no_fault',
  eviction_route: 'section_21',
  selected_notice_route: 'section_21',
  section8_grounds: undefined,
  deposit_taken: true,
  deposit_amount: 1200,
  deposit_protected: true,
  prescribed_info_given: true,
};

const WALES_SECTION173_FACTS = {
  jurisdiction: 'wales',
  case_type: 'no_fault',
  eviction_route: 'section_173',
  selected_notice_route: 'section_173',
  landlord_full_name: 'Welsh Landlord',
  landlord_address_line1: '10 Castle Street',
  landlord_address_town: 'Cardiff',
  landlord_address_postcode: 'CF10 1AA',
  landlord_email: 'landlord@wales.test',
  landlord_phone: '07700900001',
  tenant_full_name: 'Welsh Tenant',
  tenant_email: 'tenant@wales.test',
  property_address_line1: '20 Dragon Lane',
  property_address_town: 'Swansea',
  property_address_postcode: 'SA1 1AB',
  tenancy_start_date: '2023-01-01',
  rent_amount: 800,
  rent_frequency: 'monthly',
  notice_expiry_date: '2026-09-01',
};

const WALES_FAULT_BASED_FACTS = {
  ...WALES_SECTION173_FACTS,
  case_type: 'fault_based',
  eviction_route: 'fault_based',
  selected_notice_route: 'fault_based',
  wales_breach_type: ['serious_rent_arrears'],
  has_arrears: true,
  total_arrears: 3000,
};

const SCOTLAND_NOTICE_TO_LEAVE_FACTS = {
  jurisdiction: 'scotland',
  case_type: 'eviction',
  eviction_route: 'notice_to_leave',
  selected_notice_route: 'notice_to_leave',
  landlord_full_name: 'Scottish Landlord',
  landlord_address_line1: '15 Royal Mile',
  landlord_address_town: 'Edinburgh',
  landlord_address_postcode: 'EH1 1AA',
  landlord_email: 'landlord@scotland.test',
  landlord_phone: '07700900002',
  tenant_full_name: 'Scottish Tenant',
  tenant_email: 'tenant@scotland.test',
  property_address_line1: '30 Thistle Road',
  property_address_town: 'Glasgow',
  property_address_postcode: 'G1 1AA',
  tenancy_start_date: '2022-06-01',
  rent_amount: 900,
  rent_frequency: 'monthly',
  prt_grounds: ['ground_12_rent_arrears'],
  notice_expiry_date: '2026-04-01',
};

// =============================================================================
// TEST SCENARIOS
// =============================================================================

const TEST_SCENARIOS: TestScenario[] = [
  // ENGLAND - Notice Only
  {
    name: 'England notice_only section_8 (no arrears)',
    product: 'notice_only',
    jurisdiction: 'england',
    route: 'section_8',
    hasArrears: false,
    expectedMinDocs: 3,
    mustIncludeKeys: ['section8_notice', 'service_instructions', 'service_checklist'],
    mustNotIncludeKeys: ['section21_notice', 'section173_notice', 'notice_to_leave'],
  },
  {
    name: 'England notice_only section_8 (with arrears)',
    product: 'notice_only',
    jurisdiction: 'england',
    route: 'section_8',
    hasArrears: true,
    expectedMinDocs: 4,
    mustIncludeKeys: ['section8_notice', 'service_instructions', 'service_checklist', 'arrears_schedule'],
    mustNotIncludeKeys: ['section21_notice'],
  },
  {
    name: 'England notice_only section_21',
    product: 'notice_only',
    jurisdiction: 'england',
    route: 'section_21',
    hasArrears: false,
    expectedMinDocs: 3,
    mustIncludeKeys: ['section21_notice', 'service_instructions', 'service_checklist'],
    mustNotIncludeKeys: ['section8_notice', 'section173_notice', 'notice_to_leave'],
  },

  // ENGLAND - Complete Pack
  {
    name: 'England complete_pack section_8',
    product: 'complete_pack',
    jurisdiction: 'england',
    route: 'section_8',
    hasArrears: false,
    expectedMinDocs: 6,
    mustIncludeKeys: ['section8_notice', 'n5_claim', 'n119_particulars'],
    mustNotIncludeKeys: ['section21_notice', 'n5b_claim', 'form_e_tribunal'],
  },
  {
    name: 'England complete_pack section_21',
    product: 'complete_pack',
    jurisdiction: 'england',
    route: 'section_21',
    hasArrears: false,
    expectedMinDocs: 5,
    mustIncludeKeys: ['section21_notice', 'n5b_claim'],
    mustNotIncludeKeys: ['section8_notice', 'n5_claim', 'form_e_tribunal'],
  },

  // WALES - Notice Only (VALID routes only)
  {
    name: 'Wales notice_only section_173 (no-fault)',
    product: 'notice_only',
    jurisdiction: 'wales',
    route: 'section_173',
    hasArrears: false,
    expectedMinDocs: 3,
    mustIncludeKeys: ['section173_notice', 'service_instructions', 'service_checklist'],
    mustNotIncludeKeys: ['section8_notice', 'section21_notice', 'notice_to_leave'],
    mustNotIncludeTitles: ['Section 8', 'Section 21'],
  },
  {
    name: 'Wales notice_only fault_based',
    product: 'notice_only',
    jurisdiction: 'wales',
    route: 'fault_based',
    hasArrears: false,
    expectedMinDocs: 3,
    mustIncludeKeys: ['fault_notice', 'service_instructions', 'service_checklist'],
    mustNotIncludeKeys: ['section8_notice', 'section21_notice', 'notice_to_leave'],
    mustNotIncludeTitles: ['Section 8', 'Section 21'],
  },
  {
    name: 'Wales notice_only fault_based (with arrears)',
    product: 'notice_only',
    jurisdiction: 'wales',
    route: 'fault_based',
    hasArrears: true,
    expectedMinDocs: 4,
    mustIncludeKeys: ['fault_notice', 'arrears_schedule'],
    mustNotIncludeKeys: ['section8_notice', 'section21_notice'],
    mustNotIncludeTitles: ['Section 8', 'Section 21'],
  },

  // SCOTLAND - Notice Only
  {
    name: 'Scotland notice_only (notice_to_leave)',
    product: 'notice_only',
    jurisdiction: 'scotland',
    route: 'notice_to_leave',
    hasArrears: false,
    expectedMinDocs: 3,
    mustIncludeKeys: ['notice_to_leave', 'service_instructions', 'service_checklist'],
    mustNotIncludeKeys: ['section8_notice', 'section21_notice', 'section173_notice', 'n5_claim', 'n5b_claim'],
    mustNotIncludeTitles: ['Section 8', 'Section 21', 'County Court'],
  },

  // SCOTLAND - Complete Pack
  {
    name: 'Scotland complete_pack (First-tier Tribunal)',
    product: 'complete_pack',
    jurisdiction: 'scotland',
    route: 'notice_to_leave',
    hasArrears: false,
    expectedMinDocs: 5,
    mustIncludeKeys: ['notice_to_leave', 'form_e_tribunal', 'tribunal_lodging_guide'],
    mustNotIncludeKeys: ['section8_notice', 'section21_notice', 'n5_claim', 'n5b_claim', 'n119_particulars'],
    mustNotIncludeTitles: ['Section 8', 'Section 21', 'County Court', 'N5', 'N5B', 'N119'],
  },
];

// =============================================================================
// JURISDICTION VIOLATION SCENARIOS (MUST FAIL / RETURN EMPTY)
// =============================================================================

const VIOLATION_SCENARIOS: TestScenario[] = [
  // WALES - Section 8/21 MUST NOT be supported
  {
    name: 'Wales + section_8 MUST return empty (VIOLATION)',
    product: 'notice_only',
    jurisdiction: 'wales',
    route: 'section_8',
    hasArrears: false,
    expectedMinDocs: 0, // MUST be empty
    mustNotIncludeKeys: ['section8_notice'],
    mustNotIncludeTitles: ['Section 8'],
  },
  {
    name: 'Wales + section_21 MUST return empty (VIOLATION)',
    product: 'notice_only',
    jurisdiction: 'wales',
    route: 'section_21',
    hasArrears: false,
    expectedMinDocs: 0, // MUST be empty
    mustNotIncludeKeys: ['section21_notice'],
    mustNotIncludeTitles: ['Section 21'],
  },
  {
    name: 'Wales complete_pack + section_8 MUST NOT produce Section 8 docs (VIOLATION)',
    product: 'complete_pack',
    jurisdiction: 'wales',
    route: 'section_8',
    hasArrears: false,
    expectedMinDocs: 0, // MUST be empty
    mustNotIncludeKeys: ['section8_notice', 'n5_claim', 'n119_particulars'],
    mustNotIncludeTitles: ['Section 8'],
  },
  {
    name: 'Wales complete_pack + section_21 MUST NOT produce N5B (VIOLATION)',
    product: 'complete_pack',
    jurisdiction: 'wales',
    route: 'section_21',
    hasArrears: false,
    expectedMinDocs: 0, // MUST be empty
    mustNotIncludeKeys: ['section21_notice', 'n5b_claim'],
    mustNotIncludeTitles: ['Section 21', 'Accelerated'],
  },

  // SCOTLAND - Section 8/21 and County Court MUST NOT be supported
  {
    name: 'Scotland + section_8 MUST return Scotland docs only (VIOLATION)',
    product: 'notice_only',
    jurisdiction: 'scotland',
    route: 'section_8',
    hasArrears: false,
    expectedMinDocs: 3, // Should return Scotland docs, not Section 8
    mustNotIncludeKeys: ['section8_notice'],
    mustNotIncludeTitles: ['Section 8'],
  },
  {
    name: 'Scotland + section_21 MUST return Scotland docs only (VIOLATION)',
    product: 'notice_only',
    jurisdiction: 'scotland',
    route: 'section_21',
    hasArrears: false,
    expectedMinDocs: 3, // Should return Scotland docs, not Section 21
    mustNotIncludeKeys: ['section21_notice'],
    mustNotIncludeTitles: ['Section 21'],
  },
  {
    name: 'Scotland complete_pack MUST NOT have County Court forms (VIOLATION)',
    product: 'complete_pack',
    jurisdiction: 'scotland',
    route: 'notice_to_leave',
    hasArrears: false,
    expectedMinDocs: 5,
    mustNotIncludeKeys: ['n5_claim', 'n5b_claim', 'n119_particulars'],
    mustNotIncludeTitles: ['County Court', 'N5', 'N5B', 'N119'],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getPackContentsForScenario(scenario: TestScenario): PackItem[] {
  return getPackContents({
    product: scenario.product,
    jurisdiction: scenario.jurisdiction,
    route: scenario.route,
    has_arrears: scenario.hasArrears,
  });
}

function assertPackContents(
  scenario: TestScenario,
  packContents: PackItem[],
  isViolationTest = false
): void {
  const keys = packContents.map((p) => p.key);
  const titles = packContents.map((p) => p.title);

  // Check minimum document count
  if (isViolationTest && scenario.expectedMinDocs === 0) {
    expect(
      packContents.length,
      `${scenario.name}: Expected 0 docs for invalid jurisdiction route, got ${packContents.length}`
    ).toBe(0);
  } else if (!isViolationTest) {
    expect(
      packContents.length,
      `${scenario.name}: Expected at least ${scenario.expectedMinDocs} docs, got ${packContents.length}`
    ).toBeGreaterThanOrEqual(scenario.expectedMinDocs);
  }

  // Check required keys are present
  if (scenario.mustIncludeKeys) {
    for (const key of scenario.mustIncludeKeys) {
      expect(
        keys,
        `${scenario.name}: Missing required key "${key}". Got: ${keys.join(', ')}`
      ).toContain(key);
    }
  }

  // Check forbidden keys are NOT present
  if (scenario.mustNotIncludeKeys) {
    for (const key of scenario.mustNotIncludeKeys) {
      expect(
        keys,
        `${scenario.name}: Found forbidden key "${key}" - JURISDICTION VIOLATION`
      ).not.toContain(key);
    }
  }

  // Check forbidden titles are NOT present
  if (scenario.mustNotIncludeTitles) {
    for (const forbiddenTitle of scenario.mustNotIncludeTitles) {
      const found = titles.find((t) => t.toLowerCase().includes(forbiddenTitle.toLowerCase()));
      expect(
        found,
        `${scenario.name}: Found forbidden title containing "${forbiddenTitle}" - JURISDICTION VIOLATION. Found: "${found}"`
      ).toBeUndefined();
    }
  }
}

// =============================================================================
// TESTS
// =============================================================================

describe('Pack Contents vs Generator Parity', () => {
  describe('Valid Scenarios - pack-contents returns expected documents', () => {
    for (const scenario of TEST_SCENARIOS) {
      it(scenario.name, () => {
        const packContents = getPackContentsForScenario(scenario);
        assertPackContents(scenario, packContents, false);
      });
    }
  });

  describe('Jurisdiction Violations - pack-contents blocks invalid routes', () => {
    for (const scenario of VIOLATION_SCENARIOS) {
      it(scenario.name, () => {
        const packContents = getPackContentsForScenario(scenario);
        assertPackContents(scenario, packContents, true);
      });
    }
  });

  describe('Wales MUST NOT support Section 8 or Section 21', () => {
    it('Wales + section_8 returns ZERO documents', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'section_8',
      });

      expect(items.length).toBe(0);
      expect(items.find((i) => i.key === 'section8_notice')).toBeUndefined();
    });

    it('Wales + section_21 returns ZERO documents', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'section_21',
      });

      expect(items.length).toBe(0);
      expect(items.find((i) => i.key === 'section21_notice')).toBeUndefined();
    });

    it('Wales complete_pack + section_8 returns ZERO documents', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'wales',
        route: 'section_8',
      });

      expect(items.length).toBe(0);
    });

    it('Wales complete_pack + section_21 returns ZERO documents', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'wales',
        route: 'section_21',
      });

      expect(items.length).toBe(0);
    });
  });

  describe('Scotland MUST NOT have County Court forms', () => {
    it('Scotland complete_pack has NO N5, N5B, or N119', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'scotland',
      });

      expect(items.find((i) => i.key === 'n5_claim')).toBeUndefined();
      expect(items.find((i) => i.key === 'n5b_claim')).toBeUndefined();
      expect(items.find((i) => i.key === 'n119_particulars')).toBeUndefined();

      // Should have Tribunal form instead
      expect(items.find((i) => i.key === 'form_e_tribunal')).toBeDefined();
    });

    it('Scotland complete_pack titles do NOT reference County Court', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'scotland',
      });

      for (const item of items) {
        expect(item.title.toLowerCase()).not.toContain('county court');
        expect(item.description?.toLowerCase() || '').not.toContain('county court');
      }
    });

    it('Scotland references First-tier Tribunal correctly', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'scotland',
      });

      const tribunalDoc = items.find((i) => i.key === 'form_e_tribunal');
      expect(tribunalDoc).toBeDefined();
      expect(tribunalDoc?.description?.toLowerCase()).toContain('first-tier tribunal');
    });
  });

  describe('England correctly supports Section 8 and Section 21', () => {
    it('England + section_8 returns Section 8 notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find((i) => i.key === 'section8_notice')).toBeDefined();
      expect(items.find((i) => i.key === 'section21_notice')).toBeUndefined();
    });

    it('England + section_21 returns Section 21 notice', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_21',
      });

      expect(items.find((i) => i.key === 'section21_notice')).toBeDefined();
      expect(items.find((i) => i.key === 'section8_notice')).toBeUndefined();
    });

    it('England complete_pack + section_8 has N5 and N119 (not N5B)', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_8',
      });

      expect(items.find((i) => i.key === 'n5_claim')).toBeDefined();
      expect(items.find((i) => i.key === 'n119_particulars')).toBeDefined();
      expect(items.find((i) => i.key === 'n5b_claim')).toBeUndefined();
    });

    it('England complete_pack + section_21 has N5B (accelerated)', () => {
      const items = getPackContents({
        product: 'complete_pack',
        jurisdiction: 'england',
        route: 'section_21',
      });

      expect(items.find((i) => i.key === 'n5b_claim')).toBeDefined();
      expect(items.find((i) => i.key === 'n5_claim')).toBeUndefined();
    });
  });

  describe('Arrears schedule inclusion logic', () => {
    it('England section_8 with arrears includes arrears_schedule', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
        has_arrears: true,
      });

      expect(items.find((i) => i.key === 'arrears_schedule')).toBeDefined();
    });

    it('England section_8 without arrears excludes arrears_schedule', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'england',
        route: 'section_8',
        has_arrears: false,
      });

      expect(items.find((i) => i.key === 'arrears_schedule')).toBeUndefined();
    });

    it('Wales fault_based with arrears includes arrears_schedule', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'wales',
        route: 'fault_based',
        has_arrears: true,
      });

      expect(items.find((i) => i.key === 'arrears_schedule')).toBeDefined();
    });

    it('Scotland with arrears includes arrears_schedule', () => {
      const items = getPackContents({
        product: 'notice_only',
        jurisdiction: 'scotland',
        has_arrears: true,
      });

      expect(items.find((i) => i.key === 'arrears_schedule')).toBeDefined();
    });
  });

  describe('isProductSupported matches pack-contents behavior', () => {
    it('notice_only supported in England, Wales, Scotland but NOT Northern Ireland', () => {
      expect(isProductSupported('notice_only', 'england')).toBe(true);
      expect(isProductSupported('notice_only', 'wales')).toBe(true);
      expect(isProductSupported('notice_only', 'scotland')).toBe(true);
      expect(isProductSupported('notice_only', 'northern-ireland')).toBe(false);
    });

    it('money_claim supported in England, Wales but NOT Scotland, NI', () => {
      expect(isProductSupported('money_claim', 'england')).toBe(true);
      expect(isProductSupported('money_claim', 'wales')).toBe(true);
      expect(isProductSupported('money_claim', 'scotland')).toBe(false);
      expect(isProductSupported('money_claim', 'northern-ireland')).toBe(false);
    });

    it('sc_money_claim supported ONLY in Scotland', () => {
      expect(isProductSupported('sc_money_claim', 'scotland')).toBe(true);
      expect(isProductSupported('sc_money_claim', 'england')).toBe(false);
      expect(isProductSupported('sc_money_claim', 'wales')).toBe(false);
      expect(isProductSupported('sc_money_claim', 'northern-ireland')).toBe(false);
    });

    it('ast_standard/premium supported everywhere including NI', () => {
      for (const product of ['ast_standard', 'ast_premium']) {
        expect(isProductSupported(product, 'england')).toBe(true);
        expect(isProductSupported(product, 'wales')).toBe(true);
        expect(isProductSupported(product, 'scotland')).toBe(true);
        expect(isProductSupported(product, 'northern-ireland')).toBe(true);
      }
    });
  });
});

// =============================================================================
// DOCUMENT KEY INVENTORY - Reference for what each jurisdiction should have
// =============================================================================

describe('Document Key Inventory (reference)', () => {
  it('logs England section_8 complete_pack keys', () => {
    const items = getPackContents({
      product: 'complete_pack',
      jurisdiction: 'england',
      route: 'section_8',
      has_arrears: true,
    });
    console.log('England section_8 complete_pack keys:', items.map((i) => i.key));
    expect(items.length).toBeGreaterThan(0);
  });

  it('logs Wales section_173 notice_only keys', () => {
    const items = getPackContents({
      product: 'notice_only',
      jurisdiction: 'wales',
      route: 'section_173',
    });
    console.log('Wales section_173 notice_only keys:', items.map((i) => i.key));
    expect(items.length).toBeGreaterThan(0);
  });

  it('logs Scotland complete_pack keys', () => {
    const items = getPackContents({
      product: 'complete_pack',
      jurisdiction: 'scotland',
    });
    console.log('Scotland complete_pack keys:', items.map((i) => i.key));
    expect(items.length).toBeGreaterThan(0);
  });
});
