import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';
import {
  computeSection13Preview,
  createEmptySection13State,
  deriveSection13WorkflowStatus,
  getSection13CaseData,
  normalizeSection13State,
  replaceSection13Comparables,
  saveSection13State,
  type Section13Comparable,
  type Section13State,
} from '@/lib/section13';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  stepId: z.string().min(1).optional(),
  state: z.any().optional(),
  comparables: z.array(z.any()).optional(),
  workflowStatus: z
    .enum([
      'draft',
      'preview_ready',
      'awaiting_payment',
      'paid',
      'generating',
      'fulfilled',
      'bundle_partial_warning',
      'bundle_ready',
    ])
    .optional(),
  awaitingPayment: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/save-step', writesUsingAdmin: true });
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { caseId, state: inputState, comparables: inputComparables, workflowStatus, awaitingPayment } = parsed.data;
    const { caseRow, facts, state: existingState, comparables: existingComparables } =
      await getSection13CaseData(supabase, caseId);

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    if ((caseRow as any).case_type !== 'rent_increase') {
      return NextResponse.json({ error: 'Case is not a Section 13 case' }, { status: 400 });
    }

    const nextState = normalizeSection13State(
      inputState ? ({ ...createEmptySection13State(existingState.selectedPlan), ...inputState } as Section13State) : existingState
    );
    const nextComparables = inputComparables
      ? (inputComparables as Section13Comparable[])
      : existingComparables;

    const persistedComparables = inputComparables
      ? await replaceSection13Comparables(supabase, caseId, nextComparables)
      : existingComparables;

    const preview = computeSection13Preview(nextState, persistedComparables);
    const stateWithPreview: Section13State = {
      ...nextState,
      preview,
    };
    const derivedWorkflowStatus = deriveSection13WorkflowStatus({
      explicit: workflowStatus,
      hasPreview: Boolean(preview),
      awaitingPayment,
    });

    await saveSection13State({
      supabase,
      caseId,
      existingFacts: facts,
      state: stateWithPreview,
      workflowStatus: derivedWorkflowStatus,
    });

    return NextResponse.json({
      success: true,
      state: stateWithPreview,
      comparables: persistedComparables,
      preview,
      workflowStatus: derivedWorkflowStatus,
    });
  } catch (error: any) {
    console.error('[section13/save-step] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save Section 13 step' },
      { status: 500 }
    );
  }
}

