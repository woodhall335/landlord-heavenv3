import { NextResponse } from 'next/server';
import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { getOrCreateWizardFacts } from '@/lib/case-facts/store';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const user = await getServerUser();

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id, jurisdiction')
      .eq('id', caseId)
      .maybeSingle();

    if (caseError) {
      console.error('[ask-heaven/case] Failed to load case', caseError);
      return NextResponse.json({ error: 'Could not load case' }, { status: 500 });
    }

    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseRow.user_id) {
      if (!user || caseRow.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const facts = await getOrCreateWizardFacts(supabase as any, caseId);
    const evidenceFiles = ((facts as any)?.evidence?.files || []) as any[];

    return NextResponse.json({
      caseId,
      jurisdiction: caseRow.jurisdiction,
      evidence: evidenceFiles,
      validation_summary: (facts as any)?.validation_summary ?? null,
      recommendations: (facts as any)?.recommendations ?? [],
      next_questions: (facts as any)?.next_questions ?? [],
    });
  } catch (error) {
    console.error('[ask-heaven/case] Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
