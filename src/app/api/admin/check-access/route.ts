/**
 * Admin Access Check API - Verify Admin Permissions
 *
 * GET /api/admin/check-access - Check if current user has admin access
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();

    // Get admin user IDs from environment variable
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];

    // Check if current user is in admin list
    const isAdmin = adminUserIds.includes(user.id);

    if (!isAdmin) {
      return NextResponse.json(
        {
          isAdmin: false,
          error: 'Access denied. Admin privileges required.'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
      userId: user.id,
      message: 'Admin access granted',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
