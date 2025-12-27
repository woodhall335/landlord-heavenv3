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

// Legacy template paths that should NOT be used anywhere in runtime code
const LEGACY_SECTION_8_TEMPLATE = 'uk/england/templates/eviction/section8_notice.hbs';
const LEGACY_SECTION_21_TEMPLATE = 'uk/england/templates/eviction/section21_form6a.hbs';

// Banned patterns for jurisdiction separation
const BANNED_PATTERNS = [
  'england-wales',
  'uk/england-wales/',
  'uk/england/templates/eviction/section8_notice.hbs',
  'uk/england/templates/eviction/section21_form6a.hbs',
];

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

  describe('No runtime references to legacy templates', () => {
    // Helper to recursively find all .ts/.tsx files
    function findTsFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findTsFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    // Allowlist for legitimate uses (display labels, type definitions, migration handlers)
    function isAllowedOccurrence(filePath: string, line: string, pattern: string): boolean {
      // Test files are testing legacy handling - allowed
      if (filePath.includes('.test.ts') || filePath.includes('.test.tsx') || filePath.includes('__tests__')) return true;

      // Display label maps
      if (line.includes("'england-wales':") || line.includes('"england-wales":')) return true;
      if (line.includes('England & Wales') || line.includes('England &amp; Wales')) return true;

      // Type definitions
      if (line.includes('LegacyJurisdiction') || line.includes("| 'england-wales'") || line.includes('| "england-wales"')) return true;

      // Migration/normalization code
      if (filePath.includes('jurisdiction.ts') || filePath.includes('validator') || filePath.includes('migration')) return true;
      if (line.includes('Legacy') || line.includes('legacy')) return true;

      // Comparison checks for handling legacy inputs
      if (line.includes("=== 'england-wales'") || line.includes("=== \"england-wales\"")) return true;
      if (line.includes("case 'england-wales'") || line.includes('case "england-wales"')) return true;

      // URL slugs and page routes
      if (filePath.includes('/tenancy-agreements/england-wales/')) return true;
      if (line.includes('href=') || line.includes('url:') || line.includes('Link href')) return true;

      // Database schema comments
      if (filePath.includes('database-types.ts') || filePath.includes('supabase')) return true;

      // Law monitor (references legacy for monitoring)
      if (filePath.includes('law-monitor')) return true;

      // Ask heaven (experimental)
      if (filePath.includes('ask-heaven')) return true;

      // Comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return true;

      return false;
    }

    test('ZERO runtime references to legacy eviction/section8_notice.hbs in src/', () => {
      const srcDir = path.join(process.cwd(), 'src');
      const tsFiles = findTsFiles(srcDir);
      const violations: string[] = [];

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes(LEGACY_SECTION_8_TEMPLATE)) {
          const relativePath = path.relative(srcDir, filePath);
          violations.push(relativePath);
        }
      }

      expect(violations).toEqual([]);
    });

    test('ZERO runtime references to legacy eviction/section21_form6a.hbs in src/', () => {
      const srcDir = path.join(process.cwd(), 'src');
      const tsFiles = findTsFiles(srcDir);
      const violations: string[] = [];

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Exclude Wales path references which are a different file
        if (content.includes(LEGACY_SECTION_21_TEMPLATE) && !content.includes('uk/wales/templates/eviction/section21_form6a.hbs')) {
          const relativePath = path.relative(srcDir, filePath);
          violations.push(relativePath);
        }
      }

      expect(violations).toEqual([]);
    });

    test('ZERO unallowed runtime references to "england-wales" patterns in src/', () => {
      const srcDir = path.join(process.cwd(), 'src');
      const tsFiles = findTsFiles(srcDir);
      const violations: string[] = [];

      for (const filePath of tsFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          for (const pattern of BANNED_PATTERNS) {
            if (line.includes(pattern) && !isAllowedOccurrence(filePath, line, pattern)) {
              const relativePath = path.relative(srcDir, filePath);
              violations.push(`${relativePath}:${i + 1}: ${line.trim().substring(0, 100)}`);
            }
          }
        }
      }

      if (violations.length > 0) {
        console.error('Found unallowed england-wales references:');
        violations.forEach(v => console.error(`  - ${v}`));
      }
      expect(violations).toEqual([]);
    });
  });

  describe('Canonical templates exist on disk', () => {
    test('Section 8 canonical template exists: form_3_section8/notice.hbs', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs'
      );
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    test('Section 21 canonical template exists: form_6a_section21/notice.hbs', () => {
      const templatePath = path.join(
        process.cwd(),
        'config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs'
      );
      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });
});
