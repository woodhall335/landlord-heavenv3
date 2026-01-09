/**
 * Tests for ensureUserProfileExists helper
 *
 * These tests verify that:
 * 1. User profile is created if it doesn't exist
 * 2. No error is thrown if user already exists
 * 3. Race conditions are handled gracefully
 * 4. Service role is used (bypasses RLS)
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the admin client before importing the module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGetUserById = vi.fn();

const mockAdminClient = {
  from: vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
  })),
  auth: {
    admin: {
      getUserById: mockGetUserById,
    },
  },
};

// Set up chained method returns
mockSelect.mockReturnValue({
  eq: mockEq,
});
mockEq.mockReturnValue({
  maybeSingle: mockMaybeSingle,
});

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(() => mockAdminClient),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
import {
  ensureUserProfileExists,
  ensureUserProfileExistsFromAuth,
} from '@/lib/supabase/ensure-user';

describe('ensureUserProfileExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
  });

  it('returns success with created=false if user already exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'existing-user-id' },
      error: null,
    });

    const result = await ensureUserProfileExists({
      userId: 'existing-user-id',
      email: 'existing@example.com',
    });

    expect(result).toEqual({
      success: true,
      created: false,
    });

    // Should not attempt to insert
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('creates user profile if it does not exist', async () => {
    // First call: user doesn't exist
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Insert succeeds
    mockInsert.mockResolvedValue({
      error: null,
    });

    const result = await ensureUserProfileExists({
      userId: 'new-user-id',
      email: 'new@example.com',
      fullName: 'New User',
      phone: '+1234567890',
    });

    expect(result).toEqual({
      success: true,
      created: true,
    });

    // Verify insert was called with correct data
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'new-user-id',
      email: 'new@example.com',
      full_name: 'New User',
      phone: '+1234567890',
    });
  });

  it('handles null optional fields correctly', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockInsert.mockResolvedValue({
      error: null,
    });

    await ensureUserProfileExists({
      userId: 'user-id',
      email: 'test@example.com',
      fullName: null,
      phone: null,
    });

    expect(mockInsert).toHaveBeenCalledWith({
      id: 'user-id',
      email: 'test@example.com',
      full_name: null,
      phone: null,
    });
  });

  it('handles race condition gracefully (duplicate key error)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Simulate duplicate key error from race condition
    mockInsert.mockResolvedValue({
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    });

    const result = await ensureUserProfileExists({
      userId: 'race-condition-user-id',
      email: 'race@example.com',
    });

    // Should still return success - another process created it
    expect(result).toEqual({
      success: true,
      created: false,
    });
  });

  it('returns error if select query fails', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const result = await ensureUserProfileExists({
      userId: 'user-id',
      email: 'test@example.com',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database connection failed');
  });

  it('returns error if insert fails with non-duplicate error', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockInsert.mockResolvedValue({
      error: {
        code: '23503',
        message: 'foreign key constraint violation',
      },
    });

    const result = await ensureUserProfileExists({
      userId: 'user-id',
      email: 'test@example.com',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('foreign key constraint violation');
  });
});

describe('ensureUserProfileExistsFromAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
  });

  it('returns success if user profile already exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'existing-user' },
      error: null,
    });

    const result = await ensureUserProfileExistsFromAuth('existing-user');

    expect(result).toEqual({
      success: true,
      created: false,
    });

    // Should not fetch auth user
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('fetches auth user and creates profile if not exists', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'new-user',
          email: 'auth@example.com',
          user_metadata: {
            full_name: 'Auth User',
            phone: '+9876543210',
          },
        },
      },
      error: null,
    });

    // Second call for the actual insert check
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    mockInsert.mockResolvedValue({
      error: null,
    });

    const result = await ensureUserProfileExistsFromAuth('new-user');

    expect(result.success).toBe(true);
    expect(mockGetUserById).toHaveBeenCalledWith('new-user');
  });

  it('returns error if auth user not found', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    mockGetUserById.mockResolvedValue({
      data: { user: null },
      error: { message: 'User not found' },
    });

    const result = await ensureUserProfileExistsFromAuth('nonexistent-user');

    expect(result.success).toBe(false);
    expect(result.error).toContain('User not found');
  });
});
