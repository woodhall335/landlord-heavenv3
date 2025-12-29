import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';

const reportSchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  jurisdiction: z.string().optional(),
  caseId: z.string().uuid(),
});

type ReportPayload = {
  subject: string;
  text: string;
  html: string;
};

function buildReportPayload(input: {
  validationSummary: any;
  recommendations: Array<{ code: string; message: string }>;
  nextQuestions: Array<{ question: string }>;
}): ReportPayload {
  const summaryLines = input.validationSummary
    ? [
        `Status: ${input.validationSummary.status ?? 'unknown'}`,
        `Blockers: ${input.validationSummary.blockers?.length ?? 0}`,
        `Warnings: ${input.validationSummary.warnings?.length ?? 0}`,
      ]
    : ['Status: unknown'];

  const recLines = input.recommendations.map((rec) => `- ${rec.message}`);
  const questionLines = input.nextQuestions.map((question) => `- ${question.question}`);

  const text = [
    'Your Landlord Heaven report',
    '',
    ...summaryLines,
    '',
    'Recommendations:',
    ...(recLines.length ? recLines : ['- No recommendations yet.']),
    '',
    'Next questions:',
    ...(questionLines.length ? questionLines : ['- No remaining questions.']),
  ].join('\n');

  const html = `
    <h2>Your Landlord Heaven report</h2>
    <p><strong>Status:</strong> ${input.validationSummary?.status ?? 'unknown'}</p>
    <p><strong>Blockers:</strong> ${input.validationSummary?.blockers?.length ?? 0}</p>
    <p><strong>Warnings:</strong> ${input.validationSummary?.warnings?.length ?? 0}</p>
    <h3>Recommendations</h3>
    <ul>${recLines.length ? recLines.map((item) => `<li>${item.replace('- ', '')}</li>`).join('') : '<li>No recommendations yet.</li>'}</ul>
    <h3>Next questions</h3>
    <ul>${questionLines.length ? questionLines.map((item) => `<li>${item.replace('- ', '')}</li>`).join('') : '<li>No remaining questions.</li>'}</ul>
  `;

  return {
    subject: 'Your Landlord Heaven report',
    text,
    html,
  };
}

async function logEvent(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  event_type: string,
  event_data: Record<string, any>,
) {
  const { error } = await supabase.from('email_events').insert({
    email,
    event_type,
    event_data,
  });
  if (error) {
    console.error('[leads/email-report] Failed to log event', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, source, jurisdiction, caseId } = parsed.data;
    const supabase = createAdminClient();

    const facts = await getOrCreateWizardFacts(supabase as any, caseId);
    const validationSummary = (facts as any)?.validation_summary ?? null;
    const recommendations = (facts as any)?.recommendations ?? [];
    const nextQuestions = (facts as any)?.next_questions ?? [];

    await logEvent(supabase, email, 'report_requested', {
      source,
      jurisdiction,
      caseId,
    });

    const payload = buildReportPayload({
      validationSummary,
      recommendations,
      nextQuestions,
    });

    const providerKey =
      process.env.EMAIL_PROVIDER ||
      process.env.RESEND_API_KEY ||
      process.env.SENDGRID_API_KEY ||
      null;

    if (!providerKey) {
      console.info('[leads/email-report] Email provider not configured; stubbed payload', payload);
      await logEvent(supabase, email, 'report_stubbed', {
        source,
        jurisdiction,
        caseId,
      });
      return NextResponse.json({ success: true, stubbed: true });
    }

    await logEvent(supabase, email, 'report_sent', {
      source,
      jurisdiction,
      caseId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[leads/email-report] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
