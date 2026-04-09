import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import {
  createSection13SupportRequest,
  getSection13EvidenceUploads,
  getLatestSection13OutputSnapshot,
  getLatestSection13SupportRequest,
  updateSection13SupportRequest,
} from '@/lib/section13/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  message: z.string().trim().min(1).max(4000),
});

type SupportIntent =
  | 'document_explanation'
  | 'evidence_checklist'
  | 'bundle_steps'
  | 'proof_of_service'
  | 'negotiation_guidance'
  | 'dashboard_downloads'
  | 'process_guidance'
  | 'rent_setting'
  | 'outcome_prediction'
  | 'legal_override'
  | 'settlement_advice'
  | 'human_request';

type SupportClassification = {
  intent: SupportIntent;
  handlingMode: 'automated' | 'escalated';
  blockedReason: string | null;
  priority: 'normal' | 'high' | 'urgent';
  deadlineAt: string | null;
};

function deriveDeadlineAt(message: string): string | null {
  const normalized = message.toLowerCase();
  const now = new Date();

  if (/\b(today|urgent|asap)\b/.test(normalized)) {
    return now.toISOString();
  }
  if (/\btomorrow\b/.test(normalized)) {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
  const withinDaysMatch = normalized.match(/\b(?:within|in)\s+(\d{1,2})\s+day/);
  if (withinDaysMatch?.[1]) {
    const days = Number(withinDaysMatch[1]);
    if (!Number.isNaN(days)) {
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  return null;
}

function classifySupportMessage(message: string): SupportClassification {
  const normalized = message.toLowerCase();
  const deadlineAt = deriveDeadlineAt(normalized);

  if (/\b(human|person|support team|someone review|call me|urgent help)\b/.test(normalized)) {
    return {
      intent: 'human_request',
      handlingMode: 'escalated',
      blockedReason: 'human_request',
      priority: deadlineAt ? 'urgent' : 'high',
      deadlineAt,
    };
  }

  if (
    /\b(what should i charge|set the rent to|how much should i increase|pick the rent|set my rent)\b/.test(normalized)
  ) {
    return {
      intent: 'rent_setting',
      handlingMode: 'escalated',
      blockedReason: 'rent_setting',
      priority: 'normal',
      deadlineAt,
    };
  }

  if (/\b(will i win|what are my chances|likely to win|outcome|probability)\b/.test(normalized)) {
    return {
      intent: 'outcome_prediction',
      handlingMode: 'escalated',
      blockedReason: 'outcome_prediction',
      priority: deadlineAt ? 'high' : 'normal',
      deadlineAt,
    };
  }

  if (/\b(ignore the rule|override the validator|serve it anyway|bypass|skip the notice)\b/.test(normalized)) {
    return {
      intent: 'legal_override',
      handlingMode: 'escalated',
      blockedReason: 'legal_override',
      priority: 'high',
      deadlineAt,
    };
  }

  if (/\b(settle|offer them|how much should i offer|discount)\b/.test(normalized)) {
    return {
      intent: 'settlement_advice',
      handlingMode: 'escalated',
      blockedReason: 'settlement_advice',
      priority: 'normal',
      deadlineAt,
    };
  }

  if (/\b(proof of service|served|service method|service date)\b/.test(normalized)) {
    return { intent: 'proof_of_service', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  if (/\b(checklist|evidence|epc|gas safety|lha|photos|certificates)\b/.test(normalized)) {
    return { intent: 'evidence_checklist', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  if (/\b(bundle|hearing pack|zip|merge|exhibit)\b/.test(normalized)) {
    return { intent: 'bundle_steps', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  if (/\b(download|dashboard|where are my files|open downloads|email)\b/.test(normalized)) {
    return { intent: 'dashboard_downloads', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  if (/\b(negotiat|email template|word this|tenant email)\b/.test(normalized)) {
    return { intent: 'negotiation_guidance', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  if (/\b(form 4a|report|response template|what is this document|defence guide|legal briefing)\b/.test(normalized)) {
    return { intent: 'document_explanation', handlingMode: 'automated', blockedReason: null, priority: 'normal', deadlineAt };
  }

  return {
    intent: 'process_guidance',
    handlingMode: deadlineAt ? 'escalated' : 'automated',
    blockedReason: deadlineAt ? 'deadline_sensitive' : null,
    priority: deadlineAt ? 'urgent' : 'normal',
    deadlineAt,
  };
}

function buildAutomatedReply(params: {
  intent: SupportIntent;
  snapshot: Awaited<ReturnType<typeof getLatestSection13OutputSnapshot>>;
  workflowStatus: string | null;
  evidenceUploadCount: number;
}): string {
  const { intent, snapshot, workflowStatus, evidenceUploadCount } = params;
  const preview = snapshot?.previewMetrics;
  const state = snapshot?.stateSnapshot;
  const challengeBand = preview?.challengeBandLabel || 'Challenge band not available yet';
  const evidenceBand = preview?.evidenceBandLabel || 'Evidence band not available yet';

  switch (intent) {
    case 'document_explanation':
      return [
        'I can explain the generated Section 13 outputs, but I cannot change the legal position they are based on.',
        `The current defensibility summary is: ${snapshot?.defensibilitySummarySentence || 'No defensibility summary is available yet.'}`,
        `Form 4A is the notice itself. The justification report explains the comparable evidence, and the proof of service record logs how and when service was recorded.`,
        `Your current evidence signal is ${evidenceBand.toLowerCase()} and the challenge signal is ${challengeBand.toLowerCase()}.`,
      ].join('\n\n');

    case 'evidence_checklist':
      return [
        'For tribunal readiness, keep the generated Form 4A, the justification report, the proof of service record, and your uploaded evidence in one consistent bundle.',
        `You currently have ${evidenceUploadCount} uploaded evidence file${evidenceUploadCount === 1 ? '' : 's'}.`,
        'The checklist is designed around EPC, safety certificates where relevant, photos, local housing allowance evidence, and any negotiation correspondence.',
      ].join('\n\n');

    case 'bundle_steps':
      return [
        'The tribunal bundle tool works in two stages: core paid outputs first, then a merged bundle after you upload evidence.',
        `Current workflow status: ${workflowStatus || 'pending'}.`,
        'If you add or replace evidence, regenerate the bundle so the merged pack and ZIP stay aligned with the current exhibit list.',
      ].join('\n\n');

    case 'proof_of_service':
      return [
        'The proof of service record is a saved note of the service method and the recorded served date. In v1 it uses the date you entered, rather than calculating deemed service automatically.',
        `Recorded method: ${state?.proposal?.serviceMethod || 'Not recorded'}. Recorded served date: ${state?.proposal?.serviceDate || 'Not recorded'}.`,
        'Keep the method, date, and the notice bundle consistent across your outputs and any tribunal response.',
      ].join('\n\n');

    case 'negotiation_guidance':
      return [
        'Use the negotiation email template to stay consistent with the generated report rather than introducing new rent figures or new evidence claims.',
        `The safe anchor is the existing summary: ${snapshot?.justificationSummaryText || 'No justification summary is available yet.'}`,
        'You can explain the comparable position and invite the tenant to share their own evidence, but avoid predicting the tribunal outcome.',
      ].join('\n\n');

    case 'dashboard_downloads':
      return [
        'Your downloads stay on the case dashboard once payment is complete.',
        `Current workflow status: ${workflowStatus || 'pending'}.`,
        'If a merged bundle is still processing, the core outputs can still appear first. Refresh the status, then open the case downloads page.',
      ].join('\n\n');

    case 'process_guidance':
    default:
      return [
        'I can explain the generated Section 13 outputs and the tribunal-preparation steps, but I cannot predict the result or tell you what rent to set.',
        'For process, keep the notice, justification report, proof of service record, and evidence bundle aligned. The tenant can challenge up to the day before the proposed start date.',
        'If you want a human review because of a deadline or conflicting documents, I can escalate that request.',
      ].join('\n\n');
  }
}

async function persistConversationRows(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  caseId: string;
  userMessage: string;
  assistantMessage: string;
  metadata: Record<string, unknown>;
}): Promise<{ assistantConversationId: string | null }> {
  const { supabase, caseId, userMessage, assistantMessage, metadata } = params;

  await supabase.from('conversations').insert({
    case_id: caseId,
    role: 'user',
    content: userMessage,
    question_id: 'section13_support',
    input_type: 'section13_support',
    user_input: metadata as any,
  } as any);

  const { data: assistantRow } = await supabase
    .from('conversations')
    .insert({
      case_id: caseId,
      role: 'assistant',
      content: assistantMessage,
      model: 'section13-support',
      question_id: 'section13_support',
      input_type: 'section13_support',
      user_input: metadata as any,
    } as any)
    .select('id')
    .maybeSingle();

  return {
    assistantConversationId: (assistantRow as any)?.id || null,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const { searchParams } = new URL(request.url);
    const caseId = String(searchParams.get('caseId') || '').trim();

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token, case_type')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    const { data: paidOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('case_id', caseId)
      .eq('payment_status', 'paid')
      .eq('product_type', 'section13_defensive')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!paidOrder) {
      return NextResponse.json(
        {
          enabled: false,
          error: 'Defensive Pack support unlocks after a paid Defensive Pack order.',
        },
        { status: 403 }
      );
    }

    const [{ data: conversations }, latestSupportRequest] = await Promise.all([
      supabase
        .from('conversations')
        .select('id, role, content, created_at, model, question_id')
        .eq('case_id', caseId)
        .eq('question_id', 'section13_support')
        .order('created_at', { ascending: true })
        .limit(20),
      getLatestSection13SupportRequest(supabase, caseId),
    ]);

    return NextResponse.json({
      enabled: true,
      latestSupportRequest,
      messages: conversations || [],
    });
  } catch (error: any) {
    console.error('[section13/ask-heaven] GET error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load Section 13 support state' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { caseId, message } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, session_token, case_type, workflow_status')
      .eq('id', caseId)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    const { data: paidOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('case_id', caseId)
      .eq('payment_status', 'paid')
      .eq('product_type', 'section13_defensive')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!paidOrder) {
      return NextResponse.json(
        { error: 'Section 13 support is available only after a paid Defensive Pack order.' },
        { status: 403 }
      );
    }

    const [snapshot, evidenceUploads, latestSupportRequest] = await Promise.all([
      getLatestSection13OutputSnapshot(supabase, caseId),
      getSection13EvidenceUploads(supabase, caseId),
      getLatestSection13SupportRequest(supabase, caseId),
    ]);

    const classification = classifySupportMessage(message);
    const assistantMessage =
      classification.handlingMode === 'automated'
        ? buildAutomatedReply({
            intent: classification.intent,
            snapshot,
            workflowStatus: (caseRow as any).workflow_status || null,
            evidenceUploadCount: evidenceUploads.length,
          })
        : [
            'I have logged this for human review because it falls outside the safe automated support scope for the Defensive Pack.',
            'I can explain your generated outputs and process steps, but I cannot set the rent for you, predict the tribunal result, or override the validator.',
            classification.deadlineAt
              ? `A deadline indicator was recorded for ${classification.deadlineAt}.`
              : 'If you have a hearing or response deadline, include it in your next message so support can prioritise correctly.',
          ].join('\n\n');

    const metadata = {
      intent_code: classification.intent,
      handling_mode: classification.handlingMode,
      blocked_reason: classification.blockedReason,
      priority: classification.priority,
      deadline_at: classification.deadlineAt,
    };

    const { assistantConversationId } = await persistConversationRows({
      supabase,
      caseId,
      userMessage: message,
      assistantMessage,
      metadata,
    });

    let supportRequest = latestSupportRequest;

    if (classification.handlingMode === 'escalated') {
      if (supportRequest && supportRequest.status !== 'responded') {
        supportRequest = await updateSection13SupportRequest(supabase, supportRequest.id!, {
          latestConversationId: assistantConversationId,
          handlingMode: 'escalated',
          intentCode: classification.intent,
          blockedReason: classification.blockedReason,
          priority:
            supportRequest.priority === 'urgent' || classification.priority === 'urgent'
              ? 'urgent'
              : supportRequest.priority === 'high' || classification.priority === 'high'
                ? 'high'
                : 'normal',
          deadlineAt: classification.deadlineAt || supportRequest.deadlineAt || null,
          status: supportRequest.status,
          metadata: {
            ...(supportRequest.metadata || {}),
            last_user_message: message,
            last_assistant_message: assistantMessage,
          },
        });
      } else {
        supportRequest = await createSection13SupportRequest(supabase, {
          caseId,
          latestConversationId: assistantConversationId,
          handlingMode: 'escalated',
          intentCode: classification.intent,
          blockedReason: classification.blockedReason,
          priority: classification.priority,
          deadlineAt: classification.deadlineAt,
          status: 'received',
          metadata: {
            last_user_message: message,
            last_assistant_message: assistantMessage,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      reply: assistantMessage,
      handlingMode: classification.handlingMode,
      intentCode: classification.intent,
      latestSupportRequest: supportRequest,
    });
  } catch (error: any) {
    console.error('[section13/ask-heaven] POST error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send Section 13 support message' },
      { status: 500 }
    );
  }
}
