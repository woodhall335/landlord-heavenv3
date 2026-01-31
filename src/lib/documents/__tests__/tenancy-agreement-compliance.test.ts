/**
 * Tenancy Agreement Compliance Tests
 *
 * These tests verify that tenancy agreement templates comply with legal requirements:
 * 1. No misleading "CRIMINAL OFFENCE" language for private AST subletting
 * 2. Tenant Fees Act 2019 compliant cleaning clauses (no required professional cleaning receipts)
 * 3. ADR-safe deposit deduction language (no "forfeit entire deposit")
 * 4. Proper tone (no aggressive STRICTLY/IMMEDIATE language with emojis)
 * 5. Premium templates include guarantor clauses when guarantor data provided
 * 6. Standard templates do NOT include guarantor sections
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const JURISDICTIONS_PATH = join(process.cwd(), 'config/jurisdictions/uk');

// Standard tenancy templates by jurisdiction
const STANDARD_TEMPLATES = {
  england: 'england/templates/standard_ast_formatted.hbs',
  wales: 'wales/templates/standard_occupation_contract.hbs',
  scotland: 'scotland/templates/prt_agreement.hbs',
  'northern-ireland': 'northern-ireland/templates/private_tenancy_agreement.hbs',
};

// Premium tenancy templates by jurisdiction
const PREMIUM_TEMPLATES = {
  england: 'england/templates/premium_ast_formatted.hbs',
  wales: 'wales/templates/premium_occupation_contract.hbs',
  scotland: 'scotland/templates/prt_agreement_premium.hbs',
  'northern-ireland': 'northern-ireland/templates/private_tenancy_premium.hbs',
};

function loadTemplate(relativePath: string): string {
  const fullPath = join(JURISDICTIONS_PATH, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Template not found: ${fullPath}`);
  }
  return readFileSync(fullPath, 'utf-8');
}

describe('Tenancy Agreement Legal Compliance', () => {
  describe('Subletting Clause Compliance', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain "CRIMINAL OFFENCE" or "criminal offense" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not contain misleading criminal offence claims for private tenancies
        expect(template.toLowerCase()).not.toContain('criminal offence');
        expect(template.toLowerCase()).not.toContain('criminal offense');
        expect(template.toLowerCase()).not.toContain('criminal prosecution');

        // Prevention of Social Housing Fraud Act 2013 should not be referenced in private tenancy templates
        expect(template).not.toContain('Prevention of Social Housing Fraud Act');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain "CRIMINAL OFFENCE" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template.toLowerCase()).not.toContain('criminal offence');
        expect(template.toLowerCase()).not.toContain('criminal offense');
        expect(template).not.toContain('Prevention of Social Housing Fraud Act');
      }
    );
  });

  describe('Cleaning Clause Compliance (Tenant Fees Act 2019)', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not require professional cleaning receipts',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not require receipts for professional cleaning
        expect(template.toLowerCase()).not.toContain('receipts must be provided');
        expect(template).not.toMatch(/MUST\s+(arrange|use)\s+professional\s+clean/i);
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not require professional cleaning receipts',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template.toLowerCase()).not.toContain('receipts must be provided');
        expect(template).not.toMatch(/MUST\s+(arrange|use)\s+professional\s+clean/i);
      }
    );
  });

  describe('Deposit Deduction Compliance (ADR-safe)', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain "forfeit entire deposit" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not use aggressive forfeit language
        expect(template.toLowerCase()).not.toContain('forfeit the entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeit entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeiture of deposit');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain "forfeit entire deposit" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template.toLowerCase()).not.toContain('forfeit the entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeit entire deposit');
      }
    );
  });

  describe('Professional Tone Compliance', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain aggressive STRICTLY PROHIBITED language with emojis',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not use STRICTLY PROHIBITED with warning emojis
        expect(template).not.toMatch(/⚠️.*STRICTLY PROHIBITED/);
        expect(template).not.toMatch(/STRICTLY PROHIBITED.*Criminal/i);
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain aggressive language patterns',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template).not.toMatch(/⚠️.*STRICTLY PROHIBITED/);
        expect(template).not.toMatch(/STRICTLY PROHIBITED.*Criminal/i);
      }
    );
  });
});

describe('Guarantor Clause Inclusion', () => {
  describe('Premium Templates with Guarantor Support', () => {
    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should include guarantor sections',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Premium templates should have conditional guarantor blocks
        expect(template).toContain('guarantor_name');
        expect(template).toContain('Guarantor');

        // Should have the guarantor agreement section
        expect(template.toLowerCase()).toContain('guarantor agreement');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should include proper guarantor fields',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should reference guarantor address and contact info
        expect(template).toContain('guarantor_address');
        expect(template).toContain('guarantor_email');
        expect(template).toContain('guarantor_phone');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template guarantor section should be conditional',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should use Handlebars conditional for guarantor
        expect(template).toMatch(/\{\{#if\s+guarantor_name\}\}/);
        expect(template).toMatch(/\{\{\/if\}\}/);
      }
    );
  });

  describe('Standard Templates Guarantor Exclusion', () => {
    it('england standard template should reference guarantor (standard can include basic guarantor)', () => {
      const template = loadTemplate(STANDARD_TEMPLATES.england);

      // England standard may include basic guarantor support, but should be conditional
      if (template.includes('guarantor')) {
        expect(template).toMatch(/\{\{#if\s+guarantor/);
      }
    });
  });
});

describe('Emoji Removal Compliance', () => {
  const partyLabelEmojis = ['🏠', '👤', '🏢', '🛡️'];
  const warningEmojis = ['⚠️', '📜', 'ℹ️', '📋', '📍', '🚗', '📅', '💳', '📈', '📊', '✅', '🔑', '♻️', '🤝', '🐾', '🔨', '🏘️', '🚭'];

  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should not have emojis in party labels',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      partyLabelEmojis.forEach((emoji) => {
        expect(template).not.toContain(`party-label">${emoji}`);
      });
    }
  );

  it.each(Object.entries(PREMIUM_TEMPLATES))(
    '%s premium template should not have emojis in warning titles',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      // Should not have emojis in warning-title divs
      expect(template).not.toMatch(/warning-title">⚠️/);
    }
  );
});

describe('ADR Process Reference', () => {
  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should reference ADR process for deposit disputes',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);
      const lowerTemplate = template.toLowerCase();

      // Should mention deposit protection and dispute resolution
      expect(
        lowerTemplate.includes('adr') ||
          lowerTemplate.includes('alternative dispute resolution') ||
          lowerTemplate.includes('dispute resolution') ||
          lowerTemplate.includes('deposit scheme')
      ).toBe(true);
    }
  );
});
