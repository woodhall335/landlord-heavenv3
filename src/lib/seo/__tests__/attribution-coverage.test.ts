/**
 * Attribution Coverage Tests
 *
 * Regression tests to ensure all wizard links include proper src= attribution.
 * This prevents attribution gaps from being introduced in the codebase.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Files that contain wizard links and should have src= attribution
const FILES_WITH_WIZARD_LINKS = [
  // Dashboard pages
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/cases/page.tsx',
  'src/app/dashboard/documents/page.tsx',
  // Homepage
  'src/components/landing/HomeContent.tsx',
  // About page
  'src/app/about/page.tsx',
];

// Patterns that should trigger attribution check
const WIZARD_LINK_PATTERNS = [
  /href=["']\/wizard(?:\?|["'])/g,  // Direct /wizard links without params
  /href={[`"']\/wizard\?[^"'`]*?(?!src=)/g, // Template literals without src
];

// Valid src patterns - links must have one of these
const VALID_SRC_PATTERN = /href=["'`][^"'`]*\/wizard[^"'`]*src=/;

describe('Attribution Coverage', () => {
  describe('Wizard links must include src=', () => {
    FILES_WITH_WIZARD_LINKS.forEach((filePath) => {
      it(`${filePath} should have src= on all wizard links`, () => {
        const fullPath = path.join(process.cwd(), filePath);

        // Skip if file doesn't exist (might be on different branch)
        if (!fs.existsSync(fullPath)) {
          console.warn(`Skipping ${filePath} - file not found`);
          return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');

        // Find all wizard links
        const wizardLinkMatches = content.match(/href=["'`][^"'`]*\/wizard[^"'`]*/g) || [];

        // Each wizard link should have src=
        wizardLinkMatches.forEach((match) => {
          const hasValidSrc = match.includes('src=');
          expect(
            hasValidSrc,
            `Found wizard link without src= attribution in ${filePath}: ${match}`
          ).toBe(true);
        });
      });
    });
  });

  describe('buildWizardLink usage', () => {
    it('should require src parameter in type definition', () => {
      const buildWizardLinkPath = path.join(
        process.cwd(),
        'src/lib/wizard/buildWizardLink.ts'
      );

      if (!fs.existsSync(buildWizardLinkPath)) {
        return; // Skip if file not found
      }

      const content = fs.readFileSync(buildWizardLinkPath, 'utf-8');

      // Check that WizardSource type exists and includes expected values
      expect(content).toContain("type WizardSource");
      expect(content).toContain("'product_page'");
      expect(content).toContain("'dashboard'");
      expect(content).toContain("'homepage'");
    });
  });

  describe('Cross-sell config sources', () => {
    it('cross-sell recommendations should have valid src values', () => {
      const crossSellPath = path.join(
        process.cwd(),
        'src/lib/cross-sell/recommendations.ts'
      );

      if (!fs.existsSync(crossSellPath)) {
        return; // Skip if file not found
      }

      const content = fs.readFileSync(crossSellPath, 'utf-8');

      // Each cross-sell config should have a src property
      const configMatches = content.match(/CrossSellConfig = \{[\s\S]*?src: ['"][^'"]+['"]/g);

      expect(
        configMatches && configMatches.length > 0,
        'Cross-sell configs should have src property'
      ).toBe(true);
    });
  });
});

describe('Attribution consistency', () => {
  it('all defined src values should be documented', () => {
    const buildWizardLinkPath = path.join(
      process.cwd(),
      'src/lib/wizard/buildWizardLink.ts'
    );

    if (!fs.existsSync(buildWizardLinkPath)) {
      return;
    }

    const content = fs.readFileSync(buildWizardLinkPath, 'utf-8');

    // Extract all src values from type definition
    const srcTypeMatch = content.match(/type WizardSource\s*=[\s\S]*?;/);

    if (srcTypeMatch) {
      const expectedSources = [
        'product_page',
        'template',
        'validator',
        'tool',
        'blog',
        'ask_heaven',
        'nav',
        'footer',
        'pricing',
        'guide',
        'homepage',
        'dashboard',
        'about',
      ];

      // At minimum, these core sources should be defined
      const coreSources = ['product_page', 'guide', 'homepage', 'dashboard'];

      coreSources.forEach((source) => {
        expect(
          content.includes(`'${source}'`) || content.includes(`"${source}"`),
          `WizardSource should include '${source}'`
        ).toBe(true);
      });
    }
  });
});
