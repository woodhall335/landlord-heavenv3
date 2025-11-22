/**
 * Admin API - Users
 *
 * GET /api/admin/users - List all users
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function requireAdmin(userId: string) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (!adminIds.includes(userId)) {
    throw new Error('Unauthorized - Admin access required');
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    await requireAdmin(user.id);

    const { searchParams } = new URL(request.url);
    const supabase = createAdminClient();

    // Optional filters
    const hmoProOnly = searchParams.get('hmo_pro') === 'true';
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (hmoProOnly) {
      query = query.eq('hmo_pro_active', true);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get case and order counts for each user
    const usersWithCounts = await Promise.all(
      (users || []).map(async (user) => {
        const [
          { count: casesCount },
          { count: ordersCount },
          { count: documentsCount },
        ] = await Promise.all([
          supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('payment_status', 'paid'),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        return {
          ...user,
          cases_count: casesCount || 0,
          orders_count: ordersCount || 0,
          documents_count: documentsCount || 0,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        users: usersWithCounts,
        count: usersWithCounts.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in' || error.message === 'Unauthorized - Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
