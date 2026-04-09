import { NextResponse } from 'next/server';
import { z } from 'zod';

import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { createSupabaseAdminClient, logSupabaseAdminDiagnostics } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/supabase/server';
import {
  computeSection13Preview,
  getSection13CaseData,
  normalizeSection13State,
  replaceSection13Comparables,
  saveSection13State,
  scrapeRightmoveComparables,
} from '@/lib/section13';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  caseId: z.string().uuid(),
  postcode: z.string().min(3),
  bedrooms: z.number().int().min(0).max(20),
});

export async function POST(request: Request) {
  try {
    logSupabaseAdminDiagnostics({ route: '/api/section13/scrape', writesUsingAdmin: true });
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
    const { caseId, postcode, bedrooms } = parsed.data;
    const { caseRow, facts, state } = await getSection13CaseData(supabase, caseId);

    const accessError = assertCaseWriteAccess({
      request,
      user,
      caseRow: caseRow as { user_id: string | null; session_token?: string | null },
    });
    if (accessError) return accessError;

    const scrape = await scrapeRightmoveComparables(postcode, bedrooms);
    const persistedComparables = await replaceSection13Comparables(supabase, caseId, scrape.comparables);
    const nextState = normalizeSection13State({
      ...state,
      comparablesMeta: {
        ...state.comparablesMeta,
        searchPostcodeRaw: postcode,
        bedrooms,
        lastScrapeAt: new Date().toISOString(),
        lastScrapeSource: scrape.source,
        lastScrapeSummary: scrape.summary,
      },
    });
    const preview = computeSection13Preview(nextState, persistedComparables);

    await saveSection13State({
      supabase,
      caseId,
      existingFacts: facts,
      state: {
        ...nextState,
        preview,
      },
      workflowStatus: 'draft',
    });

    return NextResponse.json({
      success: true,
      comparables: persistedComparables,
      preview,
      scrapeSource: scrape.source,
      scrapeSummary: scrape.summary,
    });
  } catch (error: any) {
    console.error('[section13/scrape] error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to scrape comparables' },
      { status: 500 }
    );
  }
}

