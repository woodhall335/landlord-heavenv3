import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  type AdminCaseRecord,
  type AdminCasesPreset,
  type AdminCasesSortBy,
  getAdminCaseRiskRank,
  getAdminProductName,
} from '@/lib/admin/case-manager';
import { deriveVisibleFulfillmentState } from '@/lib/payments/fulfillment-routing';
import {
  extractOrderMetadata,
  isMetadataColumnMissingError,
  setMetadataColumnExists,
} from '@/lib/payments/safe-order-metadata';
import { getEditWindowStatusWithOverride } from '@/lib/payments/edit-window';

type RawCase = {
  id: string;
  user_id: string | null;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number | null;
  created_at: string;
  updated_at: string;
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

type AdminCasesResponse = {
  success: true;
  cases: AdminCaseRecord[];
  stats: {
    total: number;
    paid_or_generated: number;
    requires_action: number;
    failed_fulfillment: number;
    edit_window_open: number;
    docs_ready: number;
  };
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

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
    case 'edit_window_open':
      return caseItem.edit_window_open;
    case 'docs_ready':
      return caseItem.documents_ready;
    default:
      return true;
  }
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

    let casesQuery = adminClient
      .from('cases')
      .select('id, user_id, case_type, jurisdiction, status, wizard_progress, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (caseType !== 'all') {
      casesQuery = casesQuery.eq('case_type', caseType);
    }

    const { data: casesData, error: casesError } = await casesQuery;

    if (casesError) {
      console.error('Failed to fetch admin cases:', casesError);
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    }

    const cases = (casesData || []) as RawCase[];
    const caseIds = cases.map((caseItem) => caseItem.id);
    const userIds = Array.from(new Set(cases.map((caseItem) => caseItem.user_id).filter(Boolean))) as string[];

    const { data: usersData } = userIds.length
      ? await adminClient
          .from('users')
          .select('id, email, full_name')
          .in('id', userIds)
      : { data: [] };
    const users = new Map<string, RawUser>(
      ((usersData || []) as RawUser[]).map((userItem) => [userItem.id, userItem])
    );

    const ORDER_SELECT_WITH_METADATA =
      'id, case_id, user_id, product_type, payment_status, fulfillment_status, paid_at, created_at, metadata';
    const ORDER_SELECT_WITHOUT_METADATA =
      'id, case_id, user_id, product_type, payment_status, fulfillment_status, paid_at, created_at';

    let orders: RawOrder[] = [];
    if (caseIds.length) {
      let { data: ordersData, error: ordersError } = await adminClient
        .from('orders')
        .select(ORDER_SELECT_WITH_METADATA)
        .in('case_id', caseIds)
        .order('created_at', { ascending: false });

      if (ordersError && isMetadataColumnMissingError(ordersError)) {
        setMetadataColumnExists(false);
        const fallback = await adminClient
          .from('orders')
          .select(ORDER_SELECT_WITHOUT_METADATA)
          .in('case_id', caseIds)
          .order('created_at', { ascending: false });
        ordersData = fallback.data as any;
        ordersError = fallback.error;
      }

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

    const { data: documentsData, error: documentsError } = caseIds.length
      ? await adminClient
          .from('documents')
          .select('case_id, is_preview')
          .in('case_id', caseIds)
          .eq('is_preview', false)
      : { data: [], error: null };

    if (documentsError) {
      console.error('Failed to fetch admin case documents:', documentsError);
      return NextResponse.json({ error: 'Failed to fetch case documents' }, { status: 500 });
    }

    const finalDocumentCounts = new Map<string, number>();
    for (const document of documentsData || []) {
      const caseId = (document as { case_id: string }).case_id;
      finalDocumentCounts.set(caseId, (finalDocumentCounts.get(caseId) || 0) + 1);
    }

    const normalizedCases: AdminCaseRecord[] = cases.map((caseItem) => {
      const relatedOrder = orderByCase.get(caseItem.id);
      const orderMetadata = extractOrderMetadata(relatedOrder);
      const finalDocumentCount = finalDocumentCounts.get(caseItem.id) || 0;
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
      const paymentStatusValue = relatedOrder?.payment_status || null;
      const visibleFulfillmentStatus = visibleFulfillmentState.fulfillmentStatus;
      const requiresAction = visibleFulfillmentStatus === 'requires_action';
      const failedFulfillment = visibleFulfillmentStatus === 'failed';
      const documentsReady = hasFinalDocuments;

      return {
        case_id: caseItem.id,
        order_id: relatedOrder?.id || null,
        user_id: caseItem.user_id,
        user_email: userRecord?.email || 'Unknown',
        user_name: userRecord?.full_name || null,
        case_type: caseItem.case_type,
        jurisdiction: caseItem.jurisdiction,
        status: caseItem.status,
        wizard_progress: caseItem.wizard_progress || 0,
        product_type: relatedOrder?.product_type || null,
        product_name: getAdminProductName(relatedOrder?.product_type || null),
        payment_status: paymentStatusValue,
        fulfillment_status: visibleFulfillmentStatus,
        has_final_documents: hasFinalDocuments,
        final_document_count: finalDocumentCount,
        edit_window_open: editWindowStatus.isPaid && editWindowStatus.isOpen,
        edit_window_ends_at: editWindowStatus.endsAt,
        created_at: caseItem.created_at,
        updated_at: caseItem.updated_at,
        requires_action: requiresAction,
        failed_fulfillment: failedFulfillment,
        documents_ready: documentsReady,
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

    let filteredCases = normalizedCases.filter(
      (caseItem) => caseItem.payment_status === 'paid' || caseItem.has_final_documents
    );

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
        paid_or_generated: filteredCases.length,
        requires_action: filteredCases.filter((caseItem) => caseItem.requires_action).length,
        failed_fulfillment: filteredCases.filter((caseItem) => caseItem.failed_fulfillment).length,
        edit_window_open: filteredCases.filter((caseItem) => caseItem.edit_window_open).length,
        docs_ready: filteredCases.filter((caseItem) => caseItem.documents_ready).length,
      },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
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
