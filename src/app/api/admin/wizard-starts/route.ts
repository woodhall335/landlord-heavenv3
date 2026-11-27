import { NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { collectAllReportRows } from '@/lib/marketing/paginated-report-query';
import { buildWizardStartTrend, type WizardStartCount } from '@/lib/admin/wizard-start-trend';

export async function GET() {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const db = createAdminClient();
    const { data: state, error: stateError } = await db.from('wizard_start_tracking_state').select('started_at').eq('id', true).single();
    if (stateError) {
      if (['PGRST205', '42P01'].includes(stateError.code)) return NextResponse.json({ available: false, reason: 'Apply migration 031 to enable durable start counts.' });
      return NextResponse.json({ error: 'Could not load start tracking' }, { status: 500 });
    }
    const since = new Date(); since.setUTCDate(since.getUTCDate() - 30);
    const result = await collectAllReportRows((from, to) => db.from('wizard_start_daily_counts').select('day, case_type, product_type, starts').gte('day', since.toISOString().slice(0, 10)).order('day').order('case_type').order('product_type').range(from, to));
    if (result.error) return NextResponse.json({ error: 'Could not load start counts' }, { status: 500 });
    return NextResponse.json({ available: true, ...buildWizardStartTrend(result.data as WizardStartCount[], state.started_at) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load start counts' }, { status: 401 });
  }
}
