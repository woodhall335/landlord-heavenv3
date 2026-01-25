/**
 * Tenancy Clause Verification Tests
 *
 * CI tests to ensure ClauseDiffPreview and TenancyComparisonTable
 * claims are ALWAYS accurate vs the actual HBS templates.
 *
 * These tests:
 * 1. Verify every Premium-only clause marker exists in Premium templates
 * 2. Verify Premium-only clause markers do NOT exist in Standard templates
 * 3. Verify Core clauses exist in both Standard and Premium
 * 4. Verify jurisdiction-specific terminology
 * 5. Generate readable diff reports on failure
 */

import {
  runFullVerification,
  verifyTemplate,
  extractClauseIds,
  hasClauseMarker,
  CLAUSE_DEFINITIONS,
  TEMPLATE_PATHS,
  JURISDICTION_TERMINOLOGY,
  getPremiumOnlyClauseIds,
  getBothTiersClauseIds,
  getHMOClauseIds,
  readTemplateFile,
  generateDiffReport,
  type ClauseJurisdiction,
  type ClauseTier,
  type ClauseId,
} from '@/lib/tenancy/clause-verifier';

// ============================================================================
// FULL VERIFICATION TEST
// ============================================================================

describe('Tenancy Clause Verification', () => {
  describe('Full verification suite', () => {
    it('should pass all clause verification checks', () => {
      const report = runFullVerification();

      // If verification fails, print the diff report for debugging
      if (!report.valid) {
        console.error(generateDiffReport(report));
      }

      expect(report.valid).toBe(true);
      expect(report.summary.totalErrors).toBe(0);
    });

    it('should verify all jurisdictions', () => {
      const report = runFullVerification();
      const jurisdictions: ClauseJurisdiction[] = [
        'england',
        'wales',
        'scotland',
        'northern-ireland',
      ];

      for (const jurisdiction of jurisdictions) {
        expect(report.jurisdictionResults[jurisdiction]).toBeDefined();
        expect(report.jurisdictionResults[jurisdiction].standard).toBeDefined();
        expect(report.jurisdictionResults[jurisdiction].premium).toBeDefined();
      }
    });
  });
});

// ============================================================================
// PREMIUM-ONLY CLAUSE VERIFICATION
// ============================================================================

describe('Premium-Only Clause Verification', () => {
  const premiumOnlyClauseIds = getPremiumOnlyClauseIds();
  const jurisdictions: ClauseJurisdiction[] = [
    'england',
    'wales',
    'scotland',
    'northern-ireland',
  ];

  describe('Premium templates MUST contain premium-only clause markers', () => {
    for (const jurisdiction of jurisdictions) {
      describe(`${jurisdiction}`, () => {
        const templatePath = TEMPLATE_PATHS[jurisdiction].premium;
        let templateContent: string | null;

        beforeAll(() => {
          templateContent = readTemplateFile(templatePath);
        });

        it(`should have readable premium template`, () => {
          expect(templateContent).not.toBeNull();
        });

        // Test each HMO clause specifically
        const hmoClauseIds = getHMOClauseIds();
        for (const clauseId of hmoClauseIds) {
          it(`should contain HMO clause marker: ${clauseId}`, () => {
            expect(templateContent).not.toBeNull();
            expect(hasClauseMarker(templateContent!, clauseId)).toBe(true);
          });
        }
      });
    }
  });

  describe('Standard templates MUST NOT contain premium-only clause markers', () => {
    for (const jurisdiction of jurisdictions) {
      describe(`${jurisdiction}`, () => {
        const templatePath = TEMPLATE_PATHS[jurisdiction].standard;
        let templateContent: string | null;

        beforeAll(() => {
          templateContent = readTemplateFile(templatePath);
        });

        it(`should have readable standard template`, () => {
          expect(templateContent).not.toBeNull();
        });

        // HMO clause markers should NOT be in standard
        const hmoClauseIds = getHMOClauseIds();
        for (const clauseId of hmoClauseIds) {
          it(`should NOT contain HMO clause marker: ${clauseId}`, () => {
            expect(templateContent).not.toBeNull();
            expect(hasClauseMarker(templateContent!, clauseId)).toBe(false);
          });
        }
      });
    }
  });
});

// ============================================================================
// CORE CLAUSE VERIFICATION
// ============================================================================

describe('Core Clause Verification', () => {
  const coreClauseIds = getBothTiersClauseIds();
  const jurisdictions: ClauseJurisdiction[] = [
    'england',
    'wales',
    'scotland',
    'northern-ireland',
  ];
  const tiers: ClauseTier[] = ['standard', 'premium'];

  for (const jurisdiction of jurisdictions) {
    describe(`${jurisdiction}`, () => {
      for (const tier of tiers) {
        describe(`${tier} tier`, () => {
          const templatePath = TEMPLATE_PATHS[jurisdiction][tier];
          let templateContent: string | null;

          beforeAll(() => {
            templateContent = readTemplateFile(templatePath);
          });

          it(`should have readable template`, () => {
            expect(templateContent).not.toBeNull();
          });

          // Check for core clause: CORE_TENANCY
          it(`should contain CORE_TENANCY marker`, () => {
            expect(templateContent).not.toBeNull();
            expect(hasClauseMarker(templateContent!, 'CORE_TENANCY')).toBe(true);
          });

          // Check for TENANT_OBLIGATIONS in both tiers
          it(`should contain TENANT_OBLIGATIONS marker`, () => {
            expect(templateContent).not.toBeNull();
            expect(hasClauseMarker(templateContent!, 'TENANT_OBLIGATIONS')).toBe(true);
          });

          // Check for PETS_CLAUSE in both tiers
          it(`should contain PETS_CLAUSE marker`, () => {
            expect(templateContent).not.toBeNull();
            expect(hasClauseMarker(templateContent!, 'PETS_CLAUSE')).toBe(true);
          });
        });
      }
    });
  }
});

// ============================================================================
// JURISDICTION TERMINOLOGY VERIFICATION
// ============================================================================

describe('Jurisdiction Terminology Verification', () => {
  describe('Wales templates', () => {
    const tiers: ClauseTier[] = ['standard', 'premium'];

    for (const tier of tiers) {
      it(`${tier} should use "Contract Holder" terminology`, () => {
        const templatePath = TEMPLATE_PATHS.wales[tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!.toLowerCase()).toContain('contract holder');
      });

      it(`${tier} should reference "Occupation Contract"`, () => {
        const templatePath = TEMPLATE_PATHS.wales[tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!.toLowerCase()).toContain('occupation contract');
      });

      it(`${tier} should reference Renting Homes (Wales) Act 2016`, () => {
        const templatePath = TEMPLATE_PATHS.wales[tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!).toContain('Renting Homes (Wales) Act 2016');
      });
    }
  });

  describe('Scotland templates', () => {
    const tiers: ClauseTier[] = ['standard', 'premium'];

    for (const tier of tiers) {
      it(`${tier} should reference "Private Residential Tenancy"`, () => {
        const templatePath = TEMPLATE_PATHS.scotland[tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!).toMatch(/Private Residential Tenancy/i);
      });

      it(`${tier} should reference Civic Government (Scotland) Act 1982 for HMO`, () => {
        // Only premium needs HMO reference
        if (tier === 'premium') {
          const templatePath = TEMPLATE_PATHS.scotland[tier];
          const templateContent = readTemplateFile(templatePath);

          expect(templateContent).not.toBeNull();
          expect(templateContent!).toContain('Civic Government (Scotland) Act 1982');
        }
      });
    }
  });

  describe('England templates', () => {
    const tiers: ClauseTier[] = ['standard', 'premium'];

    for (const tier of tiers) {
      it(`${tier} should use "Tenant" terminology`, () => {
        const templatePath = TEMPLATE_PATHS.england[tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!).toMatch(/\bTenant\b/);
      });

      it(`${tier} should reference Housing Act 2004 for HMO clauses`, () => {
        // Only premium needs HMO reference
        if (tier === 'premium') {
          const templatePath = TEMPLATE_PATHS.england[tier];
          const templateContent = readTemplateFile(templatePath);

          expect(templateContent).not.toBeNull();
          expect(templateContent!).toContain('Housing Act 2004');
        }
      });
    }
  });

  describe('Northern Ireland templates', () => {
    const tiers: ClauseTier[] = ['standard', 'premium'];

    for (const tier of tiers) {
      it(`${tier} should reference NI tenancy legislation`, () => {
        const templatePath = TEMPLATE_PATHS['northern-ireland'][tier];
        const templateContent = readTemplateFile(templatePath);

        expect(templateContent).not.toBeNull();
        expect(templateContent!).toMatch(
          /Private Tenancies Act \(Northern Ireland\)|Private Tenancies \(Northern Ireland\)/
        );
      });
    }
  });
});

// ============================================================================
// CLAUSE ID EXTRACTION TESTS
// ============================================================================

describe('Clause ID Extraction', () => {
  it('should extract HTML-style clause markers', () => {
    const content = `
      Some text
      <!-- CLAUSE:CORE_TENANCY -->
      More text
      <!-- CLAUSE:JOINT_LIABILITY -->
    `;

    const ids = extractClauseIds(content);
    expect(ids).toContain('CORE_TENANCY');
    expect(ids).toContain('JOINT_LIABILITY');
  });

  it('should extract Handlebars-style clause markers', () => {
    const content = `
      Some text
      {{!-- CLAUSE:CORE_TENANCY --}}
      More text
      {{!-- CLAUSE:TENANT_OBLIGATIONS --}}
    `;

    const ids = extractClauseIds(content);
    expect(ids).toContain('CORE_TENANCY');
    expect(ids).toContain('TENANT_OBLIGATIONS');
  });

  it('should extract mixed marker styles', () => {
    const content = `
      <!-- CLAUSE:CORE_TENANCY -->
      {{!-- CLAUSE:PETS_CLAUSE --}}
    `;

    const ids = extractClauseIds(content);
    expect(ids).toContain('CORE_TENANCY');
    expect(ids).toContain('PETS_CLAUSE');
  });

  it('should ignore invalid clause IDs', () => {
    const content = `
      <!-- CLAUSE:INVALID_CLAUSE -->
      <!-- CLAUSE:CORE_TENANCY -->
    `;

    const ids = extractClauseIds(content);
    expect(ids).not.toContain('INVALID_CLAUSE');
    expect(ids).toContain('CORE_TENANCY');
  });

  it('should deduplicate clause IDs', () => {
    const content = `
      <!-- CLAUSE:CORE_TENANCY -->
      <!-- CLAUSE:CORE_TENANCY -->
    `;

    const ids = extractClauseIds(content);
    expect(ids.filter(id => id === 'CORE_TENANCY')).toHaveLength(1);
  });
});

// ============================================================================
// CLAUSE DEFINITION CONSISTENCY TESTS
// ============================================================================

describe('Clause Definition Consistency', () => {
  it('should have unique clause IDs', () => {
    const ids = CLAUSE_DEFINITIONS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have valid expectedIn values', () => {
    for (const clause of CLAUSE_DEFINITIONS) {
      expect(clause.expectedIn.length).toBeGreaterThan(0);
      for (const tier of clause.expectedIn) {
        expect(['standard', 'premium']).toContain(tier);
      }
    }
  });

  it('should have core clauses in both tiers', () => {
    const coreClauses = CLAUSE_DEFINITIONS.filter(c => c.category === 'core');
    for (const clause of coreClauses) {
      expect(clause.expectedIn).toContain('standard');
      expect(clause.expectedIn).toContain('premium');
    }
  });

  it('should have HMO clauses only in premium', () => {
    const hmoClauses = CLAUSE_DEFINITIONS.filter(c => c.isHMO);
    for (const clause of hmoClauses) {
      expect(clause.expectedIn).toEqual(['premium']);
    }
  });

  it('should have all required jurisdictions in TEMPLATE_PATHS', () => {
    const expectedJurisdictions: ClauseJurisdiction[] = [
      'england',
      'wales',
      'scotland',
      'northern-ireland',
    ];

    for (const jurisdiction of expectedJurisdictions) {
      expect(TEMPLATE_PATHS[jurisdiction]).toBeDefined();
      expect(TEMPLATE_PATHS[jurisdiction].standard).toBeDefined();
      expect(TEMPLATE_PATHS[jurisdiction].premium).toBeDefined();
    }
  });

  it('should have all jurisdictions in JURISDICTION_TERMINOLOGY', () => {
    const expectedJurisdictions: ClauseJurisdiction[] = [
      'england',
      'wales',
      'scotland',
      'northern-ireland',
    ];

    for (const jurisdiction of expectedJurisdictions) {
      expect(JURISDICTION_TERMINOLOGY[jurisdiction]).toBeDefined();
      expect(JURISDICTION_TERMINOLOGY[jurisdiction].tenantTerm).toBeDefined();
      expect(JURISDICTION_TERMINOLOGY[jurisdiction].agreementType).toBeDefined();
      expect(JURISDICTION_TERMINOLOGY[jurisdiction].hmoLegislation).toBeDefined();
    }
  });
});

// ============================================================================
// DIFF REPORT GENERATION
// ============================================================================

describe('Diff Report Generation', () => {
  it('should generate a valid report structure', () => {
    const report = runFullVerification();
    const diffReport = generateDiffReport(report);

    expect(diffReport).toContain('TENANCY CLAUSE VERIFICATION REPORT');
    expect(diffReport).toContain('Status:');
    expect(diffReport).toContain('SUMMARY:');
    expect(diffReport).toContain('Total Errors:');
    expect(diffReport).toContain('Total Warnings:');
  });

  it('should include timestamp in report', () => {
    const report = runFullVerification();
    expect(report.timestamp).toBeDefined();
    expect(new Date(report.timestamp).getTime()).not.toBeNaN();
  });
});
