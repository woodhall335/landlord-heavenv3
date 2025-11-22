/**
 * Admin API - Statistics
 *
 * GET /api/admin/stats
 * Returns platform-wide statistics for admin dashboard
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Simple admin check - in production, add proper admin role verification
async function requireAdmin(userId: string) {
  // TODO: Add proper admin role check from database
  // For now, check against ADMIN_USER_IDS environment variable
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (!adminIds.includes(userId)) {
    throw new Error('Unauthorized - Admin access required');
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    await requireAdmin(user.id);

    const supabase = createAdminClient();

    // Fetch all data with admin privileges
    const [
      { data: users },
      { data: cases },
      { data: documents },
      { data: orders },
      { data: properties },
      { data: tenants },
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('cases').select('*'),
      supabase.from('documents').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('hmo_properties').select('*'),
      supabase.from('hmo_tenants').select('*'),
    ]);

    // User statistics
    const totalUsers = users?.length || 0;
    const hmoProUsers = users?.filter((u) => u.hmo_pro_active).length || 0;
    const usersThisMonth = users?.filter((u) => {
      const createdAt = new Date(u.created_at);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length || 0;

    // Case statistics
    const totalCases = cases?.length || 0;
    const inProgressCases = cases?.filter((c) => c.status === 'in_progress').length || 0;
    const completedCases = cases?.filter((c) => c.status === 'completed').length || 0;

    // Case type breakdown
    const evictionCases = cases?.filter((c) => c.case_type === 'eviction').length || 0;
    const moneyClaimCases = cases?.filter((c) => c.case_type === 'money_claim').length || 0;
    const tenancyAgreementCases = cases?.filter((c) => c.case_type === 'tenancy_agreement').length || 0;

    // Jurisdiction breakdown
    const englandWalesCases = cases?.filter((c) => c.jurisdiction === 'england-wales').length || 0;
    const scotlandCases = cases?.filter((c) => c.jurisdiction === 'scotland').length || 0;
    const northernIrelandCases = cases?.filter((c) => c.jurisdiction === 'northern-ireland').length || 0;

    // Document statistics
    const totalDocuments = documents?.length || 0;
    const previewDocuments = documents?.filter((d) => d.is_preview).length || 0;
    const finalDocuments = documents?.filter((d) => !d.is_preview).length || 0;

    // Order statistics
    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter((o) => o.payment_status === 'paid').length || 0;
    const pendingOrders = orders?.filter((o) => o.payment_status === 'pending').length || 0;

    // Revenue calculation
    const totalRevenue = orders
      ?.filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0) || 0;

    const revenueThisMonth = orders
      ?.filter((o) => {
        if (o.payment_status !== 'paid' || !o.paid_at) return false;
        const paidAt = new Date(o.paid_at);
        const now = new Date();
        return paidAt.getMonth() === now.getMonth() && paidAt.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0) || 0;

    // HMO statistics
    const totalProperties = properties?.length || 0;
    const totalTenants = tenants?.filter((t) => t.tenancy_status === 'active').length || 0;

    // Recent activity
    const recentUsers = users
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        hmo_pro_active: u.hmo_pro_active,
        created_at: u.created_at,
      }));

    const recentOrders = orders
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        user_id: o.user_id,
        product_name: o.product_name,
        total_amount: o.total_amount,
        payment_status: o.payment_status,
        created_at: o.created_at,
      }));

    return NextResponse.json(
      {
        success: true,
        stats: {
          users: {
            total: totalUsers,
            hmo_pro_active: hmoProUsers,
            new_this_month: usersThisMonth,
          },
          cases: {
            total: totalCases,
            in_progress: inProgressCases,
            completed: completedCases,
            by_type: {
              eviction: evictionCases,
              money_claim: moneyClaimCases,
              tenancy_agreement: tenancyAgreementCases,
            },
            by_jurisdiction: {
              england_wales: englandWalesCases,
              scotland: scotlandCases,
              northern_ireland: northernIrelandCases,
            },
          },
          documents: {
            total: totalDocuments,
            preview: previewDocuments,
            final: finalDocuments,
          },
          orders: {
            total: totalOrders,
            paid: paidOrders,
            pending: pendingOrders,
          },
          revenue: {
            total: totalRevenue,
            this_month: revenueThisMonth,
            avg_order_value: paidOrders > 0 ? totalRevenue / paidOrders : 0,
          },
          hmo: {
            properties: totalProperties,
            active_tenants: totalTenants,
          },
        },
        recent: {
          users: recentUsers,
          orders: recentOrders,
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

    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
