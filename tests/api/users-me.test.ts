/**
 * Tests for GET /api/users/me
 *
 * These tests verify that:
 * 1. Returns 401 when not authenticated
 * 2. Auto-creates missing user profile and returns 200
 * 3. Falls back to admin client when RLS blocks user client select
 * 4. Returns structured error when both clients fail
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock user data
const MOCK_USER_ID = 'test-user-id-12345';
const MOCK_USER_EMAIL = 'test@example.com';

// Track operations
let ensureProfileCalled = false;
let ensureProfileCreated = false;
let userClientSelectCalled = false;
let adminClientSelectCalled = false;

// Control test scenarios
let mockAuthError = false;
let mockEnsureSuccess = true;
let mockEnsureCreated = false;
let mockUserClientError: { code: string; message: string; hint?: string } | null = null;
let mockAdminClientError: { code: string; message: string } | null = null;

// Mock user profile
const mockUserProfile = {
  id: MOCK_USER_ID,
  email: MOCK_USER_EMAIL,
  full_name: 'Test User',
  phone: '+1234567890',
  subscription_tier: 'free',
  subscription_status: 'active',
  trial_ends_at: null,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock requireServerAuth
vi.mock('@/lib/supabase/server-auth', () => ({
  requireServerAuth: vi.fn(() => {
    if (mockAuthError) {
      throw new Error('Unauthorized - Please log in');
    }
    return Promise.resolve({
      id: MOCK_USER_ID,
      email: MOCK_USER_EMAIL,
    });
  }),
}));

// Mock ensureUserProfileExistsFromAuth
vi.mock('@/lib/supabase/ensure-user', () => ({
  ensureUserProfileExistsFromAuth: vi.fn(() => {
    ensureProfileCalled = true;
    if (!mockEnsureSuccess) {
      return Promise.resolve({
        success: false,
        created: false,
        error: 'Failed to check user existence: connection error',
      });
    }
    ensureProfileCreated = mockEnsureCreated;
    return Promise.resolve({
      success: true,
      created: mockEnsureCreated,
    });
  }),
}));

// Mock regular supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => {
              userClientSelectCalled = true;
              if (mockUserClientError) {
                return Promise.resolve({
                  data: null,
                  error: mockUserClientError,
                });
              }
              return Promise.resolve({
                data: mockUserProfile,
                error: null,
              });
            }),
          })),
        })),
      })),
    })
  ),
}));

// Mock admin supabase client
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => {
            adminClientSelectCalled = true;
            if (mockAdminClientError) {
              return Promise.resolve({
                data: null,
                error: mockAdminClientError,
              });
            }
            return Promise.resolve({
              data: mockUserProfile,
              error: null,
            });
          }),
        })),
      })),
    })),
  })),
}));

// Mock isAdmin check
vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(() => false),
}));

// Mock logger (to suppress output during tests)
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GET /api/users/me', () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset tracking variables
    ensureProfileCalled = false;
    ensureProfileCreated = false;
    userClientSelectCalled = false;
    adminClientSelectCalled = false;
    // Reset scenario controls
    mockAuthError = false;
    mockEnsureSuccess = true;
    mockEnsureCreated = false;
    mockUserClientError = null;
    mockAdminClientError = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockAuthError = true;

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(ensureProfileCalled).toBe(false);
    });

    it('should proceed with authenticated user', async () => {
      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(MOCK_USER_ID);
    });
  });

  describe('Missing Profile Auto-Creation', () => {
    it('should auto-create missing profile and return 200', async () => {
      mockEnsureCreated = true;

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(ensureProfileCalled).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(MOCK_USER_ID);
      expect(data.user.email).toBe(MOCK_USER_EMAIL);
    });

    it('should call ensureUserProfileExistsFromAuth before select', async () => {
      const { GET } = await import('@/app/api/users/me/route');

      await GET();

      expect(ensureProfileCalled).toBe(true);
      expect(userClientSelectCalled).toBe(true);
    });

    it('should return 500 if profile ensure fails', async () => {
      mockEnsureSuccess = false;

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to initialize user profile');
      expect(userClientSelectCalled).toBe(false);
    });
  });

  describe('RLS Fallback', () => {
    it('should fallback to admin client when user client fails with RLS error', async () => {
      mockUserClientError = {
        code: '42501',
        message: 'permission denied for table users',
        hint: 'Check RLS policies',
      };

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(userClientSelectCalled).toBe(true);
      expect(adminClientSelectCalled).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(MOCK_USER_ID);
    });

    it('should fallback to admin client when user client returns PGRST116 (no rows)', async () => {
      mockUserClientError = {
        code: 'PGRST116',
        message: 'JSON object requested, but multiple (or no) rows returned',
      };

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(adminClientSelectCalled).toBe(true);
      expect(data.user.id).toBe(MOCK_USER_ID);
    });

    it('should return 500 if both user and admin clients fail', async () => {
      mockUserClientError = {
        code: '42501',
        message: 'permission denied for table users',
      };
      mockAdminClientError = {
        code: 'PGRST116',
        message: 'JSON object requested, but no rows returned',
      };

      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to fetch user profile');
      expect(userClientSelectCalled).toBe(true);
      expect(adminClientSelectCalled).toBe(true);
    });
  });

  describe('Response Structure', () => {
    it('should return only safe fields', async () => {
      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        id: MOCK_USER_ID,
        email: MOCK_USER_EMAIL,
        full_name: 'Test User',
        phone: '+1234567890',
        subscription_tier: 'free',
        subscription_status: 'active',
        trial_ends_at: null,
        created_at: '2024-01-01T00:00:00Z',
        is_admin: false,
      });
    });

    it('should not expose sensitive internal fields', async () => {
      const { GET } = await import('@/app/api/users/me/route');

      const response = await GET();
      const data = await response.json();

      // These fields should not be in the response
      expect(data.user.password).toBeUndefined();
      expect(data.user.stripe_customer_id).toBeUndefined();
      expect(data.user.deleted_at).toBeUndefined();
    });
  });
});
