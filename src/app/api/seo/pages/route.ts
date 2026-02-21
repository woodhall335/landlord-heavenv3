/**
 * SEO Pages API
 *
 * GET /api/seo/pages - List all SEO pages
 * POST /api/seo/pages - Create SEO page (manual)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

// Get all SEO pages
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (with proper trimming of env var)
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const contentType = searchParams.get('content_type');
    const jurisdiction = searchParams.get('jurisdiction');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabase
      .from('seo_pages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (jurisdiction) {
      query = query.eq('jurisdiction', jurisdiction);
    }

    const { data: pages, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SEO pages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pages,
      total: count,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('SEO pages fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
