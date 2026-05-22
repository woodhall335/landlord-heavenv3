/**
 * Started-but-incomplete wizard recovery cron.
 *
 * Sends day-1 and day-3 continuation emails for saved wizard cases that have
 * a usable contact email but have not reached review, preview, checkout, or
 * final document generation.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getAdminProductLabel } from '@/lib/admin/products';
import {
  CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES,
  CASE_WIZARD_RECOVERY_FAILED_EVENT_TYPES,
  CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES,
  deriveCaseProductType,
  deriveCaseRecoveryContact,
  isStartedButIncompleteCase,
} from '@/lib/cases/recovery';
import { createCaseRecoveryLink } from '@/lib/cases/recovery-server';
import { sendWizardAbandonmentRecoveryEmail } from '@/lib/email/resend';
import { createAdminClient } from '@/lib/supabase/server';
import { completeCronRun, startCronRun } from '@/lib/validation/cron-run-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const JOB_NAME = 'wizard:recover-incomplete' as const;
const DEFAULT_BATCH_LIMIT = 50;
const DAY_1_AGE_HOURS = 24;
const DAY_3_AGE_HOURS = 24 * 3;

type CaseRow = {
  id: string;
  user_id: string | null;
  case_type: string;
  jurisdiction: string;
  status: string | null;
  workflow_status: string | null;
  wizard_progress: number | null;
  wizard_completed_at: string | null;
  collected_facts: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  case_id: string;
  user_id: string | null;
  product_type: string | null;
  payment_status: string;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type EmailEventRow = {
  email?: string | null;
  event_type: string;
  event_data: Record<string, any> | null;
};

function verifyCronAuth(request: NextRequest): { authorized: boolean; source: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, source: 'no_secret_configured' };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, source: 'bearer' };
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    const keyParam = request.nextUrl.searchParams.get('key');
    if (keyParam && keyParam.length === cronSecret.length) {
      let match = true;
      for (let i = 0; i < cronSecret.length; i += 1) {
        if (keyParam[i] !== cronSecret[i]) {
          match = false;
        }
      }
      if (match) {
        return { authorized: true, source: 'vercel_cron' };
      }
    }

    return { authorized: false, source: 'vercel_cron_missing_key' };
  }

  return { authorized: false, source: 'invalid_credentials' };
}

function getPositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getBooleanParam(value: string | null): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function pickBestOrder(current: OrderRow | undefined, candidate: OrderRow): OrderRow {
  if (!current) return candidate;
  if (candidate.payment_status === 'paid' && current.payment_status !== 'paid') return candidate;
  if (current.payment_status === 'paid' && candidate.payment_status !== 'paid') return current;
  return new Date(candidate.created_at).getTime() > new Date(current.created_at).getTime()
    ? candidate
    : current;
}

function getCaseAgeHours(caseRow: CaseRow): number {
  const updatedAt = new Date(caseRow.updated_at).getTime();
  return (Date.now() - updatedAt) / (60 * 60 * 1000);
}

function normalizeEmail(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}

function getEventCaseId(event: EmailEventRow): string | null {
  const data = event.event_data || {};
  return (
    data.case_id ||
    data.caseId ||
    data.case?.id ||
    data.case?.case_id ||
    null
  );
}

function eventMatchesRecoveryTarget(event: EmailEventRow, caseId: string, email: string | null): boolean {
  const eventCaseId = getEventCaseId(event);
  if (eventCaseId) {
    return eventCaseId === caseId;
  }

  const eventEmail = normalizeEmail(event.email);
  const targetEmail = normalizeEmail(email);
  return Boolean(eventEmail && targetEmail && eventEmail === targetEmail);
}

function hasStageEmailActivity(
  events: EmailEventRow[],
  caseId: string,
  email: string | null,
  stage: 'day_1' | 'day_3'
): boolean {
  const eventTypes = new Set<string>([
    CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES[stage],
    CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES[stage],
  ]);
  return events.some(
    (event) => eventTypes.has(event.event_type) && eventMatchesRecoveryTarget(event, caseId, email)
  );
}

function getDueStage(caseRow: CaseRow, sentEvents: EmailEventRow[], email: string | null): 'day_1' | 'day_3' | null {
  const ageHours = getCaseAgeHours(caseRow);

  if (ageHours >= DAY_1_AGE_HOURS && !hasStageEmailActivity(sentEvents, caseRow.id, email, 'day_1')) {
    return 'day_1';
  }

  if (ageHours >= DAY_3_AGE_HOURS && !hasStageEmailActivity(sentEvents, caseRow.id, email, 'day_3')) {
    return 'day_3';
  }

  return null;
}

async function executeWizardAbandonmentRecovery(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchLimit = getPositiveInteger(request.nextUrl.searchParams.get('limit'), DEFAULT_BATCH_LIMIT);
  const dryRun = getBooleanParam(request.nextUrl.searchParams.get('dry_run'));
  const supabase = createAdminClient();
  const run = await startCronRun(JOB_NAME, 'cron');

  try {
    const { data: caseRows, error: casesError } = await supabase
      .from('cases')
      .select(
        'id, user_id, case_type, jurisdiction, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts, created_at, updated_at'
      )
      .lte('updated_at', hoursAgoIso(DAY_1_AGE_HOURS))
      .order('updated_at', { ascending: true })
      .limit(batchLimit * 4);

    if (casesError) {
      throw new Error(`Failed to fetch incomplete wizard cases: ${casesError.message}`);
    }

    const cases = (caseRows || []) as CaseRow[];
    const caseIds = cases.map((caseRow) => caseRow.id);

    if (!caseIds.length) {
      await completeCronRun(run.id, 'success', 'No incomplete wizard recovery candidates.', {
        sourcesChecked: 0,
        eventsCreated: 0,
        eventsUpdated: 0,
      });
      return NextResponse.json({ success: true, dry_run: dryRun, candidates_checked: 0, emails_sent: 0 });
    }

    const userIds = Array.from(new Set(cases.map((caseRow) => caseRow.user_id).filter(Boolean))) as string[];
    const [ordersResult, documentsResult, usersResult, eventsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, case_id, user_id, product_type, payment_status, created_at')
        .in('case_id', caseIds)
        .order('created_at', { ascending: false }),
      supabase.from('documents').select('case_id, is_preview').in('case_id', caseIds),
      userIds.length
        ? supabase.from('users').select('id, email, full_name').in('id', userIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('email_events')
        .select('email, event_type, event_data')
        .in('event_type', [
          CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES.day_1,
          CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES.day_3,
          CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES.day_1,
          CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES.day_3,
        ])
        .gte('created_at', hoursAgoIso(24 * 45)),
    ]);

    if (ordersResult.error) throw new Error(`Failed to fetch case orders: ${ordersResult.error.message}`);
    if (documentsResult.error) throw new Error(`Failed to fetch case documents: ${documentsResult.error.message}`);
    if (usersResult.error) throw new Error(`Failed to fetch case users: ${usersResult.error.message}`);
    if (eventsResult.error) throw new Error(`Failed to fetch recovery events: ${eventsResult.error.message}`);

    const orderByCase = new Map<string, OrderRow>();
    for (const order of ((ordersResult.data || []) as OrderRow[])) {
      orderByCase.set(order.case_id, pickBestOrder(orderByCase.get(order.case_id), order));
    }

    const finalDocumentCaseIds = new Set<string>();
    const previewDocumentCaseIds = new Set<string>();
    for (const document of (documentsResult.data || []) as Array<{ case_id: string; is_preview: boolean | null }>) {
      if (document.is_preview) {
        previewDocumentCaseIds.add(document.case_id);
      } else {
        finalDocumentCaseIds.add(document.case_id);
      }
    }

    const userById = new Map(((usersResult.data || []) as UserRow[]).map((user) => [user.id, user]));
    const sentEvents = (eventsResult.data || []) as EmailEventRow[];

    let checked = 0;
    let emailsSent = 0;
    let skipped = 0;
    let failed = 0;
    const sentCaseIds: string[] = [];
    const skippedCaseIds: string[] = [];
    const failedCaseIds: string[] = [];

    for (const caseRow of cases) {
      const relatedOrder = orderByCase.get(caseRow.id) || null;
      const hasFinalDocuments = finalDocumentCaseIds.has(caseRow.id);
      const hasPreviewDocuments = previewDocumentCaseIds.has(caseRow.id);

      if (
        !isStartedButIncompleteCase({
          caseItem: caseRow,
          order: relatedOrder,
          hasFinalDocuments,
          hasPreviewDocuments,
        })
      ) {
        skipped += 1;
        skippedCaseIds.push(caseRow.id);
        continue;
      }

      const user = caseRow.user_id ? userById.get(caseRow.user_id) : null;
      const contact = deriveCaseRecoveryContact(caseRow, user || null);
      if (!contact.email) {
        skipped += 1;
        skippedCaseIds.push(caseRow.id);
        continue;
      }

      const dueStage = getDueStage(caseRow, sentEvents, contact.email);
      if (!dueStage) {
        skipped += 1;
        skippedCaseIds.push(caseRow.id);
        continue;
      }

      checked += 1;

      if (dryRun) {
        skipped += 1;
        skippedCaseIds.push(caseRow.id);
        continue;
      }

      const recovery = await createCaseRecoveryLink({
        supabase: supabase as any,
        caseRow,
        email: contact.email,
        orderRow: relatedOrder,
        stage: dueStage,
        source: JOB_NAME,
        kind: 'case_wizard_recovery',
      });
      const productType = recovery.productType || deriveCaseProductType(caseRow, relatedOrder);
      const attemptEvent = await supabase.from('email_events').insert({
        email: contact.email,
        event_type: CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES[dueStage],
        event_data: {
          case_id: caseRow.id,
          product_type: productType,
          resume_url: recovery.resumeUrl,
          sent_at: null,
          source: JOB_NAME,
          stage: dueStage,
          status: 'attempted',
        },
      });

      if (attemptEvent.error) {
        throw new Error(`Failed to record recovery email attempt: ${attemptEvent.error.message}`);
      }

      const emailResult = await sendWizardAbandonmentRecoveryEmail({
        to: contact.email,
        customerName: contact.name || contact.email.split('@')[0] || 'there',
        productName: recovery.productName || getAdminProductLabel(productType),
        resumeUrl: recovery.resumeUrl,
        stage: dueStage,
      });

      const finalEvent = await supabase.from('email_events').insert({
        email: contact.email,
        event_type: emailResult.success
          ? CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES[dueStage]
          : CASE_WIZARD_RECOVERY_FAILED_EVENT_TYPES[dueStage],
        event_data: {
          case_id: caseRow.id,
          product_type: productType,
          resume_url: recovery.resumeUrl,
          error: emailResult.success ? null : emailResult.error || 'Unknown email error',
          sent_at: new Date().toISOString(),
          source: JOB_NAME,
          stage: dueStage,
          status: emailResult.success ? 'sent' : 'failed',
        },
      });

      if (finalEvent.error) {
        throw new Error(`Failed to record recovery email result: ${finalEvent.error.message}`);
      }

      if (emailResult.success) {
        emailsSent += 1;
        sentCaseIds.push(caseRow.id);
      } else {
        failed += 1;
        failedCaseIds.push(caseRow.id);
      }

      if (emailsSent >= batchLimit) break;
    }

    const status = failed > 0 ? 'partial' : 'success';
    const summary = dryRun
      ? `Dry run found ${checked} incomplete wizard recovery candidates.`
      : `Sent ${emailsSent} incomplete wizard recovery emails; skipped ${skipped}; failed ${failed}.`;

    await completeCronRun(run.id, status, summary, {
      sourcesChecked: checked,
      eventsCreated: emailsSent,
      eventsUpdated: skipped,
    });

    return NextResponse.json({
      success: failed === 0,
      dry_run: dryRun,
      candidates_checked: checked,
      emails_sent: emailsSent,
      skipped,
      failed,
      sent_case_ids: sentCaseIds,
      skipped_case_ids: skippedCaseIds,
      failed_case_ids: failedCaseIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown incomplete wizard recovery error';
    await completeCronRun(run.id, 'failed', message, {
      sourcesChecked: 0,
      eventsUpdated: 0,
    });
    console.error('[WizardAbandonmentRecoveryCron] Failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (!authHeader && !vercelCronHeader) {
    return NextResponse.json({
      status: 'ok',
      job: JOB_NAME,
      day_1_age_hours: DAY_1_AGE_HOURS,
      day_3_age_hours: DAY_3_AGE_HOURS,
      batch_limit: DEFAULT_BATCH_LIMIT,
      description:
        'Sends day-1 and day-3 continuation emails for incomplete wizard cases with a known customer email.',
    });
  }

  return executeWizardAbandonmentRecovery(request);
}

export async function POST(request: NextRequest) {
  return executeWizardAbandonmentRecovery(request);
}
