/**
 * Tenancy Variant Validator Tests
 *
 * Comprehensive tests to verify the "2-variants only" rule:
 * - Standard: Base tenancy agreement ONLY, NO HMO clauses
 * - Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * Tests verify:
 * A) Configuration correctness (exactly 2 variants per jurisdiction)
 * B) Template content compliance (HMO markers present/absent as required)
 * C) pack-contents alignment (correct document counts)
 * D) ast-generator alignment (correct template paths)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

import {
  TENANCY_VARIANT_CONFIGS,
  TenancyJurisdiction,
  TenancyTier,
  validateVariantConfig,
  validateJurisdiction,
  validateAllJurisdictions,
  templateContainsHMOMarkers,
  templateContainsForbiddenHMO,
  HMO_REQUIRED_MARKERS,
  HMO_FORBIDDEN_IN_STANDARD,
  getVariantConfig,
  getSupportedJurisdictions,
  assertTenancyVariantsInvariant,
  validatePackContentsAlignment,
  EXPECTED_PACK_CONTENTS,
  formatAuditTable,
  _resetRuntimeCheck,
} from '../tenancy-variant-validator';

import { getPackContents } from '../pack-contents';

// ============================================================================
// SETUP
// ============================================================================

const CONFIG_DIR = path.join(process.cwd(), 'config/jurisdictions');

/**
 * Read template file content
 */
function readTemplate(templatePath: string): string | null {
  try {
    const fullPath = path.join(CONFIG_DIR, templatePath);
    return fs.readFileSync(fullPath, 'utf-8');
  } catch {
    return null;
  }
}

// ============================================================================
// TEST SUITE A: CONFIGURATION CORRECTNESS
// ============================================================================

describe('A. Configuration Correctness', () => {
  const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

  describe('Exactly 2 variants per jurisdiction', () => {
    it.each(jurisdictions)('%s has exactly 2 variants (standard + premium)', (jurisdiction) => {
      const config = TENANCY_VARIANT_CONFIGS[jurisdiction];
      expect(config).toBeDefined();
      expect(config.standard).toBeDefined();
      expect(config.premium).toBeDefined();

      // Verify tiers are correctly labeled
      expect(config.standard.tier).toBe('standard');
      expect(config.premium.tier).toBe('premium');
    });
  });

  describe('Variant configurations are complete', () => {
    it.each(jurisdictions)('%s standard variant has all required fields', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'standard');
      expect(config).not.toBeNull();
      expect(config!.jurisdiction).toBe(jurisdiction);
      expect(config!.tier).toBe('standard');
      expect(config!.templatePath).toBeTruthy();
      expect(config!.documentKey).toBeTruthy();
      expect(config!.documentTitle).toBeTruthy();
      expect(config!.mustHaveHMO).toBe(false);
      expect(config!.mustNotHaveHMO).toBe(true);
    });

    it.each(jurisdictions)('%s premium variant has all required fields', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'premium');
      expect(config).not.toBeNull();
      expect(config!.jurisdiction).toBe(jurisdiction);
      expect(config!.tier).toBe('premium');
      expect(config!.templatePath).toBeTruthy();
      expect(config!.documentKey).toBeTruthy();
      expect(config!.documentTitle).toBeTruthy();
      expect(config!.mustHaveHMO).toBe(true);
      expect(config!.mustNotHaveHMO).toBe(false);
    });
  });

  describe('Template files exist', () => {
    it.each(jurisdictions)('%s standard template file exists', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'standard');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();
      expect(content!.length).toBeGreaterThan(100);
    });

    it.each(jurisdictions)('%s premium (HMO) template file exists', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'premium');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();
      expect(content!.length).toBeGreaterThan(100);
    });
  });
});

// ============================================================================
// TEST SUITE B: TEMPLATE CONTENT COMPLIANCE
// ============================================================================

describe('B. Template Content Compliance', () => {
  const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

  describe('Standard templates do NOT contain HMO clauses', () => {
    it.each(jurisdictions)('%s standard template has NO forbidden HMO markers', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'standard');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();

      const result = templateContainsForbiddenHMO(content!);
      expect(result.found).toBe(false);
      if (result.found) {
        // Provide detailed error message
        throw new Error(
          `${jurisdiction} standard template contains forbidden HMO markers: ${result.markers.join(', ')}`
        );
      }
    });
  });

  describe('Premium templates MUST contain HMO clauses', () => {
    it.each(jurisdictions)('%s premium template has required HMO markers', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'premium');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();

      const result = templateContainsHMOMarkers(content!);
      expect(result.found).toBe(true);
      expect(result.markers.length).toBeGreaterThanOrEqual(3);

      // Must have "Joint and Several Liability" for HMO
      expect(content!.toLowerCase()).toContain('joint and several liability');
    });

    it.each(jurisdictions)('%s premium template has HMO section header', (jurisdiction) => {
      const config = getVariantConfig(jurisdiction, 'premium');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();

      // Should have some form of HMO section header
      const hasHMOSection =
        content!.includes('## HMO') ||
        content!.includes('HMO &') ||
        content!.includes('HMO CLAUSES') ||
        content!.includes('HMO Provisions');
      expect(hasHMOSection).toBe(true);
    });
  });
});

// ============================================================================
// TEST SUITE C: PACK-CONTENTS ALIGNMENT
// ============================================================================

describe('C. Pack-Contents Alignment', () => {
  describe('Standard product returns exactly 1 document', () => {
    it('England ast_standard returns 1 document: ast_agreement', () => {
      const items = getPackContents({ product: 'ast_standard', jurisdiction: 'england' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('ast_agreement');
      expect(items[0].category).toBe('Tenancy agreement');
    });

    it('Wales ast_standard returns 1 document: soc_agreement', () => {
      const items = getPackContents({ product: 'ast_standard', jurisdiction: 'wales' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('soc_agreement');
      expect(items[0].category).toBe('Tenancy agreement');
    });

    it('Scotland ast_standard returns 1 document: prt_agreement', () => {
      const items = getPackContents({ product: 'ast_standard', jurisdiction: 'scotland' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('prt_agreement');
      expect(items[0].category).toBe('Tenancy agreement');
    });

    it('Northern Ireland ast_standard returns 1 document: private_tenancy_agreement', () => {
      const items = getPackContents({ product: 'ast_standard', jurisdiction: 'northern-ireland' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('private_tenancy_agreement');
      expect(items[0].category).toBe('Tenancy agreement');
    });
  });

  describe('Premium product returns exactly 1 HMO document', () => {
    it('England ast_premium returns 1 HMO document: ast_agreement_hmo', () => {
      const items = getPackContents({ product: 'ast_premium', jurisdiction: 'england' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('ast_agreement_hmo');
      expect(items[0].category).toBe('Tenancy agreement');
      expect(items[0].title.toLowerCase()).toContain('hmo');
    });

    it('Wales ast_premium returns 1 HMO document: soc_agreement_hmo', () => {
      const items = getPackContents({ product: 'ast_premium', jurisdiction: 'wales' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('soc_agreement_hmo');
      expect(items[0].category).toBe('Tenancy agreement');
      expect(items[0].title.toLowerCase()).toContain('hmo');
    });

    it('Scotland ast_premium returns 1 HMO document: prt_agreement_hmo', () => {
      const items = getPackContents({ product: 'ast_premium', jurisdiction: 'scotland' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('prt_agreement_hmo');
      expect(items[0].category).toBe('Tenancy agreement');
      expect(items[0].title.toLowerCase()).toContain('hmo');
    });

    it('Northern Ireland ast_premium returns 1 HMO document: private_tenancy_agreement_hmo', () => {
      const items = getPackContents({ product: 'ast_premium', jurisdiction: 'northern-ireland' });
      expect(items.length).toBe(1);
      expect(items[0].key).toBe('private_tenancy_agreement_hmo');
      expect(items[0].category).toBe('Tenancy agreement');
      expect(items[0].title.toLowerCase()).toContain('hmo');
    });
  });

  describe('No supporting documents in base product', () => {
    const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

    it.each(jurisdictions)('%s standard has no guides, checklists, or annexes', (jurisdiction) => {
      const items = getPackContents({ product: 'ast_standard', jurisdiction });

      // Should only have 1 item (the agreement itself)
      expect(items.length).toBe(1);

      // Should not have any guidance or checklist items
      const hasSupporting = items.some(
        (item) =>
          item.category === 'Guidance' ||
          item.category === 'Checklists' ||
          item.key.includes('guide') ||
          item.key.includes('checklist') ||
          item.key.includes('schedule')
      );
      expect(hasSupporting).toBe(false);
    });

    it.each(jurisdictions)('%s premium has no supporting documents (HMO agreement only)', (jurisdiction) => {
      const items = getPackContents({ product: 'ast_premium', jurisdiction });

      // Should only have 1 item (the HMO agreement itself)
      expect(items.length).toBe(1);

      // Should not have any guidance or checklist items
      const hasSupporting = items.some(
        (item) =>
          item.category === 'Guidance' ||
          item.category === 'Checklists'
      );
      expect(hasSupporting).toBe(false);
    });
  });
});

// ============================================================================
// TEST SUITE D: FULL VALIDATOR INTEGRATION
// ============================================================================

describe('D. Full Validator Integration', () => {
  it('validateAllJurisdictions passes with no errors', () => {
    const result = validateAllJurisdictions(readTemplate);
    if (!result.valid) {
      console.error('Validation errors:', result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validateJurisdiction passes for each jurisdiction', () => {
    const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

    for (const jurisdiction of jurisdictions) {
      const result = validateJurisdiction(jurisdiction, readTemplate);
      if (!result.valid) {
        console.error(`${jurisdiction} validation errors:`, result.errors);
      }
      expect(result.valid).toBe(true);
    }
  });
});

// ============================================================================
// TEST SUITE E: DOCUMENT KEY CONSISTENCY
// ============================================================================

describe('E. Document Key Consistency', () => {
  it('Standard document keys do NOT contain "hmo"', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const config = getVariantConfig(jurisdiction, 'standard');
      expect(config!.documentKey.toLowerCase()).not.toContain('hmo');
    }
  });

  it('Premium document keys contain "hmo"', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const config = getVariantConfig(jurisdiction, 'premium');
      expect(config!.documentKey.toLowerCase()).toContain('hmo');
    }
  });

  it('Premium document titles contain "HMO"', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const config = getVariantConfig(jurisdiction, 'premium');
      expect(config!.documentTitle.toLowerCase()).toContain('hmo');
    }
  });
});

// ============================================================================
// TEST SUITE F: HELPER FUNCTION TESTS
// ============================================================================

describe('F. Helper Function Tests', () => {
  describe('templateContainsHMOMarkers', () => {
    it('detects HMO markers in content', () => {
      const content = 'This is a House in Multiple Occupation (HMO) with shared facilities';
      const result = templateContainsHMOMarkers(content);
      expect(result.found).toBe(true);
      expect(result.markers.length).toBeGreaterThan(0);
    });

    it('returns false for content without HMO markers', () => {
      const content = 'This is a standard tenancy agreement for a single family home';
      const result = templateContainsHMOMarkers(content);
      expect(result.found).toBe(false);
    });
  });

  describe('templateContainsForbiddenHMO', () => {
    it('detects forbidden HMO markers', () => {
      const content = '## HMO CLAUSES\nThis section contains HMO-specific terms';
      const result = templateContainsForbiddenHMO(content);
      expect(result.found).toBe(true);
    });

    it('ignores HMO markers in comments', () => {
      const content = '{{!-- HMO CLAUSES removed --}}\nThis is a standard agreement';
      const result = templateContainsForbiddenHMO(content);
      expect(result.found).toBe(false);
    });
  });

  describe('getSupportedJurisdictions', () => {
    it('returns all 4 UK jurisdictions', () => {
      const jurisdictions = getSupportedJurisdictions();
      expect(jurisdictions).toHaveLength(4);
      expect(jurisdictions).toContain('england');
      expect(jurisdictions).toContain('wales');
      expect(jurisdictions).toContain('scotland');
      expect(jurisdictions).toContain('northern-ireland');
    });
  });
});

// ============================================================================
// TEST SUITE G: INVARIANT ASSERTION
// ============================================================================

describe('G. Invariant Assertion (assertTenancyVariantsInvariant)', () => {
  it('passes when all invariants are satisfied', () => {
    const result = assertTenancyVariantsInvariant({
      getTemplateContent: readTemplate,
      getPackContents: (args) => getPackContents(args as any),
      throwOnFailure: false,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.auditTable).toHaveLength(4);
  });

  it('audit table has correct structure', () => {
    const result = assertTenancyVariantsInvariant({
      getTemplateContent: readTemplate,
      throwOnFailure: false,
    });

    expect(result.auditTable).toHaveLength(4);

    for (const row of result.auditTable) {
      expect(row.jurisdiction).toBeDefined();
      expect(row.standardTemplate).toBeDefined();
      expect(row.premiumTemplate).toBeDefined();
      expect(row.standardDocKey).toBeDefined();
      expect(row.premiumDocKey).toBeDefined();
      expect(typeof row.standardHMOMarkers).toBe('number');
      expect(typeof row.premiumHMOMarkers).toBe('number');
      expect(['PASS', 'FAIL']).toContain(row.status);
    }
  });

  it('all jurisdictions should PASS in audit table', () => {
    const result = assertTenancyVariantsInvariant({
      getTemplateContent: readTemplate,
      throwOnFailure: false,
    });

    for (const row of result.auditTable) {
      expect(row.status).toBe('PASS');
    }
  });

  it('detects missing template file', () => {
    const badTemplateGetter = (templatePath: string) => {
      if (templatePath.includes('england')) return null;
      return readTemplate(templatePath);
    };

    const result = assertTenancyVariantsInvariant({
      getTemplateContent: badTemplateGetter,
      throwOnFailure: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Template not found'))).toBe(true);
  });

  it('detects HMO markers in standard template', () => {
    const badTemplateGetter = (templatePath: string) => {
      const content = readTemplate(templatePath);
      if (content && templatePath.includes('standard')) {
        // Inject forbidden HMO content into standard template
        return content + '\n## HMO CLAUSES\nThis should not be here';
      }
      return content;
    };

    const result = assertTenancyVariantsInvariant({
      getTemplateContent: badTemplateGetter,
      throwOnFailure: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Standard template contains HMO markers'))).toBe(true);
  });

  it('throws when throwOnFailure is true and validation fails', () => {
    const badTemplateGetter = () => null; // All templates missing

    expect(() => {
      assertTenancyVariantsInvariant({
        getTemplateContent: badTemplateGetter,
        throwOnFailure: true,
      });
    }).toThrow('Tenancy Variant Invariants FAILED');
  });
});

// ============================================================================
// TEST SUITE H: PACK-CONTENTS ALIGNMENT
// ============================================================================

describe('H. Pack-Contents Alignment', () => {
  it('validatePackContentsAlignment passes with correct pack-contents', () => {
    const result = validatePackContentsAlignment(
      (args) => getPackContents(args as any)
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('EXPECTED_PACK_CONTENTS matches TENANCY_VARIANT_CONFIGS', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const expected = EXPECTED_PACK_CONTENTS[jurisdiction];
      const config = TENANCY_VARIANT_CONFIGS[jurisdiction];

      expect(expected.standard.key).toBe(config.standard.documentKey);
      expect(expected.premium.key).toBe(config.premium.documentKey);
    }
  });

  it('detects pack-contents returning wrong document count', () => {
    const badPackContents = (args: { product: string; jurisdiction: string }) => {
      if (args.jurisdiction === 'england') {
        // Return 2 documents instead of 1
        return [
          { key: 'ast_agreement', title: 'Agreement' },
          { key: 'extra_doc', title: 'Extra Document' },
        ];
      }
      return getPackContents(args as any);
    };

    const result = validatePackContentsAlignment(badPackContents);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('returns 2 documents, expected exactly 1'))).toBe(true);
  });

  it('detects pack-contents returning wrong document key', () => {
    const badPackContents = (args: { product: string; jurisdiction: string }) => {
      if (args.jurisdiction === 'wales' && args.product === 'ast_standard') {
        return [{ key: 'wrong_key', title: 'Wrong Document' }];
      }
      return getPackContents(args as any);
    };

    const result = validatePackContentsAlignment(badPackContents);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('key mismatch'))).toBe(true);
  });
});

// ============================================================================
// TEST SUITE I: REGRESSION PREVENTION (3rd variant detection)
// ============================================================================

describe('I. Regression Prevention', () => {
  it('TENANCY_VARIANT_CONFIGS has exactly 4 jurisdictions', () => {
    const keys = Object.keys(TENANCY_VARIANT_CONFIGS);
    expect(keys).toHaveLength(4);
  });

  it('each jurisdiction has exactly 2 variants (no 3rd variant possible)', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const config = TENANCY_VARIANT_CONFIGS[jurisdiction];

      // Should only have 'standard' and 'premium' keys
      const variantKeys = Object.keys(config).filter(k => k !== 'jurisdiction');
      expect(variantKeys).toHaveLength(2);
      expect(variantKeys).toContain('standard');
      expect(variantKeys).toContain('premium');

      // No other tier should exist
      expect((config as any).basic).toBeUndefined();
      expect((config as any).enterprise).toBeUndefined();
      expect((config as any).professional).toBeUndefined();
    }
  });

  it('standard templates have ZERO forbidden HMO markers (strict check)', () => {
    const jurisdictions = getSupportedJurisdictions();

    for (const jurisdiction of jurisdictions) {
      const config = getVariantConfig(jurisdiction, 'standard');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();

      const result = templateContainsForbiddenHMO(content!);

      // This must be ZERO - any HMO markers in standard is a bug
      expect(result.markers.length).toBe(0);
    }
  });

  it('premium templates have AT LEAST 3 HMO markers (minimum threshold)', () => {
    const jurisdictions = getSupportedJurisdictions();
    const MINIMUM_HMO_MARKERS = 3;

    for (const jurisdiction of jurisdictions) {
      const config = getVariantConfig(jurisdiction, 'premium');
      const content = readTemplate(config!.templatePath);
      expect(content).not.toBeNull();

      const result = templateContainsHMOMarkers(content!);

      expect(result.markers.length).toBeGreaterThanOrEqual(MINIMUM_HMO_MARKERS);
    }
  });
});

// ============================================================================
// TEST SUITE J: AUDIT TABLE FORMATTING
// ============================================================================

describe('J. Audit Table Formatting', () => {
  it('formatAuditTable produces readable output', () => {
    const result = assertTenancyVariantsInvariant({
      getTemplateContent: readTemplate,
      throwOnFailure: false,
    });

    const table = formatAuditTable(result.auditTable);

    expect(table).toContain('TENANCY AGREEMENT VARIANTS AUDIT TABLE');
    expect(table).toContain('england');
    expect(table).toContain('wales');
    expect(table).toContain('scotland');
    expect(table).toContain('northern-ireland');
    expect(table).toContain('PASS');
    expect(table).toContain('Document Keys:');
  });
});
