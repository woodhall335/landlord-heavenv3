/**
 * Regression tests for Money Claim document consistency
 *
 * These tests verify:
 * 1. Enforcement guide URL formatting (no soft hyphens or broken characters)
 * 2. Enforcement preferences display with human-readable labels
 * 3. Global document consistency checks:
 *    - No ISO date formats (YYYY-MM-DD)
 *    - No float artifacts (e.g., 3600.00000000001)
 *    - No "England & Wales" (should be England-only)
 *    - No "per monthly" (grammar error)
 *    - No broken URL characters
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Register helpers needed for template rendering
Handlebars.registerHelper('currency', function (amount: number) {
  if (typeof amount !== 'number') return '£0.00';
  return `£${amount.toFixed(2)}`;
});

Handlebars.registerHelper('eq', function (this: unknown, a: unknown, b: unknown, options?: Handlebars.HelperOptions) {
  if (arguments.length === 3 && options && typeof options.fn === 'function') {
    return a === b ? options.fn(this) : (options.inverse ? options.inverse(this) : '');
  }
  return a === b;
});

describe('Money Claim Document Consistency', () => {
  const templatesDir = path.join(process.cwd(), 'config/jurisdictions/uk/england/templates/money_claims');

  describe('Enforcement Guide Regression', () => {
    const enforcementGuidePath = path.join(templatesDir, 'enforcement_guide.hbs');

    it('template exists', () => {
      expect(fs.existsSync(enforcementGuidePath)).toBe(true);
    });

    it('does not contain soft hyphen characters (\\u00AD)', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      expect(template).not.toContain('\u00AD'); // soft hyphen
    });

    it('does not contain replacement characters (\\uFFFD or \\uFFFC)', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      expect(template).not.toContain('\uFFFD'); // replacement character
      expect(template).not.toContain('\uFFFC'); // object replacement character
    });

    it('does not contain broken hyphen artifacts (U+FFFD-like sequences)', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      // Check for the specific pattern that was observed: "for￾money"
      expect(template).not.toMatch(/for[^\w\s-]money/);
      // Check for any non-ASCII characters in URLs
      expect(template).not.toMatch(/https?:\/\/[^\s]*[^\x00-\x7F][^\s]*/);
    });

    it('GOV.UK URLs are clean and complete', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');

      // Expected clean URLs
      const expectedUrls = [
        'https://www.gov.uk/make-court-claim-for-money/enforce-a-judgment',
        'https://www.gov.uk/government/collections/civil-and-family-court-forms',
        'https://www.citizensadvice.org.uk',
        'https://www.moneyclaim.gov.uk',
      ];

      for (const url of expectedUrls) {
        expect(template).toContain(url);
      }
    });

    it('renders enforcement preferences with human-readable labels', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(template);

      const result = compiledTemplate({
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        total_claim_amount: 3600,
        generation_date: '30 January 2026',
        enforcement_preferences: ['attachment_of_earnings', 'warrant_of_control', 'charging_order'],
      });

      // Check that human-readable labels are rendered (not raw keys)
      expect(result).toContain('Attachment of Earnings');
      expect(result).toContain('Warrant of Control');
      expect(result).toContain('Charging Order');
      // Should not contain raw keys in the preference list
      expect(result).not.toContain('<li>attachment_of_earnings</li>');
      expect(result).not.toContain('<li>warrant_of_control</li>');
      expect(result).not.toContain('<li>charging_order</li>');
    });

    it('uses consistent footer format', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      // Should have the standard footer format
      expect(template).toContain('Generated on {{generation_date}}');
      expect(template).toContain('Landlord Heaven Money Claim Pack | England');
    });

    it('does not use full HTML document structure (uses shared styling)', () => {
      const template = fs.readFileSync(enforcementGuidePath, 'utf-8');
      // Should NOT be a full HTML document - relies on generator's wrapper
      expect(template).not.toContain('<!DOCTYPE html>');
      expect(template).not.toContain('<html');
      expect(template).not.toContain('</html>');
      expect(template).not.toContain('<head>');
      expect(template).not.toContain('</head>');
      expect(template).not.toContain('<body>');
      expect(template).not.toContain('</body>');
    });
  });

  describe('Global Template Consistency Checks', () => {
    const packTemplates = [
      'particulars_of_claim.hbs',
      'schedule_of_arrears.hbs',
      'interest_workings.hbs',
      'letter_before_claim.hbs',
      'information_sheet_for_defendants.hbs',
      'reply_form.hbs',
      'financial_statement_form.hbs',
      'filing_guide.hbs',
      'enforcement_guide.hbs',
    ];

    for (const templateName of packTemplates) {
      describe(`${templateName}`, () => {
        const templatePath = path.join(templatesDir, templateName);

        it('does not contain hardcoded ISO dates (YYYY-MM-DD)', () => {
          if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateName} not found - skipping`);
            return;
          }
          const template = fs.readFileSync(templatePath, 'utf-8');
          // ISO date pattern that's NOT in a comment
          const isoDatePattern = /(?<!{{!--)(?<!\{\{)(?<!<!--)\d{4}-\d{2}-\d{2}(?!.*-->)(?!.*}})/g;
          const matches = template.match(isoDatePattern);
          expect(matches).toBeNull();
        });

        it('does not contain "England & Wales"', () => {
          if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateName} not found - skipping`);
            return;
          }
          const template = fs.readFileSync(templatePath, 'utf-8');
          expect(template).not.toMatch(/England\s*&\s*Wales/i);
          expect(template).not.toMatch(/England\s+and\s+Wales/i);
        });

        it('does not contain "per monthly"', () => {
          if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateName} not found - skipping`);
            return;
          }
          const template = fs.readFileSync(templatePath, 'utf-8');
          expect(template).not.toMatch(/per\s+monthly/i);
        });

        it('does not contain broken URL characters', () => {
          if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateName} not found - skipping`);
            return;
          }
          const template = fs.readFileSync(templatePath, 'utf-8');
          // Check for replacement characters
          expect(template).not.toContain('\uFFFD');
          expect(template).not.toContain('\uFFFC');
          // Check for soft hyphens
          expect(template).not.toContain('\u00AD');
        });

        it('does not contain float artifacts in currency values', () => {
          if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️ Template ${templateName} not found - skipping`);
            return;
          }
          const template = fs.readFileSync(templatePath, 'utf-8');
          // Check for numbers with many decimal places (float artifacts)
          // e.g., 3600.00000000001 or 1200.9999999999
          expect(template).not.toMatch(/\d+\.\d{5,}/);
        });
      });
    }
  });

  describe('Rendered Document Consistency', () => {
    it('enforcement guide renders without broken characters', () => {
      const templatePath = path.join(templatesDir, 'enforcement_guide.hbs');
      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(template);

      const result = compiledTemplate({
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        total_claim_amount: 3600.00,
        generation_date: '30 January 2026',
        enforcement_preferences: ['attachment_of_earnings'],
      });

      // Check rendered output for broken characters
      expect(result).not.toContain('\uFFFD');
      expect(result).not.toContain('\uFFFC');
      expect(result).not.toContain('\u00AD');

      // Check currency is properly formatted
      expect(result).toContain('£3600.00');
    });

    it('enforcement guide renders correct currency format', () => {
      const templatePath = path.join(templatesDir, 'enforcement_guide.hbs');
      const template = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(template);

      // Test with a value that could produce float artifacts
      const result = compiledTemplate({
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        total_claim_amount: 3622.39,
        generation_date: '30 January 2026',
      });

      // Should have exactly 2 decimal places
      expect(result).toContain('£3622.39');
      // Should not have float artifacts
      expect(result).not.toMatch(/£3622\.39\d+/);
    });
  });
});
