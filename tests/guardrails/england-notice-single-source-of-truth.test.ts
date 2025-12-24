/**
 * England Notice Single Source of Truth - Guardrail Tests
 *
 * These tests ensure that England eviction packs (Complete Pack) ALWAYS pull
 * the notice documents from the Notice Only canonical templates.
 *
 * Definition of "single source of truth":
 * - Eviction pack code must NOT select notice templates itself
 * - Eviction pack must call the notice generators (or shared helper) that use Notice Only paths
 * - Any future changes to Notice Only templates must automatically propagate to Complete Packs
 */

import { describe, test, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Canonical template paths for England notices
const SECTION_8_CANONICAL_TEMPLATE = 'uk/england/templates/notice_only/form_3_section8/notice.hbs';
const SECTION_21_CANONICAL_TEMPLATE = 'uk/england/templates/notice_only/form_6a_section21/notice.hbs';

// Legacy template path that should NOT be used anywhere in runtime code
const LEGACY_SECTION_8_TEMPLATE = 'uk/england/templates/eviction/section8_notice.hbs';

describe('England Notice Single Source of Truth', () => {
  describe('Section 8 Notice Template', () => {
    test('generateSection8Notice uses the canonical notice_only template path', () => {
      const generatorPath = path.join(process.cwd(), 'src/lib/documents/section8-generator.ts');
      const content = fs.readFileSync(generatorPath, 'utf-8');

      // Must use the notice_only canonical template
      expect(content).toContain(SECTION_8_CANONICAL_TEMPLATE);

      // Must NOT use the legacy eviction path
      expect(content).not.toContain(LEGACY_SECTION_8_TEMPLATE);
    });

    test('Section 8 canonical template file exists', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions',
        SECTION_8_CANONICAL_TEMPLATE
      );
      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });

  describe('Section 21 Notice Template', () => {
    test('generateSection21Notice uses the canonical notice_only template path', () => {
      const generatorPath = path.join(process.cwd(), 'src/lib/documents/section21-generator.ts');
      const content = fs.readFileSync(generatorPath, 'utf-8');

      // Must use the notice_only canonical template
      expect(content).toContain(SECTION_21_CANONICAL_TEMPLATE);
    });

    test('Section 21 canonical template file exists', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions',
        SECTION_21_CANONICAL_TEMPLATE
      );
      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });

  describe('Eviction Pack Generator uses Notice Generators', () => {
    let evictionPackContent: string;

    beforeAll(() => {
      const packGeneratorPath = path.join(
        process.cwd(),
        'src/lib/documents/eviction-pack-generator.ts'
      );
      evictionPackContent = fs.readFileSync(packGeneratorPath, 'utf-8');
    });

    test('imports generateSection21Notice from section21-generator', () => {
      expect(evictionPackContent).toMatch(
        /import\s+\{[^}]*generateSection21Notice[^}]*\}\s+from\s+['"]\.\/section21-generator['"]/
      );
    });

    test('imports generateSection8Notice from section8-generator', () => {
      expect(evictionPackContent).toMatch(
        /import\s+\{[^}]*generateSection8Notice[^}]*\}\s+from\s+['"]\.\/section8-generator['"]/
      );
    });

    test('does NOT directly call generateDocument with Section 21 notice_only template path for England', () => {
      // This ensures the pack uses the generator function, not direct template calls
      // We check that generateDocument is not called with the S21 template path
      // (Instead, generateSection21Notice should be called)
      const directS21Calls = evictionPackContent.match(
        /generateDocument\s*\(\s*\{[^}]*templatePath:\s*['"]uk\/england\/templates\/notice_only\/form_6a_section21/g
      );
      expect(directS21Calls).toBeNull();
    });

    test('calls generateSection21Notice for England no-fault cases', () => {
      // Check that the code calls generateSection21Notice
      expect(evictionPackContent).toMatch(/generateSection21Notice\s*\(/);
    });

    test('calls generateSection8Notice for England fault-based cases', () => {
      // Check that the code calls generateSection8Notice
      expect(evictionPackContent).toMatch(/generateSection8Notice\s*\(/);
    });
  });

  describe('Template Registry reflects canonical paths', () => {
    let registryContent: string;

    beforeAll(() => {
      const registryPath = path.join(
        process.cwd(),
        'src/lib/jurisdictions/capabilities/templateRegistry.ts'
      );
      registryContent = fs.readFileSync(registryPath, 'utf-8');
    });

    test('england.section_8 mapping uses canonical notice_only path', () => {
      expect(registryContent).toContain(SECTION_8_CANONICAL_TEMPLATE);
    });

    test('england.section_21 mapping uses canonical notice_only path', () => {
      expect(registryContent).toContain(SECTION_21_CANONICAL_TEMPLATE);
    });

    test('registry does NOT reference legacy Section 8 eviction template', () => {
      expect(registryContent).not.toContain(LEGACY_SECTION_8_TEMPLATE);
    });
  });

  describe('No runtime references to legacy Section 8 template', () => {
    // Helper to recursively find all .ts files
    function findTsFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findTsFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    test('ZERO runtime references to legacy eviction/section8_notice.hbs in src/', () => {
      const srcDir = path.join(process.cwd(), 'src');

      // Find all TypeScript files in src/
      const tsFiles = findTsFiles(srcDir);

      const violations: string[] = [];

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for any reference to the legacy template path
        if (content.includes(LEGACY_SECTION_8_TEMPLATE)) {
          const relativePath = path.relative(srcDir, filePath);
          violations.push(relativePath);
        }
      }

      expect(violations).toEqual([]);
    });
  });
});
