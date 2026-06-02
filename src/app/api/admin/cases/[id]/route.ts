import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { logAdminCaseAction } from '@/lib/admin/case-actions';

type RouteParams = { id: string };

type CountResult = {
  table: string;
  count: number | null;
  error: string | null;
};

const CASE_LINKED_TABLES = [
  'orders',
  'documents',
  'case_facts',
  'conversations',
  'ai_usage',
  'section13_comparables',
  'section13_comparable_adjustments',
  'section13_evidence_uploads',
  'section13_bundle_assets',
  'section13_output_snapshots',
  'section13_bundle_jobs',
  'section13_support_requests',
  'case_recovery_tokens',
  'case_mutation_logs',
];

function resolveCaseColumn(table: string): string {
  if (table === 'email_leads') return 'last_case_id';
  return 'case_id';
}

function extractDocumentStoragePath(value: string | null): string | null {
  if (!value) return null;

  const publicMarker = '/storage/v1/object/public/documents/';
  const publicIndex = value.indexOf(publicMarker);
  if (publicIndex >= 0) {
    return value.substring(publicIndex + publicMarker.length);
  }

  const documentsMarker = '/documents/';
  const documentsIndex = value.indexOf(documentsMarker);
  if (documentsIndex >= 0) {
    return value.substring(documentsIndex + documentsMarker.length);
  }

  if (!value.startsWith('http') && !value.startsWith('/')) {
    return value;
  }

  return null;
}

async function countLinkedRows(
  adminClient: ReturnType<typeof createAdminClient>,
  table: string,
  caseId: string
): Promise<CountResult> {
  try {
    const { count, error } = await (adminClient as any)
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq(resolveCaseColumn(table), caseId);

    if (error) {
      return { table, count: null, error: error.message || 'Unable to count rows' };
    }

    return { table, count: count || 0, error: null };
  } catch (error: any) {
    return { table, count: null, error: error?.message || 'Unable to count rows' };
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: caseId } = await context.params;
    const adminClient = createAdminClient();

    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .select('id, user_id, case_type, jurisdiction, status, workflow_status, created_at, updated_at')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ ok: false, error: 'Case not found' }, { status: 404 });
    }

    const { data: linkedOrders, error: ordersError } = await adminClient
      .from('orders')
      .select('id, product_type, payment_status, fulfillment_status, total_amount, created_at')
      .eq('case_id', caseId);

    if (ordersError) {
      return NextResponse.json(
        { ok: false, error: 'Failed to inspect linked orders' },
        { status: 500 }
      );
    }

    const { data: documents, error: documentsError } = await adminClient
      .from('documents')
      .select('id, pdf_url, document_title, is_preview')
      .eq('case_id', caseId);

    if (documentsError) {
      return NextResponse.json(
        { ok: false, error: 'Failed to inspect linked documents' },
        { status: 500 }
      );
    }

    const counts = await Promise.all(
      CASE_LINKED_TABLES.map((table) => countLinkedRows(adminClient, table, caseId))
    );
    const unavailableCounts = counts
      .filter((result) => result.error)
      .map((result) => ({ table: result.table, error: result.error }));
    const linkedRowCounts = Object.fromEntries(
      counts.map((result) => [result.table, result.count])
    );

    const storagePaths = Array.from(
      new Set(
        (documents || [])
          .map((document) => extractDocumentStoragePath((document as any).pdf_url || null))
          .filter(Boolean) as string[]
      )
    );
    let storageRemoved = 0;
    let storageError: string | null = null;

    if (storagePaths.length > 0) {
      const { error } = await adminClient.storage.from('documents').remove(storagePaths);
      if (error) {
        storageError = error.message || 'Failed to delete some document files';
      } else {
        storageRemoved = storagePaths.length;
      }
    }

    await logAdminCaseAction({
      caseId,
      adminUserId: user.id,
      action: 'admin_case_hard_deleted',
      changedKeys: ['cases'],
      metadata: {
        case_snapshot: caseData,
        linked_orders: linkedOrders || [],
        linked_row_counts: linkedRowCounts,
        storage_paths_requested: storagePaths.length,
      },
    });

    const { error: deleteError } = await adminClient
      .from('cases')
      .delete()
      .eq('id', caseId);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: deleteError.message || 'Failed to delete case' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        deleted_case_id: caseId,
        linked_row_counts: linkedRowCounts,
        unavailable_counts: unavailableCounts,
        linked_orders: linkedOrders || [],
        order_links_detached_by_on_delete_set_null: (linkedOrders || []).length,
        storage_removed: storageRemoved,
        storage_remove_requested: storagePaths.length,
        storage_error: storageError,
        message: `Case ${caseId.slice(0, 8)} was permanently deleted.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Admin hard delete case error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
