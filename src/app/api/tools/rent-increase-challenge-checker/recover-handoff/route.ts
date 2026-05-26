import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/server';
import {
  RENT_CHECKER_EMAIL_HANDOFF_EVENT,
  RENT_CHECKER_EMAIL_HANDOFF_USED_EVENT,
  hashRentCheckerEmailHandoffToken,
} from '@/lib/section13/rent-checker-email-handoff';

export const runtime = 'nodejs';

type HandoffEventRow = {
  id: string;
  email: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
};

const payloadSchema = z.object({
  token: z.string().min(32),
  caseId: z.string().uuid(),
  product: z.enum(['section13_standard', 'section13_defensive']),
});

function isValidDraft(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && 'state' in value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid handoff request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, caseId, product } = parsed.data;
    const tokenHash = hashRentCheckerEmailHandoffToken(token);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('email_events')
      .select('id,email,event_data,created_at')
      .eq('event_type', RENT_CHECKER_EMAIL_HANDOFF_EVENT)
      .contains('event_data', { tokenHash })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[rent-checker/recover-handoff] Failed to load handoff', error);
      return NextResponse.json({ error: 'Failed to recover rent checker result' }, { status: 500 });
    }

    const row = ((data || []) as HandoffEventRow[])[0];
    if (!row?.event_data) {
      return NextResponse.json({ error: 'This rent checker recovery link is invalid.' }, { status: 404 });
    }

    const expiresAt = typeof row.event_data.expiresAt === 'string' ? row.event_data.expiresAt : null;
    if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This rent checker recovery link has expired.' }, { status: 410 });
    }

    const draft = row.event_data.draft;
    if (!isValidDraft(draft)) {
      return NextResponse.json({ error: 'This rent checker recovery link is missing draft data.' }, { status: 422 });
    }

    const draftWithSelectedProduct = {
      ...draft,
      state: {
        ...(draft.state as Record<string, unknown>),
        selectedPlan: product,
      },
    };

    await supabase.from('email_events').insert({
      email: row.email,
      event_type: RENT_CHECKER_EMAIL_HANDOFF_USED_EVENT,
      event_data: {
        sourceEventId: row.id,
        caseId,
        product,
        resultId: row.event_data.resultId ?? null,
        usedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      draft: draftWithSelectedProduct,
      resultId: row.event_data.resultId ?? null,
    });
  } catch (error) {
    console.error('[rent-checker/recover-handoff] Unexpected error', error);
    return NextResponse.json({ error: 'Failed to recover rent checker result' }, { status: 500 });
  }
}
