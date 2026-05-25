import { getAdminProductLabel } from '@/lib/admin/products';
import {
  CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES,
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES,
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES,
  CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES,
  CASE_WIZARD_RECOVERY_FAILED_EVENT_TYPES,
  CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES,
  deriveCaseProductType,
  deriveCaseRecoveryContact,
  isPreviewAbandonedCase,
  isStartedButIncompleteCase,
  type CaseRecoveryStage,
} from '@/lib/cases/recovery';
import { createCaseRecoveryLink } from '@/lib/cases/recovery-server';
import {
  sendAbandonedCheckoutRecoveryEmail,
  sendCasePreviewRecoveryEmail,
  sendWizardAbandonmentRecoveryEmail,
} from '@/lib/email/resend';
import { PRODUCTS, isValidProductSku, type ProductSku } from '@/lib/pricing/products';
import {
  RECOVERY_UNSUBSCRIBED_EVENT,
  buildRecoveryUnsubscribeUrl,
  isRecoveryUnsubscribedFromEvents,
} from '@/lib/recovery/unsubscribe';
import { createAdminClient } from '@/lib/supabase/server';
import { completeCronRun, startCronRun } from '@/lib/validation/cron-run-tracker';

export const RECOVERY_ORCHESTRATOR_JOB_NAME = 'recovery:orchestrate' as const;

const DEFAULT_BATCH_LIMIT = 50;
const CHECKOUT_MIN_AGE_MINUTES = 45;
const CHECKOUT_MAX_AGE_HOURS = 23;
const CASE_DAY_1_AGE_HOURS = 24;
const WIZARD_DAY_3_AGE_HOURS = 24 * 3;
const PREVIEW_DAY_7_AGE_HOURS = 24 * 7;

const CHECKOUT_RECOVERY_SENT_EVENT = 'checkout_recovery_sent';
const CHECKOUT_RECOVERY_FAILED_EVENT = 'checkout_recovery_failed';

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
  case_id: string | null;
  user_id: string | null;
  product_type: string | null;
  product_name?: string | null;
  total_amount?: number | string | null;
  payment_status: string;
  stripe_checkout_url?: string | null;
  stripe_session_id?: string | null;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type EmailEventRow = {
  email?: string | null;
  event_type?: string | null;
  event_data: Record<string, any> | null;
};

type RecoveryKind = 'checkout' | 'preview' | 'wizard';

export type RecoveryOrchestratorResult = {
  success: boolean;
  dry_run: boolean;
  candidates_checked: number;
  emails_sent: number;
  skipped: number;
  failed: number;
  checkout_sent_order_ids: string[];
  preview_sent_case_ids: string[];
  wizard_sent_case_ids: string[];
  skipped_ids: string[];
  failed_ids: string[];
};

type RecoveryOptions = {
  dryRun?: boolean;
  batchLimit?: number;
  triggeredBy?: 'cron' | 'manual' | 'webhook';
};

function normalizeEmail(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function getAgeHours(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (60 * 60 * 1000);
}

function getCustomerName(user: UserRow | null, fallbackEmail: string | null): string {
  const fullName = user?.full_name?.trim();
  if (fullName) return fullName;

  return fallbackEmail?.split('@')[0]?.trim() || 'there';
}

function getCheckoutProductName(order: OrderRow): string {
  if (order.product_type && isValidProductSku(order.product_type)) {
    return PRODUCTS[order.product_type as ProductSku].label;
  }

  return order.product_name || 'Landlord Heaven document pack';
}

function normalizeGbpAmount(value: number | string | null | undefined): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount > 999 ? Number((amount / 100).toFixed(2)) : amount;
}

function pickBestOrder(current: OrderRow | undefined, candidate: OrderRow): OrderRow {
  if (!current) return candidate;
  if (candidate.payment_status === 'paid' && current.payment_status !== 'paid') return candidate;
  if (current.payment_status === 'paid' && candidate.payment_status !== 'paid') return current;
  return new Date(candidate.created_at).getTime() > new Date(current.created_at).getTime()
    ? candidate
    : current;
}

function isFreshPendingCheckout(order: OrderRow | null | undefined): boolean {
  return Boolean(
    order?.payment_status === 'pending' &&
      getAgeHours(order.created_at) <= CHECKOUT_MAX_AGE_HOURS
  );
}

function getEventCaseId(event: EmailEventRow): string | null {
  const data = event.event_data || {};
  return data.case_id || data.caseId || data.case?.id || data.case?.case_id || null;
}

function eventMatchesCase(event: EmailEventRow, caseId: string, email: string | null): boolean {
  const eventCaseId = getEventCaseId(event);
  if (eventCaseId) return eventCaseId === caseId;

  const eventEmail = normalizeEmail(event.email);
  return Boolean(eventEmail && email && eventEmail === normalizeEmail(email));
}

function eventHasOrderId(event: EmailEventRow, orderId: string): boolean {
  return event.event_data?.order_id === orderId;
}

function hasCaseStageEmailActivity(
  events: EmailEventRow[],
  kind: Extract<RecoveryKind, 'preview' | 'wizard'>,
  caseId: string,
  email: string | null,
  stage: CaseRecoveryStage
): boolean {
  const eventTypes =
    kind === 'preview'
      ? new Set<string>([
          CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES[stage as 'day_1' | 'day_7' | 'manual'],
          CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES[stage as 'day_1' | 'day_7' | 'manual'],
        ])
      : new Set<string>([
          CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES[stage as 'day_1' | 'day_3'],
          CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES[stage as 'day_1' | 'day_3'],
        ]);

  return events.some(
    (event) => Boolean(event.event_type && eventTypes.has(event.event_type)) && eventMatchesCase(event, caseId, email)
  );
}

function getPreviewDueStage(caseRow: CaseRow, events: EmailEventRow[], email: string | null): 'day_1' | 'day_7' | null {
  const ageHours = getAgeHours(caseRow.updated_at);

  if (ageHours >= CASE_DAY_1_AGE_HOURS && !hasCaseStageEmailActivity(events, 'preview', caseRow.id, email, 'day_1')) {
    return 'day_1';
  }

  if (ageHours >= PREVIEW_DAY_7_AGE_HOURS && !hasCaseStageEmailActivity(events, 'preview', caseRow.id, email, 'day_7')) {
    return 'day_7';
  }

  return null;
}

function getWizardDueStage(caseRow: CaseRow, events: EmailEventRow[], email: string | null): 'day_1' | 'day_3' | null {
  const ageHours = getAgeHours(caseRow.updated_at);

  if (ageHours >= CASE_DAY_1_AGE_HOURS && !hasCaseStageEmailActivity(events, 'wizard', caseRow.id, email, 'day_1')) {
    return 'day_1';
  }

  if (ageHours >= WIZARD_DAY_3_AGE_HOURS && !hasCaseStageEmailActivity(events, 'wizard', caseRow.id, email, 'day_3')) {
    return 'day_3';
  }

  return null;
}

async function insertEmailEvent(
  supabase: ReturnType<typeof createAdminClient>,
  payload: Record<string, unknown>
) {
  const { error } = await supabase.from('email_events').insert(payload);
  if (error) {
    throw new Error(`Failed to record recovery email event: ${error.message}`);
  }
}

export async function runRecoveryOrchestrator(options: RecoveryOptions = {}): Promise<RecoveryOrchestratorResult> {
  const batchLimit = options.batchLimit && options.batchLimit > 0 ? options.batchLimit : DEFAULT_BATCH_LIMIT;
  const dryRun = Boolean(options.dryRun);
  const supabase = createAdminClient();
  const run = await startCronRun(RECOVERY_ORCHESTRATOR_JOB_NAME, options.triggeredBy ?? 'cron');

  const result: RecoveryOrchestratorResult = {
    success: true,
    dry_run: dryRun,
    candidates_checked: 0,
    emails_sent: 0,
    skipped: 0,
    failed: 0,
    checkout_sent_order_ids: [],
    preview_sent_case_ids: [],
    wizard_sent_case_ids: [],
    skipped_ids: [],
    failed_ids: [],
  };

  const emailedRecipients = new Set<string>();
  const checkoutSuppressedCaseIds = new Set<string>();

  try {
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select(
        'id, user_id, case_id, product_type, product_name, total_amount, payment_status, stripe_checkout_url, stripe_session_id, created_at'
      )
      .eq('payment_status', 'pending')
      .not('user_id', 'is', null)
      .not('stripe_checkout_url', 'is', null)
      .lte('created_at', minutesAgoIso(CHECKOUT_MIN_AGE_MINUTES))
      .gte('created_at', hoursAgoIso(CHECKOUT_MAX_AGE_HOURS))
      .order('created_at', { ascending: true })
      .limit(batchLimit * 2);

    if (ordersError) throw new Error(`Failed to fetch pending checkout orders: ${ordersError.message}`);

    const checkoutOrders = ((orderRows || []) as OrderRow[]).filter(
      (order) => order.user_id && order.stripe_checkout_url
    );
    for (const order of checkoutOrders) {
      if (order.case_id) checkoutSuppressedCaseIds.add(order.case_id);
    }

    const checkoutUserIds = Array.from(new Set(checkoutOrders.map((order) => order.user_id).filter(Boolean))) as string[];
    const { data: checkoutUsers, error: checkoutUsersError } = checkoutUserIds.length
      ? await supabase.from('users').select('id, email, full_name').in('id', checkoutUserIds)
      : { data: [], error: null };

    if (checkoutUsersError) throw new Error(`Failed to fetch checkout users: ${checkoutUsersError.message}`);

    const checkoutUserById = new Map(((checkoutUsers || []) as UserRow[]).map((user) => [user.id, user]));
    const checkoutEmails = Array.from(
      new Set(
        Array.from(checkoutUserById.values())
          .map((user) => normalizeEmail(user.email))
          .filter((email): email is string => Boolean(email))
      )
    );

    const { data: checkoutEvents, error: checkoutEventsError } = checkoutEmails.length
      ? await supabase
          .from('email_events')
          .select('email, event_type, event_data')
          .in('event_type', [CHECKOUT_RECOVERY_SENT_EVENT, RECOVERY_UNSUBSCRIBED_EVENT])
          .in('email', checkoutEmails)
          .limit(10000)
      : { data: [], error: null };

    if (checkoutEventsError) throw new Error(`Failed to fetch checkout recovery events: ${checkoutEventsError.message}`);

    const priorCheckoutEvents = (checkoutEvents || []) as EmailEventRow[];

    for (const order of checkoutOrders) {
      const user = order.user_id ? checkoutUserById.get(order.user_id) ?? null : null;
      const email = normalizeEmail(user?.email);
      result.candidates_checked += 1;

      if (
        !email ||
        !order.stripe_checkout_url ||
        emailedRecipients.has(email) ||
        isRecoveryUnsubscribedFromEvents(priorCheckoutEvents, email) ||
        priorCheckoutEvents.some(
          (event) => event.event_type === CHECKOUT_RECOVERY_SENT_EVENT && eventHasOrderId(event, order.id)
        )
      ) {
        result.skipped += 1;
        result.skipped_ids.push(order.id);
        continue;
      }

      if (dryRun) {
        result.skipped += 1;
        result.skipped_ids.push(order.id);
        emailedRecipients.add(email);
        continue;
      }

      const emailResult = await sendAbandonedCheckoutRecoveryEmail({
        to: email,
        customerName: getCustomerName(user, email),
        productName: getCheckoutProductName(order),
        amount: normalizeGbpAmount(order.total_amount),
        checkoutUrl: order.stripe_checkout_url,
        unsubscribeUrl: buildRecoveryUnsubscribeUrl(email, 'checkout'),
      });

      await insertEmailEvent(supabase, {
        email,
        event_type: emailResult.success ? CHECKOUT_RECOVERY_SENT_EVENT : CHECKOUT_RECOVERY_FAILED_EVENT,
        event_data: {
          order_id: order.id,
          case_id: order.case_id,
          product_type: order.product_type,
          checkout_url: order.stripe_checkout_url,
          stripe_session_id: order.stripe_session_id,
          error: emailResult.success ? null : emailResult.error || 'Unknown email error',
          sent_at: new Date().toISOString(),
          source: RECOVERY_ORCHESTRATOR_JOB_NAME,
          recovery_kind: 'checkout',
        },
      });

      if (emailResult.success) {
        result.emails_sent += 1;
        result.checkout_sent_order_ids.push(order.id);
        emailedRecipients.add(email);
      } else {
        result.failed += 1;
        result.failed_ids.push(order.id);
      }

      if (result.emails_sent >= batchLimit) break;
    }

    if (result.emails_sent < batchLimit) {
      const { data: caseRows, error: casesError } = await supabase
        .from('cases')
        .select(
          'id, user_id, case_type, jurisdiction, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts, created_at, updated_at'
        )
        .lte('updated_at', hoursAgoIso(CASE_DAY_1_AGE_HOURS))
        .order('updated_at', { ascending: true })
        .limit(batchLimit * 6);

      if (casesError) throw new Error(`Failed to fetch recovery cases: ${casesError.message}`);

      const cases = (caseRows || []) as CaseRow[];
      const caseIds = cases.map((caseRow) => caseRow.id);
      const userIds = Array.from(new Set(cases.map((caseRow) => caseRow.user_id).filter(Boolean))) as string[];

      const [ordersResult, documentsResult, usersResult, eventsResult] = await Promise.all([
        caseIds.length
          ? supabase
              .from('orders')
              .select('id, case_id, user_id, product_type, payment_status, created_at')
              .in('case_id', caseIds)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        caseIds.length
          ? supabase.from('documents').select('case_id, is_preview').in('case_id', caseIds)
          : Promise.resolve({ data: [], error: null }),
        userIds.length
          ? supabase.from('users').select('id, email, full_name').in('id', userIds)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('email_events')
          .select('email, event_type, event_data')
          .in('event_type', [
            CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.day_1,
            CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.day_7,
            CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES.day_1,
            CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES.day_7,
            CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES.day_1,
            CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES.day_3,
            CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES.day_1,
            CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES.day_3,
            RECOVERY_UNSUBSCRIBED_EVENT,
          ])
          .limit(10000),
      ]);

      if (ordersResult.error) throw new Error(`Failed to fetch case orders: ${ordersResult.error.message}`);
      if (documentsResult.error) throw new Error(`Failed to fetch case documents: ${documentsResult.error.message}`);
      if (usersResult.error) throw new Error(`Failed to fetch case users: ${usersResult.error.message}`);
      if (eventsResult.error) throw new Error(`Failed to fetch case recovery events: ${eventsResult.error.message}`);

      const orderByCase = new Map<string, OrderRow>();
      for (const order of (ordersResult.data || []) as OrderRow[]) {
        if (order.case_id) orderByCase.set(order.case_id, pickBestOrder(orderByCase.get(order.case_id), order));
      }

      const finalDocumentCaseIds = new Set<string>();
      const previewDocumentCaseIds = new Set<string>();
      for (const document of (documentsResult.data || []) as Array<{ case_id: string; is_preview: boolean | null }>) {
        if (document.is_preview) previewDocumentCaseIds.add(document.case_id);
        else finalDocumentCaseIds.add(document.case_id);
      }

      const userById = new Map(((usersResult.data || []) as UserRow[]).map((user) => [user.id, user]));
      const caseEvents = (eventsResult.data || []) as EmailEventRow[];

      for (const caseRow of cases) {
        if (result.emails_sent >= batchLimit) break;

        const relatedOrder = orderByCase.get(caseRow.id) || null;
        const hasFinalDocuments = finalDocumentCaseIds.has(caseRow.id);
        const hasPreviewDocuments = previewDocumentCaseIds.has(caseRow.id);
        const user = caseRow.user_id ? userById.get(caseRow.user_id) ?? null : null;
        const contact = deriveCaseRecoveryContact(caseRow, user);
        const email = normalizeEmail(contact.email);

        result.candidates_checked += 1;

        if (
          !email ||
          emailedRecipients.has(email) ||
          isRecoveryUnsubscribedFromEvents(caseEvents, email) ||
          checkoutSuppressedCaseIds.has(caseRow.id) ||
          isFreshPendingCheckout(relatedOrder)
        ) {
          result.skipped += 1;
          result.skipped_ids.push(caseRow.id);
          continue;
        }

        const previewEligible = isPreviewAbandonedCase({
          caseItem: caseRow,
          order: relatedOrder,
          hasFinalDocuments,
          hasPreviewDocuments,
        });
        const wizardEligible = isStartedButIncompleteCase({
          caseItem: caseRow,
          order: relatedOrder,
          hasFinalDocuments,
          hasPreviewDocuments,
        });

        const recoveryKind: Extract<RecoveryKind, 'preview' | 'wizard'> | null = previewEligible
          ? 'preview'
          : wizardEligible
            ? 'wizard'
            : null;
        const dueStage =
          recoveryKind === 'preview'
            ? getPreviewDueStage(caseRow, caseEvents, email)
            : recoveryKind === 'wizard'
              ? getWizardDueStage(caseRow, caseEvents, email)
              : null;

        if (!recoveryKind || !dueStage) {
          result.skipped += 1;
          result.skipped_ids.push(caseRow.id);
          continue;
        }

        if (dryRun) {
          result.skipped += 1;
          result.skipped_ids.push(caseRow.id);
          emailedRecipients.add(email);
          continue;
        }

        const recovery = await createCaseRecoveryLink({
          supabase: supabase as any,
          caseRow,
          email,
          orderRow: relatedOrder,
          stage: dueStage,
          source: RECOVERY_ORCHESTRATOR_JOB_NAME,
          kind: recoveryKind === 'wizard' ? 'case_wizard_recovery' : 'case_preview_recovery',
        });
        const productType = recovery.productType || deriveCaseProductType(caseRow, relatedOrder);

        const attemptEventType =
          recoveryKind === 'preview'
            ? CASE_PREVIEW_RECOVERY_ATTEMPT_EVENT_TYPES[dueStage as 'day_1' | 'day_7']
            : CASE_WIZARD_RECOVERY_ATTEMPT_EVENT_TYPES[dueStage as 'day_1' | 'day_3'];
        const sentEventType =
          recoveryKind === 'preview'
            ? CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES[dueStage as 'day_1' | 'day_7']
            : CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES[dueStage as 'day_1' | 'day_3'];
        const failedEventType =
          recoveryKind === 'preview'
            ? CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES[dueStage as 'day_1' | 'day_7']
            : CASE_WIZARD_RECOVERY_FAILED_EVENT_TYPES[dueStage as 'day_1' | 'day_3'];

        await insertEmailEvent(supabase, {
          email,
          event_type: attemptEventType,
          event_data: {
            case_id: caseRow.id,
            product_type: productType,
            resume_url: recovery.resumeUrl,
            sent_at: null,
            source: RECOVERY_ORCHESTRATOR_JOB_NAME,
            stage: dueStage,
            status: 'attempted',
            recovery_kind: recoveryKind,
          },
        });

        const emailResult =
          recoveryKind === 'preview'
            ? await sendCasePreviewRecoveryEmail({
                to: email,
                customerName: contact.name || getCustomerName(user, email),
                productName: recovery.productName || getAdminProductLabel(productType),
                resumeUrl: recovery.resumeUrl,
                stage: dueStage as 'day_1' | 'day_7',
                unsubscribeUrl: buildRecoveryUnsubscribeUrl(email, 'preview'),
              })
            : await sendWizardAbandonmentRecoveryEmail({
                to: email,
                customerName: contact.name || getCustomerName(user, email),
                productName: recovery.productName || getAdminProductLabel(productType),
                resumeUrl: recovery.resumeUrl,
                stage: dueStage as 'day_1' | 'day_3',
                unsubscribeUrl: buildRecoveryUnsubscribeUrl(email, 'wizard'),
              });

        await insertEmailEvent(supabase, {
          email,
          event_type: emailResult.success ? sentEventType : failedEventType,
          event_data: {
            case_id: caseRow.id,
            product_type: productType,
            resume_url: recovery.resumeUrl,
            error: emailResult.success ? null : emailResult.error || 'Unknown email error',
            sent_at: new Date().toISOString(),
            source: RECOVERY_ORCHESTRATOR_JOB_NAME,
            stage: dueStage,
            status: emailResult.success ? 'sent' : 'failed',
            recovery_kind: recoveryKind,
          },
        });

        if (emailResult.success) {
          result.emails_sent += 1;
          emailedRecipients.add(email);
          if (recoveryKind === 'preview') result.preview_sent_case_ids.push(caseRow.id);
          else result.wizard_sent_case_ids.push(caseRow.id);
        } else {
          result.failed += 1;
          result.failed_ids.push(caseRow.id);
        }
      }
    }

    result.success = result.failed === 0;
    const summary = dryRun
      ? `Dry run checked ${result.candidates_checked} recovery candidates.`
      : `Recovery orchestrator sent ${result.emails_sent} emails; skipped ${result.skipped}; failed ${result.failed}.`;

    await completeCronRun(run.id, result.failed > 0 ? 'partial' : 'success', summary, {
      sourcesChecked: result.candidates_checked,
      eventsCreated: result.emails_sent,
      eventsUpdated: result.skipped,
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown recovery orchestrator error';
    result.success = false;
    await completeCronRun(run.id, 'failed', message, {
      sourcesChecked: result.candidates_checked,
      eventsCreated: result.emails_sent,
      eventsUpdated: result.skipped,
    });
    console.error('[RecoveryOrchestrator] Failed:', error);
    throw error;
  }
}

export function getRecoveryOrchestratorConfig() {
  return {
    job: RECOVERY_ORCHESTRATOR_JOB_NAME,
    batch_limit: DEFAULT_BATCH_LIMIT,
    checkout_min_age_minutes: CHECKOUT_MIN_AGE_MINUTES,
    checkout_max_age_hours: CHECKOUT_MAX_AGE_HOURS,
    case_day_1_age_hours: CASE_DAY_1_AGE_HOURS,
    wizard_day_3_age_hours: WIZARD_DAY_3_AGE_HOURS,
    preview_day_7_age_hours: PREVIEW_DAY_7_AGE_HOURS,
    priority: ['checkout_started', 'preview_reached', 'draft_started'],
  };
}
