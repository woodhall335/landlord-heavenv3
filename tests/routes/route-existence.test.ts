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

    it('should have /tools/validators page.tsx', () => {
      const validatorsPagePath = path.join(APP_DIR, 'tools', 'validators', 'page.tsx');
      const exists = fs.existsSync(validatorsPagePath);
      expect(exists).toBe(true);
    });
  });

  describe('Help and Support routes', () => {
    it('should have /help page.tsx', () => {
      const helpPagePath = path.join(APP_DIR, 'help', 'page.tsx');
      const exists = fs.existsSync(helpPagePath);
      expect(exists).toBe(true);
    });

    it('should have /contact page.tsx', () => {
      const contactPagePath = path.join(APP_DIR, 'contact', 'page.tsx');
      const exists = fs.existsSync(contactPagePath);
      expect(exists).toBe(true);
    });
  });

  describe('Dashboard routes', () => {
    it('should have /dashboard page.tsx', () => {
      const dashboardPagePath = path.join(APP_DIR, 'dashboard', 'page.tsx');
      const exists = fs.existsSync(dashboardPagePath);
      expect(exists).toBe(true);
    });

    it('should have /dashboard/cases page.tsx', () => {
      const casesPagePath = path.join(APP_DIR, 'dashboard', 'cases', 'page.tsx');
      const exists = fs.existsSync(casesPagePath);
      expect(exists).toBe(true);
    });
  });
});
