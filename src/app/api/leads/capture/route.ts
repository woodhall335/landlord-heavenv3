/**
 * Lead Capture API Route
 *
 * Captures email leads from Ask Heaven email gate, validators, and free tools.
 *
 * STORAGE DESTINATION:
 * - Primary: Supabase PostgreSQL table `email_subscribers` (upsert on email)
 * - Events: Supabase PostgreSQL table `email_events` (append-only log)
 *
 * Fields stored:
 * - email (primary key)
 * - source (e.g., "ask_heaven_gate", "tool:rent-arrears")
 * - jurisdiction (england, wales, scotland, northern-ireland)
 * - last_case_id (UUID of wizard case if applicable)
 * - tags (array: ['ask_heaven', 'email_gate', 'report'])
 * - last_seen_at (timestamp)
 *
 * Duplicate handling: Upsert with onConflict: 'email' updates existing records.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Mask email for safe logging (e.g., "j***e@example.com")
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) {
    return `***@${domain || '***'}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

const captureSchema = z.object({
  email: z.string().email('Invalid email format'),
  source: z.string().optional(),
  jurisdiction: z.string().optional(),
  caseId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      console.warn('[leads/capture] Validation failed:', parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, source, jurisdiction, caseId, tags } = parsed.data;
    const maskedEmail = maskEmail(email);
    const supabase = createAdminClient();

    // Upsert to email_subscribers table (primary lead storage)
    const { error: upsertError } = await supabase.from('email_subscribers').upsert(
      {
        email,
        source: source ?? null,
        jurisdiction: jurisdiction ?? null,
        last_case_id: caseId ?? null,
        tags: tags ?? [],
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );

    if (upsertError) {
      console.error('[leads/capture] Failed to upsert subscriber:', {
        email: maskedEmail,
        source,
        error: upsertError.message,
      });
      return NextResponse.json(
        { success: false, error: 'Failed to capture lead' },
        { status: 500 },
      );
    }

    // Record event in email_events table (activity log)
    const { error: eventError } = await supabase.from('email_events').insert({
      email,
      event_type: 'lead_captured',
      event_data: { source, jurisdiction, caseId, tags },
    });

    if (eventError) {
      // Non-critical: log but don't fail the request
      console.warn('[leads/capture] Failed to write event:', {
        email: maskedEmail,
        error: eventError.message,
      });
    }

    console.info('[leads/capture] Lead captured:', {
      email: maskedEmail,
      source,
      jurisdiction,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[leads/capture] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
