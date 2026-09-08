import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function londonDayStart(now = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  );
  const representedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const londonOffsetMs = representedAsUtc - now.getTime();
  return new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) - londonOffsetMs,
  );
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('marketing_events')
      .select('marketing_session_id')
      .eq('event_name', 'site_visit')
      .gte('created_at', londonDayStart().toISOString())
      .not('marketing_session_id', 'is', null)
      .limit(10000);

    if (error) throw error;

    const count = new Set(
      (data ?? [])
        .map((row) => row.marketing_session_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ).size;

    return NextResponse.json(
      { count, basis: 'distinct_first_party_sessions', timeZone: 'Europe/London' },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.warn('[public/usage-today] Usage count unavailable', error);
    return NextResponse.json(
      { count: null, basis: 'unavailable', timeZone: 'Europe/London' },
      { headers: { 'Cache-Control': 'public, s-maxage=60' } },
    );
  }
}
