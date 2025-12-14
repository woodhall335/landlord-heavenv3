/**
 * Admin API - Platform Statistics
 *
 * GET /api/admin/stats
 * Returns comprehensive platform statistics for admin dashboard
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Get date ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // Fetch users stats
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email_verified, created_at');

    const totalUsers = allUsers?.length || 0;
    const verifiedUsers = allUsers?.filter((u: any) => u.email_verified).length || 0;
    const newUsersThisMonth = allUsers?.filter(
      (u: any) => new Date(u.created_at) >= new Date(startOfThisMonth)
    ).length || 0;

    // Fetch active subscribers
    const { data: subscribers } = await supabase
      .from('hmo_subscriptions')
      .select('user_id')
      .eq('status', 'active');

    const totalSubscribers = subscribers?.length || 0;

    // Fetch cases stats
    const { data: allCases } = await supabase
      .from('cases')
      .select('case_type, status');

    const totalCases = allCases?.length || 0;
    const casesByType: Record<string, number> = {};
    const casesByStatus: Record<string, number> = {};

    allCases?.forEach((c: any) => {
      casesByType[c.case_type] = (casesByType[c.case_type] || 0) + 1;
      casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
    });

    // Fetch documents stats
    const { data: allDocuments } = await supabase
      .from('documents')
      .select('is_preview');

    const totalDocuments = allDocuments?.length || 0;
    const previewDocuments = allDocuments?.filter((d: any) => d.is_preview).length || 0;
    const finalDocuments = totalDocuments - previewDocuments;

    // Fetch revenue stats
    const { data: allOrders } = await supabase
      .from('orders')
      .select('amount, status, created_at')
      .eq('status', 'succeeded');

    const totalRevenue = allOrders?.reduce((sum: number, o: any) => sum + o.amount, 0) || 0;
    const revenueThisMonth = allOrders
      ?.filter((o: any) => new Date(o.created_at) >= new Date(startOfThisMonth))
      .reduce((sum: number, o: any) => sum + o.amount, 0) || 0;
    const revenueLastMonth = allOrders
      ?.filter(
        (o: any) =>
          new Date(o.created_at) >= new Date(startOfLastMonth) &&
          new Date(o.created_at) <= new Date(endOfLastMonth)
      )
      .reduce((sum: number, o: any) => sum + o.amount, 0) || 0;

    // Calculate MRR from subscriptions (assuming £9.99/month for HMO Pro)
    const subscriptionsMRR = totalSubscribers * 999; // £9.99 in pence

    // Fetch AI usage stats
    const { data: allAIUsage } = await supabase
      .from('ai_usage_logs')
      .select('input_tokens, output_tokens, total_cost_usd, created_at');

    const totalTokens = allAIUsage?.reduce(
      (sum: number, u: any) => sum + (u.input_tokens || 0) + (u.output_tokens || 0),
      0
    ) || 0;
    const totalCostUSD = allAIUsage?.reduce(
      (sum: number, u: any) => sum + (u.total_cost_usd || 0),
      0
    ) || 0;
    const thisMonthCostUSD = allAIUsage
      ?.filter((u: any) => new Date(u.created_at) >= new Date(startOfThisMonth))
      .reduce((sum: number, u: any) => sum + (u.total_cost_usd || 0), 0) || 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          users: {
            total: totalUsers,
            verified: verifiedUsers,
            subscribers: totalSubscribers,
            new_this_month: newUsersThisMonth,
          },
          cases: {
            total: totalCases,
            by_type: casesByType,
            by_status: casesByStatus,
          },
          documents: {
            total: totalDocuments,
            previews: previewDocuments,
            final: finalDocuments,
          },
          revenue: {
            total_all_time: totalRevenue,
            this_month: revenueThisMonth,
            last_month: revenueLastMonth,
            subscriptions_mrr: subscriptionsMRR,
          },
          ai_usage: {
            total_tokens: totalTokens,
            total_cost_usd: totalCostUSD,
            this_month_cost: thisMonthCostUSD,
          },
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

    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
