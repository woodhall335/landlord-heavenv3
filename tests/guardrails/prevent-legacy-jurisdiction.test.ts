import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Guardrail test to prevent reintroduction of "england-wales" as a jurisdiction value
 * in code paths that build NEW inputs (CaseFacts creation, decision-engine inputs, etc.)
 *
 * Allowed occurrences:
 * - Tests (*.test.ts, *.test.tsx, __tests__/)
 * - URL paths and slugs (url:, href=, import paths with /england-wales/)
 * - Display label maps (object literals mapping jurisdiction to display names)
 * - Template file paths (template/ references)
 * - Schema/database comments
 * - Type definitions (type Jurisdiction, union types)
 * - Normalization/validator code (handles legacy inputs)
 * - SEO metadata
 */
describe('Legacy Jurisdiction Guardrails', () => {
  it('should not allow "england-wales" in code paths that build new inputs', () => {
    // Search for "england-wales" in source code
    let grepResults: string;
    try {
      grepResults = execSync(
        `grep -r "england-wales" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules`,
        { encoding: 'utf-8', cwd: process.cwd() }
      );
    } catch (error: any) {
      // grep exits with code 1 when no matches found (which is good!)
      if (error.status === 1) {
        grepResults = '';
      } else {
        throw error;
      }
    }

    if (!grepResults) {
      // No occurrences found - test passes
      return;
    }

    const lines = grepResults.split('\n').filter(Boolean);
    const violations: string[] = [];

    for (const line of lines) {
      const [filePath, ...contentParts] = line.split(':');
      const content = contentParts.join(':');

      // Allowlist: Test files
      if (
        filePath.includes('.test.ts') ||
        filePath.includes('.test.tsx') ||
        filePath.includes('__tests__/')
      ) {
        continue;
      }

      // Allowlist: URL paths and slugs (url:, href=, import paths)
      if (
        content.includes('url:') ||
        content.includes('href=') ||
        content.includes('/england-wales/') ||
        content.includes("'@/config/jurisdictions/uk/england-wales") ||
        content.includes('"@/config/jurisdictions/uk/england-wales') ||
        content.includes('import ') ||
        content.includes('Link href')
      ) {
        continue;
      }

      // Allowlist: Display label object literals (e.g., 'england-wales': 'England & Wales')
      if (
        content.includes("'england-wales':") ||
        content.includes('"england-wales":') ||
        content.includes('England & Wales') ||
        content.includes('England &amp; Wales')
      ) {
        continue;
      }

      // Allowlist: Template file paths
      if (
        content.includes('template/') ||
        content.includes('.hbs') ||
        content.includes('templatePath')
      ) {
        continue;
      }

      // Allowlist: Comments and JSDoc
      if (
        content.trim().startsWith('//') ||
        content.trim().startsWith('*') ||
        content.trim().startsWith('/**') ||
        content.includes('@deprecated')
      ) {
        continue;
      }

      // Allowlist: Type definitions
      if (
        content.includes('type Jurisdiction') ||
        content.includes('LegacyJurisdiction') ||
        content.includes('| "england-wales"') ||
        content.includes('normalized ===')
      ) {
        continue;
      }

      // Allowlist: Normalization/validation code (handles legacy inputs)
      if (
        filePath.includes('normalize') ||
        filePath.includes('validator') ||
        filePath.includes('migration') ||
        filePath.includes('jurisdiction.ts') ||
        content.includes('deriveCanonicalJurisdiction') ||
        content.includes('normalizeJurisdiction') ||
        content.includes('Legacy') ||
        content.includes('legacy')
      ) {
        continue;
      }

      // Allowlist: Database schema comments
      if (
        filePath.includes('database-types.ts') ||
        filePath.includes('supabase')
      ) {
        continue;
      }

      // Allowlist: Law monitor (references legacy jurisdictions for monitoring)
      if (filePath.includes('law-monitor')) {
        continue;
      }

      // Allowlist: Ask Heaven (experimental tool - will be cleaned separately)
      if (filePath.includes('ask-heaven')) {
        continue;
      }

      // Allowlist: Comparison checks (handling legacy inputs)
      // e.g., "if (jurisdiction === 'england-wales')" or "case 'england-wales':"
      if (
        content.includes('===') ||
        content.includes('!==') ||
        content.includes('case ') ||
        content.includes('switch') ||
        content.includes('||') ||
        content.includes('?')
      ) {
        continue;
      }

      // Allowlist: String unions/arrays (not creating new instances)
      if (
        content.includes('[') ||
        content.includes(']') ||
        content.includes('Array.isArray')
      ) {
        continue;
      }

      // If we got here, this is a potential violation
      violations.push(`${filePath}: ${content.trim()}`);
    }

    // Report violations
    if (violations.length > 0) {
      const errorMessage = [
        '❌ Found "england-wales" in code paths that build new inputs!',
        '',
        'The following occurrences are NOT in allowed categories:',
        ...violations.map(v => `  - ${v}`),
        '',
        'Allowed categories:',
        '  - Tests (*.test.ts, *.test.tsx)',
        '  - URL paths (url:, href=, /england-wales/)',
        '  - Display labels (object literals with display names)',
        '  - Type definitions (type Jurisdiction, union types)',
        '  - Normalization/validator code',
        '  - Database schema comments',
        '',
        'Action required:',
        '  - If this is a new input path, use canonical jurisdictions: "england", "wales"',
        '  - If this is a display label, use an object literal: {\'england-wales\': \'England & Wales\'}',
        '  - If this handles legacy inputs, move to normalization/validator code',
      ].join('\n');

      throw new Error(errorMessage);
    }
  });
});
