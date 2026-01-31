/**
 * AST Generator Jurisdiction Parity Tests
 *
 * CRITICAL: These tests verify that the AST generator produces jurisdiction-specific
 * documents with correct document_type values matching pack-contents.ts
 *
 * Jurisdiction Matrix:
 * | Jurisdiction     | Agreement Type              | document_type             |
 * |------------------|-----------------------------|-----------------------------|
 * | England          | Assured Shorthold Tenancy   | ast_agreement               |
 * | Wales            | Standard Occupation Contract | soc_agreement               |
 * | Scotland         | Private Residential Tenancy | prt_agreement               |
 * | Northern Ireland | Private Tenancy Agreement   | private_tenancy_agreement   |
 *
 * MUST FAIL if:
 * - Scotland/NI AST uses England wording or template paths
 * - document_type values don't match pack-contents expectations
 * - Wrong legal framework is referenced
 *
 * HOW TO RUN:
 * - npm test -- --run tests/integration/ast-jurisdiction-parity.test.ts
 */

import { describe, it, expect } from 'vitest';
import { getPackContents } from '../../src/lib/products';
import {
  getJurisdictionConfig,
  type TenancyJurisdiction,
} from '../../src/lib/documents/ast-generator';

// =============================================================================
// JURISDICTION CONFIG TESTS
// =============================================================================

describe('AST Jurisdiction Configuration', () => {
  describe('Document type matches pack-contents', () => {
    it('England ast_standard uses ast_agreement document_type', () => {
      const config = getJurisdictionConfig('england');
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'england',
      });

      expect(config.agreementDocumentType).toBe('ast_agreement');
      expect(packContents.find(p => p.key === 'ast_agreement')).toBeDefined();
    });

    it('Wales ast_standard uses soc_agreement document_type', () => {
      const config = getJurisdictionConfig('wales');
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'wales',
      });

      expect(config.agreementDocumentType).toBe('soc_agreement');
      expect(packContents.find(p => p.key === 'soc_agreement')).toBeDefined();
    });

    it('Scotland ast_standard uses prt_agreement document_type', () => {
      const config = getJurisdictionConfig('scotland');
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'scotland',
      });

      expect(config.agreementDocumentType).toBe('prt_agreement');
      expect(packContents.find(p => p.key === 'prt_agreement')).toBeDefined();
    });

    it('Northern Ireland ast_standard uses private_tenancy_agreement document_type', () => {
      const config = getJurisdictionConfig('northern-ireland');
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'northern-ireland',
      });

      expect(config.agreementDocumentType).toBe('private_tenancy_agreement');
      expect(packContents.find(p => p.key === 'private_tenancy_agreement')).toBeDefined();
    });
  });

  describe('Legal framework references', () => {
    it('England references Housing Act 1988', () => {
      const config = getJurisdictionConfig('england');
      expect(config.legalFramework).toContain('Housing Act 1988');
    });

    it('Wales references Renting Homes (Wales) Act 2016', () => {
      const config = getJurisdictionConfig('wales');
      expect(config.legalFramework).toContain('Renting Homes (Wales) Act 2016');
    });

    it('Scotland references Private Housing (Tenancies) (Scotland) Act 2016', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.legalFramework).toContain('Scotland');
      expect(config.legalFramework).toContain('2016');
    });

    it('Northern Ireland references Private Tenancies Act (Northern Ireland) 2022', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.legalFramework).toContain('Northern Ireland');
      expect(config.legalFramework).toContain('2022');
    });
  });

  describe('Template paths are jurisdiction-specific', () => {
    it('England uses uk/england/templates paths', () => {
      const config = getJurisdictionConfig('england');
      expect(config.templatePaths.standard).toContain('uk/england/templates');
      expect(config.templatePaths.standard).toContain('ast');
    });

    it('Wales uses uk/wales/templates paths for agreement', () => {
      const config = getJurisdictionConfig('wales');
      expect(config.templatePaths.standard).toContain('uk/wales/templates');
      expect(config.templatePaths.standard).toContain('occupation_contract');
    });

    it('Scotland uses uk/scotland/templates paths', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.templatePaths.standard).toContain('uk/scotland/templates');
      expect(config.templatePaths.standard).toContain('prt');
    });

    it('Northern Ireland uses uk/northern-ireland/templates paths', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.templatePaths.standard).toContain('uk/northern-ireland/templates');
      expect(config.templatePaths.standard).toContain('private_tenancy');
    });
  });

  describe('Agreement titles are jurisdiction-specific', () => {
    it('England uses "Assured Shorthold Tenancy Agreement"', () => {
      const config = getJurisdictionConfig('england');
      expect(config.agreementTitle).toBe('Assured Shorthold Tenancy Agreement');
    });

    it('Wales uses "Standard Occupation Contract"', () => {
      const config = getJurisdictionConfig('wales');
      expect(config.agreementTitle).toBe('Standard Occupation Contract');
    });

    it('Scotland uses "Private Residential Tenancy Agreement"', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.agreementTitle).toBe('Private Residential Tenancy Agreement');
    });

    it('Northern Ireland uses "Private Tenancy Agreement"', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.agreementTitle).toBe('Private Tenancy Agreement');
    });
  });

  describe('Model clauses titles are jurisdiction-specific', () => {
    it('England uses "Government Model Clauses"', () => {
      const config = getJurisdictionConfig('england');
      expect(config.modelClausesTitle).toBe('Government Model Clauses');
    });

    it('Wales uses "Government Model Clauses (Wales)"', () => {
      const config = getJurisdictionConfig('wales');
      expect(config.modelClausesTitle).toContain('Wales');
    });

    it('Scotland uses "Model Clauses (Scotland)"', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.modelClausesTitle).toContain('Scotland');
    });

    it('Northern Ireland uses "Model Clauses (Northern Ireland)"', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.modelClausesTitle).toContain('Northern Ireland');
    });
  });
});

// =============================================================================
// PACK-CONTENTS PARITY TESTS
// =============================================================================

describe('Pack-Contents AST Document Keys', () => {
  describe('Each jurisdiction has correct agreement key', () => {
    const standardJurisdictions: Array<{
      jurisdiction: string;
      expectedAgreementKey: string;
    }> = [
      { jurisdiction: 'england', expectedAgreementKey: 'ast_agreement' },
      { jurisdiction: 'wales', expectedAgreementKey: 'soc_agreement' },
      { jurisdiction: 'scotland', expectedAgreementKey: 'prt_agreement' },
      { jurisdiction: 'northern-ireland', expectedAgreementKey: 'private_tenancy_agreement' },
    ];

    const premiumJurisdictions: Array<{
      jurisdiction: string;
      expectedAgreementKey: string;
    }> = [
      { jurisdiction: 'england', expectedAgreementKey: 'ast_agreement_hmo' },
      { jurisdiction: 'wales', expectedAgreementKey: 'soc_agreement_hmo' },
      { jurisdiction: 'scotland', expectedAgreementKey: 'prt_agreement_hmo' },
      { jurisdiction: 'northern-ireland', expectedAgreementKey: 'private_tenancy_agreement_hmo' },
    ];

    for (const { jurisdiction, expectedAgreementKey } of standardJurisdictions) {
      it(`${jurisdiction} ast_standard contains ${expectedAgreementKey}`, () => {
        const packContents = getPackContents({
          product: 'ast_standard',
          jurisdiction,
        });

        const agreementDoc = packContents.find(p => p.key === expectedAgreementKey);
        expect(agreementDoc).toBeDefined();
        expect(agreementDoc?.category).toBe('Tenancy agreement');
      });
    }

    for (const { jurisdiction, expectedAgreementKey } of premiumJurisdictions) {
      it(`${jurisdiction} ast_premium contains HMO agreement ${expectedAgreementKey}`, () => {
        const packContents = getPackContents({
          product: 'ast_premium',
          jurisdiction,
        });

        const agreementDoc = packContents.find(p => p.key === expectedAgreementKey);
        expect(agreementDoc).toBeDefined();
      });
    }
  });

  describe('Agreement-only design: packs contain ONLY the agreement document', () => {
    // Tenancy packs are agreement-only: no supporting documents like terms_schedule,
    // model_clauses, or inventory_template. This keeps the product simple and focused.
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];

    for (const jurisdiction of jurisdictions) {
      it(`${jurisdiction} ast_standard contains exactly 1 document (agreement only)`, () => {
        const packContents = getPackContents({
          product: 'ast_standard',
          jurisdiction,
        });

        expect(packContents.length).toBe(1);
        expect(packContents[0].category).toBe('Tenancy agreement');
      });
    }
  });

  describe('Premium documents are agreement-only (single document)', () => {
    const jurisdictions = ['england', 'wales', 'scotland', 'northern-ireland'];
    // Premium tenancy agreements contain ONLY the HMO agreement document
    // No supporting docs (key_schedule, maintenance_guide, etc.) per agreement-only design
    const premiumHMOKeys = {
      'england': 'ast_agreement_hmo',
      'wales': 'soc_agreement_hmo',
      'scotland': 'prt_agreement_hmo',
      'northern-ireland': 'private_tenancy_agreement_hmo',
    };

    for (const jurisdiction of jurisdictions) {
      it(`${jurisdiction} ast_premium contains exactly 1 document (HMO agreement)`, () => {
        const packContents = getPackContents({
          product: 'ast_premium',
          jurisdiction,
        });

        // Should have exactly 1 document
        expect(packContents.length).toBe(1);
        // Should be the HMO agreement
        expect(packContents[0].key).toBe(premiumHMOKeys[jurisdiction as keyof typeof premiumHMOKeys]);
      });
    }
  });
});

// =============================================================================
// NEGATIVE TESTS - JURISDICTION ISOLATION
// =============================================================================

describe('Jurisdiction Isolation (Negative Tests)', () => {
  describe('Scotland MUST NOT use England terminology', () => {
    it('Scotland config does NOT use "Assured Shorthold Tenancy"', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.agreementTitle).not.toContain('Assured Shorthold');
      expect(config.agreementTitle).not.toContain('AST');
    });

    it('Scotland config does NOT reference Housing Act 1988', () => {
      const config = getJurisdictionConfig('scotland');
      expect(config.legalFramework).not.toContain('Housing Act 1988');
    });

    it('Scotland pack-contents does NOT have ast_agreement key', () => {
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'scotland',
      });

      expect(packContents.find(p => p.key === 'ast_agreement')).toBeUndefined();
    });
  });

  describe('Northern Ireland MUST NOT use England terminology', () => {
    it('NI config does NOT use "Assured Shorthold Tenancy"', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.agreementTitle).not.toContain('Assured Shorthold');
      expect(config.agreementTitle).not.toContain('AST');
    });

    it('NI config does NOT reference Housing Act 1988', () => {
      const config = getJurisdictionConfig('northern-ireland');
      expect(config.legalFramework).not.toContain('Housing Act 1988');
    });

    it('NI pack-contents does NOT have ast_agreement key', () => {
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'northern-ireland',
      });

      expect(packContents.find(p => p.key === 'ast_agreement')).toBeUndefined();
    });
  });

  describe('Wales MUST use Renting Homes Act terminology', () => {
    it('Wales config uses "Standard Occupation Contract" not "AST"', () => {
      const config = getJurisdictionConfig('wales');
      expect(config.agreementTitle).toBe('Standard Occupation Contract');
      expect(config.agreementTitle).not.toContain('Assured Shorthold');
    });

    it('Wales pack-contents uses soc_agreement not ast_agreement', () => {
      const packContents = getPackContents({
        product: 'ast_standard',
        jurisdiction: 'wales',
      });

      expect(packContents.find(p => p.key === 'soc_agreement')).toBeDefined();
      expect(packContents.find(p => p.key === 'ast_agreement')).toBeUndefined();
    });
  });
});

// =============================================================================
// TEMPLATE PATH VALIDATION
// =============================================================================

describe('Template Path Validation', () => {
  it('All jurisdiction configs have required template paths', () => {
    const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
    const requiredPaths = [
      'standard',
      'premium',
      'modelClauses',
      'termsSchedule',
      'inventory',
      'keySchedule',
      'maintenanceGuide',
      'checkoutProcedure',
    ];

    for (const jurisdiction of jurisdictions) {
      const config = getJurisdictionConfig(jurisdiction);
      for (const path of requiredPaths) {
        expect(
          config.templatePaths[path as keyof typeof config.templatePaths],
          `${jurisdiction} missing template path: ${path}`
        ).toBeDefined();
        expect(
          config.templatePaths[path as keyof typeof config.templatePaths],
          `${jurisdiction} template path ${path} should be non-empty`
        ).not.toBe('');
      }
    }
  });

  it('Template paths end with .hbs extension', () => {
    const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

    for (const jurisdiction of jurisdictions) {
      const config = getJurisdictionConfig(jurisdiction);
      for (const [key, path] of Object.entries(config.templatePaths)) {
        expect(
          path.endsWith('.hbs'),
          `${jurisdiction}.${key} template path should end with .hbs: ${path}`
        ).toBe(true);
      }
    }
  });
});

// =============================================================================
// DEBUGGING AIDS
// =============================================================================

describe('Jurisdiction Config Reference (debugging)', () => {
  it('logs all jurisdiction configurations', () => {
    const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

    for (const jurisdiction of jurisdictions) {
      const config = getJurisdictionConfig(jurisdiction);
      console.log(`\n${jurisdiction.toUpperCase()}:`);
      console.log(`  Agreement: ${config.agreementTitle} (${config.agreementDocumentType})`);
      console.log(`  Legal Framework: ${config.legalFramework}`);
      console.log(`  Standard Template: ${config.templatePaths.standard}`);
    }

    expect(true).toBe(true); // Always pass - just for logging
  });
});
