/**
 * Admin API - Orders
 *
 * GET /api/admin/orders
 * Returns orders with user information, pagination, and filtering
 *
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - pageSize: Items per page (default: 20, max: 100)
 *   - limit: Alias for pageSize (for backwards compatibility)
 *   - productType: Filter by product type (e.g., 'notice_only', 'complete_pack')
 *   - paymentStatus: Filter by payment status (e.g., 'paid', 'pending', 'failed', 'refunded')
 *   - sortBy: Sort field ('date' or 'amount', default: 'date')
 *   - sortOrder: Sort direction ('asc' or 'desc', default: 'desc')
 *   - search: Search by email or order ID
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const PRODUCT_NAMES: Record<string, string> = {
  notice_only: 'Notice Only Pack',
  complete_pack: 'Complete Eviction Pack',
  money_claim: 'Money Claim Pack',
  sc_money_claim: 'Simple Procedure Pack (Scotland)',
  ast_standard: 'Standard AST Agreement',
  ast_premium: 'Premium AST Agreement',
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    // Admin routes use service-role client to bypass RLS for platform metrics.
    const adminClient = createAdminClient();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(
      searchParams.get('pageSize') || searchParams.get('limit') || '20',
      10
    )));
    const productType = searchParams.get('productType');
    const paymentStatus = searchParams.get('paymentStatus');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');

    // Build query
    let query = adminClient
      .from('orders')
      .select('id, user_id, product_type, total_amount, payment_status, stripe_payment_intent_id, created_at', { count: 'exact' });

    // Apply filters
    if (productType && productType !== 'all') {
      query = query.eq('product_type', productType);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    // Apply sorting
    if (sortBy === 'amount') {
      query = query.order('total_amount', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Fetch user information for each order
    let ordersWithUsers = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: userData } = await adminClient
          .from('users')
          .select('email, full_name')
          .eq('id', order.user_id)
          .single();

        return {
          id: order.id,
          user_id: order.user_id,
          user_email: userData?.email || 'Unknown',
          user_name: userData?.full_name || null,
          product_name: PRODUCT_NAMES[order.product_type] || order.product_type,
          product_type: order.product_type,
          total_amount: order.total_amount,
          payment_status: order.payment_status,
          stripe_payment_intent_id: order.stripe_payment_intent_id,
          created_at: order.created_at,
        };
      })
    );

    // Apply search filter (client-side since we need user info)
    if (search) {
      const searchLower = search.toLowerCase();
      ordersWithUsers = ordersWithUsers.filter(
        (order) =>
          order.user_email?.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower)
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json(
      {
        success: true,
        orders: ordersWithUsers,
        meta: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
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

    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
