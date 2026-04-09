import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';
import {
  computeSection13Preview,
  getSection13CaseData,
  parseSection13Csv,
  replaceSection13Comparables,
  saveSection13State,
} from '@/lib/section13';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  csvText: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/import-csv', writesUsingAdmin: true });
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
    const { caseId, csvText } = parsed.data;
    const { caseRow, facts, state } = await getSection13CaseData(supabase, caseId);

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    const importedComparables = parseSection13Csv(csvText);
    const persistedComparables = await replaceSection13Comparables(supabase, caseId, importedComparables);
    const preview = computeSection13Preview(state, persistedComparables);

    await saveSection13State({
      supabase,
      caseId,
      existingFacts: facts,
      state: {
        ...state,
        preview,
      },
      workflowStatus: 'draft',
    });

    return NextResponse.json({
      success: true,
      comparables: persistedComparables,
      preview,
    });
  } catch (error: any) {
    console.error('[section13/import-csv] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to import CSV comparables' },
      { status: 500 }
    );
  }
}
