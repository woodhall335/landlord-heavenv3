import { NextRequest, NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email/resend';
import {
  RECOVERY_UNSUBSCRIBED_EVENT,
  isRecoveryUnsubscribedFromEvents,
} from '@/lib/recovery/unsubscribe';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

type EmailEventRow = {
  id: string;
  email: string;
  event_type?: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
};

const QUEUED_EVENT = 'rent_checker_followup_queued';
const SENT_EVENT = 'rent_checker_followup_sent';
const FAILED_EVENT = 'rent_checker_followup_failed';
const SUPPRESSION_EVENTS = [
  RECOVERY_UNSUBSCRIBED_EVENT,
  SENT_EVENT,
  'purchase_completed',
  'checkout_completed',
  'order_completed',
] as const;

function verifyCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const keyParam = request.nextUrl.searchParams.get('key');
  return keyParam === cronSecret && request.headers.get('x-vercel-cron') === '1';
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isDue(event: EmailEventRow, now: Date): boolean {
  const scheduledFor = asString(event.event_data?.scheduledFor);
  if (!scheduledFor) return false;
  const scheduledAt = new Date(scheduledFor);
  return !Number.isNaN(scheduledAt.getTime()) && scheduledAt <= now;
}

function hasSentMatchingFollowup(events: EmailEventRow[], queued: EmailEventRow): boolean {
  const resultId = asString(queued.event_data?.resultId);
  const sequence = asNumber(queued.event_data?.sequence);

  return events.some((event) => {
    if (event.event_type !== SENT_EVENT) return false;
    if (sequence != null && event.event_data?.sequence !== sequence) return false;
    if (resultId && event.event_data?.resultId !== resultId) return false;
    return true;
  });
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);

  const { data: queuedEvents, error } = await supabase
    .from('email_events')
    .select('id,email,event_type,event_data,created_at')
    .eq('event_type', QUEUED_EVENT)
    .order('created_at', { ascending: true })
    .limit(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50);

  if (error) {
    console.error('[rent-checker-followups] Failed to load queued events', error);
    return NextResponse.json({ error: 'Failed to load queued events' }, { status: 500 });
  }

  const dueEvents = ((queuedEvents || []) as EmailEventRow[]).filter((event) => isDue(event, now));
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const event of dueEvents) {
    const email = event.email;
    const subject = asString(event.event_data?.subject);
    const html = asString(event.event_data?.html);
    const text = asString(event.event_data?.text);
    const resultId = asString(event.event_data?.resultId);
    const sequence = asNumber(event.event_data?.sequence);

    if (!subject || !html || !text) {
      skipped += 1;
      continue;
    }

    const { data: relatedEvents, error: relatedError } = await supabase
      .from('email_events')
      .select('email,event_type,event_data,created_at')
      .eq('email', email)
      .in('event_type', [...SUPPRESSION_EVENTS])
      .order('created_at', { ascending: false })
      .limit(100);

    if (relatedError) {
      console.error('[rent-checker-followups] Failed to load related events', relatedError);
      failed += 1;
      continue;
    }

    const events = (relatedEvents || []) as EmailEventRow[];
    if (isRecoveryUnsubscribedFromEvents(events, email) || hasSentMatchingFollowup(events, event)) {
      skipped += 1;
      continue;
    }

    const sendResult = await sendEmail({ to: email, subject, html, text });
    await supabase.from('email_events').insert({
      email,
      event_type: sendResult.success ? SENT_EVENT : FAILED_EVENT,
      event_data: {
        queuedEventId: event.id,
        resultId,
        sequence,
        subject,
        providerMessageId: sendResult.id ?? null,
        error: sendResult.error ?? null,
      },
    });

    if (sendResult.success) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    success: true,
    checked: queuedEvents?.length ?? 0,
    due: dueEvents.length,
    sent,
    skipped,
    failed,
  });
}
