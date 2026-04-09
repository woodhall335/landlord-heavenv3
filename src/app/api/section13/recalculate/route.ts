import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseReadAccess, assertCaseWriteAccess } from '@/lib/auth/case-access';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';
import {
  computeSection13Preview,
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
  state: z.any().optional(),
  comparables: z.array(z.any()).optional(),
  persist: z.boolean().optional().default(false),
  awaitingPayment: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/recalculate', writesUsingAdmin: true });
    const user = await getServerUser().catch(() => null);
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { caseId, state: inputState, comparables: inputComparables, persist, awaitingPayment } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { caseRow, facts, state: existingState, comparables: existingComparables } =
      await getSection13CaseData(supabase, caseId);

    const accessError = (persist ? assertCaseWriteAccess : assertCaseReadAccess)({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    const state = normalizeSection13State((inputState as Section13State | undefined) || existingState);
    const comparables = (inputComparables as Section13Comparable[] | undefined) || existingComparables;
    const persistedComparables = persist
      ? await replaceSection13Comparables(supabase, caseId, comparables)
      : comparables;
    const preview = computeSection13Preview(state, persistedComparables);

    if (persist) {
      await saveSection13State({
        supabase,
        caseId,
        existingFacts: facts,
        state: {
          ...state,
          preview,
        },
        workflowStatus: deriveSection13WorkflowStatus({
          hasPreview: true,
          awaitingPayment,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      preview,
      state: {
        ...state,
        preview,
      },
      comparables: persistedComparables,
    });
  } catch (error: any) {
    console.error('[section13/recalculate] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to recalculate Section 13 preview' },
      { status: 500 }
    );
  }
}

