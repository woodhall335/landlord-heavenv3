import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { normalizeMarketingGrowthEvent } from '@/lib/analytics/growth-events';

export const runtime = 'nodejs';

const marketingEventRequestSchema = z.object({
  eventName: z.string(),
  marketingSessionId: z.string().max(200),
  payload: z.record(z.unknown()).optional().default({}),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = marketingEventRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid analytics event' }, { status: 400 });
  }

  const event = normalizeMarketingGrowthEvent({
    eventName: parsed.data.eventName,
    marketingSessionId: parsed.data.marketingSessionId,
    payload: parsed.data.payload,
  });

  if (!event) {
    return NextResponse.json({ success: false, error: 'Unsupported analytics event' }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.from('marketing_events').insert({
      event_name: event.eventName,
      marketing_session_id: event.marketingSessionId,
      source_page: event.sourcePage,
      page_path: event.pagePath,
      page_type: event.pageType,
      intent: event.intent,
      cta_position: event.ctaPosition,
      destination: event.destination,
      recommended_product: event.recommendedProduct,
      product_clicked: event.productClicked,
      user_type: event.userType,
      tool_name: event.toolName,
      event_payload: event.eventPayload,
    });

    if (error) {
      console.warn('[analytics/events] Failed to persist marketing event', {
        eventName: event.eventName,
        code: error.code,
        message: error.message,
      });

      return NextResponse.json({ success: true, persisted: false }, { status: 202 });
    }

    return NextResponse.json({ success: true, persisted: true }, { status: 200 });
  } catch (error) {
    console.warn('[analytics/events] Analytics event ignored', error);
    return NextResponse.json({ success: true, persisted: false }, { status: 202 });
  }
}
