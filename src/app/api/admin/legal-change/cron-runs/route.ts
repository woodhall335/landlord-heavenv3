/**
 * Admin API - Legal Change Cron Runs
 *
 * GET /api/admin/legal-change/cron-runs
 * Lists cron run history with filtering and status
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  listCronRuns,
  getAllJobStatuses,
  getJobsNeedingAttention,
  getJobMetrics,
  CronJobName,
  CronRunStatus,
  CronRunFilter,
} from '@/lib/validation/cron-run-tracker';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access (with proper trimming of env var)
    const user = await requireServerAuth();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobName = searchParams.get('jobName') as CronJobName | null;
    const status = searchParams.get('status')?.split(',') as CronRunStatus[] | undefined;
    const startedAfter = searchParams.get('startedAfter') || undefined;
    const startedBefore = searchParams.get('startedBefore') || undefined;
    const triggeredBy = searchParams.get('triggeredBy') as 'cron' | 'manual' | 'webhook' | undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const view = searchParams.get('view'); // 'summary' | 'attention' | 'metrics'

    // Handle different view modes
    if (view === 'summary') {
      // Return job status summaries
      const summaries = await getAllJobStatuses();

      return NextResponse.json({
        success: true,
        data: {
          jobs: summaries,
          totalJobs: summaries.length,
          jobsNeedingAttention: summaries.filter((s: { needsChecking: boolean }) => s.needsChecking).length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (view === 'attention') {
      // Return only jobs needing attention
      const attention = await getJobsNeedingAttention();

      return NextResponse.json({
        success: true,
        data: {
          jobs: attention,
          count: attention.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (view === 'metrics' && jobName) {
      // Return metrics for a specific job
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days

      const metrics = getJobMetrics(jobName, startDate, endDate);

      return NextResponse.json({
        success: true,
        data: {
          jobName,
          period: { startDate, endDate },
          metrics,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Default: list cron runs with filters
    const filter: CronRunFilter = {
      limit: Math.min(limit, 200),
    };

    if (jobName) filter.jobName = jobName;
    if (status?.length) filter.status = status;
    if (startedAfter) filter.startedAfter = startedAfter;
    if (startedBefore) filter.startedBefore = startedBefore;
    if (triggeredBy) filter.triggeredBy = triggeredBy;

    const runs = await listCronRuns(filter);

    return NextResponse.json({
      success: true,
      data: {
        runs,
        count: runs.length,
        hasMore: runs.length === filter.limit,
      },
      meta: {
        timestamp: new Date().toISOString(),
        filter: {
          jobName,
          status,
          startedAfter,
          startedBefore,
          triggeredBy,
          limit: filter.limit,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('[Admin Legal Change Cron Runs] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
