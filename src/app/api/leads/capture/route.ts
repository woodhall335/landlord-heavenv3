import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

const captureSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  jurisdiction: z.string().optional(),
  caseId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  marketing_consent: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, source, jurisdiction, caseId, tags, marketing_consent } = parsed.data;
    const supabase = createAdminClient();

    const { error: upsertError } = await supabase.from('email_subscribers').upsert(
      {
        email,
        source: source ?? null,
        jurisdiction: jurisdiction ?? null,
        last_case_id: caseId ?? null,
        tags: [...(tags ?? []), ...(marketing_consent ? ['marketing_consent:true'] : ['marketing_consent:false'])],
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );

    if (upsertError) {
      console.error('[leads/capture] Failed to upsert subscriber', upsertError);
      return NextResponse.json({ error: 'Failed to capture lead' }, { status: 500 });
    }

    const { error: eventError } = await supabase.from('email_events').insert({
      email,
      event_type: 'lead_captured',
      event_data: { source, jurisdiction, caseId, tags, marketing_consent },
    });

    if (eventError) {
      console.error('[leads/capture] Failed to write event', eventError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[leads/capture] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
