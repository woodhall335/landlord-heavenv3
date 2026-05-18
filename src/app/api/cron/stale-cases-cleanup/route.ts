/**
 * Stale unclaimed case cleanup cron.
 *
 * Deletes anonymous wizard cases that have not reached checkout and have not
 * been touched for the retention window. Claimed user cases and any case with a
 * linked order are intentionally excluded.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  completeCronRun,
  startCronRun,
} from '@/lib/validation/cron-run-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const JOB_NAME = 'cases:cleanup-stale-unclaimed' as const;
const DEFAULT_RETENTION_DAYS = 14;
const DEFAULT_BATCH_LIMIT = 500;
const CLEANABLE_STATUSES = ['in_progress', 'completed'] as const;

function verifyCronAuth(request: NextRequest): { authorized: boolean; source: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return { authorized: false, source: 'no_secret_configured' };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, source: 'bearer' };
  }

  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    const keyParam = request.nextUrl.searchParams.get('key');
    if (keyParam && keyParam.length === cronSecret.length) {
      let match = true;
      for (let i = 0; i < cronSecret.length; i++) {
        if (keyParam[i] !== cronSecret[i]) {
          match = false;
        }
      }
      if (match) {
        return { authorized: true, source: 'vercel_cron' };
      }
    }

    return { authorized: false, source: 'vercel_cron_missing_key' };
  }

  return { authorized: false, source: 'invalid_credentials' };
}

function getPositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getBooleanParam(value: string | null): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function getCutoffIso(retentionDays: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff.toISOString();
}

async function executeCleanup(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const retentionDays = getPositiveInteger(
    request.nextUrl.searchParams.get('retention_days'),
    DEFAULT_RETENTION_DAYS
  );
  const batchLimit = getPositiveInteger(
    request.nextUrl.searchParams.get('limit'),
    DEFAULT_BATCH_LIMIT
  );
  const dryRun = getBooleanParam(request.nextUrl.searchParams.get('dry_run'));
  const cutoffIso = getCutoffIso(retentionDays);
  const supabase = createAdminClient();
  const run = await startCronRun(JOB_NAME, 'cron');

  try {
    const { data: candidateRows, error: candidatesError } = await supabase
      .from('cases')
      .select('id, updated_at, created_at, status, case_type, jurisdiction')
      .is('user_id', null)
      .in('status', [...CLEANABLE_STATUSES])
      .lt('updated_at', cutoffIso)
      .order('updated_at', { ascending: true })
      .limit(batchLimit);

    if (candidatesError) {
      throw new Error(`Failed to fetch stale cases: ${candidatesError.message}`);
    }

    const candidates = (candidateRows || []) as Array<{ id: string }>;
    const candidateIds = candidates.map((row) => row.id);

    if (candidateIds.length === 0) {
      const summary = `No stale unclaimed cases older than ${retentionDays} days.`;
      await completeCronRun(run.id, 'success', summary, {
        sourcesChecked: 0,
        eventsUpdated: 0,
      });
      return NextResponse.json({
        success: true,
        dry_run: dryRun,
        retention_days: retentionDays,
        cutoff: cutoffIso,
        candidates_checked: 0,
        cases_deleted: 0,
        skipped_with_orders: 0,
        deleted_case_ids: [],
      });
    }

    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select('case_id')
      .in('case_id', candidateIds);

    if (ordersError) {
      throw new Error(`Failed to check linked orders: ${ordersError.message}`);
    }

    const casesWithOrders = new Set(
      ((orderRows || []) as Array<{ case_id: string | null }>)
        .map((row) => row.case_id)
        .filter((caseId): caseId is string => Boolean(caseId))
    );

    const deletableIds = candidateIds.filter((caseId) => !casesWithOrders.has(caseId));
    let deletedIds: string[] = [];

    if (!dryRun && deletableIds.length > 0) {
      const { data: deletedRows, error: deleteError } = await supabase
        .from('cases')
        .delete()
        .in('id', deletableIds)
        .select('id');

      if (deleteError) {
        throw new Error(`Failed to delete stale cases: ${deleteError.message}`);
      }

      deletedIds = ((deletedRows || []) as Array<{ id: string }>).map((row) => row.id);
    } else {
      deletedIds = dryRun ? deletableIds : [];
    }

    const summary = dryRun
      ? `Dry run found ${deletableIds.length} stale unclaimed cases older than ${retentionDays} days.`
      : `Deleted ${deletedIds.length} stale unclaimed cases older than ${retentionDays} days.`;

    await completeCronRun(run.id, 'success', summary, {
      sourcesChecked: candidateIds.length,
      eventsUpdated: deletedIds.length,
    });

    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      retention_days: retentionDays,
      cutoff: cutoffIso,
      candidates_checked: candidateIds.length,
      cases_deleted: dryRun ? 0 : deletedIds.length,
      cases_would_delete: dryRun ? deletedIds.length : undefined,
      skipped_with_orders: casesWithOrders.size,
      deleted_case_ids: dryRun ? [] : deletedIds,
      would_delete_case_ids: dryRun ? deletedIds : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown cleanup error';
    await completeCronRun(run.id, 'failed', message, {
      sourcesChecked: 0,
      eventsUpdated: 0,
    });
    console.error('[StaleCasesCleanup] Failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');

  if (!authHeader && !vercelCronHeader) {
    return NextResponse.json({
      status: 'ok',
      job: JOB_NAME,
      retention_days: DEFAULT_RETENTION_DAYS,
      cleanable_statuses: CLEANABLE_STATUSES,
      description:
        'Deletes anonymous wizard cases older than the retention window when no checkout order is linked.',
    });
  }

  return executeCleanup(request);
}

export async function POST(request: NextRequest) {
  return executeCleanup(request);
}
