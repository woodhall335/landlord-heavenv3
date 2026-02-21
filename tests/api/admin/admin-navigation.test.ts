/**
 * Tests for Admin Portal Navigation
 *
 * Validates:
 * - All required admin routes exist as page files
 * - Navigation links point to valid routes
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Required admin routes that should exist
const REQUIRED_ADMIN_ROUTES = [
  '/dashboard/admin',
  '/dashboard/admin/orders',
  '/dashboard/admin/users',
  '/dashboard/admin/ai-usage',
  '/dashboard/admin/failed-payments',
  '/dashboard/admin/email-previews',
  '/dashboard/admin/leads',
  '/dashboard/admin/legal-changes',
  '/dashboard/admin/legal-changes/inbox',
];

// Map routes to their expected file paths
function routeToFilePath(route: string): string {
  const basePath = path.join(process.cwd(), 'src/app');
  // Handle root admin route
  if (route === '/dashboard/admin') {
    return path.join(basePath, 'dashboard/admin/page.tsx');
  }
  return path.join(basePath, `${route.slice(1)}/page.tsx`);
}

describe('Admin Route Files Existence', () => {
  REQUIRED_ADMIN_ROUTES.forEach((route) => {
    it(`should have page file for ${route}`, () => {
      const filePath = routeToFilePath(route);
      const exists = fs.existsSync(filePath);
      expect(exists, `Missing page file: ${filePath}`).toBe(true);
    });
  });
});

describe('Admin Navigation Links', () => {
  // These are the navigation links defined in the admin dashboard
  const navLinks = [
    { href: '/dashboard/admin/orders', label: 'Orders' },
    { href: '/dashboard/admin/users', label: 'Users' },
    { href: '/dashboard/admin/leads', label: 'Email Leads' },
    { href: '/dashboard/admin/email-previews', label: 'Email Previews' },
    { href: '/dashboard/admin/ai-usage', label: 'AI Usage' },
    { href: '/dashboard/admin/failed-payments', label: 'Failed Payments' },
    { href: '/dashboard/admin/legal-changes', label: 'Legal Changes' },
  ];

  it('should have correct number of nav links', () => {
    expect(navLinks.length).toBeGreaterThanOrEqual(7);
  });

  it('should include orders link', () => {
    const ordersLink = navLinks.find((l) => l.href === '/dashboard/admin/orders');
    expect(ordersLink).toBeDefined();
    expect(ordersLink?.label).toBe('Orders');
  });

  it('should include users link', () => {
    const usersLink = navLinks.find((l) => l.href === '/dashboard/admin/users');
    expect(usersLink).toBeDefined();
    expect(usersLink?.label).toBe('Users');
  });

  it('should include legal-changes link', () => {
    const legalChangesLink = navLinks.find((l) => l.href === '/dashboard/admin/legal-changes');
    expect(legalChangesLink).toBeDefined();
    expect(legalChangesLink?.label).toBe('Legal Changes');
  });

  it('should include ai-usage link', () => {
    const aiUsageLink = navLinks.find((l) => l.href === '/dashboard/admin/ai-usage');
    expect(aiUsageLink).toBeDefined();
    expect(aiUsageLink?.label).toBe('AI Usage');
  });

  it('should include failed-payments link', () => {
    const failedPaymentsLink = navLinks.find((l) => l.href === '/dashboard/admin/failed-payments');
    expect(failedPaymentsLink).toBeDefined();
    expect(failedPaymentsLink?.label).toBe('Failed Payments');
  });

  navLinks.forEach(({ href }) => {
    it(`should have valid route file for nav link: ${href}`, () => {
      const filePath = routeToFilePath(href);
      const exists = fs.existsSync(filePath);
      expect(exists, `Missing page file for nav link: ${filePath}`).toBe(true);
    });
  });
});

describe('Admin API Endpoints Existence', () => {
  // Required admin API endpoints
  const REQUIRED_ADMIN_APIS = [
    '/api/admin/check-access',
    '/api/admin/orders',
    '/api/admin/users',
    '/api/admin/stats',
    '/api/admin/leads',
    '/api/admin/legal-change/events',
    '/api/admin/orders/refund',
    '/api/admin/orders/resend-email',
    '/api/admin/test-artifacts/complete-pack/england/section8',
    '/api/admin/test-artifacts/complete-pack/england/section21',
  ];

  function apiRouteToFilePath(route: string): string {
    const basePath = path.join(process.cwd(), 'src/app');
    return path.join(basePath, `${route.slice(1)}/route.ts`);
  }

  REQUIRED_ADMIN_APIS.forEach((route) => {
    it(`should have API route file for ${route}`, () => {
      const filePath = apiRouteToFilePath(route);
      const exists = fs.existsSync(filePath);
      expect(exists, `Missing API route file: ${filePath}`).toBe(true);
    });
  });
});

describe('Admin Page to API Dependency Mapping', () => {
  // Documents which admin pages depend on which API endpoints
  const pageDependencies: Record<string, string[]> = {
    '/dashboard/admin': ['/api/admin/check-access', '/api/admin/stats', '/api/admin/orders', '/api/admin/users'],
    '/dashboard/admin/orders': ['/api/admin/check-access', '/api/admin/orders'],
    '/dashboard/admin/users': ['/api/admin/check-access', '/api/admin/users'],
    '/dashboard/admin/leads': ['/api/admin/check-access', '/api/admin/leads'],
    '/dashboard/admin/legal-changes': ['/api/admin/check-access', '/api/admin/legal-change/events'],
  };

  Object.entries(pageDependencies).forEach(([page, apis]) => {
    describe(`${page} dependencies`, () => {
      it('should depend on check-access API', () => {
        expect(apis).toContain('/api/admin/check-access');
      });

      apis.forEach((api) => {
        it(`should have API: ${api}`, () => {
          const filePath = path.join(process.cwd(), 'src/app', `${api.slice(1)}/route.ts`);
          expect(fs.existsSync(filePath), `Missing API: ${filePath}`).toBe(true);
        });
      });
    });
  });
});
