import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  type AdminCaseRecord,
  type AdminCasesPreset,
  type AdminCasesSortBy,
  getAdminCaseRiskRank,
  getAdminProductName,
  isAdminStartedDraftCase,
} from '@/lib/admin/case-manager';
import { deriveVisibleFulfillmentState } from '@/lib/payments/fulfillment-routing';
import {
  extractOrderMetadata,
  isMetadataColumnMissingError,
  setMetadataColumnExists,
} from '@/lib/payments/safe-order-metadata';
import { getEditWindowStatusWithOverride } from '@/lib/payments/edit-window';
import {
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES,
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES,
  deriveCaseProductType,
  deriveCaseRecoveryContact,
  isPreviewAbandonedCase,
} from '@/lib/cases/recovery';
import {
  buildAssistedEvidenceSummary,
  normalizeAssistedPrepService,
} from '@/lib/assisted-prep';

type RawCase = {
  id: string;
  user_id: string | null;
  case_type: string;
  jurisdiction: string;
  status: string;
  workflow_status: string | null;
  wizard_completed_at: string | null;
  wizard_progress: number | null;
  created_at: string;
  updated_at: string;
  collected_facts: Record<string, any> | null;
};

type RawUser = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type RawOrder = {
  id: string;
  case_id: string;
  user_id: string | null;
  product_type: string | null;
  payment_status: string;
  fulfillment_status:
    | 'pending'
    | 'ready_to_generate'
    | 'processing'
    | 'fulfilled'
    | 'failed'
    | 'requires_action'
    | null;
  paid_at: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

type RawEmailEvent = {
  event_type: string;
  event_data: Record<string, any> | null;
  created_at: string;
};

type RecoveryEventSummary = {
  lastEventType: string | null;
  lastEventAt: string | null;
  lastStage: 'manual' | 'day_1' | 'day_7' | null;
  lastError: string | null;
  manualSentAt: string | null;
  day1SentAt: string | null;
  day7SentAt: string | null;
};

type AdminCasesResponse = {
  success: true;
  cases: AdminCaseRecord[];
  stats: {
    total: number;
    paid_or_generated: number;
    requires_action: number;
    failed_fulfillment: number;
    started_drafts: number;
    unpaid_started: number;
    anonymous_started: number;
    preview_abandoned: number;
    edit_window_open: number;
    docs_ready: number;
    restart_link_available: number;
    recovery_emails_sent_30d: number;
  };
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    cleanupPolicy: {
      appliesTo: string;
      retentionDays: number;
      excludes: string[];
    };
  };
};

const ADMIN_CASES_IN_CHUNK_SIZE = 200;
const ADMIN_CASES_FETCH_PAGE_SIZE = 1000;
const ORDER_SELECT_WITH_METADATA =
  'id, case_id, user_id, product_type, payment_status, fulfillment_status, paid_at, created_at, metadata';
const ORDER_SELECT_WITHOUT_METADATA =
  'id, case_id, user_id, product_type, payment_status, fulfillment_status, paid_at, created_at';
const RECOVERY_EVENT_TYPES = [
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.manual,
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.day_1,
  CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES.day_7,
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES.manual,
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES.day_1,
  CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES.day_7,
];

function chunkValues<T>(values: T[], chunkSize = ADMIN_CASES_IN_CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }
  return chunks;
}

function pickBestOrder(current: RawOrder | undefined, candidate: RawOrder): RawOrder {
  if (!current) return candidate;

  const currentPaid = current.payment_status === 'paid';
  const candidatePaid = candidate.payment_status === 'paid';

  if (candidatePaid && !currentPaid) return candidate;
  if (!candidatePaid && currentPaid) return current;

  const currentTime = new Date(current.paid_at || current.created_at).getTime();
  const candidateTime = new Date(candidate.paid_at || candidate.created_at).getTime();
  return candidateTime > currentTime ? candidate : current;
}

function applyPreset(caseItem: AdminCaseRecord, preset: AdminCasesPreset): boolean {
  switch (preset) {
    case 'needs_attention':
      return (
        caseItem.requires_action ||
        caseItem.failed_fulfillment ||
        (caseItem.payment_status === 'paid' && !caseItem.has_final_documents)
      );
    case 'paid_awaiting_docs':
      return caseItem.payment_status === 'paid' && !caseItem.has_final_documents;
    case 'started_drafts':
      return caseItem.is_started_draft;
    case 'preview_abandoned':
      return caseItem.is_preview_abandoned;
    case 'edit_window_open':
      return caseItem.edit_window_open;
    case 'docs_ready':
      return caseItem.documents_ready;
    default:
      return true;
  }
}

async function fetchAdminCaseRows(
  adminClient: ReturnType<typeof createAdminClient>,
  caseType: string
) {
  const cases: RawCase[] = [];

  for (let from = 0; ; from += ADMIN_CASES_FETCH_PAGE_SIZE) {
    const to = from + ADMIN_CASES_FETCH_PAGE_SIZE - 1;
    let casesQuery = adminClient
      .from('cases')
      .select(
        'id, user_id, case_type, jurisdiction, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts, created_at, updated_at'
      )
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (caseType !== 'all') {
      casesQuery = casesQuery.eq('case_type', caseType);
    }

    const { data, error } = await casesQuery;

    if (error) {
      return { data: cases, error };
    }

    const pageRows = (data || []) as RawCase[];
    cases.push(...pageRows);

    if (pageRows.length < ADMIN_CASES_FETCH_PAGE_SIZE) {
      return { data: cases, error: null };
    }
  }
}

async function fetchUsersByIds(adminClient: ReturnType<typeof createAdminClient>, userIds: string[]) {
  const users: RawUser[] = [];

  for (const chunk of chunkValues(userIds)) {
    const { data, error } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .in('id', chunk);

    if (error) {
      return { data: users, error };
    }

    users.push(...((data || []) as RawUser[]));
  }

  return { data: users, error: null };
}

async function fetchOrdersByCaseIds(adminClient: ReturnType<typeof createAdminClient>, caseIds: string[]) {
  const orders: RawOrder[] = [];
  let includeMetadata = true;

  for (const chunk of chunkValues(caseIds)) {
    const selectFields = includeMetadata ? ORDER_SELECT_WITH_METADATA : ORDER_SELECT_WITHOUT_METADATA;
    let { data, error } = await adminClient
      .from('orders')
      .select(selectFields)
      .in('case_id', chunk)
      .order('created_at', { ascending: false });

    if (error && includeMetadata && isMetadataColumnMissingError(error)) {
      setMetadataColumnExists(false);
      includeMetadata = false;
      const fallback = await adminClient
        .from('orders')
        .select(ORDER_SELECT_WITHOUT_METADATA)
        .in('case_id', chunk)
        .order('created_at', { ascending: false });
      data = fallback.data as any;
      error = fallback.error;
    }

    if (error) {
      return { data: orders, error };
    }

    orders.push(...((data || []) as unknown as RawOrder[]));
  }

  return { data: orders, error: null };
}

async function fetchFinalDocumentCounts(
  adminClient: ReturnType<typeof createAdminClient>,
  caseIds: string[]
) {
  const documentCounts = new Map<string, { final: number; preview: number }>();

  for (const chunk of chunkValues(caseIds)) {
    const { data, error } = await adminClient
      .from('documents')
      .select('case_id, is_preview')
      .in('case_id', chunk);

    if (error) {
      return { data: documentCounts, error };
    }

    for (const document of data || []) {
      const typedDocument = document as { case_id: string; is_preview: boolean | null };
      const current = documentCounts.get(typedDocument.case_id) || { final: 0, preview: 0 };
      if (typedDocument.is_preview) {
        current.preview += 1;
      } else {
        current.final += 1;
      }
      documentCounts.set(typedDocument.case_id, current);
    }
  }

  return { data: documentCounts, error: null };
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function getRecoveryStage(eventType: string): 'manual' | 'day_1' | 'day_7' | null {
  if (eventType.includes('manual')) return 'manual';
  if (eventType.includes('day_1')) return 'day_1';
  if (eventType.includes('day_7')) return 'day_7';
  return null;
}

function isSentRecoveryEvent(eventType: string): boolean {
  return Object.values(CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES).includes(eventType as any);
}

async function fetchRecoveryEvents(adminClient: ReturnType<typeof createAdminClient>) {
  const { data, error } = await adminClient
    .from('email_events')
    .select('event_type, event_data, created_at')
    .in('event_type', RECOVERY_EVENT_TYPES)
    .gte('created_at', daysAgoIso(90))
    .order('created_at', { ascending: false })
    .limit(5000);

  return { data: (data || []) as RawEmailEvent[], error };
}

function buildRecoveryEventMap(events: RawEmailEvent[]) {
  const map = new Map<string, RecoveryEventSummary>();

  for (const event of events) {
    const caseId = event.event_data?.case_id;
    if (typeof caseId !== 'string' || !caseId) continue;

    const existing =
      map.get(caseId) ||
      {
        lastEventType: null,
        lastEventAt: null,
        lastStage: null,
        lastError: null,
        manualSentAt: null,
        day1SentAt: null,
        day7SentAt: null,
      };

    const stage = getRecoveryStage(event.event_type);
    if (!existing.lastEventAt || new Date(event.created_at) > new Date(existing.lastEventAt)) {
      existing.lastEventType = event.event_type;
      existing.lastEventAt = event.created_at;
      existing.lastStage = stage;
      existing.lastError =
        typeof event.event_data?.error === 'string' && event.event_data.error
          ? event.event_data.error
          : null;
    }

    if (isSentRecoveryEvent(event.event_type)) {
      if (stage === 'manual' && !existing.manualSentAt) existing.manualSentAt = event.created_at;
      if (stage === 'day_1' && !existing.day1SentAt) existing.day1SentAt = event.created_at;
      if (stage === 'day_7' && !existing.day7SentAt) existing.day7SentAt = event.created_at;
    }

    map.set(caseId, existing);
  }

  return map;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const caseType = searchParams.get('caseType') || 'all';
    const productType = searchParams.get('productType') || 'all';
    const paymentStatus = searchParams.get('paymentStatus') || 'all';
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || 'all';
    const editWindow = searchParams.get('editWindow') || 'all';
    const hasFinalDocumentsFilter = searchParams.get('hasFinalDocuments') || 'all';
    const preset = (searchParams.get('preset') || 'all') as AdminCasesPreset;
    const sortBy = (searchParams.get('sortBy') || 'risk') as AdminCasesSortBy;
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { data: casesData, error: casesError } = await fetchAdminCaseRows(
      adminClient,
      caseType
    );

    if (casesError) {
      console.error('Failed to fetch admin cases:', casesError);
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    }

    const cases = (casesData || []) as RawCase[];
    const caseIds = cases.map((caseItem) => caseItem.id);
    const userIds = Array.from(new Set(cases.map((caseItem) => caseItem.user_id).filter(Boolean))) as string[];

    const { data: usersData, error: usersError } = userIds.length
      ? await fetchUsersByIds(adminClient, userIds)
      : { data: [], error: null };

    if (usersError) {
      console.error('Failed to fetch admin case users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch case users' }, { status: 500 });
    }

    const users = new Map<string, RawUser>(
      ((usersData || []) as RawUser[]).map((userItem) => [userItem.id, userItem])
    );

    let orders: RawOrder[] = [];
    if (caseIds.length) {
      const { data: ordersData, error: ordersError } = await fetchOrdersByCaseIds(
        adminClient,
        caseIds
      );

      if (ordersError) {
        console.error('Failed to fetch admin case orders:', ordersError);
        return NextResponse.json({ error: 'Failed to fetch case orders' }, { status: 500 });
      }

      orders = (ordersData || []) as RawOrder[];
    }

    const orderByCase = new Map<string, RawOrder>();
    for (const order of orders) {
      orderByCase.set(order.case_id, pickBestOrder(orderByCase.get(order.case_id), order));
    }

    const { data: documentCounts, error: documentsError } = caseIds.length
      ? await fetchFinalDocumentCounts(adminClient, caseIds)
      : { data: new Map<string, { final: number; preview: number }>(), error: null };

    if (documentsError) {
      console.error('Failed to fetch admin case documents:', documentsError);
      return NextResponse.json({ error: 'Failed to fetch case documents' }, { status: 500 });
    }

    const { data: recoveryEvents, error: recoveryEventsError } = await fetchRecoveryEvents(adminClient);
    if (recoveryEventsError) {
      console.error('Failed to fetch admin case recovery events:', recoveryEventsError);
      return NextResponse.json({ error: 'Failed to fetch case recovery events' }, { status: 500 });
    }

    const recoveryEventByCase = buildRecoveryEventMap(recoveryEvents);
    const recoverySent30dCutoff = new Date(daysAgoIso(30)).getTime();
    const sentRecoveryEvents30d = recoveryEvents.filter(
      (event) =>
        isSentRecoveryEvent(event.event_type) &&
        new Date(event.created_at).getTime() >= recoverySent30dCutoff
    ).length;

    const normalizedCases: AdminCaseRecord[] = cases.map((caseItem) => {
      const relatedOrder = orderByCase.get(caseItem.id);
      const orderMetadata = extractOrderMetadata(relatedOrder);
      const caseDocumentCounts = documentCounts.get(caseItem.id) || { final: 0, preview: 0 };
      const finalDocumentCount = caseDocumentCounts.final;
      const previewDocumentCount = caseDocumentCounts.preview;
      const hasFinalDocuments = finalDocumentCount > 0;
      const visibleFulfillmentState = deriveVisibleFulfillmentState({
        fulfillmentStatus: relatedOrder?.fulfillment_status || null,
        hasFinalDocuments,
        metadata: orderMetadata || null,
        productType: relatedOrder?.product_type || null,
      });
      const editWindowStatus = getEditWindowStatusWithOverride(
        relatedOrder?.paid_at || null,
        orderMetadata?.edit_window_override_ends_at ?? null
      );
      const userRecord = caseItem.user_id ? users.get(caseItem.user_id) : null;
      const productType = deriveCaseProductType(caseItem, relatedOrder || null);
      const assistedIntake = caseItem.collected_facts?.assisted_intake || null;
      const assistedEvidenceSummary = assistedIntake
        ? buildAssistedEvidenceSummary({
            service: normalizeAssistedPrepService(
              assistedIntake.service ||
              caseItem.collected_facts?.selected_assisted_service ||
              null
            ),
            evidence: caseItem.collected_facts?.evidence || null,
          })
        : null;
      const recoveryContact = deriveCaseRecoveryContact(caseItem, userRecord || null);
      const paymentStatusValue = relatedOrder?.payment_status || null;
      const hasAnyOrder = Boolean(relatedOrder?.id);
      const visibleFulfillmentStatus = visibleFulfillmentState.fulfillmentStatus;
      const requiresAction = visibleFulfillmentStatus === 'requires_action';
      const failedFulfillment = visibleFulfillmentStatus === 'failed';
      const documentsReady = hasFinalDocuments;
      const previewAbandoned = isPreviewAbandonedCase({
        caseItem,
        order: relatedOrder || null,
        hasFinalDocuments,
        hasPreviewDocuments: previewDocumentCount > 0,
      });
      const recoveryEventSummary = recoveryEventByCase.get(caseItem.id) || null;
      const isStartedDraft = isAdminStartedDraftCase({
        status: caseItem.status,
        payment_status: paymentStatusValue,
        has_any_order: hasAnyOrder,
        has_final_documents: hasFinalDocuments,
        wizard_progress: caseItem.wizard_progress || 0,
        wizard_completed_at: caseItem.wizard_completed_at || null,
      });

      return {
        case_id: caseItem.id,
        order_id: relatedOrder?.id || null,
        user_id: caseItem.user_id,
        user_email: recoveryContact.email || userRecord?.email || 'Unknown',
        user_name: recoveryContact.name || userRecord?.full_name || null,
        case_type: caseItem.case_type,
        jurisdiction: caseItem.jurisdiction,
        status: caseItem.status,
        workflow_status: caseItem.workflow_status || null,
        wizard_progress: caseItem.wizard_progress || 0,
        wizard_completed_at: caseItem.wizard_completed_at || null,
        product_type: productType,
        product_name: getAdminProductName(productType),
        assisted_intake: assistedIntake,
        uploaded_evidence_count: assistedEvidenceSummary?.uploaded_evidence_count || 0,
        uploaded_evidence: assistedEvidenceSummary?.uploaded_evidence || [],
        missing_recommended_evidence: assistedEvidenceSummary?.missing_recommended_evidence || [],
        latest_upload_at: assistedEvidenceSummary?.latest_upload_at || null,
        payment_status: paymentStatusValue,
        has_any_order: hasAnyOrder,
        fulfillment_status: visibleFulfillmentStatus,
        has_final_documents: hasFinalDocuments,
        final_document_count: finalDocumentCount,
        preview_document_count: previewDocumentCount,
        edit_window_open: editWindowStatus.isPaid && editWindowStatus.isOpen,
        edit_window_ends_at: editWindowStatus.endsAt,
        created_at: caseItem.created_at,
        updated_at: caseItem.updated_at,
        requires_action: requiresAction,
        failed_fulfillment: failedFulfillment,
        documents_ready: documentsReady,
        is_preview_abandoned: previewAbandoned,
        is_started_draft: isStartedDraft,
        is_anonymous_started: isStartedDraft && !caseItem.user_id,
        recovery_email: recoveryContact.email,
        recovery_last_event_type: recoveryEventSummary?.lastEventType || null,
        recovery_last_event_at: recoveryEventSummary?.lastEventAt || null,
        recovery_last_stage: recoveryEventSummary?.lastStage || null,
        recovery_last_error: recoveryEventSummary?.lastError || null,
        recovery_manual_sent_at: recoveryEventSummary?.manualSentAt || null,
        recovery_day_1_sent_at: recoveryEventSummary?.day1SentAt || null,
        recovery_day_7_sent_at: recoveryEventSummary?.day7SentAt || null,
        can_send_restart_link: previewAbandoned && Boolean(recoveryContact.email),
        can_retry_fulfillment:
          paymentStatusValue === 'paid' &&
          !hasFinalDocuments &&
          ['requires_action', 'failed', 'pending', 'ready_to_generate', 'processing'].includes(
            visibleFulfillmentStatus || ''
          ),
        can_resume_fulfillment:
          paymentStatusValue === 'paid' &&
          ['requires_action', 'failed', 'processing'].includes(visibleFulfillmentStatus || ''),
        can_regenerate: paymentStatusValue === 'paid',
        can_reopen_edit_window: paymentStatusValue === 'paid' && !editWindowStatus.isOpen,
      };
    });

    let filteredCases = normalizedCases;

    if (preset !== 'all') {
      filteredCases = filteredCases.filter((caseItem) => applyPreset(caseItem, preset));
    }

    if (productType !== 'all') {
      filteredCases = filteredCases.filter((caseItem) => caseItem.product_type === productType);
    }

    if (paymentStatus !== 'all') {
      filteredCases = filteredCases.filter((caseItem) => caseItem.payment_status === paymentStatus);
    }

    if (fulfillmentStatus !== 'all') {
      filteredCases = filteredCases.filter(
        (caseItem) => (caseItem.fulfillment_status || 'none') === fulfillmentStatus
      );
    }

    if (editWindow === 'open') {
      filteredCases = filteredCases.filter((caseItem) => caseItem.edit_window_open);
    } else if (editWindow === 'expired') {
      filteredCases = filteredCases.filter(
        (caseItem) => caseItem.payment_status === 'paid' && !caseItem.edit_window_open
      );
    }

    if (hasFinalDocumentsFilter === 'true') {
      filteredCases = filteredCases.filter((caseItem) => caseItem.has_final_documents);
    } else if (hasFinalDocumentsFilter === 'false') {
      filteredCases = filteredCases.filter((caseItem) => !caseItem.has_final_documents);
    }

    if (search) {
      filteredCases = filteredCases.filter((caseItem) => {
        const haystack = [
          caseItem.case_id,
          caseItem.order_id || '',
          caseItem.user_email,
          caseItem.user_name || '',
          caseItem.product_name || '',
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    filteredCases.sort((left, right) => {
      if (sortBy === 'risk') {
        const rankDelta = getAdminCaseRiskRank(left) - getAdminCaseRiskRank(right);
        if (rankDelta !== 0) return rankDelta;
        return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
      }

      if (sortBy === 'oldest') {
        return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
      }

      if (sortBy === 'updated') {
        const delta =
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
        return sortOrder === 'asc' ? -delta : delta;
      }

      const delta = new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      return sortOrder === 'asc' ? -delta : delta;
    });

    const totalCount = filteredCases.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const pageStart = (page - 1) * pageSize;
    const paginatedCases = filteredCases.slice(pageStart, pageStart + pageSize);

    const response: AdminCasesResponse = {
      success: true,
      cases: paginatedCases,
      stats: {
        total: filteredCases.length,
        paid_or_generated: filteredCases.filter(
          (caseItem) =>
            caseItem.payment_status === 'paid' ||
            caseItem.has_final_documents ||
            caseItem.is_preview_abandoned
        ).length,
        requires_action: filteredCases.filter((caseItem) => caseItem.requires_action).length,
        failed_fulfillment: filteredCases.filter((caseItem) => caseItem.failed_fulfillment).length,
        started_drafts: filteredCases.filter((caseItem) => caseItem.is_started_draft).length,
        unpaid_started: filteredCases.filter(
          (caseItem) =>
            caseItem.is_started_draft &&
            caseItem.payment_status !== 'paid' &&
            !caseItem.has_final_documents
        ).length,
        anonymous_started: filteredCases.filter((caseItem) => caseItem.is_anonymous_started).length,
        preview_abandoned: filteredCases.filter((caseItem) => caseItem.is_preview_abandoned).length,
        edit_window_open: filteredCases.filter((caseItem) => caseItem.edit_window_open).length,
        docs_ready: filteredCases.filter((caseItem) => caseItem.documents_ready).length,
        restart_link_available: filteredCases.filter((caseItem) => caseItem.can_send_restart_link).length,
        recovery_emails_sent_30d: sentRecoveryEvents30d,
      },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
        cleanupPolicy: {
          appliesTo: 'Anonymous unclaimed wizard cases with no linked checkout order',
          retentionDays: 14,
          excludes: [
            'Logged-in or claimed drafts',
            'Cases with a linked order',
            'Archived cases',
          ],
        },
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin cases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
