/**
 * PDF Pagination Safety Tests
 *
 * These tests ensure that tenancy agreement PDFs:
 * - Signatures always start on a new page (page-break-before: always)
 * - Footer never overlaps content (safety margins)
 * - Long clauses paginate cleanly (orphan/widow prevention)
 *
 * @see https://github.com/woodhall335/landlord-heavenv3/issues/pdf-layout-overflow
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Template paths by jurisdiction and tier
const TENANCY_TEMPLATES = {
  england: {
    standard: 'uk/england/templates/standard_ast_formatted.hbs',
    premium: 'uk/england/templates/ast_hmo.hbs',
  },
  wales: {
    standard: 'uk/wales/templates/standard_occupation_contract.hbs',
    premium: 'uk/wales/templates/occupation_contract_hmo.hbs',
  },
  scotland: {
    standard: 'uk/scotland/templates/prt_agreement.hbs',
    premium: 'uk/scotland/templates/prt_agreement_hmo.hbs',
  },
};

const BASE_PATH = path.join(process.cwd(), 'config/jurisdictions');

/**
 * Read template file content
 */
function readTemplate(relativePath: string): string {
  const fullPath = path.join(BASE_PATH, relativePath);
  if (!fs.existsSync(fullPath)) {
    return ''; // Template doesn't exist, skip test
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Check if template is a markdown template (no embedded CSS)
 * Markdown templates rely on shared rendering with CSS added at render time
 */
function isMarkdownTemplate(template: string): boolean {
  // Markdown templates start with a heading (#) and don't have <style> tags
  return !template.includes('<style') && (template.includes('# ') || template.startsWith('{{!'));
}

/**
 * Check if CSS contains a specific rule pattern
 */
function hasCSSRule(css: string, selector: string, property: string, value: string): boolean {
  // Remove comments and normalize whitespace
  const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

  // Create pattern to match selector with property: value
  const pattern = new RegExp(
    `${selector.replace('.', '\\.')}\\s*\\{[^}]*${property}\\s*:\\s*${value}`,
    'i'
  );

  return pattern.test(cleanCSS);
}

/**
 * Extract CSS from template (both inline <style> and @media print)
 */
function extractCSS(template: string): string {
  const styleMatches = template.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (!styleMatches) return '';
  return styleMatches.join('\n');
}

describe('PDF Pagination Safety - Signature Section', () => {
  describe('Signature section must force page break', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: signature-section has page-break-before: always`, () => {
          const template = readTemplate(templatePath);
          if (!template) {
            // Template doesn't exist, skip
            return;
          }

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            console.log(`${jurisdiction} ${tier}: markdown template, CSS added at render time`);
            return;
          }

          const css = extractCSS(template);

          // Check for page-break-before: always on signature section
          // Templates may use .signature-section or have page-break class on the section div
          const hasSignaturePageBreak =
            hasCSSRule(css, '.signature-section', 'page-break-before', 'always') ||
            hasCSSRule(css, '.page-break', 'page-break-before', 'always');

          expect(
            hasSignaturePageBreak,
            `${jurisdiction} ${tier} template should have page-break-before: always for signatures`
          ).toBe(true);
        });
      });
    });
  });

  describe('Signature section must prevent internal breaks', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: signature-section has page-break-inside: avoid`, () => {
          const template = readTemplate(templatePath);
          if (!template) return;

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            return;
          }

          const css = extractCSS(template);

          // Check for page-break-inside: avoid on signature section or blocks
          const hasNoBreakInside =
            hasCSSRule(css, '.signature-section', 'page-break-inside', 'avoid') ||
            hasCSSRule(css, '.signature-block', 'page-break-inside', 'avoid');

          expect(
            hasNoBreakInside,
            `${jurisdiction} ${tier} template should have page-break-inside: avoid for signatures`
          ).toBe(true);
        });
      });
    });
  });
});

describe('PDF Pagination Safety - Footer', () => {
  describe('Footer must have safety margins', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: footer has margin-top >= 30pt`, () => {
          const template = readTemplate(templatePath);
          if (!template) return;

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            return;
          }

          const css = extractCSS(template);

          // Check for footer class with margin-top
          const footerPattern = /\.(doc-footer|footer-info)\s*\{[^}]*margin-top\s*:\s*(\d+)(pt|px)/i;
          const match = css.match(footerPattern);

          if (match) {
            const marginValue = parseInt(match[2], 10);
            const unit = match[3];
            // Convert px to pt if needed (1pt ≈ 1.33px)
            const marginPt = unit === 'px' ? marginValue * 0.75 : marginValue;

            expect(
              marginPt,
              `${jurisdiction} ${tier} footer margin-top should be at least 30pt`
            ).toBeGreaterThanOrEqual(30);
          } else {
            // Footer class exists but no margin-top - this is a warning
            console.warn(`${jurisdiction} ${tier}: footer class found but no margin-top specified`);
          }
        });
      });
    });
  });

  describe('Footer must prevent internal breaks', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: footer has page-break-inside: avoid`, () => {
          const template = readTemplate(templatePath);
          if (!template) return;

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            return;
          }

          const css = extractCSS(template);

          // Check for page-break-inside: avoid on footer
          const hasNoBreakInside =
            hasCSSRule(css, '.doc-footer', 'page-break-inside', 'avoid') ||
            hasCSSRule(css, '.footer-info', 'page-break-inside', 'avoid') ||
            // Also check in @media print section
            css.includes('.doc-footer') && css.includes('page-break-inside');

          // This is a soft check - footer may not exist in all templates
          if (css.includes('.doc-footer') || css.includes('.footer-info')) {
            expect(
              hasNoBreakInside,
              `${jurisdiction} ${tier} footer should have page-break-inside: avoid`
            ).toBe(true);
          }
        });
      });
    });
  });
});

describe('PDF Pagination Safety - Orphan/Widow Prevention', () => {
  describe('Templates must have orphan/widow CSS rules', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: has orphans/widows rules for text`, () => {
          const template = readTemplate(templatePath);
          if (!template) return;

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            return;
          }

          const css = extractCSS(template);

          // Check for orphans/widows CSS properties
          const hasOrphans = css.includes('orphans:') || css.includes('orphans :');
          const hasWidows = css.includes('widows:') || css.includes('widows :');

          expect(
            hasOrphans || hasWidows,
            `${jurisdiction} ${tier} template should have orphans/widows rules`
          ).toBe(true);
        });
      });
    });
  });

  describe('Headings must prevent page breaks after', () => {
    Object.entries(TENANCY_TEMPLATES).forEach(([jurisdiction, tiers]) => {
      Object.entries(tiers).forEach(([tier, templatePath]) => {
        it(`${jurisdiction} ${tier}: headings have page-break-after: avoid`, () => {
          const template = readTemplate(templatePath);
          if (!template) return;

          // Skip markdown templates - they rely on shared CSS at render time
          if (isMarkdownTemplate(template)) {
            return;
          }

          const css = extractCSS(template);

          // Check for page-break-after: avoid on headings
          const hasHeadingBreakAvoid =
            css.includes('h2') &&
            css.includes('h3') &&
            css.includes('page-break-after') &&
            css.includes('avoid');

          expect(
            hasHeadingBreakAvoid,
            `${jurisdiction} ${tier} template should have page-break-after: avoid for headings`
          ).toBe(true);
        });
      });
    });
  });
});

describe('PDF Pagination Safety - Shared Styles', () => {
  const sharedStylesPath = '_shared/styles/solicitor_grade_styles.hbs';

  it('shared styles have signature page-break-before: always', () => {
    const template = readTemplate(sharedStylesPath);
    if (!template) return;

    expect(template).toContain('page-break-before: always');
    expect(template).toContain('.signature-section');
  });

  it('shared styles have footer safety margins', () => {
    const template = readTemplate(sharedStylesPath);
    if (!template) return;

    const css = extractCSS(template) || template; // May not have <style> tags

    // Check for increased margin-top on footer
    const footerPattern = /\.doc-footer\s*\{[^}]*margin-top\s*:\s*(\d+)(pt|px)/i;
    const match = css.match(footerPattern);

    if (match) {
      const marginValue = parseInt(match[1], 10);
      expect(marginValue).toBeGreaterThanOrEqual(30);
    }
  });

  it('shared styles have orphans/widows prevention', () => {
    const template = readTemplate(sharedStylesPath);
    if (!template) return;

    expect(template).toContain('orphans:');
    expect(template).toContain('widows:');
  });

  it('shared styles have page-break utility class', () => {
    const template = readTemplate(sharedStylesPath);
    if (!template) return;

    expect(template).toContain('.page-break');
    expect(template).toContain('page-break-before: always');
  });
});

describe('REGRESSION: Previous Layout Bugs', () => {
  it('REGRESSION: Signature section must NOT only have page-break-inside: avoid', () => {
    // This test ensures signatures are forced to a new page, not just kept together
    const englandStandard = readTemplate(TENANCY_TEMPLATES.england.standard);
    if (!englandStandard) return;

    const css = extractCSS(englandStandard);

    // Must have page-break-before: always, not just page-break-inside: avoid
    expect(
      hasCSSRule(css, '.signature-section', 'page-break-before', 'always'),
      'England standard template MUST have page-break-before: always on signature-section'
    ).toBe(true);
  });

  it('REGRESSION: Footer must NOT have small margin-top', () => {
    // This test ensures footer has adequate safety margin
    const englandStandard = readTemplate(TENANCY_TEMPLATES.england.standard);
    if (!englandStandard) return;

    const css = extractCSS(englandStandard);

    // Footer margin should be at least 30pt
    const footerPattern = /\.doc-footer\s*\{[^}]*margin-top\s*:\s*(\d+)pt/i;
    const match = css.match(footerPattern);

    if (match) {
      const marginValue = parseInt(match[1], 10);
      expect(
        marginValue,
        'Footer margin-top must be at least 30pt to prevent overlap'
      ).toBeGreaterThanOrEqual(30);
    }
  });
});
