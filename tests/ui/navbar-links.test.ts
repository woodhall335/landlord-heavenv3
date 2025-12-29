/**
 * Tests for NavBar links
 *
 * Ensures NavBar links point to valid routes
 */

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const NAVBAR_PATH = path.join(process.cwd(), 'src', 'components', 'ui', 'NavBar.tsx');

describe('NavBar Links', () => {
  const navbarContent = fs.readFileSync(NAVBAR_PATH, 'utf-8');

  describe('Free Tools links', () => {
    it('should have /tools in freeToolsLinks', () => {
      expect(navbarContent).toContain('href: "/tools"');
    });

    it('should have "All Free Tools" label for /tools', () => {
      expect(navbarContent).toContain('label: "All Free Tools"');
    });

    it('should link to /tools/validators', () => {
      expect(navbarContent).toContain('href: "/tools/validators"');
    });

    it('should link to existing tool routes', () => {
      const toolRoutes = [
        '/tools/free-section-21-notice-generator',
        '/tools/free-section-8-notice-generator',
        '/tools/rent-arrears-calculator',
        '/tools/hmo-license-checker',
        '/tools/free-rent-demand-letter',
      ];

      toolRoutes.forEach((route) => {
        expect(navbarContent).toContain(`href: "${route}"`);
      });
    });
  });

  describe('Product links', () => {
    it('should link to product pages', () => {
      const productRoutes = [
        '/products/notice-only',
        '/products/complete-pack',
        '/products/money-claim',
        '/products/ast',
      ];

      productRoutes.forEach((route) => {
        expect(navbarContent).toContain(`href: "${route}"`);
      });
    });
  });
});
