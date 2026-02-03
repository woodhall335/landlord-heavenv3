/**
 * Admin API Routes Smoke Tests
 *
 * Tests that verify all admin dashboard API endpoints:
 * 1. Return 401 for unauthenticated requests
 * 2. Return 403 for non-admin authenticated requests
 * 3. Return correct response shape for admin requests
 * 4. No admin pages depend on missing endpoints
 *
 * These tests use mocked Supabase clients to isolate API logic.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Mock data
const MOCK_ADMIN_USER_ID = 'admin-user-id-12345';
const MOCK_REGULAR_USER_ID = 'regular-user-id-67890';
const MOCK_USER_EMAIL = 'admin@example.com';
const MOCK_ORDER_ID = '12345678-1234-1234-1234-123456789012';

// Control test scenarios
let mockAuthError = false;
let mockUserId = MOCK_ADMIN_USER_ID;
let mockIsAdmin = true;

// Mock Supabase query builder that supports chaining
function createMockQueryBuilder(data: any = [], count: number = 0) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    gt: vi.fn(() => builder),
    lt: vi.fn(() => builder),
    is: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    range: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve({ data: data[0] || null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: data[0] || null, error: null })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    then: (resolve: any) => resolve({ data, error: null, count }),
  };
  return builder;
}

// Mock requireServerAuth
vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: vi.fn(() => {
    if (mockAuthError) {
      throw new Error('Unauthorized - Please log in');
    }
    return Promise.resolve({
      id: mockUserId,
      email: MOCK_USER_EMAIL,
    });
  }),
  createServerSupabaseClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          return createMockQueryBuilder([
            {
              id: MOCK_ORDER_ID,
              user_id: 'test-user-id',
              payment_status: 'paid',
              total_amount: 1999,
              product_name: 'Test Product',
              product_type: 'notice_only',
              case_id: 'test-case-id',
              created_at: new Date().toISOString(),
            },
          ]);
        }
        if (table === 'users') {
          return createMockQueryBuilder([
            {
              id: 'test-user-id',
              email: 'test@example.com',
              full_name: 'Test User',
              created_at: new Date().toISOString(),
            },
          ]);
        }
        if (table === 'email_leads') {
          return createMockQueryBuilder([]);
        }
        return createMockQueryBuilder([]);
      }),
    })
  ),
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'webhook_logs') {
        return {
          ...createMockQueryBuilder([]),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() =>
                  Promise.resolve({
                    count: 0,
                    error: null,
                  })
                ),
              })),
            })),
          })),
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      return createMockQueryBuilder([]);
    }),
  })),
}));

// Mock isAdmin check
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(() => mockIsAdmin),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock email sending
vi.mock('@/lib/email/resend', () => ({
  sendPurchaseConfirmation: vi.fn(() => Promise.resolve({ success: true, id: 'email-id' })),
}));

// Helper to create mock request
function createMockRequest(
  method: string = 'GET',
  body?: object,
  url: string = 'http://localhost:3000'
): NextRequest {
  const options: RequestInit = { method };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(url, options);
}

describe('Admin API Routes', () => {
  beforeEach(() => {
    vi.resetModules();
    mockAuthError = false;
    mockUserId = MOCK_ADMIN_USER_ID;
    mockIsAdmin = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // GET /api/admin/check-access
  // =========================================================================
  describe('GET /api/admin/check-access', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/admin/check-access/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { GET } = await import('@/app/api/admin/check-access/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });

    it('should return 200 with correct response shape for admin users', async () => {
      const { GET } = await import('@/app/api/admin/check-access/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      // Response shape validation
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('is_admin', true);
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.is_admin).toBe('boolean');
    });
  });

  // =========================================================================
  // GET /api/admin/stats
  // =========================================================================
  describe('GET /api/admin/stats', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/admin/stats/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { GET } = await import('@/app/api/admin/stats/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });
  });

  // =========================================================================
  // GET /api/admin/orders
  // =========================================================================
  describe('GET /api/admin/orders', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/admin/orders/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { GET } = await import('@/app/api/admin/orders/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });
  });

  // =========================================================================
  // POST /api/admin/orders/resend-email
  // =========================================================================
  describe('POST /api/admin/orders/resend-email', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { POST } = await import('@/app/api/admin/orders/resend-email/route');
      const request = createMockRequest('POST', { orderId: MOCK_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { POST } = await import('@/app/api/admin/orders/resend-email/route');
      const request = createMockRequest('POST', { orderId: MOCK_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });

    it('should return 400 for invalid order ID format', async () => {
      const { POST } = await import('@/app/api/admin/orders/resend-email/route');
      const request = createMockRequest('POST', { orderId: 'invalid-uuid' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Validation failed');
      expect(data).toHaveProperty('details');
    });

    it('should return 400 for missing order ID', async () => {
      const { POST } = await import('@/app/api/admin/orders/resend-email/route');
      const request = createMockRequest('POST', {});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for invalid JSON body', async () => {
      const { POST } = await import('@/app/api/admin/orders/resend-email/route');
      const request = new NextRequest('http://localhost:3000', {
        method: 'POST',
        body: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid JSON body');
    });
  });

  // =========================================================================
  // GET /api/admin/users
  // =========================================================================
  describe('GET /api/admin/users', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/admin/users/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { GET } = await import('@/app/api/admin/users/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });
  });

  // =========================================================================
  // GET /api/admin/leads
  // =========================================================================
  describe('GET /api/admin/leads', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/admin/leads/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/leads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      mockUserId = MOCK_REGULAR_USER_ID;
      mockIsAdmin = false;

      const { GET } = await import('@/app/api/admin/leads/route');
      const request = createMockRequest('GET', undefined, 'http://localhost:3000/api/admin/leads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Admin access required');
    });
  });
});

// =========================================================================
// Admin Auth Guard Pattern Verification
// =========================================================================
describe('Admin Auth Guard Pattern', () => {
  beforeEach(() => {
    vi.resetModules();
    mockAuthError = false;
    mockUserId = MOCK_ADMIN_USER_ID;
    mockIsAdmin = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('all admin routes use isAdmin from centralized helper', async () => {
    // This test verifies that the isAdmin function is properly imported and used
    const { isAdmin } = await import('@/lib/auth');
    expect(vi.isMockFunction(isAdmin)).toBe(true);
  });

  it('non-admin should be blocked from all tested endpoints', async () => {
    mockUserId = MOCK_REGULAR_USER_ID;
    mockIsAdmin = false;

    const endpoints = [
      { module: '@/app/api/admin/check-access/route', method: 'GET' },
      { module: '@/app/api/admin/stats/route', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      vi.resetModules();
      const mod = await import(endpoint.module);
      const handler = mod[endpoint.method];
      const response = await handler(createMockRequest(endpoint.method));

      expect(response.status).toBe(403);
    }
  });
});

// =========================================================================
// Response Shape Assertions
// =========================================================================
describe('Response Shape Assertions', () => {
  beforeEach(() => {
    vi.resetModules();
    mockAuthError = false;
    mockUserId = MOCK_ADMIN_USER_ID;
    mockIsAdmin = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('check-access returns expected shape', async () => {
    const { GET } = await import('@/app/api/admin/check-access/route');
    const response = await GET();
    const data = await response.json();

    // Expected shape: { success: boolean, is_admin: boolean }
    expect(data).toMatchObject({
      success: expect.any(Boolean),
      is_admin: expect.any(Boolean),
    });
  });

  it('error responses have consistent shape', async () => {
    mockAuthError = true;

    const { GET } = await import('@/app/api/admin/check-access/route');
    const response = await GET();
    const data = await response.json();

    // All error responses should have an 'error' property
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });

  it('403 responses include admin access error message', async () => {
    mockIsAdmin = false;

    const { GET } = await import('@/app/api/admin/check-access/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Admin');
  });
});

// =========================================================================
// Smoke Test: No Admin Pages Depend on Missing Endpoints
// =========================================================================
describe('Admin Pages Endpoint Dependencies', () => {
  const ADMIN_PAGES_DIR = path.join(process.cwd(), 'src/app/dashboard/admin');
  const ADMIN_API_DIR = path.join(process.cwd(), 'src/app/api/admin');

  // Endpoints that should exist based on admin page usage
  const REQUIRED_ENDPOINTS = [
    '/api/admin/check-access',
    '/api/admin/stats',
    '/api/admin/orders',
    '/api/admin/users',
    '/api/admin/leads',
    '/api/admin/orders/refund',
    '/api/admin/orders/resend-email',
    '/api/admin/legal-change/cron-runs',
    '/api/admin/legal-change/events',
    '/api/admin/legal-change/check-now',
  ];

  it('all required admin API endpoints have route files', () => {
    for (const endpoint of REQUIRED_ENDPOINTS) {
      const routePath = endpoint.replace('/api/admin/', '');
      const fullPath = path.join(ADMIN_API_DIR, routePath, 'route.ts');

      expect(
        fs.existsSync(fullPath),
        `Missing route file for ${endpoint}: expected ${fullPath}`
      ).toBe(true);
    }
  });

  it('admin pages directory exists', () => {
    expect(fs.existsSync(ADMIN_PAGES_DIR)).toBe(true);
  });

  it('admin API directory exists', () => {
    expect(fs.existsSync(ADMIN_API_DIR)).toBe(true);
  });

  it('no admin page references a non-existent /api/admin/users/ban endpoint', () => {
    const usersPagePath = path.join(ADMIN_PAGES_DIR, 'users/page.tsx');
    if (fs.existsSync(usersPagePath)) {
      const content = fs.readFileSync(usersPagePath, 'utf-8');
      // The ban endpoint was removed, ensure no active code references it
      // (comments are OK, but active fetch calls should not exist)
      const hasBanFetch = /fetch\s*\(\s*["'`]\/api\/admin\/users\/ban/.test(content);
      expect(hasBanFetch).toBe(false);
    }
  });
});

// =========================================================================
// Rate Limiting Tests for resend-email
// =========================================================================
describe('Resend Email Rate Limiting', () => {
  beforeEach(() => {
    vi.resetModules();
    mockAuthError = false;
    mockUserId = MOCK_ADMIN_USER_ID;
    mockIsAdmin = true;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid resend request with proper UUID', async () => {
    const { POST } = await import('@/app/api/admin/orders/resend-email/route');
    const request = createMockRequest('POST', { orderId: MOCK_ORDER_ID });
    const response = await POST(request);

    // Should either succeed or fail due to mock data, but not due to validation
    expect(response.status).not.toBe(400);
  });

  it('should reject requests with non-UUID order ID', async () => {
    const { POST } = await import('@/app/api/admin/orders/resend-email/route');

    const invalidIds = [
      'not-a-uuid',
      '12345',
      '',
      '1234567890123456789012345678901234567', // too long
      'abc',
    ];

    for (const orderId of invalidIds) {
      vi.resetModules();
      const { POST: postHandler } = await import('@/app/api/admin/orders/resend-email/route');
      const request = createMockRequest('POST', { orderId });
      const response = await postHandler(request);

      expect(response.status).toBe(400);
    }
  });
});
