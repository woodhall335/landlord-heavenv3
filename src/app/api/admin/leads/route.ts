/**
 * Admin API - Email Leads/Subscribers
 *
 * GET /api/admin/leads
 * Returns list of email subscribers with filtering and pagination
 *
 * Query params:
 * - limit: number (default 50, max 500)
 * - offset: number (default 0)
 * - source: string (filter by source)
 * - search: string (search email)
 * - format: 'json' | 'csv' (default json)
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface EmailSubscriber {
  email: string;
  source?: string;
  jurisdiction?: string;
  tags?: string[];
  created_at: string;
  last_seen_at?: string;
}

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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const format = searchParams.get('format') || 'json';

    // Build query
    let query = supabase
      .from('email_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (source) {
      query = query.eq('source', source);
    }
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: leads, count, error } = await query as { data: EmailSubscriber[] | null; count: number | null; error: any };

    if (error) {
      console.error('[admin/leads] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    // Get unique sources for filter dropdown
    const { data: sources } = await supabase
      .from('email_subscribers')
      .select('source')
      .not('source', 'is', null);

    const uniqueSources = [...new Set(sources?.map((s) => s.source).filter(Boolean))];

    // Get stats
    const { count: totalCount } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const { count: weekCount } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeek.toISOString());

    // Handle CSV export
    if (format === 'csv') {
      const csvRows = [
        ['Email', 'Source', 'Jurisdiction', 'Tags', 'Created At', 'Last Seen'].join(','),
        ...(leads || []).map((lead) =>
          [
            lead.email,
            lead.source || '',
            lead.jurisdiction || '',
            (lead.tags || []).join(';'),
            lead.created_at,
            lead.last_seen_at || '',
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(',')
        ),
      ];

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      stats: {
        total: totalCount || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
      },
      filters: {
        sources: uniqueSources,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[admin/leads] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
