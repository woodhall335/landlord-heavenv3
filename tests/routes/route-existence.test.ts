/**
 * Tests for route existence
 *
 * Ensures that routes linked from the UI actually exist:
 * - /tools page exists (linked from NavBar)
 * - /help page exists
 * - /contact page exists
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

describe('Route Existence', () => {
  describe('Tools routes', () => {
    it('should have /tools page.tsx (linked from NavBar)', () => {
      const toolsPagePath = path.join(APP_DIR, 'tools', 'page.tsx');
      const exists = fs.existsSync(toolsPagePath);
      expect(exists).toBe(true);
    });

    it('should not keep retired validator or generator page files', () => {
      const retiredPagePaths = [
        path.join(APP_DIR, 'tools', 'validators', 'page.tsx'),
        path.join(APP_DIR, 'tools', 'validators', 'section-21', 'page.tsx'),
        path.join(APP_DIR, 'tools', 'validators', 'section-8', 'page.tsx'),
        path.join(APP_DIR, 'tools', 'free-section-21-notice-generator', 'page.tsx'),
        path.join(APP_DIR, 'tools', 'free-section-8-notice-generator', 'page.tsx'),
      ];

      retiredPagePaths.forEach((retiredPath) => {
        expect(fs.existsSync(retiredPath)).toBe(false);
      });
    });
  });

  describe('Help and Support routes', () => {
    it('should have /help page.tsx', () => {
      const helpPagePath = path.join(APP_DIR, '(marketing)', 'help', 'page.tsx');
      const exists = fs.existsSync(helpPagePath);
      expect(exists).toBe(true);
    });

    it('should have /contact page.tsx', () => {
      const contactPagePath = path.join(APP_DIR, '(marketing)', 'contact', 'page.tsx');
      const exists = fs.existsSync(contactPagePath);
      expect(exists).toBe(true);
    });
  });

  describe('Dashboard routes', () => {
    it('should have /dashboard page.tsx', () => {
      const dashboardPagePath = path.join(APP_DIR, '(app)', 'dashboard', 'page.tsx');
      const exists = fs.existsSync(dashboardPagePath);
      expect(exists).toBe(true);
    });

    it('should have /dashboard/cases page.tsx', () => {
      const casesPagePath = path.join(APP_DIR, '(app)', 'dashboard', 'cases', 'page.tsx');
      const exists = fs.existsSync(casesPagePath);
      expect(exists).toBe(true);
    });
  });
});
