/**
 * Tests for dashboard link validity
 *
 * Ensures dashboard pages don't link to non-existent routes:
 * - No links to /docs (should be /help)
 * - No links to /support (should be /contact)
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const DASHBOARD_DIR = path.join(process.cwd(), 'src', 'app', 'dashboard');

describe('Dashboard Links Validity', () => {
  const dashboardFiles = [
    'page.tsx',
    'hmo/page.tsx',
    'cases/[id]/page.tsx',
  ];

  dashboardFiles.forEach((filePath) => {
    const fullPath = path.join(DASHBOARD_DIR, filePath);

    describe(`${filePath}`, () => {
      it('should not link to /docs (non-existent route)', () => {
        if (!fs.existsSync(fullPath)) {
          // Skip if file doesn't exist
          return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check for links to /docs (but not /docs/something specific or /dashboard)
        const docsLinkRegex = /href=["']\/docs["']/g;
        const matches = content.match(docsLinkRegex);

        expect(matches).toBeNull();
      });

      it('should not link to /support (non-existent route)', () => {
        if (!fs.existsSync(fullPath)) {
          return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check for links to /support
        const supportLinkRegex = /href=["']\/support["']/g;
        const matches = content.match(supportLinkRegex);

        expect(matches).toBeNull();
      });

      it('should use /help instead of /docs for documentation', () => {
        if (!fs.existsSync(fullPath)) {
          return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');

        // If the file has a "Need Help?" section, it should link to /help
        if (content.includes('Need Help?')) {
          expect(content).toContain('href="/help"');
        }
      });

      it('should use /contact instead of /support for support', () => {
        if (!fs.existsSync(fullPath)) {
          return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');

        // If the file has a support link, it should go to /contact
        if (content.includes('Contact Support')) {
          expect(content).toContain('href="/contact"');
        }
      });
    });
  });
});
