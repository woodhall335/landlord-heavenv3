/**
 * Admin API - Growth Report
 *
 * GET /api/admin/growth?days=7|30
 * Returns revenue and funnel rates for the SEO -> tool/bridge -> product -> checkout path.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { buildGrowthReport, normalizeGrowthReportDays } from '@/lib/marketing/growth-report';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const days = normalizeGrowthReportDays(request.nextUrl.searchParams.get('days'));
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const adminClient = createAdminClient();

    const [ordersResult, eventsResult] = await Promise.all([
      adminClient
        .from('orders')
        .select('id, product_type, total_amount, payment_status, created_at, paid_at, landing_path, utm_source, utm_medium, referrer, marketing_session_id')
        .gte('created_at', since.toISOString()),
      adminClient
        .from('marketing_events')
        .select('event_name, marketing_session_id, source_page, page_path, page_type, intent, cta_position, destination, recommended_product, product_clicked, user_type, tool_name, created_at')
        .gte('created_at', since.toISOString()),
    ]);

    if (ordersResult.error) {
      console.error('[admin/growth] Failed to fetch orders:', ordersResult.error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (eventsResult.error) {
      console.error('[admin/growth] Failed to fetch marketing events:', eventsResult.error);
      return NextResponse.json({ error: 'Failed to fetch marketing events' }, { status: 500 });
    }

    return NextResponse.json(
      buildGrowthReport({
        orders: ordersResult.data || [],
        events: eventsResult.data || [],
        days,
      })
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[admin/growth] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
