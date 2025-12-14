/**
 * Admin API - Users
 *
 * GET /api/admin/users?limit=10
 * Returns recent users with subscription information
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();

    // Check if user is admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch recent users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, email_verified, created_at, last_sign_in_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Fetch subscription information for each user
    const usersWithSubscriptions = await Promise.all(
      (users || []).map(async (u) => {
        const { data: subData } = await supabase
          .from('hmo_subscriptions')
          .select('tier, status')
          .eq('user_id', u.id)
          .eq('status', 'active')
          .single();

        return {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          email_verified: u.email_verified,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          subscription_tier: subData?.tier || null,
          subscription_status: subData?.status || null,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        users: usersWithSubscriptions,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
