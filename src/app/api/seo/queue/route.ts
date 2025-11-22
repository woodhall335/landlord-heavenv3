/**
 * SEO Content Queue API
 *
 * POST /api/seo/queue - Add content to generation queue
 * GET /api/seo/queue - Get queued items
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const QueueSchema = z.object({
  contentType: z.enum(['location_page', 'topic_page', 'guide', 'refresh']),
  targetKeyword: z.string(),
  location: z.string().optional(),
  jurisdiction: z.string().optional(),
  wordCountTarget: z.number().optional(),
  priority: z.number().min(1).max(10).optional(),
  scheduledFor: z.string().optional(),
});

// Add to queue
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(user.id)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = QueueSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    const { data: queueItem, error } = await supabase
      .from('seo_content_queue')
      .insert({
        content_type: params.contentType,
        target_keyword: params.targetKeyword,
        location: params.location,
        jurisdiction: params.jurisdiction || 'england-wales',
        word_count_target: params.wordCountTarget || 1500,
        priority: params.priority || 5,
        scheduled_for: params.scheduledFor || new Date().toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to queue content', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      queueItem,
    });
  } catch (error: any) {
    console.error('SEO queue error:', error);

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get queue
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(user.id)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data: queue, error } = await supabase
      .from('seo_content_queue')
      .select('*')
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      queue,
      total: queue.length,
    });
  } catch (error: any) {
    console.error('SEO queue fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
