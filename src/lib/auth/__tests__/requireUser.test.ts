/**
 * Tests for requireUser auth guard
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock the supabase server module
vi.mock('@/lib/supabase/server', () => ({
  getServerUser: vi.fn(),
}));

import { requireUser, tryGetUser } from '../requireUser';
import { getServerUser } from '@/lib/supabase/server';

const mockGetServerUser = vi.mocked(getServerUser);

describe('requireUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns user when authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    };

    mockGetServerUser.mockResolvedValue(mockUser as any);

    const result = await requireUser();

    expect(result.user).toEqual(mockUser);
    expect(result.user.id).toBe('user-123');
  });

  it('throws 401 NextResponse when not authenticated', async () => {
    mockGetServerUser.mockResolvedValue(null);

    try {
      await requireUser();
      // Should not reach here
      expect.fail('Expected requireUser to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(NextResponse);
      const response = error as NextResponse;
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error).toBe('UNAUTHORIZED');
      expect(body.code).toBe('UNAUTHORIZED');
    }
  });
});

describe('tryGetUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns user when authenticated', async () => {
    const mockUser = { id: 'user-123' };
    mockGetServerUser.mockResolvedValue(mockUser as any);

    const result = await tryGetUser();

    expect(result).toEqual(mockUser);
  });

  it('returns null when not authenticated', async () => {
    mockGetServerUser.mockResolvedValue(null);

    const result = await tryGetUser();

    expect(result).toBeNull();
  });
});
