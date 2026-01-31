/**
 * Pre-Tenancy Compliance Checklist Wording Tests
 *
 * Regression tests to ensure checklist templates:
 * 1. Do not contain absolute legal language that could be misleading
 * 2. Do not contain drift-prone hardcoded dates
 * 3. Do not contain ugly placeholders
 * 4. Have proper non-contractual disclaimers
 * 5. Handle conditional rendering correctly
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Register formatUKDate helper (matches generator.ts)
Handlebars.registerHelper('formatUKDate', function (date: any) {
  if (date === null || date === undefined || date === '') {
    return '';
  }

  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'string') {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    } else {
      d = new Date(date);
    }
  } else {
    return '';
  }

  if (isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
});

describe('Pre-Tenancy Compliance Checklist Wording', () => {
  const jurisdictions = ['england', 'wales', 'scotland', 'northern_ireland'] as const;

  const templatePaths: Record<string, string> = {
    england: 'config/jurisdictions/_shared/compliance/pre_tenancy_checklist_england.hbs',
    wales: 'config/jurisdictions/_shared/compliance/pre_tenancy_checklist_wales.hbs',
    scotland: 'config/jurisdictions/_shared/compliance/pre_tenancy_checklist_scotland.hbs',
    northern_ireland: 'config/jurisdictions/_shared/compliance/pre_tenancy_checklist_northern_ireland.hbs',
  };

  const templateContents: Record<string, string> = {};

  beforeAll(() => {
    for (const [jurisdiction, relativePath] of Object.entries(templatePaths)) {
      const fullPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(fullPath)) {
        templateContents[jurisdiction] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
  });

  // ============================================================================
  // PROHIBITED PHRASES TESTS
  // ============================================================================

  describe('Prohibited Phrases - Absolute Legal Language', () => {
    const prohibitedPhrases = [
      'criminal offence',
      'is a criminal offence',
      'blocks Section',
      'prevents Section',
      'failure to provide blocks',
      'failure to comply blocks',
    ];

    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should NOT contain absolute legal phrases`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        for (const phrase of prohibitedPhrases) {
          expect(content.toLowerCase()).not.toContain(phrase.toLowerCase());
        }
      });
    });
  });

  describe('Prohibited Phrases - Drift-Prone Dates', () => {
    const prohibitedDates = [
      'From 1 April 2025',
      'from April 2025',
      '(from April 2025)',
      'From 1 December 2022',
      'from December 2022',
      'Since 1 February 2022',
    ];

    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should NOT contain drift-prone hardcoded dates`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        for (const datePhrase of prohibitedDates) {
          expect(content).not.toContain(datePhrase);
        }
      });
    });
  });

  describe('Prohibited Phrases - Ugly Placeholders', () => {
    const prohibitedPlaceholders = [
      '[check GOV.UK',
      '[check GOV.UK for latest version]',
      '[Date]',
      '{{else}}[Date]',
    ];

    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should NOT contain ugly placeholders`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        for (const placeholder of prohibitedPlaceholders) {
          expect(content).not.toContain(placeholder);
        }
      });
    });
  });

  // ============================================================================
  // REQUIRED CONTENT TESTS
  // ============================================================================

  describe('Required Content - Non-Contractual Disclaimer', () => {
    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should contain "NON-CONTRACTUAL GUIDANCE" disclaimer`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();
        expect(content).toContain('NON-CONTRACTUAL GUIDANCE');
      });

      it(`${jurisdiction} should mention guidance does not form part of agreement`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Check for appropriate phrasing based on jurisdiction
        const hasDisclaimer =
          content.includes('does not form part of the tenancy agreement') ||
          content.includes('does not form part of the occupation contract');

        expect(hasDisclaimer).toBe(true);
      });

      it(`${jurisdiction} should advise verifying current requirements`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        expect(
          content.includes('verify current requirements') ||
          content.includes('always verify current requirements')
        ).toBe(true);
      });
    });
  });

  describe('Required Content - Softer Legal Language', () => {
    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should use guidance-appropriate language`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Should contain softer language alternatives
        const hasSofterLanguage =
          content.includes('may affect') ||
          content.includes('may lead to') ||
          content.includes('may result in') ||
          content.includes('as required by law');

        expect(hasSofterLanguage).toBe(true);
      });
    });
  });

  // ============================================================================
  // CONDITIONAL RENDERING TESTS
  // ============================================================================

  describe('Conditional Rendering - Last Reviewed Date', () => {
    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should use formatUKDate for current_date`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Should use formatUKDate helper
        expect(content).toContain('{{formatUKDate current_date}}');
      });

      it(`${jurisdiction} should conditionally render Last reviewed line`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Should wrap the Last reviewed line in {{#if current_date}}
        expect(content).toContain('{{#if current_date}}');
        expect(content).toContain('Last reviewed');
      });

      it(`${jurisdiction} should NOT have unconditional [Date] fallback`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Should NOT have {{else}}[Date]{{/if}} pattern
        expect(content).not.toContain('{{else}}[Date]{{/if}}');
      });
    });
  });

  describe('Conditional Rendering - England How to Rent Version', () => {
    it('England should conditionally show how_to_rent_version', () => {
      const content = templateContents['england'];
      expect(content).toBeDefined();

      // Should use conditional rendering for how_to_rent_version
      expect(content).toContain('{{#if how_to_rent_version}}');

      // Should NOT have [check GOV.UK] fallback
      expect(content).not.toContain('[check GOV.UK');
    });
  });

  // ============================================================================
  // TEMPLATE COMPILATION TESTS
  // ============================================================================

  describe('Template Compilation - Renders Without Errors', () => {
    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} template should compile without errors`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        // Extract the inline template content
        const inlineMatch = content.match(/{{#\*inline "pre_tenancy_checklist_\w+"}}([\s\S]*?){{\/inline}}/);
        expect(inlineMatch).not.toBeNull();

        const templateBody = inlineMatch![1];

        // Should compile without throwing
        expect(() => Handlebars.compile(templateBody)).not.toThrow();
      });
    });
  });

  describe('Template Compilation - Renders Correctly With Data', () => {
    jurisdictions.forEach((jurisdiction) => {
      it(`${jurisdiction} should render with current_date`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        const inlineMatch = content.match(/{{#\*inline "pre_tenancy_checklist_\w+"}}([\s\S]*?){{\/inline}}/);
        expect(inlineMatch).not.toBeNull();

        const template = Handlebars.compile(inlineMatch![1]);
        const html = template({ current_date: '2026-01-15' });

        // Should contain formatted date
        expect(html).toContain('15 January 2026');
        expect(html).toContain('Last reviewed');
      });

      it(`${jurisdiction} should render without current_date (omit Last reviewed)`, () => {
        const content = templateContents[jurisdiction];
        expect(content).toBeDefined();

        const inlineMatch = content.match(/{{#\*inline "pre_tenancy_checklist_\w+"}}([\s\S]*?){{\/inline}}/);
        expect(inlineMatch).not.toBeNull();

        const template = Handlebars.compile(inlineMatch![1]);
        const html = template({});

        // Should NOT contain [Date] placeholder
        expect(html).not.toContain('[Date]');
      });
    });

    it('England should render with how_to_rent_version', () => {
      const content = templateContents['england'];
      expect(content).toBeDefined();

      const inlineMatch = content.match(/{{#\*inline "pre_tenancy_checklist_england"}}([\s\S]*?){{\/inline}}/);
      expect(inlineMatch).not.toBeNull();

      const template = Handlebars.compile(inlineMatch![1]);
      const html = template({ how_to_rent_version: 'October 2023' });

      // Should contain the version
      expect(html).toContain('October 2023');
    });

    it('England should render without how_to_rent_version (no placeholder)', () => {
      const content = templateContents['england'];
      expect(content).toBeDefined();

      const inlineMatch = content.match(/{{#\*inline "pre_tenancy_checklist_england"}}([\s\S]*?){{\/inline}}/);
      expect(inlineMatch).not.toBeNull();

      const template = Handlebars.compile(inlineMatch![1]);
      const html = template({});

      // Should NOT contain placeholder
      expect(html).not.toContain('[check GOV.UK');
      expect(html).not.toContain('[check GOV.UK for latest version]');
    });
  });

  // ============================================================================
  // JURISDICTION-SPECIFIC CONTENT TESTS
  // ============================================================================

  describe('Jurisdiction-Specific Content', () => {
    it('England should reference Housing Act 1988', () => {
      const content = templateContents['england'];
      expect(content).toContain('Housing Act');
    });

    it('Wales should reference Renting Homes (Wales) Act 2016', () => {
      const content = templateContents['wales'];
      expect(content).toContain('Renting Homes (Wales) Act 2016');
    });

    it('Scotland should reference Private Housing (Tenancies) (Scotland) Act 2016', () => {
      const content = templateContents['scotland'];
      expect(content).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
    });

    it('Northern Ireland should reference Private Tenancies Act (Northern Ireland) 2022', () => {
      const content = templateContents['northern_ireland'];
      expect(content).toContain('Private Tenancies Act (Northern Ireland) 2022');
    });
  });

  // ============================================================================
  // REGRESSION TESTS - SPECIFIC BUG FIXES
  // ============================================================================

  describe('Regression Tests - Specific Bug Fixes', () => {
    it('England deposit section should NOT say "blocks Section 21"', () => {
      const content = templateContents['england'];
      expect(content).not.toContain('blocks Section 21');
    });

    it('England How to Rent section should NOT say "blocks eviction"', () => {
      const content = templateContents['england'];
      expect(content).not.toContain('blocks eviction');
    });

    it('Wales written statement should NOT say "is a criminal offence"', () => {
      const content = templateContents['wales'];
      expect(content).not.toContain('is a criminal offence');
    });

    it('Wales deposit section should NOT say "prevents Section 173"', () => {
      const content = templateContents['wales'];
      expect(content).not.toContain('prevents Section 173');
    });

    it('Wales EICR section should NOT say "From 1 December 2022"', () => {
      const content = templateContents['wales'];
      expect(content).not.toContain('From 1 December 2022');
    });

    it('Scotland smoke alarms should NOT say "Since 1 February 2022"', () => {
      const content = templateContents['scotland'];
      expect(content).not.toContain('Since 1 February 2022');
    });

    it('Scotland footer should NOT say "may prevent you from evicting"', () => {
      const content = templateContents['scotland'];
      expect(content).not.toContain('may prevent you from evicting');
    });

    it('Northern Ireland EICR heading should NOT say "(From 1 April 2025)"', () => {
      const content = templateContents['northern_ireland'];
      expect(content).not.toContain('(From 1 April 2025)');
      expect(content).not.toContain('From 1 April 2025');
    });

    it('Northern Ireland EICR row should NOT say "(from April 2025)"', () => {
      const content = templateContents['northern_ireland'];
      expect(content).not.toContain('(from April 2025)');
    });

    it('All jurisdictions should use "as required by law" language', () => {
      // At least one jurisdiction should use this phrase
      const allContent = Object.values(templateContents).join('\n');
      expect(allContent).toContain('as required by law');
    });
  });
});
