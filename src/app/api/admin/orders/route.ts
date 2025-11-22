/**
 * Admin API - Orders
 *
 * GET /api/admin/orders - List all orders with analytics
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
    const paymentStatus = searchParams.get('payment_status');
    const productType = searchParams.get('product_type');

    // Build query
    let query = supabase
      .from('orders')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false });

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (productType) {
      query = query.eq('product_type', productType);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter((o) => o.payment_status === 'paid').length || 0;
    const pendingOrders = orders?.filter((o) => o.payment_status === 'pending').length || 0;
    const failedOrders = orders?.filter((o) => o.payment_status === 'failed').length || 0;

    const totalRevenue = orders
      ?.filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0) || 0;

    // Product breakdown
    const productBreakdown = orders?.reduce((acc, order) => {
      const type = order.product_type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          revenue: 0,
        };
      }
      acc[type].count += 1;
      if (order.payment_status === 'paid') {
        acc[type].revenue += parseFloat(String(order.total_amount || 0));
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return NextResponse.json(
      {
        success: true,
        orders: orders || [],
        analytics: {
          total_orders: totalOrders,
          paid_orders: paidOrders,
          pending_orders: pendingOrders,
          failed_orders: failedOrders,
          total_revenue: totalRevenue,
          avg_order_value: paidOrders > 0 ? totalRevenue / paidOrders : 0,
          conversion_rate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
          product_breakdown: productBreakdown,
        },
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

    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
