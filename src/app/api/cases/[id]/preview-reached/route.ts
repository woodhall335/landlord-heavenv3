import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  product: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
});

const NON_PREVIEW_STATUSES = new Set(['paid', 'generating', 'fulfilled', 'bundle_ready']);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const user = await getServerUser().catch(() => null);
    const supabase = createAdminClient();

    const { data: caseRow, error: fetchError } = await supabase
      .from('cases')
      .select(
        'id, user_id, session_token, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts'
      )
      .eq('id', caseId)
      .single();

    if (fetchError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    const now = new Date().toISOString();
    const facts = ((caseRow as any).collected_facts || {}) as Record<string, any>;
    const meta = facts.__meta && typeof facts.__meta === 'object' ? facts.__meta : {};
    const workflowStatus = (caseRow as any).workflow_status || null;
    const nextWorkflowStatus = NON_PREVIEW_STATUSES.has(workflowStatus)
      ? workflowStatus
      : 'preview_ready';

    const { error: updateError } = await supabase
      .from('cases')
      .update({
        workflow_status: nextWorkflowStatus,
        wizard_progress: Math.max(Number((caseRow as any).wizard_progress || 0), 100),
        wizard_completed_at: (caseRow as any).wizard_completed_at || now,
        collected_facts: {
          ...facts,
          __meta: {
            ...meta,
            preview_reached_at: meta.preview_reached_at || now,
            preview_last_viewed_at: now,
            preview_reached_source: parsed.data.source || 'wizard_preview_page',
            ...(parsed.data.product ? { preview_product: parsed.data.product } : {}),
          },
        },
        updated_at: now,
      } as any)
      .eq('id', caseId);

    if (updateError) {
      console.error('[cases/preview-reached] update failed', updateError);
      return NextResponse.json({ error: 'Failed to mark preview reached' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      case_id: caseId,
      workflow_status: nextWorkflowStatus,
      preview_reached_at: meta.preview_reached_at || now,
    });
  } catch (error: any) {
    console.error('[cases/preview-reached] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to mark preview reached' },
      { status: 500 }
    );
  }
}
