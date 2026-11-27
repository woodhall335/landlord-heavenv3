import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { assertCaseWriteAccess } from '@/lib/auth/case-access';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';

const schema = z.object({ case_id: z.string().uuid(), progress: z.number().int().min(0).max(100) });

// Operational progress only. This never sets completion, payment or validation status.
export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid progress' }, { status: 400 });
    const { case_id, progress } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: row, error } = await supabase.from('cases').select('id, user_id, session_token, wizard_progress').eq('id', case_id).single();
    if (error || !row) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    const client = await createServerSupabaseClient();
    const { data: { user } } = await client.auth.getUser();
    const denied = assertCaseWriteAccess({ request, user, caseRow: row });
    if (denied) return denied;
    const mutation = await checkMutationAllowed(case_id);
    if (!mutation.allowed) return mutation.errorResponse;
    if (row.wizard_progress !== progress) {
      const { error: updateError } = await supabase.from('cases').update({ wizard_progress: progress }).eq('id', case_id);
      if (updateError) return NextResponse.json({ error: 'Could not record progress' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Could not record progress' }, { status: 500 });
  }
}
