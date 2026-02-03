/**
 * Admin API - Ban/Unban User
 *
 * POST /api/admin/users/ban
 * Bans or unbans a user account
 *
 * Required: Admin authentication
 * Body: { userId: string, ban: boolean }
 *
 * NOTE: This endpoint requires the `is_banned` column to be added to the users table.
 * The UI handler for this feature is currently disabled (prefixed with _).
 * When enabling this feature:
 * 1. Add migration: ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
 * 2. Remove underscore from _handleBanUser in /dashboard/admin/users/page.tsx
 */

import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const banUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  ban: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireServerAuth();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(adminUser.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = banUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Feature not yet implemented - requires is_banned column migration
    // See file header comment for implementation steps
    return NextResponse.json(
      {
        error: 'Not implemented',
        message: 'User ban feature requires database migration. See route file for details.',
      },
      { status: 501 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
