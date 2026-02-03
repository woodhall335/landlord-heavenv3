/**
 * Admin API - Check Access
 *
 * GET /api/admin/check-access
 * Verifies if the current user has admin access
 */

import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await requireServerAuth();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, is_admin: true },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Admin check access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
