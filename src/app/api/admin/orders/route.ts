/**
 * Admin API - Orders
 *
 * GET /api/admin/orders?limit=10
 * Returns recent orders with user information
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
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
    const supabase = await createServerSupabaseClient();

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch recent orders - use correct field names from schema
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, product_type, total_amount, payment_status, stripe_payment_intent_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Fetch user information for each order
    const ordersWithUsers = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: userData } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', order.user_id)
          .single();

        return {
          id: order.id,
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

    return NextResponse.json(
      {
        success: true,
        orders: ordersWithUsers,
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
