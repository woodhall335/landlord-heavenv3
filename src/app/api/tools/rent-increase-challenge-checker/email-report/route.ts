import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/server';
import { buildRentCheckerEmailSequence } from '@/lib/section13';

export const runtime = 'nodejs';

const resultSchema = z.object({
  resultId: z.string().uuid().nullable().optional(),
  resultState: z.enum([
    'landlord_low_risk',
    'landlord_moderate_risk',
    'landlord_high_risk',
  ]),
  recommendedProduct: z.enum(['section13_standard', 'section13_defensive']),
  postcodeOutcode: z.string(),
  bedrooms: z.number(),
  currentRent: z.number(),
  proposedRent: z.number().nullable(),
  marketLow: z.number().nullable(),
  marketMedian: z.number().nullable(),
  marketHigh: z.number().nullable(),
  evidenceStrength: z.enum(['Weak', 'Moderate', 'Strong']),
  challengeRisk: z.enum(['low', 'moderate', 'high']),
  challengeRiskLabel: z.enum(['Low', 'Moderate', 'High']),
  primaryCtaLabel: z.string(),
  primaryCtaHref: z.string(),
  bundleCtaHref: z.string(),
}).passthrough();

const payloadSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  jurisdiction: z.string().optional(),
  marketingConsent: z.literal(true),
  result: resultSchema,
});

async function logEvent(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  eventType: string,
  eventData: Record<string, unknown>
) {
  const { error } = await supabase.from('email_events').insert({
    email,
    event_type: eventType,
    event_data: eventData,
  });

  if (error) {
    console.error(`[rent-checker/email-report] Failed to log ${eventType}`, error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, source, jurisdiction, result } = parsed.data;
    const supabase = createAdminClient();

    const tags = ['rent_checker', 'section13_checker', 'marketing_consent:true'];
    const { error: upsertError } = await supabase.from('email_subscribers').upsert(
      {
        email,
        source: source ?? 'tool:rent-increase-challenge-checker',
        jurisdiction: jurisdiction ?? 'england',
        tags,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (upsertError) {
      console.error('[rent-checker/email-report] Failed to upsert subscriber', upsertError);
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
    }

    await logEvent(supabase, email, 'rent_checker_report_requested', {
      source,
      jurisdiction,
      resultId: result.resultId ?? null,
      resultState: result.resultState,
      recommendedProduct: result.recommendedProduct,
      postcodeOutcode: result.postcodeOutcode,
    });

    const messages = buildRentCheckerEmailSequence(result as any);
    const providerKey =
      process.env.EMAIL_PROVIDER ||
      process.env.RESEND_API_KEY ||
      process.env.SENDGRID_API_KEY ||
      null;

    const immediate = messages[0];
    if (!providerKey) {
      console.info('[rent-checker/email-report] Email provider not configured; stubbed payload', immediate);
      await logEvent(supabase, email, 'rent_checker_report_stubbed', {
        source,
        jurisdiction,
        resultId: result.resultId ?? null,
        sequence: immediate.sequence,
        subject: immediate.subject,
      });
    } else {
      await logEvent(supabase, email, 'rent_checker_report_sent', {
        source,
        jurisdiction,
        resultId: result.resultId ?? null,
        sequence: immediate.sequence,
        subject: immediate.subject,
      });
    }

    for (const message of messages.slice(1)) {
      const scheduledFor = new Date(Date.now() + message.sendAfterHours * 60 * 60 * 1000).toISOString();
      await logEvent(supabase, email, 'rent_checker_followup_queued', {
        source,
        jurisdiction,
        resultId: result.resultId ?? null,
        resultState: result.resultState,
        recommendedProduct: result.recommendedProduct,
        sequence: message.sequence,
        subject: message.subject,
        sendAfterHours: message.sendAfterHours,
        scheduledFor,
      });
    }

    return NextResponse.json({ success: true, queued: messages.length });
  } catch (error) {
    console.error('[rent-checker/email-report] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
