/**
 * Jurisdiction-Specific Template Tests
 *
 * Verifies that each UK jurisdiction has its own templates with correct terminology
 * and legal references, avoiding fallback to England templates.
 */

import { getJurisdictionConfig, TenancyJurisdiction } from '../ast-generator';
import { loadTemplate } from '../generator';
import * as fs from 'fs';
import * as path from 'path';

const JURISDICTIONS: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

describe('Jurisdiction Template Configuration', () => {
  test.each(JURISDICTIONS)('%s has unique model clauses template path', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);

    // Should not fall back to England templates for non-England jurisdictions
    if (jurisdiction !== 'england') {
      expect(config.templatePaths.modelClauses).not.toContain('uk/england/');
      expect(config.templatePaths.modelClauses).toContain(`uk/${jurisdiction}/`);
    }
  });

  test.each(JURISDICTIONS)('%s has unique premium templates (key schedule, maintenance, checkout)', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);

    // Check premium templates don't fall back to England for non-England jurisdictions
    if (jurisdiction !== 'england') {
      expect(config.templatePaths.keySchedule).not.toContain('uk/england/');
      expect(config.templatePaths.maintenanceGuide).not.toContain('uk/england/');
      expect(config.templatePaths.checkoutProcedure).not.toContain('uk/england/');

      expect(config.templatePaths.keySchedule).toContain(`uk/${jurisdiction}/`);
      expect(config.templatePaths.maintenanceGuide).toContain(`uk/${jurisdiction}/`);
      expect(config.templatePaths.checkoutProcedure).toContain(`uk/${jurisdiction}/`);
    }
  });

  test.each(JURISDICTIONS)('%s model clauses template file exists', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);
    const templatePath = path.join(
      process.cwd(),
      'config/jurisdictions',
      config.templatePaths.modelClauses
    );

    expect(fs.existsSync(templatePath)).toBe(true);
  });

  test.each(JURISDICTIONS)('%s premium templates exist', (jurisdiction) => {
    const config = getJurisdictionConfig(jurisdiction);
    const basePath = path.join(process.cwd(), 'config/jurisdictions');

    const keySchedulePath = path.join(basePath, config.templatePaths.keySchedule);
    const maintenancePath = path.join(basePath, config.templatePaths.maintenanceGuide);
    const checkoutPath = path.join(basePath, config.templatePaths.checkoutProcedure);

    expect(fs.existsSync(keySchedulePath)).toBe(true);
    expect(fs.existsSync(maintenancePath)).toBe(true);
    expect(fs.existsSync(checkoutPath)).toBe(true);
  });
});

describe('Jurisdiction-Specific Terminology', () => {
  test('Wales model clauses uses "Occupation Contract" terminology', async () => {
    const config = getJurisdictionConfig('wales');
    const template = await loadTemplate(config.templatePaths.modelClauses);

    // Wales uses Renting Homes (Wales) Act 2016 terminology
    expect(template).toContain('Occupation Contract');
    expect(template).toContain('Contract-Holder');
    expect(template).toContain('Renting Homes (Wales) Act 2016');
    expect(template).toContain('Rent Smart Wales');

    // Should NOT use English AST terminology
    expect(template).not.toContain('Assured Shorthold Tenancy');
    expect(template).not.toContain('Section 21');
  });

  test('Scotland model clauses uses "Private Residential Tenancy" terminology', async () => {
    const config = getJurisdictionConfig('scotland');
    const template = await loadTemplate(config.templatePaths.modelClauses);

    // Scotland uses Private Housing (Tenancies) (Scotland) Act 2016 terminology
    expect(template).toContain('Private Residential Tenancy');
    expect(template).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
    expect(template).toContain('First-tier Tribunal');
    expect(template).toContain('Repairing Standard');

    // Should NOT use English AST terminology
    expect(template).not.toContain('Assured Shorthold Tenancy');
    expect(template).not.toContain('Section 21');
    expect(template).not.toContain('Section 8');
  });

  test('Northern Ireland model clauses uses "Private Tenancy" terminology', async () => {
    const config = getJurisdictionConfig('northern-ireland');
    const template = await loadTemplate(config.templatePaths.modelClauses);

    // Northern Ireland uses Private Tenancies (NI) Order 2006 terminology
    expect(template).toContain('Private Tenancies (Northern Ireland) Order 2006');
    expect(template).toContain('Northern Ireland');

    // Should NOT use English AST terminology
    expect(template).not.toContain('Assured Shorthold Tenancy');
    expect(template).not.toContain('Section 21');
  });

  test('England model clauses uses AST terminology', async () => {
    const config = getJurisdictionConfig('england');
    const template = await loadTemplate(config.templatePaths.modelClauses);

    // England uses Housing Act 1988 terminology
    expect(template).toContain('Housing Act 1988');
    expect(template).toContain('Section 21');
    expect(template).toContain('Section 8');
  });
});

describe('Wales Premium Templates Use Contract-Holder Terminology', () => {
  test('Wales key schedule uses "Contract-Holder" not "Tenant"', async () => {
    const config = getJurisdictionConfig('wales');
    const template = await loadTemplate(config.templatePaths.keySchedule);

    expect(template).toContain('Contract-Holder');
    expect(template).toContain('Standard Occupation Contract');
  });

  test('Wales maintenance guide uses Welsh terminology', async () => {
    const config = getJurisdictionConfig('wales');
    const template = await loadTemplate(config.templatePaths.maintenanceGuide);

    expect(template).toContain('Contract-Holder');
    expect(template).toContain('Renting Homes (Wales) Act 2016');
    expect(template).toContain('dwelling'); // Wales uses "dwelling" terminology
  });

  test('Wales checkout procedure uses Welsh terminology', async () => {
    const config = getJurisdictionConfig('wales');
    const template = await loadTemplate(config.templatePaths.checkoutProcedure);

    expect(template).toContain('Standard Occupation Contract');
    expect(template).toContain('Renting Homes (Wales) Act 2016');
    expect(template).toContain('dwelling');
  });
});

describe('Scotland Premium Templates Use Scottish Terminology', () => {
  test('Scotland maintenance guide references Scottish fire safety requirements', async () => {
    const config = getJurisdictionConfig('scotland');
    const template = await loadTemplate(config.templatePaths.maintenanceGuide);

    expect(template).toContain('interlinked'); // Scotland requires interlinked alarms
    expect(template).toContain('Private Residential Tenancy');
  });

  test('Scotland checkout procedure references 28-day notice period', async () => {
    const config = getJurisdictionConfig('scotland');
    const template = await loadTemplate(config.templatePaths.checkoutProcedure);

    expect(template).toContain('28 days');
    expect(template).toContain('Private Residential Tenancy');
  });
});

describe('Northern Ireland Premium Templates Use NI Terminology', () => {
  test('Northern Ireland maintenance guide references NI utilities', async () => {
    const config = getJurisdictionConfig('northern-ireland');
    const template = await loadTemplate(config.templatePaths.maintenanceGuide);

    // Should reference NI-specific utilities/emergency numbers
    expect(template).toContain('Northern Ireland');
    expect(template).toContain('NIE Networks');
  });

  test('Northern Ireland checkout procedure references NI legislation', async () => {
    const config = getJurisdictionConfig('northern-ireland');
    const template = await loadTemplate(config.templatePaths.checkoutProcedure);

    expect(template).toContain('Private Tenancies (Northern Ireland) Order 2006');
    // Should reference NI-specific bodies
    expect(template).toContain('Land & Property Services');
  });
});

describe('Jurisdiction Config Metadata', () => {
  test('Wales config has correct agreement title and type', () => {
    const config = getJurisdictionConfig('wales');

    expect(config.agreementTitle).toBe('Standard Occupation Contract');
    expect(config.agreementDocumentType).toBe('soc_agreement');
    expect(config.legalFramework).toContain('Renting Homes (Wales) Act 2016');
  });

  test('Scotland config has correct agreement title and type', () => {
    const config = getJurisdictionConfig('scotland');

    expect(config.agreementTitle).toBe('Private Residential Tenancy Agreement');
    expect(config.agreementDocumentType).toBe('prt_agreement');
    expect(config.legalFramework).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
  });

  test('Northern Ireland config has correct agreement title and type', () => {
    const config = getJurisdictionConfig('northern-ireland');

    expect(config.agreementTitle).toBe('Private Tenancy Agreement');
    expect(config.agreementDocumentType).toBe('private_tenancy_agreement');
    expect(config.legalFramework).toContain('Private Tenancies (Northern Ireland) Order 2006');
  });

  test('England config has correct agreement title and type', () => {
    const config = getJurisdictionConfig('england');

    expect(config.agreementTitle).toBe('Assured Shorthold Tenancy Agreement');
    expect(config.agreementDocumentType).toBe('ast_agreement');
    expect(config.legalFramework).toContain('Housing Act 1988');
  });
});
